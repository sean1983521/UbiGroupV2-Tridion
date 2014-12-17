define(["exports", "Globals", "waypoints", "jQuery.tinyPubSub"], function(exports, Globals, waypoint, TinyPubSub) {

    var GameCover = (function GameCover() {

        /*jshint maxstatements:20 */

        var _cache = {
            'heroCarousel'      : null,
            'btns'              : null,
            'heros'             : null,
            'circles'           : null,
            'moreBars'          : null,
            'currentHero'       : null,
            'currentMoreBar'    : null
        },

        _config = {
            'windowHeight'   : null,
            'btnHeight'      : null,
            'circleHeight'   : null,
            'moreBarHeight'  : null
        },

        _isPageLoaded = false,

        _init = function _init() {

            //console.log('Game Cover init');

            _setupCache();
            _setupGameCover();
            _removeEvents();
            _addEvents();

            $.subscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, _initialPageLoad);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, _newGameLoaded);

            if (Globals.Helpers.isMobile() || Globals.Helpers.isTablet()) {
                // Mobile/Tablet don't have visual adjustments. Module is initialized, let everyone know it's a party.
                $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT, [true, null, null]);
            }

        },

        _setupCache = function _setupCache() {

            _cache.heroCarousel = $('#heroCarousel');
            _cache.btns = _cache.heroCarousel.find('.hero-arrow');
            _cache.heros = $('.hero-wrap');
            _cache.circles = _cache.heros.find('.circle-wrap');
            _cache.moreBars = _cache.heros.find('.hero-more');
            _cache.currentHero = $('.current-game').find('.module-wrap').first();
            _cache.currentMoreBar = _cache.currentHero.find('.hero-more');

        },

        _setupGameCover = function _setupGameCover() {

            _config.windowHeight = window.innerHeight;

            if (Globals.Helpers.isDesktop() || Globals.Helpers.isWidescreen()) {

                _config.btnHeight = _cache.btns.first().outerHeight();
                //_config.circleHeight = _cache.circles.first().outerHeight();
                _config.circleHeight = 610;
                _config.moreBarHeight = _cache.moreBars.first().outerHeight();

                _visualAdjustments();

            } else {

                _cache.heros.removeAttr('style');
                _cache.btns.removeAttr('style');
                _cache.circles.removeAttr('style');

            }

        },

        _visualAdjustments = function _visualAdjustments() {

            var heroHeight = _config.windowHeight,
                heroVisible = heroHeight + Globals.Settings.CONSTANTS.HEADER_HEIGHT - _config.moreBarHeight,
                btnPosition = (heroVisible / 2) - (_config.btnHeight / 2),
                circlePosition = (heroVisible / 2) - (_config.circleHeight / 2);

            _cache.heros.css('height', heroHeight);
            _cache.btns.css('top', btnPosition);
            _cache.circles.css('top', circlePosition);

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT, [true, null, null]);

        },

        _addEvents = function _addEvents() {

            _cache.currentMoreBar.waypoint(function(direction) {

                if (direction === 'down' && Globals.Helpers.cache.window.scrollTop() !== 0) {
                    _cache.currentMoreBar.addClass('fade');
                } else {
                    _cache.currentMoreBar.removeClass('fade');
                }

            }, {
                offset: '95%'
            });

            _cache.currentMoreBar.on('click', function(e) {

                e.preventDefault();

                _config.windowHeight = _config.windowHeight || window.innerHeight;
                $('html, body').animate(
                    { scrollTop: _config.windowHeight - Globals.Settings.CONSTANTS.HEADER_HEIGHT },
                    500,
                    Globals.Settings.CONSTANTS.EASE
                );

            });

            Globals.ResizeManager.addCallback(_resizeGameCover);

        },

        _removeEvents = function _removeEvents() {

            _cache.currentMoreBar.waypoint('destroy');
            _cache.currentMoreBar.off('click');

            Globals.ResizeManager.removeCallback(_resizeGameCover);
        },

        _initialPageLoad = function _initialPageLoad() {

            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED);

            if (!_isPageLoaded) {
                $.subscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, _initialPageLoad);
            }

            _isPageLoaded = true;

        },

        _newGameLoaded = function _newGameLoaded() {

            _removeEvents();
            _garbage();
            _setupCache();
            _addEvents();

        },

        _resizeGameCover = function _resizeGameCover() {

            _setupGameCover();

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

        };

        // Public pointers
        return {
            init: _init
        };

    })();

    exports.GameCover = GameCover;

});
