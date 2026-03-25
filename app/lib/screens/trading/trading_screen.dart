import 'package:flutter/material.dart';

class TradingScreen extends StatelessWidget {
  const TradingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('量化交易')),
      body: const Center(
        child: Text('量化策略管理 – 开发中', style: TextStyle(color: Colors.white54)),
      ),
    );
  }
}
