#logMe 1.0 

Let you control the way you want to log. Useful for debuging on mobile or old browsers.

---

### Dependencies

**HelpMe** (https://github.com/QuatreCentQuatre/helpMe/)

---

### Getting Started

Place the **logMe.js** file in your default JavaScript vendor directory. Link the script before the end of your **body** and after **helpMe.js**.

```
<script src="js/vendor/helpMe.js"></script>
<script src="js/vendor/logMe.js"></script>
```
Here you go ! You're now ready to use logMe. Here most commons method used.

```

//Debugger for mobile.
Me.log.setOptions({mobile:true});

//Disable logMe console
Me.log.disable();
	
//Re-enable logMe console
Me.log.enable();

```

---

### Methods

Here the list of methods of logMe with a small description.

#### Constructor
- __construct : inital method
- __dependencies : check any depency support and send some errors

#### Public
- setOptions(object) : pass new options
- getOptions : receive the current options
- enable : activate logs
- disable : disable logs
- toggleDebugger(boolean) : will toggle debugger
- fixConsole : will force a redraw of the methods (will be called after setOptions)

---

### Future Updates

- Need to extend base console method so I append them again when we change back type to normal logs without refresh.
- Add method to send to a remote server if its not businessIP and remote is on.