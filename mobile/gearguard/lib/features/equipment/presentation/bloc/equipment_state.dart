import 'package:equatable/equatable.dart';
import '../../domain/entities/equipment.dart';

abstract class EquipmentState extends Equatable {
  const EquipmentState();
  
  @override
  List<Object?> get props => [];
}

class EquipmentInitial extends EquipmentState {}

class EquipmentLoading extends EquipmentState {}

class EquipmentListLoaded extends EquipmentState {
  final List<Equipment> equipmentList;

  const EquipmentListLoaded(this.equipmentList);

  @override
  List<Object> get props => [equipmentList];
}

class EquipmentDetailLoaded extends EquipmentState {
  final Equipment equipment;
  
  // Later we will add smart button count here
  final int requestCount; 

  const EquipmentDetailLoaded(this.equipment, {this.requestCount = 0});

  @override
  List<Object> get props => [equipment, requestCount];
}

class EquipmentOperationSuccess extends EquipmentState {
  final String message;

  const EquipmentOperationSuccess(this.message);

   @override
  List<Object> get props => [message];
}

class EquipmentError extends EquipmentState {
  final String message;

  const EquipmentError(this.message);

  @override
  List<Object> get props => [message];
}
