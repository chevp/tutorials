# Open-Source LLMs Tutorial - Running Models Locally

## Introduction

Open-source Large Language Models (LLMs) provide powerful alternatives to commercial APIs like OpenAI, offering complete data privacy, no per-token costs, and full customization. This tutorial covers how to run open-source LLMs locally, integrate them with Java applications, and choose the right model for your needs.

## Why Open-Source LLMs?

### Advantages

**Data Privacy**
- All data stays on your infrastructure
- Full GDPR and compliance control
- No third-party data sharing
- Audit trail and data sovereignty

**Cost Control**
- No per-token fees
- One-time hardware investment
- Predictable costs
- Unlimited usage after setup

**Customization**
- Fine-tune models for your domain
- Full control over model behavior
- Custom training data
- Model architecture modifications

**No Vendor Lock-in**
- Switch models freely
- No API deprecation concerns
- Independence from provider availability
- Open standards and formats

### Challenges

**Hardware Requirements**
- Significant VRAM needed (4GB - 80GB+)
- GPU recommended for performance
- Storage for model files (4GB - 140GB per model)

**Technical Complexity**
- Model selection and configuration
- Performance optimization
- Version management
- Deployment and scaling

**Quality Tradeoffs**
- Smaller models less capable than GPT-4
- Larger models may match GPT-3.5
- Specialized fine-tuning often needed

## Hardware Requirements

### VRAM Calculation

```
VRAM (GB) = Parameters (billion) × Quantization (bits) / 8 × 1.2 (overhead)

Examples:
- 7B model, 4-bit: 7 × 4 / 8 × 1.2 = 4.2 GB
- 13B model, 4-bit: 13 × 4 / 8 × 1.2 = 7.8 GB
- 34B model, 4-bit: 34 × 4 / 8 × 1.2 = 20.4 GB
- 70B model, 4-bit: 70 × 4 / 8 × 1.2 = 42 GB
```

### Recommended Hardware

| Use Case | Model Size | VRAM | GPU | CPU | RAM |
|----------|-----------|------|-----|-----|-----|
| Development/Testing | 7B | 6GB | RTX 3060 | 4-core | 16GB |
| Production (Small) | 13B | 10GB | RTX 4070 | 8-core | 32GB |
| Production (Medium) | 34B | 24GB | RTX 4090 | 12-core | 64GB |
| Production (Large) | 70B | 48GB | Multi-GPU | 16-core | 128GB |

### Quantization Levels

```
┌─────────────┬──────────────┬──────────────┬─────────────┐
│ Quantization│ Quality      │ VRAM Usage   │ Speed       │
├─────────────┼──────────────┼──────────────┼─────────────┤
│ 16-bit (FP16)│ Best        │ Highest      │ Slowest     │
│ 8-bit (Q8)  │ Excellent    │ High         │ Moderate    │
│ 4-bit (Q4)  │ Good         │ Medium       │ Fast        │
│ 3-bit (Q3)  │ Fair         │ Low          │ Very Fast   │
│ 2-bit (Q2)  │ Poor         │ Very Low     │ Fastest     │
└─────────────┴──────────────┴──────────────┴─────────────┘

Recommendation: Start with 4-bit quantization (Q4_K_M)
```

## Popular Open-Source Models

### Small Models (7B-13B Parameters)

**LLaMA 2 7B / 13B** (Meta)
```
Strengths: Well-balanced, good general knowledge
Use Cases: Chatbots, content generation, Q&A
License: Free for commercial use
VRAM: 6GB / 10GB (4-bit)
```

**Mistral 7B** (Mistral AI)
```
Strengths: High performance for size, fast
Use Cases: Production applications, real-time chat
License: Apache 2.0
VRAM: 6GB (4-bit)
Performance: Rivals 13B models
```

**Phi-3 Mini** (Microsoft)
```
Strengths: Efficient, fast, multilingual
Use Cases: Edge devices, mobile, embedded
License: MIT
VRAM: 4GB (4-bit)
```

### Medium Models (30B-40B Parameters)

**Mixtral 8x7B** (Mistral AI)
```
Strengths: Mixture of Experts, high quality
Use Cases: Complex tasks, code generation
License: Apache 2.0
VRAM: 24GB (4-bit)
Performance: Competes with GPT-3.5
```

