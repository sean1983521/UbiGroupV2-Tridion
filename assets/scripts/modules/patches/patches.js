define(["exports", "Globals", "modules/expander/expander", "modules/slider/slider", "jQuery.tinyPubSub"], function(exports, Globals, Expander, Slider, TinyPubSub) {

	var Patches = (function Patches() {

        var _cache = {
            'patchesWrap'         : null,
            'patchesExpanderWrap' : null,
            'patchesExpander'     : null,
            'sliderWrap'          : null,
            'slider'              : null,
            'sliderItems'         : null
        },

        _config = {
        	'isExpanderEnabled'      : null,
            'isSliderEnabled'        : null,
            'expanderItemHeight'     : null,
            'expanderStartingHeight' : null
        },

        _wasInitialized = false,

        _patchesExpander = null,

        _patchesSlider = null,

        _currentSize = null,

        _init = function _init(el) {

            //console.log('Patches init');

            _currentSize = Globals.Helpers.getSize();

            _config.isExpanderEnabled = false;
            _config.isSliderEnabled = false;

            _setupCache(el);
            _expanderOrSlider();

            Globals.ResizeManager.addCallback(_resizePatches);

            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Patches');

        },

        _setupCache = function _setupCache(el) {

            _cache.patchesWrap = el;
            _cache.patchesExpanderWrap = _cache.patchesWrap.find('.expander-wrap');
            _cache.patchesExpander = _cache.patchesExpanderWrap.find('.expander');
            _cache.sliderWrap = _cache.patchesWrap.find('.slider-wrap');
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

            var expanderID = _cache.patchesExpanderWrap.attr('id');

            _cache.slider.addClass('animatable-list');

            _patchesExpander = new Expander();
            _patchesExpander.init({
                wrapEl: expanderID,
                settings: {
                    'visibleWideItems'    : 1,
                    'visibleDesktopItems' : 1,
                    'visibleTabletItems'  : 1,
                    'visibleMobileItems'  : 1,
                    'initVisRows'         : 2
                }

            });

            _config.isExpanderEnabled = true;

        },

        _initSlider = function _initSlider() {

            _patchesSlider = new Slider();
            _patchesSlider.init({
                wrapEl: _cache.sliderWrap,
                settings: {
                    preventDefault: true,
                    withinCurrentGame : false
                }

            });

            _config.isSliderEnabled = true;

        },

        _eradicateExpander = function _eradicateExpander() {

            _patchesExpander.eradicate();
            _config.isExpanderEnabled = false;
            _cache.slider.removeClass('animatable-list');
            _cache.patchesExpander.removeAttr('style');
            _cache.sliderItems.removeAttr('style');
            _patchesExpander = null;

        },

        _eradicateSlider = function _eradicateSlider() {

            _patchesSlider.eradicate();
            _config.isSliderEnabled = false;
            _cache.slider.removeAttr('style');
            _cache.sliderItems.removeAttr('style');
            _patchesSlider = null;

        },

        _resizePatches = function _resizePatches() {

            if (_currentSize !== Globals.Helpers.getSize()) {
                // Update the currentSize
                _currentSize = Globals.Helpers.getSize();
                // Expander or Slider? That is the question.
                _expanderOrSlider();
            }

        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {

                if (_patchesExpander !== null) {
                    _eradicateExpander();
                }

                if (_patchesSlider !== null) {
                    _eradicateSlider();
                }

                Globals.ResizeManager.removeCallback(_resizePatches);
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

            _patchesExpander = null;
            _patchesSlider = null;
            _currentSize = null;

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init: _init
        };

    })();

	exports.Module = Patches;

});
