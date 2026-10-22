// ==UserScript==
// @name         Crunchyroll Enhancer
// @namespace    https://github.com/Gakai/Crunchyroll-Enhancer-UserScript
// @version      0.3.1
// @description  Enhancements for Crunchyroll
// @author       Gakai
// @downloadURL  https://raw.githubusercontent.com/Gakai/Crunchyroll-Enhancer-UserScript/main/dist/crunchyroll-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/Gakai/Crunchyroll-Enhancer-UserScript/main/dist/crunchyroll-enhancer.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crunchyroll.com
// @match        *://*.crunchyroll.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
"use strict";
(() => {
  // src/config.ts
  var CARD_SELECTOR = ".erc-my-lists-item";
  var CARD_SUBTITLE_SELECTOR = ".watchlist-card-subtitle--IROsU";
  var CLOSING_CAROUSEL_X_SELECTOR = ".end-slate-carousel-close__icon--7lQUO";
  var READY = {
    styles: {
      subtitle: {
        color: "red"
      }
    },
    texts: {
      en: ["Up Next:", "Start Watching"],
      de: ["Als N\xE4chstes:", "Jetzt anschauen"],
      fr: ["\xC0 suivre:", "Lecture"],
      it: ["Successivo:", "Inizia a guardare"],
      es: ["Siguiente:", "Comenzar a ver"]
    }
  };
  var CONTINUE = {
    styles: {
      subtitle: {
        color: "orange"
      }
    },
    texts: {
      en: ["Continue:"],
      de: ["Fortsetzen:"],
      fr: ["Reprendre:"],
      it: ["Continua:"],
      es: ["Continuar:"]
    }
  };
  var FINISHED = {
    styles: {
      card: {
        opacity: "0.3"
      }
    },
    texts: {
      en: ["Watch Again:", "Up Next: E0"],
      de: ["Erneut anschauen:", "Als N\xE4chstes: E0"],
      fr: ["Regarder \xE0 nouveau:", "\xC0 suivre: E0"],
      it: ["Guarda di nuovo:", "Successivo: E0"],
      es: ["Ver de nuevo:", "Siguiente: E0"]
    }
  };

  // src/MutationListener.ts
  var MutationListener = class {
    constructor(target, options) {
      this.recordListeners = /* @__PURE__ */ new Map();
      this.nodeListeners = /* @__PURE__ */ new Map();
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const { addedNodes, removedNodes, type } = mutation;
          for (const callback of this.recordListeners.get(type) ?? []) {
            callback(mutation);
          }
          for (const node of addedNodes) {
            for (const callback of this.nodeListeners.get("added") ?? []) {
              callback(node);
            }
          }
          for (const node of removedNodes) {
            for (const callback of this.nodeListeners.get("removed") ?? []) {
              callback(node);
            }
          }
        }
      });
      this.observer.observe(target, options);
    }
    stop() {
      this.observer.disconnect();
    }
    on(event, callback) {
      switch (event) {
        case "added":
        case "removed":
          this.nodeListeners.getOrInsert(event, new Array()).push(callback);
          break;
        case "attributes":
        case "characterData":
        case "childList":
          this.recordListeners.getOrInsert(event, new Array()).push(callback);
          break;
      }
      return this;
    }
    off(event, callback) {
      const recordCallbacks = this.recordListeners.get(event);
      if (recordCallbacks) {
        recordCallbacks.splice(
          recordCallbacks.indexOf(callback),
          1
        );
      }
      const nodeCallbacks = this.nodeListeners.get(event);
      if (nodeCallbacks) {
        nodeCallbacks.splice(
          nodeCallbacks.indexOf(callback),
          1
        );
      }
      return this;
    }
    [Symbol.dispose]() {
      this.destroy();
    }
    destroy() {
      this.stop();
      this.recordListeners.clear();
      this.nodeListeners.clear();
    }
  };

  // src/main.ts
  var STATE = {
    CONTINUE,
    FINISHED,
    READY
  };
  function getLanguage() {
    const language2 = navigator.language.split("-")[0];
    if (language2 && language2 in READY.texts) {
      return language2;
    }
    return "en";
  }
  function getState(subtitle, language2) {
    for (const state of Object.values(STATE)) {
      const texts = state.texts[language2];
      if (texts?.some((t) => subtitle.textContent?.startsWith(t))) {
        return state;
      }
    }
    return void 0;
  }
  function styleCard({ card, subtitle }, styles) {
    card && Object.assign(card.style, styles.card);
    subtitle && Object.assign(subtitle.style, styles.subtitle);
  }
  var language = getLanguage();
  var listener = new MutationListener(document.body, {
    childList: true,
    subtree: true
  });
  listener.on("added", (node) => {
    if (node instanceof HTMLElement) {
      const subtitles = node.querySelectorAll(CARD_SUBTITLE_SELECTOR);
      for (const subtitle of subtitles) {
        const card = subtitle.closest(CARD_SELECTOR);
        const state = getState(subtitle, language);
        if (state && card instanceof HTMLElement && subtitle instanceof HTMLElement) {
          styleCard({ card, subtitle }, state.styles);
          continue;
        }
      }
    }
  });
  var CAROUSEL_CLOSE_RETRY_INTERVAL_MS = 200;
  var MAX_CAROUSEL_CLOSE_ATTEMPTS = 25;
  var carouselCloseTimer;
  function closeCarouselX(node) {
    if (!(node instanceof HTMLElement)) return;
    const xButton = node.matches(CLOSING_CAROUSEL_X_SELECTOR) ? node : node.querySelector(CLOSING_CAROUSEL_X_SELECTOR);
    if (!xButton) return;
    xButton.click();
    if (carouselCloseTimer) return;
    let attempts = 0;
    const timer = setInterval(() => {
      const currentXButton = document.querySelector(
        CLOSING_CAROUSEL_X_SELECTOR
      );
      if (!currentXButton || attempts >= MAX_CAROUSEL_CLOSE_ATTEMPTS) {
        clearInterval(timer);
        carouselCloseTimer = void 0;
        return;
      }
      attempts += 1;
      currentXButton.click();
    }, CAROUSEL_CLOSE_RETRY_INTERVAL_MS);
    carouselCloseTimer = timer;
  }
  document.querySelectorAll(CLOSING_CAROUSEL_X_SELECTOR).forEach((xButton) => xButton.click());
  listener.on("added", closeCarouselX);
  console.log("Crunchyroll Watchlist Enhancer loaded");
})();
//# sourceMappingURL=crunchyroll-enhancer.user.js.map
