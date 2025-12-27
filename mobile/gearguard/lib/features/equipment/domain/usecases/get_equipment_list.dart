import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/equipment.dart';
import '../repositories/equipment_repository.dart';

class GetEquipmentList {
  final EquipmentRepository repository;

  GetEquipmentList(this.repository);

  Future<Either<Failure, List<Equipment>>> call() async {
    return await repository.getEquipmentList();
  }
}
