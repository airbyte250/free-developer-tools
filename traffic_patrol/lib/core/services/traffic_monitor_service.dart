import 'dart:async';
import 'dart:convert';

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
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

  // Track active jam locations to avoid duplicate notifications
  final Map<String, DateTime> _notifiedJams = {};

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
      // Generate sample route points within jurisdiction
      final checkPoints = _generateCheckPoints();
      if (checkPoints.length < 2) return;

      // Check traffic on routes between points in the area
      for (int i = 0; i < checkPoints.length - 1; i++) {
        final origin = checkPoints[i];
        final destination = checkPoints[i + 1];
        await _checkRoute(origin, destination);
        // Small delay between API calls
        await Future.delayed(const Duration(milliseconds: 500));
      }
    } catch (_) {}
  }

  List<LatLng> _generateCheckPoints() {
    if (_jurisdictionPoints.isEmpty || _areaCenter == null) return [];

    final points = <LatLng>[_areaCenter!];

    // Add midpoints of jurisdiction edges
    for (int i = 0; i < _jurisdictionPoints.length; i++) {
      final p1 = _jurisdictionPoints[i];
      final p2 = _jurisdictionPoints[(i + 1) % _jurisdictionPoints.length];
      points.add(LatLng(
        (p1.latitude + p2.latitude) / 2,
        (p1.longitude + p2.longitude) / 2,
      ));
    }

    // Limit to 4 check points to save API quota
    if (points.length > 4) {
      return [points[0], points[1], points[2], points[3]];
    }
    return points;
  }

  Future<void> _checkRoute(LatLng origin, LatLng destination) async {
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

        // Calculate traffic ratio
        final ratio = trafficDuration / normalDuration;
        
        String? severity;
        String? description;

        if (ratio > 2.0) {
          severity = 'critical';
          description = 'बहुत भारी जाम - सामान्य से ${((ratio - 1) * 100).toInt()}% ज्यादा समय';
        } else if (ratio > 1.5) {
          severity = 'high';
          description = 'भारी ट्रैफिक - सामान्य से ${((ratio - 1) * 100).toInt()}% ज्यादा समय';
        } else if (ratio > 1.25) {
          severity = 'medium';
          description = 'मध्यम ट्रैफिक - सामान्य से ${((ratio - 1) * 100).toInt()}% ज्यादा समय';
        }

        if (severity != null) {
          // Get the jam location
          final startLoc = leg['start_location'];
          final jamLat = (startLoc['lat'] as num).toDouble();
          final jamLng = (startLoc['lng'] as num).toDouble();
          final jamKey = '${jamLat.toStringAsFixed(3)}_${jamLng.toStringAsFixed(3)}';

          // Check notification delay
          final delayMinutes = await getNotifyDelayMinutes();
          final now = DateTime.now();

          if (_notifiedJams.containsKey(jamKey)) {
            final firstDetected = _notifiedJams[jamKey]!;
            final elapsedMinutes = now.difference(firstDetected).inMinutes;
            
            if (elapsedMinutes < delayMinutes) {
              continue; // Not enough time elapsed, skip notification
            }

            // Already notified and delay passed, check if we should re-notify
            // Don't re-notify for same location within 15 minutes
            if (elapsedMinutes < 15) continue;
          }

          _notifiedJams[jamKey] = now;

          // Determine location name from Google
          final startAddress = leg['start_address'] ?? '';
          final locationName = startAddress.isNotEmpty
              ? startAddress.toString().split(',').first
              : (_areaName ?? 'Unknown');

          // Create alert on server
          try {
            await _api.createTrafficAlert(
              description: description!,
              latitude: jamLat,
              longitude: jamLng,
              severity: severity,
              reportedBy: 'Auto Detection',
              areaName: '$_areaName - $locationName',
            );
          } catch (_) {}

          // Show local notification
          await _notificationService.showTrafficAlert(
            title: '${_getSeverityEmoji(severity)} Traffic Alert - $_areaName',
            body: '$locationName पर $description',
            payload: '$jamLat,$jamLng',
          );
        }
      }
    } catch (_) {}
  }

  String _getSeverityEmoji(String severity) {
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

}
