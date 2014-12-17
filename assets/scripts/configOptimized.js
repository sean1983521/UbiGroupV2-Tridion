/// <reference path="interfaces/lib/requirejs/require.d.ts" />
var require = {
    baseUrl: "/assets/optimized-scripts",
    paths: {
        "jquery": "../scripts/lib/jquery/jquery",
        "JSON": "../scripts/lib/json2/json2",
        "domReady": "../scripts/lib/requirejs-domready/domReady",
        "Hammer": "../scripts/lib/hammerjs/dist/jquery.hammer.min",
        "waypoints": "../scripts/lib/jquery-waypoints/waypoints",
        "handlebars": "../scripts/lib/handlebars/handlebars.runtime",
        "jQuery.tinyPubSub": "../scripts/lib/jquery-tiny-pubsub/dist/ba-tiny-pubsub",
        "jQuery.mousewheel": "../scripts/lib/jquery-mousewheel/jquery.mousewheel",
        "jQuery.mockjax": "../scripts/lib/jquery-mockjax/jquery.mockjax",
        "jQuery.placeholder": "../scripts/lib/jquery-placeholder/jquery.placeholder"
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
        "jQuery.transit": {
            deps: ["jquery"]
        },
        "jQuery.mockjax": {
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
    }
};