import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/di/service_locator.dart';
import '../bloc/equipment_bloc.dart';
import '../bloc/equipment_event.dart';
import '../bloc/equipment_state.dart';

class EquipmentDetailScreen extends StatelessWidget {
  final String id;

  const EquipmentDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<EquipmentBloc>()..add(LoadEquipmentDetail(id)),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Equipment Details'),
        ),
        body: BlocBuilder<EquipmentBloc, EquipmentState>(
          builder: (context, state) {
            if (state is EquipmentLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is EquipmentDetailLoaded) {
              final equipment = state.equipment;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Smart Button
                    Align(
                      alignment: Alignment.topRight,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: () {
                          // Navigate to Maintenance Requests list for this equipment
                        },
                        icon: const Icon(Icons.build),
                        label: Text('Maintenance (${state.requestCount})'),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text('Name: ${equipment.name}', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text('Serial Number: ${equipment.serialNumber}'),
                    const SizedBox(height: 8),
                    Text('Department: ${equipment.department}'),
                    const SizedBox(height: 8),
                    Text('Location: ${equipment.location}'),
                    const SizedBox(height: 8),
                    Text('Assigned To: ${equipment.assignedEmployee ?? "Unassigned"}'),
                    const SizedBox(height: 8),
                    Text(
                      'Warranty: ${equipment.isUnderWarranty ? "Active" : "Expired"}',
                      style: TextStyle(
                        color: equipment.isUnderWarranty ? Colors.green : Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (equipment.warrantyExpirationDate != null)
                      Text('Exports on: ${equipment.warrantyExpirationDate.toString().split(' ')[0]}'),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 16),
                     Text('Notes:', style: Theme.of(context).textTheme.titleMedium),
                    Text(equipment.notes ?? 'No notes available.'),
                  ],
                ),
              );
            } else if (state is EquipmentError) {
              return Center(child: Text(state.message));
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}
