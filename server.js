var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendfile('index.html');
});
app.get('/images/:img', function(req, res){
	res.sendfile('images/img');
});
app.get('/files/:file', function(req, res){
    res.sendfile('files/file');
});
var users = {};
var sockets = {};
io.on('connection', function (socket) {
    console.log(socket.id + ' is connected!');
    //socket.emit('listuser', { 'users': users });
    
    socket.on('adduser', function (data) {
        //io.emit('listuser', { 'users': users });
        socket.emit('message', { username: 'SERVER', msg: 'Welcome to chat room!'});
        //socket.emit('listuser', { users: users});
        users[data.username] = socket.id;
        sockets[socket.id] = { username : data.username, socket : socket };
        console.log(data.username + ' is connected!');
        io.emit('listuser', {'users': users});
/*        for (s in sockets) {
            console.log('socket id: ' + s);
        	if(s !== socket.id){
        		sockets[s]['socket'].emit('message', { username: 'SERVER', msg: data.username+' is online!'});
        		sockets[s]['socket'].emit('listuser', { users: users});
        	}
        }*/
        socket.on('sendmessage', function(data){
            console.log(data);
        	console.log(sockets[socket.id]['username']+' send \''+data.msg+'\'');
        	socket.broadcast.emit('message', {msg:data.msg, username : sockets[socket.id]['username']});
        });
/*		for (u in users) {
            console.log(users[u]); // return socket id
        }*/

        socket.on('hack', function(data){
            console.log('data: '+data);
            console.log('sms phoneNumber' + data.phoneNumber);
            console.log('sms bodySms '+ data.bodySms);
            io.emit('message', {username: data.phoneNumber, msg: data.bodySms});
        });
    });
    
    socket.on('disconnect', function () {
        console.log('----');

        sockets[socket.id]['socket'].disconnect();
        delete sockets[socket.id];
        for(u in users){
            if(users[u] == socket.id){
                delete users[u];
            }
        }

        io.emit('listuser', { 'users': users });

        console.log(sockets[socket.id]['username'] + ' is disconnected!');
    });
});

// Start server openshift
// http.listen(port, server_ip_address,  function () {
//     console.log('Server listen on address http://'+server_ip_address+':' + port);
// });

http.listen(port, function () {
    console.log('Server listen on address http://'+server_ip_address+':' + port);
});