import { getDB } from "@/lib/db";
import { setThumb, getThumb } from "@/lib/thumbnails";

export async function getBlobByKey(blobKey: string): Promise<Blob | undefined> {
  const db = await getDB();
  const blob = await db.get("blobs", blobKey);
  return blob || undefined;
}

export async function loadBlobAsUrl(assetId: string, blobKey: string): Promise<string | undefined> {
  const cached = getThumb(assetId);
  if (cached) return cached;
  const blob = await getBlobByKey(blobKey);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  setThumb(assetId, url);
  return url;
}

export async function downloadAssetBlob(
  asset: { assetId: string; blobKey: string; filename: string; type: string },
): Promise<void> {
  const blob = await getBlobByKey(asset.blobKey);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = asset.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generateVideoThumbnail(
  assetId: string,
  blobKey: string,
): Promise<string | undefined> {
  const cached = getThumb(assetId);
  if (cached) return cached;
  const blob = await getBlobByKey(blobKey);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  return new Promise<string | undefined>((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.onloadeddata = () => {
      v.currentTime = Math.min(v.duration * 0.1, 1);
    };
    v.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth || 320;
      canvas.height = v.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setThumb(assetId, dataUrl);
        resolve(dataUrl);
      } else {
        resolve(undefined);
      }
      URL.revokeObjectURL(url);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    v.src = url;
  });
}

export async function loadAllBlobsThumbnails(
  assets: { assetId: string; blobKey: string; type: string; placeholder: boolean }[],
): Promise<void> {
  await Promise.all(
    assets.map(async (a) => {
      if (a.placeholder || !a.blobKey) return;
      if (a.type === "image") {
        await loadBlobAsUrl(a.assetId, a.blobKey);
      } else if (a.type === "video") {
        await generateVideoThumbnail(a.assetId, a.blobKey);
      }
    }),
  );
}