**LLaMA 2 34B** (Meta)
```
Strengths: Strong reasoning, good context
Use Cases: Advanced applications, analysis
License: Free for commercial use
VRAM: 20GB (4-bit)
```

### Large Models (70B+ Parameters)

**LLaMA 2 70B** (Meta)
```
Strengths: Near GPT-3.5 quality, versatile
Use Cases: High-end applications
License: Free for commercial use
VRAM: 42GB (4-bit)
```

**DeepSeek Coder 33B** (DeepSeek)
```
Strengths: Code-specialized, 16k context
Use Cases: Code generation, code review
License: MIT
VRAM: 20GB (4-bit)
```

### Specialized Models

**Code Llama 7B/13B/34B** (Meta)
```
Specialization: Code generation and completion
Languages: Python, Java, JavaScript, C++, etc.
VRAM: 6GB / 10GB / 20GB (4-bit)
```

**WizardCoder 15B** (WizardLM)
```
Specialization: Code tasks, HumanEval benchmarks
Performance: Strong on coding challenges
VRAM: 10GB (4-bit)
```

## Running Models with LM Studio

### Installation

1. **Download LM Studio**
   - Visit: https://lmstudio.ai/
   - Available for Windows, macOS, Linux
   - No installation required (portable)

2. **Download Models**
   - Open LM Studio
   - Browse available models
   - Filter by size (fits your VRAM)
   - Download models (automatic)

### Using LM Studio

#### Starting a Local Server

```bash
# LM Studio provides OpenAI-compatible API
# Default: http://localhost:1234/v1
```

**In LM Studio UI:**
1. Click "Local Server" tab
2. Select loaded model
3. Click "Start Server"
4. Server runs on port 1234

### Java Integration with LM Studio

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

public class LMStudioExample {

    public static void main(String[] args) {
        // Connect to LM Studio local server
        ChatLanguageModel model = OpenAiChatModel.builder()
                .baseUrl("http://localhost:1234/v1")
                .apiKey("not-needed")  // LM Studio doesn't require API key
                .modelName("local-model")
                .temperature(0.7)
                .build();

        // Use like any other LLM
        String response = model.generate("Explain Java Streams");
        System.out.println(response);
    }
}
```

### Full Application Example

```java
import dev.langchain4j.chain.ConversationalChain;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

public class LocalChatbotApplication {

    public static void main(String[] args) {
        // Configure local LLM
        ChatLanguageModel model = OpenAiChatModel.builder()
                .baseUrl("http://localhost:1234/v1")
                .apiKey("not-needed")
                .modelName("mistral-7b-instruct")
                .temperature(0.7)
                .maxTokens(500)
                .build();

        // Create conversation memory
        ChatMemory memory = MessageWindowChatMemory.withMaxMessages(10);

        // Build conversational chain
        ConversationalChain chain = ConversationalChain.builder()
                .chatLanguageModel(model)
                .chatMemory(memory)
                .build();

        // Interactive chat
        Scanner scanner = new Scanner(System.in);

        System.out.println("Local AI Chatbot (type 'exit' to quit)");
        System.out.println("Model: Mistral 7B running locally\n");

        while (true) {
            System.out.print("You: ");
            String input = scanner.nextLine();

            if (input.equalsIgnoreCase("exit")) {
                break;
            }

            String response = chain.execute(input);
            System.out.println("AI: " + response + "\n");
        }

        scanner.close();
    }
}
```

## Running Models with Ollama

### Installation

**Linux / macOS:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
```powershell
# Download from https://ollama.com/download
# Run installer
```

### Using Ollama

#### Basic Commands

```bash
# List available models
ollama list

# Pull a model
ollama pull llama2
ollama pull mistral
ollama pull codellama

# Run a model interactively
ollama run llama2

# Run with specific parameters
ollama run llama2 --temperature 0.7 --top-p 0.9
```

#### Starting Ollama Server

```bash
# Start server (runs on port 11434)
ollama serve

