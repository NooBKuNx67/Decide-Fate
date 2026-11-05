/* Original victory-loot selection from the supplied v20.3 source. */
(function(g){'use strict';
const RARITY_LOOT_WEIGHTS={ Common: 100, Uncommon: 50, Rare: 20, Epic: 8, Legendary: 3, Mythic: 1, Unique: 1 };
const VICTORY_LOOT_WEIGHTS={ Common: 100, Uncommon: 75, Rare: 50, Epic: 30, Legendary: 15, Mythic: 8, Unique: 8 };
const VICTORY_BONUS_DROP_CHANCE=0.4;
const LOOT_LOOKUP_TYPES=["item", "weapon", "armor", "helmet", "boots", "accessory", "dropItem"];
function getMonsterLootEntries(monsterInstance, contentDB) {
  const names = Array.isArray(monsterInstance && monsterInstance.loot) ? monsterInstance.loot : [];
  if (!contentDB) return [];
  return names.map((name) => {
    let dbEntry = null;
    for (const typeKey of LOOT_LOOKUP_TYPES) {
      const pool = contentDB[typeKey];
      if (!pool) continue;
      dbEntry = pool.find((e) => e && e.name === name && e.enabled !== false);
      if (dbEntry) break;
    }
    return dbEntry ? { item: dbEntry.name, rarity: dbEntry.rarity || "Common" } : null;
  }).filter(Boolean);
}
function pickWeightedLootItem(lootEntries, randomRoll01, weightTable) {
  if (!lootEntries || !lootEntries.length) return null;
  const table = weightTable || RARITY_LOOT_WEIGHTS; // optional 3rd arg; omitted by Steal => old table, behavior unchanged
  const weighted = lootEntries.map((e) => ({ ...e, weight: table[e.rarity] || 1 }));
  const total = weighted.reduce((s, e) => s + e.weight, 0);
  if (total <= 0) return weighted[0];
  let target = (Number.isFinite(randomRoll01) ? randomRoll01 : 0) * total;
  for (const e of weighted) {
    target -= e.weight;
    if (target <= 0) return e;
  }
  return weighted[weighted.length - 1];
}
function rollMonsterLootDrop(monster, contentDB, randomRoll01, bonusRoll01) {
  const entries = getMonsterLootEntries(monster, contentDB);
  if (!entries.length) return [];
  const first = pickWeightedLootItem(entries, randomRoll01, VICTORY_LOOT_WEIGHTS);
  if (!first) return [];
  const drops = [first.item];
  if (Number.isFinite(bonusRoll01) && bonusRoll01 < VICTORY_BONUS_DROP_CHANCE) {
    // second pick excludes the first drop's name (when another entry exists) so a bonus drop is never a plain repeat
    const rest = entries.length > 1 ? entries.filter((e) => e.item !== first.item) : entries;
    const second = pickWeightedLootItem(rest, bonusRoll01 / VICTORY_BONUS_DROP_CHANCE, VICTORY_LOOT_WEIGHTS);
    if (second) drops.push(second.item);
  }
  return drops;
}
const api={rollMonsterLootDrop,LOOT_LOOKUP_TYPES};g.DecideLegacyLoot=api;if(typeof module!=='undefined')module.exports=api;})(typeof window==='undefined'?globalThis:window);
