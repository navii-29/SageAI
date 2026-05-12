# HellO This is Sage AI

A powerful multimodal AI backend built with Flask that provides AI chat, image generation, code reasoning, website summarization, speech-to-text, and authentication/token management features. The frontend for this project is built using React. 

---

## Features

### 💬 AI Chat System

* Conversational AI chatbot with streaming responses
* Maintains conversation history for contextual replies
* Powered by advanced LLM models
* Token-based usage management

### 🖼️ AI Image Generation

* Generate high-quality AI images from text prompts
* Uses state-of-the-art diffusion models
* Returns generated images in base64 format for seamless frontend rendering

### 🧠 Code & Reasoning Assistant

* AI-powered coding and reasoning endpoint
* Generates raw code responses
* Useful for debugging, coding help, and technical explanations

### 📄 Website Summarization

* Summarizes website content from URLs
* Extracts key information automatically
* Helpful for quick content understanding

### 🎤 Speech-to-Text & Audio Features

* Convert audio input into text
* Audio processing support
* Voice interaction capabilities

### 🔐 Authentication System

* User registration and sign-in system
* Secure password hashing with bcrypt
* MongoDB-based user management

### 🎟️ Token Management

* Token-based API usage system
* Track remaining tokens per user
* Refill functionality for token reset

### ⚡ Streaming Responses

* Real-time streamed AI responses
* Faster and smoother user experience

---

## Tech Stack

### Backend

* Flask
* Flask-RESTful
* MongoDB
* OpenAI SDK
* NVIDIA AI APIs
* Diffusers
* PyTorch
* bcrypt

### Frontend

* React

---

## Project Structure

```bash
backend/
│
├── main.py
├── helper_function.py
├── Checker.py
├── prompts.py
├── requirements.txt
└── ...
```

---

## Main API Functionalities

| Endpoint Feature | Description                        |
| ---------------- | ---------------------------------- |
| Chat AI          | Conversational chatbot with memory |
| Image Generation | Generate AI images from prompts    |
| Website Summary  | Summarize web content              |
| Speech-to-Text   | Convert audio into text            |
| Authentication   | Register & login users             |
| Token System     | Usage tracking and refill          |
| Code Assistant   | AI coding and reasoning support    |

---

## Security Features

* Password hashing using bcrypt
* Environment variable support using `.env`
* MongoDB user authentication
* Token-based request limiting

---

## Frontend

The frontend is built using React and communicates with the Flask backend for all AI functionalities.

---

## Future Improvements

* JWT authentication
* Persistent chat history
* Better token billing system
* Image upload & analysis
* Voice assistant integration
* Docker deployment
* WebSocket streaming

---

## Author

Built with ❤️ using Flask, React, and modern AI APIs.
