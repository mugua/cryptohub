import 'package:flutter/material.dart';

class AppTheme {
  static const _primaryColor = Color(0xFF1677FF);
  static const _bgColor = Color(0xFF0D1117);
  static const _surfaceColor = Color(0xFF161B22);
  static const _borderColor = Color(0xFF1F2937);

  static final darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: _primaryColor,
      surface: _surfaceColor,
      onSurface: Color(0xFFC9D1D9),
    ),
    scaffoldBackgroundColor: _bgColor,
    appBarTheme: const AppBarTheme(
      backgroundColor: _surfaceColor,
      foregroundColor: Color(0xFFC9D1D9),
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: _surfaceColor,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: _borderColor),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: _surfaceColor,
      indicatorColor: _primaryColor.withOpacity(0.2),
      iconTheme: WidgetStateProperty.all(
        const IconThemeData(color: Color(0xFF888888)),
      ),
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(color: Color(0xFF888888), fontSize: 11),
      ),
    ),
    textTheme: const TextTheme(
      bodyMedium: TextStyle(color: Color(0xFFC9D1D9)),
      bodySmall: TextStyle(color: Color(0xFF888888)),
      titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
    ),
  );
}
