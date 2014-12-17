define(["exports", "Globals", "modules/slider/slider", "modules/purchase/view", "jQuery.tinyPubSub"], function(exports, Globals, Slider, View, TinyPubSub) {

    var Purchase = (function Purchase() {

        var _wasInitialized = false,
        
        _view = null,

        _init = function _init(el) {

            //console.log('Purchase init');

            _view = new View();
            _view.init(el);
            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Purchase');

        },

        _eradicate = function _eradicate() {
            
            if (_wasInitialized){
                _view.eradicate();
                _wasInitialized = false;
                _garbage();
            }

        },

        _garbage = function _garbage() {
            _view = null;
        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();

    exports.Module = Purchase;

});
