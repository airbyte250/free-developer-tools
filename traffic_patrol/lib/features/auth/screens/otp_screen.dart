import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/core/services/auth_service.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phoneNumber;
  final String verificationId;

  const OtpScreen({
    super.key,
    required this.phoneNumber,
    required this.verificationId,
  });

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otpController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verifyOtp(String otp) async {
    if (otp.length != 6) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authService = ref.read(authServiceProvider);
      await authService.signInWithOTP(
        verificationId: widget.verificationId,
        otp: otp,
      );

      // Fetch officer data using the phone number from login
      final officer =
          await authService.getOfficerByPhone(widget.phoneNumber);
      if (officer != null && mounted) {
        ref.read(currentOfficerProvider.notifier).setOfficer(officer);

        // Check if jurisdiction is set
        final firestoreService = ref.read(firestoreServiceProvider);
        final jurisdiction =
            await firestoreService.getOfficerJurisdiction(officer.id);
        if (jurisdiction == null) {
          context.go('/jurisdiction');
        } else {
          context.go('/dashboard');
        }
      } else if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Officer record not found. Contact admin.';
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = AuthService.testMode
            ? 'गलत OTP। कृपया 123456 डालें।'
            : 'गलत OTP। कृपया दोबारा प्रयास करें।';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.primaryDark, AppColors.primary],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.sms,
                    size: 80,
                    color: AppColors.accent,
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'OTP Verification',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textOnPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    AuthService.testMode
                        ? 'Test Mode: OTP है 123456'
                        : 'OTP भेजा गया है ${widget.phoneNumber} पर',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.accent,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),

                  // OTP Card
                  Card(
                    elevation: 8,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          PinCodeTextField(
                            appContext: context,
                            length: 6,
                            controller: _otpController,
                            animationType: AnimationType.fade,
                            pinTheme: PinTheme(
                              shape: PinCodeFieldShape.box,
                              borderRadius: BorderRadius.circular(12),
                              fieldHeight: 55,
                              fieldWidth: 45,
                              activeFillColor: Colors.white,
                              inactiveFillColor:
                                  Colors.grey.shade100,
                              selectedFillColor:
                                  AppColors.primary
                                      .withValues(alpha: 0.1),
                              activeColor: AppColors.primary,
                              inactiveColor: Colors.grey.shade300,
                              selectedColor: AppColors.accent,
                            ),
                            enableActiveFill: true,
                            keyboardType: TextInputType.number,
                            onCompleted: _verifyOtp,
                            onChanged: (_) {},
                          ),
                          const SizedBox(height: 16),

                          if (_errorMessage != null)
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.sosRed
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: AppColors.sosRed,
                                  fontSize: 13,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),

                          if (_isLoading)
                            const Padding(
                              padding: EdgeInsets.all(16),
                              child: CircularProgressIndicator(),
                            ),

                          const SizedBox(height: 16),

                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _isLoading
                                  ? null
                                  : () =>
                                      _verifyOtp(_otpController.text),
                              child: const Text(
                                'Verify OTP',
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text(
                      'नंबर बदलें',
                      style: TextStyle(color: AppColors.accent),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
