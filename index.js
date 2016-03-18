express=require("express");
app=express();
app.set("views",__dirname+'/template');
app.set("view engine","jade");
app.engine("jade",require("jade").__express);
app.get("/",function(request,response){
 //response.send("Express Works");
 response.render("index");
});
app.use(express.static(__dirname+'/public'));
//Using express for listen
//app.listen(8080);
//Using Socket.io for listen express
var io = require("socket.io").listen(app.listen(8080))
io.sockets.on('connection',function(socket){
 socket.emit('message',{message:'wellcome to the chat'});
 socket.on('send',function(data){
  io.sockets.emit('message',data);
 });
});
