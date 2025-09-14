# Message Queues Tutorial

## Introduction

Message queues are a fundamental building block of distributed systems, enabling asynchronous communication between different components of an application. They provide a way to decouple services, improve reliability, and handle varying loads efficiently.

## What are Message Queues?

A message queue is a form of asynchronous service-to-service communication used in serverless and microservices architectures. Messages are stored on the queue until they are processed and deleted. Each message is processed only once by a single consumer.

### Key Concepts

1. **Producer**: The component that sends messages to the queue
2. **Consumer**: The component that receives and processes messages from the queue
3. **Queue**: The buffer that stores messages between producers and consumers
4. **Message**: The data payload being transmitted
5. **Broker**: The middleware that manages queues and routes messages

## Benefits of Message Queues

### Decoupling
Services can operate independently without knowing about each other's implementation details.

### Scalability
Consumers can be scaled independently based on queue load.

### Reliability
Messages are persisted and can survive system failures.

### Asynchronous Processing
Non-blocking operations improve overall system performance.

### Load Leveling
Queues can absorb traffic spikes and smooth out processing loads.

## Types of Message Queues

### Point-to-Point (P2P)
- One producer, one consumer
- Message consumed once and removed from queue
- Examples: Task processing, job queues

### Publish-Subscribe (Pub/Sub)
- One or many producers, multiple consumers
- Message broadcast to all subscribers
- Examples: Event notifications, real-time updates

### Request-Reply
- Synchronous-like pattern over asynchronous messaging
- Consumer sends response back to producer
- Examples: RPC over messaging

## Popular Message Queue Technologies

| Technology | Type | Use Case | Language Support |
|------------|------|----------|-----------------|
| RabbitMQ | AMQP | General purpose | Multi-language |
| Apache Kafka | Event Streaming | High-throughput, real-time | Multi-language |
| Redis | In-memory | Fast, simple queuing | Multi-language |
| Amazon SQS | Cloud | AWS-native queuing | Multi-language |
| Apache ActiveMQ | JMS | Enterprise messaging | Java-focused |
| Google Pub/Sub | Cloud | GCP-native | Multi-language |

## RabbitMQ Implementation

### Installation and Setup

#### Using Docker
```bash
# Run RabbitMQ with management plugin
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Access management interface at http://localhost:15672
# Default credentials: guest/guest
```

#### Direct Installation
```bash
# Ubuntu/Debian
sudo apt-get install rabbitmq-server

# macOS
brew install rabbitmq

# Start the server
sudo systemctl start rabbitmq-server
```

### Node.js Producer and Consumer

#### Installation
```bash
npm install amqplib
```

#### Producer Example
```javascript
const amqp = require('amqplib');

class RabbitMQProducer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      // Connect to RabbitMQ server
      this.connection = await amqp.connect('amqp://localhost');
      this.channel = await this.connection.createChannel();

      // Handle connection errors
      this.connection.on('error', (err) => {
        console.error('Connection error:', err);
      });

      this.connection.on('close', () => {
        console.log('Connection closed');
      });

      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendToQueue(queueName, message) {
    try {
      // Ensure queue exists
      await this.channel.assertQueue(queueName, { durable: true });

      // Send message
      const messageBuffer = Buffer.from(JSON.stringify(message));

      return this.channel.sendToQueue(queueName, messageBuffer, {
        persistent: true, // Message survives broker restarts
        messageId: Date.now().toString(),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async publishToExchange(exchangeName, routingKey, message) {
    try {
      // Declare exchange
      await this.channel.assertExchange(exchangeName, 'topic', { durable: true });

      // Publish message
      const messageBuffer = Buffer.from(JSON.stringify(message));

      return this.channel.publish(exchangeName, routingKey, messageBuffer, {
        persistent: true,
        messageId: Date.now().toString(),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.channel.close();
      await this.connection.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
}

// Usage example
async function sendOrderNotification() {
  const producer = new RabbitMQProducer();

  try {
    await producer.connect();

    // Send to simple queue
    await producer.sendToQueue('order_processing', {
      orderId: 'ORD-123',
      userId: 'user-456',
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 }
      ],
      totalAmount: 99.99,
      timestamp: new Date().toISOString()
    });

    // Publish to exchange (pub/sub pattern)
    await producer.publishToExchange('notifications', 'order.created', {
      type: 'ORDER_CREATED',
      orderId: 'ORD-123',
      userId: 'user-456'
    });

    console.log('Messages sent successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await producer.close();
  }
}

sendOrderNotification();
```

