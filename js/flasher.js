var portState = 0;
var connectedPort;
var connectionInfo;
var S_UNCONNECT = 0, S_CONNECT = 1, S_READ = 2, S_VERIFY = 3, S_WRITE = 4, S_APP = 5, S_RETX = 6;
var state = S_UNCONNECT;	
var boardInfo = "\x09";
var sfile = 0;
var rfile = 0;
var sbinfile = 0;
var downBin;    //下载的bin
var binBuf = new ArrayBuffer(8192);
var u8BinBuf = new Uint8Array(binBuf);
var binIndex = 0;
var WPAGE_CNT = 1;

var PAGE_SIZE = 64;
var PAGE_CNT = 128;
var INITPAGE = 8;	//0x200
var Buf=new ArrayBuffer(PAGE_SIZE);
var uartBuf = new Uint8Array(Buf);
var bufVerify = 0;
var bufIndex = 0;

var BOOT_OK	="\xa0";
var BOOT_ERR ="\xa1";
var BOOT_HEAD ="\xa5";
var BOOT_READ ="\xa6";
var BOOT_WRITE ="\xa7";
var BOOT_VERIFY ="\xa8";
var BOOT_GO ="\xa9";

var editor;

if (typeof chrome != "undefined" && chrome.serial) {
    chrome.serial.getPorts(SerialPortList);
} else {
    throw "No access to serial ports. Try loading as a Chrome Application.";
}

