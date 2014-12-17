define(["Globals", "modules/slider/slider", "modules/filter/filter", "api"], function(Globals, Slider, Filter, API) {

    var CONSTANTS = Globals.Settings.CONSTANTS;

    var View = function View() {

        var _cache = {
            'root'   : null,
            'items'  : null,
            'filter' : null
        },

        _slider = null,

        _secondarySlider = null,

        _filterView = new Filter(),

        _init = function _init(el) {

            _setupCache(el);
            _setupSlider();
            _setupFilter();
            _attachEvents();

        },

        _setupCache = function _setupCache(el) {

            _cache.root = el;
            _cache.primarySection = _cache.root.find('.module-section-primary')
            _cache.sliderWrap = _cache.primarySection.find('.slider-wrap');

            _cache.secondarySection = _cache.root.find('.module-section-secondary')
            _cache.secondarySliderWrap = _cache.secondarySection.find('.slider-wrap');

            //_cache.sliderWrap = _cache.root.find('.module-small-slider')
            _cache.items = _cache.root.find('.module-item');
            _cache.filter = _cache.root.find('.filter');

            _cache.root.toggleClass('is-single-item', 1 === _cache.items.length)

        },

        _setupSlider = function _setupSlider() {

            _slider = new Slider();

            _secondarySlider = new Slider();

            _slider.init({
                wrapEl : _cache.sliderWrap,
                settings: {
                    maxVisibleItems: 1,
                    preventDefault: true
                }
            });

            _secondarySlider.init({
                wrapEl : _cache.secondarySliderWrap,
                settings: {
                    maxVisibleItems: 4,
                    preventDefault: true
                }
            });

        },

        _setupFilter = function _setupFilter() {
            _filterView.init({root: _cache.filter }).on('change', _filterChange);
        },

        _filterChange = function _filterChange(value, el) {

            // Put loading mode
            var request = API.getPage('/assets/dummy-data/purchase-' + value + ".html");
            request.done(_onGetPage);

        },

        _onGetPage = function _onGetPage(html) {

            _slider.eradicate();
            _secondarySlider.eradicate();
            _cache.primarySection.remove();
            _cache.secondarySection.remove();
            $(html).filter('.fragment').children().appendTo(_cache.root);
            Globals.ImageLazyLoader.initPurchaseLazyImages();
            _setupCache(_cache.root);
            _setupSlider();
            _attachEvents();

        },

        _attachEvents = function _attachEvents() {
            _cache.secondarySliderWrap.on('click', '.module-item', _onItemClick);
        },

        _removeEvents = function _removeEvents() {
            _cache.secondarySliderWrap.off('click', '.module-item', _onItemClick);
        },


        /*
         * onclick it should scroll window to _cache section to fill it all the way
         * to the top.
         * */

        _onItemClick = function _onItemClick(e) {

            var index = _cache.items.index(e.currentTarget);

            if (index === -1) { index = 0; }

            _slider.goTo(index, true);

        },

        _eradicate = function _eradicate() {

            _removeEvents();
            _slider.eradicate();
            _secondarySlider.eradicate();
            _filterView.eradicate();
            _garbage();

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            _slider = null;
            _secondarySlider = null;
            _filterView = null;

        };

        return {
            eradicate : _eradicate,
            init      : _init
        }
    };

    return View;
});
