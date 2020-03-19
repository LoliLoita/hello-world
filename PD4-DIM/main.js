// Creator Switchers
// Bill Tan
var g_comm;
var connectionType=parseInt(Config.Get("connectionType"), 10);
var g_debug = Config.Get("DebugTrace") == "true";
//var g_synchronous = Config.Get("SynchronousTrace") == "true";
if(connectionType==0)
{
	 g_comm = new Serial(OnCommRx, parseInt(Config.Get("comPort"), 10), parseInt(Config.Get("baudRate"), 10), parseInt(Config.Get("dataBits"), 10), parseInt(Config.Get("stopBits"), 10), Config.Get("parity"), Config.Get("handshaking"));
}
else
{
   g_comm = new TCP(OnCommRx, Config.Get("tcpAddress").toString(), parseInt(Config.Get("tcpPort"), 10));
}
// g_comm.AddRxFraming("FixedLength", 13);
// var internal=parseInt(Config.Get("queryInterval"), 10)*1000;
//var g_Timer=new Timer(sendHeartBean,internal);
var devices_ID = new Array();
var DeviceCount = parseInt(Config.Get("DeviceCount"), 10);
// var number=0;


System.Print("System Start");
qscInit();

function qscInit(){
    dbgPrint("qscInit strat !!!");
    for(var i=1;i<=DeviceCount;i++){
        devices_ID[i] = Config.Get("Device"+i+"_ID");
        dbgPrint("devices_ID["+ i +"]  is :"+devices_ID[i] +" its type is : " + typeof(devices_ID[i] ));
        // if(devices_ID[i] <16){
        //     devices_ID[i] = "0x0"+devices_ID[i] .toString(16);
        // }else{
        //     devices_ID[i] = "0x"+devices_ID[i] .toString(16);
        // }
        for(var q = 1;q<=4;q++){
            SystemVars.Write("Device"+ i +"_Load"+ q +"_Power_Stat",false);
            SystemVars.Write("Device"+ i +"_Load"+ q +"_Power_On_Fb",false);
            SystemVars.Write("Device"+ i +"_Load"+ q +"_Power_Off_Fb",true);
            SystemVars.Write("Device"+ i +"_Load"+ q +"_level_Fb",0);
            cmd_Hex1=toHexString("0xAE","0x"+devices_ID[i] ,("0x0"+q),"0x00","0xEE");
            g_comm.Write(cmd_Hex1);
            cmd_Hex2=toHexString("0xAE","0x"+devices_ID[i] ,("0xB"+q),"0x00","0xEE");
            g_comm.Write(cmd_Hex2);
        }
        dbgPrint("qscInit() Device " + i + "finished!");
        //Persistence.Write("Device"+devices_ID[i] +"_Load"+i+"_level_Fb_Pt",0);

        //temp[i]=27;
        //Temperature_Fb_Write(i,27);
    }
    // if(g_synchronous){
    //     g_Timer.Start(sendHeartBean,internal);
    // }
}



function OnCommRx(data){   
    //g_Timer.Stop();

    //dbgPrint(data.length);
    dbgPrint("从PD4-DIN接收"+PrintHex(data));
    dataProcess(data);
    // var id;
    // var channel;
    // var level;
    // if(data.charCodeAt(0)== 0xAE && data.charCodeAt(4)==0xEE){
    //     for(i = 1;i<=DeviceCount;i++){
    //         if(data.charCodeAt(1) == devices_ID[i]){
    //             id = devices_ID[i];
    //         }
    //     }
    // }

    // if(data.charCodeAt(1)==3){
    //     var id = data.charCodeAt(0);
    //     var pm = data.charCodeAt(3)*256+data.charCodeAt(4);
    //     var t = (data.charCodeAt(5)*256+data.charCodeAt(6))/10;
    //     var h = (data.charCodeAt(7)*256+data.charCodeAt(8))/10;
    //     var voc = data.charCodeAt(11)*256+data.charCodeAt(12);
    //     var speed = data.charCodeAt(14);
    //     var innerloop = data.charCodeAt(16);
    //     var mode = data.charCodeAt(18);
    //     var fs = (data.charCodeAt(19)*256+data.charCodeAt(20))/10;
    //     var CH = data.charCodeAt(26);
    //     Synchronize(id,pm,t,h,voc,speed,innerloop,mode,fs,CH);
    //     //dbgPrint("//////////////");
    // }
    
}

