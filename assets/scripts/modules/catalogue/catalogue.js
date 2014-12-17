define(["api", "handlebars", "Globals", "modules/game-to-game-nav", "jQuery.placeholder"], function(API, handlebars, Globals, GameToGameNav, Placeholder) {

    var Catalogue = function Catalogue(element){

        var _cache = {
            'button'                    : $('#global-search-button'),
            'searchTray'                : $('.search-tray'),
            'buttonMobileFilterHide'    : $('#filterBack'),
            'buttonShow'                : $('#searchTrayFauxInputShow'),
            'inputShow'                 : $('#searchTrayInputShow'),
            'buttonPlatform'            : $('#searchTrayFauxInputPlatform'),
            'inputPlatform'             : $('#searchTrayInputPlatform'),
            'buttonGenre'               : $('#searchTrayFauxInputGenre'),
            'inputGenre'                : $('#searchTrayInputGenre'),
            'formWrap'                  : null,
            'form'                      : null,
            'allOptionsSets'            : null,
            'keywordSet'                : null,
            'mobileHeader'              : null,
            'allButtons'                : null,
            'allOptions'                : null,
            'buttonValueShow'           : null,
            'optionsShow'               : null,
            'selectableOptionsShow'     : null,
            'buttonValuePlatform'       : null,
            'optionsPlatform'           : null,
            'selectableOptionsPlatform' : null,
            'buttonValueGenre'          : null,
            'optionsGenre'              : null,
            'selectableOptionsGenre'    : null,
            'inputKeyword'              : null,
            'autoCompleteResultList'    : null,
            'searchTrayResults'         : null,
            'buttonRefresh'             : null,
            'buttonFilter'              : null,
            'buttonClearKeyword'        : null,
            'buttonSortByDate'          : null,
            'buttonSortByAlpha'         : null
        },

        _config = {
            'runAutoCompleteLength' : 2,
            'panelHeight'           : 0,
            'resultsHeight'         : 0,
            'optionsHeight'         : 0,
            'optionsOffset'         : Globals.Helpers.isMobile() ? -86 : -20,
            'defaultSort'           : 'date',
            'autoCompleteHeight'    : Globals.Helpers.isMobile() ? 117 : 500,
            'category'              : { display : null, code : null },
            'platform'              : { display : null, code : null },
            'genre'                 : { display : null, code : null },
            'keyword'               : null,
            'sort'                  : null,
            'lockedScroll'          : false,
            'lastScrollPos'         : 0
        },

        _sortBy = null,

        _isOpen = false,

        _initialSearchCompleted = false,

        _locator = '<div class="wrap">' +
                        '<div class="wrap-intrinsic">' +
                            '<div class="wrap-fill">' +
                                '<div class="wrap-table">' +
                                    '<div class="wrap-cell"><span>You Are<br>Here</span></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

        _init = function _init() {

            //console.log('Search Catalogue init');

            element = $(element).parent();

            _setupCache();
            _setupDims();
            _storeInitialValues();

            _cache.inputKeyword.placeholder();

            // Resize handler
            Globals.ResizeManager.addCallback(_resizeCatalogue);

        },

        _isFirstSearch = function _queryIsFirstSearch() {
            var category = _cache.buttonShow.data('original-search-term') || 'featured',
                platform = _cache.buttonPlatform.data('original-search-term') || 'all',
                genre = _cache.buttonGenre.data('original-search-term') || 'all',
                selectedCategory = _cache.buttonShow.data('search-term-code'),
                selectedPlatform = _cache.buttonPlatform.data('search-term-code'),
                selectedGenre = _cache.buttonGenre.data('search-term-code'),
                ret = false;

            if (category == selectedCategory && platform == selectedPlatform && genre == selectedGenre) {
                ret = true;
            }

            return ret;

        },

        _setupCache = function _setupCache(){

            _cache.formWrap = _cache.searchTray.find('.search-tray-form-wrap');
            _cache.form = _cache.searchTray.find('.search-tray-form');
            _cache.allOptionsSets = _cache.form.find('.search-tray-options-set');
            _cache.keywordSet = _cache.form.find('.search-tray-keyword-set');
            _cache.mobileHeader = _cache.searchTray.find('.mobile-header');
            _cache.allButtons = _cache.allOptionsSets.find('.faux-input');
            _cache.allOptions = _cache.allOptionsSets.find('> ul');
            _cache.buttonValueShow = _cache.buttonShow.find('.value');
            _cache.optionsShow = _cache.allOptionsSets.find('.search-tray-show');
            _cache.selectableOptionsShow = _cache.optionsShow.find('.selectable');
            _cache.buttonValuePlatform = _cache.buttonPlatform.find('.value');
            _cache.optionsPlatform = _cache.allOptionsSets.find('.search-tray-platform');
            _cache.selectableOptionsPlatform = _cache.optionsPlatform.find('.selectable');
            _cache.buttonValueGenre = _cache.buttonGenre.find('.value');
            _cache.optionsGenre = _cache.allOptionsSets.find('.search-tray-genre');
            _cache.selectableOptionsGenre = _cache.optionsGenre.find('.selectable');
            _cache.inputKeyword = _cache.keywordSet.find('.search-tray-keyword');
            _cache.buttonClearKeyword = _cache.keywordSet.find('.clear-keyword');
            _cache.autoCompleteResultList = _cache.keywordSet.find('.autocomplete-results');
            _cache.searchTrayResults = _cache.searchTray.find('.search-tray-results');
            _cache.buttonRefresh = _cache.keywordSet.find('.search-tray-refresh');
            _cache.buttonFilter = _cache.keywordSet.find('.search-tray-filter');
            _cache.buttonSortByDate = _cache.searchTray.find('.sort-by-date');
            _cache.buttonSortByAlpha = _cache.searchTray.find('.sort-by-alpha');
            _cache.searchTrayContainer = _cache.searchTray.find('.search-tray-container');
        },

        _setupDims = function _setupDims() {

            _config.panelHeight = Globals.Helpers.cache.window.height() - Globals.Settings.CONSTANTS.HEADER_HEIGHT;
            _config.resultsHeight = Globals.Helpers.isMobile()  ? _config.panelHeight - _cache.formWrap.outerHeight() + 75 : _config.panelHeight - _cache.formWrap.outerHeight();
            _config.optionsHeight = _config.resultsHeight + _config.optionsOffset;
            _config.optionsHeight = _config.optionsHeight > 50 ? _config.optionsHeight : 50;

            var offsetTop = _config.panelHeight,
                params = Modernizr.csstransforms ? {'transform': 'translate(0, ' + ( -offsetTop ) + 'px)'}
                                                 : {'top': -offsetTop};

            if (Modernizr.csstransitions) {
              element.css(params);
            } else {
              element.animate(params, 500, Globals.Settings.CONSTANTS.EASE);
            }

            _cache.searchTrayResults.css('height', _config.resultsHeight);
            _cache.optionsShow.css('max-height', _config.optionsHeight);
            _cache.optionsPlatform.css('max-height', _config.optionsHeight);
            _cache.optionsGenre.css('max-height', _config.optionsHeight);
            _cache.autoCompleteResultList.css('max-height', _config.optionsHeight);

        },

        _storeInitialValues = function _storeInitialValues() {
            _config.keyword = _cache.inputKeyword.data('search-term');
            _config.category.display = _cache.buttonValueShow.data('search-term-display');
            _config.platform.display = _cache.buttonValuePlatform.data('search-term-display');
            _config.genre.display = _cache.buttonValueGenre.data('search-term-display');
            _config.category.code = _cache.buttonValueShow.data('search-term-code');
            _config.platform.code = _cache.buttonValuePlatform.data('search-term-code');
            _config.genre.code = _cache.buttonValueGenre.data('search-term-code');

            if (_sortBy !== null){
                _config.sort = _sortBy;
            }

        },

        _open = function _open() {

            _isOpen = true;

            _checkHeight();
            element.css('max-height', 'none');
            element.addClass('opened');

            Globals.Helpers.freezeBody();

            _addEvents();

            if (Globals.Helpers.isMobile()) {
                _addMobileEvents();
            }

            if (!_initialSearchCompleted){
                _runOpeningSearch();
                _initialSearchCompleted = true;
            }

            //only set the search locator if we're in the initial search result.
            if (_isFirstSearch()) {
                _setSearchLocator();
            }

        },

        _checkHeight = function _checkHeight() {

            _config.panelHeight = Globals.Helpers.cache.window.height() - Globals.Settings.CONSTANTS.HEADER_HEIGHT;
            _config.resultsHeight = Globals.Helpers.isMobile()  ? _config.panelHeight - _cache.formWrap.outerHeight() + 75 : _config.panelHeight - _cache.formWrap.outerHeight();
            _cache.searchTrayResults.css('height', _config.resultsHeight);

        },

        _close = function _close() {

            var offsetTop = _config.panelHeight,
                params = null;

            _isOpen = false;

            Globals.Helpers.unfreezeBody();

            if (!Globals.Helpers.isTouchDevice() && Modernizr.csstransforms){
                params = {'transform': 'translate(0, ' + ( -offsetTop ) + 'px)'};
                element.css(params);
            } else {
                params = {'top': -offsetTop};
                element.animate(params, 500, Globals.Settings.CONSTANTS.EASE);
            }

            element.removeClass('opened');

            //make sure catalogue isn't showing after transitioning
            setTimeout(function(){
                element.css('max-height', 0);
            }, 260);

            _clearForm();

            _removeEvents();

        },

        _addEvents = function _addEvents() {

            _cache.searchTray.on('click', '#searchTrayFauxInputShow', function(e){
                _showOptions(e, _cache.optionsShow);
            });

            _cache.searchTray.on('click', '#searchTrayFauxInputPlatform', function(e){
                _showOptions(e, _cache.optionsPlatform);
            });

            _cache.searchTray.on('click', '#searchTrayFauxInputGenre', function(e){
                _showOptions(e, _cache.optionsGenre);
            });

            _cache.searchTray.on('click', '.search-tray-show .selectable', function(e){
                _selectOption(e, _cache.buttonValueShow, _cache.inputShow, false);
            });

            _cache.searchTray.on('click', '.search-tray-platform .selectable', function(e){
                _selectOption(e, _cache.buttonValuePlatform, _cache.inputPlatform, true);
            });

            _cache.searchTray.on('click', '.search-tray-genre .selectable', function(e){
                _selectOption(e, _cache.buttonValueGenre, _cache.inputGenre, false);
            });

            _cache.searchTray.on('click', '.sort-by-date', function(e){
                e.preventDefault();
                _handleSort('date');
            });

            _cache.searchTray.on('click', '.sort-by-alpha', function(e){
                e.preventDefault();
                _handleSort('AZ');
            });

            _cache.searchTray.on('click', '.clear-keyword', _handleClearKeywordClick);

            _cache.searchTray.on('click', '.search-catalog-item', _handleSearchResultClick);

            _cache.searchTray.on('click', '.search-tray-refresh', _clearForm);

            _cache.searchTray.on('keyup input', '.search-tray-keyword', _handleAutocompletion);

            _cache.searchTray.on('focus', '.search-tray-keyword', _handleIOSFix);
            _cache.searchTray.on('blur', '.search-tray-keyword', _removeIOSFix);

            _cache.searchTray.on('click', '.run-search', _handleRunSearchClick);

        },

        _handleIOSFix = function _handleIOSFix() {

            if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {

                setTimeout(function() {

                    $('.site-header').addClass('no-transition').css({
                        'position': 'absolute',
                        'top': Globals.Helpers.cache.window.scrollTop() + 'px'
                    });

                    _config.lockedScroll = true;
                    _config.lastScrollPos = Globals.Helpers.cache.window.scrollTop();
                    Globals.Helpers.cache.window.on('scroll', _lockedScroll);

                }, 250);

            }

        },

        _removeIOSFix = function _removeIOSFix() {

            if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {

                $('.site-header').removeAttr('style');
                _config.lockedScroll = false;
                Globals.Helpers.cache.window.off('scroll', _lockedScroll);

            }

        },

        _lockedScroll = function _lockedScroll(e) {

            if (_config.lockedScroll) {
                $('.site-header').css('top', Globals.Helpers.cache.window.scrollTop() + 'px');
            }

        },

        _addMobileEvents = function _addMobileEvents() {

            _cache.searchTray.on('click', '.search-tray-filter', _toggleMobileFilters);
            _cache.searchTray.on('click', '#filterBack', _toggleMobileFilters);

        },

        _removeEvents = function _removeEvents() {

            _cache.searchTray.off('click');
            _cache.searchTray.off('keyup input');

        },

        _runOpeningSearch = function _runOpeningSearch() {
            _handleFormSubmission(undefined, true);
        },

        _toggleMobileFilters = function _toggleMobileFilters(e) {

            e.preventDefault();

            _cache.allOptionsSets.toggleClass('opened');
            _cache.mobileHeader.toggleClass('opened');
            _cache.searchTrayContainer.toggleClass('opened');
            _cache.keywordSet.toggleClass('closed');

            Globals.Helpers.toggleGlobalHeader(true);

            if (Globals.Helpers.isMobile() && !_cache.keywordSet.hasClass('closed')){
                _cache.form.css('top', '0px');
            }

        },

        _closeMobileFilter = function _closeMobileFilter() {

            _cache.allOptionsSets.removeClass('opened');
            _cache.mobileHeader.removeClass('opened');
            _cache.keywordSet.removeClass('closed');

        },

        _clearForm = function _clearForm(e) {

            if (e !== undefined) {
                e.preventDefault();
            }

            _closeAllOptions();
            _closeAutocomplete();

            _cache.buttonValueShow.text(_config.category.display || 'Featured');
            _cache.buttonValueShow.data('search-term-display', _config.category.display || 'featured');
            _cache.buttonValueShow.data('search-term-code', _config.category.code || 'featured');
            _cache.buttonValuePlatform.text(_config.platform.display || 'all');
            _cache.buttonValuePlatform.data('search-term-display', _config.platform.display || 'all');
            _cache.buttonValuePlatform.data('search-term-code', _config.platform.code || 'all');
            _cache.buttonValueGenre.text(_config.genre.display || 'all');
            _cache.buttonValueGenre.data('search-term-display', _config.genre.display || 'all');
            _cache.buttonValueGenre.data('search-term-code', _config.genre.code || 'all');
            _cache.inputKeyword.val(_config.keyword || '');
            _cache.buttonRefresh.removeClass('active');
            _sortBy = _config.sort || null;
            _enableButtons();

            _cache.allOptions.find('.selected').removeClass('selected');

            _handleFormSubmission(undefined, false);

            _cache.buttonClearKeyword.removeClass('enabled');

        },

        _handleClearKeywordClick = function _handleClearKeywordClick(e){

            e.preventDefault();

            _cache.inputKeyword.val('');

            _cache.autoCompleteResultList.hide();

            _cache.buttonClearKeyword.removeClass('enabled');

            $('.locator .wrap').show();
        },

        _showOptions = function _showOptions(e, optionsDiv) {

            var button = $(e.currentTarget),
                open = !button.hasClass('active'),
                buttonNumber = button.data('option-number');

            e.preventDefault();

            if (!button.hasClass('disabled')){
                _closeAllOptions();

                if (open) {
                    button.addClass('active');
                    button.addClass('arrow-up').removeClass('arrow-down');
                    optionsDiv.show();
                    button.scrollTop();

                    if (Globals.Helpers.isMobile()){
                        _cache.form.css('top', (buttonNumber * -50) + 'px');
                    }
                }

                setTimeout(function(){
                    Globals.Helpers.cache.window.on('click', _closeAllOptions);
                }, 10);
            }

            if (!open){
                button.addClass('arrow-down').removeClass('arrow-up');
                $('.locator .wrap').show();
            } else {
                $('.locator .wrap').hide();
            }

        },

        _selectOption = function _selectOption(e, buttonValue, input, cousins) {

            var item = $(e.currentTarget),
                chosenValue = item.data('search-term-code'),
                chosenDisplay = item.text(),
                siblings;

            if (cousins) {
                siblings = item.closest('.search-tray-platform').find('.selectable');
            } else {
                siblings = item.siblings();
            }

            siblings.removeClass('selected');
            item.addClass('selected');
            buttonValue.text(chosenDisplay);
            buttonValue.data('search-term-display', chosenDisplay);
            buttonValue.data('search-term-code', chosenValue);
            input.val(chosenValue);

            _closeAllOptions();

            if (Globals.Helpers.isMobile()) {
                _toggleMobileFilters(e);
            }

            _cache.buttonRefresh.addClass('active');

            _handleFormSubmission();

        },

        _disableButtons = function _disableButtons(){
            _cache.buttonPlatform.addClass('disabled');
            _cache.buttonPlatform.parent().addClass('disabled');
            _cache.buttonGenre.addClass('disabled');
            _cache.buttonGenre.parent().addClass('disabled');
        };

        _enableButtons = function _enableButtons(){
            _cache.buttonPlatform.removeClass('disabled');
            _cache.buttonPlatform.parent().removeClass('disabled');
            _cache.buttonGenre.removeClass('disabled');
            _cache.buttonGenre.parent().removeClass('disabled');
        };

        _handleSort = function _handleSort(sortText){
            _sortBy = sortText;

            _handleFormSubmission();
        },

        _updateSortBy = function _updateSortBy(){
            _cache.buttonSortByDate = _cache.searchTray.find('.sort-by-date');
            _cache.buttonSortByAlpha = _cache.searchTray.find('.sort-by-alpha');

            if (_sortBy === 'AZ'){
                _cache.buttonSortByDate.removeClass('active');
                _cache.buttonSortByAlpha.addClass('active');
            } else if (_sortBy === 'date'){
                _cache.buttonSortByAlpha.removeClass('active');
                _cache.buttonSortByDate.addClass('active');
            }
        },

        _handleFormSubmission = function _handleFormSubmission(e, initialSearch) {

            var options = {};

            if (e !== undefined) {
                e.preventDefault();
            }

            // send keyword if available
            if (_cache.inputKeyword.val() && _cache.inputKeyword.val().length > 0) {
                options.keyword = _cache.inputKeyword.val().toLowerCase();
            }

            options.filter = _cache.buttonValueShow.data('search-term-code') || "featured";

            if (_cache.buttonValuePlatform.text() !== "All") {
                options.pf = _cache.buttonValuePlatform.data('search-term-code');
            }

            if (_cache.buttonValueGenre.text() !== "All") {
                options.g = _cache.buttonValueGenre.data('search-term-code');
            }

            if (_sortBy !== null){
                options.sort = _sortBy;
            } else if (options.filter != 'featured'){
                _handleSort(_config.defaultSort);
                return;
            }

            options.ps = 100;

            API.search(options, _handleSearchResults);

        },

        _handleAutocompletion = function _handleAutocompletion(e) {

            if (e.keyCode === 13){ // user hit enter
                _handleFormSubmission();
                _closeAutocomplete();
            } else {
                var value = $(e.currentTarget).val();

                if (value.length >= _config.runAutoCompleteLength) {
                    API.autocomplete(_cache.inputKeyword.val().toLowerCase(), _handleAutocompleteResults);
                }

                if (value.length > 0){
                    _cache.buttonRefresh.addClass('active');
                    _cache.buttonClearKeyword.addClass('enabled');
                    _cache.inputKeyword.addClass('active');
                } else {
                    _cache.buttonRefresh.removeClass('active');
                    _cache.buttonClearKeyword.removeClass('enabled');
                    _cache.inputKeyword.removeClass('active');
                    _closeAutocomplete();
                }
            }
        },

        _handleSearchResults = function _handleSearchResults(data) {

            if (data.TotalRecords > 0){

                GameToGameNav.GameToGameNav.setPageSet(data);

                require(["client-partials"], function(ret) {
                    var context = data,
                        template = ret['search-results'],
                        html = template(context);
                    _cache.searchTrayResults.empty().append(html);
                    _cache.searchTrayResults.get(0).clientWidth; // force Redraw;
                    _cache.searchTrayResults.scrollTop(0); // make sure the results list is at the top for mobile.
                    _cache.searchTrayResults.find('.animatable-list').addClass('ready');
                    Globals.ImageLazyLoader.initSearchTrayLazyImages();
                    _updateSearchBreadcrumb(true);
                    _updateSortBy();

                    if(_isFirstSearch()) {
                        _setSearchLocator();
                    }

                });

                if (data.isDefault) {
                    _updateSearchBreadcrumb(false);
                }
            } else {
                _updateSearchBreadcrumb(false);
                $('.search-tray-result-meta-data em').empty();
            }
        },

        _handleAutocompleteResults = function _handleAutocompleteResults(data) {

            if (data.AutoComplete !== undefined && data.AutoComplete.length > 0){

                var fragment = document.createDocumentFragment(),
                    goToLinks = 0,
                    searchLinks = 0;

                _cache.autoCompleteResultList.empty();

                for (var i = data.AutoComplete.length; i--;) {

                    var item = data.AutoComplete[i],
                        el = document.createElement('li'),
                        link;

                    if (item.URL !== undefined) {

                        link = document.createElement('a');
                        link.innerHTML = item.Name;
                        link.setAttribute('href', item.URL);

                        el.appendChild(link);
                        el.className = 'go-to-page';

                        goToLinks++;

                    } else {
                        el.innerHTML = item.Name;
                        el.className = 'run-search';
                        $(el).data('keyword', item.Keyword);

                        searchLinks++;
                    }

                    fragment.insertBefore(el, fragment.firstChild);

                    el = null;
                    link = null;

                }

                if (goToLinks === 0){
                    _cache.autoCompleteResultList.addClass('no-goto-links');
                } else {
                    _cache.autoCompleteResultList.removeClass('no-goto-links');
                }

                _cache.autoCompleteResultList.append(fragment);
                _cache.autoCompleteResultList.show();
                $('.locator .wrap').hide();

                fragment = null;

            } else {
                _cache.autoCompleteResultList.hide();
                $('.locator .wrap').show();
            }

        },

        _handleRunSearchClick = function _handleRunSearchClick(e) {

            _cache.inputKeyword.val($(this).data('keyword'));
            _closeAutocomplete();

            _cache.buttonValueShow.text('All');
            _cache.buttonValuePlatform.text('All');
            _cache.buttonValueGenre.text('All');
            _cache.allOptionsSets.find('.selectable').removeClass('selected');

            _handleFormSubmission();

        },

        _setSearchLocator = function _setSearchLocator() {
            var pos = GameToGameNav.GameToGameNav.getPos(),
                list = _cache.searchTrayResults.find('.animatable-list'),
                anchors = list.find('a[href^="/"]'),
                parents = anchors.parent('li'),
                pages = $('#heroCarousel>ul>li'), // do not cache this
                page = $(pages.get(pos)),
                anchor = $(anchors.get(pos));

            parents.removeClass('locator');
            parents.find('.wrap').remove();

            if (page.data('page-url') !== undefined && page.data('page-url').indexOf(anchor.attr('href')) != -1){
                $(parents.get(pos)).addClass('locator').prepend(_locator);
            }

            pos = null;
            list = null;
            anchors = null;
            parents = null;

        },

        _closeAllOptions = function _closeAllOptions() {

            _cache.allOptions.hide();
            _cache.allButtons.removeClass('active');
            _cache.allButtons.addClass('arrow-down').removeClass('arrow-up');
            _cache.form.css('top', '0px');

            $('.locator .wrap').show();

            Globals.Helpers.cache.window.off('click', _closeAllOptions);

        },

        _closeAutocomplete = function _closeAutocomplete() {
            _cache.autoCompleteResultList.hide();
        },

        _updateSearchBreadcrumb = function _updateSearchBreadcrumb(hasValues) {

            var searchBreadcrumb = $('.search-tray-breadcrumb'),
                show = _cache.buttonValueShow.text(),
                platform = _cache.buttonValuePlatform.text(),
                genre = _cache.buttonValueGenre.text(),
                keyword = _cache.inputKeyword.val(),
                breadcrumbArray = [],
                breadcrumb;

            if (show.length > 0 && show.trim().toLowerCase() !== 'all') {
                breadcrumbArray.push(show);
            }
            if (platform.length > 0 && platform.trim().toLowerCase() !== 'all') { breadcrumbArray.push(platform); }
            if (genre.length > 0 && genre.trim().toLowerCase() !== 'all') { breadcrumbArray.push(genre); }
            if (keyword.length > 0) { breadcrumbArray.push(keyword); }

            //format the breadcrumb output
            $.each(breadcrumbArray, function(i, el) {

                var formatted = el.replace(/_/, ' ');
                breadcrumbArray[i] = formatted;

            });

            breadcrumb = breadcrumbArray.length > 0 ? breadcrumbArray.join(' / ') : '';

            if (!hasValues){
                breadcrumb = "Your search '" + keyword + "' did not match any results.  Showing results for " + show + " items.";
            }

            searchBreadcrumb.text(breadcrumb);
        },

        _handleSearchResultClick = function _handleSearchResultClick(e) {

            //e.preventDefault();

            var selectedIndex = $.inArray(e.currentTarget, $('.search-tray-results > ul > li > a'));

            GameToGameNav.GameToGameNav.rebuildAllPages(selectedIndex);

            _close();

        },

        _resizeCatalogue = function _resizeCatalogue() {

            _setupDims();

        };

        _init();

        return {
            open  : _open,
            close : _close,
        };
    };

    return Catalogue;
});
