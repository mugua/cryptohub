import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/market_data.dart';
import 'mini_chart.dart';

class PriceCard extends StatelessWidget {
  final CoinData coin;
  final VoidCallback? onTap;

  const PriceCard({
    super.key,
    required this.coin,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              // Coin icon
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.gold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    coin.symbol.substring(0, coin.symbol.length > 2 ? 2 : coin.symbol.length),
                    style: const TextStyle(
                      color: AppTheme.gold,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Name & symbol
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      coin.symbol,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      coin.name,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Mini sparkline
              if (coin.sparkline != null && coin.sparkline!.isNotEmpty)
                Expanded(
                  flex: 2,
                  child: SizedBox(
                    height: 30,
                    child: MiniChart(
                      data: coin.sparkline!,
                      lineWidth: 1.2,
                      showDots: false,
                    ),
                  ),
                ),

              const SizedBox(width: 12),

              // Price & change
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    coin.formattedPrice,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: coin.isPositive
                          ? AppTheme.greenUp.withValues(alpha: 0.15)
                          : AppTheme.redDown.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      coin.formattedChange,
                      style: TextStyle(
                        color: coin.isPositive
                            ? AppTheme.greenUp
                            : AppTheme.redDown,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
