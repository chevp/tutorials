# API Gateway Tutorial

## Introduction

An API Gateway is a crucial component in microservices architecture that acts as a single entry point for all client requests. It provides a unified interface to multiple backend services, handling cross-cutting concerns like authentication, rate limiting, load balancing, and request/response transformation.

## What is an API Gateway?

An API Gateway is a server that sits between clients and backend services, acting as a reverse proxy that routes requests to appropriate services. It centralizes common functionality and provides a consistent interface for clients while abstracting the complexity of the underlying microservices architecture.

### Key Functions

1. **Request Routing**: Direct requests to appropriate backend services
2. **Authentication & Authorization**: Validate and authorize client requests
3. **Rate Limiting**: Control request frequency to prevent abuse
4. **Load Balancing**: Distribute requests across service instances
5. **Request/Response Transformation**: Modify requests and responses
6. **Caching**: Store frequently requested data
7. **Monitoring & Analytics**: Track API usage and performance
8. **SSL Termination**: Handle TLS encryption/decryption

## Benefits of API Gateway

### Single Entry Point
Clients interact with one endpoint instead of multiple services.

### Cross-Cutting Concerns
Centralized handling of authentication, logging, and rate limiting.

### Service Composition
Aggregate responses from multiple services into single response.

### Protocol Translation
Support different protocols (HTTP, WebSocket, gRPC).

### Backend Protection
Shield internal services from direct external access.

### Analytics & Monitoring
Centralized logging and metrics collection.

## Popular API Gateway Solutions

| Solution | Type | Best For | Key Features |
|----------|------|----------|-------------|
| AWS API Gateway | Cloud | AWS ecosystem | Serverless, managed service |
| Kong | Open Source/Enterprise | High performance | Plugin ecosystem, Lua scripting |
| Nginx Plus | Commercial | High throughput | Battle-tested, extensive features |
| Zuul | Open Source | Spring ecosystem | Java-based, Netflix stack |
| Envoy Proxy | Open Source | Service mesh | Modern architecture, observability |
| Express Gateway | Open Source | Node.js apps | JavaScript-based, microservices |

## Kong API Gateway Implementation

### Installation with Docker

```bash
# Create a Docker network
docker network create kong-net

# Start a PostgreSQL database
docker run -d --name kong-database \
  --network=kong-net \
  -p 5432:5432 \
  -e "POSTGRES_USER=kong" \
  -e "POSTGRES_DB=kong" \
  -e "POSTGRES_PASSWORD=kong" \
  postgres:13

# Bootstrap the database
docker run --rm \
  --network=kong-net \
  -e "KONG_DATABASE=postgres" \
  -e "KONG_PG_HOST=kong-database" \
  -e "KONG_PG_USER=kong" \
  -e "KONG_PG_PASSWORD=kong" \
  -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" \
  kong/kong-gateway:2.8.1.4-alpine kong migrations bootstrap

# Start Kong
docker run -d --name kong \
  --network=kong-net \
  -e "KONG_DATABASE=postgres" \
  -e "KONG_PG_HOST=kong-database" \
  -e "KONG_PG_USER=kong" \
  -e "KONG_PG_PASSWORD=kong" \
  -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
  -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
  -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
  -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
  -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
  -p 8000:8000 \
  -p 8443:8443 \
  -p 8001:8001 \
  -p 8444:8444 \
  kong/kong-gateway:2.8.1.4-alpine

# Install Konga (Kong Admin UI)
docker run -d --name konga \
  --network=kong-net \
  -p 1337:1337 \
  pantsel/konga
```

### Kong Configuration Examples

#### Service Registration
```bash
# Register a service
curl -i -X POST http://localhost:8001/services/ \
  --data "name=user-service" \
  --data "url=http://user-api:3000"

# Create a route for the service
curl -i -X POST http://localhost:8001/services/user-service/routes \
  --data "hosts[]=api.example.com" \
  --data "paths[]=/users"

# Test the route
curl -i -X GET http://localhost:8000/users \
  --header "Host: api.example.com"
```

#### Authentication Plugin
```bash
# Enable JWT authentication
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=jwt" \
  --data "config.secret_is_base64=false" \
  --data "config.key_claim_name=iss"

# Create a consumer
curl -d "username=john&custom_id=123" \
  http://localhost:8001/consumers/

# Create JWT credentials for consumer
curl -X POST http://localhost:8001/consumers/john/jwt \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "key=user-key"
```

