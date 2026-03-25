import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('系统设置')),
      body: const Center(
        child: Text('系统设置 – 开发中', style: TextStyle(color: Colors.white54)),
      ),
    );
  }
}
