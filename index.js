const express = require('express');
const app = express();
const http = require('http').createServer(app);
const createError = require('http-errors');
const io = require('socket.io')(http, {
  cors: {
    origin: "https://lstsim.de",
    methods: ["GET", "POST"]
  }
});

require('dotenv').config();
const os = require("os");
const pjson = require('./package.json');

const yaml = require('js-yaml');
const fs = require('fs');

let notifications_enabled = true;
let game_paused = null;
let lstsim_socket = null;
let lstsim_user = null;
let connected_clients = {};
let calls = {"count_calls": {"T": 0, "J": 0, "K": 0}, "calls": {}};
let total_calls = {"T": 0, "J": 0, "K": 0};
let widgets = undefined;
try {
  widgets = yaml.safeLoad(fs.readFileSync('widgets.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

let Pushover_Notifications = undefined;
if (process.env.PUSHOVER_ENABLED) {
  if (!process.env.PUSHOVER_USER_KEY || !process.env.PUSHOVER_API_TOKEN) {
    console.error("PUSHOVER_USER_KEY und PUSHOVER_API_TOKEN müssen in der Datei .env hinterlegt sein um den Benachrichtiungs-Dienst Pushover verwenden zu können.");
    process.env.PUSHOVER_ENABLED = false;
  } else {
    let pushover = require('pushover-notifications');
    Pushover_Notifications = new pushover( {
      user: process.env.PUSHOVER_USER_KEY,
      token: process.env.PUSHOVER_API_TOKEN
    })
  }
}

function sendNotification(data) {
  if (!notifications_enabled) {
    return;
  }

  io.emit('send-notification', data);
  if (process.env.PUSHOVER_ENABLED) {
    Pushover_Notifications.send(data, function(err, result) {
      if (err) {
        console.error(err);
      }
    });
  }
}

const accentsMap = {'ã': '@514 a','ẽ': '@514 e','ĩ': '@514 i','õ': '@514 o','ũ': '@514 u','Ã': '@514 A','Ẽ': '@514 E','Ĩ': '@514 I','Õ': '@514 O','Ũ': '@514 U','â': 'shift-@514 a','ê': 'shift-@514 e','î': 'shift-@514 i','ô': 'shift-@514 o','û': 'shift-@514 u','Â': 'shift-@514 A','Ê': 'shift-@514 E','Î': 'shift-@514 I','Ô': 'shift-@514 O','Û': 'shift-@514 U','à': 'shift-@192 a','è': 'shift-@192 e','ì': 'shift-@192 i','ò': 'shift-@192 o','ù': 'shift-@192 u','À': 'shift-@192 A','È': 'shift-@192 E','Ì': 'shift-@192 I','Ò': 'shift-@192 O','Ù': 'shift-@192 U','á': '@192 a','é': '@192 e','í': '@192 i','ó': '@192 o','ú': '@192 u','Á': '@192 A','É': '@192 E','Í': '@192 I','Ó': '@192 O','Ú': '@192 U','ç': '@192 c','Ç': '@192 C','ä': 'shift-@54 a','ë': 'shift-@54 e','ï': 'shift-@54 i','ö': 'shift-@54 o','ü': 'shift-@54 u','Ä': 'shift-@54 A','Ë': 'shift-@54 E','Ï': 'shift-@54 I','Ö': 'shift-@54 O','Ü': 'shift-@54 O'};
const ks = require('node-key-sender');
//ks.aggregateKeyboardLayout(accentsMap);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/install', function(req, res){
    res.sendFile(__dirname + '/install_script.html');
});

app.get('/stats', function(req, res){
  res.json({
    "connected_clients": Object.keys(connected_clients).length,
    "notifications_enabled": notifications_enabled,
    "game_paused": game_paused,
    "lstsim_socket": lstsim_socket,
    "lstsim_user": lstsim_user,
    "calls": calls["count_calls"],
    "total_calls": total_calls,
    "version": pjson.version
  });
});
app.get('/connected_clients', function(req, res){
    res.json(connected_clients);
});

app.get('/calls', function(req, res){
  res.json(calls);
});

const configRouter = require('./routes/config');
const Pushover = require('pushover-notifications/lib/pushover');
app.use('/config', configRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  
  if(process.env.env == 'development' || os.hostname() == 'localhost'){
    res.json({"error": true, "message": err.message, "status": err.status || 500, "environment": process.env.env, "stack": err.stack});
  }else{
    res.json({"error": true, "message": err.message, "status": err.status || 500});
  }
});

