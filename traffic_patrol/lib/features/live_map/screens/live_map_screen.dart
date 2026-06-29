import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/traffic_alert.dart';
import 'package:traffic_patrol/models/officer_location.dart';
import 'package:traffic_patrol/features/dashboard/screens/dashboard_screen.dart';
import 'package:url_launcher/url_launcher.dart';

final officerLocationsProvider = StreamProvider<List<OfficerLocation>>((ref) {
  final firestoreService = ref.read(firestoreServiceProvider);
  return firestoreService.getOnlineOfficerLocations();
});

class LiveMapScreen extends ConsumerStatefulWidget {
  const LiveMapScreen({super.key});

  @override
  ConsumerState<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends ConsumerState<LiveMapScreen> {
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  final Set<Circle> _trafficCircles = {};
  bool _trafficEnabled = true;
  bool _showOfficers = true;
  LatLng? _currentPosition;

  static const LatLng _defaultPosition = LatLng(26.9124, 75.7873); // Jaipur

  @override
  void initState() {
    super.initState();
    _initCurrentLocation();
  }

  Future<void> _initCurrentLocation() async {
    final locationService = ref.read(locationServiceProvider);
    final position = await locationService.getCurrentPosition();
    if (position != null && mounted) {
      setState(() {
        _currentPosition =
            LatLng(position.latitude, position.longitude);
      });
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(_currentPosition!, 14),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final officerLocations = ref.watch(officerLocationsProvider);
    final trafficAlerts = ref.watch(trafficAlertsProvider);

    // Build markers from officer locations
    officerLocations.whenData((locations) {
      _updateOfficerMarkers(locations);
    });

    // Build traffic alert markers
    trafficAlerts.whenData((alerts) {
      _updateTrafficMarkers(alerts);
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Traffic Map'),
        actions: [
          IconButton(
            icon: Icon(
              _trafficEnabled ? Icons.layers : Icons.layers_clear,
              color: _trafficEnabled ? AppColors.accent : Colors.white54,
            ),
            tooltip: 'Toggle Traffic Layer',
            onPressed: () {
              setState(() => _trafficEnabled = !_trafficEnabled);
            },
          ),
          IconButton(
            icon: Icon(
              Icons.people,
              color: _showOfficers ? AppColors.accent : Colors.white54,
            ),
            tooltip: 'Toggle Officers',
            onPressed: () {
              setState(() => _showOfficers = !_showOfficers);
            },
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _goToCurrentLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _currentPosition ?? _defaultPosition,
              zoom: 13,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
              if (_currentPosition != null) {
                controller.animateCamera(
                  CameraUpdate.newLatLngZoom(_currentPosition!, 14),
                );
              }
            },
            markers: _markers,
            circles: _trafficCircles,
            trafficEnabled: _trafficEnabled,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),

          // Legend
          Positioned(
            bottom: 16,
            left: 16,
            child: _buildLegend(),
          ),

          // Traffic alerts count overlay
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: trafficAlerts.when(
              data: (alerts) {
                final activeAlerts = alerts
                    .where((a) => a.status == AlertStatus.active)
                    .toList();
                if (activeAlerts.isEmpty) return const SizedBox();
                return _buildAlertsBanner(activeAlerts);
              },
              loading: () => const SizedBox(),
              error: (_, _) => const SizedBox(),
            ),
          ),
        ],
      ),
    );
  }

