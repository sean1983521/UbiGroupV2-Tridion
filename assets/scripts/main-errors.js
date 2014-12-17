define(["mock-test", "Globals"], function(mock, Globals) {

    var mainErrors = (function mainErrors() {

        var _audioContext = null;
        
        _audioBuffer = null,
        
        _audioSource = null,
        
        _audioFile = '/assets/audio/glass.mp3',

        _init = function _init() {
            
            Globals.Helpers.initializeGlobalHeader();
            Globals.ResizeManager.init();
            Globals.ImageLazyLoader.init();

            if ($('.glass').length) {

                _initWebAudio();

                $('.glass').on('webkitAnimationEnd msAnimationEnd animationend', function() {
                    _playSound(_audioBuffer);
                });

            }
            
        },

        _initWebAudio = function _initWebAudio() {
            try {
                window.AudioContext = window.AudioContext||window.webkitAudioContext;
                _audioContext = new AudioContext();
            } catch (e) {
                console.log('no support for web audio api');
            }

            if (_audioContext !== null) {
                _loadSound(_audioFile);
            }
        },

        _loadSound = function _loadSound(url) {
            
            var request = new XMLHttpRequest();
            
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                _audioContext.decodeAudioData(request.response, function (buffer) {
                    _audioBuffer = buffer;
                });
            }
            request.send();

        },

        _playSound = function _playSound(anybuffer) {

            _audioSource = _audioContext.createBufferSource();
            _audioSource.buffer = anybuffer;
            _audioSource.connect(_audioContext.destination);
            _audioSource.start(0);

        };

        return {
            init: _init
        };

    })();

    mainErrors.init();

    return mainErrors;

});
