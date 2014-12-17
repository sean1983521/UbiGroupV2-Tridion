define(["mock-test", "Globals"], function(mock, Globals) {

    var mainLegal = (function mainErrors() {

        var _cache = {
            "tocLinks" : $('.legal-wrap > ol > li > a')
        },

        _config = {
            'arriveAtPadding' : 40
        },

        _init = function _init() {
            
            Globals.Helpers.init();
            Globals.Helpers.initializeGlobalHeader();
            Globals.ResizeManager.init();

            _addEvents();
        },

        _addEvents = function _addEvents() {
            _cache.tocLinks.on('click', _handleTocLinkClick);
        },

        _handleTocLinkClick = function _handleTocLinkClick(e) {
            e.preventDefault();

            var href = $(this).attr('href'),
                arriveAt = 0;

            if ($(href) != undefined && $(href).offset() != undefined){
                arriveAt = $(href).offset().top - Globals.Settings.CONSTANTS.HEADER_HEIGHT;
            }

            $('html, body').animate({
                scrollTop: arriveAt
            }, 200);
        };

        return {
            init: _init
        };

    })();

    mainLegal.init();

    return mainLegal;

});
