import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';

class LocationService {
  StreamSubscription<Position>? _positionSubscription;

  Future<bool> checkPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }

    if (permission == LocationPermission.deniedForever) return false;

    return true;
  }

  Future<Position?> getCurrentPosition() async {
    final hasPermission = await checkPermission();
    if (!hasPermission) return null;

    return await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );
  }

  Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
        intervalDuration:
            Duration(seconds: AppConstants.locationUpdateInterval),
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationText: 'Traffic Patrol is tracking your location',
          notificationTitle: 'Traffic Patrol Active',
          enableWakeLock: true,
        ),
      ),
    );
  }

  void startTracking(void Function(Position) onPosition) {
    _positionSubscription?.cancel();
    _positionSubscription = getPositionStream().listen(onPosition);
  }

  void stopTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
  }

  double calculateSpeed(Position position) {
    // Convert m/s to km/h
    return (position.speed * 3.6).clamp(0, 200);
  }

  static LatLng positionToLatLng(Position position) {
    return LatLng(position.latitude, position.longitude);
  }

  static double distanceBetween(LatLng start, LatLng end) {
    return Geolocator.distanceBetween(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude,
    );
  }

  void dispose() {
    stopTracking();
  }
}
