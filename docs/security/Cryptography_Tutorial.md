# Cryptography Tutorial

## Overview

Cryptography is the practice of secure communication in the presence of third parties. This tutorial covers fundamental cryptographic concepts, modern algorithms, and practical implementation for application security.

## Cryptographic Fundamentals

### Hash Functions

**Cryptographic Hash Properties**:
- **Deterministic**: Same input always produces same output
- **Fixed Output Size**: Hash output has fixed length regardless of input size
- **Avalanche Effect**: Small input change causes large output change
- **One-Way**: Computationally infeasible to reverse
- **Collision Resistant**: Hard to find two inputs with same hash

```javascript
const crypto = require('crypto');

class HashingService {
  // SHA-256 hashing
  static sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // SHA-3 hashing (more recent standard)
  static sha3(data) {
    return crypto.createHash('sha3-256').update(data).digest('hex');
  }

  // BLAKE2b hashing (faster than SHA-2)
  static blake2b(data) {
    return crypto.createHash('blake2b512').update(data).digest('hex');
  }

  // File integrity verification
  static async verifyFileIntegrity(filePath, expectedHash) {
    const fs = require('fs').promises;
    const fileBuffer = await fs.readFile(filePath);
    const actualHash = this.sha256(fileBuffer);
    return actualHash === expectedHash;
  }

  // Merkle tree implementation for data integrity
  static buildMerkleTree(data) {
    if (data.length === 0) return null;
    if (data.length === 1) return this.sha256(data[0]);

    const tree = [];
    let currentLevel = data.map(item => this.sha256(item));

    while (currentLevel.length > 1) {
      tree.push([...currentLevel]);
      const nextLevel = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate last if odd count
        nextLevel.push(this.sha256(left + right));
      }

      currentLevel = nextLevel;
    }

    return {
      root: currentLevel[0],
      tree: tree
    };
  }

  // HMAC (Hash-based Message Authentication Code)
  static hmac(message, key, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, key).update(message).digest('hex');
  }

  // Time-safe string comparison to prevent timing attacks
  static constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// Usage examples
const data = "Hello, World!";
const hash = HashingService.sha256(data);
console.log(`SHA-256: ${hash}`);

// HMAC for message authentication
const message = "Important message";
const secretKey = "my-secret-key";
const signature = HashingService.hmac(message, secretKey);
console.log(`HMAC: ${signature}`);

// Verify HMAC
const receivedSignature = "received-hmac-value";
const isValid = HashingService.constantTimeCompare(signature, receivedSignature);
console.log(`HMAC Valid: ${isValid}`);
```

### Symmetric Encryption

**Advanced Encryption Standard (AES)**:

```javascript
const crypto = require('crypto');

class SymmetricEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
  }

  // Generate cryptographically secure random key
  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  // Encrypt data with AES-256-GCM
  encrypt(plaintext, key) {
    if (!Buffer.isBuffer(key) || key.length !== this.keyLength) {
      throw new Error('Key must be 32 bytes for AES-256');
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('authenticated-data')); // Additional authenticated data

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      ciphertext: ciphertext,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt data with AES-256-GCM
  decrypt(encryptedData, key) {
    if (!Buffer.isBuffer(key) || key.length !== this.keyLength) {
      throw new Error('Key must be 32 bytes for AES-256');
    }

    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('authenticated-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let plaintext = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }

  // Key derivation using PBKDF2
  deriveKeyFromPassword(password, salt, iterations = 100000) {
    if (!salt) {
      salt = crypto.randomBytes(16);
    }

    const key = crypto.pbkdf2Sync(password, salt, iterations, this.keyLength, 'sha256');

    return {
      key: key,
      salt: salt,
      iterations: iterations
    };
  }

  // Key derivation using scrypt (more secure, slower)
  deriveKeyWithScrypt(password, salt, options = {}) {
    if (!salt) {
      salt = crypto.randomBytes(16);
    }

    const defaultOptions = {
      N: 16384, // Cost parameter
      r: 8,     // Block size
      p: 1,     // Parallelization
      maxmem: 32 * 1024 * 1024 // 32 MB
    };

    const scryptOptions = { ...defaultOptions, ...options };
    const key = crypto.scryptSync(password, salt, this.keyLength, scryptOptions);

    return {
      key: key,
      salt: salt,
      options: scryptOptions
    };
  }

  // Encrypt file
  async encryptFile(inputPath, outputPath, key) {
    const fs = require('fs').promises;
    const inputData = await fs.readFile(inputPath);
    const encrypted = this.encrypt(inputData, key);

    const encryptedFile = {
      ...encrypted,
      originalName: require('path').basename(inputPath),
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(outputPath, JSON.stringify(encryptedFile));
    return encrypted;
  }

  // Decrypt file
  async decryptFile(inputPath, outputPath, key) {
    const fs = require('fs').promises;
    const encryptedFile = JSON.parse(await fs.readFile(inputPath, 'utf8'));
    const decrypted = this.decrypt(encryptedFile, key);

    await fs.writeFile(outputPath, decrypted);
    return decrypted;
  }
}

// Usage example
const aes = new SymmetricEncryption();

// Generate or derive key
const password = "user-password";
const keyData = aes.deriveKeyWithScrypt(password, null);

// Encrypt sensitive data
const sensitiveData = "Credit card number: 4532-1234-5678-9012";
const encrypted = aes.encrypt(sensitiveData, keyData.key);
console.log('Encrypted:', encrypted);

// Decrypt data
try {
  const decrypted = aes.decrypt(encrypted, keyData.key);
  console.log('Decrypted:', decrypted);
} catch (error) {
  console.error('Decryption failed:', error.message);
}
```

