import { GET, POST } from "../src/app/api/game/route";
import { z } from "zod";

// Mocks for dependencies used in route.ts
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      $connect: vi.fn().mockResolvedValue(undefined),
      $disconnect: vi.fn().mockResolvedValue(undefined),
      game: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      topic_count: {
        upsert: vi.fn(),
      },
      question: {
        createMany: vi.fn(),
      },
    },
  } as const;
});

vi.mock("@/lib/nextauth", () => ({
  getAuthSession: vi.fn(),
}));

vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

// Mock quiz creation schema with a real zod-based parse to allow validation tests
vi.mock("@/schemas/forms/quiz", () => ({
  quizCreationSchema: {
    parse: (body: any) => {
      const schema = z.object({
        topic: z.string(),
        type: z.string(),
        amount: z.number(),
        level: z.string(),
      });
      return schema.parse(body);
    },
  },
}));

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import axios from "axios";

describe("Game route API tests (GET/POST /api/game)", () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  it("GET: unauthenticated should return 401", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/game?gameId=game_123", {
      method: "GET",
    });

    const res = await GET(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("GET: authenticated and existing game returns 200 with game payload", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue({ user: { id: "user_1" } });
    (prisma.game.findUnique as vi.Mock).mockResolvedValue({
      id: "game_123",
      name: "Test Game",
      maxPlayers: 4,
      userId: "user_1",
      questions: [],
    });

    const req = new Request("http://localhost/api/game?gameId=game_123", {
      method: "GET",
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("game");
    expect(body.game).toMatchObject({ id: "game_123", name: "Test Game" });
    expect(body.game).toHaveProperty("questions");
  });

  it("GET: missing gameId parameter returns 400", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue({ user: { id: "user_1" } });

    const req = new Request("http://localhost/api/game", { method: "GET" });
    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("POST: valid payload creates a game and returns 200 with gameId", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue({ user: { id: "user_1" } });

    // Mock DB and external calls for a successful creation path
    (prisma.$connect as vi.Mock).mockResolvedValue(undefined);
    (prisma.game.create as vi.Mock).mockResolvedValue({ id: "game_0001" });
    (prisma.topic_count.upsert as vi.Mock).mockResolvedValue(undefined);
    (axios.post as vi.Mock).mockResolvedValue({ data: { questions: [] } });

    const payload = {
      topic: "math",
      type: "mcq",
      amount: 5,
      level: "beginner",
    };

    const req = new Request("http://localhost/api/game", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    // Note: In route.ts, POST returns 200 with { gameId }
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("gameId", "game_0001");
  });

  it("POST: missing required field triggers 400 validation error", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue({ user: { id: "user_1" } });

    const payload = {
      // Missing required fields: topic, type, amount, level
    };

    const req = new Request("http://localhost/api/game", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toHaveProperty("error");
    // error should be an array of issues from Zod
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("POST: unauthenticated should return 401", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue(null);

    const payload = {
      topic: "math",
      type: "mcq",
      amount: 5,
      level: "beginner",
    };

    const req = new Request("http://localhost/api/game", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("POST: DB error should return 500", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue({ user: { id: "user_1" } });
    (prisma.$connect as vi.Mock).mockResolvedValue(undefined);
    (prisma.game.create as vi.Mock).mockRejectedValue(new Error("DB failure"));

    const payload = {
      topic: "math",
      type: "mcq",
      amount: 5,
      level: "beginner",
    };

    const req = new Request("http://localhost/api/game", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("POST: non-JSON payload should return 500 (invalid JSON)", async () => {
    (getAuthSession as vi.Mock).mockResolvedValue({ user: { id: "user_1" } });

    const req = new Request("http://localhost/api/game", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "text/plain" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});