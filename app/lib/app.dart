import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'config/routes.dart';
import 'config/theme.dart';
import 'providers/theme_provider.dart';
import 'i18n/locale_provider.dart';
import 'i18n/translations.dart';

class CryptoHubApp extends ConsumerWidget {
  const CryptoHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'CryptoHub',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      locale: locale,
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('zh', 'CN'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
      builder: (context, child) {
        return _TranslationsScope(
          locale: locale,
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}

class _TranslationsScope extends InheritedWidget {
  final Locale locale;

  const _TranslationsScope({
    required this.locale,
    required super.child,
  });

  @override
  bool updateShouldNotify(_TranslationsScope oldWidget) {
    return locale != oldWidget.locale;
  }
}

extension TranslationsExtension on BuildContext {
  String tr(String key) {
    final locale = Localizations.localeOf(this);
    final langKey = '${locale.languageCode}-${locale.countryCode}';
    return Translations.get(langKey, key);
  }
}
