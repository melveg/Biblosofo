var client={};
var nickname=[];
express=require("express");
app=express();
app.set("views",__dirname+'/template');
app.set("view engine","jade");
app.engine("jade",require("jade").__express);
app.get("/",function(request,response){
 //response.send("Express Works");
 response.render("register");
});
app.get("/chat",function(request,response){
 //response.send("Express Works");
 response.render("singlechat");
});
app.use(express.static(__dirname+'/public'));
//Using express for listen
//app.listen(8080);
//Using Socket.io for listen express
var io = require("socket.io").listen(app.listen(8080))
io.sockets.on('connection',function(socket){
 socket.on("register",function(data){
  client[data.nickname]=socket;
  nickname.push(data.nickname);
  io.sockets.emit("register",{nicknames:nickname});
 });
 socket.on("createroom",function(data){
  socket.join(data.room);
  client[data.nickone].join(data.room);
  client[data.nicktwo].join(data.room);
  io.sockets.in(data.room).emit("message",{room:data.room,message:"Connected in room: "+data.room});
 });
 socket.on('send',function(data){
  io.sockets.in(data.room).emit('message',data);
 });
});
