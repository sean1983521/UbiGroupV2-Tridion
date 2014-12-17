define(["exports", "Globals", "modules/slider/slider", "jQuery.tinyPubSub"], function(exports, Globals, Slider, TinyPubSub) {

	var Downloads = (function Downloads() {

        var _cache = {
            'downloadsWrap' : null,
            'sliderWrap'    : null,
            'slider'        : null,
            'sliderItems'   : null,
        },

        _wasInitialized = false,

        _downloadsSlider = null,

        _init = function _init(el) {

            //console.log('Downloads init');

            _setupCache(el);
			_initSlider();

            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Downloads');

        },

        _setupCache = function _setupCache(el) {

            _cache.downloadsWrap = el;
            _cache.sliderWrap = _cache.downloadsWrap.find('.slider-wrap');
            _cache.slider = _cache.sliderWrap.find('> .slider');
            _cache.sliderItems = _cache.slider.find('> li');

        },

        _initSlider = function _initSlider() {

            _downloadsSlider = new Slider();
            _downloadsSlider.init({

                wrapEl: _cache.sliderWrap,
                settings: {
                    preventDefault  : true,
                    maxVisibleItems : 2
                }

            });

        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {
                _downloadsSlider.eradicate();
                _wasInitialized = false;
                _garbage();
            }

        },

        _garbage = function _garbage() {

            _downloadsSlider = null;

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();


	exports.Module = Downloads;

});
