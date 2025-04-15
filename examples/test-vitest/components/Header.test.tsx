import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

vi.mock("next/head", () => ({
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Header", () => {
	it("renders correctly", () => {
		const props = {
			heading: "Test Heading",
			title: "Test Title",
		};

		render(<Header {...props} />);

		expect(screen.getByText("next-i18next")).toBeInTheDocument();
		expect(screen.getByText(props.heading)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "" })).toHaveAttribute(
			"href",
			"//github.com/i18next/next-i18next",
		);
	});
});
