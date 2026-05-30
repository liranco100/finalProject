/* ==========================================================================
   קובץ JavaScript ראשי - פרויקט StudySmart
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. תפריט המבורגר רספונסיבי למובייל ולטאבלט
    // ==========================================================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // ==========================================================================
    // 2. סמן עכבר מותאם אישית
    // ==========================================================================
    const cursor = document.getElementById('customCursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // ==========================================================================
    // 3. טיימר פומודורו (25 דקות)
    // ==========================================================================
    const totalSeconds = 1500; // 25 דקות * 60 שניות = 1500
    let timeLeft = totalSeconds;
    let pomodoroInterval = null;
    let isTimerRunning = false;

    const startTimerBtn = document.getElementById('startTimerBtn');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const circle = document.querySelector('.progress-ring-active');

    // פונקציית עדכון התצוגה (זמן ועיגול התקדמות)
    function updateTimerVisuals() {
        if (!minutesElement || !secondsElement) {
            console.warn("שגיאה: לא נמצאו אלמנטים של דקות (id='minutes') או שניות (id='seconds') ב-HTML.");
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        minutesElement.innerText = minutes < 10 ? '0' + minutes : minutes;
        secondsElement.innerText = seconds < 10 ? '0' + seconds : seconds;

        if (circle) {
            const circumference = 553;
            const offset = circumference - (timeLeft / totalSeconds) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }
    }

    // פונקציית כל פעימה של הטיימר (כל שנייה)
    function updateTimerTick() {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerVisuals();
        } else {
            clearInterval(pomodoroInterval);
            isTimerRunning = false;
            if (startTimerBtn) startTimerBtn.innerText = "התחל למידה ▶";
            alert("כל הכבוד! סיימתם 25 דקות של מיקוד. קחו 5 דקות הפסקה.");
            resetPomodoro();
        }
    }

    // פונקציית התחלה/השהיה
    function togglePomodoro() {
        if (!startTimerBtn) return;

        if (isTimerRunning) {
            clearInterval(pomodoroInterval);
            isTimerRunning = false;
            startTimerBtn.innerText = "המשך למידה ▶";
        } else {
            isTimerRunning = true;
            startTimerBtn.innerText = "השהה ⏸";
            pomodoroInterval = setInterval(updateTimerTick, 1000);
        }
    }

    // פונקציית איפוס
    function resetPomodoro() {
        clearInterval(pomodoroInterval);
        isTimerRunning = false;
        timeLeft = totalSeconds;
        if (startTimerBtn) startTimerBtn.innerText = "התחל למידה ▶";
        updateTimerVisuals();
    }

    // חיבור אירוע הלחיצה לכפתור דרך ה-JS
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', togglePomodoro);
    } else {
        console.warn("שגיאה: לא נמצא כפתור עם ה-ID 'startTimerBtn' ב-HTML.");
    }

    // כפתור איפוס (אופציונלי, במידה ויש לך אחד ב-HTML)
    const resetBtn = document.getElementById('resetTimerBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPomodoro);
    }

    // אתחול ראשוני להצגת 25:00 מיד עם טעינת הדף
    updateTimerVisuals();

    // ==========================================================================
    // 4. מטריצת אייזנהואר - לוגיקת גרירה ושחרור (Drag & Drop)
    // ==========================================================================
    window.allowDrop = function(ev) {
        ev.preventDefault();
    };

    window.drag = function(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    };

    window.drop = function(ev) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const draggedElement = document.getElementById(data);

        if (!draggedElement) return;

        let target = ev.target;
        while (target && !target.classList.contains('matrix-box') && !target.classList.contains('notes-pool')) {
            target = target.parentElement;
        }

        if (target) {
            target.appendChild(draggedElement);
        }
    };

    // ==========================================================================
    // 5. מטריצת אייזנהואר - הוספת פתק חדש
    // ==========================================================================
    const addTaskBtn = document.getElementById('addTaskBtn'); // בהנחה שיש כפתור הוספה
    const newTaskInput = document.getElementById('newTaskInput');

    window.addNewTask = function() {
        const input = document.getElementById('newTaskInput');
        const container = document.getElementById('notesContainer');

        if (!input || !container || input.value.trim() === "") {
            return;
        }

        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.id = 'note-' + Date.now();
        note.draggable = true;
        note.innerText = input.value;

        note.ondragstart = window.drag;
        container.appendChild(note);

        input.value = "";
        input.focus();
    };

    // חיבור לחיצת כפתור להוספת משימה, או לחיצה על אנטר במקלדת
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', window.addNewTask);
    }
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.addNewTask();
        });
    }

});

// ==========================================================================
// 6. טיפול בשליחת טופס צור קשר ומתן פידבק למשתמש
// ==========================================================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        // עוצר את השליחה האמיתית לשרת ואת רענון הדף (כי כרגע אין צד-שרת מחובר)
        e.preventDefault();

        // מציג הודעה קופצת (Alert) למשתמש
        alert("תודה רבה! ההודעה שלך נשלחה בהצלחה, נחזור אליך בהקדם.");

        // מנקה את כל השדות בטופס אחרי השליחה
        contactForm.reset();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const flashcard = document.getElementById('demoFlashcard');

    if (flashcard) {
        flashcard.addEventListener('click', function() {
            // היפוך הכרטיסייה ויזואלית
            this.classList.toggle('is-flipped');

            // עדכון חיווי הנגישות לקורא המסך
            const isFlipped = this.classList.contains('is-flipped');
            if (isFlipped) {
                this.setAttribute('aria-label', "צד ב': הפירוש הוא: למידה פעילה (תרגול, מעורבות ויישום). לחצו להפיכת הכרטיסייה חזרה.");
            } else {
                this.setAttribute('aria-label', "צד א': מונח באנגלית: Active Learning. לחצו לחשיפת הפירוש.");
            }
        });
    }
});