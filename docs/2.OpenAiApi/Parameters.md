# Complete Guide to OpenAI Responses API Parameters

This guide explains the various parameters you can use with OpenAI's responses API to customize your AI interactions.

## Basic Structure

The OpenAI responses API uses this basic structure:

```javascript
const response = await client.responses.create({
    model: "model-name",
    input: "Your prompt here",
    // other parameters...
});

console.log(response.output_text);
```

## Essential Parameters

### `model`

The `model` parameter specifies which AI model to use for generating responses.

```javascript
model: "gpt-4.1"
```

Common model options:
- `gpt-4.1`: Latest GPT-4 iteration with improved capabilities
- `gpt-4o`: Optimized for balanced performance and cost
- `gpt-4o-mini`: Smaller, faster version with good capabilities
- `gpt-3.5-turbo`: Older model, still useful for many applications

**When to choose which model:**
- Use `gpt-4.1` for complex reasoning, creative tasks, or sensitive content
- Use `gpt-4o` for everyday use cases with good performance
- Use `gpt-4o-mini` for faster responses or when budget is a concern
- Consider the O series models (`o1`, `o1-mini`, `o3-mini`, `o1-pro`) for specialized use cases

### `input`

The `input` parameter accepts multiple formats:

#### Simple String Input

```javascript
input: "What's the capital of France?"
```

#### Structured Message Array

```javascript
input: [
    { role: "user", content: "Hello, how are you today?" }
]
```

#### Multimodal Inputs (Text + Images)

```javascript
input: [
    { role: "user", content: "What two teams are playing in this photo?" },
    {
        role: "user",
        content: [
            {
                type: "input_image", 
                image_url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/LeBron_James_Layup_%28Cleveland_vs_Brooklyn_2018%29.jpg",
            }
        ],
    },
]
```

### Role Types

In structured messages, you can use different roles:

- `user`: Represents the end user's messages
- `assistant`: Represents previous AI responses in the conversation
- `system`: Special role for providing overall instructions to the AI

Example of a conversation with multiple roles:

```javascript
input: [
    { role: "system", content: "You are a helpful assistant that speaks like Shakespeare." },
    { role: "user", content: "Introduce yourself" },
    { role: "assistant", content: "Hark! I am thy digital companion, crafted to assist thee in matters great and small." },
    { role: "user", content: "Tell me about the weather" }
]
```

## Advanced Parameters

### `temperature`

Controls the randomness of the model's outputs. Range is typically 0 to 2.

```javascript
temperature: 0.7
```

- **Lower values (0-0.3)**: More deterministic, focused responses
- **Medium values (0.4-0.8)**: Balanced creativity and coherence
- **Higher values (0.9-2.0)**: More random, creative, and diverse outputs

Note: Some models (like 'o1', 'o1-mini', 'o3-mini', 'o1-pro') do not support the temperature parameter.

### `tools`

Provides the model with access to specific tools or capabilities.

```javascript
tools: [{ type: "web_search_preview" }]
```

Common tool types:
- `web_search_preview`: Allows the model to search the web
- `function`: Enables function calling
- `code_interpreter`: Enables code execution capabilities

Example with web search:

```javascript
const response = await client.responses.create({
    model: "gpt-4.1",
    tools: [{ type: "web_search_preview" }],
    input: "What was a positive news story from today?",
});
```

### `instructions`

Provides high-level guidance to the model about how to respond.

```javascript
instructions: "You are a helpful AI assistant specializing in technical explanations."
```

This is similar to a system message but used differently in the responses API. Good instructions:
- Set the tone and persona
- Define specializations or constraints
- Establish response format preferences

### `stream`

Enables streaming responses piece by piece rather than waiting for the complete response.

```javascript
stream: true
```

When enabled, you'll need to handle the streaming response differently:

```javascript
const stream = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a short story.",
    stream: true
});

for await (const chunk of stream) {
    process.stdout.write(chunk.content);
}
```

### Other Parameters

- `max_tokens`: Limits the length of the response
- `stop`: Array of sequences where the model should stop generating
- `user`: A unique identifier representing the end-user

## Real-World Examples

### Simple Q&A Interaction

```javascript
const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: "What is the difference between AI and ML?",
    temperature: 0.2 // Lower temperature for fact-based response
});
```

### Image Analysis with Context

```javascript
const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
        { 
            role: "user", 
            content: [
                { type: "text", text: "What's happening in this image and what era is it from?" },
                {
                    type: "input_image",
                    image_url: "https://example.com/historical-photo.jpg",
                }
            ]
        }
    ]
});
```

### Web Search Integration

```javascript
const response = await client.responses.create({
    model: "gpt-4.1",
    tools: [{ type: "web_search_preview" }],
    input: "What are the latest developments in quantum computing?",
    instructions: "Provide a factual summary with recent information."
});
```

### Technical Assistant with Function Calling

```javascript
const response = await client.responses.create({
    model: "gpt-4.1",
    tools: [{
        type: "function",
        function: {
            name: "get_weather",
            description: "Get the current weather in a location",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The city and state, e.g., San Francisco, CA"
                    },
                    unit: {
                        type: "string",
                        enum: ["celsius", "fahrenheit"],
                        description: "The unit of temperature"
                    }
                },
                required: ["location"]
            }
        }
    }],
    input: "What's the weather like in Boston?"
});
```

## Best Practices

1. **Model Selection**: Start with 'gpt-4o-mini' for most tasks and scale up if needed
2. **Temperature Control**: Use lower values for factual tasks, higher for creative ones
3. **Conversation Context**: Include relevant previous messages for better continuity
4. **Specific Instructions**: Use clear instructions to guide the model's response style
5. **Proper Error Handling**: Always implement try/catch blocks for API calls
6. **Image Resolution**: When using image inputs, provide adequate resolution for analysis
7. **Tool Selection**: Only enable tools the model actually needs for the task
8. **Response Parsing**: Be prepared to handle different response formats based on the tools used

By understanding these parameters and their interactions, you can create more effective and specialized applications with OpenAI's powerful AI models.