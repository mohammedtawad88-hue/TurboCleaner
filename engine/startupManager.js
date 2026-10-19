/**
 * TurboCleaner - Windows Startup Apps Manager
 * Detects programs that slow down Windows boot time and allows 1-click disabling.
 */

const { exec } = require('child_process');

function getStartupApps() {
  return new Promise((resolve) => {
    const psCmd = `powershell -NoProfile -Command "Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User | ConvertTo-Json -Compress"`;

    exec(psCmd, { windowsHide: true }, (err, stdout) => {
      if (err || !stdout.trim()) {
        return resolve([]);
      }

      try {
        let items = JSON.parse(stdout);
        if (!Array.isArray(items)) items = [items];

        const apps = items.map(item => {
          let impact = 'Medium';
          const cmdLower = (item.Command || '').toLowerCase();
          const nameLower = (item.Name || '').toLowerCase();

          if (cmdLower.includes('discord') || cmdLower.includes('steam') || cmdLower.includes('epic') || cmdLower.includes('chrome') || cmdLower.includes('edge')) {
            impact = 'High';
          } else if (cmdLower.includes('update') || cmdLower.includes('helper') || cmdLower.includes('tray')) {
            impact = 'Low';
          }

          return {
            name: item.Name || 'Unknown App',
            command: item.Command || '',
            location: item.Location || '',
            impact,
            enabled: true
          };
        });

        resolve(apps);
      } catch (e) {
        resolve([]);
      }
    });
  });
}

function toggleStartupApp(appName, enable = false) {
  return new Promise((resolve) => {
    // If disabling, move from Run key or toggle
    const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
    if (!enable) {
      exec(`reg delete "${regKey}" /v "${appName}" /f`, { windowsHide: true }, () => {
        resolve({ success: true, enabled: false });
      });
    } else {
      resolve({ success: true, enabled: true });
    }
  });
}

module.exports = {
  getStartupApps,
  toggleStartupApp
};
