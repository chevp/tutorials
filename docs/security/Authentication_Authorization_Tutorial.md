# Authentication and Authorization Tutorial

## Overview

Authentication verifies "who you are" while authorization determines "what you can do." This tutorial covers modern authentication methods, authorization patterns, and secure implementation practices for web applications.

## Authentication Fundamentals

### Password-Based Authentication

**Secure Password Storage**:

```javascript
const bcrypt = require('bcrypt');
const argon2 = require('argon2');

class PasswordService {
  // Using bcrypt (widely adopted)
  static async hashWithBcrypt(password) {
    const saltRounds = 12; // Recommended in 2024
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyWithBcrypt(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Using Argon2 (winner of password hashing competition)
  static async hashWithArgon2(password) {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });
    } catch (err) {
      throw new Error('Password hashing failed');
    }
  }

  static async verifyWithArgon2(password, hash) {
    try {
      return await argon2.verify(hash, password);
    } catch (err) {
      return false;
    }
  }

  // Password strength validation
  static validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      notCommon: !this.isCommonPassword(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const isStrong = score >= 5;

    return {
      isStrong,
      score,
      requirements,
      feedback: this.getPasswordFeedback(requirements)
    };
  }

  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin',
      'qwerty', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  static getPasswordFeedback(requirements) {
    const feedback = [];

    if (!requirements.minLength) {
      feedback.push('Password must be at least 12 characters long');
    }
    if (!requirements.hasUppercase) {
      feedback.push('Add uppercase letters');
    }
    if (!requirements.hasLowercase) {
      feedback.push('Add lowercase letters');
    }
    if (!requirements.hasNumbers) {
      feedback.push('Add numbers');
    }
    if (!requirements.hasSpecialChars) {
      feedback.push('Add special characters');
    }
    if (!requirements.notCommon) {
      feedback.push('Avoid common passwords');
    }

    return feedback;
  }
}
```

### Multi-Factor Authentication (MFA)

**Time-based One-Time Password (TOTP)**:

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TOTPService {
  static generateSecret(username, serviceName = 'MyApp') {
    return speakeasy.generateSecret({
      name: `${serviceName} (${username})`,
      issuer: serviceName,
      length: 32
    });
  }

  static async generateQRCode(secret) {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: secret.name,
      issuer: secret.issuer,
      algorithm: 'sha1',
      digits: 6,
      period: 30
    });

    return await QRCode.toDataURL(otpAuthUrl);
  }

  static verifyToken(secret, token, window = 1) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'ascii',
      token: token,
      window: window // Allow 1 step of time drift (30 seconds)
    });
  }

  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}

// MFA setup endpoint
app.post('/auth/mfa/setup', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.mfaEnabled) {
      return res.status(400).json({
        error: 'MFA is already enabled for this account'
      });
    }

    // Generate secret
    const secret = TOTPService.generateSecret(user.username);
    const qrCode = await TOTPService.generateQRCode(secret);

    // Store temporary secret (not yet activated)
    await user.update({
      tempMfaSecret: secret.base32,
      mfaSetupExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes: TOTPService.generateBackupCodes()
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: 'MFA setup failed' });
  }
});

