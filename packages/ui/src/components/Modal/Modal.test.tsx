import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TrackingProvider } from "@repo/tracking";

import { Modal } from "./Modal";
import {
  flushTracking,
  parseFetchJsonBody,
  renderWithTracking,
  setFetchMockOk,
  unsetFetchMock
} from "../../test/test-utils";

function ControlledModal(props: { initialOpen?: boolean; size?: "small" | "medium" | "large" }) {
  const [open, setOpen] = useState<boolean>(props.initialOpen ?? false);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        open={open}
        size={props.size ?? "medium"}
        onOpenChange={(next) => setOpen(next)}
        header="Header"
        footer={<div>Footer</div>}
      >
        Body
      </Modal>
    </div>
  );
}

describe("Modal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    unsetFetchMock();
  });

  test("renders header/body/footer, focuses dialog on open, restores focus on close (safe without TrackingProvider)", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<ControlledModal />);

    const openButton = screen.getByRole("button", { name: "Open" });
    openButton.focus();
    expect(openButton).toHaveFocus();

    await user.click(openButton);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(dialog).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Close modal" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });

  test("emits tracking on open", async () => {
    const fetchMock = setFetchMockOk();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithTracking(<ControlledModal initialOpen={false} size="small" />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalled();
    const openBody = parseFetchJsonBody(fetchMock, 0) as { component: string; variant: string; action: string };
    expect(openBody.component).toBe("Modal");
    expect(openBody.variant).toBe("small");
    expect(openBody.action).toBe("open");
  });

  test("emits close tracking with reason=overlay", async () => {
    const fetchMock = setFetchMockOk();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithTracking(<ControlledModal initialOpen={true} size="small" />);

    const dialog = screen.getByRole("dialog");
    const overlay = dialog.parentElement;
    if (!overlay) throw new Error("Expected overlay element");

    await user.click(overlay);
    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const closeBody = parseFetchJsonBody(fetchMock, 0) as {
      component: string;
      variant: string;
      action: string;
      metadata?: { reason?: string };
    };
    expect(closeBody.component).toBe("Modal");
    expect(closeBody.variant).toBe("small");
    expect(closeBody.action).toBe("close");
    expect(closeBody.metadata?.reason).toBe("overlay");
  });

  test("emits close tracking with reason=esc", async () => {
    const fetchMock = setFetchMockOk();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithTracking(<ControlledModal initialOpen={true} />);
    await user.keyboard("{Escape}");
    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const closeBody = parseFetchJsonBody(fetchMock, 0) as { action: string; metadata?: { reason?: string } };
    expect(closeBody.action).toBe("close");
    expect(closeBody.metadata?.reason).toBe("esc");
  });

  test("emits close tracking with reason=api when parent closes programmatically", async () => {
    const fetchMock = setFetchMockOk();

    const config = { apiBaseUrl: "http://localhost:4000", flushIntervalMs: 10 };

    const { rerender } = render(
      <TrackingProvider config={config}>
        <Modal open={true} onOpenChange={() => undefined} header="H">
          Body
        </Modal>
      </TrackingProvider>
    );

    rerender(
      <TrackingProvider config={config}>
        <Modal open={false} onOpenChange={() => undefined} header="H">
          Body
        </Modal>
      </TrackingProvider>
    );
    await flushTracking(100);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const closeBody = parseFetchJsonBody(fetchMock, 0) as { action: string; metadata?: { reason?: string } };
    expect(closeBody.action).toBe("close");
    expect(closeBody.metadata?.reason).toBe("api");
  });
});


