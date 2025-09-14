# Application Security Tutorial

## Overview

Application security encompasses practices, processes, and tools to protect applications from threats throughout the software development lifecycle. This tutorial covers essential security concepts, common vulnerabilities, and defensive programming practices.

## OWASP Top 10 Security Risks

### 1. Injection Attacks

**SQL Injection Prevention**:

```javascript
// Vulnerable code
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// Secure code - Parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// Using ORM (Sequelize)
const user = await User.findOne({
  where: {
    id: userId
  }
});
```

**NoSQL Injection Prevention**:

```javascript
// Vulnerable code
const user = await User.findOne({
  username: req.body.username,
  password: req.body.password
});

// Secure code - Input validation
const { username, password } = req.body;

if (typeof username !== 'string' || typeof password !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}

const user = await User.findOne({
  username: username,
  password: await bcrypt.hash(password, 10)
});
```

**Command Injection Prevention**:

```python
# Vulnerable code
import os
filename = request.form['filename']
os.system(f"cat {filename}")

# Secure code - Input validation and sanitization
import subprocess
import re

filename = request.form['filename']

# Validate filename
if not re.match(r'^[a-zA-Z0-9._-]+$', filename):
    return "Invalid filename", 400

# Use subprocess with arguments list
try:
    result = subprocess.run(['cat', filename],
                          capture_output=True,
                          text=True,
                          check=True)
    return result.stdout
except subprocess.CalledProcessError:
    return "File not found", 404
```

### 2. Broken Authentication

**Secure Authentication Implementation**:

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Password hashing
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Secure login with rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
        issuer: 'myapp',
        audience: 'myapp-users'
      }
    );

    res.json({
      token,
      expiresIn: 3600,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Multi-Factor Authentication (MFA)**:

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate MFA secret
function generateMFASecret(username) {
  return speakeasy.generateSecret({
    name: `MyApp (${username})`,
    issuer: 'MyApp',
    length: 32
  });
}

// Setup MFA
app.post('/mfa/setup', authenticateToken, async (req, res) => {
  const user = await User.findById(req.userId);

  if (user.mfaEnabled) {
    return res.status(400).json({ error: 'MFA already enabled' });
  }

  const secret = generateMFASecret(user.username);

  // Store temporary secret
  await user.update({ tempMfaSecret: secret.base32 });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    secret: secret.base32,
    qrCode: qrCodeUrl
  });
});

// Verify MFA token
function verifyMFAToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step of time drift
  });
}
```

### 3. Sensitive Data Exposure

**Data Encryption**:

```javascript
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_KEY; // 32 bytes key
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('additional-data'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

**Secure Data Storage**:

```python
from cryptography.fernet import Fernet
import os
import base64

class SecureStorage:
    def __init__(self):
        # Generate or load encryption key
        key = os.environ.get('STORAGE_KEY')
        if not key:
            key = Fernet.generate_key()
            print(f"Generated key: {key.decode()}")
        else:
            key = key.encode()

        self.cipher = Fernet(key)

    def encrypt_data(self, data):
        """Encrypt sensitive data before storage"""
        if isinstance(data, str):
            data = data.encode()

        encrypted = self.cipher.encrypt(data)
        return base64.b64encode(encrypted).decode()

    def decrypt_data(self, encrypted_data):
        """Decrypt data after retrieval"""
        encrypted_bytes = base64.b64decode(encrypted_data.encode())
        decrypted = self.cipher.decrypt(encrypted_bytes)
        return decrypted.decode()

# Usage example
storage = SecureStorage()

# Encrypt before saving to database
user_ssn = storage.encrypt_data("123-45-6789")
user.encrypted_ssn = user_ssn
user.save()

# Decrypt after retrieval
decrypted_ssn = storage.decrypt_data(user.encrypted_ssn)
```

### 4. Cross-Site Scripting (XSS)

**XSS Prevention**:

```javascript
// Input sanitization
const DOMPurify = require('dom-purify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Sanitize HTML input
function sanitizeHTML(dirty) {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
}

// Output encoding
function escapeHTML(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };

  return str.replace(/[&<>"']/g, (m) => map[m]);
}

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://trusted-cdn.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.gstatic.com"
  );
  next();
});
```

**React XSS Prevention**:

```jsx
import DOMPurify from 'dompurify';

function UserComment({ comment }) {
  // React automatically escapes text content
  return (
    <div>
      <p>{comment.text}</p> {/* Safe - automatically escaped */}

      {/* Dangerous - allows HTML injection */}
      <div dangerouslySetInnerHTML={{__html: comment.html}} />

      {/* Safe - sanitized HTML */}
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(comment.html)
        }}
      />
    </div>
  );
}
```

### 5. Cross-Site Request Forgery (CSRF)

**CSRF Protection**:

```javascript
const csrf = require('csurf');

// Setup CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.use(csrfProtection);

// Provide CSRF token to client
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Protected route
app.post('/transfer-money', csrfProtection, (req, res) => {
  // CSRF token is automatically validated
  const { amount, recipient } = req.body;

  // Process money transfer
  transferMoney(req.user.id, recipient, amount);

  res.json({ success: true });
});
```

**SameSite Cookie Attribute**:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));
```

## Security Headers

**Comprehensive Security Headers**:

```javascript
const helmet = require('helmet');

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  // Prevent clickjacking
  frameguard: { action: 'deny' },

  // Prevent MIME sniffing
  noSniff: true,

  // XSS Protection
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: { policy: "same-origin" }
}));

