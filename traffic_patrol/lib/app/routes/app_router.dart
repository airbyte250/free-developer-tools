import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:traffic_patrol/features/auth/screens/login_screen.dart';
import 'package:traffic_patrol/features/auth/screens/otp_screen.dart';
import 'package:traffic_patrol/features/dashboard/screens/dashboard_screen.dart';
import 'package:traffic_patrol/features/jurisdiction/screens/jurisdiction_screen.dart';
import 'package:traffic_patrol/features/live_map/screens/live_map_screen.dart';
import 'package:traffic_patrol/features/reports/screens/report_screen.dart';
import 'package:traffic_patrol/features/admin/screens/admin_dashboard_screen.dart';
import 'package:traffic_patrol/features/admin/screens/add_officer_screen.dart';
import 'package:traffic_patrol/features/sos/screens/sos_screen.dart';
import 'package:traffic_patrol/features/voice_report/screens/voice_report_screen.dart';
import 'package:traffic_patrol/features/auth/screens/splash_screen.dart';
import 'package:traffic_patrol/features/settings/screens/notification_settings_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/otp',
        name: 'otp',
        builder: (context, state) {
          final extra = state.extra as Map<String, String>;
          return OtpScreen(
            phoneNumber: extra['phoneNumber']!,
            verificationId: extra['verificationId']!,
          );
        },
      ),
      GoRoute(
        path: '/jurisdiction',
        name: 'jurisdiction',
        builder: (context, state) => const JurisdictionScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/live-map',
        name: 'liveMap',
        builder: (context, state) => const LiveMapScreen(),
      ),
      GoRoute(
        path: '/report',
        name: 'report',
        builder: (context, state) => const ReportScreen(),
      ),
      GoRoute(
        path: '/sos',
        name: 'sos',
        builder: (context, state) => const SosScreen(),
      ),
      GoRoute(
        path: '/voice-report',
        name: 'voiceReport',
        builder: (context, state) => const VoiceReportScreen(),
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const NotificationSettingsScreen(),
      ),
      // Admin routes
      GoRoute(
        path: '/admin',
        name: 'admin',
        builder: (context, state) => const AdminDashboardScreen(),
        routes: [
          GoRoute(
            path: 'add-officer',
            name: 'addOfficer',
            builder: (context, state) => const AddOfficerScreen(),
          ),
          GoRoute(
            path: 'edit-officer/:id',
            name: 'editOfficer',
            builder: (context, state) {
              final officerId = state.pathParameters['id']!;
              return AddOfficerScreen(officerId: officerId);
            },
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
}
