import {
    CARD_SELECTOR,
    CARD_SUBTITLE_SELECTOR,
    CLOSING_CAROUSEL_X_SELECTOR,
    CONTINUE,
    FINISHED,
    READY,
    type Language,
    type StyleAndTexts,
} from "./config.js";
import { MutationListener } from "./MutationListener.js";

type CardWithSubtitle = {
    card?: HTMLElement;
    subtitle?: HTMLElement;
};

// Order matters: we want to style the most specific state first
const STATE = {
    CONTINUE,
    FINISHED,
    READY,
} as const;

function getLanguage(): Language {
    const language = navigator.language.split("-")[0];
    if (language && language in READY.texts) {
        return language as keyof typeof READY.texts;
    }
    return "en";
}

function getState(
    subtitle: Element,
    language: Language,
): StyleAndTexts | undefined {
    for (const state of Object.values(STATE)) {
        const texts = state.texts[language];
        if (texts?.some((t) => subtitle.textContent?.startsWith(t))) {
            return state;
        }
    }
    return undefined;
}

function styleCard(
    { card, subtitle }: CardWithSubtitle,
    styles: StyleAndTexts["styles"],
) {
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
            if (
                state &&
                card instanceof HTMLElement &&
                subtitle instanceof HTMLElement
            ) {
                styleCard({ card, subtitle }, state.styles);
                continue;
            }
        }
    }
});

const CAROUSEL_CLOSE_RETRY_INTERVAL_MS = 200;
const MAX_CAROUSEL_CLOSE_ATTEMPTS = 25;
let carouselCloseTimer: ReturnType<typeof setInterval> | undefined;

function closeCarouselX(node: Node) {
    if (!(node instanceof HTMLElement)) return;

    const xButton = node.matches(CLOSING_CAROUSEL_X_SELECTOR)
        ? node
        : node.querySelector<HTMLElement>(CLOSING_CAROUSEL_X_SELECTOR);
    if (!xButton) return;

    xButton.click();
    if (carouselCloseTimer) return;

    let attempts = 0;
    const timer = setInterval(() => {
        const currentXButton = document.querySelector<HTMLElement>(
            CLOSING_CAROUSEL_X_SELECTOR,
        );
        if (!currentXButton || attempts >= MAX_CAROUSEL_CLOSE_ATTEMPTS) {
            clearInterval(timer);
            carouselCloseTimer = undefined;
            return;
        }

        attempts += 1;
        currentXButton.click();
    }, CAROUSEL_CLOSE_RETRY_INTERVAL_MS);
    carouselCloseTimer = timer;
}

// Try to close existing carousels
document
    .querySelectorAll<HTMLElement>(CLOSING_CAROUSEL_X_SELECTOR)
    .forEach((xButton) => xButton.click());

// Try to close newly added carousels
listener.on("added", closeCarouselX);

console.log("Crunchyroll Watchlist Enhancer loaded");
