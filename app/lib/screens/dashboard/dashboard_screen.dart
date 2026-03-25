import 'package:flutter/material.dart';

/// Dashboard screen – shows portfolio overview, top movers, and running strategies.
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('仪表盘'),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Portfolio value card
          _PortfolioCard(),
          const SizedBox(height: 16),
          // Top movers
          _SectionHeader(title: '市场行情'),
          const SizedBox(height: 8),
          _MarketList(),
          const SizedBox(height: 16),
          // Running strategies
          _SectionHeader(title: '运行中的策略'),
          const SizedBox(height: 8),
          _StrategyList(),
        ],
      ),
    );
  }
}

class _PortfolioCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('总资产 (USDT)', style: TextStyle(color: Color(0xFF888888), fontSize: 12)),
            const SizedBox(height: 8),
            const Text('\$98,420.35', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.arrow_upward, color: Color(0xFF52C41A), size: 14),
                const Text('+\$1,248.60', style: TextStyle(color: Color(0xFF52C41A), fontSize: 13)),
                const Text(' (+1.28%)', style: TextStyle(color: Color(0xFF888888), fontSize: 12)),
              ],
            ),
            const SizedBox(height: 16),
            // Asset distribution bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Row(
                children: [
                  Expanded(flex: 85, child: Container(height: 6, color: const Color(0xFF1677FF))),
                  Expanded(flex: 13, child: Container(height: 6, color: const Color(0xFF52C41A))),
                  Expanded(flex: 2, child: Container(height: 6, color: const Color(0xFFFAAD14))),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Row(
              children: [
                _AssetBadge(color: Color(0xFF1677FF), label: 'BTC 85%'),
                SizedBox(width: 12),
                _AssetBadge(color: Color(0xFF52C41A), label: 'ETH 13%'),
                SizedBox(width: 12),
                _AssetBadge(color: Color(0xFFFAAD14), label: 'USDT 2%'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AssetBadge extends StatelessWidget {
  final Color color;
  final String label;
  const _AssetBadge({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: Color(0xFF888888), fontSize: 11)),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600));
  }
}

class _MarketList extends StatelessWidget {
  static const _data = [
    ('BTC/USDT', '\$67,420', '+1.28%', true),
    ('ETH/USDT', '\$3,540', '+2.14%', true),
    ('BNB/USDT', '\$582', '-0.42%', false),
    ('SOL/USDT', '\$178', '+3.67%', true),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _data
          .map(
            (item) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(item.$1, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: Text(item.$2, style: const TextStyle(color: Color(0xFF888888), fontSize: 12)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: item.$4 ? const Color(0xFF52C41A).withOpacity(0.15) : const Color(0xFFF5222D).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    item.$3,
                    style: TextStyle(color: item.$4 ? const Color(0xFF52C41A) : const Color(0xFFF5222D), fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _StrategyList extends StatelessWidget {
  static const _strategies = [
    ('BTC 网格策略', '运行中', '+\$1,248.60', true),
    ('ETH DCA策略', '运行中', '+\$420.80', true),
    ('SOL RSI反转', '运行中', '+\$312.50', true),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _strategies
          .map(
            (s) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFF1677FF),
                  radius: 20,
                  child: Icon(Icons.smart_toy, color: Colors.white, size: 18),
                ),
                title: Text(s.$1, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                subtitle: Row(
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: const BoxDecoration(color: Color(0xFF52C41A), shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 4),
                    Text(s.$2, style: const TextStyle(color: Color(0xFF52C41A), fontSize: 11)),
                  ],
                ),
                trailing: Text(s.$3, style: const TextStyle(color: Color(0xFF52C41A), fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            ),
          )
          .toList(),
    );
  }
}
