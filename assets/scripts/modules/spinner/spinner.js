define(['modules/spinner/logo', 'modules/spinner/tween', 'modules/spinner/raf'], function(drawLogo, Tween, requestAnimationFrame) {

    var Spinner = function Spinner(){

        var _cache = {
            root: null,
        },

        _config = {
            size: 58,
            phase: 0,
            speed: 0.1,
            ctx: null,
            className: 'spinner',
            tween: null,
            logoColor: 'black',
            followDelay: 0.1,
            duration: 600,
            dots: [
              {location: {x: 0, y: 0}, radius: 4, color: '#d3d3d3'},
              {location: {x: 0, y: 0}, radius: 3, color: '#d3d3d3'},
              {location: {x: 0, y: 0}, radius: 2, color: '#d3d3d3'}
            ],
            debug: 0,
            invert: false,
            orbitRadius: 0
        },

        _init = function _init(){

            var root = document.createElement('canvas');
            root.className = _config.className;
            root.width = root.height = _config.size;
            _config.orbitRadius = (_config.size - _config.dots[0].radius) / 2
            root.style.marginTop = ($('.block-modal').height() / 2) - (_config.size / 2) + 'px';
            root.style.marginLeft = ($('.block-modal').height() / 2) - (_config.size / 2) + 'px';
            _cache.root = autoscale(root);
            _config.ctx = _cache.root.getContext('2d')
            _draw(_config.ctx);

            root = null;

            return _cache.root;

        },

        _start = function _start(){

            _cache.root.style.marginTop = ($('.block-modal').height() / 2) - (_config.size / 2) + 'px';
            _cache.root.className += ' spinning';

            var from = { orbitRadius: _config.invert ? 3 : _config.orbitRadius, phase: 0},
                to = { orbitRadius: _config.invert ? _config.orbitRadius : 3, phase: -1};

            var phase = 0;
            _config.tween = Tween(from)
                .to(to)
                .duration(_config.duration)
                // .ease('in-out-quint')
                .update(function(o){
                    for ( var i = 0, l = _config.dots.length; i < l; i += 1 ) {
                      _config.dots[i].location.x = _config.size / 2 + o.orbitRadius * Math.sin(Math.PI * 2 * 2 * ( o.phase + _config.followDelay * i ));
                      _config.dots[i].location.y = _config.size / 2 + o.orbitRadius * Math.cos(Math.PI * 2 * 2 * ( o.phase + _config.followDelay * i ));
                    }
                    _draw(_config.ctx);
                })
                .on('end', function(){
                    _cache.root.className = _cache.root.className.replace(/\sspinning/g, '');
                    _config.invert = !_config.invert;
                    _config.tween = null;
                    _start();
                });
            _config.tween.id = _config.debug++;
            _update();
        },

        _stop = function _stop(){
            _cache.root.className = _cache.root.className.replace(/\sspinning/g, '');
            _config.tween = null;
        },

        _update = function _update(){
            if (_config.tween) {
                _config.tween.update();
                requestAnimationFrame(_update);
            }
        },

        _draw = function _draw(ctx){

            _cache.root.style.marginTop = ($('.block-modal').height() / 2) - (_config.size / 2) + 'px';

            ctx.clearRect(0, 0, _config.size, _config.size);
            // _drawLogo(ctx);
            _drawDots(ctx);
        },

        _drawDots = function _drawDots(ctx){

            for ( var i = 0, l =_config.dots.length; i < l; i += 1 ) {
              var x = _config.dots[i].location.x,
                  y = _config.dots[i].location.y,
                  r = _config.dots[i].radius;

              ctx.fillStyle = _config.dots[i].color;
              ctx.beginPath();

              ctx.arc(x, y, r, 0, 2 * Math.PI, false);
              ctx.fill();
            }
        },

        _drawLogo = function _drawLogo(ctx){
            ctx.fillStyle = _config.logoColor
            drawLogo(ctx);
        },

        _logoColor = function _logoColor(color){
            if ( color ) {
                _config.logoColor = color;
                return this;
            } else {
                return _config.logoColor;
            }
        },

        _dotColor = function _dotColor(colors){
            if ( colors ) {
                if ('string' === typeof colors) {
                  colors = [colors, colors, colors];
                } else {
                  colors = colors;
                }

                for ( var i = 0, l = _config.dots.length; i < l; i += 1 ) {
                  _config.dots[i].color = colors[i];
                }
                return this;
            } else {
                return _config.dotColor;
            }
        },

        _getCanvas = function _getCanvas(){
            return _cache.root;
        };

        return {
            init: _init,
            start: _start,
            stop: _stop,
            // logoColor: _logoColor,
            dotColor: _dotColor,
            getCanvas: _getCanvas
        }
    };

    // Retinafy.
    function autoscale(canvas){
        var ctx = canvas.getContext('2d');
        var ratio = window.devicePixelRatio || 1;
        if (1 != ratio) {
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
            canvas.width *= ratio;
            canvas.height *= ratio;
            ctx.scale(ratio, ratio);
        }
        return canvas;
    };

    return Spinner;
});
