import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';
import 'package:traffic_patrol/models/officer.dart';
import 'package:traffic_patrol/models/traffic_alert.dart';
import 'package:traffic_patrol/models/jurisdiction.dart';
import 'package:traffic_patrol/models/officer_location.dart';
import 'package:traffic_patrol/models/sos_alert.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // --- Officers ---
  CollectionReference get _officers =>
      _firestore.collection(AppConstants.officersCollection);

  Future<void> addOfficer(Officer officer) async {
    await _officers.doc(officer.id).set(officer.toFirestore());
  }

  Future<void> updateOfficer(Officer officer) async {
    await _officers.doc(officer.id).update(officer.toFirestore());
  }

  Future<void> deleteOfficer(String id) async {
    await _officers.doc(id).delete();
  }

  Stream<List<Officer>> getAllOfficers() {
    return _officers.orderBy('name').snapshots().map(
          (snapshot) =>
              snapshot.docs.map((doc) => Officer.fromFirestore(doc)).toList(),
        );
  }

  Future<Officer?> getOfficerById(String id) async {
    final doc = await _officers.doc(id).get();
    if (!doc.exists) return null;
    return Officer.fromFirestore(doc);
  }

  // --- Traffic Alerts ---
  CollectionReference get _trafficAlerts =>
      _firestore.collection(AppConstants.trafficAlertsCollection);

  Future<String> createTrafficAlert(TrafficAlert alert) async {
    final doc = await _trafficAlerts.add(alert.toFirestore());
    return doc.id;
  }

  Future<void> updateTrafficAlert(
      String id, Map<String, dynamic> data) async {
    await _trafficAlerts.doc(id).update(data);
  }

  Stream<List<TrafficAlert>> getActiveTrafficAlerts() {
    return _trafficAlerts
        .where('status', whereIn: ['active', 'acknowledged', 'dispatched'])
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => TrafficAlert.fromFirestore(doc))
              .toList(),
        );
  }

  Future<void> acknowledgeAlert(String alertId, String officerId) async {
    await _trafficAlerts.doc(alertId).update({
      'status': AlertStatus.acknowledged.name,
      'acknowledgedBy': officerId,
      'updatedAt': Timestamp.now(),
    });
  }

  Future<void> delegateAlert(
      String alertId, String assignedToId) async {
    await _trafficAlerts.doc(alertId).update({
      'status': AlertStatus.dispatched.name,
      'assignedTo': assignedToId,
      'updatedAt': Timestamp.now(),
    });
  }

  Future<void> resolveAlert(String alertId) async {
    await _trafficAlerts.doc(alertId).update({
      'status': AlertStatus.resolved.name,
      'resolvedAt': Timestamp.now(),
      'updatedAt': Timestamp.now(),
    });
  }

  // --- Jurisdictions ---
  CollectionReference get _jurisdictions =>
      _firestore.collection(AppConstants.jurisdictionsCollection);

  Future<void> saveJurisdiction(Jurisdiction jurisdiction) async {
    await _jurisdictions
        .doc(jurisdiction.id)
        .set(jurisdiction.toFirestore());
  }

  Future<Jurisdiction?> getOfficerJurisdiction(String officerId) async {
    final query = await _jurisdictions
        .where('officerId', isEqualTo: officerId)
        .limit(1)
        .get();
    if (query.docs.isEmpty) return null;
    return Jurisdiction.fromFirestore(query.docs.first);
  }

  Stream<List<Jurisdiction>> getAllJurisdictions() {
    return _jurisdictions.snapshots().map(
          (snapshot) => snapshot.docs
              .map((doc) => Jurisdiction.fromFirestore(doc))
              .toList(),
        );
  }

  // --- Officer Locations ---
  CollectionReference get _locations =>
      _firestore.collection(AppConstants.locationsCollection);

  Future<void> updateOfficerLocation(OfficerLocation location) async {
    await _locations
        .doc(location.officerId)
        .set(location.toFirestore());
  }

  Stream<List<OfficerLocation>> getOnlineOfficerLocations() {
    return _locations
        .where('isOnline', isEqualTo: true)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => OfficerLocation.fromFirestore(doc))
              .toList(),
        );
  }

  // --- SOS Alerts ---
  CollectionReference get _sosAlerts =>
      _firestore.collection(AppConstants.sosAlertsCollection);

  Future<String> createSosAlert(SosAlert alert) async {
    final doc = await _sosAlerts.add(alert.toFirestore());
    return doc.id;
  }

  Stream<List<SosAlert>> getActiveSosAlerts() {
    return _sosAlerts
        .where('status', isEqualTo: SosStatus.active.name)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => SosAlert.fromFirestore(doc))
              .toList(),
        );
  }

  Future<void> respondToSos(String sosId, String responderId) async {
    await _sosAlerts.doc(sosId).update({
      'status': SosStatus.responding.name,
      'respondedBy': responderId,
    });
  }
}
