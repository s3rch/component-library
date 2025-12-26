import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

import { createApp } from "../src/app";
import {
  clearMongoDatabase,
  connectMongo,
  disconnectMongo
} from "../src/infrastructure/db/mongoose/connection";

describe("apps/api integration", () => {
  const app = createApp({ jwtSecret: "test-secret" });
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri("t1_analytics");
    await connectMongo(uri);
  });

  afterAll(async () => {
    await disconnectMongo();
    await mongo.stop();
  });

  afterEach(async () => {
    await clearMongoDatabase();
  });

  test("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("auth register + login happy path", async () => {
    const email = "user@example.com";
    const password = "password123";

    const registerRes = await request(app).post("/api/auth/register").send({ email, password });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.email).toBe(email);
    expect(typeof registerRes.body.user.id).toBe("string");

    const loginRes = await request(app).post("/api/auth/login").send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(typeof loginRes.body.token).toBe("string");
  });

  test("POST /api/components/track creates an event", async () => {
    const trackRes = await request(app)
      .post("/api/components/track")
      .send({ component: "Button", variant: "primary", action: "click", metadata: { foo: "bar" } });
    expect(trackRes.status).toBe(201);
    expect(trackRes.body.event.component).toBe("Button");

    const statsRes = await request(app).get("/api/components/stats");
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.totalEvents).toBe(1);
    expect(statsRes.body.totalsByComponent.Button).toBe(1);
  });

  test("GET /api/components/stats returns aggregated data", async () => {
    await request(app)
      .post("/api/components/track")
      .send({ component: "Button", variant: "primary", action: "click" });
    await request(app)
      .post("/api/components/track")
      .send({ component: "Input", variant: "default", action: "focus" });

    const statsRes = await request(app).get("/api/components/stats");
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.totalEvents).toBe(2);
    expect(statsRes.body.totalsByComponent.Button).toBe(1);
    expect(statsRes.body.totalsByComponent.Input).toBe(1);
    expect(Array.isArray(statsRes.body.recentEvents)).toBe(true);
  });

  test("GET /api/components/export requires JWT and returns CSV when authorized", async () => {
    const email = "exporter@example.com";
    const password = "password123";

    await request(app).post("/api/auth/register").send({ email, password });
    const loginRes = await request(app).post("/api/auth/login").send({ email, password });
    const token: string = loginRes.body.token;

    await request(app)
      .post("/api/components/track")
      .send({ component: "Button", variant: "primary", action: "click" });

    const missingAuthRes = await request(app).get("/api/components/export");
    expect(missingAuthRes.status).toBe(401);

    const csvRes = await request(app)
      .get("/api/components/export?limit=1000")
      .set("Authorization", `Bearer ${token}`);

    expect(csvRes.status).toBe(200);
    expect(csvRes.headers["content-type"]).toContain("text/csv");
    expect(csvRes.text).toContain("component,variant,action,timestamp,metadata");
    expect(csvRes.text).toContain("Button,primary,click");
  });
});


