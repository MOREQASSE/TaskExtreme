// TaskExtreme - Main Application Script

// --- Constants ---
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STORAGE_KEY = "taskextreme_tasks";
const CHECKED_KEY = "taskextreme_checked";

// --- State ---
let tasks = [];
let checked = {};
let currentDay = new Date().getDay() - 1; // Default to current day (0=Monday)
if (currentDay < 0) currentDay = 6; // Adjust for Sunday

// --- DOM Elements ---
const dayNav = document.getElementById('day-nav');
const tasksList = document.getElementById('tasks-list');
const tasksDayTitle = document.getElementById('tasks-day-title');
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const detailsInput = document.getElementById('task-details');
const timeStartInput = document.getElementById('task-time-start');
const timeEndInput = document.getElementById('task-time-end');
const repeatEverydayInput = document.getElementById('repeat-everyday');
const repeatDaysInputs = document.querySelectorAll('#repeat-days input[type="checkbox"]');
const addTaskBtn = document.getElementById('add-task');
const generatePdfBtn = document.getElementById('generate-pdf');
const dueDateInput = document.getElementById('task-due-date');

// --- Initialization ---
function init() {
  console.log("Initializing TaskExtreme...");
  loadTasks();
  loadChecked();
  setupEventListeners();
  renderDayNav();
  renderTasks();
}

function setupEventListeners() {
  // Day navigation
  dayNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      currentDay = parseInt(e.target.dataset.day);
      renderDayNav();
      renderTasks();
    }
  });

  // Form submission
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value.trim();
            if (!title) {
                alert("Please enter a task title");
                return;
            }
            
            const newTask = {
                id: Date.now().toString(),
                title: title,
                details: document.getElementById('task-details').value.trim(),
                timeStart: document.getElementById('task-time-start').value,
                timeEnd: document.getElementById('task-time-end').value,
                dueDate: document.getElementById('task-due-date').value || null,
                day: currentDay,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            // Handle repeating tasks
            const repeatEveryday = document.getElementById('repeat-everyday').checked;
            const repeatDays = Array.from(document.querySelectorAll('#repeat-days input:checked'))
                                  .map(cb => parseInt(cb.value));
            
            if (repeatEveryday) {
                newTask.repeat = 'everyday';
                delete newTask.day;
            } else if (repeatDays.length > 0) {
                newTask.repeat = 'days';
                newTask.days = repeatDays;
                delete newTask.day;
            }
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            taskForm.reset();
            
            console.log("Task added:", newTask);
        });
    }
  // Repeat everyday checkbox
  repeatEverydayInput.addEventListener('change', () => {
    if (repeatEverydayInput.checked) {
      repeatDaysInputs.forEach(cb => cb.checked = false);
    }
  });

  // Individual day checkboxes
  repeatDaysInputs.forEach(cb => {
    cb.addEventListener('change', () => {
      if (Array.from(repeatDaysInputs).some(c => c.checked)) {
        repeatEverydayInput.checked = false;
      }
    });
  });

  // PDF generation
  generatePdfBtn.addEventListener('click', handlePdfGeneration);


// --- Data Management ---
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    console.log(`Loaded ${tasks.length} tasks from storage`);
  } catch (e) {
    console.error("Error loading tasks:", e);
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  console.log(`Saved ${tasks.length} tasks`);
}

function loadChecked() {
  try {
    checked = JSON.parse(localStorage.getItem(CHECKED_KEY)) || {};
    console.log(`Loaded checked state for ${Object.keys(checked).length} tasks`);
  } catch (e) {
    console.error("Error loading checked state:", e);
    checked = {};
  }
}

function saveChecked() {
  localStorage.setItem(CHECKED_KEY, JSON.stringify(checked));
}

// --- Rendering ---
function renderDayNav() {
  Array.from(dayNav.children).forEach((li, idx) => {
    li.classList.toggle('active', idx === currentDay);
  });
}

function renderTasks() {
  if (!tasksList || !tasksDayTitle) {
    console.error("Missing required DOM elements for rendering tasks");
    return;
  }

  tasksDayTitle.textContent = DAYS[currentDay];
  tasksList.innerHTML = '';

  const todaysTasks = tasks.filter(task => (
    task.repeat === 'everyday' ||
    (task.repeat === 'days' && task.days && task.days.includes(currentDay)) ||
    (!task.repeat && task.day === currentDay)
  ));

  if (todaysTasks.length === 0) {
    tasksList.innerHTML = '<li class="no-tasks">No tasks for this day</li>';
    return;
  }

  todaysTasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;
    taskItem.draggable = true;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = !!checked[task.id];
    checkbox.addEventListener('change', () => {
      checked[task.id] = checkbox.checked;
      saveChecked();
      updateStreakCounter();
    });

    // Task content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    // Title with time
    const titleDiv = document.createElement('div');
    titleDiv.className = 'task-title';
    
    if (task.timeStart || task.timeEnd) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'task-time';
      timeSpan.textContent = `${task.timeStart || ''}${task.timeEnd ? ' - ' + task.timeEnd : ''}`;
      titleDiv.appendChild(timeSpan);
    }

    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    titleDiv.appendChild(titleSpan);

    // Repeat indicator
    if (task.repeat === 'everyday') {
      const repeatSpan = document.createElement('span');
      repeatSpan.className = 'task-repeat';
      repeatSpan.textContent = 'Daily';
      titleDiv.appendChild(repeatSpan);
    } else if (task.repeat === 'days' && task.days?.length) {
      const repeatSpan = document.createElement('span');
      repeatSpan.className = 'task-repeat';
      repeatSpan.textContent = 'Repeats: ' + task.days.map(d => DAYS[d].substring(0, 3)).join(', ');
      titleDiv.appendChild(repeatSpan);
    }

    // Due date (if exists)
    if (task.dueDate) {
      const dueSpan = document.createElement('span');
      dueSpan.className = 'task-due';
      dueSpan.textContent = 'Due: ' + new Date(task.dueDate).toLocaleDateString();
      titleDiv.appendChild(dueSpan);
    }

    contentDiv.appendChild(titleDiv);

    // Details (if exists)
    if (task.details) {
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'task-details';
      detailsDiv.textContent = task.details;
      contentDiv.appendChild(detailsDiv);
    }

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    actionsDiv.appendChild(deleteBtn);

    contentDiv.appendChild(actionsDiv);

    // Assemble task item
    taskItem.appendChild(checkbox);
    taskItem.appendChild(contentDiv);
    tasksList.appendChild(taskItem);
  });

  updateStreakCounter();
}

