# JWT Authentication Guide

## What is JWT?

**JWT (JSON Web Token)** is a secure, stateless way to transmit information between a client and server.

A JWT token is a digitally signed piece of data that contains:
1. **Header** - Token type and algorithm
2. **Payload** - Claims (user data)
3. **Signature** - Digital signature to verify authenticity

**Structure:** `header.payload.signature`

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## How It Works in Our System

### Step 1: User Logs In
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

### Step 2: Server Validates Credentials
In `AuthService.cs`:
```csharp
public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
{
    // 1. Find user by username
    var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username);
    
    // 2. Verify password (SHA256 hashing)
    if (!PasswordHelper.VerifyPassword(request.Password, user.Password))
        throw new UnauthorizedException("Invalid credentials");
    
    // 3. Generate JWT token
    var token = _jwtTokenService.GenerateToken(user);
    
    return new AuthResponseDto
    {
        Token = token,
        ExpiresAt = expirationTime
    };
}
```

### Step 3: Server Generates JWT Token
In `JwtTokenService.cs`:
```csharp
public string GenerateToken(User user)
{
    // 1. Create signing key from secret
    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_jwtSettings.Key)
    );
    var credentials = new SigningCredentials(
        key, SecurityAlgorithms.HmacSha256
    );

    // 2. Create claims (user data inside token)
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim("Role", user.Role.ToString())
    };

    // 3. Create token with expiration
    var token = new JwtSecurityToken(
        issuer: _jwtSettings.Issuer,           // "SmartInventoryAPI"
        audience: _jwtSettings.Audience,       // "SmartInventoryClients"
        claims: claims,                        // User data
        expires: DateTime.UtcNow.AddMinutes(60),  // 60-minute expiration
        signingCredentials: credentials        // Digital signature
    );

    // 4. Serialize to string
    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### Step 4: Client Receives Token
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userID": 1,
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluIiwiaWF0IjoxNjg3NzcyODAwLCJleHAiOjE2ODc3NzY0MDB9.xK_Z1234...",
    "role": 1,
    "expiresAt": "2026-07-07T17:45:00Z"
  },
  "statusCode": 200
}
```

### Step 5: Client Stores Token
Store in browser (localStorage, sessionStorage, or cookie):
```javascript
// JavaScript
localStorage.setItem('token', response.data.token);
```

### Step 6: Client Includes Token in Requests
Every subsequent request includes the token:
```bash
curl -X GET http://localhost:5000/api/items \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluIiwiaWF0IjoxNjg3NzcyODAwLCJleXAiOjE2ODc3NzY0MDB9.xK_Z1234..."
```

### Step 7: Server Validates Token
In `Program.cs`:
```csharp
.AddJwtBearer("Bearer", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // 1. Verify signature using the secret key
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        
        // 2. Verify issuer matches
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        
        // 3. Verify audience matches
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        
        // 4. Verify token hasn't expired
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero  // No grace period
    };
});
```

### Step 8: Extract User from Token
The `[Authorize]` attribute on controllers automatically:
1. Validates the token signature
2. Checks expiration
3. Extracts claims
4. Makes user info available to the action

Example controller:
```csharp
[Authorize]
[HttpGet]
public async Task<ActionResult> GetItems()
{
    // User info is automatically available from token claims
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var username = User.FindFirst(ClaimTypes.Name)?.Value;
    var role = User.FindFirst("Role")?.Value;
    
    // Use this info as needed
    var items = await _itemService.GetAllItemsAsync();
    return Ok(items);
}
```

---

## Token Structure Breakdown

