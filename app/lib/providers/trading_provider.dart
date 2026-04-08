import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order.dart';
import '../models/strategy.dart';

class TradingState {
  final List<Order> orders;
  final List<Strategy> strategies;
  final bool isLoading;
  final String? errorMessage;

  const TradingState({
    this.orders = const [],
    this.strategies = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  TradingState copyWith({
    List<Order>? orders,
    List<Strategy>? strategies,
    bool? isLoading,
    String? errorMessage,
  }) {
    return TradingState(
      orders: orders ?? this.orders,
      strategies: strategies ?? this.strategies,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }

  List<Order> get openOrders =>
      orders.where((o) => o.isPending).toList();

  List<Order> get filledOrders =>
      orders.where((o) => o.isFilled).toList();

  List<Strategy> get activeStrategies =>
      strategies.where((s) => s.isActive).toList();
}

class TradingNotifier extends StateNotifier<TradingState> {
  TradingNotifier() : super(const TradingState()) {
    _loadMockData();
  }

  Future<void> _loadMockData() async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 500));

    final mockOrders = [
      Order(
        id: 'ord-001',
        exchange: 'Binance',
        coinSymbol: 'BTC',
        orderType: 'Limit',
        side: 'buy',
        quantity: 0.05,
        price: 65000.0,
        status: 'open',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      Order(
        id: 'ord-002',
        exchange: 'Binance',
        coinSymbol: 'ETH',
        orderType: 'Market',
        side: 'sell',
        quantity: 1.5,
        price: 3550.0,
        status: 'filled',
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
        filledAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      Order(
        id: 'ord-003',
        exchange: 'OKX',
        coinSymbol: 'SOL',
        orderType: 'Limit',
        side: 'buy',
        quantity: 10.0,
        price: 165.0,
        status: 'open',
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      Order(
        id: 'ord-004',
        exchange: 'Binance',
        coinSymbol: 'BNB',
        orderType: 'Stop-Limit',
        side: 'sell',
        quantity: 2.0,
        price: 580.0,
        status: 'pending',
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      ),
      Order(
        id: 'ord-005',
        exchange: 'Bybit',
        coinSymbol: 'DOGE',
        orderType: 'Market',
        side: 'buy',
        quantity: 5000.0,
        price: 0.152,
        status: 'filled',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        filledAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];

    final mockStrategies = [
      Strategy(
        id: 'strat-001',
        name: 'BTC Grid Bot',
        strategyType: 'Grid',
        config: {
          'pair': 'BTC/USDT',
          'upperPrice': 70000,
          'lowerPrice': 60000,
          'gridCount': 20,
        },
        isActive: true,
        isPaper: false,
        createdAt: DateTime.now().subtract(const Duration(days: 7)),
        totalPnl: 1234.56,
      ),
      Strategy(
        id: 'strat-002',
        name: 'ETH DCA Weekly',
        strategyType: 'DCA',
        config: {
          'pair': 'ETH/USDT',
          'amount': 100,
          'frequency': 'weekly',
        },
        isActive: true,
        isPaper: true,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        totalPnl: 456.78,
      ),
      Strategy(
        id: 'strat-003',
        name: 'SOL Trend Follow',
        strategyType: 'Trend-Following',
        config: {
          'pair': 'SOL/USDT',
          'maFast': 7,
          'maSlow': 25,
        },
        isActive: false,
        isPaper: true,
        createdAt: DateTime.now().subtract(const Duration(days: 14)),
        totalPnl: -89.12,
      ),
    ];

    state = TradingState(
      orders: mockOrders,
      strategies: mockStrategies,
    );
  }

  Future<void> placeOrder(Order order) async {
    state = state.copyWith(
      orders: [...state.orders, order],
    );
  }

  Future<void> cancelOrder(String orderId) async {
    final updated = state.orders.map((o) {
      if (o.id == orderId) {
        return Order(
          id: o.id,
          exchange: o.exchange,
          coinSymbol: o.coinSymbol,
          orderType: o.orderType,
          side: o.side,
          quantity: o.quantity,
          price: o.price,
          status: 'cancelled',
          createdAt: o.createdAt,
        );
      }
      return o;
    }).toList();
    state = state.copyWith(orders: updated);
  }

  void toggleStrategy(String strategyId) {
    final updated = state.strategies.map((s) {
      if (s.id == strategyId) {
        return s.copyWith(isActive: !s.isActive);
      }
      return s;
    }).toList();
    state = state.copyWith(strategies: updated);
  }
}

final tradingProvider = StateNotifierProvider<TradingNotifier, TradingState>(
  (ref) => TradingNotifier(),
);
