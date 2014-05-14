/*
 * LogMe 1.0 (https://github.com/QuatreCentQuatre/logMe/)
 * Let you control the way you want to log.
 *
 * Licence : GLP v2
 *
 * Dependencies :
 * 	- HelpMe (https://github.com/QuatreCentQuatre/helpMe/)
 *
 * Methods :
 *  - Constructor :
 *  	- __construct : inital method
 *  	- __dependencies : check any depency support and send some errors
 *
 * 	- Public :
 * 		- setOptions(object) : pass new options
 * 		- getOptions : receive the current options
 * 		- enable : activate logs
 * 		- disable : disable logs
 * 		- toggleDebugger(boolean) : will toggle debugger
 * 		- fixConsole : will force a redraw of the methods (will be called after setOptions)
 *
 * 	- Private :
 *		-
 *		-
 *
 * Updates Needed :
 *  - need to extend base console method so I append them again when we change back type to normal logs without refresh.
 *  - add method to send to a remote server if its not businessIP and remote is on.
 *
 * */
(function($, window, document, undefined){
	var LogMe = function(options){
		this.__construct(options);
	};
	var proto = LogMe.prototype;

	/* -------- DEFAULTS OPTIONS ------- */
	proto.__name     = "LogMe";
	proto.__version  = 1.0;

	proto.__defaults = {
		active: true,
		mobile: false,
		remote: false,
		businessIP: "66.130.40.67" //Get your ip on http://www.whatismyip.com/
	};

	/* --------- PUBLIC METHODS -------- */
	proto.__construct = function(options) {
		if (!this.__dependencies()) {
			return this;
		}

		/* set constructor options */
		this.options = Me.help.extend({}, this.__defaults);

		this.loggingParams = {
			logs: [], // logs will be keep here before sent
			delay: 1000, // delay before logs will be sent
			timeout: null // timeout initiated for logs
		};

		this.mainConsole = {};

		this.commons_methods = ['log', 'info', 'warn', 'error'];
		this.all_methods     = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace'];

		this.rows_count    = 0;
		this.logger_height = 0;

		this.setOptions(options);

		/* Verify is our Buisness IP the same as the current IP */
		if(this.options.active) {
			privateMethods.checkIP.call(this);
		}

		return this;
	};

	proto.__dependencies = function() {
		var isOk = true;

		if (!Me.help) {
			console.warn(proto.__name + " :: " + "required helpMe (https://github.com/QuatreCentQuatre/helpMe)");
			isOk = false;
		}

		return isOk;
	};

	proto.setOptions = function(options) {
		if (!this.__dependencies()) {
			return this;
		}
		this.options = Me.help.extend(this.options, options);
		this.fixConsole();
		return this;
	};

	proto.getOptions = function() {
		if (!this.__dependencies()) {
			return this;
		}
		return this.options;
	};

	proto.enable = function() {
		if (!this.__dependencies()) {
			return this;
		}
		this.options.active = true;
		this.toggleDebugger(true);
		this.fixConsole();
		return this;
	};

	proto.disable = function() {
		if (!this.__dependencies()) {
			return this;
		}
		this.options.active = false;
		this.toggleDebugger(false);
		this.fixConsole();
		return this;
	};

	proto.toggleDebugger = function(bool) {
		if (!this.__dependencies()) {
			return this;
		}
		var $logger = privateMethods.getLogger.call(this);
		if ($logger.length > 0) {
			var display = (bool) ? '' : 'none';
			$logger.css({display:display});
		}
		return this;
	};

	proto.fixConsole = function() {
		if (!this.__dependencies()) {
			return this;
		}
		var noop    = function(){};
		var console = (window.console = window.console || {});
		var method;

		/* get all real console methods */
		var allMethodsArray = this.all_methods.concat(this.commons_methods);
		var total = allMethodsArray.length - 1;
		while (total >= 0) {
			method = allMethodsArray[total];
			if (typeof console[method] !== "function") {
				this.mainConsole[method] = console[method];
			}
			total --;
		}

		total = this.all_methods.length - 1;
		while (total >= 0) {
			method = this.all_methods[total];
			if (!this.options.active) {
				console[method] = noop;
			} else if (typeof console[method] !== "function") {
				console[method] = Me.help.proxy(privateMethods.mobileLog, this);
			}
			total --;
		}

		total = this.commons_methods.length;
		while (total >= 0) {
			method = this.commons_methods[total];
			if (!this.options.active) {
				console[method] = noop;
			} else if (this.options.remote) {
				console[method] = Me.help.proxy(privateMethods.remoteLog, this);
			} else if (this.options.mobile) {
				console[method] = Me.help.proxy(privateMethods.mobileLog, this);
			}  else if (typeof console[method] !== "function") {
				console[method] = Me.help.proxy(privateMethods.mobileLog, this);
			} else {
				console[method] = this.mainConsole[method];
			}
			total --;
		}
		return this;
	};

	proto.toString = function() {
		return this.__name;
	};

	var privateMethods = {
		getLogger: function() {
			var $logger = $('#log-me');
			if($logger.length == 0) {
				var DOM = '' +
					'<div id="log-me" class="box-sizing">' +
					'<div class="log-me-header box-sizing">' +
					'Logs' +
					'<a class="log-me-btn log-me-close" href="#"><i class="fa fa-times"></i></a>' +
					'<a class="log-me-btn log-me-full" href="#"><i class="fa fa-expand"></i></a>' +
					'<a class="log-me-btn log-me-collapse hide" href="#"><i class="fa fa-compress"></i></a>' +
					'<a class="log-me-btn log-me-hide" href="#"><i class="fa fa-minus"></i></a>' +
					'<a class="log-me-btn log-me-show hide" href="#"><i class="fa fa-plus"></i></a>' +
					'<a class="log-me-btn log-me-drag" href="#"><i class="fa fa-arrows"></i></a>' +
					'</div>' +
					'<div class="log-me-ctn box-sizing"></div>' +
					'</div>';

				var CSS = '' +
					'<style id="log-me-styles" type="text/css">' +
					'#log-me {position:fixed; top:0; left:0; background-color:black; color:white; width:160px; z-index:99999; border:1px solid white; font-family:"arial"; letter-spacing: -1px;} ' +
					'#log-me > .box-sizing {-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;} ' +
					'#log-me > .log-me-header {position:absolute; background-color:black; line-height:28px; font-size:14px; padding:0 5px; width:100%; clear:both;}' +
					'#log-me > .log-me-header .log-me-btn {margin-top:7px; margin-left:3px; display:"block"; float:right; height:14px; width:14px; font-size:10px; line-height: 14px; color:#ffffff; text-align:center; background-color:grey;}' +
					'#log-me > .log-me-header .log-me-btn.hide {display:none;}' +
					'#log-me > .log-me-ctn {font-size:12px; line-height:14px; max-height:240px; overflow:auto; -webkit-overflow-scrolling:touch; width:100%; padding-top:28px;}' +
					'#log-me > .log-me-ctn .log-me-row {padding:5px;}' +
					'#log-me > .log-me-ctn .log-me-row:nth-child(even) {background-color:#1e1e1e;}' +
					'#log-me > .log-me-ctn .log-me-row:nth-child(odd) {background-color:#313131;}' +
					'#log-me > .log-me-ctn .log-me-row .log-me-row-clear {clear:both;}' +
					'#log-me > .log-me-ctn .log-me-row .log-me-row-int {float:left;}' +
					'#log-me > .log-me-ctn .log-me-row .log-me-row-output {word-wrap:break-word;}' +
					'</style>';

				$('body').prepend(DOM);
				$('head').append(CSS);
				$('head').append('<link href="http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet" />');

				$logger = $('#log-me');
			}
			privateMethods.addLoggerEvent.call(this, $logger);
			return $logger;
		},
		addLoggerEvent: function($logger) {
			var scope = this;
			$logger.on('click', '.log-me-btn.log-me-hide', function(e){
				$logger.find('.log-me-ctn').css({display:'none'});
				$logger.find('.log-me-btn.log-me-hide').addClass('hide');
				$logger.find('.log-me-btn.log-me-show').removeClass('hide');
			});
			$logger.on('click', '.log-me-btn.log-me-show', function(e){
				$logger.find('.log-me-ctn').css({display:''});
				$logger.find('.log-me-btn.log-me-hide').removeClass('hide');
				$logger.find('.log-me-btn.log-me-show').addClass('hide');
			});
			$logger.on('click', '.log-me-btn.log-me-close', function(e){
				scope.disableLog();
			});
			$logger.on('click', '.log-me-btn.log-me-full', function(e){
				$logger.css({width:'100%', height:'100%'});
				$logger.find('.log-me-ctn').css({display:'', maxHeight:'100%'});
				$logger.find('.log-me-btn.log-me-full').addClass('hide');
				$logger.find('.log-me-btn.log-me-collapse').removeClass('hide');
				$logger.find('.log-me-btn.log-me-hide').addClass('hide');
				$logger.find('.log-me-btn.log-me-show').addClass('hide');
			});
			$logger.on('click', '.log-me-btn.log-me-collapse', function(e){
				$logger.css({width:'', height:''});
				$logger.find('.log-me-ctn').css({maxHeight:''});
				$logger.find('.log-me-btn.log-me-full').removeClass('hide');
				$logger.find('.log-me-btn.log-me-collapse').addClass('hide');
				$logger.find('.log-me-btn.log-me-hide').removeClass('hide');
			});
		},
		mobileLog: function(log) {
			var formated_log = log;
			if (typeof formated_log === "object") {
				formated_log = JSON.stringify(formated_log);
			}
			logArray.push(formated_log);
			if(logTimeout){clearTimeout(logTimeout);}
			logTimeout = setTimeout(Me.help.proxy(privateMethods.mobileSend, this), logDelay);
		},
		mobileSend: function() {
			var scope = this;
			var logsRequest = logArray;
			logArray = [];
			var $logger = privateMethods.getLogger.call(this);
			var html = "";
			$.each(logsRequest, function(index, log){
				html += privateMethods.mobileAdd.call(scope, log);
			});

			var $logger_log_ctn = $logger.find('.log-me-ctn');
			$logger_log_ctn.append(html);
			if (this.debug_height > 288) {
				if($logger_log_ctn.scrollTop() == this.debug_height - 288 || $logger_log_ctn.scrollTop() == 0) {
					$logger_log_ctn.scrollTop($logger_log_ctn[0].scrollHeight);
				}
			}
			this.debug_height = $logger_log_ctn[0].scrollHeight;
		},
		mobileAdd: function(log) {
			this.debug_count ++;
			var html = "";
			html += "<div class='log-me-row'><div class='log-me-row-int'>" + this.debug_count + " :&nbsp;</div><div class='log-me-row-output'>";
			html += log;
			html += "</div><div class='log-me-row-clear'></div></div>";
			return html;
		},
		remoteLog: function(log) {
			var formated_log = log;
			if (typeof formated_log === "object") {
				formated_log = JSON.stringify(formated_log);
			}
			logArray.push(formated_log);
			if(logTimeout){clearTimeout(logTimeout);}
			logTimeout = setTimeout(Me.help.proxy(privateMethods.remoteSend, this), logDelay);

		},
		checkIP: function() { // 4do add new support : http://l2.io/ip
			return this;
			var view = this;
			view.myIP = "66.130.40.67";
			$.ajax({
				method:'GET',
				url: 'http://ipinfo.io/json',
				type: 'json',
				success: function(data) {
					view.myIP = data.ip;
					privateMethods.isRemote.call(view);
				},
				error: function() {

				}
			});
		},
		remoteSend: function() {
			var logsRequest = logArray;
			logArray = [];
			var view = this;
			$.ajax({
				method:'POST',
				url: '/',
				data: {user:view.myIP, logs:logsRequest},
				type: 'json',
				dataType: 'json',
				success: function(data){
				}
			});
		},
		isRemote: function() {
			if (this.myIP != myIP) {
				this.setOptions({remote:true});
			}
		}
	};

	if(!window.Me) {
		window.Me = {};
	}

	Me.log = new LogMe();
}(jQuery, window, document));