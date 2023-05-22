let canProceed = true;

self.onmessage = async (event) => {
    if (event.data.signal) {
        canProceed = true;
        return;
    }

    let { sharedVars, soundMatrix, colorMatrix, windowSize, start, end, maxBeatPositionCounter, repeat } = event.data;


    let colorResults = [];
    let soundResults = [];
    let counter = 0;
    // if (repeat) {
    //     for (let windowPosNow = start; windowPosNow < end; windowPosNow++) {
    //         console.log("6666666", event.data);
    //         counter++;
    //         // console.log(sharedVars.secondToMove);
    //         const updatedColors = calculateUpdatedColors(colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat);
    //         [results, counter] = await send_data_partitions(updatedColors, results, counter);
    //         console.log(counter, results.length, canProceed);
    //     }
    // }
    // else {
    for (let windowPosNow = start; windowPosNow < end; windowPosNow++) {
        counter++;
        // console.log(sharedVars.secondToMove);
        const [updatedColors, updatedSounds] = calculateUpdatedColors(soundMatrix, colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat);
        [soundResults, colorResults, counter] = await send_data_partitions(updatedSounds, updatedColors, soundResults, colorResults, counter);
        // }
    }

    console.log("here mfssss", colorResults.length);
    self.postMessage([soundResults, colorResults]);

    async function send_data_partitions(updatedSounds, updatedColors, soundResults, colorResults, counter) {
        colorResults.push(updatedColors);
        soundResults.push(updatedSounds);
        // if (counter == 5) {
        //     console.log("canProceed is: ", canProceed);
        //     if (!canProceed) {
        //         await new Promise(resolve => {
        //             const interval = setInterval(() => {
        //                 // console.log("canProceed is: ", canProceed);
        //                 if (canProceed) {
        //                     setInterval(100);
        //                     clearInterval(interval);
        //                     resolve();
        //                 }
        //             }, 100);  // Check every 100 ms
        //         });
        //     }
        //     console.log("sent", results);
        //     self.postMessage(results);
        //     console.log("already sent");
        //     results = [];
        //     counter = 0;
        //     canProceed = false;  // After posting data, wait for signal to proceed
        // }

        return [soundResults, colorResults, counter]
    }

};


function calculateUpdatedColors(soundMatrix, colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat) {
    const updatedColors = [];
    const updatedSounds = [];

    // console.log(windowPosNow, windowSize, maxBeatPositionCounter, repeat);
    for (let instrument = 0; instrument < colorMatrix.length; instrument++) {
        const instrumentColors = colorMatrix[instrument];
        const soundNotes = soundMatrix[instrument];
        const windowStart = Math.max(windowPosNow, 0);
        let windowEnd = instrumentColors.length;
        let windowExtra = -1;

        if (repeat && windowPosNow + windowSize > windowEnd) {
            // Wrap around to the beginning of the array
            windowExtra = windowPosNow + windowSize % windowEnd;
        }

        // console.log("windowExtra", windowExtra);
        for (let beatPosition = 0; beatPosition < maxBeatPositionCounter; beatPosition++) {
            if (beatPosition + windowStart < windowEnd) {
                // console.log("hereee????");
                const color = instrumentColors[beatPosition + windowStart];
                const sound = soundNotes[beatPosition + windowStart];
                updatedColors.push([instrument, beatPosition, color]);
                updatedSounds.push([instrument, beatPosition, sound]);
            }
            else if (windowExtra > -1) {
                // console.log("are you coming here at all?");
                const color = instrumentColors[(beatPosition + windowStart) % windowEnd];
                const sound = soundNotes[(beatPosition + windowStart) % windowEnd];
                updatedColors.push([instrument, beatPosition, color]);
                updatedSounds.push([instrument, beatPosition, sound]);
            }
            else {
                updatedColors.push([instrument, beatPosition, "rgb(255,255,255)"]);
                updatedSounds.push([instrument, beatPosition, 0]);
            }
        }
    }

    return [updatedColors, updatedSounds];
}