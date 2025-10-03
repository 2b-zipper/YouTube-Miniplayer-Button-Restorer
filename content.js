// YouTube Miniplayer Button Restorer
// Adds a miniplayer button between the settings button and theater mode button

(function() {
  'use strict';

  const SELECTORS = {
    PLAYER: '#movie_player',
    RIGHT_CONTROLS: '.ytp-right-controls',
    SETTINGS_BUTTON: '.ytp-settings-button',
    MINIPLAYER_BUTTON: '.ytp-miniplayer-button'
  };

  function getLocalizedText() {
    return {
      title: chrome.i18n.getMessage('miniplayerButton'),
      ariaLabel: chrome.i18n.getMessage('miniplayerButton'),
      tooltipTitle: chrome.i18n.getMessage('miniplayerButton'),
      titleNoTooltip: chrome.i18n.getMessage('miniplayerButtonShort')
    };
  }

  const BUTTON_CONFIG = {
    className: 'ytp-button ytp-miniplayer-button',
    keyboardShortcut: 'i'
  };

  const SVG_ICON = `
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <use class="ytp-svg-shadow" href="#ytp-id-miniplayer"></use>
      <path fill="#fff" id="ytp-id-miniplayer" 
        d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z">
      </path>
    </svg>
  `;

  function toggleMiniplayer() {
    const player = document.querySelector(SELECTORS.PLAYER);
    
    if (player && typeof player.toggleMiniplayer === 'function') {
      player.toggleMiniplayer();
      return;
    }

    // Fallback: simulate 'i' key press
    const keyEvent = new KeyboardEvent('keydown', {
      key: BUTTON_CONFIG.keyboardShortcut,
      code: 'KeyI',
      keyCode: 73,
      which: 73,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(keyEvent);
  }

  function createMiniplayerButton() {
    const localizedText = getLocalizedText();
    const button = document.createElement('button');
    button.className = BUTTON_CONFIG.className;
    button.setAttribute('title', localizedText.title);
    button.setAttribute('aria-label', localizedText.ariaLabel);
    button.setAttribute('data-tooltip-title', localizedText.tooltipTitle);
    button.setAttribute('data-title-no-tooltip', localizedText.titleNoTooltip);
    button.setAttribute('aria-keyshortcuts', BUTTON_CONFIG.keyboardShortcut);
    button.innerHTML = SVG_ICON;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMiniplayer();
    });

    return button;
  }

  function insertMiniplayerButton() {
    const rightControls = document.querySelector(SELECTORS.RIGHT_CONTROLS);
    if (!rightControls) return false;

    if (rightControls.querySelector(SELECTORS.MINIPLAYER_BUTTON)) {
      return true;
    }

    const settingsButton = rightControls.querySelector(SELECTORS.SETTINGS_BUTTON);
    if (!settingsButton) return false;

    const miniplayerButton = createMiniplayerButton();
    settingsButton.parentNode.insertBefore(miniplayerButton, settingsButton.nextSibling);
    
    console.log('YouTube Miniplayer Button: Added');
    return true;
  }

  function observePlayerControls() {
    const observer = new MutationObserver(() => {
      const rightControls = document.querySelector(SELECTORS.RIGHT_CONTROLS);
      const settingsButton = document.querySelector(SELECTORS.SETTINGS_BUTTON);

      if (rightControls && settingsButton) {
        if (insertMiniplayerButton()) {
          console.log('YouTube Miniplayer Button: Initialized');
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Try to insert immediately if player already exists
    if (document.querySelector(SELECTORS.RIGHT_CONTROLS)) {
      insertMiniplayerButton();
    }
  }

  function observeURLChanges() {
    let lastUrl = location.href;
    
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(insertMiniplayerButton, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  function initialize() {
    observePlayerControls();
    observeURLChanges();
  }

  // Start extension
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
