import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/home_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/market/market_screen.dart';
import '../screens/market/trend_detail_screen.dart';
import '../screens/trading/trading_screen.dart';
import '../screens/trading/order_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/settings_screen.dart';
import '../screens/common/webview_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login';
      final isRegistering = state.matchedLocation == '/register';
      final isSplash = state.matchedLocation == '/splash';

      if (isSplash) return null;
      if (!isAuthenticated && !isLoggingIn && !isRegistering) return '/login';
      if (isAuthenticated && (isLoggingIn || isRegistering)) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => HomeScreen(child: child),
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: DashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/market',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: MarketScreen(),
            ),
            routes: [
              GoRoute(
                path: 'trend/:symbol',
                builder: (context, state) {
                  final symbol = state.pathParameters['symbol'] ?? 'BTC';
                  return TrendDetailScreen(symbol: symbol);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/trading',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: TradingScreen(),
            ),
            routes: [
              GoRoute(
                path: 'order',
                builder: (context, state) => const OrderScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
            routes: [
              GoRoute(
                path: 'settings',
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/webview',
        builder: (context, state) {
          final extra = state.extra as Map<String, String>?;
          return WebviewScreen(
            title: extra?['title'] ?? 'Help',
            url: extra?['url'] ?? '',
          );
        },
      ),
    ],
  );
});