io.on("connection", (socket) => {
  let clientIp = (socket.request.connection.remoteAddress == "::1") ? "localhost": socket.request.connection.remoteAddress;

  if (socket.handshake.query.username !== undefined) {
    lstsim_user = socket.handshake.query.username;
  }

  switch (socket.handshake.query.application) {
    case "commander":
      io.emit('waiting-calls', calls["count_calls"]);
      break;
    case "lstsim":
      if (lstsim_socket == null) {
        lstsim_socket = socket.id;
        lstsim_user = socket.handshake.query.username;
        io.emit('lstsim-connected');
        calls = {"count_calls": {"T": 0, "J": 0, "K": 0}, "calls": {}};
        io.emit('waiting-calls', calls["count_calls"]);
      } else if (lstsim_socket != null && lstsim_socket != socket.id) {
        io.emit('multiple-lstsim-sockets');
      }
      break;
  }

  connected_clients[socket.id] = {"socketId": socket.id, "application": socket.handshake.query.application, "clientIp": clientIp, "connected": Date.now()};
  io.emit('connected_clients', Object.keys(connected_clients).length);
  console.log('client connected: '+socket.handshake.query.application+ ' ('+clientIp+')');

  socket.on('disconnect', function(){
    if (socket.id == lstsim_socket) {
      io.emit('lstsim-disconnected');
      lstsim_socket = null;
      lstsim_user = null;
      game_paused = null;
      calls = {"count_calls": {"T": 0, "J": 0, "K": 0}, "calls": {}};
      io.emit('waiting-calls', calls["count_calls"]);
    }
    delete connected_clients[socket.id];
    io.emit('connected_clients', Object.keys(connected_clients).length);
    console.log('client disconnected');
  });
  
  socket.on('game-paused', function(paused){
    io.emit('game-paused', paused);
    game_paused = paused;
  });
  
  socket.on('widget-called', function(widgetid){
    console.log('widget-called: ' + widgetid);
    if(widgets[widgetid] == undefined) return;
    let shortcut = ((Array.isArray(widgets[widgetid].shortcut)) ? widgets[widgetid].shortcut : [widgets[widgetid].shortcut]);
    if(process.env.OpenCloseURLbeforeCombination == 'true')
      ks.sendKeys(['f6', 'f6']);
    ks.sendCombination(shortcut);
  });
  
  socket.on('new-call', function(data){
    calls["count_calls"][data.type]++;
    total_calls[data.type]++;

    switch (data.type) {
        case "T":
            type_long = "Anruf";
            break;
        case "J":
            type_long = "Sprechen";
            break;
        case "K":
            type_long = "Kommen";
            break;
    }
    calls["calls"][data.callid] = {
      "callid": data.callid,
      "type": data.type,
      "type_long": type_long,
      "wait_seconds": 0,
      "notification_sent": false,
      "connected": Date.now()
    };
    io.emit('waiting-calls', calls["count_calls"]);
  
    console.log('new-call: ',  data);
  });
  
  socket.on('closed-call', function(data){
    console.log('closed-call: ',  data);
    if(calls["calls"][data.callid] == undefined){
      io.emit('waiting-calls', calls["count_calls"]);
      return;
    }

    call = calls["calls"][data.callid];
    calls["count_calls"][call.type]--;
    delete calls["calls"][data.callid];
    io.emit('waiting-calls', calls["count_calls"]);
  });
  
  socket.on('reset-calls', function(data){
    console.log('reset-calls');

    calls = {"count_calls": {"T": 0, "J": 0, "K": 0}, "calls": {}};
    io.emit('waiting-calls', calls["count_calls"]);
  });
  
  socket.on('toggle-notifications', function(data){
    console.log('toggle-notifications');
    notifications_enabled = !notifications_enabled;

    io.emit('notifications', notifications_enabled);
  });
  
  socket.on('send-notification', function(data){
    console.log('send-notification', data);

    if (process.env.PUSHOVER_ENABLED) {
      Pushover_Notifications.send(data, function(err, result) {
        if (err) {
          console.error(err);
        }
      });
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

const SEND_NOTIFCIATION_AFTER_SECONDS = (process.env.SEND_NOTIFCIATION_AFTER_SECONDS) ? SEND_NOTIFCIATION_AFTER_SECONDS : 15;
setInterval(function(){


  if (!game_paused) {
    Object.entries(calls["calls"]).forEach(([id, call]) => {
      if (call["wait_seconds"] >= SEND_NOTIFCIATION_AFTER_SECONDS) {
        if (!call.notification_sent) {
          sendNotification({title: call.type_long+" wartet!", message: "Information für "+lstsim_user, call_type: call.type});
          calls["calls"][id]["notification_sent"] = true;
        }
      }
      calls["calls"][id]["wait_seconds"]++;
    });
  }
}, 1000);