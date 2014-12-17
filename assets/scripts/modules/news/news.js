define(["exports", "Globals", "modules/expander/expander", "modules/slider/slider", "jQuery.tinyPubSub"], function(exports, Globals, Expander, Slider, TinyPubSub) {

	var News = (function News() {

        var _cache = {
            'newsWrap'         : null,
            'newsExpanderWrap' : null,
            'newsExpander'     : null,
            'sliderWrap'       : null,
            'slider'           : null,
            'sliderItems'      : null
        },

        _config = {
        	'isExpanderEnabled'      : null,
            'isSliderEnabled'        : null,
            'expanderItemHeight'     : null,
            'expanderStartingHeight' : null
        },

        _wasInitialized = false,

        _newsExpander = null,

        _newsSlider = null,

        _currentSize = null,

        _init = function _init(el) {

            //console.log('News init');

            _currentSize = Globals.Helpers.getSize(),

            _config.isExpanderEnabled = false;
            _config.isSliderEnabled = false;

            _setupCache(el);
            _expanderOrSlider();

            Globals.ResizeManager.addCallback(_resizeNews);

            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'News');

        },

        _setupCache = function _setupCache(el) {

            _cache.newsWrap = el;
            _cache.newsExpanderWrap = _cache.newsWrap.find('.expander-wrap');
            _cache.newsExpander = _cache.newsExpanderWrap.find('.expander');
            _cache.sliderWrap = _cache.newsWrap.find('.slider-wrap');
            _cache.slider = _cache.sliderWrap.find('> .slider');
            _cache.sliderItems = _cache.slider.find('> li');

        },

        _expanderOrSlider = function _expanderOrSlider() {

            if (Globals.Helpers.isMobile() && !_config.isExpanderEnabled) {

                if (_config.isSliderEnabled) {
                    _eradicateSlider();
                }

                _initExpander();

            } else if (!_config.isSliderEnabled) {

                if (_config.isExpanderEnabled) {
                    _eradicateExpander();
                }

                _initSlider();

            }

        },

        _initExpander = function _initExpander() {

            var expanderID = _cache.newsExpanderWrap.attr('id');

            _cache.slider.addClass('animatable-list');

            _newsExpander = new Expander();
            _newsExpander.init({
                wrapEl: expanderID,
                settings: {
                    'visibleWideItems'    : 1,
                    'visibleDesktopItems' : 1,
                    'visibleTabletItems'  : 1,
                    'visibleMobileItems'  : 1,
                    'initVisRows'         : 3
                }
            });

            _config.isExpanderEnabled = true;

        },

        _initSlider = function _initSlider() {

            _newsSlider = new Slider();
            _newsSlider.init({

                wrapEl: _cache.sliderWrap,
                settings: {
                    preventDefault: true
                }

            });

            _config.isSliderEnabled = true;

        },

        _eradicateExpander = function _eradicateExpander() {

            _newsExpander.eradicate();
            _config.isExpanderEnabled = false;
            _cache.slider.removeClass('animatable-list');
            _cache.newsExpander.removeAttr('style');
            _cache.sliderItems.removeAttr('style');
            _newsExpander = null;

        },

        _eradicateSlider = function _eradicateSlider() {

            _newsSlider.eradicate();
            _config.isSliderEnabled = false;
            _cache.slider.removeAttr('style');
            _cache.sliderItems.removeAttr('style');
            _newsSlider = null;

        },

        _resizeNews = function _resizeNews() {

            if (_currentSize !== Globals.Helpers.getSize()) {
                // Update the currentSize
                _currentSize = Globals.Helpers.getSize();
                // Expander or Slider? That is the question.
                _expanderOrSlider();
            }

        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {

                if (_newsExpander !== null) {
                    _eradicateExpander();
                }

                if (_newsSlider !== null) {
                    _eradicateSlider();
                }

                Globals.ResizeManager.removeCallback(_resizeNews);
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

            _newsExpander = null;
            _newsSlider = null;
            _currentSize = null;

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();

	exports.Module = News;

});
