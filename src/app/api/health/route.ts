export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({
      ok: true,
      database: "not configured",
    });
  }

  try {
    const [{ db }, { sql }] = await Promise.all([import("@/db"), import("drizzle-orm")]);

    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      database: "connected",
    });
  } catch {
    return Response.json({
      ok: false,
      database: "unavailable",
    }, { status: 500 });
  }
}
