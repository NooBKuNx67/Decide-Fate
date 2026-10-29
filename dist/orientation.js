/* Keep touch devices in landscape without depending on browser fullscreen locks. */
(()=>{
  const portrait=matchMedia('(pointer: coarse) and (orientation: portrait)');
  const overlay=document.getElementById('rotateScreen');
  const screens=[document.getElementById('loginScreen'),document.getElementById('signedIn')];
  let previousFocus=null;
  function update(){
    const blocked=portrait.matches;
    if(blocked&&overlay.hidden)previousFocus=document.activeElement;
    overlay.hidden=!blocked;
    screens.forEach(screen=>screen.inert=blocked);
    document.documentElement.classList.toggle('portrait-blocked',blocked);
    if(blocked)overlay.focus({preventScroll:true});
    else if(previousFocus?.isConnected){previousFocus.focus({preventScroll:true});previousFocus=null;}
  }
  portrait.addEventListener('change',update);
  update();
})();
