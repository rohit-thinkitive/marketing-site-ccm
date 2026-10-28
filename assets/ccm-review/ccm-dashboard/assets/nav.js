/* eCareMD demo shell helper (loaded by every screen)
   1) relocates + rebrands the logo to Medarch, top-left above the sidebar
   2) scales the 1848px design down to fit whatever width it is embedded in
   3) wires sidebar clicks to the parent cycler                             */
(function(){
  var DESIGN_W = 1440;

  /* ---- 1. Medarch logo, moved into the top-left (above the sidebar) ---- */
  function brand(){
    if(document.querySelector('.side-logo')) return;      /* already done */
    var side = document.querySelector('.sidebar');
    var img  = document.querySelector('.topbar img.logo');
    if(!side || !img) return;
    img.src = '../vendor/medarch-logo-new.svg';
    img.alt = 'Medarch';
    var box = document.createElement('div');
    box.className = 'side-logo';
    side.insertBefore(box, side.firstChild);
    box.appendChild(img);
  }

  /* ---- 2. wrap ALL page content in one fixed 1440x918 canvas and scale THAT
     to COVER its own viewport. Scaling a wrapper (not just .app) makes every
     position:fixed child (modal, overlay, support button) resolve against the
     canvas — so they scale and stay in place instead of overflowing the frame.
     Uses this document's OWN size, so it is immune to host layout timing and
     Math.max always fills width AND height with no gap. ---- */
  var DESIGN_H = 918;
  function getCanvas(){
    var c = document.querySelector('.ecm-canvas');
    if(c) return c;
    c = document.createElement('div');
    c.className = 'ecm-canvas';
    c.style.cssText = 'position:relative;width:' + DESIGN_W + 'px;height:' + DESIGN_H +
                      'px;transform-origin:top left';
    while(document.body.firstChild){ c.appendChild(document.body.firstChild); }
    document.body.appendChild(c);
    return c;
  }
  function fit(){
    var c = getCanvas();
    var s = Math.max(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
    c.style.transform = 'scale(' + s + ')';
  }

  /* ---- 3. sidebar → parent cycler navigation ---- */
  var map = {
    "Dashboard":"dashboard","Patients":"patients",
    "Billing & Claims":"billing","Library":"library"
  };
  function wireNav(){
    document.querySelectorAll('.snav a').forEach(function(a){
      var label = (a.textContent||"").replace(/\s+/g,' ').trim();
      if(!map[label]) return;
      a.style.cursor = "pointer";
      a.addEventListener("click", function(ev){
        ev.preventDefault();
        try{ parent.postMessage({ecmNav:map[label]},"*"); }catch(_){}
      });
    });
  }

  /* ---- 4. tell the host to pause the guided tour while the user interacts ---- */
  var lastPing = 0;
  function ping(e){
    if(e && e.isTrusted === false) return;          /* ignore synthetic events */
    var now = +new Date();
    if(now - lastPing < 300) return; lastPing = now;
    try{ parent.postMessage({ecmUser:1}, '*'); }catch(_){}
  }
  ['pointerdown','pointermove','wheel','keydown','touchstart'].forEach(function(ev){
    window.addEventListener(ev, ping, {passive:true});
  });

  function run(){ brand(); fit(); wireNav(); requestAnimationFrame(fit); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  window.addEventListener('message', function(e){ if(e.data && e.data.ecmReplay){ brand(); fit(); } });
})();
