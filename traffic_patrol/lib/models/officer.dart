import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:traffic_patrol/core/constants/role_hierarchy.dart';

class Officer {
  final String id;
  final String name;
  final String mobileNumber;
  final String badgeNumber;
  final OfficerRole role;
  final String station;
  final String? district;
  final String? state;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Officer({
    required this.id,
    required this.name,
    required this.mobileNumber,
    required this.badgeNumber,
    required this.role,
    required this.station,
    this.district,
    this.state,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Officer.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Officer(
      id: doc.id,
      name: data['name'] ?? '',
      mobileNumber: data['mobileNumber'] ?? '',
      badgeNumber: data['badgeNumber'] ?? '',
      role: OfficerRole.fromString(data['role'] ?? 'constable'),
      station: data['station'] ?? '',
      district: data['district'],
      state: data['state'],
      isActive: data['isActive'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  factory Officer.fromJson(Map<String, dynamic> data) {
    return Officer(
      id: (data['id'] ?? '').toString(),
      name: data['name'] ?? '',
      mobileNumber: data['mobileNumber'] ?? '',
      badgeNumber: data['badgeNumber'] ?? '',
      role: OfficerRole.fromString(data['role'] ?? 'constable'),
      station: data['station'] ?? '',
      district: data['district'],
      state: data['state'],
      isActive: data['isActive'] == 1 || data['isActive'] == true,
      createdAt: data['createdAt'] != null
          ? DateTime.tryParse(data['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? DateTime.tryParse(data['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'mobileNumber': mobileNumber,
      'badgeNumber': badgeNumber,
      'role': role.name,
      'station': station,
      'district': district,
      'state': state,
    };
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'mobileNumber': mobileNumber,
      'badgeNumber': badgeNumber,
      'role': role.name,
      'station': station,
      'district': district,
      'state': state,
      'isActive': isActive,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  Officer copyWith({
    String? id,
    String? name,
    String? mobileNumber,
    String? badgeNumber,
    OfficerRole? role,
    String? station,
    String? district,
    String? state,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Officer(
      id: id ?? this.id,
      name: name ?? this.name,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      badgeNumber: badgeNumber ?? this.badgeNumber,
      role: role ?? this.role,
      station: station ?? this.station,
      district: district ?? this.district,
      state: state ?? this.state,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
