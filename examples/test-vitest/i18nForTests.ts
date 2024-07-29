import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
	lng: "en",
	fallbackLng: "en",
	resources: {
		en: {
			common: {
				h1: "Welcome",
				title: "Next.js i18n example",
				"change-locale": "Change locale to {{changeTo}}",
				"to-second-page": "Go to the second page",
				"blog.appDir.question": "Do you want to use the app directory?",
				"blog.appDir.answer": "Then check out <0>this blog post</0>.",
				"blog.appDir.link": "https://locize.com/blog/next-app-dir-i18n/",
				"blog.optimized.question": "Do you want to optimize your Next.js i18n?",
				"blog.optimized.answer":
					"Then you may have a look at <0>this blog post</0>.",
				"blog.optimized.link": "https://locize.com/blog/next-i18next/",
				"blog.ssg.question": "Do you want to use getStaticProps with SSG?",
				"blog.ssg.answer": "Then you may have a look at <0>this blog post</0>.",
				"blog.ssg.link": "https://locize.com/blog/next-i18n-static/",
			},
			footer: {
				description: "This is the footer.",
				helpLocize:
					"With using <0>locize</0> you directly support the future of <1>i18next</1>.",
			},
			"second-page": {
				h1: "Hi",
				title: "Second page",
				"back-to-home": "Back to home",
			},
		},
		de: {
			common: {
				h1: "Willkommen",
				title: "Next.js i18n Beispiel",
				"change-locale": "Sprache ändern zu {{changeTo}}",
				"to-second-page": "Gehe zur zweiten Seite",
				"blog.appDir.question": "Möchtest du das App-Verzeichnis verwenden?",
				"blog.appDir.answer": "Dann schau dir <0>diesen Blog-Post</0> an.",
				"blog.appDir.link": "https://locize.com/blog/next-app-dir-i18n/de/",
				"blog.optimized.question": "Möchtest du dein Next.js i18n optimieren?",
				"blog.optimized.answer":
					"Dann kannst du dir <0>diesen Blog-Post</0> ansehen.",
				"blog.optimized.link": "https://locize.com/blog/next-i18next/de/",
				"blog.ssg.question": "Möchtest du getStaticProps mit SSG verwenden?",
				"blog.ssg.answer":
					"Dann kannst du dir <0>diesen Blog-Post</0> ansehen.",
				"blog.ssg.link": "https://locize.com/blog/next-i18n-static/de/",
			},
			footer: {
				description: "Dies ist die Fußzeile.",
				helpLocize:
					"Mit der Verwendung von <0>locize</0> unterstützt du direkt die Zukunft von <1>i18next</1>.",
			},
			"second-page": {
				h1: "Hallo",
				title: "Zweite Seite",
				"back-to-home": "Zurück zur Startseite",
			},
		},
	},
});

export { i18n };
