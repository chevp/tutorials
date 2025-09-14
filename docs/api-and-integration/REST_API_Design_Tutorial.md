# REST API Design Tutorial

## Introduction

REST (Representational State Transfer) is an architectural style for designing networked applications. This tutorial covers best practices for designing robust, scalable REST APIs that follow industry standards and conventions.

## What is REST?

REST is an architectural style that defines a set of constraints for creating web services. RESTful APIs use HTTP methods to perform operations on resources identified by URLs.

### Key Principles of REST

1. **Stateless**: Each request contains all information needed to process it
2. **Client-Server**: Clear separation between client and server
3. **Cacheable**: Responses should be cacheable when appropriate
4. **Uniform Interface**: Consistent interface across the API
5. **Layered System**: Architecture can have multiple layers
6. **Code on Demand** (optional): Server can send executable code

## HTTP Methods and Their Usage

### GET - Retrieve Resources
```http
GET /api/users          # Get all users
GET /api/users/123      # Get specific user
GET /api/users/123/orders # Get user's orders
```

### POST - Create Resources
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### PUT - Update/Replace Resources
```http
PUT /api/users/123
Content-Type: application/json

{
  "id": 123,
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

### PATCH - Partial Updates
```http
PATCH /api/users/123
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

### DELETE - Remove Resources
```http
DELETE /api/users/123
```

## URL Design Best Practices

### Resource Naming
- Use nouns, not verbs: `/users` not `/getUsers`
- Use plural nouns: `/users` not `/user`
- Use lowercase: `/users` not `/Users`
- Use hyphens for multi-word resources: `/user-profiles`

### Resource Hierarchy
```http
# Good hierarchy
/api/users/123/orders/456/items
/api/companies/789/employees/123

# Avoid deep nesting (max 2-3 levels)
/api/companies/789/departments/456/teams/123/employees/789
```

### Query Parameters
```http
# Filtering
GET /api/users?status=active&role=admin

# Pagination
GET /api/users?page=2&limit=20

# Sorting
GET /api/users?sort=name&order=asc

# Searching
GET /api/users?search=john
```

## HTTP Status Codes

### Success Codes
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE

### Client Error Codes
- `400 Bad Request` - Invalid request syntax
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation errors

### Server Error Codes
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Temporary unavailability

## Request/Response Format

### JSON Structure
```json
{
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "version": "1.0",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "abc123"
  }
}
```

## Pagination

### Offset-Based Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Cursor-Based Pagination
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTAwfQ==",
    "prev_cursor": "eyJpZCI6NjB9",
    "has_more": true
  }
}
```

## Versioning Strategies

### URL Versioning
```http
GET /api/v1/users
GET /api/v2/users
```

### Header Versioning
```http
GET /api/users
Accept: application/vnd.api+json;version=1
```

### Query Parameter Versioning
```http
GET /api/users?version=1
```

## Authentication and Security

### Bearer Token Authentication
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key Authentication
```http
X-API-Key: your-api-key-here
```

### Security Headers
```http
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Response when rate limited
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

## HATEOAS (Hypermedia as the Engine of Application State)

### Link Relations
```json
{
  "data": {
    "id": 123,
    "name": "John Doe"
  },
  "_links": {
    "self": { "href": "/api/users/123" },
    "orders": { "href": "/api/users/123/orders" },
    "edit": { "href": "/api/users/123", "method": "PUT" },
    "delete": { "href": "/api/users/123", "method": "DELETE" }
  }
}
```

## Content Negotiation

### Accept Headers
```http
Accept: application/json
Accept: application/xml
Accept: application/json; charset=utf-8
```

### Response Content-Type
```http
Content-Type: application/json; charset=utf-8
```

## Caching

### Cache-Control Headers
```http
Cache-Control: public, max-age=3600
Cache-Control: private, no-cache
Cache-Control: no-store
```

### ETags for Conditional Requests
```http
# Server response
ETag: "abc123"

# Client conditional request
If-None-Match: "abc123"
```

## API Documentation

### OpenAPI/Swagger Example
```yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
```

## Complete Example: Node.js Express API

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP'
    }
  }
});
app.use('/api/', limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: req.id
    }
  });
});

// Users routes
const usersRouter = express.Router();

// GET /api/users
usersRouter.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = 'created_at' } = req.query;

    const users = await User.find({
      ...(search && {
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      })
    })
    .sort({ [sort]: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users
usersRouter.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: [
            ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
          ]
        }
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Email already exists'
        }
      });
    }
    next(error);
  }
});

// GET /api/users/:id
usersRouter.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      data: user,
      _links: {
        self: { href: `/api/users/${user._id}` },
        orders: { href: `/api/users/${user._id}/orders` },
        edit: { href: `/api/users/${user._id}`, method: 'PUT' },
        delete: { href: `/api/users/${user._id}`, method: 'DELETE' }
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Testing REST APIs

### Using cURL
```bash
# GET request
curl -X GET "https://api.example.com/users?page=1&limit=10" \
  -H "Authorization: Bearer token" \
  -H "Accept: application/json"

# POST request
curl -X POST "https://api.example.com/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Using Postman
1. Set up environment variables for base URL and tokens
2. Create collections for different endpoints
3. Add tests for response validation
4. Use pre-request scripts for dynamic data

### Automated Testing with Jest
```javascript
const request = require('supertest');
const app = require('../app');

describe('Users API', () => {
  test('GET /api/users should return users list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/users should create new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe(newUser.name);
  });
});
```

## Best Practices Summary

1. **Consistency**: Use consistent naming conventions and response formats
2. **Documentation**: Provide comprehensive API documentation
3. **Versioning**: Plan for API evolution with proper versioning
4. **Security**: Implement proper authentication and authorization
5. **Error Handling**: Return meaningful error messages and status codes
6. **Performance**: Implement caching, pagination, and rate limiting
7. **Testing**: Write comprehensive tests for all endpoints
8. **Monitoring**: Add logging and monitoring for API usage

## Conclusion

Well-designed REST APIs are the foundation of modern web applications. By following these best practices and conventions, you can create APIs that are intuitive, scalable, and maintainable.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).