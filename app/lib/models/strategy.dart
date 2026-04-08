class Strategy {
  final String id;
  final String name;
  final String strategyType;
  final Map<String, dynamic> config;
  final bool isActive;
  final bool isPaper;
  final DateTime createdAt;
  final double? totalPnl;

  const Strategy({
    required this.id,
    required this.name,
    required this.strategyType,
    required this.config,
    this.isActive = false,
    this.isPaper = true,
    required this.createdAt,
    this.totalPnl,
  });

  factory Strategy.fromJson(Map<String, dynamic> json) {
    return Strategy(
      id: json['id'] as String,
      name: json['name'] as String,
      strategyType: json['strategyType'] as String,
      config: json['config'] as Map<String, dynamic>,
      isActive: json['isActive'] as bool? ?? false,
      isPaper: json['isPaper'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      totalPnl: (json['totalPnl'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'strategyType': strategyType,
      'config': config,
      'isActive': isActive,
      'isPaper': isPaper,
      'createdAt': createdAt.toIso8601String(),
      'totalPnl': totalPnl,
    };
  }

  String get modeLabel => isPaper ? 'Paper' : 'Live';

  Strategy copyWith({
    String? id,
    String? name,
    String? strategyType,
    Map<String, dynamic>? config,
    bool? isActive,
    bool? isPaper,
    DateTime? createdAt,
    double? totalPnl,
  }) {
    return Strategy(
      id: id ?? this.id,
      name: name ?? this.name,
      strategyType: strategyType ?? this.strategyType,
      config: config ?? this.config,
      isActive: isActive ?? this.isActive,
      isPaper: isPaper ?? this.isPaper,
      createdAt: createdAt ?? this.createdAt,
      totalPnl: totalPnl ?? this.totalPnl,
    );
  }
}
