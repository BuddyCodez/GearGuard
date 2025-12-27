# Mobile API Documentation for Flutter

## Base URL

**Development:** `http://localhost:3000`
**Production:** `https://your-domain.com`

---

## API Key Authentication

All mobile API endpoints require an API key to prevent unauthorized access.

**Header Required:**

```
X-API-Key: your-mobile-api-key-here
```

**Setup:**

1. Backend: Add `MOBILE_API_KEY` to `.env.local`
2. Flutter: Store API key securely (not in source code!)

**Example:**

```dart
final headers = {
  'Content-Type': 'application/json',
  'X-API-Key': 'your-mobile-api-key-here',
};
```

> [!WARNING]
> **Security:** Never commit the API key to your Flutter repository. Use environment variables or secure config management.

---

## Authentication Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint:** `POST /api/mobile/auth/signup`

**Headers:**

```
Content-Type: application/json
X-API-Key: your-mobile-api-key-here
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "kn79ymh38hpx7wks8hm6gz7b017y369n",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "teamId": null
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "Email, password, and name are required"
}
```

---

### 2. Login

Authenticate existing user.

**Endpoint:** `POST /api/mobile/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "kn79ymh38hpx7wks8hm6gz7b017y369n",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "technician",
    "teamId": "m177a3pt0qzhg3g1q8rn5b00097y34a2"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 3. Verify Token

Verify JWT token and get user data.

**Endpoint:** `GET /api/mobile/auth/verify`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "valid": true,
  "user": {
    "id": "kn79ymh38hpx7wks8hm6gz7b017y369n",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "technician",
    "teamId": "m177a3pt0qzhg3g1q8rn5b00097y34a2"
  }
}
```

**Error Response (401):**

```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

---

## Flutter Integration Example

### 1. Setup HTTP Client

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000'; // Change for production
  static const String apiKey = 'YOUR_MOBILE_API_KEY_HERE'; // Store securely!
  final storage = FlutterSecureStorage();

  // Sign Up
  Future<Map<String, dynamic>> signUp(String email, String password, String name) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/signup'),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
      }),
    );

    final data = jsonDecode(response.body);

    if (data['success']) {
      // Store token
      await storage.write(key: 'auth_token', value: data['token']);
    }

    return data;
  }

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/login'),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);

    if (data['success']) {
      // Store token
      await storage.write(key: 'auth_token', value: data['token']);
    }

    return data;
  }

  // Verify Token
  Future<Map<String, dynamic>> verifyToken() async {
    final token = await storage.read(key: 'auth_token');

    if (token == null) {
      return {'valid': false, 'error': 'No token found'};
    }

    final response = await http.get(
      Uri.parse('$baseUrl/api/mobile/auth/verify'),
      headers: {
        'Authorization': 'Bearer $token',
        'X-API-Key': apiKey,
      },
    );

    return jsonDecode(response.body);
  }

  // Logout
  Future<void> logout() async {
    await storage.delete(key: 'auth_token');
  }

  // Get Auth Headers (for authenticated requests)
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await storage.read(key: 'auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${token ?? ''}',
      'X-API-Key': apiKey,
    };
  }
}
```

### 2. Usage in Flutter

```dart
final apiService = ApiService();

// Sign Up
try {
  final result = await apiService.signUp(
    'user@example.com',
    'password123',
    'John Doe',
  );

  if (result['success']) {
    print('User created: ${result['user']['name']}');
    // Navigate to home screen
  } else {
    print('Error: ${result['error']}');
  }
} catch (e) {
  print('Network error: $e');
}

// Login
try {
  final result = await apiService.login(
    'user@example.com',
    'password123',
  );

  if (result['success']) {
    print('Logged in as: ${result['user']['name']}');
    print('Role: ${result['user']['role']}');
    // Navigate to home screen
  } else {
    print('Error: ${result['error']}');
  }
} catch (e) {
  print('Network error: $e');
}

// Verify Token (on app start)
final verification = await apiService.verifyToken();
if (verification['valid']) {
  // User is authenticated, go to home
} else {
  // User needs to login
}
```

---

## Security Notes

1. **HTTPS Only in Production:** Always use HTTPS in production
2. **Token Storage:** Use `flutter_secure_storage` to store tokens securely
3. **Token Expiration:** Tokens expire after 7 days
4. **Password Requirements:** Minimum 6 characters (can be increased)

---

## Environment Setup

Add to `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MOBILE_API_KEY=your-mobile-api-key-here
```

**Generate secure secrets:**

```bash
# JWT Secret
openssl rand -base64 32

# Mobile API Key
openssl rand -hex 32
```

---

## Testing with cURL

### Sign Up

```bash
curl -X POST http://localhost:3000/api/mobile/auth/signup \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-mobile-api-key-here" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-mobile-api-key-here" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Verify

```bash
curl -X GET http://localhost:3000/api/mobile/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-API-Key: your-mobile-api-key-here"
```
