# LangChain4j Tutorial - Building LLM Applications with Java

## Introduction

LangChain4j is a Java framework that simplifies building applications powered by Large Language Models (LLMs). It provides a unified interface to work with different LLM providers, handles conversation management, and enables advanced features like tool calling and retrieval-augmented generation (RAG).

This tutorial covers the fundamentals of LangChain4j, from basic chat interactions to advanced features like tool calling and memory management.

## What is LangChain4j?

LangChain4j is the Java implementation of the popular LangChain framework, designed specifically for:
- Building LLM-powered applications in Java
- Supporting multiple LLM providers (OpenAI, local models, etc.)
- Managing conversation context and memory
- Integrating tools and external functions
- Implementing RAG (Retrieval Augmented Generation)

### Key Features
- Type-safe API design
- Support for multiple LLM providers
- Conversation memory management
- Tool/Function calling capabilities
- Embedding and vector store integration
- Streaming responses
- Structured output parsing

## Prerequisites

Before starting, ensure you have:
- Java 17 or higher
- Maven or Gradle
- Basic understanding of Java and Spring Boot
- Familiarity with LLM concepts (see LLM Basics Tutorial)

## Setup and Installation

### Maven Dependency

```xml
<dependencies>
    <!-- LangChain4j Core -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- OpenAI Integration -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- Local Model Support (Ollama) -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-ollama</artifactId>
        <version>0.34.0</version>
    </dependency>

    <!-- Embeddings and Vector Stores -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-embeddings</artifactId>
        <version>0.34.0</version>
    </dependency>
</dependencies>
```

### Gradle Dependency

```gradle
dependencies {
    implementation 'dev.langchain4j:langchain4j:0.34.0'
    implementation 'dev.langchain4j:langchain4j-open-ai:0.34.0'
    implementation 'dev.langchain4j:langchain4j-ollama:0.34.0'
    implementation 'dev.langchain4j:langchain4j-embeddings:0.34.0'
}
```

## Basic Chat Example

### Simple Question-Answer

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

public class SimpleChatExample {
    public static void main(String[] args) {
        // Create a chat model
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .build();

        // Send a simple message
        String response = model.generate("What is the capital of France?");
        System.out.println(response);
        // Output: "The capital of France is Paris."
    }
}
```

### Using Local Models with Ollama

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;

public class LocalChatExample {
    public static void main(String[] args) {
        // Create a local chat model using Ollama
        ChatLanguageModel model = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("llama2")
                .temperature(0.7)
                .build();

        String response = model.generate("Explain quantum computing in simple terms.");
        System.out.println(response);
    }
}
```

## Conversation Memory

LLMs are stateless - they don't remember previous messages. LangChain4j provides memory management to maintain conversation context.

### Chat with Memory

```java
import dev.langchain4j.chain.ConversationalChain;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

public class ChatWithMemoryExample {
    public static void main(String[] args) {
        // Create the chat model
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .build();

        // Create memory that keeps last 10 messages
        ChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(10);

        // Create conversational chain
        ConversationalChain chain = ConversationalChain.builder()
                .chatLanguageModel(model)
                .chatMemory(chatMemory)
                .build();

        // Have a conversation
        String response1 = chain.execute("My name is John.");
        System.out.println("AI: " + response1);
        // Output: "Hello John! How can I help you today?"

        String response2 = chain.execute("What is my name?");
        System.out.println("AI: " + response2);
        // Output: "Your name is John."

        String response3 = chain.execute("What did I just ask you?");
        System.out.println("AI: " + response3);
        // Output: "You asked me what your name is."
    }
}
```

### Memory Types

**1. MessageWindowChatMemory**
```java
// Keeps the last N messages
ChatMemory memory = MessageWindowChatMemory.withMaxMessages(10);
```

**2. TokenWindowChatMemory**
```java
// Keeps messages within a token limit
ChatMemory memory = TokenWindowChatMemory.withMaxTokens(1000, tokenizer);
```

**3. Persistent Memory**
```java
// Store conversation history in database
ChatMemory memory = PersistentChatMemory.builder()
        .chatMemoryStore(chatMemoryStore)
        .build();
```

## System Messages and Prompts

### Using System Messages

