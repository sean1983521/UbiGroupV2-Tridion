define(["Globals", "modules/slider/slider", "modules/filter/filter"], function(Globals, Slider, Filter) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var ExpandedView = function ExpandedView(el) {

        var _cache = {
            'root'       : null,
            'arrows'     : null,
            'images'     : null,
            'items'      : null,
            'sliderWrap' : null,
            'buttonWrap' : null
        },

        _config = {
            'containerHeight' : null,
            'active'          : null
        },

        _slider = null;

        _init = function _init(el, type) {

            _setupCache(el);

            _config.containerHeight = _cache.root.height();
            _config.active = false;

            _slider = new Slider();
            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    maxVisibleItems : 1,
                    preventDefault  : true
                },
                next: _cache.root.find('.next'),
                prev: _cache.root.find('.prev')
            });

            _assignEvents();
            _setFilter(type);

        },

        _setupCache = function _setupCache(el){

            _cache.root = el;
            _cache.arrows = _cache.root.find('.btn-large-arrow');
            _cache.images = _cache.root.find('.module-item-image');
            _cache.items = _cache.root.find('.module-expanded-item');
            _cache.sliderWrap = _cache.root.find('.slider-wrap');
            _cache.buttonWrap = _cache.root.find('.button-wrap');
            _cache.info = _cache.root.find('.module-item-info');
            _cache.sectionHeader = _cache.root.parents('.section-header');

        },

        _assignEvents = function _assignEvents() {
            Globals.ResizeManager.addCallback(_resizeModuleB);
        },

        _removeEvents = function _removeEvents() {
            Globals.ResizeManager.removeCallback(_resizeModuleB);
        },

        _setupSlider = function _setupSlider(index) {

            _slider.goTo(index, false);
            _config.active = true;
            _resizeModuleB();
            Globals.Helpers.disableScroll();

        },

        _teardownSlider = function _teardownSlider() {

            _config.active = false;
            if (_slider !== null) {
                _slider.eradicate();
            }
            Globals.Helpers.enableScroll();

        },

        _resizeModuleB = function _resizeModuleB() {

            // Only reposition them when expand view is open
            if (_config.active) {

                var padding = 0,
                    sectionHeaderHeight = _cache.sectionHeader.height(),
                    containerHeight = _config.containerHeight = window.innerHeight,
                    buttonWrapHeight = _cache.buttonWrap.outerHeight(true),
                    sliderWrapHeight = containerHeight - buttonWrapHeight,
                    infoHeight = _cache.info.filter(':visible').outerHeight() + padding;

                if (Globals.Helpers.isMobile()) {
                    sliderWrapHeight += buttonWrapHeight;
                }

                _cache.arrows.css('top', ( containerHeight - ( CONSTANTS.HEADER_HEIGHT + sectionHeaderHeight + infoHeight) - 60 ) / 2  )

                _cache.sliderWrap.css('height', sliderWrapHeight);

                if (!Globals.Helpers.isMobile()) {

                    // TODO: TOO MUCH CALC on dimension, needs to be revisited for perfomrance improvements.
                    _cache.images.each(function(i, el){

                        var $el = $(el),
                            maxWidthProp = parseInt($el.css('max-width'), 10),
                            maxWidth = Math.min(isNaN(maxWidthProp) ? Globals.Helpers.config.winWidth * 0.9 : maxWidthProp, Globals.Helpers.config.winWidth * 0.9),
                            originalHeight = el.naturalHeight,
                            originalWidth = el.naturalWidth,
                            ratio = originalWidth / originalHeight,
                            potentialHeight = sliderWrapHeight - infoHeight,
                            potentialWidth = potentialHeight * ratio,
                            top = 0, height, width;

                        if (potentialWidth > maxWidth) {
                          width = maxWidth;
                          height = width / ratio;
                          if (height > potentialHeight) {
                            var scale = potentialHeight / height;
                            width *= scale;
                            height *= scale;
                          }
                          top = (potentialHeight - height) / 2;
                        } else {
                          height = potentialHeight;
                          width = potentialWidth;
                        }

                        $el.css({
                          height: height,
                          width: width,
                          top: top
                        });

                    });

                }
            }
        },

        _isActive = function _isActive() {
            return _config.active;
        },

        _getSlider = function _getSlider() {
            return _slider;
        },

        _pad = function _pad(number, width, paddingLetter) {

            paddingLetter = paddingLetter || '0';
            number = number + '';
            return number.length >= width ? number : new Array(width - number.length + 1).join(paddingLetter) + number;

        },

        _setFilter = function _setFilter(type) {

            var selected = Filter.filterItems(_cache.items, type),
                count = selected.length,
                labelKey = 'all' === type ? 'generalType' : 'type',
                countZeroPadded = _pad(count, 3);

            selected.each(function(i, el){

                var $el = $(el),
                    label = $el.find('.type-label').data(labelKey) + ":";

                $el.find('.type-label').text(label);
                $el.find('.count').text(_pad(i + 1, 3) + "/" + countZeroPadded);

            });

            _slider.reset();
            _resizeModuleB();

        },

        _eradicate = function _eradicate() {
            _teardownSlider();
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
            _cache = null;

        };


        return {
            init: _init,
            setupSlider: _setupSlider,
            isActive: _isActive,
            getSlider: _getSlider,
            teardownSlider: _teardownSlider,
            setFilter: _setFilter,
            eradicate: _eradicate
        }

    };

    return ExpandedView;
});
