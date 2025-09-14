# OWASP Top 10 Security Vulnerabilities Tutorial

## Overview

The OWASP (Open Web Application Security Project) Top 10 is a standard awareness document representing the most critical web application security risks. This tutorial provides detailed explanations, examples, and mitigation strategies for each vulnerability.

## OWASP Top 10 2021

### A01:2021 – Broken Access Control

**Risk**: Unauthorized access to functionality and/or data

**Common Vulnerabilities**:
- Bypassing access control through URL manipulation
- Privilege escalation
- Viewing or editing someone else's account
- Missing access controls for POST, PUT, DELETE

**Vulnerable Code Example**:

```javascript
// Insecure Direct Object Reference
app.get('/user/:id/profile', (req, res) => {
  const userId = req.params.id;
  // No authorization check!
  const user = getUserById(userId);
  res.json(user);
});

// Privilege escalation vulnerability
app.post('/admin/delete-user', (req, res) => {
  // Only checks if user is logged in, not if they're admin
  if (req.user) {
    deleteUser(req.body.userId);
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

**Secure Implementation**:

```javascript
// Proper access control
const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && requiredRole !== 'any') {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    next();
  };
};

// Resource ownership check
const checkOwnership = async (req, res, next) => {
  const resourceId = req.params.id;
  const resource = await getResourceById(resourceId);

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (resource.ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  req.resource = resource;
  next();
};

// Secure routes
app.get('/user/:id/profile', authenticate, checkOwnership, (req, res) => {
  res.json(req.resource);
});

app.post('/admin/delete-user', authenticate, authorize('admin'), (req, res) => {
  deleteUser(req.body.userId);
  res.json({ success: true });
});
```

### A02:2021 – Cryptographic Failures

**Risk**: Exposing sensitive data due to cryptographic failures

**Common Issues**:
- Data transmitted in clear text
- Old or weak cryptographic algorithms
- Weak random number generation
- Misusing cryptography

**Vulnerable Practices**:

```javascript
// Weak password hashing
const crypto = require('crypto');

// BAD: Using MD5
const weakHash = crypto.createHash('md5').update(password).digest('hex');

// BAD: Using SHA1 without salt
const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');

// BAD: Custom encryption
function customEncrypt(text, key) {
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return encrypted;
}
```

**Secure Cryptographic Implementation**:

```javascript
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Secure password hashing
class PasswordService {
  static async hash(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verify(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// AES-256-GCM encryption
class EncryptionService {
  constructor(key) {
    this.key = key || crypto.randomBytes(32);
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('authenticated-data'));

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      ciphertext: ciphertext,
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('authenticated-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let plaintext = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }
}

// TLS/HTTPS configuration
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  // Enforce strong TLS configuration
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_2_method'
};

https.createServer(options, app).listen(443);
```

### A03:2021 – Injection

**Risk**: Untrusted data sent to an interpreter as part of a command or query

**SQL Injection Example**:

```python
# Vulnerable code
import sqlite3

def get_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # DANGEROUS: String concatenation
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    cursor.execute(query)

    return cursor.fetchone()

# Attack payload: username = "admin'--", password = "anything"
# Resulting query: SELECT * FROM users WHERE username='admin'--' AND password='anything'
```

**Secure SQL Implementation**:

```python
import sqlite3
from typing import Optional, Dict, Any

class UserService:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_user(self, username: str, password_hash: str) -> Optional[Dict[Any, Any]]:
        """Secure user retrieval using parameterized queries"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()

        try:
            # Use parameterized query to prevent SQL injection
            query = "SELECT id, username, email, role FROM users WHERE username = ? AND password_hash = ?"
            cursor.execute(query, (username, password_hash))

            row = cursor.fetchone()
            return dict(row) if row else None

        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return None
        finally:
            conn.close()

    def create_user(self, user_data: Dict[str, Any]) -> bool:
        """Secure user creation with input validation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            query = """
                INSERT INTO users (username, email, password_hash, role)
                VALUES (?, ?, ?, ?)
            """
            cursor.execute(query, (
                user_data['username'],
                user_data['email'],
                user_data['password_hash'],
                user_data.get('role', 'user')
            ))

            conn.commit()
            return True

        except sqlite3.IntegrityError:
            print("User already exists")
            return False
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False
        finally:
            conn.close()
```

**NoSQL Injection Prevention**:

```javascript
// MongoDB injection vulnerability
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: Direct object injection
  const user = await User.findOne({
    username: username,
    password: password
  });

  // Attack payload: {"username": {"$ne": ""}, "password": {"$ne": ""}}
  // This would match any user where username and password are not empty
});

// Secure implementation
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required()
});

