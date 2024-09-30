export function remove<T>(key: string | number) {
  return (prev: { [key: string]: T }) => {
    const { ...rest } = prev;
    delete rest[key];
    return rest;
  };
}
export const makeImageUrl = (
  pathOrUrl: string,
  size = "--pdp_main-640.jpg"
) => {
  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }
  return "https://www.elgiganten.se" + pathOrUrl?.replace(".jpg", size);
};