#### Consumer Example
```javascript
const amqp = require('amqplib');

class RabbitMQConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect('amqp://localhost');
      this.channel = await this.connection.createChannel();

      // Set prefetch count (QoS)
      await this.channel.prefetch(1);

      this.connection.on('error', (err) => {
        console.error('Connection error:', err);
      });

      console.log('Consumer connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  async consumeFromQueue(queueName, handler) {
    try {
      // Ensure queue exists
      await this.channel.assertQueue(queueName, { durable: true });

      console.log(`Waiting for messages in ${queueName}...`);

      // Consume messages
      await this.channel.consume(queueName, async (message) => {
        if (message) {
          try {
            const content = JSON.parse(message.content.toString());

            console.log('Received message:', content);

            // Process the message
            await handler(content, message);

            // Acknowledge message processing
            this.channel.ack(message);
          } catch (error) {
            console.error('Error processing message:', error);

            // Reject message and requeue for retry
            this.channel.nack(message, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Failed to consume messages:', error);
      throw error;
    }
  }

  async subscribeToExchange(exchangeName, routingPattern, handler) {
    try {
      // Declare exchange
      await this.channel.assertExchange(exchangeName, 'topic', { durable: true });

      // Create exclusive queue for this consumer
      const queueResult = await this.channel.assertQueue('', { exclusive: true });
      const queueName = queueResult.queue;

      // Bind queue to exchange with routing pattern
      await this.channel.bindQueue(queueName, exchangeName, routingPattern);

      console.log(`Subscribed to ${exchangeName} with pattern ${routingPattern}`);

      // Consume messages
      await this.channel.consume(queueName, async (message) => {
        if (message) {
          try {
            const content = JSON.parse(message.content.toString());

            console.log(`Received notification [${message.fields.routingKey}]:`, content);

            // Process the notification
            await handler(content, message.fields.routingKey);

            this.channel.ack(message);
          } catch (error) {
            console.error('Error processing notification:', error);
            this.channel.nack(message, false, false); // Don't requeue notifications
          }
        }
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }
}

// Order processing consumer
async function startOrderProcessor() {
  const consumer = new RabbitMQConsumer();

  try {
    await consumer.connect();

    await consumer.consumeFromQueue('order_processing', async (orderData) => {
      console.log('Processing order:', orderData.orderId);

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would:
      // 1. Validate order data
      // 2. Check inventory
      // 3. Process payment
      // 4. Update database
      // 5. Send confirmation

      console.log('Order processed successfully:', orderData.orderId);
    });
  } catch (error) {
    console.error('Consumer error:', error);
  }
}

// Notification subscriber
async function startNotificationHandler() {
  const consumer = new RabbitMQConsumer();

  try {
    await consumer.connect();

    // Subscribe to all order-related notifications
    await consumer.subscribeToExchange('notifications', 'order.*', async (notification, routingKey) => {
      switch (routingKey) {
        case 'order.created':
          await handleOrderCreated(notification);
          break;
        case 'order.cancelled':
          await handleOrderCancelled(notification);
          break;
        case 'order.completed':
          await handleOrderCompleted(notification);
          break;
        default:
          console.log('Unknown order notification:', routingKey);
      }
    });
  } catch (error) {
    console.error('Notification handler error:', error);
  }
}

async function handleOrderCreated(notification) {
  console.log('Sending welcome email for order:', notification.orderId);
  // Send email logic here
}

async function handleOrderCancelled(notification) {
  console.log('Processing refund for order:', notification.orderId);
  // Refund processing logic here
}

async function handleOrderCompleted(notification) {
  console.log('Sending completion notification for order:', notification.orderId);
  // Completion notification logic here
}

// Start consumers
startOrderProcessor();
startNotificationHandler();
```

## Apache Kafka Implementation

### Installation and Setup

#### Using Docker Compose
```yaml
# docker-compose.yml
version: '3.7'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

```bash
docker-compose up -d
```

### Node.js Kafka Implementation

#### Installation
```bash
npm install kafkajs
```

#### Producer Example
```javascript
const { Kafka } = require('kafkajs');

