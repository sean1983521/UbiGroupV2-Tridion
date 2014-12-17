define(["Globals", "modules/slider/slider", ], function(Globals, Slider) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var ExpandedView = function ExpandedView(el){

        var _cache = {
            'el'     : null,
            'arrows' : null,
            'images' : null
        },

        _config = {
            'containerHeight' : null,
            'active'          : null
        },

        _slider = new Slider(),

        _init = function _init(el) {

            _setupCache(el);

            _config.containerHeight = _cache.root.height();
            _config.active = false;

            // Possible to move this to CSS? Reduce repaints.
            _cache.items.each(function(i, el) {
                $(this).css('transition-delay', i * 10 / 100 +  + 0.03 + 's')
            });

        },

        _setupCache = function _setupCache(el){

            _cache.root = el;
            _cache.arrows = _cache.root.find('.btn-large-arrow');
            _cache.items = _cache.root.find('.module-item');
            _cache.images = _cache.root.find('.module-item-image');
            _cache.sliderWrap = _cache.root.find('.slider-wrap');
        },

        _setupSlider = function _setupSlider(index, isActive) {
            
            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    maxVisibleItems : 4,
                    preventDefault  : true
                }
            });

            _slider.goTo(index);

            if ('undefined' === typeof isActive) {
              _config.active = true;
              _disableScroll();
            } else {
              _config.active = isActive;
            }

        },

        _teardownSlider = function _teardownSlider() {
            _config.active = false;
            _enableScroll();
            _garbage();
        },

        _disableScroll = function _disableScroll() {
            if (window.addEventListener) {
                window.addEventListener('DOMMouseScroll', _onWheel, false);
            }
            window.onmousewheel = document.onmousewheel = _onWheel;
        },

        _enableScroll = function _enableScroll() {
            if (window.removeEventListener) {
                window.removeEventListener('DOMMouseScroll', _onWheel, false);
            }
            window.onmousewheel = document.onmousewheel = null;
        },

        _onWheel = function _onWheel(e) {
            e.preventDefault();
        },

        _isActive = function _isActive() {
            return _config.active;
        },

        _getSlider = function _getSlider() {
            return _slider;
        },

        _eradicate = function _eradicate(){
            _teardownSlider();
            _garbage();
        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

            _slider = null;

        };


        return {
            init: _init,
            setupSlider: _setupSlider,
            isActive: _isActive,
            getSlider: _getSlider,
            teardownSlider: _teardownSlider,
            eradicate: _eradicate
        }

    };

    return ExpandedView;
});
