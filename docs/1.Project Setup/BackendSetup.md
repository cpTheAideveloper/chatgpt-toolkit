
## Backend Setup
The backend is a Node.js API server built with Express. It connects to OpenAI’s API and handles user requests through api route.
Key features include:

Simple routing with Express.

Environment configuration using .env and dotenv.

Middleware for JSON and CORS support.

Integration with the official OpenAI SDK using a helper function (chatHelper) that formats and sends messages to the language model.

This part sets up a clear backend logic flow to receive chat input, process it through OpenAI, and return the response to the frontend.

#### a. Navigate to the Backend Project Folder
This guide walks you through creating a basic backend using Node.js and Express.


Create a folder for your backend project and navigate into it:

```bash
mkdir node
cd node
```


1. Initialize the Project and Create the `.env` File

If you haven't already, initialize a Node.js project and create the `.env` file:

```bash
npm init -y
touch .env
```

2. Install Required Dependencies

Run the following command to install the required libraries:

```bash
npm install -s express cors dotenv openai multer 
```

```bash
npm install -D nodemon
```

- `express`: Web framework for Node.js.
- `cors`: Middleware to enable CORS.
- `dotenv`: Loads environment variables from the `.env` file.
- `openai`: Official library to interact with the OpenAI API.
- `multer`: Middleware for handling file uploads in Node.js.
- `nodemon`: Development tool that automatically restarts the server when file changes are detected.



#### c. Configure `package.json`

Open the `package.json` file and update it to include the `start` script and define the project as an ES module:

```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev":"nodemon index.js"
  }
}
```

- **`type: "module"`**: Enables modern ES module syntax (`import` instead of `require`).
- **`start` script**: Allows running the server with `npm start`.

#### d. Add Environment Variables

Open the `.env` file and add your OpenAI API key and server port:

```env
OPENAI_API_KEY=your_api_key_here
PORT=8000
```

- **OPENAI_API_KEY:** Key provided by OpenAI to authenticate requests.
- **PORT:** Port on which the server will run (default is `8000`).


### f. Create the `index.js` File

Inside the root of your backend folder, create a file named `index.js` with the following content:



```javascript
// index.js
//  Import the Express framework
import express from "express";

//  Import the 'config' function from the 'dotenv' package to manage environment variables
import { config } from "dotenv";

// Import the CORS middleware to handle Cross-Origin Resource Sharing
import cors from "cors";

// Load environment variables from a .env file into process.env
config();

// Create an instance of an Express application
const app = express();

// Define the port number from environment variables or default to 8000
const port = process.env.PORT || 8000;

// Use the CORS middleware to allow cross-origin requests
app.use(cors());

// Use built-in middleware to parse incoming JSON requests
app.use(express.json());

//  Define a GET route at the root URL ('/') that sends a success message
app.get("/", (req, res) => {
  res.send("Backend is running successfully.");
});

// Start the server and listen on the specified port, logging a message when it's running
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

### Run the Backend Server

You can now start the backend with the following command:

```bash
npm run dev
```

Visit http://localhost:8000/ in your browser or use a tool like Postman to confirm it returns:

```bash
Backend is running successfully.
```