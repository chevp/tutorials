# Large Language Models (LLM) Basics Tutorial

## Introduction

Large Language Models (LLMs) are AI models trained on massive amounts of text data to understand and generate human-like text. This tutorial covers the fundamental concepts, architecture, and practical usage of LLMs, based on modern transformer architecture.

## What are Large Language Models?

LLMs are neural networks with billions of parameters that can:
- Understand natural language context
- Generate coherent text
- Translate languages
- Answer questions
- Write code
- And much more

## History of LLMs

### Before ChatGPT

**RNN and LSTM (Pre-2017)**
- Recurrent Neural Networks and Long Short-Term Memory networks
- Problems:
  - Sequential processing → slow
  - Long dependencies: Information from earlier sentences was lost/forgotten

### The Breakthrough 2017

**"Attention is All You Need" (Google Research 2017)**
- Introduced the Transformer architecture
- Key innovations:
  - Parallel processing
  - Self-attention mechanism
  - Each word relates to all other words in the sentence
  - Encoder-Decoder architecture

### The Evolution

```
2018: BERT (Google) - Bidirectional encoder transformer for NLP tasks
2020: GPT-3 (OpenAI) - Autoregressive transformer with 175 billion parameters
2022-11-30: ChatGPT launched publicly with GPT-3.5
2023-03-14: GPT-4 released
2023+: Gemini, LLaMA, Mistral, DeepSeek, and many more
```

## Transformer Architecture

### Core Concepts

#### 1. Tokens
- Word pieces: approximately 0.75 of a word
- The unit in which LLMs bill usage
- Each LLM has a maximum number of tokens it can read and generate
- Types:
  - Input tokens
  - Output tokens
  - Reasoning tokens (for advanced models)

```
Example:
Word: "Katze" (Cat in German)
Tokens: ["Katz", "e"]
```

#### 2. Context Window
- Describes the number of tokens you can send to the LLM in one request
- **The size of the context window is the central problem in working with LLMs**
- Size determines:
  - Amount of information
  - Cost
  - Accuracy

**Managing Context Window:**
- Reduce conversation size
- Only include necessary data
- Use summarization techniques

#### 3. Embeddings

Embeddings convert tokens into vectors that represent relationships and weights between tokens/words.

```python
# Example: Converting text to embeddings
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# Text to embed
text = "Die Katze jagt die Maus"  # "The cat hunts the mouse"

# Generate embedding
embedding = model.encode(text)
print(f"Embedding dimension: {len(embedding)}")
print(f"First 10 values: {embedding[:10]}")
```

**Popular Embedding Models:**
- Word2Vec
- OpenAI: text-embedding-ada-002
- nomic-embed-text
- BERT embeddings

#### 4. Self-Attention Mechanism

**Why is this so powerful?**
- Considers global context: Every word can interact with all other words
- Recognizes dependencies independent of word order
- Enables parallel processing: All words can be processed simultaneously

```
Example: "Die Katze jagt die Maus"

Self-Attention Scores for "jagt" (hunts):
Word:    die  Katze  jagt  die  Maus
Score:   0.1   0.8   1.0  0.2   0.9

Interpretation: "jagt" has high relationship with "Katze" (cat) and "Maus" (mouse)
```

## How LLMs Work - Step by Step

### Example Sentence: "Die Katze jagt die Maus"

#### Step 1: Tokenization
```
Sentence → Tokens
"Die Katze jagt die Maus" → ["Die", "Katze", "jagt", "die", "Maus"]
```

#### Step 2: Vectorization
```
Token → Embedding Model → Vector
Each token becomes a high-dimensional vector:
"Katze" → [0.23, -0.17, 0.45, ..., 0.12]
```

#### Step 3: Query, Key, Value Calculation
Each token gets three vectors:
- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What information do I offer?"
- **Value (V)**: "What information do I pass on?"

#### Step 4: Attention Score Calculation
```
Attention Score = (Q · K^T) / √d_k

For "jagt":
- High attention to "Katze" (0.8)
- High attention to "Maus" (0.9)
- Model understands "jagt" describes action between these words
```

#### Step 5: Multi-Head Attention
- Instead of single attention calculation, use multiple "attention heads"
- One head focuses on grammatical structure
- Another head captures semantic meaning
- Different perspectives are combined

### Complete Processing Pipeline

