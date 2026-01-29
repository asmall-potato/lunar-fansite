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

        for (let i = 0; i < firstDay.getDay(); i++) {
            row.appendChild(document.createElement("td"));
        }

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

            cell.addEventListener("click", () =>
                showScheduleForDate(year, month + 1, day)
            );

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
// 📦 Load JSON Data (FOR BOTH FORMATS)
// ----------------------------
async function loadSchedule() {
    try {
        const response = await fetch("lunardata.json");
        const data = await response.json();

        allEvents = [];

        // ✅ CASE 1: Array format
        if (Array.isArray(data)) {
            data.forEach(event => {
                if (!event.date) return;

                allEvents.push({
                    date: normalizeDate(event.date),
                    title: event.title || "-",
                    time: event.time || "-",
                    location: event.location || "",
                    live: event.live || "",
                    artist: event.artist || "",
                    status: event.status || "",
                    url: event.url || "",
                    remark: event.remark || ""
                });
            });
        }

        // ✅ CASE 2: Grouped-by-date object
        else {
            Object.entries(data).forEach(([date, events]) => {
                events.forEach(event => {
                    allEvents.push({
                        date: normalizeDate(date),
                        title: event.title || "-",
                        time: event.time || "-",
                        location: event.location || "",
                        live: event.live || "",
                        artist: event.artist || "",
                        status: event.status || "",
                        url: event.url || "",
                        remark: event.remark || ""
                    });
                });
            });
        }

        checkTodaySchedule();

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
// 🛠️ Date Normalizer (NEW — SAFE)
// ----------------------------
function normalizeDate(dateStr) {
    if (!dateStr) return "";

    // Remove time if exists
    let d = dateStr.split("T")[0];

    // Replace slashes with dashes
    d = d.replace(/\//g, "-");

    return d;
}

// ----------------------------
// 🔔 Popup Functions
// ----------------------------
function showTodayPopup(events) {
    const popup = document.getElementById("workPopup");
    const popupContent = document.getElementById("popupContent");

    if (!popup || !popupContent) return;

    popupContent.innerHTML = events.map(e => {
        const dateObj = new Date(e.date);
        const readableDate = isNaN(dateObj)
            ? e.date
            : dateObj.toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric"
              });

        return `
            <div style="margin-bottom: 14px; text-align: left;">
                <div style="font-weight: bold; font-size: 1.1rem;">
                    ${e.title || "-"}
                </div>
                <div>Date: ${readableDate}</div>
                <div>Time: ${e.time || "-"}</div>
                ${e.location ? `<div>Location: ${e.location}</div>` : ""}
            </div>
        `;
    }).join("");

    popup.style.display = "block";
}


document.getElementById("popupCloseBtn")?.addEventListener("click", () => {
    document.getElementById("workPopup").style.display = "none";
});
document.getElementById("popupGoBtn")?.addEventListener("click", () => {
    document.getElementById("workPopup").style.display = "none";
});

function checkTodaySchedule() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayEvents = allEvents.filter(ev => ev.date === todayStr);

    if (todayEvents.length > 0) {
        showTodayPopup(todayEvents);
    } else {
        showNoSchedulePopup();
    }
}

function showNoSchedulePopup() {
    const popup = document.getElementById("workPopup");
    const popupContent = document.getElementById("popupContent");

    if (!popup || !popupContent) return;

    popupContent.innerHTML = `
        <div style="text-align: center; font-size: 1.1rem; font-weight: bold;">
            No schedule for <span style="color:#1e90ff;">LUNAR</span> today 🐼🐣
        </div>
    `;

    popup.style.display = "block";
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

        const timeHTML = event.time
            ? `<div class="event-time">Time: ${event.time}</div>`
            : "";

        const locationHTML = event.location
            ? `<div class="event-location">Location: ${event.location}</div>`
            : "";

        const artistHTML = event.artist
            ? `<div class="event-artist">Artist: ${event.artist}</div>`
            : "";

        const urlHTML = event.url
            ? `<div class="event-url">
                   <a href="${event.url}" target="_blank" rel="noopener noreferrer">
                       More Info
                   </a>
               </div>`
            : "";

        eventDiv.innerHTML = `
            <div class="event-name">${event.title || "-"}</div>
            ${timeHTML}
            ${locationHTML}
            ${artistHTML}
            ${urlHTML}
        `;

        scheduleList.appendChild(eventDiv);
    });
}



    function showScheduleForDate(year, month, day) {
        const monthStr = month.toString().padStart(2, "0");
        const dayStr = day.toString().padStart(2, "0");
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        const filtered = allEvents.filter(e => e.date === dateStr);

        if (filtered.length > 0) displaySchedule(filtered);
        else scheduleList.innerHTML = `<p>No events on ${dateStr}</p>`;
    }

    function displayScheduleForMonth() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

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
