import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../models/market_data.dart';
import '../models/trend_report.dart';
import 'api_client.dart';

class MarketService {
  final ApiClient _client;

  MarketService(this._client);

  Future<List<CoinData>> getMarketSummary() async {
    final response = await _client.get(AppConstants.marketSummaryEndpoint);
    final list = response.data as List<dynamic>;
    return list
        .map((e) => CoinData.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<TrendReport> getTrend(String symbol) async {
    final response = await _client.get(
      '${AppConstants.trendEndpoint}/$symbol',
    );
    return TrendReport.fromJson(response.data as Map<String, dynamic>);
  }

  Future<TrendReport> generateReport(String symbol) async {
    final response = await _client.post(
      AppConstants.reportEndpoint,
      data: {'symbol': symbol},
    );
    return TrendReport.fromJson(response.data as Map<String, dynamic>);
  }
}

final marketServiceProvider = Provider<MarketService>((ref) {
  final client = ref.watch(apiClientProvider);
  return MarketService(client);
});
