const minToMs = (minutes) => {
    return minutes * 60 * 1000;
};

let currentEditTaskId = null;

let isPaused = false;

let studyBlock = minToMs(25);
let breakBlock = minToMs(10);

// fallback value in case API doesn't work
let niceQuoteOfTheSession = "Engage your mind. Every discovery today fuels tomorrow's brilliance.";

fetch('https://stormhacks.api.tinagrit.com/api/quote').then(res => {
    if (!res.ok) {
        throw new Error(`status: ${res.status}`);
    }
    return res.json();
}).then(json => {
    niceQuoteOfTheSession = json.quote;
})


// local storage
let tasks = [
    { id: '1', title: 'Complete Math Assignment', description: 'Chapter 5 problems 1-20', timeNeeded: 60, priority: 80, dueDate: '2025-10-08'},
    { id: '2', title: 'Read Chapter 5 - Biology', description: 'Cell structure and functions', timeNeeded: 60,  priority: 60, dueDate: '2025-10-10'},
    { id: '3', title: 'Prepare for Quiz', description: 'Physics mechanics review', timeNeeded: 60,  priority: 90, dueDate: '2025-10-12'},
    { id: '4', title: 'Review Lecture Notes', description: 'Review all week notes', timeNeeded: 60,  priority: 40, dueDate: '2025-10-15'}
];

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (e) {
            console.error(e);
        }
    }
}
loadTasksFromLocalStorage();







document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const page = tab.dataset.page;
        showPage(page);
        
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

function showPage(pageName) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
}

const calculateAndPreview = () => {
    recalculateBlocks();
    previewTime.innerHTML = Math.floor(totalTime / (1000*60)) + ' min'
    if (totalTime > 0) {
        document.getElementById('start-session-btn').classList.remove('inactive');
    } else {
        document.getElementById('start-session-btn').classList.add('inactive');
    }
}

// Time Configuration
const studyTimeSlider = document.getElementById('study-time-slider');
const breakTimeSlider = document.getElementById('break-time-slider');
const studyTimeValue = document.getElementById('study-time-value');
const breakTimeValue = document.getElementById('break-time-value');
const totalTimeValue = document.getElementById('total-time-value');
const previewTime = document.getElementById('preview-time');

studyTimeSlider.addEventListener('input', () => {
    studyBlock = parseInt(studyTimeSlider.value);
    studyTimeValue.innerHTML = studyBlock + ' min';
    studyBlock = minToMs(studyBlock);
    calculateAndPreview();
});

breakTimeSlider.addEventListener('input', () => {
    breakBlock = parseInt(breakTimeSlider.value);
    breakTimeValue.innerHTML = breakBlock + ' min';
    breakBlock = minToMs(breakBlock);
    calculateAndPreview();
});

