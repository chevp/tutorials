# Vector Databases Tutorial

## Introduction

Vector databases are specialized databases designed to store, index, and search high-dimensional vectors efficiently. They are essential for modern AI applications, especially when working with embeddings from Large Language Models (LLMs), enabling semantic search, recommendation systems, and Retrieval Augmented Generation (RAG).

This tutorial covers vector database concepts, implementations, and practical usage with PostgreSQL pgvector and other popular solutions.

## What are Vector Databases?

A vector database stores data as high-dimensional vectors (arrays of numbers) and enables fast similarity search based on vector distance metrics.

### Traditional vs. Vector Databases

**Traditional Database:**
```sql
SELECT * FROM products WHERE name LIKE '%phone%';
-- Keyword matching only
```

**Vector Database:**
```
Query: "smartphone with good camera"
→ Convert to vector: [0.23, -0.17, 0.45, ...]
→ Find similar product vectors
→ Return: iPhone 15 Pro, Samsung S24 Ultra, Google Pixel 8 Pro
-- Semantic understanding!
```

### Key Concepts

#### 1. Embeddings
High-dimensional vectors representing semantic meaning:
```
"The cat sat on the mat" → [0.23, -0.17, 0.45, ..., 0.12]  (1536 dimensions)
"A feline rested on the rug" → [0.21, -0.15, 0.43, ..., 0.10]  (similar vector!)
```

#### 2. Distance Metrics

**Cosine Similarity**
```
Measures the angle between two vectors
Range: -1 to 1 (1 = identical direction)
Best for: Text embeddings
```

**Euclidean Distance**
```
Straight-line distance between vectors
Range: 0 to ∞ (0 = identical)
Best for: Image embeddings
```

**Dot Product**
```
Sum of element-wise multiplication
Range: -∞ to ∞
Best for: When vector magnitude matters
```

#### 3. Indexing
- **HNSW (Hierarchical Navigable Small World)**: Fast, accurate, memory-intensive
- **IVF (Inverted File Index)**: Good balance, requires training
- **PQ (Product Quantization)**: Compressed, less accurate

## PostgreSQL with pgvector

PostgreSQL with the pgvector extension is an excellent choice for vector storage, combining traditional database features with vector search capabilities.

### Setup

#### Installation (Docker)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: vectordb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start the database:
```bash
docker-compose up -d
```

#### Enable pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Creating Vector Tables

```sql
-- Create table with vector column
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- 1536 dimensions for OpenAI embeddings
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Alternative indexes:
-- CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Java Integration with Spring Boot

#### Dependencies

```xml
<dependencies>
    <!-- Spring Boot Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>

    <!-- pgvector Java Client -->
    <dependency>
        <groupId>com.pgvector</groupId>
        <artifactId>pgvector</artifactId>
        <version>0.1.4</version>
    </dependency>

    <!-- LangChain4j -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
        <version>0.34.0</version>
    </dependency>

    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-pgvector</artifactId>
        <version>0.34.0</version>
    </dependency>
</dependencies>
```

#### Configuration

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/vectordb
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    show-sql: true
```

#### Entity Model

```java
import com.pgvector.PGvector;
import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @Column(columnDefinition = "vector(1536)")
    private PGvector embedding;

    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors, getters, setters
    public DocumentEntity() {}

    public DocumentEntity(String content, float[] embeddingArray) {
        this.content = content;
        this.embedding = new PGvector(embeddingArray);
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public float[] getEmbeddingArray() {
        return embedding != null ? embedding.toArray() : null;
    }

    public void setEmbedding(float[] embeddingArray) {
        this.embedding = new PGvector(embeddingArray);
    }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

#### Repository with Vector Search

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    /**
     * Find similar documents using cosine similarity
     * Returns top N most similar documents
     */
    @Query(value = """
        SELECT *
        FROM documents
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<DocumentEntity> findSimilar(
            @Param("embedding") String embedding,
            @Param("limit") int limit
    );

    /**
     * Find similar documents with minimum similarity score
     */
    @Query(value = """
        SELECT d.*, 1 - (d.embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM documents d
        WHERE 1 - (d.embedding <=> CAST(:embedding AS vector)) > :minScore
        ORDER BY similarity DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findSimilarWithScore(
            @Param("embedding") String embedding,
            @Param("minScore") double minScore,
            @Param("limit") int limit
    );

    /**
     * Find similar documents with metadata filter
     */
    @Query(value = """
        SELECT *
        FROM documents
        WHERE metadata->>'category' = :category
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<DocumentEntity> findSimilarInCategory(
            @Param("embedding") String embedding,
            @Param("category") String category,
            @Param("limit") int limit
    );
}
```