### Decoded JWT Example:
```
HEADER (Algorithm & Type)
{
  "alg": "HS256",
  "typ": "JWT"
}

PAYLOAD (Claims - User Data)
{
  "sub": "1",                              // Subject (User ID)
  "name": "admin",                         // Username
  "email": "admin@example.com",            // Email
  "Role": "1",                             // Role
  "iat": 1687772800,                       // Issued at (timestamp)
  "exp": 1687776400,                       // Expiration (timestamp)
  "iss": "SmartInventoryAPI",              // Issuer
  "aud": "SmartInventoryClients"           // Audience
}

SIGNATURE (Digital Signature)
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

---

## Key Concepts

### 1. Claims
Information about the user stored inside the token:
```csharp
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, "1"),    // User ID
    new Claim(ClaimTypes.Name, "admin"),           // Username
    new Claim(ClaimTypes.Email, "admin@ex.com"),   // Email
    new Claim("Role", "1")                         // Custom claim
};
```

### 2. Secret Key
Used to sign and verify the token (from appsettings.json):
```json
"JwtSettings": {
  "Key": "your-super-secret-key-that-is-at-least-32-characters-long-here"
}
```

⚠️ **NEVER expose this key!** If compromised, anyone can forge tokens.

### 3. Token Expiration
Set in `JwtTokenService`:
```csharp
expires: DateTime.UtcNow.AddMinutes(60)  // Token expires in 60 minutes
```

After expiration, token is rejected even if signature is valid.

### 4. Issuer & Audience
Ensure token is from expected source:
```csharp
ValidIssuer = "SmartInventoryAPI"           // Who issued it
ValidAudience = "SmartInventoryClients"     // Who can use it
```

---

## Security Flow

### ✅ What Makes It Secure

1. **Digital Signature**
   - Token is cryptographically signed
   - Any tampering invalidates the signature
   - Server can detect forged tokens

2. **Secret Key**
   - Only server knows the secret
   - Only server can create valid tokens
   - Client cannot forge tokens

3. **Expiration**
   - Token expires after 60 minutes
   - Old tokens automatically rejected
   - Forces user to login periodically

4. **HTTPS (In Production)**
   - Token transmitted over encrypted channel
   - Cannot be intercepted over network

### Example: Token Tampering
If someone modifies the payload:
```
BEFORE: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.Jn5FVq1nVR6B8zKW...
                                              ^^^^^^^^^ payload modified ^^^^^^^^^^
AFTER:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIn0.WrongSignature...

Server rejects because signature doesn't match the modified payload!
```

---

## Complete Authentication Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /api/auth/login
       │    (username, password)
       ↓
┌─────────────────────────────────────┐
│   AuthService.LoginAsync()          │
│ • Find user by username             │
│ • Verify password (SHA256)          │
│ • Generate JWT token                │
└────────────────┬────────────────────┘
                 │ 2. Token generated
                 ↓
         ┌───────────────────┐
         │ JwtTokenService   │
         │ • Create claims   │
         │ • Sign with key   │
         │ • Set expiration  │
         └────────┬──────────┘
                  │ 3. Return token
                  ↓
┌──────────────────────────────────────┐
│   Client                             │
│ • Receive token                      │
│ • Store in localStorage              │
└────────┬─────────────────────────────┘
         │ 4. Include token in header
         │    Authorization: Bearer <token>
         ↓
┌─────────────────────────────────┐
│   Protected Endpoint            │
│   [Authorize]                   │
│   GET /api/items                │
└────────┬────────────────────────┘
         │ 5. Middleware validates token
         ↓
    ┌─────────────────────────────┐
    │ TokenValidationParameters   │
    │ • Verify signature          │
    │ • Check issuer              │
    │ • Check audience            │
    │ • Check expiration          │
    └────────┬────────────────────┘
             │ ✅ Valid or ❌ Invalid
             ↓
         ┌───────────────────┐
         │ Extract Claims    │
         │ • User ID         │
         │ • Username        │
         │ • Email           │
         │ • Role            │
         └────────┬──────────┘
                  │ 6. User available in controller
                  ↓
         ┌──────────────────────┐
         │ Execute Action       │
         │ Return Protected Data│
         └──────────────────────┘
```

---

## Implementation in Our System

### appsettings.json Configuration
```json
{
  "JwtSettings": {
    "Key": "your-super-secret-key-that-is-at-least-32-characters-long-here",
    "Issuer": "SmartInventoryAPI",
    "Audience": "SmartInventoryClients",
    "ExpirationMinutes": 60
  }
}
```

