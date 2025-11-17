// LaTeX Equation Fixer - Options Page Script
// Version 2.1 - Settings Management

// Default settings
const DEFAULT_SETTINGS = {
  // General
  enableAutoConvert: true,
  showFloatingButton: true,
  showNotifications: true,
  notificationDuration: 3,
  enableDebugLogging: false,

  // Sites
  siteGoogleDocs: true,
  siteMicrosoftWord: true,

  // Conversion
  convertInlineMath: true,
  convertDisplayMath: true,
  convertAlternativeDelimiters: true,
  smartDetection: true,

  // Custom mappings (for enhancement #20)
  customMappings: {},

  // Statistics (for enhancement #21)
  statistics: {
    totalConversions: 0,
    successfulConversions: 0,
    failedConversions: 0,
    symbolUsage: {},
    history: []
  }
};

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    const settings = result.settings || DEFAULT_SETTINGS;

    // Merge with defaults to handle new settings
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('[Options] Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to storage
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set({ settings });
    return true;
  } catch (error) {
    console.error('[Options] Error saving settings:', error);
    return false;
  }
}

// Populate UI with current settings
function populateUI(settings) {
  // General settings
  document.getElementById('enableAutoConvert').checked = settings.enableAutoConvert;
  document.getElementById('showFloatingButton').checked = settings.showFloatingButton;
  document.getElementById('showNotifications').checked = settings.showNotifications;
  document.getElementById('notificationDuration').value = settings.notificationDuration;
  document.getElementById('enableDebugLogging').checked = settings.enableDebugLogging;

  // Site settings
  document.getElementById('siteGoogleDocs').checked = settings.siteGoogleDocs;
  document.getElementById('siteMicrosoftWord').checked = settings.siteMicrosoftWord;

  // Conversion settings
  document.getElementById('convertInlineMath').checked = settings.convertInlineMath;
  document.getElementById('convertDisplayMath').checked = settings.convertDisplayMath;
  document.getElementById('convertAlternativeDelimiters').checked = settings.convertAlternativeDelimiters;
  document.getElementById('smartDetection').checked = settings.smartDetection;

  // Custom mappings (Enhancement #20)
  populateCustomMappings(settings.customMappings || {});
}

// Get settings from UI
function getSettingsFromUI() {
  return {
    // General
    enableAutoConvert: document.getElementById('enableAutoConvert').checked,
    showFloatingButton: document.getElementById('showFloatingButton').checked,
    showNotifications: document.getElementById('showNotifications').checked,
    notificationDuration: parseInt(document.getElementById('notificationDuration').value),
    enableDebugLogging: document.getElementById('enableDebugLogging').checked,

    // Sites
    siteGoogleDocs: document.getElementById('siteGoogleDocs').checked,
    siteMicrosoftWord: document.getElementById('siteMicrosoftWord').checked,

    // Conversion
    convertInlineMath: document.getElementById('convertInlineMath').checked,
    convertDisplayMath: document.getElementById('convertDisplayMath').checked,
    convertAlternativeDelimiters: document.getElementById('convertAlternativeDelimiters').checked,
    smartDetection: document.getElementById('smartDetection').checked,

    // Preserve custom mappings and statistics (Enhancement #20)
    customMappings: getCustomMappingsFromUI(),
    statistics: {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      symbolUsage: {},
      history: []
    }
  };
}

