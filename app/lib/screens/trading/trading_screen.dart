import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../providers/trading_provider.dart';
import '../../widgets/mini_chart.dart';
import '../../widgets/order_form.dart';

class TradingScreen extends ConsumerStatefulWidget {
  const TradingScreen({super.key});

  @override
  ConsumerState<TradingScreen> createState() => _TradingScreenState();
}

class _TradingScreenState extends ConsumerState<TradingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isBuy = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tradingState = ref.watch(tradingProvider);

    // Mock price chart data
    final random = Random(DateTime.now().day);
    final chartData = List.generate(
      48,
      (i) => 67000.0 + (random.nextDouble() - 0.48) * 3000,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('trading.title')),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => context.push('/trading/order'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Price chart
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Text(
                        'BTC/USDT',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        '\$67,432.50',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.greenUp,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '+2.35%  Vol: \$28.5B',
                    style: TextStyle(
                      color: AppTheme.greenUp,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 180,
                    child: MiniChart(
                      data: chartData,
                      showDots: false,
                      lineWidth: 2,
                      gradientOpacity: 0.15,
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Buy/Sell toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isBuy = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _isBuy
                              ? AppTheme.greenUp
                              : AppTheme.darkSurface,
                          borderRadius: const BorderRadius.horizontal(
                            left: Radius.circular(8),
                          ),
                        ),
                        child: Center(
                          child: Text(
                            context.tr('trading.buy'),
                            style: TextStyle(
                              color:
                                  _isBuy ? Colors.white : AppTheme.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isBuy = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: !_isBuy
                              ? AppTheme.redDown
                              : AppTheme.darkSurface,
                          borderRadius: const BorderRadius.horizontal(
                            right: Radius.circular(8),
                          ),
                        ),
                        child: Center(
                          child: Text(
                            context.tr('trading.sell'),
                            style: TextStyle(
                              color: !_isBuy
                                  ? Colors.white
                                  : AppTheme.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Quick order form
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: OrderForm(
                isBuy: _isBuy,
                coinSymbol: 'BTC',
                currentPrice: 67432.50,
                onSubmit: (orderData) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(context.tr('common.success')),
                      backgroundColor: AppTheme.greenUp,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Open orders
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    context.tr('trading.openOrders'),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  if (tradingState.openOrders.isNotEmpty)
                    TextButton(
                      onPressed: () {},
                      child: Text(
                        context.tr('trading.cancelAll'),
                        style: const TextStyle(
                            color: AppTheme.redDown, fontSize: 13),
                      ),
                    ),
                ],
              ),
            ),
            if (tradingState.openOrders.isEmpty)
              Padding(
                padding: const EdgeInsets.all(32),
                child: Center(
                  child: Text(
                    context.tr('trading.noOrders'),
                    style: const TextStyle(color: AppTheme.textSecondary),
                  ),
                ),
              )
            else
              ...tradingState.openOrders.map(
                (order) => ListTile(
                  dense: true,
                  leading: Icon(
                    order.isBuy ? Icons.arrow_downward : Icons.arrow_upward,
                    color: order.isBuy ? AppTheme.greenUp : AppTheme.redDown,
                    size: 18,
                  ),
                  title: Text(
                    '${order.side.toUpperCase()} ${order.coinSymbol} '
                    '${order.quantity}',
                    style: const TextStyle(fontSize: 13),
                  ),
                  subtitle: Text(
                    '${order.orderType} @ \$${order.price}',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  trailing: TextButton(
                    onPressed: () {
                      ref
                          .read(tradingProvider.notifier)
                          .cancelOrder(order.id);
                    },
                    child: Text(
                      context.tr('trading.cancelOrder'),
                      style: const TextStyle(
                        color: AppTheme.redDown,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
