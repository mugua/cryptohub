import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../providers/market_provider.dart';
import '../../widgets/price_card.dart';

class MarketScreen extends ConsumerStatefulWidget {
  const MarketScreen({super.key});

  @override
  ConsumerState<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends ConsumerState<MarketScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final marketState = ref.watch(marketProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('market.title')),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.gold,
          unselectedLabelColor: AppTheme.textSecondary,
          indicatorColor: AppTheme.gold,
          tabs: [
            Tab(text: context.tr('market.allCoins')),
            Tab(text: context.tr('market.gainers')),
            Tab(text: context.tr('market.losers')),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: InputDecoration(
                hintText: context.tr('market.search'),
                prefixIcon:
                    const Icon(Icons.search, color: AppTheme.textSecondary),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear,
                            color: AppTheme.textSecondary),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value.toLowerCase());
              },
            ),
          ),

          // Header row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Expanded(
                  flex: 3,
                  child: Text(
                    'Coin',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    context.tr('market.price'),
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    context.tr('market.change24h'),
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Coin list
          Expanded(
            child: marketState.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.gold),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildCoinList(_filterCoins(marketState.coins)),
                      _buildCoinList(
                        _filterCoins(marketState.coins)
                            .where((c) => c.change24h > 0)
                            .toList()
                          ..sort((a, b) =>
                              b.change24h.compareTo(a.change24h)),
                      ),
                      _buildCoinList(
                        _filterCoins(marketState.coins)
                            .where((c) => c.change24h < 0)
                            .toList()
                          ..sort((a, b) =>
                              a.change24h.compareTo(b.change24h)),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  List<dynamic> _filterCoins(List<dynamic> coins) {
    if (_searchQuery.isEmpty) return coins;
    return coins
        .where((c) =>
            c.symbol.toLowerCase().contains(_searchQuery) ||
            c.name.toLowerCase().contains(_searchQuery))
        .toList();
  }

  Widget _buildCoinList(List<dynamic> coins) {
    if (coins.isEmpty) {
      return Center(
        child: Text(
          context.tr('dashboard.noData'),
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
      );
    }

    return RefreshIndicator(
      color: AppTheme.gold,
      onRefresh: () async {
        ref.read(marketProvider.notifier).fetchMarket();
      },
      child: ListView.builder(
        itemCount: coins.length,
        itemBuilder: (context, index) {
          final coin = coins[index];
          return PriceCard(
            coin: coin,
            onTap: () => context.push('/market/trend/${coin.symbol}'),
          );
        },
      ),
    );
  }
}
