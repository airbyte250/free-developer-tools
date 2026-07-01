import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

enum TrafficSeverity {
  low('Low', 'Mild congestion'),
  medium('Medium', 'Moderate traffic'),
  high('High', 'Heavy traffic jam'),
  critical('Critical', 'Complete gridlock');

  const TrafficSeverity(this.label, this.description);
  final String label;
  final String description;

  static TrafficSeverity fromString(String value) {
    return TrafficSeverity.values.firstWhere(
      (s) => s.name == value,
      orElse: () => TrafficSeverity.medium,
    );
  }
}

enum AlertSource {
  automatic,
  manualOfficer,
  manualCitizen,
}

enum AlertStatus {
  active,
  acknowledged,
  dispatched,
  resolved,
}

class TrafficAlert {
  final String id;
  final LatLng location;
  final String locationName;
  final TrafficSeverity severity;
  final AlertSource source;
  final AlertStatus status;
  final String? reportedBy;
  final String? acknowledgedBy;
  final String? assignedTo;
  final String? description;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? resolvedAt;

  const TrafficAlert({
    required this.id,
    required this.location,
    required this.locationName,
    required this.severity,
    required this.source,
    this.status = AlertStatus.active,
    this.reportedBy,
    this.acknowledgedBy,
    this.assignedTo,
    this.description,
    this.imageUrl,
    required this.createdAt,
    required this.updatedAt,
    this.resolvedAt,
  });

  factory TrafficAlert.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final loc = data['location'] as Map<String, dynamic>?;
    return TrafficAlert(
      id: doc.id,
      location: loc != null
          ? LatLng(
              (loc['lat'] as num).toDouble(),
              (loc['lng'] as num).toDouble(),
            )
          : const LatLng(0, 0),
      locationName: data['locationName'] ?? '',
      severity:
          TrafficSeverity.fromString(data['severity'] ?? 'medium'),
      source: AlertSource.values.firstWhere(
        (s) => s.name == (data['source'] ?? 'automatic'),
        orElse: () => AlertSource.automatic,
      ),
      status: AlertStatus.values.firstWhere(
        (s) => s.name == (data['status'] ?? 'active'),
        orElse: () => AlertStatus.active,
      ),
      reportedBy: data['reportedBy'],
      acknowledgedBy: data['acknowledgedBy'],
      assignedTo: data['assignedTo'],
      description: data['description'],
      imageUrl: data['imageUrl'],
      createdAt:
          (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt:
          (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      resolvedAt: (data['resolvedAt'] as Timestamp?)?.toDate(),
    );
  }

  factory TrafficAlert.fromJson(Map<String, dynamic> data) {
    return TrafficAlert(
      id: data['id']?.toString() ?? '',
      location: LatLng(
        (data['latitude'] as num?)?.toDouble() ?? 0,
        (data['longitude'] as num?)?.toDouble() ?? 0,
      ),
      locationName: data['areaName'] ?? '',
      severity: TrafficSeverity.fromString(data['severity'] ?? 'medium'),
      source: (data['source'] == 'auto' || (data['reportedBy'] ?? '').toString().contains('Auto'))
          ? AlertSource.automatic
          : AlertSource.manualOfficer,
      status: AlertStatus.values.firstWhere(
        (s) => s.name == (data['status'] ?? 'active'),
        orElse: () => AlertStatus.active,
      ),
      reportedBy: data['reportedBy'],
      description: data['description'],
      createdAt: DateTime.tryParse(data['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(data['updatedAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'location': {
        'lat': location.latitude,
        'lng': location.longitude,
      },
      'locationName': locationName,
      'severity': severity.name,
      'source': source.name,
      'status': status.name,
      'reportedBy': reportedBy,
      'acknowledgedBy': acknowledgedBy,
      'assignedTo': assignedTo,
      'description': description,
      'imageUrl': imageUrl,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'resolvedAt':
          resolvedAt != null ? Timestamp.fromDate(resolvedAt!) : null,
    };
  }

  TrafficAlert copyWith({
    String? id,
    LatLng? location,
    String? locationName,
    TrafficSeverity? severity,
    AlertSource? source,
    AlertStatus? status,
    String? reportedBy,
    String? acknowledgedBy,
    String? assignedTo,
    String? description,
    String? imageUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? resolvedAt,
  }) {
    return TrafficAlert(
      id: id ?? this.id,
      location: location ?? this.location,
      locationName: locationName ?? this.locationName,
      severity: severity ?? this.severity,
      source: source ?? this.source,
      status: status ?? this.status,
      reportedBy: reportedBy ?? this.reportedBy,
      acknowledgedBy: acknowledgedBy ?? this.acknowledgedBy,
      assignedTo: assignedTo ?? this.assignedTo,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
    );
  }
}
