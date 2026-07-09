export const CARD_SELECTOR = ".erc-my-lists-item";
export const CARD_TITLE_SELECTOR = ".watchlist-card-title--o1sAO";
export const CARD_SUBTITLE_SELECTOR = ".watchlist-card-subtitle--IROsU";

export type Language = "en" | "de" | "fr" | "it" | "es";
export type Target = "card" | "subtitle";

export type StyleAndTexts = {
    styles: Partial<Record<Target, Partial<CSSStyleDeclaration>>>;
    texts: Record<Language, Array<string>>;
};

// cSpell:disable
export const READY: StyleAndTexts = {
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
    } as const,
};

export const CONTINUE: StyleAndTexts = {
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

export const FINISHED: StyleAndTexts = {
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