# Server provides REST API
# Endpoint: http://localhost:11434
```

### Java Integration with Ollama

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;

public class OllamaExample {

    public static void main(String[] args) {
        // Connect to Ollama
        ChatLanguageModel model = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("mistral")
                .temperature(0.7)
                .build();

        // Use the model
        String response = model.generate("What is the difference between JPA and Hibernate?");
        System.out.println(response);
    }
}
```

### Complete RAG Example with Ollama

```java
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;

import java.nio.file.Path;
import java.util.List;

public class LocalRAGSystem {

    public static void main(String[] args) {
        // 1. Setup local embedding model
        EmbeddingModel embeddingModel = OllamaEmbeddingModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("nomic-embed-text")  // Specialized embedding model
                .build();

        // 2. Setup local chat model
        ChatLanguageModel chatModel = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("mistral")
                .temperature(0.7)
                .build();

        // 3. Load and process documents
        Document document = FileSystemDocumentLoader.loadDocument(
                Path.of("company-docs.txt")
        );

        List<TextSegment> segments = DocumentSplitters.recursive(300, 20)
                .split(document);

        // 4. Create embeddings and store
        EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

        for (TextSegment segment : segments) {
            Embedding embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);
        }

        // 5. Query the system
        String question = "What is our vacation policy?";

        // Find relevant context
        Embedding questionEmbedding = embeddingModel.embed(question).content();
        List<EmbeddingMatch<TextSegment>> relevant =
                embeddingStore.findRelevant(questionEmbedding, 3);

        String context = relevant.stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.joining("\n\n"));

        // Generate answer
        String prompt = String.format("""
            Answer the question based on this context:

            Context:
            %s

            Question: %s

            Answer:
            """, context, question);

        String answer = chatModel.generate(prompt);

        System.out.println("Question: " + question);
        System.out.println("\nAnswer: " + answer);
        System.out.println("\nSources:");
        relevant.forEach(match -> {
            System.out.println("- " + match.embedded().text());
        });
    }
}
```

## Docker Deployment

### Ollama with Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama_data:
```

```bash
# Start Ollama
docker-compose up -d

# Pull models inside container
docker exec -it ollama ollama pull mistral
docker exec -it ollama ollama pull llama2
```

### LM Studio Alternative (vLLM)

```yaml
# docker-compose.yml for vLLM
version: '3.8'

services:
  vllm:
    image: vllm/vllm-openai:latest
    ports:
      - "8000:8000"
    volumes:
      - ./models:/models
    command: >
      --model /models/mistral-7b-instruct
      --host 0.0.0.0
      --port 8000
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## Spring Boot Integration

### Configuration

```java
@Configuration
public class LocalLLMConfig {

    @Bean
    public ChatLanguageModel localChatModel(
            @Value("${llm.base-url}") String baseUrl,
            @Value("${llm.model-name}") String modelName) {

        return OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.7)
                .timeout(Duration.ofSeconds(60))
                .build();
    }

    @Bean
    public EmbeddingModel localEmbeddingModel(
            @Value("${llm.base-url}") String baseUrl) {

        return OllamaEmbeddingModel.builder()
                .baseUrl(baseUrl)
                .modelName("nomic-embed-text")
                .build();
    }
}
```

### Application Properties

```yaml
# application.yml
llm:
  base-url: http://localhost:11434
  model-name: mistral
  embedding-model: nomic-embed-text

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/vectordb
    username: postgres
    password: postgres
```

### Service Layer

```java
@Service
public class LocalLLMService {

    private final ChatLanguageModel chatModel;
    private final EmbeddingModel embeddingModel;
    private final Map<String, ChatMemory> sessions;

    public LocalLLMService(
            ChatLanguageModel chatModel,
            EmbeddingModel embeddingModel) {
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.sessions = new ConcurrentHashMap<>();
    }

    public String chat(String userId, String message) {
        ChatMemory memory = sessions.computeIfAbsent(
                userId,
                k -> MessageWindowChatMemory.withMaxMessages(10)
        );

        ConversationalChain chain = ConversationalChain.builder()
                .chatLanguageModel(chatModel)
                .chatMemory(memory)
                .build();

        return chain.execute(message);
    }

    public float[] generateEmbedding(String text) {
        Embedding embedding = embeddingModel.embed(text).content();
        return embedding.vectorAsList().stream()
                .mapToFloat(Double::floatValue)
                .toArray();
    }

    public void clearSession(String userId) {
        sessions.remove(userId);
    }
}
```