### Asymmetric Encryption

**RSA and Elliptic Curve Cryptography**:

```javascript
const crypto = require('crypto');

class AsymmetricEncryption {
  // Generate RSA key pair
  generateRSAKeyPair(keySize = 2048) {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: process.env.PRIVATE_KEY_PASSPHRASE
      }
    });
  }

  // Generate Elliptic Curve key pair (more efficient)
  generateECKeyPair(curve = 'secp256k1') {
    return crypto.generateKeyPairSync('ec', {
      namedCurve: curve,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: process.env.PRIVATE_KEY_PASSPHRASE
      }
    });
  }

  // RSA encryption (for small data only)
  encryptRSA(data, publicKey) {
    return crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(data)).toString('base64');
  }

  // RSA decryption
  decryptRSA(encryptedData, privateKey, passphrase) {
    return crypto.privateDecrypt({
      key: privateKey,
      passphrase: passphrase,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(encryptedData, 'base64')).toString();
  }

  // Hybrid encryption (RSA + AES for large data)
  hybridEncrypt(data, publicKey) {
    // Generate random AES key
    const aesKey = crypto.randomBytes(32);
    const aes = new SymmetricEncryption();

    // Encrypt data with AES
    const encryptedData = aes.encrypt(data, aesKey);

    // Encrypt AES key with RSA
    const encryptedKey = this.encryptRSA(aesKey.toString('base64'), publicKey);

    return {
      encryptedKey: encryptedKey,
      encryptedData: encryptedData
    };
  }

  // Hybrid decryption
  hybridDecrypt(hybridData, privateKey, passphrase) {
    // Decrypt AES key with RSA
    const aesKeyBase64 = this.decryptRSA(hybridData.encryptedKey, privateKey, passphrase);
    const aesKey = Buffer.from(aesKeyBase64, 'base64');

    // Decrypt data with AES
    const aes = new SymmetricEncryption();
    return aes.decrypt(hybridData.encryptedData, aesKey);
  }

  // Digital signatures
  sign(data, privateKey, passphrase, algorithm = 'sha256') {
    const sign = crypto.createSign(algorithm);
    sign.update(data);

    return sign.sign({
      key: privateKey,
      passphrase: passphrase
    }, 'base64');
  }

  // Verify digital signature
  verify(data, signature, publicKey, algorithm = 'sha256') {
    const verify = crypto.createVerify(algorithm);
    verify.update(data);

    return verify.verify(publicKey, signature, 'base64');
  }

  // Elliptic Curve Digital Signature Algorithm (ECDSA)
  signECDSA(data, privateKey, passphrase) {
    const sign = crypto.createSign('sha256');
    sign.update(data);

    return sign.sign({
      key: privateKey,
      passphrase: passphrase,
      dsaEncoding: 'der'
    }, 'base64');
  }

  verifyECDSA(data, signature, publicKey) {
    const verify = crypto.createVerify('sha256');
    verify.update(data);

    return verify.verify({
      key: publicKey,
      dsaEncoding: 'der'
    }, signature, 'base64');
  }
}

// Key management example
class KeyManager {
  constructor() {
    this.asymmetric = new AsymmetricEncryption();
  }

  async generateAndStoreKeys() {
    // Generate key pairs
    const rsaKeys = this.asymmetric.generateRSAKeyPair(2048);
    const ecKeys = this.asymmetric.generateECKeyPair('secp256k1');

    // Store keys securely (in production, use a key management service)
    const fs = require('fs').promises;

    await fs.writeFile('keys/rsa-public.pem', rsaKeys.publicKey);
    await fs.writeFile('keys/rsa-private.pem', rsaKeys.privateKey);
    await fs.writeFile('keys/ec-public.pem', ecKeys.publicKey);
    await fs.writeFile('keys/ec-private.pem', ecKeys.privateKey);

    return { rsaKeys, ecKeys };
  }

  async loadKeys() {
    const fs = require('fs').promises;

    return {
      rsaPublic: await fs.readFile('keys/rsa-public.pem', 'utf8'),
      rsaPrivate: await fs.readFile('keys/rsa-private.pem', 'utf8'),
      ecPublic: await fs.readFile('keys/ec-public.pem', 'utf8'),
      ecPrivate: await fs.readFile('keys/ec-private.pem', 'utf8')
    };
  }

  // Key rotation
  async rotateKeys(oldPrivateKey, passphrase) {
    // Generate new key pair
    const newKeys = this.asymmetric.generateRSAKeyPair();

    // Sign new public key with old private key (for verification)
    const signature = this.asymmetric.sign(
      newKeys.publicKey,
      oldPrivateKey,
      passphrase
    );

    return {
      ...newKeys,
      previousKeySignature: signature
    };
  }
}
```

