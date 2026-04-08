class TrendReport {
  final String coinSymbol;
  final double overallScore;
  final String trendSignal;
  final Map<String, double> factorScores;
  final String summaryZh;
  final String summaryEn;
  final DateTime? generatedAt;

  const TrendReport({
    required this.coinSymbol,
    required this.overallScore,
    required this.trendSignal,
    required this.factorScores,
    required this.summaryZh,
    required this.summaryEn,
    this.generatedAt,
  });

  factory TrendReport.fromJson(Map<String, dynamic> json) {
    return TrendReport(
      coinSymbol: json['coinSymbol'] as String,
      overallScore: (json['overallScore'] as num).toDouble(),
      trendSignal: json['trendSignal'] as String,
      factorScores: (json['factorScores'] as Map<String, dynamic>)
          .map((k, v) => MapEntry(k, (v as num).toDouble())),
      summaryZh: json['summaryZh'] as String,
      summaryEn: json['summaryEn'] as String,
      generatedAt: json['generatedAt'] != null
          ? DateTime.parse(json['generatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'coinSymbol': coinSymbol,
      'overallScore': overallScore,
      'trendSignal': trendSignal,
      'factorScores': factorScores,
      'summaryZh': summaryZh,
      'summaryEn': summaryEn,
      'generatedAt': generatedAt?.toIso8601String(),
    };
  }

  String getSummary(String locale) {
    return locale.startsWith('zh') ? summaryZh : summaryEn;
  }

  bool get isBullish => overallScore > 20;
  bool get isBearish => overallScore < -20;
  bool get isNeutral => !isBullish && !isBearish;
}