$(document).ready(function(){
	CodeMirror.commands.autocomplete = function(cm) {
		CodeMirror.showHint(cm, CodeMirror.hint.stm8);
	};
	editor = CodeMirror.fromTextArea(document.getElementById("code"), {
		lineNumbers: true,
		matchBrackets: true,
		autoCloseBrackets: true,
        lineWrapping: true,
		foldGutter: {
			rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
		},
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		extraKeys: {"Ctrl-Q": "autocomplete",
			"F11": function(cm) {
				cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function(cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			}
        },
		theme: "eclipse",
		indentUnit: 4,
		mode: "text/x-csrc"
	});
	$(function() {
		$( "#appInfo" ).dialog({
			autoOpen: false,
			show: {
				effect: "blind",
				duration: 1000
			},
			hide: {
				effect: "explode",
				duration: 1000
			}
		});

		$( "#opener" ).click(function() {
			$( "#dialog" ).dialog( "open" );
		});
	});
	$(function() {
		$( "#info" ).button({
			text: false,
			icons: {
				primary: "ui-icon-info"
			}
		}).click(function() {
			$( "#appInfo" ).dialog( "open" );
		});;
		$( "#loadSrc" ).button({
			text: false,
			icons: {
				primary: "ui-icon-folder-open"
			}
		});
		$( "#saveSrc" ).button({
			text: false,
			icons: {
				primary: "ui-icon-disk"
			}
		});
		$( "#build" ).button({
			text: false,
			icons: {
				primary: "ui-icon-script "
			}
		});
		$( "#download" ).button({
			text: false,
			icons: {
				primary: "ui-icon-arrowthickstop-1-s"
			}
		});
        $( "#saveBin" ).button({
			text: false,
			icons: {
				primary: "ui-icon-copy"
			}
		});
		$( "#refresh" ).button({
			text: false,
			icons: {
				primary: "ui-icon-refresh"
			}
		});
		$( "#setP" ).button({
			text: false,
			icons: {
				primary: "ui-icon-play"
			}
		});
		$( "#readFile" ).button({
			text: false,
			icons: {
				primary: "ui-icon-folder-open"
			}
		});
		$( "#downloadF" ).button({
			text: false,
			icons: {
				primary: "ui-icon-arrowthickstop-1-s"
			}
		});
		$( "#clearRec" ).button({
			text: false,
			icons: {
				primary: "ui-icon-trash"
			}
		});
		$( "#restart" ).button({
			text: false,
			icons: {
				primary: "ui-icon-seek-next"
			}
		});
		$( "#restart" ).button();
		$( "#recHex" ).button();
		$( "#sendHex" ).button();
		$( "#send" ).button();
        bindResize($('#codeLine'), $('#buildInfo'), $('#codeContainer'), 1);
	});
 
    //line, 分割线，el,主动元素，el2,被动变化元素，type，1,高，2宽，3both
	function bindResize(line, el, el2, type){
		var x = y = 0;
		$(line).mousedown(function(e){
			//按下元素后，计算当前鼠标与对象计算后的坐标
			x = e.clientX ,
			y = e.clientY ;
			line.setCapture ? (	
				line.setCapture(),//捕捉焦点
				line.onmousemove = function(ev){//设置事件
					mouseMove(ev || event)
				},
				line.onmouseup = mouseUp
			) : (//绑定事件
				$(document).bind("mousemove",mouseMove).bind("mouseup",mouseUp)
			)
			e.preventDefault()//防止默认事件发生
		});
		//移动事件
		function mouseMove(e){
            if(type&0x01) {  //高度
                el.height(((el.height() - e.clientY + y)*100/$("#webCoder").height()) + '%');
                el2.height(((el2.height() + e.clientY - y)*100/$("#webCoder").height()) + '%');
                y = e.clientY;
            }
            if(type&0x02) {  //宽度
                el.width(el.width() - e.clientX + x + 'px');
                el2.width(el2.width() + e.clientX - x + 'px');
                x = e.clientX;
            }
		}
		//停止事件
		function mouseUp(){
			line.releaseCapture ? (
				line.releaseCapture(),
				line.onmousemove = line.onmouseup = null
			) : (
				$(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
			)
		}
	}
	
});

chrome.runtime.onSuspend.addListener(function() { 
    if(portState == 1)  //退出前关闭打开的串口
    {
        chrome.serial.close(connectionInfo.connectionId, onClose);
    }
})

function SerialPortList(ports) {
	refresh(ports);
	document.getElementById("refresh").onclick = function(){chrome.serial.getPorts(refresh);};
    document.getElementById("setP").onclick = setP;
	document.getElementById("readFile").onclick = readFile;
	document.getElementById("clearRec").onclick = function(){$("#output").text("");};
	document.getElementById("downloadF").onclick = clickDownloadF;
    document.getElementById("send").onclick = send;
    document.getElementById("loadSrc").onclick = loadSrc;
    document.getElementById("saveSrc").onclick = saveSrc;
    document.getElementById("build").onclick = build;
    document.getElementById("download").onclick = download;
    document.getElementById("saveBin").onclick = saveBin;
};

function refresh(ports)
{
    var portsPath = document.getElementById("portPath");
	while(portsPath.options.length > 0) portsPath.options.remove(0);	//移除旧选项
    for (var i = 0; i < ports.length; i++) {
		portsPath.options.add(new Option(ports[i], ports[i]));
        if (ports[i].indexOf("USB") !== -1) {
            portsPath.options[i].selected = true;			
        }
    }   
}

//abandon
function verifyP(page)
{
	switch(state)
	{
	case S_CONNECT:
		if(page == "")page = 0;
		chrome.serial.write(connectionInfo.connectionId, str2ab(BOOT_VERIFY + String.fromCharCode(page)), onWrite); 
		state = S_VERIFY;
		break;
	case S_VERIFY:
		$("#output").append("check sum =" + bufVerify.toString(16) + "\n");
		state = S_CONNECT;
		break;
	default:
		break;
	}

}

function setP() {
    var portsPath = document.getElementById("portPath");
    var port = portsPath.options[portsPath.selectedIndex].value;
    portState = !portState;
    if(portState == 0)  //关闭
    {
        chrome.serial.close(connectionInfo.connectionId, onClose);
    }
    else    //开启
    {
        chrome.serial.open(port, {bitrate: 115200}, onOpen);       
    }
};

var tryCnt = 0;
function connect(){
	if(state == S_UNCONNECT)
	{
		$("#output").append("尝试连接\n"); 
		tryCnt = 0;
		connectRes = 0;
		sendHead();
	}
	else
	{
		$("#output").append("已经连接!\n"); 
	}
};
function sendHead()
{
	if(state == S_UNCONNECT && tryCnt < 50)
	{
		chrome.serial.write(connectionInfo.connectionId, str2ab(BOOT_HEAD), onWrite);
		tryCnt++;
		$("#output").append(".");
		setTimeout(sendHead, 100);
	}
	else if(state == S_CONNECT)
	{
		$("#output").append("\n连接成功! bootloader 占用页数:" + INITPAGE + "\n");
		connectRes = 1;
	}
	else	//fail
	{
		connectRes = 2;
		$("#output").append("\n连接失败!\n");
	}
}

//abandon
function saveFile()
{
	var config = {type: 'saveFile', suggestedName: "save.bin"};
	chrome.fileSystem.chooseEntry(config, function(writableEntry) {
		sfile = writableEntry;
		if (sfile.isFile) {
			chrome.fileSystem.getDisplayPath(sfile, function(path) {
				document.querySelector('#sfile_path').value = path;
			});
		}
	});
}

//abandon
function rewrite()
{
	var bootfile;
	var config0 = {type: 'openWritableFile', suggestedName: "boot.bin"};
	//var config1 = {type: 'saveFile', suggestedName: "boot.bin"};
	chrome.fileSystem.chooseEntry(config0, function(readableEntry) {
		bootfile = readableEntry;
		if (bootfile.isFile) {
			readAsBin(bootfile, function(result) {
				binBuf = result;
				u8BinBuf = new Uint8Array(binBuf);
				for(var i = 1; i < 32; i++)
				{
					u8BinBuf[4*i + 2 + 52] = 128 + ((INITPAGE*64)>>8);	//0x80 + ..
					u8BinBuf[4*i + 3 +52] = ((INITPAGE*64)%256) + 4*i;
				}
				var blob = new Blob([u8BinBuf], {type: "application/octet-binary"});
					writeFileEntry(bootfile, blob, function(e) {
						binIndex = 0;
						$("#output").append("改写中断向量表完成\n"); 
					});	
			});
		};
	});
}


function readFile()
{
	var config = {type: 'openFile', suggestedName: "read.bin"};
	chrome.fileSystem.chooseEntry(config, function(readableEntry) {
		rfile = readableEntry;
		if (rfile.isFile) {
			chrome.fileSystem.getDisplayPath(rfile, function(path) {
                var point = path.lastIndexOf(".");  
                var type = path.substr(point);  
                if(type!=".bin"&&type!=".hex"&&type!=".BIN"&&type!=".HEX"){  
                    document.querySelector('#rfile_path').value = "后缀名无效(仅支持bin/hex)";
                    rfile = 0;
                }  
                else
                {
                    document.querySelector('#rfile_path').value = path;
                }
			});
		}
	});
}

function loadSrc()
{
	var config = {type: 'openFile'};
	chrome.fileSystem.chooseEntry(config, function(readableEntry) {
		if (readableEntry.isFile) {
			readAsText(readableEntry, function(result) {
				editor.setValue(result);
			});
		}
	});
}

function saveSrc()
{
    var config = {type: 'saveFile', suggestedName: "app.c"};
	chrome.fileSystem.chooseEntry(config, function(writableEntry) {
		if (writableEntry.isFile) {
			var blob = new Blob([editor.getValue()], {type: "application/octet-binary"});
			writeFileEntry(writableEntry, blob, function(e) {});
		}
	});
}

function saveBin()
{
    var config = {type: 'saveFile', suggestedName: "app.bin"};
	chrome.fileSystem.chooseEntry(config, function(writableEntry) {
        sbinfile = writableEntry;
		if (sbinfile.isFile) {
			chrome.fileSystem.getDisplayPath(sbinfile, function(path) {
				document.querySelector('#binFile_path').value = path;
			});
		}
	});
}

function build()
{
    var src = editor.getValue();
	$("#build").button("disable");	//防止重复按键
    $("#buildInfo").text("");
    $.post("http://uclink.org/STM8_app/buildStm8.php", src, function(data){
    //$.post("http://127.0.0.1/STM8_app/buildStm8.php", src, function(data){
        $("#buildInfo").append(data.info + "\n");   //显示编译输出信息
        if(data.result == 1) //编译通过
        {
            downBin = decodeBase64(data.bin);
            if (sbinfile.isFile) {
                var blob = new Blob([downBin], {type: "application/octet-binary"});
                writeFileEntry(sbinfile, blob, function(e){ //保存bin至本地
                    //$("#buildInfo").append("bin拷贝完成...\n");
                });
            }
            $("#buildInfo").append("编译通过!可以下载调试了～\n");         
        }
        else
        {
            $("#buildInfo").append("编译失败 :(\n");
        }
        $("#build").button("enable");
    },"json");    
}

function download()
{
    if(typeof(downBin) != 'undefined')
    {
        //下载至flash
        u8BinBuf = new Uint8Array(downBin);
        WPAGE_CNT = ((u8BinBuf.byteLength)>>6) + 1; //TODO:6换成常量定义
        state = S_UNCONNECT; 
        dfFlag = 0; 
        downloadF();
    }
    else
    {
        $("#buildInfo").append("请先build!\n");
    }
}

//abandon
var readTry = 0;
var readp_res = 0;
var READP_DO = 0, READP_OK =1, READP_ERR = 2;
function readP(page){
	switch(state)
	{
	case S_CONNECT:
		if(page == "")page = 0;
		chrome.serial.write(connectionInfo.connectionId, str2ab(BOOT_READ + String.fromCharCode(page)), onWrite); 
		state = S_READ;
		readp_res = 0;
		$("#output").append(page+" ");
		break;
	case S_READ:
		for (var i = 0, sum = 0; i < PAGE_SIZE; i++) 
        {
			sum += uartBuf[i];
		}
		state = S_CONNECT;
		if((sum&0xff) != bufVerify)	//校验失败
		{
			readTry++;
			if(readTry > 4)
			{
				readTry = 0;
				readp_res = READP_ERR;	//读取失败
			}
			else
			{
				//readP(page);	//重新读取
			}
		}
		else
		{	//读取成功
			readp_res = READP_OK;
			readTry = 0;
		}
		break;
	default:
		break;
	}
};

//abandon
var r_page = 0;
var readF_state = 0;
var t0, t1;
var RPAGE_TIME = 30;
function readF(){
	switch(readp_res)
	{
	case READP_DO:
		setTimeout(readF, RPAGE_TIME);
		if(state == S_CONNECT)
		{
			readP(r_page);	//第一次读取或者重新读取
		}
		//else {}	//未完成读取
		break;
	case READP_OK:
		r_page++;
		if(r_page >= PAGE_CNT)
		{
			readF_state = 1;
			r_page = 0;
			readp_res = READP_DO;
			t1 = (new Date()).getTime();
			$("#output").append("\nflash读取完成!");
			$("#output").append("用时"+(t1-t0)+"ms\n");
			var blob = new Blob([u8BinBuf], {type: "application/octet-binary"});
			writeFileEntry(sfile, blob, function(e) {
				binIndex = 0;
				$("#output").append("写入文件完成\n"); 
			});
		}
		else
		{
			for(var i = 0; i < PAGE_SIZE; i++)
			{
				u8BinBuf[binIndex + i] = uartBuf[i]; 
			}
			binIndex += PAGE_SIZE;
			readP(r_page);	//读取下一页
			setTimeout(readF, RPAGE_TIME);
		}
		break;
	case READP_ERR:
		readF_state = 1;
		r_page = 0;
		readp_res = READP_DO;
		$("#output").append("\n第"+r_page+"页读取失败...flash读取失败\n");
		break;
	default:
		break;
	}
}

//abandon
function readFlash()
{
	if(!sfile)
	{
		$("#output").append("请先选择保存文件名\n"); 
	}
	else
	{
		binBuf = new ArrayBuffer(8192);
		u8BinBuf = new Uint8Array(binBuf);
		t0 = (new Date()).getTime(); 
		readF();
	}
}

var writeTry = 0;
var writep_res = 0;
var WRITEP_DO = 0, WRITEP_OK =1, WRITEP_ERR = 2, WRITEP_RETX = 3;
function writeP(page)
{
	switch(state)
	{
	case S_CONNECT:
		var i;
		if(page == "")page = INITPAGE;
		//0xa7 page data verify	//写第page页
		chrome.serial.write(connectionInfo.connectionId, str2ab(BOOT_WRITE + String.fromCharCode(page)), onWrite); 
		if(binIndex + 64 > u8BinBuf.byteLength)	//最后一页
		{
			for(i = 0, bufVerify = 0; i < u8BinBuf.byteLength - binIndex; i++)
			{
				bufVerify += u8BinBuf[binIndex + i];
				chrome.serial.write(connectionInfo.connectionId, str2ab(String.fromCharCode(u8BinBuf[binIndex + i])), onWrite);	//data
			}
			for(; i < PAGE_SIZE; i++)
			{
				bufVerify += 0;
				chrome.serial.write(connectionInfo.connectionId, str2ab(String.fromCharCode(0)), onWrite);	//data
			}
		}		
		else
		{
			for(i = 0, bufVerify = 0; i < PAGE_SIZE; i++)
			{
				bufVerify += u8BinBuf[binIndex + i];
				chrome.serial.write(connectionInfo.connectionId, str2ab(String.fromCharCode(u8BinBuf[binIndex + i])), onWrite);	//data
			}
		}
		chrome.serial.write(connectionInfo.connectionId, str2ab(String.fromCharCode(bufVerify&0xff)), onWrite);	//verify
		//console.log("writeP");
		state = S_WRITE;
		writep_res = 0;
		$("#output").append(page+" ");
		break;
	case S_WRITE:
		state = S_CONNECT;
		if(bufVerify == 161)	//校验失败
		{
		//console.log("writeP failed");
			writeTry++;
			if(writeTry > 4)
			{
				writeTry = 0;
				writep_res = WRITEP_ERR;	//写入失败
			}
			else
			{
				//writeP(page);	//重新写入
			}
		}
		else
		{	//写入成功
		//console.log("writeP ok");
			writep_res = WRITEP_OK;
			writeTry = 0;
		}
		break;
	default:
		break;
	}
}

var w_page = INITPAGE;
var writeF_state = 0;//0,ing,1,ok,2,err
var WPAGE_TIME = 30;
var wpage_times = 0;
var wpage_retxTimes = 0;
function writeF()
{
	switch(writep_res)
	{
	case WRITEP_DO:
		if(state == S_CONNECT)
		{
			setTimeout(writeF, WPAGE_TIME);
			writeP(w_page);	//第一次写入或者重新写入
			wpage_times = 0;
		}
		else 
		{
			if(wpage_times > 3)	//等待3次未收到,自动重传
			{
				wpage_times = 0;
				//$("#output").append("\n第"+w_page+"页写入超时...flash写入失败\n");
				//writeF_state = 2;
				//w_page = INITPAGE;
				writep_res = WRITEP_RETX;
                state = S_RETX;
                wpage_retxTimes = 0;
                setTimeout(writeF, 10);
                //console.log("page "+w_page+" retx");
			}
			else	//继续等待
			{
				wpage_times++;
				setTimeout(writeF, WPAGE_TIME);
			}
		}	//未完成读取
		break;
    case WRITEP_RETX:
        if(state == S_RETX)
        {
            if(wpage_retxTimes <= PAGE_SIZE)    //容许范围内重传
            {
                //console.log(wpage_retxTimes);
                chrome.serial.write(connectionInfo.connectionId, str2ab(BOOT_HEAD), onWrite);   //填充一个字节
                setTimeout(writeF, 10);
                wpage_retxTimes++;
            }
            else
            {
                wpage_retxTimes = 0;
                $("#output").append("\n第"+w_page+"页写入超时...flash写入失败,请复位或断电重试\n");
				writeF_state = 2;
				w_page = INITPAGE;
            }
        }
        else if(state == S_CONNECT) //mcu已响应
        {
            writep_res = WRITEP_DO;
            wpage_retxTimes = 0;
            writeP(w_page);
            wpage_times = 0;
            setTimeout(writeF, WPAGE_TIME);
        }
        break;
	case WRITEP_OK:
		w_page++;
		if(w_page >= (INITPAGE + WPAGE_CNT) || w_page >= PAGE_CNT )	//写入完成
		{
			writeF_state = 1;
			w_page = INITPAGE;
			writep_res = WRITEP_DO;
			binIndex = 0;
			t1 = (new Date()).getTime();
			$("#output").append("\nflash写入完成!");
			$("#output").append("用时"+(t1-t0)+"ms\n");
		}
		else
		{
			binIndex += PAGE_SIZE;
			writeP(w_page);	//读取下一页
			setTimeout(writeF, WPAGE_TIME);
		}
		break;
	case WRITEP_ERR:
		writeF_state = 2;
		w_page = INITPAGE;
		writep_res = READP_DO;
		$("#output").append("\n第"+w_page+"页写入失败...flash写入失败\n");
		break;
	default:
		break;
	}

}

function writeFlash()
{
    t0 = (new Date()).getTime(); 
    w_page = INITPAGE;
    writeF_state = 0;
    //console.log("wf");
    writeF();
}

function startApp()
{
	chrome.serial.write(connectionInfo.connectionId, str2ab(BOOT_GO), onWrite); 	
    state = S_APP;	
}

var dfFlag = -1;
function downloadF()
{

	switch(dfFlag)
	{
	case 0:	
		if(state == S_UNCONNECT)
		{	//未连接则发送头部连接
			$("#downloadF").button("disable");
			$("#download").button("disable");
			connect();	//首次连接
			setTimeout(downloadF, 100);
			dfFlag = 1;
		}
		else 
		{	
			console.log("logic error: dfFlag = 0, state = " + state);
		}
		break;
	case 1:
		if(state == S_UNCONNECT)
		{
			if(connectRes == 0)
			{
				setTimeout(downloadF, 100); //wait result
			}
			else if(connectRes == 2)
			{	//failed
				resetVar();
				$("#downloadF").button("enable");
				$("#download").button("enable");
			}
			else
			{
				console.log("logic error: dfFlag = 1, state = S_UNCONNECT, connectRes = " + connectRes);
			}
		}
		else if(state == S_CONNECT && connectRes == 1)
		{	//已连接且子进程已完成
			dfFlag = 2;
			writeFlash();
			setTimeout(downloadF, 500); 
		}
		break;
	case 2:		//已连接则发送烧写命令
		if(writeF_state == 0)	//wait
		{
			setTimeout(downloadF, 500);
		}
		else if(writeF_state == 2)	//写flash错误
		{	//failed
			resetVar();
			$("#downloadF").button("enable");
			$("#download").button("enable");
		}
		else if(writeF_state == 1)	//写flash完成
		{
			dfFlag = 3;
			setTimeout(downloadF, 10);
		}
		break;
	case 3:
        resetVar();
		if(document.getElementById("restart").checked == true)	//自动启动应用
		{
			startApp();	//S_APP
		}
		else
		{
			//still in bootloader
		}
		$("#downloadF").button("enable");
		$("#download").button("enable");
		break;
	default:
		console.log("dfFlag error, dfFlag = " + dfFlag);
		break;
	}
}

function clickDownloadF()
{
	if (rfile.isFile) {
        chrome.fileSystem.getDisplayPath(rfile, function(path) {
            var point = path.lastIndexOf(".");  
            var type = path.substr(point);  
            if(type==".bin"||type==".BIN"){  
                readAsBin(rfile, function(result) {
                    binBuf = result;
                    u8BinBuf = new Uint8Array(binBuf);
                    WPAGE_CNT = ((u8BinBuf.byteLength)>>6) + 1; //TODO:6换成常量定义
                    state = S_UNCONNECT; 
                    dfFlag = 0; 
                    downloadF();
                });
            }
            else    //hex
            {
                u8BinBuf = new Uint8Array(binBuf);
                var index = 0;
                readAsText(rfile, function(result) {
                    var txt = result.split('\n');
                    for(var i=0; i < txt.length; i++)
                    {
                        if(txt[i].substr(7,2) == "00")  //index:7,type,00data,01end
                        {
                            for(var j=9; j < txt[i].length - 3; j += 2) 
                            {
                                u8BinBuf[index++] = parseInt(txt[i].substr(j,2),16);
                                //console.log(parseInt(txt[i].substr(j,2),16) + ";");
                            }
                        }
                        else if(txt[i].substr(7,2) == "01")
                        {
                            //console.log("end at "+i);
                            break;
                        }
                        //else ignore yet
                    }
                    WPAGE_CNT = ((u8BinBuf.byteLength)>>6) + 1; //TODO:6换成常量定义
                    state = S_UNCONNECT; 
                    dfFlag = 0; 
                    downloadF();
                    //binBuf = result;
                    //u8BinBuf = new Uint8Array(binBuf);
                });
            }
        });
	}
	else
	{
		$("#output").append("请先选择固件文件\n"); 
	}
};

function send()
{
    if(document.getElementById("sendHex").checked == true)
    {
		var tmp = $("#input").val().split(/\s+/);
		for(var i = 0; i < tmp.length; i++)	//十六进制发送
		{
			chrome.serial.write(connectionInfo.connectionId, str2ab(String.fromCharCode(parseInt(tmp[i], 16))), onWrite);
		}
    }
    else
    {
        chrome.serial.write(connectionInfo.connectionId, str2ab($("#input").val()), onWrite);
    }
}

$(document).keydown(function(e){
    if(e.ctrlKey && e.which == 13 || e.which == 10)
    {
		if(typeof(connectionInfo)!='undefined' && connectionInfo.connectionId != -1)
		{
			send();
			$("#input").val("");	//清空数据
		}
    }
});

function onOpen(cinfo){
    if(cinfo.connectionId == -1)    //失败
    {
        $("#output").append("打开失败! 串口可能被占用\n"); 
        portState = !portState;
    }
    else    //成功
    {
        connectionInfo = cinfo;
        document.getElementById("setP").innerText = "关闭";
		$("#setP").button( "option", {label: "关闭", icons: {primary: "ui-icon-stop"}});
		$("#downloadF").button("enable");
        $("#download").button("enable");
		$("#send").button("enable");
		$("#refresh").button("disable");
		document.getElementById("portPath").disabled = true;
        $("#output").append("打开成功!\n"); 
        chrome.serial.read(connectionInfo.connectionId, 4096, onRead);  
//chrome.serial.onReceive.addListener(onRead);        
    }
}

function onClose(res){
    if(res == true)
    {
        document.getElementById("setP").innerText = "打开";
		$("#setP").button( "option", {label: "打开", icons: {primary: "ui-icon-play"}});
		$("#downloadF").button("disable");
		$("#download").button("disable");
		$("#send").button("disable");
		$("#refresh").button("enable");
		document.getElementById("portPath").disabled = false;
		resetVar();
        $("#output").append("\n关闭成功!\n");
    }
    else    //关闭失败
    {
        $("#output").append("\n关闭失败\n");
        portState = !portState;
    }
}

function onRead(readInfo){
    if (readInfo && readInfo.bytesRead>0 && readInfo.data)
    {
        var bufView=new Uint8Array(readInfo.data);
        for (var i = 0; i < bufView.length; i++) 
        {
			switch(state)
			{
			case S_UNCONNECT:	//before head
                //$("#output").append(String.fromCharCode(bufView[i])); 
                //console.log(bufView[i]);
				if(bufView[i] == 161)
				{
					//已连接
				}
				else if((bufView[i] & 0x0f) >= 8 && (bufView[i] >> 4) == 10)
				{
					boardInfo = bufView[i];
					INITPAGE = (boardInfo & 0x0f);
				}
				else
				{
					//console.log("connect head error:" + String.fromCharCode(bufView[i]));
					break;	//seemed wrong ack
				}
				state = S_CONNECT;
				break;
			case S_CONNECT:	//after head
                //$("#output").append(String.fromCharCode(bufView[i]));
				break;
			case S_READ:	//in read page
				if(bufIndex == PAGE_SIZE)	//finish
				{
					bufVerify = bufView[i];
					bufIndex = 0;
					readP();
				}
				else
				{
					uartBuf[bufIndex] = bufView[i];
					bufIndex++;
				}
				break;
			case S_VERIFY:	
				bufVerify = bufView[i];
				verifyP();
				break;
			case S_WRITE:
				bufVerify = bufView[i];
				//console.log("ack"); 
				writeP();
				break;
			case S_APP:
                //$("#output").append(String.fromCharCode(bufView[i])); 
				break;
            case S_RETX:
                if(bufView[i] == 161 || ((bufView[i] & 0x0f) >= 8 && (bufView[i] >> 4) == 10))  //已重发至mcu响应或复位。。
                {
                    state = S_CONNECT;
                }
                break;
			default:
				break;
			}  
        }  
        if(document.getElementById("recHex").checked == true)
		{	//十六进制接收
			var tmp;
			for(i = 0; i < bufView.length; i++)	
			{
				tmp = bufView[i].toString(16);
				tmp = tmp + " ";
				if(tmp.length < 2) tmp = "0" + tmp;
				$("#output").append(tmp); 
			}
		}
		else
		{
			$("#output").append(ab2str(bufView)); 
		}
    }
	chrome.serial.read(connectionInfo.connectionId, 4096, onRead); 
};
  
function onWrite(writeInfo){

};

//实际字节数
String.prototype.length2 = function() {   
var totalLength = 0;
        var i;
        var charCode;
        for (i = 0; i < this.length; i++) {
          charCode = this.charCodeAt(i);
          if (charCode < 0x007f) {
            totalLength = totalLength + 1;
          } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
            totalLength += 2;
          } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
            totalLength += 3;
          }
        }
        //alert(totalLength);
        return totalLength;
}

