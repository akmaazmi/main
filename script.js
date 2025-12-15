const teams = ['SITI', 'IRA', 'EKIN', 'BALQIS'];
const shifts = ['Morning', 'Night', 'Evening'];

const today = new Date();
const MIN_YEAR = 2026, MAX_YEAR = 2026;
const MIN_MONTH = 0, MAX_MONTH = 11;

// Initialize to current date
let currentMonth = today.getMonth(); // 0-11
let currentYear = today.getFullYear();

// Clamp to valid range [Jan 2026 - Dec 2026]
const minDate = new Date(MIN_YEAR, MIN_MONTH, 1);
const maxDate = new Date(MAX_YEAR, MAX_MONTH, 1);
const currentDate = new Date(currentYear, currentMonth, 1);

if (currentDate < minDate) {
    // Before Jan 2026 - show Jan 2026
    currentYear = MIN_YEAR;
    currentMonth = MIN_MONTH;
} else if (currentDate > maxDate) {
    // After Dec 2026 - show Dec 2026
    currentYear = MAX_YEAR;
    currentMonth = MAX_MONTH;
}
// else: current date is within range, use it as is

let selectedTeams = [...teams];

const initialState = {
    'SITI': { shift: 'Evening', dayInCycle: 5 },
    'IRA': { shift: 'off', dayInCycle: 7 },
    'EKIN': { shift: 'Morning', dayInCycle: 3 },
    'BALQIS': { shift: 'Night', dayInCycle: 1 }
};

function getScheduleForDate(date) {
    const jan1_2026 = new Date(2026, 0, 1);
    const daysDiff = Math.floor((date - jan1_2026) / (1000 * 60 * 60 * 24));
    const schedule = {};

    for (const team of teams) {
        const initial = initialState[team];
        let dayInCycle = initial.dayInCycle + daysDiff;
        dayInCycle = ((dayInCycle - 1) % 8) + 1;

        if (dayInCycle === 7) {
            schedule[team] = { shift: 'off', dayInCycle: 7 };
        } else if (dayInCycle === 8) {
            schedule[team] = { shift: 'rest', dayInCycle: 8 };
        } else {
            let currentShift;

            if (team === 'SITI') {
                const workCyclesPassed = Math.floor((daysDiff + initial.dayInCycle - 1) / 8);
                const shiftIndex = (2 + workCyclesPassed) % 3;
                currentShift = shifts[shiftIndex];
            } else if (team === 'IRA') {
                const adjustedDays = daysDiff - 2;
                if (adjustedDays < 0) {
                    if (dayInCycle === 7) currentShift = 'off';
                    else if (dayInCycle === 8) currentShift = 'rest';
                } else {
                    const workCyclesPassed = Math.floor((adjustedDays) / 8);
                    const shiftIndex = (2 + workCyclesPassed) % 3;
                    currentShift = shifts[shiftIndex];
                }
            } else if (team === 'EKIN') {
                const workCyclesPassed = Math.floor((daysDiff + initial.dayInCycle - 1) / 8);
                const shiftIndex = (0 + workCyclesPassed) % 3;
                currentShift = shifts[shiftIndex];
            } else if (team === 'BALQIS') {
                const workCyclesPassed = Math.floor((daysDiff + initial.dayInCycle - 1) / 8);
                const shiftIndex = (1 + workCyclesPassed) % 3;
                currentShift = shifts[shiftIndex];
            }

            schedule[team] = { shift: currentShift, dayInCycle: dayInCycle };
        }
    }

    return schedule;
}

