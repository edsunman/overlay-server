const express = require('express');
const app = express();
const http = require('http');
var uap = require('ua-parser-js');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {

    if(socket.handshake.query.event_id) {

        socket.join(socket.handshake.query.event_id);

        socket.on('disconnect', () => {
            
        });
    }

});

app.post('/message', express.json(), (req, res) => {

    if (req.body.event_id) {
        io.to(req.body.event_id).emit('some event', req.body);
    }

    res.json('');
    
});


app.get('/', async (req, res) => {

    const sockets = await io.fetchSockets();
    

    let html = '<div style="font-family: monospace"><h1>Websocket</h1>'

    for (const socket of sockets) {

        const { browser, device, os } = uap(socket.handshake.headers["user-agent"]);

        html += '<h2>' + Array.from(socket.rooms).join(' -- ') + '</h2>';
        
        html += '<p>' + socket.handshake.time + '<p>';

        html += '<p>' + JSON.stringify(browser)  + ' - ' + JSON.stringify(os) + ' - ' + JSON.stringify(device) + '</p>';
        
    }

    html += '</div>';

    res.send(html);

    
   
});

app.get('/disconnect-all', (req, res) => {

    let html = '<h1>Disconnect</h1>'

    io.disconnectSockets();

    res.send(html);
});

server.listen(3000, () => {

  console.log('listening on *:3000');
  
});


