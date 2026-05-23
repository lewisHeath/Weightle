export function formatMass(kg: number): string {
  const abs = Math.abs(kg);
  if (abs < 0.001) {
    return `${(kg * 1_000_000).toFixed(0)} mg`;
  }
  if (abs < 1) {
    return `${(kg * 1000).toFixed(0)} g`;
  }
  if (abs >= 1000) {
    const tonnes = kg / 1000;
    return `${tonnes.toFixed(tonnes >= 10 ? 0 : 1)} t`;
  }
  return `${kg.toFixed(kg >= 10 ? 0 : 1)} kg`;
}

export function formatMassDelta(kg: number): string {
  return formatMass(kg);
}

export function formatPercentOff(pickedKg: number, heavierKg: number): string {
  const lighter = Math.min(pickedKg, heavierKg);
  const heavier = Math.max(pickedKg, heavierKg);
  if (lighter <= 0) return "";
  const pct = Math.round(((heavier - lighter) / lighter) * 100);
  return `${pct}%`;
}
