import 'package:get_it/get_it.dart';
import '../../features/equipment/data/datasources/equipment_local_data_source.dart';
import '../../features/equipment/data/repositories/equipment_repository_impl.dart';
import '../../features/equipment/domain/repositories/equipment_repository.dart';
import '../../features/equipment/domain/usecases/add_equipment.dart';
import '../../features/equipment/domain/usecases/get_equipment_by_id.dart';
import '../../features/equipment/domain/usecases/get_equipment_list.dart';
import '../../features/equipment/presentation/bloc/equipment_bloc.dart';

Future<void> initEquipment() async {
  final sl = GetIt.instance;

  // Bloc
  sl.registerFactory(
    () => EquipmentBloc(
      getEquipmentList: sl(),
      getEquipmentById: sl(),
      addEquipment: sl(),
    ),
  );

  // Use Cases
  sl.registerLazySingleton(() => GetEquipmentList(sl()));
  sl.registerLazySingleton(() => GetEquipmentById(sl()));
  sl.registerLazySingleton(() => AddEquipment(sl()));

  // Repository
  sl.registerLazySingleton<EquipmentRepository>(
    () => EquipmentRepositoryImpl(localDataSource: sl()),
  );

  // Data Sources
  sl.registerLazySingleton<EquipmentLocalDataSource>(
    () => EquipmentLocalDataSourceImpl(),
  );
}
