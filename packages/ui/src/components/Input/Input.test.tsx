import { fireEvent, render, screen } from "@testing-library/react";

import { Input } from "./Input";
import { flushTracking, parseFetchJsonBody, renderWithTracking, setFetchMockOk, unsetFetchMock } from "../../test/test-utils";

describe("Input", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    unsetFetchMock();
  });

  test("renders label associated to input (safe without TrackingProvider)", () => {
    render(<Input label="Email" placeholder="you@example.com" type="email" />);

    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "you@example.com");
  });

  test("emits tracking on focus (never includes value)", async () => {
    const fetchMock = setFetchMockOk();

    renderWithTracking(
      <div>
        <Input label="Password" type="password" validation="error" onBlur={(e) => e.preventDefault()} />
        <button type="button">Next</button>
      </div>
    );

    const input = screen.getByLabelText("Password");

    fireEvent.focusIn(input);
    fireEvent.change(input, { target: { value: "super-secret-password" } });
    fireEvent.focusOut(input);

    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body0 = parseFetchJsonBody(fetchMock, 0) as { component: string; variant: string; action: string; metadata?: unknown };
    expect(body0.component).toBe("Input");
    expect(body0.action).toBe("focus");
    expect(body0.variant).toBe("type:password|validation:error");
    expect(JSON.stringify(body0)).not.toContain("super-secret-password");
  });

  test("emits tracking on blur (never includes value)", async () => {
    const fetchMock = setFetchMockOk();

    renderWithTracking(
      <div>
        <Input label="Password" type="password" validation="error" onFocus={(e) => e.preventDefault()} />
        <button type="button">Next</button>
      </div>
    );

    const input = screen.getByLabelText("Password");

    fireEvent.focusIn(input);
    fireEvent.change(input, { target: { value: "super-secret-password" } });
    fireEvent.focusOut(input);

    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body0 = parseFetchJsonBody(fetchMock, 0) as { component: string; variant: string; action: string; metadata?: unknown };
    expect(body0.component).toBe("Input");
    expect(body0.action).toBe("blur");
    expect(body0.variant).toBe("type:password|validation:error");
    expect(JSON.stringify(body0)).not.toContain("super-secret-password");
  });

  test("applies validation styles (error)", () => {
    render(<Input label="Name" validation="error" />);
    const input = screen.getByLabelText("Name");
    expect(input.getAttribute("class") ?? "").toContain("border-[var(--ui-colors-danger)]");
  });
});


