import 'dart:async';
import 'dart:convert';

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:traffic_patrol/core/services/api_service.dart';
import 'package:traffic_patrol/core/services/notification_service.dart';

class TrafficMonitorService {
  final ApiService _api = ApiService();
  final NotificationService _notificationService;
  Timer? _monitorTimer;
  String? _areaName;
  List<LatLng> _jurisdictionPoints = [];
  LatLng? _areaCenter;

  static const String _mapsApiKey = 'AIzaSyAy_bbDc2scwaxORMUiCA_MtNJFjUFpU28';
  static const String _delayPrefKey = 'traffic_notify_delay_minutes';
  static const String _enabledPrefKey = 'traffic_notify_enabled';

  // Track active jams: routeIndex -> jam info
  final Map<int, _ActiveJam> _activeJams = {};
  // Track last notification time per route to avoid spam
  final Map<int, DateTime> _lastNotifyTime = {};

  TrafficMonitorService(this._notificationService);

  Future<void> start({
    required String officerId,
    required String officerName,
  }) async {
    // Load jurisdiction
    try {
      final data = await _api.getJurisdiction(officerId);
      if (data != null) {
        _areaName = data['areaName'] ?? '';
        final centerLat = (data['centerLat'] as num?)?.toDouble();
        final centerLng = (data['centerLng'] as num?)?.toDouble();
        if (centerLat != null && centerLng != null) {
          _areaCenter = LatLng(centerLat, centerLng);
        }
        if (data['polygon'] != null) {
          final polygonData = data['polygon'] is String
              ? json.decode(data['polygon'] as String) as List
              : data['polygon'] as List;
          _jurisdictionPoints = polygonData
              .map((p) => LatLng(
                    (p['lat'] as num).toDouble(),
                    (p['lng'] as num).toDouble(),
                  ))
              .toList();
        }
      }
    } catch (_) {}

    if (_areaCenter == null || _jurisdictionPoints.isEmpty) return;

    // Start monitoring every 2 minutes
    _monitorTimer?.cancel();
    _checkTraffic();
    _monitorTimer = Timer.periodic(const Duration(minutes: 2), (_) {
      _checkTraffic();
    });
  }

  void stop() {
    _monitorTimer?.cancel();
    _monitorTimer = null;
  }

