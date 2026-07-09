import {
    CARD_SELECTOR,
    CARD_SUBTITLE_SELECTOR,
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

console.log("Crunchyroll Watchlist Enhancer loaded");
