class AppConstants {
  AppConstants._();

  static const String appName = 'Traffic Patrol';
  static const String appVersion = '1.0.0';

  // API Base URL
  static const String apiBaseUrl = 'https://trafficpolice.kkhsmedia.com/api';

  // Location update interval in seconds
  static const int locationUpdateInterval = 15;

  // Traffic check interval in seconds
  static const int trafficCheckInterval = 60;

  // Speed thresholds (km/h)
  static const double normalSpeedThreshold = 20.0;
  static const double slowSpeedThreshold = 5.0;

  // Firestore collections
  static const String officersCollection = 'officers';
  static const String trafficAlertsCollection = 'traffic_alerts';
  static const String jurisdictionsCollection = 'jurisdictions';
  static const String sosAlertsCollection = 'sos_alerts';
  static const String reportsCollection = 'reports';
  static const String locationsCollection = 'officer_locations';

  // Notification channels
  static const String trafficAlertChannel = 'traffic_alerts';
  static const String sosAlertChannel = 'sos_alerts';
  static const String generalChannel = 'general';
}
