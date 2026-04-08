import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../app.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Drawer(
      backgroundColor: AppTheme.darkCard,
      child: Column(
        children: [
          // Header
          DrawerHeader(
            decoration: const BoxDecoration(
              color: AppTheme.darkBg,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppTheme.gold,
                  child: Text(
                    (user?.username ?? 'U')[0].toUpperCase(),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.darkBg,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  user?.username ?? 'User',
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  user?.email ?? '',
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),

          // Navigation items
          _DrawerItem(
            icon: Icons.dashboard,
            label: context.tr('nav.dashboard'),
            onTap: () {
              Navigator.pop(context);
              context.go('/home');
            },
          ),
          _DrawerItem(
            icon: Icons.candlestick_chart,
            label: context.tr('nav.market'),
            onTap: () {
              Navigator.pop(context);
              context.go('/market');
            },
          ),
          _DrawerItem(
            icon: Icons.swap_horiz,
            label: context.tr('nav.trading'),
            onTap: () {
              Navigator.pop(context);
              context.go('/trading');
            },
          ),
          _DrawerItem(
            icon: Icons.person,
            label: context.tr('nav.profile'),
            onTap: () {
              Navigator.pop(context);
              context.go('/profile');
            },
          ),

          const Divider(color: AppTheme.darkSurface),

          _DrawerItem(
            icon: Icons.settings,
            label: context.tr('nav.settings'),
            onTap: () {
              Navigator.pop(context);
              context.push('/profile/settings');
            },
          ),
          _DrawerItem(
            icon: Icons.help_outline,
            label: context.tr('profile.helpCenter'),
            onTap: () {
              Navigator.pop(context);
              context.push('/webview', extra: {
                'title': context.tr('profile.helpCenter'),
                'url': 'https://help.cryptohub.com',
              });
            },
          ),

          const Spacer(),

          // Logout
          _DrawerItem(
            icon: Icons.logout,
            label: context.tr('profile.logout'),
            iconColor: AppTheme.redDown,
            textColor: AppTheme.redDown,
            onTap: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
              context.go('/login');
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? iconColor;
  final Color? textColor;

  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppTheme.textSecondary),
      title: Text(
        label,
        style: TextStyle(color: textColor ?? AppTheme.textPrimary),
      ),
      onTap: onTap,
    );
  }
}
