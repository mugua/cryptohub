import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _client;

  AuthService(this._client);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _client.post(
      AppConstants.loginEndpoint,
      data: {'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(
    String email,
    String username,
    String password,
  ) async {
    final response = await _client.post(
      AppConstants.registerEndpoint,
      data: {
        'email': email,
        'username': username,
        'password': password,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<User> getProfile() async {
    final response = await _client.get(AppConstants.profileEndpoint);
    return User.fromJson(response.data as Map<String, dynamic>);
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthService(client);
});
