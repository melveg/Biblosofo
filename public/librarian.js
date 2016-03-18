var socket;
var messages=[];
window.onload=function(){
 var messages=[];
 $("div#content").html('<div id="login"><label>Nickname:</label><input type="text" id="nickname" value=""/><br/><label>Password:</label><input type="password" id="pwd" value=""><br/><hr/><input type="button" id="btnlog" value="Autenticar"/></div>');
 //Verificar Con Ajax si es un usuario Valido
 //Crear Instancia del socket y tratar de conectarse
 //socket = io.connect('http://192.168.1.137:8080');   
 socket = io.connect('http://localhost:8080');
 socket.on("librarian.create.interface",function(data){
  //Crear La interface
  $("div#content").html('<div id="control-panel"><div id="control-left"><h3>Bibliotecologos</h3><div id="control-librarian"></div><h3>Usuarios</h3><div id="control-clients"></div></div><div id="control-right"></div></div><div id="identifier">Conectado como: '+data.nickname+'</div>'); 
  //Definir Los eventos
 });
 socket.on("client.create.interface",function(data){
  $("div#content").html('<div id="control-panel"></div><div id="identifier">Conectado como: '+data.nickname+'</div>');
 });
 socket.on("librarian.update.list",function(data){
  $("div#control-librarian").html("");
  for(l=0;l<data.librarians.length;l++){
   $("div#control-librarian").append("<span>"+data.librarians[l]["nickname"]+"<span><br/>");
  }
 });
 socket.on("librarian.update.client.list",function(data){
  $("div#control-clients").html("");
  for(l=0;l<data.clients.length;l++){
   $("div#control-clients").append("<span>"+data.clients[l]["nickname"]+"<span><br/>");
  }
 });
 socket.on("service.down",function(data){
  $("div#content").html('<div id="control-panel"><div id="info-message"><h3>Mensaje de Servidor</h3><p>Lo sentimos en este momento el servicio esta inactivo, Posibles razones:<br/><ul><li>Consulta Fuera de Horarios de Oficina</li><li>No hay Bibliotecarios conectados</li><li>El servidor tiene un problema</li></ul><br/>Por favor intente mas tarde o haga clic en la siguiente opcion para hacernos llegar su consulta: <a href="#">Haz click aqui</a></p></div></div>');
 });
 socket.on('message',function(data){
  if(!(messages[data.room]!=null) && !(messages[data.room]!=undefined))
   messages[data.room]=[];
  if(data.message){
   messages[data.room].push(data.message);
   var html='';
   for(var i=0;i<messages[data.room].length;i++){
    html+=messages[data.room][i]+'<br/>';
   }
   if(!(document.getElementById("window-"+data.room)!=null) && !(document.getElementById("window-"+data.room)!=undefined)){
    //$("div#window-container").append('<div class="window" id="window-'+data.room+'" style="float:left;width:200px;height:300px;"><div class="close" style="float:left;width:200px;height:auto;"><a onclick="closew(\''+data.room+'\');">X '+data.room.replace("_"+socket.nickname,"").replace(socket.nickname+"_","")+'</a></div><div class="message" id="message-'+data.room+'" style="float:left;width:200px;height:300px;overflow:auto;"></div><div class="controls" id="controls-'+data.room+'" style="float:left;width:200px;height:auto;"><input type="text" name="msg-'+data.room+'" id="msg-'+data.room+'"/><input type="button" id="send-'+data.room+'" name="send-'+data.room+'" value="Send Message" onclick="send(\''+data.room+'\');"/></div></div>');
    $("div#window-container").append('<div class="window" id="window-'+data.room+'" style="float:left;width:200px;height:300px;"><div class="close" style="float:left;width:200px;height:auto;"><a onclick="closew(\''+data.room+'\');">X '+data.room.replace("_"+socket.nickname,"").replace(socket.nickname+"_","")+'</a></div><div class="message" id="message-'+data.room+'" style="float:left;width:200px;height:300px;overflow:auto;"></div><div class="controls" id="controls-'+data.room+'" style="float:left;width:200px;height:auto;"><textarea name="msg-'+data.room+'" id="msg-'+data.room+'" room="'+data.room+'"></textarea></div></div>');
    $("textarea#msg-"+data.room+"").on("keydown",function(event){
     var code = (event.keyCode ? event.keyCode : event.which);
     if ( code == 13 ) {
       event.preventDefault();
       var msg=$(this).val();
       socket.emit("send",{room:$(this).attr("room"),message:socket.nickname+" : "+msg});
       //$("input#msg-"+roomname).val("");
       $(this).val("");
     }
    });
   }
   $("div#message-"+data.room).html(html);
  }else{
   console.log("There is a problem: ",data);
  }
 });
 send=function(roomname){
  //var msg=$("input#msg-"+roomname).val();
  var msg=$("textarea#msg-"+roomname).text();
  socket.emit("send",{room:roomname,message:socket.nickname+" : "+msg});
  //$("input#msg-"+roomname).val("");
  $("textarea#msg-"+roomname).text("");
 };
 closew=function(roomname){
  document.getElementById("window-container").removeChild(document.getElementById("window-"+roomname));
 };
 $("input#btnlog").click(function(){
  if($("input#nickname").val()!="" && $("input#pwd").val()!=""){
   socket.nickname=$("input#nickname").val();
   socket.emit("register",{nickname:$("input#nickname").val()});
  }else{
   alert("Usuario O Password son requeridos");
  }
 });
};
window.onbeforeunload=function(){
 //return confirm("Realmente desea Cerrar?");
 socket.emit("user.down",{}); 
 //return confirm;
};
window.onunload=function(){
 //return confirm("Realmente desea Cerrar?");
 //if left the session do this operations
 //io.sockets.in(socket.room).emit("leave");
 //socket.leave(socket.room);
 //console.log("Has Abandonado la sesion");
};
