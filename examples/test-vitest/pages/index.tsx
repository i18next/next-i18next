import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

// type Props = {
// 	// Add custom props here
// };

const Homepage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
	const router = useRouter();
	const { t, i18n } = useTranslation("common");

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onToggleLanguageClick = (newLocale: string) => {
		const { pathname, asPath, query } = router;
		router.push({ pathname, query }, asPath, { locale: newLocale });
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const clientSideLanguageChange = (newLocale: string) => {
		i18n.changeLanguage(newLocale);
	};

	const changeTo = router.locale === "en" ? "de" : "en";
	// const changeTo = i18n.resolvedLanguage === 'en' ? 'de' : 'en'

	return (
		<>
			<main>
				<Header heading={t("h1")} title={t("title")} />
				<div className="mainBox">
					<div className="card">
						<h3 className="card-title">{t("blog.appDir.question")}</h3>
						<p className="card-text">
							<Trans i18nKey="blog.appDir.answer">
								Then check out
								<a href={t("blog.appDir.link")}>this blog post</a>.
							</Trans>
						</p>
						<a href={t("blog.appDir.link")}>
							<img
								className="card-img"
								src="https://locize.com/blog/next-app-dir-i18n/next-app-dir-i18n.jpg"
								alt="next-app-dir-i18n"
							/>
						</a>
					</div>

					<div className="card">
						<h3 className="card-title">{t("blog.optimized.question")}</h3>
						<p className="card-text">
							<Trans i18nKey="blog.optimized.answer">
								Then you may have a look at
								<a href={t("blog.optimized.link")}>this blog post</a>.
							</Trans>
						</p>
						<a href={t("blog.optimized.link")}>
							<img
								className="card-img"
								src="https://locize.com/blog/next-i18next/next-i18next.jpg"
								alt="next-i18next"
							/>
						</a>
					</div>
					<div className="card">
						<h3 className="card-title">{t("blog.ssg.question")}</h3>
						<p className="card-text">
							<Trans i18nKey="blog.ssg.answer">
								Then you may have a look at
								<a href={t("blog.ssg.link")}>this blog post</a>.
							</Trans>
						</p>
						<a href={t("blog.ssg.link")}>
							<img
								className="card-img"
								src="https://locize.com/blog/next-i18n-static/title.jpg"
								alt="next-i18n-static"
							/>
						</a>
					</div>
				</div>
				<hr style={{ marginTop: 20, width: "90%" }} />
				<div>
					<Link href="/" locale={changeTo}>
						<button type="button">{t("change-locale", { changeTo })}</button>
					</Link>
					alternative language change without using Link component
					<button type="button" onClick={() => onToggleLanguageClick(changeTo)}>
						{t("change-locale", { changeTo })}
					</button>
					alternative language change without using Link component, but this
					will change language only on client side
					<button
						type="button"
						onClick={() => clientSideLanguageChange(changeTo)}
					>
						{t("change-locale", { changeTo })}
					</button>
					<Link href="/second-page">
						<button type="button">{t("to-second-page")}</button>
					</Link>
				</div>
			</main>
			<Footer />
		</>
	);
};

// or getServerSideProps: GetServerSideProps<Props> = async ({ locale })
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? "en", ["common", "footer"])),
	},
});

export default Homepage;
