# RAG (Retrieval Augmented Generation) Tutorial

## Introduction

Retrieval Augmented Generation (RAG) is a technique that enhances Large Language Models (LLMs) by combining them with external knowledge retrieval systems. Instead of relying solely on the model's training data, RAG allows LLMs to access and reason over specific documents, databases, or knowledge bases in real-time.

This tutorial covers the concepts, architecture, and practical implementation of RAG systems using Java and LangChain4j.

## What is RAG?

RAG (Retrieval Augmented Generation) is a two-step process:

1. **Retrieval**: Find relevant information from a knowledge base
2. **Augmentation**: Provide this information as context to the LLM
3. **Generation**: LLM generates a response based on the retrieved context

### Why Use RAG?

**Problems RAG Solves:**
- **Hallucinations**: LLMs sometimes generate false information
- **Outdated Knowledge**: Training data has a cutoff date
- **Domain-Specific Knowledge**: LLMs lack specialized information
- **Verifiable Sources**: RAG provides cited, traceable information

**Benefits:**
- Access to current information
- Domain-specific expertise
- Reduced hallucinations
- Cost-effective (no model retraining needed)
- Source attribution

## RAG Architecture

### Traditional LLM Flow
```
User Question → LLM → Response
```

### RAG Flow
```
User Question
    ↓
Question Embedding
    ↓
Vector Database Search (Similarity)
    ↓
Retrieve Relevant Documents
    ↓
Combine Question + Retrieved Context
    ↓
LLM (with context)
    ↓
Response (based on retrieved knowledge)
```

## Core Components

### 1. Document Loader
Loads and processes documents from various sources.

### 2. Text Splitter
Breaks documents into manageable chunks.

### 3. Embedding Model
Converts text chunks into vector representations.

### 4. Vector Store
Stores and indexes embeddings for fast similarity search.

### 5. Retriever
Finds relevant chunks based on query similarity.

### 6. LLM
Generates responses using retrieved context.

## Implementation with LangChain4j

### Prerequisites

```xml
<dependencies>
    <!-- LangChain4j Core -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- Embeddings -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-embeddings</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- Document Loaders -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-document-loader</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- OpenAI -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- In-Memory Vector Store (for development) -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-embedding-store-inmemory</artifactId>
        <version>0.34.0</version>
    </dependency>
</dependencies>
```

### Basic RAG Example

```java
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingMatch;

import java.nio.file.Path;
import java.util.List;

public class SimpleRAGExample {

    public static void main(String[] args) {
        // 1. Load documents
        Path documentPath = Path.of("documents/company-policies.txt");
        Document document = FileSystemDocumentLoader.loadDocument(documentPath);

        // 2. Split document into chunks
        DocumentSplitter splitter = DocumentSplitters.recursive(
            300,  // chunk size in tokens
            20    // overlap between chunks
        );
        List<TextSegment> segments = splitter.split(document);

        // 3. Create embedding model
        EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("text-embedding-ada-002")
                .build();

        // 4. Create embeddings and store them
        EmbeddingStore<TextSegment> embeddingStore =
                new InMemoryEmbeddingStore<>();

        for (TextSegment segment : segments) {
            Embedding embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);
        }

        // 5. User asks a question
        String question = "What is the vacation policy?";

        // 6. Embed the question
        Embedding questionEmbedding = embeddingModel.embed(question).content();

        // 7. Find relevant document segments
        EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(questionEmbedding)
                .maxResults(3)
                .minScore(0.7)
                .build();

        EmbeddingSearchResult<TextSegment> searchResult =
                embeddingStore.search(searchRequest);

        // 8. Build context from retrieved segments
        String context = searchResult.matches().stream()
                .map(match -> match.embedded().text())
                .reduce("", (a, b) -> a + "\n\n" + b);

        // 9. Create prompt with context
        String prompt = "Based on the following context:\n\n" +
                       context +
                       "\n\nQuestion: " + question +
                       "\n\nPlease answer the question based only on the provided context.";

        // 10. Generate answer using LLM
        ChatLanguageModel chatModel = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .build();

        String answer = chatModel.generate(prompt);

        System.out.println("Question: " + question);
        System.out.println("\nAnswer: " + answer);
        System.out.println("\nSources:");
        searchResult.matches().forEach(match -> {
            System.out.println("- Score: " + match.score());
            System.out.println("  Text: " + match.embedded().text());
        });
    }
}
```

