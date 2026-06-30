import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:traffic_patrol/core/constants/app_constants.dart';
import 'package:traffic_patrol/models/officer.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // TEST MODE: Set to false when real Firebase Phone Auth is ready
  static const bool testMode = true;
  static const String testOtp = '123456';

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // In test mode, we skip Firebase Phone Auth and just validate OTP locally
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) verificationCompleted,
    required void Function(FirebaseAuthException) verificationFailed,
    required void Function(String, int?) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  }) async {
    if (testMode) {
      // In test mode, immediately call codeSent with a dummy verification ID
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
      // In test mode, just validate OTP is '123456'
      if (otp == testOtp) {
        // In test mode, we don't need actual Firebase auth
        // Just return null - the app will use the officer data from Firestore
        return null;
      } else {
        throw Exception('गलत OTP। कृपया 123456 डालें।');
      }
    }

    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: otp,
    );
    return await _auth.signInWithCredential(credential);
  }

  Future<Officer?> getOfficerByPhone(String phoneNumber) async {
    // Normalize phone number - remove country code prefix for matching
    String normalizedPhone = phoneNumber.replaceAll(RegExp(r'[^\d]'), '');
    if (normalizedPhone.startsWith('91') && normalizedPhone.length > 10) {
      normalizedPhone = normalizedPhone.substring(normalizedPhone.length - 10);
    }

    final query = await _firestore
        .collection(AppConstants.officersCollection)
        .where('mobileNumber', isEqualTo: normalizedPhone)
        .limit(1)
        .get();

    if (query.docs.isEmpty) {
      // Also try with full number
      final query2 = await _firestore
          .collection(AppConstants.officersCollection)
          .where('mobileNumber', isEqualTo: phoneNumber)
          .limit(1)
          .get();
      if (query2.docs.isEmpty) return null;
      return Officer.fromFirestore(query2.docs.first);
    }

    return Officer.fromFirestore(query.docs.first);
  }

  Future<Officer?> getCurrentOfficer() async {
    final user = currentUser;
    if (user == null) return null;

    if (testMode) {
      // In test mode, we can't use phone number from user (since anonymous)
      // We'll need to get it from shared preferences or pass it around
      return null;
    }

    if (user.phoneNumber == null) return null;
    return getOfficerByPhone(user.phoneNumber!);
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}