## Model Selection Guide

### By Use Case

**General Chatbot**
```
Recommended: Mistral 7B or LLaMA 2 13B
Reason: Good balance of quality and speed
VRAM: 6-10GB
```

**Code Generation**
```
Recommended: Code Llama 13B or DeepSeek Coder 33B
Reason: Specialized for code, better completions
VRAM: 10-20GB
```

**Document Q&A (RAG)**
```
Recommended: Mistral 7B or LLaMA 2 7B
Reason: Good comprehension, context matters more than model
VRAM: 6GB
```

**Complex Reasoning**
```
Recommended: Mixtral 8x7B or LLaMA 2 70B
Reason: Better at multi-step reasoning
VRAM: 24-42GB
```

**Multilingual**
```
Recommended: LLaMA 2 or Mistral
Reason: Strong multilingual capabilities
VRAM: 6-10GB
```

### Performance Comparison

```
Model Ranking (Quality vs. Speed):

High Quality, Slower:
1. LLaMA 2 70B (4-bit)
2. Mixtral 8x7B (4-bit)
3. LLaMA 2 34B (4-bit)

Balanced:
4. LLaMA 2 13B (4-bit)
5. Mistral 7B (4-bit)
6. Code Llama 13B (4-bit)

Fast, Lower Quality:
7. LLaMA 2 7B (4-bit)
8. Phi-3 Mini (4-bit)
9. TinyLlama 1.1B (4-bit)
```

## Best Practices

### 1. Model Management

```java
@Service
public class ModelManager {

    private final Map<String, ChatLanguageModel> modelCache = new ConcurrentHashMap<>();

    public ChatLanguageModel getModel(String modelName) {
        return modelCache.computeIfAbsent(modelName, name -> {
            return OllamaChatModel.builder()
                    .baseUrl("http://localhost:11434")
                    .modelName(name)
                    .build();
        });
    }

    public void preloadModels() {
        // Preload commonly used models
        List.of("mistral", "llama2", "codellama")
                .forEach(this::getModel);
    }
}
```

### 2. Error Handling

```java
public String robustGenerate(String prompt) {
    int maxRetries = 3;
    int attempt = 0;

    while (attempt < maxRetries) {
        try {
            return chatModel.generate(prompt);
        } catch (Exception e) {
            attempt++;
            if (attempt >= maxRetries) {
                log.error("Failed after {} attempts", maxRetries, e);
                return "Sorry, I encountered an error. Please try again.";
            }
            // Exponential backoff
            try {
                Thread.sleep((long) Math.pow(2, attempt) * 1000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
    }
    return "Error generating response";
}
```

### 3. Response Streaming

```java
import dev.langchain4j.model.StreamingResponseHandler;
import dev.langchain4j.model.output.Response;

public class StreamingExample {

    public void streamResponse(String prompt) {
        StreamingChatLanguageModel model = OllamaStreamingChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("mistral")
                .build();

        model.generate(prompt, new StreamingResponseHandler<String>() {
            @Override
            public void onNext(String token) {
                System.out.print(token);
                // Send to client via WebSocket/SSE
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
    }
}
```

### 4. Monitoring

```java
@Service
public class LLMMonitoringService {

    private final MeterRegistry metrics;

    @Timed(value = "llm.generation", description = "LLM generation time")
    public String generate(String prompt) {
        Timer.Sample sample = Timer.start(metrics);

        try {
            String response = chatModel.generate(prompt);

            metrics.counter("llm.tokens.output",
                    "model", "mistral")
                    .increment(estimateTokens(response));

            return response;

        } finally {
            sample.stop(metrics.timer("llm.generation.duration"));
        }
    }

    private int estimateTokens(String text) {
        // Rough estimate: 1 token ≈ 0.75 words
        return (int) (text.split("\\s+").length / 0.75);
    }
}
```

### 5. Cost Tracking

