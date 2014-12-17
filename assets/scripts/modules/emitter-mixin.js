define(function(){
    
    var EmitterMixin = function EmitterMixin(){

        var _callbacks = {},

        _on = function _on(event, fn) {
            (_callbacks[event] = _callbacks[event] || []).push(fn);
            return this;
        },

        _off = function _off(event, fn) {

            // Reset all.
            if (0 == arguments.length) {
                _callbacks = {};
            }

            // specific event
            var callbacks = _callbacks[event],
                i;
            
            if (!callbacks) { return; }

            // remove all handlers
            if (1 == arguments.length) {
                _callbacks[event] = [];
            }

            // remove specific handler
            i = _callbacks.indexOf(fn);
            
            if ( -1 !== i) { _callbacks.splice(i, 1); }
            
            return this;

        },

        _emit = function _emit(event /*, param1, param2... = args */ ) {

            var args = [].slice.call(arguments, 1),
                callbacks = _callbacks[event];

            if (callbacks) {
                callbacks = callbacks.slice(0);
                for (var i = callbacks.length; i--;) {
                    callbacks[i].apply(this, args);
                }
            }
        };

        return {
            on: _on,
            off: _off,
            emit: _emit
        }
    }

    return EmitterMixin;
});
