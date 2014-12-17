define(["Globals"], function(Globals) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var View = function View(){

        var _cache = {
            'root'                 : null,
            'content'              : null,
            'readMoreToggleButton' : null,
            'sectionToggleButton'  : null,
            'activeIcon'           : null
        },

        _init = function _init(el) {

            _setupCache(el);
            _attachEvents();

        },

        _setupCache = function _setupCache(el) {

            _cache.root = el;
            _cache.content = _cache.root.find('.body-text');
            _cache.readMoreToggleButton = _cache.root.find('.toggle-wrap');
            _cache.sectionToggleButton = _cache.root.find('.bar-btn');
            _cache.activeIcon = _cache.sectionToggleButton.find('.icon');

        },


        _attachEvents = function _attachEvents() {

            _cache.root.on('click', '.toggle-wrap', _toggleReadMore);
            _cache.root.on('click', '.bar-btn', _toggleDisplay);

        },

        _toggleReadMore = function _toggleReadMore(e) {

            e.preventDefault();

            _cache.content.toggleClass('more', /more/.test(e.currentTarget.className));

        },

        _toggleDisplay = function _toggleDisplay(e) {

            e.preventDefault();

            _cache.root.toggleClass('active');
            _cache.activeIcon.toggleClass('icon-minus').toggleClass('icon-plus')
            _cache.sectionToggleButton.toggleClass('game-bg-color');

        },

        _eradicate = function _eradicate() {
            _cache.root.off('click');
            _garbage();
        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

        };

        return {
            eradicate : _eradicate,
            init      : _init
        }
    };

    return View;
});
