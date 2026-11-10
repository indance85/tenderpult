(function(){
  var burger=document.querySelector('.burger'),menu=document.getElementById('menu'),dock=document.getElementById('dock');
  function setMenu(open){
    menu.classList.toggle('is-open',open);
    burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  }
  burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true')});
  menu.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&burger.getAttribute('aria-expanded')==='true'){setMenu(false);burger.focus()}
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.top'))setMenu(false);
  });

  // Кнопка внизу экрана видна, только когда основные кнопки не на экране
  if('IntersectionObserver' in window){
    var seen=new Set();
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){en.isIntersecting?seen.add(en.target):seen.delete(en.target)});
      dock.classList.toggle('is-on',seen.size===0);
    });
    ['hero','offer','foot'].forEach(function(id){io.observe(document.getElementById(id))});
  }

  // Сравнение тем кабинета: линию двигают мышью, пальцем и стрелками
  var compare=(function(){
    var box=document.getElementById('compare'),range=box.querySelector('.cmp-range'),bar=box.parentNode.querySelector('.w-bar');
    var api={stopHint:null,set:set};
    function set(x){
      x=Math.max(0,Math.min(100,x));
      box.style.setProperty('--x',x+'%');
      range.value=x;
      bar.dataset.side=x>=50?'night':'day';
    }
    function at(e){var r=box.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}
    function stop(){if(api.stopHint)api.stopHint()}
    function end(){box.classList.remove('is-drag')}
    box.addEventListener('pointerdown',function(e){
      if(e.button)return;
      stop();
      box.setPointerCapture(e.pointerId);
      box.classList.add('is-drag');
      if(e.pointerType==='mouse')at(e); // палец может начинать прокрутку страницы
    });
    box.addEventListener('pointermove',function(e){if(box.classList.contains('is-drag'))at(e)});
    box.addEventListener('pointerup',function(e){
      if(box.classList.contains('is-drag'))at(e);
      end();
      range.focus({preventScroll:true}); // после отпускания работают стрелки
    });
    box.addEventListener('pointercancel',end);
    range.addEventListener('input',function(){stop();set(+range.value)});
    return api;
  })();

  /* Сцены строятся в конечном состоянии: без анимации страница остаётся цельной */
  var scene=buildIso();
  var sheetRows=buildSheet();
  buildBlueprint();
  fitDim();
  window.addEventListener('resize',fitDim);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitDim);

  if(!window.gsap||!window.ScrollTrigger)return;
  document.documentElement.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});
  gsap.defaults({ease:'none'});

  splitWords();
  intro();
  reveals();
  heroFx();
  stepsFx();
  featureFx();
  siteFx();
  blueprintFx();
  teamFx();
  offerFx();
  navFx();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh()});

  function splitWords(){
    document.querySelectorAll('h2,[data-words]').forEach(function(host){
      var words=host.hasAttribute('data-words');
      Array.prototype.slice.call(host.childNodes).forEach(function(n){
        if(n.nodeType!==3)return;
        var frag=document.createDocumentFragment();
        n.textContent.split(/( +)/).forEach(function(t){
          if(!t)return;
          if(/^ +$/.test(t)){frag.appendChild(document.createTextNode(' '));return}
          var o=document.createElement('span');
          if(words){o.className='fw';o.textContent=t}
          else{o.className='w';var i=document.createElement('span');i.className='wi';i.textContent=t;o.appendChild(i)}
          frag.appendChild(o);
        });
        host.replaceChild(frag,n);
      });
    });
  }

  function intro(){
    var el=document.querySelector('[data-words]');
    gsap.fromTo(el.querySelectorAll('.fw'),{opacity:.14},{opacity:1,stagger:.12,duration:.5,
      scrollTrigger:{trigger:el,start:'top 82%',end:'bottom 48%',scrub:.5}});
  }

  function reveals(){
    gsap.utils.toArray('h2').forEach(function(h){
      gsap.fromTo(h.querySelectorAll('.wi'),{yPercent:112},{yPercent:0,duration:.85,ease:'power3.out',stagger:.045,
        scrollTrigger:{trigger:h,start:'top 86%',toggleActions:'play none none reverse'}});
    });
    gsap.utils.toArray('.head>p,.feature-copy>p,.team-copy>p,.offer-grid>div>p:not(.pill),.role-note,section:not(.hero) .pill').forEach(function(el){
      gsap.fromTo(el,{y:26,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 90%',toggleActions:'play none none reverse'}});
    });
  }

  function heroFx(){
    var hero=document.getElementById('hero');
    gsap.fromTo('.stamp-hero',{scale:2.6,opacity:0,rotation:10},{scale:1,opacity:.95,rotation:-14,duration:.42,ease:'power4.in',delay:1.15});
    gsap.to('.stamp-hero',{y:-130,scrollTrigger:{trigger:hero,start:'top top',end:'bottom 30%',scrub:.8}});
    gsap.fromTo('.frame',{rotationX:20,scale:.9},{rotationX:0,scale:1,
      scrollTrigger:{trigger:'.art',start:'top 96%',end:'top 22%',scrub:.6}});
    gsap.to('.hero-grid',{yPercent:12,scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
    gsap.utils.toArray('.fl').forEach(function(f){
      gsap.to(f,{y:+f.dataset.speed,rotate:'+=26',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 30%',scrub:.8}});
    });
    var sweep={x:50};
    var hint=gsap.timeline({scrollTrigger:{trigger:'.compare',start:'top 55%',once:true},defaults:{ease:'power2.inOut'},onUpdate:function(){compare.set(sweep.x)}})
      .to(sweep,{x:76,duration:.7,delay:.25}).to(sweep,{x:24,duration:1}).to(sweep,{x:50,duration:.7});
    compare.stopHint=function(){hint.kill();compare.stopHint=null};
    gsap.from('.frame-key',{rotate:-70,scale:.5,scrollTrigger:{trigger:'.art',start:'top 90%',end:'top 25%',scrub:.6}});

    if(matchMedia('(hover:hover) and (pointer:fine)').matches){
      var rx=gsap.quickTo('.tilt','rotationX',{duration:.8,ease:'power3'}),ry=gsap.quickTo('.tilt','rotationY',{duration:.8,ease:'power3'});
      var gx=gsap.quickTo('.hero-glow','x',{duration:.9,ease:'power3'}),gy=gsap.quickTo('.hero-glow','y',{duration:.9,ease:'power3'});
      var depth=gsap.utils.toArray('.fl>div').map(function(d){return {
        x:gsap.quickTo(d.parentNode,'x',{duration:1.1,ease:'power3'}),depth:+d.parentNode.dataset.depth}});
      hero.addEventListener('pointermove',function(e){
        var r=hero.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
        if(e.target.closest('.compare')){ry(0);rx(0)}else{ry(px*7);rx(-py*5)}
        gx(e.clientX-r.left);gy(e.clientY-r.top);
        depth.forEach(function(d){d.x(px*d.depth*2)});
      });
      hero.addEventListener('pointerleave',function(){rx(0);ry(0)});
    }
  }

  function stepsFx(){
    var steps=gsap.utils.toArray('.step');
    var tl=gsap.timeline({scrollTrigger:{trigger:'.steps',start:'top 82%',end:'bottom 58%',scrub:.6}});
    steps.forEach(function(s,i){
      var at=i*1.1;
      tl.fromTo(s,{'--n':0},{'--n':1,duration:.25,ease:'back.out(3)'},at)
        .fromTo(s,{'--p':0},{'--p':1,duration:1},at+.08)
        .fromTo(s.querySelectorAll('.step-mark,.step-art,h3,p'),{y:22,opacity:0},{y:0,opacity:1,stagger:.08,duration:.45,ease:'power2.out'},at+.05);
    });
    tl.fromTo('.key-swing',{rotation:-22,x:-16,transformOrigin:'22% 50%'},{rotation:0,x:0,duration:.8,ease:'back.out(1.6)'},.2)
      .fromTo('.sd',{scale:0,transformOrigin:'50% 50%'},{scale:1,stagger:.08,duration:.15,ease:'back.out(3)'},1.3)
      .fromTo('.ck',{x:-14,opacity:0},{x:0,opacity:1,stagger:.22,duration:.3},2.5);
  }

  function featureFx(){
    var mm=gsap.matchMedia();
    mm.add('(min-width:1081px) and (min-height:820px)',function(){build('.feature-track','top 104px','bottom bottom')});
    mm.add('not all and (min-width:1081px), not all and (min-height:820px)',function(){build('.estimate','top 92%','bottom 80%')});
    function build(trigger,start,end){
      var tl=gsap.timeline({scrollTrigger:{trigger:trigger,start:start,end:end,scrub:.7}});
      var rows=sheetRows,keys=rows.filter(function(r){return r.classList.contains('key')});
      tl.fromTo('.scan',{top:'0%',opacity:1},{top:'100%',duration:4},0).to('.scan',{opacity:0,duration:.2},4);
      rows.forEach(function(r,i){if(r.classList.contains('key'))tl.fromTo(r,{backgroundColor:'rgba(217,238,255,0)'},{backgroundColor:'rgba(217,238,255,1)',duration:.25},i/rows.length*4)});
      tl.to(rows.filter(function(r){return !r.classList.contains('key')}),{opacity:.28,duration:.8},3.8)
        .to('.sheet',{scale:.93,rotation:-2.6,opacity:.55,y:-8,duration:1.4,ease:'power1.inOut'},4.4)
        .fromTo('.paper',{y:90,autoAlpha:0,scale:.96},{y:0,autoAlpha:1,scale:1,duration:1.5,ease:'power2.out'},4.6)
        .fromTo('.paper-title .badge',{scale:2.4,opacity:0},{scale:1,opacity:1,duration:.3,ease:'power4.in'},7.4)
        .fromTo('.work-row',{x:-26,autoAlpha:0},{x:0,autoAlpha:1,stagger:.42,duration:.6,ease:'power2.out'},5.6)
        .fromTo('.paper-foot',{y:14,autoAlpha:0},{y:0,autoAlpha:1,duration:.7},8.2)
        .fromTo('.est-note',{autoAlpha:0},{autoAlpha:1,duration:.4},9);
      gsap.utils.toArray('.checks li').forEach(function(li,i){
        var at=.6+i*3;
        tl.fromTo(li,{opacity:.32},{opacity:1,duration:.5},at).fromTo(li.querySelector('.check'),{scale:.3,rotate:-40},{scale:1,rotate:0,duration:.5,ease:'back.out(2.4)'},at);
      });
      tl.to({},{duration:.6},9.6);
      return function(){gsap.set('.scan',{clearProps:'all'})};
    }
  }

  function siteFx(){
    var mob=matchMedia('(max-width:640px)').matches;
    gsap.fromTo('#site',{clipPath:'inset(0% '+(mob?'2.4%':'3.4%')+' 0% round 32px)'},{clipPath:'inset(0% 0% 0% round 0px)',
      scrollTrigger:{trigger:'#site',start:'top 96%',end:'top 34%',scrub:.5}});

    var S=scene,tl=gsap.timeline({scrollTrigger:{trigger:'#story',start:'top 62%',end:'bottom 86%',scrub:.8}});
    tl.fromTo(S.found,{y:26,opacity:0},{y:0,opacity:1,duration:.7,ease:'power2.out'},0);
    S.floors.forEach(function(f,i){
      var at=.8+i*1.05;
      tl.fromTo(f,{y:-64,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out'},at)
        .fromTo(S.scaffold[i],{opacity:0},{opacity:1,duration:.3},at+.5);
    });
    // Скрытые работы: здание становится прозрачным, виден фундамент и арматура
    tl.to(S.body,{opacity:.16,duration:.6},3.7)
      .to(S.rebar,{opacity:1,duration:.5},3.9)
      .to(S.scan,{opacity:1,duration:.3},4.1)
      .fromTo(S.flash,{opacity:.9,attr:{r:8}},{opacity:0,attr:{r:64},duration:.7,immediateRender:false},4.4)
      .fromTo(S.pin,{scale:0,transformOrigin:'50% 100%'},{scale:1,duration:.4,ease:'back.out(2.4)'},4.7)
      .to(S.pin,{opacity:1,duration:.15},4.7)
      .to([S.scan,S.pin],{opacity:0,duration:.4},5.8)
      .to(S.rebar,{opacity:0,duration:.4},5.9)
      .to(S.body,{opacity:1,duration:.6},5.9);
    tl.fromTo(S.wins,{fill:'#8ea6cf'},{fill:function(i,t){return t.dataset.lit},duration:.35,stagger:{each:2.6/S.wins.length}},6.7)
      .fromTo(S.sheets,{opacity:0,y:-22},{opacity:1,y:0,duration:.25,stagger:.19,ease:'power2.out'},6.8)
      .fromTo('#docs-art g path',{fillOpacity:0},{fillOpacity:1,duration:.2,stagger:.33},6.9)
      .fromTo(S.roof,{y:-50,opacity:0},{y:0,opacity:1,duration:.6,ease:'power2.out'},8.3)
      .to(S.scaffold,{opacity:0,duration:.5},8.9)
      .fromTo(S.trees,{scale:0,transformOrigin:'50% 100%'},{scale:1,duration:.4,stagger:.08,ease:'back.out(2)'},9)
      .fromTo(S.done,{scale:2.6,opacity:0,rotation:-26,transformOrigin:'50% 50%'},{scale:1,opacity:1,rotation:-12,duration:.35,ease:'power4.in'},9)
      .fromTo('.route',{strokeDashoffset:1},{strokeDashoffset:0,duration:3},.2);

    tl.to({},{duration:.7},9.6);

    function step(){
      var t=tl.time(),i=Math.max(0,Math.min(S.floors.length-1,Math.floor((t-.8)/1.05)));
      var phase=Math.max(0,Math.min(1,(t-.8-i*1.05)/.8));
      var target=t>8.2?64:S.topY(i)-60+(1-phase)*40;
      gsap.set(S.cable,{attr:{y2:target}});gsap.set(S.hook,{attr:{transform:'translate(0 '+target+')'},autoAlpha:t>8.2?0:1});
      var k=Math.min(1,t/10)*3%1,p=S.path;var seg=k*(p.length-1),a=Math.floor(seg),b=Math.min(p.length-1,a+1),u=seg-a;
      gsap.set(S.truck,{attr:{transform:'translate('+(p[a][0]+(p[b][0]-p[a][0])*u)+' '+(p[a][1]+(p[b][1]-p[a][1])*u)+')'}});
    }
    tl.eventCallback('onUpdate',step);step();

    gsap.utils.toArray('.tile').forEach(function(t,i,all){
      ScrollTrigger.create({trigger:t,start:'top 66%',end:i===all.length-1?'bottom top':'bottom 34%',toggleClass:{targets:t,className:'is-active'}});
    });
  }

  function teamFx(){
    var tl=gsap.timeline({scrollTrigger:{trigger:'.net',start:'top 88%',end:'top 42%',scrub:.6}});
    tl.fromTo('.nh',{scale:.3,transformOrigin:'50% 50%'},{scale:1,duration:.5,ease:'back.out(2)'},0)
      .fromTo('.nl',{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,stagger:.12,duration:.7},.2)
      .fromTo('.nn',{scale:0,transformOrigin:'50% 50%'},{scale:1,stagger:.12,duration:.4,ease:'back.out(2.4)'},.5);
    var wide=matchMedia('(min-width:1081px)').matches;
    gsap.fromTo('.role',{x:wide?60:0,y:wide?0:26,opacity:0},{x:0,y:0,opacity:1,stagger:.3,duration:.6,ease:'power2.out',
      scrollTrigger:{trigger:'.roles',start:'top 80%',end:'bottom 62%',scrub:.6}});
    gsap.fromTo('.role b',{scale:0},{scale:1,stagger:.3,duration:.4,ease:'back.out(2.4)',
      scrollTrigger:{trigger:'.roles',start:'top 78%',end:'bottom 62%',scrub:.6}});
  }

  function offerFx(){
    var mob=matchMedia('(max-width:640px)').matches;
    gsap.fromTo('#offer',{clipPath:'inset(0% '+(mob?'2.4%':'3.4%')+' 0% round 32px)'},{clipPath:'inset(0% 0% 0% round 0px)',
      scrollTrigger:{trigger:'#offer',start:'top 96%',end:'top 40%',scrub:.5}});
    gsap.fromTo('.offer-key',{rotate:-68,x:160,scale:.7},{rotate:-14,x:0,scale:1,
      scrollTrigger:{trigger:'#offer',start:'top 90%',end:'top 18%',scrub:.8}});
    gsap.fromTo('.stamp-offer',{scale:2.6,opacity:0,rotation:12},{scale:1,opacity:.96,rotation:-11,duration:.42,ease:'power4.in',
      scrollTrigger:{trigger:'#offer',start:'top 28%',toggleActions:'play none none reverse'}});
    gsap.fromTo('.offer-act>*',{y:34,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:'power2.out',stagger:.12,
      scrollTrigger:{trigger:'.offer-act',start:'top 94%',toggleActions:'play none none reverse'}});
  }

  function navFx(){
    var bar=document.querySelector('.top-in');
    ScrollTrigger.create({start:0,end:'max',onUpdate:function(s){bar.style.setProperty('--p',s.progress.toFixed(3))}});
    document.querySelectorAll('.nav>a[href^="#"]').forEach(function(a){
      var t=document.querySelector(a.getAttribute('href'));
      ScrollTrigger.create({trigger:t,start:'top 50%',end:'bottom 50%',toggleClass:{targets:a,className:'is-here'}});
    });
  }

  /* Изометрическая стройка */
  function buildIso(){
    var svg=document.getElementById('iso'),NS='http://www.w3.org/2000/svg',U=38,CX=335,CY=330,W=6,D=5,N=7,H=.85;
    function P(x,y,z){return [(x-y)*U*.866+CX,(x+y)*U*.5-z*U+CY]}
    function str(a){return a.map(function(p){return P(p[0],p[1],p[2]).map(function(n){return n.toFixed(1)}).join(',')}).join(' ')}
    function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}
    function g(p,a){return el('g',a||{},p||svg)}
    function poly(p,a,fill,extra){var o={points:str(a),fill:fill};for(var k in extra||{})o[k]=extra[k];return el('polygon',o,p)}
    function box(p,x,y,z,w,d,h,c){
      poly(p,[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],c[1]);
      poly(p,[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],c[2]);
      poly(p,[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],c[0]);
    }
    var M=1.6,x0=-M,y0=-M,pw=W+2*M,pd=D+2*M;

    var plot=g();
    box(plot,x0,y0,-.55,pw,pd,.55,['#123f9a','#0d3080','#0f368a']);
    poly(plot,[[x0,y0+pd,-.55],[x0+pw,y0+pd,-.55],[x0+pw,y0+pd,0],[x0,y0+pd,0]],'url(#iso-hatch)');
    poly(plot,[[x0+pw,y0,-.55],[x0+pw,y0+pd,-.55],[x0+pw,y0+pd,0],[x0+pw,y0,0]],'url(#iso-hatch)');
    for(var i=1;i<pw;i++)el('polyline',{points:str([[x0+i,y0,0],[x0+i,y0+pd,0]]),fill:'none',stroke:'#6cc4ff','stroke-opacity':.13},plot);
    for(i=1;i<pd;i++)el('polyline',{points:str([[x0,y0+i,0],[x0+pw,y0+i,0]]),fill:'none',stroke:'#6cc4ff','stroke-opacity':.13},plot);

    var route=[[-.9,5.9],[6.9,5.9],[6.9,-.9]].map(function(p){return P(p[0],p[1],0)});
    el('polyline',{points:route.map(function(p){return p.join(',')}).join(' '),fill:'none',stroke:'#6cc4ff','stroke-opacity':.65,'stroke-width':2,'stroke-dasharray':'6 8'},plot);

    // Кран
    var crane=g(null,{stroke:'#6cc4ff','stroke-width':2.2,fill:'none','stroke-linejoin':'round'}),bx=92,tw=8;
    el('path',{d:'M'+(bx-tw)+' 470V52M'+(bx+tw)+' 470V52'},crane);
    var z='';for(var yy=470;yy>60;yy-=24)z+='M'+(bx-tw)+' '+yy+'L'+(bx+tw)+' '+(yy-12)+'L'+(bx-tw)+' '+(yy-24);
    el('path',{d:z,'stroke-width':1.2},crane);
    el('path',{d:'M'+(bx-46)+' 52H526M'+(bx-46)+' 62H'+(bx+tw)+'M'+bx+' 18V52M'+bx+' 18L'+(bx-46)+' 52M'+bx+' 18L430 52'},crane);
    el('rect',{x:bx-62,y:60,width:36,height:26,rx:3,fill:'#6cc4ff',stroke:'none'},crane);
    el('rect',{x:bx+tw,y:62,width:26,height:22,rx:3,fill:'#bfe4ff',stroke:'none'},crane);
    el('rect',{x:bx-22,y:466,width:44,height:12,rx:2,fill:'#8fb0e0',stroke:'none'},crane);

    var found=g();
    box(found,-.18,-.18,0,W+.36,D+.36,.36,['#7fa3d9','#4f78bf','#3a62a8']);

    var rebar=g(null,{opacity:0,stroke:'#6cc4ff','stroke-width':1.5});
    for(i=0;i<=W;i++)el('polyline',{points:str([[i,0,.36],[i,D,.36]]),fill:'none'},rebar);
    for(i=0;i<=D;i++)el('polyline',{points:str([[0,i,.36],[W,i,.36]]),fill:'none'},rebar);
    for(i=0;i<=W;i++)for(var j=0;j<=D;j++){var q=P(i,j,.36);el('circle',{cx:q[0],cy:q[1],r:2.6,fill:'#bfe4ff',stroke:'none'},rebar)}

    var body=g(),floors=[],wins=[],scaffold=[],idx=0;
    var scafG=g();
    function topY(i){return P(W/2,D/2,(i+1)*H)[1]}
    for(var f=0;f<N;f++){
      var fg=g(body),z0=.36+f*H;
      box(fg,0,0,z0,W,D,H,['#f4f8fe','#dfe9f7','#b9cce8']);
      poly(fg,[[0,D,z0],[W,D,z0],[W,D,z0+.09],[0,D,z0+.09]],'#ffffff');
      poly(fg,[[W,0,z0],[W,D,z0],[W,D,z0+.09],[W,0,z0+.09]],'#d3e0f2');
      var wn=W,dn=D,ww=.58,wh=.46,wz=z0+.22;
      for(var k=0;k<wn;k++){
        var a=k+.5-ww/2,w1=poly(fg,[[a,D,wz],[a+ww,D,wz],[a+ww,D,wz+wh],[a,D,wz+wh]],'',{});
        mark(w1);
      }
      for(k=0;k<dn;k++){
        a=k+.5-ww/2;var w2=poly(fg,[[W,a,wz],[W,a+ww,wz],[W,a+ww,wz+wh],[W,a,wz+wh]],'',{});
        mark(w2);
      }
      floors.push(fg);
      var sc=g(scafG,{stroke:'#1f63c4','stroke-width':1.3,fill:'none'});
      for(k=0;k<=D;k+=1.25)el('polyline',{points:str([[W+.34,k,z0],[W+.34,k,z0+H]])},sc);
      el('polyline',{points:str([[W+.34,0,z0+H],[W+.34,D,z0+H]])},sc);
      el('polyline',{points:str([[W+.34,0,z0],[W+.34,1.25,z0+H]]),'stroke-opacity':.5},sc);
      el('polyline',{points:str([[W+.34,2.5,z0],[W+.34,3.75,z0+H]]),'stroke-opacity':.5},sc);
      scaffold.push(sc);
    }
    function mark(w){
      idx++;var lit=(idx*7)%10<6?((idx*3)%4===0?'#2f7fe0':'#6cc4ff'):'#1a3f8f';
      w.dataset.lit=lit;w.style.fill=lit;wins.push(w);
    }
    var roofZ=.36+N*H,roof=g(body);
    box(roof,.3,.3,roofZ,W-.6,D-.6,.14,['#ffffff','#4f78bf','#3a62a8']);
    box(roof,3.6,1.2,roofZ+.14,1.5,1.3,.62,['#e9f0f9','#8fb0e0','#123f9a']);
    var ant=P(1.4,1.2,roofZ+.14),top=P(1.4,1.2,roofZ+1.6);
    el('line',{x1:ant[0],y1:ant[1],x2:top[0],y2:top[1],stroke:'#bfe4ff','stroke-width':2.4},roof);

    // Трос и груз
    var tx=P(W/2,D/2,0)[0];
    el('rect',{x:tx-16,y:48,width:32,height:12,rx:2,fill:'#bfe4ff'});
    var cable=el('line',{x1:tx,y1:60,x2:tx,y2:120,stroke:'#bfe4ff','stroke-width':1.8});
    var hook=g(null,{transform:'translate(0 120)'});
    var hw=U*1.2;
    el('polygon',{points:[[tx,-8],[tx+hw,10],[tx,28],[tx-hw,10]].map(function(p){return p.join(',')}).join(' '),fill:'#6cc4ff'},hook);
    el('polygon',{points:[[tx-hw,10],[tx,28],[tx,38],[tx-hw,20]].map(function(p){return p.join(',')}).join(' '),fill:'#2f7fe0'},hook);
    el('polygon',{points:[[tx+hw,10],[tx,28],[tx,38],[tx+hw,20]].map(function(p){return p.join(',')}).join(' '),fill:'#1f63c4'},hook);

    // Стопка документов
    var sheets=[],sx=W+.82,sy=3.7;
    for(i=0;i<14;i++){
      var s=g(),z1=.04+i*.13;
      poly(s,[[sx,sy,z1],[sx+.9,sy,z1],[sx+.9,sy+1.2,z1],[sx,sy+1.2,z1]],i%3===2?'#6cc4ff':(i%2?'#e9f0f9':'#fff'),{stroke:'#0f368a','stroke-opacity':.25});
      sheets.push(s);
    }

    var truck=g(null,{transform:'translate('+route[0].join(' ')+')'});
    el('polygon',{points:'-20,-4 0,-14 20,-4 0,6',fill:'#bfe4ff'},truck);
    el('polygon',{points:'-20,-4 0,6 0,14 -20,4',fill:'#2f7fe0'},truck);
    el('polygon',{points:'20,-4 0,6 0,14 20,4',fill:'#1f63c4'},truck);

    var trees=[[-.9,2.5],[-.9,4.3],[1.4,6],[4.6,6],[3.2,-.9],[5.4,-.9]].map(function(t){
      var b=P(t[0],t[1],0),o=g();
      el('rect',{x:b[0]-2,y:b[1]-14,width:4,height:14,fill:'#8fb0e0'},o);
      el('path',{d:'M'+b[0]+' '+(b[1]-52)+'c15 12 20 26 15 36-5 6-25 6-30 0-5-10 0-24 15-36z',fill:'url(#sky)'},o);
      return o;
    });

    var c=P(W,D,0),scan=g(null,{opacity:0,fill:'none',stroke:'#e6f4ff','stroke-width':3.4,'stroke-linecap':'round'});
    var bx0=c[0]-92,by0=c[1]-74,bx1=c[0]+92,by1=c[1]+30,L=18;
    el('path',{d:'M'+bx0+' '+(by0+L)+'V'+by0+'H'+(bx0+L)+'M'+(bx1-L)+' '+by0+'H'+bx1+'V'+(by0+L)+'M'+bx1+' '+(by1-L)+'V'+by1+'H'+(bx1-L)+'M'+(bx0+L)+' '+by1+'H'+bx0+'V'+(by1-L)},scan);
    var flash=el('circle',{cx:c[0],cy:c[1]-22,r:8,fill:'#fff',opacity:0});
    var pin=g();
    el('path',{d:'M'+c[0]+' '+(c[1]-30)+'c-26-30-30-40-30-52a30 30 0 0 1 60 0c0 12-4 22-30 52z',fill:'url(#sky)'},pin);
    el('rect',{x:c[0]-15,y:c[1]-92,width:30,height:21,rx:4,fill:'#0f368a'},pin);
    el('circle',{cx:c[0],cy:c[1]-81.5,r:6,fill:'#6cc4ff'},pin);
    el('rect',{x:c[0]-6,y:c[1]-96,width:12,height:5,rx:1.5,fill:'#0f368a'},pin);
    pin.style.opacity=0;

    var done=g();
    var dc=[570,150];
    el('use',{href:'#stamp-done',x:dc[0]-82,y:dc[1]-82,width:164,height:164},done);

    return {found:found,rebar:rebar,body:body,floors:floors,wins:wins,scaffold:scaffold,roof:roof,cable:cable,hook:hook,sheets:sheets,truck:truck,trees:trees,scan:scan,flash:flash,pin:pin,done:done,path:route,topY:topY};
  }

  /* Чертёж фасада: линии прорисовываются при прокрутке */
  function buildBlueprint(){
    var svg=document.getElementById('bp');if(!svg)return;
    var NS='http://www.w3.org/2000/svg',z,i,f,k,x,y;
    function p(d,c){var e=document.createElementNS(NS,'path');e.setAttribute('d',d);e.setAttribute('class','bp-l'+(c?' '+c:''));e.setAttribute('pathLength','1');svg.appendChild(e);return e}
    function t(x,y,s){var e=document.createElementNS(NS,'text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('class','bp-t');e.setAttribute('text-anchor','middle');e.textContent=s;svg.appendChild(e)}
    var G=262,axes=[200,340,480,620,760,900];
    axes.forEach(function(a){p('M'+a+' 40V286','bp-thin')});
    p('M60 '+G+'H1000','bp-heavy');
    z='';for(x=72;x<=996;x+=18)z+='M'+x+' '+G+'l-12 14';p(z,'bp-thin');
    p('M200 262V70H760V262','bp-heavy');
    p('M190 70V60H770V70H190');
    for(i=1;i<=4;i++)p('M200 '+(G-38*i)+'H760','bp-thin');
    for(f=0;f<5;f++){z='';y=G-38*(f+1)+9;for(k=0;k<8;k++){if(f===0&&k===3)continue;x=222+k*68;z+='M'+x+' '+y+'h38v22h-38zM'+(x+19)+' '+y+'v22'}p(z)}
    p('M432 262V226h36v36M450 226v36M418 262l6-6h52l6 6','bp-heavy');
    p('M760 262V130H900V262','bp-heavy');
    for(i=0;i<3;i++){z='';y=G-38*(i+1)+9;for(k=0;k<3;k++){x=778+k*40;z+='M'+x+' '+y+'h26v22h-26z'}p(z)}
    p('M200 28H900');
    axes.forEach(function(a){p('M'+(a-6)+' 34l12-12','bp-heavy')});
    p('M170 262l-8-10h16zM178 262h-30M170 70l-8-10h16zM178 70h-30','bp-thin');
    axes.forEach(function(a,n){p('M'+(a-13)+' 300a13 13 0 1 0 26 0a13 13 0 1 0-26 0');t(a,305,String(n+1))});
    p('M1014 176H1216V300H1014ZM1014 206H1216M1014 236H1216M1014 268H1216M1080 176V300M1148 206V300','bp-heavy');
    z='';for(i=0;i<3;i++){y=221+i*31;z+='M1026 '+y+'h40M1092 '+y+'h44M1160 '+y+'h44'}p(z,'bp-thin');
    p('M1098 188h104','bp-heavy');
    var st=document.createElementNS(NS,'use');st.setAttribute('href','#stamp-control');st.setAttribute('x','1040');st.setAttribute('y','14');st.setAttribute('width','150');st.setAttribute('height','150');st.setAttribute('class','bp-stamp');svg.appendChild(st);
  }

  function fitDim(){
    var s=document.querySelector('.l3>span'),d=document.getElementById('dim');if(!s||!d)return;
    var r=document.createRange();r.selectNodeContents(s);d.style.width=Math.ceil(r.getBoundingClientRect().width)+'px';
  }

  function blueprintFx(){
    var box=document.querySelector('.bp'),svg=document.getElementById('bp');
    var tl=gsap.timeline({scrollTrigger:{trigger:box,start:'top 88%',end:'bottom 52%',scrub:.6}});
    tl.fromTo('#bp .bp-l',{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:.5,stagger:.06},0)
      .fromTo('#bp .bp-t',{opacity:0},{opacity:1,duration:.2,stagger:.05},2.4)
      .fromTo('.bp-stamp',{scale:2.4,opacity:0,rotation:14,transformOrigin:'50% 50%'},{scale:1,opacity:.96,rotation:-12,duration:.3,ease:'power4.in'},'>');
    var pan=function(){return Math.min(0,box.clientWidth-svg.getBoundingClientRect().width)};
    gsap.fromTo(svg,{x:0},{x:pan,scrollTrigger:{trigger:box,start:'top 80%',end:'bottom 30%',scrub:.6,invalidateOnRefresh:true}});
  }

  function buildSheet(){
    var host=document.getElementById('sheet'),out=[],keys={2:1,6:1,9:1,13:1},n=16;
    for(var i=0;i<n;i++){
      var r=document.createElement('div');r.className='sr'+(keys[i]?' key':'');
      var a=38+((i*29)%46);
      r.innerHTML='<i style="width:18px"></i><i style="flex:0 0 '+a+'%"></i><i style="width:26px;margin-left:auto"></i><i style="width:38px"></i><i style="width:'+(46+(i*13)%22)+'px"></i>';
      host.appendChild(r);out.push(r);
    }
    return out;
  }
})();
