import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SecondPage, { getServerSideProps } from "./second-page";

vi.mock("next-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("next-i18next/serverSideTranslations", () => ({
	serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} }),
}));

vi.mock("../components/Footer", () => ({
	Footer: () => <div data-testid="footer" />,
}));

vi.mock("../components/Header", () => ({
	Header: () => <div data-testid="header" />,
}));

describe("SecondPage", () => {
	it("renders correctly", () => {
		render(<SecondPage />);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
		expect(screen.getByText("second-page:back-to-home")).toBeInTheDocument();
	});
});

describe("getServerSideProps", () => {
	it("returns correct props", async () => {
		const context = { locale: "en" };
		const result = await getServerSideProps(context as any);

		expect(result).toEqual({
			props: {
				_nextI18Next: {},
			},
		});
	});

	it("uses default locale when not provided", async () => {
		const context = {};
		const result = await getServerSideProps(context as any);

		expect(result).toEqual({
			props: {
				_nextI18Next: {},
			},
		});
	});
});