var str2ab=function(str) {
    var buf=new ArrayBuffer(str.length);
    var bufView=new Uint8Array(buf);
    for (var i=0; i<str.length; i++) {
        bufView[i]=str.charCodeAt(i);
    }
    return buf;
};

var arr2ab=function(arr) {
    var buf=new ArrayBuffer(arr.length);
    var bufView=new Uint8Array(buf);
    for (var i=0; i<arr.length; i++) {
        bufView[i]=arr[i];
    }
    return buf;

}

//TODO:solve utf8
var ustr2ab=function(str) {
    var buf=new ArrayBuffer(str.length2());
    var bufView=new Uint8Array(buf);
    for (var i=0; i<str.length; i++) {
        bufView[i]=str.charCodeAt(i);
    }
    return buf;
};

var ab2str=function(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function readAsText(fileEntry, callback) {
  fileEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = errorHandler;
    reader.onload = function(e) {
      callback(e.target.result);
    };

    reader.readAsText(file);
  });
}

function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    $("#output").append("未选择文件");
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    } 
    else {
      chosenEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}

function appendFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    $("#output").append("未选择文件");
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;
    if (opt_blob) {
      //writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(writer.length);
        writer.write(opt_blob);
      });
    }
  }, errorHandler);
}

function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    } 
    else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}

