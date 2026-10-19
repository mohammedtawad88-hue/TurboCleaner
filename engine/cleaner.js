/**
 * TurboCleaner - Deep Disk & Cache Cleaner Engine
 * High-speed parallel scanner and safe cleaner for Windows junk files.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

const CLEANER_CATEGORIES = [
  {
    id: 'userTemp',
    name: 'User Temp Files',
    nameAr: 'ملفات المستخدم المؤقتة',
    description: 'Temporary cached files created by Windows apps (%TEMP%).',
    descriptionAr: 'الملفات المؤقتة الناتجة عن البرامج اليومية.',
    paths: [os.tmpdir()],
    icon: '📁'
  },
  {
    id: 'systemTemp',
    name: 'Windows System Temp',
    nameAr: 'ملفات النظام المؤقتة',
    description: 'System-level installer and service temp files (C:\\Windows\\Temp).',
    descriptionAr: 'ملفات تثبيت وتحديثات النظام القديمة.',
    paths: [path.join(process.env.SystemRoot || 'C:\\Windows', 'Temp')],
    icon: '⚙️'
  },
  {
    id: 'updateCache',
    name: 'Windows Update Cache',
    nameAr: 'كاش تحديثات الويندوز',
    description: 'Leftover downloaded update packages (SoftwareDistribution\\Download).',
    descriptionAr: 'بقايا حزم تحديثات الويندوز المحملة مسبقاً.',
    paths: [path.join(process.env.SystemRoot || 'C:\\Windows', 'SoftwareDistribution', 'Download')],
    icon: '🔄'
  },
  {
    id: 'prefetch',
    name: 'Windows Prefetch Cache',
    nameAr: 'كاش تسريع الإقلاع القديم',
    description: 'Stale application launch history in C:\\Windows\\Prefetch.',
    descriptionAr: 'سجلات تشغيل البرامج القديمة والمحذوفة.',
    paths: [path.join(process.env.SystemRoot || 'C:\\Windows', 'Prefetch')],
    icon: '⚡'
  },
  {
    id: 'directXShader',
    name: 'DirectX & GPU Shader Cache',
    nameAr: 'كاش كروت الشاشة و DirectX',
    description: 'Compiled GPU game shader cache (NVIDIA, AMD, Intel, DirectX).',
    descriptionAr: 'كاش معالجة رسوميات الألعاب القديمة لكروت الشاشة.',
    paths: [
      path.join(localAppData, 'D3DSCache'),
      path.join(localAppData, 'NVIDIA', 'DXCache'),
      path.join(localAppData, 'NVIDIA', 'GLCache'),
      path.join(localAppData, 'AMD', 'DxCache')
    ],
    icon: '🎮'
  },
  {
    id: 'browserCache',
    name: 'Browser Caches (Chrome / Edge)',
    nameAr: 'كاش المتصفحات (كروم وإيدج)',
    description: 'Web browsing caches (safe to delete, keeps passwords & history).',
    descriptionAr: 'ملفات الصور والمواقع المؤقتة (لا تحذف كلمات المرور).',
    paths: [
      path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
      path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache')
    ],
    icon: '🌐'
  },
  {
    id: 'crashDumps',
    name: 'Crash Dumps & Error Reports',
    nameAr: 'تقارير أخطاء وانهيار البرامج',
    description: 'Large crash dump files (.dmp) and error telemetry.',
    descriptionAr: 'ملفات تفريغ الذاكرة الضخمة الناتجة عن كراشات البرامج.',
    paths: [
      path.join(localAppData, 'CrashDumps'),
      path.join(process.env.SystemRoot || 'C:\\Windows', 'Minidump')
    ],
    icon: '💥'
  }
];

function getDirectorySize(dirPath) {
  let totalBytes = 0;
  let fileCount = 0;

  if (!fs.existsSync(dirPath)) {
    return { bytes: 0, count: 0 };
  }

  function walk(current) {
    try {
      const items = fs.readdirSync(current, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(current, item.name);
        try {
          if (item.isDirectory()) {
            walk(full);
          } else if (item.isFile()) {
            const stat = fs.statSync(full);
            totalBytes += stat.size;
            fileCount++;
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  walk(dirPath);
  return { bytes: totalBytes, count: fileCount };
}

function cleanDirectory(dirPath) {
  let freedBytes = 0;
  let deletedFiles = 0;

  if (!fs.existsSync(dirPath)) return { bytes: 0, count: 0 };

  function removeItems(current, isRoot = false) {
    try {
      const items = fs.readdirSync(current, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(current, item.name);
        try {
          if (item.isDirectory()) {
            removeItems(full, false);
            try { fs.rmdirSync(full); } catch (e) {}
          } else {
            const stat = fs.statSync(full);
            fs.unlinkSync(full);
            freedBytes += stat.size;
            deletedFiles++;
          }
        } catch (e) {
          // File in use, skip safely
        }
      }
    } catch (e) {}
  }

  removeItems(dirPath, true);
  return { bytes: freedBytes, count: deletedFiles };
}

/**
 * Scan all categories and calculate total potential savings
 */
async function scanAllJunk() {
  const results = [];
  let totalBytes = 0;
  let totalFiles = 0;

  for (const cat of CLEANER_CATEGORIES) {
    let catBytes = 0;
    let catFiles = 0;

    for (const p of cat.paths) {
      const res = getDirectorySize(p);
      catBytes += res.bytes;
      catFiles += res.count;
    }

    totalBytes += catBytes;
    totalFiles += catFiles;

    results.push({
      ...cat,
      bytes: catBytes,
      files: catFiles,
      sizeFormatted: formatBytes(catBytes),
      selected: catBytes > 0
    });
  }

  return {
    categories: results,
    totalBytes,
    totalFiles,
    totalFormatted: formatBytes(totalBytes)
  };
}

/**
 * Clean selected categories
 */
async function cleanJunk(categoryIds = []) {
  let totalFreed = 0;
  let totalDeleted = 0;
  const logs = [];

  for (const cat of CLEANER_CATEGORIES) {
    if (!categoryIds.includes(cat.id)) continue;

    let catFreed = 0;
    let catFiles = 0;

    for (const p of cat.paths) {
      const res = cleanDirectory(p);
      catFreed += res.bytes;
      catFiles += res.count;
    }

    totalFreed += catFreed;
    totalDeleted += catFiles;
    logs.push(`Cleaned ${cat.name}: Freed ${formatBytes(catFreed)} (${catFiles} files)`);
  }

  // Also empty Recycle Bin if requested
  if (categoryIds.includes('recycleBin')) {
    await emptyRecycleBin();
    logs.push('Emptied Windows Recycle Bin');
  }

  return {
    success: true,
    freedBytes: totalFreed,
    freedFormatted: formatBytes(totalFreed),
    deletedFiles: totalDeleted,
    logs
  };
}

function emptyRecycleBin() {
  return new Promise((resolve) => {
    exec('powershell -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"', { windowsHide: true }, () => {
      resolve(true);
    });
  });
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  CLEANER_CATEGORIES,
  scanAllJunk,
  cleanJunk,
  emptyRecycleBin,
  formatBytes
};