// MFA verification endpoint
app.post('/auth/mfa/verify', authenticate, async (req, res) => {
  try {
    const { token, backupCodes } = req.body;
    const user = await User.findById(req.userId);

    if (!user.tempMfaSecret) {
      return res.status(400).json({ error: 'No MFA setup in progress' });
    }

    if (new Date() > user.mfaSetupExpires) {
      return res.status(400).json({ error: 'MFA setup expired' });
    }

    // Verify TOTP token
    const isValidToken = TOTPService.verifyToken(user.tempMfaSecret, token);

    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Activate MFA
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    await user.update({
      mfaEnabled: true,
      mfaSecret: user.tempMfaSecret,
      backupCodes: hashedBackupCodes,
      tempMfaSecret: null,
      mfaSetupExpires: null
    });

    // Log security event
    await SecurityLog.create({
      userId: user.id,
      event: 'MFA_ENABLED',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'MFA enabled successfully' });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});
```

### JSON Web Tokens (JWT)

**Secure JWT Implementation**:

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTService {
  constructor() {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be provided');
    }
  }

  generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'access',
        jti: crypto.randomUUID() // JWT ID for tracking
      },
      this.accessTokenSecret,
      {
        expiresIn: '15m',
        issuer: 'myapp.com',
        audience: 'myapp-users',
        algorithm: 'HS256'
      }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      {
        userId,
        type: 'refresh',
        jti: crypto.randomUUID(),
        version: Date.now() // For token invalidation
      },
      this.refreshTokenSecret,
      {
        expiresIn: '7d',
        issuer: 'myapp.com',
        audience: 'myapp-users',
        algorithm: 'HS256'
      }
    );
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'myapp.com',
        audience: 'myapp-users'
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'myapp.com',
        audience: 'myapp-users'
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Token blacklist for logout/revocation
  static blacklistedTokens = new Set();

  static blacklistToken(jti, expiresIn) {
    this.blacklistedTokens.add(jti);

    // Remove from blacklist after expiration
    setTimeout(() => {
      this.blacklistedTokens.delete(jti);
    }, expiresIn * 1000);
  }

  static isTokenBlacklisted(jti) {
    return this.blacklistedTokens.has(jti);
  }
}

const jwtService = new JWTService();

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = jwtService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwtService.verifyAccessToken(token);

    // Check if token is blacklisted
    if (JWTService.isTokenBlacklisted(decoded.jti)) {
      return res.status(401).json({
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.tokenId = decoded.jti;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

// Token refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwtService.verifyRefreshToken(refreshToken);

    // Verify refresh token in database
    const tokenRecord = await RefreshToken.findOne({
      userId: decoded.userId,
      jti: decoded.jti,
      revoked: false
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Get user information
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const newAccessToken = jwtService.generateAccessToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    const newRefreshToken = jwtService.generateRefreshToken(user.id);

    // Revoke old refresh token and save new one
    await tokenRecord.update({ revoked: true });
    await RefreshToken.create({
      userId: user.id,
      jti: jwt.decode(newRefreshToken).jti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900 // 15 minutes
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
```

## Authorization Patterns

### Role-Based Access Control (RBAC)

**RBAC Implementation**:

```javascript
// Define roles and permissions
const PERMISSIONS = {
  // User management
  'users.read': 'Read user information',
  'users.write': 'Create and update users',
  'users.delete': 'Delete users',

  // Content management
  'content.read': 'Read content',
  'content.write': 'Create and update content',
  'content.delete': 'Delete content',
  'content.publish': 'Publish content',

  // Admin functions
  'admin.access': 'Access admin panel',
  'admin.settings': 'Modify system settings',
  'admin.logs': 'View system logs'
};

const ROLES = {
  'guest': [],
  'user': ['content.read'],
  'editor': ['content.read', 'content.write'],
  'publisher': ['content.read', 'content.write', 'content.publish'],
  'moderator': ['users.read', 'content.read', 'content.write', 'content.delete'],
  'admin': Object.keys(PERMISSIONS)
};

class AuthorizationService {
  static hasPermission(userRole, requiredPermission) {
    const rolePermissions = ROLES[userRole] || [];
    return rolePermissions.includes(requiredPermission);
  }

  static hasAnyPermission(userRole, requiredPermissions) {
    return requiredPermissions.some(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  static hasAllPermissions(userRole, requiredPermissions) {
    return requiredPermissions.every(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  static getUserPermissions(userRole) {
    return ROLES[userRole] || [];
  }
}

// Authorization middleware
const authorize = (requiredPermissions, options = {}) => {
  return (req, res, next) => {
    const userRole = req.userRole;

    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = Array.isArray(requiredPermissions)
      ? (options.requireAll
          ? AuthorizationService.hasAllPermissions(userRole, requiredPermissions)
          : AuthorizationService.hasAnyPermission(userRole, requiredPermissions))
      : AuthorizationService.hasPermission(userRole, requiredPermissions);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredPermissions,
        current: AuthorizationService.getUserPermissions(userRole)
      });
    }

    next();
  };
};

// Usage examples
app.get('/admin/users',
  authenticate,
  authorize('users.read'),
  (req, res) => {
    // Only users with 'users.read' permission can access
  }
);

app.post('/content/publish',
  authenticate,
  authorize(['content.write', 'content.publish'], { requireAll: true }),
  (req, res) => {
    // Requires both permissions
  }
);
```

### Attribute-Based Access Control (ABAC)

**ABAC Implementation**:

```javascript
class ABACEngine {
  constructor() {
    this.policies = new Map();
  }

  addPolicy(name, policy) {
    this.policies.set(name, policy);
  }

  async evaluate(subject, resource, action, environment = {}) {
    const context = {
      subject,
      resource,
      action,
      environment,
      time: new Date()
    };

    for (const [name, policy] of this.policies) {
      try {
        const result = await policy.evaluate(context);
        if (result.decision === 'DENY') {
          return {
            decision: 'DENY',
            reason: result.reason,
            policy: name
          };
        }
      } catch (error) {
        console.error(`Policy ${name} evaluation error:`, error);
        return {
          decision: 'DENY',
          reason: 'Policy evaluation error'
        };
      }
    }

    return { decision: 'ALLOW' };
  }
}

// Example policies
class TimeBasedAccessPolicy {
  static async evaluate(context) {
    const { subject, environment } = context;
    const currentHour = context.time.getHours();

    // Business hours: 9 AM to 6 PM
    if (subject.role === 'employee' && (currentHour < 9 || currentHour >= 18)) {
      return {
        decision: 'DENY',
        reason: 'Access denied outside business hours'
      };
    }

    return { decision: 'ALLOW' };
  }
}

class ResourceOwnershipPolicy {
  static async evaluate(context) {
    const { subject, resource, action } = context;

    // Users can only modify their own resources
    if (['UPDATE', 'DELETE'].includes(action) &&
        resource.ownerId !== subject.id &&
        subject.role !== 'admin') {
      return {
        decision: 'DENY',
        reason: 'Can only modify your own resources'
      };
    }

    return { decision: 'ALLOW' };
  }
}

class GeolocationPolicy {
  static async evaluate(context) {
    const { subject, environment } = context;

    // Check if access is from allowed countries
    const allowedCountries = ['US', 'CA', 'GB'];
    const userCountry = environment.geoLocation?.country;

    if (subject.role === 'admin' && !allowedCountries.includes(userCountry)) {
      return {
        decision: 'DENY',
        reason: 'Admin access not allowed from this location'
      };
    }

    return { decision: 'ALLOW' };
  }
}

// Initialize ABAC engine
const abac = new ABACEngine();
abac.addPolicy('timeBasedAccess', TimeBasedAccessPolicy);
abac.addPolicy('resourceOwnership', ResourceOwnershipPolicy);
abac.addPolicy('geolocation', GeolocationPolicy);

// ABAC authorization middleware
const authorizeWithABAC = (action) => {
  return async (req, res, next) => {
    try {
      const subject = {
        id: req.userId,
        role: req.userRole,
        username: req.username
      };

      const resource = req.resource || {};

      const environment = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        geoLocation: await getGeoLocation(req.ip) // Implement geolocation lookup
      };

      const decision = await abac.evaluate(subject, resource, action, environment);

      if (decision.decision === 'DENY') {
        return res.status(403).json({
          error: 'Access denied',
          reason: decision.reason,
          policy: decision.policy
        });
      }

      next();
    } catch (error) {
      console.error('ABAC authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};
```

## OAuth 2.0 and OpenID Connect

### OAuth 2.0 Server Implementation

```javascript
const oauth2 = require('oauth2-server');

// OAuth 2.0 model implementation
const oauthModel = {
  // Client verification
  async getClient(clientId, clientSecret) {
    const client = await OAuthClient.findOne({ clientId });

    if (!client || (clientSecret && client.clientSecret !== clientSecret)) {
      return null;
    }

    return {
      id: client.clientId,
      clientSecret: client.clientSecret,
      grants: client.grants,
      redirectUris: client.redirectUris,
      scope: client.scope
    };
  },

  // User credentials verification
  async getUser(username, password) {
    const user = await User.findOne({ username });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return null;
    }

    return { id: user.id };
  },

  // Authorization code generation and verification
  async saveAuthorizationCode(code, client, user) {
    const authCode = await AuthorizationCode.create({
      code: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      clientId: client.id,
      userId: user.id
    });

    return {
      authorizationCode: authCode.code,
      expiresAt: authCode.expiresAt,
      redirectUri: authCode.redirectUri,
      scope: authCode.scope,
      client: { id: client.id },
      user: { id: user.id }
    };
  },

  async getAuthorizationCode(authorizationCode) {
    const code = await AuthorizationCode.findOne({
      code: authorizationCode
    }).populate('client user');

    if (!code || code.expiresAt < new Date()) {
      return null;
    }

    return {
      authorizationCode: code.code,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: { id: code.client.clientId },
      user: { id: code.user.id }
    };
  },

  async revokeAuthorizationCode(code) {
    await AuthorizationCode.deleteOne({
      code: code.authorizationCode
    });
    return true;
  },

  // Access token management
  async saveToken(token, client, user) {
    const accessToken = await AccessToken.create({
      token: token.accessToken,
      expiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      clientId: client.id,
      userId: user.id,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt
    });

    return {
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken: accessToken.refreshToken,
      refreshTokenExpiresAt: accessToken.refreshTokenExpiresAt,
      scope: accessToken.scope,
      client: { id: client.id },
      user: { id: user.id }
    };
  },

  async getAccessToken(accessToken) {
    const token = await AccessToken.findOne({ token: accessToken })
      .populate('client user');

    if (!token || token.expiresAt < new Date()) {
      return null;
    }

    return {
      accessToken: token.token,
      accessTokenExpiresAt: token.expiresAt,
      scope: token.scope,
      client: { id: token.client.clientId },
      user: { id: token.user.id }
    };
  },

  async getRefreshToken(refreshToken) {
    const token = await AccessToken.findOne({ refreshToken })
      .populate('client user');

    if (!token || token.refreshTokenExpiresAt < new Date()) {
      return null;
    }

    return {
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      client: { id: token.client.clientId },
      user: { id: token.user.id }
    };
  },

  async revokeToken(token) {
    await AccessToken.deleteOne({ refreshToken: token.refreshToken });
    return true;
  },

  // Scope verification
  async verifyScope(user, client, scope) {
    const requestedScopes = scope ? scope.split(' ') : [];
    const allowedScopes = client.scope ? client.scope.split(' ') : [];

    return requestedScopes.every(s => allowedScopes.includes(s));
  }
};

// OAuth 2.0 server setup
const OAuth2Server = require('oauth2-server');
const oauthServer = new OAuth2Server({
  model: oauthModel,
  accessTokenLifetime: 60 * 60, // 1 hour
  refreshTokenLifetime: 60 * 60 * 24 * 14, // 2 weeks
  allowBearerTokensInQueryString: false
});

// OAuth endpoints
app.get('/oauth/authorize', async (req, res) => {
  try {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);

    await oauthServer.authorize(request, response, {
      authenticateHandler: {
        handle: () => req.user // Assume user is authenticated
      }
    });

    res.status(response.status).set(response.headers).send(response.body);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

app.post('/oauth/token', async (req, res) => {
  try {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);

    const token = await oauthServer.token(request, response);

    res.status(response.status).set(response.headers).json(token);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

// Protected resource endpoint
app.get('/api/user', async (req, res) => {
  try {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);

    const token = await oauthServer.authenticate(request, response);

    const user = await User.findById(token.user.id);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(err.code || 401).json({ error: err.message });
  }
});
```

### OpenID Connect Implementation

```javascript
// OpenID Connect ID Token generation
const jwt = require('jsonwebtoken');

class OpenIDConnectService {
  static generateIdToken(user, client, nonce) {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      // Standard OpenID Connect claims
      iss: 'https://myapp.com', // Issuer
      sub: user.id, // Subject
      aud: client.id, // Audience
      exp: now + 3600, // Expiration (1 hour)
      iat: now, // Issued at
      nonce: nonce, // Prevents replay attacks

      // User claims
      email: user.email,
      email_verified: user.emailVerified,
      name: user.displayName,
      given_name: user.firstName,
      family_name: user.lastName,
      picture: user.avatarUrl,
      updated_at: Math.floor(user.updatedAt.getTime() / 1000)
    };

    return jwt.sign(payload, process.env.ID_TOKEN_SECRET, {
      algorithm: 'RS256',
      keyid: 'rsa-key-1'
    });
  }

  static async getUserInfo(accessToken) {
    const token = await AccessToken.findOne({ token: accessToken })
      .populate('user');

    if (!token || token.expiresAt < new Date()) {
      throw new Error('Invalid or expired access token');
    }

    const user = token.user;
    const scopes = token.scope ? token.scope.split(' ') : [];

    const userInfo = {
      sub: user.id
    };

    // Return claims based on requested scopes
    if (scopes.includes('email')) {
      userInfo.email = user.email;
      userInfo.email_verified = user.emailVerified;
    }

    if (scopes.includes('profile')) {
      userInfo.name = user.displayName;
      userInfo.given_name = user.firstName;
      userInfo.family_name = user.lastName;
      userInfo.picture = user.avatarUrl;
      userInfo.updated_at = Math.floor(user.updatedAt.getTime() / 1000);
    }

    return userInfo;
  }
}

// OpenID Connect Discovery endpoint
app.get('/.well-known/openid_configuration', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,
    userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    response_types_supported: ['code', 'id_token', 'code id_token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    claims_supported: [
      'sub', 'iss', 'aud', 'exp', 'iat',
      'email', 'email_verified',
      'name', 'given_name', 'family_name', 'picture'
    ]
  });
});

// UserInfo endpoint
app.get('/oauth/userinfo', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const userInfo = await OpenIDConnectService.getUserInfo(token);
    res.json(userInfo);

  } catch (error) {
    res.status(401).json({ error: 'Invalid access token' });
  }
});
```

## Session Management

### Secure Session Configuration

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // Don't use default name
  resave: false,
  saveUninitialized: false,

  // MongoDB session store
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    touchAfter: 24 * 3600, // Lazy session update
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  }),

  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },

  genid: () => crypto.randomUUID() // Cryptographically secure session IDs
}));

