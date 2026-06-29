import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/sos_alert.dart';

class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen>
    with SingleTickerProviderStateMixin {
  bool _isSending = false;
  bool _sent = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _sendSos() async {
    setState(() => _isSending = true);

    // Vibrate
    HapticFeedback.heavyImpact();

    final officer = ref.read(currentOfficerProvider);
    if (officer == null) return;

    final locationService = ref.read(locationServiceProvider);
    final position = await locationService.getCurrentPosition();

    if (position == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location access required!')),
        );
        setState(() => _isSending = false);
      }
      return;
    }

    final sosAlert = SosAlert(
      id: '',
      officerId: officer.id,
      officerName: officer.name,
      location: LatLng(position.latitude, position.longitude),
      status: SosStatus.active,
      createdAt: DateTime.now(),
    );

    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      await firestoreService.createSosAlert(sosAlert);

      // Trigger voice alert via notification service
      final notificationService = ref.read(notificationServiceProvider);
      await notificationService.showSosAlert(
        title: 'SOS Alert!',
        body: '${officer.name} (${officer.role.shortTitle}) needs help!',
      );

      if (mounted) {
        setState(() {
          _isSending = false;
          _sent = true;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
        setState(() => _isSending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _sent ? AppColors.successGreen : AppColors.sosRed,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: _sent ? _buildSentView() : _buildSosView(),
      ),
    );
  }

  Widget _buildSosView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.warning_rounded,
          size: 60,
          color: Colors.white,
        ),
        const SizedBox(height: 16),
        const Text(
          'EMERGENCY SOS',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 3,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Press the button to send an emergency alert\nto all senior officers',
          style: TextStyle(
            fontSize: 14,
            color: Colors.white.withValues(alpha: 0.8),
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 48),

        // SOS Button
        ScaleTransition(
          scale: _pulseAnimation,
          child: GestureDetector(
            onLongPress: _isSending ? null : _sendSos,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Center(
                child: _isSending
                    ? const CircularProgressIndicator(
                        color: AppColors.sosRed,
                        strokeWidth: 4,
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.emergency,
                            size: 60,
                            color: AppColors.sosRed,
                          ),
                          SizedBox(height: 4),
                          Text(
                            'HOLD',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.sosRed,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 32),
        Text(
          'Long press to send SOS',
          style: TextStyle(
            fontSize: 16,
            color: Colors.white.withValues(alpha: 0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildSentView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.check_circle,
          size: 80,
          color: Colors.white,
        ),
        const SizedBox(height: 16),
        const Text(
          'SOS SENT!',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 3,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Help is on the way.\nAll senior officers have been notified.',
          style: TextStyle(
            fontSize: 14,
            color: Colors.white.withValues(alpha: 0.9),
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: AppColors.successGreen,
            padding: const EdgeInsets.symmetric(
                horizontal: 32, vertical: 14),
          ),
          child: const Text(
            'Back to Dashboard',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}
