// Basic drag and drop for tasks between days
document.addEventListener('DOMContentLoaded', () => {
  let draggedTaskId = null;

  document.addEventListener('dragstart', function (e) {
    if (e.target.classList.contains('task-card')) {
      draggedTaskId = e.target.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('dragging');
    }
  });

  document.addEventListener('dragend', function (e) {
    if (e.target.classList.contains('task-card')) {
      e.target.classList.remove('dragging');
    }
  });

  // Sidebar drop zones for days
  function setupDropZones() {
    document.querySelectorAll('#day-nav li').forEach(dayEl => {
      dayEl.addEventListener('dragover', e => {
        e.preventDefault();
        dayEl.classList.add('drop-zone');
      });
      dayEl.addEventListener('dragleave', e => {
        dayEl.classList.remove('drop-zone');
      });
      dayEl.addEventListener('drop', e => {
        e.preventDefault();
        dayEl.classList.remove('drop-zone');
        if (draggedTaskId) {
          window.moveTaskToDay && window.moveTaskToDay(draggedTaskId, dayEl.dataset.day);
        }
      });
    });
  }

  // Expose for app.js to call after rendering days
  window.setupDropZones = setupDropZones;
});