## Document Processing

### Loading Different Document Types

```java
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;

public class DocumentLoaderExample {

    public void loadTextFile() {
        Document doc = FileSystemDocumentLoader.loadDocument(
            Path.of("document.txt"),
            new TextDocumentParser()
        );
    }

    public void loadPdfFile() {
        Document doc = FileSystemDocumentLoader.loadDocument(
            Path.of("document.pdf"),
            new ApachePdfBoxDocumentParser()
        );
    }

    public void loadMultipleFiles() {
        List<Document> docs = FileSystemDocumentLoader.loadDocuments(
            Path.of("documents/"),
            new TextDocumentParser()
        );
    }
}
```

### Text Splitting Strategies

```java
import dev.langchain4j.data.document.splitter.DocumentSplitters;

public class TextSplittingExample {

    // 1. Fixed Token Size Splitter
    public void fixedTokenSplitter() {
        DocumentSplitter splitter = DocumentSplitters.recursive(
            500,  // maximum chunk size in tokens
            50    // overlap between chunks
        );

        List<TextSegment> segments = splitter.split(document);
    }

    // 2. Paragraph-based Splitter
    public void paragraphSplitter() {
        DocumentSplitter splitter = DocumentSplitters.recursive(
            300,
            0  // no overlap
        );
    }

    // 3. Custom Splitter
    public List<TextSegment> customSplit(Document document, int maxChunkSize) {
        String text = document.text();
        List<TextSegment> segments = new ArrayList<>();

        // Split by sentences
        String[] sentences = text.split("\\. ");

        StringBuilder currentChunk = new StringBuilder();
        for (String sentence : sentences) {
            if (currentChunk.length() + sentence.length() > maxChunkSize) {
                segments.add(TextSegment.from(currentChunk.toString()));
                currentChunk = new StringBuilder();
            }
            currentChunk.append(sentence).append(". ");
        }

        if (currentChunk.length() > 0) {
            segments.add(TextSegment.from(currentChunk.toString()));
        }

        return segments;
    }
}
```

### Why Chunking Matters

```java
// ❌ BAD: Entire document is too large for context window
String entireDocument = loadEntireDocument();  // 50,000 tokens
String prompt = entireDocument + "\n\nQuestion: " + question;
// This exceeds most LLM context windows!

// ✅ GOOD: Split into chunks and retrieve only relevant parts
List<TextSegment> chunks = splitDocument(document, 300);  // 300 tokens each
List<TextSegment> relevantChunks = findRelevant(chunks, question, 3);  // 900 tokens
String context = buildContext(relevantChunks);
String prompt = context + "\n\nQuestion: " + question;  // Fits in context window
```

## Advanced RAG Patterns

### RAG with Metadata Filtering

```java
import dev.langchain4j.data.document.Metadata;

public class MetadataFilteringExample {

    public void addDocumentsWithMetadata() {
        // Add metadata to documents
        TextSegment segment1 = TextSegment.from(
            "Employee benefits include health insurance...",
            Metadata.from("category", "HR")
                   .put("department", "Human Resources")
                   .put("year", "2024")
        );

        TextSegment segment2 = TextSegment.from(
            "Our tech stack includes Java, Spring Boot...",
            Metadata.from("category", "Engineering")
                   .put("department", "IT")
                   .put("year", "2024")
        );

        Embedding emb1 = embeddingModel.embed(segment1).content();
        Embedding emb2 = embeddingModel.embed(segment2).content();

        embeddingStore.add(emb1, segment1);
        embeddingStore.add(emb2, segment2);
    }

    public void searchWithMetadataFilter(String question) {
        Embedding questionEmbedding = embeddingModel.embed(question).content();

        // Search only in HR documents
        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(questionEmbedding)
                .maxResults(3)
                .minScore(0.7)
                .filter(metadata -> "HR".equals(metadata.getString("category")))
                .build();

        EmbeddingSearchResult<TextSegment> result = embeddingStore.search(request);
    }
}
```

