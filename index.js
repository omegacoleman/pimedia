
var koa = require('koa');
var send = require('koa-send');
var omxplayer = require('./omxplayer.js');
var filelist = require('./filelist.js');
var app = new koa();

var OMX_OPTIONS_PRE = ["-b", "--align", "center", "--no-ghost-box"];

var omx_options = src => OMX_OPTIONS_PRE.concat([src]);

var IDLE_VID = "./pimedia.mp4"
var OMX_OPTIONS_DEF = OMX_OPTIONS_PRE.concat(["--loop", IDLE_VID])

var player = new omxplayer(OMX_OPTIONS_DEF);

player.on('close', () => {
	player.reload(OMX_OPTIONS_DEF);
});

player.on('error', e => {
	throw e;
});

app.use(async (ctx) => {
	if ('/flist' == ctx.path)
	{
		var resp = "<option value=\"\">Select file to play</option>\n";
		var fl = filelist.mlist();
		for(var fn in fl)
		{
			resp += "<option value=\"" + fl[fn] + "\">" + fn + "</option>\n"
		}
		return ctx.body = resp;
	}
	await send(ctx, '/client/index.html');
});

var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

var rc_i = 0;

io.on('connection', (socket) => {
	rc_i ++;
	var i = rc_i;
	console.log("RC#" + i + " connected.");
	socket.on('play_file', (which) => {
		console.log("RC#" + i + " issued to play " + which);
		player.reload(omx_options(which));
	});
	socket.on('control', (how) => {
		console.log("RC#" + i + " pushed btn " + how);
		player[how]();
	});
	socket.on('disconnect', () => {
		console.log("RC#" + i + " disconnected.");
	});
});

server.listen(6666);