#### Vector Search Service

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VectorSearchService {

    private final DocumentRepository repository;
    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    public VectorSearchService(DocumentRepository repository) {
        this.repository = repository;
        this.embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("text-embedding-ada-002")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Index a document with its embedding
     */
    public DocumentEntity indexDocument(String content, String metadataJson) {
        // Generate embedding
        float[] embedding = embeddingModel.embed(content)
                .content()
                .vectorAsList()
                .stream()
                .map(Float::floatValue)
                .toArray(Float[]::new);

        // Convert Float[] to float[]
        float[] embeddingArray = new float[embedding.length];
        for (int i = 0; i < embedding.length; i++) {
            embeddingArray[i] = embedding[i];
        }

        // Create and save document
        DocumentEntity document = new DocumentEntity(content, embeddingArray);
        document.setMetadata(metadataJson);

        return repository.save(document);
    }

    /**
     * Search for similar documents
     */
    public List<SearchResult> search(String query, int limit) {
        // Generate query embedding
        float[] queryEmbedding = embeddingModel.embed(query)
                .content()
                .vectorAsList()
                .stream()
                .map(Float::floatValue)
                .toArray(Float[]::new);

        float[] queryArray = new float[queryEmbedding.length];
        for (int i = 0; i < queryEmbedding.length; i++) {
            queryArray[i] = queryEmbedding[i];
        }

        // Convert to PostgreSQL vector format
        String vectorString = vectorToString(queryArray);

        // Search
        List<DocumentEntity> results = repository.findSimilar(vectorString, limit);

        return results.stream()
                .map(doc -> new SearchResult(
                        doc.getId(),
                        doc.getContent(),
                        doc.getMetadata(),
                        calculateSimilarity(queryArray, doc.getEmbeddingArray())
                ))
                .collect(Collectors.toList());
    }

    /**
     * Search with minimum similarity threshold
     */
    public List<SearchResult> searchWithThreshold(
            String query,
            double minScore,
            int limit) {

        float[] queryEmbedding = generateEmbedding(query);
        String vectorString = vectorToString(queryEmbedding);

        List<Object[]> results = repository.findSimilarWithScore(
                vectorString,
                minScore,
                limit
        );

        return results.stream()
                .map(row -> {
                    DocumentEntity doc = (DocumentEntity) row[0];
                    Double similarity = ((Number) row[1]).doubleValue();
                    return new SearchResult(
                            doc.getId(),
                            doc.getContent(),
                            doc.getMetadata(),
                            similarity
                    );
                })
                .collect(Collectors.toList());
    }

    // Helper methods
    private float[] generateEmbedding(String text) {
        Float[] embedding = embeddingModel.embed(text)
                .content()
                .vectorAsList()
                .stream()
                .map(Float::floatValue)
                .toArray(Float[]::new);

        float[] result = new float[embedding.length];
        for (int i = 0; i < embedding.length; i++) {
            result[i] = embedding[i];
        }
        return result;
    }

    private String vectorToString(float[] vector) {
        return "[" + java.util.Arrays.stream(vector)
                .mapToObj(String::valueOf)
                .collect(Collectors.joining(",")) + "]";
    }

    private double calculateSimilarity(float[] vec1, float[] vec2) {
        if (vec1 == null || vec2 == null || vec1.length != vec2.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    // Result DTO
    public record SearchResult(
            Long id,
            String content,
            String metadata,
            double similarity
    ) {}
}
```

#### REST Controller

```java
@RestController
@RequestMapping("/api/vectors")
public class VectorSearchController {

    private final VectorSearchService vectorSearchService;

    public VectorSearchController(VectorSearchService vectorSearchService) {
        this.vectorSearchService = vectorSearchService;
    }

    @PostMapping("/index")
    public ResponseEntity<DocumentEntity> indexDocument(
            @RequestBody IndexRequest request) {
        DocumentEntity doc = vectorSearchService.indexDocument(
                request.content(),
                request.metadata()
        );
        return ResponseEntity.ok(doc);
    }

    @PostMapping("/search")
    public ResponseEntity<List<SearchResult>> search(
            @RequestBody SearchRequest request) {
        List<SearchResult> results = vectorSearchService.search(
                request.query(),
                request.limit()
        );
        return ResponseEntity.ok(results);
    }

    @PostMapping("/search/threshold")
    public ResponseEntity<List<SearchResult>> searchWithThreshold(
            @RequestBody ThresholdSearchRequest request) {
        List<SearchResult> results = vectorSearchService.searchWithThreshold(
                request.query(),
                request.minScore(),
                request.limit()
        );
        return ResponseEntity.ok(results);
    }

    record IndexRequest(String content, String metadata) {}
    record SearchRequest(String query, int limit) {}
    record ThresholdSearchRequest(String query, double minScore, int limit) {}
}
```

## LangChain4j Integration

### Using pgvector with LangChain4j

```java
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;

public class LangChain4jPgVectorExample {

    public static void main(String[] args) {
        // Create pgvector embedding store
        EmbeddingStore<TextSegment> embeddingStore = PgVectorEmbeddingStore.builder()
                .host("localhost")
                .port(5432)
                .database("vectordb")
                .user("postgres")
                .password("postgres")
                .table("langchain_embeddings")
                .dimension(1536)
                .build();

        // Create embedding model
        EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();

        // Index documents
        List<String> documents = List.of(
            "Java is a programming language",
            "Python is great for data science",
            "JavaScript runs in browsers"
        );

        for (String doc : documents) {
            TextSegment segment = TextSegment.from(doc);
            Embedding embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);
        }

        // Search
        String query = "Tell me about programming languages";
        Embedding queryEmbedding = embeddingModel.embed(query).content();

        List<EmbeddingMatch<TextSegment>> results = embeddingStore.findRelevant(
                queryEmbedding,
                5,
                0.7  // minimum similarity
        );

        results.forEach(match -> {
            System.out.println("Score: " + match.score());
            System.out.println("Text: " + match.embedded().text());
            System.out.println();
        });
    }
}
```

## Performance Optimization

### Indexing Strategies

```sql
-- HNSW Index (Recommended for accuracy)
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- IVF Flat Index (Faster indexing, less accurate)
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Adjust lists parameter based on data size:
-- lists = rows / 1000 for smaller datasets
-- lists = sqrt(rows) for larger datasets
```

### Batch Insertion

```java
@Service
public class BatchIndexingService {

    private final DocumentRepository repository;
    private final EmbeddingModel embeddingModel;

    @Transactional
    public void batchIndex(List<String> documents) {
        List<DocumentEntity> entities = new ArrayList<>();

        // Generate embeddings in batch
        for (int i = 0; i < documents.size(); i += 100) {
            List<String> batch = documents.subList(
                    i,
                    Math.min(i + 100, documents.size())
            );

            // Embed batch
            for (String content : batch) {
                float[] embedding = generateEmbedding(content);
                entities.add(new DocumentEntity(content, embedding));
            }

            // Save in batches
            if (entities.size() >= 100) {
                repository.saveAll(entities);
                entities.clear();
            }
        }

        // Save remaining
        if (!entities.isEmpty()) {
            repository.saveAll(entities);
        }
    }

    private float[] generateEmbedding(String text) {
        // Implementation from previous example
        return embeddingModel.embed(text)
                .content()
                .vectorAsList()
                .stream()
                .mapToFloat(Double::floatValue)
                .toArray();
    }
}
```

### Query Optimization

```sql
-- Add metadata index for filtered searches
CREATE INDEX idx_metadata_category ON documents
USING GIN (metadata jsonb_path_ops);

-- Composite query: metadata filter + vector similarity
SELECT *
FROM documents
WHERE metadata->>'category' = 'technical'
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 10;
```

## Alternative Vector Database Solutions

### 1. Pinecone (Cloud-based)

```java
// Add dependency
// implementation 'io.pinecone:pinecone-client:0.7.0'

import io.pinecone.PineconeClient;
import io.pinecone.PineconeClientConfig;

public class PineconeExample {

    public void setupPinecone() {
        PineconeClientConfig config = new PineconeClientConfig()
                .withApiKey(System.getenv("PINECONE_API_KEY"))
                .withEnvironment("us-west1-gcp");

        PineconeClient client = new PineconeClient(config);

        // Create index
        client.createIndex("my-index", 1536, "cosine");

        // Upsert vectors
        float[] vector = generateEmbedding("Hello world");
        client.upsert("my-index", List.of(
            new UpsertRequest("id-1", vector, Map.of("text", "Hello world"))
        ));

        // Query
        QueryResponse response = client.query(
                "my-index",
                vector,
                5,  // top k
                null  // filter
        );
    }
}
```

### 2. Weaviate (Open-source)

```java
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;

public class WeaviateExample {

    public void setupWeaviate() {
        WeaviateClient client = WeaviateClient.builder()
                .withScheme("http")
                .withHost("localhost:8080")
                .build();

        // Create schema
        Map<String, Object> schema = Map.of(
            "class", "Document",
            "vectorizer", "none",
            "properties", List.of(
                Map.of("name", "content", "dataType", List.of("text"))
            )
        );

        client.schema().classCreator().withClass(schema).run();

        // Add object with vector
        Result<WeaviateObject> result = client.data().creator()
                .withClassName("Document")
                .withProperties(Map.of("content", "Hello world"))
                .withVector(generateEmbedding("Hello world"))
                .run();
    }
}
```

### 3. Milvus (Open-source, scalable)

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;

public class MilvusExample {

    public void setupMilvus() {
        MilvusServiceClient client = new MilvusServiceClient(
            ConnectParam.newBuilder()
                    .withHost("localhost")
                    .withPort(19530)
                    .build()
        );

        // Create collection
        CreateCollectionParam param = CreateCollectionParam.newBuilder()
                .withCollectionName("documents")
                .withDimension(1536)
                .build();

        client.createCollection(param);

        // Insert vectors
        List<Float> vector = Arrays.asList(generateEmbedding("Hello"));
        InsertParam insertParam = InsertParam.newBuilder()
                .withCollectionName("documents")
                .withFloatVectors(List.of(vector))
                .build();

        client.insert(insertParam);
    }
}
```

## Monitoring and Maintenance

### Database Statistics

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'documents';

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('documents'));

-- Vacuum and analyze
VACUUM ANALYZE documents;
```

### Application Monitoring

```java
@Service
public class MonitoredVectorSearchService {

    private final MeterRegistry meterRegistry;

    @Timed(value = "vector.search", description = "Vector search duration")
    public List<SearchResult> search(String query, int limit) {
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            List<SearchResult> results = performSearch(query, limit);

            meterRegistry.counter("vector.search.results",
                    "count", String.valueOf(results.size()))
                    .increment();

            return results;
        } finally {
            sample.stop(meterRegistry.timer("vector.search.duration"));
        }
    }
}
```

## Best Practices

### 1. Choose the Right Dimension
```java
// OpenAI ada-002: 1536 dimensions
// Sentence transformers: 384-768 dimensions
// Custom models: varies

