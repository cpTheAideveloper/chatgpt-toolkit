# Complete Guide to OpenAI Function Calling

Function calling is a powerful capability that allows OpenAI models to interact with your custom code or external services. This guide explains how to implement function calling to fetch data and take actions based on user inputs.

## What is Function Calling?

Function calling enables AI models to:
- Determine when to call external functions
- Format arguments correctly according to your function's requirements
- Incorporate function results into responses

This creates a seamless interaction between the AI model and your application's capabilities.

## Key Use Cases

Function calling has two primary applications:

1. **Fetching Data**
   - Retrieve real-time information (weather, stock prices, etc.)
   - Search knowledge bases or databases
   - Access user-specific information

2. **Taking Action**
   - Submit forms
   - Update application state
   - Trigger workflows
   - Call external APIs

## How Function Calling Works

Function calling follows a four-step process:

1. **Call model with function definitions**
2. **Model decides to call function(s)**
3. **Execute function code**
4. **Supply model with results**

Let's explore each step with a practical example.

## Step-by-Step Implementation

### Step 1: Define Your Functions

First, define your function schema to tell the model what your function does and what arguments it expects:

```javascript
const tools = [{
    type: "function",
    name: "get_weather",
    description: "Get current temperature for provided coordinates in celsius.",
    parameters: {
        type: "object",
        properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
        },
        required: ["latitude", "longitude"],
        additionalProperties: false
    },
    strict: true
}];
```

### Step 2: Make the Initial API Call

Call the OpenAI API with your function definitions and user input:

```javascript
import { OpenAI } from "openai";

const openai = new OpenAI();

const input = [
    {
        role: "user",
        content: "What's the weather like in Paris today?"
    }
];

const response = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
});
```

### Step 3: Handle the Function Call

The model will decide if it needs to call a function. If it does, you'll receive a response like:

```javascript
// Example response.output
[{
    "type": "function_call",
    "id": "fc_12345xyz",
    "call_id": "call_12345xyz",
    "name": "get_weather",
    "arguments": "{\"latitude\":48.8566,\"longitude\":2.3522}"
}]
```

Now execute your actual function with the provided arguments:

```javascript
const toolCall = response.output[0];
const args = JSON.parse(toolCall.arguments);

// Call your actual function
const result = await getWeather(args.latitude, args.longitude);
```

### Step 4: Return Results to the Model

Send the function results back to the model to generate a final response:

```javascript
input.push(toolCall); // append model's function call message
input.push({          // append result message
    type: "function_call_output",
    call_id: toolCall.call_id,
    output: result.toString()
});

const response2 = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
    store: true,
});

console.log(response2.output_text);
// Output: "The current temperature in Paris is 14°C (57.2°F)."
```

## Function Schema Components

When defining a function, include these key elements:

| Field | Description |
|-------|-------------|
| `type` | Always set to "function" |
| `name` | The function's name (e.g., "get_weather") |
| `description` | Details on when and how to use the function |
| `parameters` | JSON schema defining the function's input arguments |
| `strict` | Whether to enforce strict mode for the function call |

## More Complex Example: Knowledge Base Search

Here's a more advanced example showing a knowledge base search function:

```javascript
const tools = [{
    "type": "function",
    "name": "search_knowledge_base",
    "description": "Query a knowledge base to retrieve relevant info on a topic.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The user question or search query."
            },
            "options": {
                "type": "object",
                "properties": {
                    "num_results": {
                        "type": "number",
                        "description": "Number of top results to return."
                    },
                    "domain_filter": {
                        "type": ["string", "null"],
                        "description": "Optional domain to narrow the search. Pass null if not needed."
                    },
                    "sort_by": {
                        "type": ["string", "null"],
                        "enum": ["relevance", "date", "popularity", "alphabetical"],
                        "description": "How to sort results. Pass null if not needed."
                    }
                },
                "required": ["num_results", "domain_filter", "sort_by"],
                "additionalProperties": false
            }
        },
        "required": ["query", "options"],
        "additionalProperties": false
    }
}];

const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [{ role: "user", content: "Can you find information about ChatGPT in the AI knowledge base?" }],
    tools,
});

// Example output
// [{
//     "type": "function_call",
//     "id": "fc_12345xyz",
//     "call_id": "call_4567xyz",
//     "name": "search_knowledge_base",
//     "arguments": "{\"query\":\"What is ChatGPT?\",\"options\":{\"num_results\":3,\"domain_filter\":null,\"sort_by\":\"relevance\"}}"
// }]
```

## Best Practices

