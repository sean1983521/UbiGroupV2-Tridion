;
(function($, window, document, undefined) {

    'use strict';

    var old = $.fn.twbsPagination;

    // PROTOTYPE AND CONSTRUCTOR

    var TwbsPagination = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.twbsPagination.defaults, options);

        // if (this.options.startPage < 0 || this.options.startPage > this.options.totalPages-1) {
        //     throw new Error('Start page option is incorrect');
        // }

        // this.options.totalPages = parseInt(this.options.totalPages);
        // if (isNaN(this.options.totalPages)) {
        //     throw new Error('Total pages option is not correct!');
        // }

        // this.options.visiblePages = parseInt(this.options.visiblePages);
        // if (isNaN(this.options.visiblePages)) {
        //     throw new Error('Visible pages option is not correct!');
        // }

        if (this.options.totalPages < this.options.visiblePages) {
            this.options.visiblePages = this.options.totalPages;
        }

        if (this.options.onPageClick instanceof Function) {
            this.$element.first().bind('page', this.options.onPageClick);
        }

        if (this.options.href) {
            var m, regexp = this.options.href.replace(/[-\/\\^$*+?.|[\]]/g, '\\$&');
            regexp = regexp.replace(this.options.hrefVariable, '(\\d+)');
            if ((m = new RegExp(regexp, 'i').exec(window.location.href)) != null) {
                this.options.startPage = parseInt(m[1], 10);
            }
        }

        var tagName = (typeof this.$element.prop === 'function') ?
            this.$element.prop('tagName') : this.$element.attr('tagName');

        if (tagName === 'UL') {
            this.$listContainer = this.$element;
        } else {
            this.$listContainer = $('<ul></ul>');
        }

        this.$listContainer.addClass(this.options.paginationClass);

        if (tagName !== 'UL') {
            this.$element.append(this.$listContainer);
        }

        this.render(this.getPages(this.options.startPage));
        this.setupEvents();

        return this;
    };

    TwbsPagination.prototype = {

        constructor: TwbsPagination,

        destroy: function () {
            this.$element.empty();
            this.$element.removeData('twbs-pagination');
            this.$element.unbind('page');
            return this;
        },

        show: function (page) {
            if (page < 0 || page > this.options.totalPages) {
                throw new Error('Page is incorrect.');
            }

            console.log('page in show function: '+page);
            this.render(this.getPages(page-1));
            this.setupEvents();

            this.$element.trigger('page', page);
            return this;
        },

        buildListItems: function (pages) {
            var $listItems = $();
            console.log('pages currentpage is: '+pages.currentPage);

            if (this.options.prev) {
                var prev = pages.currentPage > 1 ? pages.currentPage  : this.options.loop ? this.options.totalPages  : 1;
                $listItems = $listItems.add(this.buildItem('prev', prev));
            }

            for (var i = 0; i < pages.numeric.length; i++) {
                $listItems = $listItems.add(this.buildItem('page', pages.numeric[i]));
            }

            if (this.options.next) {
                var next = pages.currentPage < this.options.totalPages ? pages.currentPage+2 : this.options.loop ? 1 : this.options.totalPages;
                $listItems = $listItems.add(this.buildItem('next', next));
            }

            return $listItems;
        },

        buildItem: function (type, page) {
            var itemContainer = $('<li></li>'),
                itemContent = $('<a></a>'),
                itemText = null,
                year='',
                month='';
            var search=window.location.search;
            if(search.indexOf('year=') != -1){
                var arr=search.split('&');
                for(var i=0;i<arr.length;i++){
                    if(arr[i].indexOf('year=')>-1){
                        year=arr[i].substr(arr[i].indexOf('=')+1);
                    }
                    if(arr[i].indexOf('month=')>-1){
                        month=arr[i].substr(arr[i].indexOf('=')+1);
                    }
                }
            }
            switch (type) {
                case 'page':
                    itemText = page;
                    itemContainer.addClass(this.options.pageClass);
                    break;
                case 'prev':
                    itemText = this.options.prev;
                    itemContainer.addClass(this.options.prevClass);
                    break;
                case 'next':
                    itemText = this.options.next;
                    itemContainer.addClass(this.options.nextClass);
                    break;
                default:
                    break;
            }

            itemContainer.data('page', page);
            itemContainer.data('page-type', type);
            itemContainer.append(itemContent.attr('href', this.makeHref(page,year,month)).html(itemText));
            return itemContainer;
        },

        getPages: function (currentPage) {
            var pages = [];
            console.log('current page is: '+currentPage);
            var half = Math.floor(this.options.visiblePages / 2);
            var start = 1;
            console.log('start='+start);
            var end = this.options.totalPages;
            console.log('end='+end);
            // handle boundary case
            // if (start <= 0) {
            //     start = 0;
            //     end = this.options.visiblePages;
            // }
            // if (end > this.options.totalPages) {
            //     start = this.options.totalPages - this.options.visiblePages + 1;
            //     end = this.options.totalPages;
            // }

            var itPage = start;
            while (itPage <= end) {
                pages.push(itPage);
                itPage++;
            }

            return {"currentPage": currentPage, "numeric": pages};
        },

        render: function (pages) {
            this.$listContainer.children().remove();
            this.$listContainer.append(this.buildListItems(pages));

            var children = this.$listContainer.children();
            children.filter(function () {
                return $(this).data('page') === (pages.currentPage+1) && $(this).data('page-type') === 'page';
            }).addClass(this.options.activeClass);

            children.filter(function () {
                return $(this).data('page-type') === 'prev';
            }).toggleClass(this.options.disabledClass, pages.currentPage === 0);

            children.filter(function () {
                return $(this).data('page-type') === 'next';
            }).toggleClass(this.options.disabledClass, pages.currentPage === (this.options.totalPages-1));
        },

        setupEvents: function () {
            var base = this;
            this.$listContainer.find('li').each(function () {
                var $this = $(this);
                $this.off();
                if ($this.hasClass(base.options.disabledClass) || $this.hasClass(base.options.activeClass)) {
                    $this.click(function (evt) {
                        evt.preventDefault();
                    });
                    return;
                }
                $this.click(function (evt) {
                    // Prevent click event if href is not set.
                    !base.options.href && evt.preventDefault();
                    base.show(parseInt($this.data('page'), 10));
                });
            });
        },

        makeHref: function (c,y,m) {
          var href=this.options.href;
          var arr=href.split('&');
          y = (y == null) ? '' : y;
          m = (m == null) ? '' : m;

          var numberVar=arr[0].substr(arr[0].indexOf('=')+1);
          var yearVar=arr[1].substr(arr[1].indexOf('=')+1);
          var monthVar=arr[2].substr(arr[2].indexOf('=')+1);
          return href?href.replace(numberVar,c-1).replace(yearVar,y).replace(monthVar,m):'#';
            //return href ? href.replace(this.options.hrefVariable,  c-1) : "#";
        }

    };

    // PLUGIN DEFINITION
    $.fn.twbsPagination = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        var methodReturn;

        var $this = $(this);
        var data = $this.data('twbs-pagination');
        var options = typeof option === 'object' && option;

        if (!data) $this.data('twbs-pagination', (data = new TwbsPagination(this, options) ));
        if (typeof option === 'string') methodReturn = data[ option ].apply(data, args);

        return ( methodReturn === undefined ) ? $this : methodReturn;
    };

    $.fn.twbsPagination.defaults = {
        totalPages: 0,
        startPage: 0,
        visiblePages: 5,
        href: false,
        prev: '&laquo;',
        next: '&raquo;',
        loop: false,
        onPageClick: null,
        paginationClass: 'pagination',
        nextClass: 'next',
        prevClass: 'prev',
        pageClass: 'page',
        activeClass: 'current-page',
        disabledClass: 'disabled'
    };

    $.fn.twbsPagination.Constructor = TwbsPagination;

    $.fn.twbsPagination.noConflict = function () {
        $.fn.twbsPagination = old;
        return this;
    };

})(jQuery, window, document);