```
Input Text
    ↓
Tokenization
    ↓
Embedding
    ↓
Positional Encoding
    ↓
Multi-Head Attention (×N layers)
    ↓
Feed Forward Neural Network
    ↓
Output Layer
    ↓
Generated Text
```

## Types of LLMs

### 1. Chat Models (Autoregressive)
- Generate text token by token
- Examples: GPT-3, GPT-4, LLaMA
- Best for: Text generation, conversations

### 2. Encoder Models
- Understand and encode text
- Examples: BERT, RoBERTa
- Best for: Classification, entity recognition

### 3. Encoder-Decoder Models
- Combine both approaches
- Examples: T5, BART
- Best for: Translation, summarization

## Message Types in LLM Conversations

### System Message
```python
system_message = """
You are an assistant that answers questions about an employee's resume.
Please provide bullet points when possible.
"""
```

**Purpose:**
- Only ONE system message per conversation
- Instructs the LLM about:
  - General task description
  - Role to assume
  - Tone to use (funny, formal, as a pirate, language, etc.)

### User Message
```python
user_message = "What programming languages does the candidate know?"
```

**Purpose:**
- The user's question
- The dynamic part of the conversation

### Assistant Message
```python
assistant_message = """
The candidate is proficient in:
- Java
- Python
- JavaScript
- SQL
"""
```

**Purpose:**
- The LLM's response

### Conversation Structure

```python
conversation = [
    SystemMessage("You are a helpful assistant"),
    UserMessage("Hello!"),
    AssistantMessage("Hi! How can I help you?"),
    UserMessage("What is machine learning?"),
    AssistantMessage("Machine learning is...")
]

# Chat Models are STATELESS
# You must send the entire conversation history with each request!
```

## Prompt Engineering Basics

### What is a Prompt?
The input you send to the LLM to get a response.

### Prompt Components

```
[System Instructions]
+ [Context/Background Information]
+ [User Question/Task]
+ [Output Format Instructions]
= Complete Prompt
```

### Example: Simple Prompt
```
User: "What is the capital of France?"
Assistant: "The capital of France is Paris."
```

### Example: Structured Prompt
```
System: "You are a geography teacher. Provide concise, educational answers."

User: "What is the capital of France?"
Assistant: "The capital of France is Paris. It has been the country's capital since 1944."
```

### Best Practices for Prompting
1. **Be specific**: Clearly state what you want
2. **Provide context**: Give relevant background information
3. **Specify format**: Tell the LLM how you want the output structured
4. **Use examples**: Show the LLM what you expect (few-shot learning)
5. **Iterate**: Refine your prompts based on the results

## Tool Calling and Function Execution

Modern LLMs can call external functions to extend their capabilities beyond text generation.

### How Tool Calling Works

```
1. Define available tools/functions with their parameters
2. LLM analyzes the user request
3. If a tool is needed, LLM generates a tool call request
4. Application executes the function
5. Result is sent back to the LLM
6. LLM incorporates the result into its response
```

### Example: Weather Tool

```java
// Define a weather tool
public class WeatherTool {
    @Tool(name = "get_current_weather")
    public String getCurrentWeather(
        @Parameter(description = "City name") String city,
        @Parameter(description = "Temperature unit") String unit
    ) {
        // Call weather API
        return "Temperature in " + city + ": 22°" + unit;
    }
}
```

## Hardware Requirements for Running LLMs Locally

### VRAM Calculation Formula

```
VRAM (GB) = Parameters (in billions) × Quantization bits / 8 × 1.2 (buffer)

Examples:
- 7B model with 4-bit quantization: 7 × 4 / 8 × 1.2 = 4.2 GB VRAM
- 13B model with 4-bit quantization: 13 × 4 / 8 × 1.2 = 7.8 GB VRAM
- 70B model with 4-bit quantization: 70 × 4 / 8 × 1.2 = 42 GB VRAM
```

### Quantization Levels
- **16-bit (FP16)**: Highest quality, most VRAM
- **8-bit**: Good balance between quality and size
- **4-bit**: Most efficient, slight quality loss
- **2-bit**: Very compressed, noticeable quality degradation

### Recommended Hardware