```java
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

public class SystemMessageExample {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .build();

        // Define system message to set the AI's behavior
        SystemMessage systemMessage = SystemMessage.from(
            "You are a helpful Java programming expert. " +
            "Provide concise, practical code examples. " +
            "Always explain your code with comments."
        );

        UserMessage userMessage = UserMessage.from(
            "How do I read a file in Java?"
        );

        String response = model.generate(systemMessage, userMessage);
        System.out.println(response);
    }
}
```

### Prompt Templates

```java
import dev.langchain4j.model.input.PromptTemplate;

public class PromptTemplateExample {
    public static void main(String[] args) {
        // Define a prompt template
        PromptTemplate template = PromptTemplate.from(
            "You are a {{role}}. " +
            "Answer the following question: {{question}}"
        );

        // Fill in the template
        Map<String, Object> variables = Map.of(
            "role", "Java expert",
            "question", "What are Java Streams?"
        );

        Prompt prompt = template.apply(variables);

        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();

        String response = model.generate(prompt.toUserMessage());
        System.out.println(response);
    }
}
```

## Tool Calling and Function Execution

Tool calling allows LLMs to execute external functions and use real-time data.

### Defining Tools

```java
import dev.langchain4j.agent.tool.Tool;

public class CalculatorTools {

    @Tool("Calculate the sum of two numbers")
    public double add(double a, double b) {
        return a + b;
    }

    @Tool("Calculate the product of two numbers")
    public double multiply(double a, double b) {
        return a * b;
    }

    @Tool("Get current temperature for a city")
    public String getTemperature(String city) {
        // In real implementation, call weather API
        return "The current temperature in " + city + " is 22°C";
    }
}
```

### Using Tools with AI Agent

```java
import dev.langchain4j.service.AiServices;

public class ToolCallingExample {

    // Define an AI Service interface
    interface Assistant {
        String chat(String message);
    }

    public static void main(String[] args) {
        // Create calculator tools
        CalculatorTools calculator = new CalculatorTools();

        // Create AI model
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .build();

        // Build AI assistant with tools
        Assistant assistant = AiServices.builder(Assistant.class)
                .chatLanguageModel(model)
                .tools(calculator)
                .build();

        // The LLM will automatically use the calculator tools
        String response = assistant.chat("What is 23 times 47?");
        System.out.println(response);
        // Output: "23 times 47 equals 1081."

        String weather = assistant.chat("What's the temperature in Berlin?");
        System.out.println(weather);
        // Output: "The current temperature in Berlin is 22°C"
    }
}
```

### Advanced Tool Example - Database Query

```java
import dev.langchain4j.agent.tool.Tool;
import java.util.List;

public class DatabaseTools {

    @Tool("Search for employees by department")
    public List<String> findEmployeesByDepartment(String department) {
        // In real implementation, query database
        if (department.equalsIgnoreCase("Engineering")) {
            return List.of("Alice Smith", "Bob Johnson", "Charlie Brown");
        }
        return List.of();
    }

    @Tool("Get employee details by name")
    public String getEmployeeDetails(String name) {
        // In real implementation, query database
        return "Employee: " + name + "\n" +
               "Department: Engineering\n" +
               "Position: Senior Developer\n" +
               "Email: " + name.toLowerCase().replace(" ", ".") + "@company.com";
    }
}
```

## AI Services Interface

AI Services provide a type-safe way to interact with LLMs.

### Creating an AI Service

```java
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface CustomerSupportAgent {

    @SystemMessage("You are a customer support agent for a software company. " +
                   "Be helpful, professional, and concise.")
    String chat(@UserMessage String userMessage);

    @UserMessage("Summarize this customer feedback: {{feedback}}")
    String summarize(@V("feedback") String feedback);

    @UserMessage("Is this message a complaint or a question: {{message}}")
    String classify(@V("message") String message);
}
```

### Using the AI Service

```java
public class AiServiceExample {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();

        CustomerSupportAgent agent = AiServices.builder(CustomerSupportAgent.class)
                .chatLanguageModel(model)
                .build();

        // Use the AI service
        String response = agent.chat("How do I reset my password?");
        System.out.println(response);

        String summary = agent.summarize(
            "The product is great but the installation was confusing. " +
            "Documentation could be better."
        );
        System.out.println("Summary: " + summary);

        String classification = agent.classify("Why isn't my license key working?");
        System.out.println("Classification: " + classification);
    }
}
```

