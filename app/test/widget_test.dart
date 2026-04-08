import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cryptohub/app.dart';

void main() {
  testWidgets('CryptoHubApp renders without crashing', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: CryptoHubApp(),
      ),
    );

    // The app should render and show CryptoHub text on splash
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('CryptoHub'), findsOneWidget);
  });

  test('Placeholder test passes', () {
    expect(1 + 1, equals(2));
  });
}