app.post('/login', async (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { username, password } = value;

  try {
    // Type checking to prevent object injection
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const user = await User.findOne({ username: username });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);
    res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### A04:2021 – Insecure Design

**Risk**: Missing or ineffective control design

**Example: Insecure Password Recovery**:

```javascript
// INSECURE: Predictable reset tokens
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: 'Reset email sent if account exists' });
  }

  // BAD: Predictable token
  const resetToken = user.id + '_' + Date.now();

  await user.update({ resetToken });

  // Send email with reset link
  await sendResetEmail(email, resetToken);

  res.json({ message: 'Reset email sent if account exists' });
});
```

**Secure Design Implementation**:

```javascript
const crypto = require('crypto');

class PasswordResetService {
  constructor() {
    this.resetTokens = new Map(); // In production, use Redis
  }

  async initiateReset(email) {
    const user = await User.findOne({ email });

    // Always return the same response to prevent user enumeration
    const response = { message: 'Reset email sent if account exists' };

    if (!user) {
      // Simulate processing time to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return response;
    }

    // Generate cryptographically secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token with expiration
    this.resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expiresAt,
      attempts: 0
    });

    // Send secure reset email
    await this.sendResetEmail(email, resetToken);

    return response;
  }

  async validateResetToken(token) {
    const tokenData = this.resetTokens.get(token);

    if (!tokenData) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > tokenData.expiresAt) {
      this.resetTokens.delete(token);
      throw new Error('Reset token has expired');
    }

    // Implement rate limiting for token validation
    tokenData.attempts += 1;
    if (tokenData.attempts > 3) {
      this.resetTokens.delete(token);
      throw new Error('Too many attempts');
    }

    return tokenData;
  }

  async resetPassword(token, newPassword) {
    const tokenData = await this.validateResetToken(token);

    // Validate password strength
    if (!this.isPasswordStrong(newPassword)) {
      throw new Error('Password does not meet security requirements');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password
    await User.updateOne(
      { id: tokenData.userId },
      {
        passwordHash,
        passwordResetAt: new Date(),
        // Invalidate all existing sessions
        sessionVersion: crypto.randomBytes(16).toString('hex')
      }
    );

    // Clean up used token
    this.resetTokens.delete(token);

    // Log security event
    this.logSecurityEvent('PASSWORD_RESET', {
      userId: tokenData.userId,
      email: tokenData.email
    });
  }

  isPasswordStrong(password) {
    const requirements = [
      password.length >= 12,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];

    return requirements.every(req => req);
  }
}
```

### A05:2021 – Security Misconfiguration

**Risk**: Improperly configured security settings

**Common Misconfigurations**:

```javascript
// BAD: Debug mode in production
if (process.env.NODE_ENV === 'production') {
  app.set('debug', true); // Should be false!
}

// BAD: Default credentials
const defaultConfig = {
  adminUsername: 'admin',
  adminPassword: 'admin123' // Never use defaults!
};

// BAD: Overly permissive CORS
app.use(cors({
  origin: '*', // Allows any origin
  credentials: true // Dangerous with wildcard origin
}));

// BAD: Exposing sensitive information
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack // Exposes stack trace in production
  });
});
```

**Secure Configuration**:

```javascript
const config = require('./config');

// Environment-specific configuration
const secureConfig = {
  development: {
    debug: true,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    logging: 'verbose'
  },

  production: {
    debug: false,
    cors: {
      origin: ['https://myapp.com', 'https://www.myapp.com'],
      credentials: true,
      optionsSuccessStatus: 200
    },
    logging: 'error',
    helmet: {
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  }
};

const currentConfig = secureConfig[process.env.NODE_ENV] || secureConfig.production;

// Apply security middleware
app.use(helmet(currentConfig.helmet));
app.use(cors(currentConfig.cors));

// Secure error handling
app.use((err, req, res, next) => {
  // Log full error details
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Return generic error in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Security headers middleware
app.use((req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
});
```

### A06:2021 – Vulnerable and Outdated Components

**Risk**: Using components with known vulnerabilities

**Vulnerable Dependencies Management**:

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit-fix": "npm audit fix",
    "outdated": "npm outdated",
    "security-check": "npm audit --audit-level moderate"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  }
}
```

**Automated Security Scanning**:

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  security-audit:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run security audit
      run: |
        npm audit --audit-level moderate
        npx audit-ci --moderate

    - name: Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=medium

    - name: Upload Snyk results
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: snyk.sarif
```