## Streaming Responses

For better user experience, stream responses token by token.

### Streaming Chat

```java
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.model.output.Response;

public class StreamingExample {
    public static void main(String[] args) {
        StreamingChatLanguageModel model = OpenAiStreamingChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .build();

        System.out.print("AI: ");
        model.generate("Explain the concept of microservices", new StreamingResponseHandler<String>() {
            @Override
            public void onNext(String token) {
                System.out.print(token);
            }

            @Override
            public void onComplete(Response<String> response) {
                System.out.println("\n[Complete]");
            }

            @Override
            public void onError(Throwable error) {
                System.err.println("Error: " + error.getMessage());
            }
        });

        // Wait for completion
        Thread.sleep(5000);
    }
}
```

## Embeddings and Semantic Search

Embeddings convert text into vectors for similarity search.

### Creating Embeddings

```java
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;

public class EmbeddingExample {
    public static void main(String[] args) {
        // Create embedding model
        EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("text-embedding-ada-002")
                .build();

        // Create embeddings for text
        TextSegment segment = TextSegment.from("Java is a programming language");
        Embedding embedding = embeddingModel.embed(segment).content();

        System.out.println("Embedding dimension: " + embedding.dimension());
        System.out.println("Embedding vector (first 10): " +
                          embedding.vector());
    }
}
```

### Semantic Similarity

```java
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;

public class SemanticSearchExample {
    public static void main(String[] args) {
        EmbeddingModel embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();

        // Create in-memory store
        InMemoryEmbeddingStore<TextSegment> embeddingStore =
                new InMemoryEmbeddingStore<>();

        // Add documents
        List<TextSegment> documents = List.of(
            TextSegment.from("Java is an object-oriented programming language"),
            TextSegment.from("Python is great for data science"),
            TextSegment.from("JavaScript runs in the browser"),
            TextSegment.from("Spring Boot is a Java framework")
        );

        // Embed and store documents
        documents.forEach(doc -> {
            Embedding embedding = embeddingModel.embed(doc).content();
            embeddingStore.add(embedding, doc);
        });

        // Search for similar documents
        String query = "Tell me about Java frameworks";
        Embedding queryEmbedding = embeddingModel.embed(query).content();

        EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(2)
                .minScore(0.7)
                .build();

        EmbeddingSearchResult<TextSegment> result =
                embeddingStore.search(searchRequest);

        // Print results
        result.matches().forEach(match -> {
            System.out.println("Score: " + match.score());
            System.out.println("Text: " + match.embedded().text());
            System.out.println();
        });
    }
}
```

## Spring Boot Integration

### Configuration

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChain4jConfig {

    @Value("${openai.api.key}")
    private String apiKey;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-3.5-turbo")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(60))
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return OpenAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("text-embedding-ada-002")
                .build();
    }
}
```

### REST Controller

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatLanguageModel chatModel;
    private final ChatMemory chatMemory;

    public ChatController(ChatLanguageModel chatModel) {
        this.chatModel = chatModel;
        this.chatMemory = MessageWindowChatMemory.withMaxMessages(10);
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        ConversationalChain chain = ConversationalChain.builder()
                .chatLanguageModel(chatModel)
                .chatMemory(chatMemory)
                .build();

        String response = chain.execute(request.getMessage());

        return new ChatResponse(response);
    }

    record ChatRequest(String message) {}
    record ChatResponse(String response) {}
}
```

## Error Handling and Best Practices

### Retry Logic

```java
import dev.langchain4j.model.openai.OpenAiChatModel;
import java.time.Duration;

public class RobustChatExample {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-3.5-turbo")
                .timeout(Duration.ofSeconds(30))
                .maxRetries(3)
                .logRequests(true)
                .logResponses(true)
                .build();

        try {
            String response = model.generate("Explain microservices");
            System.out.println(response);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            // Handle error appropriately
        }
    }
}
```

### Best Practices

1. **API Key Management**
```java
// Use environment variables or configuration files
String apiKey = System.getenv("OPENAI_API_KEY");

// Never hardcode API keys in source code
// ❌ BAD: String apiKey = "sk-...";
// ✅ GOOD: String apiKey = System.getenv("OPENAI_API_KEY");
```

