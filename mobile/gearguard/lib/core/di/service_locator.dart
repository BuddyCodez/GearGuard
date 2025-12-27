import 'package:get_it/get_it.dart';
import 'package:http/http.dart' as http;
import 'auth_di.dart';
import 'equipment_di.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External
  sl.registerLazySingleton(() => http.Client());

  // Features
  await initAuth();
  await initEquipment();
}
