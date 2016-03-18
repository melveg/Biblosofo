window.onload=function(){
 //var nicknames=[];
 var messages=[];
 var nickname=prompt("Nickname:");
 if(nickname==""){
  alert("Nombre Vacio volver a intentar");
  return 0;
 }
 //var socket = io.connect('http://localhost:8080');
 var socket = io.connect('http://192.168.1.137:8080');
 var field = document.getElementById("field");
 var sendButton = document.getElementById("send");
 var content = document.getElementById("content");
 socket.emit("register",{nickname:nickname}); 
 socket.on("register",function(data){
  if(data.nicknames){
   //var nicknames=data.nicknames;
   //nicknames.push(data.nickname);
   var html='';
   for(var n=0;n<data.nicknames.length;n++){
    if(data.nicknames[n]!=nickname){
     var room=(data.nicknames[n]>nickname)?data.nicknames[n]+"_"+nickname:nickname+"_"+data.nicknames[n];
     html+='<a href="#" onclick="privateroom(\''+room+'\',\''+data.nicknames[n]+'\',\''+nickname+'\');">Chat With '+data.nicknames[n]+'</a><br/>';
    }
   }
   //content.innerHTML=html;
   document.getElementById("content").innerHTML=html;
  }
 });
 privateroom=function(name,userone,usertwo){
  //socket.on("createroom",); 
  messages[name]=[];
  socket.emit("createroom",{room:name,nickone:userone,nicktwo:usertwo});
  if(!(document.getElementById("window-"+name)!=null) && !(document.getElementById("window-"+name)!=undefined)){
    /*document.body.innerHTML*/document.getElementById("window-container").innerHTML+='<div class="window" id="window-'+name+'" style="float:left;width:200px;height:300px;"><div class="close" style="float:left;width:200px;height:auto;"><a onclick="closew(\''+name+'\');">X '+name.replace("_"+nickname,"").replace(nickname+"_","")+'</a></div><div class="message" id="message-'+name+'" style="float:left;width:200px;height:300px;overflow:auto;"></div><div class="controls" id="controls-'+name+'" style="float:left;width:200px;height:auto;"><input type="text" id="msg-'+name+'"/><input type="button" id="send-'+name+'" value="Send Message" onclick="send(\''+name+'\');"/></div></div>';
  }
 };
 send=function(roomname){
  //var msg=document.getElementsByTagName("input")[0].value;
  var msg=document.getElementById("msg-"+roomname).value;
  socket.emit("send",{room:roomname,message:nickname+" : "+msg});
  document.getElementById("msg-"+roomname).value="";
  //document.getElementsByTagName("input")[0].value="";
 };
 closew=function(roomname){
  /*document.body.*/document.getElementById("window-container").removeChild(document.getElementById("window-"+roomname)); 
 };
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
    /*document.body.innerHTML*/document.getElementById("window-container").innerHTML+='<div class="window" id="window-'+data.room+'" style="float:left;width:200px;height:300px;"><div class="close" style="float:left;width:200px;height:auto;"><a onclick="closew(\''+data.room+'\');">X '+data.room.replace("_"+nickname,"").replace(nickname+"_","")+'</a></div><div class="message" id="message-'+data.room+'" style="float:left;width:200px;height:300px;overflow:auto;"></div><div class="controls" id="controls-'+data.room+'" style="float:left;width:200px;height:auto;"><input type="text" name="msg-'+data.room+'" id="msg-'+data.room+'"/><input type="button" id="send-'+data.room+'" name="send-'+data.room+'" value="Send Message" onclick="send(\''+data.room+'\');"/></div></div>';
   }
   document.getElementById("message-"+data.room).innerHTML=html;
  }else{
   console.log("There is a problem: ",data);
  }
 }); 
 /*socket.on('message',function(data){
  if(data.message){
   messages.push(data.message);
   var html='';
   for(var i=0;i<messages.length;i++){
    html+=messages[i]+'<br/>';
   }
   content.innerHTML=html;
  }else{
   console.log("There is a problem: ",data);
  }
 });
 sendButton.onclick=function(){
  var text=field.value;
  socket.emit('send',{message:text});
 };*/
};
