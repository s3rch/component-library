import * as React from "react";
import type { ReactElement } from "react";
import { act, render } from "@testing-library/react";

import { TrackingProvider } from "@repo/tracking";

export function createOkResponse(status = 201): Response {
  return new Response("{}", {
    status,
    headers: { "content-type": "application/json" }
  });
}

export function setFetchMockOk(status = 201): jest.Mock {
  const fetchMock = jest.fn(async () => createOkResponse(status));
  (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
  return fetchMock;
}

export function unsetFetchMock(): void {
  (globalThis as unknown as { fetch?: unknown }).fetch = undefined;
}

export function renderWithTracking(ui: ReactElement, config?: { apiBaseUrl?: string; flushIntervalMs?: number }) {
  return render(
    <TrackingProvider
      config={{
        apiBaseUrl: config?.apiBaseUrl ?? "http://localhost:4000",
        flushIntervalMs: config?.flushIntervalMs ?? 10
      }}
    >
      {ui}
    </TrackingProvider>
  );
}

export async function flushTracking(ms = 20): Promise<void> {
  await act(async () => {
    await flushMicrotasks();
    const stepMs = 10;
    const steps = Math.max(1, Math.ceil(ms / stepMs));
    for (let i = 0; i < steps; i += 1) {
      jest.advanceTimersByTime(stepMs);
      await flushMicrotasks();
    }
  });
}

export async function flushMicrotasks(times = 20): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

export function parseFetchJsonBody(fetchMock: jest.Mock, callIndex = 0): unknown {
  const call = fetchMock.mock.calls[callIndex];
  if (!call) throw new Error(`Expected fetch to have a call at index ${callIndex}`);

  const init = call[1] as unknown;
  const body = (init as { body?: unknown } | undefined)?.body;
  return JSON.parse(String(body)) as unknown;
}


