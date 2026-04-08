import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../widgets/order_form.dart';

class OrderScreen extends ConsumerStatefulWidget {
  const OrderScreen({super.key});

  @override
  ConsumerState<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends ConsumerState<OrderScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isBuy = true;
  String _selectedCoin = 'BTC';
  String _selectedExchange = 'Binance';

  final Map<String, double> _mockPrices = const {
    'BTC': 67432.50,
    'ETH': 3521.80,
    'BNB': 598.40,
    'SOL': 172.35,
    'XRP': 0.6234,
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: AppConstants.orderTypes.length,
      vsync: this,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentPrice = _mockPrices[_selectedCoin] ?? 100.0;

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('trading.placeOrder')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Exchange selector
            Row(
              children: [
                Text(
                  'Exchange:',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedExchange,
                    dropdownColor: AppTheme.darkCard,
                    decoration: const InputDecoration(
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: AppConstants.supportedExchanges
                        .take(5)
                        .map(
                          (e) => DropdownMenuItem(value: e, child: Text(e)),
                        )
                        .toList(),
                    onChanged: (v) =>
                        setState(() => _selectedExchange = v ?? _selectedExchange),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Coin selector
            Row(
              children: [
                Text(
                  'Coin:',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedCoin,
                    dropdownColor: AppTheme.darkCard,
                    decoration: const InputDecoration(
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: _mockPrices.keys
                        .map(
                          (c) => DropdownMenuItem(
                            value: c,
                            child: Text('$c/USDT'),
                          ),
                        )
                        .toList(),
                    onChanged: (v) =>
                        setState(() => _selectedCoin = v ?? _selectedCoin),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Current price
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$_selectedCoin/USDT',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      '\$${currentPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                        color: AppTheme.greenUp,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Order type tabs
            TabBar(
              controller: _tabController,
              labelColor: AppTheme.gold,
              unselectedLabelColor: AppTheme.textSecondary,
              indicatorColor: AppTheme.gold,
              isScrollable: true,
              tabs: AppConstants.orderTypes
                  .map((t) => Tab(text: t))
                  .toList(),
            ),
            const SizedBox(height: 16),

            // Buy/Sell toggle
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _isBuy = true),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _isBuy ? AppTheme.greenUp : AppTheme.darkSurface,
                        borderRadius: const BorderRadius.horizontal(
                          left: Radius.circular(8),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          context.tr('trading.buy'),
                          style: TextStyle(
                            color: _isBuy
                                ? Colors.white
                                : AppTheme.textSecondary,
                            fontWeight: FontWeight.w600,
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
                        color:
                            !_isBuy ? AppTheme.redDown : AppTheme.darkSurface,
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
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Order form
            OrderForm(
              isBuy: _isBuy,
              coinSymbol: _selectedCoin,
              currentPrice: currentPrice,
              showLeverage: true,
              onSubmit: (orderData) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      '${context.tr('common.success')}: '
                      '${_isBuy ? "BUY" : "SELL"} $_selectedCoin',
                    ),
                    backgroundColor: AppTheme.greenUp,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
