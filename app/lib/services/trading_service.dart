import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../models/order.dart';
import '../models/strategy.dart';
import 'api_client.dart';

class TradingService {
  final ApiClient _client;

  TradingService(this._client);

  Future<Order> placeOrder(Map<String, dynamic> orderData) async {
    final response = await _client.post(
      AppConstants.ordersEndpoint,
      data: orderData,
    );
    return Order.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<Order>> getOrders({String? status}) async {
    final response = await _client.get(
      AppConstants.ordersEndpoint,
      queryParameters: status != null ? {'status': status} : null,
    );
    final list = response.data as List<dynamic>;
    return list
        .map((e) => Order.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> cancelOrder(String orderId) async {
    await _client.delete('${AppConstants.ordersEndpoint}/$orderId');
  }

  Future<List<Strategy>> getStrategies() async {
    final response = await _client.get(AppConstants.strategiesEndpoint);
    final list = response.data as List<dynamic>;
    return list
        .map((e) => Strategy.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

final tradingServiceProvider = Provider<TradingService>((ref) {
  final client = ref.watch(apiClientProvider);
  return TradingService(client);
});
