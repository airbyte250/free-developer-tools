import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Police Theme
  static const Color primary = Color(0xFF1A237E); // Dark Navy Blue
  static const Color primaryLight = Color(0xFF3949AB);
  static const Color primaryDark = Color(0xFF0D1642);
  static const Color accent = Color(0xFFFFD700); // Gold

  // Background
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Colors.white;
  static const Color darkBackground = Color(0xFF121212);

  // Traffic Speed Colors
  static const Color normalSpeed = Color(0xFF4CAF50); // Green
  static const Color slowSpeed = Color(0xFFFFC107); // Yellow/Amber
  static const Color jamSpeed = Color(0xFFF44336); // Red

  // Alert Colors
  static const Color sosRed = Color(0xFFD50000);
  static const Color warningOrange = Color(0xFFFF6D00);
  static const Color infoBlue = Color(0xFF2196F3);
  static const Color successGreen = Color(0xFF00C853);

  // Text
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textOnPrimary = Colors.white;
  static const Color textOnAccent = Color(0xFF212121);

  // Status
  static const Color online = Color(0xFF00C853);
  static const Color offline = Color(0xFF9E9E9E);
  static const Color busy = Color(0xFFFF6D00);
}
