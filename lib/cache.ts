const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000;

export async function fetchWithCache(url: string) {
  if (typeof window === "undefined") {
    const res = await fetch(url);
    return res.json();
  }

  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari ${url}`);
  }

  const data = await res.json();
  cache.set(url, { data, timestamp: now });
  return data;
}

export function invalidateCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}
