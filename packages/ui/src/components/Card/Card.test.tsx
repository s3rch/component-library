import { fireEvent, render, screen } from "@testing-library/react";

import { Card } from "./Card";
import { flushTracking, parseFetchJsonBody, renderWithTracking, setFetchMockOk, unsetFetchMock } from "../../test/test-utils";

describe("Card", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    unsetFetchMock();
  });

  test("renders optional image/header/body/footer (safe without TrackingProvider)", () => {
    const { container } = render(
      <Card
        border="strong"
        imageSrc="https://example.com/image.jpg"
        imageAlt="Example"
        header="Header"
        footer={<div>Footer</div>}
      >
        Body
      </Card>
    );

    expect(screen.getByAltText("Example")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();

    const root = container.firstChild;
    if (!(root instanceof HTMLElement)) throw new Error("Expected Card root element");
    expect(root.getAttribute("class") ?? "").toContain("border-[var(--ui-colors-border-strong)]");
  });

  test("if clickable, emits tracking on click with component/variant/action", async () => {
    const fetchMock = setFetchMockOk();
    renderWithTracking(<Card border="subtle" onClick={() => undefined} header="Clickable">Body</Card>);

    fireEvent.click(screen.getByRole("button", { name: /Clickable/ }));
    await flushTracking();

    expect(fetchMock).toHaveBeenCalled();
    const body = parseFetchJsonBody(fetchMock) as { component: string; variant: string; action: string };
    expect(body.component).toBe("Card");
    expect(body.variant).toBe("subtle");
    expect(body.action).toBe("click");
  });

  test("if clickable, Enter key triggers click tracking", async () => {
    const fetchMock = setFetchMockOk();
    renderWithTracking(<Card border="strong" onClick={() => undefined} header="KeyCard">Body</Card>);

    const card = screen.getByRole("button", { name: /KeyCard/ });
    fireEvent.keyDown(card, { key: "Enter" });
    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = parseFetchJsonBody(fetchMock) as { component: string; variant: string; action: string };
    expect(body.component).toBe("Card");
    expect(body.variant).toBe("strong");
    expect(body.action).toBe("click");
  });

  test("if clickable, other keys do NOT emit click tracking", async () => {
    const fetchMock = setFetchMockOk();
    renderWithTracking(<Card border="strong" onClick={() => undefined} header="KeyCard">Body</Card>);

    const card = screen.getByRole("button", { name: /KeyCard/ });
    fireEvent.keyDown(card, { key: "Escape" });
    await flushTracking(100);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("if NOT clickable, it does NOT emit click tracking", async () => {
    const fetchMock = setFetchMockOk();
    const { container } = renderWithTracking(<Card border="none" header="Static">Body</Card>);

    const root = container.firstChild;
    if (!(root instanceof HTMLElement)) throw new Error("Expected Card root element");
    fireEvent.click(root);
    await flushTracking(100);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});


