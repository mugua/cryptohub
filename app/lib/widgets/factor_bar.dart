import 'package:flutter/material.dart';
import '../config/theme.dart';

class FactorBar extends StatelessWidget {
  final String name;
  final double score; // -100 to +100

  const FactorBar({
    super.key,
    required this.name,
    required this.score,
  });

  Color get _barColor {
    if (score > 50) return AppTheme.greenUp;
    if (score > 20) return const Color(0xFF8BC34A);
    if (score > -20) return AppTheme.gold;
    if (score > -50) return const Color(0xFFFF9800);
    return AppTheme.redDown;
  }

  @override
  Widget build(BuildContext context) {
    final normalizedValue = (score + 100) / 200; // 0.0 to 1.0

    return Row(
      children: [
        // Factor name
        SizedBox(
          width: 110,
          child: Text(
            name,
            style: const TextStyle(
              fontSize: 13,
              color: AppTheme.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),

        // Progress bar
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: normalizedValue.clamp(0.0, 1.0),
              backgroundColor: AppTheme.darkSurface,
              valueColor: AlwaysStoppedAnimation<Color>(_barColor),
              minHeight: 8,
            ),
          ),
        ),
        const SizedBox(width: 8),

        // Score text
        SizedBox(
          width: 45,
          child: Text(
            score.toStringAsFixed(0),
            textAlign: TextAlign.right,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _barColor,
            ),
          ),
        ),
      ],
    );
  }
}