// Higher dimensions = more precision but slower and more storage
```

### 2. Normalize Vectors
```java
public float[] normalizeVector(float[] vector) {
    float magnitude = 0;
    for (float v : vector) {
        magnitude += v * v;
    }
    magnitude = (float) Math.sqrt(magnitude);

    float[] normalized = new float[vector.length];
    for (int i = 0; i < vector.length; i++) {
        normalized[i] = vector[i] / magnitude;
    }
    return normalized;
}
```

### 3. Set Appropriate Similarity Thresholds
```java
// Cosine similarity thresholds:
// > 0.9: Very similar (near duplicates)
// 0.7-0.9: Similar (relevant results)
// 0.5-0.7: Somewhat similar
// < 0.5: Not similar

double threshold = 0.75;  // Recommended starting point
```

### 4. Use Metadata Filters
```java
// Combine vector search with metadata filters for better results
@Query(value = """
    SELECT *
    FROM documents
    WHERE metadata->>'type' = :type
      AND metadata->>'language' = :language
    ORDER BY embedding <=> CAST(:embedding AS vector)
    LIMIT :limit
    """, nativeQuery = true)
List<DocumentEntity> searchWithFilters(
        @Param("embedding") String embedding,
        @Param("type") String type,
        @Param("language") String language,
        @Param("limit") int limit
);
```

### 5. Regular Maintenance
```sql
-- Schedule regular vacuum and analysis
VACUUM ANALYZE documents;