### A07:2021 – Identification and Authentication Failures

**Risk**: Compromised passwords, keys, or session tokens

**Weak Authentication Implementation**:

```javascript
// BAD: Weak session management
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    req.session.user = username; // No session security
    res.json({ success: true });
  }
});

// BAD: No brute force protection
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (user && user.password === req.body.password) { // Plain text passwords!
    res.json({ token: user.id }); // Predictable tokens
  }
});
```

**Secure Authentication System**:

```javascript
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const MongoStore = require('connect-mongo');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts, please try again later'
  }
});

// Account lockout after failed attempts
class AuthenticationService {
  static async authenticateUser(username, password) {
    const user = await User.findOne({ username });

    if (!user) {
      // Simulate processing time to prevent username enumeration
      await bcrypt.hash('dummy', 12);
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockoutExpires && user.lockoutExpires > new Date()) {
      throw new Error('Account is temporarily locked');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      await this.handleFailedAttempt(user);
      throw new Error('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await user.updateOne({
      $unset: { failedAttempts: 1, lockoutExpires: 1 }
    });

    return user;
  }

  static async handleFailedAttempt(user) {
    const failedAttempts = (user.failedAttempts || 0) + 1;
    const updates = { failedAttempts };

    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
      updates.lockoutExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await user.updateOne(updates);
  }
}

// Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Secure login endpoint
app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  try {
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await AuthenticationService.authenticateUser(username, password);

    // Create secure session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    // Log successful login
    await AuditLog.create({
      action: 'LOGIN_SUCCESS',
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    // Log failed attempt
    await AuditLog.create({
      action: 'LOGIN_FAILURE',
      username: username,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message
    });

    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### A08:2021 – Software and Data Integrity Failures

**Risk**: Code and infrastructure that does not protect against integrity violations

**Subresource Integrity (SRI)**:

```html
<!-- Use SRI for external resources -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
  integrity="sha384-vtXRMe3mGCbOeY7l30aIg8H9p3GdeSe4IFlP6G8JMa7o7lXvnz3GlLJvkbp6oJ8"
  crossorigin="anonymous">
</script>

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css"
  integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
  crossorigin="anonymous">
```

**Digital Signatures for Updates**:

```javascript
const crypto = require('crypto');
const fs = require('fs');

class UpdateVerifier {
  constructor(publicKeyPath) {
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  verifyUpdate(updatePath, signaturePath) {
    try {
      const updateData = fs.readFileSync(updatePath);
      const signature = fs.readFileSync(signaturePath);

      const verifier = crypto.createVerify('SHA256');
      verifier.update(updateData);

      const isValid = verifier.verify(this.publicKey, signature);

      if (!isValid) {
        throw new Error('Update signature verification failed');
      }

      return true;
    } catch (error) {
      console.error('Update verification failed:', error);
      return false;
    }
  }

  calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
  }
}

