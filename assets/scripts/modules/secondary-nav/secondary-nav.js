define(["waypoints", "exports", "Globals", "jQuery.tinyPubSub"], function(waypoint, exports, Globals, TinyPubSub) {

    var SecondaryNav = (function SecondaryNav() {

        var _cache = {
            'gameNavLinks'      : null,
            'gameExternalSpans' : null,
            'buyNowBtn'         : null,
            'currentGame'       : null,
            'moreBar'           : null,
            'navBtn'            : null,
            'navBtnIcon'        : null,
            'modules'           : null
        },

        _gameNavWrap = Globals.Helpers.cache.gameNav,

        _init = function _init() {

            _setupCache();
            _assignColor();
            _assignEvents();
            _initializeSecondaryNav();

        },

        _setupCache = function _setupCache() {

            _cache.gameNavLinks = _gameNavWrap.find('.waypoint-nav');
            _cache.gameExternalSpans = _gameNavWrap.find('.external span');
            _cache.buyNowBtn = _gameNavWrap.find('.nav-buy-now');
            _cache.currentGame = $('.current-game');
            _cache.moreBar = _cache.currentGame.find('.hero-more');
            _cache.navBtn = $('#detailNavBtn');
            _cache.navBtnIcon = _cache.navBtn.find('span');
            _cache.modules = _cache.currentGame.find('.module-wrap');

        },

        _initializeSecondaryNav = function _initializeSecondaryNav(){
            $('.item-has-children').children('a').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                $(this).toggleClass('submenu-open').next('.sub-menu').slideToggle(200).end().parent('.item-has-children').siblings('.item-has-children').children('a').removeClass('submenu-open').next('.sub-menu').slideUp(200);
            });
        },

        _assignColor = function _assignColor() {

            var bgColor = $('.current-game .hero-more').css('background-color');

            if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {

                setTimeout(function() {
                    _assignColor();
                }, 250);

            } else {
                $('.inner', _cache.navBtn).css('background', bgColor);
                $('.nav-buy-now').css('background', bgColor);
                $('.game-nav .external-links a span').css('border-right', '4px solid ' + bgColor);
                _cache.gameExternalSpans.css('border-right-color', bgColor);
            }

            bgColor = null;

        },

        _assignEvents = function _assignEvents() {

            _cache.navBtn.on(Globals.Helpers.config.touchEvent, function(e) {

                e.preventDefault();
                e.stopPropagation();

                // Tell any of the header panels to close. 400 is an arbitrary number that will never be true.
                $.publish(Globals.Settings.CONSTANTS.EVENT_CLOSE_OTHER_PANELS, [400]);

                if (Globals.Helpers.cache.body.hasClass('nav-open')) {
                    _closeNav();
                } else {
                    _openNav();
                }

            });

            Globals.ResizeManager.addCallback(_resizeSecondaryNav);

            $.subscribe(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, _newGameLoaded);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_CLOSE_DETAIL_NAV, _closeNav);

        },

        _assignNavEvents = function _assignNavEvents() {

            _gameNavWrap.on('click', '.waypoint-nav, .nav-buy-now', function(e) {

                if ($(e.target).attr('href').substring(0, 4) != "http"){
                    e.preventDefault();
                    e.stopPropagation();

                    _scrollToElement($(this));
                }

            });

            _gameNavWrap.on('click', '.game-title', function(e) {

                e.preventDefault();
                e.stopPropagation();

                _scrollToElement();

            });

        },

        _removeNavEvents = function _removeNavEvents() {
            _gameNavWrap.off('click');
            _gameNavWrap.off('mouseenter');
            _gameNavWrap.off('mouseleave');
        },

        _scrollToElement = function _scrollToElement(el) {

            $('html, body').animate({
                scrollTop: el ? $(el.attr('href')).offset().top - Globals.Settings.CONSTANTS.HEADER_HEIGHT : 0
            },
                500,
                Globals.Settings.CONSTANTS.EASE,
                function() {

                    if (Globals.Helpers.cache.body.hasClass('nav-open')) {

                        //pause before closing the nav & updating hash
                        setTimeout(function() {

                            _closeNav();

                            if (el !== undefined) {

                                if (history.pushState) {
                                    history.pushState(null, null, el.attr('href'));
                                } else {
                                    window.location.hash = el.attr('href');
                                }

                            } else {

                                if (history.pushState) {
                                    history.pushState(null, null, '#');
                                } else {
                                    window.location.hash = '#';
                                }

                            }

                        }, 50);

                    } else {
                        _openNav();
                    }

                }
            );

        },

        _openNav = function _openNav() {

            Globals.Helpers.forceLoadModules();
            _assignNavEvents();
            Globals.Helpers.cache.body.addClass('nav-open frozen');
            _cache.navBtnIcon.removeClass('icon-menu').addClass('icon-close');
            Globals.Helpers.cache.body.on('click', _closeNav);

        },

        _closeNav = function _closeNav() {

            Globals.Helpers.cache.body.removeClass('nav-open frozen');
            _cache.navBtnIcon.removeClass('icon-close').addClass('icon-menu');
            Globals.Helpers.cache.body.off('click', _closeNav);
            Globals.Helpers.unfreezeBody();
            _removeNavEvents();

        },

        _newGameLoaded = function _newGameLoaded() {

            var gameNav = $('.current-game').find('.game-nav').clone();

            _garbage();

            _gameNavWrap.empty();
            _gameNavWrap.append(gameNav);

            _setupCache();
            //_assignColor();

            $.publish(Globals.Settings.CONSTANTS.EVENT_NAV_UPDATED);

            gameNav = null;

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

        },

        _resizeSecondaryNav = function _resizeSecondaryNav() {

            if (Globals.Helpers.cache.body.hasClass('nav-open')) {

                _closeNav();
            }

        };

        // Public pointers
        return {
            init        : _init,
            assignColor : _assignColor,
            closeNav    : _closeNav
        };

    })();


    exports.SecondaryNav = SecondaryNav;

});