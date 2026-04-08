export function getAssetUrl(path: string) {
  const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
