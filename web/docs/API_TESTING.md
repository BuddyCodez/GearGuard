# Mobile API Testing Guide

## 1. Environment Setup

Add these to your `.env.local`:

```bash
JWT_SECRET=YPYYwe2H0rVbs/gXFp8/5bqNpnkX4uD171jUVC19qUQ=
MOBILE_API_KEY=3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c
```

## 2. Test API Endpoints with cURL

### Test 1: Signup (Will redirect to web)

```bash
curl -X POST http://localhost:3000/api/mobile/auth/signup \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Please sign up via the web app first..."
}
```

---

### Test 2: Login (with existing user)

First, create a user via the web app, then:

```bash
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c" \
  -d '{"email":"udit@gmail.com","password":"your-password"}'
```

**Expected Success Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "udit@gmail.com",
    "name": "Uv",
    "role": "technician",
    "teamId": "..."
  }
}
```

**Save the token** for the next test!

---

### Test 3: Verify Token

```bash
curl -X GET http://localhost:3000/api/mobile/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-API-Key: 3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c"
```

**Expected Response:**

```json
{
  "valid": true,
  "user": {
    "id": "...",
    "email": "udit@gmail.com",
    "name": "Uv",
    "role": "technician"
  }
}
```

---

### Test 4: Missing API Key (Should Fail)

```bash
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Unauthorized: Invalid API key"
}
```

---

### Test 5: Invalid Credentials

```bash
curl -X POST http://localhost:3000/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c" \
  -d '{"email":"wrong@example.com","password":"wrongpassword"}'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Invalid credentials..."
}
```

---

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_KEY="3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c"
BASE_URL="http://localhost:3000"

echo "=== Testing Mobile API Endpoints ==="
echo ""

echo "1. Testing Signup (should redirect to web)..."
curl -X POST $BASE_URL/api/mobile/auth/signup \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}' \
  | jq '.'

echo ""
echo "2. Testing Login (use your actual credentials)..."
read -p "Enter email: " EMAIL
read -sp "Enter password: " PASSWORD
echo ""

RESPONSE=$(curl -s -X POST $BASE_URL/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo $RESPONSE | jq '.'

TOKEN=$(echo $RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ]; then
  echo ""
  echo "3. Testing Token Verification..."
  curl -X GET $BASE_URL/api/mobile/auth/verify \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-API-Key: $API_KEY" \
    | jq '.'
fi
```

Make it executable:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Troubleshooting

### "Cannot connect"

- Make sure Next.js dev server is running: `bun dev`
- Check port 3000 is available

### "Invalid API key"

- Verify `MOBILE_API_KEY` in `.env.local` matches the header
- Restart Next.js server after adding env vars

### "User not found"

- Sign up via web app first at `http://localhost:3000`
- Then use those credentials for mobile login

---

## For Flutter Testing

Once curl tests pass, use these credentials in your Flutter app:

```dart
const apiKey = '3cf09465dd38bef7ac74740b87205a3f4fa1d6e14b5702bb379de069ea55418c';
```
