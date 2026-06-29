import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class Jurisdiction {
  final String id;
  final String officerId;
  final String name;
  final List<LatLng> polygonPoints;
  final LatLng center;
  final DateTime createdAt;

  const Jurisdiction({
    required this.id,
    required this.officerId,
    required this.name,
    required this.polygonPoints,
    required this.center,
    required this.createdAt,
  });

  factory Jurisdiction.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final points = (data['polygonPoints'] as List<dynamic>?)
            ?.map((p) => LatLng(
                  (p['lat'] as num).toDouble(),
                  (p['lng'] as num).toDouble(),
                ))
            .toList() ??
        [];
    final centerData = data['center'] as Map<String, dynamic>?;
    return Jurisdiction(
      id: doc.id,
      officerId: data['officerId'] ?? '',
      name: data['name'] ?? '',
      polygonPoints: points,
      center: centerData != null
          ? LatLng(
              (centerData['lat'] as num).toDouble(),
              (centerData['lng'] as num).toDouble(),
            )
          : const LatLng(0, 0),
      createdAt:
          (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'officerId': officerId,
      'name': name,
      'polygonPoints': polygonPoints
          .map((p) => {'lat': p.latitude, 'lng': p.longitude})
          .toList(),
      'center': {'lat': center.latitude, 'lng': center.longitude},
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  bool containsPoint(LatLng point) {
    int intersections = 0;
    for (int i = 0; i < polygonPoints.length; i++) {
      final p1 = polygonPoints[i];
      final p2 = polygonPoints[(i + 1) % polygonPoints.length];

      if (point.latitude > p1.latitude == point.latitude > p2.latitude) {
        continue;
      }

      final xIntersect = (point.latitude - p1.latitude) *
              (p2.longitude - p1.longitude) /
              (p2.latitude - p1.latitude) +
          p1.longitude;

      if (point.longitude < xIntersect) {
        intersections++;
      }
    }
    return intersections.isOdd;
  }
}
