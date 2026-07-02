import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/constants/role_hierarchy.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/core/services/api_service.dart';
import 'package:traffic_patrol/core/services/background_alert_service.dart';
import 'package:traffic_patrol/features/dashboard/widgets/alert_card.dart';
import 'package:traffic_patrol/features/dashboard/widgets/stats_card.dart';
import 'package:traffic_patrol/models/traffic_alert.dart';

final trafficAlertsProvider = StreamProvider<List<TrafficAlert>>((ref) {
  final firestoreService = ref.read(firestoreServiceProvider);
  return firestoreService.getActiveTrafficAlerts();
});

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Timer? _locationTimer;
  final ApiService _apiService = ApiService();
  StreamSubscription<Position>? _positionSub;

  @override
  void initState() {
    super.initState();
    _startLocationTracking();
    _startTrafficMonitoring();
    _initNotifications();
  }

  @override
  void dispose() {
    _locationTimer?.cancel();
    _positionSub?.cancel();
    // Do NOT stop traffic monitor here - let background service handle it
    super.dispose();
  }

  Future<void> _initNotifications() async {
    final notifService = ref.read(notificationServiceProvider);
    await notifService.initialize();

    // Save FCM token for server-side push notifications
    try {
      final token = await notifService.getToken();
      final officer = ref.read(currentOfficerProvider);
      if (token != null && officer != null) {
        await _apiService.saveFcmToken(officer.id, token);
      }
    } catch (_) {}
  }

  Future<void> _startTrafficMonitoring() async {
    final officer = ref.read(currentOfficerProvider);
    if (officer == null) return;
    final trafficMonitor = ref.read(trafficMonitorProvider);
    await trafficMonitor.start(
      officerId: officer.id,
      officerName: officer.name,
    );

    // Start background alert polling service
    await BackgroundAlertService.startService(officer.id);
  }

  Future<void> _startLocationTracking() async {
    final officer = ref.read(currentOfficerProvider);
    if (officer == null) return;

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    if (permission == LocationPermission.deniedForever) return;

    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((position) {
      final off = ref.read(currentOfficerProvider);
      if (off == null) return;
      _apiService.updateLocation(
        officerId: off.id,
        officerName: off.name,
        latitude: position.latitude,
        longitude: position.longitude,
        speed: (position.speed * 3.6).clamp(0, 200),
        heading: position.heading,
      );
    });

    // Also send current position immediately
    try {
      final pos = await Geolocator.getCurrentPosition();
      _apiService.updateLocation(
        officerId: officer.id,
        officerName: officer.name,
        latitude: pos.latitude,
        longitude: pos.longitude,
        speed: (pos.speed * 3.6).clamp(0, 200),
        heading: pos.heading,
      );
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final officer = ref.watch(currentOfficerProvider);
    final alertsAsync = ref.watch(trafficAlertsProvider);

    if (officer == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Traffic Patrol'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => _showProfileSheet(context, officer.name,
                officer.role, officer.badgeNumber, officer.station),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_active),
            tooltip: 'Notification Settings',
            onPressed: () => context.push('/settings'),
          ),
          IconButton(
            icon: const Icon(Icons.edit_location_alt),
            tooltip: 'Change Area',
            onPressed: () => context.push('/jurisdiction'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              _positionSub?.cancel();
              // Stop background service on logout
              await BackgroundAlertService.stopService();
              ref.read(trafficMonitorProvider).stop();
              final off = ref.read(currentOfficerProvider);
              if (off != null) {
                try { await _apiService.setOffline(off.id); } catch (_) {}
              }
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('logged_in_phone');
              await ref.read(authServiceProvider).signOut();
              ref.read(currentOfficerProvider.notifier).clear();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {},
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Officer Info Card
              _buildOfficerInfoCard(officer.name, officer.role, officer.station),
              const SizedBox(height: 16),

              // Quick Actions
              _buildQuickActions(context, officer.role),
              const SizedBox(height: 24),

              // Stats Row
              alertsAsync.when(
                data: (alerts) => _buildStatsRow(alerts),
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (_, _) => const SizedBox(),
              ),
              const SizedBox(height: 24),

              // Active Alerts
              const Text(
                'Active Traffic Alerts',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              alertsAsync.when(
                data: (alerts) {
                  if (alerts.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Column(
                          children: [
                            Icon(Icons.check_circle,
                                size: 64, color: AppColors.successGreen),
                            SizedBox(height: 8),
                            Text(
                              'कोई active traffic alert नहीं है',
                              style: TextStyle(
                                fontSize: 16,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  return ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: alerts.length,
                    itemBuilder: (context, index) => AlertCard(
                      alert: alerts[index],
                      isSenior: officer.role.isSenior,
                      officerId: officer.id,
                    ),
                  );
                },
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e')),
              ),
            ],
          ),
        ),
      ),

      // SOS FAB
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/sos'),
        backgroundColor: AppColors.sosRed,
        icon: const Icon(Icons.warning_rounded, color: Colors.white),
        label: const Text('SOS',
            style: TextStyle(
                fontWeight: FontWeight.bold, color: Colors.white)),
      ),

      // Bottom Navigation
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.map),
            label: 'Live Map',
          ),
          NavigationDestination(
            icon: Icon(Icons.report),
            label: 'Report',
          ),
          NavigationDestination(
            icon: Icon(Icons.mic),
            label: 'Voice',
          ),
        ],
        selectedIndex: 0,
        onDestinationSelected: (index) {
          switch (index) {
            case 1:
              context.push('/live-map');
              break;
            case 2:
              context.push('/report');
              break;
            case 3:
              context.push('/voice-report');
              break;
          }
        },
      ),
    );
  }

  Widget _buildOfficerInfoCard(
      String name, OfficerRole role, String station) {
    return Card(
      color: AppColors.primary,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: AppColors.accent,
              child: Text(
                name.isNotEmpty ? name[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryDark,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textOnPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      role.fullTitle,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Station: $station',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.online,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'ONLINE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, OfficerRole role) {
    return Row(
      children: [
        Expanded(
          child: _QuickActionButton(
            icon: Icons.map,
            label: 'Live Map',
            color: AppColors.infoBlue,
            onTap: () => context.push('/live-map'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickActionButton(
            icon: Icons.report_problem,
            label: 'Report Jam',
            color: AppColors.warningOrange,
            onTap: () => context.push('/report'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickActionButton(
            icon: Icons.mic,
            label: 'Voice Report',
            color: AppColors.successGreen,
            onTap: () => context.push('/voice-report'),
          ),
        ),
        if (role.isSenior) ...[
          const SizedBox(width: 12),
          Expanded(
            child: _QuickActionButton(
              icon: Icons.people,
              label: 'Officers',
              color: AppColors.primaryLight,
              onTap: () => context.push('/admin'),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStatsRow(List<TrafficAlert> alerts) {
    final activeCount =
        alerts.where((a) => a.status == AlertStatus.active).length;
    final acknowledgedCount =
        alerts.where((a) => a.status == AlertStatus.acknowledged).length;
    final dispatchedCount =
        alerts.where((a) => a.status == AlertStatus.dispatched).length;

    return Row(
      children: [
        Expanded(
          child: StatsCard(
            title: 'Active',
            count: activeCount,
            color: AppColors.sosRed,
            icon: Icons.warning,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: StatsCard(
            title: 'Acknowledged',
            count: acknowledgedCount,
            color: AppColors.warningOrange,
            icon: Icons.check_circle,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: StatsCard(
            title: 'Dispatched',
            count: dispatchedCount,
            color: AppColors.successGreen,
            icon: Icons.directions_car,
          ),
        ),
      ],
    );
  }

  void _showProfileSheet(BuildContext context, String name,
      OfficerRole role, String badge, String station) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.primary,
              child: Text(
                name.isNotEmpty ? name[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontSize: 32,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(name,
                style: const TextStyle(
                    fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(role.fullTitle,
                style: const TextStyle(
                    fontSize: 16, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            _profileRow('Badge', badge),
            _profileRow('Station', station),
            _profileRow('Rank Level', '${role.level}'),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _profileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: AppColors.textSecondary)),
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