## Certificate Management and PKI

**Public Key Infrastructure Implementation**:

```javascript
const forge = require('node-forge');

class CertificateManager {
  // Generate self-signed certificate
  generateSelfSignedCertificate(keyPair, attributes) {
    const cert = forge.pki.createCertificate();

    cert.publicKey = keyPair.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    const attrs = attributes || [
      { name: 'countryName', value: 'US' },
      { name: 'organizationName', value: 'My Organization' },
      { name: 'commonName', value: 'localhost' }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Add extensions
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 2, value: '*.localhost' },
          { type: 7, ip: '127.0.0.1' }
        ]
      }
    ]);

    // Sign certificate
    cert.sign(keyPair.privateKey, forge.md.sha256.create());

    return cert;
  }

  // Generate Certificate Signing Request (CSR)
  generateCSR(keyPair, attributes) {
    const csr = forge.pki.createCertificationRequest();

    csr.publicKey = keyPair.publicKey;
    csr.setSubject(attributes);

    // Sign CSR
    csr.sign(keyPair.privateKey, forge.md.sha256.create());

    return csr;
  }

  // Verify certificate
  verifyCertificate(cert, caCert) {
    try {
      // Check if certificate is issued by CA
      const isValid = caCert.verify(cert);

      // Check validity period
      const now = new Date();
      const isNotExpired = cert.validity.notAfter > now;
      const isNotBeforeValid = cert.validity.notBefore <= now;

      return {
        isValid: isValid && isNotExpired && isNotBeforeValid,
        issuedBy: forge.pki.certificateFromPem(caCert).subject.getField('CN')?.value,
        subject: cert.subject.getField('CN')?.value,
        validFrom: cert.validity.notBefore,
        validUntil: cert.validity.notAfter,
        fingerprint: forge.md.sha1.create().update(
          forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
        ).digest().toHex()
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Certificate chain validation
  validateCertificateChain(certChain, trustedCAs) {
    const caStore = forge.pki.createCaStore();

    // Add trusted CAs to store
    trustedCAs.forEach(ca => {
      caStore.addCertificate(ca);
    });

    try {
      // Verify certificate chain
      forge.pki.verifyCertificateChain(caStore, certChain);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Extract certificate information
  getCertificateInfo(cert) {
    const subject = {};
    const issuer = {};

    cert.subject.attributes.forEach(attr => {
      subject[attr.name] = attr.value;
    });

    cert.issuer.attributes.forEach(attr => {
      issuer[attr.name] = attr.value;
    });

    return {
      subject,
      issuer,
      serialNumber: cert.serialNumber,
      validity: {
        notBefore: cert.validity.notBefore,
        notAfter: cert.validity.notAfter
      },
      extensions: cert.extensions.map(ext => ({
        name: ext.name,
        critical: ext.critical,
        value: ext.value
      })),
      fingerprint: {
        sha1: forge.md.sha1.create().update(
          forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
        ).digest().toHex(),
        sha256: forge.md.sha256.create().update(
          forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
        ).digest().toHex()
      }
    };
  }
}
```

