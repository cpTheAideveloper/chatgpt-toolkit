## Overview

The `useAudioManager` is a custom React Hook designed to manage audio messages in a chat application. It handles sending audio data to an API, processing the response, and updating the chat history accordingly.

### Table of Contents

1. [Imports](#1-imports)
2. [Helper Function: formatAudioMessages](#2-helper-function-formataudiomessages)
3. [Custom Hook: useAudioManager](#3-custom-hook-useaudiomanager)
    - [State Variables](#state-variables)
    - [sendMessageToAPI Function](#sendmessagetoapi-function)
    - [handleSendAudioMessage Function](#handlesendaudiomessage-function)
    - [sendAudio Function](#sendaudio-function)
    - [Return Statement](#return-statement)
4. [Export](#4-export)

Let's dive in!

---

## 1. Imports

```javascript
import { useState } from "react";
import { sanitizeMessageHistory } from "../helpers/messageHelpers";
```

**Explanation:**

- **`import { useState } from "react";`**
  - **`useState`** is a Hook provided by React that allows you to add state to functional components.
  - It's used to manage and update state variables within the component.

- **`import { sanitizeMessageHistory } from "../helpers/messageHelpers";`**
  - This imports the `sanitizeMessageHistory` function from a helper file.
  - **`sanitizeMessageHistory`** likely cleans or formats the message history to prepare it for sending to the API.

---

## 2. Helper Function: formatAudioMessages

```javascript
/**
 * Format the audio response into message format compatible with chat history
 * @param {Object} result - The response from the API
 * @param {string} audioURL - The URL to the recorded audio
 * @returns {Object} - Formatted user and assistant messages
 */
const formatAudioMessages = (result, audioURL) => {
  // Extract user transcription
  const userTranscription = result.userTransCription || "";
  
  // Create user message
  const userMessage = {
    role: "user",
    content: [
      { type: "audio", text: audioURL },
      { type: "text", text: userTranscription }
    ],
    timestamp: new Date().toISOString()
  };
  
  // Format assistant message based on the response structure
  let assistantContent = [];
  
  if (result.content && Array.isArray(result.content)) {
    // Handle the array structure from the response
    assistantContent = result.content.map(item => {
      // Handle audio buffer
      if (item.type === "audio" && item.text && item.text.data) {
        return {
          type: "audio",
          text: item.text
        };
      }
      // Handle text response
      else if (item.type === "text" && item.text) {
        return {
          type: "text",
          text: item.text
        };
      }
      return item;
    });
  } 
  // Fallback for simple text response
  else if (typeof result.content === 'string') {
    assistantContent = [{ type: "text", text: result.content }];
  }
  // Fallback for simple message response
  else if (typeof result.message === 'string') {
    assistantContent = [{ type: "text", text: result.message }];
  }
  // Final fallback
  else {
    assistantContent = [{ type: "text", text: "I processed your audio." }];
  }
  
  const assistantMessage = {
    role: "assistant",
    content: assistantContent,
    userTransCription: userTranscription, // Keep the original transcription for reference
    timestamp: new Date().toISOString()
  };
  
  return { userMessage, assistantMessage };
};
```

**Explanation:**

This function formats the audio response from the API into a structure that's compatible with the chat history.

- **Function Parameters:**
  - `result`: The response object received from the API.
  - `audioURL`: The URL of the recorded audio file.

- **Step-by-Step Breakdown:**

  1. **Extract User Transcription:**
     ```javascript
     const userTranscription = result.userTransCription || "";
     ```
     - Retrieves the user's transcription from the API response.
     - If `result.userTransCription` is undefined or falsy, it defaults to an empty string.

  2. **Create User Message Object:**
     ```javascript
     const userMessage = {
       role: "user",
       content: [
         { type: "audio", text: audioURL },
         { type: "text", text: userTranscription }
       ],
       timestamp: new Date().toISOString()
     };
     ```
     - Constructs a message object representing the user's input.
     - **`role`**: Indicates the sender, which is the user.
     - **`content`**: An array containing:
       - An audio type with the `audioURL`.
       - A text type with the user's transcription.
     - **`timestamp`**: The current time in ISO format.

  3. **Initialize Assistant Content:**
     ```javascript
     let assistantContent = [];
     ```

  4. **Process API Response Content:**
     ```javascript
     if (result.content && Array.isArray(result.content)) {
       // Handle the array structure from the response
       assistantContent = result.content.map(item => {
         // Handle audio buffer
         if (item.type === "audio" && item.text && item.text.data) {
           return {
             type: "audio",
             text: item.text
           };
         }
         // Handle text response
         else if (item.type === "text" && item.text) {
           return {
             type: "text",
             text: item.text
           };
         }
         return item;
       });
     } 
     ```
     - Checks if `result.content` exists and is an array.
     - Iterates over each item in `result.content`:
       - If the item is of type "audio" and has `text.data`, it formats it as an audio message.
       - If the item is of type "text" and has `text`, it formats it as a text message.
       - Otherwise, it returns the item as-is.

  5. **Fallbacks for Different Response Structures:**
     ```javascript
     else if (typeof result.content === 'string') {
       assistantContent = [{ type: "text", text: result.content }];
     }
     else if (typeof result.message === 'string') {
       assistantContent = [{ type: "text", text: result.message }];
     }
     else {
       assistantContent = [{ type: "text", text: "I processed your audio." }];
     }
     ```
     - If `result.content` is a simple string, wrap it in a text message.
     - If there's a `result.message` that's a string, use it as a text message.
     - If none of the above, set a default message indicating the audio was processed.

  6. **Create Assistant Message Object:**
     ```javascript
     const assistantMessage = {
       role: "assistant",
       content: assistantContent,
       userTransCription: userTranscription, // Keep the original transcription for reference
       timestamp: new Date().toISOString()
     };
     ```
     - Constructs a message object representing the assistant's response.
     - **`role`**: Indicates the sender, which is the assistant.
     - **`content`**: The formatted assistant content.
     - **`userTransCription`**: Stores the user's transcription for reference.
     - **`timestamp`**: The current time in ISO format.

  7. **Return Formatted Messages:**
     ```javascript
     return { userMessage, assistantMessage };
     ```
     - Returns both the user and assistant messages as an object.

---

## 3. Custom Hook: useAudioManager

```javascript
export const useAudioManager = (setMessages, activeModeRef, MODES) => {
  const [isAudioLoading, setAudioLoading] = useState(false);
  const [assistant, setAssistant] = useState(null);
  
  // ... functions defined here
  
  return {
    isAudioLoading,
    setAudioLoading,
    assistant,
    sendAudio
  };
};
```

**Explanation:**

`useAudioManager` is a custom Hook that manages audio-related functionalities in the application. It takes in three parameters:

- **Parameters:**
  - `setMessages`: A function to update the chat messages.
  - `activeModeRef`: A reference to the current mode (e.g., audio mode).
  - `MODES`: An object containing different modes (e.g., `MODES.AUDIO`).

### 3.1. State Variables

```javascript
const [isAudioLoading, setAudioLoading] = useState(false);
const [assistant, setAssistant] = useState(null);
```

- **`isAudioLoading` & `setAudioLoading`**
  - **`isAudioLoading`**: A boolean state indicating if audio is currently being processed/sent.
  - **`setAudioLoading`**: A function to update `isAudioLoading`.
  - **Initial Value**: `false` (not loading).

- **`assistant` & `setAssistant`**
  - **`assistant`**: Holds the response from the assistant after processing.
  - **`setAssistant`**: A function to update `assistant`.
  - **Initial Value**: `null` (no response yet).

### 3.2. sendMessageToAPI Function

```javascript
async function sendMessageToAPI(apiUrl, formData, messages) {
  // Sanitize message history before adding it to the request
  const sanitizedHistory = sanitizeMessageHistory(messages);
  
  // Add sanitized history to the form data if needed
  if (messages && messages.length > 0) {
    formData.append("history", JSON.stringify(sanitizedHistory));
  }
  
  const response = await fetch(apiUrl, {
    method: "POST",
    cache: "no-store",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
```

**Explanation:**

This asynchronous function sends the audio message and chat history to the API and retrieves the response.

- **Parameters:**
  - `apiUrl`: The endpoint URL to send the request to.
  - `formData`: The form data containing the audio file and possibly other fields.
  - `messages`: The current chat messages.

- **Step-by-Step Breakdown:**

  1. **Sanitize Message History:**
     ```javascript
     const sanitizedHistory = sanitizeMessageHistory(messages);
     ```
     - Cleans the message history to ensure it's in the correct format before sending.

  2. **Append Sanitized History to FormData:**
     ```javascript
     if (messages && messages.length > 0) {
       formData.append("history", JSON.stringify(sanitizedHistory));
     }
     ```
     - If there are existing messages, append the sanitized history as a JSON string under the key `"history"`.

  3. **Send POST Request:**
     ```javascript
     const response = await fetch(apiUrl, {
       method: "POST",
       cache: "no-store",
       body: formData,
     });
     ```
     - Uses the `fetch` API to send a POST request to `apiUrl`.
     - **Options:**
       - `method`: `"POST"` indicates we're sending data.
       - `cache`: `"no-store"` avoids using cached responses.
       - `body`: The `formData` containing the audio and history.

  4. **Handle HTTP Errors:**
     ```javascript
     if (!response.ok) {
       throw new Error(`HTTP error! Status: ${response.status}`);
     }
     ```
     - If the response status is not OK (status code not in the range 200-299), throw an error with the status code.

  5. **Parse and Return JSON Response:**
     ```javascript
     return response.json();
     ```
     - Parses the response body as JSON and returns it.

### 3.3. handleSendAudioMessage Function

```javascript
const handleSendAudioMessage = async (formData, audioURL, endpoint, messages = []) => {
  setAudioLoading(true);
  try {
    console.log(`Sending data to ${endpoint}`);
    const result = await sendMessageToAPI(endpoint, formData, messages);

    console.log("Audio API response:", result);
    
    // Format the messages
    const { userMessage, assistantMessage } = formatAudioMessages(result, audioURL);

    // Update the main message history with formatted messages
    setMessages((prevMessages) => [
      ...prevMessages, 
      userMessage,
      assistantMessage
    ]);
    
    // Store the entire result for any components that need it
    setAssistant(result);
  } catch (error) {
    console.error("Error sending audio message:", error);
    // Add error message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: [{ type: "text", text: `An error occurred processing your audio: ${error.message}` }],
        timestamp: new Date().toISOString()
      }
    ]);
  } finally {
    setAudioLoading(false);
  }
};
```

**Explanation:**

This function handles the process of sending the audio message to the API and updating the chat based on the response.

- **Parameters:**
  - `formData`: The form data containing the audio file and possibly other fields.
  - `audioURL`: The URL of the recorded audio file.
  - `endpoint`: The API endpoint to send the request to.
  - `messages`: The current chat messages (defaults to an empty array if not provided).

- **Step-by-Step Breakdown:**

  1. **Set Loading State:**
     ```javascript
     setAudioLoading(true);
     ```
     - Indicates that audio processing is in progress by setting `isAudioLoading` to `true`.

  2. **Try-Catch Block:**
     ```javascript
     try {
       // ... try to send the message and handle response
     } catch (error) {
       // ... handle any errors that occur
     } finally {
       setAudioLoading(false);
     }
     ```
     - **`try`**: Attempts to send the audio and process the response.
     - **`catch`**: Catches and handles any errors that occur during the process.
     - **`finally`**: Executes code regardless of success or error, here used to stop the loading state.

  3. **Log Sending Data:**
     ```javascript
     console.log(`Sending data to ${endpoint}`);
     ```
     - Prints a log message indicating the API endpoint being used.

  4. **Send Message to API:**
     ```javascript
     const result = await sendMessageToAPI(endpoint, formData, messages);
     ```
     - Calls the previously defined `sendMessageToAPI` function to send the data and waits for the response.

  5. **Log API Response:**
     ```javascript
     console.log("Audio API response:", result);
     ```
     - Logs the raw response from the API for debugging purposes.

  6. **Format Messages:**
     ```javascript
     const { userMessage, assistantMessage } = formatAudioMessages(result, audioURL);
     ```
     - Uses the `formatAudioMessages` helper function to format the API response into user and assistant messages.

  7. **Update Chat Messages:**
     ```javascript
     setMessages((prevMessages) => [
       ...prevMessages, 
       userMessage,
       assistantMessage
     ]);
     ```
     - Updates the chat history by appending the new `userMessage` and `assistantMessage`.
     - **`prevMessages`**: The existing messages before the update.
     - **`...prevMessages`**: Spreads the existing messages to maintain them.
     - **`userMessage`, `assistantMessage`**: The new messages to add.

  8. **Store Assistant Response:**
     ```javascript
     setAssistant(result);
     ```
     - Saves the entire API response in the `assistant` state variable for potential use elsewhere.

  9. **Handle Errors:**
     ```javascript
     console.error("Error sending audio message:", error);
     setMessages((prevMessages) => [
       ...prevMessages,
       {
         role: "assistant",
         content: [{ type: "text", text: `An error occurred processing your audio: ${error.message}` }],
         timestamp: new Date().toISOString()
       }
     ]);
     ```
     - Logs the error to the console.
     - Adds an error message to the chat to inform the user.

  10. **Stop Loading State:**
      ```javascript
      setAudioLoading(false);
      ```
      - Indicates that audio processing is complete by setting `isAudioLoading` to `false`.

### 3.4. sendAudio Function

```javascript
const sendAudio = async (audioBlob, currentMessages = []) => {
  if (!audioBlob) return;
 
  // Store that we're in audio mode when the request starts
  activeModeRef.current = MODES.AUDIO;

  const audioURL = URL.createObjectURL(audioBlob);
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.webm");

  await handleSendAudioMessage(
    formData, 
    audioURL, 
    "http://localhost:8000/audio/talkToGpt",
    currentMessages
  );
};
```

**Explanation:**

This function initiates the process of sending the audio file to the API.

- **Parameters:**
  - `audioBlob`: The audio file data captured (usually from a recording).
  - `currentMessages`: The current chat messages (defaults to an empty array if not provided).

- **Step-by-Step Breakdown:**

  1. **Check for Audio Data:**
     ```javascript
     if (!audioBlob) return;
     ```
     - If there's no audio data (`audioBlob` is falsy), exit the function early.

  2. **Set Active Mode to Audio:**
     ```javascript
     activeModeRef.current = MODES.AUDIO;
     ```
     - Updates the `activeModeRef` to indicate that the app is currently in audio mode.

  3. **Create Audio URL:**
     ```javascript
     const audioURL = URL.createObjectURL(audioBlob);
     ```
     - Generates a temporary URL for the audio blob, allowing it to be played or accessed within the application.

  4. **Prepare FormData:**
     ```javascript
     const formData = new FormData();
     formData.append("audio", audioBlob, "audio.webm");
     ```
     - Creates a new `FormData` object to hold the audio file.
     - Appends the `audioBlob` to the form data with the key `"audio"` and filename `"audio.webm"`.

  5. **Handle Sending Audio Message:**
     ```javascript
     await handleSendAudioMessage(
       formData, 
       audioURL, 
       "http://localhost:8000/audio/talkToGpt",
       currentMessages
     );
     ```
     - Calls `handleSendAudioMessage` with the prepared form data, audio URL, API endpoint, and current messages.
     - **`await`** ensures that the function waits for `handleSendAudioMessage` to complete before proceeding.

### 3.5. Return Statement

```javascript
return {
  isAudioLoading,
  setAudioLoading,
  assistant,
  sendAudio
};
```

**Explanation:**

The Hook returns an object containing:

- **`isAudioLoading`**: Indicates if audio processing is in progress.
- **`setAudioLoading`**: Function to manually set the loading state (though it's primarily managed internally).
- **`assistant`**: The latest response from the assistant.
- **`sendAudio`**: The function to initiate sending audio data.

Components using this Hook can utilize these returned values and functions to manage audio messaging effectively.

---

## 4. Export

```javascript
export const useAudioManager = (setMessages, activeModeRef, MODES) => { /* ... */ };
```

**Explanation:**

This line exports the `useAudioManager` Hook so it can be imported and used in other parts of the application.

---

## Putting It All Together

Here's a summary of how the `useAudioManager` Hook works within a React component:

1. **Import the Hook:**
   ```javascript
   import { useAudioManager } from "./hooks/useAudioManager";
   ```

2. **Use the Hook in a Component:**
   ```javascript
   const ChatComponent = () => {
     const [messages, setMessages] = useState([]);
     const activeModeRef = useRef(null);
     const MODES = { AUDIO: 'audio', TEXT: 'text' };

     const { isAudioLoading, assistant, sendAudio } = useAudioManager(setMessages, activeModeRef, MODES);

     // Function to handle audio recording and sending
     const handleRecordingComplete = (audioBlob) => {
       sendAudio(audioBlob, messages);
     };

     return (
       <div>
         {/* Chat UI components */}
         {isAudioLoading && <p>Loading...</p>}
       </div>
     );
   };
   ```

3. **Workflow:**
   - When an audio recording is completed (`handleRecordingComplete`), `sendAudio` is called with the audio blob.
   - `sendAudio` prepares the form data and calls `handleSendAudioMessage`.
   - `handleSendAudioMessage` sets the loading state, sends the audio and messages to the API, formats the response, updates the chat messages, and handles any errors.
   - The UI can display loading indicators based on `isAudioLoading` and show messages from `messages`.

---

## Key Concepts to Understand

1. **React Hooks:**
   - **`useState`**: Manages state in functional components.
   - **Custom Hooks**: Allows you to extract and reuse logic across components.

2. **Asynchronous JavaScript:**
   - **`async` / `await`**: Handles asynchronous operations like API calls.
   - **Error Handling**: Using `try-catch` to manage errors during async operations.

3. **API Communication:**
   - **`fetch` API**: Sends HTTP requests to servers.
   - **`FormData`**: Constructs key/value pairs for sending files and data.

4. **Data Formatting:**
   - Structuring data to match the requirements of the chat history and API.

5. **State Management:**
   - Updating and maintaining the state (`messages`, `isAudioLoading`, etc.) to reflect the current status of the application.

6. **References (`useRef`):**
   - **`activeModeRef`**: Holds mutable values that persist across renders without causing re-renders.

---

I hope this breakdown helps you understand the `useAudioManager.js` code better! Feel free to ask if you have any questions or need further clarification on any part.