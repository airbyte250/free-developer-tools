import 'dart:async';
import 'dart:convert';

import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/services/api_service.dart';
import 'package:traffic_patrol/models/officer.dart';
import 'package:traffic_patrol/models/traffic_alert.dart';
import 'package:traffic_patrol/models/jurisdiction.dart';
import 'package:traffic_patrol/models/officer_location.dart';
import 'package:traffic_patrol/models/sos_alert.dart';

class FirestoreService {
  final ApiService _api = ApiService();

  // --- Officers (via REST API) ---

  Future<void> addOfficer(Officer officer) async {
    await _api.addOfficer(officer);
  }

  Future<void> updateOfficer(Officer officer) async {
    await _api.updateOfficer(officer);
  }

  Future<void> deleteOfficer(String id) async {
    await _api.deleteOfficer(id);
  }

  Stream<List<Officer>> getAllOfficers() {
    final controller = StreamController<List<Officer>>();
    _fetchOfficersPeriodically(controller);
    return controller.stream;
  }

  void _fetchOfficersPeriodically(StreamController<List<Officer>> controller) async {
    try {
      final officers = await _api.getAllOfficers();
      if (!controller.isClosed) controller.add(officers);
    } catch (e) {
      if (!controller.isClosed) controller.add([]);
    }

    Future.delayed(const Duration(seconds: 10), () {
      if (!controller.isClosed) _fetchOfficersPeriodically(controller);
    });
  }

  Future<Officer?> getOfficerById(String id) async {
    return _api.getOfficerById(id);
  }

  // --- Traffic Alerts (via REST API) ---

  Future<String> createTrafficAlert(TrafficAlert alert) async {
    await _api.createTrafficAlert(
      description: alert.description ?? alert.locationName,
      latitude: alert.location.latitude,
      longitude: alert.location.longitude,
      severity: alert.severity.name,
      reportedBy: alert.reportedBy,
      areaName: alert.locationName,
    );
    return 'created';
  }

  Future<void> updateTrafficAlert(
      String id, Map<String, dynamic> data) async {
    if (data.containsKey('status')) {
      await _api.updateAlertStatus(id, data['status'].toString());
    }
  }

  Stream<List<TrafficAlert>> getActiveTrafficAlerts() {
    final controller = StreamController<List<TrafficAlert>>();
    _fetchAlertsPeriodically(controller);
    return controller.stream;
  }

  void _fetchAlertsPeriodically(StreamController<List<TrafficAlert>> controller) async {
    try {
      final alertsData = await _api.getAlerts();
      final alerts = alertsData
          .where((a) => a['status'] != 'resolved')
          .map((a) => TrafficAlert(
                id: a['id'].toString(),
                location: LatLng(
                  (a['latitude'] as num?)?.toDouble() ?? 0,
                  (a['longitude'] as num?)?.toDouble() ?? 0,
                ),
                locationName: a['areaName'] ?? a['description'] ?? '',
                severity: TrafficSeverity.fromString(a['severity'] ?? 'medium'),
                source: AlertSource.automatic,
                status: AlertStatus.values.firstWhere(
                  (s) => s.name == (a['status'] ?? 'active'),
                  orElse: () => AlertStatus.active,
                ),
                reportedBy: a['reportedBy'],
                description: a['description'],
                createdAt: DateTime.tryParse(a['createdAt']?.toString() ?? '') ?? DateTime.now(),
                updatedAt: DateTime.tryParse(a['updatedAt']?.toString() ?? '') ?? DateTime.now(),
              ))
          .toList();
      if (!controller.isClosed) controller.add(alerts);
    } catch (e) {
      if (!controller.isClosed) controller.add([]);
    }

    Future.delayed(const Duration(seconds: 10), () {
      if (!controller.isClosed) _fetchAlertsPeriodically(controller);
    });
  }

  Future<void> acknowledgeAlert(String alertId, String officerId) async {
    await _api.updateAlertStatus(alertId, 'acknowledged');
  }

