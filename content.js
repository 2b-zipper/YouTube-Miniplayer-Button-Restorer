// YouTube Miniplayer Button Restorer
// Adds a miniplayer button to the YouTube player controls

(function() {
  'use strict';

  // Cross-browser compatibility
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  const SELECTORS = {
    RIGHT_CONTROLS: '.ytp-right-controls',
    RIGHT_CONTROLS_RIGHT: '.ytp-right-controls-right',
    SETTINGS_BUTTON: '.ytp-settings-button',
    SIZE_BUTTON: '.ytp-size-button',
    MINIPLAYER_BUTTON: '.ytp-miniplayer-button'
  };

  // YouTube's official miniplayer icon paths
  const ICONS = {
    new: 'M21.20 3.01C21.66 3.05 22.08 3.26 22.41 3.58C22.73 3.91 22.94 4.33 22.98 4.79L23 5V19C23.00 19.49 22.81 19.97 22.48 20.34C22.15 20.70 21.69 20.93 21.20 20.99L21 21H3L2.79 20.99C2.30 20.93 1.84 20.70 1.51 20.34C1.18 19.97 .99 19.49 1 19V13H3V19H21V5H11V3H21L21.20 3.01ZM1.29 3.29C1.10 3.48 1.00 3.73 1.00 4C1.00 4.26 1.10 4.51 1.29 4.70L5.58 9H3C2.73 9 2.48 9.10 2.29 9.29C2.10 9.48 2 9.73 2 10C2 10.26 2.10 10.51 2.29 10.70C2.48 10.89 2.73 11 3 11H9V5C9 4.73 8.89 4.48 8.70 4.29C8.51 4.10 8.26 4 8 4C7.73 4 7.48 4.10 7.29 4.29C7.10 4.48 7 4.73 7 5V7.58L2.70 3.29C2.51 3.10 2.26 3.00 2 3.00C1.73 3.00 1.48 3.10 1.29 3.29ZM19.10 11.00L19 11H12L11.89 11.00C11.66 11.02 11.45 11.13 11.29 11.29C11.13 11.45 11.02 11.66 11.00 11.89L11 12V17C10.99 17.24 11.09 17.48 11.25 17.67C11.42 17.85 11.65 17.96 11.89 17.99L12 18H19L19.10 17.99C19.34 17.96 19.57 17.85 19.74 17.67C19.90 17.48 20.00 17.24 20 17V12L19.99 11.89C19.97 11.66 19.87 11.45 19.70 11.29C19.54 11.13 19.33 11.02 19.10 11.00ZM13 16V13H18V16H13Z',
    old: 'M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z'
  };

  const isNewUI = () => !!document.querySelector(SELECTORS.RIGHT_CONTROLS_RIGHT);

  const toggleMiniplayer = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'i',
      code: 'KeyI',
      keyCode: 73,
      bubbles: true,
      cancelable: true
    }));
  };

  function createButton(isNew) {
    const text = browserAPI.i18n.getMessage('miniplayerButton');
    const shortText = browserAPI.i18n.getMessage('miniplayerButtonShort');
    
    const button = document.createElement('button');
    button.className = 'ytp-button ytp-miniplayer-button';
    button.setAttribute('title', text);
    button.setAttribute('aria-label', text);
    button.setAttribute('data-tooltip-title', text);
    button.setAttribute('data-title-no-tooltip', shortText);
    button.setAttribute('aria-keyshortcuts', 'i');
    
    if (isNew) {
      button.setAttribute('data-priority', '11');
      button.innerHTML = `<svg fill="none" height="24" viewBox="0 0 24 24" width="24">
        <path d="${ICONS.new}" fill="white"></path>
      </svg>`;
    } else {
      button.innerHTML = `<svg version="1.1" viewBox="0 0 36 36" height="100%" width="100%">
        <use class="ytp-svg-shadow" xlink:href="#ytp-id-miniplayer"></use>
        <path id="ytp-id-miniplayer" d="${ICONS.old}" fill="#fff"></path>
      </svg>`;
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMiniplayer();
    });

    return button;
  }

  function insertButton() {
    const isNew = isNewUI();
    const container = document.querySelector(isNew ? SELECTORS.RIGHT_CONTROLS_RIGHT : SELECTORS.RIGHT_CONTROLS);
    
    if (!container || container.querySelector(SELECTORS.MINIPLAYER_BUTTON)) return;

    const referenceButton = container.querySelector(isNew ? SELECTORS.SIZE_BUTTON : SELECTORS.SETTINGS_BUTTON);
    if (!referenceButton) return;

    const button = createButton(isNew);
    
    if (isNew) {
      referenceButton.parentNode.insertBefore(button, referenceButton);
    } else {
      referenceButton.parentNode.insertBefore(button, referenceButton.nextSibling);
    }
  }

  function init() {
    // Observe player controls
    new MutationObserver(() => {
      if (document.querySelector(SELECTORS.RIGHT_CONTROLS)) insertButton();
    }).observe(document.body, { childList: true, subtree: true });

    // Observe URL changes (YouTube is SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(insertButton, 1000);
      }
    }).observe(document, { childList: true, subtree: true });

    insertButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