function generateCalendar() {
    const calendar = document.querySelector('#calendar');
    const monthYear = document.querySelector('#monthYear');
    const prevBtn = document.querySelector('#prevBtn');
    const nextBtn = document.querySelector('#nextBtn');
    const minDate = new Date(MIN_YEAR, MIN_MONTH, 1);
    const maxDate = new Date(MAX_YEAR, MAX_MONTH, 1);

    const teamsToShow = selectedTeams.length ? selectedTeams : [...teams];

    const date = new Date(currentYear, currentMonth, 1);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    monthYear.textContent = `${monthName} ${currentYear}`;

    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const nextDate = new Date(currentYear, currentMonth + 1, 1);
    prevBtn.textContent = '◀';
    nextBtn.textContent = '▶';
    prevBtn.disabled = prevDate < minDate;
    nextBtn.disabled = nextDate > maxDate;

    calendar.innerHTML = '';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const day of daysOfWeek) {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    calendar.appendChild(thead);

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const tbody = document.createElement('tbody');

    let dayCount = 1;
    let rowCount = Math.ceil((firstDay + daysInMonth) / 7);

    for (let i = 0; i < rowCount; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if (i === 0 && j < firstDay) {
                cell.classList.add('empty-day');
            } else if (dayCount > daysInMonth) {
                cell.classList.add('empty-day');
            } else {
                const currentDate = new Date(currentYear, currentMonth, dayCount);
                const schedule = getScheduleForDate(currentDate);
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = dayCount;
                cell.appendChild(dayNumber);

                for (const team of teamsToShow) {
                    const shift = schedule[team].shift;
                    const dayInCycle = schedule[team].dayInCycle;

                    const teamDiv = document.createElement('div');
                    teamDiv.className = 'team-schedule';
                    teamDiv.classList.add(`shift-${shift.toLowerCase()}`);

                    // first line: TeamName [space] ShiftTime
                    const firstLine = document.createElement('div');
                    firstLine.className = 'team-line';
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'team-name';
                    nameSpan.textContent = team;
                    const shiftSpan = document.createElement('span');
                    shiftSpan.className = 'shift-time-inline';
                    shiftSpan.textContent = shift === 'off' ? 'Off Day' : shift === 'rest' ? 'Rest Day' : shift;
                    firstLine.appendChild(nameSpan);
                    firstLine.appendChild(document.createTextNode(' '));
                    firstLine.appendChild(shiftSpan);
                    teamDiv.appendChild(firstLine);

                    // second line: Day X (only for working shifts)
                    if (shift !== 'off' && shift !== 'rest') {
                        const cycleDiv = document.createElement('div');
                        cycleDiv.className = 'day-cycle';
                        cycleDiv.textContent = `Day ${dayInCycle}`;
                        teamDiv.appendChild(cycleDiv);
                    }

                    cell.appendChild(teamDiv);
                }
                dayCount++;
            }
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    calendar.appendChild(tbody);
}

function changeMonth(direction) {
    const candidate = new Date(currentYear, currentMonth + direction, 1);
    const minDate = new Date(MIN_YEAR, MIN_MONTH, 1);
    const maxDate = new Date(MAX_YEAR, MAX_MONTH, 1);
    if (candidate < minDate || candidate > maxDate) return;
    currentYear = candidate.getFullYear();
    currentMonth = candidate.getMonth();
    generateCalendar();
}

function populateFilters() {
    const teamMenu = document.getElementById('teamDropdownMenu');
    const teamBtn = document.getElementById('teamDropdownBtn');

    teamMenu.innerHTML = '';

    const teamAll = document.createElement('div');
    teamAll.className = 'dropdown-item' + (selectedTeams.length === teams.length ? ' selected' : '');
    teamAll.innerHTML = `<span class="tick">✓</span><span>Select All</span>`;
    teamAll.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTeams = selectedTeams.length === teams.length ? [] : [...teams];
        populateFilters();
        generateCalendar();
    });
    teamMenu.appendChild(teamAll);

    for (const t of teams) {
        const item = document.createElement('div');
        item.className = 'dropdown-item' + (selectedTeams.includes(t) ? ' selected' : '');
        item.innerHTML = `<span class="tick">✓</span><span>${t}</span>`;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = selectedTeams.indexOf(t);
            if (idx === -1) selectedTeams.push(t);
            else selectedTeams.splice(idx, 1);
            populateFilters();
            generateCalendar();
        });
        teamMenu.appendChild(item);
    }

    const teamDropdown = document.getElementById('teamDropdown');

    teamBtn.onclick = (e) => {
        e.stopPropagation();
        const opened = teamDropdown.classList.toggle('open');
    };
}

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
});

populateFilters();
generateCalendar();

// --- dynamic container height calculation ---
function updateContainerHeight() {
    const root = document.documentElement;
    const bodyStyle = getComputedStyle(document.body);
    const header = document.querySelector('.header');
    
    // Get body padding
    const padTop = parseFloat(bodyStyle.paddingTop) || 0;
    const padBottom = parseFloat(bodyStyle.paddingBottom) || 0;
    
    // Get header height and margin-top of container
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const containerMarginTop = 1.5 * 16; // 1.5rem converted to px (assuming 1rem = 16px)
    
    // Calculate available height
    const vh = window.innerHeight;
    const containerH = vh - padTop - padBottom - headerHeight - containerMarginTop;
    
    // Set CSS variable
    root.style.setProperty('--container-height', `${containerH}px`);
}