#### Rate Limiting Plugin
```bash
# Enable rate limiting (100 requests per hour)
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=rate-limiting" \
  --data "config.hour=100" \
  --data "config.policy=local"
```

## Custom API Gateway with Express.js

### Basic Gateway Implementation

```javascript
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Redis = require('redis');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const redisClient = Redis.createClient();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Service registry
const services = {
  'user-service': {
    url: 'http://localhost:3001',
    healthEndpoint: '/health'
  },
  'order-service': {
    url: 'http://localhost:3002',
    healthEndpoint: '/health'
  },
  'product-service': {
    url: 'http://localhost:3003',
    healthEndpoint: '/health'
  },
  'payment-service': {
    url: 'http://localhost:3004',
    healthEndpoint: '/health'
  }
};

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Rate limiting middleware
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new rateLimit.MemoryStore(),
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    }
  });
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many authentication attempts, please try again later'
);

// Request logging middleware
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);

    // Store metrics in Redis
    const key = `metrics:${req.method}:${req.path}:${new Date().toISOString().slice(0, 10)}`;
    redisClient.hincrby(key, 'requests', 1);
    redisClient.hincrby(key, 'total_duration', duration);
    redisClient.expire(key, 86400 * 7); // Keep for 7 days

    originalEnd.call(res, chunk, encoding);
  };

  next();
}

app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Service health check
app.get('/health/:service', async (req, res) => {
  const serviceName = req.params.service;
  const service = services[serviceName];

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  try {
    const axios = require('axios');
    const healthCheck = await axios.get(
      `${service.url}${service.healthEndpoint}`,
      { timeout: 5000 }
    );

    res.json({
      service: serviceName,
      status: 'healthy',
      response: healthCheck.data
    });
  } catch (error) {
    res.status(503).json({
      service: serviceName,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Authentication endpoints (no service proxy)
app.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate credentials (would typically check against database)
    const user = await validateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store token info in Redis for tracking
    await redisClient.setex(`token_${token}`, 86400, JSON.stringify({
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString()
    }));

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/logout', authenticateToken, async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];

  try {
    // Add token to blacklist
    const decoded = jwt.decode(token);
    const expiresAt = decoded.exp;
    const now = Math.floor(Date.now() / 1000);
    const ttl = expiresAt - now;

    if (ttl > 0) {
      await redisClient.setex(`blacklist_${token}`, ttl, 'true');
    }

    // Remove token info
    await redisClient.del(`token_${token}`);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request transformation middleware
function transformRequest(req, res, next) {
  // Add correlation ID
  if (!req.headers['x-correlation-id']) {
    req.headers['x-correlation-id'] = generateCorrelationId();
  }

  // Add user context to request
  if (req.user) {
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-role'] = req.user.role;
  }

  // Remove sensitive headers before forwarding
  delete req.headers['authorization'];

  next();
}

// Response transformation middleware
function transformResponse(proxyRes, req, res) {
  // Add CORS headers
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });

  // Add gateway headers
  res.set({
    'X-Gateway': 'API-Gateway-v1.0',
    'X-Correlation-ID': req.headers['x-correlation-id']
  });
}

// Service proxy routes
Object.keys(services).forEach(serviceName => {
  const service = services[serviceName];

  // Create proxy middleware
  const proxy = httpProxy.createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Remove service prefix from path
      return path.replace(`/${serviceName}`, '');
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add custom headers
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      proxyReq.setHeader('X-Gateway-Service', serviceName);
    },
    onProxyRes: transformResponse,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName,
        correlationId: req.headers['x-correlation-id']
      });
    }
  });

  // Apply middleware chain for each service
  app.use(
    `/${serviceName}`,
    generalLimiter,
    authenticateToken,
    transformRequest,
    proxy
  );
});

// Aggregation endpoint (compose multiple service responses)
app.get('/api/user-profile/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const axios = require('axios');

    // Fetch data from multiple services concurrently
    const [userResponse, orderResponse, preferenceResponse] = await Promise.allSettled([
      axios.get(`${services['user-service'].url}/users/${userId}`, {
        headers: { 'X-User-ID': req.user.id, 'X-User-Role': req.user.role }
      }),
      axios.get(`${services['order-service'].url}/users/${userId}/orders`, {
        headers: { 'X-User-ID': req.user.id, 'X-User-Role': req.user.role }
      }),
      axios.get(`${services['user-service'].url}/users/${userId}/preferences`, {
        headers: { 'X-User-ID': req.user.id, 'X-User-Role': req.user.role }
      })
    ]);

    // Compose response
    const profile = {
      user: userResponse.status === 'fulfilled' ? userResponse.value.data : null,
      orders: orderResponse.status === 'fulfilled' ? orderResponse.value.data : [],
      preferences: preferenceResponse.status === 'fulfilled' ? preferenceResponse.value.data : {}
    };

    // Add metadata about partial failures
    const errors = [];
    if (userResponse.status === 'rejected') errors.push('user-service');
    if (orderResponse.status === 'rejected') errors.push('order-service');
    if (preferenceResponse.status === 'rejected') errors.push('preference-service');

    res.json({
      data: profile,
      ...(errors.length > 0 && { partial: true, failedServices: errors })
    });
  } catch (error) {
    console.error('Profile aggregation error:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      correlationId: req.headers['x-correlation-id']
    });
  }
});

// Circuit breaker implementation
class CircuitBreaker {
  constructor(name, threshold = 5, timeout = 60000, monitoringPeriod = 10000) {
    this.name = name;
    this.threshold = threshold;
    this.timeout = timeout;
    this.monitoringPeriod = monitoringPeriod;
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await fn();

      // Success - reset on half-open or closed
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
      }

      return result;
    } catch (error) {
      this.failures++;

      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.timeout;
      }

      throw error;
    }
  }

  getState() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      nextAttempt: new Date(this.nextAttempt).toISOString()
    };
  }
}

// Circuit breakers for each service
const circuitBreakers = {};
Object.keys(services).forEach(serviceName => {
  circuitBreakers[serviceName] = new CircuitBreaker(serviceName);
});

// Circuit breaker endpoint
app.get('/circuit-breakers', (req, res) => {
  const states = Object.values(circuitBreakers).map(cb => cb.getState());
  res.json({ circuitBreakers: states });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const keys = await redisClient.keys('metrics:*');
    const metrics = {};

    for (const key of keys) {
      const data = await redisClient.hgetall(key);
      const [, method, path, date] = key.split(':');

      if (!metrics[date]) metrics[date] = {};
      if (!metrics[date][method]) metrics[date][method] = {};

      metrics[date][method][path] = {
        requests: parseInt(data.requests) || 0,
        averageLatency: data.requests > 0
          ? Math.round(parseInt(data.total_duration) / parseInt(data.requests))
          : 0
      };
    }

    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Utility functions
function generateCorrelationId() {
  return `gw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function validateUser(email, password) {
  // Mock user validation - replace with actual database lookup
  const users = [
    { id: 1, email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { id: 2, email: 'user@example.com', password: 'user123', role: 'user' }
  ];

  return users.find(u => u.email === email && u.password === password);
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Gateway error:', error);

  res.status(500).json({
    error: 'Internal gateway error',
    correlationId: req.headers['x-correlation-id'],
    timestamp: new Date().toISOString()
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available services:', Object.keys(services));
});

module.exports = app;
```

## AWS API Gateway Implementation

### Using AWS CDK (TypeScript)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Cognito User Pool for authentication
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'api-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true
      }
    });

    // Lambda functions for different services
    const userServiceLambda = new lambda.Function(this, 'UserServiceFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/user-service'),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: userPoolClient.userPoolClientId
      }
    });

    const orderServiceLambda = new lambda.Function(this, 'OrderServiceFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/order-service')
    });

    const productServiceLambda = new lambda.Function(this, 'ProductServiceFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/product-service')
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'Microservices API',
      description: 'API Gateway for microservices',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true
      }
    });

    // Create Cognito authorizer
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this, 'CognitoAuthorizer', {
        cognitoUserPools: [userPool],
        identitySource: 'method.request.header.Authorization'
      }
    );

    // Create API Key for partner access
    const apiKey = api.addApiKey('PartnerApiKey', {
      apiKeyName: 'partner-api-key'
    });

    const usagePlan = api.addUsagePlan('UsagePlan', {
      name: 'partner-usage-plan',
      throttle: {
        rateLimit: 1000,
        burstLimit: 2000
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.MONTH
      }
    });

    usagePlan.addApiKey(apiKey);

    // Request/Response models
    const errorModel = api.addModel('ErrorModel', {
      contentType: 'application/json',
      modelName: 'ErrorModel',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          error: { type: apigateway.JsonSchemaType.STRING },
          message: { type: apigateway.JsonSchemaType.STRING },
          correlationId: { type: apigateway.JsonSchemaType.STRING }
        },
        required: ['error', 'message']
      }
    });

    // Request validators
    const requestValidator = api.addRequestValidator('RequestValidator', {
      validateRequestBody: true,
      validateRequestParameters: true
    });

    // User service routes
    const usersResource = api.root.addResource('users');

    // GET /users
    usersResource.addMethod('GET',
      new apigateway.LambdaIntegration(userServiceLambda, {
        requestTemplates: {
          'application/json': JSON.stringify({
            httpMethod: '$context.httpMethod',
            path: '$context.path',
            queryStringParameters: '$input.params().querystring',
            headers: '$input.params().header',
            body: '$input.body',
            requestContext: {
              requestId: '$context.requestId',
              identity: {
                userArn: '$context.identity.userArn',
                cognitoAuthenticationType: '$context.identity.cognitoAuthenticationType'
              }
            }
          })
        }
      }), {
        authorizer: cognitoAuthorizer,
        requestValidator,
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true
            }
          },
          {
            statusCode: '400',
            responseModels: {
              'application/json': errorModel
            }
          },
          {
            statusCode: '500',
            responseModels: {
              'application/json': errorModel
            }
          }
        ]
      }
    );

    // POST /users
    usersResource.addMethod('POST',
      new apigateway.LambdaIntegration(userServiceLambda), {
        authorizer: cognitoAuthorizer,
        requestValidator
      }
    );

    // GET /users/{id}
    const userResource = usersResource.addResource('{id}');
    userResource.addMethod('GET',
      new apigateway.LambdaIntegration(userServiceLambda), {
        authorizer: cognitoAuthorizer,
        requestParameters: {
          'method.request.path.id': true
        }
      }
    );

    // Order service routes
    const ordersResource = api.root.addResource('orders');
    ordersResource.addMethod('GET',
      new apigateway.LambdaIntegration(orderServiceLambda), {
        authorizer: cognitoAuthorizer
      }
    );

    ordersResource.addMethod('POST',
      new apigateway.LambdaIntegration(orderServiceLambda), {
        authorizer: cognitoAuthorizer
      }
    );

    // Product service routes (public access with API key)
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET',
      new apigateway.LambdaIntegration(productServiceLambda), {
        apiKeyRequired: true
      }
    );

    usagePlan.addApiStage({
      stage: api.deploymentStage,
      throttle: [
        {
          method: productsResource.getMethod('GET'),
          throttle: {
            rateLimit: 100,
            burstLimit: 200
          }
        }
      ]
    });

    // Custom domain (optional)
    const domainName = api.addDomainName('CustomDomain', {
      domainName: 'api.example.com',
      certificate: /* your ACM certificate */,
      endpointType: apigateway.EndpointType.REGIONAL
    });

    // CloudWatch Log Group for API Gateway
    const logGroup = new logs.LogGroup(this, 'ApiGatewayLogGroup', {
      logGroupName: `/aws/apigateway/${api.restApiName}`,
      retention: logs.RetentionDays.TWO_WEEKS
    });

    // Output important values
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });

    new cdk.CfnOutput(this, 'ApiKey', {
      value: apiKey.keyId,
      description: 'API Key ID'
    });
  }
}
```

### Lambda Function Example

```javascript
// lambda/user-service/index.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.USERS_TABLE || 'users';

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, queryStringParameters, body } = event;
    const pathParameters = event.pathParameters || {};

    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Content-Type': 'application/json'
    };

    let response;

    switch (httpMethod) {
      case 'GET':
        if (pathParameters.id) {
          response = await getUser(pathParameters.id);
        } else {
          response = await getUsers(queryStringParameters);
        }
        break;

      case 'POST':
        response = await createUser(JSON.parse(body || '{}'));
        break;

      case 'PUT':
        response = await updateUser(pathParameters.id, JSON.parse(body || '{}'));
        break;

      case 'DELETE':
        response = await deleteUser(pathParameters.id);
        break;

      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      ...response,
      headers
    };

  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        correlationId: event.requestContext?.requestId
      })
    };
  }
};

async function getUsers(queryParams = {}) {
  const { limit = 20, lastKey } = queryParams;

  const params = {
    TableName: TABLE_NAME,
    Limit: parseInt(limit)
  };

  if (lastKey) {
    params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
  }

  const result = await dynamodb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      users: result.Items,
      lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
      count: result.Count
    })
  };
}

async function getUser(userId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: userId }
  };

  const result = await dynamodb.get(params).promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'User not found' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  };
}

async function createUser(userData) {
  const user = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const params = {
    TableName: TABLE_NAME,
    Item: user,
    ConditionExpression: 'attribute_not_exists(id)'
  };

  await dynamodb.put(params).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(user)
  };
}

async function updateUser(userId, updates) {
  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updates[key];
    }
  });

  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();
  updateExpression.push('#updatedAt = :updatedAt');

  const params = {
    TableName: TABLE_NAME,
    Key: { id: userId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: 'attribute_exists(id)',
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    throw error;
  }
}

async function deleteUser(userId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: userId },
    ConditionExpression: 'attribute_exists(id)'
  };

  try {
    await dynamodb.delete(params).promise();

    return {
      statusCode: 204,
      body: ''
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    throw error;
  }
}
```

## Best Practices

### Security
1. **Always authenticate requests** to backend services
2. **Use HTTPS** for all communications
3. **Implement proper CORS** policies
4. **Validate all inputs** before forwarding
5. **Hide internal service details** from clients

### Performance
1. **Implement caching** for frequently accessed data
2. **Use connection pooling** for backend services
3. **Enable compression** for responses
4. **Set appropriate timeouts**
5. **Implement circuit breakers** for fault tolerance

### Monitoring
1. **Log all requests and responses**
2. **Monitor service health** continuously
3. **Track performance metrics** (latency, throughput)
4. **Set up alerts** for anomalies
5. **Implement distributed tracing**

### Scalability
1. **Use load balancers** behind the gateway
2. **Implement auto-scaling** based on metrics
3. **Cache frequently accessed data**
4. **Use CDN** for static content
5. **Optimize database queries**

## Testing API Gateways

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Load test"
  defaults:
    headers:
      Authorization: 'Bearer YOUR_JWT_TOKEN'

scenarios:
  - name: "User operations"
    weight: 60
    flow:
      - get:
          url: "/user-service/users"
      - post:
          url: "/user-service/users"
          json:
            name: "Test User {{ $randomString() }}"
            email: "test{{ $randomInt(1000, 9999) }}@example.com"

  - name: "Product browsing"
    weight: 40
    flow:
      - get:
          url: "/product-service/products"
      - get:
          url: "/product-service/products/{{ $randomInt(1, 100) }}"
```

```bash
artillery run artillery-config.yml
```

### Integration Testing

```javascript
// test/gateway.test.js
const request = require('supertest');
const app = require('../gateway');

describe('API Gateway', () => {
  let authToken;

  beforeAll(async () => {
    // Get authentication token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('Authentication', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Service Routing', () => {
    test('should route requests to user service', async () => {
      const response = await request(app)
        .get('/user-service/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
    });

    test('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/user-service/users');

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/user-service/users')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle service unavailable errors', async () => {
      // Mock service failure
      const response = await request(app)
        .get('/nonexistent-service/test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
```

## Conclusion

API Gateways are essential components in modern distributed architectures, providing a centralized point for managing API traffic, security, and cross-cutting concerns. Whether using managed services like AWS API Gateway or building custom solutions, the key is to implement proper authentication, monitoring, and resilience patterns.

Choose the right approach based on your requirements:
- **Managed services** (AWS API Gateway, Azure API Management) for simplicity
- **Open source solutions** (Kong, Zuul) for flexibility
- **Custom implementations** for specific requirements

Remember to focus on security, performance, and observability when implementing your API Gateway solution.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).