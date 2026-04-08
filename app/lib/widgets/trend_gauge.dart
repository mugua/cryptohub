import 'dart:math';
import 'package:flutter/material.dart';
import '../config/theme.dart';

class TrendGauge extends StatelessWidget {
  final double score; // -100 to +100
  final double size;

  const TrendGauge({
    super.key,
    required this.score,
    this.size = 200,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size * 0.65,
      child: CustomPaint(
        painter: _TrendGaugePainter(score: score),
        child: Center(
          child: Padding(
            padding: EdgeInsets.only(top: size * 0.15),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  score.toStringAsFixed(1),
                  style: TextStyle(
                    fontSize: size * 0.16,
                    fontWeight: FontWeight.bold,
                    color: _getScoreColor(score),
                  ),
                ),
                Text(
                  _getScoreLabel(score),
                  style: TextStyle(
                    fontSize: size * 0.065,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static Color _getScoreColor(double score) {
    if (score > 50) return AppTheme.greenUp;
    if (score > 20) return const Color(0xFF8BC34A);
    if (score > -20) return AppTheme.gold;
    if (score > -50) return const Color(0xFFFF9800);
    return AppTheme.redDown;
  }

  static String _getScoreLabel(double score) {
    if (score > 50) return 'Strong Buy';
    if (score > 20) return 'Buy';
    if (score > -20) return 'Neutral';
    if (score > -50) return 'Sell';
    return 'Strong Sell';
  }
}

class _TrendGaugePainter extends CustomPainter {
  final double score;

  _TrendGaugePainter({required this.score});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height * 0.85);
    final radius = size.width * 0.42;
    const startAngle = pi;
    const sweepAngle = pi;
    const strokeWidth = 14.0;

    // Background arc
    final bgPaint = Paint()
      ..color = AppTheme.darkSurface
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      bgPaint,
    );

    // Gradient arc
    final gradientPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..shader = SweepGradient(
        startAngle: pi,
        endAngle: 2 * pi,
        colors: const [
          Color(0xFFF6465D), // red
          Color(0xFFFF9800), // orange
          Color(0xFFF0B90B), // gold
          Color(0xFF8BC34A), // light green
          Color(0xFF0ECB81), // green
        ],
        stops: const [0.0, 0.25, 0.5, 0.75, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      gradientPaint,
    );

    // Needle
    final normalized = (score + 100) / 200; // 0 to 1
    final needleAngle = pi + normalized * pi;
    final needleLength = radius - 20;

    final needleTip = Offset(
      center.dx + needleLength * cos(needleAngle),
      center.dy + needleLength * sin(needleAngle),
    );

    final needlePaint = Paint()
      ..color = AppTheme.textPrimary
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(center, needleTip, needlePaint);

    // Center dot
    final dotPaint = Paint()..color = AppTheme.textPrimary;
    canvas.drawCircle(center, 6, dotPaint);

    final innerDotPaint = Paint()..color = AppTheme.darkBg;
    canvas.drawCircle(center, 3, innerDotPaint);

    // Labels
    const labels = ['-100', '-50', '0', '+50', '+100'];
    final labelAngles = [pi, pi + pi / 4, pi + pi / 2, pi + 3 * pi / 4, 2 * pi];

    final textPainterStyle = TextStyle(
      color: AppTheme.textSecondary.withValues(alpha: 0.7),
      fontSize: 10,
    );

    for (int i = 0; i < labels.length; i++) {
      final labelAngle = labelAngles[i];
      final labelPos = Offset(
        center.dx + (radius + 18) * cos(labelAngle),
        center.dy + (radius + 18) * sin(labelAngle),
      );

      final textSpan = TextSpan(text: labels[i], style: textPainterStyle);
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(
          labelPos.dx - textPainter.width / 2,
          labelPos.dy - textPainter.height / 2,
        ),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _TrendGaugePainter oldDelegate) {
    return oldDelegate.score != score;
  }
}
