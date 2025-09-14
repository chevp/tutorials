# GraphQL Tutorial

## Introduction

GraphQL is a query language for APIs and a runtime for executing those queries with your existing data. Developed by Facebook in 2012 and open-sourced in 2015, GraphQL provides a more efficient, powerful, and flexible alternative to REST.

## What is GraphQL?

GraphQL is a query language that allows clients to request exactly the data they need, nothing more, nothing less. It provides a single endpoint for all data operations and uses a strongly typed schema to define the API structure.

### Key Benefits

1. **Single Endpoint**: One URL for all API operations
2. **Precise Data Fetching**: Get exactly what you request
3. **Strong Type System**: Schema-first development
4. **Introspection**: API is self-documenting
5. **Real-time Subscriptions**: Built-in support for live updates
6. **Backward Compatibility**: Evolve API without versioning

## GraphQL vs REST

| Feature | GraphQL | REST |
|---------|---------|------|
| Endpoints | Single endpoint | Multiple endpoints |
| Data Fetching | Precise, no over/under-fetching | Often over/under-fetches |
| Network Requests | Typically one request | Often multiple requests |
| Caching | More complex | Simple HTTP caching |
| Learning Curve | Steeper | Gentler |
| Tooling | Excellent introspection | Manual documentation |

## Core Concepts

### Schema
The schema defines the structure of your API, including types, queries, mutations, and subscriptions.

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

type Subscription {
  userCreated: User!
  postUpdated(postId: ID!): Post!
}
```

### Queries
Queries are read operations that fetch data from the server.

```graphql
# Simple query
query {
  users {
    id
    name
    email
  }
}

# Query with arguments
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    posts {
      id
      title
      createdAt
    }
  }
}

# Nested query
query {
  posts {
    id
    title
    author {
      name
      email
    }
  }
}
```

### Mutations
Mutations are write operations that modify data on the server.

```graphql
# Create user mutation
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# Update user mutation
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
  }
}
```

### Subscriptions
Subscriptions enable real-time updates from the server to client.

```graphql
subscription {
  userCreated {
    id
    name
    email
  }
}

subscription PostUpdates($postId: ID!) {
  postUpdated(postId: $postId) {
    id
    title
    content
  }
}
```

## Setting Up a GraphQL Server

### Using Apollo Server (Node.js)

#### Installation
```bash
npm init -y
npm install apollo-server-express express graphql
npm install --save-dev nodemon
```

#### Basic Server Setup
```javascript
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

// Type definitions
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    createPost(title: String!, content: String!, authorId: ID!): Post!
  }

  type Subscription {
    userCreated: User!
    postCreated: Post!
  }
`;

// Sample data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Basics',
    content: 'Learning GraphQL fundamentals',
    authorId: '1',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Advanced GraphQL',
    content: 'Deep dive into GraphQL features',
    authorId: '2',
    createdAt: '2024-01-16T14:30:00Z'
  }
];

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    user: (parent, { id }) => users.find(user => user.id === id),
    posts: () => posts.map(post => ({
      ...post,
      author: users.find(user => user.id === post.authorId)
    })),
    post: (parent, { id }) => {
      const post = posts.find(p => p.id === id);
      return post ? {
        ...post,
        author: users.find(user => user.id === post.authorId)
      } : null;
    }
  },

  Mutation: {
    createUser: (parent, { input }) => {
      const newUser = {
        id: String(users.length + 1),
        ...input
      };
      users.push(newUser);

      // Trigger subscription
      pubsub.publish('USER_CREATED', { userCreated: newUser });

      return newUser;
    },

    updateUser: (parent, { id, input }) => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex] = { ...users[userIndex], ...input };
      return users[userIndex];
    },

    deleteUser: (parent, { id }) => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        return false;
      }

      users.splice(userIndex, 1);
      return true;
    },

    createPost: (parent, { title, content, authorId }) => {
      const author = users.find(user => user.id === authorId);
      if (!author) {
        throw new Error('Author not found');
      }

      const newPost = {
        id: String(posts.length + 1),
        title,
        content,
        authorId,
        createdAt: new Date().toISOString(),
        author
      };

      posts.push(newPost);

      // Trigger subscription
      pubsub.publish('POST_CREATED', { postCreated: newPost });

      return newPost;
    }
  },

  User: {
    posts: (parent) => posts
      .filter(post => post.authorId === parent.id)
      .map(post => ({
        ...post,
        author: parent
      }))
  },

  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(['USER_CREATED'])
    },
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED'])
    }
  }
};

// Create server
async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Add authentication context
      const token = req.headers.authorization || '';
      return { token };
    },
    // Enable GraphQL Playground in production
    introspection: true,
    playground: true
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;

  const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });

  // Add subscription support
  server.installSubscriptionHandlers(httpServer);
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});
```

