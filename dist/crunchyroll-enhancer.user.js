// ==UserScript==
// @name         Crunchyroll Enhancer
// @namespace    https://github.com/Gakai/Crunchyroll-Enhancer-UserScript
// @version      0.2.0
// @description  Enhancements for Crunchyroll
// @author       Gakai
// @downloadURL  https://raw.githubusercontent.com/Gakai/Crunchyroll-Enhancer-UserScript/main/dist/crunchyroll-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/Gakai/Crunchyroll-Enhancer-UserScript/main/dist/crunchyroll-enhancer.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crunchyroll.com
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
        styles: {
            subtitle: {
                color: "red",
            },
        },
        texts: {
            en: ["Up Next:", "Start Watching"],
            de: ["Als Nächstes:", "Jetzt anschauen"],
            fr: ["À suivre:", "Lecture"],
            it: ["Successivo:", "Inizia a guardare"],
            es: ["Siguiente:", "Comenzar a ver"],
        },
    };
    const CONTINUE = {
        styles: {
            subtitle: {
                color: "orange",
            },
        },
        texts: {
            en: ["Continue:"],
            de: ["Fortsetzen:"],
            fr: ["Reprendre:"],
            it: ["Continua:"],
            es: ["Continuar:"],
        },
    };
    const FINISHED = {
        styles: {
            card: {
                opacity: "0.3",
            },
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

    // Order matters: we want to style the most specific state first
    const STATE = {
        CONTINUE,
        FINISHED,
        READY,
    };
    function getLanguage() {
        const language = navigator.language.split("-")[0];
        if (language && language in READY.texts) {
            return language;
        }
        return "en";
    }
    function getState(subtitle, language) {
        for (const state of Object.values(STATE)) {
            const texts = state.texts[language];
            if (texts?.some((t) => subtitle.textContent?.startsWith(t))) {
                return state;
            }
        }
        return undefined;
    }
    function styleCard({ card, subtitle }, styles) {
        card && Object.assign(card.style, styles.card);
        subtitle && Object.assign(subtitle.style, styles.subtitle);
    }
    const language = getLanguage();
    const listener = new MutationListener(document.body, {
        childList: true,
        subtree: true,
    });
    listener.on("added", (node) => {
        if (node instanceof HTMLElement) {
            const subtitles = node.querySelectorAll(CARD_SUBTITLE_SELECTOR);
            for (const subtitle of subtitles) {
                const card = subtitle.closest(CARD_SELECTOR);
                const state = getState(subtitle, language);
                if (state &&
                    card instanceof HTMLElement &&
                    subtitle instanceof HTMLElement) {
                    styleCard({ card, subtitle }, state.styles);
                    continue;
                }
            }
        }
    });
    console.log("Crunchyroll Watchlist Enhancer loaded");

})();
//# sourceMappingURL=crunchyroll-enhancer.user.js.map
