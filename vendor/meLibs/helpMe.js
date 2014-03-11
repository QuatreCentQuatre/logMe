/*
 * HelpMe
 * Utils function
 * */
(function($, window, document, undefined){
	var HelpMe = function(){
		this.__construct();
	};

	var array = [];

	var proto = HelpMe.prototype;

	//--------Methods--------//
	proto.__construct = function() {
	};

	proto.extend = function(source, overwrites, keep_source, deep) {
		var result     = source;
		var args       = arguments;
		var finalArgs  = [];
		var keepSource = false;

		if (!overwrites) {
			return result;
		}

		if (typeof keep_source == "boolean") {
			keepSource = true;
			if(args) {
				delete args[2];
			}
		}

		if (args) {
			delete args[0];
			for(var i in args) {
				if(typeof args[i] == "object") {
					finalArgs.push(args[i]);
				}
			}
		}
		args = finalArgs;

		for (var i in args) {
			for (var index in args[i]) {
				if (typeof result[index] != "undefined" && keepSource) { continue; }
				result[index] = args[i][index];
			}
		}

		return result;
	};

	proto.proxy = function(method, scope) {
		var proxy;
		var proxyArgs = arguments;
		var finalArgs = [];
		if (proxyArgs) {
			var totalArgs = proxyArgs.length;
			for (var i = 0; i < totalArgs; i++) {
				if (i < 2) { continue; }
				finalArgs.push(proxyArgs[i]);
			}
		}
		proxyArgs = finalArgs;

		proxy = function() {
			var args      = arguments;
			var finalArgs = [];
			if (args) {
				var totalArgs = args.length;
				for (var i = 0; i < totalArgs; i++) {
					finalArgs.push(args[i]);
				}
			}
			args = finalArgs.concat(proxyArgs);
			return method.apply(scope, args);
		};

		return proxy;
	};


	if(!window.Me) {
		window.Me = {};
	}
	Me.help = new HelpMe();
	if (!window._) {
		window._ = Me.help;
	}
}(jQuery, window, document));