import type { NextFunction, Request, Response } from "express";

import type { TrackEventInputDto } from "../../../application/dto/tracking";
import type { ExportEventsUseCase } from "../../../application/use-cases/ExportEventsUseCase";
import type { GetStatsUseCase } from "../../../application/use-cases/GetStatsUseCase";
import type { TrackEventUseCase } from "../../../application/use-cases/TrackEventUseCase";
import type { TrackingEvent } from "../../../domain/entities/TrackingEvent";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function eventsToCsv(events: TrackingEvent[]): string {
  const headers = ["component", "variant", "action", "timestamp", "metadata"];
  const lines: string[] = [headers.join(",")];

  for (const e of events) {
    const row = [
      e.component,
      e.variant,
      e.action,
      e.timestamp.toISOString(),
      e.metadata ? JSON.stringify(e.metadata) : ""
    ].map((v) => csvEscape(v));
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

type ExportQuery = {
  limit?: number;
};

export class ComponentsController {
  constructor(
    private readonly trackEvent: TrackEventUseCase,
    private readonly getStats: GetStatsUseCase,
    private readonly exportEvents: ExportEventsUseCase
  ) {}

  track = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as TrackEventInputDto;
      const output = await this.trackEvent.execute(input);
      return res.status(201).json(output);
    } catch (err: unknown) {
      return next(err);
    }
  };

  stats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const output = await this.getStats.execute();
      return res.status(200).json(output);
    } catch (err: unknown) {
      return next(err);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as ExportQuery;
      const limit = query.limit;
      const events = await this.exportEvents.execute(typeof limit === "number" ? { limit } : undefined);

      const csv = eventsToCsv(events);
      const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
      const filename = `tracking-events-${stamp}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    } catch (err: unknown) {
      return next(err);
    }
  };
}


