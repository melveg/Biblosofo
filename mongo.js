var parent = this;
this.mongodb = require('mongodb');
this.server=null;
this.db=null;
this.connect=function(host,port){
 parent.server=new parent.mongodb.Server(host,port,{safe:true,auto_reconnect: true, slaveOk: true});
}
this.open=function(db){
 parent.db=new parent.mongodb.Db(db,parent.server,{safe:true,slaveOk: true});
 /*parent.db.open(function(err,db){
 });*/
 return parent.db;
 //parent.db.setSlaveOk();
}
this.collection=function(col){
 return parent.db.collection(col); 
}
this.close=function(){
 parent.db.close();
}
