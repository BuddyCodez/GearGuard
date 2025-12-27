import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/equipment.dart';
import '../repositories/equipment_repository.dart';

class GetEquipmentById {
  final EquipmentRepository repository;

  GetEquipmentById(this.repository);

  Future<Either<Failure, Equipment>> call(String id) async {
    return await repository.getEquipmentById(id);
  }
}
