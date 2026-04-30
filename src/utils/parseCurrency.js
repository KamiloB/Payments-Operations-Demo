export function parseCOP(value) {
  if (!value) return 0;
  const str = value.toString();
  const numeric = str.replace(/[^\d]/g, "");
  return Number(numeric);
}
