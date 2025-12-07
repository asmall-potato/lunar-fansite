// ----------------------------
// Calendar + Today Popup Script
// Works on homepage and schedule page
// ----------------------------

let currentDate = new Date();
let allEvents = [];

// Detect if we are on the calendar page
const calendarBody = document.getElementById("calendarBody");
const monthYear = document.getElementById("monthYear");
const scheduleList = document.getElementById("scheduleList");

const isCalendarPage = calendarBody && monthYear && scheduleList;

// ----------------------------
// 🔄 Calendar Functions (schedule page only)
// ----------------------------
if (isCalendarPage) {

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYear.textContent = `${date.toLocaleString("default", { month: "long" })} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        calendarBody.innerHTML = "";
        let row = document.createElement("tr");

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay.getDay(); i++) {
            row.appendChild(document.createElement("td"));
        }

        // Days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const cell = document.createElement("td");
            cell.textContent = day;

            const today = new Date();
            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                cell.classList.add("today");
            }

            // Click day → show that date’s events
            cell.addEventListener("click", () => showScheduleForDate(year, month + 1, day));
            row.appendChild(cell);

            if ((firstDay.getDay() + day) % 7 === 0) {
                calendarBody.appendChild(row);
                row = document.createElement("tr");
            }
        }

        if (row.children.length > 0) calendarBody.appendChild(row);
    }

    function changeMonth(offset) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        renderCalendar(currentDate);
        displayScheduleForMonth();
    }

    document.getElementById("prevMonth")?.addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonth")?.addEventListener("click", () => changeMonth(1));
}

// ----------------------------
// 📦 Load JSON Data (for both pages)
// ----------------------------
async function loadSchedule() {
    try {
        const response = await fetch("lunardata.json");
        const data = await response.json();
        allEvents = data;

        // Show popup on homepage
        checkTodaySchedule();

        // Show calendar if on schedule page
        if (isCalendarPage) {
            renderCalendar(currentDate);
            displayScheduleForMonth();
        }
    } catch (error) {
        if (isCalendarPage) scheduleList.textContent = "Error loading schedule.";
        console.error("Error loading schedule:", error);
    }
}

// ----------------------------
// 🔔 Popup Functions
// ----------------------------
function showTodayPopup(events) {
    const popup = document.getElementById("workPopup");
    const popupContent = document.getElementById("popupContent");

    if (!popup || !popupContent) return;

    popupContent.innerHTML = events.map(e => `
        <div style="margin-bottom: 10px; text-align: left;">
            <strong>${e.title || "-"}</strong><br>
            Time: ${e.time || "-"}<br>
            ${e.location ? `Location: ${e.location}` : ""}
            ${e.live ? `<div>${e.live}</div>` : ""}
        </div>
    `).join("");

    popup.style.display = "block";
}

// Close popup buttons
document.getElementById("popupCloseBtn")?.addEventListener("click", () => {
    document.getElementById("workPopup").style.display = "none";
});
document.getElementById("popupGoBtn")?.addEventListener("click", () => {
    document.getElementById("workPopup").style.display = "none";
});

// Check today’s schedule for popup
function checkTodaySchedule() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayEvents = allEvents.filter(ev => ev.date === todayStr);
    if (todayEvents.length > 0) showTodayPopup(todayEvents);
}

// ----------------------------
// 🗓️ Calendar Display Functions
// ----------------------------
if (isCalendarPage) {

    function displaySchedule(data) {
        scheduleList.innerHTML = "";
        data.forEach(event => {
            const eventDiv = document.createElement("div");
            eventDiv.className = "event";

            const urlHTML = event.url
                ? `<a href="${event.url}" target="_blank" rel="noopener noreferrer">More Info</a>`
                : "";

            const locationHTML = event.location ? `<div class="event-location">Location: ${event.location}</div>` : "";
            const liveHTML = event.live ? `<div class="event-live">${event.live}</div>` : "";
            const remarkHTML = event.remark ? `<div class="event-remark">${event.remark}</div>` : "";

            eventDiv.innerHTML = `
                <div>
                    <span class="event-date">${event.date || "-"}</span>
                </div>
                <div class="event-time">${event.time || "-"}</div>
                <div class="event-name">${event.title || "-"}</div>
                ${locationHTML}
                ${liveHTML}
                ${urlHTML}
                ${remarkHTML}
            `;

            scheduleList.appendChild(eventDiv);
        });
    }

    function showScheduleForDate(year, month, day) {
        const monthStr = month.toString().padStart(2, "0");
        const dayStr = day.toString().padStart(2, "0");
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        const filtered = allEvents.filter(e => {
            const evDateParts = e.date.split("-");
            const evYear = evDateParts[0];
            const evMonth = evDateParts[1].padStart(2,"0");
            const evDay = evDateParts[2].padStart(2,"0");
            return `${evYear}-${evMonth}-${evDay}` === dateStr;
        });

        if (filtered.length > 0) displaySchedule(filtered);
        else scheduleList.innerHTML = `<p>No events on ${dateStr}</p>`;
    }

    function displayScheduleForMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // JS months are 0-based
    const filtered = allEvents.filter(event => {
        const [eventYear, eventMonth] = event.date.split("-").map(Number);
        return eventYear === year && eventMonth === month;
    });

    if (filtered.length > 0) {
        displaySchedule(filtered);
    } else {
        scheduleList.innerHTML = `<p>No events for ${monthYear.textContent}</p>`;
    }
}

}

// ----------------------------
// 🏁 Initialize
// ----------------------------
loadSchedule();
