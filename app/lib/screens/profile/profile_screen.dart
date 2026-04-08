import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../i18n/locale_provider.dart';
import '../../widgets/theme_toggle.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('profile.title')),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // User info section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: AppTheme.gold,
                    child: Text(
                      (user?.username ?? 'U')[0].toUpperCase(),
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.darkBg,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.username ?? 'User',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.gold),
                      foregroundColor: AppTheme.gold,
                    ),
                    child: Text(context.tr('profile.editProfile')),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Settings tiles
            _SettingsTile(
              icon: Icons.language,
              title: context.tr('profile.language'),
              subtitle: locale.languageCode == 'zh' ? '中文' : 'English',
              onTap: () {
                ref.read(localeProvider.notifier).toggleLocale();
              },
            ),
            _SettingsTile(
              icon: Icons.palette_outlined,
              title: context.tr('profile.theme'),
              subtitle: themeMode == ThemeMode.dark
                  ? context.tr('profile.darkMode')
                  : themeMode == ThemeMode.light
                      ? context.tr('profile.lightMode')
                      : context.tr('profile.autoMode'),
              trailing: ThemeToggle(
                currentMode: themeMode,
                onChanged: (mode) {
                  ref.read(themeModeProvider.notifier).setThemeMode(mode);
                },
              ),
            ),
            _SettingsTile(
              icon: Icons.key,
              title: context.tr('profile.apiKeys'),
              onTap: () {},
            ),
            _SettingsTile(
              icon: Icons.notifications_outlined,
              title: context.tr('profile.notifications'),
              onTap: () {},
            ),
            _SettingsTile(
              icon: Icons.security,
              title: context.tr('profile.security'),
              onTap: () {},
            ),
            _SettingsTile(
              icon: Icons.settings_outlined,
              title: context.tr('nav.settings'),
              onTap: () => context.push('/profile/settings'),
            ),
            _SettingsTile(
              icon: Icons.help_outline,
              title: context.tr('profile.helpCenter'),
              onTap: () => context.push('/webview', extra: {
                'title': context.tr('profile.helpCenter'),
                'url': 'https://help.cryptohub.com',
              }),
            ),

            const SizedBox(height: 24),

            // Logout button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: Text(context.tr('profile.logout')),
                        content: Text(context.tr('profile.logoutConfirm')),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: Text(context.tr('common.cancel')),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              ref.read(authProvider.notifier).logout();
                              context.go('/login');
                            },
                            child: Text(
                              context.tr('profile.logout'),
                              style: const TextStyle(color: AppTheme.redDown),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                  icon: const Icon(Icons.logout, color: AppTheme.redDown),
                  label: Text(
                    context.tr('profile.logout'),
                    style: const TextStyle(color: AppTheme.redDown),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.redDown),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.textSecondary),
      title: Text(title),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 13,
              ),
            )
          : null,
      trailing: trailing ??
          const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
      onTap: onTap,
    );
  }
}
