import {
    CARD_SELECTOR,
    CARD_SUBTITLE_SELECTOR,
    FINISHED,
    READY,
} from "./config.js";
import { MutationListener } from "./MutationListener.js";

function getLanguage(): keyof typeof READY.texts {
    const language = navigator.language.split("-")[0];
    if (language && language in READY.texts) {
        return language as keyof typeof READY.texts;
    }
    return "en";
}

function styleReady(card: HTMLElement) {
    Object.assign(card.style, READY.style);
}

function styleFinished(card: HTMLElement) {
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
            if (
                finishedTexts?.some((t) =>
                    cardSubtitle.textContent?.startsWith(t),
                )
            ) {
                if (card instanceof HTMLElement) {
                    styleFinished(card);
                }
                continue;
            }

            // Up Next / Start Watching: should be red
            const readyTexts = READY.texts[language];
            if (
                readyTexts?.some((t) => cardSubtitle.textContent?.startsWith(t))
            ) {
                if (cardSubtitle instanceof HTMLElement) {
                    styleReady(cardSubtitle);
                }
            }
        }
    }
});

console.log("Crunchyroll Watchlist Enhancer loaded");
