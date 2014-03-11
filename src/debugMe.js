/*
 * DebugMe
 * Log the way you need it
 * 4do need to find how to extend base console method so I append them again when we change type.
 * 4do add method to profile logs on an external server if not our ip and profiling is on.
 * */
(function($, window, document, undefined){
	var DebugMe = function(options){
		this.__construct(options);
	};

	var proto = DebugMe.prototype;

	var defaults = {
		debug: false,
		log: true,
		mobile: false,
		profiling: false
	};

	var error = false;

	//--------Methods--------//
	proto.__construct = function(options) {
		if (!Me.help) {
			console.warn("infiniteMe :: required helpMe", "https://github.com/QuatreCentQuatre/helpMe");
			error = true;
		}

		if (error) {
			return this;
		}

		this.debug_count     = 0;
		this.debug_height    = 0;
		this.console_methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace'];
		this.debug_methods   = ['log', 'info', 'warn', 'error'];

		this.options = Me.help.extend({}, defaults);
		this.setOptions(options);

		return this;
	};

	proto.getIP = function() {
		$.get('http://ifconfig.me/all.json', function(){
			console.log(arguments);
		});
	};

	proto.disableLog = function() {
		this.options = Me.help.extend(this.options, {log:false});
		this.fixConsole();

		return this;
	};

	proto.enableLog = function() {
		this.options = Me.help.extend(this.options, {log:true});
		this.fixConsole();

		return this;
	};

	proto.setOptions = function(options) {
		this.options = Me.help.extend(this.options, options);
		this.fixConsole();

		return this;
	};

	proto.fixConsole = function() {
		var noop = function(){};
		var console = (window.console = window.console || {});
		var method;

		var methods_length = this.console_methods.length;
		while (methods_length--) {
			method = this.console_methods[methods_length];

			if (!this.options.log) {
				console[method] = noop;
			} else if (typeof console[method] !== "function") {
				console[method] = Me.help.proxy(this.mobileDebug, this);
			}
		}

		methods_length = this.debug_methods.length;
		while (methods_length--) {
			method = this.debug_methods[methods_length];

			if (!this.options.log) {
				console[method] = noop;
			} else if (this.options.mobile) {
				console[method] = Me.help.proxy(this.mobileDebug, this);
			} else if (this.options.profiling) {
				console[method] = Me.help.proxy(this.serverDebug, this);
			} else if (typeof console[method] !== "function") {
				console[method] = Me.help.proxy(this.mobileDebug, this);
			}
		}
	};

	proto.mobileDebug = function(debugMessage) {
		var $debugger = privateMethods.getDebugger.call(this);
		this.debug_count ++;

		var rowHtml = ""+
			"<div class='row'>" +
			"<div class='debug-int'>" + this.debug_count + " :&nbsp;</div>" +
			"<div class='debug-output'>" + debugMessage + "</div>" +
			"<div class='clear'></div>" +
			"</div>";

		$debugger.find('.logs').append(rowHtml);

		if (this.debug_height > 288) {
			if($debugger.find('.logs').scrollTop() == this.debug_height - 288 || $debugger.find('.logs').scrollTop() == 0) {
				$debugger.find('.logs').scrollTop($debugger.find('.logs')[0].scrollHeight);
			}
		}
		this.debug_height = $debugger.find('.logs')[0].scrollHeight;
	};

	proto.serverDebug = function(debugMessage) {
		// send to a phpfile a ajax request to send on a logging server to remote log clients.
	};

	var privateMethods = {
		getDebugger: function() {
			var $debugger = $('#debugme');
			if($debugger.length == 0) {
				var DOM = '' +
					'<div id="debugme">' +
					'<div class="log-header">' +
					'Debug console' +
					'<a class="btn collapse" href="#">^</a>' +
					'<a class="btn full" href="#">+</a>' +
					'<a class="btn close" href="#">X</a>' +
					'</div>' +
					'<div class="logs"></div>' +
					'</div>';

				var CSS = '' +
					'<style id="debugme-styles" type="text/css">' +
					'#debugme {position:fixed; top:0; left:0; background-color:black; color:white; width:160px; z-index:99999; border:1px solid white; font-family:"arial"; letter-spacing: -1px;} ' +
					'#debugme > .log-header {position:relative; background-color:black; line-height:28px; font-size:14px; padding:0 5px}' +
					'#debugme > .log-header .btn {position:absolute; top:50%; margin-top:-7px; right:5px; display:"block"; height:14px; width:14px; font-size:10px; line-height: 14px; color:#ffffff; text-align:center; background-color:grey;}' +
					'#debugme > .log-header .btn.full {right:20px;}' +
					'#debugme > .log-header .btn.collapse {right:35px;}' +
					'#debugme > .logs {font-size:12px; line-height:14px; max-height:240px; overflow:auto;}' +
					'#debugme > .logs .row {padding:5px;}' +
					'#debugme > .logs .row:nth-child(even) {background-color:#1e1e1e;}' +
					'#debugme > .logs .row:nth-child(odd) {background-color:#313131;}' +
					'#debugme > .logs .row .clear {clear:both;}' +
					'#debugme > .logs .row .debug-int {float:left;}' +
					'#debugme > .logs .row .debug-output {word-wrap:break-word;}' +
					'</style>';

				$('body').prepend(DOM);
				$('head').append(CSS);

				$debugger = $('#debugme');
			}
			return $debugger;
		}
	};

	if(!window.Me) {
		window.Me = {};
	}

	if (!window._) {
		window._ = Me;
	}

	Me.debug = new DebugMe();
}(jQuery, window, document));