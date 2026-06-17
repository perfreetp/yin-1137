const urls = new Map<string, string>();

export function setThumb(key: string, url: string | null) {
  const old = urls.get(key);
  if (old) URL.revokeObjectURL(old);
  if (url) urls.set(key, url);
  else urls.delete(key);
}

export function getThumb(key: string): string | undefined {
  return urls.get(key);
}

export function clearThumbs() {
  for (const url of urls.values()) URL.revokeObjectURL(url);
  urls.clear();
}
