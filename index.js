<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>PartyCast - Sync & Stream Together</title>
  <script src="/socket.io/socket.io.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; display: flex; flex-direction: column; height: 100vh; }
    
    #login-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.88); display: flex;
      justify-content: center; align-items: center; z-index: 1000;
    }
    .login-box {
      background: #181818; padding: 32px; border-radius: 12px;
      border: 1px solid #ff0000; text-align: center; width: 340px;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
    }
    .login-box h2 { color: #ff0000; margin-bottom: 8px; font-size: 1.8rem; letter-spacing: 1px; }
    .login-box p { color: #aaa; font-size: 0.85rem; margin-bottom: 20px; }
    .login-box input {
      width: 100%; padding: 12px; margin-bottom: 16px; background: #0f0f0f;
      border: 1px solid #383838; color: #fff; border-radius: 6px; outline: none; font-size: 0.95rem;
    }
    .login-box button {
      width: 100%; padding: 12px; background: #cc0000; color: #fff;
      border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s;
    }
    .login-box button:hover { background: #ff0000; }

    header { background: #181818; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #282828; }
    header h1 { color: #ff0000; font-size: 1.5rem; display: flex; align-items: center; gap: 8px; }
    
    .badge { background: #22c55e; color: #000; font-weight: bold; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; }
    .btn-upload { background: #cc0000; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; transition: background 0.2s; }
    .btn-upload:hover { background: #ff0000; }
    input[type="file"] { display: none; }
    
    #main-container { display: flex; flex: 1; padding: 20px; gap: 20px; overflow: hidden; }
    
    #video-box { flex: 3; display: flex; flex-direction: column; gap: 12px; position: relative; }
    .video-wrapper { position: relative; width: 100%; max-height: 480px; background: #000; border-radius: 10px; overflow: hidden; border: 1px solid #282828; }
    video { width: 100%; height: 100%; display: block; outline: none; }

    /* Floating Emoji Animation */
    .floating-emoji {
      position: absolute; bottom: 20px; font-size: 2.5rem;
      pointer-events: none; animation: floatUp 2s ease-out forwards; z-index: 10;
    }
    @keyframes floatUp {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      50% { opacity: 0.8; transform: translateY(-150px) scale(1.3); }
      100% { opacity: 0; transform: translateY(-300px) scale(0.8); }
    }

    #emoji-bar {
      display: flex; gap: 12px; background: #181818; padding: 10px 16px;
      border-radius: 8px; border: 1px solid #282828; align-items: center;
    }
    .emoji-btn {
      background: #272727; border: 1px solid #383838; font-size: 1.4rem;
      padding: 6px 12px; border-radius: 20px; cursor: pointer; transition: transform 0.1s, background 0.2s;
    }
    .emoji-btn:hover { background: #383838; transform: scale(1.2); }

    /* Chat Styling */
    #chat-box { flex: 1; background: #181818; border: 1px solid #282828; border-radius: 10px; display: flex; flex-direction: column; }
    #chat-header { background: #212121; padding: 12px; font-weight: bold; border-bottom: 1px solid #282828; text-align: center; color: #e5e5e5; }
    #messages { flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; }
    .msg { background: #242424; padding: 8px 12px; border-radius: 6px; }
    .msg.system { background: #332100; color: #ffca28; font-style: italic; text-align: center; border: 1px solid #553700; }
    .msg .author { color: #3ea6ff; font-weight: bold; }
    .msg .time { color: #aaaaaa; font-size: 0.7rem; margin-left: 6px; }
    
    #chat-form { display: flex; border-top: 1px solid #282828; }
    #chat-input { flex: 1; padding: 12px; background: #0f0f0f; border: none; color: #fff; outline: none; }
    #send-btn { padding: 12px 20px; background: #cc0000; border: none; color: #fff; font-weight: bold; cursor: pointer; }
    #send-btn:hover { background: #ff0000; }
  </style>
</head>
<body>

  <!-- PartyCast Login Overlay -->
  <div id="login-overlay">
    <div class="login-box">
      <h2>🎉 PartyCast</h2>
      <p>Watch videos together in real-time!</p>
      <input type="text" id="username-input" placeholder="Enter your display name..." required />
      <button onclick="joinParty()">Join Room</button>
    </div>
  </div>

  <header>
    <h1>📡 PartyCast</h1>
    <div style="display:flex; gap:12px; align-items:center;">
      <span id="user-display" style="font-weight: bold; color: #3ea6ff;"></span>
      <span id="user-badge" class="badge">🟢 Live Users: 0</span>
      <label for="video-input" class="btn-upload">▶ Broadcast Video File</label>
      <input type="file" id="video-input" accept="video/*" />
    </div>
  </header>

  <div id="main-container">
    <div id="video-box">
      <div class="video-wrapper" id="video-wrapper">
        <video id="player" controls></video>
      </div>
      
      <!-- Reactions -->
      <div id="emoji-bar">
        <span style="font-size:0.9rem; color:#aaa; font-weight:bold;">Live Reactions:</span>
        <button class="emoji-btn" onclick="sendEmoji('❤️')">❤️</button>
        <button class="emoji-btn" onclick="sendEmoji('😂')">😂</button>
        <button class="emoji-btn" onclick="sendEmoji('🔥')">🔥</button>
        <button class="emoji-btn" onclick="sendEmoji('😮')">😮</button>
        <button class="emoji-btn" onclick="sendEmoji('👏')">👏</button>
        <button class="emoji-btn" onclick="sendEmoji('🎉')">🎉</button>
      </div>

      <h2 id="video-title" style="font-size:1.1rem; color:#e5e5e5;">Waiting for broadcast...</h2>
    </div>

    <div id="chat-box">
      <div id="chat-header">💬 PartyCast Live Chat</div>
      <div id="messages"></div>
      <form id="chat-form">
        <input type="text" id="chat-input" placeholder="Say something..." required autocomplete="off"/>
        <button type="submit" id="send-btn">Send</button>
      </form>
    </div>
  </div>

  <script>
    const socket = io();
    let currentUsername = '';

    const videoInput = document.getElementById('video-input');
    const player = document.getElementById('player');
    const videoTitle = document.getElementById('video-title');
    const userBadge = document.getElementById('user-badge');
    const videoWrapper = document.getElementById('video-wrapper');
    const userDisplay = document.getElementById('user-display');

    let isInternalAction = false;

    function joinParty() {
      const nameInput = document.getElementById('username-input').value.trim();
      if (!nameInput) {
        alert('Please enter your name!');
        return;
      }
      currentUsername = nameInput;
      userDisplay.innerText = `👤 ${currentUsername}`;
      document.getElementById('login-overlay').style.display = 'none';

      socket.emit('userLogin', currentUsername);
    }

    videoInput.onchange = () => {
      const file = videoInput.files[0];
      if (!file) return;

      const blobUrl = URL.createObjectURL(file);
      socket.emit('masterSelectVideo', {
        videoUrl: blobUrl,
        title: file.name
      });
    };

    player.onplay = () => {
      if (isInternalAction) return;
      socket.emit('masterPlay', { currentTime: player.currentTime });
    };

    player.onpause = () => {
      if (isInternalAction) return;
      socket.emit('masterPause', { currentTime: player.currentTime });
    };

    player.onseeking = () => {
      if (isInternalAction) return;
      socket.emit('masterSeek', { currentTime: player.currentTime });
    };

    socket.on('loadGlobalVideo', (data) => {
      if (data.videoUrl) {
        player.src = data.videoUrl;
        videoTitle.innerText = "📺 Now Playing: " + data.title;
        player.play().catch(e => console.log("Autoplay blocked:", e));
      }
    });

    socket.on('syncGlobalState', (data) => {
      if (data.videoUrl) {
        player.src = data.videoUrl;
        player.currentTime = data.currentTime;
        videoTitle.innerText = "📺 Now Playing: " + data.title;
        if (data.isPlaying) player.play();
      }
    });

    socket.on('syncPlay', (data) => {
      isInternalAction = true;
      player.currentTime = data.currentTime;
      player.play().finally(() => isInternalAction = false);
    });

    socket.on('syncPause', (data) => {
      isInternalAction = true;
      player.currentTime = data.currentTime;
      player.pause();
      isInternalAction = false;
    });

    socket.on('syncSeek', (data) => {
      isInternalAction = true;
      player.currentTime = data.currentTime;
      setTimeout(() => isInternalAction = false, 300);
    });

    socket.on('updateUserCount', (count) => {
      userBadge.innerText = `🟢 Live Users: ${count}`;
    });

    function sendEmoji(emoji) {
      socket.emit('sendReaction', { emoji });
    }

    socket.on('receiveReaction', (data) => {
      const el = document.createElement('div');
      el.className = 'floating-emoji';
      el.innerText = data.emoji;
      el.style.left = (Math.floor(Math.random() * 80) + 10) + '%';
      videoWrapper.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    });

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messages = document.getElementById('messages');

    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (msg) {
        socket.emit('sendChatMessage', { message: msg });
        chatInput.value = '';
      }
    };

    socket.on('receiveChatMessage', (data) => {
      const msgDiv = document.createElement('div');
      if (data.username === 'PARTYCAST BOT') {
        msgDiv.className = 'msg system';
        msgDiv.innerHTML = `${data.message}`;
      } else {
        msgDiv.className = 'msg';
        msgDiv.innerHTML = `
          <div>
            <span class="author">${data.username}</span>
            <span class="time">${data.time}</span>
          </div>
          <div style="margin-top:2px;">${data.message}</div>
        `;
      }
      messages.appendChild(msgDiv);
      messages.scrollTop = messages.scrollHeight;
    });
  </script>
</body>
</html>
