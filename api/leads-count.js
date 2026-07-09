import { put, list } from "@vercel/blob";

const BLOB_KEY = "leads-count.json";

async function getCount() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, token: process.env.BLOB_READ_WRITE_TOKEN, storeId: process.env.BLOB_STORE_ID });
    if (blobs.length === 0) return 0;

    const res = await fetch(blobs[0].url);
    if (!res.ok) return 0;
    const json = await res.json();
    return typeof json.count === "number" ? json.count : 0;
  } catch {
    return 0;
  }
}

async function setCount(count) {
  await put(BLOB_KEY, JSON.stringify({ count }), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    storeId: process.env.BLOB_STORE_ID,
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const count = await getCount();
      return res.status(200).json({ count });
    }

    if (req.method === "POST") {
      const current = await getCount();
      const next = current + 1;
      await setCount(next);
      console.log(`[leads-count] incremented → ${next}`);
      return res.status(200).json({ count: next });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[leads-count] Error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: String(err) });
  }
}
