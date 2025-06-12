// scripts/calendar.js
document.addEventListener('DOMContentLoaded', function() {
    const calendarContainer = document.getElementById('calendar-container');
    const streakCounter = document.getElementById('streak-counter');
    const STREAK_KEY = 'taskextreme_streak';
    
    // Initialize
    updateStreakCounter();
    renderCalendar();
    
    // Update streak counter display
    function updateStreakCounter() {
        const streak = getCurrentStreak();
        streakCounter.textContent = `🔥 ${streak.days} day streak | ${streak.tasks} tasks`;
    }
    
    // Calculate current streak
    function getCurrentStreak() {
        const savedStreak = JSON.parse(localStorage.getItem(STREAK_KEY)) || {
            days: 0,
            tasks: 0,
            lastUpdate: null
        };
        
        const today = new Date().toDateString();
        
        // Reset if broken streak
        if (savedStreak.lastUpdate !== today) {
            return { days: 0, tasks: 0 };
        }
        
        return savedStreak;
    }
    
    // Calendar rendering
    function renderCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        
        calendarContainer.innerHTML = `
            <div class="calendar-header">
                <h3>${today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <div class="calendar-grid">
                ${generateCalendarDays(month, year)}
            </div>
        `;
    }
    
    function generateCalendarDays(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let html = '';
        
        // Add empty cells for days before 1st of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        
        // Add actual days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(year, month, day).toDateString();
            const isToday = day === today.getDate();
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <span class="day-number">${day}</span>
                    <span class="task-count">${getTasksForDate(dateStr)}</span>
                </div>
            `;
        }
        
        return html;
    }
    
    function getTasksForDate(dateStr) {
        // Implement logic to count tasks for specific date
        // This would check your tasks array for completed tasks on this date
        return 0; // Placeholder
    }
    
    // Call this when tasks are completed
    window.updateTaskCompletion = function() {
        const today = new Date().toDateString();
        let streak = getCurrentStreak();
        
        streak.lastUpdate = today;
        streak.tasks++;
        
        // Only increment day streak if this is first task today
        if (!localStorage.getItem(STREAK_KEY)) {
            streak.days++;
        }
        
        localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
        updateStreakCounter();
        renderCalendar();
    };
});