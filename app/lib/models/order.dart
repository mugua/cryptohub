class Order {
  final String id;
  final String exchange;
  final String coinSymbol;
  final String orderType;
  final String side;
  final double quantity;
  final double price;
  final String status;
  final DateTime createdAt;
  final DateTime? filledAt;

  const Order({
    required this.id,
    required this.exchange,
    required this.coinSymbol,
    required this.orderType,
    required this.side,
    required this.quantity,
    required this.price,
    required this.status,
    required this.createdAt,
    this.filledAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      exchange: json['exchange'] as String,
      coinSymbol: json['coinSymbol'] as String,
      orderType: json['orderType'] as String,
      side: json['side'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      price: (json['price'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      filledAt: json['filledAt'] != null
          ? DateTime.parse(json['filledAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'exchange': exchange,
      'coinSymbol': coinSymbol,
      'orderType': orderType,
      'side': side,
      'quantity': quantity,
      'price': price,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'filledAt': filledAt?.toIso8601String(),
    };
  }

  bool get isBuy => side == 'buy';
  bool get isPending => status == 'pending' || status == 'open';
  bool get isFilled => status == 'filled';

  String get formattedTotal => '\$${(quantity * price).toStringAsFixed(2)}';
}
