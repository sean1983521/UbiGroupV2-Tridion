define(["exports", "Globals", "modules/slider/slider", "jQuery.tinyPubSub"], function(exports, Globals, Slider, TinyPubSub) {

	var Goods = (function Goods() {

        var _cache = {
            'goodsWrap'   : null,
            'sliderWrap'  : null,
            'slider'      : null,
            'sliderItems' : null,
        },

        _config = {
            'isSliderEnabled': false
        },

        _wasInitialized = false,

        _goodsSlider = null,

        _init = function _init(el) {

            //console.log('Goods init');

            _setupCache(el);
			_initSlider();

            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Goods');

        },

        _setupCache = function _setupCache(el) {

            _cache.goodsWrap = el;
            _cache.sliderWrap = _cache.goodsWrap.find('.slider-wrap');
            _cache.slider = _cache.sliderWrap.find('.slider');
            _cache.sliderItems = _cache.slider.find('> li');

        },

        _initSlider = function _initSlider() {

            _goodsSlider = new Slider();
            _goodsSlider.init({

                wrapEl: _cache.sliderWrap,
                settings: {
                    preventDefault: true
                }

            });

            _config.isSliderEnabled = true;

        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {
                _goodsSlider.eradicate();
                _config.isSliderEnabled = false;
                _wasInitialized = false;
                _garbage();
            }

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

            _goodsSlider = null;

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();


	exports.Module = Goods;

});