// --- Task Management ---
function handleTaskSubmit(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    alert("Please enter a task title");
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    details: detailsInput.value.trim(),
    timeStart: timeStartInput.value,
    timeEnd: timeEndInput.value,
    dueDate: dueDateInput.value || null,
    day: repeatEverydayInput.checked || repeatDaysInputs.some(cb => cb.checked) ? null : currentDay
  };

  if (repeatEverydayInput.checked) {
    newTask.repeat = 'everyday';
  } else {
    const checkedDays = Array.from(repeatDaysInputs)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));
    if (checkedDays.length > 0) {
      newTask.repeat = 'days';
      newTask.days = checkedDays;
    }
  }

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskForm.reset();
}

function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(task => task.id !== taskId);
    delete checked[taskId];
    saveTasks();
    saveChecked();
    renderTasks();
  }
}

// --- PDF Generation ---
async function handlePdfGeneration() {
    try {
        generatePdfBtn.disabled = true;
        generatePdfBtn.textContent = "Generating...";

        // Load jsPDF if needed
        if (typeof window.jspdf === "undefined") {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const today = new Date();
        const dayName = DAYS[currentDay];
        const formattedDate = today.toLocaleDateString('en-GB'); // dd/mm/yyyy format
        
        // Set initial coordinates
        let x = 15;
        let y = 20;
        
      // 1. Header with Title and Name Field

       // Set font for TaskExtreme (Segoe UI Arial, size 28, blue)
      pdf.setFont("Segoe UI", "arial"); // or "arial" if available, depends on PDF lib
      pdf.setFontSize(28);
      pdf.setTextColor(0, 0, 255); // Blue color (RGB: 0,0,255)
      pdf.text("TaskExtreme", x, y);

      // Set font for Full Name (Helvetica, size 15, black)
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(15);
      pdf.setTextColor(0, 0, 0); // Black color
      pdf.text("Full Name: ________________", 120, y);

      y += 10;
        
        // 2. Date Section
        pdf.setFontSize(23);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${dayName}, ${formattedDate}`, x+40, y += 15);
        
        // 3. Tasks Header
        pdf.setFont("helvetica", "bold");
        pdf.text("Tasks:", x, y += 10);
        pdf.setFont("helvetica", "normal");
        
        // 4. Task List
        const tasksToExport = tasks.filter(task => 
            task.repeat === 'everyday' || 
            (task.repeat === 'days' && task.days.includes(currentDay)) || 
            (!task.repeat && task.day === currentDay)
        );
        
        if (tasksToExport.length === 0) {
            pdf.text("No tasks for today", x + 5, y += 7);
        } else {
            tasksToExport.forEach((task, index) => {
                // Task checkbox and name
                pdf.setFontSize(21);
                pdf.text(`[  ] ${task.title}`, x + 5, y += 7);
                
                
                // Time range if available
                if (task.timeStart || task.timeEnd) {
                  pdf.setFontSize(16);
                  pdf.setFont("bahnschrift", "bold")  
                  pdf.text(`from: ${task.timeStart || '--:--'} → to: ${task.timeEnd || '--:--'}`, x + 15, y += 5);

                }
                
                // Details if available
                if (task.details) {
                    pdf.setFont("bahnschrift", "normal"); // or "arial" if available, depends on PDF lib
                    pdf.setFontSize(12);
                    pdf.setTextColor(0, 0, 0); // Blue color (RGB: 0,0,255)
                    pdf.text(`details: ${task.details}`, x + 15, y += 5);
                }
                
                // Due date if available
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate).toLocaleDateString('en-GB');
                    pdf.text(`due date: ${dueDate}`, x + 15, y += 5);
                }
                
                // Space between tasks
                y += 5;
                
                // Add new page if needed
                if (y > 250 && index < tasksToExport.length - 1) {
                    pdf.addPage();
                    y = 20;
                }
            });
        }
        
        // 5. Footer
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text("Made by TaskExtreme | taskextreme.static.domains", x, 285, { align: "center" });
        
        // Save PDF
        pdf.save(`TaskExtreme_${dayName}_${formattedDate.replace(/\//g, '-')}.pdf`);
        
    } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        generatePdfBtn.disabled = false;
        generatePdfBtn.textContent = "Generate PDF";
    }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// --- Streak Counter ---
function updateStreakCounter() {
  const streakCounter = document.getElementById('streak-counter');
  if (!streakCounter) return;
  
  const completedCount = Object.values(checked).filter(Boolean).length;
  streakCounter.textContent = `🔥 ${completedCount} tasks completed`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);