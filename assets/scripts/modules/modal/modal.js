define(['Globals', 'modules/emitter-mixin', 'modules/spinner/spinner', './types/index', './template', 'jQuery.ui'], function(Globals, EmitterMixin, Spinner, types, template, jUi) {

    /**
     * How `AddressManager` and `Modal` works.
     *
     * 1. `AddressManager` will trigger `EVENT_PREPARE_MODAL` if it finds `modalId` frangment in window.location
     * 2. When `Modal` recieves that events it will use the `modalId` to query the target DOM then stores it onto `deepLinkedItem`
     * 3. If `Modal` found the target DOM, it will start listening to `EVENT_PAGE_LOADED`
     * 4. Finally when `EVENT_PAGE_LOADED` happens, it will trigger the modal against `deepLinkedItem`
     * 5. When closing, it will try to use the `currentItem`'s `data-modal-id` to change the url back
     *
     *  Hope this makes sense :)
     */

    var imagePattern = /\.(gif|jpg|jpeg|tiff|png)$/i,
        REQUEST_TYPE = {
            AJAX: 'ajax',
            IMAGE: 'image',
            IFRAME: 'iframe',
            INLINE: 'inline'
        };

    var Modal = function Modal() {

        var _cache = {
            'el': null,
            'ease': null,
            'content': null,
            'currentItem': null,
            'closeButton': null,
            'socialLinks': null,
            'deepLinkedItem': null,
            'scrollTop': null
        },

            _config = {
                delay: 600,
                isGallery: false,
                ageCheck: 18
            },

            _spinner = new Spinner(),
            _emitter = EmitterMixin(),
            _link = document.createElement('a'), // Used for utils to get urls fragments

            _init = function _init() {

                _setupCache();
                _cache.el.append(_spinner.init());
                _assignEvents();

                return this;
            },

            _setupCache = function _setupCache() {
                _cache.el = $(template).first();
                _cache.content = _cache.el.find('.modal-content');
                _cache.closeButton = _cache.el.find('.close').detach();
                _cache.socialLinks = _cache.el.find('.social-sharing').detach();
                _cache.scrollTop = 0;
            },

            _assignEvents = function _assignEvents() {

                // When user clicks '.modal' load the item.
                Globals.Helpers.cache.body.on('click', '.modal, .mfp-ajax, .mfp-inline', _initModal).hammer().on('tap','.modal, .mfp-ajax, .mfp-inline', _initModal);

                _cache.el
                    .on('click', '.arrow', _handleGallery) // go next / prev button to proceed
                .on('click', '.close, .icon-close', _hide) // Close button.
                .on('click', _hideWithCheck) // Hits `.overlay` to close

                // Some Age Gate Events
                .on('keyup', '.game-age-gate input', _filterInput)
                    .on('blur', '.game-age-gate input', _checkInput)
                    .on('click', '.game-age-gate .gain-access .go-button button', _validateAge)
                    .on('keypress', '#ageGateForm input', _checkKeyPress)
                // Number inputs can increment their value with the mouse wheel. No thanks!
                .on('mousewheel', '.game-age-gate input[type="number"]', _preventDefault)
                    .on('click', '.game-age-gate .denied-access .go-button button', _hide)
                    .on('click', '.game-age-gate .locale-redirection-container .go-button button', _hide);

                if (Globals.Helpers.isTouchDevice()) {
                    _cache.el.on('touchmove', '.block-modal', _killEvent);
                }

                // AddressManager will also let me know if I need to show the weird locale message
                $.subscribe(Globals.Settings.CONSTANTS.EVENT_LOCALE_MESSAGE, _special);

            },

            _initModal = function _initModal(e) {

                // Make sure the detail nav closes
                $.publish(Globals.Settings.CONSTANTS.EVENT_CLOSE_DETAIL_NAV);
                _fakeBodyEvent();
                _checkMaturity(e);

            },

            _preventDefault = function _preventDefault(e) {
                e.preventDefault();
            },

            _fakeBodyEvent = function _fakeBodyEvent() {

                Globals.Helpers.cache.body.off('click', '.modal, .mfp-ajax, .mfp-inline');

                Globals.Helpers.cache.body.on('click', '.modal, .mfp-ajax, .mfp-inline', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });

            },

            _addBodyEvent = function _addBodyEvent() {

                Globals.Helpers.cache.body.off('click', '.modal, .mfp-ajax, .mfp-inline');

                Globals.Helpers.cache.body.on('click', '.modal, .mfp-ajax, .mfp-inline', function(e) {
                    _fakeBodyEvent();
                    _checkMaturity(e);
                });

            },

            _prepareItem = function _prepareItem(e, modalId) {

                var item = $('.modal').filter('[data-modal-id="' + modalId + '"]');
                _cache.deepLinkedItem = item.length ? item : null;

                // If there is deepLinkedItem, listen for the loading animation to be finished
                // since we don't want to display the modal before the loading screen, right?
                if (_cache.deepLinkedItem) {

                    // If deepLinkedItem is set, its time to trigger modal.
                    $.subscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, _triggerDeepLinked);
                }

            },

            _triggerDeepLinked = function _triggerDeepLinked() {
                // Load item only if there's deepLinkedItem
                if (_cache.deepLinkedItem) {
                    _checkMaturity(_cache.deepLinkedItem);
                    //_cache.deepLinkedItem = null;
                }

                // Once we've waited for first EVENT_PAGE_LOADED, and finished, we
                // don't need this guy anymore.
                $.unsubscribe(Globals.Settings.CONSTANTS.EVENT_PAGE_LOADED, _triggerDeepLinked);
            },

            // loading item
            _special = function _special() {

                var url = "/en-US/Info/Info.aspx?tagname=LocaleMessage",
                    request = _load(url);

                // Detach from DOM before empting the content
                _cache.closeButton = _cache.closeButton.detach();
                _cache.socialLinks = _cache.socialLinks.detach();

                _cache.content.empty();
                _show(true);
                // When request is done, replace the content
                request.done(_appendContent);

            },

            _checkMaturity = function _checkMaturity(e) {

                var isEvent = (e.type === 'click' || e.type === 'tap') ? true : false,
                    item = _cache.currentItem = isEvent ? $(e.currentTarget) : e,
                    parent = item.parents('.modal-gallery'),
                    siblings = parent.find('li').not('.filtered').find('.modal'),
                    isMature = item.hasClass('mature'),
                    isGallery = item.parents('.modal-gallery').length === 1 ? true : false,
                    cookie = Globals.Helpers.getCookie('age-gate-age'),
                    cookieAge = parseInt(cookie),
                    ageGateUrl = "/en-US/Info/Info.aspx?tagname=AgeGate",
                    request;

                if (siblings.length > 0) {
                    var info = _getItemInfo(item),
                        index = info.index;

                    _cache.el.addClass('overlay-gallery');

                    _checkArrowState(index, siblings.length);
                }

                if (isMature && (cookie === '' || cookieAge < _config.ageCheck)) {

                    if (isEvent) {
                        e.preventDefault();
                    }

                    request = _load(ageGateUrl);

                    // Detach from DOM before empting the content
                    _cache.closeButton = _cache.closeButton.detach();
                    _cache.socialLinks = _cache.socialLinks.detach();

                    _cache.content.empty();
                    _show(true);

                    // When request is done, replace the content
                    request.done(_appendContent);

                } else {
                    _loadItem(e);
                }

            },

            // loading item
            _loadItem = function _loadItem(e) {

                var isEvent = (e.type === 'click' || e.type === 'tap') ? true : false,
                    item = _cache.currentItem = isEvent ? $(e.currentTarget) : e,
                    isMature = item.hasClass('mature'),
                    cookie = Globals.Helpers.getCookie('age-gate-age'),
                    isGallery = item.parents('.modal-gallery').length === 1 ? true : false,
                    url = item.attr('href'),
                    modalId = item.data('modalId'),
                    request = _load(url);

                if (isEvent) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                _setGallery(isGallery);

                if (isGallery) {

                    // Set arrow state if this is gallery.
                    var info = _getItemInfo(item),
                        index = info.index,
                        siblings = info.siblings;

                    _checkArrowState(index, siblings.length);

                }

                // Detach from DOM before empting the content
                _cache.closeButton = _cache.closeButton.detach();
                _cache.socialLinks = _cache.socialLinks.detach();

                _cache.content.empty();
                _show(false);

                // When request is done, replace the content
                request.done(_appendContent);

            },

            _appendContent = function _appendContent(data, type) {

                var button = _cache.closeButton;

                _cache.content.append(data);

                switch (type) {

                    case REQUEST_TYPE.IFRAME:
                        var header = $('<h1/>', {
                            'text': _cache.currentItem.data('modal-title')
                        });

                        _cache.el.find('.modal-content').prepend(header);
                        _cache.el.find('.modal-iframe-scaler').append(button);
                        header = null;
                        break;

                    case REQUEST_TYPE.IMAGE:
                        var header = $('<h1/>', {
                            'text': _cache.currentItem.data('modal-title')
                        });

                        _cache.el.find('.modal-content').prepend(header);
                        _cache.el.find('.modal-content').append(button);
                        header = null;
                        break;

                    default:
                        _cache.el.find('.modal-content').append(button);
                        break;

                }

                if (_cache.currentItem && _cache.currentItem.data('mfpClass')) {
                    _cache.el.find('.modal-content').addClass(_cache.currentItem.data('mfpClass'));
                }

                button = null;

                // If this is gallery (and not a video) append social link to content
                if (_config.isGallery && type !== 'iframe') {
                    _cache.socialLinks.appendTo(_cache.content);
                }

                if (_cache.content.find('.gain-access').length) {
                    _setupAgeGate();
                }

                if (_cache.content.find('.age-gate-container, .locale-redirection').length) {
                    _cache.el.addClass('modal-page-circle-inner circle-vert-align');
                    if (!_cache.content.find('.icon-close').length) {
                        _cache.content.append('<button class="icon-close" title="Close (Esc)" type="button" />');
                    }
                }

                if (_cache.content.find('.social-sharing')) {

                    var anchors = _cache.content.find('.social-sharing a'),
                        urlBase = _urlEncode(window.location.protocol + '//' + window.location.host + window.location.pathname + '?modalId=');

                    urlBase = urlBase + $(_cache.currentItem).attr('data-modal-id');

                    anchors.each(function() {

                        var className = $(this).attr('class').toLowerCase(),
                            url;

                        if (className.indexOf('twitter') !== -1) {

                            url = 'https://twitter.com/share?url=' + urlBase;

                        } else if (className.indexOf('facebook') !== -1) {

                            url = 'https://www.facebook.com/sharer/sharer.php?u=' + urlBase;

                        } else if (className.indexOf('google') !== -1) {

                            url = 'https://plus.google.com/share?url=' + urlBase;

                        }

                        $(this).attr('href', url);

                    });

                    anchors = null;

                }

                //INIT ACCORDION ON FAQ PAGE
                _cache.content.find('.ui-accordion').accordion({ collapsible: true, heightStyle: "content" });

            },

            _urlEncode = function _urlEncode(url) {
                return encodeURIComponent(url).replace(/'/g, "%27").replace(/"/g, "%22");
            },

            // set close button to 'fixed' on scroll
            _adjustClosePos = function _adjustClosePos(e) {

                //cache the scrollTop to fake positioning on resize.
                _cache.scrollTop = _cache.el.scrollTop();

                _cache.closeButton.css({
                    'top': e.currentTarget.scrollTop + 'px'
                });
            },

            // Shows overlay
            _show = function _show(circle) {


                Globals.ResizeManager.addCallback(_resizeModal);

                $.publish(Globals.Settings.CONSTANTS.EVENT_CLOSE_DETAIL_NAV);

                _cache.el.appendTo(Globals.Helpers.cache.body);
                _cache.el.removeClass('overlay-hide');
                Globals.Helpers.freezeBody();
                _emit('show');

                //reset button positioning.
                _cache.closeButton.attr('style', '');
                $('.arrow', _cache.el).show();

                // make close button appear 'fixed' on scroll for text modals
                if (!Globals.Helpers.isMobile() && !circle && _cache.el.hasClass('modal-type-ajax') || _cache.el.hasClass('modal-type-inline') || _cache.el.hasClass('modal-type-image')) {
                    _cache.el.on('scroll', _adjustClosePos);

                }

                return this;

            },

            _hideWithCheck = function _hideWithCheck(e) {

                // if event is available and the currentTarget isnt close, check
                // if we can actually hide or now.
                if (e && !/close/.test(e.currentTarget.className)) {

                    var target = $(e.target);

                    // If user clicked inside of the content, we dont want to hide.
                    if (target.parents('.modal-content').length) {
                        return;
                    }

                    target = null;

                };

                _hide();

            },

            _hide = function _hide(e) {

                $('.arrow', _cache.el).hide();

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                _emit('hide');

                _cache.el.addClass('overlay-hiding');
                Globals.Helpers.unfreezeBody();
                Globals.ResizeManager.removeCallback(_resizeModal);


                // Preferably transitionEnd
                setTimeout(function() {
                    _cache.el.removeClass('overlay-hiding');
                    _cache.el = _cache.el.detach();
                    _addBodyEvent();

                    if (!Globals.Helpers.isMobile()) {
                        _cache.el.unbind('scroll');
                    }

                }, _config.delay);

                return this;
            },

            _killEvent = function _killEvent(e) {
                if (Globals.Helpers.isMobile() && Globals.Helpers.isLandscape()) {
                    return;
                } else {
                    e.preventDefault();
                    return false;
                }
            },

            // Load contents of url
            _load = function _load(url) {

                var type = _getRequestType(url),
                    deferred = $.Deferred();

                // Start loading, spinner should show that.
                _spinner.start();

                _cache.el[0].className = _cache.el[0].className
                    .replace(/\smodal\-type\-(.*)?\b/g, '') // Remove modal-type-{type}
                .replace(/\smodal\-page\-(.*)?\b/g, ''); // Remove modal-page-{page}

                _cache.el[0].className = _cache.el[0].className

                _cache.el.addClass('modal-not-ready');
                _cache.el.addClass('modal-type-' + type);
                _cache.el.addClass('modal-page-' + $('.current-game').data('entityId'));

                deferred.item = _cache.currentItem;

                if (type) {
                    deferred = types[type](url, deferred);
                } else {
                    deferred.reject('Wrong Type or Url parsing failed');
                }


                deferred.done(function() {

                    // Need this timeout to offset rendering,
                    setTimeout(function() {

                        // Stop spinner.
                        _spinner.stop();

                        // No more `overlay-gallery-not-ready` state.
                        _cache.el.removeClass('overlay-gallery-not-ready');
                        // No more `modal-no-ready` state.
                        _cache.el.removeClass('modal-not-ready');
                    }, 500);
                });

                return deferred;
            },

            _getContent = function _getContent() {

                return _cache.content || null;

            },


            // Determin the request type according to uurl
            _getRequestType = function _getRequestType(url) {

                _link.href = url; // Now we don't have to do regexp to find fragments.

                // If the extension is image
                if (imagePattern.test(_link.pathname.split('/').pop())) {
                    return REQUEST_TYPE.IMAGE;
                }

                // If this is same host as current page
                if ((location.host === _link.host) || (_link.host === '')) {

                    // If tthere's hash
                    if ('#' === _link.hash[0]) {
                        return REQUEST_TYPE.INLINE;
                    }
                    // If not, then ajax it.
                    return REQUEST_TYPE.AJAX;
                }

                // Otherwise it's safe to say `iiframe`
                return REQUEST_TYPE.IFRAME;

            },

            _handleGallery = function _handleGallery(e) {

                e.preventDefault();
                e.stopPropagation();

                if (!$('.spinner').hasClass('spinning')) {

                    var item = _cache.currentItem,
                        itemClass = item[0].className,
                        buttonClass = e.currentTarget.className,
                        parent = item.parents('.modal-gallery'),
                        siblings = parent.find('li').not('.filtered').find('.modal'),
                        index = siblings.index(item);

                    if (/prev/g.test(buttonClass)) {
                        index = Math.max(0, index - 1);
                    } else {
                        index = Math.min(siblings.length - 1, index + 1);
                    }

                    _checkArrowState(index, siblings.length);

                    _cache.currentItem = siblings.eq(index);
                    _cache.el.addClass('overlay-gallery-not-ready');
                    _checkMaturity(_cache.currentItem);

                    item = null;
                    itemClass = null;
                    buttonClass = null;
                    parent = null;
                    siblings = null;
                    index = null;

                }

            },

            _getItemInfo = function _getItemInfo(item) {

                var parent = item.parents('.modal-gallery'),
                    siblings;

                if (!parent.length) {
                    return null;
                }

                siblings = parent.find('li').not('.filtered').find('.modal');

                return {
                    index: siblings.index(item),
                    parent: parent,
                    siblings: siblings
                }

            },


            _checkArrowState = function _checkArrowState(index, max) {

                if (!Globals.Helpers.isMobile()) {
                    // Reset button state.
                    _cache.el.find('.arrow').removeClass('inactive');
                    $('.arrow', _cache.el).show();

                    // If this first item
                    if (0 === index) {
                        _cache.el.find('.prev').addClass('inactive');
                    }
                    // If this last item
                    if (max - 1 === index) {
                        _cache.el.find('.next').addClass('inactive');
                    };
                } else {
                    _cache.arrow.addClass('inactive');
                }
            },

            _setGallery = function _setGallery(bool) {

                _config.isGallery = bool;
                _cache.el.toggleClass('overlay-gallery', bool);

            },


            //
            // ------------------------------
            // @AgeGate Handling
            // ------------------------------
            //
            _checkKeyPress = function _checkKeyPress(e) {

                if (e.which == 13) {
                    e.preventDefault();
                    _validateAge(e);
                }

            },

            _validateAge = function _validateAge(e) {

                e.preventDefault();

                var age = _ageGateValidate();

                // invalid input fool
                if (!age) {

                    _cache.content.find('input').addClass('error');

                    // access granted!
                } else if (age % 1 == 0 && age >= _config.ageCheck) {
                    Globals.Helpers.setCookie('age-gate-age', parseInt(age), 30);
                    _hide();

                    if (_cache.deepLinkedItem) {

                        setTimeout(function() {
                            _triggerDeepLinked();
                            _cache.deepLinkedItem = null;
                        }, _config.delay);

                    } else {

                        setTimeout(function() {
                            _loadItem(_cache.currentItem);
                        }, _config.delay);

                    }

                    // access denied
                } else {
                    Globals.Helpers.setCookie('age-gate-age', parseInt(age), 1);
                    _cache.content.find('.gain-access').css('display', 'none');
                    _cache.content.find('.denied-access').css('display', 'block');
                    _cache.content.find('.close').remove();

                }

                age = null;

            },


            // Filter non-digits from input value.
            _filterInput = function _filterInput(e) {
                this.value = this.value.replace(/\D/g, '');
            },

            _checkInput = function _checkInput(e) {
                if (this.value === '') {
                    return;
                }
                var name = $(this).attr('name'),
                    maxlength = $(this).attr('maxlength'),
                    value = this.value,
                    date = new Date(),
                    min, max;

                switch (name) {
                    case 'month':
                        min = 1,
                        max = 12
                        break;
                    case 'day':
                        min = 1,
                        max = 31
                        break;
                    case 'year':
                        min = 1,
                        max = date.getFullYear()
                        break;
                    default:
                        break;
                }

                var num = '' + Math.min(max, Math.max(value * 1, min));
                if (num[0] != 0 && num.length < maxlength && maxlength == 2) {
                    num = "0" + num;
                }
                this.value = num;
            },

            // Setup age gate
            _setupAgeGate = function _setupAgeGate() {

                var cookie = Globals.Helpers.getCookie('age-gate-age'),
                    cookieAge = parseInt(cookie);

                if (cookie !== '' && cookieAge < _config.ageCheck) {
                    _cache.content.find('.close').remove();
                    _cache.content.find('.gain-access').css('display', 'none');
                    _cache.content.find('.denied-access').css('display', 'block');

                } else {

                    _cache.content.find('input').removeClass('error').val('');
                    _cache.content.find('.gain-access').css('display', '');
                    _cache.content.find('.denied-access').css('display', '');

                }

            },

            _ageGateValidate = function _ageGateValidate() {

                var month = parseInt($('#age-month').val(), 10),
                    day = parseInt($('#age-day').val(), 10),
                    year = parseInt($('#age-year').val(), 10),
                    birthday = new Date(year, month - 1, day);

                if (Globals.Helpers.isDate(day + '/' + month + '/' + year) && year > 999) {
                    return Math.floor((Date.now() - birthday) / (31557600000));
                } else {
                    return false;
                }
            },

            _resizeModal = function _resizeModal() {

                if (Globals.Helpers.isMobile() || _cache.el.hasClass('modal-page-circle-inner')) {
                    _cache.closeButton.attr('style', '');
                } else {
                    _cache.closeButton.css({
                        'position': 'absolute',
                        'top': _cache.scrollTop,
                        'left': 'auto'
                    });
                }
            },

            // Emitter mixins
            _on = _emitter.on,
            _off = _emitter.off,
            _emit = _emitter.emit;

        return {
            content: _getContent,
            init: _init,
            load: _load,
            show: _show,
            hide: _hide,
            on: _on,
            off: _off,
            emit: _emit
        }
    };

    Modal.REQUEST_TYPE = REQUEST_TYPE;

    // Expose `Modal`
    return Modal;
});