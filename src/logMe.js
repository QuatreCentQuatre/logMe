/*
 * LogMe
 * Log the way you need it
 * 4do need to find how to extend base console method so I append them again when we change type.
 * 4do add method to profile logs on an external server if not our ip and profiling is on.
 * */
(function($, window, document, undefined){
	var LogMe = function(options){
		this.__construct(options);
	};

	var proto = LogMe.prototype;

	var defaults = {
		active: true,
		mobile: false,
		remote: false
	};

	var myIP = "66.130.40.67"; //http://www.whatismyip.com/
	var remoteArray = [];
	var remoteDelay = 2000;
	var remoteTimeout = null;

	var error = false;

	//--------Methods--------//
	proto.__construct = function(options) {
		if (!Me.help) {
			console.warn("LogMe :: required helpMe", "https://github.com/QuatreCentQuatre/helpMe");
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

		if(this.options.active) {
			//this.getIP();
		}
		return this;
	};

	proto.setOptions = function(options) {
		this.options = Me.help.extend(this.options, options);
		this.fixConsole();
		return this;
	};

	proto.getIP = function() {
		// handle more then 1 site to get IP if one is down. store ip and hash custom for each visitor
		var view = this;
		$.ajax({
			method:'GET',
			url: 'http://ipinfo.io/json',
			type: 'json',
			success: function(data) {
				view.currentIP = data.ip;
				privateMethods.isRemote.call(view);
			},
			error: function() {

			}
		});
		// http://l2.io/ip
	};

	proto.enableLog = function() {
		this.options.active = true;
		this.toggleDebugger(true);
		this.fixConsole();
		return this;
	};

	proto.disableLog = function() {
		this.options.active = false;
		this.toggleDebugger(false);
		this.fixConsole();
		return this;
	};

	proto.toggleDebugger = function(bool) {
		var $logger = privateMethods.getLogger.call(this);
		if ($logger.length > 0) {
			if (!bool) {
				$logger.css({display:'none'}).addClass('disabled');
			} else {
				$logger.css({display:''}).removeClass('disabled');
			}
		}
	};

	proto.fixConsole = function() {
		var noop     = function(){};
		var console  = (window.console = window.console || {});
		var method;

		var methods_length = this.console_methods.length;
		while (methods_length--) {
			method = this.console_methods[methods_length];

			if (!this.options.active) {
				console[method] = noop;
			} else if (typeof console[method] !== "function") {
				console[method] = Me.help.proxy(privateMethods.mobileLog, this);
			}
		}

		methods_length = this.debug_methods.length;
		while (methods_length--) {
			method = this.debug_methods[methods_length];

			if (!this.options.active) {
				console[method] = noop;
			} else if (this.options.remote) {
				console[method] = Me.help.proxy(privateMethods.remoteLog, this);
			} else if (this.options.mobile) {
				console[method] = Me.help.proxy(privateMethods.mobileLog, this);
			}  else if (typeof console[method] !== "function") {
				console[method] = Me.help.proxy(privateMethods.mobileLog, this);
			}
		}
	};

	var privateMethods = {
		getLogger: function() {
			var $logger = $('#log-me');
			if($logger.length == 0) {
				var DOM = '' +
					'<div id="log-me">' +
					'<div class="log-me-header">' +
					'Logs' +
					'<a class="log-me-btn log-me-drag" href="#"><i class="fa fa-arrows"></i></a>' +
					'<a class="log-me-btn log-me-collapse hide" href="#"><i class="fa fa-compress"></i></a>' +
					'<a class="log-me-btn log-me-full" href="#"><i class="fa fa-expand"></i></a>' +
					'<a class="log-me-btn log-me-close" href="#"><i class="fa fa-times"></i></a>' +
					'</div>' +
					'<div class="log-me-ctn"></div>' +
					'</div>';

				var CSS = '' +
					'<style id="log-me-styles" type="text/css">' +
					'#log-me {position:fixed; top:0; left:0; background-color:black; color:white; width:160px; z-index:99999; border:1px solid white; font-family:"arial"; letter-spacing: -1px;} ' +
					'#log-me > .log-me-header {position:relative; background-color:black; line-height:28px; font-size:14px; padding:0 5px}' +
					'#log-me > .log-me-header .log-me-btn {position:absolute; top:50%; margin-top:-7px; right:5px; display:"block"; height:14px; width:14px; font-size:10px; line-height: 14px; color:#ffffff; text-align:center; background-color:grey;}' +
					'#log-me > .log-me-header .log-me-btn i {margin-top:1px;}' +
					'#log-me > .log-me-header .log-me-btn.log-me-full {right:20px;}' +
					'#log-me > .log-me-header .log-me-btn.log-me-collapse {right:20px;}' +
					'#log-me > .log-me-header .log-me-btn.log-me-drag {right:35px;}' +
					'#log-me > .log-me-ctn {font-size:12px; line-height:14px; max-height:240px; overflow:auto;}' +
					'#log-me > .log-me-ctn .log-me-row {padding:5px;}' +
					'#log-me > .log-me-ctn .log-me-row:nth-child(even) {background-color:#1e1e1e;}' +
					'#log-me > .log-me-ctn .log-me-row:nth-child(odd) {background-color:#313131;}' +
					'#log-me > .log-me-ctn .log-me-row .log-me-row-clear {clear:both;}' +
					'#log-me > .log-me-ctn .log-me-row .log-me-row-int {float:left;}' +
					'#log-me > .log-me-ctn .log-me-row .log-me-row-output {word-wrap:break-word;}' +
					'</style>';

				$('body').prepend(DOM);
				// font typo added;
				$('head').append('<link href="http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">');
				$('head').append(CSS);

				$logger = $('#log-me');
			}
			return $logger;
		},
		mobileLog: function(log) {
			var $logger = privateMethods.getLogger.call(this);
			this.debug_count ++;

			var formated_log = log;
			if (typeof message === "object") {
				formated_log = JSON.stringify(formated_log);
			}

			var rowHtml = ""+
				"<div class='log-me-row'>" +
				"<div class='log-me-row-int'>" + this.debug_count + " :&nbsp;</div>" +
				"<div class='log-me-row-output'>" + formated_log + "</div>" +
				"<div class='log-me-row-clear'></div>" +
				"</div>";


			var $logger_log_ctn = $logger.find('.log-me-ctn');
			$logger_log_ctn.append(rowHtml);

			if (this.debug_height > 288) {
				if($logger_log_ctn.scrollTop() == this.debug_height - 288 || $logger_log_ctn.scrollTop() == 0) {
					$logger_log_ctn.scrollTop($logger_log_ctn[0].scrollHeight);
				}
			}
			this.debug_height = $logger_log_ctn[0].scrollHeight;
		},
		remoteLog: function(log) {
			var formated_log = log;
			if (typeof message === "object") {
				formated_log = JSON.stringify(formated_log);
			}
			remoteArray.push(formated_log);
			if(remoteTimeout){clearTimeout(remoteTimeout);}
			remoteTimeout = setTimeout(Me.help.proxy(privateMethods.remoteSend, this), remoteDelay);

		},
		remoteSend: function() {
			var logsRequest = remoteArray;
			remoteArray = [];
			var view = this;
			$.ajax({
				method:'POST',
				url: '/',
				data: {user:view.currentIP, logs:logsRequest},
				type: 'json',
				dataType: 'json',
				success: function(data){
				}
			});
		},
		isRemote: function() {
			if (this.currentIP != myIP) {
				this.setOptions({remote:true});
			}
		}
	};

	if(!window.Me) {
		window.Me = {};
	}

	Me.log = new LogMe();
}(jQuery, window, document));