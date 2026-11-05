/* Extracted from user-provided dnd-dm-game-v20.3-login-white-fields.jsx.
Source SHA-256: 64f8707980b464fa73842e6aa999013fdb1156280c8cb8089410bf2ae127342f
Pure economy functions retained verbatim; see LEGACY-MIGRATION.md. */
(function(g){
'use strict';
const EQUIPMENT_SLOTS=[
  { key: "helmet", label: "หมวก", kind: "armor" },
  { key: "armor", label: "เกราะ", kind: "armor" },
  { key: "boots", label: "รองเท้า", kind: "armor" },
  { key: "cloak", label: "ผ้าคลุม", kind: "armor" },
  { key: "leftHand", label: "มือซ้าย", kind: "weapon" },
  { key: "rightHand", label: "มือขวา", kind: "weapon" },
  { key: "accessory1", label: "เครื่องประดับ 1", kind: "accessory" },
  { key: "accessory2", label: "เครื่องประดับ 2", kind: "accessory" },
  { key: "accessory3", label: "เครื่องประดับ 3", kind: "accessory" },
  { key: "accessory4", label: "เครื่องประดับ 4", kind: "accessory" },
];
const NEGOTIATION_BUY_RANGE=[0.75, 1.25];
const NEGOTIATION_SELL_RANGE_OF_SELLPRICE=[0.85, 1.15];
const NEGOTIATION_SELL_RANGE_OF_BUYPRICE=[0.5, 0.75];
const PRICEABLE_CONTENT_TYPES=["item", "dropItem", "weapon", "armor", "helmet", "boots", "accessory"];
const GEAR_CONTENT_TYPES=["weapon", "armor", "helmet", "boots", "accessory"];
function emptySlotItem() { return { name: "-", damageDice: "", ac: 0, atkBonus: 0, bonusDamage: "", special: "", twoHanded: false, proficiencyRef: [], element: "", ability: "" }; }
function emptyEquipment() { return EQUIPMENT_SLOTS.reduce((acc, s) => { acc[s.key] = emptySlotItem(); return acc; }, {}); }
function getArenaPartyInventory(arenaParty) {
  const counts = new Map();
  (Array.isArray(arenaParty) ? arenaParty : []).forEach((c) => {
    if (!c || !Array.isArray(c.items)) return;
    c.items.forEach((raw) => {
      const name = typeof raw === "string" ? raw.trim() : "";
      if (!name) return;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
  });
  return Array.from(counts.entries()).map(([name, quantity]) => ({ itemId: name, name, quantity }));
}
function removeOneSharedItem(arenaParty, itemName) {
  const party = Array.isArray(arenaParty) ? arenaParty : [];
  const ownerIndex = party.findIndex((c) => c && Array.isArray(c.items) && c.items.includes(itemName));
  if (ownerIndex === -1) return party;
  return party.map((c, i) => {
    if (i !== ownerIndex) return c;
    const items = [...c.items];
    const idx = items.indexOf(itemName);
    if (idx !== -1) items.splice(idx, 1);
    return { ...c, items };
  });
}
function getBuyReferenceRange(itemDef) {
  const buy = Math.max(0, Math.round(Number(itemDef && itemDef.buyPrice)) || 0);
  return { min: Math.round(buy * NEGOTIATION_BUY_RANGE[0]), max: Math.round(buy * NEGOTIATION_BUY_RANGE[1]) };
}
function getSellReferenceRange(itemDef) {
  const buy = Math.max(0, Math.round(Number(itemDef && itemDef.buyPrice)) || 0);
  const sell = Math.max(0, Math.round(Number(itemDef && itemDef.sellPrice)) || 0);
  if (sell > 0) return { min: Math.round(sell * NEGOTIATION_SELL_RANGE_OF_SELLPRICE[0]), max: Math.round(sell * NEGOTIATION_SELL_RANGE_OF_SELLPRICE[1]) };
  return { min: Math.round(buy * NEGOTIATION_SELL_RANGE_OF_BUYPRICE[0]), max: Math.round(buy * NEGOTIATION_SELL_RANGE_OF_BUYPRICE[1]) };
}
function clampNegotiatedPrice(rawValue, range, fallback) {
  if (range.max <= 0) return 0;
  const n = Number(rawValue);
  if (!Number.isFinite(n) || n <= 0) return Math.max(0, Math.round(fallback));
  return Math.min(range.max, Math.max(range.min, Math.round(n)));
}
function checkShopPurchase(npc, itemDef, quantity, goldAvailable, negotiatedUnitPrice) {
  if (!npc || npc.enabled === false) return { ok: false, reason: "NPC_NOT_FOUND" };
  if (!itemDef || itemDef.enabled === false) return { ok: false, reason: "ITEM_NOT_FOUND" };
  if (!Array.isArray(npc.items) || !npc.items.includes(itemDef.name)) return { ok: false, reason: "ITEM_NOT_IN_STOCK" };
  // Verification-round fix: quantity must be a genuine positive INTEGER, not merely rounded to one — a
  // non-integer quantity (e.g. an AI/UI bug sending 2.5) previously silently rounded to 3 instead of being
  // rejected. checkCraftRequirements()'s ingredient quantities are admin-authored recipe data (always parsed
  // from a keyvalue text field as whole numbers already), not user/AI input, so this tightening is scoped to
  // the shop's user-facing quantity only.
  const qtyNum = Number(quantity);
  if (!Number.isInteger(qtyNum) || qtyNum < 1) return { ok: false, reason: "INVALID_QUANTITY" };
  const qty = qtyNum;
  const buyRange = getBuyReferenceRange(itemDef);
  if (buyRange.max <= 0) return { ok: false, reason: "ITEM_NOT_FOR_SALE" };
  const unitPrice = clampNegotiatedPrice(negotiatedUnitPrice, buyRange, buyRange.max);
  const totalCost = unitPrice * qty;
  const gold = Math.max(0, Math.round(Number(goldAvailable)) || 0);
  if (totalCost > gold) return { ok: false, reason: "INSUFFICIENT_GOLD" };
  return { ok: true, quantity: qty, unitPrice, totalCost };
}
function resolvePurchaseItem(npc, itemDef, itemType, quantity, party, partyGold, recipientCharId, negotiatedUnitPrice) {
  const check = checkShopPurchase(npc, itemDef, quantity, partyGold, negotiatedUnitPrice);
  if (!check.ok) return { success: false, reason: check.reason, party, gold: partyGold };
  const list = Array.isArray(party) ? party : [];
  const idx = list.findIndex((c) => c && c.id === recipientCharId);
  const targetIndex = idx !== -1 ? idx : 0;
  if (!list[targetIndex]) return { success: false, reason: "NO_RECIPIENT", party, gold: partyGold };
  let nextParty;
  if (GEAR_CONTENT_TYPES.includes(itemType)) {
    nextParty = addGearToStash(list, list[targetIndex].id, itemType, itemDef.name, check.quantity);
  } else {
    nextParty = list.map((c, i) => (i === targetIndex ? { ...c, items: [...(c.items || []), ...Array.from({ length: check.quantity }, () => itemDef.name)] } : c));
  }
  const nextGold = (Math.max(0, Math.round(Number(partyGold)) || 0)) - check.totalCost;
  return { success: true, party: nextParty, gold: nextGold, itemName: itemDef.name, quantity: check.quantity, cost: check.totalCost, unitPrice: check.unitPrice };
}
function checkSellOffer(npc, itemDef, itemType, quantity, party, location, sellerCharId, slotKey, negotiatedUnitPrice) {
  if (!npc || npc.enabled === false) return { ok: false, reason: "NPC_NOT_FOUND" };
  if (!itemDef || itemDef.enabled === false) return { ok: false, reason: "ITEM_NOT_FOUND" };
  const sellRange = getSellReferenceRange(itemDef);
  if (sellRange.max <= 0) return { ok: false, reason: "ITEM_NOT_SELLABLE" };
  if (location === "equipped") {
    const list = Array.isArray(party) ? party : [];
    const seller = list.find((c) => c && c.id === sellerCharId);
    if (!seller) return { ok: false, reason: "NO_SELLER" };
    const expectedRefType = refTypeForSlotKey(slotKey);
    if (!expectedRefType || expectedRefType !== itemType) return { ok: false, reason: "INVALID_SLOT" };
    const worn = (seller.equipment || {})[slotKey];
    if (!worn || worn.name !== itemDef.name || worn.name === "-") return { ok: false, reason: "NOT_EQUIPPED" };
    const unitPrice = clampNegotiatedPrice(negotiatedUnitPrice, sellRange, Math.round((sellRange.min + sellRange.max) / 2));
    return { ok: true, quantity: 1, unitPrice, totalGain: unitPrice };
  }
  const qtyNum = Number(quantity);
  if (!Number.isInteger(qtyNum) || qtyNum < 1) return { ok: false, reason: "INVALID_QUANTITY" };
  const owned = location === "stash"
    ? (getArenaPartyGearStash(party).find((g) => g.refType === itemType && g.name === itemDef.name) || { quantity: 0 }).quantity
    : (getArenaPartyInventory(party).find((i) => i.name === itemDef.name) || { quantity: 0 }).quantity;
  if (owned < qtyNum) return { ok: false, reason: "NOT_OWNED_ENOUGH" };
  const unitPrice = clampNegotiatedPrice(negotiatedUnitPrice, sellRange, Math.round((sellRange.min + sellRange.max) / 2));
  return { ok: true, quantity: qtyNum, unitPrice, totalGain: unitPrice * qtyNum };
}
function resolveSellOffer(npc, itemDef, itemType, quantity, party, partyGold, location, sellerCharId, slotKey, negotiatedUnitPrice) {
  const check = checkSellOffer(npc, itemDef, itemType, quantity, party, location, sellerCharId, slotKey, negotiatedUnitPrice);
  if (!check.ok) return { success: false, reason: check.reason, party, gold: partyGold };
  let nextParty = Array.isArray(party) ? party : [];
  if (location === "equipped") {
    nextParty = removeEquippedGearForSale(nextParty, sellerCharId, slotKey);
  } else if (location === "stash") {
    for (let i = 0; i < check.quantity; i++) nextParty = removeOneGearFromStash(nextParty, itemType, itemDef.name);
  } else {
    for (let i = 0; i < check.quantity; i++) nextParty = removeOneSharedItem(nextParty, itemDef.name);
  }
  const nextGold = (Math.max(0, Math.round(Number(partyGold)) || 0)) + check.totalGain;
  return { success: true, party: nextParty, gold: nextGold, itemName: itemDef.name, quantity: check.quantity, gain: check.totalGain, unitPrice: check.unitPrice };
}
function getIngredientRequirementStatus(recipe, party) {
  const inv = getArenaPartyInventory(party);
  const ingredients = Array.isArray(recipe && recipe.ingredients) ? recipe.ingredients : [];
  const lines = ingredients.map((kv) => {
    const name = (kv && kv.key) ? String(kv.key).trim() : "";
    const required = Math.max(0, Math.round(Number(kv && kv.value)) || 0);
    const owned = (inv.find((i) => i.name === name) || {}).quantity || 0;
    return { name, required, owned, sufficient: required > 0 && owned >= required };
  });
  return { lines, allSufficient: lines.length > 0 && lines.every((l) => l.sufficient) };
}
function checkCraftRequirements(recipe, npc, party, goldAvailable, itemDb) {
  if (!recipe || recipe.enabled === false) return { ok: false, reason: "RECIPE_NOT_FOUND" };
  if (npc) {
    const providers = Array.isArray(recipe.providerNpcIds) ? recipe.providerNpcIds : [];
    if (providers.length > 0 && !providers.includes(npc.id)) return { ok: false, reason: "PROVIDER_NOT_ALLOWED" };
  }
  const items = Array.isArray(itemDb) ? itemDb : [];
  const resultItemDef = items.find((i) => i && i.name === recipe.resultItemName && i.enabled !== false);
  if (!resultItemDef) return { ok: false, reason: "RESULT_ITEM_NOT_FOUND" };
  const ingredientStatus = getIngredientRequirementStatus(recipe, party);
  if (!ingredientStatus.allSufficient) return { ok: false, reason: "INGREDIENTS_INSUFFICIENT", ingredientStatus };
  const cost = Math.max(0, Math.round(Number(recipe.goldCost)) || 0);
  const gold = Math.max(0, Math.round(Number(goldAvailable)) || 0);
  if (cost > gold) return { ok: false, reason: "INSUFFICIENT_GOLD", ingredientStatus };
  const resultQuantity = Math.max(1, Math.round(Number(recipe.resultQuantity)) || 1);
  return { ok: true, cost, resultItemDef, resultQuantity, ingredientStatus };
}
function resolveCraftRecipe(recipe, npc, party, partyGold, itemDb, recipientCharId) {
  const check = checkCraftRequirements(recipe, npc, party, partyGold, itemDb);
  if (!check.ok) return { success: false, reason: check.reason, party, gold: partyGold };
  let nextParty = Array.isArray(party) ? party : [];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  ingredients.forEach((kv) => {
    const name = (kv && kv.key) ? String(kv.key).trim() : "";
    const required = Math.max(0, Math.round(Number(kv && kv.value)) || 0);
    for (let i = 0; i < required; i++) nextParty = removeOneSharedItem(nextParty, name);
  });
  const idx = nextParty.findIndex((c) => c && c.id === recipientCharId);
  const targetIndex = idx !== -1 ? idx : 0;
  if (!nextParty[targetIndex]) return { success: false, reason: "NO_RECIPIENT", party, gold: partyGold };
  nextParty = nextParty.map((c, i) => (i === targetIndex ? { ...c, items: [...(c.items || []), ...Array.from({ length: check.resultQuantity }, () => check.resultItemDef.name)] } : c));
  const nextGold = (Math.max(0, Math.round(Number(partyGold)) || 0)) - check.cost;
  return { success: true, party: nextParty, gold: nextGold, resultItemName: check.resultItemDef.name, resultQuantity: check.resultQuantity, cost: check.cost };
}
function resolveItemEffect(item, actor, target, context) {
  if (!item) return { ok: false, reason: "ITEM_NOT_FOUND" };
  if (item.enabled === false) return { ok: false, reason: "ITEM_DISABLED" };
  if (!target) return { ok: false, reason: "INVALID_TARGET" };
  const effects = [];
  if (item.effectType === "heal_hp") {
    const amount = Math.max(0, Number(item.value) || 0);
    const previous = Number(target.hp) || 0;
    const max = Number(target.maxHp) || 0;
    const next = Math.min(previous + amount, max);
    effects.push({ type: "hp", previous, next, delta: next - previous });
  } else if (item.effectType === "restore_mp") {
    const amount = Math.max(0, Number(item.value) || 0);
    const previous = Number(target.mp) || 0;
    const max = Number(target.maxMp) || 0;
    const next = Math.min(previous + amount, max);
    effects.push({ type: "mp", previous, next, delta: next - previous });
  } else {
    // Prompt 07B2A §9 — e.g. "cure_status" (see the Antidote preset + CONTENT_SCHEMAS.item comment above): a
    // real, enabled item with an effectType this Engine does not resolve this round. Deliberately NOT treated
    // as ITEM_NOT_FOUND/ITEM_DISABLED — the item exists and is enabled, its effect type is simply unsupported
    // here — and deliberately not invented as a fake success either.
    return { ok: false, reason: "ITEM_UNSUPPORTED_EFFECT" };
  }
  return { ok: true, itemId: item.name, targetId: target.id, effects };
}
function getArenaPartyGearStash(party) {
  const counts = new Map();
  (Array.isArray(party) ? party : []).forEach((c) => {
    if (!c || !Array.isArray(c.gearStash)) return;
    c.gearStash.forEach((g) => {
      if (!g || !g.refType || !g.name) return;
      const key = `${g.refType}::${g.name}`;
      const existing = counts.get(key) || { refType: g.refType, name: g.name, quantity: 0 };
      existing.quantity += 1;
      counts.set(key, existing);
    });
  });
  return Array.from(counts.values());
}
function addGearToStash(party, charId, refType, name, quantity) {
  const list = Array.isArray(party) ? party : [];
  const idx = list.findIndex((c) => c && c.id === charId);
  const targetIndex = idx !== -1 ? idx : 0;
  if (!list[targetIndex]) return list;
  const n = Math.max(1, Math.round(Number(quantity)) || 1);
  const copies = Array.from({ length: n }, () => ({ refType, name }));
  return list.map((c, i) => (i === targetIndex ? { ...c, gearStash: [...(c.gearStash || []), ...copies] } : c));
}
function removeOneGearFromStash(party, refType, name) {
  const list = Array.isArray(party) ? party : [];
  const ownerIndex = list.findIndex((c) => Array.isArray(c.gearStash) && c.gearStash.some((g) => g && g.refType === refType && g.name === name));
  if (ownerIndex === -1) return list;
  return list.map((c, i) => {
    if (i !== ownerIndex) return c;
    const stash = [...c.gearStash];
    const idx = stash.findIndex((g) => g && g.refType === refType && g.name === name);
    if (idx !== -1) stash.splice(idx, 1);
    return { ...c, gearStash: stash };
  });
}
function refTypeForSlotKey(slotKey) {
  if (slotKey === "leftHand" || slotKey === "rightHand") return "weapon";
  if (/^accessory[1-4]$/.test(slotKey)) return "accessory";
  if (slotKey === "armor" || slotKey === "helmet" || slotKey === "boots") return slotKey;
  return null;
}
function removeEquippedGearForSale(party, charId, slotKey) {
  const list = Array.isArray(party) ? party : [];
  const idx = list.findIndex((c) => c && c.id === charId);
  if (idx === -1) return list;
  const char = list[idx];
  const currentEquipment = char.equipment || emptyEquipment();
  const previous = currentEquipment[slotKey];
  if (!previous || !previous.name || previous.name === "-") return list;
  const isWeaponSlot = slotKey === "leftHand" || slotKey === "rightHand";
  const nextEquipment = (isWeaponSlot && previous.twoHanded)
    ? { ...currentEquipment, leftHand: emptySlotItem(), rightHand: emptySlotItem() }
    : { ...currentEquipment, [slotKey]: emptySlotItem() };
  return list.map((c, i) => (i === idx ? { ...c, equipment: nextEquipment } : c));
}
const api={resolveItemEffect,getArenaPartyInventory,removeOneSharedItem,getArenaPartyGearStash,getBuyReferenceRange,getSellReferenceRange,checkShopPurchase,resolvePurchaseItem,checkSellOffer,resolveSellOffer,getIngredientRequirementStatus,checkCraftRequirements,resolveCraftRecipe,PRICEABLE_CONTENT_TYPES,GEAR_CONTENT_TYPES};g.DecideLegacyEconomy=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
