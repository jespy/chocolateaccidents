(function(){
  let ctx,drone,timer;
  function init(){if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();const gain=ctx.createGain();gain.gain.value=.018;drone=ctx.createOscillator();drone.type='sawtooth';drone.frequency.value=43;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=120;drone.connect(filter).connect(gain).connect(ctx.destination);drone.start();timer=setInterval(()=>{if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=900+Math.random()*70;g.gain.setValueAtTime(.012,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.04);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.05)},2100)}
  function sting(){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(150,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(47,ctx.currentTime+.7);g.gain.setValueAtTime(.09,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.7);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.7)}
  window.AudioFX={init,sting};
})();
