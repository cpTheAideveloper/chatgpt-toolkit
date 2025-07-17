# Guide to OpenAI Structured Output Using JSON Schema

The OpenAI API provides powerful capabilities for extracting structured data from text using JSON Schema. This guide explains how to use the `text.format` parameter to get consistently formatted outputs from your AI model.

## Basic Concept

The `text.format` parameter allows you to define exactly how you want the model's output to be structured, ensuring it follows a specific schema. This is particularly useful for:

- Data extraction tasks
- Creating parseable responses
- Building consistent application interfaces
- Integrating AI outputs with other systems

## Setting Up the Client

First, initialize the OpenAI client:

```javascript
import OpenAI from "openai";
const openai = new OpenAI();
```

## The Complete Format Request

Here's a complete example that extracts event information into a structured JSON object:

```javascript
const response = await openai.responses.create({
  model: "gpt-4o-2024-08-06",
  input: [
    {"role": "system", "content": "Extract the event information."},
    {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."}
  ],
  text: {
    format: {
      type: "json_schema",
      name: "calendar_event",
      schema: {
        type: "object",
        properties: {
          name: { 
            type: "string" 
          },
          date: { 
            type: "string" 
          },
          participants: { 
            type: "array", 
            items: { 
              type: "string" 
            } 
          },
        },
        required: ["name", "date", "participants"],
        additionalProperties: false,
      },
    }
  }
});

const event = JSON.parse(response.output_text);
```

## Breaking Down the Parameters

### 1. Model Selection

```javascript
model: "gpt-4o-2024-08-06"
```

The model parameter specifies which AI model to use. For structured output, newer models like GPT-4 and its variants generally perform better at adhering to strict schemas.

### 2. Input Format

```javascript
input: [
  {"role": "system", "content": "Extract the event information."},
  {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."}
]
```

The input parameter contains:
- A system message that defines the task ("Extract the event information")
- A user message containing the text from which to extract information

### 3. Text Formatting (The Core Feature)

```javascript
text: {
  format: {
    type: "json_schema",
    name: "calendar_event",
    schema: {
      type: "object",
      properties: {
        name: { 
          type: "string" 
        },
        date: { 
          type: "string" 
        },
        participants: { 
          type: "array", 
          items: { 
            type: "string" 
          } 
        },
      },
      required: ["name", "date", "participants"],
      additionalProperties: false,
    },
  }
}
```

This is where the magic happens:

- `type: "json_schema"`: Specifies we're using JSON Schema for validation
- `name: "calendar_event"`: Gives a name to the schema (helps the model understand the context)
- `schema`: The actual JSON Schema definition
  - `type: "object"`: Defines that we expect an object as the output
  - `properties`: Defines the structure of each field
    - `name`: The event name (string)
    - `date`: When the event occurs (string)
    - `participants`: Who's attending (array of strings)
  - `required`: Lists which fields must be present
  - `additionalProperties: false`: Prevents extra fields not in the schema

### 4. Processing the Response

```javascript
const event = JSON.parse(response.output_text);
```

The model returns a JSON string that follows your schema. You simply parse it to get a JavaScript object.

## Expected Output

For our example, the output might look like:

```json
{
  "name": "science fair",
  "date": "Friday",
  "participants": ["Alice", "Bob"]
}
```

## Advanced Schema Features

JSON Schema is highly flexible. Here are some additional features you can use:

### Data Validation Rules

```javascript
schema: {
  type: "object",
  properties: {
    email: { 
      type: "string",
      format: "email" 
    },
    age: { 
      type: "integer",
      minimum: 0,
      maximum: 120 
    },
    tags: {
      type: "array",
      minItems: 1,
      maxItems: 5
    }
  }
}
```

### Nested Objects

```javascript
schema: {
  type: "object",
  properties: {
    name: { type: "string" },
    location: {
      type: "object",
      properties: {
        address: { type: "string" },
        city: { type: "string" },
        country: { type: "string" }
      },
      required: ["city"]
    }
  }
}
```

### Enumerated Values

```javascript
schema: {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["pending", "confirmed", "cancelled"]
    }
  }
}
```

## Real-World Use Cases

### 1. Contact Information Extraction

```javascript
const response = await openai.responses.create({
  model: "gpt-4o-2024-08-06",
  input: "Please contact John Doe at johndoe@example.com or (555) 123-4567.",
  text: {
    format: {
      type: "json_schema",
      name: "contact",
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" }
        },
        required: ["name"]
      }
    }
  }
});
```

### 2. Product Review Analysis

```javascript
const response = await openai.responses.create({
  model: "gpt-4o-2024-08-06",
  input: "I love this phone! Great camera but battery life could be better.",
  text: {
    format: {
      type: "json_schema",
      name: "review_analysis",
      schema: {
        type: "object",
        properties: {
          sentiment: { 
            type: "string", 
            enum: ["positive", "neutral", "negative"] 
          },
          pros: { 
            type: "array", 
            items: { type: "string" } 
          },
          cons: { 
            type: "array", 
            items: { type: "string" } 
          },
          rating: { 
            type: "integer",
            minimum: 1,
            maximum: 5
          }
        },
        required: ["sentiment", "pros", "cons"]
      }
    }
  }
});
```

### 3. News Article Metadata

```javascript
const response = await openai.responses.create({
  model: "gpt-4o-2024-08-06",
  input: [
    {
      "role": "user", 
      "content": "Extract key information from this headline: 'Tech Giant Announces Revolutionary AI Chip During Annual Conference'"
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "article_metadata",
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          product: { type: "string" },
          event: { type: "string" },
          category: { 
            type: "string",
            enum: ["technology", "business", "science", "politics", "other"]
          }
        },
        required: ["title", "category"]
      }
    }
  }
});
```

## Best Practices

1. **Be Explicit**: Define your schema as clearly as possible with appropriate types and constraints.

2. **Test Edge Cases**: Make sure your schema handles missing information, unexpected formats, etc.

3. **Balance Strictness**: Too strict a schema might cause rejection of valid data; too loose might allow invalid data.

4. **Use System Messages**: Include clear instructions in your system message about the extraction task.

5. **Error Handling**: Always wrap your API calls in try/catch blocks and handle parsing errors:

```javascript
try {
  const response = await openai.responses.create({
    // configuration...
  });
  const structured_data = JSON.parse(response.output_text);
  // process data...
} catch (error) {
  console.error("Error:", error);
  // handle error appropriately
}
```

6. **Consider Formatting**: For date strings, phone numbers, or other formatted text, include examples in your system message or use formats in your schema.

## Limitations

- The model will do its best to adhere to your schema, but complex schemas may result in occasional errors.
- Very complex nested structures might be challenging for the model to fill accurately.
- The model may hallucinate values when information is not present in the input.

## Conclusion

Using JSON Schema with OpenAI's responses API provides a powerful way to get consistently structured outputs from AI models. This approach bridges the gap between free-form AI responses and structured data that applications can reliably process, making it easier to integrate AI capabilities into your software systems.