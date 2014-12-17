define(["exports", "Globals"], function(exports, Globals) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var Expander = function Expander() {

        var _config = {
            'totalItems'          : null,
            'visibleItems'        : null,
            'visibleWideItems'    : null,
            'visibleDesktopItems' : null,
            'visibleTabletItems'  : null,
            'visibleMobileItems'  : null,
            'initVisRows'         : null,
            'totalRows'           : null,
            'totalPages'          : null,
            'pos'                 : null,
            'itemHeight'          : null,
            'rowHeight'           : null,
            'isMedia'             : false,
            'maxHeight'           : null,
            'isEventsAdded'       : false,
            'setHeightsTimeout'   : null,
            'moreYPos'            : null
        },

        _cache = {
            'expanderWrap'  : null,
            'expander'      : null,
            'expanderUL'    : null,
            'items'         : null,
            'more'          : null,
            'dummy'         : null,
            'moreText'      : null,
            'moduleWrap'    : null
        },

        _callbacks = {},

        _init = function _init(options) {

            _callbacks = options.callbacks;

            _config.initVisRows = 1;
            _config.pos = 1;

            $.extend(_config, options.settings);

            // Cache some elements
            _setupCache(options.wrapEl);
            // Setup
            _expanderSetup();
            _handleButtonVisibility();

        },

        _setupCache = function _setupCache(el) {

            _cache.expanderWrap = ('string' === typeof el) ? $('#' + el) : el;
            _cache.expander = _cache.expanderWrap.find('.expander');
            _cache.expanderUL = _cache.expander.find('.expander-list');
            _cache.items = _cache.expanderUL.find('> li');
            _cache.last = _cache.items.last();
            _cache.more = _cache.expanderWrap.find('.more');
            _cache.dummy = _cache.expanderWrap.find('.dummy');
            _cache.moreText = _cache.more.find('.more-text');
            _cache.moduleWrap = _cache.expanderWrap.parent();

            if (!_cache.dummy.length) { _cache.dummy = null; }

        },

        _expanderSetup = function _expanderSetup() {

            // Is this the media module?
            _config.isMedia = _cache.expanderWrap.parents('.media-wrap').length ? true : false;
            _config.totalItems = _cache.items.length;

            // How many items are visible per row
            if (Globals.Helpers.isWidescreen()) {
                _config.visibleItems = _config.visibleWideItems;
            } else if (Globals.Helpers.isDesktop()) {
                _config.visibleItems = _config.visibleDesktopItems;
            } else if (Globals.Helpers.isTablet()) {
                _config.visibleItems = _config.visibleTabletItems;
            } else {
                _config.visibleItems = _config.visibleMobileItems;
            }

            _setPages();

            //let's think about it for a sec.
            _config.setHeightsTimeout = setTimeout(function(){
                _setHeights();
            }, 10);


            // Event assignment
            if (!_config.isEventsAdded) {
                _assignEvents();
            }

            if (_config.isMedia) {

                if (_config.pos === _config.totalPages) {
                    _cache.dummy.addClass('hide');
                    _cache.more.addClass('hide');
                }

            } else {

                if (_config.totalItems <= _config.initVisRows) {
                    _cache.more.hide();
                }

            }

            _cache.expanderUL.addClass('animatable-list');

            _updateItems();


        },

        _handleButtonVisibility = function _handleButtonVisibility() {
            if (_config.totalPages == 1) {
                setTimeout(function(){
                    _cache.more.addClass('hide');
                }, 1);
            }
        },

        _setPages = function _setPages() {

            //How many rows?
            _config.totalRows = Math.ceil(_config.totalItems / _config.visibleItems);
            // How many "pages"?
            _config.totalPages = Math.ceil(_config.totalRows / _config.initVisRows);

            if (_config.isMedia) {
                // If the amount of items are directly divisible by the amount of visible items, we need to add an extra row.
                if (_config.totalItems % _config.visibleItems === 0) {
                    _config.totalRows = _config.totalRows + 1;
                }
            }
        },

        _setHeights = function _setHeights() {


            // Item height
            _config.itemHeight = _cache.items ? $(_cache.items.get(0)).outerHeight(true) : _config.itemHeight;
            // Multiply the item height
            _config.rowHeight = _config.itemHeight * _config.initVisRows;
            // Maximum height will be necessary
            _config.maxHeight = _config.itemHeight * _config.totalRows;

            // Set the max height
            _cache.expander.css('max-height', _config.maxHeight);
            _cache.expander.css('height', Math.round(_config.totalItems / _config.visibleItems) === 1 ? _config.itemHeight : _config.rowHeight);

        },

        _assignEvents = function _assignEvents() {

            _cache.expanderWrap.on('click', '.more', function(e) {

                _cache.expander.addClass('animate');

                if ($(this).hasClass('arrow-up')) {
                    _showLess();
                } else {
                    _showMore();
                }

                e.preventDefault();

            });

            _cache.expander.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
                _cache.expander.removeClass('animate');
            });

            // Resize handler
            Globals.ResizeManager.addCallback(_resizeExpander);

            _config.isEventsAdded = true;

        },

        _removeEvents = function _removeEvents() {

            _cache.expanderWrap.off('click');
            _cache.expander.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');

            Globals.ResizeManager.removeCallback(_resizeExpander);

            _config.isEventsAdded = false;

        },

        _showMore = function _showMore() {

            _config.moreYPos = _cache.more.offset().top;

            if (_config.pos + 1 <= _config.totalPages) {
                var height = null;

                _config.pos++;
                _updateItems();

                height = _config.rowHeight * _config.pos;

                if (_config.pos % _config.initVisRows !== 0) {
                    height =  height - _config.itemHeight;
                }

                _cache.expander.css('height', height);
            }

            if (_config.pos !== _config.totalPages) {
                _cache.more.addClass('arrow-down').removeClass('arrow-up');
                _cache.moreText.text('More');
            } else {
                _cache.more.addClass('arrow-up').removeClass('arrow-down');
                _cache.moreText.text('Less');
            }

            if (_config.isMedia) {

                var currentlyVisible = _config.pos * (_config.visibleItems * _config.initVisRows);

                if (currentlyVisible > _config.totalItems) {

                    _cache.more.addClass('static');
                    _cache.dummy && _cache.dummy.addClass('static');

                } else if (currentlyVisible < _config.totalItems) {

                    _cache.more.removeClass('static');
                    _cache.dummy &&_cache.dummy.removeClass('static');

                } else if (currentlyVisible === _config.totalItems) {

                    _cache.more.addClass('static');
                    _cache.dummy && _cache.dummy.addClass('static');
                    _cache.expander.css('height', _config.maxHeight);

                }

                setTimeout(function() {
                    $('html, body').animate(
                        { scrollTop: _config.moreYPos - 50 },
                        500,
                        Globals.Settings.CONSTANTS.EASE
                    );
                }, 500);

            }

        },

        _updateItems = function _updateItems() {

            var minIndex = Math.max(_getVisibleItems(_config.pos - 1).index - 2, 0),
                maxIndex = _getVisibleItems(_config.pos).index - (_config.isMedia ? 1 : 0);

            _cache.items.each(function (i, item) {

                var item = $(item),
                    delta = i - minIndex;

                if (delta >= 0) {
                    item.css('-webkit-transition-delay', CONSTANTS.TRANSITION_STAGGER_TIME * delta + 'ms');
                } else {
                    item.css('-webkit-transition-delay', 0 + 'ms');
                }

                if (0 <= i && i < maxIndex) {
                    item.addClass('ready-item');
                } else {
                    item.removeClass('ready-item');
                }

            });

            if (_config.pos !== _config.totalPages) {

                _cache.more.css({
                    position: '',
                    top: '',
                    left: ''
                });

            } else {

                _cache.items.eq(_cache.items.length - 2).addClass('ready-item');
                // Move the more button to dummy's rects place.
                if (_cache.dummy) {

                    _cache.more.css({
                        position: 'absolute',
                        top: _cache.dummy.position().top,
                        left: _cache.dummy.position().left
                    });

                }

            }

        },

        _showLess = function _showLess() {

            var scrollPos = _cache.moduleWrap.offset().top - CONSTANTS.HEADER_HEIGHT;

            _cache.expander.css('height', _config.rowHeight);
            _cache.more.addClass('arrow-down').removeClass('arrow-up static');
            _cache.dummy && _cache.dummy.addClass('arrow-down').removeClass('arrow-up static');
            _cache.moreText.text('More');

            _config.pos = 1;
            _updateItems();

            $('html, body').animate(
                { scrollTop: scrollPos },
                500,
                Globals.Settings.CONSTANTS.EASE
            );

        },

        _resizeExpander = function _resizeExpander() {

            _cache.more.addClass('arrow-down').removeClass('arrow-up static hide');
            _cache.dummy && _cache.dummy.addClass('arrow-down').removeClass('arrow-up static');
            _cache.moreText.text('More');

            _config.pos = 1;

            _expanderSetup();

            if (_config.totalItems <= _getVisibleItems(1).items.length) {
                _cache.more.hide();
            } else {
                _cache.more.show();
            }

        },

        _getVisibleItems = function _getVisibleItems(pos) {

            var index = pos * (_config.visibleItems * _config.initVisRows);

            return {
                index: index,
                items: _cache.items.filter(':lt(' + index + ')')
            };

        },

        _reset = function _reset() {

            // Cache some elements
            _cache.items = _cache.expanderUL.find('> li:visible');

            // Modifying config settings
            _config.totalItems = _cache.items.length;
            _config.pos = 1;

            _cache.more.addClass('arrow-down').removeClass('arrow-up static hide');
            _cache.dummy && _cache.dummy.addClass('arrow-down').removeClass('arrow-up static hide');
            _cache.moreText.text('More');

            _expanderSetup();

            if (_config.totalItems <= _getVisibleItems(1).items.length) {
                _cache.more.hide();
            } else {
                _cache.more.show();
            }

        },

        _eradicate = function _eradicate(){

            clearTimeout(_config.setHeightsTimeout);
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

            for (var item in _callbacks) {
                delete _callbacks[item];
            }

        };

        return {
            init           : _init,
            reset          : _reset,
            eradicate      : _eradicate,
            getVisibleItems: _getVisibleItems
        };

    };

    return Expander;

});