// Call on load and resize
window.addEventListener('load', updateContainerHeight);
window.addEventListener('resize', updateContainerHeight);

// Optional: observe header size changes
const headerEl = document.querySelector('.header');
if (headerEl && 'ResizeObserver' in window) {
    new ResizeObserver(updateContainerHeight).observe(headerEl);
}

// Initial call
updateContainerHeight();

// --- Download modal logic (module) ---
const downloadBtn = document.getElementById('downloadBtn');
const downloadModal = document.getElementById('downloadModal');
const cancelDownloadBtn = document.getElementById('cancelDownloadBtn');
const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');
const downloadTeamList = document.getElementById('downloadTeamList');
const downloadSelectAllItem = document.getElementById('downloadSelectAllItem');
const downloadMonthSelectAllItem = document.getElementById('downloadMonthSelectAllItem');
const downloadMonthList = document.getElementById('downloadMonthList');

// modal-local selections (start unselected by default)
let downloadSelectedMonths = [];
let downloadSelectedTeams = [];

function openDownloadModal() {
    // reset modal selections (unselect all by default)
    downloadSelectedTeams = [];
    downloadSelectedMonths = [];
    populateDownloadTeams();
    populateDownloadMonths();
    updateDownloadMonthSelectAllState();
    updateDownloadSelectAllState();
    // ensure confirm disabled until at least one team AND one month selected
    updateConfirmButtonState();

    // open modal, make it focusable/inert handling for accessibility
    downloadModal.classList.add('open');
    downloadModal.removeAttribute('aria-hidden');
    downloadModal.removeAttribute('inert');
    setTimeout(() => {
        // focus first focusable inside modal (prefer confirm button)
        const first = downloadModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (first) first.focus();
    }, 0);
}

function closeDownloadModalFn() {
    // move focus out of modal before hiding to avoid aria-hidden focus blocking
    try {
        if (downloadModal.contains(document.activeElement)) downloadBtn.focus();
    } catch (e) { /* ignore */ }
    downloadModal.classList.remove('open');
    downloadModal.setAttribute('aria-hidden', 'true');
    // make backdrop inert so it and descendants are removed from the accessibility tree
    downloadModal.setAttribute('inert', '');
}

function populateDownloadTeams() {
    downloadTeamList.innerHTML = '';
    for (const t of teams) {
        const el = document.createElement('div');
        el.className = 'dropdown-item' + (downloadSelectedTeams.includes(t) ? ' selected' : '');
        el.dataset.value = t;
        el.innerHTML = `<span class="tick">✓</span><span>${t}</span>`;
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const isSelected = el.classList.toggle('selected');
            if (isSelected) {
                if (!downloadSelectedTeams.includes(t)) downloadSelectedTeams.push(t);
            } else {
                downloadSelectedTeams = downloadSelectedTeams.filter(x => x !== t);
            }
            updateDownloadSelectAllState();
        });
        downloadTeamList.appendChild(el);
    }
    updateDownloadSelectAllState();
}

function updateDownloadSelectAllState() {
    const items = Array.from(downloadTeamList.querySelectorAll('.dropdown-item'));
    const selected = items.filter(i => i.classList.contains('selected'));
    downloadSelectAllItem.classList.toggle('selected', items.length > 0 && selected.length === items.length);
    updateConfirmButtonState();
    updateDownloadSummary();
}

downloadSelectAllItem.addEventListener('click', (e) => {
    e.stopPropagation();
    const items = Array.from(downloadTeamList.querySelectorAll('.dropdown-item'));
    const allSelected = downloadSelectAllItem.classList.contains('selected');
    items.forEach(i => i.classList.toggle('selected', !allSelected));
    // sync modal-local selection
    downloadSelectedTeams = allSelected ? [] : items.map(i => i.dataset.value);
    updateDownloadSelectAllState();
    updateDownloadSummary();
});

