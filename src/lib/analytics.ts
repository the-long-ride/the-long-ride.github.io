export type GoatCounterConfig = { scriptSrc: string; endpoint: string };
export function getGoatCounterConfig(code: string | undefined | null): GoatCounterConfig | null {
  const normalized = code?.trim();
  if (!normalized) return null;
  if (!/^[a-z0-9-]+$/i.test(normalized))
    throw new Error("PUBLIC_GOATCOUNTER_CODE contains unsupported characters");
  return {
    scriptSrc: "https://gc.zgo.at/count.js",
    endpoint: `https://${normalized}.goatcounter.com/count`,
  };
}
