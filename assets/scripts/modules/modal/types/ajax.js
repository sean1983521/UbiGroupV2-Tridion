/**
 * handing ajax call
 */

define(["jquery"], function($){


    function handleAjax(url, deferred){

        // Make a request
        var req = $.ajax( { url: url } );

        req.done(function(data){
            data = parse(data, deferred.item);
            data = checkVideo(data);
            deferred.resolve(data, 'ajax');
        });

        req.fail(function(e){ deferred.reject(e); });
        return deferred;
    };

    var videoRatioDesktop = 1.77777777777778,
        videoRatioMobile = 1.48076923076923;

    function checkVideo(data){
        if (data.find('.game-article').length || data.filter('.game-article').length) {
            var height = Math.round( 800 / videoRatioMobile );
            data.find('.game-video').append('<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="800" height="' + height + '">');
        }
        return data;
    }

    function parse(data, item){

        var wrap = $('<div class="modal-content-inner"/>').append(data);
        // If this is well formatted
        if(wrap.find('.modal-content-inner, .mfp-modal-content').length) {
            data = wrap.find('.modal-content-inner, .mfp-modal-content');
            if (data.hasClass('mfp-modal-content')) {
              data.removeClass('mfp-modal-content').addClass('modal-content-inner');
            }
        } else {
            wrap.addClass(item.attr('data-mfpcontent-class') || item.attr('data-content-class'));
            wrap.wrapInner('<div class="centered-content"/>');
            wrap.prepend($('<h1 id="top" />').append(item.text()));
            data = wrap;
        }

        return data;
    };

    return handleAjax;
});