### Hybrid Search (Keyword + Semantic)

```java
public class HybridSearchExample {

    public List<TextSegment> hybridSearch(String query, List<TextSegment> allSegments) {
        // 1. Keyword search (BM25 or simple text matching)
        List<TextSegment> keywordResults = keywordSearch(query, allSegments);

        // 2. Semantic search (vector similarity)
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        EmbeddingSearchResult<TextSegment> semanticResults =
                embeddingStore.search(EmbeddingSearchRequest.builder()
                        .queryEmbedding(queryEmbedding)
                        .maxResults(10)
                        .build());

        // 3. Combine and rerank results
        return rerank(keywordResults, semanticResults);
    }

    private List<TextSegment> keywordSearch(String query, List<TextSegment> segments) {
        String[] keywords = query.toLowerCase().split("\\s+");

        return segments.stream()
                .filter(segment -> {
                    String text = segment.text().toLowerCase();
                    return Arrays.stream(keywords).anyMatch(text::contains);
                })
                .collect(Collectors.toList());
    }

    private List<TextSegment> rerank(
            List<TextSegment> keywordResults,
            EmbeddingSearchResult<TextSegment> semanticResults) {

        // Combine scores and return top results
        Map<TextSegment, Double> combinedScores = new HashMap<>();

        // Add keyword scores
        for (int i = 0; i < keywordResults.size(); i++) {
            combinedScores.merge(
                keywordResults.get(i),
                1.0 / (i + 1),  // Position-based score
                Double::sum
            );
        }

        // Add semantic scores
        for (EmbeddingMatch<TextSegment> match : semanticResults.matches()) {
            combinedScores.merge(
                match.embedded(),
                match.score(),
                Double::sum
            );
        }

        // Sort by combined score
        return combinedScores.entrySet().stream()
                .sorted(Map.Entry.<TextSegment, Double>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
```

### Query Rewriting

```java
public class QueryRewritingExample {

    private final ChatLanguageModel llm;

    public String improveQuery(String userQuery) {
        String prompt = "Rewrite the following query to be more specific " +
                       "and suitable for searching documentation:\n\n" +
                       "Original query: " + userQuery + "\n\n" +
                       "Improved query:";

        return llm.generate(prompt);
    }

    public List<String> generateMultipleQueries(String userQuery) {
        String prompt = "Generate 3 different search queries based on this question:\n" +
                       userQuery + "\n\n" +
                       "Return only the queries, one per line.";

        String response = llm.generate(prompt);
        return Arrays.asList(response.split("\n"));
    }

    public String answerWithQueryRewriting(String userQuery) {
        // 1. Rewrite query for better retrieval
        List<String> queries = generateMultipleQueries(userQuery);

        // 2. Search with all queries
        Set<TextSegment> allResults = new HashSet<>();
        for (String query : queries) {
            Embedding embedding = embeddingModel.embed(query).content();
            EmbeddingSearchResult<TextSegment> result = embeddingStore.search(
                EmbeddingSearchRequest.builder()
                        .queryEmbedding(embedding)
                        .maxResults(3)
                        .build()
            );
            result.matches().forEach(match -> allResults.add(match.embedded()));
        }

        // 3. Generate answer with combined context
        String context = allResults.stream()
                .map(TextSegment::text)
                .collect(Collectors.joining("\n\n"));

        String prompt = "Context:\n" + context +
                       "\n\nQuestion: " + userQuery +
                       "\n\nAnswer:";

        return llm.generate(prompt);
    }
}
```

