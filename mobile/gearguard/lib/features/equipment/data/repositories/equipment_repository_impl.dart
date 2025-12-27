import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/equipment.dart';
import '../../domain/repositories/equipment_repository.dart';
import '../datasources/equipment_local_data_source.dart';
import '../models/equipment_model.dart';

class EquipmentRepositoryImpl implements EquipmentRepository {
  final EquipmentLocalDataSource localDataSource;

  EquipmentRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<Equipment>>> getEquipmentList() async {
    try {
      final result = await localDataSource.getEquipmentList();
      return Right(result);
    } catch (e) {
      return Left(CacheFailure());
    }
  }

  @override
  Future<Either<Failure, Equipment>> getEquipmentById(String id) async {
    try {
      final result = await localDataSource.getEquipmentById(id);
      return Right(result);
    } catch (e) {
      return Left(CacheFailure());
    }
  }

  @override
  Future<Either<Failure, void>> addEquipment(Equipment equipment) async {
    try {
      final equipmentModel = EquipmentModel(
        id: equipment.id,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        department: equipment.department,
        assignedEmployee: equipment.assignedEmployee,
        location: equipment.location,
        purchaseDate: equipment.purchaseDate,
        warrantyExpirationDate: equipment.warrantyExpirationDate,
        notes: equipment.notes,
      );
      await localDataSource.addEquipment(equipmentModel);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure());
    }
  }

  @override
  Future<Either<Failure, void>> updateEquipment(Equipment equipment) async {
    try {
       final equipmentModel = EquipmentModel(
        id: equipment.id,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        department: equipment.department,
        assignedEmployee: equipment.assignedEmployee,
        location: equipment.location,
        purchaseDate: equipment.purchaseDate,
        warrantyExpirationDate: equipment.warrantyExpirationDate,
        notes: equipment.notes,
      );
      await localDataSource.updateEquipment(equipmentModel);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure());
    }
  }

  @override
  Future<Either<Failure, void>> deleteEquipment(String id) async {
    try {
      await localDataSource.deleteEquipment(id);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure());
    }
  }
}
