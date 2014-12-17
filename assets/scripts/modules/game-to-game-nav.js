define(["exports", "Globals", "modules/game-cover/game-cover", "modules/secondary-nav/secondary-nav", "Hammer", "api", "jQuery.tinyPubSub"], function(exports, Globals, GameCover, SecondaryNav, hammer, API, TinyPubSub) {

    var GameToGameNav = (function GameToGameNav() {

        /*jshint maxstatements:20 */

        var _cache = {
            'sliderWrap'    : null,
            'slider'        : null,
            'items'         : null,
            'currentGame'   : null,
            'next'          : null,
            'prev'          : null,
            'footer'        : null
        },

        _config = {
            'maxInitialCSSLoad' : 2,
            'slideXDistance'    : null,
            'sliderWidth'       : null,
            'itemWidth'         : null,
            'maxDistance'       : null,
            'totalItems'        : null,
            'pos'               : 0,
            'isFirstTime'       : true,
            'soloPage'          : true,
            'cssTransitions'    : Modernizr.csstransitions
        },

        _pageSet = {},

        _delayNav = false,

        _init = function _init() {

            //console.log('Game-to-Game init');

            _setupCache();
            _loadNewCSS();

            // How much to move each time we slide
            _config.slideXDistance = _cache.sliderWrap.outerWidth();
            _config.totalItems = _cache.items.length;

            //_assignEvents();
            _getFeaturedPages();
            _assignEvents();
            _assignNavEvents();

            Globals.ResizeManager.addCallback(_resizeGameToGameNav);

        },

        _reset = function _reset() {

            _cache.items = _cache.slider.find('> li');
            _config.totalItems = _pageSet.TotalRecords;

            _sliderSetup();

            if (_config.pos > 0) {
                _sliderXOffset(null);
            }
        },

        _setupCache = function _setupCache() {

            _cache.sliderWrap = $('#heroCarousel');
            _cache.slider = _cache.sliderWrap.find('> .slider');
            _cache.items = _cache.slider.find('> li');
            _cache.currentGame = _cache.slider.find('> .current-game');
            _cache.next = $('#heroNext');
            _cache.prev = $('#heroPrev');
            _cache.footer = $('.global-footer');

        },

        _sliderSetup = function _sliderSetup() {

            // Initial item width. Will be recalculated as a percentage once we've set the slider width.
            _config.itemWidth = _config.slideXDistance;
            // Set the max distance the slider can be moved to
            _config.maxDistance = (_config.totalItems * _config.itemWidth) - _config.slideXDistance;
            // Slider width
            _config.sliderWidth = Math.round(_config.totalItems * _config.itemWidth);
            // Recalculate itemWidth as a percentage now
            //_config.itemWidth = ((_config.sliderWidth / _config.totalItems) / _config.sliderWidth) * 100;

            // Set some element dimensions
            _cache.items.css('width', _config.itemWidth);
            _cache.slider.css('width', _config.sliderWidth);

            // Initialize the GameCover module
            GameCover.GameCover.init();

        },

        _assignEvents = function _assignEvents() {

            // animate arrows in after intro
            $.subscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, _initialPageLoad);

        },

        _assignNavEvents = function _assignNavEvents() {

            if (Globals.Helpers.isTouchDevice()) {

                // Stop. HAMMER TIME! oh oh, ohh ohhh oh
                _cache.sliderWrap.hammer({
                    swipe_velocity        : (Globals.Helpers.isAndroid()) ? 0 : 0.6,
                    drag_block_horizontal : false,
                    drag_lock_to_axis     : true,
                    stop_browser_behavior : {
                        touchAction : 'pan-y'
                    }
                }).on('release swipe dragleft dragright', '.hero-wrap', _handleHammer);

            }

            _cache.sliderWrap.on('click', '#heroPrev, #heroNext', _handlePagination);

        },

        _removeNavEvents = function _removeNavEvents() {

            _cache.sliderWrap.hammer().off('release swipe dragleft dragright', '.hero-wrap', _handleHammer);
            _cache.sliderWrap.off('click', '#heroPrev, #heroNext', _handlePagination);

        },

        _initialPageLoad = function _initialPageLoad(){
            $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED);
        },

        _handlePagination = function _handlePagination(e) {

            if (!_delayNav){
                SecondaryNav.SecondaryNav.closeNav();

                if (e.currentTarget.id === 'heroNext') {
                    _swipeHorzHandler('left', true);
                } else {
                    _swipeHorzHandler('right', true);
                }

                _delayNav = true;

                setTimeout(function(){
                    _delayNav = false;
                }, 1000);
            }

            e.preventDefault();
            e.stopPropagation();

        },

        _handleHammer = function _handleHammer(e) {

            SecondaryNav.SecondaryNav.closeNav();

            e.gesture.preventDefault();

            var direction = e.gesture.direction,
                deltaX = e.gesture.deltaX;

            switch(e.type) {

                case 'dragright':
                case 'dragleft':
                    var pageOffset,
                        dragOffset = ((100 / _config.slideXDistance) * deltaX) / _config.totalItems;

                    if (_config.slideXDistance * _config.pos > _config.maxDistance) {
                        pageOffset = -(_config.maxDistance / _config.sliderWidth) * 100;
                    } else {
                        pageOffset = -((_config.slideXDistance / _config.sliderWidth) * 100) * _config.pos;
                    }

                    // If this is the first or last page slow the drag rate down a bit
                    if ((_config.pos === 0 && direction === 'right') || (_config.pos === _config.totalItems - 1 && direction === 'left')) {
                        dragOffset *= 0.4;
                    }

                    // Time to move
                    _sliderXOffset(dragOffset + pageOffset);

                    break;

                case 'swipe':

                    if (!_delayNav){

                        // Prevent any other gesture detection. Helps with swipe not getting confused for dragging
                        e.gesture.stopDetect();

                        // Determine appropriate event for the direction of the swipe
                        if (direction === 'left' || direction === 'right') {
                            _swipeHorzHandler(direction);
                        }

                        _delayNav = true;

                        setTimeout(function(){
                            _delayNav = false;
                        }, 1000);

                        break;

                    }

                case 'release':
                    // If drag distance is more than 50% of the width treat it like a swipe
                    if (Math.abs(deltaX) > _config.slideXDistance / 2) {
                        _swipeHorzHandler(direction);
                    } else {
                        // Time to move
                        _sliderXOffset(null, true);
                    }

                    break;

            }

        },

        _swipeHorzHandler = function _swipeHorzHandler(direction, easing) {
            _eradicateModules(_cache.currentGame);

            //add some space above footer in case we're not at the top.
            _cache.footer.addClass('init');

            // Determine the new position based on what direction we're sliding.
            if (direction === 'left' && _config.pos < (_config.totalItems - 1)) {
                _config.pos++;
                _setCurrentGame(direction);
            } else if (direction === 'right' && _config.pos > 0) {
                _config.pos--;
                _setCurrentGame(direction);
            }

            if(_cache.prev !== null && !_config.soloPage) {
                _cache.prev.toggleClass('inactive', 0 === _config.pos); // If this is first, deactivate prev.
                _cache.next.toggleClass('inactive', _config.totalPages - 1 === _config.pos); // If this is last item, deactivate next.
            }

            // Time to move
            _sliderXOffset(null, true, easing);

            if (!_config.soloPage){
                _initCarouselPage();
            }

            _removeNavEvents();
            // Reassign the nav events in a bit
            setTimeout(function() {
                _assignNavEvents();
            }, 500);

        },

        _sliderXOffset = function _sliderXOffset(percent, isAnimated, easing) {
            // Set the percentage if one was not passed to the function
            var offset;

            if (percent) {
                offset = percent;
            } else {

                if (_config.slideXDistance * _config.pos > _config.maxDistance) {
                    offset = -(_config.maxDistance / _config.sliderWidth) * 100;
                } else {
                    offset = -((_config.slideXDistance / _config.sliderWidth) * 100) * _config.pos;
                }

            }

            if (isAnimated) {

                if (easing) {
                    // Ease-in-out timing
                    _cache.slider.addClass('easing');
                } else {
                    // Ease-out timing
                    _cache.slider.addClass('animate');
                }

            } else {
                _cache.slider.removeClass('easing animate');
            }

            // Slide...to infinity, and beyond!
            if (_config.cssTransitions) {
                _cache.slider.css('transform', 'translate(' + offset + '%,0)');
            } else {
                var pixels = '-' + (_config.slideXDistance * _config.pos) + 'px';
                _cache.slider.css('left', pixels);
            }
        },

        _displayModules = function _displayModules(e) {
            var target = $(e.target);

            if (target.find('.hero-item').length) {
                $.publish(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, 'game-to-game-nav::_displayModules');
            }

        },

        /**************************************************************
        Above here is carousel functionality
        Below here is page construction functionality
        **************************************************************/

        // Get the default Featured pages from the API - called from this module's _init
        _getFeaturedPages = function _getFeaturedPages(){

            var keyword = $('.search-tray-form .search-tray-keyword').val().toLowerCase(),
                category = $('#searchTrayFauxInputShow .value').data('search-term'),
                platform = $('#searchTrayFauxInputPlatform .value').data('search-term'),
                genre = $('#searchTrayFauxInputGenre .value').data('search-term'),
                options = {};

            options.ps = 100;
            options.keyword = keyword || '';
            options.filter = category || 'featured';
            options.pf = platform || 'all';
            options.g = genre || 'all';

            API.search(options, _handleSearchResults);
        },

        // Using the results of the Featured pages search, define if we're building a carousel or a solo page
        _handleSearchResults = function _handleSearchResults(data){
            var i = 0,
                j = 0;

            for (var j = data.SearchResult.Items.length; j--;){
                var page = data.SearchResult.Items[j];
                if (page.PageURL.toLowerCase().substring(0, 4) == "http"){
                    data.SearchResult.Items.splice(j, 1);
                    data.TotalRecords = data.TotalRecords - 1;
                }
            }

            _setPageSet(data);

            // check to see if the current game exists in the search results
            for (; i < data.SearchResult.Items.length; i++){
                var page = data.SearchResult.Items[i];

                if (page.PageURL.toLowerCase() === _cache.currentGame.data('page-url').toLowerCase()){
                    // the current game exists in the search results -> build carousel
                    _rebuildCarousel(i);

                    _config.soloPage = false;

                    _showArrows();

                    break;
                }
            }

            if (_config.soloPage){
                _initSoloPage();
            }
        },

        // Initialize a Carousel page - it has neighboring pages
        _initCarouselPage = function _initCarouselPage(){

            $.publish(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_INIT, 'game-to-game-nav::_initCarouselPage');

            _loadNeighboringPages();
            _showArrows();
            Globals.ImageLazyLoader.initModuleLazyImages(_cache.currentGame.find('.hero-module-wrap'));

            // Handle the initial page load
            if (_config.isFirstTime) {
                _config.isFirstTime = false;
                _cache.currentGame.addClass('first-game');
                $.publish(Globals.Settings.CONSTANTS.EVENT_FIRST_GAME_LOADED, 'game-to-game-nav::_initCarouselPage');
            } else {
                _loadModules();
                // corresponding event publishing is done in the callback in _loadModules
            }

        },

        // Initialize a solo page - it does not have neighbors
        _initSoloPage = function _initSoloPage(){
            _hideArrows();
            _sliderSetup();
            Globals.ImageLazyLoader.initModuleLazyImages(_cache.currentGame.find('.hero-module-wrap'));
            if (_config.isFirstTime) {
                _config.isFirstTime = false;
                _cache.currentGame.addClass('first-game');
                $.publish(Globals.Settings.CONSTANTS.EVENT_FIRST_GAME_LOADED, 'game-to-game-nav::_initSoloPage');
            } else {
                $.publish(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, 'game-to-game-nav::_initSoloPage');
            }


        },

        // Begin the process of loading a page determined CSS file
        _loadNewCSS = function _loadNewCSS(cssString) {
            var css = cssString === undefined ? _cache.currentGame.attr('data-css') : cssString,
                alreadyLoaded = _isAlreadyLoaded(css);

            if (!alreadyLoaded){
                _loadCSS(css);
            }
        },

        // Determine if the specific CSS file has already been loaded to the site
        _isAlreadyLoaded = function _isAlreadyLoaded(css) {
            var alreadyLoaded = false,
                loadedCSS = $('link');

            if (css !== undefined) {
                var j = 0;

                for (var j = loadedCSS.length; j--;){
                    var link = loadedCSS[j].href;

                    if (link.indexOf(css, link.length - css.length) !== -1){
                        alreadyLoaded = true;
                        break;
                    }
                }
            }

            return alreadyLoaded;
        },

        // Actually load the CSS onto the site
        _loadCSS = function _loadCSS(css) {
            var link = document.createElement("link");

            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", css);
            document.getElementsByTagName("head")[0].appendChild(link);

            link = null;
        },

        _loadModules = function _loadModules(){
            var currentPageModuleURL = _cache.currentGame.data('page-url') + '?rel=modules';

            API.getPage(currentPageModuleURL, function(html){
                _cache.currentGame.find('.hero-module-wrap').after(html);

                $.publish(Globals.Settings.CONSTANTS.EVENT_NEW_GAME_LOADED, 'game-to-game-nav::_loadModules');

                html = null;
                currentPageModuleURL = null;
            });
        },

        // Show the appropriate carousel navigation arrows
        _showArrows = function _showArrows() {
            //arrows could be null if closing the promo tray from an error page.
            if(_cache.prev !== null && !_config.soloPage) {
                _cache.prev.toggleClass('inactive', 0 === _config.pos); // If this is first, deactivate prev.
                _cache.next.toggleClass('inactive', _pageSet.SearchResult.Items.length - 1 === _config.pos); // If this is last item, deactivate next.
            }

        },

        _hideArrows = function _hideArrows(){
            _cache.prev.addClass('inactive');
            _cache.next.addClass('inactive');
        },

        // Load the HTML for the neighboring pages
        _loadNeighboringPages = function _loadNeighboringPages(){

            _cache.items = _cache.slider.find('> li');

            var nextPagePath = _config.pos < _pageSet.SearchResult.Items.length - 1 ? _pageSet.SearchResult.Items[_config.pos + 1].PageURL + '?rel=feature' : null,
                prevPagePath = _config.pos > 0 ? _pageSet.SearchResult.Items[_config.pos - 1].PageURL + '?rel=feature' : null;

            if ((_cache.items[_config.pos + 1] === undefined || $(_cache.items[_config.pos + 1]).html() === '') && (_config.pos + 1 < _pageSet.SearchResult.Items.length)){
                API.getPage(nextPagePath, function(html){
                    var $html = $(html);

                    if (_cache.items[_config.pos + 1] === undefined){
                        _insertPage(html, true);
                    } else {
                        _overwritePage(html, true);
                    }

                    _loadNewCSS($html.data('css'));
                    Globals.ImageLazyLoader.initModuleLazyImages(_cache.currentGame.next().find('.hero-module-wrap'));

                    _removePage(_cache.currentGame.prev().prev());
                    _reset();
                });
            }

            if ((_cache.items[_config.pos - 1] === undefined || $(_cache.items[_config.pos - 1]).html() === '') && (_config.pos - 1 >= 0)){
                API.getPage(prevPagePath, function(html){
                    var $html = $(html);

                    if (_cache.items[_config.pos - 1] === undefined){
                        _insertPage(html, false);
                    } else {
                        _overwritePage(html, false);
                    }

                    _loadNewCSS($html.data('css'));
                    Globals.ImageLazyLoader.initModuleLazyImages(_cache.currentGame.prev().find('.hero-module-wrap'));

                    _removePage(_cache.currentGame.next().next());
                    _reset();
                });
            }
        },

        // Rebuild the carousel, keeping the existing currentGame
        // - used when building the page's initial carousel
        _rebuildCarousel = function _rebuildCarousel(index){
            _config.pos = index;

            _removeAllPages(true);

            for (var i = _pageSet.TotalRecords; i--;){
                if (i === _config.pos){
                    // insert the retrieved HTML
                    _cache.slider.prepend(_cache.currentGame);
                } else {
                    // insert placeholders
                    _cache.slider.prepend('<li></li>');
                }
            }

            // Update the items
            _cache.items = _cache.slider.find('> li');
            // update the currentGame
            _cache.currentGame = _cache.slider.find('> li').eq(index);

            // reset the carousel
            //_reset();

            // make the new page "run"
            _initCarouselPage();

        },

        // Rebuild the Carousel, getting a new current Page
        // - used when selecting something from a search result set
        _rebuildAllPages = function _rebuildAllPages(index){
            _config.isFirstTime = true;

            _config.pos = index;

            _removeAllPages();

            API.getPage(_pageSet.SearchResult.Items[index].PageURL + '?rel=feature', function(html){

                for (var i = _pageSet.TotalRecords; i--;){
                    if (i === _config.pos){
                        // insert the retrieved HTML
                        _cache.slider.prepend(html);
                    } else {
                        // insert placeholders
                        _cache.slider.prepend('<li></li>');
                    }
                }

                // update the currentGame
                _cache.currentGame = $(_cache.slider.find('> li')[index]).eq(0);
                _cache.currentGame.addClass('current-game');

                // reset the carousel
                _reset();

                // make the new page "run"
                _initCarouselPage();
            });
        },

        _setCurrentGame = function _setCurrentGame(direction) {
            var newCurrentGame = null;

            if (direction === 'left'){
                newCurrentGame = _cache.currentGame.next().eq(0);
            } else {
                newCurrentGame = _cache.currentGame.prev().eq(0);
            }
            _cache.items.removeClass('current-game');


            // console.log(_cache.currentGame);
            // delete _cache.currentGame;
            // console.log(_cache.currentGame);

            _cache.currentGame = newCurrentGame;
            _cache.currentGame.addClass('current-game');

            SecondaryNav.SecondaryNav.assignColor();

            newCurrentGame = null;

        },

        _insertPage = function _insertPage(html, next){
            if (next){
                $(_cache.items[_config.pos]).after(html);
            } else {
                $(_cache.items[_config.pos]).before(html);
            }
        },

        _overwritePage = function _overwritePage(html, next){
            if (next){
                $(_cache.items[_config.pos + 1]).replaceWith(html);
            } else {
                $(_cache.items[_config.pos - 1]).replaceWith(html);
            }
        },

        _removePage = function _removePage(page, completelyRemove){
            if (page !== undefined){
                // remove the contents of the page from the DOM
                if (completelyRemove){
                    // CAUTION: It will unbind ALL the events attached to its children.
                    page.remove();
                } else {
                    page.empty();
                }

                page = null;
            }
        },

        _eradicateModules = function _eradicateModules(page){
            var heroWrap = page.find('.hero-module-wrap'),
                moduleWrap = heroWrap.siblings('.module-wrap'),
                gameFooter = page.find('footer');

            // module is stored in jQuery store, in main.js `_setupModules`
            moduleWrap.each(function(i, el){
                var element = $(el),
                    module = $.data(el, 'module');

                if (module) {
                    if (module.eradicate){
                        module.eradicate();
                    }
                    $.removeData(el, 'module');
                }

                element.waypoint('destroy');
                element.remove();
                module = null;
                element = null;
                el = null;

            });

            gameFooter.remove();
            gameFooter = null;
            moduleWrap = null;
            page = null;

        },

        _removeAllPages = function _removeAllPages(skipCurrentPage){
            for (var i = _cache.items.length; i--;){
              var item = $(_cache.items[i]);
              if (skipCurrentPage) {
                // If this is currentgame then let's skip.
                if (item.is(_cache.currentGame)){ continue; }
              }
              _removePage(item, true);
            }
        },

        _setPageSet = function _setPageSet(data){

            var gameToGameData = JSON.parse(JSON.stringify(data));

            // Remove any 'ads' from the results
            for (var j = gameToGameData.SearchResult.Items.length; j--;){
                var page = gameToGameData.SearchResult.Items[j];
                if (page.PageURL.toLowerCase().substring(0, 4) == "http"){
                    gameToGameData.SearchResult.Items.splice(j, 1);
                    gameToGameData.TotalRecords = gameToGameData.TotalRecords - 1;
                }
            }

            _pageSet = gameToGameData;

        },

        _goTo = function _goTo(index) {
            if (0 <= index && index < _config.totalItems){
              _config.pos = index;
              // Time to move
              _sliderXOffset(null, false, false);
            }

        },

        _resizeGameToGameNav = function _resizeGameToGameNav() {
            var index = _config.pos;
            // How much to move each time we slide
            _config.slideXDistance = _cache.sliderWrap.outerWidth();
            _config.pos = 0;

            if (0 === index) {
                _cache.slider.css('transform', 'translate(0,0)');
                _sliderSetup();
            } else {
                _sliderSetup();
                _goTo(index);
            }

        },

        _getPos = function _getPos() {
            return _config.pos;
        };

        // Public pointers
        return {
            init            : _init,
            rebuildAllPages : _rebuildAllPages,
            setPageSet      : _setPageSet,
            showArrows      : _showArrows,
            getPos          : _getPos
        };

    })();

    exports.GameToGameNav = GameToGameNav;

});
