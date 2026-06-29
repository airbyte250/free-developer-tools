import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class OfficerLocation {
  final String officerId;
  final String officerName;
  final LatLng position;
  final double speed; // km/h
  final double heading; // degrees
  final bool isOnline;
  final DateTime updatedAt;

  const OfficerLocation({
    required this.officerId,
    required this.officerName,
    required this.position,
    required this.speed,
    required this.heading,
    this.isOnline = true,
    required this.updatedAt,
  });

  factory OfficerLocation.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final pos = data['position'] as Map<String, dynamic>?;
    return OfficerLocation(
      officerId: doc.id,
      officerName: data['officerName'] ?? '',
      position: pos != null
          ? LatLng(
              (pos['lat'] as num).toDouble(),
              (pos['lng'] as num).toDouble(),
            )
          : const LatLng(0, 0),
      speed: (data['speed'] as num?)?.toDouble() ?? 0.0,
      heading: (data['heading'] as num?)?.toDouble() ?? 0.0,
      isOnline: data['isOnline'] ?? true,
      updatedAt:
          (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'officerName': officerName,
      'position': {
        'lat': position.latitude,
        'lng': position.longitude,
      },
      'speed': speed,
      'heading': heading,
      'isOnline': isOnline,
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