## RAG with Conversation Memory

```java
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;

public class ConversationalRAGExample {

    private final ChatLanguageModel llm;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final ChatMemory chatMemory;

    public ConversationalRAGExample() {
        this.llm = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();

        this.embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();

        this.embeddingStore = new InMemoryEmbeddingStore<>();

        this.chatMemory = MessageWindowChatMemory.withMaxMessages(10);
    }

    public String chat(String userMessage) {
        // 1. Retrieve relevant context
        Embedding questionEmbedding = embeddingModel.embed(userMessage).content();
        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(
            EmbeddingSearchRequest.builder()
                    .queryEmbedding(questionEmbedding)
                    .maxResults(3)
                    .build()
        );

        String context = searchResult.matches().stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.joining("\n\n"));

        // 2. Build prompt with context and conversation history
        SystemMessage systemMessage = SystemMessage.from(
            "You are a helpful assistant. Answer questions based on the provided context. " +
            "If the context doesn't contain relevant information, say so."
        );

        UserMessage currentMessage = UserMessage.from(
            "Context:\n" + context +
            "\n\nQuestion: " + userMessage
        );

        // 3. Add to memory
        if (chatMemory.messages().isEmpty()) {
            chatMemory.add(systemMessage);
        }
        chatMemory.add(currentMessage);

        // 4. Generate response
        String response = llm.generate(chatMemory.messages());

        // 5. Add assistant response to memory
        chatMemory.add(AssistantMessage.from(response));

        return response;
    }
}
```

## Production RAG System

### Complete RAG Service

```java
import org.springframework.stereotype.Service;

@Service
public class RAGService {

    private final ChatLanguageModel chatModel;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final Map<String, ChatMemory> userSessions;

    public RAGService(
            ChatLanguageModel chatModel,
            EmbeddingModel embeddingModel,
            EmbeddingStore<TextSegment> embeddingStore) {
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
        this.userSessions = new ConcurrentHashMap<>();
    }

    /**
     * Index documents for RAG
     */
    public void indexDocuments(List<Document> documents) {
        // Split documents
        DocumentSplitter splitter = DocumentSplitters.recursive(300, 20);

        for (Document document : documents) {
            List<TextSegment> segments = splitter.split(document);

            // Create embeddings and store
            for (TextSegment segment : segments) {
                Embedding embedding = embeddingModel.embed(segment).content();
                embeddingStore.add(embedding, segment);
            }
        }
    }

    /**
     * Answer question using RAG
     */
    public RAGResponse ask(String userId, String question) {
        // Get or create user session
        ChatMemory memory = userSessions.computeIfAbsent(
            userId,
            k -> MessageWindowChatMemory.withMaxMessages(10)
        );

        // Retrieve relevant context
        Embedding questionEmbedding = embeddingModel.embed(question).content();

        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(
            EmbeddingSearchRequest.builder()
                    .queryEmbedding(questionEmbedding)
                    .maxResults(5)
                    .minScore(0.7)
                    .build()
        );

        if (searchResult.matches().isEmpty()) {
            return new RAGResponse(
                "I couldn't find relevant information to answer your question.",
                List.of()
            );
        }

        // Build context
        String context = searchResult.matches().stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.joining("\n\n"));

        // Create prompt
        String prompt = String.format("""
            Based on the following context, answer the user's question.
            If the context doesn't contain enough information, say so.

            Context:
            %s

            Question: %s

            Answer:
            """, context, question);

        // Generate answer
        UserMessage userMessage = UserMessage.from(prompt);
        memory.add(userMessage);

        String answer = chatModel.generate(memory.messages());

        memory.add(AssistantMessage.from(answer));

        // Build response with sources
        List<Source> sources = searchResult.matches().stream()
                .map(match -> new Source(
                    match.embedded().text(),
                    match.score(),
                    match.embedded().metadata()
                ))
                .collect(Collectors.toList());

        return new RAGResponse(answer, sources);
    }

    /**
     * Clear user session
     */
    public void clearSession(String userId) {
        userSessions.remove(userId);
    }

    // Response DTOs
    public record RAGResponse(String answer, List<Source> sources) {}
    public record Source(String text, double score, Metadata metadata) {}
}
```

