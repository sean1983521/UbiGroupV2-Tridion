define(["exports", "Globals", "jQuery.tinyPubSub"], function(exports, Globals, TinyPubSub) {

 var AnnouncementScreen = (function LoadingScreen() {

        var _cache = {
            'announcementScreen'    : null,
            'ubibar'                : null,
            'close'                 : null,
            'globalNav'             : null
        },

        _config = {
            'cssTransitions'   : Modernizr.csstransitions,
            'cssAnimations'    : Modernizr.cssanimations,
            'isLoaded'         : false,
            'isDeepLinked'     : false
        },

        _init = function _init() {

            //console.log('Announcement Screen init');
            Globals.Helpers.freezeBody();
            Globals.Helpers.cache.body.css('position', 'fixed');
            _setupCache();
            _addEvents();
            Globals.ImageLazyLoader.initModuleLazyImages(_cache.announcementScreen);

            $('#heroCarousel').removeClass('loading'); //prevent flash of content mainly in safari.

        },

        _setupCache = function _setupCache() {

            _cache.announcementScreen = $('#announcementScreen');
            _cache.ubibar = _cache.announcementScreen.find('.ubibar');
            _cache.close = _cache.announcementScreen.find('.announcement-close');
            _cache.globalNav = Globals.Helpers.cache.header.find('.global-nav');
            _cache.close.removeClass('hidden');

        },

        _addEvents = function _addEvents() {

            $.subscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT, _checkLoadStatus);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_DEEP_LINK, _checkLoadStatus);

        },

        _handleClose = function _handleClose(e) {
            e.preventDefault();

            if (_config.cssTransitions) {
                _cache.announcementScreen.css('transform', 'translate(0,-100%)');
                _loadAnimationFinished();
            } else {
                _cache.announcementScreen.animate({
                    'top': '-100%'
                }, 500, function() {
                    _loadAnimationFinished();
                });
            }

            Globals.Helpers.unfreezeBody();
            Globals.Helpers.cache.body.css('position', 'static');
        },

        _checkLoadStatus = function _checkLoadStatus(e, isLoaded, isDeepLinked) {

            if(isLoaded) {
                _config.isLoaded = isLoaded;
            }

            if (isDeepLinked) {
                _config.isDeepLinked = isDeepLinked;
            }

            if (_config.isLoaded && _config.isDeepLinked) {
                _cache.close.removeClass('loading');
                _cache.announcementScreen.on('click', '.announcement-close', _handleClose);
            }

        },

        _loadAnimationFinished = function _loadAnimationFinished() {

            // Intro animations should be listening for this event in order to start
            setTimeout(function() {
                $.publish(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, 'announcement-screen::_loadAnimationFinished');
                _eradicate();
            }, 700);

        },

        _eradicate = function _eradicate() {

            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT);
            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_DEEP_LINK);

            _cache.announcementScreen.off('click');

            // This is a ridiculous hack for IE10...don't ask questions you don't want answers to.
            setTimeout(function() {
                _garbage();
            }, 2000);

        },

        _garbage = function _garbage() {

            _cache.announcementScreen.remove();

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

    exports.AnnouncementScreen = AnnouncementScreen;

});
