/* Original monster passive aggregation helpers from supplied v20.3 source. */
(function(g){'use strict';
function getCharacterEnabledSkillDbEntries(char, contentDB) {
  const names = (char && Array.isArray(char.skills)) ? char.skills : [];
  const dbSkills = (contentDB && contentDB.skill) || [];
  return names.map((s) => {
    const name = typeof s === "string" ? s : (s && s.name);
    if (!name) return null;
    return dbSkills.find((e) => e.name === name && e.enabled !== false) || null;
  }).filter(Boolean);
}
function withMonsterEffectiveStats(monster, contentDB) {
  if (!monster || monster.__monsterEffectiveStatsView) return monster;
  const entries = getCharacterEnabledSkillDbEntries({ skills: monster.skills }, contentDB);
  if (!entries.length) return monster;
  let attackPct = 0, defenseBonus = 0, drBonus = 0, magicDefBonus = 0, accBonus = 0, evaBonus = 0;
  entries.forEach((e) => {
    if (Number.isFinite(e.monsterAttackBonusPercent)) attackPct += e.monsterAttackBonusPercent;
    if (Number.isFinite(e.monsterDefenseBonus)) defenseBonus += e.monsterDefenseBonus;
    if (Number.isFinite(e.monsterDamageReductionBonus)) drBonus += e.monsterDamageReductionBonus;
    if (Number.isFinite(e.monsterMagicDefenseBonus)) magicDefBonus += e.monsterMagicDefenseBonus;
    if (Number.isFinite(e.monsterAccuracyBonus)) accBonus += e.monsterAccuracyBonus;
    if (Number.isFinite(e.monsterEvasionBonus)) evaBonus += e.monsterEvasionBonus;
  });
  if (!attackPct && !defenseBonus && !drBonus && !magicDefBonus && !accBonus && !evaBonus) return monster;
  return {
    ...monster,
    attack: Math.round((Number(monster.attack) || 0) * (1 + attackPct / 100)),
    defense: (Number(monster.defense) || 0) + defenseBonus,
    damageReduction: Math.max(0, (Number(monster.damageReduction) || 0) + drBonus),
    magicDefense: (Number(monster.magicDefense) || 0) + magicDefBonus,
    accuracy: (Number(monster.accuracy) || 0) + accBonus,
    evasion: (Number(monster.evasion) || 0) + evaBonus,
    __monsterEffectiveStatsView: true,
    __monsterAttackBonusPercent: attackPct,
  };
}
const api={getCharacterEnabledSkillDbEntries,withMonsterEffectiveStats};g.DecideLegacyMonsterPassives=api;if(typeof module!=='undefined')module.exports=api;})(typeof window==='undefined'?globalThis:window);
