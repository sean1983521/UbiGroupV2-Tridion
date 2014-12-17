/**
 * handing iframes
 */

define(["jquery"], function($){

    var stash;

    function handleIframe(url, deferred){
        var iframe = $("<iframe src='" + _getIframeURL(url)+ "'></iframe>");
        iframe[0].style.visibility = 'hidden';
        iframe.appendTo(stash);

        iframe.on('load', function(){

            var div = $('<div class="modal-iframe-scaler"/>');
            iframe = iframe.detach();
            iframe[0].style.visibility = 'visible';
            div.append(iframe);
            deferred.resolve(div, 'iframe');
            iframe.off('load');
            iframe = null;

        });

        return deferred;
    }

    var _getIframeURL = function _getIframeURL(url){

        var patterns = {
          youtube: { id: 'v=', index: 'youtube.com', src: '//www.youtube.com/embed/%id%?autoplay=0&html5=1' },
          vimeo: { id: '/', index: 'vimeo.com/', src: '//player.vimeo.com/video/%id%?autoplay=0' }
        };

        $.each(patterns, function() {
          if(url.indexOf( this.index ) > -1) {
            if(this.id) {
              if(typeof this.id === 'string') {
                url = url.substr(url.lastIndexOf(this.id) + this.id.length, url.length);
              } else {
                url = this.id.call( this, url );
              }
            }
            url = this.src.replace('%id%', url );
            return false; // break;
          }
        });

        return url;
    };

    if (!document.getElementById('iframe-stash')) {

        // Creating stash for iframe loading
        // to avoid relayouting.
        stash = document.createElement('div');
        stash.style.width = stash.style.height = '1px';
        stash.style.overflow = 'hidden';
        stash.style.position = 'absolute';
        stash.style.webkitBackfaceVisibility = 'hidden';
        stash.setAttribute('id', 'iframe-stash');

        document.body.appendChild(stash);

    }


    return handleIframe;
});
