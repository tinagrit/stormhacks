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
    numBlocks = Math.ceil(studyTime / studyBlock);
    blocks = [];
    let remainingStudy = studyTime;
    totalTime = 0;

    for (let i = 0; i < numBlocks; i++) {
        let thisBlockDuration = (i === numBlocks - 1) ? remainingStudy : Math.min(studyBlock, remainingStudy);
        blocks.push({ type: 'study', duration: thisBlockDuration });
        totalTime += thisBlockDuration;
        remainingStudy -= thisBlockDuration;

        if (i !== numBlocks - 1) {
            blocks.push({ type: 'break', duration: breakBlock });
            totalTime += breakBlock;
        }
    }
    if (totalTime < 0) totalTime = 0;

    assignTasksToStudyBlocks();
}

function assignTasksToStudyBlocks() {
    let includedTaskList = [];
    includedTasks.forEach(taskId => {
        tasks.forEach(task => {
            if (task.id == taskId) {
                includedTaskList.push(task);
            }
        })
    });

    let taskList = [];
    for (let t of includedTaskList) taskList.push({ ...t }); // deep copy
    let taskIndex = 0, taskLeft = taskList.length > 0 ? (taskList[0].timeNeeded * 1000 * 60) : 0;

    for (let block of blocks) {
        if (block.type !== 'study') { block.tasks = null; continue; }
        let segmentTasks = [];
        let blockLeft = block.duration;
        // Fit task slices into this study block
        while (blockLeft > 0 && taskList.length > 0) {
            let slice = Math.min(taskLeft, blockLeft);
            segmentTasks.push({ name: taskList[taskIndex].title, time: slice, id: taskList[taskIndex].id });
            taskLeft -= slice;
            blockLeft -= slice;
            if (taskLeft === 0) {
                taskIndex++;
                if (taskIndex < taskList.length) {
                    taskLeft = (taskList[taskIndex].timeNeeded * 1000 * 60);
                } else {
                    taskList.length = 0;
                }
            }
        }
        block.tasks = segmentTasks;
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

let lastSentState = null;
function sendCommandIfChanged(newState) {
    if (lastSentState !== newState) {
        sendCommand(newState);
        lastSentState = newState;
    }
}

function tick() {
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

    if (blockIndex < blocks.length) {
        if (state == 'study') {
            document.getElementById('session-phase').textContent = "Study";
            document.getElementById('current-interval').textContent = (blocks[blockIndex].duration / (1000*60)) + ' min';
            document.getElementById('current-interval').textContent += " (Study)"

            // Show which task (or part of a task) applies to this position in block
            let studyTasks = blocks[blockIndex].tasks || [];
            let taskPointer = 0, subElapsed = 0, taskText = "";
            for (let seg of studyTasks) {
                if (timeInBlock < subElapsed + seg.time) {
                    // In this slice
                    let taskTimeLeft = Math.ceil((seg.time - (timeInBlock - subElapsed))/1000/60);
                    taskText = seg.name;
                    break;
                }
                subElapsed += seg.time;
            }
            document.getElementById('current-task-name').textContent = taskText;

            if (document.getElementById('mainBackground').classList.contains('break')) {
                document.getElementById('mainBackground').classList.remove('break');
            }

            if (haveWorkingArduino) {
                sendCommandIfChanged("STUDY");
            }
        } else {
            document.getElementById('session-phase').textContent = "Break";
            document.getElementById('current-interval').textContent = (blocks[blockIndex].duration / (1000*60)) + ' min';
            document.getElementById('current-interval').textContent += " (Break)"
            if (!(document.getElementById('mainBackground').classList.contains('break'))) {
                document.getElementById('mainBackground').classList.add('break');
            }

            if (haveWorkingArduino) {
                sendCommandIfChanged("BREAK");
            }
        }
    } else {
        document.getElementById('session-phase').textContent = "Session Ended";
        document.getElementById('mainBackground').classList.add('finished');
        document.getElementById('current-task-name').textContent = niceQuoteOfTheSession;
        document.getElementById('timer-control-buttons').classList.add('finished');

        if (haveWorkingArduino) {
            sendCommandIfChanged("FINISHED");
        }
    }

    updateHTML();

    if (fullTimer.time > 0) {
        setTimeout(()=>{requestAnimationFrame(tick);},500);
    }
}

function skipToNextTask() {
    let now = Date.now();
    let elapsed = now - startTime;

    let flattenedTasks = [];
    let cumulative = 0;
    for (const block of blocks) {
        if (block.type === 'study' && block.tasks) {
            for (const segment of block.tasks) {
                flattenedTasks.push({
                    name: segment.name,
                    start: cumulative,
                    duration: segment.time,
                    id: segment.id
                });
                cumulative += segment.time;
            }
        } else {
            cumulative += block.duration;
        }
    }
    

    let currentTaskName = null;
    let currentTaskId = null;
    for (const t of flattenedTasks) {
        if (elapsed >= t.start && elapsed < t.start + t.duration) {
            currentTaskName = t.name;
            currentTaskId = t.id;
            break;
        }
    }

    if (!currentTaskName) {
        startTime = now - totalTime;
        tick();
        return;
    }
    
    for (let i=0; i<tasks.length; i++) {
        if (tasks[i].id == currentTaskId) {
            tasks.splice(i,1);
            saveTasksToLocalStorage();
        }
    }

    // find start time of next task
    for (let i = 0; i < flattenedTasks.length; i++) {
        if (flattenedTasks[i].name === currentTaskName) {
            let j = i + 1;
            while (j < flattenedTasks.length && flattenedTasks[j].name === currentTaskName) {
                j++;
            }
            if (j < flattenedTasks.length) {
                startTime = now - flattenedTasks[j].start;
                tick();
                return;
            } else {
                // current is last task
                startTime = now - totalTime;
                tick();
                return;
            }
        }
    }

    // fallback
    startTime = now - totalTime;
    tick();
}
