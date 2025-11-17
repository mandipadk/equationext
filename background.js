// LaTeX Equation Fixer - Background Service Worker
// Version 2.1 - Handles keyboard shortcuts, context menu, and settings

// ===================================================================
// ENHANCEMENT #19: Context Menu Integration
// ===================================================================

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-latex",
    title: "Convert LaTeX to Unicode",
    contexts: ["selection"],
    documentUrlPatterns: [
      "https://docs.google.com/*",
      "https://www.office.com/*",
      "https://*.officeapps.live.com/*"
    ]
  });

  console.log('[Background] Extension installed, context menu created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-latex" && info.selectionText) {
    // Send message to content script to convert the selected text
    chrome.tabs.sendMessage(tab.id, {
      type: 'CONVERT_SELECTION',
      text: info.selectionText
    }).catch(error => {
      console.error('[Background] Error sending message to content script:', error);
    });
  }
});

// ===================================================================
// ENHANCEMENT #17: Keyboard Shortcuts
// ===================================================================

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('[Background] Command received:', command);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    console.error('[Background] No active tab found');
    return;
  }

  switch (command) {
    case 'convert-selection':
      // Trigger conversion of selected text
      chrome.tabs.sendMessage(tab.id, {
        type: 'CONVERT_SELECTION_SHORTCUT'
      }).catch(error => {
        console.error('[Background] Error sending convert command:', error);
      });
      break;

    case 'toggle-auto-convert':
      // Toggle auto-conversion setting
      try {
        const result = await chrome.storage.sync.get('settings');
        const settings = result.settings || {};

        settings.enableAutoConvert = !settings.enableAutoConvert;

        await chrome.storage.sync.set({ settings });

        // Notify content script
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings
        }).catch(() => {});

        // Show badge to indicate state
        chrome.action.setBadgeText({
          text: settings.enableAutoConvert ? 'ON' : 'OFF',
          tabId: tab.id
        });

        chrome.action.setBadgeBackgroundColor({
          color: settings.enableAutoConvert ? '#4CAF50' : '#f44336',
          tabId: tab.id
        });

        // Clear badge after 2 seconds
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '', tabId: tab.id });
        }, 2000);

        console.log('[Background] Auto-convert toggled:', settings.enableAutoConvert);
      } catch (error) {
        console.error('[Background] Error toggling auto-convert:', error);
      }
      break;
  }
});

// ===================================================================
// Settings Management
// ===================================================================

// Listen for settings requests from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SETTINGS') {
    chrome.storage.sync.get('settings').then(result => {
      sendResponse({ settings: result.settings || {} });
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'UPDATE_STATISTICS') {
    // Update conversion statistics (enhancement #21)
    chrome.storage.sync.get('settings').then(result => {
      const settings = result.settings || {};
      if (!settings.statistics) {
        settings.statistics = {
          totalConversions: 0,
          successfulConversions: 0,
          failedConversions: 0,
          symbolUsage: {},
          history: []
        };
      }

      // Update statistics
      settings.statistics.totalConversions++;

      if (request.success) {
        settings.statistics.successfulConversions++;

        // Update symbol usage
        if (request.symbols) {
          request.symbols.forEach(symbol => {
            settings.statistics.symbolUsage[symbol] = (settings.statistics.symbolUsage[symbol] || 0) + 1;
          });
        }

        // Add to history (keep last 10)
        settings.statistics.history.unshift({
          timestamp: new Date().toISOString(),
          input: request.input,
          output: request.output,
          success: true
        });

        if (settings.statistics.history.length > 10) {
          settings.statistics.history = settings.statistics.history.slice(0, 10);
        }
      } else {
        settings.statistics.failedConversions++;
      }

      chrome.storage.sync.set({ settings });
      sendResponse({ success: true });
    });
    return true;
  }
});

// ===================================================================
// Initialization
// ===================================================================

console.log('[Background] Service worker initialized');
