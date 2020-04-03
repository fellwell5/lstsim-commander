const express = require('express');
const app = express();
const http = require('http').createServer(app);
const createError = require('http-errors');
const io = require('socket.io')(http);

require('dotenv').config();
const os = require("os");
const pjson = require('./package.json');

const yaml = require('js-yaml');
const fs = require('fs');
let widgets = undefined;
try {
  widgets = yaml.safeLoad(fs.readFileSync('widgets.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

const accentsMap = {'ã': '@514 a','ẽ': '@514 e','ĩ': '@514 i','õ': '@514 o','ũ': '@514 u','Ã': '@514 A','Ẽ': '@514 E','Ĩ': '@514 I','Õ': '@514 O','Ũ': '@514 U','â': 'shift-@514 a','ê': 'shift-@514 e','î': 'shift-@514 i','ô': 'shift-@514 o','û': 'shift-@514 u','Â': 'shift-@514 A','Ê': 'shift-@514 E','Î': 'shift-@514 I','Ô': 'shift-@514 O','Û': 'shift-@514 U','à': 'shift-@192 a','è': 'shift-@192 e','ì': 'shift-@192 i','ò': 'shift-@192 o','ù': 'shift-@192 u','À': 'shift-@192 A','È': 'shift-@192 E','Ì': 'shift-@192 I','Ò': 'shift-@192 O','Ù': 'shift-@192 U','á': '@192 a','é': '@192 e','í': '@192 i','ó': '@192 o','ú': '@192 u','Á': '@192 A','É': '@192 E','Í': '@192 I','Ó': '@192 O','Ú': '@192 U','ç': '@192 c','Ç': '@192 C','ä': 'shift-@54 a','ë': 'shift-@54 e','ï': 'shift-@54 i','ö': 'shift-@54 o','ü': 'shift-@54 u','Ä': 'shift-@54 A','Ë': 'shift-@54 E','Ï': 'shift-@54 I','Ö': 'shift-@54 O','Ü': 'shift-@54 O'};
const ks = require('node-key-sender');
//ks.aggregateKeyboardLayout(accentsMap);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/msg', function(req, res){
    res.sendFile(__dirname + '/msg_test.html');
});

let connected_users = {};

app.get('/stats', function(req, res){
  res.json({"connected_users": Object.keys(connected_users).length, "version": pjson.version});
});
app.get('/connected_users', function(req, res){
    res.json(connected_users);
});

const configRouter = require('./routes/config');
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

let client_reload = true;
setInterval(function(){client_reload = false;}, 1000);

io.on('connection', function(socket){
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;
    if(clientIp == "::1") clientIp = "localhost";

    connected_users[socketId] = {"socketId": socketId, "clientIp": clientIp, "connected": Date.now()};
    io.emit('connected_users', Object.keys(connected_users).length);
    console.log('a user connected');

    socket.on('disconnect', function(){
      delete connected_users[socketId];
      io.emit('connected_users', Object.keys(connected_users).length);
      console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      ks.sendText(msg);
    });

    socket.on('widget-called', function(widgetid){
      console.log('widget-called: ' + widgetid);
      if(widgets[widgetid] == undefined) return;
      let shortcut = ((Array.isArray(widgets[widgetid].shortcut)) ? widgets[widgetid].shortcut : [widgets[widgetid].shortcut]);
      if(process.env.OpenCloseURLbeforeCombination == 'true')
        ks.sendKeys(['f6', 'f6']);
      ks.sendCombination(shortcut);
    });

    if(client_reload){
      io.emit('client_reload', true);
    }

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});