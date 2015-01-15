define(["exports", "Globals", "leaflet"], function(exports, Globals, leaflet) {

    var WorldMap = (function WorldMap() {
        var _cache = {
                mapEl     : $('#map')
            },
            _config = {
                prodIcon: null,
                bizIcon :null,
                prodBizIcon: null,
                prodIconUrl : '/assets/images/worldmap/prod-marker.png',
                bizIconUrl : '/assets/images/worldmap/biz-marker.png',
                prodBizIconUrl : '/assets/images/worldmap/prodbiz-marker.png',
                imageUrl : '/assets/images/worldmap/worldmap.svg',
                imageBounds : [[51.490, -0.142], [51.510, -0.078]],
                mapData: null,
                mapType: null
            },
            _wasInitialized = false,
            _timer = null,
            _map = null,

            _init = function _init() {
                // initialization functionality here
                _setupCache();
                _initMap();
                Globals.ResizeManager.addCallback(_resizeWorldMap);

                _wasInitialized = true;
                $.publish(Globals.Settings.CONSTANTS.EVENT_MODULE_INIT, "WorldMap");
            },

            _setupCache = function _setupCache() {
                // cache reused elements here
                _config.mapData = _cache.mapEl.data( "load-map");
                _config.mapType = _cache.mapEl.data( "map-type");
            },

            _resizeWorldMap = function _resizeWorldMap() {

                        clearTimeout(_timer);
                        _timer = setTimeout(function(){
                            _map.invalidateSize();
                            //console.log(_map.getSize());
                            //_map.setView([51.500, -0.1100],14.5,{reset:true});
                            //_map.invalidateSize({reset:true});
                        },500);

            },

            _initMap = function _initMap() {

                var europeGroup=[],
                    otherGroup=[],
                    expandedGroup=[];

                // Keeping more than one popup opened
                L.Map = L.Map.extend({
                    openPopup: function(popup) {
                        // this.closePopup();
                        this._popup = popup;
                        return this.addLayer(popup).fire('popupopen', {
                            popup: this._popup
                        });
                    }
                });

                // Creating map

                _map = L.map('map',
                    {   attributionControl: false,
                        zoomControl: true,
                        center: [51.500, -0.1100],
                        zoom: 14.5,
                        maxZoom: 17,
                        minZoom:14,
                        maxBounds: [[51.488, -0.142], [51.511, -0.078]],
                        closePopupOnClick: false
                    });

                L.imageOverlay(_config.imageUrl, _config.imageBounds).addTo(_map);

                // SET MARKERS

                var UbiIcon = L.Icon.extend({
                    options: {
                        iconSize:     [12, 12],
                        iconAnchor:   [6, 6]
                    }
                });

                _config.prodIcon = new UbiIcon({iconUrl: _config.prodIconUrl});
                _config.bizIcon = new UbiIcon({iconUrl: _config.bizIconUrl});
                _config.prodBizIcon = new UbiIcon({iconUrl: _config.prodBizIconUrl});

                //LOAD DATA FROM JSON

                $.getJSON( _config.mapData, function( data ) {

                    $.each( data, function( key, val ) {

                        var iconType,
                            marker,
                            popupOptions={},
                            index;

                        switch (val.type) {
                            case "production" : iconType = _config.prodIcon; break;
                            case "business" : iconType = _config.bizIcon; break;
                            case "production-business" : iconType = _config.prodBizIcon; break;
                        };

                        // PLACE MARKERS & POPUPS

                        marker = L.marker([val.coord[0], val.coord[1]], {icon: iconType});


                        // CHECK IF EUROPE & PUSH TO GROUP

                        if (val.group=="europe") { europeGroup.push(marker)};
                        if (val.group=="other") { otherGroup.push(marker)};

                        //ADD POPUPS

                        popupOptions = {closeButton:false, className: val.type + ' ' + val.arrow, autoPan:false};
                        if (val.offset) {popupOptions.offset=val.offset};

                        marker.addTo(_map);

                        if (!val.expanded) {

                            switch (_config.mapType) {
                                case "press" : marker.bindPopup("<a href='"+val.link+"' class='modal' data-mfpcontent-class='map-modal'>"+val.studio+"</a>",popupOptions); break;
                                default: marker.bindPopup("<a href='"+val.link+"'>"+val.studio+"</a>",popupOptions);
                            }

                        }
                        else { index = expandedGroup.push(marker)-1;
                            popupOptions.autoPan = false;
                            popupContent = "<a class='popup-action-expand' data-index='"+(index)+"'>"+val.studio+"</a>";

                            //Create Expandable Studio Links
                            studioLinks = "<div class='close-button'>X</div><ul>";
                            
                            switch (_config.mapType) {
                                case "press" :
                                    $.each( val.expanded, function( key, valExp ) {
                                        studioLinks += "<li><a href='"+valExp.url+"' class='modal' data-mfpcontent-class='map-modal'>"+valExp.name+"</a></li>";
                                    });
                                    break;
                                    default:
                                    $.each( val.expanded, function( key, valExp ) {
                                        studioLinks += "<li><a href='"+valExp.url+"'>"+valExp.name+"</a></li>";
                                   });
                            }

                            studioLinks += "</ul>";

                            popupContent += "<div class='popup-action-close-expand' style='display:none;' data-index='"+(index)+"'>"+studioLinks+"</div>";
                            expandedGroup[index].bindPopup(popupContent,popupOptions); }

                        if (val.popup) marker.openPopup();

                    });

                });

                //ADD EVENTS

                _actionPopupGroup = function _actionPopupGroup(group, action) {
                    $.each( group, function( key, val ) {
                        if (action=="open") { val.openPopup() };
                        if (action=="close") { val.closePopup() };
                    });
                };

                _map.on('zoomend', function(e) {

                    //HIDE EXPANDED POPUPS
                    _cache.mapEl.find('.popup-action-close-expand').hide();
                    //$.each( expandedGroup, function (key,val) {
                    //    val.setPopupContent();
                    //});

                    if( e.target._zoom >= 16 ) {
                        //display EU
                        _actionPopupGroup(europeGroup,'open');

                    } else {
                        //hide EU
                        _actionPopupGroup(europeGroup,'close');
                    };

                    if( e.target._zoom >= 15 ) {
                        //display OTHERS
                        _actionPopupGroup(otherGroup,'open');

                    } else {
                        //hide OTHERS
                        _actionPopupGroup(otherGroup,'close');
                    };
                });

                _cache.mapEl.on('click','.popup-action-expand',function(){
                    $(this).parent().find('.popup-action-close-expand').show();
                    expandedGroup[$(this).data('index')].setPopupContent();
                })

                _cache.mapEl.on('click','.popup-action-close-expand .close-button',function(){
                    $(this).parent().hide();
                    expandedGroup[$(this).parent().data('index')].setPopupContent();
                    //$.each( expandedGroup, function (key,val) { val.setPopupContent()});
                });

            },

            _eradicate = function _eradicate() {
                if (_wasInitialized) {
                    // eradication functionality here
                    Globals.ResizeManager.removeCallback(_resizeWorldMap);
                    _wasInitialized = false;
                    _garbage();
                }
            },

            _garbage = function _garbage() {
                for (var item in _cache) {
                    delete _cache[item];
                }
                for (var item in _config) {
                    delete _config[item];
                }
            };

        return {
            eradicate : _eradicate,
            init : _init
        };
    })();

    exports.Module = WorldMap;

});