## Key Derivation Functions

**Secure Key Derivation**:

```javascript
const crypto = require('crypto');

class KeyDerivation {
  // PBKDF2 (Password-Based Key Derivation Function 2)
  static pbkdf2(password, salt, iterations = 100000, keyLength = 32, digest = 'sha256') {
    if (!salt) {
      salt = crypto.randomBytes(16);
    }

    const key = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);

    return {
      key: key,
      salt: salt,
      iterations: iterations,
      algorithm: 'PBKDF2',
      digest: digest
    };
  }

  // scrypt (more secure than PBKDF2)
  static scrypt(password, salt, options = {}) {
    if (!salt) {
      salt = crypto.randomBytes(16);
    }

    const defaultOptions = {
      N: 16384,  // CPU/memory cost parameter
      r: 8,      // Block size parameter
      p: 1,      // Parallelization parameter
      maxmem: 32 * 1024 * 1024 // 32 MB max memory
    };

    const scryptOptions = { ...defaultOptions, ...options };
    const keyLength = options.keyLength || 32;

    const key = crypto.scryptSync(password, salt, keyLength, scryptOptions);

    return {
      key: key,
      salt: salt,
      options: scryptOptions,
      algorithm: 'scrypt'
    };
  }

  // Argon2 (winner of password hashing competition)
  static async argon2(password, salt, options = {}) {
    const argon2 = require('argon2');

    if (!salt) {
      salt = crypto.randomBytes(16);
    }

    const defaultOptions = {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
      salt: salt
    };

    const argon2Options = { ...defaultOptions, ...options };

    const hash = await argon2.hash(password, argon2Options);

    return {
      hash: hash,
      salt: salt,
      options: argon2Options,
      algorithm: 'Argon2id'
    };
  }

  // HKDF (HMAC-based Key Derivation Function)
  static hkdf(inputKeyMaterial, salt, info, keyLength = 32, digest = 'sha256') {
    if (!salt) {
      salt = Buffer.alloc(0); // Empty salt for HKDF
    }

    // Extract phase
    const prk = crypto.createHmac(digest, salt).update(inputKeyMaterial).digest();

    // Expand phase
    const iterations = Math.ceil(keyLength / crypto.createHash(digest).digest().length);
    let t = Buffer.alloc(0);
    let okm = Buffer.alloc(0);

    for (let i = 1; i <= iterations; i++) {
      const hmac = crypto.createHmac(digest, prk);
      hmac.update(t);
      hmac.update(info || '');
      hmac.update(Buffer.from([i]));
      t = hmac.digest();
      okm = Buffer.concat([okm, t]);
    }

    return {
      key: okm.slice(0, keyLength),
      salt: salt,
      info: info,
      algorithm: 'HKDF',
      digest: digest
    };
  }

  // Key stretching for additional security
  static stretchKey(key, stretching = 1000) {
    let stretched = key;

    for (let i = 0; i < stretching; i++) {
      stretched = crypto.createHash('sha256').update(stretched).digest();
    }

    return stretched;
  }

  // Derive multiple keys from master key
  static deriveMultipleKeys(masterKey, purposes, keyLength = 32) {
    const keys = {};

    purposes.forEach(purpose => {
      keys[purpose] = this.hkdf(
        masterKey,
        Buffer.from(purpose, 'utf8'),
        Buffer.from(`key-derivation-${purpose}`, 'utf8'),
        keyLength
      ).key;
    });

    return keys;
  }
}

// Example usage
async function demonstrateKeyDerivation() {
  const password = 'user-strong-password';

  // PBKDF2
  const pbkdf2Result = KeyDerivation.pbkdf2(password);
  console.log('PBKDF2 Key:', pbkdf2Result.key.toString('hex'));

  // scrypt
  const scryptResult = KeyDerivation.scrypt(password);
  console.log('scrypt Key:', scryptResult.key.toString('hex'));

  // Argon2
  const argon2Result = await KeyDerivation.argon2(password);
  console.log('Argon2 Hash:', argon2Result.hash);

  // Derive multiple keys from master key
  const masterKey = scryptResult.key;
  const multipleKeys = KeyDerivation.deriveMultipleKeys(masterKey, [
    'encryption',
    'authentication',
    'database'
  ]);

  console.log('Encryption Key:', multipleKeys.encryption.toString('hex'));
  console.log('Auth Key:', multipleKeys.authentication.toString('hex'));
  console.log('DB Key:', multipleKeys.database.toString('hex'));
}
```

