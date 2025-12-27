import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final List<dynamic> properties;
  const Failure([this.properties = const <dynamic>[]]);

  @override
  List<Object?> get props => properties;
}

// General Failures
class ServerFailure extends Failure {}

class CacheFailure extends Failure {}

class NetworkFailure extends Failure {}
