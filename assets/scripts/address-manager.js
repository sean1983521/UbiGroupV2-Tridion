define(["waypoints", "exports", "Globals", "jQuery.tinyPubSub"], function(waypoint, exports, Globals, TinyPubSub) {

    var AddressManager = (function AddressManager() {

        var _cache = {
            'heroSlider'   : null,
            'currentGame'  : null,
            'currentHero'  : null,
            'nextModule'   : null,
            'gameNavWrap'  : null
        },

        _config = {
            'urlSource'      : null,
            'urlHash'        : null,
            'urlSplit'       : null,
            'urlLang'        : null,
            'urlCategory'    : null,
            'urlTitle'       : null,
            'urlModule'      : null,
            'waypointOffset' : '98%',
            'currentGameURL' : null,
            'isHomePage'     : null,
            'isWaypointSet'  : false,
            'isDeepLinked'   : false
        },

        _hero = $('#heroCarousel'),

        _modalPopped = false,

        _init = function _init() {

            //console.log('Address Manager init');

            _addEvents();

        },

        _setupCache = function _setupCache() {

            _cache.heroSlider = _hero.find('.slider');
            _cache.currentGame = _cache.heroSlider.find('.current-game');
            _cache.currentHero = _cache.currentGame.find('.module-wrap').first();
            _cache.nextModule = _cache.currentHero.next('.module-wrap');
            _cache.gameNavWrap = Globals.Helpers.cache.header.next('.game-nav-wrap');

        },

        _setupURLConfig = function _setupURLConfig() {
            /*jshint maxstatements:20 */

            _config.urlSource = location.pathname.substring(1);
            _config.urlSplit = _config.urlSource.split('/');
            _config.urlLang = _config.urlSplit[0];
            _config.urlCategory = _config.urlSplit[1];
            _config.urlTitle = _config.urlSplit[2];
            _config.urlModule = _config.urlSplit[3];

            _config.currentGameURL = _cache.currentGame.attr('data-page-url') + '/';
            _config.isHomePage = (_config.urlSplit[1].indexOf('home.') === -1) ? false : true;

        },

        _addEvents = function _addEvents() {

            $.subscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT, _heroLoaded);
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, _newGameLoaded);

        },

        _addWaypoint = function _addWaypoint() {

            _cache.nextModule.waypoint(function(direction) {

                if (direction === 'down') {
                    _setState();
                    _destroyWaypoint();
                }

            }, {
                offset: _config.waypointOffset
            });

            _config.isWaypointSet = true;

        },

        _destroyWaypoint = function _destroyWaypoint() {

            if (_config.isWaypointSet) {
                _cache.nextModule.waypoint('destroy');
                _config.isWaypointSet = false;
            }

        },

        _determineDeepLink = function _determineDeepLink() {

            var el, 
                deepLink = false;

            _config.urlHash = window.location.hash;

            el = $(_config.urlHash);

            if (_config.urlHash && _config.urlHash !== '' && el.length !== 0) {                
                deepLink = true;
            }

            return deepLink;
        },

        _popModal = function _popModal() {
            if (location.search.length > 0) {
                var urlParamsArray = location.search.split('?')[1].split('&'),
                    urlParamsObject = {},
                    i = 0,
                    el = null;

                for (; i < urlParamsArray.length; i++) {
                    var paramString = urlParamsArray[i],
                        paramArray = paramString.split('=');

                    urlParamsObject[paramArray[0]] = paramArray[1];
                }

                if (urlParamsObject.modalId !== undefined){

                    el = $('#' + urlParamsObject.modalId);
                    el.trigger('click');
                    _modalPopped = true;
                }
            }
        },

        _setupDeepLink = function _setupDeepLink() {
            var el;
            
            if (_determineDeepLink()) {
                el = $(_config.urlHash);
                
                _config.isDeepLinked = true;

                // if we're deep linked down the page then load all submodules ...
                Globals.Helpers.forceLoadModules(function(){
                    // ... then move to the correct section
                    Globals.Helpers.cache.window.scrollTop(el.offset().top - Globals.Settings.CONSTANTS.HEADER_HEIGHT);

                    $.publish(Globals.Settings.CONSTANTS.EVENT_DEEP_LINK, [null, true, null]);
                });

            } else {
                $.publish(Globals.Settings.CONSTANTS.EVENT_DEEP_LINK, [null, true, null]);
            }

        },

        _setState = function _setState() {

            var url = '/' + _config.urlLang + '/' + _config.urlCategory + '/' + _config.urlTitle + '/',
                deepLinkedUrl = _config.isDeepLinked ? _config.currentGameURL + _config.urlHash : _config.currentGameURL;

            if (window.history.replaceState){
                window.history.replaceState({}, _config.currentGameURL, deepLinkedUrl);
            }

            // Update the config object
            _setupURLConfig();

            url = null;
            deepLinkedUrl = null;

        },

        _setLanguage = function _setLanguage() {

            if (Globals.Helpers.getCookie('locale') !== '') {

                if (Globals.Helpers.getCookie('locale') !== _config.urlLang && !_modalPopped) {
                    $.publish(Globals.Settings.CONSTANTS.EVENT_LOCALE_MESSAGE);
                }

            } else {
                Globals.Helpers.setCookie('locale', _config.urlLang, 300);
            }

        },

        _heroLoaded = function _heroLoaded() {

            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_MODULE_HERO_INIT);

            _popModal();
            _setupDeepLink();
            _newGameLoaded();


        },

        _newGameLoaded = function _newGameLoaded(e) {

            _destroyWaypoint();
            _garbage();
            _setupCache();
            _setupURLConfig();
            _setLanguage();
            _addWaypoint();

            //reset deep linking on new game
            if(e && e.type === 'EVENT_NEW_GAME_LOADED') {
                _config.isDeepLinked = false;
            }

            // If this IS NOT the home page set the state
            if (!_config.isHomePage) {
                _setState();
            }

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        // Public pointers
        return {
            init: _init,
            determineDeepLink : _determineDeepLink
        };

    })();

    exports.AddressManager = AddressManager;

});
