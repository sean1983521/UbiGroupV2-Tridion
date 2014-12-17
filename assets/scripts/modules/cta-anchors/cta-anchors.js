define(["exports", "Globals", "jQuery.tinyPubSub", "modules/secondary-nav/secondary-nav"], function(exports, Globals, TinyPubSub, SecondaryNav) {

	var CTAAnchors = (function CTAAnchors() {

        var _init = function _init() {

            _assignEvents();

        },

        _assignEvents = function _assignEvents() {
            Globals.Helpers.cache.body.on('click', '.cta-anchor', _scrollToElement).hammer().on('tap','.cta-anchor', function(e) {
                _scrollToElement(e);
            });
        },

        _scrollToElement = function _scrollToElement(e) {

            e.preventDefault();

            // load all submodules ...
            Globals.Helpers.forceLoadModules(function(){

                // ... then move to the correct section
                var el = $(e.currentTarget).attr('href');

                $('html, body').animate(
                    { scrollTop: $(el).offset().top - Globals.Settings.CONSTANTS.HEADER_HEIGHT },
                    500,
                    Globals.Settings.CONSTANTS.EASE
                );

                el = null;

            });

        };

        // Public pointers
        return {
            init: _init
        };

    })();

	exports.CTAAnchors = CTAAnchors;

});