function dataProcess(data){
    dbgPrint("dataProcess data is :" + data);
    //if(data.charCodeAt(0) == 0xAE && data.charCodeAt(4) == 0xEE){
    var hexid = data.charCodeAt(1);//
    for(var i = 1;i <= DeviceCount; i++){
        if( hexid == devices_ID[i]){
            dbgPrint("in the loop");
            dbgPrint("dataProcess id is : " + hexid + " and its type is : " + typeof(hexid)); 
            var hexchannel = data.charCodeAt(2);
            dbgPrint("dataProcess hexchannel is : " + hexchannel + " and its type is : " + typeof(hexchannel));
            var channel = hexchannel.toString(16).mysubstring(1); 
            dbgPrint("dataProcess channel is : " + channel + " and its type is : " + typeof(channel));
            var hexlevel = data.charCodeAt(3);
            dbgPrint("dataProcess hexlevel is : " + hexlevel + " and its type is : " + typeof(hexlevel));
            var level = Number(hexlevel.toString());
            dbgPrint("dataProcess level is : " + level + " and its type is : " + typeof(level));
            dbgPrint("Device"+(i)+"_Load"+channel+"_level_Fb 's value now is :"+level);
            SystemVars.Write("Device"+ (i) +"_Load"+channel+"_level_Fb",level);
        }
    }
}
// function Synchronize(id,pm,t,h,voc,speed,innerloop,mode,fs,CH){ //同步
//     var num;
//     for(var i=1;i<=DeviceCount;i++){
//       if(id==devices_ID[i]){
//         num=i;
//       }
//     }
//     switch (CH) {//同步开关
//         case 0:
//             CH_On_Fb_Write(num);
//             break;
        
//         case 1:
//             CH_Off_Fb_Write(num);
//             break; 
//     }
//     switch (mode) {//同步模式
//         case 1:
//             Mode_Auto_Fb_Write(num);
//             break;
        
//         case 2:
//             Mode_Hand_Fb_Write(num);
//             break; 
//     }

// }


//——————————————————————————————————————————————————————————————————————————————————————

function Level_Fb_Write(Device,Load,Level){//Device1_Load1_level_Fb
    SystemVars.Write("Device"+Device+"_Load"+Load+"_level_Fb" ,Level);
}

//——————————————————————————————————————————————————————————————————————————————————————

function SetLevel(Device, Load, Level){ //亮度 AE ID BX XX EE
    var cmd_Hex="";
    cmd_Hex=toHexString("0xAE","0x"+devices_ID[Device],("0xB"+Load),Level.toString(),"0xEE");
    dbgPrint("Devices Control Code : " + cmd_Hex);
    Persistence.Write("Device"+Device+"_Load"+Load+"_level_Fb_Pt",Level);
    Level_Fb_Write(Device,Load,Level);
    if(Level > 0){
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",false);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",true);
    }
    if(Level == 0){
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",false);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",false);
    }
    dbgPrint("devices_ID[Device] is :" + "0x" + devices_ID[Device]);
    dbgPrint("SetLevel(Device,Load,level)"+" Device = " + Device + ", Load = " + Load + ", level = " + Level);
    g_comm.Write(cmd_Hex);
    g_comm.Write(toHexString("0xAE","0x"+devices_ID[Device],("0xA"+Load),"0xF2","0xEE"));//发送输出状态查询
}


function Level_Up(Device,Load){
    var Level = SystemVars.Read("Device"+Device+"_Load"+Load+"_level_Fb");
    if (Level < 100) {
        Level = Level + 1;
    } else {
        Level = 100;
    }
    SystemVars.Write("Device"+Device+"_Load"+Load+"_level_Fb",Level);
    cmd_Hex=toHexString("0xAE","0x"+devices_ID[Device],("0xA"+Load),"0x01","0xEE");
    g_comm.Write(cmd_Hex);
    dbgPrint("Level_Up Successfully sent!");
    if (Level > 0) {
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",false);
    }  
    if(Level == 0){
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",false);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",false);
    }
    g_comm.Write(toHexString("0xAE","0x"+devices_ID[Device],("0xA"+Load),"0xF2","0xEE"));
}

function Level_Dn(Device,Load) {
    SystemVars.Read("Device"+Device+"_Load"+Load+"_level_Fb");
    var Level = SystemVars.Read("Device"+Device+"_Load"+Load+"_level_Fb");
    if (Level > 0) {
        Level = Level - 1;
    } else {
        Level = 0;
    }
    SystemVars.Write("Device"+Device+"_Load"+Load+"_level_Fb",Level);
    cmd_Hex=toHexString("0xAE",devices_ID[Device],("0xA"+Load),"0x02","0xEE");
    g_comm.Write(cmd_Hex);
    dbgPrint("Level_Up Successfully sent!");
    if (Level > 0) {
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",false);
    }  
    if(Level == 0){
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",false);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",true);
        SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",false);
    }
    g_comm.Write(toHexString("0xAE","0x"+devices_ID[Device],("0xA"+Load),"0xF2","0xEE"));
}

function On(Device,Load){
    // var Level = Persistence.Read("Device"+Device+"_Load"+Load+"_level_Fb_Pt");
    // dbgPrint("On() Level = " + Level);
    // if(Level == undefined){
    //     Level = SystemVars.Read("Device"+Device+"_Load"+Load+"_level_Fb");
    //     dbgPrint("On() Level in SystemVars = " + Level);
    // }
    SetLevel(Device,Load,100);
    Level_Fb_Write(Device,Load,100);
    SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",true);
    SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",true);
    SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",false);
}

