import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

enum SosStatus {
  active,
  responding,
  resolved,
}

class SosAlert {
  final String id;
  final String officerId;
  final String officerName;
  final LatLng location;
  final SosStatus status;
  final String? respondedBy;
  final String? description;
  final DateTime createdAt;
  final DateTime? resolvedAt;

  const SosAlert({
    required this.id,
    required this.officerId,
    required this.officerName,
    required this.location,
    this.status = SosStatus.active,
    this.respondedBy,
    this.description,
    required this.createdAt,
    this.resolvedAt,
  });

  factory SosAlert.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final loc = data['location'] as Map<String, dynamic>?;
    return SosAlert(
      id: doc.id,
      officerId: data['officerId'] ?? '',
      officerName: data['officerName'] ?? '',
      location: loc != null
          ? LatLng(
              (loc['lat'] as num).toDouble(),
              (loc['lng'] as num).toDouble(),
            )
          : const LatLng(0, 0),
      status: SosStatus.values.firstWhere(
        (s) => s.name == (data['status'] ?? 'active'),
        orElse: () => SosStatus.active,
      ),
      respondedBy: data['respondedBy'],
      description: data['description'],
      createdAt:
          (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      resolvedAt: (data['resolvedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'officerId': officerId,
      'officerName': officerName,
      'location': {
        'lat': location.latitude,
        'lng': location.longitude,
      },
      'status': status.name,
      'respondedBy': respondedBy,
      'description': description,
      'createdAt': Timestamp.fromDate(createdAt),
      'resolvedAt':
          resolvedAt != null ? Timestamp.fromDate(resolvedAt!) : null,
    };
  }
}
