define(["exports", "Globals"], function(exports, Globals) {

    var Header = (function Header() {

        var _cache = {
            'globalNavMobile'  : null,
            'globalNavDesktop' : null,
            'uplayButton'      : null,
            'promotionButton'  : null,
            'searchButton'     : null,
            'detailNavIcon'    : null,
            'promoPanel'       : null,
            'pageHome'         : null,
            'relatedNavLink'   : null,
            'relatedNav'       : null,
            'relatedNavUL'     : null
        },

        _config = {
            activeClass      : "active",
            closeIcon        : "icon-close",
            uplayIcon        : "icon-uplay",
            promotionIcon    : "icon-flame-icon",
            searchIcon       : "icon-search",
            peakDelay        : 500,
            relatedNavHeight : 407
        },

        _hasHovered = false,

        _menuHoverCount = 0,

        _init = function _init() {
            _setupCache();
            _initGlobalNav();
            _checkPromoTray();
            _initPanels();
        },

        _setupCache = function _setupCache() {

            _cache.globalNavMobile  = $('#mobileRelatedNav');
            _cache.globalNavDesktop = Globals.Helpers.cache.header.find('.global-nav');
            _cache.uplayButton      = $('#global-uplay-button');
            _cache.promotionButton  = $('#global-promotion-button');
            _cache.searchButton     = $('#global-search-button');
            _cache.detailNavIcon    = $('#detailNavBtn').find('span');
            _cache.pageHome         = $('#heroCarousel');
            _cache.relatedNavLink   = Globals.Helpers.cache.header.find('.related-nav-link');
            _cache.relatedNavUL     = Globals.Helpers.cache.header.find('.related-nav');
            _cache.relatedNav       = _cache.relatedNavUL.find('a');

        },

        _initGlobalNav = function _initGlobalNav(){
            if (_config.relatedNavHeight > Globals.Helpers.cache.body.height()){
                _cache.relatedNavUL.css({
                    'max-height' : (Globals.Helpers.cache.body.height() - 50) + 'px',
                    'overflow-y' : 'scroll'
                });
            }
        },

        _checkPromoTray = function _checkPromoTray() {

            // Check to see if we should remove the promo tray and it's button
            if ($('.promo-tray-panel').find('a.thumbnail').length < 1) {

                $('.promo-tray-panel').remove();
                $('.global-nav').find('.item-promo').remove();

            }

        },

        _initPanels = function _initPanels() {

            require(["modules/header/panels"], function(panels){

                _cache.promoPanel = $('#promo-tray-container').parent();

                _addEvents();

                if (Globals.Helpers.isMobile()) {
                    _addMobileEvents();
                } else {
                    _addDesktopEvents();
                }

                if ((Globals.Helpers.getCookie('peakRan') != '1' && !Globals.Helpers.isTouchDevice()) && (location.search.length === 0)) {
                    $.subscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, function(){
                        _runPeak(panels[1]);
                    });
                }

            });

        },

        _addMobileEvents = function _addMobileEvents() {

            _cache.globalNavMobile.on('change', function(e) {

                var location = $(this).children('option:selected').attr('data-href');

                window.location = location;

            });

        },

        _addDesktopEvents = function _addDesktopEvents() {
            _cache.promoPanel.hover(function(e){
                _hasHovered = true;
            });
        },

        _addEvents = function _addEvents() {

            _cache.uplayButton.on('click', function(e) {
                e.preventDefault();

                var button = $(this);

                _closeDetailNav();
                _swapIcons(button, _config.uplayIcon);
            });

            _cache.promotionButton.on('click', function(e) {

                e.preventDefault();

                var button = $(this);

                _closeDetailNav();
                _swapIcons(button, _config.promotionIcon);

            });

            _cache.searchButton.on('click', function(e){

                e.preventDefault();

                var button = $(this);

                _closeDetailNav();
                _swapIcons(button, _config.searchIcon);

            });

            _cache.relatedNavLink.on('click', function(e){
                _cache.relatedNavLink.toggleClass('active');
                _cache.relatedNavUL.toggleClass('active');
                if (_cache.relatedNavLink.hasClass('active')){
                    setTimeout(_addBodyEvent, 1);
                }
            });

            if (!Globals.Helpers.isTouchDevice()) {

                _cache.relatedNavLink.hover(function(e){
                    _menuHoverCount++;
                    _cache.relatedNavLink.addClass('hovering');
                    _cache.relatedNavUL.addClass('hovering');
                }, function(e){
                    _menuHoverCount--;
                    setTimeout(function(){
                        if (!_cache.relatedNavLink.hasClass('active') && _menuHoverCount == 0){
                            _cache.relatedNavLink.removeClass('hovering');
                            _cache.relatedNavUL.removeClass('hovering');
                        }
                    }, 1);
                });

                _cache.relatedNavUL.hover(function(e){
                    _menuHoverCount++;
                }, function(e){
                    _menuHoverCount--;
                    setTimeout(function(){
                        if (_menuHoverCount == 0){
                            _cache.relatedNavLink.removeClass('hovering');
                            _cache.relatedNavUL.removeClass('hovering');
                        }
                    }, 1);
                });

            }

            _cache.relatedNav.on('click', function(e){
                _hideMenu();
            });

        },

        _addBodyEvent = function _addBodyEvent(){
            Globals.Helpers.cache.body.on('click tap', _hideMenu);
        },

        _removeBodyEvent = function _removeBodyEvent(){
            Globals.Helpers.cache.body.off('click tap', _hideMenu);
        },

        _hideMenu = function _hideMenu(){
            _cache.relatedNavLink.removeClass('active').removeClass('hovering');
            $('ul.related-nav').removeClass('active').removeClass('hovering');
            _removeBodyEvent();
        },

        _runPeak = function _runPeak(panel) {
            if (panel != undefined) {

                setTimeout(function() {
                    _cache.promotionButton.trigger('click');
                }, _config.peakDelay);

                Globals.Helpers.setCookie('peakRan', "1");

            }

        },

        _swapIcons = function _swapIcons(button, icon) {

            if (button.hasClass('active')) {
                button.removeClass('active');
                button.children('span:not(#uplay-login)').removeClass(_config.closeIcon).addClass(icon);
            } else {
                button.addClass('active');
                button.children('span:not(#uplay-login)').removeClass(icon).addClass(_config.closeIcon);
            }

        },

        _closeDetailNav = function _closeDetailNav() {

            Globals.Helpers.cache.body.removeClass('nav-open');
            _cache.detailNavIcon.removeClass('icon-close').addClass('icon-menu');

        };

        return {
            init : _init
        };

    })();

    exports.Header = Header;

});
