define(["exports", "Globals", "modules/module-a/expanded-view", "modules/slider/slider", "jQuery.tinyPubSub"], function(exports, Globals, ExpandedView, Slider, TinyPubSub) {

    var ModuleA = (function ModuleA() {

        var _cache = {
            'root'                   : null,
            'minimizeButton'         : null,
            'maximizeButton'         : null,
            'items'                  : null,
            'expandItems'            : null,
            'smallItemSliderElement' : null,
            'primarySection'         : null,
            'secondarySection'       : null,
            'expandedView'           : null,
            'sliderWrap'             : null
        },

        _config = {
            'initialHeight': 0
        },

        _slider = null,

        _wasInitialized = false,

        _init = function _init(el) {

            //console.log('Module-A init');

            _setupCache(el);

            _setupSlider();

            _attachEvents();

            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Module A');

        },

        _setupCache = function _setupCache(el) {

            _cache.root = el;

            _cache.minimizeButton = _cache.root.find('.icon-minimize');
            _cache.maximizeButton = _cache.root.find('.icon-maximize');

            _cache.primarySection = _cache.root.find('.module-section-primary');
            _cache.secondarySection = _cache.root.find('.module-section-secondary');

            _cache.primarySliderElement = _cache.primarySection.find('.slider-wrap');
            _cache.primaryHeaderElement = _cache.primarySection.find('header');
            _cache.primaryItems = _cache.primarySection.find('.module-item');

            _cache.smallItemSliderElement = _cache.secondarySection.find('.slider-wrap');
            _cache.smallItems = _cache.root.find('.module-item-small');
            _cache.sliderWrap = _cache.root.find('.slider-wrap-main');

        },

        _setupSlider = function _setupSlider() {

            _slider = new Slider();
            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    maxVisibleItems : 1,
                    sneakAmount: Globals.Helpers.isDesktop() || Globals.Helpers.isWidescreen() ? '20%' : 0,
                    slideTabletOffset: Globals.Helpers.isTablet() ? -60 : 0
                }
            });

        },

        _attachEvents = function _attachEvents() {

            _cache.maximizeButton.on('click', _activateExpandedView);
            _cache.minimizeButton.on('click', _onMinimizeButtonClick);

            _cache.primarySection.on('click', '.module-item', _onPrimaryItemClick);
            _cache.root.on('click', '.module-item-small', _onSmallItemClicked);

            Globals.ResizeManager.addCallback(_resizeModuleA);
        },

        _removeEvents = function _removeEvents() {

            _cache.maximizeButton.off('click');
            _cache.minimizeButton.off('click');
            _cache.primarySection.off('click');
            _cache.root.off('click');

            Globals.ResizeManager.removeCallback(_resizeModuleA);

        },

        _onSmallItemClicked = function _onSmallItemClicked(e){

            e.stopPropagation();
            e.preventDefault();

            var index = $(e.currentTarget).index();

            _slider.goTo(index, true);

        },

        _onPrimaryItemClick = function _onPrimaryItemClick(e){

            e.stopPropagation();
            e.preventDefault();

            var target = $(e.currentTarget),
                index = target.index();

            if (index > -1) {
                _slider.goTo(index, true);
            }
        },

        _onMinimizeButtonClick = function _onMinimizeButtonClick(e) {
            e.stopPropagation();
            e.preventDefault();
            _deactivateExpandedView();
        },

        _deactivateExpandedView = function _deactivateExpandedView() {

            Globals.Helpers.unfreezeBody();
            // No need to resize here, let's just eradicate stuff
            //_cache.root.resize();
            // _slider.eradicate();
            // _setupSlider();

            // ExpandedView is no more active.
            _cache.root.removeClass('is-expanded-view-active');

            // TODO: ALL of these timeouts should be handled by transitionEnd
            // Wait a little bit until ExpandedView hides.
            _cache.expandedViewTimeout = setTimeout(function(){
                
                if (Modernizr.csstransitions) {
                    _cache.primarySliderElement.css('padding-top', 0);
                    _cache.primarySection.css('height', _config.initialHeight + 'px');
                    _cache.primarySection.one(Globals.Settings.CONSTANTS.EVENT_TRANSITION_END, _onSectionMinimize);
                } else {
                    _cache.primarySliderElement.animate({ 'padding-top': 0 }, 500, Globals.Settings.CONSTANTS.EASE, _onSectionMinimize);
                    _cache.primarySection.animate({'height': _config.initialHeight}, 500, Globals.Settings.CONSTANTS.EASE, _onSectionMinimize);
                }

            }, 300);

        },

        _onSectionMinimize = function _onSectionMinimize(e){

            Globals.Helpers.cache.header.removeClass('is-hidden');

            _cache.expandedView.teardownSlider();

            $('html, body').delay(100).stop(true, true).animate({
                'scrollTop': _cache.root.offset().top - Globals.Settings.CONSTANTS.HEADER_HEIGHT
            }, 750, Globals.Settings.CONSTANTS.EASE);

            // Its completely hidden!
            _cache.root.removeClass('is-expanded-view-open');

        },

        /**
         * Activate expaneded view that shows the specific index
         */

        _activateExpandedView = function _activateExpandedView(e) {

            e.stopPropagation();
            e.preventDefault();

            Globals.Helpers.freezeBody();
            //_cache.root.resize(); //force the page to resize.

            _cache.expandedView = new ExpandedView();
            _cache.expandedView.init(_cache.secondarySection);
            _cache.expandedView.setupSlider(0, false);

            $('html, body').animate({
                'scrollTop': _cache.root.offset().top
            }, 750, Globals.Settings.CONSTANTS.EASE);

            _config.initialHeight = _cache.primarySection.outerHeight(true);
            _cache.primarySection.css({height: _config.initialHeight});
            _cache.primarySection.outerWidth(); // Force redraw

            _cache.root.addClass('is-expanded-view-active');
            Globals.Helpers.cache.header.addClass('is-hidden');

            var secondarySectionHeight = _cache.secondarySection.find('.module-small-slider').outerHeight(true),
                windowParam = { 'height' : window.innerHeight },
                sectionParam = { 'height': window.innerHeight  - secondarySectionHeight },
                sliderParam = { 'padding-top': (sectionParam.height  - _cache.primaryHeaderElement.outerHeight() - 30 - _cache.primarySliderElement.outerHeight()) / 2 };

            _cache.expandedView.setupSlider();

            if ( Modernizr.csstransitions ) {
                _cache.primarySliderElement.css(sliderParam);
                _cache.primarySection.css(windowParam);
                _cache.primarySection.on(Globals.Settings.CONSTANTS.EVENT_TRANSITION_END, _onSectionExpand)
            } else {
                _cache.primarySliderElement.animate(sliderParam, 500, Globals.Settings.CONSTANTS.EASE);
                _cache.primarySection.animate(windowParam, 500, Globals.Settings.CONSTANTS.EASE, _onSectionExpand);
            }

        },

        _onSectionExpand = function _onSectionExpand(e){
            // Don't watch out for the transition event anymore
            if (Modernizr.csstransitions) {
                if (e.target !== _cache.primarySection.get(0)) return
                _cache.primarySection.off(Globals.Settings.CONSTANTS.EVENT_TRANSITION_END, _onSectionExpand);
            }
            _cache.root.addClass('is-expanded-view-open');
        },

        _resizeModuleA = function _resizeModuleA() {

            if (_cache.expandedView && _cache.expandedView.isActive()) {
                
                _cache.primarySection.css('height', window.innerHeight + 'px');
                
                $('html, body').delay(100).stop(true, true).animate({
                    'scrollTop': _cache.root.offset().top
                }, 750, Globals.Settings.CONSTANTS.EASE);

            }

            _slider.eradicate();
            _setupSlider();
        },

        _eradicate = function _eradicate() {

            _removeEvents();

            if (_cache.expandedView && _cache.expandedView.isActive()) {
                _cache.expandedView.eradicate();
            }
            _slider.eradicate();
            _garbage();

        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {
                // _view.eradicate();
                _removeEvents();

                if (_cache.expandedView && _cache.expandedView.isActive()) {
                    _cache.expandedView.eradicate();
                }
                _slider.eradicate();
                _garbage();
            }

        },

        _garbage = function _garbage() {

            // _view = null;

            for (var item in _cache) {
                delete _cache[item];
            }

            delete _config.initialHeight;

            _slider = null;

        };

        // Public pointers
        return {
            init: _init,
            eradicate: _eradicate
        };

    })();

    exports.Module = ModuleA;

});