import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/core/services/api_service.dart';
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
  final Set<Polygon> _polygons = {};
  bool _trafficEnabled = true;
  bool _showOfficers = true;
  LatLng? _areaCenter;
  List<LatLng> _jurisdictionPoints = [];
  String _areaName = '';

  static const LatLng _defaultPosition = LatLng(26.9124, 75.7873); // Jaipur

  @override
  void initState() {
    super.initState();
    _loadJurisdiction();
  }

  Future<void> _loadJurisdiction() async {
    final officer = ref.read(currentOfficerProvider);
    if (officer == null) return;

    try {
      final apiService = ApiService();
      final data = await apiService.getJurisdiction(officer.id);
      if (data != null && mounted) {
        List<LatLng> points = [];
        if (data['polygon'] != null) {
          final polygonData = data['polygon'] is String
              ? json.decode(data['polygon'] as String) as List
              : data['polygon'] as List;
          points = polygonData
              .map((p) => LatLng(
                    (p['lat'] as num).toDouble(),
                    (p['lng'] as num).toDouble(),
                  ))
              .toList();
        }

        final centerLat = (data['centerLat'] as num?)?.toDouble();
        final centerLng = (data['centerLng'] as num?)?.toDouble();

        setState(() {
          _jurisdictionPoints = points;
          _areaName = data['areaName'] ?? '';
          if (centerLat != null && centerLng != null) {
            _areaCenter = LatLng(centerLat, centerLng);
          }
          _updateJurisdictionPolygon();
        });

        if (_areaCenter != null) {
          _mapController?.animateCamera(
            CameraUpdate.newLatLngZoom(_areaCenter!, 14),
          );
        }
      }
    } catch (e) {
      _initCurrentLocation();
    }
  }

  void _updateJurisdictionPolygon() {
    _polygons.clear();
    if (_jurisdictionPoints.length >= 3) {
      _polygons.add(
        Polygon(
          polygonId: const PolygonId('my_area'),
          points: _jurisdictionPoints,
          fillColor: AppColors.primary.withValues(alpha: 0.12),
          strokeColor: AppColors.primary,
          strokeWidth: 3,
        ),
      );
    }
  }

  Future<void> _initCurrentLocation() async {
    final locationService = ref.read(locationServiceProvider);
    final position = await locationService.getCurrentPosition();
    if (position != null && mounted) {
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(position.latitude, position.longitude),
          14,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final officerLocations = ref.watch(officerLocationsProvider);
    final trafficAlerts = ref.watch(trafficAlertsProvider);

    officerLocations.whenData((locations) {
      _updateOfficerMarkers(locations);
    });

    trafficAlerts.whenData((alerts) {
      _updateTrafficMarkers(alerts);
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(_areaName.isNotEmpty ? 'Live Map - $_areaName' : 'Live Traffic Map'),
        actions: [
          IconButton(
            icon: Icon(
              _trafficEnabled ? Icons.layers : Icons.layers_clear,
              color: _trafficEnabled ? AppColors.accent : Colors.white54,
            ),
            tooltip: 'Traffic Layer',
            onPressed: () {
              setState(() => _trafficEnabled = !_trafficEnabled);
            },
          ),
          IconButton(
            icon: Icon(
              Icons.people,
              color: _showOfficers ? AppColors.accent : Colors.white54,
            ),
            tooltip: 'Officers',
            onPressed: () {
              setState(() => _showOfficers = !_showOfficers);
            },
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            tooltip: 'My Area',
            onPressed: () {
              if (_areaCenter != null) {
                _mapController?.animateCamera(
                  CameraUpdate.newLatLngZoom(_areaCenter!, 14),
                );
              } else {
                _initCurrentLocation();
              }
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _areaCenter ?? _defaultPosition,
              zoom: 14,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
              if (_areaCenter != null) {
                controller.animateCamera(
                  CameraUpdate.newLatLngZoom(_areaCenter!, 14),
                );
              }
            },
            markers: _markers,
            circles: _trafficCircles,
            polygons: _polygons,
            trafficEnabled: _trafficEnabled,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),

          // Area info banner
          if (_areaName.isNotEmpty)
            Positioned(
              top: 12,
              left: 12,
              child: Card(
                color: AppColors.primary,
                elevation: 4,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.location_on, color: AppColors.accent, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        _areaName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Traffic alerts count
          Positioned(
            top: 12,
            right: 12,
            child: trafficAlerts.when(
              data: (alerts) {
                final activeAlerts = alerts
                    .where((a) => a.status == AlertStatus.active)
                    .toList();
                if (activeAlerts.isEmpty) return const SizedBox();
                return Card(
                  color: AppColors.sosRed,
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.warning, color: Colors.white, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          '${activeAlerts.length} Alert${activeAlerts.length > 1 ? 's' : ''}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
              loading: () => const SizedBox(),
              error: (_, _) => const SizedBox(),
            ),
          ),

          // Legend
          Positioned(
            bottom: 16,
            left: 16,
            child: _buildLegend(),
          ),

          // Traffic info
          Positioned(
            bottom: 16,
            right: 16,
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Google Traffic',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    _legendRow(const Color(0xFF4CAF50), 'Fast'),
                    _legendRow(const Color(0xFFFFC107), 'Moderate'),
                    _legendRow(const Color(0xFFFF9800), 'Slow'),
                    _legendRow(const Color(0xFFF44336), 'Jam'),
                  ],
                ),
              ),
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

  Widget _buildLegend() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Alerts',
              style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 11),
            ),
            const SizedBox(height: 4),
            _legendRow(AppColors.normalSpeed, 'Normal'),
            _legendRow(AppColors.slowSpeed, 'Slow'),
            _legendRow(AppColors.jamSpeed, 'Jam'),
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
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(text, style: const TextStyle(fontSize: 11)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
