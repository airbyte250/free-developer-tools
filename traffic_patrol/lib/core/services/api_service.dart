import 'dart:convert';
import 'dart:async';

import 'package:http/http.dart' as http;
import 'package:traffic_patrol/core/constants/app_constants.dart';
import 'package:traffic_patrol/models/officer.dart';

class ApiService {
  static const String _baseUrl = AppConstants.apiBaseUrl;

  Future<List<Officer>> getAllOfficers() async {
    final response = await http.get(Uri.parse('$_baseUrl/officers'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((j) => Officer.fromJson(j as Map<String, dynamic>)).toList();
    }
    throw Exception('Failed to load officers');
  }

  Future<Officer?> getOfficerByMobile(String mobile) async {
    String normalized = mobile.replaceAll(RegExp(r'[^\d]'), '');
    if (normalized.startsWith('91') && normalized.length > 10) {
      normalized = normalized.substring(normalized.length - 10);
    }
    final response = await http.get(
      Uri.parse('$_baseUrl/officers/by-mobile/$normalized'),
    );
    if (response.statusCode == 200) {
      return Officer.fromJson(json.decode(response.body) as Map<String, dynamic>);
    }
    if (response.statusCode == 404) return null;
    throw Exception('Failed to lookup officer');
  }

  Future<Officer?> getOfficerById(String id) async {
    final officers = await getAllOfficers();
    return officers.where((o) => o.id == id).firstOrNull;
  }

  Future<void> addOfficer(Officer officer) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/officers'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(officer.toJson()),
    );
    if (response.statusCode != 201) {
      final data = json.decode(response.body);
      throw Exception(data['error'] ?? 'Failed to add officer');
    }
  }

  Future<void> updateOfficer(Officer officer) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/officers/${officer.id}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(officer.toJson()),
    );
    if (response.statusCode != 200) {
      final data = json.decode(response.body);
      throw Exception(data['error'] ?? 'Failed to update officer');
    }
  }

  Future<void> deleteOfficer(String id) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/officers/$id'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to delete officer');
    }
  }

  Future<void> createTrafficAlert({
    required String description,
    required double latitude,
    required double longitude,
    required String severity,
    String? reportedBy,
    String? areaName,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/alerts'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'description': description,
        'latitude': latitude,
        'longitude': longitude,
        'severity': severity,
        'reportedBy': reportedBy,
        'areaName': areaName,
      }),
    );
    if (response.statusCode != 201) {
      throw Exception('Failed to create alert');
    }
  }

  Future<List<Map<String, dynamic>>> getAlerts() async {
    final response = await http.get(Uri.parse('$_baseUrl/alerts'));
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(json.decode(response.body));
    }
    throw Exception('Failed to load alerts');
  }

  Future<void> updateAlertStatus(String id, String status) async {
    await http.patch(
      Uri.parse('$_baseUrl/alerts/$id/status'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'status': status}),
    );
  }

  Future<void> createSosAlert({
    String? officerId,
    String? officerName,
    double? latitude,
    double? longitude,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/sos'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'officerId': officerId,
        'officerName': officerName,
        'latitude': latitude,
        'longitude': longitude,
      }),
    );
    if (response.statusCode != 201) {
      throw Exception('Failed to create SOS alert');
    }
  }

  Future<void> saveJurisdiction({
    required String officerId,
    required String areaName,
    required List<Map<String, double>> polygon,
    required double centerLat,
    required double centerLng,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/jurisdictions'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'officerId': officerId,
        'areaName': areaName,
        'polygon': polygon,
        'centerLat': centerLat,
        'centerLng': centerLng,
      }),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to save jurisdiction');
    }
  }

  Future<Map<String, dynamic>?> getJurisdiction(String officerId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/jurisdictions/$officerId'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    if (response.statusCode == 404) return null;
    throw Exception('Failed to load jurisdiction');
  }

  // ============ OFFICER LOCATIONS ============

  Future<void> updateLocation({
    required String officerId,
    required String officerName,
    required double latitude,
    required double longitude,
    required double speed,
    required double heading,
  }) async {
    await http.post(
      Uri.parse('$_baseUrl/locations'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'officerId': officerId,
        'officerName': officerName,
        'latitude': latitude,
        'longitude': longitude,
        'speed': speed,
        'heading': heading,
      }),
    );
  }

  Future<List<Map<String, dynamic>>> getOnlineLocations() async {
    final response = await http.get(Uri.parse('$_baseUrl/locations'));
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(json.decode(response.body));
    }
    return [];
  }

  Future<void> setOffline(String officerId) async {
    await http.patch(
      Uri.parse('$_baseUrl/locations/$officerId/offline'),
      headers: {'Content-Type': 'application/json'},
    );
  }

  Future<void> saveFcmToken(String officerId, String token) async {
    await http.post(
      Uri.parse('$_baseUrl/officers/$officerId/fcm-token'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'fcmToken': token}),
    );
  }

  Future<Map<String, dynamic>> getNotificationSettings(String officerId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/officers/$officerId/notification-settings'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    return {'enabled': true, 'delayMinutes': 0};
  }

  Future<void> saveNotificationSettings(String officerId, {required bool enabled, required int delayMinutes}) async {
    await http.post(
      Uri.parse('$_baseUrl/officers/$officerId/notification-settings'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'enabled': enabled, 'delayMinutes': delayMinutes}),
    );
  }
}