-- Rebuild indexes if needed
REINDEX INDEX documents_embedding_idx;

-- Monitor index bloat
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE tablename = 'documents';
```

## Comparison: Vector Database Options

| Feature | PostgreSQL pgvector | Pinecone | Weaviate | Milvus |
|---------|-------------------|----------|----------|---------|
| **Type** | Extension | Cloud SaaS | Open-source | Open-source |
| **Hosting** | Self-hosted | Cloud-only | Self/Cloud | Self-hosted |
| **Scalability** | Good | Excellent | Good | Excellent |
| **Cost** | Free (self-host) | Pay-per-use | Free (self-host) | Free (self-host) |
| **Setup** | Easy | Easiest | Moderate | Complex |
| **SQL Support** | ✅ Full | ❌ No | ⚠️ Limited | ❌ No |
| **ACID** | ✅ Yes | ❌ No | ⚠️ Limited | ⚠️ Limited |
| **Joins** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Best For** | Small-medium apps | Production scale | Semantic search | Large-scale AI |

## Conclusion

Vector databases are essential for modern AI applications:

**Key Takeaways:**
- Store and search high-dimensional embeddings efficiently
- Enable semantic search beyond keyword matching
- Critical for RAG, recommendations, and similarity search
- PostgreSQL pgvector offers excellent balance of features and simplicity

**When to Use Which:**
- **PostgreSQL pgvector**: Start here for most applications
- **Pinecone**: Need managed service and scale
- **Weaviate**: Advanced semantic search features
- **Milvus**: Massive scale (billions of vectors)

**Next Steps:**
1. Implement RAG with vector databases
2. Optimize indexing strategies for your data
3. Monitor performance and adjust parameters
4. Scale horizontally as data grows

## References

This tutorial is based on the excellent workshop **"KI Anwendungen im Unternehmen"** presented at BaselOne 2025. Special thanks to [David Beisert (beisdog)](https://github.com/beisdog) for creating comprehensive and practical workshop materials that showcase real-world vector database implementations with PostgreSQL pgvector, including performance optimization strategies and Spring Boot integration patterns.

**Original Workshop Materials**: [BaselOne AI Workshop on GitHub](https://github.com/chevp/baselone-ai-workshop)

The workshop provides hands-on examples of vector database setup, indexing strategies, and integration with LangChain4j for building production-ready RAG systems.

## Content Review

The content in this tutorial has been reviewed and curated by [chevp](https://github.com/chevp), focusing on accuracy, clarity, and practical applicability for developers implementing vector databases for AI applications.