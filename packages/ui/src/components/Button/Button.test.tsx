import { fireEvent, render, screen } from "@testing-library/react";

import { Button } from "./Button";
import { renderWithTracking, flushTracking, parseFetchJsonBody, setFetchMockOk, unsetFetchMock } from "../../test/test-utils";

describe("Button", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    unsetFetchMock();
  });

  test("renders children and optional icon (safe without TrackingProvider)", () => {
    render(
      <Button
        variant="primary"
        icon={<span data-testid="icon" aria-hidden="true" />}
      >
        Save
      </Button>
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  test("emits tracking on click with {component, variant, action}", async () => {
    const fetchMock = setFetchMockOk();

    renderWithTracking(<Button variant="secondary">Click me</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Click me" }));
    await flushTracking();

    expect(fetchMock).toHaveBeenCalled();
    const body = parseFetchJsonBody(fetchMock) as { component: string; variant: string; action: string };
    expect(body.component).toBe("Button");
    expect(body.variant).toBe("secondary");
    expect(body.action).toBe("click");
  });

  test("does NOT emit tracking when disabled", async () => {
    const fetchMock = setFetchMockOk();

    renderWithTracking(
      <Button variant="primary" state="disabled">
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
    await flushTracking(100);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does NOT emit tracking when loading", async () => {
    const fetchMock = setFetchMockOk();

    renderWithTracking(
      <Button variant="primary" state="loading">
        Loading
      </Button>
    );

    fireEvent.click(screen.getByRole("button", { name: "Loading" }));
    await flushTracking(100);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});


