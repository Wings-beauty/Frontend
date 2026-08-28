export function isBoothPath(pathname: string) {
  return pathname === "/booth" || pathname.startsWith("/booth/");
}

export function boothRoute(path: string, booth: boolean) {
  return booth ? `/booth${path}` : path;
}
