define(["Globals", "modules/module-b/expanded-view", "modules/slider/slider", "modules/filter/filter"], function(Globals, ExpandedView, Slider, Filter) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var View = function View() {
        var _cache = {
            'root'                  : null,
            'nextModule'            : null,
            'filter'                : null,
            'minimizeButton'        : null,
            'maximizeButton'        : null,
            'items'                 : null,
            'sliderWrap'            : null,
            'expandItems'           : null,
            'expandedViewContainer' : null,
            'expandedView'          : null,
            'indicator'             : null
        },

        _config = {
            'expandedViewTimeout' : null,
            'isEventsAttached'    : null
        },

        _slider = new Slider(),
        _filterView = new Filter(),
        _type = 'all',

        _init = function _init(el) {

            _config.expandedViewTimeout = 0;
            _config.isEventsAttached = false;

            _setupCache(el);
            _setupFilter();
            _setupSlider();
            _attachEvents();

        },

        _setupCache = function _setupCache(el) {

            _cache.root = el;
            _cache.nextModule = _cache.root.next('.module-wrap');
            _cache.filter = _cache.root.find('.filter');
            _cache.minimizeButton = _cache.root.find('.button-minimize');
            _cache.maximizeButton = _cache.root.find('.icon-maximize');
            _cache.items = _cache.root.find('.module-item');
            _cache.sliderWrap = _cache.root.find('.slider-wrap-main');
            _cache.expandedViewContainer = _cache.root.find('.expanded-view-container');
            _cache.indicator = _cache.root.find('.indicator-wrap');

        },

        _setupSlider = function _setupSlider() {

            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    maxVisibleItems : 5,
                    slideMobileOffset: Globals.Helpers.isMobile() ? -80 : 0,
                    preventDefault: true
                }
            });

            if (Globals.Helpers.isMobile()){
                _cache.indicator.css('visibility', 'hidden');
            }

        },

        _updateCache = function _updateCache() {

            _cache.filter = _cache.root.find('.filter');
            _cache.minimizeButton = _cache.root.find('.button-minimize');
            _cache.maximizeButton = _cache.root.find('.icon-maximize');
            _cache.items = _cache.root.find('.module-item');
            _cache.sliderWrap = _cache.root.find('.slider-wrap-main');
            _cache.expandedViewContainer = _cache.root.find('.expanded-view-container');

        },

        _setupFilter = function _setupFilter(){

            _filterView
              .init({root: _cache.filter})
              .on('change', _filterItem);

        },

        _filterItem = function _filterItem(type) {

            Filter.filterItems(_cache.items, type);
            _slider.reset();

            if (_cache.expandedView && _cache.expandedView.isActive()) {
                _cache.expandedView.setFilter(type);
            }

            _type = type;

            if (Globals.Helpers.isMobile() || _slider.totalPages() < 2){
                _cache.indicator.css('visibility', 'hidden');
            } else {
                _cache.indicator.css('visibility', 'visible');
            }

        },

        _attachEvents = function _attachEvents() {

            if (!Globals.Helpers.isMobile()) {

                if (window.navigator.userAgent.indexOf('MSIE 10') != -1 && Globals.Helpers.isTouchDevice()){
                    _cache.root.on('dblclick', '.module-item', _onItemClick);
                } else {
                    _cache.root.on('click', '.module-item', _onItemClick);
                }
                _cache.root.on('click', '.icon-maximize', _onItemClick);
                _cache.minimizeButton.on('click', _deactivateExpandedView);

                _config.isEventsAttached = true;

                // _cache.items.on(CONSTANTS.EVENT_TRANSITION_END, _onItemHidden);

            }

            Globals.ResizeManager.addCallback(_resizeModuleB);

        },

        _attachMaximizeEvent = function _attachMaximizeEvent() {

            _cache.root.off('click', '.icon-maximize');
            _cache.root.on('click', '.icon-maximize', _onItemClick);

        },

        _fakeMaximizeEvent = function _fakeMaximizeEvent() {

            _cache.root.off('click', '.icon-maximize');
            _cache.root.on('click', '.icon-maximize', function(e) {
                e.preventDefault();
            });

        },

        _removeEvents = function _removeEvents() {

            _cache.root.off('click');
            _cache.root.off('dblclick');
            _cache.minimizeButton.off('click');

            Globals.ResizeManager.removeCallback(_resizeModuleB);

            _config.isEventsAttached = false;

        },

        /*
         * onclick it should scroll window to _cache section to fill it all the way
         * to the top.
         * */

        _onItemClick = function _onItemClick(e) {

            e.preventDefault();

            var index;

            if (_type.toLowerCase() !== 'all') {
                index = _cache.root.find('.module-item.un-filtered').index(e.currentTarget);
            } else {
                index = _cache.items.index(e.currentTarget);
            }

            if (!_cache.expandedView || !_cache.expandedView.isActive()) {

                Globals.Helpers.freezeBody();
                _cache.root.resize(); //force the window to the right width.

                _cache.expandedView = new ExpandedView();
                _cache.expandedView.init(_cache.expandedViewContainer, _type);
                _cache.expandItems = _cache.items.add(_cache.maximizeButton);
            }

            if (index === -1) index = 0;
            //timeout allows for resize to fire.
            setTimeout(function(){
                _activateExpandedViewWithIndex(index);
            }, 500);

        },

        _deactivateExpandedView = function _deactivateExpandedView(e) {

            Globals.Helpers.disableScroll();
            _cache.root.resize(); //force the window back to the right width.
            _cache.root.removeClass('is-expanded-view-active');

            if (e) {
                e.preventDefault();
            }

            if (!_cache.expandedView.isActive()) {
                return;
            }

            var y = -(Globals.Helpers.config.winHeight - _cache.initialHeight );

            setTimeout(function() {

                if (Modernizr.csstransitions) {

                    if (_cache.nextModule.length) {

                        _cache.nextModule.css({ 'transform' : 'translate(0, ' + y + 'px)' });

                        _cache.nextModule.on(CONSTANTS.EVENT_TRANSITION_END, function(e) {
                            _cache.root.css('height', _cache.initialHeight);
                            _cache.nextModule.css({
                                'transition': 'none',
                                'transform': 'translate(0, 0)'
                            });
                            _cache.nextModule.off(CONSTANTS.EVENT_TRANSITION_END);
                            _onSectionMinimize();
                        });

                    } else {

                        _cache.root.css('height', _cache.initialHeight);
                        _onSectionMinimize();

                    }

                } else {
                    _cache.root.animate(y, 500, CONSTANTS.EASE, _onSectionMinimize);
                    _cache.nextModule.css('transform', 'translate(0, 0)');
                }

            }, 300);

        },

        _onSectionMinimize = function _onSectionMinimize(e) {

            // Don't watch out for the transition event anymore
            if (e && Modernizr.csstransitions) {
                if (e.target !== _cache.root.get(0)) return
                _cache.root.off(CONSTANTS.EVENT_TRANSITION_END, _onSectionMinimize);
            }

            var fadeItems = _cache.items.add(_cache.root.find('.section-masthead'));

            Globals.Helpers.cache.header.removeClass('is-hidden');

            // I don't want to listen to any events for _cache ExpandedView while it's inactive.
            _cache.expandedView.eradicate();

            //scroll the page back down.
            setTimeout(function(){
                $('html, body').animate({
                  'scrollTop': _cache.root.offset().top - CONSTANTS.HEADER_HEIGHT
                }, 750, CONSTANTS.EASE)
                               .promise()
                               .done(function(){
                                    //animations complete
                                    Globals.Helpers.unfreezeBody();
                                    Globals.Helpers.enableScroll();
                                });
            }, 500);

            // Then putting items back to life.
            if (!Modernizr.touch) {
                fadeItems.each(function(i, el){
                  $(el).css({'transform': 'scale(1)', 'opacity': 1});
                });
            }

            setTimeout(function(){
              // We don't need _cache duration property anymore.
              fadeItems.css('transition-duration', '');
              _attachMaximizeEvent();
            }, 500)

            _cache.root.css('height', '');
        },

        /**
         * Activate expaneded view that shows the specific index
         */

        _activateExpandedViewWithIndex = function _activateExpandedViewWithIndex(index) {

            var fadeItems = _cache.items.add(_cache.root.find('.section-masthead')),
                height = $(window).height();

            _fakeMaximizeEvent();

            _cache.expandedViewContainer.css('height', height);
            _cache.initialHeight = _cache.root.height();

            //scroll the page up to the top.
            $('html, body').animate({
                'scrollTop': _cache.root.offset().top
            }, 750, CONSTANTS.EASE);

            Globals.Helpers.cache.header.addClass('is-hidden');

            //fade out the items.
            if (!Modernizr.touch) {
                fadeItems.each(function(i, el){
                    var $el = $(el);
                    $el.css({
                        'transition-duration': '.3s',
                        'transform': 'scale(0.9)',
                        'opacity': 0.3
                    });
                });
            }

            clearTimeout(_config.expandedViewTimeout);

            _cache.root.css({ 'height': height });

            _cache.root.addClass('is-expanded-view-active');

            _config.expandedViewTimeout = setTimeout(function(){

                _cache.expandedView.setupSlider(index);
                if ( Modernizr.csstransitions ) {
                    //sets up transition for minimize event.
                    _cache.nextModule.css({
                        'transition': '500ms cubic-bezier(0.860, 0.000, 0.070, 1.000)',
                        'z-index' : 10
                    });
                }
            }, 1);

        },

        _resizeModuleB = function _resizeModuleB() {

            _updateCache();

            if (!_config.isEventsAttached) {
                _attachEvents();
            }

            if (Globals.Helpers.isMobile() && _cache.expandedView) {
                _deactivateExpandedView();
                _removeEvents();
            }

            if (Globals.Helpers.isMobile() || _slider.totalPages() < 2){
                _cache.indicator.css('visibility', 'hidden');
            } else {
                _cache.indicator.css('visibility', 'visible');
            }

            // When expandedView is active...
            if (_cache.expandedView && _cache.expandedView.isActive()) {
                setTimeout(function(){
                    _cache.expandedViewContainer.css('height', window.innerHeight + 'px');

                    $('html, body').animate({
                        'scrollTop': _cache.root.offset().top
                    }, 750, CONSTANTS.EASE);
                }, 500);

            }
        },

        _eradicate = function _eradicate() {

            _slider.eradicate();
            _filterView.eradicate();
            _removeEvents();
            _garbage();

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

            _slider = null;
            _filterView = null;
            _type = null;

        };

        return {
            eradicate : _eradicate,
            init      : _init
        }
    };

    return View;
});
