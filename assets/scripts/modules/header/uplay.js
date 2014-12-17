define([], function() {

	var Uplay = function Uplay(element) {

		var isOpen = false,

		init = function init() {

			element = $(element);

		},

		open = function open() {

			isOpen = true;

			element.addClass("opened");

			require(['http://middleout.ubi.com/ubi/mini/public/widget/script'], function(widget){
            	window.uplayMiniInit = function() {
    				UplayMiniWidget.init({
     					container: '#uplay-panel',
     					locale: 'fr-FR',
     					layout: 1
    				});
   				};
        	});

			addEvents();

		},

		close = function close() {

			isOpen = false;

			element.removeClass("opened");
			removeEvents();

		},

		addEvents = function addEvents() {
			//console.log("Add Events");
		},

		removeEvents = function removeEvents() {
			//console.log("Remove Events");
		};

		init();

		return {
			open  : open,
			close : close
		};

	};

	return Uplay;


});
