# Multi-Web Video Sync & Live Chat Application 🌐🎥

A powerful, real-time co-watching platform that allows users to upload videos, stream them simultaneously across multiple web clients in perfect synchronization, and communicate through an integrated live chat system.

---

## 🚀 Features

- **Synchronized Video Playback:** Play, pause, and seek actions are instantly mirrored across all connected browsers.
- **Real-Time Live Chat:** An interactive instant messaging system that runs seamlessly alongside the video player.
- **Robust Media Uploads:** Handled via a secure multipart form-data parser designed to process high-capacity video files smoothly.
- **Modular Architecture:** Clean segregation of frontend views (`public/`), backend routing, and socket event managers.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Real-Time Connectivity:** Socket.io
- **File Upload Middleware:** Multer
- **Development Utilities:** Nodemon (for automated hot-reloading)

---

## 📁 Project Structure

```text
youtube/
├── node_modules/         # Project dependencies (ignored by Git)
├── public/               # Static assets served to the client
│   ├── uploads/          # Directory where uploaded videos are stored
│   └── index.html        # Main frontend UI (Video Player & Chat Box)
├── package.json          # Project metadata and dependencies script
├── package-lock.json     # Lockfile for explicit dependency tracking
└── server.js             # Main entry point of the Node.js application
```

---

## ⚙️ Installation & Setup

Follow these simple steps to get the project running locally on your machine.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) installed on your computer.

### 2. Clone the Repository
```bash
git clone https://github.com
cd your-repo-name
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure .gitignore
To keep your repository clean, ensure you create a `.gitignore` file in your root folder and add the following lines:
```text
node_modules/
public/uploads/*
!.gitkeep
```

### 5. Run the Application
Start the development server with **Nodemon** for automatic hot-reloading:
```bash
npm start
```
*(Note: If `npm start` isn't configured in your scripts yet, run `npm run dev` or simply `node server.js`)*

The server will spin up. Open your browser and navigate to:
```text
http://localhost:3000
```
*Tip: Open this link in multiple browser tabs or different browsers to test the real-time sync and live chat functions!*

---

## 💡 How It Works (Under the Hood)

1. **Upload Phase:** When a user uploads a video file, `Multer` processes the multi-part data, sanitizes the payload, and saves the file directly into the `public/uploads/` directory.
2. **Synchronization Phase:** The system uses `Socket.io` rooms. When any user interacts with the HTML5 video controls (Play/Pause), a payload containing the current timestamp event is fired to the server, which broadcasts it instantly to all other connected web clients.
3. **Communication Phase:** Message events generated in the chat UI are intercepted by the WebSockets server and emitted to all active sessions in real-time.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
