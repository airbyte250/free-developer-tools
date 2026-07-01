import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyC0TjJAihT1wpMN_SFbVgIlh7657nK0TDI',
    appId: '1:1071254433829:web:3acbd5dadb480184924fcc',
    messagingSenderId: '1071254433829',
    projectId: 'trafficweb-apps-add',
    authDomain: 'trafficweb-apps-add.firebaseapp.com',
    storageBucket: 'trafficweb-apps-add.firebasestorage.app',
    measurementId: 'G-ESGMNV0MZV',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDlMAsk5N-VstAl8vt1N_LU_H4wk-4Q-4E',
    appId: '1:1071254433829:android:b1af691650bc9007924fcc',
    messagingSenderId: '1071254433829',
    projectId: 'trafficweb-apps-add',
    storageBucket: 'trafficweb-apps-add.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDlMAsk5N-VstAl8vt1N_LU_H4wk-4Q-4E',
    appId: '1:1071254433829:android:b1af691650bc9007924fcc',
    messagingSenderId: '1071254433829',
    projectId: 'trafficweb-apps-add',
    storageBucket: 'trafficweb-apps-add.firebasestorage.app',
    iosBundleId: 'com.kkhsmedia.traffic',
  );
}
