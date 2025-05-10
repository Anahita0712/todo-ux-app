// Function to show a page
function showPage(pageId) {
    // First, hide all pages
    const pages = document.querySelectorAll(".page-content");
    pages.forEach((page) => {
      page.style.display = "none";
    });
  
    // Now, display the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
      selectedPage.style.display = "block";
    }
  }

  let dailyTasks = [];

  // Save to localStorage
  function saveDailyTasks() {
    localStorage.setItem("dailyTasks", JSON.stringify(dailyTasks));
  }
  
  // Load from localStorage
  function loadDailyTasks() {
    const stored = localStorage.getItem("dailyTasks");
    if (stored) {
      dailyTasks = JSON.parse(stored);
      updateTaskList();
    }
  }
  
  // Delete all
  function deleteAllDailyTasks() {
    if (confirm("Are you sure you want to delete all daily tasks?")) {
      dailyTasks = [];
      saveDailyTasks();
      updateTaskList();
    }
  }
  
  // Add task
  function addDailyTask() {
    const input = document.getElementById("daily-task-input");
    const task = input.value.trim();
  
    if (task) {
      const newTask = {
        id: Date.now(),
        task: task,
        completed: false
      };
  
      dailyTasks.push(newTask);
      saveDailyTasks();
      input.value = "";
      updateTaskList();
  
      // --- SYNC with calendar tasks ---
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
      // Load calendar tasks or initialize if not available
      let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
  
      if (!tasks[formattedDate]) {
        tasks[formattedDate] = [];
      }
  
      tasks[formattedDate].push(task);
      localStorage.setItem("tasks", JSON.stringify(tasks));
  
      // Re-render calendar (if it's already loaded)
      if (typeof renderCalendar === "function") {
        renderCalendar();
      }
    }
  }
  
  // Update list
  function updateTaskList() {
    const taskList = document.getElementById("daily-task-list");
    taskList.innerHTML = "";
  
    dailyTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.classList.add("task-item");
  
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.onclick = () => toggleTaskComplete(task.id);
  
      const label = document.createElement("span");
      label.innerText = task.task;
  
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.onclick = () => deleteDailyTask(task.id);

      // Create edit button for the task
      const editButton = document.createElement("button");
      editButton.innerText = "Edit";
      editButton.onclick = () => editDailyTask(task.id);

      // Append edit and delete buttons to the task item
      taskItem.appendChild(editButton);
      taskItem.appendChild(checkbox);
      taskItem.appendChild(label);
      taskItem.appendChild(deleteButton);
      taskList.appendChild(taskItem);
    });

    updateProgressBar(); 
  }

  function editDailyTask(taskId) {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (task) {
      const newTaskText = prompt("Edit your task:", task.task);
      if (newTaskText !== null && newTaskText.trim() !== "") {
        task.task = newTaskText.trim();
        saveDailyTasks();      // Persist updated task
        updateTaskList();      // Re-render
      }
    }
  }

  function updateProgressBar() {
    const totalTasks = dailyTasks.length;
    const completedTasks = dailyTasks.filter(task => task.completed).length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${progressPercent}%`;
  
    if (progressPercent < 50) {
      progressBar.style.backgroundColor = "red";
    } else if (progressPercent < 100) {
      progressBar.style.backgroundColor = "orange";
    } else {
      progressBar.style.backgroundColor = "green";
    }
  }
  
  // Toggle
  function toggleTaskComplete(taskId) {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveDailyTasks();
      updateTaskList();
    }
  }
  
  // Delete one task
  function deleteDailyTask(taskId) {
    dailyTasks = dailyTasks.filter((t) => t.id !== taskId);
    saveDailyTasks();
    updateTaskList();
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadDailyTasks();
    syncDailyTasksToCalendar();
  });  

  function syncDailyTasksToCalendar() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
  
    if (!tasks[formattedDate]) {
      tasks[formattedDate] = [];
    }
  
    // Avoid duplicating if already synced
    const existingTasks = new Set(tasks[formattedDate]);
  
    dailyTasks.forEach(t => {
      if (!existingTasks.has(t.task)) {
        tasks[formattedDate].push(t.task);
      }
    });
  
    localStorage.setItem("tasks", JSON.stringify(tasks));
  
    if (typeof renderCalendar === "function") {
      renderCalendar();
    }
  }
  
 // Array to store weekly goals
let weeklyGoals = [];

// Save goals to localStorage
function saveWeeklyGoals() {
  localStorage.setItem("weeklyGoals", JSON.stringify(weeklyGoals));
}

// Load goals from localStorage
function loadWeeklyGoals() {
  const storedGoals = localStorage.getItem("weeklyGoals");
  if (storedGoals) {
    weeklyGoals = JSON.parse(storedGoals);
    updateWeeklyGoalList();
  }
}

// Function to delete all weekly goals
function deleteAllGoals() {
  if (confirm("Are you sure you want to delete all goals?")) {
    weeklyGoals = [];  // Clear all goals
    saveWeeklyGoals(); // Save empty list
    updateWeeklyGoalList();  // Re-render the goal list
  }
}

// Function to add a weekly goal
function addWeeklyGoal() {
  const input = document.getElementById("weekly-goal-input");
  const goal = input.value.trim();
  
  if (goal) {
    // Create a new goal object
    const newGoal = {
      id: Date.now(),  // Use current timestamp as unique ID
      goal: goal,
      completed: false
    };

    weeklyGoals.push(newGoal);
    saveWeeklyGoals(); // Save to localStorage
    input.value = "";
    updateWeeklyGoalList();
  }
}

// Function to update the weekly goal list
function updateWeeklyGoalList() {
  const goalListDiv = document.getElementById("weekly-goal-list");
  goalListDiv.innerHTML = "";  // Clear the list before updating

  weeklyGoals.forEach((goal) => {
    const goalItem = document.createElement("li");
    goalItem.classList.add("goal-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = goal.completed;
    checkbox.onclick = () => toggleGoalCompletion(goal.id);

    const label = document.createElement("span");
    label.innerText = goal.goal;

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.onclick = () => deleteGoal(goal.id);

    goalItem.appendChild(checkbox);
    goalItem.appendChild(label);
    goalItem.appendChild(deleteButton);

    goalListDiv.appendChild(goalItem);
  });
}

// Function to toggle the completion status of a goal
function toggleGoalCompletion(goalId) {
  const goal = weeklyGoals.find((g) => g.id === goalId);
  if (goal) {
    goal.completed = !goal.completed;
    saveWeeklyGoals(); // Save changes
    updateWeeklyGoalList();
  }
}

// Function to delete a goal
function deleteGoal(goalId) {
  weeklyGoals = weeklyGoals.filter((g) => g.id !== goalId);
  saveWeeklyGoals(); // Save after deletion
  updateWeeklyGoalList();
}

// Load saved goals when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  loadWeeklyGoals();
});

// Array to store monthly goals
let monthlyGoals = [];

// Save to localStorage
function saveMonthlyGoals() {
  localStorage.setItem("monthlyGoals", JSON.stringify(monthlyGoals));
}

// Load from localStorage
function loadMonthlyGoals() {
  const stored = localStorage.getItem("monthlyGoals");
  if (stored) {
    monthlyGoals = JSON.parse(stored);
    updateMonthlyGoalList();
  }
}

// Delete all monthly goals
function deleteAllMonthlyGoals() {
  if (confirm("Are you sure you want to delete all monthly goals?")) {
    monthlyGoals = [];
    saveMonthlyGoals();
    updateMonthlyGoalList();
  }
}

// Add monthly goal
function addMonthlyGoal() {
  const input = document.getElementById("monthly-goal-input");
  const goal = input.value.trim();

  if (goal) {
    const newGoal = {
      id: Date.now(),
      goal: goal,
      completed: false
    };

    monthlyGoals.push(newGoal);
    saveMonthlyGoals();
    input.value = "";
    updateMonthlyGoalList();
  }
}

// Update UI
function updateMonthlyGoalList() {
  const goalList = document.getElementById("monthly-goal-list");
  goalList.innerHTML = "";

  monthlyGoals.forEach((goal) => {
    const goalItem = document.createElement("li");
    goalItem.classList.add("goal-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = goal.completed;
    checkbox.onclick = () => toggleMonthlyGoal(goal.id);

    const label = document.createElement("span");
    label.innerText = goal.goal;

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.onclick = () => deleteMonthlyGoal(goal.id);

    goalItem.appendChild(checkbox);
    goalItem.appendChild(label);
    goalItem.appendChild(deleteButton);
    goalList.appendChild(goalItem);
  });
}

// Toggle complete
function toggleMonthlyGoal(goalId) {
  const goal = monthlyGoals.find((g) => g.id === goalId);
  if (goal) {
    goal.completed = !goal.completed;
    saveMonthlyGoals();
    updateMonthlyGoalList();
  }
}

// Delete one goal
function deleteMonthlyGoal(goalId) {
  monthlyGoals = monthlyGoals.filter((g) => g.id !== goalId);
  saveMonthlyGoals();
  updateMonthlyGoalList();
}

document.addEventListener("DOMContentLoaded", () => {
  loadMonthlyGoals();
});

// Array to hold the reflect entries
let reflectEntries = [];

// Function to add a Reflect entry
function addReflectEntry() {
  const textInput = document.getElementById("reflect-input");
  const fileInput = document.getElementById("reflect-file-input");

  const text = textInput.value.trim();
  const file = fileInput.files[0];

  if (text || file) {
    // Capture current date and time
    const currentDate = new Date();
    const dateTime = currentDate.toLocaleString();  // Formats date and time (you can adjust the format as needed)

    // Create an entry object with text, file data, and date/time
    const newEntry = {
      id: Date.now(), // Use timestamp as ID
      text,
      file: file ? URL.createObjectURL(file) : null, // Create URL for the file if it exists
      dateTime
    };

    reflectEntries.push(newEntry);
    saveEntriesToLocalStorage();  // Save to localStorage
    updateReflectList(); // Re-render the list

    // Clear the inputs
    textInput.value = "";
    fileInput.value = "";
  }
}

// Function to delete a Reflect entry
function deleteReflectEntry(entryId) {
  reflectEntries = reflectEntries.filter(entry => entry.id !== entryId);
  saveEntriesToLocalStorage();  // Update localStorage after deletion
  updateReflectList();  // Re-render the list
}

// Function to save entries to localStorage
function saveEntriesToLocalStorage() {
  localStorage.setItem('reflectEntries', JSON.stringify(reflectEntries));
}

// Function to load entries from localStorage
function loadEntriesFromLocalStorage() {
  const savedEntries = localStorage.getItem('reflectEntries');
  if (savedEntries) {
    reflectEntries = JSON.parse(savedEntries);
  }
}

// Function to update the Reflect entries list
function updateReflectList() {
  const listDiv = document.getElementById("reflect-list");
  listDiv.innerHTML = ""; // Clear the list before updating

  reflectEntries.forEach(entry => {
    const entryItem = document.createElement("li");
    entryItem.classList.add("reflect-item");

    // Create text for the entry
    const textDiv = document.createElement("p");
    textDiv.innerText = entry.text;

    // Create media element (image or video)
    const mediaDiv = document.createElement("div");
    if (entry.file) {
      const media = entry.file.match(/image/) ?
        document.createElement("img") :
        document.createElement("video");

      media.src = entry.file;
      media.controls = true; // Enable controls for video
      media.classList.add("reflect-media");

      mediaDiv.appendChild(media);
    }

    // Create date/time div
    const dateTimeDiv = document.createElement("p");
    dateTimeDiv.classList.add("reflect-date-time");
    dateTimeDiv.innerText = `Entry made on: ${entry.dateTime}`;

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.onclick = () => deleteReflectEntry(entry.id);

    // Append elements to the entry item
    entryItem.appendChild(textDiv);
    entryItem.appendChild(mediaDiv);
    entryItem.appendChild(dateTimeDiv);
    entryItem.appendChild(deleteButton);

    // Append entry item to the list
    listDiv.appendChild(entryItem);
  });
}

const calendarGrid = document.getElementById("calendar-grid");
const calendarHeader = document.getElementById("calendar-header");
const modal = document.getElementById("task-modal");
const modalDate = document.getElementById("modal-date");
const modalTaskList = document.getElementById("modal-task-list");
const closeModal = document.getElementById("close-modal");

let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

// Helper to format date as 'YYYY-MM-DD'
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render the calendar
function renderCalendar() {
    calendarGrid.innerHTML = "";
  
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
  
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
  
    const firstDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
  
    calendarHeader.textContent = `${currentDate.toLocaleString("default", {
      month: "long",
    })} ${year}`;
  
    // Weekday names
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach(day => {
      const weekdayDiv = document.createElement("div");
      weekdayDiv.className = "weekday-name";
      weekdayDiv.textContent = day;
      calendarGrid.appendChild(weekdayDiv);
    });
  
    // Fill in blank days
    for (let i = 0; i < firstDayIndex; i++) {
      const blank = document.createElement("div");
      blank.className = "calendar-day blank";
      calendarGrid.appendChild(blank);
    }
  
    // Create day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const formattedDate = formatDate(date); // e.g., "2025-05-10"
  
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";
      dayCell.textContent = day;
  
      // Highlight today
      const today = new Date();
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        dayCell.classList.add("today");
      }
  
      // Task indicator
      if (tasks[formattedDate] && tasks[formattedDate].length > 0) {
        const taskDot = document.createElement("div");
        taskDot.className = "task-indicator";
        dayCell.appendChild(taskDot);
      }
  
      dayCell.addEventListener("click", () => openTaskModal(formattedDate));
      calendarGrid.appendChild(dayCell);
    }
  }

// Open modal for date
function openTaskModal(date) {
  modalDate.textContent = `Tasks for ${date}`;
  modalTaskList.innerHTML = "";

  const taskList = tasks[date] || [];

  taskList.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.onclick = () => {
      taskList.splice(index, 1);
      if (taskList.length === 0) {
        delete tasks[date];
      } else {
        tasks[date] = taskList;
      }
      saveTasks();
      renderCalendar();
      openTaskModal(date); // Refresh modal
    };

    li.appendChild(deleteBtn);
    modalTaskList.appendChild(li);
  });

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Add a new task...";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add";
  addBtn.onclick = () => {
    if (input.value.trim()) {
      if (!tasks[date]) tasks[date] = [];
      tasks[date].push(input.value.trim());
      input.value = "";
      saveTasks();
      renderCalendar();
      openTaskModal(date);
    }
  };

  modalTaskList.appendChild(input);
  modalTaskList.appendChild(addBtn);
  modal.style.display = "block";
}

// Event Listeners
closeModal.addEventListener("click", () => (modal.style.display = "none"));
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initial render
renderCalendar();

function navigateToPage(pageName) {
    const pages = document.querySelectorAll(".page-content");
    pages.forEach(page => page.style.display = "none");
  
    document.getElementById(pageName).style.display = "block";
  
    if (pageName === "calendar") {
      renderCalendar(); // Load data when calendar is viewed
    }
}

  // Load entries when the page is loaded
  document.addEventListener("DOMContentLoaded", () => {
    loadEntriesFromLocalStorage(); // Load entries from localStorage
    updateReflectList();  // Display the entries
  });
  // -------------------- Initial Page Load --------------------
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded");
  
    // Navigation Buttons
    document.getElementById("home-btn").addEventListener("click", () => {
      console.log("Home button clicked");
      showPage("home");
    });
  
    document.getElementById("goals-btn").addEventListener("click", () => {
      console.log("Goals button clicked");
      showPage("goals");
    });
  
    document.getElementById("reflect-btn").addEventListener("click", () => {
      console.log("Reflect button clicked");
      showPage("reflect");
    });
  
    document.getElementById("calendar-btn").addEventListener("click", () => {
      console.log("Calendar button clicked");
      showPage("calendar-page");
      renderCalendar(); 
    });
    document.querySelectorAll(".calendar-date").forEach(date => {
        date.addEventListener("click", (e) => {
          const selectedDate = e.target.dataset.date; // Assuming each date has a data-date attribute
          console.log("Clicked date:", selectedDate);
          showPage("daily-tasks-page"); // If you want to navigate on click
        });
    });
    // Set the initial page to 'home'
    showPage("home");
  });