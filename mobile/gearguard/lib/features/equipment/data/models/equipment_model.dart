import '../../domain/entities/equipment.dart';

class EquipmentModel extends Equipment {
  const EquipmentModel({
    required String id,
    required String name,
    required String serialNumber,
    required String department,
    String? assignedEmployee,
    required String location,
    required DateTime purchaseDate,
    DateTime? warrantyExpirationDate,
    String? notes,
  }) : super(
          id: id,
          name: name,
          serialNumber: serialNumber,
          department: department,
          assignedEmployee: assignedEmployee,
          location: location,
          purchaseDate: purchaseDate,
          warrantyExpirationDate: warrantyExpirationDate,
          notes: notes,
        );

  factory EquipmentModel.fromJson(Map<String, dynamic> json) {
    return EquipmentModel(
      id: json['id'],
      name: json['name'],
      serialNumber: json['serialNumber'],
      department: json['department'],
      assignedEmployee: json['assignedEmployee'],
      location: json['location'],
      purchaseDate: DateTime.parse(json['purchaseDate']),
      warrantyExpirationDate: json['warrantyExpirationDate'] != null
          ? DateTime.parse(json['warrantyExpirationDate'])
          : null,
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'serialNumber': serialNumber,
      'department': department,
      'assignedEmployee': assignedEmployee,
      'location': location,
      'purchaseDate': purchaseDate.toIso8601String(),
      'warrantyExpirationDate': warrantyExpirationDate?.toIso8601String(),
      'notes': notes,
    };
  }
}
