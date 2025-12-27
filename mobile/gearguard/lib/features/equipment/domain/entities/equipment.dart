import 'package:equatable/equatable.dart';

class Equipment extends Equatable {
  final String id;
  final String name;
  final String serialNumber;
  final String department;
  final String? assignedEmployee; // Nullable if not assigned to a specific person
  final String location;
  final DateTime purchaseDate;
  final DateTime? warrantyExpirationDate;
  final String? notes;

  const Equipment({
    required this.id,
    required this.name,
    required this.serialNumber,
    required this.department,
    this.assignedEmployee,
    required this.location,
    required this.purchaseDate,
    this.warrantyExpirationDate,
    this.notes,
  });

  bool get isUnderWarranty {
    if (warrantyExpirationDate == null) return false;
    return warrantyExpirationDate!.isAfter(DateTime.now());
  }

  @override
  List<Object?> get props => [
        id,
        name,
        serialNumber,
        department,
        assignedEmployee,
        location,
        purchaseDate,
        warrantyExpirationDate,
        notes,
      ];
}
