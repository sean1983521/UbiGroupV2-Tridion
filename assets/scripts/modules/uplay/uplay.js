define(["exports", "Globals", "jQuery.tinyPubSub"], function(exports, Globals, TinyPubSub) {

    var Uplay = (function Uplay() {

        var _cache = {
          'uplayWrap' : null,
          'content'   : null,
          'header'    : null,
          'viewAll'   : null
        },

        _wasInitialized = false,

        _init = function _init(el) {

            //console.log('Uplay init');

            _setupCache(el);
            _addEvents();
            _sizeRows();

            _cache.content.find('.actions li').last().remove();
            _cache.content.find('.rewards li').last().remove();

            _wasInitialized = true;

            // Module is initialized, let everyone know it's a party.
            $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, 'Uplay');

        },

        _setupCache = function _setupCache(el) {

            _cache.uplayWrap = el;
            _cache.content = _cache.uplayWrap.find('.uplay-content');
            _cache.header = _cache.uplayWrap.find('header');
            _cache.viewAll = _cache.uplayWrap.find('.section-footer .cta-btn');

        },

        _addEvents = function _addEvents() {

            _cache.header.on('click', 'h1', function(e) {

                e.preventDefault();

                var item = $(this);

                if (Globals.Helpers.isMobile() || Globals.Helpers.isTablet()) {

                    var show = _cache.uplayWrap.find('section').eq(item.index());

                    item.siblings().removeClass('on');
                    item.addClass('on');

                    show.removeClass('hide');
                    show.siblings('section').addClass('hide');

                }

            });

            Globals.ResizeManager.addCallback(_sizeRows);

        },

        _removeEvents = function _removeEvents() {

            _cache.header.off('click');
            Globals.ResizeManager.removeCallback(_sizeRows);

        },

        _sizeRows = function _sizeRows () {

            if (Globals.Helpers.isMobile()) {
                _cache.content.find('li').attr('style','');
            } else {
                var height = 0;

                _cache.content.find('.additional-box').each(function() {
                    height = $(this).height() > height ? $(this).height() : height;
                });

                _cache.content.find('li').css('height', height);
            }
        },

        _eradicate = function _eradicate() {

            if (_wasInitialized) {
                _removeEvents()
                _wasInitialized = false;
                _garbage();
            }

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        // Public pointers
        return {
            eradicate : _eradicate,
            init      : _init
        };

    })();

    exports.Module = Uplay;
});
