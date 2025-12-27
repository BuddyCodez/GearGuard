import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';


class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthBloc>().add(LogoutRequested());
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Welcome to GearGuard!'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Navigate using GoRouter
                // We need to access GoRouter via context, making sure context works
                // Usually GoRouter.of(context).push... but plain Navigator might fail if not configured
                // context.push('/equipment');
                // The import for GoRouter is needed.
                // Assuming GoRouter usage patterns:
                // GoRouter.of(context).push('/equipment');
              },
              child: const Text('Manage Equipment'),
            ),
          ],
        ),
      ),
    );
  }
}