// Show status message
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type} show`;

  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 3000);
}

// Save button handler
document.getElementById('saveBtn').addEventListener('click', async () => {
  const settings = getSettingsFromUI();

  // Preserve existing custom mappings and statistics
  const currentSettings = await loadSettings();
  settings.customMappings = currentSettings.customMappings || {};
  settings.statistics = currentSettings.statistics || DEFAULT_SETTINGS.statistics;

  const success = await saveSettings(settings);

  if (success) {
    showStatus('✅ Settings saved successfully!', 'success');

    // Notify content scripts to reload settings
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && (tab.url.includes('docs.google.com') || tab.url.includes('office.com'))) {
          chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings }).catch(() => {
            // Tab might not have content script, ignore error
          });
        }
      }
    } catch (error) {
      console.error('[Options] Error notifying tabs:', error);
    }
  } else {
    showStatus('❌ Error saving settings', 'error');
  }
});

// =======================
// ENHANCEMENT #20: Custom LaTeX Mappings
// =======================

let customMappingsData = {};

// Create a mapping item UI element
function createMappingItem(latexCommand = '', unicodeValue = '') {
  const item = document.createElement('div');
  item.className = 'mapping-item';

  item.innerHTML = `
    <input type="text" class="mapping-input latex-input" placeholder="\\command" value="${latexCommand}">
    <span class="mapping-arrow">→</span>
    <input type="text" class="mapping-input unicode-input" placeholder="Unicode or text" value="${unicodeValue}">
    <button class="btn-remove" type="button">×</button>
  `;

  // Add remove handler
  item.querySelector('.btn-remove').addEventListener('click', () => {
    item.remove();
  });

  return item;
}

// Populate custom mappings in UI
function populateCustomMappings(mappings) {
  const container = document.getElementById('customMappingsContainer');
  container.innerHTML = '';

  customMappingsData = mappings || {};

  // Add existing mappings
  for (const [latex, unicode] of Object.entries(customMappingsData)) {
    container.appendChild(createMappingItem(latex, unicode));
  }

  // Add one empty mapping if no mappings exist
  if (Object.keys(customMappingsData).length === 0) {
    container.appendChild(createMappingItem());
  }
}

// Get custom mappings from UI
function getCustomMappingsFromUI() {
  const mappings = {};
  const items = document.querySelectorAll('.mapping-item');

  items.forEach(item => {
    const latex = item.querySelector('.latex-input').value.trim();
    const unicode = item.querySelector('.unicode-input').value.trim();

    if (latex && unicode) {
      // Ensure latex command starts with backslash
      const latexKey = latex.startsWith('\\') ? latex : '\\' + latex;
      mappings[latexKey] = unicode;
    }
  });

  return mappings;
}

// Add mapping button handler
document.getElementById('addMappingBtn').addEventListener('click', () => {
  const container = document.getElementById('customMappingsContainer');
  container.appendChild(createMappingItem());
});

// Import mappings button handler
document.getElementById('importMappingsBtn').addEventListener('click', () => {
  document.getElementById('importFileInput').click();
});

// Handle file import
document.getElementById('importFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedMappings = JSON.parse(text);

    // Validate format
    if (typeof importedMappings !== 'object') {
      showStatus('❌ Invalid file format', 'error');
      return;
    }

    // Merge with existing mappings
    const currentMappings = getCustomMappingsFromUI();
    const mergedMappings = { ...currentMappings, ...importedMappings };

    populateCustomMappings(mergedMappings);
    showStatus(`✅ Imported ${Object.keys(importedMappings).length} mappings`, 'success');
  } catch (error) {
    console.error('[Options] Import error:', error);
    showStatus('❌ Error importing file', 'error');
  }

  // Reset file input
  e.target.value = '';
});

// Export mappings button handler
document.getElementById('exportMappingsBtn').addEventListener('click', () => {
  const mappings = getCustomMappingsFromUI();

  if (Object.keys(mappings).length === 0) {
    showStatus('⚠️ No mappings to export', 'error');
    return;
  }

  // Create JSON file and download
  const json = JSON.stringify(mappings, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'latex-mappings.json';
  a.click();

  URL.revokeObjectURL(url);
  showStatus(`✅ Exported ${Object.keys(mappings).length} mappings`, 'success');
});

// Reset button handler
document.getElementById('resetBtn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    const success = await saveSettings(DEFAULT_SETTINGS);

    if (success) {
      populateUI(DEFAULT_SETTINGS);
      showStatus('🔄 Settings reset to defaults', 'success');
    } else {
      showStatus('❌ Error resetting settings', 'error');
    }
  }
});

// Initialize
(async function init() {
  const settings = await loadSettings();
  populateUI(settings);

  console.log('[Options] Loaded settings:', settings);
})();