### Writing Effective Function Definitions

1. **Be Clear and Detailed**
   - Write descriptive function names
   - Provide detailed parameter descriptions
   - Explain input formats and expected outputs

2. **Use the System Prompt**
   - Describe when (and when not) to use each function
   - Give specific instructions on function usage

3. **Leverage JSON Schema Features**
   - Use enums for constrained choices
   - Apply appropriate types (string, number, boolean, etc.)
   - Define required fields
   - Structure nested objects logically

### Technical Implementation

1. **Keep Functions Simple**
   - Each function should do one thing well
   - Combine functions that are always used together

2. **Reduce Model Burden**
   - Don't make the model calculate values you already have
   - Handle complex logic in your code, not in the model

3. **Limit Function Count**
   - Aim for fewer than 20 functions at a time
   - Test performance with different numbers of functions

4. **Handle Errors Gracefully**
   - Validate function call inputs
   - Provide helpful error messages
   - Have fallbacks when functions fail

## Example Implementation: Weather Function

Here's how you might implement a complete weather function:

```javascript
// Define your actual function
async function getWeather(latitude, longitude) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
    const data = await response.json();
    return data.current.temperature_2m;
}

// Define the tool for OpenAI
const tools = [{
    type: "function",
    name: "get_weather",
    description: "Get current temperature for provided coordinates in celsius.",
    parameters: {
        type: "object",
        properties: {
            latitude: { 
                type: "number",
                description: "The latitude coordinate of the location"
            },
            longitude: { 
                type: "number",
                description: "The longitude coordinate of the location"
            }
        },
        required: ["latitude", "longitude"],
        additionalProperties: false
    },
    strict: true
}];

// Complete function calling flow
async function getWeatherResponse(userQuery) {
    const openai = new OpenAI();
    
    // Step 1: Initial request
    const messages = [{ role: "user", content: userQuery }];
    const response = await openai.responses.create({
        model: "gpt-4.1",
        input: messages,
        tools,
    });
    
    // Step 2: Check if function was called
    if (response.output && response.output[0]?.type === "function_call") {
        const toolCall = response.output[0];
        const args = JSON.parse(toolCall.arguments);
        
        // Step 3: Execute function
        try {
            const result = await getWeather(args.latitude, args.longitude);
            
            // Step 4: Return results to model
            messages.push(toolCall);
            messages.push({
                type: "function_call_output",
                call_id: toolCall.call_id,
                output: result.toString()
            });
            
            const finalResponse = await openai.responses.create({
                model: "gpt-4.1",
                input: messages,
                tools,
            });
            
            return finalResponse.output_text;
        } catch (error) {
            console.error("Error calling weather function:", error);
            return "Sorry, I couldn't retrieve the weather information at this time.";
        }
    } else {
        // No function call was made
        return response.output_text;
    }
}

// Usage
getWeatherResponse("What's the weather like in Tokyo right now?")
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

## Advanced Techniques

### Chaining Multiple Functions

Sometimes you'll need to call multiple functions in sequence. For example:

1. Search for a location
2. Get coordinates for that location
3. Fetch weather for those coordinates

Handle this by processing each function call separately and updating the conversation context after each one.

### Parallel Function Calls

For independent functions, you can execute them in parallel:

```javascript
if (response.output && response.output.length > 1) {
    const functionPromises = response.output
        .filter(item => item.type === "function_call")
        .map(async toolCall => {
            const args = JSON.parse(toolCall.arguments);
            let result;
            
            if (toolCall.name === "get_weather") {
                result = await getWeather(args.latitude, args.longitude);
            } else if (toolCall.name === "search_news") {
                result = await searchNews(args.query, args.count);
            }
            
            return {
                type: "function_call_output",
                call_id: toolCall.call_id,
                output: JSON.stringify(result)
            };
        });
    
    const functionResults = await Promise.all(functionPromises);
    
    // Add all results to the messages
    const updatedMessages = [...messages, ...response.output, ...functionResults];
    
    // Get final response
    const finalResponse = await openai.responses.create({
        model: "gpt-4.1",
        input: updatedMessages,
        tools,
    });
    
    return finalResponse.output_text;
}
```

## Conclusion

Function calling bridges the gap between AI models and your application's capabilities. By carefully designing your function definitions and following the implementation patterns outlined in this guide, you can create powerful, interactive experiences that seamlessly combine natural language understanding with dynamic data and actions.

Remember that function calling is an evolving capability. Experiment with different approaches, monitor the model's behavior, and refine your implementations based on real-world usage patterns.