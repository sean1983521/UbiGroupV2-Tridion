// DO NOT FORGET TO REMOVE "mock-test".
// SERIOUSLY, DO NOT FORGET TO REMOVE IT.
// DOUBLE SERIOUS HERE. REMOVE THAT THING WHEN GOING TO PRODUCTION.
define(["mock-test", "loading-screen", "waypoints", "Globals", "address-manager", "modules/game-to-game-nav", "modules/expander/expander", "modules/secondary-nav/secondary-nav", "modules/cta-anchors/cta-anchors", "modules/modal/modal", "modules/announcement/announcement"], function(mock, LoadingScreen, waypoint, Globals, AddressManager, GameToGameNav, Expander, SecondaryNav, CTAAnchors, Modal, AnnouncementScreen) {

    var main = (function main(){

        var _cache = {
            'currentGame'   : null,
            'modules'       : null,
            'sliders'       : null
        },

        _config = {
            maxInitialCSSLoad : 2,
            waypointOffset    : '150%',
            loadedModsCount   : 0
        },

        _footerExpander = null,
        _timer = null,
        _oldScrollPos = 0,

        _init = function _init() {

            /*jshint maxstatements:20 */

            if ($('#announcementScreen').length > 0){
                AnnouncementScreen.AnnouncementScreen.init();
            } else {
                LoadingScreen.LoadingScreen.init();
            }

            Globals.Helpers.init();
            Globals.Helpers.initializeGlobalHeader();
            Globals.ResizeManager.init();
            Globals.ImageLazyLoader.init();

            (new Modal()).init();

            _addEvents();
            _addScrollEvent();
            _setupPageLoadFunctions();

            AddressManager.AddressManager.init();
            GameToGameNav.GameToGameNav.init();
            SecondaryNav.SecondaryNav.init();

            _footerExpander = new Expander().init({
                wrapEl: 'ourGamesExpander',
                settings: {
                    'visibleWideItems'      : 4,
                    'visibleDesktopItems'   : 3,
                    'visibleTabletItems'    : 2,
                    'visibleMobileItems'    : 1,
                    'initVisRows'           : Globals.Helpers.isMobile() ? 2 : 1
                }
            });

        },

        _setupCache = function _setupCache() {

            var heroModuleWrap;

            _cache.currentGame = $('.current-game');

            heroModuleWrap = _cache.currentGame.find('.hero-module-wrap');

            _cache.modules = heroModuleWrap.siblings('.module-wrap');
            _cache.sliders = _cache.modules.find('.slider');

        },

        _addEvents = function _addEvents() {

            var buttons = $('.circle button');

            buttons.on('click', function(e){
                if ($(e.currentTarget).attr('data-href') !== undefined){
                    window.location = $(e.currentTarget).attr('data-href');
                }
            });

            $.subscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT, _updateModules);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_FIRST_GAME_LOADED, Globals.Helpers.initializeGlobalFooter);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, _updateModules);
        },

        _addScrollEvent = function _addScrollEvent() {

            Globals.Helpers.cache.window.on('scroll', _removeAcceleration);

        },

        _removeScrollEvent = function _removeScrollEvent() {

            Globals.Helpers.cache.window.off('scroll', _removeAcceleration);

        },

        _removeAcceleration = function _removeAcceleration() {

            clearTimeout(_timer);

            _timer = setTimeout(function() {

                var scrollPos = Globals.Helpers.cache.window.scrollTop();

                if (_cache.modules && _cache.modules.length && (scrollPos - _oldScrollPos) > 50) {
                    _cache.modules.removeClass('accelerate');
                    _cache.sliders.removeClass('animate easing');
                }

                _oldScrollPos = scrollPos;

                scrollPos = null;

            }, 750);

        },

        _setupPageLoadFunctions = function _setupPageLoadFunctions() {

            Globals.Helpers.addToPageLoadFunctions(CTAAnchors.CTAAnchors.init);

        },

        _updateModules = function _updateModules() {

            _removeScrollEvent();
            _garbage();
            _setupCache();

            //only set up the modules if we're not deep linked, otherwise the forceLoadModules will
            //take care of it for us
            if (!AddressManager.AddressManager.determineDeepLink()) {
                _setupModules();
            }

            _addScrollEvent();

        },

        _setupModules = function _setupModules() {

            _cache.modules.each(function(i, el) {

                // $(el).waypoint(function(){
                //     _initializeModule($(el));
                // }, {
                //     offset      : _config.waypointOffset,
                //     triggerOnce : true
                // });

                el = $(el);

                if (el.attr('data-module') !== undefined){
                    el.waypoint(function(){
                        _initializeModule(el);
                    }, {
                        offset      : _config.waypointOffset,
                        triggerOnce : true
                    });
                } else {
                    el.waypoint(function(){
                        _initializeNonJSModule(el);
                    }, {
                        offset      : _config.waypointOffset,
                        triggerOnce : true
                    });
                }

            });

        },

        _initializeModule = function _initializeModule(moduleElement) {

            var moduleName = moduleElement.attr('data-module');

            moduleElement.waypoint('destroy');

            if ($('.global-footer').hasClass('init')) {
                $('.global-footer').removeClass('init');
            }

            if (moduleName && moduleElement.hasClass('is-not-initialized')) {

                require([moduleName], function(obj) {
                    var imageSubscription = moduleElement[0].id + 'image';

                    //initialize the modules once we've detected that an image has been loaded via the ImageLazyLoader.
                    $.subscribe(imageSubscription, function(e, moduleElementFromPublish) {
                        var navLinks = Globals.Helpers.cache.gameNav.find('.waypoint-nav'),
                            element = moduleElementFromPublish;

                        element.removeClass('is-not-initialized');
                        obj.Module.init(element);

                        // Store the module to element for later eradication
                        $.data( element.get(0), 'module', obj.Module );

                        $.waypoints('refresh');

                        var filteredLink = navLinks.filter('[href="#' + element.attr('id') + '"]');
                        filteredLink.removeClass('is-not-initialized');

                        filteredLink = null;
                        element = null;
                        navLinks = null;
                        moduleElementFromPublish = null;
                        $.unsubscribe(imageSubscription);

                    });

                    Globals.ImageLazyLoader.initModuleLazyImages(moduleElement);
                    moduleElement = null;

                });
            }

        },

        _initializeNonJSModule = function _initializeNonJSModule(moduleElement) {

            var navLinks = Globals.Helpers.cache.gameNav.find('.waypoint-nav'),
                filteredLink = navLinks.filter('[href="#' + moduleElement.attr('id') + '"]')

            moduleElement.waypoint('destroy');

            Globals.ImageLazyLoader.initModuleLazyImages(moduleElement);

            //console.log(filteredLink);

            moduleElement.removeClass('is-not-initialized');
            filteredLink.removeClass('is-not-initialized');

            moduleElement = null;
            filteredLink = null;
            navLinks = null;

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        return {
            init         : _init,
            setupModules : _setupModules
        };

    })();

    main.init();

    return main;

});