function Off(Device,Load){
    // var Level = SystemVars.Read("Device"+Device+"_Load"+Load+"_level_Fb");
    // dbgPrint("Before Off() Level in SystemVars = " + Level);
    // Persistence.Write("Device"+Device+"_Load"+Load+"_level_Fb_Pt",Level);
    SetLevel(Device,Load,0);
    Level_Fb_Write(Device,Load,0);
    SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Stat",false);
    SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_On_Fb",false);
    SystemVars.Write("Device"+Device+"_Load"+Load+"_Power_Off_Fb",true);
}

function Toggle(Device,Load){
    SystemVars.Read("Device"+Device+"_Load"+Load+"_level_Fb");
    if(SystemVars.Read("Device"+Device+"_Load"+Load+"_Power_On_Fb") == true){
        Off(Device,Load);
    }else{
        On(Device,Load);
    }
}

function Pause(Device,Load){
    cmd_Hex=toHexString("0xAE","0x"+devices_ID[Device],("0xA"+Load),"0x05","0xEE");
    g_comm.Write(cmd_Hex);
}
// function selectData(number){//查询命令
    
//     var cmd_Hex="";
//     cmd_Hex=toHexString(devices_ID[number],"0x03","0x03","0x01","0x00","0x0C");
//     g_comm.Write(cmd_Hex);

// }

// function sendHeartBean(){
//     selectData(number);
//     number+=1;
//     if(number>DeviceCount){
//       number=1;
//     }
//     g_Timer.Start(sendHeartBean,internal);
// }

//——————————————————————————————————————————————————————————————————————————————————————

function toHexString(a,b,c,d,e){
    var cmd_Hex = "";
    var data = new Array();
    data.unshift(a,b,c,d,e);
    //data=data.concat(checkSum(data));
    for(var i=0;i<data.length;i++){
        cmd_Hex+=String.fromCharCode(data[i]);
    }
    dbgPrint("向PD4-DIN发送："+ PrintHex(cmd_Hex));
    return cmd_Hex;
}


// function checkSum(data){
//     var checksum=0;
//     for(var i=0;i<data.length;i++){
//        checksum=checksum+parseInt(data[i]);
//        //dbgPrint("checkSum="+parseInt(data[i]));
//     }
//     return checksum;
// }

String.prototype.mysubstring=function(beginIndex,endIndex){
    var str=this,
        newArr=[];
    if(!endIndex){
        endIndex=str.length;
    }
    for(var i=beginIndex;i<endIndex;i++){
        newArr.push(str.charAt(i));
    }
    return newArr.join("");
}
// function checkSumCRC(data){
//     var csSP1SP2 = new Array();
//     //var SP18;
//     //var SP28;
//     var tsxh;
//     var tsxl;

//     var tmp = 0xffff;
//     var ret1 = 0;
//     for(var n = 0; n < data.length; n++){/*要校验的位数为data.length个*/

//         tmp = data[n] ^ tmp;
//         for(var i = 0;i < 8;i++){  /*此处的8 -- 指每一个char类型又8bit，每bit都要处理*/
//             if(tmp & 0x01){
//                 tmp = tmp >> 1;
//                 tmp = tmp ^ 0xa001;
//             }   
//             else{
//                 tmp = tmp >> 1;
//             }   
//         }   
//     }

//     tsxl=parseInt(tmp/256);
//     tsxh=parseInt(tmp%256);
 
//     //dbgPrint("tsxh: "+tsxh.toString(16));
//     //dbgPrint("tsxl: "+tsxl.toString(16));
//     //dbgPrint("tmp: "+tmp.toString(16));
//     /*
//     ret1 = tmp >> 8;
//     ret1 = ret1 | (tmp << 8);
//     dbgPrint("ret1: "+ret1.toString(16));
//     SP18=ret1 >> 8;
//     SP28=ret1 & 0xff;
//     dbgPrint("SP18: "+SP18.toString(16));
//     dbgPrint("SP28: "+SP28.toString(16));
//     */
//     csSP1SP2.unshift(tsxh,tsxl);
//     for(var i=0 ;i<csSP1SP2.length;i++){
//         if(csSP1SP2[i]<16){
//             csSP1SP2[i]="0x0"+csSP1SP2[i].toString(16);
//         }else{
//             csSP1SP2[i]="0x"+csSP1SP2[i].toString(16);
//         }
        
//     }
//     //dbgPrint("csSP1SP2: "+csSP1SP2);
//     return csSP1SP2;
// }



function PrintHex(data){
    var t="";
    for(var i=0;i<data.length;i++){
        var a;
        a=data.charCodeAt(i);
        if(a<16){
            a="0"+a.toString(16);
        }else{
            a=a.toString(16);
        }
        t+=a+" ";
    }
    return t;
    //System.Print("发送："+t);
  }

function dbgPrint(msg){
    if (g_debug)
    System.Print(msg);
}




