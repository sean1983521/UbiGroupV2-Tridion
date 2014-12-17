define(["require", "exports", "jquery", "modules/modal/modal"], function(require, exports, $, Modal) {

    /*jshint maxstatements:20 */

    /// <reference path="interfaces/lib/jquery/jquery.d.ts" />
    var Settings = (function Settings() {

        var _CONSTANTS = {

            // EVENT NAMES
            EVENT_NEW_GAME_INIT      : "EVENT_NEW_GAME_INIT",
            EVENT_NEW_GAME_LOADED    : "EVENT_NEW_GAME_LOADED",
            EVENT_FIRST_GAME_LOADED  : "EVENT_FIRST_GAME_LOADED",
            EVENT_SET_URL_STATE      : "EVENT_SET_URL_STATE",
            EVENT_MODULE_INIT        : "EVENT_MODULE_INIT",
            EVENT_MODULE_HERO_INIT   : "EVENT_MODULE_HERO_INIT",
            EVENT_PAGE_LOADED        : "EVENT_PAGE_LOADED",
            EVENT_DEEP_LINK          : "EVENT_DEEP_LINK",
            EVENT_NAV_UPDATED        : "EVENT_NAV_UPDATED",
            EVENT_CLOSE_DETAIL_NAV   : "EVENT_CLOSE_DETAIL_NAV",
            EVENT_CLOSE_OTHER_PANELS : "EVENT_CLOSE_OTHER_PANELS",
            EVENT_LOCALE_MESSAGE     : "EVENT_LOCALE_MESSAGE",
            HERO_IMAGE_LOADED        : "HERO_IMAGE_LOADED",

            EVENT_TRANSITION_END: (function(){

                var map = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'OTransition' : 'oTransitionEnd',
                    'transition' : 'transitionend'
                };

                var el = document.createElement('p');

                for (var transition in map) {
                    if (null != el.style[transition]) {
                        return map[transition];
                    }
                }

                el = null;
            })(),

            // EASING & TRANSITION
            EASE: 'swing',
            TRANSITION_STAGGER_TIME: 100, // Should match with the variable in _variable.scss

            // VARIABLES
            HEADER_HEIGHT: 50
        },

        _logEvents = function _logEvents(logLevel){
            if (logLevel >= 1){
                // Level 1 logs : game, page and module initialization
                $.subscribe(_CONSTANTS.EVENT_NEW_GAME_INIT, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_NEW_GAME_LOADED, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_FIRST_GAME_LOADED, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_MODULE_INIT, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_MODULE_HERO_INIT, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_PAGE_LOADED, _logEvent);
            }

            if (logLevel >= 2){
                // Level 2 logs : deep linking / URL / Navigation
                $.subscribe(_CONSTANTS.EVENT_SET_URL_STATE, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_NAV_UPDATED, _logEvent);
            }

            if (logLevel >= 3){
                // Level 3 logs : most other logs
                $.subscribe(_CONSTANTS.EVENT_CLOSE_DETAIL_NAV, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_CLOSE_OTHER_PANELS, _logEvent);
                $.subscribe(_CONSTANTS.EVENT_LOCALE_MESSAGE, _logEvent);
            }

            if (logLevel >=4){
                // Level 4 logs : watch out ... everything else
                $.subscribe(_CONSTANTS.EVENT_TRANSITION_END, _logEvent);
            }
        },

        _logEvent = function _logEvent(e, data){
            console.log(e.type, ':', data, e);
        },

        _init = function _init(){
            _logEvents(0);
        };

        _init();

        return {
            CONSTANTS : _CONSTANTS
        };

    })();

    exports.Settings = Settings;

    var Helpers = (function Helpers(){

        var _cache = {
            'header'      : $('.site-header'),
            'innerHeader' : $('.site-inner-header'),
            'body'        : $(document.body),
            'window'      : $(window),
            'gameNav'     : $('.site-header').next('.game-nav-wrap')
        },

        _config = {
            'winHeight'     : _cache.window.height(),
            'winWidth'      : _cache.window.width(),
            'touchEvent'    : Modernizr.touch ? 'touchstart' : 'click',
            'breakpoint'    : "mobile",
            'breakpoints'   : [
                { "name" : "mobile", "min-width" : 0},
                { "name" : "tablet", "min-width" : 641},
                { "name" : "desktop", "min-width" : 960},
                { "name" : "widescreen", "min-width" : 1280}
            ]
        },

        _isLoaded = false,

        _pageLoadFunctions = [],

        _peekHeight = 0,

        _init = function _init() {
            _testGetComputedStyle();
            ResizeManager.addCallback(_resize);
        },

        _resize = function _resize() {

            _config.winHeight = _cache.window.height();
            _config.winWidth = _cache.window.width();

            _testGetComputedStyle();

        },

        _testGetComputedStyle = function _testComputedStyle() {
            // we normally get the current breakpoint by looking for the :after content on the body
            // this is set via the CSS (which controls breakpoints)
            // There is a new bug in Chrome that makes this not work (see: https://code.google.com/p/chromium/issues/detail?id=236603 for details)
            // in the case that we cannot get the appropriate content, we'll check the breakpoint programatically

            if (window.getComputedStyle(document.body,':after').getPropertyValue('content').length < 2) {
                // the bug is present, we didn't get the appropriate data
                var i = 0,
                    //check against the window innerWidth to get the current viewport.  jQuery .width() does not include scrollbars.
                    windowWidth = window.innerWidth;
                
                for (; i < _config.breakpoints.length; i++){
                    var breakpoint = _config.breakpoints[i],
                        nextBreakpoint = (i+1 < _config.breakpoints.length) ? _config.breakpoints[i+1] : { "name" : "ERROR", "min-width" : 10000 };

                    if (windowWidth >= breakpoint['min-width'] && windowWidth < nextBreakpoint['min-width']){
                        _config.breakpoint = breakpoint['name'];
                        break;
                    }
                }
            }
        },

        _toggleGlobalHeader = function _toggleGlobalHeader(isWithinHeader){
            if (_isMobile()){
                if (isWithinHeader){
                    _cache.innerHeader.toggleClass('hidden');
                } else {
                    _cache.header.toggleClass('hidden');
                }
            }
        },

        _freezeBody = function _freezeBody(){
            _cache.body.addClass('frozen');
            if (_isTouchDevice()){
                _cache.body.css('height', _config.winHeight);
            }
        },

        _unfreezeBody = function _unfreezeBody(){
            _cache.body.removeClass('frozen');
            if (_isTouchDevice()){
                _cache.body.css('height', 'auto');
            }
        },

        _toggleBodyFreeze = function _toggleBodyFreeze(){
            if (_cache.body.hasClass('frozen')){
                _unfreezeBody();
            } else {
                _freezeBody();
            }
        },

        _disableScroll = function _disableScroll() {
            if (window.addEventListener) {
                window.addEventListener('DOMMouseScroll', _onWheel, false);
                window.addEventListener('touchmove', _onWheel, false);
            }
            window.onmousewheel = document.onmousewheel = _onWheel;
        },

        _enableScroll = function _enableScroll() {
            if (window.removeEventListener) {
                window.removeEventListener('DOMMouseScroll', _onWheel, false);
                window.removeEventListener('touchmove', _onWheel, false);
            }
            window.onmousewheel = document.onmousewheel = null;
        },

        _onWheel = function _onWheel(e) {
            e.preventDefault();
        },

        // Test for touch device
        // See http://modernizr.github.io/Modernizr/touch.html
        // See http://msdn.microsoft.com/en-us/library/windows/apps/hh779855.aspx
        _isTouchDevice = function _isTouchDevice () {
            return ('createTouch' in document || navigator.msMaxTouchPoints) ? true : false;
        },

        _getSize = function _getSize(){
            // see comments in _testGetComputedStyle for info on why this if/else is needed
            if (window.getComputedStyle(document.body,':after').getPropertyValue('content').length < 2) {
                return _config.breakpoint;
            } else {
                return window.getComputedStyle(document.body,':after').getPropertyValue('content');
            }
        },

        _isDesktop = function _isDesktop(){
            var size = _getSize();

            if (size.indexOf('desktop') !== -1){
                size = null;
                return true;
            } else {
                size = null;
                return false;
            }

        },

        _isWidescreen = function _isWidescreen(){
            var size = _getSize();

            if (size.indexOf('widescreen') !== -1){
                size = null;
                return true;
            } else {
                size = null;
                return false;
            }

        },

        _isTablet = function _isTablet(){
            var size = _getSize();

            if (size.indexOf('tablet') !== -1){
                size = null;
                return true;
            } else {
                size = null;
                return false;
            }

        },

        _isMobile = function _isMobile(){
            var size = _getSize();

            if (size.indexOf('mobile') !== -1){
                size = null;
                return true;
            } else {
                size = null;
                return false;
            }

        },

        _isLandscape = function _isLandscape(){
            return _config.winHeight > _config.winWidth ? false : true;
        },

        _isPortrait = function _isPortrait(){
            return _config.winHeight < _config.winWidth ? false : true;
        },

		_isDate = function _isDate(dateStr) {
			var s = dateStr.split('/'); //format 21/12/2012
			var d = new Date(+s[2], s[1]-1, +s[0]);

			if (Object.prototype.toString.call(d) === "[object Date]") {
				if (!isNaN(d.getTime()) && d.getDate() === parseInt(s[0],10) &&
					d.getMonth() === parseInt(s[1] - 1,10)) {
					return true;
				}
			}
			return false;
		},

        _isAndroid = function _isAndroid() {

            var ua = navigator.userAgent.toLowerCase(),
                isAndroid = ua.indexOf("android") > -1;

            return isAndroid;

        },

        _initializeGlobalFooter = function _initializeGlobalFooter(){
            require(["modules/GlobalFooter"], function(obj){
                obj.Footer.init();
                ImageLazyLoader.initGlobalFooter();
            });
        },

        _initializeGlobalHeader = function _initializeGlobalHeader(){
            require(["modules/header/header"], function(obj){
                obj.Header.init();
            });
        },

        _addToPageLoadFunctions = function _addToPageLoadFunctions(func){
            if (_isLoaded){
                func();
            } else {
                _pageLoadFunctions.push(func);
            }
        },

        _runPageLoadFunctions = function _runPageLoadFunctions(){
            while (_pageLoadFunctions.length > 0){
                _pageLoadFunctions.pop()();
            }
            _isLoaded = true;
        },

        _forceLoadModules = function _forceLoadModules(callback) {

            var currentGame = $('.current-game'),
                totalMods = currentGame.find('.module-wrap').filter('.is-not-initialized').length,
                loadedMods = 0;

            if (totalMods === 0){
                $('.site-header').next('.game-nav-wrap').find('.blocker').remove();

                if (callback !== undefined){
                    callback();
                }
            }

            currentGame.find('.module-wrap').filter('.is-not-initialized').each(function(i, el) {

                var moduleElement = $(el),
                    moduleName = moduleElement.attr('data-module');

                moduleElement.waypoint('destroy');

                if (moduleName && moduleElement.hasClass('is-not-initialized')) {

                    require([moduleName], function(obj) {

                        var imageSubscription = moduleElement[0].id + 'image';

                        //initialize the modules once we've detected that an image has been loaded via the ImageLazyLoader.
                        $.subscribe(imageSubscription, function(e, moduleElementFromPublish) {
                            var navLinks = $('.site-header').next('.game-nav-wrap').find('.waypoint-nav'),
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
                            loadedMods++;
                            $.unsubscribe(imageSubscription);

                            // Is everything loaded?
                            if (loadedMods === totalMods) {
                                totalMods = 0;
                                loadedMods = 0;
                                imageSubscription = null;
                               $('.site-header').next('.game-nav-wrap').find('.blocker').remove();

                                if (callback !== undefined){
                                    callback();
                                }
                            }

                        });

                        ImageLazyLoader.initModuleLazyImages(moduleElement);

                    });

                } else {

                    var moduleElement = $(el),
                        navLinks = $('.site-header').next('.game-nav-wrap').find('.waypoint-nav'),
                        filteredLink = navLinks.filter('[href="#' + moduleElement.attr('id') + '"]')

                    moduleElement.waypoint('destroy');

                    ImageLazyLoader.initModuleLazyImages(moduleElement);

                    moduleElement.removeClass('is-not-initialized');
                    filteredLink.removeClass('is-not-initialized');

                    moduleElement = null;
                    filteredLink = null;
                    navLinks = null;

                    loadedMods++;

                    if (loadedMods === totalMods) {
                        totalMods = 0;
                        loadedMods = 0;
                        imageSubscription = null;
                        $('.site-header').next('.game-nav-wrap').find('.blocker').remove();

                        if (callback !== undefined){
                            callback();
                        }
                    }

                }

                currentGame = null;

            });

        },

        _setCookie = function _setCookie(cookieName,cookieValue,nDays) {
            var today = new Date(),
                expire = new Date();

            // TODO: MUST MAKE SURE TO CHANGE THE DOMAIN!!!!!!!!
            if (nDays === null || nDays === 0){
                document.cookie = cookieName + "=" + escape(cookieValue) + ";domain=.dc.akqa.com;path=/";
            } else {
                expire.setTime(today.getTime() + (3600000 * 24 * nDays));
                document.cookie = cookieName + "=" + escape(cookieValue) + ";expires=" + expire.toGMTString() + ";domain=.dc.akqa.com;path=/";
            }

            today = null;
            expire = null;

        },

        _getCookie = function _getCookie(cookieName) {
            var theCookie = " " + document.cookie,
                ind = theCookie.indexOf(" " + cookieName + "="),
                ind1;

            if (ind === -1){
                ind = theCookie.indexOf(";" + cookieName + "=");
            }
            if (ind === -1 || cookieName === ""){
                return "";
            }

            ind1 = theCookie.indexOf(";", ind + 1);
            if (ind1 === -1){
                ind1 = theCookie.length;
            }

            return unescape(theCookie.substring(ind + cookieName.length + 2, ind1));
        };

        return {
            init                   : _init,
            cache                  : _cache,
            config                 : _config,
            addToPageLoadFunctions : _addToPageLoadFunctions,
            getSize                : _getSize,
            getCookie              : _getCookie,
            initializeGlobalFooter : _initializeGlobalFooter,
            initializeGlobalHeader : _initializeGlobalHeader,
            isDesktop              : _isDesktop,
            isLandscape            : _isLandscape,
            isLoaded               : _isLoaded,
            isMobile               : _isMobile,
            isPortrait             : _isPortrait,
            isTablet               : _isTablet,
            isTouchDevice          : _isTouchDevice,
            isWidescreen           : _isWidescreen,
            isDate                 : _isDate,
            isAndroid              : _isAndroid,
            pageLoadFunctions      : _pageLoadFunctions,
            runPageLoadFunctions   : _runPageLoadFunctions,
            setCookie              : _setCookie,
            toggleGlobalHeader     : _toggleGlobalHeader,
            peekHeight             : _peekHeight,
            freezeBody             : _freezeBody,
            unfreezeBody           : _unfreezeBody,
            toggleBodyFreeze       : _toggleBodyFreeze,
            disableScroll          : _disableScroll,
            enableScroll           : _enableScroll,
            forceLoadModules       : _forceLoadModules
        };

    })();

    var ResizeManager = (function ResizeManager(){

        var _callbacks = [],
            _throttle = 10,

        _init = function _init() {
            _listenForResizeEvent();
        },

        _listenForResizeEvent = function _listenForResizeEvent() {

            var timeout;

            // Some touch devices trigger a resize event when scrolling, so use orientationchange instead
            if (Helpers.isTouchDevice()) {

                Helpers.cache.window.on('orientationchange', function() {
                    clearTimeout(timeout);
                    timeout = setTimeout(function(){
                        _resizeEventHandler(100);
                        //window.location.reload();
                    }, _throttle);
                });

            } else {

                Helpers.cache.window.on('resize', function() {
                    clearTimeout(timeout);
                    timeout = setTimeout(function(){
                        _resizeEventHandler(10);
                    }, _throttle);
                });

            }


        },

        _resizeEventHandler = function _resizeEventHandler(throttle) {

            function applyCallback(index){
                setTimeout(function(){
                    _callbacks[index]();
                }, (index * throttle));
            }

            //Invoke callbacks
            for (var i = _callbacks.length; i--;) {
                applyCallback(i);
            }

        },

        _addCallback = function _addCallback(callback) {
            _callbacks.push(callback);
        },

        _removeCallback = function _removeCallback(callback) {
            var idx = _callbacks.indexOf(callback);
            if (idx > -1) {
              _callbacks.splice(idx, 1);
              return true;
            }
            return false;
        },

        _ifCallbackExists = function _ifCallbackExists(callback) {

            var idx = _callbacks.indexOf(callback);

            return (idx > -1) ? true : false;

        };

        return {
            init             : _init,
            addCallback      : _addCallback,
            removeCallback   : _removeCallback,
            ifCallbackExists : _ifCallbackExists
        };

    })();

    var ImageLazyLoader = (function ImageLazyLoader(){

        var _currentSize = Helpers.getSize(),

        _promoTrayResults = $('#promo-tray-container').find('.lazy-image, .lazy-css-image'),

        _globalLazyImages = $('.global-footer').find('.lazy-image, .lazy-css-image'),

        _cache = {
            'currentGame'       : null,
            'lazyImages'        : null,
            'searchTrayResults' : null,
            'purchaseImages'    : null
        },

        _init = function _init() {

            // Set up resize handler
            if (ResizeManager.ifCallbackExists(_resize)) {
                ResizeManager.removeCallback(_resize);
            }

            ResizeManager.addCallback(_resize);

        },

        _setupCache = function _setupCache() {

            _cache.currentGame = $('.current-game');
            _cache.lazyImages = _cache.currentGame.find('.lazy-image, .lazy-css-image');

        },

        _initLoading = function _initLoading() {

            _cache.lazyImages.each(function(i, el) {

                var lazyImage = $(el),
                    newSource = _getSourceSize(lazyImage);

                if (lazyImage.hasClass('lazy-css-image')) {
                    _loadCSSImages(lazyImage, newSource);
                } else {
                    _loadInlineImages(lazyImage, newSource);
                }

                lazyImage = null;
                newSource = null;

            });

            // Clean up any garbage real quick
            _garbage();

        },

        _initGlobalFooter = function _initGlobalFooter() {

            _globalLazyImages.each(function(i, el) {

                var lazyImage = $(el),
                    newSource = _getSourceSize(lazyImage);

                if (lazyImage.hasClass('lazy-css-image')) {
                    _loadCSSImages(lazyImage, newSource);
                } else {
                    _loadInlineImages(lazyImage, newSource);
                }

                lazyImage = null;
                newSource = null;
                el = null;

            });

        },

        _initPromoTrayLazyImages = function _initPromoTrayLazyImages() {

            _promoTrayResults.each(function(i, el) {

                var lazyImage = $(el),
                    newSource = _getSourceSize(lazyImage);

                _loadInlineImages(lazyImage, newSource);

                lazyImage = null;
                newSource = null;
                el = null;

            });

        },

        _initSearchTrayLazyImages = function _initSearchTrayLazyImages() {

            _cache.searchTrayResults = $('.search-tray-results').find('.lazy-image');

            _cache.searchTrayResults.each(function(i, el) {

                var lazyImage = $(el),
                    newSource = _getSourceSize(lazyImage);

                _loadInlineImages(lazyImage, newSource);

                lazyImage = null;
                newSource = null;
                el = null;

            });

        },

        _initPurchaseLazyImages = function _initPurchaseLazyImages() {

            _cache.purchaseImages = $('.purchase-wrap').find('.lazy-image');

            _cache.purchaseImages.each(function(i, el) {

                var lazyImage = $(el),
                    newSource = _getSourceSize(lazyImage);

                _loadInlineImages(lazyImage, newSource);

                lazyImage = null;
                newSource = null;
                el = null;
            });

        },

        _initModuleLazyImages = function _initModuleLazyImages(moduleElement) {

            var images = moduleElement.find('.lazy-image, .lazy-css-image'),
                imageCheck = false;

            if( images.length === 0 ) {
                /* go ahead and kick off module initialization.
                   publishing below (line 570) for modules with images.
                */
                $.publish(moduleElement[0].id + 'image', [moduleElement]);
            }

            images.each(function(i, el) {

                var lazyImage = $(el),
                    newSource = _getSourceSize(lazyImage);

                if (lazyImage.hasClass('lazy-css-image')) {
                    _loadCSSImages(lazyImage, newSource);
                } else {
                    _loadInlineImages(lazyImage, newSource);
                }

                /* check if the first image has loaded or not (assuming it has a source defined - some mobile background images do not)
                   or make sure we're not on a background image and the image check has not run yet.
                   then we can initialize the modules. whew.
                */
                if ((i == 0 && newSource !== undefined ) || (!lazyImage.hasClass('lazy-css-image') && !imageCheck) ){
                    //set that this check has already happened.
                    imageCheck = true;
                    // Create a dummy image with the appropriate src
                    var image = $('<img/>');

                    image.load(function() {
                        setTimeout(function(){
                            /*
                                kick off module initialization once an image has been loaded (to get the correct dimensions!).
                                publishing elsewhere (line 540) as well.
                            */
                            $.publish(moduleElement[0].id + 'image', [moduleElement]);
                            moduleElement = null;
                        }, 1);
                        image = null;
                    }).attr('src', newSource);
                }

                lazyImage = null;
                newSource = null;
                el = null;

            });

            images = null;
            imageCheck = null;
        },

        _loadCSSImages = function _loadCSSImages(el, src) {

            // Check and make sure we actually need to swap the source first
            if (el.css('background-image') !== src) {
                // the timeout is a safari hack
                setTimeout(function(){
                    el.css('background-image', 'url(' + src + ')');
                    el = null;
                }, 1000);
            }

        },

        _loadInlineImages = function _loadInlineImages(el, src) {

            // Check and make sure we actually need to swap the source first
            if (el.attr('src') !== src) {

                el.removeClass('spinner').attr('src', src);
                el = null;

            }

        },

        _getSourceSize = function _getSourceSize(imgEl) {
            /*jshint maxstatements:20 */

            var newSource;

            if (Helpers.isWidescreen()) {

                if (imgEl.attr('data-src-widescreen')) {
                    newSource = imgEl.attr('data-src-widescreen');
                } else if (imgEl.attr('data-src-desktop')) {
                    newSource = imgEl.attr('data-src-desktop');
                } else if (imgEl.attr('data-src-tablet')) {
                    newSource = imgEl.attr('data-src-tablet');
                } else {
                    newSource = imgEl.attr('data-src-mobile');
                }

            } else if (Helpers.isDesktop()) {

                if (imgEl.attr('data-src-desktop')) {
                    newSource = imgEl.attr('data-src-desktop');
                } else if (imgEl.attr('data-src-tablet')) {
                    newSource = imgEl.attr('data-src-tablet');
                } else {
                    newSource = imgEl.attr('data-src-mobile');
                }

            } else if (Helpers.isTablet()) {

                if (imgEl.attr('data-src-tablet')) {
                    newSource = imgEl.attr('data-src-tablet');
                } else {
                    newSource = imgEl.attr('data-src-mobile');
                }

            } else {

                newSource = imgEl.attr('data-src-mobile');

            }

            return newSource;

        },

        _resize = function _resize() {

            if (_currentSize !== Helpers.getSize()) {
                // Update the currentSize
                _currentSize = Helpers.getSize();
                // Clean up any garbage real quick
                _garbage();
                // Setup the cache
                _setupCache();
                // Load the new image size
                _initLoading();
            }

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        return {
            init                     : _init,
            initGlobalFooter         : _initGlobalFooter,
            initPromoTrayLazyImages  : _initPromoTrayLazyImages,
            initModuleLazyImages     : _initModuleLazyImages,
            initSearchTrayLazyImages : _initSearchTrayLazyImages,
            initPurchaseLazyImages   : _initPurchaseLazyImages,
            getSourceSize            : _getSourceSize
        };

    })();

    exports.Helpers = Helpers;
    exports.ResizeManager = ResizeManager;
    exports.ImageLazyLoader = ImageLazyLoader;
});
