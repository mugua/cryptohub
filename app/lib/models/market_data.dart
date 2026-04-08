class CoinData {
  final String symbol;
  final String name;
  final double price;
  final double change24h;
  final double volume;
  final double marketCap;
  final List<double>? sparkline;

  const CoinData({
    required this.symbol,
    required this.name,
    required this.price,
    required this.change24h,
    required this.volume,
    required this.marketCap,
    this.sparkline,
  });

  factory CoinData.fromJson(Map<String, dynamic> json) {
    return CoinData(
      symbol: json['symbol'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      change24h: (json['change24h'] as num).toDouble(),
      volume: (json['volume'] as num).toDouble(),
      marketCap: (json['marketCap'] as num).toDouble(),
      sparkline: (json['sparkline'] as List<dynamic>?)
          ?.map((e) => (e as num).toDouble())
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'symbol': symbol,
      'name': name,
      'price': price,
      'change24h': change24h,
      'volume': volume,
      'marketCap': marketCap,
      'sparkline': sparkline,
    };
  }

  bool get isPositive => change24h >= 0;

  String get formattedPrice {
    if (price >= 1000) {
      return '\$${price.toStringAsFixed(2)}';
    } else if (price >= 1) {
      return '\$${price.toStringAsFixed(4)}';
    } else {
      return '\$${price.toStringAsFixed(6)}';
    }
  }

  String get formattedChange {
    final sign = change24h >= 0 ? '+' : '';
    return '$sign${change24h.toStringAsFixed(2)}%';
  }

  String get formattedVolume {
    if (volume >= 1e9) {
      return '\$${(volume / 1e9).toStringAsFixed(2)}B';
    } else if (volume >= 1e6) {
      return '\$${(volume / 1e6).toStringAsFixed(2)}M';
    }
    return '\$${volume.toStringAsFixed(0)}';
  }

  String get formattedMarketCap {
    if (marketCap >= 1e12) {
      return '\$${(marketCap / 1e12).toStringAsFixed(2)}T';
    } else if (marketCap >= 1e9) {
      return '\$${(marketCap / 1e9).toStringAsFixed(2)}B';
    } else if (marketCap >= 1e6) {
      return '\$${(marketCap / 1e6).toStringAsFixed(2)}M';
    }
    return '\$${marketCap.toStringAsFixed(0)}';
  }
}
