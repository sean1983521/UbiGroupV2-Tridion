/// <reference path="interfaces/lib/requirejs/require.d.ts" />
var require = {
    baseUrl: "/assets/scripts",
    paths: {
        "jquery": "lib/jquery.min",
        "JSON": "lib/json2",
        "domReady": "lib/domReady",
        "Hammer": "lib/jquery.hammer-full.min",
        "waypoints": "lib/waypoints",
        "handlebars": "lib/handlebars.runtime",
        "jQuery.tinyPubSub": "lib/ba-tiny-pubsub",
        "jQuery.mousewheel": "lib/jquery.mousewheel",
        "jQuery.mockjax": "lib/jquery.mockjax",
        "jQuery.placeholder": "lib/jquery.placeholder",
        "jQuery.ui" : "lib/jquery-ui.min",
        "leaflet" : "lib/leaflet.min",
		"jQuery.twbsPagination" : "lib/jquery.twbs-pagination"
    },
    deps: ["jquery", "Hammer", "jQuery.tinyPubSub"],
    shim: {
        jquery: {
            exports: '$'
        },
        "Hammer": {
            deps: ["jquery"]
        },
        "jQuery.tinyPubSub": {
            deps: ["jquery"]
        },
        "jQuery.ui": {
            deps: ["jquery"]
        },
        "jQuery.transit": {
            deps: ["jquery"]
        },
        "jQuery.mockjax": {
            deps: ["jquery"]
        },
        "leaflet": {
            deps: ["jquery"]
        },
		"jQuery.twbsPagination": {
			deps: ["jquery"]
		},
        "handlebars": {
            deps: [""],
            exports: 'Handlebars',
            init: function() {
                this.Handlebars = Handlebars;
                this.Handlebars.registerHelper('ifeq', function(a, b, options) {
                    if( a == b ) { return options.fn(this); }
                });
                return this.Handlebars;
            }
        },
        "modules/Game": {
            deps: ["jquery", "waypoints", "jQuery.scrollTo"]
        },
        "main": {
            deps: ["jquery"]
        }
    },
    callback: function ($, Hammer, TinyPubSub, Transit, Easing) {
    },
    waitSeconds: 30
};