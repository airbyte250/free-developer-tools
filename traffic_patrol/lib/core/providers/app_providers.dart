import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:traffic_patrol/core/services/auth_service.dart';
import 'package:traffic_patrol/core/services/firestore_service.dart';
import 'package:traffic_patrol/core/services/location_service.dart';
import 'package:traffic_patrol/core/services/notification_service.dart';
import 'package:traffic_patrol/models/officer.dart';

// Services
final authServiceProvider = Provider<AuthService>((ref) => AuthService());
final firestoreServiceProvider =
    Provider<FirestoreService>((ref) => FirestoreService());
final locationServiceProvider =
    Provider<LocationService>((ref) => LocationService());
final notificationServiceProvider =
    Provider<NotificationService>((ref) => NotificationService());

// Current officer
final currentOfficerProvider =
    StateNotifierProvider<CurrentOfficerNotifier, Officer?>(
  (ref) => CurrentOfficerNotifier(ref),
);

class CurrentOfficerNotifier extends StateNotifier<Officer?> {
  final Ref _ref;
  CurrentOfficerNotifier(this._ref) : super(null);

  Future<void> loadCurrentOfficer() async {
    final authService = _ref.read(authServiceProvider);
    state = await authService.getCurrentOfficer();
  }

  void setOfficer(Officer? officer) {
    state = officer;
  }

  void clear() {
    state = null;
  }
}

// All officers stream
final allOfficersProvider = StreamProvider<List<Officer>>((ref) {
  final firestoreService = ref.read(firestoreServiceProvider);
  return firestoreService.getAllOfficers();
});
