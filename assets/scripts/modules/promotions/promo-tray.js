define(["Globals", "modules/slider/slider", "modules/game-to-game-nav"], function(Globals, Slider, GameToGameNav) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var Promotions = function Promotions(element){
        var _cache = {
            promoSocial  : null,
            sliderList   : null,
            heroPrev     : $('#heroPrev'),
            heroNext     : $('#heroNext'),
            links        : null,
            heroCarousel : $('#heroCarousel'),
            button       : $('#global-promotion-button'),
            promoWrap    : $('.promo-tray'),
            promoTrayNav : $('.btn-promo-tray-nav')
        },

        _isOpen = false,

        _slider = null,

        _promosPerPage = null,

        _init = function _init() {

            element = $(element).parent();

            _cache.promoWrap = element.find('.promo-tray');
            _cache.promoSocial = element.find('.promo-social');
            _cache.sliderList = element.find('.slider');
            _cache.links = _cache.sliderList.find('a.thumbnail');

            if (_cache.links.length > 0) {
                _initSlider();
                Globals.ImageLazyLoader.initPromoTrayLazyImages();
            }

        },

        _open = function _open(){

            var headerHeight = Globals.Settings.CONSTANTS.HEADER_HEIGHT,
                promoPanelHeight,
                styles;

            _isOpen = true;
            element.addClass("opened");
            _cache.sliderList.addClass('ready');
            _addEvents();
            _hideHeroNav();

            //if we're at the top of the screen push down, otherwise overlay
            //per the CSS, overlay is the default
            if (Globals.Helpers.cache.window.scrollTop() === 0) {
                setTimeout(function(){
                    promoPanelHeight = element.outerHeight();

                    styles = Modernizr.csstransforms ? {'transform': 'translate(0, ' + promoPanelHeight + 'px)'} : {'padding-top' : promoPanelHeight};

                    $('#heroCarousel').css(styles);
                }, 250);
            }

            Globals.Helpers.peekHeight = promoPanelHeight;
        },

        _close = function _close(){

            var offsetTop = element.outerHeight();

            _isOpen = false;
            element.removeClass("opened");

            var params = Modernizr.csstransforms ? {'transform': 'translate(0, ' + ( -offsetTop ) + 'px)'}
                                                 : {'top': -offsetTop};

            if (Modernizr.csstransitions) {
              element.css(params);
            } else {
              element.animate(params, 500, CONSTANTS.EASE);
            }

            //set the main page back to the top.
            $('#heroCarousel').css( {'transform': 'translate(0, 0px)'} );

            _cache.sliderList.removeClass('ready');
            GameToGameNav.GameToGameNav.showArrows();
            _removeEvents();
        },

        _setMaxWidth = function _setMaxWidth(){

            var promoTrayWidth = _cache.promoWrap.width();
                singleItemWidth = _cache.promoWrap.find('li').width(),
                itemsPerRow = Math.floor(promoTrayWidth / singleItemWidth),
                trimmedWidth = promoTrayWidth - (promoTrayWidth % itemsPerRow);

            _cache.promoWrap.css('max-width', trimmedWidth);

            if (Globals.Helpers.isMobile()){

                if (Globals.Helpers.isLandscape()){
                    // the images need to fit
                    _cache.links.css({
                        'height'     : (element.height() - 13) + 'px',
                        'text-align' : 'center'
                    });
                }

            }

        },

        _addEvents = function _addEvents(){
            element.on( CONSTANTS.EVENT_TRANSITION_END, function(e){
                if (!Globals.Helpers.isMobile() && $(e.target).is(this)){
                    _cache.promoSocial.css('height', $(_cache.links.get(0)).outerHeight());
                }
            });
            _cache.heroCarousel.on('click', _bodyEvent);
        },

        _removeEvents = function _removeEvents(){
            _cache.heroCarousel.off('click', _bodyEvent);
        },

        _bodyEvent = function _bodyEvent(){
            _cache.button.trigger('click');
        },

        _hideHeroNav = function _hideHeroNav(){
            _cache.heroPrev.removeClass('show');
            _cache.heroNext.removeClass('show');
        },

        _removeNavigation = function _removeNavigation() {
            _cache.promoTrayNav.hide();
        },

        _showNavigation = function _showNavigation() {
            _slider.setInactiveStates();
            _cache.promoTrayNav.show();
        },

        _initSlider = function _initSlider(){

            var slideOffset = 0;

            if (Globals.Helpers.isDesktop() || Globals.Helpers.isWidescreen()) {
                _promosPerPage = 3;
            } else if (Globals.Helpers.isTablet()) {
                _promosPerPage = 2;
            } else {
                _promosPerPage = 1;
            }

            _slider = new Slider();
            _slider.init({
                wrapEl : $('#promo-tray-container'),
                next : $('#promo-tray-next'),
                prev : $('#promo-tray-prev'),
                settings: {
                    maxVisibleItems : _promosPerPage,
                    slideMobileOffset : 0,
                    preventDefault: true,
                    withinCurrentGame: false
                }
            });

            if (_cache.links.length <= _promosPerPage){
                _removeNavigation();
            }

            _onSliderLoaded();
        },

        _onSliderLoaded = function _onSliderLoaded(){

            if (Modernizr.csstransitions) {
              element.on(CONSTANTS.EVENT_TRANSITION_END, 'li:first', function(e){
                if ('li' === e.currentTarget.tagName.toLowerCase() && /transform/.test(e.originalEvent.propertyName)) {
                  _resizePromoTray();
                  element.off(CONSTANTS.EVENT_TRANSITION_END, 'li:first');
                }
              });
            } else {
              _resizePromoTray();
            }

            _setMaxWidth();

            Globals.ResizeManager.addCallback(_resizePromoTray);
        },

        _resizePromoTray = function _resizePromoTray(){

            if (Globals.Helpers.isDesktop() || Globals.Helpers.isWidescreen()) {
                _promosPerPage = 3;
            } else if (Globals.Helpers.isTablet()) {
                _promosPerPage = 2;
            } else {
                _promosPerPage = 1;
            }

            if (_cache.links.length <= _promosPerPage){
                _removeNavigation();
            } else {

                if (!Globals.Helpers.isMobile()) {
                    _showNavigation();
                }

            }

            //reset the max-width before recalculations.
            _cache.promoWrap.css('max-width', '');
            _setMaxWidth();

            _cache.promoSocial.css('height', $(_cache.links.get(0)).outerHeight());

            if (Globals.Helpers.isMobile()){

                if (Globals.Helpers.isLandscape()){
                    // the images need to fit
                    _cache.links.css({
                        'height'     : (element.height() - 13) + 'px',
                        'text-align' : 'center'
                    });
                } else {
                    _cache.links.css('height', 'auto');
                }

            }

        };

        _init();

        return {
            open: _open,
            close: _close
        };
    };

    return Promotions;
});