class KafkaProducer {
  constructor() {
    this.kafka = Kafka({
      clientId: 'order-service-producer',
      brokers: ['localhost:9092']
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true, // Ensure exactly-once delivery
      transactionTimeout: 30000
    });
  }

  async connect() {
    try {
      await this.producer.connect();
      console.log('Kafka producer connected');
    } catch (error) {
      console.error('Failed to connect producer:', error);
      throw error;
    }
  }

  async sendMessage(topic, message, key = null) {
    try {
      const result = await this.producer.send({
        topic,
        messages: [{
          key: key,
          value: JSON.stringify(message),
          timestamp: Date.now(),
          headers: {
            'content-type': 'application/json',
            'producer-id': 'order-service'
          }
        }]
      });

      console.log('Message sent:', result);
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendBatch(topic, messages) {
    try {
      const kafkaMessages = messages.map(msg => ({
        key: msg.key,
        value: JSON.stringify(msg.value),
        timestamp: Date.now()
      }));

      const result = await this.producer.send({
        topic,
        messages: kafkaMessages
      });

      console.log('Batch sent:', result);
      return result;
    } catch (error) {
      console.error('Failed to send batch:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      console.log('Producer disconnected');
    } catch (error) {
      console.error('Error disconnecting producer:', error);
    }
  }
}

// Usage example
async function publishOrderEvents() {
  const producer = new KafkaProducer();

  try {
    await producer.connect();

    // Send single message
    await producer.sendMessage('order-events', {
      eventType: 'ORDER_CREATED',
      orderId: 'ORD-789',
      customerId: 'CUST-456',
      totalAmount: 149.99,
      timestamp: new Date().toISOString()
    }, 'ORD-789'); // Using order ID as partition key

    // Send batch of messages
    await producer.sendBatch('user-activity', [
      {
        key: 'USER-1',
        value: {
          userId: 'USER-1',
          action: 'LOGIN',
          timestamp: new Date().toISOString()
        }
      },
      {
        key: 'USER-2',
        value: {
          userId: 'USER-2',
          action: 'VIEW_PRODUCT',
          productId: 'PROD-123',
          timestamp: new Date().toISOString()
        }
      }
    ]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await producer.disconnect();
  }
}

publishOrderEvents();
```

#### Consumer Example
```javascript
const { Kafka } = require('kafkajs');

class KafkaConsumer {
  constructor(groupId) {
    this.kafka = Kafka({
      clientId: 'order-processor-consumer',
      brokers: ['localhost:9092']
    });

    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 100,
      minBytes: 1,
      maxBytes: 1024 * 1024 // 1MB
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
      console.log('Kafka consumer connected');
    } catch (error) {
      console.error('Failed to connect consumer:', error);
      throw error;
    }
  }

  async subscribe(topics) {
    try {
      if (Array.isArray(topics)) {
        for (const topic of topics) {
          await this.consumer.subscribe({ topic, fromBeginning: false });
        }
      } else {
        await this.consumer.subscribe({ topic: topics, fromBeginning: false });
      }

      console.log('Subscribed to topics:', topics);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  async startConsuming(messageHandler) {
    try {
      await this.consumer.run({
        autoCommit: false, // Manual commit for better error handling
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const messageData = {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              value: JSON.parse(message.value.toString()),
              timestamp: message.timestamp,
              headers: message.headers
            };

            console.log(`Received message from ${topic}:${partition}:${message.offset}`);

            // Process message
            await messageHandler(messageData);

            // Commit offset after successful processing
            await this.consumer.commitOffsets([{
              topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString()
            }]);

          } catch (error) {
            console.error('Error processing message:', error);
            // Handle error (could implement retry logic here)
          }
        }
      });
    } catch (error) {
      console.error('Failed to start consuming:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      console.log('Consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting consumer:', error);
    }
  }
}

// Order event processor
async function startOrderEventProcessor() {
  const consumer = new KafkaConsumer('order-processing-group');

  try {
    await consumer.connect();
    await consumer.subscribe('order-events');

    await consumer.startConsuming(async (messageData) => {
      const { value: event } = messageData;

      console.log('Processing order event:', event);

      switch (event.eventType) {
        case 'ORDER_CREATED':
          await processOrderCreated(event);
          break;
        case 'ORDER_CANCELLED':
          await processOrderCancelled(event);
          break;
        case 'ORDER_COMPLETED':
          await processOrderCompleted(event);
          break;
        default:
          console.log('Unknown event type:', event.eventType);
      }
    });
  } catch (error) {
    console.error('Order processor error:', error);
  }
}

async function processOrderCreated(event) {
  console.log(`Processing new order: ${event.orderId}`);

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update inventory
  // Send confirmation email
  // Update analytics

  console.log(`Order ${event.orderId} processed successfully`);
}

async function processOrderCancelled(event) {
  console.log(`Processing order cancellation: ${event.orderId}`);
  // Restore inventory
  // Process refund
  // Send cancellation email
}

async function processOrderCompleted(event) {
  console.log(`Processing order completion: ${event.orderId}`);
  // Update customer loyalty points
  // Send completion notification
  // Update reporting
}

// Analytics processor (separate consumer group)
async function startAnalyticsProcessor() {
  const consumer = new KafkaConsumer('analytics-group');

  try {
    await consumer.connect();
    await consumer.subscribe(['order-events', 'user-activity']);

    await consumer.startConsuming(async (messageData) => {
      const { topic, value: event } = messageData;

      if (topic === 'order-events') {
        await updateOrderAnalytics(event);
      } else if (topic === 'user-activity') {
        await updateUserActivityAnalytics(event);
      }
    });
  } catch (error) {
    console.error('Analytics processor error:', error);
  }
}

async function updateOrderAnalytics(event) {
  console.log('Updating order analytics for:', event.eventType);
  // Update metrics in analytics database
  // Calculate business KPIs
  // Update dashboards
}

async function updateUserActivityAnalytics(event) {
  console.log('Updating user activity analytics for:', event.action);
  // Track user behavior
  // Update personalization models
  // Generate recommendations
}

// Start consumers
startOrderEventProcessor();
startAnalyticsProcessor();
```

## Redis as Message Queue

### Installation and Setup
```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or install directly
# Ubuntu: sudo apt install redis-server
# macOS: brew install redis
```

### Node.js Redis Queue Implementation

#### Installation
```bash
npm install bull redis
```

#### Bull Queue Example
```javascript
const Queue = require('bull');
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Create job queues
const emailQueue = new Queue('email processing', {
  redis: { port: 6379, host: 'localhost' }
});

const imageProcessingQueue = new Queue('image processing', {
  redis: { port: 6379, host: 'localhost' }
});

// Add jobs to queue
async function addEmailJob(emailData) {
  try {
    const job = await emailQueue.add('send-email', emailData, {
      // Job options
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      delay: 5000, // Delay job by 5 seconds
      removeOnComplete: 10,
      removeOnFail: 5
    });

    console.log('Email job added:', job.id);
    return job;
  } catch (error) {
    console.error('Failed to add email job:', error);
    throw error;
  }
}

async function addImageProcessingJob(imageData) {
  try {
    const job = await imageProcessingQueue.add('process-image', imageData, {
      priority: 10, // Higher priority
      attempts: 5,
      backoff: 'fixed'
    });

    console.log('Image processing job added:', job.id);
    return job;
  } catch (error) {
    console.error('Failed to add image processing job:', error);
    throw error;
  }
}

// Process jobs
emailQueue.process('send-email', 5, async (job) => {
  const { to, subject, body, template } = job.data;

  console.log(`Processing email job ${job.id} for ${to}`);

  // Update job progress
  job.progress(10);

  try {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    job.progress(50);

    // Here you would use a real email service like SendGrid, SES, etc.
    const emailResult = await sendEmail({
      to,
      subject,
      body,
      template
    });

    job.progress(100);

    console.log(`Email sent successfully to ${to}`);
    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
});

imageProcessingQueue.process('process-image', 2, async (job) => {
  const { imageUrl, operations } = job.data;

  console.log(`Processing image job ${job.id}: ${imageUrl}`);

  job.progress(5);

  try {
    // Download image
    await downloadImage(imageUrl);
    job.progress(25);

    // Apply operations (resize, crop, filter, etc.)
    for (let i = 0; i < operations.length; i++) {
      await applyImageOperation(operations[i]);
      job.progress(25 + (i + 1) * (50 / operations.length));
    }

    // Upload processed image
    const processedUrl = await uploadProcessedImage();
    job.progress(90);

    // Cleanup
    await cleanupTempFiles();
    job.progress(100);

    console.log('Image processed successfully:', processedUrl);
    return { processedUrl, operations: operations.length };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
});

// Job event handlers
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.log(`Email job ${job.id} failed:`, err.message);
});

emailQueue.on('stalled', (job) => {
  console.log(`Email job ${job.id} stalled`);
});

// Queue management
async function getQueueStats() {
  const emailStats = await emailQueue.getJobCounts();
  const imageStats = await imageProcessingQueue.getJobCounts();

  console.log('Email Queue Stats:', emailStats);
  console.log('Image Processing Queue Stats:', imageStats);
}

// Usage example
async function processUserRegistration(userData) {
  try {
    // Add welcome email job
    await addEmailJob({
      to: userData.email,
      subject: 'Welcome to Our Platform!',
      template: 'welcome',
      data: { name: userData.name }
    });

    // Add profile image processing job
    if (userData.profileImageUrl) {
      await addImageProcessingJob({
        imageUrl: userData.profileImageUrl,
        operations: [
          { type: 'resize', width: 200, height: 200 },
          { type: 'crop', mode: 'center' },
          { type: 'optimize' }
        ]
      });
    }

    console.log('User registration jobs queued successfully');
  } catch (error) {
    console.error('Failed to queue registration jobs:', error);
  }
}

// Mock functions (replace with real implementations)
async function sendEmail(emailData) {
  // Implement actual email sending logic
  return { messageId: 'msg_' + Date.now() };
}

async function downloadImage(url) {
  // Implement image download
  console.log('Downloading image:', url);
}

async function applyImageOperation(operation) {
  // Implement image processing
  console.log('Applying operation:', operation);
}

async function uploadProcessedImage() {
  // Implement image upload
  return 'https://example.com/processed_' + Date.now() + '.jpg';
}

async function cleanupTempFiles() {
  // Implement cleanup
  console.log('Cleaning up temp files');
}

// Example usage
processUserRegistration({
  name: 'John Doe',
  email: 'john@example.com',
  profileImageUrl: 'https://example.com/profile.jpg'
});

// Monitor queues
setInterval(getQueueStats, 10000);
```

## AWS SQS Implementation

### Installation
```bash
npm install aws-sdk
```

### SQS Producer and Consumer
```javascript
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

class SQSQueue {
  constructor(queueUrl) {
    this.queueUrl = queueUrl;
  }

  async sendMessage(message, delaySeconds = 0) {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
        DelaySeconds: delaySeconds,
        MessageAttributes: {
          'MessageType': {
            DataType: 'String',
            StringValue: message.type || 'unknown'
          },
          'Timestamp': {
            DataType: 'String',
            StringValue: new Date().toISOString()
          }
        }
      };

      const result = await sqs.sendMessage(params).promise();
      console.log('Message sent:', result.MessageId);
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendMessageBatch(messages) {
    try {
      const entries = messages.map((message, index) => ({
        Id: `msg_${index}`,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          'MessageType': {
            DataType: 'String',
            StringValue: message.type || 'unknown'
          }
        }
      }));

      const params = {
        QueueUrl: this.queueUrl,
        Entries: entries
      };

      const result = await sqs.sendMessageBatch(params).promise();
      console.log('Batch sent:', result.Successful.length, 'messages');

      if (result.Failed.length > 0) {
        console.error('Failed messages:', result.Failed);
      }

      return result;
    } catch (error) {
      console.error('Failed to send batch:', error);
      throw error;
    }
  }

  async receiveMessages(maxMessages = 10, waitTimeSeconds = 20) {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTimeSeconds,
        MessageAttributeNames: ['All'],
        VisibilityTimeoutSeconds: 300 // 5 minutes
      };

      const result = await sqs.receiveMessage(params).promise();
      return result.Messages || [];
    } catch (error) {
      console.error('Failed to receive messages:', error);
      throw error;
    }
  }

  async deleteMessage(receiptHandle) {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle
      };

      await sqs.deleteMessage(params).promise();
      console.log('Message deleted');
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  async startPolling(messageHandler) {
    console.log('Starting to poll for messages...');

    while (true) {
      try {
        const messages = await this.receiveMessages();

        for (const message of messages) {
          try {
            const messageData = JSON.parse(message.Body);

            console.log('Processing message:', message.MessageId);

            // Process message
            await messageHandler(messageData, message);

            // Delete message after successful processing
            await this.deleteMessage(message.ReceiptHandle);
          } catch (error) {
            console.error('Error processing message:', error);
            // Message will become visible again after visibility timeout
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

// Usage example
const orderQueue = new SQSQueue(process.env.ORDER_QUEUE_URL);
const notificationQueue = new SQSQueue(process.env.NOTIFICATION_QUEUE_URL);

// Producer
async function createOrder(orderData) {
  try {
    // Send order processing message
    await orderQueue.sendMessage({
      type: 'ORDER_CREATED',
      orderId: orderData.id,
      customerId: orderData.customerId,
      items: orderData.items,
      totalAmount: orderData.totalAmount
    });

    // Send notification messages
    await notificationQueue.sendMessageBatch([
      {
        type: 'EMAIL_NOTIFICATION',
        recipient: orderData.customerEmail,
        template: 'order_confirmation',
        data: orderData
      },
      {
        type: 'SMS_NOTIFICATION',
        recipient: orderData.customerPhone,
        message: `Order ${orderData.id} confirmed. Thank you!`
      }
    ]);

    console.log('Order messages sent successfully');
  } catch (error) {
    console.error('Failed to send order messages:', error);
  }
}

// Consumer
async function startOrderProcessor() {
  await orderQueue.startPolling(async (messageData, rawMessage) => {
    console.log('Processing order:', messageData.orderId);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Process the order
    await processOrder(messageData);

    console.log('Order processed:', messageData.orderId);
  });
}

async function startNotificationProcessor() {
  await notificationQueue.startPolling(async (messageData, rawMessage) => {
    switch (messageData.type) {
      case 'EMAIL_NOTIFICATION':
        await sendEmail(messageData);
        break;
      case 'SMS_NOTIFICATION':
        await sendSMS(messageData);
        break;
      default:
        console.log('Unknown notification type:', messageData.type);
    }
  });
}

// Mock processing functions
async function processOrder(orderData) {
  console.log('Processing order logic for:', orderData.orderId);
  // Implement actual order processing
}

async function sendEmail(emailData) {
  console.log('Sending email to:', emailData.recipient);
  // Implement actual email sending
}

async function sendSMS(smsData) {
  console.log('Sending SMS to:', smsData.recipient);
  // Implement actual SMS sending
}

// Start consumers
startOrderProcessor();
startNotificationProcessor();
```

## Best Practices

### Message Design
1. **Keep messages small** and focused
2. **Include necessary metadata** (timestamps, correlation IDs)
3. **Use consistent message formats** (JSON schemas)
4. **Make messages idempotent**
5. **Include error handling information**

### Error Handling
1. **Implement retry logic** with exponential backoff
2. **Use dead letter queues** for failed messages
3. **Log errors comprehensively**
4. **Monitor queue health**
5. **Set appropriate timeouts**

### Scalability
1. **Use multiple consumers** for high throughput
2. **Partition data appropriately** (Kafka)
3. **Monitor queue depth**
4. **Scale consumers based on load**
5. **Consider message ordering requirements**

### Security
1. **Encrypt sensitive message data**
2. **Use authentication and authorization**
3. **Validate message sources**
4. **Implement message expiration**
5. **Monitor for suspicious activity**

## Monitoring and Observability

### Key Metrics
- Queue depth/length
- Message throughput (messages/second)
- Processing latency
- Error rates
- Consumer lag (Kafka)

### Health Checks
```javascript
async function checkQueueHealth() {
  const stats = {
    emailQueue: await emailQueue.getJobCounts(),
    imageQueue: await imageProcessingQueue.getJobCounts(),
    timestamp: new Date().toISOString()
  };

  // Alert if too many failed jobs
  if (stats.emailQueue.failed > 100) {
    await sendAlert('High email queue failure rate');
  }

  // Alert if queue is backing up
  if (stats.imageQueue.waiting > 1000) {
    await sendAlert('Image processing queue backup');
  }

  return stats;
}

// Run health checks periodically
setInterval(checkQueueHealth, 60000); // Every minute
```

## Conclusion

Message queues are essential for building scalable, reliable distributed systems. Choose the right technology based on your specific requirements:

- **RabbitMQ**: General-purpose messaging with advanced routing
- **Apache Kafka**: High-throughput event streaming
- **Redis**: Fast, simple queuing for moderate loads
- **AWS SQS**: Managed queuing for cloud applications

By following best practices and implementing proper monitoring, message queues can significantly improve your system's resilience and scalability.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).