/**
 * TurboCleaner - Renderer Script
 * Handles UI interactions, bilingual localization, junk scanning, and RAM purging.
 */

const I18N = {
  en: {
    appSubtitle: 'PC Optimizer',
    statusReady: 'System Ready',
    statusScanning: 'Scanning System...',
    statusCleaned: '⚡ Disk Cleaned',
    navDeepClean: 'Deep Clean',
    navRAMBoost: 'RAM Booster',
    navStartup: 'Startup Apps',
    lblDiskSpace: 'Clean & Safe',
    lblNoAdware: '100% Ad-Free',
    btnEmptyBin: '🗑️ Empty Recycle Bin',
    btnScanNow: 'SCAN PC JUNK',
    btnScanSub: 'Click to analyze disk',
    btnCleanNow: 'CLEAN NOW ⚡',
    btnCleanSub: 'Reclaim free storage',
    summaryTitle: 'Reclaimable Space',
    lblFilesFound: 'Files Found',
    lblSafety: 'Safety',
    lblSafeVerified: '100% Verified',
    junkCategories: 'Junk Categories to Clean:',
    btnSelectAll: 'Select All',
    btnDeselectAll: 'Deselect All',
    ramTitle: 'Live RAM Purge & Memory Optimization',
    ramDesc: 'Cleans process working sets and flushes idle standby memory caches to eliminate gaming stutter and free up RAM.',
    ramUsed: 'RAM In Use',
    ramTotal: 'Total Physical RAM:',
    ramUsedFormatted: 'Currently Used:',
    ramFreeFormatted: 'Available Free:',
    btnPurgeRAM: '⚡ PURGE STANDBY RAM NOW',
    ramWhyTitle: 'Why Purging RAM Boosts PC Performance?',
    ramWhyText: "Windows often keeps closed apps and background caches stored in 'Standby Memory'. When you launch heavy games or software, Windows has to scramble to clear that memory, causing micro-stutters and FPS drops. TurboCleaner forces an immediate cleanup, giving your game 100% clean RAM immediately.",
    startupTitle: 'Windows Startup Applications',
    startupDesc: 'Disable apps that launch silently when Windows turns on to cut your boot time down to a few seconds.',
    btnRefreshStartup: '🔄 Refresh List',
    colAppName: 'Application',
    colBootImpact: 'Boot Impact',
    colLocation: 'Location',
    colStatus: 'Action',
    toastScanComplete: '🔍 Scan complete! Review junk categories below.',
    toastCleanSuccess: '🎉 Successfully cleaned! Reclaimed free space.',
    toastBinEmptied: '🗑️ Recycle Bin emptied successfully.',
    toastRAMPurged: '⚡ Standby RAM purged! Freed extra memory.'
  },
  ar: {
    appSubtitle: 'منظف ومسرّع الويندوز',
    statusReady: 'النظام جاهز',
    statusScanning: 'جاري فحص الجهاز...',
    statusCleaned: '⚡ تم التنظيف بنجاح',
    navDeepClean: 'التنظيف العميق',
    navRAMBoost: 'تسريع الرام (RAM)',
    navStartup: 'برامج بدء التشغيل',
    lblDiskSpace: 'نظيف وآمن',
    lblNoAdware: 'خالٍ من الإعلانات 100%',
    btnEmptyBin: '🗑️ تفريغ سلة المهملات',
    btnScanNow: 'فحص مخلفات الجهاز 🧹',
    btnScanSub: 'انقر لتحليل المساحة المهدورة',
    btnCleanNow: 'تنظيف وتفريغ المساحة ⚡',
    btnCleanSub: 'استرجاع المساحة فوراً',
    summaryTitle: 'المساحة القابلة للاسترجاع',
    lblFilesFound: 'ملفات غير مهمة',
    lblSafety: 'الأمان',
    lblSafeVerified: 'آمن 100% ومضمون',
    junkCategories: 'أقسام الملفات غير الضرورية:',
    btnSelectAll: 'تحديد الكل',
    btnDeselectAll: 'إلغاء التحديد',
    ramTitle: 'تفريغ الرام الفوري وتسريع الذاكرة',
    ramDesc: 'تفريغ الـ Standby Memory ومسح مخلفات البرامج المغلقة لمنع تقطيع الألعاب والبرامج الثقيلة.',
    ramUsed: 'الرام المستهلك',
    ramTotal: 'إجمالي الذاكرة (RAM):',
    ramUsedFormatted: 'المستهلك حالياً:',
    ramFreeFormatted: 'المساحة الفارغة:',
    btnPurgeRAM: '⚡ تفريغ الذاكرة (RAM Purge) الآن',
    ramWhyTitle: 'ليش تفريغ الرام يسرّع جهازك؟',
    ramWhyText: 'الويندوز يترك مخلفات البرامج التي أغلقتها محفوظة بالذاكرة المؤقتة، ولما تفتح لعبة يضطر يحذفها بسرعة مما يسبب نزول فريمات وتقطيع بالماوس. TurboCleaner ينظف الذاكرة فوراً ليعطيك أقصى أداء وسلاسة.',
    startupTitle: 'برامج بدء التشغيل مع إقلاع الويندوز',
    startupDesc: 'تعطيل البرامج التي تفتح بالخلفية بدون علمك لتسريع إقلاع الكمبيوتر إلى ثوانٍ معدودة.',
    btnRefreshStartup: '🔄 تحديث القائمة',
    colAppName: 'اسم البرنامج',
    colBootImpact: 'تأثيره على الإقلاع',
    colLocation: 'المسار',
    colStatus: 'إجراء',
    toastScanComplete: '🔍 اكتمل الفحص! راجع الأقسام بالأسفل.',
    toastCleanSuccess: '🎉 تم التنظيف بنجاح واسترجاع المساحة التخزينية!',
    toastBinEmptied: '🗑️ تم تفريغ سلة المهملات بالكامل.',
    toastRAMPurged: '⚡ تم تفريغ الـ Standby RAM وتوفير ذاكرة حرة!'
  }
};