// CI/CD pipeline integrity
const pipelineIntegrity = {
  stages: [
    {
      name: 'source-verification',
      checks: [
        'verify-git-signature',
        'scan-dependencies',
        'check-code-signatures'
      ]
    },
    {
      name: 'build-verification',
      checks: [
        'reproducible-build',
        'artifact-signing',
        'vulnerability-scan'
      ]
    },
    {
      name: 'deployment-verification',
      checks: [
        'verify-artifact-signature',
        'infrastructure-validation',
        'runtime-integrity-check'
      ]
    }
  ]
};
```

### A09:2021 – Security Logging and Monitoring Failures

**Risk**: Insufficient logging and monitoring of security events

**Comprehensive Security Logging**:

```javascript
const winston = require('winston');

class SecurityLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: 'logs/security-events.log',
          level: 'warn'
        }),
        new winston.transports.File({
          filename: 'logs/audit.log'
        }),
        ...(process.env.NODE_ENV !== 'production' ? [
          new winston.transports.Console()
        ] : [])
      ]
    });
  }

  logSecurityEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      severity: this.getSeverity(event),
      details: {
        ...details,
        userAgent: details.userAgent,
        ip: details.ip,
        sessionId: details.sessionId
      }
    };

    this.logger.warn('Security Event', logEntry);

    // Send to SIEM if critical
    if (logEntry.severity === 'CRITICAL') {
      this.sendToSIEM(logEntry);
    }
  }

  getSeverity(event) {
    const severityMap = {
      'LOGIN_FAILURE': 'LOW',
      'MULTIPLE_LOGIN_FAILURES': 'MEDIUM',
      'ACCOUNT_LOCKED': 'MEDIUM',
      'PRIVILEGE_ESCALATION_ATTEMPT': 'HIGH',
      'DATA_BREACH_ATTEMPT': 'CRITICAL',
      'INJECTION_ATTEMPT': 'HIGH',
      'SUSPICIOUS_FILE_ACCESS': 'MEDIUM'
    };

    return severityMap[event] || 'LOW';
  }

  async sendToSIEM(logEntry) {
    // Integration with SIEM system
    try {
      // Example: Send to Splunk, ELK, or other SIEM
      await fetch(process.env.SIEM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SIEM_TOKEN}`
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send to SIEM:', error);
    }
  }
}

// Security monitoring middleware
const securityLogger = new SecurityLogger();

app.use((req, res, next) => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./g, // Directory traversal
    /(union|select|insert|update|delete|drop)/i, // SQL injection
    /<script/i, // XSS attempts
    /javascript:/i // JavaScript injection
  ];

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(req.url) || pattern.test(JSON.stringify(req.body))
  );

  if (isSuspicious) {
    securityLogger.logSecurityEvent('SUSPICIOUS_REQUEST', {
      url: req.url,
      method: req.method,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  next();
});
```

### A10:2021 – Server-Side Request Forgery (SSRF)

**Risk**: Fetching remote resources without validating user-supplied URLs

**Vulnerable SSRF Code**:

```javascript
// DANGEROUS: No URL validation
app.post('/fetch-url', async (req, res) => {
  const { url } = req.body;

  try {
    const response = await fetch(url); // Can access internal services!
    const data = await response.text();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attack examples:
// url: "http://localhost:22" (SSH service)
// url: "http://169.254.169.254/latest/meta-data/" (AWS metadata)
// url: "file:///etc/passwd" (Local file access)
```

**Secure SSRF Prevention**:

```javascript
const url = require('url');
const dns = require('dns');
const { promisify } = require('util');

const dnsLookup = promisify(dns.lookup);

class SSRFProtection {
  constructor() {
    // Whitelist of allowed domains
    this.allowedDomains = [
      'api.trusted-service.com',
      'cdn.allowed-content.com'
    ];

    // Blacklist of dangerous IP ranges
    this.blockedNetworks = [
      '127.0.0.0/8',     // Loopback
      '10.0.0.0/8',      // Private network
      '172.16.0.0/12',   // Private network
      '192.168.0.0/16',  // Private network
      '169.254.0.0/16',  // Link-local
      '0.0.0.0/8',       // Current network
      '224.0.0.0/4',     // Multicast
      '240.0.0.0/4'      // Reserved
    ];
  }

  async validateURL(inputURL) {
    try {
      const parsedURL = new url.URL(inputURL);

      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsedURL.protocol)) {
        throw new Error('Only HTTP/HTTPS protocols allowed');
      }

      // Check if domain is whitelisted
      if (!this.allowedDomains.includes(parsedURL.hostname)) {
        throw new Error('Domain not in whitelist');
      }

      // Resolve hostname to IP
      const { address } = await dnsLookup(parsedURL.hostname);

      // Check if IP is in blocked networks
      if (this.isIPBlocked(address)) {
        throw new Error('Access to internal networks not allowed');
      }

      return { isValid: true, resolvedIP: address };

    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  isIPBlocked(ip) {
    // Simple IP range checking (use a proper library in production)
    const ipParts = ip.split('.').map(Number);

    // Check loopback
    if (ipParts[0] === 127) return true;

    // Check private networks
    if (ipParts[0] === 10) return true;
    if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;
    if (ipParts[0] === 192 && ipParts[1] === 168) return true;

    // Check link-local
    if (ipParts[0] === 169 && ipParts[1] === 254) return true;

    return false;
  }

  async safeFetch(inputURL, options = {}) {
    const validation = await this.validateURL(inputURL);

    if (!validation.isValid) {
      throw new Error(`SSRF protection: ${validation.error}`);
    }

    // Additional safety measures
    const safeOptions = {
      ...options,
      timeout: 10000, // 10 second timeout
      size: 1024 * 1024, // 1MB max response size
      redirect: 'manual' // Don't follow redirects
    };

    const response = await fetch(inputURL, safeOptions);

    // Check for suspicious redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const redirectValidation = await this.validateURL(location);
        if (!redirectValidation.isValid) {
          throw new Error('Redirect blocked by SSRF protection');
        }
      }
    }

    return response;
  }
}

// Secure URL fetching endpoint
const ssrfProtection = new SSRFProtection();

app.post('/fetch-url', async (req, res) => {
  const { url } = req.body;

  // Input validation
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL required' });
  }

  try {
    const response = await ssrfProtection.safeFetch(url);
    const data = await response.text();

    // Log the request for monitoring
    securityLogger.logSecurityEvent('EXTERNAL_URL_FETCH', {
      url: url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });

    res.json({ data });

  } catch (error) {
    // Log potential SSRF attempt
    securityLogger.logSecurityEvent('SSRF_ATTEMPT_BLOCKED', {
      url: url,
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(400).json({ error: 'Request blocked for security reasons' });
  }
});
```

## Security Testing and Validation

```javascript
// Security test suite
describe('OWASP Top 10 Security Tests', () => {
  test('A01 - Access Control', async () => {
    // Test unauthorized access
    const response = await request(app)
      .get('/admin/users')
      .expect(401);

    expect(response.body.error).toBe('Authentication required');
  });

  test('A03 - Injection Prevention', async () => {
    const sqlInjectionPayload = "'; DROP TABLE users; --";

    const response = await request(app)
      .post('/login')
      .send({
        username: sqlInjectionPayload,
        password: 'password'
      })
      .expect(401);

    // Should not cause database error
    expect(response.body.error).toBe('Invalid credentials');
  });

  test('A06 - Dependency Security', () => {
    const auditResult = execSync('npm audit --audit-level moderate', {
      encoding: 'utf8'
    });

    expect(auditResult).not.toContain('found 0 vulnerabilities');
  });
});
```

The OWASP Top 10 provides a foundation for web application security. Regularly review and implement these protections, conduct security testing, and stay updated with the latest security trends and vulnerabilities.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
