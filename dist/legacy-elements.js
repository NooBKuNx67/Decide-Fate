/* Element helpers retained verbatim from the supplied v20.3 source. */
(function(g){'use strict';
function getActionElement(action) {
  const el = action && action.element;
  return typeof el === "string" && el.trim() ? el.trim() : null;
}
function normalizeElementTag(s) { return String(s || "").trim().toLowerCase(); }
function getElementInteraction(element, monster) {
  if (!element) return null;
  if (!monster) return null;
  const normalized = normalizeElementTag(element);
  const weaknesses = Array.isArray(monster?.elementWeakness) ? monster.elementWeakness.map(normalizeElementTag) : [];
  const immunities = Array.isArray(monster?.immunities) ? monster.immunities.map(normalizeElementTag) : [];
  if (immunities.includes(normalized)) return { type: "immunity", multiplier: 0, element };
  if (weaknesses.includes(normalized)) return { type: "weakness", multiplier: 1.5, element };
  return { type: "neutral", multiplier: 1, element };
}
function applyElementModifier(total, interaction) {
  if (!interaction) return { total, isImmune: false };
  if (interaction.type === "immunity") return { total: 0, isImmune: true };
  if (Number.isFinite(interaction.multiplier) && interaction.multiplier !== 1) {
    return { total: Math.round(total * interaction.multiplier), isImmune: false };
  }
  return { total, isImmune: false };
}
const api={getActionElement,normalizeElementTag,getElementInteraction,applyElementModifier};g.DecideLegacyElements=api;if(typeof module!=='undefined')module.exports=api;})(typeof window==='undefined'?globalThis:window);
