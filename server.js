const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('✅ Yeni client bağlandı');

  ws.on('message', (message) => {
    console.log('📩 Gelen mesaj:', message.toString());
    // Echo - gelen mesajı geri gönder
    ws.send('Server cevabı: ' + message);
  });

  ws.on('close', () => {
    console.log('❌ Client ayrıldı');
  });
});

// Sağlık kontrol endpoint'leri (Render ve uptime için)
app.get('/', (req, res) => {
  res.send('WebSocket Server Çalışıyor! 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server ${PORT} portunda çalışıyor...`);
});