function populateDownloadMonths() {
    downloadMonthList.innerHTML = '';
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
        for (let m = 0; m < 12; m++) {
            const candidate = new Date(y, m, 1);
            const minD = new Date(MIN_YEAR, MIN_MONTH, 1);
            const maxD = new Date(MAX_YEAR, MAX_MONTH, 1);
            if (candidate < minD || candidate > maxD) continue;
            const val = `${y}-${String(m + 1).padStart(2, '0')}`;
            // show only first 3 letters of month (no year)
            const label = candidate.toLocaleString('en-US', { month: 'short' });
            const it = document.createElement('div');
            it.className = 'dropdown-item' + (downloadSelectedMonths.includes(val) ? ' selected' : '');
            it.dataset.value = val;
            it.innerHTML = `<span class="tick">✓</span><span>${label}</span>`;
            it.addEventListener('click', (e) => {
                e.stopPropagation();
                // toggle selection for months (multi-select)
                const isSelected = it.classList.toggle('selected');
                if (isSelected) {
                    if (!downloadSelectedMonths.includes(val)) downloadSelectedMonths.push(val);
                } else {
                    downloadSelectedMonths = downloadSelectedMonths.filter(x => x !== val);
                }
                updateDownloadMonthSelectAllState();
            });
            downloadMonthList.appendChild(it);
        }
    }
    updateDownloadMonthSelectAllState();
}

function updateDownloadMonthSelectAllState() {
    const items = Array.from(downloadMonthList.querySelectorAll('.dropdown-item'));
    if (items.length === 0) {
        downloadMonthSelectAllItem.classList.remove('selected');
        updateConfirmButtonState();
        updateDownloadSummary();
        return;
    }
    const allSelected = items.every(i => downloadSelectedMonths.includes(i.dataset.value));
    downloadMonthSelectAllItem.classList.toggle('selected', allSelected);
    updateConfirmButtonState();
    updateDownloadSummary();
}

downloadMonthSelectAllItem.addEventListener('click', (e) => {
    e.stopPropagation();
    const items = Array.from(downloadMonthList.querySelectorAll('.dropdown-item'));
    const allSelected = downloadMonthSelectAllItem.classList.contains('selected');
    if (allSelected) {
        // deselect all
        items.forEach(i => i.classList.remove('selected'));
        downloadSelectedMonths = [];
    } else {
        // select all
        items.forEach(i => i.classList.add('selected'));
        downloadSelectedMonths = items.map(i => i.dataset.value);
    }
    updateDownloadMonthSelectAllState();
    updateDownloadSummary();
});

downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDownloadModal();
});
cancelDownloadBtn.addEventListener('click', (e) => { e.stopPropagation(); closeDownloadModalFn(); });

confirmDownloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const chosenTeams = downloadSelectedTeams;
    const chosenMonths = downloadSelectedMonths;
    closeDownloadModalFn();
    // Generate and show preview
    generateCalendarPreviews(chosenTeams, chosenMonths);
});

function generateCalendarPreviews(teams, months) {
    const previewModal = document.getElementById('previewModal');
    const previewGrid = document.getElementById('previewGrid');

    previewGrid.innerHTML = '';

    // sort ascending (format "YYYY-MM" sorts lexicographically)
    const sorted = months.slice().sort();
    // keep mapping for later download-all
    previewModal.dataset.sortedMonths = JSON.stringify(sorted);

    sorted.forEach(monthVal => {
        const [year, month] = monthVal.split('-');
        const canvas = createCalendarCanvas(parseInt(year), parseInt(month) - 1, teams);

        const item = document.createElement('div');
        item.className = 'preview-item';

        const label = document.createElement('div');
        label.className = 'preview-item-label';
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        label.textContent = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        item.appendChild(canvas);
        item.appendChild(label);

        // Generate proper filename using the utility function
        const filename = generateDownloadFilename(teams, parseInt(month) - 1, parseInt(year));
        
        item.addEventListener('click', () => {
            shareOrDownloadCanvas(canvas, filename);
        });

        previewGrid.appendChild(item);
    });

    previewModal.classList.add('open');
}

// Move this function BEFORE it's used (before generateCalendarPreviews)
function generateDownloadFilename(teams, month, year) {
    // Get month abbreviation (first 3 letters)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthNames[month];
    
    // Join team names with hyphen
    const teamNames = teams.join('-');
    
    // Format: TEAMA-TEAMB_MonthAbbr_Year
    return `${teamNames}_${monthAbbr}_${year}.png`;
}

