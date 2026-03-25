import 'package:flutter/material.dart';

class MarketScreen extends StatelessWidget {
  const MarketScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('市场分析')),
      body: const Center(
        child: Text('市场深度分析 – 开发中', style: TextStyle(color: Colors.white54)),
      ),
    );
  }
}
