define(["modules/header/panel", "Globals"], function(Panel, Globals) {

	var panels = [],
		_cache = {
            'globalUplayBtn'    : $('#global-uplay-button'),
            'globalPromoBtn'    : $('#global-promotion-button'),
            'globalSearchBtn'   : $('#global-search-button'),
            'globalUplayIcon'   : null,
            'globalPromoIcon'   : null,
            'globalSearchIcon'  : null,
            'pageHome'          : $('#heroCarousel'),
            'searchInput'       : $('.search-tray-keyword')
		},
		_setupCache = function _setupCache() {
            _cache.globalUplayIcon = _cache.globalUplayBtn.find('span:not(#uplay-login)');
            _cache.globalPromoIcon = _cache.globalPromoBtn.find('span');
            _cache.globalSearchIcon = _cache.globalSearchBtn.find('span');
		};

	//Save all the generated panel modules such that opening one will close the others
	$(".site-header .panel-link").each(function(index){
		var panel = new Panel($(this), index);
		panels.push(panel);
	});

	var closePanels = function closePanels(_, index){

		_cache.globalUplayBtn.removeClass('active');
		_cache.globalPromoBtn.removeClass('active');
		_cache.globalSearchBtn.removeClass('active');

		_cache.globalUplayIcon.removeClass('icon-close').addClass('icon-uplay');
		_cache.globalPromoIcon.removeClass('icon-close').addClass('icon-flame-icon');
		_cache.globalSearchIcon.removeClass('icon-close').addClass('icon-search');

		$(panels).each(function(position){
			//Close all except the item identified by index
			if (index!==position){
				this.close();
			}
		});

        var styles = Modernizr.csstransforms ? {'transform': 'translate(0, 0px)'} : {'padding-top': Globals.Settings.CONSTANTS.HEADER_HEIGHT };

        _cache.pageHome.css(styles);
        _cache.searchInput.blur();

    }

	_setupCache();

	$.subscribe(Globals.Settings.CONSTANTS.EVENT_CLOSE_OTHER_PANELS, closePanels);

	return panels;
});