  void _updateOfficerMarkers(List<OfficerLocation> locations) {
    if (!_showOfficers) {
      _markers.removeWhere((m) => m.markerId.value.startsWith('officer_'));
      return;
    }

    for (final loc in locations) {
      final markerId = MarkerId('officer_${loc.officerId}');
      Color markerColor;
      if (loc.speed > AppConstants.normalSpeedThreshold) {
        markerColor = AppColors.normalSpeed;
      } else if (loc.speed > AppConstants.slowSpeedThreshold) {
        markerColor = AppColors.slowSpeed;
      } else {
        markerColor = AppColors.jamSpeed;
      }

      _markers.removeWhere((m) => m.markerId == markerId);
      _markers.add(
        Marker(
          markerId: markerId,
          position: loc.position,
          icon: BitmapDescriptor.defaultMarkerWithHue(
            markerColor == AppColors.normalSpeed
                ? BitmapDescriptor.hueGreen
                : markerColor == AppColors.slowSpeed
                    ? BitmapDescriptor.hueYellow
                    : BitmapDescriptor.hueRed,
          ),
          infoWindow: InfoWindow(
            title: loc.officerName,
            snippet: '${loc.speed.toStringAsFixed(1)} km/h',
          ),
          rotation: loc.heading,
          flat: true,
        ),
      );
    }
  }

  void _updateTrafficMarkers(List<TrafficAlert> alerts) {
    _trafficCircles.clear();
    _markers.removeWhere((m) => m.markerId.value.startsWith('alert_'));

    for (final alert in alerts) {
      if (alert.status == AlertStatus.resolved) continue;

      final markerId = MarkerId('alert_${alert.id}');
      _markers.add(
        Marker(
          markerId: markerId,
          position: alert.location,
          icon: BitmapDescriptor.defaultMarkerWithHue(
            alert.severity == TrafficSeverity.critical ||
                    alert.severity == TrafficSeverity.high
                ? BitmapDescriptor.hueRed
                : alert.severity == TrafficSeverity.medium
                    ? BitmapDescriptor.hueOrange
                    : BitmapDescriptor.hueYellow,
          ),
          infoWindow: InfoWindow(
            title: 'Traffic: ${alert.locationName}',
            snippet: alert.severity.description,
            onTap: () => _navigateToAlert(alert),
          ),
        ),
      );

      // Add a circle around the alert
      _trafficCircles.add(
        Circle(
          circleId: CircleId('circle_${alert.id}'),
          center: alert.location,
          radius: 200,
          fillColor: _getSeverityColor(alert.severity)
              .withValues(alpha: 0.15),
          strokeColor: _getSeverityColor(alert.severity),
          strokeWidth: 2,
        ),
      );
    }
  }

  Color _getSeverityColor(TrafficSeverity severity) {
    switch (severity) {
      case TrafficSeverity.low:
        return AppColors.slowSpeed;
      case TrafficSeverity.medium:
        return AppColors.warningOrange;
      case TrafficSeverity.high:
        return AppColors.sosRed;
      case TrafficSeverity.critical:
        return AppColors.sosRed;
    }
  }

  Future<void> _navigateToAlert(TrafficAlert alert) async {
    final lat = alert.location.latitude;
    final lng = alert.location.longitude;
    final url = Uri.parse(
        'google.navigation:q=$lat,$lng&mode=d');
    final fallbackUrl = Uri.parse(
        'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      await launchUrl(fallbackUrl, mode: LaunchMode.externalApplication);
    }
  }

  void _goToCurrentLocation() async {
    final locationService = ref.read(locationServiceProvider);
    final position = await locationService.getCurrentPosition();
    if (position != null) {
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(position.latitude, position.longitude),
          15,
        ),
      );
    }
  }

  Widget _buildLegend() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Traffic Status',
              style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 6),
            _legendRow(AppColors.normalSpeed, 'Normal (>20 km/h)'),
            _legendRow(AppColors.slowSpeed, 'Slow (5-20 km/h)'),
            _legendRow(AppColors.jamSpeed, 'Jam (<5 km/h)'),
          ],
        ),
      ),
    );
  }

  Widget _legendRow(Color color, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 14,
            height: 14,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildAlertsBanner(List<TrafficAlert> activeAlerts) {
    return Card(
      color: AppColors.sosRed,
      elevation: 4,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            const Icon(Icons.warning, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                '${activeAlerts.length} Active Traffic Alert${activeAlerts.length > 1 ? 's' : ''} in your area',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
