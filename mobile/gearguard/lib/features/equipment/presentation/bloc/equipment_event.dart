import 'package:equatable/equatable.dart';
import '../../domain/entities/equipment.dart';

abstract class EquipmentEvent extends Equatable {
  const EquipmentEvent();

  @override
  List<Object?> get props => [];
}

class LoadEquipmentList extends EquipmentEvent {}

class LoadEquipmentDetail extends EquipmentEvent {
  final String id;
  const LoadEquipmentDetail(this.id);

  @override
  List<Object> get props => [id];
}

class AddEquipmentEvent extends EquipmentEvent {
  final Equipment equipment;
  const AddEquipmentEvent(this.equipment);

  @override
  List<Object> get props => [equipment];
}

class UpdateEquipmentEvent extends EquipmentEvent {
  final Equipment equipment;
  const UpdateEquipmentEvent(this.equipment);

  @override
  List<Object> get props => [equipment];
}
