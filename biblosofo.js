var librarian=[{"user":"melveg"},{"user":"vega"},{"user":"mvega"},{"user":"jordy"}];
var connuser={};
var pubconnuser={};
var req=null;
var error="";
express=require("express");
var mongo = require("./mongo");
/*for(var l=0;l<librarians.length;l++)
 console.log(librarians[l]["user"]+"\n");
console.log(Math.floor((Math.random()*librarians.length)+1));*/
app=express();
app.set("views",__dirname+'/template');
app.set("view engine","jade");
app.engine("jade",require("jade").__express);
/*app.get("/:id",function(request,response){
  console.log(request.params.id);
*/
app.use(express.cookieParser());
app.use(express.session({secret: 'V3N40007N3B4007',cookie: {maxAge: 900000}}));
//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
parseCookie = require('connect').utils.parseCookie;
//app.use(express.cookieSession({secret: 'V3N40007N3B4007'}));
//app.use(express.session({secret: 'V3N40007N3B4007'}));
app.get("/",function(request,response){
 if(request.session.active==null)
  request.session.active=false;
 if(request.session.active)
  response.render("biblosofo",{username:request.session.username});
 else
  response.render("login",{active:request.session.active,error:error});
});
app.post("/",function(request,response){
 //req=request;
 //Si no existe la session inicializarla a false
 if(request.session.active==null)
  request.session.active=false;
 //Si la session esta activa cargar el chat, sino autenticar usuario
 if(request.session.active)
  response.render("biblosofo",{username:request.session.username});
 else{
  //Si vienen datos evaluar si son correctos - sino error e imprimir form
  if(request.param('username')!=null && request.param('pwd')!=null){
   mongo.connect('127.0.0.1',27017);
   db = mongo.open("mydb");
   db.open(function(err,db){
    db.collection("persona",function(err,collection){
     collection.find({username:request.param('username'),password:request.param('pwd')}).toArray(function(err,persona){
      if(persona.length==1){
       request.session.active=true;
       request.session.username=request.param('username');
       /*response.writeHead(301, {
	 	"location" : "/"
       });*/
       db.close();
       response.render("biblosofo",{username:request.session.username});
      }else{
       error="Error, sus datos de acceso son incorrectos";
       db.close();
       response.render("login",{active:request.session.active,error:error});
      }
     });
    });
   });
  }
  //response.render("login",{active:request.session.active,error:""});
 }
});
app.use(express.static(__dirname+'/public'));
var get=function(what,where){
 switch(what){
   case "sock2array":
    var arr=[];
    where.forEach(function(sock){
     arr.push({nickname:sock.nickname});
    }); 
    return arr;
   break;
 }
};
var io = require("socket.io").listen(app.listen(8080));
io.sockets.on('connection',function(socket){
 socket.on("register",function(data){
  //Al conectarse verificar que es librarian o cliente 
  var lib=false;
  for(var l=0;l<librarian.length;l++){
   if(librarian[l]["user"]==data.nickname){
    lib=true;
    break;
   }
  }
  /*Verificar si esta conectado previamente
  //previamente se debio haber asignado un socket.nickname 
  var byroom=io.sockets.clients('client|librarian');
  byroom.forEarch(function(user){
   //do something
  });
  */
  //Si es librarian, Agregar a sala de conectados librarians y a connected users
  if(lib){
   socket.utype="librarian";
   connuser[data.nickname]=socket;
   socket.join("librarian");
   socket.nickname=data.nickname;
   socket.emit("librarian.create.interface",{nickname:data.nickname});
   //io.sockets.emit -- todos los sockets
   io.sockets.in("librarian").emit("librarian.update.list",{librarians:get("sock2array",io.sockets.clients("librarian"))});
  }else{
   /*Si es un cliente, registrar a la sala de clientes conectados actualizar la vista de librarians
     para que puedan ver los clientes conectados en esa sala especifica, abrir una ventana de session con un librarian al azar para hacer consultas*/
   socket.utype="client";
   pubconnuser[data.nickname]=socket;
   socket.join("client"); 
   socket.nickname=data.nickname;
   //Abrir Ventana de chat con un Librarian aleatorio, si no hay librarians conectados
   //Usar link de redireccion a formulario de contactenos
   var libsock=[];
    io.sockets.clients("librarian").forEach(function(sock){
     libsock.push(sock);
    });
   if(libsock.length>0){
    //El llamado de registro de cliente solo actualizara la informacion en perfil librarian
    io.sockets.in("librarian").emit("librarian.update.client.list",{clients:get("sock2array",io.sockets.clients("client"))});
    io.sockets.in("client").emit("client.create.interface",{nickname:data.nickname});
    //Seleccionar Bibliotecologo al hazar
    var sel=Math.floor((Math.random()*libsock.length)+1);
    var room=(libsock[sel-1].nickname>data.nickname)?libsock[sel-1].nickname+"_"+data.nickname:data.nickname+"_"+libsock[sel-1].nickname; 
    socket.join(room);
    connuser[libsock[sel-1].nickname].join(room);
    pubconnuser[data.nickname].join(room);
    //Crear GUI, Una Ventana Flotante
    io.sockets.in(room).emit("message",{room:room,message:"Bienvenido a Fundacion Enrique Bolanos"});
   }else{
    socket.emit("service.down",{});
   }
  }
 });
 socket.on('user.down',function(data){
   var rooms = io.sockets.manager.roomClients[socket.id];
   for(var room in rooms){
    if(room && rooms[room]){
      socket.leave(room.replace('/',''));
    }
   }
   if(socket.utype=="librarian")
    io.sockets.in("librarian").emit("librarian.update.list",{librarians:get("sock2array",io.sockets.clients("librarian"))});
   else
    io.sockets.in("librarian").emit("librarian.update.client.list",{}); 
 });
 socket.on('send',function(data){
  io.sockets.in(data.room).emit('message',data);
 });
});
