self.onmessage = function (event) {
    const { colorMatrix, windowPosNow, windowSize } = event.data;

    const result = [];
    for (let instrument = 0; instrument < colorMatrix.length; instrument++) {
        const instrumentColors = colorMatrix[instrument];
        const windowStart = Math.max(windowPosNow, 0);
        const windowEnd = Math.min(windowPosNow + windowSize, instrumentColors.length);

        const instrumentResult = [];
        for (let beatPosition = 0; beatPosition < instrumentColors.length; beatPosition++) {
            if (beatPosition + windowStart < windowEnd) {
                const color = instrumentColors[beatPosition + windowStart];
                instrumentResult.push({ beatPosition, color });
            } else {
                instrumentResult.push({ beatPosition, color: "rgb(255,255,255)" });
            }
        }

        result.push(instrumentResult);
    }

    self.postMessage(result);
};