import 'package:flutter/material.dart';
import '../config/theme.dart';

class ThemeToggle extends StatelessWidget {
  final ThemeMode currentMode;
  final ValueChanged<ThemeMode> onChanged;

  const ThemeToggle({
    super.key,
    required this.currentMode,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ToggleButtons(
      isSelected: [
        currentMode == ThemeMode.dark,
        currentMode == ThemeMode.light,
        currentMode == ThemeMode.system,
      ],
      onPressed: (index) {
        switch (index) {
          case 0:
            onChanged(ThemeMode.dark);
            break;
          case 1:
            onChanged(ThemeMode.light);
            break;
          case 2:
            onChanged(ThemeMode.system);
            break;
        }
      },
      borderRadius: BorderRadius.circular(8),
      selectedBorderColor: AppTheme.gold,
      selectedColor: AppTheme.gold,
      fillColor: AppTheme.gold.withValues(alpha: 0.15),
      color: AppTheme.textSecondary,
      constraints: const BoxConstraints(minWidth: 40, minHeight: 32),
      children: const [
        Icon(Icons.dark_mode, size: 18),
        Icon(Icons.light_mode, size: 18),
        Icon(Icons.brightness_auto, size: 18),
      ],
    );
  }
}
