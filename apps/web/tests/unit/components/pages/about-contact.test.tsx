import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { createContactSchema } from "@/schemas/contactSchema";
import { AboutPageContent } from "@/components/pages/about-page-content";
import { ContactPageContent } from "@/components/pages/contact-page-content";

vi.mock("@/lib/api", () => ({ submitContactMessage: vi.fn() }));

// framer-motion's whileInView needs an IntersectionObserver, which jsdom lacks.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

describe("createContactSchema", () => {
  const schema = createContactSchema(useTranslations("contact"));

  it("reports the English validation messages", () => {
    const result = schema.safeParse({
      name: "A",
      email: "",
      subject: "nope",
      message: "short",
      agreedToPrivacy: false,
    });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        "Name must be at least 2 characters",
        "Email is required",
        "Please select a subject",
        "Message must be at least 10 characters",
        "You must agree to the privacy policy",
      ])
    );
  });

  it("accepts a valid submission", () => {
    expect(
      schema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        subject: "general",
        message: "Hello from Nova Sintra",
        agreedToPrivacy: true,
      }).success
    ).toBe(true);
  });
});

describe("AboutPageContent", () => {
  it("renders the English copy", () => {
    render(<AboutPageContent />);
    expect(
      screen.getByRole("heading", { name: "About Nos Ilha" })
    ).toBeInTheDocument();
    expect(screen.getByText("Our Mission & Values")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Whether you're a developer, photographer, writer, or cultural enthusiast, there's a place for you in the Nos Ilha community."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(
        "Community members collaborating on preserving Brava Island's heritage"
      )
    ).toBeInTheDocument();
  });
});

describe("ContactPageContent", () => {
  it("renders the form and FAQ with their links", () => {
    const { container } = render(<ContactPageContent />);
    expect(
      screen.getByRole("heading", { name: "Contact Us" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();

    const privacy = screen.getByRole("link", { name: "privacy policy" });
    expect(privacy).toHaveAttribute("href", "/privacy");
    expect(privacy.parentElement).toHaveTextContent(
      "I agree to the privacy policy"
    );

    const contribute = screen.getByRole("link", { name: "contribute page" });
    expect(contribute).toHaveAttribute("href", "/contribute");
    expect(contribute.parentElement?.textContent).toBe(
      "Visit our contribute page for detailed instructions. We need your business name, location, contact details, description, and photos if possible. All submissions are reviewed by our volunteer team within 1-2 weeks to ensure accuracy and cultural authenticity."
    );

    const github = screen.getByRole("link", { name: "GitHub repository" });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github.parentElement?.textContent).toBe(
      'Nos Ilha is fully open-source! Visit our GitHub repository to see current issues, contribution guidelines, and the tech stack (Next.js, React, Spring Boot, Kotlin). New developers can start with "good first issue" labels, or use the contact form with "Technical Support" for guidance.'
    );

    expect(container).toHaveTextContent(
      'Use the contact form above with "Content Contribution" selected'
    );
  });
});
