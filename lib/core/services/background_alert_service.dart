import 'dart:async';
import 'dart:convert';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_background_service_android/flutter_background_service_android.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';

const String _notifChannelId = 'traffic_bg_service';
const String _notifChannelName = 'Traffic Monitoring Service';

class BackgroundAlertService {
  static Future<void> initialize() async {
    final service = FlutterBackgroundService();

    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: _onStart,
        autoStart: false,
        isForegroundMode: true,
        notificationChannelId: _notifChannelId,
        initialNotificationTitle: 'Traffic Patrol',
        initialNotificationContent: 'Traffic monitoring active',
        foregroundServiceNotificationId: 888,
        foregroundServiceTypes: [AndroidForegroundType.dataSync],
      ),
      iosConfiguration: IosConfiguration(
        autoStart: false,
        onForeground: _onStart,
        onBackground: _onIosBackground,
      ),
    );
  }

  static Future<void> startService(String officerId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('bg_officer_id', officerId);
    await prefs.setString('bg_last_check', DateTime.now().toIso8601String());

    final service = FlutterBackgroundService();
    final isRunning = await service.isRunning();
    if (!isRunning) {
      await service.startService();
    }
  }

  static Future<void> stopService() async {
    final service = FlutterBackgroundService();
    service.invoke('stopService');
  }
}

@pragma('vm:entry-point')
Future<bool> _onIosBackground(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();
  return true;
}

@pragma('vm:entry-point')
void _onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();

  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((_) {
      service.setAsForegroundService();
    });
    service.on('setAsBackground').listen((_) {
      service.setAsBackgroundService();
    });
  }

  service.on('stopService').listen((_) {
    service.stopSelf();
  });

  // Initialize local notifications for background alerts
  final localNotifications = FlutterLocalNotificationsPlugin();
  const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
  const initSettings = InitializationSettings(android: androidSettings);
  await localNotifications.initialize(initSettings);

  // Create notification channel
  final androidPlugin = localNotifications.resolvePlatformSpecificImplementation<
      AndroidFlutterLocalNotificationsPlugin>();
  if (androidPlugin != null) {
    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        AppConstants.trafficAlertChannel,
        'Traffic Alerts',
        description: 'Background traffic jam alerts',
        importance: Importance.high,
        playSound: true,
      ),
    );
  }

  // Initialize TTS
  final tts = FlutterTts();
  await tts.setLanguage('hi-IN');
  await tts.setSpeechRate(0.45);
  await tts.setVolume(1.0);
  await tts.setPitch(0.95);

  // Track seen alert IDs to avoid duplicate notifications
  final Set<int> seenAlertIds = {};

  // Load initial seen alerts
  final prefs = await SharedPreferences.getInstance();
  final seenJson = prefs.getString('bg_seen_alerts') ?? '[]';
  try {
    final seenList = json.decode(seenJson) as List;
    seenAlertIds.addAll(seenList.cast<int>());
  } catch (_) {}

  // Poll for new alerts every 2 minutes
  Timer.periodic(const Duration(minutes: 2), (timer) async {
    await _checkForNewAlerts(localNotifications, tts, seenAlertIds, service);
  });

  // Also check immediately
  await _checkForNewAlerts(localNotifications, tts, seenAlertIds, service);
}

