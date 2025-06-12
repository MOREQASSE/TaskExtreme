// PDF export using jsPDF (must be included in your project for offline use)
document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('generate-pdf');
  if (!exportBtn) return;
  exportBtn.addEventListener('click', () => {
    if (typeof window.jsPDF === 'undefined') {
      alert('jsPDF not loaded!');
      return;
    }
    const doc = new jsPDF();
    doc.text('TaskExtreme - Tasks', 10, 10);
    // Simple export: list tasks for the selected day
    const day = document.getElementById('tasks-day-title').textContent;
    doc.text(`Day: ${day}`, 10, 20);
    const tasks = Array.from(document.querySelectorAll('.task-card'));
    let y = 30;
    tasks.forEach(task => {
      doc.text(task.textContent.trim(), 10, y);
      y += 10;
    });
    doc.save(`tasks-${day}.pdf`);
  });
});
