

const express = require("express");
const EventEmitter = require("events").EventEmitter;

const EVENT_NAME = "RemoteEvent"; // Changed event name
const REQUEST_TIMEOUT = 30000;

const app = express();
const eventEmitter = new EventEmitter();

app.use(express.json());

// Custom CORS headers middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST"); // Allow specific methods
  res.header("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers
  next();
});


app.post("/executeRequest", (req, res) => {
  const { username, code } = req.body; // Get username and code from the request body
  if (!username || !code) {
    console.log("Bad request: Missing username or code."); // Log error
    return res.sendStatus(400); // Bad request if either is missing
  }

  // Log the incoming request
  console.log(`Received request from ${username}: ${code}`);

  eventEmitter.emit(EVENT_NAME, { username, code }); // Emit the event with both arguments
  res.sendStatus(200);
});

app.get("/fetchExecuteRequests", (req, res) => {
  let timeout;

  const listener = (data) => {
    clearTimeout(timeout);
    res.json({
      username: data.username,
      code: data.code,
    });
  };

  eventEmitter.once(EVENT_NAME, listener);

  timeout = setTimeout(() => {
    eventEmitter.removeListener(EVENT_NAME, listener);
    res.sendStatus(500); // Internal Server Error
  }, REQUEST_TIMEOUT);
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not set
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
