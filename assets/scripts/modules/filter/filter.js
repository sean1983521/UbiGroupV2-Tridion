define(["modules/emitter-mixin", "Globals"], function(EmitterMixin, Globals) {

    /*
     * Filter View Class
     *
     * Emits following:
     *
     * - `change`: when user clicks label, passes back selected filter.
     * - `open`: when user opens the filter
     * - `close`: when user closes the filter
     */

    var Filter = function Filter() {

        var _cache = {
            'root'        : null,
            'typeLabel'   : null,
            'optionItems' : null,
            'select'      : null
        },

        _config = {
        },

        _emitter = EmitterMixin(),

        _init = function _init(options) {

            if (!options.root) {
                throw new Error('root(jQuery Object) is required for Filter class');
            }

            _config.options = options;
            _setupCache(_config.options.root);

            // Seems modules are loaded multiple times
            _detachEvents();
            _attachEvents();

            return this;

        },

        _setupCache = function _setupCache(root) {

            _cache.root = root;
            _cache.typeLabel = _cache.root.find('.filter-type');
            _cache.optionItems = _cache.root.find('li');
            _cache.select = _cache.root.find('select')

            if (!_cache.select.length) {

                var select = _cache.select = $('<select class="mobile-filter"/>')

                _cache.optionItems.each(function(i, el){

                    var item = $(el).find('button'),
                        value = item.attr('data-value'),
                        label = item.text(),
                        option = document.createElement('option');
                    

                    option.setAttribute('value', value);
                    $(option).text(label);
                    select.append(option);

                    option = null;

                });

                _cache.root.append(select);

                select = null;

            }

        },

        _attachEvents = function _attachEvents() {

            _cache.root.on('click', _onClick);
            _cache.root.on('click', 'button', _onButtonClick);
            _cache.select.on('change', _onSelect);

        },

        _detachEvents = function _detachEvents() {
            _cache.root.off('click');
            _cache.select.off('change');
        },

        _onClick = function _onClick(e) {

            var button = $('.btn-arrow', e.currentTarget);
            e.preventDefault();
            e.stopPropagation();
            
            if (Globals.Helpers.isTouchDevice() && Globals.Helpers.isMobile()) {
                return;
            }

            if (_cache.root.hasClass('open')) {
                _close();
                button.addClass('arrow-down').removeClass('arrow-up');
            } else {
                _open();
                button.addClass('arrow-up').removeClass('arrow-down');
            }

        },

        _onButtonClick = function _onButtonClick(e) {

            var selected = $(e.currentTarget),
                getValue = _config.options.getValue ? _config.options.getValue : function (el) {
                    return el.data('value');
                };

            _cache.optionItems.removeClass('selected');
            selected.parent().addClass('selected');

            _config.current = getValue(selected);
            _cache.typeLabel.text(selected.text());
            _emit('change', _config.current, selected);

        },

        _onSelect = function _onSelect(e){
          var index = _cache.select[0].selectedIndex;
          _cache.optionItems.eq(index).find('button').trigger('click');
        },

        _open = function _open() {

            _cache.root.addClass('open');
            _cache.typeLabel.toggleClass('grey-light white');
            Globals.Helpers.cache.body.on('click', _close);
            _emit('open');

        },

        _close = function _close() {

            _cache.root.removeClass('open');
            _cache.typeLabel.toggleClass('grey-light white');
            Globals.Helpers.cache.body.off('click', _close);
            _emit('close');

        },

        _getCurrent = function _getCurrent() {
            return _config.current;
        },

        _eradicate = function _eradicate() {

            _detachEvents();
            _close();
            _off();
            _garbage();
            //return this;

        },

        _garbage = function _garbage() {

            for (var item in _cache) {
                delete _cache[item];
            }

            for (var item in _config) {
                delete _config[item];
            }

        },

        // Emitter
        _on = _emitter.on,
        _off = _emitter.off,
        _emit = _emitter.emit;

        return {
            init       : _init,
            eradicate  : _eradicate,
            on         : _on,
            off        : _off,
            getCurrent : _getCurrent,
            //emit       : _emit,
        }
    };

    Filter.filterItems = function(items, type){

        var parentEl = items.parent();

        items
          .removeClass('filtered')
          .removeClass('first')
          .removeClass('un-filtered');

        if ('all' !== type.toLowerCase()) {
            parentEl.addClass('is-filter-active');
            var filter = items.filter('[data-type="' + type + '"]').addClass('un-filtered');
            filter.eq(0).addClass('first');
            items.not(filter).addClass('filtered');
        } else {
           parentEl.removeClass('is-filter-active');
        }
        return filter || items;
    }

    return Filter;

});
