const assert=require('node:assert/strict'),{sample}=require('./dist/weapon-motion.js');
const sword={main:'sword',off:'shield'},dual={main:'dagger',off:'dagger'},bow={main:'bow'};
assert(sample(sword,'attack',200).right < -1);assert(sample(sword,'attack',200).left<0);
assert(sample(dual,'attack',180).trailRight);assert(!sample(dual,'attack',180).trailLeft);
assert(sample(dual,'attack',400).trailLeft);assert(!sample(dual,'attack',400).trailRight);
assert(sample(bow,'attack',330).pull>.9);assert(sample(bow,'attack',500).release>0);assert.equal(sample(bow,'attack',500).pull,0);
for(const e of [sword,dual,bow])for(const ms of [0,100,300,500,650,1000])for(const v of Object.values(sample(e,'attack',ms)))if(typeof v==='number')assert(Number.isFinite(v));
assert.equal(sample(dual,'idle',300).trailLeft,false);assert(Math.abs(sample(sword,'attack',650).right)<1e-8);
console.log('PASS weapon-specific timings: shield cover, alternating dual strikes, bow draw/release and recovery');
