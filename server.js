const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { WebSocket } = require('ws');

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const ETH_RPC = 'wss://ethereum.publicnode.com';   // veya Alchemy/Infura
const BASE_RPC = 'wss://base.publicnode.com';

wss.on('connection', (client) => {
  console.log('✅ Trading bot client bağlandı');

  // Backend bağlantıları
  const ethWs = new WebSocket(ETH_RPC);
  const baseWs = new WebSocket(BASE_RPC);

  // Client'tan gelen JSON-RPC isteklerini backend'e ilet
  client.on('message', (data) => {
    const message = data.toString();
    console.log('→ Bot isteği:', message);

    if (ethWs.readyState === WebSocket.OPEN) ethWs.send(message);
    if (baseWs.readyState === WebSocket.OPEN) baseWs.send(message);
  });

  // Backend'den gelen cevapları client'a ilet
  ethWs.on('message', (data) => client.send(data));
  baseWs.on('message', (data) => client.send(data));

  // Reconnect logic (trading botu için kritik)
  function setupReconnect(ws, url, name) {
    ws.on('close', () => {
      console.log(`${name} bağlantısı koptu, yeniden bağlanılıyor...`);
      setTimeout(() => {
        const newWs = new WebSocket(url);
        // ... yeni ws'yi eski yerine ata (basit hali)
      }, 3000);
    });
  }

  setupReconnect(ethWs, ETH_RPC, 'Ethereum');
  setupReconnect(baseWs, BASE_RPC, 'Base');

  client.on('close', () => {
    ethWs.close();
    baseWs.close();
    console.log('❌ Trading bot client ayrıldı');
  });
});

// Health check
app.get('/', (req, res) => res.send('Trading Bot WSS Proxy Çalışıyor 🚀'));
app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Trading Proxy Server ${PORT} portunda aktif`);
});
