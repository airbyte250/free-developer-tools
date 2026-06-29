import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/traffic_alert.dart';

class ReportScreen extends ConsumerStatefulWidget {
  const ReportScreen({super.key});

  @override
  ConsumerState<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends ConsumerState<ReportScreen> {
  GoogleMapController? _mapController;
  LatLng? _selectedLocation;
  TrafficSeverity _severity = TrafficSeverity.medium;
  final _descriptionController = TextEditingController();
  final _locationNameController = TextEditingController();
  bool _isSubmitting = false;
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _initLocation();
  }

  Future<void> _initLocation() async {
    final locationService = ref.read(locationServiceProvider);
    final position = await locationService.getCurrentPosition();
    if (position != null && mounted) {
      final latLng = LatLng(position.latitude, position.longitude);
      setState(() {
        _selectedLocation = latLng;
        _markers.add(
          Marker(
            markerId: const MarkerId('report_location'),
            position: latLng,
            draggable: true,
            onDragEnd: (newPos) =>
                setState(() => _selectedLocation = newPos),
          ),
        );
      });
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(latLng, 15),
      );
    }
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _locationNameController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    if (_selectedLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Map पर location select करें')),
      );
      return;
    }
    if (_locationNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location का नाम डालें')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final officer = ref.read(currentOfficerProvider);
    final now = DateTime.now();

    final alert = TrafficAlert(
      id: '',
      location: _selectedLocation!,
      locationName: _locationNameController.text.trim(),
      severity: _severity,
      source: AlertSource.manualOfficer,
      status: AlertStatus.active,
      reportedBy: officer?.id,
      description: _descriptionController.text.trim().isNotEmpty
          ? _descriptionController.text.trim()
          : null,
      createdAt: now,
      updatedAt: now,
    );

    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      await firestoreService.createTrafficAlert(alert);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Traffic alert reported successfully!'),
            backgroundColor: AppColors.successGreen,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report Traffic Jam'),
      ),
      body: Column(
        children: [
          // Map
          SizedBox(
            height: 250,
            child: GoogleMap(
              initialCameraPosition: const CameraPosition(
                target: LatLng(26.9124, 75.7873),
                zoom: 13,
              ),
              onMapCreated: (controller) => _mapController = controller,
              onTap: (latLng) {
                setState(() {
                  _selectedLocation = latLng;
                  _markers.clear();
                  _markers.add(
                    Marker(
                      markerId: const MarkerId('report_location'),
                      position: latLng,
                      draggable: true,
                      onDragEnd: (newPos) =>
                          setState(() => _selectedLocation = newPos),
                    ),
                  );
                });
              },
              markers: _markers,
              myLocationEnabled: true,
            ),
          ),

          // Form
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _locationNameController,
                    decoration: InputDecoration(
                      labelText: 'Location Name',
                      hintText: 'e.g., MI Road near Panch Batti',
                      prefixIcon: const Icon(Icons.location_on),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Severity Selector
                  const Text(
                    'Traffic Severity',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: TrafficSeverity.values.map((s) {
                      final isSelected = s == _severity;
                      return Expanded(
                        child: Padding(
                          padding:
                              const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Text(
                              s.label,
                              style: TextStyle(
                                fontSize: 12,
                                color: isSelected
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: _chipColor(s),
                            onSelected: (_) =>
                                setState(() => _severity = s),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: _descriptionController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      labelText: 'Description (Optional)',
                      hintText: 'Traffic jam details...',
                      prefixIcon: const Icon(Icons.description),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: _isSubmitting ? null : _submitReport,
                      icon: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.send, color: Colors.white),
                      label: Text(
                        _isSubmitting
                            ? 'Submitting...'
                            : 'Report Traffic Jam',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _chipColor(TrafficSeverity severity) {
    switch (severity) {
      case TrafficSeverity.low:
        return AppColors.slowSpeed;
      case TrafficSeverity.medium:
        return AppColors.warningOrange;
      case TrafficSeverity.high:
        return AppColors.sosRed;
      case TrafficSeverity.critical:
        return const Color(0xFF8B0000);
    }
  }
}
