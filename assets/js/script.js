/* -------------------------------------------
   THEME SWITCHER LOGIC
------------------------------------------- */
const themeBtn = document.getElementById('theme-btn');
const themeDropdown = document.getElementById('theme-dropdown');
const themeOptions = document.querySelectorAll('.theme-option');
const htmlElement = document.documentElement;

// Updated to use Phosphor Icons instead of raw SVGs
const icons = {
    light: '<i class="ph ph-sun" style="font-size: 20px;"></i>',
    dark: '<i class="ph ph-moon" style="font-size: 20px;"></i>',
    system: '<i class="ph ph-desktop" style="font-size: 20px;"></i>'
};

let currentTheme = localStorage.getItem('theme') || 'system';

function applyTheme(theme) {
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        htmlElement.setAttribute('data-theme', theme);
    }
    
    themeBtn.innerHTML = icons[theme];
    
    themeOptions.forEach(opt => {
        if (opt.getAttribute('data-theme-val') === theme) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

applyTheme(currentTheme);

themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('active');
});

document.addEventListener('click', () => {
    themeDropdown.classList.remove('active');
});

themeOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedTheme = opt.getAttribute('data-theme-val');
        
        currentTheme = selectedTheme;
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
        
        themeDropdown.classList.remove('active');
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
        applyTheme('system');
    }
});


/* -------------------------------------------
   BOTTOM SHEET LOGIC
------------------------------------------- */
const sheet = document.getElementById('bottom-sheet');
const overlay = document.getElementById('sheet-overlay');
const dragHandle = document.getElementById('drag-handle');

let sheetState = 'hidden'; 
let isDragging = false;
let startY = 0;

const heights = { hidden: 100, half: 50, full: 10 };
const isDesktop = () => window.innerWidth > 860;

function updateSheetTransform(offsetY = 0) {
    if (isDesktop()) return; 
    const basePercentage = heights[sheetState];
    sheet.style.transform = `translateY(calc(${basePercentage}% + ${offsetY}px))`;
}

window.openSheet = (targetState = 'half') => {
    sheetState = targetState;
    overlay.classList.add('active');
    if (isDesktop()) {
        sheet.classList.add('desktop-open');
    } else {
        sheet.style.transform = `translateY(${heights[targetState]}%)`;
    }
};

window.closeSheet = () => {
    sheetState = 'hidden';
    overlay.classList.remove('active');
    if (isDesktop()) {
        sheet.classList.remove('desktop-open');
    } else {
        sheet.style.transform = `translateY(100%)`;
    }
};

const onDragStart = (e) => {
    if (isDesktop()) return; 
    isDragging = true;
    sheet.classList.add('dragging'); 
    startY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
};

const onDragMove = (e) => {
    if (!isDragging || isDesktop()) return;
    if (e.cancelable) e.preventDefault();
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    const deltaY = clientY - startY;
    
    if (sheetState === 'full' && deltaY < 0) return;
    updateSheetTransform(deltaY);
};

const onDragEnd = (e) => {
    if (!isDragging || isDesktop()) return;
    isDragging = false;
    sheet.classList.remove('dragging'); 
    
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = clientY - startY;
    
    if (sheetState === 'half') {
        if (deltaY > 60) closeSheet(); 
        else if (deltaY < -60) sheetState = 'full'; 
    } else if (sheetState === 'full') {
        if (deltaY > 60) sheetState = 'half'; 
    }
    
    if(sheetState !== 'hidden') updateSheetTransform(0);
};

dragHandle.addEventListener('mousedown', onDragStart);
dragHandle.addEventListener('touchstart', onDragStart, { passive: false });
window.addEventListener('mousemove', onDragMove);
window.addEventListener('touchmove', onDragMove, { passive: false });
window.addEventListener('mouseup', onDragEnd);
window.addEventListener('touchend', onDragEnd);