// Additional custom headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

## Input Validation and Sanitization

**Comprehensive Input Validation**:

```javascript
const Joi = require('joi');
const validator = require('validator');

// Define validation schemas
const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .min(8)
    .required(),

  age: Joi.number()
    .integer()
    .min(18)
    .max(120)
    .required(),

  website: Joi.string()
    .uri()
    .optional()
});

// Validation middleware
function validateInput(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.validatedData = value;
    next();
  };
}

// File upload validation
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});
```

## Authentication and Authorization

**JWT Security Implementation**:

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTService {
  constructor() {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    this.accessTokenExpiry = '15m';
    this.refreshTokenExpiry = '7d';
  }

  generateTokenPair(payload) {
    const accessToken = jwt.sign(
      payload,
      this.accessTokenSecret,
      {
        expiresIn: this.accessTokenExpiry,
        issuer: 'myapp',
        audience: 'myapp-users'
      }
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'myapp',
        audience: 'myapp-users'
      }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'myapp',
        audience: 'myapp-users'
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'myapp',
        audience: 'myapp-users'
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

// Role-based authorization
function authorize(roles = []) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwtService.verifyAccessToken(token);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Usage
app.get('/admin/users', authorize(['admin']), (req, res) => {
  // Only admin users can access
});

app.get('/profile', authorize(['user', 'admin']), (req, res) => {
  // Both users and admins can access
});
```

## Secure Configuration Management

**Environment Configuration**:

```javascript
const dotenv = require('dotenv');
const Joi = require('joi');

// Load environment variables
dotenv.config();

// Validate environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  ENCRYPTION_KEY: Joi.string().length(32).required(),
  API_RATE_LIMIT: Joi.number().default(100),
  SESSION_SECRET: Joi.string().min(32).required()
}).unknown();

const { error, value: env } = envSchema.validate(process.env);

if (error) {
  console.error('Configuration error:', error.details);
  process.exit(1);
}

module.exports = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  database: {
    url: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production'
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.NODE_ENV === 'production' ? '15m' : '1h'
  },
  security: {
    encryptionKey: env.ENCRYPTION_KEY,
    rateLimitMax: env.API_RATE_LIMIT,
    sessionSecret: env.SESSION_SECRET
  }
};
```

## Security Testing

**Automated Security Testing**:

```javascript
// Security test with Jest
const request = require('supertest');
const app = require('../app');

describe('Security Tests', () => {
  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    const response = await request(app)
      .post('/login')
      .send({
        username: maliciousInput,
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });

  test('should set security headers', async () => {
    const response = await request(app).get('/');

    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });

  test('should enforce rate limiting', async () => {
    // Make multiple requests rapidly
    const promises = Array(10).fill().map(() =>
      request(app).post('/login').send({
        username: 'test',
        password: 'wrong'
      })
    );

    const responses = await Promise.all(promises);
    const rateLimited = responses.some(res => res.status === 429);

    expect(rateLimited).toBe(true);
  });

  test('should validate CSRF tokens', async () => {
    const response = await request(app)
      .post('/transfer-money')
      .send({
        amount: 1000,
        recipient: 'attacker'
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('CSRF');
  });
});
```

## Security Best Practices

### 1. Secure Development Lifecycle

- **Security by Design**: Consider security from the initial design phase
- **Threat Modeling**: Identify potential threats and attack vectors
- **Code Review**: Regular security-focused code reviews
- **Security Testing**: Automated and manual security testing

### 2. Dependency Management

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit-fix": "npm audit fix",
    "outdated": "npm outdated"
  },
  "dependencies": {
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.0.0",
    "bcrypt": "^5.0.0"
  }
}
```

### 3. Logging and Monitoring

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console()
  ]
});

// Security event logging
function logSecurityEvent(event, details) {
  logger.warn('Security Event', {
    event: event,
    details: details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
}

// Usage
app.use((req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') {
    logSecurityEvent('LOGIN_ATTEMPT', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      username: req.body.username
    });
  }
  next();
});
```

Application security requires a comprehensive approach combining secure coding practices, proper authentication, input validation, and continuous monitoring. Regular security assessments and staying updated with the latest threats are essential for maintaining a secure application.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
