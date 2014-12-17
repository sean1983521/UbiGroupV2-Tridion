/*
	The following module uses both jQuery and jQuery.mockjax to simulate backend responses for a few different APIs.

	Each intercepted ajax call will return data in a JSON format.  Some simulate latency (by using a responseTime),
	some return different responses, and some return errors.

	Use the settings module to configure API end points as well as to configure various settings (like max latency).

	A sample AJAX call is commented out at the bottom.

	This file itself is conditionally loaded such that it only appears on local, develop, staging, and uat environments.
*/


define(["jquery", "jQuery.mockjax"], function($, tbd) {

	var settings = {
		urls: {
			search               : '/api/search.ashx',
			getFarCryHero        : '/en-US/game/far_cry_3?rel=feature',
			getE3Hero            : '/en-US/event/e3_2013?rel=feature',
			getFranchiseHero     : '/en-US/franchise/rayman?rel=feature',
			getBloodDragonHero   : '/en-US/dlc/blood_dragon?rel=feature',
			getFarCryModule      : '/en-US/game/far_cry_3?rel=modules',
			getE3Module          : '/en-US/event/e3_2013?rel=modules',
			getFranchiseModule   : '/en-US/franchise/rayman?rel=modules',
			getBloodDragonModule : '/en-US/dlc/blood_dragon?rel=modules',
			gameNews1            : '/en-US/event/data.aspx?id=2716&news=1',
			gameNews2            : '/en-US/event/data.aspx?id=2716&news=2',
			gameNews3            : '/en-US/event/data.aspx?id=2716&news=3',
			privacyPol           : '/en-US/Info/Info.aspx?tagname=PrivacyPolicy',
			TOS		             : '/en-US/Info/Info.aspx?tagname=TermsOfUse',
			legalInfo	         : '/en-US/Info/Info.aspx?tagname=LegalInfo',
			contact	             : '/en-US/Info/Info.aspx?tagname=Contact',
			sysRequire	         : '/en-US/Info/Info.aspx?tagname=SystemRequirements',
			patches              : '/en-US/Info/Info.aspx?tagname=Patches',
            faq                  : '/en-US/Info/Info.aspx?tagname=FAQ',
			localeMessage        : '/en-US/Info/Info.aspx?tagname=LocaleMessage',
			ageGate              : '/en-US/Info/Info.aspx?tagname=AgeGate'
		},
		maxLatency: 7000,
		logging: false
	};

	/*
	=========================================================
	GAME NEWS
	=========================================================
	*/

	$.mockjax({
		url: settings.urls.gameNews1,
  		responseTime: 2000,
		proxy: '/assets/dummy-data/game-news1.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.gameNews2,
		proxy: '/assets/dummy-data/game-news2.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.gameNews3,
		proxy: '/assets/dummy-data/game-news3.html',
		logging: settings.logging
	});

	/*
	=========================================================
	SEARCH
	=========================================================
	*/
	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "ass"
		},
		proxy: '/assets/dummy-data/autocomplete_AC.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "assassin's creed 3"
		},
		proxy: '/assets/dummy-data/autocomplete_AC3.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "ray"
		},
		proxy: '/assets/dummy-data/autocomplete_rayman.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "far"
		},
		proxy: '/assets/dummy-data/autocomplete_farcry.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "ann"
		},
		proxy: '/assets/dummy-data/autocomplete_anno.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "spl"
		},
		proxy: '/assets/dummy-data/autocomplete_splinter_cell.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			q: "ra"
		},
		proxy: '/assets/dummy-data/autocomplete_ra.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "safe_for_kids",
			pf: "xbox_360",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_safe_xbox360_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "safe_for_kids",
			pf: "xbox_360",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_safe_xbox360_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "safe_for_kids",
			pf: "xbox_360"
		},
		proxy: '/assets/dummy-data/searchresults_safe_xbox360_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "family",
			pf: "xbox_360",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_safe_xbox360_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "family",
			pf: "xbox_360",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_safe_xbox360_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "family",
			pf: "xbox_360"
		},
		proxy: '/assets/dummy-data/searchresults_safe_xbox360_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "assassin's creed",
			filter: "downloadable_content",
			pf: "playstation_3"
		},
		proxy: '/assets/dummy-data/searchresults_ac_dlc_ps3_alpha_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "far cry",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_fc_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "far cry",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_fc_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "far cry"
		},
		proxy: '/assets/dummy-data/searchresults_fc_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "assassin's creed",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_ac_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "assassin's creed",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_ac_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "assassin's creed"
		},
		proxy: '/assets/dummy-data/searchresults_ac_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "anno 2070"
		},
		proxy: '/assets/dummy-data/searchresults_anno_2070_alpha_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "wxyz"
		},
		proxy: '/assets/dummy-data/searchresults_wxyz.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "events",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_event_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "events",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_event_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "events"
		},
		proxy: '/assets/dummy-data/searchresults_event_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "rayman",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_rayman_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "rayman",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_rayman_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "rayman",
		},
		proxy: '/assets/dummy-data/searchresults_rayman_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "splinter cell",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_splinter_cell_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "splinter cell",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_splinter_cell_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			keyword: "splinter cell",
		},
		proxy: '/assets/dummy-data/searchresults_splinter_cell_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "featured",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_featured_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "featured",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_featured_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "featured"
		},
		proxy: '/assets/dummy-data/searchresults_featured_default.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "franchise"
		},
		proxy: '/assets/dummy-data/searchresults_franchise_alpha_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "music"
		},
		proxy: '/assets/dummy-data/searchresults_music_alpha_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "safe_for_kids",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_safe_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "safe_for_kids",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_safe_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			filter: "safe_for_kids",
		},
		proxy: '/assets/dummy-data/searchresults_safe_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "family",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_safe_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "family",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_safe_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			g: "family"
		},
		proxy: '/assets/dummy-data/searchresults_safe_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			pf: "xbox_360",
			sort: "AZ"
		},
		proxy: '/assets/dummy-data/searchresults_xbox360_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			pf: "xbox_360",
			sort: "date"
		},
		proxy: '/assets/dummy-data/searchresults_xbox360_date.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.search,
		data: {
			pf: "xbox_360"
		},
		proxy: '/assets/dummy-data/searchresults_xbox360_alpha.json',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.getE3Hero,
		proxy: '/assets/dummy-data/get-e3-page-hero.html',
		logging: settings.logging
	});

    $.mockjax({
		url: settings.urls.getFranchiseHero,
		proxy: '/assets/dummy-data/get-franchise-rayman-page-hero.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.getFarCryHero,
		proxy: '/assets/dummy-data/get-far-cry-3-page-hero.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.getBloodDragonHero,
		proxy: '/assets/dummy-data/get-blood-dragon-page-hero.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.getE3Module,
		proxy: '/assets/dummy-data/get-e3-page-modules.html',
		logging: settings.logging
	});

    $.mockjax({
		url: settings.urls.getFranchiseModule,
		proxy: '/assets/dummy-data/get-franchise-rayman-page-modules.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.getFarCryModule,
		proxy: '/assets/dummy-data/get-far-cry-3-page-modules.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.getBloodDragonModule,
		proxy: '/assets/dummy-data/get-blood-dragon-page-modules.html',
		logging: settings.logging
	});

	//Default search.aspx call
	$.mockjax({
		url: settings.urls.search,
		proxy: '/assets/dummy-data/searchresults_featured_default.json',
		logging: settings.logging
	});

	/*
	=========================================================
	MISC MODALS
	=========================================================
	*/
	$.mockjax({
		url: settings.urls.sysRequire,
		proxy: '/assets/dummy-data/system-requirements.html',
		logging: settings.logging
	});

    $.mockjax({
        url: settings.urls.faq,
        proxy: '/assets/dummy-data/faq.html',
        logging: settings.logging
    });

	$.mockjax({
		url: settings.urls.patches,
		proxy: '/assets/dummy-data/patches.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.localeMessage,
		proxy: '/assets/dummy-data/locale-redirect.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.ageGate,
		proxy: '/assets/dummy-data/age-gate.html',
		logging: settings.logging
	});

	/*
	=========================================================
	FOOTER LINKS
	=========================================================
	*/

	$.mockjax({
		url: settings.urls.privacyPol,
		proxy: '/assets/dummy-data/privacy-policy.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.TOS,
		proxy: '/assets/dummy-data/terms-of-service.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.legalInfo,
		proxy: '/assets/dummy-data/legal-info.html',
		logging: settings.logging
	});

	$.mockjax({
		url: settings.urls.contact,
		proxy: '/assets/dummy-data/contact-us.html',
		logging: settings.logging
	});

});
