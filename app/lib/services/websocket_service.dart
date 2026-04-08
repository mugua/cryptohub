import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../config/constants.dart';

enum ConnectionState { disconnected, connecting, connected, error }

class WebSocketService {
  WebSocketChannel? _channel;
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  ConnectionState _connectionState = ConnectionState.disconnected;
  Timer? _reconnectTimer;
  Timer? _pingTimer;

  Stream<Map<String, dynamic>> get messages => _messageController.stream;
  ConnectionState get connectionState => _connectionState;

  Future<void> connect({String? token}) async {
    if (_connectionState == ConnectionState.connecting ||
        _connectionState == ConnectionState.connected) {
      return;
    }

    _connectionState = ConnectionState.connecting;

    try {
      final uri = Uri.parse(AppConstants.wsUrl);
      _channel = WebSocketChannel.connect(
        uri,
        protocols: token != null ? ['Bearer', token] : null,
      );

      _connectionState = ConnectionState.connected;

      _channel!.stream.listen(
        (data) {
          try {
            final message = jsonDecode(data as String) as Map<String, dynamic>;
            _messageController.add(message);
          } catch (_) {
            // Skip malformed messages
          }
        },
        onDone: () {
          _connectionState = ConnectionState.disconnected;
          _scheduleReconnect();
        },
        onError: (error) {
          _connectionState = ConnectionState.error;
          _scheduleReconnect();
        },
      );

      _startPing();
    } catch (e) {
      _connectionState = ConnectionState.error;
      _scheduleReconnect();
    }
  }

  void subscribe(String channel, {Map<String, dynamic>? params}) {
    if (_connectionState != ConnectionState.connected) return;

    final message = jsonEncode({
      'action': 'subscribe',
      'channel': channel,
      if (params != null) ...params,
    });
    _channel?.sink.add(message);
  }

  void unsubscribe(String channel) {
    if (_connectionState != ConnectionState.connected) return;

    final message = jsonEncode({
      'action': 'unsubscribe',
      'channel': channel,
    });
    _channel?.sink.add(message);
  }

  void _startPing() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (_connectionState == ConnectionState.connected) {
        _channel?.sink.add(jsonEncode({'action': 'ping'}));
      }
    });
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      connect();
    });
  }

  Future<void> disconnect() async {
    _reconnectTimer?.cancel();
    _pingTimer?.cancel();
    await _channel?.sink.close();
    _channel = null;
    _connectionState = ConnectionState.disconnected;
  }

  void dispose() {
    disconnect();
    _messageController.close();
  }
}

final webSocketServiceProvider = Provider<WebSocketService>((ref) {
  final service = WebSocketService();
  ref.onDispose(() => service.dispose());
  return service;
});
