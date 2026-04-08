import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/trend_report.dart';
import '../../widgets/trend_gauge.dart';
import '../../widgets/factor_bar.dart';

class TrendDetailScreen extends ConsumerStatefulWidget {
  final String symbol;

  const TrendDetailScreen({super.key, required this.symbol});

  @override
  ConsumerState<TrendDetailScreen> createState() => _TrendDetailScreenState();
}

class _TrendDetailScreenState extends ConsumerState<TrendDetailScreen> {
  late TrendReport _report;
  bool _isGenerating = false;

  @override
  void initState() {
    super.initState();
    _report = _generateMockReport();
  }

  TrendReport _generateMockReport() {
    final random = Random(widget.symbol.hashCode);
    final score = (random.nextDouble() - 0.4) * 160;

    return TrendReport(
      coinSymbol: widget.symbol,
      overallScore: double.parse(score.clamp(-100, 100).toStringAsFixed(1)),
      trendSignal: score > 30
          ? 'Strong Buy'
          : score > 0
              ? 'Buy'
              : score > -30
                  ? 'Neutral'
                  : score > -60
                      ? 'Sell'
                      : 'Strong Sell',
      factorScores: {
        // Technical
        'RSI': (random.nextDouble() - 0.3) * 100,
        'MACD': (random.nextDouble() - 0.4) * 100,
        'Moving Avg': (random.nextDouble() - 0.2) * 100,
        'Bollinger': (random.nextDouble() - 0.5) * 100,
        // Fundamental
        'TVL Growth': (random.nextDouble() - 0.3) * 100,
        'Dev Activity': (random.nextDouble() - 0.2) * 100,
        'Token Economics': (random.nextDouble() - 0.4) * 100,
        // Sentiment
        'Social Volume': (random.nextDouble() - 0.3) * 100,
        'Fear & Greed': (random.nextDouble() - 0.5) * 100,
        'Whale Activity': (random.nextDouble() - 0.4) * 100,
        // On-chain
        'Active Addresses': (random.nextDouble() - 0.2) * 100,
        'Exchange Flow': (random.nextDouble() - 0.5) * 100,
        'Hash Rate': (random.nextDouble() - 0.3) * 100,
      },
      summaryZh:
          '${AppConstants.coinNames[widget.symbol] ?? widget.symbol}当前技术指标显示${score > 0 ? "看涨" : "看跌"}趋势。'
          'RSI处于${score > 30 ? "超买" : score < -30 ? "超卖" : "中性"}区间，'
          'MACD${score > 0 ? "形成金叉" : "形成死叉"}，链上数据显示'
          '${score > 0 ? "资金持续流入" : "资金有流出迹象"}。'
          '综合多因子评估，建议${score > 30 ? "积极建仓" : score > 0 ? "谨慎做多" : score > -30 ? "观望等待" : "注意风险控制"}。',
      summaryEn:
          '${AppConstants.coinNames[widget.symbol] ?? widget.symbol} technical indicators show a '
          '${score > 0 ? "bullish" : "bearish"} trend. '
          'RSI is in ${score > 30 ? "overbought" : score < -30 ? "oversold" : "neutral"} territory, '
          'MACD shows a ${score > 0 ? "golden cross" : "death cross"}, and on-chain data indicates '
          '${score > 0 ? "continued capital inflow" : "signs of capital outflow"}. '
          'Based on multi-factor analysis, ${score > 30 ? "aggressive accumulation" : score > 0 ? "cautious long" : score > -30 ? "wait and see" : "risk management"} is recommended.',
      generatedAt: DateTime.now(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context);
    final langKey = '${locale.languageCode}-${locale.countryCode}';

    final technicalFactors = {
      'RSI': _report.factorScores['RSI'] ?? 0,
      'MACD': _report.factorScores['MACD'] ?? 0,
      'Moving Avg': _report.factorScores['Moving Avg'] ?? 0,
      'Bollinger': _report.factorScores['Bollinger'] ?? 0,
    };
    final fundamentalFactors = {
      'TVL Growth': _report.factorScores['TVL Growth'] ?? 0,
      'Dev Activity': _report.factorScores['Dev Activity'] ?? 0,
      'Token Economics': _report.factorScores['Token Economics'] ?? 0,
    };
    final sentimentFactors = {
      'Social Volume': _report.factorScores['Social Volume'] ?? 0,
      'Fear & Greed': _report.factorScores['Fear & Greed'] ?? 0,
      'Whale Activity': _report.factorScores['Whale Activity'] ?? 0,
    };
    final onChainFactors = {
      'Active Addresses': _report.factorScores['Active Addresses'] ?? 0,
      'Exchange Flow': _report.factorScores['Exchange Flow'] ?? 0,
      'Hash Rate': _report.factorScores['Hash Rate'] ?? 0,
    };

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '${widget.symbol} ${context.tr('market.trendAnalysis')}',
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gauge
            Center(
              child: TrendGauge(
                score: _report.overallScore,
                size: 200,
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: _report.isBullish
                      ? AppTheme.greenUp.withValues(alpha: 0.2)
                      : _report.isBearish
                          ? AppTheme.redDown.withValues(alpha: 0.2)
                          : AppTheme.gold.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _report.trendSignal,
                  style: TextStyle(
                    color: _report.isBullish
                        ? AppTheme.greenUp
                        : _report.isBearish
                            ? AppTheme.redDown
                            : AppTheme.gold,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Factor categories
            _buildFactorCategory(
                context.tr('market.technical'), technicalFactors),
            const SizedBox(height: 16),
            _buildFactorCategory(
                context.tr('market.fundamental'), fundamentalFactors),
            const SizedBox(height: 16),
            _buildFactorCategory(
                context.tr('market.sentiment'), sentimentFactors),
            const SizedBox(height: 16),
            _buildFactorCategory(
                context.tr('market.onChain'), onChainFactors),
            const SizedBox(height: 24),

            // Summary
            Text(
              context.tr('market.summary'),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  _report.getSummary(langKey),
                  style: const TextStyle(height: 1.6, fontSize: 14),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Generate report button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _isGenerating
                    ? null
                    : () async {
                        setState(() => _isGenerating = true);
                        await Future.delayed(
                            const Duration(seconds: 2));
                        setState(() {
                          _report = _generateMockReport();
                          _isGenerating = false;
                        });
                      },
                icon: _isGenerating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppTheme.darkBg,
                        ),
                      )
                    : const Icon(Icons.auto_awesome),
                label: Text(context.tr('market.generateReport')),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildFactorCategory(
      String title, Map<String, double> factors) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: factors.entries
                  .map(
                    (entry) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: FactorBar(
                        name: entry.key,
                        score: entry.value.clamp(-100, 100),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),
      ],
    );
  }
}
