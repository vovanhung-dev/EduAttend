document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('examScheduleDropdown');
    const detailsSection = document.getElementById('examScheduleDetails');

    // Fetch exam schedules
    fetch('http://localhost:3100/api/class/getAllExamSchedules')
        .then(response => response.json())
        .then(data => {
            const schedules = data.schedules;
            schedules.forEach(schedule => {
                const option = document.createElement('option');
                option.value = schedule.id;
                option.textContent = `${schedule.subject} - ${schedule.className} - ${schedule.exam_date}`;
                option.dataset.details = JSON.stringify(schedule);
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching exam schedules:', error));

    // Event listener for dropdown selection
    dropdown.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        if (selectedOption.value) {
            const scheduleDetails = JSON.parse(selectedOption.dataset.details);
            document.getElementById('examSubject').textContent = scheduleDetails.subject;
            document.getElementById('className').textContent = scheduleDetails.className;
            document.getElementById('teacherName').textContent = scheduleDetails.teacherName;
            document.getElementById('examDate').textContent = scheduleDetails.exam_date;
            document.getElementById('startTime').textContent = scheduleDetails.start_time;
            document.getElementById('endTime').textContent = scheduleDetails.end_time;
            document.getElementById('room').textContent = scheduleDetails.room;

            detailsSection.classList.remove('hidden');
        } else {
            detailsSection.classList.add('hidden');
        }
    });
});