```java
@Service
public class LocalLLMCostTracking {

    // Track electricity costs
    private static final double COST_PER_KWH = 0.12;  // $0.12 per kWh
    private static final double GPU_POWER_WATTS = 300;  // 300W for RTX 4090

    public double calculateCost(Duration runtime) {
        double hours = runtime.toMinutes() / 60.0;
        double kwh = (GPU_POWER_WATTS / 1000.0) * hours;
        return kwh * COST_PER_KWH;
    }

    public void logUsage(String modelName, Duration runtime, int tokens) {
        double cost = calculateCost(runtime);
        log.info("Model: {}, Runtime: {}min, Tokens: {}, Cost: ${:.4f}",
                modelName,
                runtime.toMinutes(),
                tokens,
                cost);
    }
}
```

## Troubleshooting

### Common Issues

**1. Out of Memory**
```
Solution: Use smaller model or lower quantization
- Try 4-bit instead of 8-bit
- Reduce context window size
- Close other GPU applications
```

**2. Slow Performance**
```
Solution: Optimize settings
- Enable GPU acceleration
- Use quantized models (Q4_K_M)
- Reduce max_tokens parameter
- Check CPU/RAM bottlenecks
```

**3. Poor Quality Responses**
```
Solution: Adjust parameters and prompts
- Increase temperature for creativity (0.7-0.9)
- Improve prompt engineering
- Try larger model
- Use specialized model for task
```

**4. Connection Timeouts**
```java
ChatLanguageModel model = OllamaChatModel.builder()
        .baseUrl("http://localhost:11434")
        .modelName("mistral")
        .timeout(Duration.ofMinutes(5))  // Increase timeout
        .maxRetries(3)
        .build();
```

## Comparison: Local vs. Cloud

| Aspect | Open-Source (Local) | Commercial (Cloud) |
|--------|--------------------|--------------------|
| **Cost** | Hardware investment | Per-token fees |
| **Data Privacy** | Complete control | Sent to provider |
| **Performance** | Depends on hardware | Consistently fast |
| **Scalability** | Limited by hardware | Nearly unlimited |
| **Quality** | Good to Excellent | Excellent |
| **Setup** | Complex | Simple |
| **Maintenance** | Self-managed | Managed |
| **Customization** | Full control | Limited |
| **Latency** | Local (fast) | Network dependent |

## Conclusion

Open-source LLMs provide viable alternatives to commercial APIs:

**When to Use Open-Source:**
- Data privacy is critical
- High-volume usage (cost savings)
- Custom model requirements
- No internet dependency needed
- Full control over infrastructure

**When to Use Commercial:**
- Need best-in-class quality (GPT-4)
- Limited technical resources
- Variable/unpredictable load
- Rapid prototyping
- No hardware investment

**Recommendations:**
1. **Start Small**: Begin with Mistral 7B or LLaMA 2 7B
2. **Test Locally**: Validate with LM Studio or Ollama
3. **Measure Performance**: Benchmark for your use case
4. **Scale Gradually**: Upgrade hardware as needed
5. **Hybrid Approach**: Use local for most tasks, cloud for complex ones

## Next Steps

1. **Fine-tuning**: Customize models for your domain
2. **Model Quantization**: Optimize size/performance
3. **Multi-GPU Setup**: Scale to larger models
4. **Production Deployment**: Kubernetes, load balancing
5. **Model Evaluation**: Benchmark and compare models

## References

This tutorial is based on the excellent workshop **"KI Anwendungen im Unternehmen"** presented at BaselOne 2025. Special thanks to [David Beisert (beisdog)](https://github.com/beisdog) for creating comprehensive and practical workshop materials that demonstrate how to run open-source LLMs locally using LM Studio and Ollama, with real-world integration examples using Java and LangChain4j for enterprise applications.

**Original Workshop Materials**: [BaselOne AI Workshop on GitHub](https://github.com/chevp/baselone-ai-workshop)

The workshop includes hands-on exercises for setting up local LLM environments, comparing different models, implementing RAG systems with local embeddings, and deploying production-ready applications without relying on cloud APIs.

## Content Review

The content in this tutorial has been reviewed and curated by [chevp](https://github.com/chevp), focusing on accuracy, clarity, and practical applicability for developers running open-source LLMs locally for enterprise applications.