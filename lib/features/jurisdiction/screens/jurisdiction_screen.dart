import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/jurisdiction.dart';
import 'package:uuid/uuid.dart';

class JurisdictionScreen extends ConsumerStatefulWidget {
  const JurisdictionScreen({super.key});

  @override
  ConsumerState<JurisdictionScreen> createState() =>
      _JurisdictionScreenState();
}

class _JurisdictionScreenState
    extends ConsumerState<JurisdictionScreen> {
  GoogleMapController? _mapController;
  final List<LatLng> _polygonPoints = [];
  final Set<Polygon> _polygons = {};
  final Set<Marker> _markers = {};
  final _nameController = TextEditingController();
  bool _isDrawing = true;
  bool _isSaving = false;

  static const LatLng _defaultPosition = LatLng(26.9124, 75.7873);

  @override
  void initState() {
    super.initState();
    _initLocation();
  }

  Future<void> _initLocation() async {
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
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _addPoint(LatLng point) {
    if (!_isDrawing) return;
    setState(() {
      _polygonPoints.add(point);
      _markers.add(
        Marker(
          markerId: MarkerId('point_${_polygonPoints.length}'),
          position: point,
          icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueBlue),
        ),
      );
      _updatePolygon();
    });
  }

  void _updatePolygon() {
    _polygons.clear();
    if (_polygonPoints.length >= 3) {
      _polygons.add(
        Polygon(
          polygonId: const PolygonId('jurisdiction'),
          points: _polygonPoints,
          fillColor: AppColors.primary.withValues(alpha: 0.2),
          strokeColor: AppColors.primary,
          strokeWidth: 3,
        ),
      );
    }
  }

  void _clearPoints() {
    setState(() {
      _polygonPoints.clear();
      _polygons.clear();
      _markers.clear();
      _isDrawing = true;
    });
  }

  Future<void> _saveJurisdiction() async {
    if (_polygonPoints.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('कम से कम 3 points select करें')),
      );
      return;
    }

    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Area का नाम डालें')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final officer = ref.read(currentOfficerProvider);
    if (officer == null) return;

    // Calculate center
    double latSum = 0, lngSum = 0;
    for (final p in _polygonPoints) {
      latSum += p.latitude;
      lngSum += p.longitude;
    }
    final center = LatLng(
      latSum / _polygonPoints.length,
      lngSum / _polygonPoints.length,
    );

    final jurisdiction = Jurisdiction(
      id: const Uuid().v4(),
      officerId: officer.id,
      name: _nameController.text.trim(),
      polygonPoints: List.from(_polygonPoints),
      center: center,
      createdAt: DateTime.now(),
    );

    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      await firestoreService.saveJurisdiction(jurisdiction);
      if (mounted) {
        context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Your Area'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: _clearPoints,
            tooltip: 'Clear',
          ),
        ],
      ),
      body: Column(
        children: [
          // Instructions
          Container(
            padding: const EdgeInsets.all(12),
            color: AppColors.primary.withValues(alpha: 0.1),
            child: Row(
              children: [
                const Icon(Icons.info, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _isDrawing
                        ? 'Map पर tap करके अपने duty area की boundary बनाएं (कम से कम 3 points)'
                        : 'Area selected! नाम डालें और save करें',
                    style: const TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

          // Map
          Expanded(
            child: GoogleMap(
              initialCameraPosition: const CameraPosition(
                target: _defaultPosition,
                zoom: 13,
              ),
              onMapCreated: (controller) => _mapController = controller,
              onTap: _addPoint,
              markers: _markers,
              polygons: _polygons,
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
            ),
          ),

          // Bottom controls
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${_polygonPoints.length} points selected',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Area Name (e.g., जोधवाड़ा)',
                    hintText: 'अपने area का नाम डालें',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.location_on),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _polygonPoints.length >= 3
                            ? () {
                                setState(() => _isDrawing = false);
                              }
                            : null,
                        icon: const Icon(Icons.done),
                        label: const Text('Done Drawing'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _isSaving ? null : _saveJurisdiction,
                        icon: _isSaving
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.save, color: Colors.white),
                        label: Text(
                          _isSaving ? 'Saving...' : 'Save Area',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
