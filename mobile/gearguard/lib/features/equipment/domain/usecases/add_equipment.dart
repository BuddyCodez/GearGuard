import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/equipment.dart';
import '../repositories/equipment_repository.dart';

class AddEquipment {
  final EquipmentRepository repository;

  AddEquipment(this.repository);

  Future<Either<Failure, void>> call(Equipment equipment) async {
    return await repository.addEquipment(equipment);
  }
}
