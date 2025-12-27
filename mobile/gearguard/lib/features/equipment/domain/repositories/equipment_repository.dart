import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/equipment.dart';


abstract class EquipmentRepository {
  Future<Either<Failure, List<Equipment>>> getEquipmentList();
  Future<Either<Failure, Equipment>> getEquipmentById(String id);
  Future<Either<Failure, void>> addEquipment(Equipment equipment);
  Future<Either<Failure, void>> updateEquipment(Equipment equipment);
  Future<Either<Failure, void>> deleteEquipment(String id);
}
