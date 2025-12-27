import '../models/equipment_model.dart';

abstract class EquipmentLocalDataSource {
  Future<List<EquipmentModel>> getEquipmentList();
  Future<EquipmentModel> getEquipmentById(String id);
  Future<void> addEquipment(EquipmentModel equipment);
  Future<void> updateEquipment(EquipmentModel equipment);
  Future<void> deleteEquipment(String id);
}

class EquipmentLocalDataSourceImpl implements EquipmentLocalDataSource {
  final List<EquipmentModel> _mockStorage = [
    EquipmentModel(
      id: '1',
      name: 'CNC Machine 01',
      serialNumber: 'CNC-2023-001',
      department: 'Production',
      location: 'Factory Floor A',
      purchaseDate: DateTime(2023, 1, 15),
      warrantyExpirationDate: DateTime(2025, 1, 15),
      notes: 'Main production unit',
    ),
    EquipmentModel(
      id: '2',
      name: 'Office Printer',
      serialNumber: 'PRT-HP-X99',
      department: 'HR',
      assignedEmployee: 'Jane Doe',
      location: 'Building B, 2nd Floor',
      purchaseDate: DateTime(2024, 5, 20),
      warrantyExpirationDate: DateTime(2025, 5, 20),
    ),
    EquipmentModel(
      id: '3',
      name: 'Forklift XZ',
      serialNumber: 'FL-5500',
      department: 'Logistics',
      location: 'Warehouse',
      purchaseDate: DateTime(2022, 8, 10),
      warrantyExpirationDate: DateTime(2023, 8, 10), // Expired
    ),
  ];

  @override
  Future<List<EquipmentModel>> getEquipmentList() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    return _mockStorage;
  }

  @override
  Future<EquipmentModel> getEquipmentById(String id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    return _mockStorage.firstWhere((element) => element.id == id);
  }

  @override
  Future<void> addEquipment(EquipmentModel equipment) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _mockStorage.add(equipment);
  }

  @override
  Future<void> updateEquipment(EquipmentModel equipment) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _mockStorage.indexWhere((element) => element.id == equipment.id);
    if (index != -1) {
      _mockStorage[index] = equipment;
    }
  }

  @override
  Future<void> deleteEquipment(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _mockStorage.removeWhere((element) => element.id == id);
  }
}
