

export function load(abc, soundFontUrl) {
    console.log(abc)
    console.log(soundFontUrl)
    // First draw the music - this supplies an object that has a lot of information about how to create the synth.
    // NOTE: If you want just the sound without showing the music, use "*" instead of "paper" in the renderAbc call.
    var visualObj = ABCJS.renderAbc("paper", abc, {
        soundFonturl: soundFontUrl,
        responsive: "resize"
    })[0];

    console.log("{% static }")
    // This object is the class that will contain the buffer
    var midiBuffer;

    var startAudioButton = document.querySelector(".activate-audio");
    var stopAudioButton = document.querySelector(".stop-audio");
    var explanationDiv = document.querySelector(".suspend-explanation");
    var statusDiv = document.querySelector(".status");

    // ABCJS.synth.setSoundFont("../midi_folders/soundfont.sf2");
    startAudioButton.addEventListener("click", function () {
        startAudioButton.setAttribute("style", "display:none;");
        explanationDiv.setAttribute("style", "opacity: 0;");
        statusDiv.innerHTML = "<div>Testing browser</div>";

        if (ABCJS.synth.supportsAudio()) {
            stopAudioButton.setAttribute("style", "");

            // An audio context is needed - this can be passed in for two reasons:
            // 1) So that you can share this audio context with other elements on your page.
            // 2) So that you can create it during a user interaction so that the browser doesn't block the sound.
            // Setting this is optional - if you don't set an audioContext, then abcjs will create one.
            window.AudioContext = window.AudioContext ||
                window.webkitAudioContext ||
                navigator.mozAudioContext ||
                navigator.msAudioContext;
            var audioContext = new window.AudioContext();
            Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(
                audioContext.resume()).then(function () {
                    statusDiv.innerHTML += "<div>AudioContext resumed</div>";
                    // In theory the AC shouldn't start suspended because it is being initialized in a click handler, but iOS seems to anyway.

                    // This does a bare minimum so this object could be created in advance, or whenever convenient.
                    midiBuffer = new ABCJS.synth.CreateSynth();
                    // These are the original soundfonts supplied. They will need a volume boost:

                    // midiBuffer.init preloads and caches all the notes needed. There may be significant network traffic here.
                    midiBuffer.soundFontUrl = soundFontUrl
                    return midiBuffer.init({
                        visualObj: visualObj,
                        audioContext: audioContext,
                        options: {},
                        // soundFonturl: soundFontUrl,
                        millisecondsPerMeasure: visualObj.millisecondsPerMeasure()
                    }).then(function (response) {
                        console.log(midiBuffer.soundFontUrl)
                        console.log("Notes loaded: ", response)
                        statusDiv.innerHTML += "<div>Audio object has been initialized</div>";
                        // console.log(response); // this contains the list of notes that were loaded.
                        // midiBuffer.prime actually builds the output buffer.
                        return midiBuffer.prime();
                    }).then(function (response) {
                        statusDiv.innerHTML += "<div>Audio object has been primed (" + response.duration + " seconds).</div>";
                        statusDiv.innerHTML += "<div>status = " + response.status + "</div>"
                        // At this point, everything slow has happened. midiBuffer.start will return very quickly and will start playing very quickly without lag.
                        midiBuffer.start();
                        statusDiv.innerHTML += "<div>Audio started</div>";
                        return Promise.resolve();
                    }).catch(function (error) {
                        if (error.status === "NotSupported") {
                            stopAudioButton.setAttribute("style", "display:none;");
                            var audioError = document.querySelector(".audio-error");
                            audioError.setAttribute("style", "");
                        } else
                            console.warn("synth error", error);
                    });
                });
        } else {
            var audioError = document.querySelector(".audio-error");
            audioError.setAttribute("style", "");
        }
    });

    stopAudioButton.addEventListener("click", function () {
        startAudioButton.setAttribute("style", "");
        explanationDiv.setAttribute("style", "");
        stopAudioButton.setAttribute("style", "display:none;");
        if (midiBuffer)
            midiBuffer.stop();
    });
}