| Model Size | Quantization | Minimum VRAM | Recommended GPU |
|------------|--------------|--------------|-----------------|
| 7B | 4-bit | 4-6 GB | RTX 3060 Ti |
| 13B | 4-bit | 8-10 GB | RTX 4070 |
| 34B | 4-bit | 20-24 GB | RTX 4090 |
| 70B | 4-bit | 40-48 GB | Multi-GPU setup |

## Enterprise Considerations

### Data Privacy and Compliance
- **GDPR (EU)**: General Data Protection Regulation
- **BDSG (Germany)**: Federal Data Protection Act
- **EU AI Act**: Regulation for AI systems
- **Data Sovereignty**: Keep data within specific geographic boundaries

### On-Premises vs. Cloud LLMs

**On-Premises (Local LLMs)**:
- Full data control
- No data leaves your infrastructure
- One-time hardware costs
- Complete customization
- No per-token costs

**Cloud-Based**:
- Latest models available immediately
- Pay-per-use pricing
- No hardware maintenance
- Scalability
- Data sent to third-party servers

### Cost Considerations

**Cloud LLMs**:
- Input tokens: $0.002 - $0.03 per 1K tokens
- Output tokens: $0.006 - $0.06 per 1K tokens
- Can become expensive at scale

**Local LLMs**:
- Initial hardware investment: $1,000 - $10,000+
- Electricity costs
- Maintenance and updates
- Cost-effective for high-volume usage

## Popular Open-Source LLMs

### Small Models (7B-13B Parameters)
- **LLaMA 2 7B/13B**: Meta's open-source model
- **Mistral 7B**: High-performance small model
- **Phi-3**: Microsoft's efficient model
- **Gemma 7B**: Google's lightweight model

### Medium Models (30B-40B Parameters)
- **LLaMA 2 34B**: Better reasoning capabilities
- **Mixtral 8x7B**: Mixture of experts architecture
- **Yi 34B**: Strong multilingual support

### Large Models (70B+ Parameters)
- **LLaMA 2 70B**: High-quality responses
- **DeepSeek Coder 33B**: Specialized for coding
- **Qwen 72B**: Multilingual capabilities

## Getting Started with LLMs

### 1. Choose Your Approach

**Option A: Cloud APIs**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Quick setup, pay-per-use

**Option B: Local Setup**
- Install LM Studio or Ollama
- Download open-source models
- Run on your hardware

### 2. Start Simple
```python
# Example with OpenAI API
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ]
)

print(response.choices[0].message.content)
```

### 3. Learn Prompt Engineering
- Experiment with different prompts
- Test various approaches
- Track what works best for your use case

### 4. Understand Limitations
- LLMs can "hallucinate" (generate incorrect information)
- They don't truly "understand" - they predict patterns
- Context window limitations
- Training data cutoff dates

## Next Steps

After understanding LLM basics, explore:

1. **RAG (Retrieval Augmented Generation)**: Combine LLMs with your own data
2. **Vector Databases**: Store and search embeddings efficiently
3. **LangChain4j**: Java framework for building LLM applications
4. **Fine-tuning**: Adapt models to your specific domain
5. **Agent Systems**: Build autonomous AI agents

## Conclusion

Large Language Models represent a breakthrough in AI capabilities, built on the transformer architecture with self-attention mechanisms. Understanding tokens, embeddings, context windows, and prompt engineering is essential for effectively working with LLMs.

Key takeaways:
- Transformers revolutionized NLP with parallel processing and self-attention
- Context window management is crucial for LLM applications
- Choose between cloud APIs and local models based on your needs
- Consider data privacy, costs, and hardware requirements
- Open-source models offer viable alternatives to commercial APIs

## References

This tutorial is based on the excellent workshop **"KI Anwendungen im Unternehmen"** presented at BaselOne 2025. Special thanks to [David Beisert (beisdog)](https://github.com/beisdog) for creating comprehensive and practical workshop materials that bridge the gap between LLM theory and real-world enterprise applications with Java.

**Original Workshop Materials**: [BaselOne AI Workshop on GitHub](https://github.com/chevp/baselone-ai-workshop)

The workshop provides hands-on exercises and code examples demonstrating how to build production-ready LLM applications using Java, LangChain4j, and open-source models.

## Content Review

The content in this tutorial has been reviewed and curated by [chevp](https://github.com/chevp), focusing on accuracy, clarity, and practical applicability for developers working with Large Language Models.