## Cryptographic Protocols

**Secure Communication Protocols**:

```javascript
class SecureCommunication {
  constructor() {
    this.sessions = new Map();
  }

  // Diffie-Hellman Key Exchange
  performDHKeyExchange() {
    // Generate DH parameters
    const alice = crypto.getDiffieHellman('modp14'); // 2048-bit MODP group
    const bob = crypto.getDiffieHellman('modp14');

    // Generate key pairs
    alice.generateKeys();
    bob.generateKeys();

    // Exchange public keys and compute shared secret
    const aliceSecret = alice.computeSecret(bob.getPublicKey());
    const bobSecret = bob.computeSecret(alice.getPublicKey());

    // Verify both parties have the same shared secret
    const sharedSecretMatch = aliceSecret.equals(bobSecret);

    return {
      sharedSecret: aliceSecret,
      isValid: sharedSecretMatch,
      alicePublic: alice.getPublicKey(),
      bobPublic: bob.getPublicKey()
    };
  }

  // Elliptic Curve Diffie-Hellman (ECDH)
  performECDHKeyExchange() {
    const alice = crypto.createECDH('secp256k1');
    const bob = crypto.createECDH('secp256k1');

    // Generate key pairs
    alice.generateKeys();
    bob.generateKeys();

    // Compute shared secrets
    const aliceSecret = alice.computeSecret(bob.getPublicKey());
    const bobSecret = bob.computeSecret(alice.getPublicKey());

    return {
      sharedSecret: aliceSecret,
      isValid: aliceSecret.equals(bobSecret),
      alicePublic: alice.getPublicKey(),
      bobPublic: bob.getPublicKey()
    };
  }

  // Secure session establishment
  establishSecureSession(sessionId, sharedSecret) {
    // Derive session keys from shared secret
    const sessionKeys = KeyDerivation.deriveMultipleKeys(sharedSecret, [
      'encryption',
      'authentication',
      'integrity'
    ]);

    const session = {
      id: sessionId,
      establishedAt: new Date(),
      keys: sessionKeys,
      messageCounter: 0
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Secure message encryption
  encryptMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const aes = new SymmetricEncryption();

    // Encrypt message
    const encrypted = aes.encrypt(message, session.keys.encryption);

    // Add message authentication code
    const mac = crypto.createHmac('sha256', session.keys.authentication)
      .update(encrypted.ciphertext)
      .digest('hex');

    // Increment message counter
    session.messageCounter++;

    return {
      sessionId: sessionId,
      messageId: session.messageCounter,
      encrypted: encrypted,
      mac: mac,
      timestamp: new Date().toISOString()
    };
  }

  // Secure message decryption
  decryptMessage(encryptedMessage) {
    const session = this.sessions.get(encryptedMessage.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify message authentication code
    const expectedMac = crypto.createHmac('sha256', session.keys.authentication)
      .update(encryptedMessage.encrypted.ciphertext)
      .digest('hex');

    if (expectedMac !== encryptedMessage.mac) {
      throw new Error('Message authentication failed');
    }

    // Decrypt message
    const aes = new SymmetricEncryption();
    const decrypted = aes.decrypt(encryptedMessage.encrypted, session.keys.encryption);

    return {
      message: decrypted,
      messageId: encryptedMessage.messageId,
      sessionId: encryptedMessage.sessionId,
      timestamp: encryptedMessage.timestamp
    };
  }

  // Perfect Forward Secrecy - rotate session keys
  rotateSessionKeys(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Generate new shared secret using ECDH
    const keyExchange = this.performECDHKeyExchange();

    // Derive new session keys
    const newKeys = KeyDerivation.deriveMultipleKeys(keyExchange.sharedSecret, [
      'encryption',
      'authentication',
      'integrity'
    ]);

    // Update session
    session.keys = newKeys;
    session.lastRotation = new Date();

    return session;
  }
}
```

## Cryptographic Best Practices

### Secure Random Number Generation

