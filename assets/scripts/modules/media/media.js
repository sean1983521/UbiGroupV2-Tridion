define(["exports", "Globals", "modules/expander/expander", "modules/filter/filter", "jQuery.tinyPubSub"], function(exports, Globals, Expander, Filter, TinyPubSub) {

	var Media = (function Media() {

        var _cache = {
            'mediaWrap'   		 : null,
            'mediaExpander'  	 : null,
            'mediaExpanderList'	 : null,
            'mediaExpanderItems' : null,
            'mediaMore'	         : null,
            'filter'             : null,
        },

        _config = {
        	'mediaItemHeight' : null,
            'currentFilter'   : null
        },


        _wasInitialized = false,

        _mediaExpander = null,

        _filterView = null,

        _init = function _init(el) {

            //console.log('Media init');

            _wasInitialized = true;
            _filterView = new Filter();

            _initExpander(el);

            Globals.ResizeManager.addCallback(_resizeMedia);

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Media');

        },

        _initExpander = function _initExpander(el) {

            _setupCache(el);
        	_setMoreDims();
            _initFilter();

        	_mediaExpander = new Expander();
            _mediaExpander.init({

                wrapEl: _cache.mediaExpander,
                settings: {
                    visibleWideItems    : 4,
                    visibleDesktopItems : 4,
                    visibleTabletItems  : 3,
                    visibleMobileItems  : 3,
                    initVisRows         : 2,
                },
                callbacks: {}

            });

        },

        _setupCache = function _setupCache(el) {

            _cache.mediaWrap = el;
            _cache.mediaExpander = _cache.mediaWrap.find('.expander-wrap'),
            _cache.mediaExpanderList = _cache.mediaExpander.find('.expander-list'),
            _cache.mediaExpanderItems = _cache.mediaExpanderList.find('> li');
            _cache.mediaMore = _cache.mediaExpander.find('.more');
            _cache.mediaDummy = _cache.mediaExpander.find('.dummy');
            _cache.filter = _cache.mediaWrap.find('.filter');

        },

        _setMoreDims = function _setMoreDims() {

            var bodyWidth = $('body').width(),
                singleItemWidth = $(_cache.mediaExpanderItems[0]).width(),
                itemsPerRow = Math.floor(bodyWidth / singleItemWidth),
                trimmedWidth = bodyWidth - (bodyWidth % itemsPerRow);

            setTimeout(function(){

                _config.mediaItemHeight = _cache.mediaExpanderItems.height();
                _cache.mediaMore.css('height', _config.mediaItemHeight);
                _cache.mediaDummy.css('height', _config.mediaItemHeight);

            }, 5);

            if (!Globals.Helpers.isMobile() && !Globals.Helpers.isTablet()){
                _cache.mediaWrap.css('max-width', trimmedWidth);
                _cache.mediaExpander.css('width', trimmedWidth);
            } else {
                _cache.mediaWrap.css('max-width', trimmedWidth);
                _cache.mediaExpander.css('width', trimmedWidth + 4);
            }
        },

        _initFilter = function _initFilter() {

            // How do you want filter to return the selected value.
            //
            // default:
            // function(selected){ return selected.data('value'); }

            var getValue = function(selected) {
                return selected.text();
            };

            _config.currentFilter = 'all';

            _filterView.init({

                root: _cache.filter,
                getValue: getValue

            }).on('change', _filterItems);

        },

        _filterItems = function _filterItems(type) {

            //console.log('filterItems: ', type);

            _config.currentFilter = type.toLowerCase();

            if (_config.currentFilter === 'all') {

                _cache.mediaExpanderItems.removeClass('filtered').removeClass('ready-item');

            } else {

                var filterOutItems = _cache.mediaExpanderItems.not('.last, .' + _config.currentFilter);

                //_cache.mediaExpanderItems.removeClass('filtered');
                //filterOutItems.addClass('filtered');

                _cache.mediaExpanderItems.removeClass('filtered').removeClass('ready-item');
                filterOutItems.addClass('filtered').addClass('ready-item');

            }

            _mediaExpander.reset();

        },

        _resizeMedia = function _resizeMedia() {
        	_setMoreDims();
        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {
                _mediaExpander.eradicate();
                _filterView.eradicate();
                Globals.ResizeManager.removeCallback(_resizeMedia);
                _wasInitialized = false;
                _garbage();
            }

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

            _mediaExpander = null;
            _filterView = null;

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();

	exports.Module = Media;

});
