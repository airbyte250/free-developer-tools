import 'package:firebase_auth/firebase_auth.dart';
import 'package:traffic_patrol/core/services/api_service.dart';
import 'package:traffic_patrol/models/officer.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ApiService _apiService = ApiService();

  // TEST MODE: Set to false when real Firebase Phone Auth is ready
  static const bool testMode = true;
  static const String testOtp = '123456';

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) verificationCompleted,
    required void Function(FirebaseAuthException) verificationFailed,
    required void Function(String, int?) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  }) async {
    if (testMode) {
      codeSent('test-verification-id', null);
      return;
    }

    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
      timeout: const Duration(seconds: 60),
    );
  }

  Future<UserCredential> signInWithCredential(
      PhoneAuthCredential credential) async {
    return await _auth.signInWithCredential(credential);
  }

  Future<UserCredential?> signInWithOTP({
    required String verificationId,
    required String otp,
  }) async {
    if (testMode) {
      if (otp == testOtp) {
        return null;
      } else {
        throw Exception('Wrong OTP. Please enter 123456');
      }
    }

    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: otp,
    );
    return await _auth.signInWithCredential(credential);
  }

  Future<Officer?> getOfficerByPhone(String phoneNumber) async {
    return _apiService.getOfficerByMobile(phoneNumber);
  }

  Future<Officer?> getCurrentOfficer() async {
    final user = currentUser;
    if (user == null) return null;

    if (testMode) {
      return null;
    }

    if (user.phoneNumber == null) return null;
    return getOfficerByPhone(user.phoneNumber!);
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}