  Future<void> delegateAlert(String alertId, String assignedToId) async {
    await _api.updateAlertStatus(alertId, 'dispatched');
  }

  Future<void> resolveAlert(String alertId) async {
    await _api.updateAlertStatus(alertId, 'resolved');
  }

  // --- Jurisdictions (via REST API) ---

  Future<void> saveJurisdiction(Jurisdiction jurisdiction) async {
    await _api.saveJurisdiction(
      officerId: jurisdiction.officerId,
      areaName: jurisdiction.name,
      polygon: jurisdiction.polygonPoints
          .map((p) => {'lat': p.latitude, 'lng': p.longitude})
          .toList(),
      centerLat: jurisdiction.center.latitude,
      centerLng: jurisdiction.center.longitude,
    );
  }

  Future<Jurisdiction?> getOfficerJurisdiction(String officerId) async {
    final data = await _api.getJurisdiction(officerId);
    if (data == null) return null;

    List<LatLng> points = [];
    if (data['polygon'] != null) {
      final polygonData = data['polygon'] is String
          ? json.decode(data['polygon'] as String) as List
          : data['polygon'] as List;
      points = polygonData
          .map((p) => LatLng(
                (p['lat'] as num).toDouble(),
                (p['lng'] as num).toDouble(),
              ))
          .toList();
    }

    return Jurisdiction(
      id: data['id'].toString(),
      officerId: data['officerId'].toString(),
      name: data['areaName'] ?? '',
      polygonPoints: points,
      center: LatLng(
        (data['centerLat'] as num?)?.toDouble() ?? 0,
        (data['centerLng'] as num?)?.toDouble() ?? 0,
      ),
      createdAt: DateTime.tryParse(data['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  Stream<List<Jurisdiction>> getAllJurisdictions() {
    return Stream.value([]);
  }

  // --- Officer Locations (via REST API) ---

  Future<void> updateOfficerLocation(OfficerLocation location) async {
    await _api.updateLocation(
      officerId: location.officerId,
      officerName: location.officerName,
      latitude: location.position.latitude,
      longitude: location.position.longitude,
      speed: location.speed,
      heading: location.heading,
    );
  }

  Stream<List<OfficerLocation>> getOnlineOfficerLocations() {
    final controller = StreamController<List<OfficerLocation>>();
    _fetchLocationsPeriodically(controller);
    return controller.stream;
  }

  void _fetchLocationsPeriodically(StreamController<List<OfficerLocation>> controller) async {
    try {
      final locData = await _api.getOnlineLocations();
      final locations = locData.map((d) => OfficerLocation(
        officerId: d['officerId'].toString(),
        officerName: d['officerName'] ?? '',
        position: LatLng(
          (d['latitude'] as num).toDouble(),
          (d['longitude'] as num).toDouble(),
        ),
        speed: (d['speed'] as num?)?.toDouble() ?? 0,
        heading: (d['heading'] as num?)?.toDouble() ?? 0,
        isOnline: true,
        lastUpdated: DateTime.tryParse(d['lastUpdated']?.toString() ?? '') ?? DateTime.now(),
      )).toList();
      if (!controller.isClosed) controller.add(locations);
    } catch (e) {
      if (!controller.isClosed) controller.add([]);
    }

    Future.delayed(const Duration(seconds: 10), () {
      if (!controller.isClosed) _fetchLocationsPeriodically(controller);
    });
  }

  // --- SOS Alerts (via REST API) ---

  Future<String> createSosAlert(SosAlert alert) async {
    await _api.createSosAlert(
      officerId: alert.officerId,
      officerName: alert.officerName,
      latitude: alert.location.latitude,
      longitude: alert.location.longitude,
    );
    return 'created';
  }

  Stream<List<SosAlert>> getActiveSosAlerts() {
    return Stream.value([]);
  }

  Future<void> respondToSos(String sosId, String responderId) async {
    // Handled via API if needed
  }
}
