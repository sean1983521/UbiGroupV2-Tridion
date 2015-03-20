define(['jquery','jQuery.twbsPagination'],function($,twbsPagination){
          var search=window.location.search;

          var _config={
               pagination: $('ul.pagination'),
               selYear: $('#press-filter-year'),
               selMonth: $('#press-filter-month'),
               filterButton: $('#press-filter-button'),
               pressArticles: $('#press-articles'),
               pressArticleList: $('#press-articles-list')
          };

     	var _init=function _init(){
     		_loadPressList();
               _loadPressDetail();
     	},

     	_loadPressList=function _loadPressList(){
     		
     		//$pagination.empty();
               if((_config.selYear.length > 0) && (_config.selMonth.length > 0)){
                    $('option:gt(0)', _config.selYear).remove();
                    $.each(getYears(),function(i,y){
                         _config.selYear.append('<option val="'+y+'">'+y+'</option>');
                    });

                    if(_config.filterButton.length > 0){
                         _config.filterButton.on('click',function(){
                              if($('option:selected',_config.selMonth).val()!='' && $('option:selected',_config.selYear).val()==''){
                                   return false;
                              }
                         });
                    }

                    var ym=getYearMonthState();

                    reset(_config.selYear,ym.year);
                    reset(_config.selMonth,ym.month);
               }

               if(_config.pressArticles.length!=0){
     		   var pageIndex=parseInt(_config.pressArticleList.attr('data-pageindex'));
     		   var pageSize=parseInt(_config.pressArticleList.attr('data-pagesize'));
     		   var totalItems=parseInt(_config.pressArticleList.attr('data-totalcount'));
                  if(totalItems==0){
                      _config.pressArticleList.html('<strong><h3>Cannot find any results.</h3></strong>');
                  }else{
     		        var totalPages=Math.ceil(totalItems/pageSize);
     		        _config.pagination.twbsPagination({
                             totalPages: totalPages,
                             visiblePages: totalPages,
                             startPage: pageIndex,
                             href: '?pageindex={{number}}&year={{year}}&month={{month}}'
                         });
                    }
               }
     	};

    _loadPressDetail = function _loadPressDetail() {
        if ($('#press-article').length != 0) {
            var downloadUrl = $('#press-article .article-header').attr('data-download');
            if (downloadUrl != null) {
                $('#press-article .left-group .press-button a').attr('href', downloadUrl);
            } else {
                $('#press-article .left-group .press-button a').attr('style', 'cursor: default');
            }

            var url = window.location.href;
            var title = $('#press-article .article-header .title h2').text();
            var facebookUrlTemplate = "http://www.facebook.com/sharer.php?s=100&p[url]=${url}&p[title]=${title}";
            var twitterUrlTemplate = "http://twitter.com/home?status=${title}: ${url}";
            data = {
                title: title,
                url: url
            };
            var facebookUrl = facebookUrlTemplate.replace(/\${([^}]+)}/g, function (m1, m2, s) { return encodeURIComponent(data[m2] || ''); });
            var twitterUrl = twitterUrlTemplate.replace(/\${([^}]+)}/g, function (m1, m2, s) { return encodeURIComponent(data[m2] || ''); }); ;
            $('#press-article .icon-social-facebook').attr('href', facebookUrl);
            $('#press-article .icon-social-twitter').attr('href', twitterUrl);

            var currentId = $('#press-article .article-header').attr('data-id'); ;
            var allIds = $('#press-article .article-header').attr('data-allids');
            var arrayAllIds = allIds.split('|');
            var preId = "";
            var nexId = "";
            for (var i = 0; i < arrayAllIds.length; i++) {
                if (arrayAllIds[i] == currentId) {
                    if (i == 0) {
                        nexId = arrayAllIds[i + 1];
                    }
                    else if (i == arrayAllIds.length - 1) {
                        preId = arrayAllIds[i - 1];
                    }
                    else {
                        nexId = arrayAllIds[i + 1];
                        preId = arrayAllIds[i - 1];
                    }
                }
            }
            var preUrl = url.split('=')[0] + "=" + preId;
            var nexUrl = url.split('=')[0] + "=" + nexId;
            if (preId == "") {
                $('#press-article .right-group .press-button:eq(2) a').attr('href', nexUrl);
                $('#press-article .right-group .press-button:eq(1) a').attr('style', 'cursor: default');
            }
            else if (nexId == "") {
                $('#press-article .right-group .press-button:eq(1) a').attr('href', preUrl);
                $('#press-article .right-group .press-button:eq(2) a').attr('style', 'cursor: default');
            }
            else if (preId != "" && nexId != "") {
                $('#press-article .right-group .press-button:eq(1) a').attr('href', nexUrl);
                $('#press-article .right-group .press-button:eq(2) a').attr('href', preUrl);
            }
        }
    };

          function getYears(){
               var years=[];
               var curYear=(new Date()).getFullYear();
               for(var i=curYear;i>=2000;i--){
                    years.push(i);
               }
               return years;
          };

          function getYearMonthState(){
               var year='',month='';
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
            return {'year':year,'month':month};
          };

          function reset(sel,y_m){
               if(y_m==''){
                    sel[0].selectedIndex=0;
               }else{
                    $.each(sel.find('option'),function(i,opt){
                         var $this=$(opt);
                         if($this.val()==y_m){
                              $this.attr('selected','selected');
                         }
                    });
               }
          }

     	return {
     		init:_init
     	};
});

