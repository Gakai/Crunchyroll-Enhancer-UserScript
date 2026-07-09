// ==UserScript==
// @name         Crunchyroll Enhancer
// @namespace    https://github.com/Gakai/Crunchyroll-Enhancer-UserScript
// @version      0.1.0
// @description  Enhancements for Crunchyroll
// @author       Gakai
// @downloadURL  https://raw.githubusercontent.com/Gakai/Crunchyroll-Enhancer-UserScript/main/dist/crunchyroll-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/Gakai/Crunchyroll-Enhancer-UserScript/main/dist/crunchyroll-enhancer.user.js
// @match        *://*.crunchyroll.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
    'use strict';

    const CARD_SELECTOR = ".erc-my-lists-item";
    const CARD_SUBTITLE_SELECTOR = ".watchlist-card-subtitle--IROsU";
    // cSpell:disable
    const READY = {
        style: {
            color: "red",
        },
        texts: {
            en: ["Up Next:", "Start Watching"],
            de: ["Als Nächstes:", "Jetzt anschauen"],
            fr: ["À suivre:", "Lecture"],
            it: ["Successivo:", "Inizia a guardare"],
            es: ["Siguiente:", "Comenzar a ver"],
        },
    };
    const FINISHED = {
        style: {
            opacity: "0.3",
        },
        texts: {
            en: ["Watch Again:", "Up Next: E0"],
            de: ["Erneut anschauen:", "Als Nächstes: E0"],
            fr: ["Regarder à nouveau:", "À suivre: E0"],
            it: ["Guarda di nuovo:", "Successivo: E0"],
            es: ["Ver de nuevo:", "Siguiente: E0"],
        },
    };
    // cSpell:enable

    class MutationListener {
        constructor(target, options) {
            this.recordListeners = new Map();
            this.nodeListeners = new Map();
            this.observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    const { addedNodes, removedNodes, type } = mutation;
                    for (const callback of this.recordListeners.get(type) ?? []) {
                        callback(mutation);
                    }
                    for (const node of addedNodes) {
                        for (const callback of this.nodeListeners.get("added") ??
                            []) {
                            callback(node);
                        }
                    }
                    for (const node of removedNodes) {
                        for (const callback of this.nodeListeners.get("removed") ??
                            []) {
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
                    this.nodeListeners
                        .getOrInsert(event, new Array())
                        .push(callback);
                    break;
                case "attributes":
                case "characterData":
                case "childList":
                    this.recordListeners
                        .getOrInsert(event, new Array())
                        .push(callback);
                    break;
            }
            return this;
        }
        off(event, callback) {
            const recordCallbacks = this.recordListeners.get(event);
            if (recordCallbacks) {
                recordCallbacks.splice(recordCallbacks.indexOf(callback), 1);
            }
            const nodeCallbacks = this.nodeListeners.get(event);
            if (nodeCallbacks) {
                nodeCallbacks.splice(nodeCallbacks.indexOf(callback), 1);
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
    }

    function getLanguage() {
        const language = navigator.language.split("-")[0];
        if (language && language in READY.texts) {
            return language;
        }
        return "en";
    }
    function styleReady(card) {
        Object.assign(card.style, READY.style);
    }
    function styleFinished(card) {
        Object.assign(card.style, FINISHED.style);
    }
    const language = getLanguage();
    const listener = new MutationListener(document.body, {
        childList: true,
        subtree: true,
    });
    listener.on("added", (node) => {
        if (node instanceof HTMLElement) {
            const cardSubtitles = node.querySelectorAll(CARD_SUBTITLE_SELECTOR);
            for (const cardSubtitle of cardSubtitles) {
                const card = cardSubtitle.closest(CARD_SELECTOR);
                // Finished for now: should be dimmed
                const finishedTexts = FINISHED.texts[language];
                if (finishedTexts?.some((t) => cardSubtitle.textContent?.startsWith(t))) {
                    if (card instanceof HTMLElement) {
                        styleFinished(card);
                    }
                    continue;
                }
                // Up Next / Start Watching: should be red
                const readyTexts = READY.texts[language];
                if (readyTexts?.some((t) => cardSubtitle.textContent?.startsWith(t))) {
                    if (cardSubtitle instanceof HTMLElement) {
                        styleReady(cardSubtitle);
                    }
                }
            }
        }
    });
    console.log("Crunchyroll Watchlist Enhancer loaded");

})();
//# sourceMappingURL=crunchyroll-enhancer.user.js.map
