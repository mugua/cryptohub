import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/market_provider.dart';
import '../../providers/trading_provider.dart';
import '../../widgets/price_card.dart';
import '../../widgets/mini_chart.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final marketState = ref.watch(marketProvider);
    final tradingState = ref.watch(tradingProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('dashboard.title')),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppTheme.gold,
        onRefresh: () async {
          ref.read(marketProvider.notifier).fetchMarket();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome
              Text(
                '${context.tr('dashboard.welcome')}, ${authState.user?.username ?? 'Trader'}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),

              // Stat cards
              _buildStatCards(context, tradingState),
              const SizedBox(height: 24),

              // Market overview header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    context.tr('dashboard.marketOverview'),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  TextButton(
                    onPressed: () => context.go('/market'),
                    child: Text(
                      context.tr('dashboard.viewAll'),
                      style: const TextStyle(color: AppTheme.gold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Market list (top 5)
              if (marketState.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(color: AppTheme.gold),
                  ),
                )
              else
                ...marketState.coins.take(5).map(
                      (coin) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: PriceCard(
                          coin: coin,
                          onTap: () =>
                              context.push('/market/trend/${coin.symbol}'),
                        ),
                      ),
                    ),

              const SizedBox(height: 24),

              // Recent trades
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    context.tr('dashboard.recentTrades'),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  TextButton(
                    onPressed: () => context.go('/trading'),
                    child: Text(
                      context.tr('dashboard.viewAll'),
                      style: const TextStyle(color: AppTheme.gold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (tradingState.orders.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(32),
                  child: Center(
                    child: Text(
                      context.tr('dashboard.noData'),
                      style: const TextStyle(color: AppTheme.textSecondary),
                    ),
                  ),
                )
              else
                ...tradingState.orders.take(3).map(
                      (order) => _buildOrderTile(context, order),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCards(BuildContext context, TradingState tradingState) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _StatCard(
          title: context.tr('dashboard.totalAssets'),
          value: '\$125,432.50',
          icon: Icons.account_balance_wallet,
          iconColor: AppTheme.gold,
        ),
        _StatCard(
          title: context.tr('dashboard.todayPnl'),
          value: '+\$1,234.56',
          icon: Icons.trending_up,
          iconColor: AppTheme.greenUp,
        ),
        _StatCard(
          title: context.tr('dashboard.activeStrategies'),
          value: '${tradingState.activeStrategies.length}',
          icon: Icons.auto_graph,
          iconColor: Colors.blueAccent,
        ),
        _StatCard(
          title: context.tr('dashboard.openOrders'),
          value: '${tradingState.openOrders.length}',
          icon: Icons.receipt_long,
          iconColor: Colors.purpleAccent,
        ),
      ],
    );
  }

  Widget _buildOrderTile(BuildContext context, dynamic order) {
    final isBuy = order.side == 'buy';
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor:
              isBuy ? AppTheme.greenUp.withValues(alpha: 0.2) : AppTheme.redDown.withValues(alpha: 0.2),
          child: Icon(
            isBuy ? Icons.arrow_downward : Icons.arrow_upward,
            color: isBuy ? AppTheme.greenUp : AppTheme.redDown,
            size: 20,
          ),
        ),
        title: Text(
          '${order.side.toString().toUpperCase()} ${order.coinSymbol}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${order.quantity} @ \$${order.price}',
          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: order.isPending
                ? AppTheme.gold.withValues(alpha: 0.2)
                : AppTheme.greenUp.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            order.status.toString().toUpperCase(),
            style: TextStyle(
              color: order.isPending ? AppTheme.gold : AppTheme.greenUp,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, color: iconColor, size: 20),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 12,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
