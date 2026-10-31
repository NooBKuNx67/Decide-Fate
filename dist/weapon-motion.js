/* Render-only weapon choreography. One attack completes within the battle view's 650 ms window. */
(function(g){'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function stroke(p,start,end){return Math.sin(clamp((p-start)/(end-start))*Math.PI);}
function sample(e={},pose='idle',ms=0){const p=clamp(ms/650),ranged=e.main==='bow'||e.main==='crossbow',dual=!!e.off&&e.off!=='shield',attacking=pose==='attack';let right=0,left=0,lean=0,pull=0,release=0;
if(pose==='walk'){right=-Math.sin(ms/1000*12)*.25;left=-right;}
if(pose==='guard'){left=e.off==='shield'?-.95:-.5;right=-.35;}
if(pose==='cast')right=-1.3;
if(attacking){if(ranged){right=-1.35;left=1.05;pull=smooth(p/.55)*(1-smooth((p-.57)/.12));release=smooth((p-.62)/.3);lean=-.06*pull;}
else if(dual){right=-2.3*stroke(p,0,.53);left=2.2*stroke(p,.32,.9);lean=.12*stroke(p,0,.9);}
else{right=-2.4*stroke(p,0,.78);left=e.off==='shield'?-.8: .25*stroke(p,0,.78);lean=.12*stroke(p,0,.85);}}
return {p,right,left,lean,pull,release,ranged,dual,attacking,trailRight:attacking&&!ranged&&p>.16&&p<.5,trailLeft:attacking&&dual&&p>.48&&p<.78};}
const api={sample};g.DecideWeaponMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
