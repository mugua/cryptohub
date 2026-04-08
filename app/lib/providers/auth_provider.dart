import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/user.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? token;
  final User? user;
  final String? errorMessage;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.token,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? token,
    User? user,
    String? errorMessage,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _checkToken();
  }

  Future<void> _checkToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    if (token != null && token.isNotEmpty) {
      state = AuthState(
        isAuthenticated: true,
        token: token,
        user: const User(
          id: 'demo-user',
          email: 'demo@cryptohub.com',
          username: 'DemoTrader',
        ),
      );
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));

    // Demo login: accept any non-empty credentials
    if (email.isNotEmpty && password.isNotEmpty) {
      const token = 'demo_token_cryptohub_2024';
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, token);

      state = AuthState(
        isAuthenticated: true,
        token: token,
        user: User(
          id: 'user-001',
          email: email,
          username: email.split('@').first,
        ),
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Invalid credentials',
      );
    }
  }

  Future<void> register(String email, String username, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    await Future.delayed(const Duration(seconds: 1));

    if (email.isNotEmpty && username.isNotEmpty && password.length >= 6) {
      const token = 'demo_token_cryptohub_2024';
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, token);

      state = AuthState(
        isAuthenticated: true,
        token: token,
        user: User(
          id: 'user-new',
          email: email,
          username: username,
        ),
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please fill all fields correctly',
      );
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
