export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 8000;

export async function GET() {
  const apiUrl = process.env.BACKEND_API_URL;
  if (!apiUrl) {
    return Response.json({ ok: false }, { status: 500 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiUrl}/api/docs/`, {
      cache: "no-store",
      signal: controller.signal,
    });
    return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  } finally {
    clearTimeout(timer);
  }
}