### Program.cs Setup
```csharp
// 1. Add authentication service
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddJwtBearer("Bearer", options =>
{
    // Configuration here
});

// 2. Add authorization service
builder.Services.AddAuthorization();

// 3. In middleware pipeline
app.UseAuthentication();  // Validate token
app.UseAuthorization();   // Check permissions
```

### Controller Usage
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]  // ← Requires valid token
public class ItemsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetItems()
    {
        // Token automatically validated
        // User claims available via User object
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(await _itemService.GetAllItemsAsync());
    }

    [AllowAnonymous]  // ← Override authorization (e.g., login endpoint)
    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequestDto request)
    {
        // No token required
    }
}
```

---

## Token Lifecycle

### Timeline
```
0 min    → User logs in
         → Server generates token (valid for 60 min)
         → Client receives: "expiresAt": "2026-07-07T17:45:00Z"

1-59 min → Client includes token in requests
         → Server validates and grants access

60 min   → Token expires
         → Server rejects token with 401 Unauthorized
         → Client must login again to get new token

After   → No token or invalid token
         → 401 Unauthorized response
         → Redirect to login
```

---

## Common Scenarios

### Scenario 1: Valid Token - Access Granted ✅
```
Client sends: Authorization: Bearer eyJhbGciOiJ...
Server checks:
  ✓ Signature valid (matches secret key)
  ✓ Issuer matches
  ✓ Audience matches
  ✓ Not expired
Result: 200 OK - Access granted
```

### Scenario 2: Expired Token - Access Denied ❌
```
Client sends: Authorization: Bearer eyJhbGciOiJ...
Server checks:
  ✓ Signature valid
  ✓ Issuer matches
  ✓ Audience matches
  ✗ Expired (exp: 2026-07-07T16:45:00Z, now: 2026-07-07T18:00:00Z)
Result: 401 Unauthorized - User must login again
```

### Scenario 3: Tampered Token - Access Denied ❌
```
Client sends: Authorization: Bearer eyJhbGciOiJ...(MODIFIED)...
Server checks:
  ✗ Signature invalid (doesn't match modified payload)
Result: 401 Unauthorized - Token rejected
```

### Scenario 4: No Token - Access Denied ❌
```
Client sends: GET /api/items (no Authorization header)
Server checks:
  ✗ No token present
Result: 401 Unauthorized - Login required
```

---

## Best Practices

### ✅ DO:
- ✅ Keep secret key **secure and secret**
- ✅ Use HTTPS in production (encrypt token in transit)
- ✅ Set reasonable expiration (60 minutes is good)
- ✅ Include relevant claims (user ID, email, role)
- ✅ Validate ALL token parameters
- ✅ Log failed authentication attempts
- ✅ Rotate secret key periodically

### ❌ DON'T:
- ❌ Expose secret key in code/config files
- ❌ Store sensitive data in token (visible to client)
- ❌ Use weak secret keys (< 32 characters)
- ❌ Skip token expiration checks
- ❌ Trust malformed tokens
- ❌ Transmit token in URL (use header)
- ❌ Send token over HTTP (always use HTTPS)

---

## Testing JWT in Your System

### 1. Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | jq '.data.token'
```

### 2. Use Token in Request
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/items \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Decode Token (jwt.io)
Visit https://jwt.io and paste your token to see:
- Header
- Payload (claims)
- Signature verification

### 4. Test With Expired Token
- Wait for token to expire (after 60 minutes)
- Try same request
- Should get 401 Unauthorized

---

## Summary

| Aspect | Details |
|--------|---------|
| **Purpose** | Stateless authentication without storing sessions |
| **Structure** | Header.Payload.Signature |
| **Storage** | Browser (localStorage/sessionStorage) or HTTP-only cookie |
| **Transmission** | `Authorization: Bearer <token>` header |
| **Expiration** | 60 minutes (configurable) |
| **Security** | Digital signature + secret key |
| **Validation** | Server validates signature, expiration, issuer, audience |
| **Use Case** | Perfect for REST APIs and stateless applications |

---

## Key Takeaway

**JWT = Secure, Self-contained Token**

The token itself contains all user information needed, signed by the server. The server doesn't need to store anything - just validate the signature. This makes it perfect for REST APIs and distributed systems!

