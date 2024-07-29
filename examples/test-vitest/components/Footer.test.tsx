import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";

vi.mock("next-i18next", () => ({
	Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("next-i18next/package.json", () => ({
	default: { version: "1.0.0" },
}));

describe("Footer", () => {
	it("renders correctly", () => {
		render(<Footer />);

		expect(screen.getByText("description")).toBeInTheDocument();
		expect(screen.getByText("next-i18next v1.0.0")).toBeInTheDocument();
		expect(screen.getByText(/With using/)).toBeInTheDocument();
		expect(screen.getByText("locize")).toBeInTheDocument();
		expect(screen.getByText("i18next")).toBeInTheDocument();
	});
});
