/**
 * Handling inline item
 */

define(["jquery"], function($){
  
    function handleInline(url, deferred){
        var id = url.split('#').pop()
            dom = $('#' + id).clone();
        dom.css('display', 'block').addClass(id + '-container');
        dom.removeAttr('id');
        deferred.resolve(dom, 'inline');
        return deferred;
    }

    return handleInline;
});
