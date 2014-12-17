define(function() {
    // Good to be placed some where in handlebars.
    return [
        '<div class="modal-overlay overlay-hide">',
            '<div class="modal-container">',
                '<div class="modal-content-wrap">',
                    '<div class="modal-content">',
                        '<ul class="social-sharing">',
                            '<li><a class="icon-social-twitter" href="" target="_blank" data-lang="en"></a>',
                                '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>',
                            '</li>',
                            '<li><a class="icon-social-facebook" href="" target="_blank"></a></li>',
                            '<li><a class="icon-social-google" href="" target="_blank" onclick="javascript:window.open(this.href, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");return false;"></a></li>',
                        '</ul>',
                        '<button title="Close" type="button" class="close"></button>',
                    '</div>',
                '</div>',
                '<button type="button" class="btn-large-arrow light horizontal-slide-mask prev arrow inactive">',
                    '<span aria-hidden="true" class="icon-cover-prev"></span>',
                '</button>',
                '<button type="button" class="btn-large-arrow light horizontal-slide-mask next arrow inactive">',
                    '<span aria-hidden="true" class="icon-cover-next"></span>',
                '</button>',
            '</div>',
        '</div>',
        '<div class="block-modal"></div>'
    ].join('');
});