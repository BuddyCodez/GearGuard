import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/service_locator.dart';
import '../bloc/equipment_bloc.dart';
import '../bloc/equipment_event.dart';
import '../bloc/equipment_state.dart';

class EquipmentListScreen extends StatelessWidget {
  const EquipmentListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<EquipmentBloc>()..add(LoadEquipmentList()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Equipment'),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
             // context.push('/equipment/add'); // To be implemented
          },
          child: const Icon(Icons.add),
        ),
        body: BlocBuilder<EquipmentBloc, EquipmentState>(
          builder: (context, state) {
            if (state is EquipmentLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is EquipmentListLoaded) {
              if (state.equipmentList.isEmpty) {
                return const Center(child: Text('No equipment found.'));
              }
              return ListView.builder(
                itemCount: state.equipmentList.length,
                itemBuilder: (context, index) {
                  final equipment = state.equipmentList[index];
                  return ListTile(
                    title: Text(equipment.name),
                    subtitle: Text('${equipment.serialNumber} - ${equipment.location}'),
                    onTap: () {
                      context.push('/equipment/${equipment.id}');
                    },
                  );
                },
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
