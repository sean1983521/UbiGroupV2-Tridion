/// <reference path="interfaces/lib/requirejs/require.d.ts" />
var require = {
    baseUrl: "/assets/scripts",
    paths: {
        "jquery": "lib/jquery/jquery",
        "JSON": "lib/json2/json2",
        "domReady": "lib/requirejs-domready/domReady",
        "Hammer": "lib/hammerjs/jquery.hammer-full.min",
        "waypoints": "lib/jquery-waypoints/waypoints",
        "handlebars": "lib/handlebars/handlebars.runtime",
        "jQuery.tinyPubSub": "lib/jquery-tiny-pubsub/dist/ba-tiny-pubsub",
        "jQuery.mousewheel": "lib/jquery-mousewheel/jquery.mousewheel",
        "jQuery.mockjax": "lib/jquery-mockjax/jquery.mockjax",
        "jQuery.placeholder": "lib/jquery-placeholder/jquery.placeholder",
        "jQuery.ui" : "lib/jquery-ui/jquery-ui.min",
        "leaflet" : "lib/leaflet/leaflet.min"
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