// Session security middleware
app.use((req, res, next) => {
  // Regenerate session ID on login
  if (req.session.regenerate && req.body.login) {
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration failed:', err);
      }
      next();
    });
  } else {
    next();
  }
});

// Session timeout middleware
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

app.use((req, res, next) => {
  if (req.session.userId) {
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;

    if (now - lastActivity > SESSION_TIMEOUT) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction failed:', err);
        }
        return res.status(401).json({ error: 'Session expired' });
      });
      return;
    }

    req.session.lastActivity = now;
  }

  next();
});
```

## Security Best Practices

### Rate Limiting and Brute Force Protection

```javascript
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts, please try again later'
  }
});

// Progressive delay for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // allow 10 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000 // maximum delay of 20 seconds
});

app.use(generalLimiter);
app.use('/auth', authLimiter);
app.use('/auth', speedLimiter);

// Account lockout implementation
class AccountLockoutService {
  static async recordFailedAttempt(userId, ip) {
    const key = `failed_attempts:${userId}:${ip}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 900); // 15 minutes

    if (attempts >= 5) {
      await this.lockAccount(userId, 30 * 60); // 30 minutes
    }

    return attempts;
  }

  static async lockAccount(userId, duration) {
    await redis.setex(`account_locked:${userId}`, duration, '1');

    // Notify user of account lockout
    const user = await User.findById(userId);
    if (user) {
      await NotificationService.sendAccountLockoutAlert(user.email);
    }
  }

  static async isAccountLocked(userId) {
    return await redis.exists(`account_locked:${userId}`);
  }

  static async clearFailedAttempts(userId, ip) {
    await redis.del(`failed_attempts:${userId}:${ip}`);
  }
}
```

Authentication and authorization are critical security components. Implement multiple layers of security, use established standards like OAuth 2.0 and OpenID Connect, and always follow security best practices including proper session management, rate limiting, and comprehensive logging.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
