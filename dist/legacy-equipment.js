/* Original numeric equipment passive parser from the supplied legacy game. */
(function(g){'use strict';
const PASSIVE_STAT_KEYS=[
  { key: "str", aliases: ["STR"] },
  { key: "dex", aliases: ["DEX"] },
  { key: "hp", aliases: ["HP"] },
  { key: "mp", aliases: ["MP"] },
  { key: "defense", aliases: ["Defense", "DEF"] },
  { key: "attack", aliases: ["Attack", "ATK"] },
  { key: "critRate", aliases: ["Crit(?:ical)?\\s*Rate", "Crit"] },
  { key: "resistance", aliases: ["Resistance", "Resist"] },
];
function emptyPassiveBonuses() { return { str: 0, dex: 0, hp: 0, mp: 0, defense: 0, attack: 0, critRate: 0, resistance: 0 }; }
function parseEquipmentPassiveEffects(text) {
  const totals = emptyPassiveBonuses();
  const str = String(text || "").trim();
  if (!str) return totals;
  PASSIVE_STAT_KEYS.forEach(({ key, aliases }) => {
    const aliasPattern = aliases.join("|");
    // เลขนำหน้าคีย์เวิร์ด เช่น "+5 STR", "5% Crit Rate"
    const before = new RegExp(`([+-]?\\d+(?:\\.\\d+)?)\\s*%?\\s*(?:${aliasPattern})\\b`, "gi");
    // เลขตามหลังคีย์เวิร์ด เช่น "STR+5", "Defense: 3", "เพิ่ม HP 10"
    const after = new RegExp(`\\b(?:${aliasPattern})\\s*[:=]?\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*%?`, "gi");
    let matched = false;
    let m;
    while ((m = before.exec(str)) !== null) { totals[key] += Number(m[1]) || 0; matched = true; }
    if (!matched) { while ((m = after.exec(str)) !== null) { totals[key] += Number(m[1]) || 0; } }
  });
  return totals;
}
function combineEquipmentPassiveText(dbItem) {
  return [dbItem.passive, dbItem.passiveEffects, dbItem.specialEffectsText].filter(Boolean).join(" ");
}
const api={emptyPassiveBonuses,parseEquipmentPassiveEffects,combineEquipmentPassiveText};g.DecideLegacyEquipment=api;if(typeof module!=='undefined')module.exports=api;})(typeof window==='undefined'?globalThis:window);
