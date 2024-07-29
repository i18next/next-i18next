import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Homepage from "./index";

const mockPush = vi.fn();
const mockChangeLanguage = vi.fn();

vi.mock("next/router", () => ({
	useRouter: () => ({
		asPath: "/",
		locale: "en",
		pathname: "/",
		push: mockPush,
		query: {},
	}),
}));

vi.mock("next-i18next", () => ({
	Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useTranslation: () => ({
		i18n: {
			changeLanguage: mockChangeLanguage,
		},
		t: (key: string) => key,
	}),
}));

vi.mock("../components/Footer", () => ({
	Footer: () => <div data-testid="footer" />,
}));

vi.mock("../components/Header", () => ({
	Header: () => <div data-testid="header" />,
}));

describe("Homepage", () => {
	it("renders correctly", () => {
		render(<Homepage />);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
		expect(screen.getByText("blog.appDir.question")).toBeInTheDocument();
		expect(screen.getByText("blog.optimized.question")).toBeInTheDocument();
		expect(screen.getByText("blog.ssg.question")).toBeInTheDocument();
		expect(screen.getAllByText("change-locale")).toHaveLength(3);
		expect(screen.getByText("to-second-page")).toBeInTheDocument();
	});

	it("changes language when clicking the change locale button", () => {
		render(<Homepage />);
		const changeLocaleButtons = screen.getAllByText("change-locale");
		fireEvent.click(changeLocaleButtons[1]); // Click the second button (index 1)
		expect(mockPush).toHaveBeenCalledWith({ pathname: "/", query: {} }, "/", {
			locale: "de",
		});
	});

	it("changes language on client side", () => {
		render(<Homepage />);
		const changeLocaleButtons = screen.getAllByText("change-locale");
		fireEvent.click(changeLocaleButtons[2]); // Click the third button (index 2)
		expect(mockChangeLanguage).toHaveBeenCalledWith("de");
	});
});
