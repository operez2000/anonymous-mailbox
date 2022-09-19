var express = require("express");
var app = express();
var axios = require("axios")
//var http = require('http').createServer(app);

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });


wss.on('connection', (ws, req) => {
    let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    console.log('req.connection.remoteAddress', req.connection.remoteAddress, 'ip', ip)
    ws.onmessage = function( evt ) {
        let msg = evt.data
        console.log(`Msg recibido: ${msg}`);
        broadcast(msg);
    }
/*
    ws.on('message', (msg) => {
        console.log(`Msg recibido: ${msg}`);
        //console.log('ws._socket.remoteAddress', ws._socket.remoteAddress);
        //ws.send(`Regresando Msg: ${msg}`);
        broadcast(msg);
    });
*/    
    ws.onerror = function (evt) {
        console.log('ws.onerror', evt)
    };
    ws.send('Iniciando...');
});


const mdi = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', true)

  console.log('-------------------------------------------------------');
  console.log(new Date().toLocaleString('es-MX', {timeZone: "America/Tijuana"}));
  console.log('req.query', req.query);
  console.log('req.body', req.body);
  console.log('req.params', req.params);
  next();
};


function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

app.get("/", mdi, (req, res) => {
    console.log('Excelente !!');
    res.send("hello mundo...");
});


app.get("/notificaciones", mdi, (req, res) => {
  let json = {}
  axios({
    url: `http://icertus.com.mx:8686/buzon/server/notificaciones.php?opcion=${req.query.opcion}`,
    method: 'get'
  }).then(resp => {
    json = resp.data
  }).catch(err => {
    json = err
  }).finally(() => {
    res.json(json)
  })
})

/*
io.on('connection', function(socket) {
    console.log('usuario conectado');
});
*/

module.exports = {
    path: "/api/",
    handler: app
};