### With Database Integration (MongoDB + Mongoose)

```javascript
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Database resolvers
const resolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (parent, { id }) => await User.findById(id),
    posts: async () => await Post.find().populate('author'),
    post: async (parent, { id }) => await Post.findById(id).populate('author')
  },

  Mutation: {
    createUser: async (parent, { input }) => {
      try {
        const user = new User(input);
        await user.save();
        return user;
      } catch (error) {
        if (error.code === 11000) {
          throw new Error('Email already exists');
        }
        throw error;
      }
    },

    updateUser: async (parent, { id, input }) => {
      const user = await User.findByIdAndUpdate(
        id,
        input,
        { new: true, runValidators: true }
      );
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },

    deleteUser: async (parent, { id }) => {
      const user = await User.findByIdAndDelete(id);
      return !!user;
    },

    createPost: async (parent, { title, content, authorId }) => {
      const user = await User.findById(authorId);
      if (!user) {
        throw new Error('Author not found');
      }

      const post = new Post({
        title,
        content,
        author: authorId
      });

      await post.save();
      await post.populate('author');

      return post;
    }
  },

  User: {
    posts: async (parent) => await Post.find({ author: parent.id }).populate('author')
  }
};

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/graphql_tutorial', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

## Client-Side GraphQL

### Using Apollo Client (React)

#### Installation
```bash
npm install @apollo/client graphql
```

#### Setup
```javascript
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';

// Apollo Client setup
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${localStorage.getItem('token')}` || ''
  }
});

// App component
function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Users />
        <CreateUser />
      </div>
    </ApolloProvider>
  );
}
```

#### Queries
```javascript
import { useQuery } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

function Users() {
  const { loading, error, data, refetch } = useQuery(GET_USERS);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => refetch()}>Refresh</button>
      {data.users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>Posts: {user.posts.length}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Mutations
```javascript
import { useMutation } from '@apollo/client';

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

function CreateUser() {
  const [createUser, { loading, error }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    createUser({
      variables: {
        input: {
          name: formData.get('name'),
          email: formData.get('email')
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create User</h2>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

#### Subscriptions
```javascript
import { useSubscription } from '@apollo/client';

const USER_CREATED_SUBSCRIPTION = gql`
  subscription UserCreated {
    userCreated {
      id
      name
      email
    }
  }
`;

function UserNotifications() {
  const { data, loading } = useSubscription(USER_CREATED_SUBSCRIPTION);

  if (loading) return <div>Listening for new users...</div>;

  return (
    <div>
      {data && (
        <div>
          New user created: {data.userCreated.name}
        </div>
      )}
    </div>
  );
}
```

## Advanced Features

### Pagination

#### Cursor-Based Pagination
```graphql
type Query {
  posts(first: Int, after: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

```javascript
const resolvers = {
  Query: {
    posts: async (parent, { first = 10, after }) => {
      const query = after ? { _id: { $gt: after } } : {};
      const posts = await Post.find(query).limit(first + 1);

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map(post => ({
        node: post,
        cursor: post._id.toString()
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        }
      };
    }
  }
};
```

### Error Handling

```javascript
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');

const resolvers = {
  Mutation: {
    createPost: async (parent, { title, content }, { user }) => {
      // Authentication check
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      // Authorization check
      if (user.role !== 'AUTHOR') {
        throw new ForbiddenError('You do not have permission to create posts');
      }

      // Input validation
      if (title.length < 5) {
        throw new UserInputError('Title must be at least 5 characters', {
          invalidArgs: ['title']
        });
      }

      try {
        const post = new Post({ title, content, author: user.id });
        await post.save();
        return post;
      } catch (error) {
        throw new Error('Failed to create post');
      }
    }
  }
};
```

### DataLoader for N+1 Problem

```javascript
const DataLoader = require('dataloader');

// Create data loaders
const createLoaders = () => ({
  userLoader: new DataLoader(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } });
    return userIds.map(id => users.find(user => user._id.toString() === id.toString()));
  }),

  postsByUserLoader: new DataLoader(async (userIds) => {
    const posts = await Post.find({ author: { $in: userIds } });
    return userIds.map(id => posts.filter(post => post.author.toString() === id.toString()));
  })
});

// Use in context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    loaders: createLoaders()
  })
});