2. **Memory Management**
```java
// Limit conversation history to avoid token limits
ChatMemory memory = MessageWindowChatMemory.withMaxMessages(10);

// Or use token-based limits
ChatMemory memory = TokenWindowChatMemory.withMaxTokens(2000, tokenizer);
```

3. **Timeout Configuration**
```java
ChatLanguageModel model = OpenAiChatModel.builder()
        .timeout(Duration.ofSeconds(60))  // Set appropriate timeout
        .maxRetries(3)                     // Retry on failures
        .build();
```

4. **Cost Management**
```java
// Use cheaper models for simple tasks
ChatLanguageModel model = OpenAiChatModel.builder()
        .modelName("gpt-3.5-turbo")  // Cheaper than gpt-4
        .temperature(0.7)             // Lower = more consistent (less tokens)
        .maxTokens(500)               // Limit response length
        .build();
```

5. **Logging and Monitoring**
```java
ChatLanguageModel model = OpenAiChatModel.builder()
        .logRequests(true)
        .logResponses(true)
        .build();
```

## Common Use Cases

### 1. Chatbot Application
```java
public class ChatbotService {
    private final ChatLanguageModel model;
    private final Map<String, ChatMemory> userSessions = new ConcurrentHashMap<>();

    public String chat(String userId, String message) {
        ChatMemory memory = userSessions.computeIfAbsent(
            userId,
            k -> MessageWindowChatMemory.withMaxMessages(10)
        );

        ConversationalChain chain = ConversationalChain.builder()
                .chatLanguageModel(model)
                .chatMemory(memory)
                .build();

        return chain.execute(message);
    }
}
```

### 2. Document Q&A
```java
public class DocumentQAService {
    private final ChatLanguageModel model;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public String answerQuestion(String question) {
        // Find relevant documents
        Embedding questionEmbedding = embeddingModel.embed(question).content();
        List<EmbeddingMatch<TextSegment>> relevant =
                embeddingStore.findRelevant(questionEmbedding, 3);

        // Build context from relevant documents
        String context = relevant.stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.joining("\n\n"));

        // Ask LLM with context
        String prompt = "Based on the following context:\n" + context +
                       "\n\nQuestion: " + question;

        return model.generate(prompt);
    }
}
```

### 3. Code Generation Assistant
```java
public class CodeGeneratorService {

    interface CodeGenerator {
        @SystemMessage("You are an expert Java developer. " +
                      "Generate clean, well-documented code. " +
                      "Include comments explaining the code.")
        String generateCode(@UserMessage String requirements);
    }

    private final CodeGenerator generator;

    public String generateJavaCode(String requirements) {
        return generator.generateCode(requirements);
    }
}
```

## Conclusion

LangChain4j provides a powerful, type-safe framework for building LLM applications in Java. Key takeaways:

- **Easy Integration**: Simple API to connect to various LLM providers
- **Memory Management**: Built-in conversation history handling
- **Tool Calling**: Enable LLMs to execute external functions
- **Type Safety**: Leverage Java's type system for robust applications
- **Spring Boot Ready**: Seamless integration with Spring Boot
- **Flexible**: Support for cloud APIs and local models

### Next Steps

1. **RAG Implementation**: Learn to combine LLMs with your own data
2. **Vector Databases**: Explore PostgreSQL pgvector, Pinecone, Weaviate
3. **Advanced Agents**: Build multi-step reasoning agents
4. **Production Deployment**: Scale your LLM applications
5. **Model Fine-tuning**: Customize models for your domain

## References

This tutorial is based on the excellent workshop **"KI Anwendungen im Unternehmen"** presented at BaselOne 2025. Special thanks to [David Beisert (beisdog)](https://github.com/beisdog) for creating comprehensive and practical workshop materials that demonstrate real-world LLM application development with Java and LangChain4j.

**Original Workshop Materials**: [BaselOne AI Workshop on GitHub](https://github.com/chevp/baselone-ai-workshop)

The workshop includes hands-on exercises covering basic chat implementations, conversation memory, tool calling, RAG systems, and production-ready patterns using LangChain4j.

## Content Review

The content in this tutorial has been reviewed and curated by [chevp](https://github.com/chevp), focusing on accuracy, clarity, and practical applicability for developers building LLM applications with Java and LangChain4j.