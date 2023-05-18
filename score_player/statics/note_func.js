

export function load(abc, soundFontUrl) {
    console.log(abc);
    console.log(soundFontUrl);

    var visualOptions = { responsive: 'resize', drum: 'dddd 76 77 77 77 60 30 30 30' };
    var visualObj = ABCJS.renderAbc("paper", abc, visualOptions)[0];

    // var visualObj = abcjs.renderAbc("paper", abcString, visualOptions);
    // First draw the music - this supplies an object that has a lot of information about how to create the synth.
    // NOTE: If you want just the sound without showing the music, use "*" instead of "paper" in the renderAbc call.
    // var visualOptions = { add_classes: true, responsive: "resize", wrap: { minSpacing: 2 } };
    // console.log(visualObj.lines[0].staff[0].voices[0])

    // var xhr = new XMLHttpRequest();
    // xhr.open('GET', '/notes/' + encodeURIComponent(JSON.stringify(visualObj.lines[0].staff[0].voices[0])), true);
    // xhr.send();

    console.log(visualObj)
    console.log(visualObj.lines)
    // This object is the class that will contain the buffer
    var midiBuffer;

    var startAudioButton = document.querySelector(".activate-audio");
    var stopAudioButton = document.querySelector(".stop-audio");
    // var explanationDiv = document.querySelector(".suspend-explanation");
    var statusDiv = document.querySelector(".status");

    // ABCJS.synth.setSoundFont("../midi_folders/soundfont.sf2");
    startAudioButton.addEventListener("click", function () {
        startAudioButton.setAttribute("style", "display:none;");
        // explanationDiv.setAttribute("style", "opacity: 0;");
        statusDiv.innerHTML = "<div>Testing browser</div>";

        if (ABCJS.synth.supportsAudio()) {
            var controlOptions = {
                displayLoop: true,
                displayRestart: true,
                displayPlay: true,
                displayProgress: true,
                displayWarp: true,
                displayClock: true
            };
            stopAudioButton.setAttribute("style", "");

            var synthControl = new ABCJS.synth.SynthController();
            synthControl.load("#audio", cursorControl, controlOptions);
            synthControl.disable(true);
            // An audio context is needed - this can be passed in for two reasons:
            // 1) So that you can share this audio context with other elements on your page.
            // 2) So that you can create it during a user interaction so that the browser doesn't block the sound.
            // Setting this is optional - if you don't set an audioContext, then abcjs will create one.
            window.AudioContext = window.AudioContext ||
                window.webkitAudioContext ||
                navigator.mozAudioContext ||
                navigator.msAudioContext;
            var audioContext = new window.AudioContext();
            audioContext.resume().then(function () {
                statusDiv.innerHTML += "<div>AudioContext resumed</div>";
                // In theory the AC shouldn't start suspended because it is being initialized in a click handler, but iOS seems to anyway.

                // This does a bare minimum so this object could be created in advance, or whenever convenient.
                midiBuffer = new ABCJS.synth.CreateSynth();
                // These are the original soundfonts supplied. They will need a volume boost:

                // midiBuffer.init preloads and caches all the notes needed. There may be significant network traffic here.
                midiBuffer.soundFontUrl = soundFontUrl;
                return midiBuffer.init({
                    visualObj: visualObj,
                    audioContext: audioContext,
                    options: { soundFontUrl: soundFontUrl, program: 128 },
                    // soundFonturl: soundFontUrl,
                    millisecondsPerMeasure: visualObj.millisecondsPerMeasure()
                }).then(function () {
                    synthControl.setTune(visualObj[0], true).then(function (response) {
                        document.querySelector(".abcjs-inline-audio").classList.remove("disabled");
                    })
                }).then(function (response) {
                    console.log("Notes loaded: ", response);
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
        // explanationDiv.setAttribute("style", "");
        stopAudioButton.setAttribute("style", "display:none;");
        if (midiBuffer)
            midiBuffer.stop();
    });
    function CursorControl(rootSelector) {
        var self = this;

        // This demonstrates two methods of indicating where the music is.
        // 1) An element is created that is moved along for each note.
        // 2) The currently being played note is given a class so that it can be transformed.
        self.cursor = null; // This is the svg element that will move with the music.
        self.rootSelector = rootSelector; // This is the same selector as the renderAbc call uses.

        self.onStart = function () {
            // This is called when the timer starts so we know the svg has been drawn by now.
            // Create the cursor and add it to the sheet music's svg.
            var svg = document.querySelector(self.rootSelector + " svg");
            self.cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
            self.cursor.setAttribute("class", "abcjs-cursor");
            self.cursor.setAttributeNS(null, 'x1', 0);
            self.cursor.setAttributeNS(null, 'y1', 0);
            self.cursor.setAttributeNS(null, 'x2', 0);
            self.cursor.setAttributeNS(null, 'y2', 0);
            svg.appendChild(self.cursor);
        };

        self.removeSelection = function () {
            // Unselect any previously selected notes.
            var lastSelection = document.querySelectorAll(self.rootSelector + " .abcjs-highlight");
            for (var k = 0; k < lastSelection.length; k++)
                lastSelection[k].classList.remove("abcjs-highlight");
        };


        self.onEvent = function (ev) {

            // This is called every time a note or a rest is reached and contains the coordinates of it.
            if (ev.measureStart && ev.left === null)
                return; // this was the second part of a tie across a measure line. Just ignore it.

            self.removeSelection();

            // Select the currently selected notes.
            for (var i = 0; i < ev.elements.length; i++) {
                var note = ev.elements[i];
                for (var j = 0; j < note.length; j++) {
                    note[j].classList.add("abcjs-highlight");
                }
            }

            // Move the cursor to the location of the current note.
            if (self.cursor) {
                self.cursor.setAttribute("x1", ev.left - 2);
                self.cursor.setAttribute("x2", ev.left - 2);
                self.cursor.setAttribute("y1", ev.top);
                self.cursor.setAttribute("y2", ev.top + ev.height);
            }



        };
        self.onFinished = function () {
            self.removeSelection();

            if (self.cursor) {
                self.cursor.setAttribute("x1", 0);
                self.cursor.setAttribute("x2", 0);
                self.cursor.setAttribute("y1", 0);
                self.cursor.setAttribute("y2", 0);
            }


        };
    }

    var cursorControl = new CursorControl("#paper");

    document.querySelector(".start").addEventListener("click", startTimer);

    function onEvent(ev) {
        if (ev)
            cursorControl.onEvent(ev);
        else
            cursorControl.onFinished();
    }

    function startTimer() {
        cursorControl.onStart();

        var timingCallbacks = new ABCJS.TimingCallbacks(visualObj, {
            eventCallback: onEvent
        });
        timingCallbacks.start();
    }
}


export function note_manipulation(p) {
    console.log(p.style, p.pitch);
    if (p.style == "x" && p.pitch == 81) {
        p.pitch = 49;
    }
}

