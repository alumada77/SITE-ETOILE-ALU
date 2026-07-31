import { ToWords } from "to-words";

const converter = new ToWords({
  localeCode: "fr-FR",
  converterOptions: {
    currency: false,
    ignoreDecimal: true,
    ignoreZeroCurrency: true,
    doNotAddOnly: true,
  },
});

export function numberToFrenchWords(value: number): string {
  if (isNaN(value)) return "";

  return (
    converter
      .convert(Math.round(value))
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase())
  );
}