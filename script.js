let tasks = [];

// Handle form submission
document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const taskName = document.getElementById('task-name').value;
    const taskDate = document.getElementById('task-date').value;
    const deadlineDate = document.getElementById('deadline-date').value;
    const deadlineTime = document.getElementById('deadline-time').value;

    // Combine date and time into a single Date object
    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);
    
    const task = { taskName, taskDate, deadline, completed: false };
    tasks.push(task);
    displayTasks();
    this.reset();
});

// Sort tasks by priority and deadline
function sortTasks(tasks) {
    const taskCountPerDay = tasks.reduce((acc, task) => {
        const dateKey = task.taskDate;
        if (!acc[dateKey]) acc[dateKey] = 0;
        acc[dateKey]++;
        return acc;
    }, {});

    return tasks.sort((a, b) => {
        const aPriority = determinePriority(a.deadline, taskCountPerDay[a.taskDate]);
        const bPriority = determinePriority(b.deadline, taskCountPerDay[b.taskDate]);

        if (aPriority !== bPriority) {
            return priorityValue(aPriority) - priorityValue(bPriority); // Sort by priority
        }
        return a.deadline - b.deadline; // Then sort by deadline
    });
}

// Convert priority string to value for sorting
function priorityValue(priority) {
    switch (priority) {
        case "High": return 1;
        case "Medium": return 2;
        case "Low": return 3;
        case "Overdue": return 0;
        default: return 4; // Fallback for any undefined priorities
    }
}

// Display tasks in the task list
function displayTasks() {
    const pendingTaskList = document.getElementById('pending-tasks');
    const completedTaskList = document.getElementById('completed-tasks');
    pendingTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    // Sort only pending tasks
    const sortedPendingTasks = sortTasks(tasks.filter(task => !task.completed));

    sortedPendingTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.textContent = `${task.taskName} - Due: ${task.deadline.toLocaleString()}`;
        
        const timeLeft = calculateTimeLeft(task.deadline);
        const priority = determinePriority(task.deadline, sortedPendingTasks.length);
        const timeLeftDiv = document.createElement('div');
        timeLeftDiv.className = 'time-left';
        timeLeftDiv.textContent = `Time left: ${timeLeft} | Priority: ${priority}`;
        taskDiv.appendChild(timeLeftDiv);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            tasks = tasks.filter(t => t !== task);
            displayTasks();
        };

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Mark Complete';
        completeButton.onclick = () => {
            task.completed = true; // Set completed state to true
            displayTasks(); // Refresh task list
        };
        taskDiv.appendChild(completeButton);
        taskDiv.appendChild(deleteButton);
        pendingTaskList.appendChild(taskDiv);
    });

    // Display completed tasks without priority
    tasks.forEach(task => {
        if (task.completed) {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.textContent = `${task.taskName} - Completed on: ${new Date().toLocaleString()}`;
            completedTaskList.appendChild(taskDiv);
        }
    });
}

// Calculate time left until the deadline
function calculateTimeLeft(deadline) {
    const now = new Date();
    const timeDiff = deadline - now;

    if (timeDiff < 0) return "Deadline has passed";

    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
}

// Determine priority based on time left and number of tasks
function determinePriority(deadline, taskCount) {
    const now = new Date();
    const timeDiff = deadline - now;

    if (timeDiff < 0) return "Overdue"; // Overdue tasks have the highest urgency
    
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    
    // Base priority on time left, adjusted by the number of tasks due on the same day
    if (hoursLeft <= 1) {
        return "High"; // High priority
    } else if (hoursLeft <= 3) {
        return "Medium"; // Medium priority
    } else {
        return "Low"; // Low priority
    }
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to display the clock immediately
updateClock();

function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clock');
    clock.textContent = now.toLocaleString();
}

// About modal functionality
document.getElementById('about-button').onclick = function() {
    document.getElementById('about-modal').style.display = 'block';
};

document.querySelector('.close-button').onclick = function() {
    document.getElementById('about-modal').style.display = 'none';
};

// Close the modal if the user clicks anywhere outside of it
window.onclick = function(event) {
    const modal = document.getElementById('about-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
