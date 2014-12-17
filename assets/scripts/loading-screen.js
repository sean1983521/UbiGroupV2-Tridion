define(["exports", "Globals", "jQuery.tinyPubSub"], function(exports, Globals, TinyPubSub) {

    var LoadingScreen = (function LoadingScreen() {

        var _cache = {
            'loadingScreen' : null,
            'loader'    : null,
            'globalNav'     : null
        },

        _config = {
            'cssTransitions'   : Modernizr.csstransitions,
            'cssAnimations'    : Modernizr.cssanimations,
            'isLoaded'         : false,
            'isDeepLinked'     : false,
            'isBarAniFinished' : false
        },

        _init = function _init() {

            //console.log('Loading Screen init');
            _setupCache();
            _addEvents();
            _trackHeroImageLoading();
            _animateBar();

            $('#heroCarousel').removeClass('loading'); //prevent flash of content mainly in safari.

        },

        _setupCache = function _setupCache() {

            _cache.loadingScreen = $('#loadingScreen');
            _cache.loader = _cache.loadingScreen.find('.logo');
            _cache.globalNav = Globals.Helpers.cache.header.find('.global-nav');

        },

        _addEvents = function _addEvents() {

            $.subscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT, _checkLoadStatus);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_DEEP_LINK, _checkLoadStatus);
            $.subscribe(Globals.Settings.CONSTANTS.HERO_IMAGE_LOADED, _checkLoadStatus);

            _cache.loadingScreen.on(Globals.Settings.CONSTANTS.EVENT_TRANSITION_END, _loadAnimationFinished);

        },

        _trackHeroImageLoading = function _trackHeroImageLoading() {

            var image = $('<img/>'),
                heroImage = $('.current-game .hero-image');

            image.load(function() {
                heroImage.css('background-image', 'url(' + Globals.ImageLazyLoader.getSourceSize(heroImage) + ')');
                setTimeout(function(){
                    $.publish(Globals.Settings.CONSTANTS.HERO_IMAGE_LOADED, [null, null, true]);
                }, 1500);
            }).attr('src', Globals.ImageLazyLoader.getSourceSize(heroImage));

        },

        _checkLoadStatus = function _checkLoadStatus(e, isLoaded, isDeepLinked, isImageLoaded) {

            if(isLoaded) {
                _config.isLoaded = isLoaded;
            }

            if (isDeepLinked) {
                _config.isDeepLinked = isDeepLinked;
            }

            if (isImageLoaded) {
                _config.isImageLoaded = isImageLoaded;
            }

            if (_config.isLoaded && _config.isDeepLinked && _config.isImageLoaded) {
                _pageReady();
            }

        },

        _pageReady = function _pageReady() {

            if (_config.cssTransitions) {
                _cache.loadingScreen.css('transform', 'translate(0,-100%)');
            } else {
                _cache.loadingScreen.animate({
                    'top': '-100%'
                }, 500, function() {
                    _loadAnimationFinished();
                });
            }

        },

        _animateBar = function _animateBar() {

            if (_config.cssAnimations) {

                _cache.loader.addClass('animate');

            } else {

                _cache.loader.animate({
                    'opacity': 1
                }, 1050 );

            }

        },

        _loadAnimationFinished = function _loadAnimationFinished() {

            // Intro animations should be listening for this event in order to start
            setTimeout(function() {
                $.publish(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, 'loading-screen::_loadAnimationFinished');
                 _eradicate();
            }, 700);

        },

        _eradicate = function _eradicate() {

            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT);
            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_DEEP_LINK);

            _cache.loadingScreen.off(Globals.Settings.CONSTANTS.EVENT_TRANSITION_END);

            // This is a ridiculous hack for IE10...don't ask questions you don't want answers to.
            setTimeout(function() {
                _garbage();
            }, 2000);

        },

        _garbage = function _garbage() {

            _cache.loadingScreen.remove();

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

            _cache = null;
            _config = null;

        };

        // Public pointers
        return {
            init: _init
        };

    })();

    exports.LoadingScreen = LoadingScreen;

});
