define(["Globals"], function(Globals) {

	var Panel = function Panel(element, index){

		//
		var isOpen = false,
			isInitialized = false,
			module = null,
			className = "opened";

		//Add UI events, e.g. click
		var addEvents = function addEvents(){
			$("a.action", element).on("click", toggle);
		};

		//Track if the panel is opened/closed
		var toggle = function toggle(){
			if (isOpen){
				close();
			}
			else{
				open();
			}
		};

		var fetchModule = function fetchModule(){
			var panelModule = element.data("functionality");
			require([panelModule], moduleReceived);
		};

		var moduleReceived = function moduleReceived(Module){
			isInitialized = true;
			module = new Module(element.data("target"));
			relayEventToModule();
		};

		var open = function open(){
			isOpen = true;
			element.addClass(className);

			$.publish(Globals.Settings.CONSTANTS.EVENT_CLOSE_OTHER_PANELS, [index]);

			if (isInitialized){
				module.open();
			}
			else{
				fetchModule();
			}
		};

		var close = function close(){
			isOpen = false;
			element.removeClass(className);

			if (isInitialized){
				module.close();
			}
		};

		var relayEventToModule = function relayEventToModule(){
			if (isOpen){
				module.open();
			}
			else{
				module.close();
			}
		};

		var initialize = function initialize(){
			addEvents();
		};

		initialize();

		return {
			toggle: toggle,
			open: open,
			close: close
		}
	};

	return Panel;
});
