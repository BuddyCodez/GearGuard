import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/add_equipment.dart';
import '../../domain/usecases/get_equipment_by_id.dart';
import '../../domain/usecases/get_equipment_list.dart';
import 'equipment_event.dart';
import 'equipment_state.dart';

class EquipmentBloc extends Bloc<EquipmentEvent, EquipmentState> {
  final GetEquipmentList getEquipmentList;
  final GetEquipmentById getEquipmentById;
  final AddEquipment addEquipment;

  EquipmentBloc({
    required this.getEquipmentList,
    required this.getEquipmentById,
    required this.addEquipment,
  }) : super(EquipmentInitial()) {
    on<LoadEquipmentList>(_onLoadEquipmentList);
    on<LoadEquipmentDetail>(_onLoadEquipmentDetail);
    on<AddEquipmentEvent>(_onAddEquipment);
  }

  Future<void> _onLoadEquipmentList(
    LoadEquipmentList event,
    Emitter<EquipmentState> emit,
  ) async {
    emit(EquipmentLoading());
    final result = await getEquipmentList();
    result.fold(
      (failure) => emit(const EquipmentError('Failed to load equipment list')),
      (list) => emit(EquipmentListLoaded(list)),
    );
  }

  Future<void> _onLoadEquipmentDetail(
    LoadEquipmentDetail event,
    Emitter<EquipmentState> emit,
  ) async {
    emit(EquipmentLoading());
    final result = await getEquipmentById(event.id);
    result.fold(
      (failure) => emit(const EquipmentError('Failed to load equipment details')),
      (equipment) => emit(EquipmentDetailLoaded(equipment)), 
    );
  }

  Future<void> _onAddEquipment(
    AddEquipmentEvent event,
    Emitter<EquipmentState> emit,
  ) async {
    emit(EquipmentLoading());
    final result = await addEquipment(event.equipment);
    result.fold(
      (failure) => emit(const EquipmentError('Failed to add equipment')),
      (_) {
        emit(const EquipmentOperationSuccess('Equipment added successfully'));
        add(LoadEquipmentList()); // Reload list
      },
    );
  }
}
