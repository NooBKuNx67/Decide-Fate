/* Ephemeral execution policy and receipts. Nothing here is serialized into a save. */
(function(g,factory){const api=factory();g.DecideCombatContext=api;if(typeof module!=='undefined')module.exports=api;})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const modes=new WeakSet(),traces=new WeakMap();
  const copy=x=>JSON.parse(JSON.stringify(x));
  function active(e){return modes.has(e);}
  function withoutPositions(e,fn){const prior=active(e);modes.add(e);try{return fn();}finally{if(!prior)modes.delete(e);}}
  function add(e,event){const trace=traces.get(e);if(trace)trace.push(copy(event));}
  function units(e){return e.units.map(u=>({id:u.id,name:u.name,side:u.side,hp:u.hp,mp:u.mana,ap:u.action,armor:u.armor,effects:copy(u.effects || {})}));}
  function capture(e,fn){const prior=traces.get(e),events=[],before=units(e),seed=e.seed;traces.set(e,events);try{fn();return {encounter:e.id,round:e.round,seedBefore:seed,seedAfter:e.seed,before,after:units(e),events};}finally{if(prior)traces.set(e,prior);else traces.delete(e);}}
  return {active,withoutPositions,add,capture};
});
