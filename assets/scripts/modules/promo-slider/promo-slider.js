define(["exports", "Globals", "modules/slider/slider", "jQuery.tinyPubSub"], function(exports, Globals, Slider, TinyPubSub) {

        var CONSTANTS = Globals.Settings.CONSTANTS;

    var PromoSlider = (function PromoSlider() {

        var _cache = {
            'infoWrap'   : null,
            'sliderWrap' : null
        },

        _slider = null,

        _wasInitialized = false,

        _init = function _init(el) {

            //console.log('Featured Promo init ');

            _setupCache(el);
            _setupSlider();
            _attachEvents();
            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(CONSTANTS.EVENT_MODULE_INIT, 'PromoSlider');

        },

        _setupCache = function _setupCache(el) {

            _cache.infoWrap = el;
            _cache.sliderWrap  =_cache.infoWrap.find('.slider-wrap');
            _cache.items = _cache.infoWrap.find('.module-item');

        },

        _setupSlider = function _setupSlider() {

            _slider = new Slider();

            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    maxVisibleItems : _cache.sliderWrap.data('visibleItems') || 1,
                    preventDefault  : true
                }
            });

        },

        _attachEvents = function _attachEvents() {

            if (_cache.sliderWrap.hasClass('anchor-links') ) {
                if (window.navigator.userAgent.indexOf('MSIE 10') != -1 && Globals.Helpers.isTouchDevice()){
                    _cache.infoWrap.on('dblclick', '.module-item', _onItemClick);
                } else {
                    _cache.infoWrap.on('click', '.module-item', _onItemClick);
                }
            }

        },

        _removeEvents = function _removeEvents() {

            if (_cache.sliderWrap.hasClass('anchor-links') ) {
                if (window.navigator.userAgent.indexOf('MSIE 10') != -1 && Globals.Helpers.isTouchDevice()){
                    _cache.infoWrap.off('dblclick');
                } else {
                    _cache.infoWrap.off('click');
                }
            }

        },

        _onItemClick = function _onItemClick(e) {

            e.preventDefault();

            var item = $(e.currentTarget),
                title = item.data('title'),
                target = $('.current-game .info-wrap[data-title="' +  title +'"]'),
                duration;

            if ( target ) {

                duration = (target.offset().top - item.offset().top) * 0.5 + 300;

                $('html, body').animate({
                    'scrollTop': target.offset().top - CONSTANTS.HEADER_HEIGHT - 10
                }, duration, CONSTANTS.EASE);

            }

        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {

                _removeEvents();
                _slider.eradicate();
                _wasInitialized = false;
                _garbage();

            }

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            _slider = null;

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();

    exports.Module = PromoSlider;

});
