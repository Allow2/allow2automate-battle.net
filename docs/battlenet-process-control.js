/**
 * Battle.net Process Control Module
 * System-level and process-level methods to control Battle.net
 *
 * Based on research for Allow2Automate parental control system
 * References: ScriptManager.js, PollingMonitor.js patterns
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * BATTLE.NET PROCESS NAMES AND EXECUTABLE PATHS
 * ============================================
 */
const BATTLENET_PROCESSES = {
  windows: {
    launcher: {
      processNames: ['Battle.net.exe', 'Battle.net Launcher.exe', 'Blizzard Battle.net.exe'],
      defaultPaths: [
        'C:\\Program Files (x86)\\Battle.net\\Battle.net.exe',
        'C:\\Program Files\\Battle.net\\Battle.net.exe',
        '%ProgramFiles(x86)%\\Battle.net\\Battle.net.exe'
      ],
      serviceName: 'Battle.net Update Service'
    },
    games: {
      'World of Warcraft': {
        processNames: ['Wow.exe', 'WowClassic.exe', 'Wow-64.exe'],
        defaultPaths: [
          'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\Wow.exe',
          'C:\\Program Files (x86)\\World of Warcraft\\_classic_\\WowClassic.exe'
        ]
      },
      'Overwatch': {
        processNames: ['Overwatch.exe'],
        defaultPaths: ['C:\\Program Files (x86)\\Overwatch\\Overwatch.exe']
      },
      'Diablo IV': {
        processNames: ['Diablo IV.exe'],
        defaultPaths: ['C:\\Program Files (x86)\\Diablo IV\\Diablo IV.exe']
      },
      'Hearthstone': {
        processNames: ['Hearthstone.exe'],
        defaultPaths: ['C:\\Program Files (x86)\\Hearthstone\\Hearthstone.exe']
      },
      'StarCraft II': {
        processNames: ['SC2.exe', 'SC2_x64.exe'],
        defaultPaths: [
          'C:\\Program Files (x86)\\StarCraft II\\SC2.exe',
          'C:\\Program Files (x86)\\StarCraft II\\SC2_x64.exe'
        ]
      },
      'Heroes of the Storm': {
        processNames: ['HeroesSwitcher.exe', 'HeroesOfTheStorm.exe'],
        defaultPaths: ['C:\\Program Files (x86)\\Heroes of the Storm\\HeroesSwitcher.exe']
      },
      'Call of Duty': {
        processNames: ['cod.exe', 'ModernWarfare.exe', 'BlackOpsColdWar.exe'],
        defaultPaths: [
          'C:\\Program Files (x86)\\Call of Duty Modern Warfare\\ModernWarfare.exe',
          'C:\\Program Files (x86)\\Call of Duty Black Ops Cold War\\BlackOpsColdWar.exe'
        ]
      }
    }
  },

  macos: {
    launcher: {
      processNames: ['Battle.net', 'Blizzard Battle.net'],
      defaultPaths: [
        '/Applications/Battle.net.app/Contents/MacOS/Battle.net',
        '~/Applications/Battle.net.app/Contents/MacOS/Battle.net'
      ]
    },
    games: {
      'World of Warcraft': {
        processNames: ['World of Warcraft', 'WoW'],
        defaultPaths: [
          '/Applications/World of Warcraft/_retail_/World of Warcraft.app',
          '/Applications/World of Warcraft/_classic_/World of Warcraft Classic.app'
        ]
      },
      'Overwatch': {
        processNames: ['Overwatch'],
        defaultPaths: ['/Applications/Overwatch/Overwatch.app']
      },
      'Diablo IV': {
        processNames: ['Diablo IV'],
        defaultPaths: ['/Applications/Diablo IV/Diablo IV.app']
      },
      'Hearthstone': {
        processNames: ['Hearthstone'],
        defaultPaths: ['/Applications/Hearthstone/Hearthstone.app']
      },
      'StarCraft II': {
        processNames: ['StarCraft II'],
        defaultPaths: ['/Applications/StarCraft II/StarCraft II.app']
      }
    }
  }
};

/**
 * PROCESS DETECTION MODULE
 * ========================
 * Detect running Battle.net processes using multiple methods
 */
class BattleNetProcessDetector {

  constructor() {
    this.platform = process.platform;
    this.processCache = new Map(); // Cache process info for performance
    this.cacheExpiry = 5000; // 5 seconds cache
  }

