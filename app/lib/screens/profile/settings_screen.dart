import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app.dart';
import '../../config/theme.dart';
import '../../providers/theme_provider.dart';
import '../../i18n/locale_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('nav.settings')),
      ),
      body: ListView(
        children: [
          // Language section
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              context.tr('profile.language'),
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          RadioListTile<String>(
            title: const Text('中文 (简体)'),
            value: 'zh',
            groupValue: locale.languageCode,
            activeColor: AppTheme.gold,
            onChanged: (_) {
              ref
                  .read(localeProvider.notifier)
                  .setLocale(const Locale('zh', 'CN'));
            },
          ),
          RadioListTile<String>(
            title: const Text('English'),
            value: 'en',
            groupValue: locale.languageCode,
            activeColor: AppTheme.gold,
            onChanged: (_) {
              ref
                  .read(localeProvider.notifier)
                  .setLocale(const Locale('en', 'US'));
            },
          ),

          const Divider(),

          // Theme section
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              context.tr('profile.theme'),
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          RadioListTile<ThemeMode>(
            title: Text(context.tr('profile.darkMode')),
            secondary: const Icon(Icons.dark_mode),
            value: ThemeMode.dark,
            groupValue: themeMode,
            activeColor: AppTheme.gold,
            onChanged: (mode) {
              if (mode != null) {
                ref.read(themeModeProvider.notifier).setThemeMode(mode);
              }
            },
          ),
          RadioListTile<ThemeMode>(
            title: Text(context.tr('profile.lightMode')),
            secondary: const Icon(Icons.light_mode),
            value: ThemeMode.light,
            groupValue: themeMode,
            activeColor: AppTheme.gold,
            onChanged: (mode) {
              if (mode != null) {
                ref.read(themeModeProvider.notifier).setThemeMode(mode);
              }
            },
          ),
          RadioListTile<ThemeMode>(
            title: Text(context.tr('profile.autoMode')),
            secondary: const Icon(Icons.brightness_auto),
            value: ThemeMode.system,
            groupValue: themeMode,
            activeColor: AppTheme.gold,
            onChanged: (mode) {
              if (mode != null) {
                ref.read(themeModeProvider.notifier).setThemeMode(mode);
              }
            },
          ),

          const Divider(),

          // About
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              context.tr('profile.about'),
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.gold,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.currency_bitcoin,
                color: AppTheme.darkBg,
              ),
            ),
            title: const Text('CryptoHub'),
            subtitle: Text('${context.tr('profile.version')} 1.0.0'),
          ),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              '© 2024 CryptoHub. All rights reserved.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