### REST Controller for RAG

```java
@RestController
@RequestMapping("/api/rag")
public class RAGController {

    private final RAGService ragService;

    public RAGController(RAGService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    public ResponseEntity<RAGResponse> ask(
            @RequestHeader("User-Id") String userId,
            @RequestBody QuestionRequest request) {

        RAGResponse response = ragService.ask(userId, request.question());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/index")
    public ResponseEntity<Void> indexDocuments(@RequestBody List<String> filePaths) {
        List<Document> documents = filePaths.stream()
                .map(path -> FileSystemDocumentLoader.loadDocument(Path.of(path)))
                .collect(Collectors.toList());

        ragService.indexDocuments(documents);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/session/{userId}")
    public ResponseEntity<Void> clearSession(@PathVariable String userId) {
        ragService.clearSession(userId);
        return ResponseEntity.ok().build();
    }

    record QuestionRequest(String question) {}
}
```

## Best Practices

### 1. Chunk Size Optimization

```java
// Small chunks (100-200 tokens): Better precision, may miss context
// Medium chunks (300-500 tokens): Good balance
// Large chunks (500-1000 tokens): More context, less precise

DocumentSplitter splitter = DocumentSplitters.recursive(
    300,  // Recommended: 300-500 tokens
    20    // 10-20% overlap
);
```

### 2. Number of Retrieved Chunks

```java
// Too few: Miss relevant information
// Too many: Noise and context window issues
// Recommended: 3-5 chunks

EmbeddingSearchRequest.builder()
        .queryEmbedding(queryEmbedding)
        .maxResults(5)  // Typically 3-5
        .minScore(0.7)  // Filter low-quality matches
        .build();
```

### 3. Prompt Engineering for RAG

```java
String goodPrompt = """
    Based ONLY on the following context, answer the question.
    If the context doesn't contain the answer, say "I don't have enough information."

    Context:
    %s

    Question: %s

    Answer:
    """;

// ❌ Bad: Allows hallucination
String badPrompt = "Answer this question: " + question;
```

### 4. Error Handling

```java
public RAGResponse robustAsk(String question) {
    try {
        // Retrieve context
        EmbeddingSearchResult<TextSegment> result = retrieveContext(question);

        if (result.matches().isEmpty()) {
            return new RAGResponse(
                "No relevant information found.",
                List.of()
            );
        }

        // Generate answer
        String answer = generateAnswer(question, result);
        return new RAGResponse(answer, extractSources(result));

    } catch (Exception e) {
        log.error("RAG error", e);
        return new RAGResponse(
            "Sorry, I encountered an error processing your question.",
            List.of()
        );
    }
}
```

### 5. Caching

```java
@Service
public class CachedRAGService {

    private final LoadingCache<String, Embedding> embeddingCache;

    public CachedRAGService() {
        this.embeddingCache = Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build(question -> embeddingModel.embed(question).content());
    }

    public RAGResponse ask(String question) {
        // Use cached embedding if available
        Embedding questionEmbedding = embeddingCache.get(question);

        // Continue with RAG...
    }
}
```

## Common Pitfalls and Solutions

### Problem 1: Irrelevant Results

**Solution**: Adjust similarity threshold and improve chunking

```java
EmbeddingSearchRequest.builder()
        .queryEmbedding(questionEmbedding)
        .maxResults(5)
        .minScore(0.75)  // Increase threshold (0.7 → 0.75)
        .build();
```