function readAsBin(fileEntry, callback) {
  fileEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = errorHandler;
    reader.onload = function(e) {
      callback(e.target.result);
    };

    reader.readAsArrayBuffer(file);
  });
}

function decodeBase64(strIn){
    if(!strIn.length||strIn.length%4)
        return null;
    var str64=
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var index64=[];
    for(var i=0;i<str64.length;i++)
        index64[str64.charAt(i)]=i;
    var c0,c1,c2,c3,b0,b1,b2;
    var len=strIn.length;
    var len1=len;
    if(strIn.charAt(len-1)=='=')
        len1-=4;
    var result=[];
    for(var i=0,j=0;i<len1;i+=4){
        c0=index64[strIn.charAt(i)];
        c1=index64[strIn.charAt(i+1)];
        c2=index64[strIn.charAt(i+2)];
        c3=index64[strIn.charAt(i+3)];
        b0=(c0<<2)|(c1>>4);
        b1=(c1<<4)|(c2>>2);
        b2=(c2<<6)|c3;
        result.push(b0&0xff);
        result.push(b1&0xff);
        result.push(b2&0xff);
        }
    if(len1!=len){
        c0=index64[strIn.charAt(i)];
        c1=index64[strIn.charAt(i+1)];
        c2=strIn.charAt(i+2);
        b0=(c0<<2)|(c1>>4);
        result.push(b0&0xff);
        if(c2!='='){
            c2=index64[c2];
            b1=(c1<<4)|(c2>>2);
            result.push(b1&0xff);
            }
        }
    return arr2ab(result);
}

function resetVar()
{
	state = S_UNCONNECT;
	dfFlag = -1;
	w_page = INITPAGE;
	writeF_state = 0;
	WPAGE_TIME = 30;
	writeTry = 0;
	writep_res = 0;
	tryCnt = 0;
	binIndex = 0;
	bufVerify = 0;
	bufIndex = 0;
}

$(document).ajaxError(function(e, xhr, settings, exception) {
    $("#buildInfo").append("悲剧，服务器未正常响应。。如果一直出现请及时反馈\n");
    $("#build").button("enable");
});

function errorHandler()
{
	console.log("error");
}