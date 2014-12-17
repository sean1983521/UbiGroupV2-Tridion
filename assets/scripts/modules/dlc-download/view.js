define(["Globals", "modules/slider/slider"], function(Globals, Slider) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var View = function View(){

        var _cache = {
            'root': null,
            'items': null,
            'sliderWrap': null,
        },

        _slider = new Slider(),

        _init = function _init(el){

            _setupCache(el);
            _setupSlider();

        },

        _setupCache = function _setupCache(el) {

            _cache.root = el;
            _cache.items = _cache.root.find('.download-item');
            _cache.sliderWrap = _cache.root.find('.slider-wrap');
        },

        _setupSlider = function _setupSlider() {

            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    preventDefault: true
                }
            });

        },

        _eradicate = function _eradicate() {

            _slider.eradicate();
            _garbage();

        },

        _garbage = function _garbage() {

            _slider = null;

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        return {
            eradicate : _eradicate,
            init      : _init
        }
    };

    return View;
});
