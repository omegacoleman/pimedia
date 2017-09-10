const spawn = require('child_process').spawn;
const EventEmitter = require('events');
const util = require('util');

var omxplayer = function (args) {
	EventEmitter.call(this);
	this.omx_process = null;
	this.spawn_omx(args);
};

omxplayer.prototype.external_closed = function() {
	this.omx_process = null;
	this.emit('close');
};

omxplayer.prototype.emit_error = function(message) {
	this.omx_process = null;
	this.emit('error', message);
};

omxplayer.prototype.spawn_omx = function(args) {
	if(!args)
	{
		return;
	}
	this.omx_process = spawn('omxplayer', args);
	this.omx_process.stdin.setEncoding('utf-8');
	this.omx_process.on('close', (code) => {
		if((code == 0) || (code == 3))
		{
			this.external_closed();
		} else {
			this.emit_error('omxplayer fails, started with args ' + args.join(' '));
		}
	});
	this.omx_process.on('error', () => {
		this.emit_error('failed spawning omxplayer');
	});
};

omxplayer.prototype.write_stdin = function(value) {
	if (this.omx_process) {
		this.omx_process.stdin.write(value);
	} else {
		this.emit_error('player not running');
	}
};

omxplayer.prototype.reload = function(args) {
	if (this.omx_process) {
		this.omx_process.removeAllListeners('close');
		this.omx_process.on('close', () => this.spawn_omx(args));
		this.write_stdin('q');
	} else {
		this.spawn_omx(args);
	}
};

var add_omxplayer_control = (name, key) => {
	omxplayer.prototype[name] = function() {
		this.write_stdin(key);
	}
};

var controls = {
	'play' : 'p', 
	'pause' : 'p', 
	'volUp' : '+', 
	'volDown' : '-', 
	'fastFwd' : '>', 
	'rewind' : '<', 
	'fwd30' : '\u001b[C', 
	'back30' : '\u001b[D', 
	'fwd600' : '\u001b[A', 
	'back600' : '\u001b[B', 
	'quit' : 'q', 
	'subtitles' : 's', 
	'info' : 'z', 
	'incSpeed' : '1', 
	'decSpeed' : '2', 
	'prevChapter' : 'i', 
	'nextChapter' : 'o', 
	'prevAudio' : 'j', 
	'nextAudio' : 'k', 
	'prevSubtitle' : 'n', 
	'nextSubtitle' : 'm', 
	'decSubDelay' : 'd', 
	'incSubDelay' : 'f', 
}

for (var i in controls)
{
	add_omxplayer_control(i, controls[i]);
}

util.inherits(omxplayer, EventEmitter);

module.exports = omxplayer;
