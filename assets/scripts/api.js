define([], function() {
    var API = (function API(){
        var _config = {
            autocompletePath : '/api/search.ashx',
            searchPath       : '/api/search.ashx'
        },

        _autocomplete = function _autocomplete(term, callback){
            var requestData = {
                    q : term
                };

            _makeJSONCall(_config.autocompletePath, requestData, callback, false);
        },

        _search = function _search(options, callback){
            _makeJSONCall(_config.searchPath, options, callback, true);
        },

        _getPage = function _getPage(url, callback){
            return $.ajax({
                url: url
            }).done(function(html){
                if (callback !== undefined){
                    callback(html);
                }
            }).fail(function(error){
                _handleError(error);
            });
        },

        _makeJSONCall = function _makeJSONCall(url, requestData, callback, handleError){
            $.ajax({
                url: url,
                data: requestData
            }).done(function(data){
                if (typeof data === "string"){
                    data = JSON.parse(data);
                }
                if (data.ErrorMsg === null){
                    callback(data);
                } else {
                    if (handleError){
                        _handleError(data);
                    }
                }
            }).fail(function(error){
                if (handleError){
                    _handleError(error);
                }
            });
        },

        _handleError = function _handleError(error){
            //console.error('API _handleError', error);
        };

        return {
            autocomplete : _autocomplete,
            getPage : _getPage,
            search : _search
        };
    })();

    return API;
});
