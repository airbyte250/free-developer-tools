import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  final FlutterTts _tts = FlutterTts();

  Future<void> initialize() async {
    // Request permission
    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      criticalAlert: true,
    );

    // Initialize local notifications
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
      requestCriticalPermission: true,
    );
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Create notification channels
    await _createNotificationChannels();

    // Initialize TTS with proper Hindi voice
    await _tts.setLanguage('hi-IN');
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1.0);
    await _tts.setPitch(0.95);
    // Try to set Hindi voice explicitly
    final voices = await _tts.getVoices;
    if (voices is List) {
      for (final voice in voices) {
        if (voice is Map) {
          final locale = voice['locale']?.toString() ?? '';
          final name = voice['name']?.toString() ?? '';
          if (locale.contains('hi') || name.contains('Hindi') || name.contains('hi-IN')) {
            await _tts.setVoice({'name': name, 'locale': locale});
            break;
          }
        }
      }
    }

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
  }

  Future<void> _createNotificationChannels() async {
    final androidPlugin =
        _localNotifications.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          AppConstants.trafficAlertChannel,
          'Traffic Alerts',
          description: 'Notifications for traffic jam alerts in your area',
          importance: Importance.high,
          playSound: true,
        ),
      );

      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          AppConstants.sosAlertChannel,
          'SOS Alerts',
          description: 'Emergency SOS alerts from officers',
          importance: Importance.max,
          playSound: true,
        ),
      );
    }
  }

  Future<void> showTrafficAlert({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      AppConstants.trafficAlertChannel,
      'Traffic Alerts',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const details = NotificationDetails(android: androidDetails);

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );

    // Voice announcement
    await speakAlert('$title. $body');
  }

  Future<void> showSosAlert({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      AppConstants.sosAlertChannel,
      'SOS Alerts',
      importance: Importance.max,
      priority: Priority.max,
      icon: '@mipmap/ic_launcher',
      fullScreenIntent: true,
    );
    const details = NotificationDetails(android: androidDetails);

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );

    await speakAlert('Emergency! $title. $body');
  }

  Future<void> speakAlert(String message) async {
    await _tts.speak(message);
  }

  Future<String?> getToken() async {
    return await _messaging.getToken();
  }

  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  void _handleForegroundMessage(RemoteMessage message) {
    final title = message.notification?.title ?? 'Traffic Patrol';
    final body = message.notification?.body ?? '';

    if (message.data['type'] == 'sos') {
      showSosAlert(title: title, body: body, payload: message.data['alertId']);
    } else {
      showTrafficAlert(
          title: title, body: body, payload: message.data['alertId']);
    }
  }

  void _onNotificationTap(NotificationResponse response) {
    // Handle notification tap - navigation will be handled by the app
  }

  void dispose() {
    _tts.stop();
  }
}
