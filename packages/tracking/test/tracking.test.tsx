import { useEffect } from "react";
import { render, act } from "@testing-library/react";

import { TrackingProvider, useTracking } from "../src";

function SessionIdReader(props: { onRead: (value: { sessionId: string; enabled: boolean }) => void }) {
  const { sessionId, enabled } = useTracking();
  props.onRead({ sessionId, enabled });
  return null;
}

function TrackOnMount(props: { onDone?: () => void; metadata?: Record<string, unknown>; enabled?: boolean }) {
  const { track } = useTracking();
  useEffect(() => {
    void track({
      component: "Button",
      variant: "primary",
      action: "click",
      ...(props.metadata ? { metadata: props.metadata } : {})
    }).finally(() => props.onDone?.());
  }, [track, props]);
  return null;
}

function createOkResponse(status = 201): Response {
  return new Response("{}", {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("@repo/tracking", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as unknown as { fetch?: unknown }).fetch = undefined;
  });

  test("Provider generates stable sessionId", () => {
    const reads: Array<{ sessionId: string; enabled: boolean }> = [];

    const { rerender } = render(
      <TrackingProvider config={{ apiBaseUrl: "http://localhost:4000" }}>
        <SessionIdReader onRead={(v) => reads.push(v)} />
      </TrackingProvider>
    );

    rerender(
      <TrackingProvider config={{ apiBaseUrl: "http://localhost:4000" }}>
        <SessionIdReader onRead={(v) => reads.push(v)} />
      </TrackingProvider>
    );

    expect(reads.length).toBeGreaterThanOrEqual(2);
    expect(reads[0]?.sessionId).toBeTruthy();
    expect(reads[0]?.sessionId).toBe(reads[1]?.sessionId);
  });

  test("track() enqueues and flush calls fetch with correct payload", async () => {
    const fetchMock = jest.fn(async () => createOkResponse());
    (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;

    render(
      <TrackingProvider config={{ apiBaseUrl: "http://localhost:4000", flushIntervalMs: 10 }}>
        <TrackOnMount />
      </TrackingProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(20);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalled();
    const call0 = fetchMock.mock.calls[0];
    if (!call0) throw new Error("Expected fetch to have at least one call");
    const [url, init] = call0 as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:4000/api/components/track");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");

    const body = JSON.parse(String(init.body)) as {
      component: string;
      variant: string;
      action: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    };

    expect(body.component).toBe("Button");
    expect(body.variant).toBe("primary");
    expect(body.action).toBe("click");
    expect(body.timestamp).toBe("2025-01-01T00:00:00.000Z");
    expect(body.metadata && typeof body.metadata.__tracking).toBe("object");
  });

  test("when fetch fails, it retries later and does not throw", async () => {
    let call = 0;
    const fetchMock = jest.fn(async () => {
      call += 1;
      if (call === 1) {
        throw new Error("network down");
      }
      return createOkResponse();
    });
    (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;

    render(
      <TrackingProvider config={{ apiBaseUrl: "http://localhost:4000", flushIntervalMs: 10 }}>
        <TrackOnMount />
      </TrackingProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(20);
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(2000); // backoff starts at 1000ms
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("when enabled=false, it does not send", async () => {
    const fetchMock = jest.fn(async () => createOkResponse());
    (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;

    render(
      <TrackingProvider config={{ apiBaseUrl: "http://localhost:4000", enabled: false, flushIntervalMs: 10 }}>
        <TrackOnMount />
      </TrackingProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});


