/**
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path')
  
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , nicknames = [];




server.listen(8000);

io.sockets.on('connection', function (socket) {
  socket.on('nickname', function (data, fn) {
    if (nicknames.indexOf(data) != -1) { 
      fn(true);
    } else {
      fn(false);
      nicknames.push(data);
      socket.nickname = data;
      io.sockets.emit('nicknames', nicknames);
    }
  });
  socket.on('user message', function (data) {
    io.sockets.emit('user message', { 
      nick: socket.nickname, 
      message: data 
    });
  });
  socket.on('disconnect', function () {
    if (!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
  });
});



// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', function  (req, res) {
//   res.sendfile(__dirname + '/public/index.html');
// });
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
