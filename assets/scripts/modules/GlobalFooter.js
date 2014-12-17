define(["require", "exports", "Globals"], function (require, exports, Globals) {

    var Footer = (function Footer() {
        var _config = {
            langSelectorHeight: 0
        },

        _cache = {
            "langSelector": $('#langSelect'),
            "langRegions": $('#langSelectRegions'),
            "langSelectorBtn": $('#langSelectToggle'),
            "langMobileBack": $('#langSelectBack'),
            "headerLangSelector": $('#header-lang-select')
        },

        _gamesShown = null,

        //SHA
        _init = function _init() {
            //console.log('Global Footer init');
            _initLangSelected();
            _initLangSelector();
            _addEventHandlers();
        },

        _initLangSelected = function _initLangSelected() {
            var pageUrl = document.URL;
            var currentLocale = pageUrl.split('/')[3];
            var localeDescriptionFooter;
            var localeDescriptionHeader;
            $.each(_cache.langRegions.find('li'), function (i, d) {
                var locale = $(this).find('a').attr('data-locale');
                var url = pageUrl.replace(currentLocale, locale);
                //$(this).find('a').attr('href', url)
                if (locale != '' && pageUrl.indexOf(locale) >= 0) {
                    localeDescriptionFooter = $(this).find('a').text();
                }
            });
            _cache.langSelectorBtn.find('#localeDescriptionFooter').text(localeDescriptionFooter);

            $.each(_cache.headerLangSelector.find('li'), function (i, d) {
                var locale = $(this).find('a').attr('data-locale');
                var url = pageUrl.replace(currentLocale, locale);
                //$(this).find('a').attr('href', url)
                if (locale != '' && pageUrl.indexOf(locale) >= 0) {
                    localeDescriptionHeader = $(this).find('a').text();
                }
            });
            _cache.headerLangSelector.find('#localeDescriptionHeader').text(localeDescriptionHeader);
        },
        //SHA

        _initLangSelector = function _initLangSelector() {
            var defaultCountry = _cache.langRegions.find('li.selected');
            _cache.langSelectorBtn.html(defaultCountry.find('a').html());
            //expand region-col by default
            _cache.langRegions.find('.region-col').removeClass('closed');
            if (Globals.Helpers.isMobile()) {
                _cache.langSelectorBtn.removeClass('arrow-down').removeClass('arrow-up').addClass('arrow-right');
            }
        },

        _addEventHandlers = function _addEventHandlers() {

            //click on langugage selector button
            _cache.langSelectorBtn.on('click', _handleLanguageBtnClick);

            // click on language selector region header
            _cache.langRegions.on('click', 'h3', _handleRegionClick);

            // click on a language selector country
            _cache.langRegions.on('click', '.regions-container a', _handleCountryClick);

            // click on mobile back button
            _cache.langMobileBack.on('click', function (e) {

                e.preventDefault();

                // trigger a click on langugage selector button to close
                _cache.langSelectorBtn.trigger('click');

                //clear any styles on body
                Globals.Helpers.cache.body.attr('style', '');

            });

            // Resize handler
            Globals.ResizeManager.addCallback(_resizeGlobalFooter);
        },

        _handleLanguageBtnClick = function _handleLanguageBtnClick(e) {
            e.preventDefault();

            if (_cache.langRegions.hasClass('closed')) {

                _cache.langSelectorBtn.removeClass('arrow-up').addClass('arrow-down');
                _cache.langRegions.removeClass('closed');
                _config.langSelectorHeight = _cache.langRegions.outerHeight();
                Globals.Helpers.toggleGlobalHeader();

                if (Globals.Helpers.isMobile()) {

                    Globals.Helpers.cache.body.css('overflow', 'hidden');
                    _cache.langRegions.attr('style', '');

                } else {

                    _cache.langRegions.css('margin-top', '-' + _config.langSelectorHeight + 'px');

                }
            } else {

                _cache.langSelectorBtn.removeClass('arrow-down').addClass('arrow-up');
                _cache.langRegions.addClass('closed').attr('style', '');
                Globals.Helpers.cache.body.attr('style', '');
                Globals.Helpers.toggleGlobalHeader();

            }
        },

        _handleRegionClick = function _handleRegionClick(e) {
            e.preventDefault();

            if (Globals.Helpers.isMobile()) {

                $(this).parent().toggleClass('closed');

            }
        },

        _handleCountryClick = function _handleCountryClick(e) {

            // We may be able to remove this entirely
            _cache.langRegions.addClass('closed').attr('style', '');

            _cache.langSelectorBtn.html($(this).html());

            _cache.langRegions.find('li').removeClass('selected');

            _cache.langSelectorBtn.removeClass('arrow-down').addClass('arrow-up');

            $(this).parent().addClass('selected');

            _cache.langRegions.find('.region-col').addClass('closed');

            Globals.Helpers.cache.body.attr('style', '');

        },

        _resizeGlobalFooter = function _resizeGlobalFooter() {

            if (_cache.langRegions.hasClass('closed') === false) {

                if (Globals.Helpers.isMobile()) {

                    Globals.Helpers.cache.body.css('overflow', 'hidden');
                    _cache.langRegions.attr('style', '');

                } else {

                    _config.langSelectorHeight = _cache.langRegions.outerHeight();
                    _cache.langRegions.css('margin-top', '-' + _config.langSelectorHeight + 'px');
                    Globals.Helpers.cache.body.attr('style', '');

                }
            }
        };

        return {
            init: _init
        };
    })();

    exports.Footer = Footer;

});