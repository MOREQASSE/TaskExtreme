document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar-container');
    
    function renderCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let html = `
            <div class="calendar-header">
                <h3>${today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <div class="calendar-days">${['S','M','T','W','T','F','S'].map(d => `<div>${d}</div>`).join('')}</div>
            <div class="calendar-grid">
        `;

        // Empty cells for days before 1st
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="day empty"></div>`;
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toDateString();
    const isToday = day === today.getDate();
    
    // Get tasks for this date
    const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate || task.createdAt).toDateString();
        return taskDate === dateStr;
    });
    
    const completed = dayTasks.filter(t => t.completed).length;
    const total = dayTasks.length;
    
    html += `
        <div class="day ${isToday ? 'today' : ''}">
            <span class="day-number">${day}</span>
            <span class="task-status">${total} tasks</span>
        </div>
    `;
        }

        calendarContainer.innerHTML = html + '</div>';
    }

    renderCalendar();
});