/* Главная: центр управления */
(function(){
  'use strict';
  var T=window.TP,G=T.G,$=T.$,$$=T.$$,esc=T.esc,at=T.at,MON=T.MON,mln=T.mln,sum=T.sum,plural=T.plural,CONTRACTS=T.CONTRACTS,GROUPS=T.GROUPS,groupOf=T.groupOf,byId=T.byId,today=T.today,DAY=864e5;
  var fromUrl=new URLSearchParams(location.search).get('c');
  var state={sel:byId(fromUrl)?fromUrl:'c1',group:null,queue:'decide'};
  var allActs=[];
  CONTRACTS.forEach(function(c){c.acts.forEach(function(a){allActs.push({name:a[0],days:a[1],c:c})})});
  allActs.sort(function(a,b){return a.days-b.days});
  var fmt=function(v,d){return v.toFixed(d).replace('.',',')};
  function flash(el){if(G)G.fromTo(el,{boxShadow:'0 0 0 2px rgba(108,196,255,1)'},{boxShadow:'0 0 0 2px rgba(108,196,255,0)',duration:1.2,ease:'power2.out',clearProps:'boxShadow'})}

  T.shell({page:'home',title:'Центр управления',sub:'Главное по доступным контрактам компании',cta:'Добавить новый контракт'});

  function renderKpis(){
    var soon=CONTRACTS.filter(function(c){return groupOf(c)===0}),total=sum(CONTRACTS);
    var g=GROUPS.map(function(_,i){return sum(CONTRACTS.filter(function(c){return groupOf(c)===i}))});
    var bars=CONTRACTS.map(function(c,i){return '<i class="kv-b'+(groupOf(c)===0?' hot':'')+'" style="height:'+(12+(c.total-c.done)*3.1+i)+'px"></i>'}).join('');
    var stack=g.map(function(v){return '<i style="flex:'+v+'"></i>'}).join('');
    var docs=allActs.map(function(){return '<i class="kv-doc"></i>'}).slice(0,6).join('');
    function kpi(act,label,val,dec,suf,sub,vis){return '<button class="kpi" type="button" data-act="'+act+'"><span class="kpi-label">'+label+'</span><span class="kpi-val" data-count="'+val+'" data-dec="'+dec+'" data-suf="'+suf+'">'+fmt(val,dec)+suf+'</span><span class="kpi-sub">'+sub+'</span><span class="kpi-vis" aria-hidden="true">'+vis+'</span></button>'}
    $('#kpis').innerHTML=[
      kpi('all','Сохранённые контракты',CONTRACTS.length,0,'','доступны вам',bars),
      kpi('all','Стоимость контрактов',total,1,' млн ₽','по сохранённым контрактам','<div class="kv-stack">'+stack+'</div>'),
      kpi('soon','По графику за 30 дней',sum(soon),1,' млн ₽','Контрактов: '+soon.length,'<div class="kv-stack"><i style="flex:'+sum(soon)+'"></i><i style="flex:'+(total-sum(soon))+';opacity:.3"></i></div>'),
      kpi('acts','Скоро потребуются АОСР',allActs.length,0,'','дата в ближайшие 30 дней',docs)
    ].join('');
    $$('.kpi').forEach(function(k){k.addEventListener('click',function(){var a=k.dataset.act;
      if(a==='soon')setGroup(state.group===0?null:0);
      else if(a==='acts'){setGroup(null);flash($('#acts-panel'));goPane('map')}
      else setGroup(null);
    })});
  }

  var from=Infinity,to=-Infinity;
  CONTRACTS.forEach(function(c){from=Math.min(from,c.days-c.dur);to=Math.max(to,c.days)});
  from-=8;to+=8;
  var X=function(d){return (d-from)/(to-from)*100};
  function renderTimeline(){
    var axis='',grid='',d=at(from),last=-100;d=new Date(d.getFullYear(),d.getMonth()+1,1);
    while(d.getTime()<at(to).getTime()){
      var n=Math.round((d-today)/DAY),x=X(n);
      if(Math.abs(x-X(0))>13&&x-last>=9){axis+='<span style="left:'+x+'%">'+MON[d.getMonth()]+'</span>';last=x}
      grid+='<i style="left:'+x+'%"></i>';
      d=new Date(d.getFullYear(),d.getMonth()+1,1);
    }
    axis+='<span class="now" style="left:'+X(0)+'%">Сегодня</span>';
    grid+='<i class="tl-now" style="left:'+X(0)+'%"></i>';
    $('#tl-axis').innerHTML=axis;$('#tl-grid').innerHTML=grid;
    $('#tl-rows').innerHTML=CONTRACTS.map(function(c){
      var s=X(c.days-c.dur),e=X(c.days),now=X(0),hot=groupOf(c)===0;
      var ms=c.acts.map(function(a){return '<i class="ms" style="left:'+((X(a[1])-s)/(e-s)*100)+'%" data-tip="АОСР: '+esc(a[0])+', '+T.dateStr(at(a[1]))+'"></i>'}).join('');
      return '<button class="row'+(hot?' is-hot':'')+'" type="button" data-id="'+c.id+'" aria-pressed="false" aria-label="'+esc(c.title)+', до завершения '+c.days+' '+plural(c.days,'день','дня','дней')+', '+mln(c.price)+'"><span class="r-name"><b>'+esc(c.short)+'</b><small>'+mln(c.price)+'</small></span><span class="r-track"><span class="r-bar" style="left:'+s+'%;width:'+(e-s)+'%" data-tip="Завершение: '+T.dateStr(at(c.days))+'"><i class="r-past" style="flex:'+(now-s)+'"></i><i class="r-left" style="flex:'+(e-now)+'"></i></span><span style="position:absolute;top:0;bottom:0;left:'+s+'%;width:'+(e-s)+'%">'+ms+'</span></span><span class="r-days">'+c.days+' дн.</span></button>';
    }).join('');
    $$('.row').forEach(function(r){r.addEventListener('click',function(){select(r.dataset.id,true);if(T.isNarrow())goPane('card')})});
  }

  function renderBars(){
    var totals=GROUPS.map(function(_,i){return sum(CONTRACTS.filter(function(c){return groupOf(c)===i}))}),max=Math.max.apply(null,totals);
    $('#bars').innerHTML=GROUPS.map(function(g,i){var n=CONTRACTS.filter(function(c){return groupOf(c)===i}).length;
      return '<button class="bar'+(i===0?' is-hot':'')+'" type="button" data-g="'+i+'" aria-pressed="false" data-tip="'+n+' '+plural(n,'контракт','контракта','контрактов')+': '+mln(totals[i])+'"><span class="bar-val">'+totals[i].toFixed(1).replace('.',',')+' млн</span><span class="bar-col" data-h="'+(totals[i]/max)+'"></span><span class="bar-lab">'+g.label+'</span></button>'}).join('');
    sizeBars();
    $$('.bar').forEach(function(b){b.addEventListener('click',function(){var g=+b.dataset.g;setGroup(state.group===g?null:g)})});
  }
  function sizeBars(){
    var box=$('#bars');if(!box||!box.clientHeight)return;
    var labels=$$('.bar-lab').map(function(l){return l.offsetHeight}),vals=$$('.bar-val').map(function(l){return l.offsetHeight});
    var room=Math.max(24,box.clientHeight-Math.max.apply(null,labels)-Math.max.apply(null,vals)-10);
    $$('.bar-col').forEach(function(c){c.style.height=Math.round(room*+c.dataset.h)+'px'});
  }

  function renderActs(){
    $('#acts').innerHTML=allActs.map(function(a){var d=at(a.days);return '<button class="act" type="button" data-id="'+a.c.id+'"><span class="act-date">'+d.getDate()+'<small>'+MON[d.getMonth()]+'</small></span><span class="act-t"><b>'+esc(a.name)+'</b><small>'+esc(a.c.short)+'</small></span></button>'}).join('');
    $$('.act').forEach(function(a){a.addEventListener('click',function(){select(a.dataset.id,true);if(T.isNarrow())goPane('card')})});
  }

  function setGroup(g){
    state.group=g;
    $$('.row').forEach(function(r){r.classList.toggle('is-dim',g!==null&&groupOf(byId(r.dataset.id))!==g)});
    $$('.bar').forEach(function(b){var on=g===+b.dataset.g;b.classList.toggle('is-dim',g!==null&&!on);b.setAttribute('aria-pressed',String(on))});
    $$('.kpi').forEach(function(k){k.classList.toggle('is-on',k.dataset.act==='soon'&&g===0)});
    $('#reset').hidden=g===null;
    if(g!==null&&groupOf(byId(state.sel))!==g){var first=CONTRACTS.filter(function(c){return groupOf(c)===g})[0];if(first)select(first.id,true)}
    if(g!==null&&T.isNarrow())goPane('map');
  }
  $('#reset').addEventListener('click',function(){setGroup(null)});

  function select(id,animate){
    state.sel=id;
    $$('.row').forEach(function(r){var on=r.dataset.id===id;r.classList.toggle('is-on',on);r.setAttribute('aria-pressed',String(on))});
    $$('.act').forEach(function(a){a.classList.toggle('is-on',a.dataset.id===id)});
    T.passport($('.p-card'),byId(id),animate,'К срокам');
  }
  $('.p-card').addEventListener('click',function(e){if(e.target.closest('[data-back]'))goPane('map')});
  T.onTheme(function(){var c=$('.p-card');if(c._redraw)c._redraw()});
  T.onSofi=function(id,t){select(id,true);if(t)flash($('.p-tasks'));if(T.isNarrow())goPane(t?'tasks':'card')};

  /* Очередь */
  var inQueue=function(t){return (state.queue==='decide'?T.DECIDE:T.WORK).indexOf(t.status)>-1};
  function renderTasks(animate){
    var list=T.TASKS.filter(inQueue),box=$('#tasks');
    box.innerHTML=list.length?list.map(T.taskHtml).join(''):'<p class="empty">Активных задач пока нет. Новые появятся здесь, как только исполнители передадут результаты.</p>';
    $('#q-decide').textContent=T.TASKS.filter(function(t){return T.DECIDE.indexOf(t.status)>-1}).length;
    $('#q-work').textContent=T.TASKS.filter(function(t){return T.WORK.indexOf(t.status)>-1}).length;
    if(G&&animate)G.fromTo('#tasks .task',{x:-14,opacity:0},{x:0,opacity:1,duration:.3,stagger:.05,ease:'power2.out'});
  }
  T.bindTasks($('#tasks'),function(undone){renderTasks(undone);$('#tasks').focus({preventScroll:true})},function(id){select(id,true);if(T.isNarrow())goPane('card')});

  var ind=$('.tabs-ind');
  function moveInd(){var on=$('#queue-tabs [aria-selected=true]');if(!on||!on.offsetWidth)return;ind.style.width=on.offsetWidth+'px';ind.style.transform='translateX('+on.offsetLeft+'px)'}
  $$('#queue-tabs button').forEach(function(b){b.addEventListener('click',function(){state.queue=b.dataset.queue;$$('#queue-tabs button').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});moveInd();renderTasks(true)})});

  function goPane(p){
    if(!T.isNarrow())return;
    $('.board').dataset.active=p;
    $$('.seg button').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.pane===p))});
    requestAnimationFrame(function(){sizeBars();moveInd();
      if(p==='card')select(state.sel,true);
      if(G)G.fromTo('[data-pane-id='+p+']',{opacity:0,x:12},{opacity:1,x:0,duration:.24,ease:'power2.out',clearProps:'transform,opacity'});
    });
  }
  $$('.seg button').forEach(function(b){b.addEventListener('click',function(){goPane(b.dataset.pane)})});

  renderKpis();renderTimeline();renderBars();renderActs();renderTasks(false);select(state.sel,false);moveInd();
  window.addEventListener('resize',function(){sizeBars();moveInd()});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){moveInd();sizeBars()});

  if(G){
    var tl=G.timeline({defaults:{ease:'power3.out'}});
    tl.from('.top>*',{y:-10,opacity:0,duration:.4,stagger:.06},.05)
      .from('.kpi',{y:16,opacity:0,duration:.45,stagger:.06},.12)
      .from('.panel',{y:20,opacity:0,scale:.985,duration:.5,stagger:.07},.22)
      .from('.tl-now',{scaleY:0,duration:.6,ease:'power2.inOut'},.5)
      .from('.tl-grid i:not(.tl-now)',{scaleY:0,transformOrigin:'top',duration:.5,stagger:.02},.45)
      .from('.r-bar',{scaleX:0,duration:.65,stagger:.07},.55)
      .from('.ms',{scale:0,duration:.3,stagger:.04,ease:'back.out(3)'},1)
      .from('.bar-col',{scaleY:0,duration:.55,stagger:.08},.7)
      .from('.act',{x:10,opacity:0,duration:.3,stagger:.04},.75)
      .from('.task',{x:-14,opacity:0,duration:.35,stagger:.06},.5)
      .from('.kv-b,.kv-stack i,.kv-doc',{scale:0,transformOrigin:'50% 100%',duration:.3,stagger:.015},.5);
    $$('.kpi-val').forEach(function(v,i){var end=+v.dataset.count,d=+v.dataset.dec,s=v.dataset.suf||'',o={n:0};tl.to(o,{n:end,duration:.8,ease:'power2.out',onUpdate:function(){v.textContent=fmt(o.n,d)+s}},.25+i*.06)});
    tl.add(function(){select(state.sel,true)},.45);
  }
})();