// Use in resolvers
const resolvers = {
  User: {
    posts: (parent, args, { loaders }) => {
      return loaders.postsByUserLoader.load(parent.id);
    }
  },

  Post: {
    author: (parent, args, { loaders }) => {
      return loaders.userLoader.load(parent.author);
    }
  }
};
```

### Custom Directives

```javascript
const { SchemaDirectiveVisitor } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server-express');

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const requiredRole = this.args.requires;
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function(source, args, context, info) {
      const { user } = context;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      if (requiredRole && user.role !== requiredRole) {
        throw new ForbiddenError('You do not have permission');
      }

      return resolve.call(this, source, args, context, info);
    };
  }
}

// Schema with directive
const typeDefs = gql`
  directive @auth(requires: String) on FIELD_DEFINITION

  type Query {
    users: [User!]! @auth
    adminUsers: [User!]! @auth(requires: "ADMIN")
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective
  }
});
```

## Testing GraphQL APIs

### Unit Testing Resolvers

```javascript
const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');

describe('GraphQL Resolvers', () => {
  let server, query, mutate;

  beforeEach(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({ user: { id: '1', role: 'USER' } })
    });

    const testClient = createTestClient(server);
    query = testClient.query;
    mutate = testClient.mutate;
  });

  test('should get all users', async () => {
    const GET_USERS = gql`
      query {
        users {
          id
          name
          email
        }
      }
    `;

    const { data, errors } = await query({ query: GET_USERS });

    expect(errors).toBeUndefined();
    expect(data.users).toHaveLength(2);
    expect(data.users[0]).toHaveProperty('name');
  });

  test('should create new user', async () => {
    const CREATE_USER = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;

    const { data, errors } = await mutate({
      mutation: CREATE_USER,
      variables: {
        input: {
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    });

    expect(errors).toBeUndefined();
    expect(data.createUser.name).toBe('Test User');
  });
});
```

### Integration Testing

```javascript
const request = require('supertest');
const app = require('../app');

describe('GraphQL API Integration', () => {
  test('should handle GraphQL queries via HTTP', async () => {
    const query = {
      query: `
        query {
          users {
            id
            name
          }
        }
      `
    };

    const response = await request(app)
      .post('/graphql')
      .send(query)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.data.users).toBeDefined();
    expect(Array.isArray(response.body.data.users)).toBe(true);
  });
});
```

## Best Practices

### Schema Design
1. **Use meaningful names** for types, fields, and arguments
2. **Design for clients** rather than your data structure
3. **Use enums** for limited sets of values
4. **Provide descriptions** for all schema elements
5. **Keep mutations specific** and focused

### Performance
1. **Implement DataLoader** to solve N+1 queries
2. **Add query complexity analysis** to prevent expensive queries
3. **Use pagination** for large datasets
4. **Implement caching** strategies
5. **Monitor query performance**

### Security
1. **Authenticate and authorize** properly
2. **Validate all inputs** on the server
3. **Implement rate limiting**
4. **Disable introspection** in production
5. **Use HTTPS** in production

### Development
1. **Use schema-first development**
2. **Write comprehensive tests**
3. **Document your API** thoroughly
4. **Version your schema** carefully
5. **Monitor API usage**

## Tools and Ecosystem

### Development Tools
- **GraphQL Playground**: Interactive query IDE
- **GraphiQL**: In-browser GraphQL IDE
- **Apollo Studio**: GraphQL development platform

### Code Generation
- **GraphQL Code Generator**: Generate types and resolvers
- **Apollo CLI**: Generate client code from schema

### Monitoring
- **Apollo Studio**: Performance monitoring and analytics
- **GraphQL Metrics**: Custom monitoring solutions

## Conclusion

GraphQL provides a powerful and flexible approach to API development that can significantly improve developer experience and application performance. By understanding its core concepts and following best practices, you can build robust, scalable APIs that meet the evolving needs of your applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).