```javascript
class SecureRandom {
  // Generate cryptographically secure random bytes
  static generateBytes(length) {
    return crypto.randomBytes(length);
  }

  // Generate secure random integers
  static generateInt(min, max) {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    let randomValue;

    do {
      randomValue = crypto.randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded);
    } while (randomValue >= Math.floor(2 ** (bytesNeeded * 8) / range) * range);

    return min + (randomValue % range);
  }

  // Generate secure random string
  static generateString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(this.generateInt(0, charset.length - 1));
    }
    return result;
  }

  // Generate UUID v4
  static generateUUID() {
    return crypto.randomUUID();
  }

  // Test randomness quality (basic statistical tests)
  static testRandomness(samples = 10000) {
    const bytes = this.generateBytes(samples);
    const bitCounts = [0, 0];

    // Count 0s and 1s
    for (let i = 0; i < bytes.length; i++) {
      for (let bit = 0; bit < 8; bit++) {
        bitCounts[(bytes[i] >> bit) & 1]++;
      }
    }

    const totalBits = samples * 8;
    const ratio = bitCounts[1] / totalBits;
    const isBalanced = Math.abs(ratio - 0.5) < 0.01; // Within 1% of 50/50

    return {
      totalBits,
      ones: bitCounts[1],
      zeros: bitCounts[0],
      ratio,
      isBalanced
    };
  }
}
```

### Timing Attack Prevention

```javascript
class TimingSafeOperations {
  // Constant-time string comparison
  static constantTimeEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  // Constant-time buffer comparison
  static constantTimeBufferEqual(a, b) {
    return crypto.timingSafeEqual(a, b);
  }

  // Add artificial delay to prevent timing analysis
  static async addRandomDelay(minMs = 50, maxMs = 200) {
    const delay = SecureRandom.generateInt(minMs, maxMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Constant-time password verification
  static async verifyPasswordConstantTime(inputPassword, storedHash) {
    // Always perform the same operations regardless of early failures
    const startTime = process.hrtime.bigint();

    let isValid = false;
    try {
      isValid = await bcrypt.compare(inputPassword, storedHash);
    } catch (error) {
      // Continue with timing normalization even on error
    }

    // Normalize timing to prevent timing attacks
    const elapsedTime = process.hrtime.bigint() - startTime;
    const minTime = BigInt(50_000_000); // 50ms in nanoseconds

    if (elapsedTime < minTime) {
      const remainingTime = Number(minTime - elapsedTime) / 1_000_000; // Convert to ms
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    return isValid;
  }
}
```

## Cryptographic Compliance and Standards

```javascript
class CryptoCompliance {
  // FIPS 140-2 compliant algorithms
  static getFIPSApprovedAlgorithms() {
    return {
      symmetricEncryption: ['AES-128', 'AES-192', 'AES-256'],
      asymmetricEncryption: ['RSA-2048', 'RSA-3072', 'RSA-4096'],
      digitalSignatures: ['RSA-PSS', 'ECDSA'],
      hashFunctions: ['SHA-224', 'SHA-256', 'SHA-384', 'SHA-512'],
      keyDerivation: ['PBKDF2', 'HKDF'],
      messageAuth: ['HMAC-SHA-256', 'HMAC-SHA-384', 'HMAC-SHA-512']
    };
  }

  // Validate cryptographic configuration
  static validateCryptoConfig(config) {
    const approved = this.getFIPSApprovedAlgorithms();
    const violations = [];

    if (!approved.symmetricEncryption.includes(config.symmetricAlgorithm)) {
      violations.push(`Non-approved symmetric algorithm: ${config.symmetricAlgorithm}`);
    }

    if (config.keyLength < 2048) {
      violations.push(`Key length too short: ${config.keyLength} bits`);
    }

    if (!approved.hashFunctions.includes(config.hashAlgorithm)) {
      violations.push(`Non-approved hash function: ${config.hashAlgorithm}`);
    }

    return {
      isCompliant: violations.length === 0,
      violations
    };
  }

  // Generate compliance report
  static generateComplianceReport(implementation) {
    const report = {
      timestamp: new Date().toISOString(),
      standards: ['FIPS 140-2', 'NIST SP 800-53'],
      algorithms: {},
      keyManagement: {},
      recommendations: []
    };

    // Analyze implementation
    if (implementation.encryption) {
      report.algorithms.encryption = {
        algorithm: implementation.encryption.algorithm,
        keyLength: implementation.encryption.keyLength,
        mode: implementation.encryption.mode,
        compliant: this.validateCryptoConfig(implementation.encryption).isCompliant
      };
    }

    // Add recommendations
    if (report.algorithms.encryption && !report.algorithms.encryption.compliant) {
      report.recommendations.push('Upgrade to FIPS 140-2 approved encryption algorithms');
    }

    return report;
  }
}
```

Cryptography is fundamental to modern application security. Always use well-established libraries, follow current standards, implement proper key management, and regularly update cryptographic implementations to address new threats and vulnerabilities.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
