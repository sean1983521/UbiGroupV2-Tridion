/**
 * handing images
 */

define(["jquery"], function($){
  
    function handleImage(url, deferred){
        var img = $("<img src='" + url+ "'>");
        img.on('load', function(){
            deferred.resolve(img, 'image');
            img.off('load');
        });
        return deferred;
    }

    return handleImage;
});