  /**
   * Method 1: Using tasklist (Windows) or ps (macOS/Linux)
   * Fast and reliable for detecting processes
   */
  async detectProcesses() {
    const now = Date.now();

    // Return cached result if still valid
    if (this.processCache.has('processes') &&
        (now - this.processCache.get('processesTime')) < this.cacheExpiry) {
      return this.processCache.get('processes');
    }

    let processes = [];

    if (this.platform === 'win32') {
      processes = await this.detectWindowsProcesses();
    } else if (this.platform === 'darwin') {
      processes = await this.detectMacProcesses();
    } else {
      processes = await this.detectLinuxProcesses();
    }

    // Cache results
    this.processCache.set('processes', processes);
    this.processCache.set('processesTime', now);

    return processes;
  }

  /**
   * Windows process detection using tasklist
   */
  async detectWindowsProcesses() {
    try {
      // tasklist /FO CSV /V provides detailed process information
      const { stdout } = await execAsync('tasklist /FO CSV /V /NH');

      const processes = [];
      const lines = stdout.split('\n');

      for (const line of lines) {
        // Parse CSV: "processName","PID","SessionName","SessionNum","MemUsage","Status","UserName","CPUTime","WindowTitle"
        const match = line.match(/"([^"]+)","(\d+)"/);
        if (!match) continue;

        const [, processName, pid] = match;

        // Check if this is a Battle.net process
        if (this.isBattleNetProcess(processName)) {
          processes.push({
            name: processName,
            pid: parseInt(pid),
            platform: 'win32',
            type: this.getProcessType(processName),
            detectedAt: Date.now()
          });
        }
      }

      return processes;

    } catch (error) {
      console.error('Error detecting Windows processes:', error);
      return [];
    }
  }

  /**
   * macOS process detection using ps
   */
  async detectMacProcesses() {
    try {
      // ps aux provides detailed process information
      const { stdout } = await execAsync('ps aux');

      const processes = [];
      const lines = stdout.split('\n');

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 11) continue;

        const pid = parseInt(parts[1]);
        const command = parts.slice(10).join(' ');

        // Check if this is a Battle.net process
        if (this.isBattleNetProcess(command)) {
          processes.push({
            name: this.extractProcessName(command),
            pid: pid,
            platform: 'darwin',
            type: this.getProcessType(command),
            command: command,
            detectedAt: Date.now()
          });
        }
      }

      return processes;

    } catch (error) {
      console.error('Error detecting macOS processes:', error);
      return [];
    }
  }

  /**
   * Linux process detection using ps
   */
  async detectLinuxProcesses() {
    try {
      const { stdout } = await execAsync('ps aux');

      const processes = [];
      const lines = stdout.split('\n');

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 11) continue;

        const pid = parseInt(parts[1]);
        const command = parts.slice(10).join(' ');

        if (this.isBattleNetProcess(command)) {
          processes.push({
            name: this.extractProcessName(command),
            pid: pid,
            platform: 'linux',
            type: this.getProcessType(command),
            command: command,
            detectedAt: Date.now()
          });
        }
      }

      return processes;

    } catch (error) {
      console.error('Error detecting Linux processes:', error);
      return [];
    }
  }

  /**
   * Method 2: Using node-ps-data library (cross-platform)
   * Install: npm install ps-list
   */
  async detectWithPsList() {
    try {
      const psList = require('ps-list');
      const allProcesses = await psList();

      return allProcesses
        .filter(p => this.isBattleNetProcess(p.name))
        .map(p => ({
          name: p.name,
          pid: p.pid,
          ppid: p.ppid,
          platform: this.platform,
          type: this.getProcessType(p.name),
          detectedAt: Date.now()
        }));

    } catch (error) {
      console.error('Error using ps-list:', error);
      console.log('Install ps-list: npm install ps-list');
      return [];
    }
  }

  /**
   * Check if process name matches Battle.net patterns
   */
  isBattleNetProcess(processName) {
    const processConfig = BATTLENET_PROCESSES[this.platform === 'win32' ? 'windows' : 'macos'];

    // Check launcher processes
    if (processConfig.launcher.processNames.some(name =>
      processName.toLowerCase().includes(name.toLowerCase()))) {
      return true;
    }

    // Check game processes
    for (const game of Object.values(processConfig.games)) {
      if (game.processNames.some(name =>
        processName.toLowerCase().includes(name.toLowerCase()))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine process type (launcher or specific game)
   */
  getProcessType(processName) {
    const processConfig = BATTLENET_PROCESSES[this.platform === 'win32' ? 'windows' : 'macos'];

    // Check if launcher
    if (processConfig.launcher.processNames.some(name =>
      processName.toLowerCase().includes(name.toLowerCase()))) {
      return 'launcher';
    }

    // Identify specific game
    for (const [gameName, game] of Object.entries(processConfig.games)) {
      if (game.processNames.some(name =>
        processName.toLowerCase().includes(name.toLowerCase()))) {
        return gameName;
      }
    }

    return 'unknown';
  }

  /**
   * Extract clean process name from command
   */
  extractProcessName(command) {
    const parts = command.split(/[\\/]/);
    return parts[parts.length - 1].split('.')[0];
  }

  /**
   * Monitor processes continuously
   */
  startMonitoring(callback, intervalMs = 5000) {
    this.monitorInterval = setInterval(async () => {
      const processes = await this.detectProcesses();
      callback({
        processes,
        count: processes.length,
        active: processes.length > 0,
        timestamp: Date.now()
      });
    }, intervalMs);

    return this.monitorInterval;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.processCache.clear();
  }
}

/**
 * PROCESS TERMINATION MODULE
 * ==========================
 * Terminate Battle.net processes programmatically
 */
class BattleNetProcessController {

  constructor(detector) {
    this.detector = detector || new BattleNetProcessDetector();
    this.platform = process.platform;
  }

  /**
   * Terminate all Battle.net processes
   */
  async terminateAllProcesses(options = {}) {
    const {
      force = false,        // Force kill (-9 on Unix, /F on Windows)
      gracePeriod = 5000,   // Grace period before force kill (ms)
      includeLauncher = true,
      includeGames = true
    } = options;

    const processes = await this.detector.detectProcesses();
    const results = [];

    for (const process of processes) {
      // Skip if filtering
      if (!includeLauncher && process.type === 'launcher') continue;
      if (!includeGames && process.type !== 'launcher') continue;

      try {
        const result = await this.terminateProcess(process.pid, {
          force,
          gracePeriod,
          processName: process.name
        });

        results.push({
          ...process,
          terminated: result.success,
          method: result.method,
          error: result.error
        });

      } catch (error) {
        results.push({
          ...process,
          terminated: false,
          error: error.message
        });
      }
    }

    return {
      total: processes.length,
      terminated: results.filter(r => r.terminated).length,
      failed: results.filter(r => !r.terminated).length,
      results
    };
  }

  /**
   * Terminate specific process by PID
   */
  async terminateProcess(pid, options = {}) {
    const {
      force = false,
      gracePeriod = 5000,
      processName = ''
    } = options;

    try {
      if (this.platform === 'win32') {
        return await this.terminateWindows(pid, force, processName);
      } else {
        return await this.terminateUnix(pid, force, gracePeriod, processName);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        pid
      };
    }
  }

  /**
   * Windows process termination using taskkill
   */
  async terminateWindows(pid, force = false, processName = '') {
    try {
      const forceFlag = force ? '/F' : '';

      // Try by PID first
      let command = `taskkill /PID ${pid} ${forceFlag}`;

      try {
        await execAsync(command);
        return {
          success: true,
          method: force ? 'taskkill /F' : 'taskkill',
          pid
        };
      } catch (error) {
        // If PID fails and we have process name, try by image name
        if (processName) {
          command = `taskkill /IM "${processName}" ${forceFlag}`;
          await execAsync(command);
          return {
            success: true,
            method: force ? 'taskkill /IM /F' : 'taskkill /IM',
            pid,
            processName
          };
        }
        throw error;
      }

    } catch (error) {
      throw new Error(`Failed to terminate process ${pid}: ${error.message}`);
    }
  }

  /**
   * Unix (macOS/Linux) process termination using kill
   */
  async terminateUnix(pid, force = false, gracePeriod = 5000, processName = '') {
    try {
      // First try graceful termination (SIGTERM)
      if (!force) {
        try {
          await execAsync(`kill ${pid}`);

          // Wait for grace period
          await new Promise(resolve => setTimeout(resolve, gracePeriod));

          // Check if still running
          try {
            await execAsync(`kill -0 ${pid}`); // Check if process exists
            // Still running, force kill
            await execAsync(`kill -9 ${pid}`);
            return {
              success: true,
              method: 'SIGTERM -> SIGKILL',
              pid
            };
          } catch {
            // Process terminated gracefully
            return {
              success: true,
              method: 'SIGTERM',
              pid
            };
          }

        } catch (error) {
          throw error;
        }
      } else {
        // Force kill immediately (SIGKILL)
        await execAsync(`kill -9 ${pid}`);
        return {
          success: true,
          method: 'SIGKILL',
          pid
        };
      }

    } catch (error) {
      throw new Error(`Failed to terminate process ${pid}: ${error.message}`);
    }
  }

  /**
   * Terminate specific game by name
   */
  async terminateGame(gameName, options = {}) {
    const processes = await this.detector.detectProcesses();
    const gameProcesses = processes.filter(p =>
      p.type.toLowerCase().includes(gameName.toLowerCase())
    );

    if (gameProcesses.length === 0) {
      return {
        success: false,
        error: `No processes found for game: ${gameName}`
      };
    }

    const results = [];
    for (const process of gameProcesses) {
      const result = await this.terminateProcess(process.pid, {
        ...options,
        processName: process.name
      });
      results.push({ ...process, ...result });
    }

    return {
      game: gameName,
      total: gameProcesses.length,
      terminated: results.filter(r => r.success).length,
      results
    };
  }

  /**
   * Block/unblock Battle.net launcher startup
   * Windows: Disable startup registry entries
   */
  async blockLauncherStartup() {
    if (this.platform === 'win32') {
      try {
        // Disable Battle.net from startup (requires admin)
        const startupKeys = [
          'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
          'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
        ];

        for (const key of startupKeys) {
          try {
            await execAsync(`reg delete "${key}" /v "Battle.net" /f`);
          } catch (e) {
            // Key might not exist, continue
          }
        }

        return { success: true, method: 'registry' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else if (this.platform === 'darwin') {
      try {
        // Disable Battle.net login item (macOS)
        await execAsync('osascript -e \'tell application "System Events" to delete login item "Battle.net"\'');
        return { success: true, method: 'login items' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'Platform not supported' };
  }
}

/**
 * NETWORK-LEVEL BLOCKING MODULE
 * ==============================
 * Block Battle.net at network level
 */
class BattleNetNetworkBlocker {

  constructor() {
    this.platform = process.platform;

    // Battle.net domains and IP ranges
    this.battlenetDomains = [
      'battle.net',
      'blizzard.com',
      'blzstatic.com',
      'blizzard.cn',
      'battlenet.com.cn',
      'us.actual.battle.net',
      'eu.actual.battle.net',
      'kr.actual.battle.net',
      'tw.actual.battle.net',
      'cn.actual.battle.net'
    ];

    // Known Battle.net ports
    this.battlenetPorts = [
      1119,  // Battle.net
      3724,  // World of Warcraft
      6113,  // Battle.net (legacy)
      6114,  // Battle.net (legacy)
      27000-27100, // Blizzard Downloader
      80,    // HTTP
      443,   // HTTPS
      1120,  // Battle.net v2
      3000-3100 // Hearthstone range
    ];
  }

  /**
   * Method 1: Hosts file blocking (requires admin/root)
   */
  async blockViaHostsFile(domains = this.battlenetDomains) {
    try {
      const hostsPath = this.platform === 'win32'
        ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
        : '/etc/hosts';

      const entries = domains.map(domain =>
        `127.0.0.1 ${domain}\n127.0.0.1 www.${domain}`
      ).join('\n');

      // Read existing hosts file
      const fs = require('fs').promises;
      const existingHosts = await fs.readFile(hostsPath, 'utf8');

      // Add Battle.net blocking section
      const newHosts = existingHosts + '\n\n# Battle.net Parental Control Block\n' + entries + '\n';

      // Write back (requires elevated privileges)
      await fs.writeFile(hostsPath, newHosts);

      return {
        success: true,
        method: 'hosts file',
        path: hostsPath,
        domains: domains.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresAdmin: true
      };
    }
  }

  /**
   * Method 2: Windows Firewall blocking (requires admin)
   */
  async blockViaWindowsFirewall() {
    if (this.platform !== 'win32') {
      return { success: false, error: 'Windows only' };
    }

    try {
      const processConfig = BATTLENET_PROCESSES.windows;

      // Block Battle.net launcher
      const launcherPaths = processConfig.launcher.defaultPaths;

      for (const path of launcherPaths) {
        try {
          // Create outbound blocking rule
          await execAsync(`netsh advfirewall firewall add rule name="Block Battle.net Launcher" dir=out action=block program="${path}" enable=yes`);

          // Create inbound blocking rule
          await execAsync(`netsh advfirewall firewall add rule name="Block Battle.net Launcher Inbound" dir=in action=block program="${path}" enable=yes`);
        } catch (e) {
          // Path might not exist, continue
        }
      }

      // Block by domain (requires Windows 8+)
      for (const domain of this.battlenetDomains) {
        try {
          await execAsync(`netsh advfirewall firewall add rule name="Block ${domain}" dir=out action=block remoteip="${domain}" enable=yes`);
        } catch (e) {
          // Continue
        }
      }

      return {
        success: true,
        method: 'Windows Firewall',
        rules: launcherPaths.length + this.battlenetDomains.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresAdmin: true
      };
    }
  }

  /**
   * Method 3: macOS Firewall blocking (pf - packet filter)
   */
  async blockViaMacOSFirewall() {
    if (this.platform !== 'darwin') {
      return { success: false, error: 'macOS only' };
    }

    try {
      // Create pf.conf rule to block Battle.net domains
      const pfRules = this.battlenetDomains.map(domain =>
        `block drop quick from any to ${domain}`
      ).join('\n');

      // This requires root and pf configuration
      // Typically done via /etc/pf.conf

      return {
        success: false,
        error: 'Requires manual pf configuration',
        pfRules,
        instructions: 'Add rules to /etc/pf.conf and run: sudo pfctl -f /etc/pf.conf'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Method 4: DNS blocking via router or local DNS
   */
  getDNSBlockingInfo() {
    return {
      method: 'DNS blocking',
      domains: this.battlenetDomains,
      instructions: {
        router: 'Configure router DNS blacklist with Battle.net domains',
        pihole: 'Add domains to Pi-hole blocklist',
        localDNS: 'Set up local DNS server (dnsmasq) to block domains'
      },
      dnsServers: {
        openDNS: {
          primary: '208.67.222.222',
          secondary: '208.67.220.220',
          familyShield: 'Provides content filtering'
        },
        cloudflare: {
          primary: '1.1.1.1',
          secondary: '1.0.0.1',
          families: '1.1.1.3 (blocks malware and adult content)'
        }
      }
    };
  }

  /**
   * Method 5: Proxy-based blocking
   */
  getProxyBlockingInfo() {
    return {
      method: 'HTTP/HTTPS proxy',
      tools: [
        'Privoxy',
        'Squid',
        'mitmproxy'
      ],
      configuration: {
        privoxy: {
          config: '/etc/privoxy/config',
          blockRule: 'block pattern battle\\.net',
          actionFile: '/etc/privoxy/user.action'
        },
        squid: {
          config: '/etc/squid/squid.conf',
          aclRule: 'acl battlenet dstdomain .battle.net .blizzard.com',
          blockRule: 'http_access deny battlenet'
        }
      },
      systemProxy: {
        windows: 'Settings > Network > Proxy',
        macos: 'System Preferences > Network > Advanced > Proxies',
        linux: 'Network settings or environment variables'
      }
    };
  }

  /**
   * Remove all blocking
   */
  async unblockAll() {
    const results = [];

    // Remove hosts file entries
    try {
      const fs = require('fs').promises;
      const hostsPath = this.platform === 'win32'
        ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
        : '/etc/hosts';

      const existingHosts = await fs.readFile(hostsPath, 'utf8');
      const cleanedHosts = existingHosts.replace(/# Battle\.net Parental Control Block[\s\S]*?(?=\n\n|\n#|\n$)/g, '');

      await fs.writeFile(hostsPath, cleanedHosts);
      results.push({ method: 'hosts file', success: true });
    } catch (error) {
      results.push({ method: 'hosts file', success: false, error: error.message });
    }

    // Remove Windows Firewall rules
    if (this.platform === 'win32') {
      try {
        await execAsync('netsh advfirewall firewall delete rule name="Block Battle.net Launcher"');
        await execAsync('netsh advfirewall firewall delete rule name="Block Battle.net Launcher Inbound"');

        for (const domain of this.battlenetDomains) {
          try {
            await execAsync(`netsh advfirewall firewall delete rule name="Block ${domain}"`);
          } catch (e) {
            // Continue
          }
        }

        results.push({ method: 'Windows Firewall', success: true });
      } catch (error) {
        results.push({ method: 'Windows Firewall', success: false, error: error.message });
      }
    }

    return results;
  }
}

/**
 * CONFIGURATION FILES AND REGISTRY MODULE
 * ========================================
 * Modify Battle.net configuration and registry
 */
class BattleNetConfigManager {

  constructor() {
    this.platform = process.platform;

    this.configPaths = {
      windows: {
        battlenetData: '%APPDATA%\\Battle.net',
        battlenetCache: '%LOCALAPPDATA%\\Battle.net',
        games: '%ProgramData%\\Blizzard Entertainment',
        registry: {
          launcher: 'HKCU\\Software\\Blizzard Entertainment\\Battle.net',
          games: 'HKLM\\SOFTWARE\\Blizzard Entertainment'
        }
      },
      macos: {
        battlenetData: '~/Library/Application Support/Battle.net',
        battlenetCache: '~/Library/Caches/Battle.net',
        battlenetPrefs: '~/Library/Preferences/Battle.net',
        games: '~/Library/Application Support/Blizzard'
      },
      linux: {
        wine: '~/.wine/drive_c/users/USERNAME/AppData/Roaming/Battle.net',
        proton: '~/.steam/steam/steamapps/compatdata/APP_ID/pfx/drive_c/users/steamuser/AppData/Roaming/Battle.net'
      }
    };
  }

  /**
   * Get Battle.net config file locations
   */
  getConfigLocations() {
    return this.configPaths[this.platform === 'win32' ? 'windows' :
                            this.platform === 'darwin' ? 'macos' : 'linux'];
  }

  /**
   * Windows: Read Battle.net registry settings
   */
  async readWindowsRegistry() {
    if (this.platform !== 'win32') {
      return { success: false, error: 'Windows only' };
    }

    try {
      const registryPath = this.configPaths.windows.registry.launcher;
      const { stdout } = await execAsync(`reg query "${registryPath}"`);

      return {
        success: true,
        registry: stdout,
        path: registryPath
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Windows: Modify registry to disable Battle.net
   */
  async disableViaRegistry() {
    if (this.platform !== 'win32') {
      return { success: false, error: 'Windows only' };
    }

    try {
      const registryPath = this.configPaths.windows.registry.launcher;

      // Set LaunchOnStartup to 0
      await execAsync(`reg add "${registryPath}" /v LaunchOnStartup /t REG_DWORD /d 0 /f`);

      // Set AutoLogin to 0
      await execAsync(`reg add "${registryPath}" /v AutoLogin /t REG_DWORD /d 0 /f`);

      return {
        success: true,
        method: 'registry',
        changes: ['LaunchOnStartup=0', 'AutoLogin=0']
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresAdmin: true
      };
    }
  }

  /**
   * Rename/backup Battle.net config to prevent startup
   */
  async disableViaConfigRename() {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      const config = this.getConfigLocations();
      const battlenetDataPath = this.expandPath(config.battlenetData);

      // Check if path exists
      try {
        await fs.access(battlenetDataPath);
      } catch {
        return { success: false, error: 'Battle.net config directory not found' };
      }

      // Rename to .disabled
      const disabledPath = battlenetDataPath + '.disabled';
      await fs.rename(battlenetDataPath, disabledPath);

      return {
        success: true,
        method: 'config rename',
        original: battlenetDataPath,
        renamed: disabledPath
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restore renamed config
   */
  async restoreConfig() {
    try {
      const fs = require('fs').promises;

      const config = this.getConfigLocations();
      const battlenetDataPath = this.expandPath(config.battlenetData);
      const disabledPath = battlenetDataPath + '.disabled';

      // Check if disabled path exists
      try {
        await fs.access(disabledPath);
      } catch {
        return { success: false, error: 'No disabled config found' };
      }

      // Rename back
      await fs.rename(disabledPath, battlenetDataPath);

      return {
        success: true,
        method: 'config restore',
        restored: battlenetDataPath
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Expand environment variables in path
   */
  expandPath(pathStr) {
    if (this.platform === 'win32') {
      return pathStr.replace(/%([^%]+)%/g, (_, n) => process.env[n]);
    } else {
      return pathStr.replace(/~/g, process.env.HOME);
    }
  }
}

/**
 * EXPORT ALL MODULES
 */
module.exports = {
  BATTLENET_PROCESSES,
  BattleNetProcessDetector,
  BattleNetProcessController,
  BattleNetNetworkBlocker,
  BattleNetConfigManager
};

/**
 * USAGE EXAMPLES
 * ==============
 */

// Example 1: Detect running Battle.net processes
async function example1_detectProcesses() {
  const detector = new BattleNetProcessDetector();
  const processes = await detector.detectProcesses();

  console.log('Detected Battle.net processes:', processes);
  console.log('Total processes:', processes.length);
  console.log('Launcher running:', processes.some(p => p.type === 'launcher'));
  console.log('Games running:', processes.filter(p => p.type !== 'launcher'));
}

// Example 2: Monitor processes continuously
async function example2_monitorProcesses() {
  const detector = new BattleNetProcessDetector();

  detector.startMonitoring((status) => {
    if (status.active) {
      console.log(`Battle.net is active! Running processes: ${status.count}`);
      console.log('Processes:', status.processes.map(p => `${p.name} (${p.type})`));
    } else {
      console.log('Battle.net is not running');
    }
  }, 5000); // Check every 5 seconds
}

// Example 3: Terminate all Battle.net processes
async function example3_terminateAll() {
  const detector = new BattleNetProcessDetector();
  const controller = new BattleNetProcessController(detector);

  const result = await controller.terminateAllProcesses({
    force: false,  // Try graceful first
    gracePeriod: 5000,
    includeLauncher: true,
    includeGames: true
  });

  console.log(`Terminated ${result.terminated} of ${result.total} processes`);
  console.log('Results:', result.results);
}

// Example 4: Terminate specific game
async function example4_terminateGame() {
  const detector = new BattleNetProcessDetector();
  const controller = new BattleNetProcessController(detector);

  const result = await controller.terminateGame('World of Warcraft', {
    force: true
  });

  console.log('Game termination result:', result);
}

// Example 5: Block Battle.net via hosts file
async function example5_blockHosts() {
  const blocker = new BattleNetNetworkBlocker();
  const result = await blocker.blockViaHostsFile();

  console.log('Hosts file blocking:', result);
}

// Example 6: Block via Windows Firewall
async function example6_blockFirewall() {
  const blocker = new BattleNetNetworkBlocker();
  const result = await blocker.blockViaWindowsFirewall();

  console.log('Firewall blocking:', result);
}

// Example 7: Disable Battle.net startup
async function example7_disableStartup() {
  const controller = new BattleNetProcessController();
  const result = await controller.blockLauncherStartup();

  console.log('Startup blocking:', result);
}

// Example 8: Comprehensive parental control
async function example8_comprehensiveControl() {
  const detector = new BattleNetProcessDetector();
  const controller = new BattleNetProcessController(detector);
  const blocker = new BattleNetNetworkBlocker();
  const configMgr = new BattleNetConfigManager();

  console.log('=== Implementing Battle.net Parental Controls ===');

  // Step 1: Terminate all running processes
  console.log('\n1. Terminating running processes...');
  const termResult = await controller.terminateAllProcesses({ force: true });
  console.log(`   Terminated: ${termResult.terminated}/${termResult.total}`);

  // Step 2: Block network access
  console.log('\n2. Blocking network access...');
  const hostsResult = await blocker.blockViaHostsFile();
  console.log(`   Hosts file: ${hostsResult.success ? 'Blocked' : 'Failed'}`);

  // Step 3: Disable startup
  console.log('\n3. Disabling startup...');
  const startupResult = await controller.blockLauncherStartup();
  console.log(`   Startup: ${startupResult.success ? 'Disabled' : 'Failed'}`);

  // Step 4: Disable via registry (Windows)
  if (process.platform === 'win32') {
    console.log('\n4. Modifying registry...');
    const regResult = await configMgr.disableViaRegistry();
    console.log(`   Registry: ${regResult.success ? 'Modified' : 'Failed'}`);
  }

  console.log('\n=== Battle.net parental controls active ===');
}
