define(["exports", "Globals", "Hammer"], function(exports, Globals, hammer) {

    var Slider = function Slider() {

        /*jshint maxstatements:20 */

        var _cache = {
            'sliderWrap'       : null,
            'slider'           : null,
            'items'            : null,
            'indicatorWrap'    : null,
            'indicatorWrapList': null,
            'indicators'       : null,
            'next'             : null,
            'prev'             : null,
            'sneakAmountPixel' : 0,
            'thisModule'       : null,
            'prevModule'       : null,
            'nextModule'       : null
        },

        _config = {
            'slideXDistance'    : null,
            'slideMobileOffset' : 0,
            'slideTabletOffset' : 0,
            'sliderWrapWidth'   : null,
            'sliderWidth'       : null,
            'sliderHeight'      : null,
            'itemWidth'         : null,
            'maxDistance'       : null,
            'totalItems'        : null,
            'visibleItems'      : 1,
            'totalPages'        : null,
            'pos'               : 0,
            'maxVisibleItems'   : null,
            'preventDefault'    : false,
            'isNews'            : false,
            'isModuleB'         : false,
            'isEventsAdded'     : false,
            'sneakAmount'       : 0,
            'withinCurrentGame' : true,
            'options'           : null
        },

        _stopGoto = false,

        _init = function _init(options) {

            $.extend(_config, options.settings);
            _config.options = options;

            _setupCache(options);

            _config.sliderWrapWidth = _cache.sliderWrap.outerWidth();
            _config.totalItems = _cache.items.length;
            _config.isNews = _cache.sliderWrap.parents('.news-wrap').length ? true : false;
            _config.isModuleB = _cache.sliderWrap.parents('.module-b-wrap').length ? true : false;
            _config.cssTransitions = Modernizr.csstransitions;

            _sliderSetup();

        },

        _setupCache = function _setupCache(options) {

            _cache.currentGame = $('.current-game');

            if (_config.withinCurrentGame){
                _cache.sliderWrap = _cache.currentGame.find(options.wrapEl);
            } else {
                _cache.sliderWrap = options.wrapEl;
            }

            _cache.slider = _cache.sliderWrap.find('> .slider');
            _cache.items = _cache.slider.find('> li:visible');
            _cache.indicatorWrap = _cache.sliderWrap.find('> .indicator-wrap');
            _cache.indicatorWrapList = _cache.indicatorWrap.find('> ul');
            _cache.next = options.next ? options.next : _cache.indicatorWrap.find('.icon-next');
            _cache.prev = options.prev ? options.prev : _cache.indicatorWrap.find('.icon-previous');

            _cache.thisModule = _cache.sliderWrap.parents('.module-wrap');
            _cache.prevModule = _cache.thisModule.prev('.module-wrap');
            _cache.nextModule = _cache.thisModule.next('.module-wrap');

        },

        _sliderSetup = function _sliderSetup() {

            var isMobile = Globals.Helpers.isMobile(),
                isTablet = Globals.Helpers.isTablet(),
                itemSuffix;

            if (Globals.Helpers.isWidescreen()) {
                _config.visibleItems = (_config.maxVisibleItems && _config.maxVisibleItems < 4) ? _config.maxVisibleItems : 4;
            } else if (Globals.Helpers.isDesktop()) {
                _config.visibleItems = (_config.maxVisibleItems && _config.maxVisibleItems < 3) ? _config.maxVisibleItems : 3;
            } else if (Globals.Helpers.isTablet()) {
                _config.visibleItems = (_config.maxVisibleItems && _config.maxVisibleItems < 2) ? _config.maxVisibleItems : 2;
            } else {
               _config.visibleItems = 1;
            }

            //Module B has different max visible items than the other modules at the non-expanded view.
            if (_config.isModuleB && (_cache.sliderWrap.attr('id') !== 'module-b-expanded-slider')) {
                if( !Globals.Helpers.isMobile() ) {
                    _config.visibleItems = _config.visibleItems + 1;
                }
            }

            // How much to move each time we slide - Some mobile/tablet views may or may not have an offset
            if (isMobile) {
                _config.slideXDistance = _config.sliderWrapWidth + _config.slideMobileOffset;
            } else if (isTablet) {
                _config.slideXDistance = _config.sliderWrapWidth + _config.slideTabletOffset;
            } else {
                _config.slideXDistance = _config.sliderWrapWidth;
            }

            // Initial item width. Will be recalculated as a percentage once we've set the slider width.
            _config.itemWidth = _config.sliderWrapWidth / _config.visibleItems;
            // How many "pages"
            _config.totalPages = Math.ceil(_config.totalItems / _config.visibleItems);
            // Set the max distance the slider can be moved to
            _config.maxDistance = (_config.totalItems * _config.itemWidth) - _config.slideXDistance;

            _cache.sneakAmountPixel = _getSneakAmount();

            // Slider width
            _config.sliderWidth = Math.round(_config.totalItems * (_config.itemWidth - _cache.sneakAmountPixel));
            // Recalculate itemWidth as a percentage now (but not for mobile because safari messes up the pixel rounding)
            if (!isMobile) {
                _config.itemWidth = ((_config.sliderWidth / _config.totalItems) / _config.sliderWidth) * 100;
                itemSuffix = "%";
            }else{
                itemSuffix = "px";
            }
            // Set some visual properties
            _cache.items.css('width', _config.itemWidth + itemSuffix);
            _cache.slider.css('width', _config.sliderWidth);

            // Set up the page indicators
            _createIndicators();

            // Event assignment
            if (!_config.isEventsAdded) {
                _assignEvents();
            }

            if (_config.visibleItems === 1) {
                _cache.items.slice(0, 2).addClass('possibly-visible');
            }

        },

        _assignEvents = function _assignEvents() {

            if (Globals.Helpers.isTouchDevice()) {

                // Stop. HAMMER TIME! oh oh, ohh ohhh oh
                _cache.sliderWrap.hammer({
                    swipe_velocity        : (Globals.Helpers.isAndroid()) ? 0 : 0.6,
                    drag_block_horizontal : false,
                    drag_lock_to_axis     : true,
                    drag_min_distance     : 30,
                    prevent_default       : Globals.Helpers.isTouchDevice() ? false : _config.preventDefault,
                    stop_browser_behavior : {
                        touchAction : 'pan-y'
                    }
                }).on('release swipe dragleft dragright', _handleHammer);

            }

            _cache.indicatorWrap.on('click', 'li', function(e) {

                e.preventDefault();

                // Update position
                _config.pos = _cache.indicators.index($(this));
                _setInactiveStates();
                // Time to move
                _sliderXOffset(null, true);

            });

            _cache.next.on('click', function(e){
                e.preventDefault();
                _swipeHorzHandler('left', true);
            });

            _cache.prev.on('click', function(e){
                e.preventDefault();
                _swipeHorzHandler('right', true);
            });

            Globals.ResizeManager.addCallback(_resizeSlider);

            _config.isEventsAdded = true;

        },

        _removeEvents = function _removeEvents() {

            _cache.sliderWrap.hammer().off('release swipe dragleft dragright');
            _cache.indicatorWrap.off('click');
            _cache.next.off('click');
            _cache.prev.off('click');

            Globals.ResizeManager.removeCallback(_resizeSlider);

            _config.isEventsAdded = false;

        },

        _handleHammer = function _handleHammer(e) {

            e.gesture.preventDefault();

            var direction = e.gesture.direction,
                deltaX = e.gesture.deltaX;

            switch(e.type) {

                case 'dragright':
                case 'dragleft':

                    var pageOffset,
                        dragOffset = ((100 / _config.slideXDistance) * deltaX) / _config.totalPages;

                    if (_config.slideXDistance * _config.pos > _config.maxDistance) {
                        pageOffset = -(_config.maxDistance / _config.sliderWidth) * 100;
                    } else {
                        pageOffset = -((_config.slideXDistance / _config.sliderWidth) * 100) * _config.pos;
                        // Offsetting by sneakAmount
                        pageOffset += _config.pos * _cache.sneakAmountPixel / _config.sliderWidth * 100;
                    }

                    // If this is the first or last page slow the drag rate down a bit
                    if ((_config.pos === 0 && direction === 'right') || (_config.pos === _config.totalPages - 1 && direction === 'left')) {
                        dragOffset *= 0.4;
                    }

                    // Time to move
                    _sliderXOffset(dragOffset + pageOffset);

                    break;

                case 'swipe':

                    // Prevent any other gesture detection. Helps with swipe not getting confused for dragging
                    e.gesture.stopDetect();

                    // Determine appropriate event for the direction of the swipe
                    if (direction === 'left' || direction === 'right') {
                        _swipeHorzHandler(direction);
                    }

                    break;

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

        _swipeHorzHandler = function _swipeHorzHandler(direction) {

            // Determine the new position based on what direction we're sliding.
            if (direction === 'left' && _config.pos < (_config.totalPages - 1)) {
                _config.pos++;
            } else if (direction === 'right' && _config.pos > 0) {
                _config.pos--;
            }

            //_friendsWithBenefits();
            _setInactiveStates();
            // Time to move
            _sliderXOffset(null, true);

        },

        _friendsWithBenefits = function _friendsWithBenefits() {

            if (!_cache.prevModule.hasClass('hero-module-wrap')) {
                _cache.prevModule.addClass('accelerate');
            }
            _cache.nextModule.addClass('accelerate');

        },

        _setInactiveStates = function _setInactiveStates() {

            _cache.prev.toggleClass('inactive', 0 === _config.pos); // If this is first, deactivate prev.
            _cache.next.toggleClass('inactive', _config.totalPages - 1 === _config.pos); // If this is last item, deactivate next.

        },

        _sliderXOffset = function _sliderXOffset(percent, isAnimated) {

            // Set the percentage if one was not passed to the function
            var offset;

            _stopGoto = true;

            if (percent) {
                offset = percent;
            } else {

                if (_config.slideXDistance * _config.pos > _config.maxDistance) {
                    offset = -(_config.maxDistance / _config.sliderWidth) * 100;
                } else {
                    offset = -(_config.slideXDistance / _config.sliderWidth * 100) * _config.pos;
                    // Offsetting by sneakAmount
                    offset += _config.pos * _cache.sneakAmountPixel / _config.sliderWidth * 100;
                }

            }

            _cache.slider.removeClass('easing animate');

            if (isAnimated) {
                _cache.slider.addClass('animate');
            }

            if (_config.slideXDistance > _config.sliderWidth) {
              offset = 0;
            }

            // Slide...to infinity, and beyond!
            if (_config.cssTransitions) {
                _cache.slider.css('transform', 'translate(' + offset + '%,0)');
            } else {

                // Need PX values instead of %
                var pixels;

                if (_config.slideXDistance * _config.pos > _config.maxDistance) {
                    pixels = -_config.maxDistance;
                } else {
                    pixels = -_config.slideXDistance * _config.pos;
                    // Offsetting by sneakAmount
                    pixels += _config.pos * _cache.sneakAmountPixel;
                }

                if (_config.pos === 0) {
                    pixels = 0;
                }

                _cache.slider.animate({'left': pixels + 'px'}, 250);

            }

            if (_config.visibleItems === 1) {
                var min = Math.max(_config.pos - 1, 0),
                    max = Math.min( _config.pos + 2, _config.totalPages );

                _cache.items.removeClass('possibly-visible')
                _cache.items.slice(min, max).addClass('possibly-visible');

                min = null;
                max = null;
            }

            _updateIndicators();

            offset = null;

            setTimeout(function(){
                _stopGoto = false;
            }, 10);

        },

        _createIndicators = function _createIndicators() {

            // Make sure the indicator wrap is empty
            _cache.indicatorWrapList.empty();

            if (_config.totalPages > 1) {

                var fragment = document.createDocumentFragment();

                for (var i = _config.totalPages; i--;) {

                    var indicator = document.createElement('li');

                    if (i === _config.totalPages - 1) {
                        indicator.className = 'active';
                    }

                    fragment.appendChild(indicator);

                    indicator = null;

                }

                _cache.indicatorWrapList.append(fragment);
                // Cache the indicators
                _cache.indicators = _cache.indicatorWrapList.find('li');
                _cache.indicatorWrap.css('visibility', 'visible');

                fragment = null;

            } else {
                _cache.indicatorWrap.css('visibility', 'hidden');
            }

        },

        _updateIndicators = function _updateIndicators() {

            // Update indicators if they're present
            if (_cache.indicatorWrap.length && _cache.indicators !== null) {
                _cache.indicators.removeClass('active');
                $(_cache.indicators[_config.pos]).addClass('active');
            }

        },

        _getCurrentPage = function _getCurrentPage() {
            return _config.pos;
        },

        _getTotalPages = function _getTotalPages() {
            return _config.totalPages;
        },

        // Getting the pixel value of how much user can see the next slide
        _getSneakAmount = function _getSneakAmount() {

            // If this mobile sneak is not good way to go
            if (Globals.Helpers.isMobile()) return 0;

            if (/%/.test(_config.sneakAmount)){
                // Check if the itemWidth is in percent or pixel.
                var itemWidthPixel = _config.itemWidth <= 100 ? _config.itemWidth / _config.sliderWidth * 100 : _config.itemWidth;
                return itemWidthPixel * parseInt(_config.sneakAmount, 10) / 100;
            } else {
                return _config.sneakAmount;
            }

        },

        _goTo = function _goTo(index, isAnimated) {

            if (index >= _config.totalPages) {
                index = _config.totalPages - 1;
            }

            if (0 <= index && index <= _config.totalPages && !_stopGoto) {

                _config.pos = index;

                _setInactiveStates();
                // Time to move
                _sliderXOffset(null, isAnimated);

            }

        },

        _resizeSlider = function _resizeSlider() {

            _cache.slider.removeClass('animate');
            _config.sliderWrapWidth = _cache.sliderWrap.outerWidth();

            _sliderSetup();
            _goTo(_config.pos, false);

        },

        _reset = function _reset() {

            _setupCache(_config.options);
            _config.totalItems = _cache.items.length;
            _config.slideMobileOffset = Globals.Helpers.isMobile() ? _config.options.settings.slideMobileOffset : 0;

            if( _config.options.settings.slideTabletOffset !== undefined ) {
                _config.slideTabletOffset = _config.options.settings.slideTabletOffset;
            } else {
                _config.slideTabletOffset = 0;
            }

            _config.pos = 0;

            _resizeSlider();
            _setInactiveStates(); //make sure the arrows are reset correctly

        },

        _eradicate = function _eradicate(){

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

        };

        // Public pointers
        return {
            init              : _init,
            getCurrentPage    : _getCurrentPage,
            //swipeTo           : _swipeHorzHandler,
            goTo              : _goTo,
            reset             : _reset,
            eradicate         : _eradicate,
            totalPages        : _getTotalPages,
            setInactiveStates : _setInactiveStates
        };

    };

    return Slider;

});