Future<void> _checkForNewAlerts(
  FlutterLocalNotificationsPlugin localNotifications,
  FlutterTts tts,
  Set<int> seenAlertIds,
  ServiceInstance service,
) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final enabled = prefs.getBool('traffic_notify_enabled') ?? true;
    if (!enabled) return;

    // Fetch recent active alerts from server
    final response = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}/alerts?status=active&limit=20'),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) return;

    final alerts = json.decode(response.body) as List;
    int newAlertCount = 0;

    for (final alert in alerts) {
      final alertId = alert['id'] as int;

      if (seenAlertIds.contains(alertId)) continue;

      // New alert - show notification
      seenAlertIds.add(alertId);
      newAlertCount++;

      final areaName = alert['areaName'] ?? 'Unknown';
      final severity = alert['severity'] ?? 'medium';
      final description = alert['description'] ?? 'Traffic jam detected';
      final source = alert['source'] == 'auto' ? 'Auto Detected' : 'Manual Report';
      final createdAt = alert['createdAt'] ?? '';

      String timeStr = '';
      try {
        final dt = DateTime.parse(createdAt);
        final h = dt.hour > 12 ? dt.hour - 12 : dt.hour;
        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
        timeStr = '$h:${dt.minute.toString().padLeft(2, '0')} $ampm';
      } catch (_) {}

      final severityLabel = severity == 'critical'
          ? 'CRITICAL'
          : severity == 'high'
              ? 'HIGH'
              : 'MODERATE';

      final title = '$severityLabel Traffic Alert - $areaName';
      final body = '$description\n[$source] $timeStr';

      // Show local notification
      const androidDetails = AndroidNotificationDetails(
        AppConstants.trafficAlertChannel,
        'Traffic Alerts',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        styleInformation: BigTextStyleInformation(''),
      );
      const details = NotificationDetails(android: androidDetails);

      await localNotifications.show(
        alertId,
        title,
        body,
        details,
      );

      // Hindi voice alert
      final voiceMsg = '$areaName में ट्रैफिक जाम लगा है।';
      await tts.speak(voiceMsg);

      // Small delay between notifications
      await Future.delayed(const Duration(seconds: 2));
    }

    // Also check for resolved alerts
    final resolvedResponse = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}/alerts?status=resolved&limit=10'),
    ).timeout(const Duration(seconds: 10));

    if (resolvedResponse.statusCode == 200) {
      final resolvedAlerts = json.decode(resolvedResponse.body) as List;
      for (final alert in resolvedAlerts) {
        final alertId = alert['id'] as int;
        final resolvedKey = alertId + 100000; // Different key for resolved notifications

        if (seenAlertIds.contains(resolvedKey)) continue;

        // Only show resolved notifications for alerts we already notified about
        // or very recent resolved alerts
        final createdAt = alert['createdAt'] ?? '';
        final resolvedAt = alert['resolvedAt'] ?? '';
        if (resolvedAt.isEmpty) continue;

        try {
          final resolvedTime = DateTime.parse(resolvedAt);
          final now = DateTime.now();
          // Only show if resolved in last 5 minutes
          if (now.difference(resolvedTime).inMinutes > 5) continue;
        } catch (_) {
          continue;
        }

        seenAlertIds.add(resolvedKey);

        final areaName = alert['areaName'] ?? 'Unknown';
        final description = alert['description'] ?? 'Traffic cleared';

        const androidDetails = AndroidNotificationDetails(
          AppConstants.trafficAlertChannel,
          'Traffic Alerts',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        );
        const details = NotificationDetails(android: androidDetails);

        await localNotifications.show(
          resolvedKey,
          'Traffic Cleared - $areaName',
          description,
          details,
        );

        await tts.speak('$areaName में ट्रैफिक अब सामान्य हो गया है।');
      }
    }

    // Save seen alerts (keep only last 200 to prevent memory bloat)
    final seenList = seenAlertIds.toList();
    if (seenList.length > 200) {
      seenAlertIds.clear();
      seenAlertIds.addAll(seenList.sublist(seenList.length - 200));
    }
    await prefs.setString('bg_seen_alerts', json.encode(seenAlertIds.toList()));

    // Update foreground notification
    if (service is AndroidServiceInstance) {
      service.setForegroundNotificationInfo(
        title: 'Traffic Patrol - Active',
        content: 'Last check: ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')} | $newAlertCount new alerts',
      );
    }
  } catch (e) {
    // Silent fail - will retry on next cycle
  }
}
