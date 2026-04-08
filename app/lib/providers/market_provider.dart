import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/market_data.dart';
import '../config/constants.dart';

class MarketState {
  final List<CoinData> coins;
  final bool isLoading;
  final String? errorMessage;

  const MarketState({
    this.coins = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  MarketState copyWith({
    List<CoinData>? coins,
    bool? isLoading,
    String? errorMessage,
  }) {
    return MarketState(
      coins: coins ?? this.coins,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class MarketNotifier extends StateNotifier<MarketState> {
  MarketNotifier() : super(const MarketState()) {
    fetchMarket();
  }

  Future<void> fetchMarket() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 800));

    // Generate mock data
    final random = Random(42);
    final mockPrices = <String, double>{
      'BTC': 67432.50,
      'ETH': 3521.80,
      'BNB': 598.40,
      'SOL': 172.35,
      'XRP': 0.6234,
      'ADA': 0.4812,
      'DOGE': 0.1523,
      'AVAX': 38.72,
      'DOT': 7.45,
      'MATIC': 0.7123,
      'LINK': 18.34,
      'UNI': 12.56,
      'ATOM': 9.87,
      'LTC': 84.23,
      'FIL': 6.12,
      'APT': 9.34,
      'ARB': 1.23,
      'OP': 2.67,
      'NEAR': 7.89,
      'SUI': 1.45,
    };

    final coins = AppConstants.supportedCoins.map((symbol) {
      final basePrice = mockPrices[symbol] ?? 10.0;
      final change = (random.nextDouble() - 0.45) * 15;
      final volume = basePrice * (random.nextDouble() * 5e8 + 1e7);
      final mcap = basePrice * (random.nextDouble() * 1e9 + 1e8);
      final sparkline = List.generate(
        24,
        (_) => basePrice * (1 + (random.nextDouble() - 0.5) * 0.05),
      );

      return CoinData(
        symbol: symbol,
        name: AppConstants.coinNames[symbol] ?? symbol,
        price: basePrice,
        change24h: double.parse(change.toStringAsFixed(2)),
        volume: volume,
        marketCap: mcap,
        sparkline: sparkline,
      );
    }).toList();

    state = MarketState(coins: coins);
  }
}

final marketProvider = StateNotifierProvider<MarketNotifier, MarketState>(
  (ref) => MarketNotifier(),
);
