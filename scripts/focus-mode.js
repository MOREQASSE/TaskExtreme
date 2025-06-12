document.addEventListener('DOMContentLoaded', () => {
    const focusBtn = document.getElementById('focus-mode-btn');
    const focusOverlay = document.createElement('div');
    focusOverlay.id = 'focus-overlay';
    
    focusBtn.addEventListener('click', () => {
        // Get current day's tasks
        const currentTasks = Array.from(document.querySelectorAll('.task-item'))
            .filter(task => task.style.display !== 'none');
        
        if (currentTasks.length === 0) {
            alert('No tasks for focus mode!');
            return;
        }

        // Create focus mode UI
        focusOverlay.innerHTML = `
            <div class="focus-container">
                <button id="exit-focus" class="focus-exit">✕</button>
                <div class="focus-task">
                    <h3 id="focus-task-title">${currentTasks[0].querySelector('.task-title').textContent}</h3>
                    <p id="focus-task-details">${currentTasks[0].querySelector('.task-details')?.textContent || ''}</p>
                </div>
                <div class="focus-timer">
                    <span id="focus-time">25:00</span>
                    <div class="focus-controls">
                        <button id="focus-start">Start</button>
                        <button id="focus-reset">Reset</button>
                    </div>
                </div>
                <div class="task-progress">
                    <button id="focus-complete">Mark Complete</button>
                    <button id="focus-next">Next Task</button>
                </div>
            </div>
        `;

        document.body.appendChild(focusOverlay);
        document.body.style.overflow = 'hidden';

        // Timer functionality
        let timerInterval;
        let timeLeft = 25 * 60;
        
        function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('focus-time').textContent = 
                `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }

        document.getElementById('focus-start').addEventListener('click', () => {
            if (!timerInterval) {
                timerInterval = setInterval(() => {
                    timeLeft--;
                    updateTimer();
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        document.getElementById('focus-time').style.color = 'red';
                    }
                }, 1000);
            }
        });

        document.getElementById('focus-reset').addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timeLeft = 25 * 60;
            updateTimer();
        });

        // Exit handlers
        document.getElementById('exit-focus').addEventListener('click', exitFocus);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') exitFocus();
        });
    });

    function exitFocus() {
        document.body.removeChild(focusOverlay);
        document.body.style.overflow = '';
    }
});