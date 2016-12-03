var MPD = (function () {
    'use strict';

    function createAudioElement(el) {
        var source = el.getAttribute('data-src'),
            audio  = new Audio();

        audio.setAttribute('controls', '');
        audio.setAttribute('src', source);

        el.append(audio);

        return audio;
    }

    MPD.prototype = {
        initialize: function () {
            if (this.audio.paused) {
                this.audio.currentTime = 0;
                this.audio.play();
            }
        },

        destroy: function () {
            this.audio.pause();
            this.el.removeChild(this.audio);
        }
    }

    function MPD(el) {
        this.el    = el;
        this.audio = createAudioElement(el);
    }

    return MPD;
}());

document.addEventListener("DOMContentLoaded", function(event) {
    'use strict';

    window.mpdNode = new MPD(document.querySelector("#mpd"));
    window.mpdNode.initialize();
});

window.addEventListener('unload', function(event) {
    window.mpdNode.destroy();

    delete window.mpdNode;
});