  Future<int> getNotifyDelayMinutes() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_delayPrefKey) ?? 0;
  }

  Future<void> setNotifyDelayMinutes(int minutes) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_delayPrefKey, minutes);
  }

  Future<bool> isEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_enabledPrefKey) ?? true;
  }

  Future<void> setEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_enabledPrefKey, enabled);
  }

  Future<void> _checkTraffic() async {
    if (_areaCenter == null || _jurisdictionPoints.isEmpty) return;

    final enabled = await isEnabled();
    if (!enabled) return;

    try {
      final checkPoints = _generateCheckPoints();
      if (checkPoints.length < 2) return;

      for (int i = 0; i < checkPoints.length - 1; i++) {
        final origin = checkPoints[i];
        final destination = checkPoints[i + 1];
        await _checkRoute(origin, destination, i);
        await Future.delayed(const Duration(milliseconds: 500));
      }
    } catch (_) {}
  }

  List<LatLng> _generateCheckPoints() {
    if (_jurisdictionPoints.isEmpty || _areaCenter == null) return [];

    final points = <LatLng>[_areaCenter!];

    for (int i = 0; i < _jurisdictionPoints.length; i++) {
      final p1 = _jurisdictionPoints[i];
      final p2 = _jurisdictionPoints[(i + 1) % _jurisdictionPoints.length];
      points.add(LatLng(
        (p1.latitude + p2.latitude) / 2,
        (p1.longitude + p2.longitude) / 2,
      ));
    }

    if (points.length > 4) {
      return [points[0], points[1], points[2], points[3]];
    }
    return points;
  }

  Future<void> _checkRoute(LatLng origin, LatLng destination, int routeIndex) async {
    try {
      final url = Uri.parse(
        'https://maps.googleapis.com/maps/api/directions/json'
        '?origin=${origin.latitude},${origin.longitude}'
        '&destination=${destination.latitude},${destination.longitude}'
        '&departure_time=now'
        '&key=$_mapsApiKey',
      );

      final response = await http.get(url);
      if (response.statusCode != 200) return;

      final data = json.decode(response.body);
      if (data['status'] != 'OK') return;

      final routes = data['routes'] as List?;
      if (routes == null || routes.isEmpty) return;

      final legs = routes[0]['legs'] as List?;
      if (legs == null || legs.isEmpty) return;

      for (final leg in legs) {
        final normalDuration = leg['duration']?['value'] as int? ?? 0;
        final trafficDuration = leg['duration_in_traffic']?['value'] as int? ?? 0;

        if (normalDuration == 0) continue;

        final ratio = trafficDuration / normalDuration;
        final trafficPercent = ((ratio - 1) * 100).toInt();

        String? severity;

        if (ratio > 2.0) {
          severity = 'critical';
        } else if (ratio > 1.5) {
          severity = 'high';
        } else if (ratio > 1.25) {
          severity = 'medium';
        }

        final startLoc = leg['start_location'];
        final jamLat = (startLoc['lat'] as num).toDouble();
        final jamLng = (startLoc['lng'] as num).toDouble();
        final startAddress = (leg['start_address'] ?? '').toString();
        final locationName = startAddress.isNotEmpty
            ? startAddress.split(',').first
            : (_areaName ?? 'Unknown');

        final now = DateTime.now();
        final timeStr = DateFormat('hh:mm a').format(now);

        if (severity != null) {
          // JAM DETECTED
          if (_activeJams.containsKey(routeIndex)) {
            // Already tracking - skip re-notification
            continue;
          }

          // Check delay
          final delayMinutes = await getNotifyDelayMinutes();
          if (_lastNotifyTime.containsKey(routeIndex)) {
            final elapsed = now.difference(_lastNotifyTime[routeIndex]!).inMinutes;
            if (elapsed < delayMinutes) continue;
            if (elapsed < 5) continue;
          }

          // NEW JAM
          _activeJams[routeIndex] = _ActiveJam(
            severity: severity,
            detectedAt: now,
            lat: jamLat,
            lng: jamLng,
            locationName: locationName,
            trafficPercent: trafficPercent,
          );
          _lastNotifyTime[routeIndex] = now;

          final severityLabel = _getSeverityLabel(severity);
          final description = _getDescription(severity, trafficPercent);

          // Save to server
          try {
            await _api.createTrafficAlert(
              description: '$description | Detected: $timeStr | Traffic: $trafficPercent% slow',
              latitude: jamLat,
              longitude: jamLng,
              severity: severity,
              reportedBy: 'Auto Detection',
              areaName: '$_areaName - $locationName',
            );
          } catch (_) {}

          // Show notification with full details
          await _notificationService.showTrafficAlert(
            title: '$severityLabel Traffic Alert - $_areaName',
            body: '$locationName पर $description\n'
                'Time: $timeStr | Traffic: $trafficPercent% slow',
            payload: '$jamLat,$jamLng',
          );

        } else {
          // TRAFFIC NORMAL - check if previously jammed (auto-resolve)
          if (_activeJams.containsKey(routeIndex)) {
            final resolved = _activeJams[routeIndex]!;
            final durationMinutes = now.difference(resolved.detectedAt).inMinutes;
            final detectedTimeStr = DateFormat('hh:mm a').format(resolved.detectedAt);
            final clearedTimeStr = DateFormat('hh:mm a').format(now);

            _activeJams.remove(routeIndex);
            _lastNotifyTime[routeIndex] = now;

            // Save resolved alert to server
            try {
              await _api.createTrafficAlert(
                description: 'Traffic cleared after $durationMinutes min | '
                    'Jam: $detectedTimeStr - $clearedTimeStr | '
                    'Was: ${resolved.trafficPercent}% slow',
                latitude: resolved.lat,
                longitude: resolved.lng,
                severity: 'resolved',
                reportedBy: 'Auto Detection',
                areaName: '$_areaName - ${resolved.locationName}',
              );
            } catch (_) {}

            // Show "traffic cleared" notification
            await _notificationService.showTrafficAlert(
              title: 'Traffic Cleared - $_areaName',
              body: '${resolved.locationName} पर traffic normal ho gaya\n'
                  'Jam tha: $detectedTimeStr se $clearedTimeStr ($durationMinutes min)\n'
                  'Traffic tha: ${resolved.trafficPercent}% slow',
              payload: '${resolved.lat},${resolved.lng}',
            );
          }
        }
      }
    } catch (_) {}
  }

  String _getSeverityLabel(String severity) {
    switch (severity) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'MODERATE';
      default:
        return 'ALERT';
    }
  }

  String _getDescription(String severity, int percent) {
    switch (severity) {
      case 'critical':
        return 'बहुत भारी जाम - सामान्य से $percent% ज्यादा समय';
      case 'high':
        return 'भारी ट्रैफिक - सामान्य से $percent% ज्यादा समय';
      case 'medium':
        return 'मध्यम ट्रैफिक - सामान्य से $percent% ज्यादा समय';
      default:
        return 'ट्रैफिक alert';
    }
  }
}

class _ActiveJam {
  final String severity;
  final DateTime detectedAt;
  final double lat;
  final double lng;
  final String locationName;
  final int trafficPercent;

  const _ActiveJam({
    required this.severity,
    required this.detectedAt,
    required this.lat,
    required this.lng,
    required this.locationName,
    required this.trafficPercent,
  });
}