// Task Management
function renderTasks() {
    const taskList = document.getElementById('task-list');
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
    
    if (sortedTasks.length === 0) {
        document.getElementById('no-tasks-msg').classList.remove('hidden');
        taskList.innerHTML = '';
        return;
    }

    document.getElementById('no-tasks-msg').classList.add('hidden');
    taskList.innerHTML = sortedTasks.map(task => `
        <div class="task-item">
            <div class="flex gap-3">
                <input type="checkbox" class="checkbox" onchange="toggleTaskTime(${task.id})">
                <div class="w-full">
                    <div class="flex justify-between items-center mb-2" style="flex-wrap: wrap; gap: 0.5rem;">
                        <p style="flex: 1;">${task.title}</p>
                        <span class="badge ${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span>
                    </div>
                    <div class="mb-2 timeNeeded" id="time-needed-for-${task.id}">
                        <div class="flex justify-between mb-2">
                            <label style="font-size: 0.875rem;" class="text-muted">Time needed</label>
                            <span style="font-size: 0.875rem;" class="text-primary" id="time-value-for-${task.id}">60 min</span>
                        </div>
                        <input type="range" class="slider" min="1" max="120" step="1" value="60" oninput="updateCurrentTask('${task.id}', this.value)">
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

let includedTasks = [];
let studyTime = 0;

function toggleTaskTime(taskId) {
    if (includedTasks.includes(taskId)) {
        let indexToRemove = includedTasks.indexOf(taskId);
        document.getElementById('time-needed-for-'+taskId).classList.remove('active');
        includedTasks.splice(indexToRemove, 1);
    } else {
        includedTasks.push(taskId);
        document.getElementById('time-needed-for-'+taskId).classList.add('active');
    }
    updateTaskTime();
}

function updateCurrentTask(taskId, newTime) {
    newValue = parseInt(newTime);

    tasks.forEach(task => {
        if (task.id == taskId) {
            task.timeNeeded = newValue;
        }
    })

    document.getElementById('time-value-for-'+taskId).innerHTML = newValue + ' min';

    updateTaskTime();
}

function updateTaskTime() {
    studyTime = 0;
    includedTasks.forEach(taskId => {
        tasks.forEach(task => {
            if (task.id == taskId) {
                studyTime += task.timeNeeded;
            }
        })
    });
    document.getElementById('total-time-value').innerHTML = studyTime + ' min';
    studyTime = minToMs(studyTime);
    calculateAndPreview();
}

function getPriorityLabel(priority) {
    if (priority >= 75) return 'Critical';
    if (priority >= 50) return 'High';
    if (priority >= 25) return 'Medium';
    return 'Low';
}

function getPriorityClass(priority) {
    if (priority >= 75) return 'badge-critical';
    if (priority >= 50) return 'badge-high';
    if (priority >= 25) return 'badge-medium';
    return 'badge-low';
}

// Tasks Page
function renderTasksPage() {
    const currentTasksList = document.getElementById('current-tasks-list');

    const currentTasks = tasks;

    currentTasksList.innerHTML = currentTasks.map(task => createTaskCard(task)).join('');
}

function createTaskCard(task) {
    return `
        <div class="card" style="padding: 1.25rem;">
            <div class="flex justify-between gap-4" style="align-items: flex-start;">
                <div style="flex: 1;">
                    <div class="flex items-center gap-3 mb-2" style="flex-wrap: wrap;">
                        <h4>${task.title}</h4>
                        <span class="badge ${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span>
                    </div>
                    <p class="text-muted mb-2">${task.description}</p>
                    <div class="flex items-center gap-2 text-muted" style="font-size: 0.875rem;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="btn" onclick="openEditModal('${task.id}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                </button>
            </div>
        </div>
    `;
}

let currentlyAddingTask = false;

function openEditModal(taskId) {
    let task;
    if (parseInt(taskId) == -1) {
        currentlyAddingTask = true;
        document.getElementById('editTaskModalTitle').innerHTML = "Add Task";
        currentEditTaskId = '0';
        if (tasks.length > 0) {
            currentEditTaskId = String(parseInt(tasks[tasks.length-1].id)+1);
        }
        task = {
            id: currentEditTaskId,
            title: '', 
            description: '', 
            timeNeeded: 60, 
            priority: 50, 
            dueDate: new Date().toISOString().slice(0, 10)
        }
        tasks.push(task);
    } else {
        currentlyAddingTask = false;    
        document.getElementById('editTaskModalTitle').innerHTML = "Edit Task";
        currentEditTaskId = taskId;
        task = tasks.find(t => t.id === taskId);
    }

    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description;
    document.getElementById('edit-task-due-date').value = task.dueDate;
    document.getElementById('edit-due-date-display').textContent = new Date(task.dueDate).toLocaleDateString();
    document.getElementById('edit-priority-slider').value = task.priority;
    updatePriorityDisplay(task.priority);
    
    document.getElementById('edit-task-modal').classList.add('show');
}

document.getElementById('edit-priority-slider').addEventListener('input', (e) => {
    updatePriorityDisplay(parseInt(e.target.value));
});

function updatePriorityDisplay(priority) {
    document.getElementById('edit-priority-value').textContent = `${priority}%`;
    const badge = document.getElementById('edit-priority-badge');
    badge.textContent = getPriorityLabel(priority);
    badge.className = 'badge ' + getPriorityClass(priority);
}

document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    if (currentlyAddingTask) {
        tasks.splice(tasks.length-1,1);
    }
    document.getElementById('edit-task-modal').classList.remove('show');
    currentlyAddingTask = false;
});

document.getElementById('save-edit-btn').addEventListener('click', () => {
    currentlyAddingTask = false;
    if (currentEditTaskId) {
        tasks = tasks.map(t => {
            if (t.id === currentEditTaskId) {
                return {
                    ...t,
                    title: document.getElementById('edit-task-title').value,
                    description: document.getElementById('edit-task-description').value,
                    dueDate: document.getElementById('edit-task-due-date').value,
                    priority: parseInt(document.getElementById('edit-priority-slider').value)
                };
            }
            return t;
        });
        renderTasks();
        renderTasksPage();
        saveTasksToLocalStorage();
        document.getElementById('edit-task-modal').classList.remove('show');
    }
});

// Schedule
function renderSchedule() {
    const scheduleBody = document.getElementById('schedule-body');
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM
    
    scheduleBody.innerHTML = hours.map(hour => {
        const timeLabel = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
        return `
            <tr>
                <td style="background-color: rgba(31, 31, 31, 0.3);">${timeLabel}</td>
                <td>${hour === 10 ? '<div class="schedule-event"><p>CMPT 120 Lecture</p><p style="font-size: 0.75rem; color: var(--muted);">10:00 AM</p></div>' : ''}</td>
                <td>${hour === 13 ? '<div class="schedule-event" style="background-color: rgba(239, 68, 68, 0.2); border-left-color: #ef4444;"><p>Math Tutorial</p><p style="font-size: 0.75rem; color: var(--muted);">1:00 PM</p></div>' : ''}</td>
                <td>${hour === 10 ? '<div class="schedule-event"><p>CMPT 120 Lecture</p><p style="font-size: 0.75rem; color: var(--muted);">10:00 AM</p></div>' : ''}</td>
                <td>${hour === 13 ? '<div class="schedule-event" style="background-color: rgba(239, 68, 68, 0.2); border-left-color: #ef4444;"><p>Math Tutorial</p><p style="font-size: 0.75rem; color: var(--muted);">1:00 PM</p></div>' : ''}</td>
                <td>${hour === 15 ? '<div class="schedule-event" style="background-color: rgba(185, 28, 28, 0.3); border-left-color: #b91c1c;"><p>Group Project</p><p style="font-size: 0.75rem; color: var(--muted);">3:00 PM</p></div>' : ''}</td>
                <td></td>
                <td></td>
            </tr>
        `;
    }).join('');
}

// Timer Session
document.getElementById('start-session-btn').addEventListener('click', () => {
    // start the timer
    if (totalTime <= 0) {
        return;
    }

    document.getElementById('current-task-name').textContent = 'test';
    document.getElementById('timer-session').classList.remove('hidden');
    
    updateSessionDisplay();
});

document.getElementById('exit-session-btn').addEventListener('click', () => {
    // stop the timer

    // document.getElementById('timer-session').classList.add('hidden');
    window.location.reload();
});

// document.getElementById('pause-resume-btn').addEventListener('click', () => {
//     isPaused = !isPaused;
//     document.getElementById('pause-resume-btn').textContent = isPaused ? 'Resume' : 'Pause';
    
//     if (!isPaused) {
//         // resume the timer
//     } else {
//         // stop the timer
//     }
// });

document.getElementById('finish-task-btn').addEventListener('click',()=> {
    if (fullTimer.time != 0) {
        skipToNextTask();
    }
})

document.getElementById('add-time-btn').addEventListener('click', () => {
    addStudyMinutes(5);
    console.log('here')
});

function updateSessionDisplay() {
    recalculateBlocks();
    restartTimer();
    requestAnimationFrame(tick);
}

// Initialize
renderTasks();
renderTasksPage();
renderSchedule();