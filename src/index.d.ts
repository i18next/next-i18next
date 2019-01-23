import * as React from "react";
import App from "next/app";
import { LinkProps } from "next/link";
import i18next from "i18next";
import { withNamespaces, TransProps } from "react-i18next";

export interface NextI18NextConfig {
    defaultLanguage: string;
    otherLanguages: Array<string>;
    fallbackLng: string | null;
    load: string;
    localePath: string;
    localeStructure: string;
    localeSubpaths: boolean;
    ns: Array<string>;
    use: Array<string>;
    defaultNS: string;
    interpolation: {
        escapeValue: boolean;
        formatSeparator: string;
        format: (value: string, format: string) => string;
    };
    browserLanguageDetection: boolean;
    serverLanguageDetection: boolean;
    ignoreRoutes: Array<string>;
    detection: {
        order: Array<string>;
        caches: Array<string>;
    };
    backend: {
        loadPath: string;
        addPath: string;
    };
    react: {
        wait: boolean;
    };
    strictMode: boolean;
    errorStackTraceLimit: number;
}

export default class NextI18Next {
    config: NextI18NextConfig;
    i18n: i18next.i18n;
    appWithTranslation: <T extends typeof App>(component: T) => T;
    withNamespaces: withNamespaces;
    Link: React.ComponentClass<LinkProps>;
    Trans: React.ComponentClass<TransProps>;

    constructor(config: { [T in keyof NextI18NextConfig]?: NextI18NextConfig[T] });
}