function createCalendarCanvas(year, month, teams) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 900;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    ctx.fillText(`${monthName} ${year}`, canvas.width / 2, 38);

    // Days of week header
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cellWidth = canvas.width / 7;
    const headerY = 80;

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333333';
    days.forEach((day, i) => {
        ctx.textAlign = 'center';
        ctx.fillText(day, cellWidth * i + cellWidth / 2, headerY);
    });

    // Calendar grid
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellHeight = 120;
    let dayCount = 1;
    const startY = 100;

    for (let week = 0; week < 6 && dayCount <= daysInMonth; week++) {
        for (let day = 0; day < 7; day++) {
            if (week === 0 && day < firstDay) continue;
            if (dayCount > daysInMonth) break;

            const x = day * cellWidth;
            const y = startY + week * cellHeight;

            // Cell border
            ctx.strokeStyle = '#dddddd';
            ctx.strokeRect(x, y, cellWidth, cellHeight);

            // Day number
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(dayCount, x + 8, y + 18);

            // Get schedule for this day
            const currentDate = new Date(year, month, dayCount);
            const schedule = getScheduleForDate(currentDate);

            // Draw team schedules
            let offsetY = 35;
            const teamHeight = (cellHeight - 40) / (teams.length || 1);

            teams.forEach((team, idx) => {
                const shift = schedule[team].shift;
                const teamY = y + offsetY + idx * teamHeight;

                // Background color
                let bgColor = '#e2e8f0';
                if (shift === 'Night') bgColor = '#4a5568';
                else if (shift === 'Morning') bgColor = '#48bb78';
                else if (shift === 'Evening') bgColor = '#ed8936';

                ctx.fillStyle = bgColor;
                ctx.fillRect(x + 4, teamY, cellWidth - 8, teamHeight - 2);

                // Team name
                const textColor = (shift === 'off' || shift === 'rest') ? '#4a5568' : '#ffffff';
                ctx.fillStyle = textColor;
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(team, x + 8, teamY + 14);

                // Shift text
                ctx.font = '9px Arial';
                const shiftText = shift === 'off' ? 'Off Day' : shift === 'rest' ? 'Rest Day' : shift;
                ctx.fillText(shiftText, x + 8, teamY + 26);

                // Hari kerja yang ke berapa (show for working shifts)
                const dayInCycle = schedule[team].dayInCycle;
                if (shift !== 'off' && shift !== 'rest') {
                    ctx.font = '9px Arial';
                    ctx.fillText(`Day ${dayInCycle}`, x + 8, teamY + 38);
                }
            });

            dayCount++;
        }
    }

    return canvas;
}

// detect iOS (simple UA check)
function isIOS() {
    return /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Try Web Share API (with Files) on supporting platforms (iOS Safari supports this)
function shareOrDownloadCanvas(canvas, filename) {
    canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Prefer Web Share API with files on iOS / supported browsers
        const canShareFiles = navigator.canShare && typeof File !== 'undefined';
        if (isIOS() && canShareFiles) {
            try {
                const file = new File([blob], filename, { type: blob.type });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: filename.replace(/\.png$/i, ''),
                        text: 'Share schedule image'
                    });
                    return;
                }
            } catch (err) {
                // fallthrough to download if share fails
                console.warn('Share failed, falling back to download:', err);
            }
        }

        // Fallback: download via anchor
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
}

// Preview modal controls
document.getElementById('backToSelectBtn').addEventListener('click', () => {
    document.getElementById('previewModal').classList.remove('open');
    openDownloadModal();
});

document.getElementById('previewModal').addEventListener('click', (e) => {
    if (e.target.id === 'previewModal') {
        document.getElementById('previewModal').classList.remove('open');
    }
});

function updateConfirmButtonState() {
    // Enable confirm button only if at least one team AND one month selected
    const hasTeams = downloadSelectedTeams.length > 0;
    const hasMonths = downloadSelectedMonths.length > 0;
    confirmDownloadBtn.disabled = !(hasTeams && hasMonths);
}

function updateDownloadSummary() {
    const summaryTeam = document.getElementById('downloadSummaryTeam');
    const summaryMonth = document.getElementById('downloadSummaryMonth');

    // Team summary
    if (downloadSelectedTeams.length === 0) {
        summaryTeam.textContent = 'Team: None';
    } else if (downloadSelectedTeams.length === teams.length) {
        summaryTeam.textContent = 'Team: All teams';
    } else {
        summaryTeam.textContent = `Team: ${downloadSelectedTeams.join(', ')}`;
    }

    // Month summary
    if (downloadSelectedMonths.length === 0) {
        summaryMonth.textContent = 'Month: None';
    } else {
        const monthLabels = downloadSelectedMonths.map(val => {
            const [year, month] = val.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleString('en-US', { month: 'short' });
        });

        if (downloadSelectedMonths.length === 12) {
            summaryMonth.textContent = 'Month: All months';
        } else {
            summaryMonth.textContent = `Month: ${monthLabels.join(', ')}`;
        }
    }
}