// Meditrack JavaScript

let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function saveHistory() {
    localStorage.setItem('history', JSON.stringify(history));
}

function displayReminders() {
    const reminderList = document.getElementById('reminder-list');
    if (reminderList) {
        reminderList.innerHTML = '';
        reminders.forEach((reminder, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="medication-icon">💊</span>
                    <strong>${reminder.medication}</strong> - ${reminder.dosage} at ${reminder.time}
                    <br>
                    Days: ${reminder.days.join(', ')}
                    <br>
                    Tune: ${reminder.tune}
                </div>
                <button class="delete-btn" onclick="deleteReminder(${index})">Delete</button>
            `;
            reminderList.appendChild(li);
        });
    }
}

function displayHistory() {
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = '';
        history.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="alarm-icon">⏰</span>
                    ${entry.medication} - ${entry.dosage} taken at ${entry.time} on ${entry.date}
                </div>
            `;
            historyList.appendChild(li);
        });
    }
}

function deleteReminder(index) {
    reminders.splice(index, 1);
    saveReminders();
    displayReminders();
}

function scheduleReminders() {
    reminders.forEach(reminder => {
        const [hours, minutes] = reminder.time.split(':');
        const now = new Date();
        const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime - now;

        setTimeout(() => {
            if (reminder.days.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))) {
                showNotification(reminder);
                playAlarm(reminder.tune);
                // Add to history
                history.push({
                    medication: reminder.medication,
                    dosage: reminder.dosage,
                    time: reminder.time,
                    date: new Date().toLocaleDateString()
                });
                saveHistory();
                displayHistory();
            }
            // Reschedule for next day
            setTimeout(() => scheduleReminders(), 24 * 60 * 60 * 1000);
        }, timeUntilReminder);
    });
}

function showNotification(reminder) {
    if (Notification.permission === 'granted') {
        new Notification(`Time to take ${reminder.medication}`, {
            body: `${reminder.dosage} at ${reminder.time}`,
            icon: '💊'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(reminder);
            }
        });
    }
}

function playAlarm(tune) {
    const alarmSound = document.getElementById('alarm-sound');
    if (alarmSound) {
        // For simplicity, using the same sound for all tunes
        // In a real app, you'd have different audio files
        alarmSound.play();
    }
}

// Navigation functions
function navigateTo(page) {
    window.location.href = page;
}

// Event listeners based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => navigateTo('dashboard.html'));
        }
    } else if (currentPage === 'dashboard.html') {
        const backBtn = document.getElementById('back-btn');
        const addReminderBtn = document.getElementById('add-reminder-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => navigateTo('index.html'));
        }
        if (addReminderBtn) {
            addReminderBtn.addEventListener('click', () => navigateTo('add-reminder.html'));
        }

        displayReminders();
        displayHistory();
    } else if (currentPage === 'add-reminder.html') {
        const backBtn = document.getElementById('back-btn');
        const reminderForm = document.getElementById('reminder-form');

        if (backBtn) {
            backBtn.addEventListener('click', () => navigateTo('dashboard.html'));
        }

        if (reminderForm) {
            reminderForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const medication = document.getElementById('medication').value;
                const dosage = document.getElementById('dosage').value;
                const time = document.getElementById('time').value;
                const days = Array.from(document.querySelectorAll('#days input:checked')).map(cb => cb.value);
                const tune = document.getElementById('tune').value;

                if (days.length === 0) {
                    alert('Please select at least one day.');
                    return;
                }

                reminders.push({ medication, dosage, time, days, tune });
                saveReminders();
                scheduleReminders();

                reminderForm.reset();
                navigateTo('dashboard.html');
            });
        }
    }

    // Request notification permission on load
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    // Initial scheduling
    scheduleReminders();
});