let currentLang = 'en';
let scannedData = null;
let isCleanMode = false;

document.addEventListener('DOMContentLoaded', () => {
  setupWindowControls();
  setupNavigation();
  setupLanguageToggle();
  setupCleanerActions();
  startRAMMonitor();
  loadStartupApps();
});

function setupWindowControls() {
  document.getElementById('btnMin').addEventListener('click', () => window.turboCleaner.windowAction('minimize'));
  document.getElementById('btnMax').addEventListener('click', () => window.turboCleaner.windowAction('maximize'));
  document.getElementById('btnClose').addEventListener('click', () => window.turboCleaner.windowAction('close'));
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetTab = document.getElementById(targetId);
      if (targetTab) targetTab.classList.add('active');
    });
  });
}

function setupLanguageToggle() {
  const btn = document.getElementById('btnLangToggle');
  btn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    btn.textContent = currentLang === 'en' ? '🇮🇶 العربية' : '🌐 English';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    applyTranslations();
  });
}

function applyTranslations() {
  const dict = I18N[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  if (scannedData) renderCategories(scannedData.categories);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// Cleaner Logic
function setupCleanerActions() {
  const btnAction = document.getElementById('btnScanAction');
  btnAction.addEventListener('click', async () => {
    if (!isCleanMode) {
      await runScan();
    } else {
      await runClean();
    }
  });

  document.getElementById('btnSelectAll').addEventListener('click', () => {
    document.querySelectorAll('.cat-checkbox').forEach(cb => { cb.checked = true; });
    document.querySelectorAll('.cat-item').forEach(item => item.classList.add('checked'));
  });

  document.getElementById('btnDeselectAll').addEventListener('click', () => {
    document.querySelectorAll('.cat-checkbox').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('checked'));
  });

  document.getElementById('btnQuickRecycle').addEventListener('click', async () => {
    const dict = I18N[currentLang];
    await window.turboCleaner.emptyRecycleBin();
    showToast(dict.toastBinEmptied);
  });
}

async function runScan() {
  const btn = document.getElementById('btnScanAction');
  const label = document.getElementById('scanButtonLabel');
  const sub = document.getElementById('scanButtonSub');
  const badge = document.getElementById('scanStatusBadge');
  const dict = I18N[currentLang];

  btn.style.pointerEvents = 'none';
  label.textContent = 'SCANNING...';
  badge.textContent = 'SCANNING';
  badge.style.color = '#00f0ff';
  badge.style.background = 'rgba(0, 240, 255, 0.2)';

  scannedData = await window.turboCleaner.scanJunk();
  btn.style.pointerEvents = 'auto';

  // Update Metrics
  const parts = scannedData.totalFormatted.split(' ');
  document.getElementById('metricTotalBytes').textContent = parts[0];
  document.getElementById('metricTotalUnit').textContent = parts[1] || 'MB';
  document.getElementById('metricFilesCount').textContent = scannedData.totalFiles.toLocaleString();

  badge.textContent = 'FOUND';
  badge.style.color = '#ef4444';
  badge.style.background = 'rgba(239, 68, 68, 0.2)';

  // Switch button to Clean mode
  isCleanMode = true;
  btn.classList.add('clean-mode');
  label.textContent = dict.btnCleanNow;
  sub.textContent = `${scannedData.totalFormatted} to clean`;
  document.getElementById('scanIcon').textContent = '⚡';

  renderCategories(scannedData.categories);
  showToast(dict.toastScanComplete);
}

async function runClean() {
  const btn = document.getElementById('btnScanAction');
  const label = document.getElementById('scanButtonLabel');
  const badge = document.getElementById('scanStatusBadge');
  const dict = I18N[currentLang];

  const selectedCats = [];
  document.querySelectorAll('.cat-checkbox:checked').forEach(cb => {
    selectedCats.push(cb.value);
  });

  if (selectedCats.length === 0) {
    alert(currentLang === 'ar' ? 'يرجى تحديد قسم واحد على الأقل للتنظيف.' : 'Please select at least one category to clean.');
    return;
  }

  btn.style.pointerEvents = 'none';
  label.textContent = 'CLEANING...';

  const res = await window.turboCleaner.cleanJunk(selectedCats);
  btn.style.pointerEvents = 'auto';

  badge.textContent = 'CLEANED';
  badge.style.color = '#10b981';
  badge.style.background = 'rgba(16, 185, 129, 0.2)';

  document.getElementById('metricTotalBytes').textContent = '0';
  document.getElementById('metricTotalUnit').textContent = 'MB';
  document.getElementById('metricFilesCount').textContent = '0';

  isCleanMode = false;
  btn.classList.remove('clean-mode');
  label.textContent = dict.btnScanNow;
  document.getElementById('scanButtonSub').textContent = dict.btnScanSub;
  document.getElementById('scanIcon').textContent = '🧹';

  // Clear categories list
  document.getElementById('categoriesGrid').innerHTML = '';
  showToast(dict.toastCleanSuccess);
}

function renderCategories(categories) {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  categories.forEach(cat => {
    const isAr = currentLang === 'ar';
    const name = isAr ? cat.nameAr : cat.name;
    const desc = isAr ? cat.descriptionAr : cat.description;

    const div = document.createElement('div');
    div.className = `cat-item ${cat.selected ? 'checked' : ''}`;
    div.innerHTML = `
      <input type="checkbox" class="cat-checkbox" value="${cat.id}" ${cat.selected ? 'checked' : ''}>
      <span class="cat-icon">${cat.icon}</span>
      <div class="cat-info">
        <div class="cat-name">${name}</div>
        <div class="cat-desc">${desc}</div>
      </div>
      <div class="cat-size">${cat.sizeFormatted}</div>
    `;

    const cb = div.querySelector('.cat-checkbox');
    div.addEventListener('click', (e) => {
      if (e.target !== cb) {
        cb.checked = !cb.checked;
      }
      div.classList.toggle('checked', cb.checked);
    });

    grid.appendChild(div);
  });
}

// RAM Booster
function startRAMMonitor() {
  const percentEl = document.getElementById('ramPercentVal');
  const totalEl = document.getElementById('ramTotalVal');
  const usedEl = document.getElementById('ramUsedVal');
  const freeEl = document.getElementById('ramFreeVal');

  async function update() {
    try {
      const stats = await window.turboCleaner.getRAMStats();
      percentEl.textContent = `${stats.percent}%`;
      totalEl.textContent = stats.totalFormatted;
      usedEl.textContent = stats.usedFormatted;
      freeEl.textContent = stats.freeFormatted;
    } catch (e) {}
  }

  update();
  setInterval(update, 3000);

  document.getElementById('btnPurgeRAM').addEventListener('click', async () => {
    const btn = document.getElementById('btnPurgeRAM');
    btn.style.pointerEvents = 'none';
    btn.textContent = 'PURGING MEMORY...';

    const res = await window.turboCleaner.purgeRAM();
    btn.style.pointerEvents = 'auto';
    btn.textContent = I18N[currentLang].btnPurgeRAM;

    if (res.success) {
      showToast(`${I18N[currentLang].toastRAMPurged} (${res.freedMB} MB freed)`);
      update();
    }
  });
}

// Startup Apps
async function loadStartupApps() {
  const tbody = document.getElementById('startupTableBody');
  const btn = document.getElementById('btnRefreshStartup');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#94a3b8;">Scanning startup entries...</td></tr>';

  try {
    const apps = await window.turboCleaner.getStartupApps();
    tbody.innerHTML = '';

    if (!apps || apps.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#94a3b8;">No startup applications found.</td></tr>';
      return;
    }

    apps.forEach(app => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${app.name}</strong></td>
        <td><span class="badge-impact impact-${app.impact}">${app.impact}</span></td>
        <td style="color:#64748b; font-size:11px; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${app.location || 'Registry Run'}</td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="disableStartup('${app.name}')">
            ${currentLang === 'ar' ? 'تعطيل' : 'Disable'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#94a3b8;">Failed to load startup apps.</td></tr>';
  }

  btn.addEventListener('click', loadStartupApps);
}

window.disableStartup = async (appName) => {
  const res = await window.turboCleaner.toggleStartupApp(appName, false);
  if (res.success) {
    showToast(currentLang === 'ar' ? `تم تعطيل تشغيل ${appName} مع الويندوز` : `Disabled ${appName} from startup`);
    loadStartupApps();
  }
};
