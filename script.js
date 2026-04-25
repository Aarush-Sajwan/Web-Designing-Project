document.addEventListener("DOMContentLoaded", () => {
    const sectionHeading = document.getElementById("section-heading");
    const mainGrid = document.getElementById("main-grid");
    const inputControls = document.getElementById("input-controls");
    const navItems = document.querySelectorAll(".nav-item");
    const addTaskBtn = document.getElementById("add-task-btn");
    const dateElement = document.getElementById("current-date");
    
    let currentCategory = "Dashboard";
    const categories = ["Health", "Studies", "Habits", "Goals"];

    // Set Today's Date
    dateElement.innerText = `Today: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Navigation Logic
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            currentCategory = item.getAttribute("data-section");
            sectionHeading.innerText = currentCategory;
            renderView();
        });
    });

    function renderView() {
        mainGrid.innerHTML = "";
        if (currentCategory === "Dashboard") {
            inputControls.style.display = "none";
            renderDashboardStatus();
        } else {
            inputControls.style.display = "flex";
            renderCategoryTasks();
        }
    }

    function renderDashboardStatus() {
        categories.forEach(cat => {
            const tasks = JSON.parse(localStorage.getItem(`tasks_${cat}`)) || [];
            const card = document.createElement("div");
            card.className = "card";
            
            const iconMap = { "Health": "droplet", "Studies": "book", "Habits": "arrows-rotate", "Goals": "chart-simple" };
            const tasksHtml = tasks.length > 0 
                ? tasks.map(t => `<div class="status-item"><span>${t.name}</span> <b>${t.time}</b></div>`).join('')
                : `<p class="no-tasks">No upcoming tasks</p>`;

            card.innerHTML = `
                <h2><i class="fa-solid fa-${iconMap[cat]}"></i> ${cat} Status</h2>
                <div class="status-list">${tasksHtml}</div>
            `;
            mainGrid.appendChild(card);
        });
    }

    function renderCategoryTasks() {
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentCategory}`)) || [];
        mainGrid.innerHTML = tasks.length ? "" : `<p style='color: #757575;'>Add your first task for ${currentCategory} above.</p>`;
        
        tasks.sort((a, b) => a.time.localeCompare(b.time)).forEach(task => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <i class="fa-solid fa-trash-can delete-task" onclick="deleteTask(${task.id})"></i>
                <h2>${task.name}</h2>
                <p class="task-time"><i class="fa-regular fa-clock"></i> ${task.time}</p>
            `;
            mainGrid.appendChild(card);
        });
    }

    addTaskBtn.addEventListener("click", () => {
        const nameInput = document.getElementById("task-name");
        const timeInput = document.getElementById("task-time");
        
        if (nameInput.value && timeInput.value) {
            const tasks = JSON.parse(localStorage.getItem(`tasks_${currentCategory}`)) || [];
            tasks.push({ id: Date.now(), name: nameInput.value, time: timeInput.value });
            localStorage.setItem(`tasks_${currentCategory}`, JSON.stringify(tasks));
            
            nameInput.value = "";
            timeInput.value = "";
            renderCategoryTasks();
        }
    });

    window.deleteTask = (id) => {
        let tasks = JSON.parse(localStorage.getItem(`tasks_${currentCategory}`)) || [];
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem(`tasks_${currentCategory}`, JSON.stringify(tasks));
        renderCategoryTasks();
    };

    // Alert Engine (Auto-deletes task after alert)
    setInterval(() => {
        const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        categories.forEach(cat => {
            let tasks = JSON.parse(localStorage.getItem(`tasks_${cat}`)) || [];
            const triggerIdx = tasks.findIndex(t => t.time === currentTime);
            
            if (triggerIdx !== -1) {
                const task = tasks[triggerIdx];
                if (!sessionStorage.getItem(`alerted_${task.id}`)) {
                    alert(`It is Time for ${task.name}`);
                    sessionStorage.setItem(`alerted_${task.id}`, "true");
                    
                    tasks.splice(triggerIdx, 1);
                    localStorage.setItem(`tasks_${cat}`, JSON.stringify(tasks));
                    renderView();
                }
            }
        });
    }, 15000);

    renderView();
});
