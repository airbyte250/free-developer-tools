import 'package:google_maps_flutter/google_maps_flutter.dart';

class OfficerLocation {
  final String officerId;
  final String officerName;
  final LatLng position;
  final double speed; // km/h
  final double heading; // degrees
  final bool isOnline;
  final DateTime lastUpdated;

  const OfficerLocation({
    required this.officerId,
    required this.officerName,
    required this.position,
    required this.speed,
    required this.heading,
    this.isOnline = true,
    required this.lastUpdated,
  });

  factory OfficerLocation.fromJson(Map<String, dynamic> data) {
    return OfficerLocation(
      officerId: data['officerId'].toString(),
      officerName: data['officerName'] ?? '',
      position: LatLng(
        (data['latitude'] as num?)?.toDouble() ?? 0,
        (data['longitude'] as num?)?.toDouble() ?? 0,
      ),
      speed: (data['speed'] as num?)?.toDouble() ?? 0.0,
      heading: (data['heading'] as num?)?.toDouble() ?? 0.0,
      isOnline: data['isOnline'] == 1 || data['isOnline'] == true,
      lastUpdated: DateTime.tryParse(data['lastUpdated']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}
