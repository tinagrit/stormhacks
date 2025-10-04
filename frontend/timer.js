// all time variables in miliseconds

const minToMs = (minutes) => {return minutes*60*1000};

// hardcoded example data
const targetTotalTime = minToMs(1);
const studyBlock = minToMs(0.1);
const breakBlock = minToMs(0.05);


// helper functions
const updateHTML = () => {
    document.getElementById('currentTimer').querySelector('.hour').innerHTML = forceTwoDigits(currentTimer.hour);
    document.getElementById('currentTimer').querySelector('.minute').innerHTML = forceTwoDigits(currentTimer.minute);
    document.getElementById('currentTimer').querySelector('.second').innerHTML = forceTwoDigits(currentTimer.second);

    document.getElementById('fullTimer').querySelector('.hour').innerHTML = forceTwoDigits(fullTimer.hour);
    document.getElementById('fullTimer').querySelector('.minute').innerHTML = forceTwoDigits(fullTimer.minute);
    document.getElementById('fullTimer').querySelector('.second').innerHTML = forceTwoDigits(fullTimer.second);
}

const forceTwoDigits = (int) => {
    return int.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})
}

const updateTimerObj = (obj) => {
    let total = obj.time;

    obj.hour = Math.floor(total / 3600000);
    obj.minute = Math.floor((total % 3600000) / 60000);
    obj.second = Math.floor((total % 60000) / 1000);
}

// calculations
const fullBlock = studyBlock + breakBlock;
let totalTime = targetTotalTime - breakBlock; // so that it doesn't end with a break

if (targetTotalTime % fullBlock != 0) {
    totalTime = (Math.floor(targetTotalTime/fullBlock) + 1)*fullBlock - breakBlock;
}

let isBreak = 0;

let currentTimer = {
    time: 0,
    hour: 0,
    minute: 0,
    second: 0
}

currentTimer.time = studyBlock;
updateTimerObj(currentTimer);

let fullTimer = {
    time: 0,
    hour: 0,
    minute: 0,
    second: 0
}

fullTimer.time = totalTime;
updateTimerObj(fullTimer);

updateHTML();


const startTime = new Date().getTime();

function tick() {
    const now = new Date().getTime();
    const elapsed = now - startTime;

    const fullBlockCount = Math.floor(elapsed / fullBlock);
    const timeInBlock = elapsed % fullBlock;

    if (timeInBlock < studyBlock) {
        state = 0;
        document.getElementById('sessionName').innerHTML = "Study Time";
        currentTimer.time = studyBlock - timeInBlock;
    } else {
        state = 1;
        document.getElementById('sessionName').innerHTML = "Break Time";
        currentTimer.time = fullBlock - timeInBlock;
    }

    // Calculate full timer remainder (time left in total session)
    const timeRemaining = totalTime - elapsed;
    fullTimer.time = timeRemaining > 0 ? timeRemaining : 0;

    // When total time runs out, finish timer
    if (timeRemaining <= 0) {
        currentTimer.time = 0;
        updateTimerObj(currentTimer);
        updateTimerObj(fullTimer);
        updateHTML();
        document.getElementById('sessionName').innerHTML = "Session Ended";
        return; // Stop updating
    }

    // Update timer objects and HTML
    updateTimerObj(currentTimer);
    updateTimerObj(fullTimer);
    updateHTML();

    // Queue next frame update for smooth and accurate timing
    requestAnimationFrame(tick);
}

// Start the timer loop with requestAnimationFrame
requestAnimationFrame(tick);