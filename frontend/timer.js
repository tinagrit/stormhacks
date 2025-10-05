// all time variables in milliseconds

// const minToMs = (minutes) => {
//     return minutes * 60 * 1000;
// };

// helper functions
const updateHTML = () => {
    let sessionTimerText = "";
    if (currentTimer.hour > 0) {
        sessionTimerText += forceTwoDigits(currentTimer.hour) + ':';
    }
    sessionTimerText += forceTwoDigits(currentTimer.minute) + ':' + forceTwoDigits(currentTimer.second);
    document.getElementById('session-timer').innerHTML = sessionTimerText;

    let fullTimerText = "";
    if (fullTimer.hour > 0) {
        fullTimerText += forceTwoDigits(fullTimer.hour) + ':';
    }
    fullTimerText += forceTwoDigits(fullTimer.minute) + ':' + forceTwoDigits(fullTimer.second);
    document.getElementById('session-time-left').innerHTML = fullTimerText;
};

const forceTwoDigits = (int) => {
    return int.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
};

const updateTimerObj = (obj) => {
    let total = obj.time;
    obj.hour = Math.floor(total / 3600000);
    obj.minute = Math.floor((total % 3600000) / 60000);
    obj.second = Math.floor((total % 60000) / 1000);
};

let numBlocks = Math.floor(studyTime / studyBlock);

// Array: [{type: 'study', duration}, {type: 'break', duration}, ...]
let blocks = [];
let totalTime = 0;
function recalculateBlocks() {
    numBlocks = Math.floor(studyTime / studyBlock);
    totalTime = (numBlocks * studyBlock) + ((numBlocks - 1) * breakBlock);
    blocks = [];
    for (let i = 0; i < numBlocks; i++) {
        blocks.push({ type: 'study', duration: studyBlock });
        if (i !== numBlocks - 1) {
            blocks.push({ type: 'break', duration: breakBlock });
        }
    }
}

let currentTimer = { time: blocks[0] ? blocks[0].duration : 0, hour: 0, minute: 0, second: 0 };
updateTimerObj(currentTimer);

let fullTimer = { time: totalTime, hour: 0, minute: 0, second: 0 };
updateTimerObj(fullTimer);

function addStudyMinutes(minutes) {
    studyTime += minToMs(minutes);
    recalculateBlocks();
}

let startTime = Date.now();
function restartTimer() {
    startTime = Date.now();

    // reset to block[0]
    currentTimer.time = blocks[0] ? blocks[0].duration : 0;
    fullTimer.time = totalTime;
    updateTimerObj(currentTimer);
    updateTimerObj(fullTimer);
    updateHTML();
    requestAnimationFrame(tick);
}

function tick() {
    console.log('ticking!');
    let now = Date.now();
    let elapsed = now - startTime;
    let timePassed = 0, state = 'study', timeInBlock = 0, blockIndex = 0;

    for (; blockIndex < blocks.length; blockIndex++) {
        if (elapsed < timePassed + blocks[blockIndex].duration) {
            state = blocks[blockIndex].type;
            timeInBlock = elapsed - timePassed;
            break;
        }
        timePassed += blocks[blockIndex].duration;
    }

    let timeLeft = blockIndex < blocks.length ? blocks[blockIndex].duration - timeInBlock : 0;

    currentTimer.time = timeLeft;
    fullTimer.time = Math.max(totalTime - elapsed, 0);
    updateTimerObj(currentTimer);
    updateTimerObj(fullTimer);

    document.getElementById('session-phase').textContent =
        blockIndex < blocks.length ? (state === 'study' ? "Study" : "Break") : "Session Ended";

    updateHTML();

    if (fullTimer.time > 0) {
        setTimeout(()=>{requestAnimationFrame(tick);},500);
    }
}