### Problem 2: Context Too Large

**Solution**: Retrieve more chunks but use only top results

```java
// Retrieve 10 candidates
EmbeddingSearchResult<TextSegment> candidates = embeddingStore.search(
    EmbeddingSearchRequest.builder()
            .queryEmbedding(questionEmbedding)
            .maxResults(10)
            .build()
);

// Use only top 3 for final context
String context = candidates.matches().stream()
        .limit(3)
        .map(match -> match.embedded().text())
        .collect(Collectors.joining("\n\n"));
```

### Problem 3: Slow Performance

**Solution**: Use batch embedding and async processing

```java
public void indexDocumentsAsync(List<Document> documents) {
    CompletableFuture.runAsync(() -> {
        // Batch embed segments
        List<TextSegment> allSegments = new ArrayList<>();
        for (Document doc : documents) {
            allSegments.addAll(splitter.split(doc));
        }

        // Embed in batches of 100
        for (int i = 0; i < allSegments.size(); i += 100) {
            List<TextSegment> batch = allSegments.subList(
                i,
                Math.min(i + 100, allSegments.size())
            );

            List<Embedding> embeddings = embeddingModel.embedAll(batch);

            for (int j = 0; j < batch.size(); j++) {
                embeddingStore.add(embeddings.get(j), batch.get(j));
            }
        }
    });
}
```

## Evaluation and Monitoring

### Metrics to Track

```java
public class RAGMetrics {

    // 1. Retrieval Precision
    public double calculateRetrievalPrecision(
            List<TextSegment> retrieved,
            List<TextSegment> relevant) {
        long correctRetrievals = retrieved.stream()
                .filter(relevant::contains)
                .count();
        return (double) correctRetrievals / retrieved.size();
    }

    // 2. Answer Quality (requires human evaluation)
    public void logAnswerQuality(String question, String answer, int rating) {
        // Log for analysis
        log.info("Question: {}, Rating: {}", question, rating);
    }

    // 3. Response Time
    public void measureResponseTime() {
        long start = System.currentTimeMillis();
        String answer = ragService.ask(userId, question);
        long duration = System.currentTimeMillis() - start;

        metrics.recordResponseTime(duration);
    }
}
```

## Next Steps

1. **Vector Databases**: Learn about specialized databases for embeddings
2. **Fine-tuning Embeddings**: Improve retrieval accuracy for your domain
3. **Multi-modal RAG**: Handle images, tables, and other formats
4. **Agent Systems**: Combine RAG with tool calling
5. **Production Deployment**: Scale RAG systems for high traffic

## Conclusion

RAG is a powerful technique to enhance LLMs with external knowledge:

- **Reduces hallucinations** by grounding responses in facts
- **Enables up-to-date information** without retraining
- **Provides source attribution** for verifiable answers
- **Cost-effective** compared to fine-tuning models

Key implementation steps:
1. Load and chunk documents
2. Create embeddings
3. Store in vector database
4. Retrieve relevant context
5. Generate augmented responses

## References

This tutorial is based on the excellent workshop **"KI Anwendungen im Unternehmen"** presented at BaselOne 2025. Special thanks to [David Beisert (beisdog)](https://github.com/beisdog) for creating comprehensive and practical workshop materials that demonstrate how to implement production-ready RAG systems using Java, LangChain4j, and vector databases.

**Original Workshop Materials**: [BaselOne AI Workshop on GitHub](https://github.com/chevp/baselone-ai-workshop)

The workshop provides detailed examples of RAG implementation patterns, including document processing, embedding strategies, and integration with PostgreSQL pgvector for enterprise applications.

## Content Review

The content in this tutorial has been reviewed and curated by [chevp](https://github.com/chevp), focusing on accuracy, clarity, and practical applicability for developers implementing RAG systems with Java and LangChain4j.