/* Общая часть кабинета: данные макета, меню, подсказки, тема, здание, задания */
window.TP=(function(){
  'use strict';
  var G=window.gsap||null,DAY=864e5,today=new Date();today.setHours(0,0,0,0);
  var at=function(n){return new Date(today.getTime()+n*DAY)};
  var MON=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var plural=function(n,a,b,c){var m=n%10,h=n%100;return (m===1&&h!==11)?a:(m>=2&&m<=4&&(h<12||h>14))?b:c};
  var mln=function(v){return v.toFixed(1).replace('.',',')+' млн ₽'};
  var dateStr=function(d){return d.getDate()+' '+MON[d.getMonth()]};
  var fullDate=function(d){return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear()};
  var sum=function(a){return a.reduce(function(s,c){return s+c.price},0)};

  /* Демо-данные */
  var CONTRACTS=[
    {id:'c1',title:'Ремонт помещений детского сада',short:'Детский сад',number:'№ 14-Р/26',price:4.2,days:18,dur:96,stage:'Полы',done:5,total:7,docs:[11,15],acts:[['Гидроизоляция пола',4],['Устройство стяжки',11]]},
    {id:'c2',title:'Ремонт входной группы',short:'Входная группа',number:'№ 22-К/26',price:4.2,days:27,dur:84,stage:'Отделка фасада',done:3,total:5,docs:[8,15],acts:[['Гидроизоляция входной группы',8]]},
    {id:'c3',title:'Благоустройство территории',short:'Благоустройство',number:'№ 31-Б/26',price:6.1,days:52,dur:120,stage:'Подготовка основания',done:3,total:6,docs:[6,15],acts:[['Подготовка основания',15],['Укладка геотекстиля',24]]},
    {id:'c4',title:'Капитальный ремонт кровли школы',short:'Кровля школы',number:'№ 37-КР/26',price:5.6,days:94,dur:150,stage:'Демонтаж покрытия',done:2,total:6,docs:[4,15],acts:[['Устройство пароизоляции',29]]},
    {id:'c5',title:'Ремонт спортивного зала',short:'Спортзал',number:'№ 41-С/26',price:4.7,days:131,dur:160,stage:'Подготовка к старту',done:1,total:8,docs:[2,15],acts:[]}
  ];
  var GROUPS=[{label:'До 30 дней',min:0,max:30},{label:'31–60 дней',min:31,max:60},{label:'Больше 60',min:61,max:1e4}];
  var groupOf=function(c){for(var i=0;i<GROUPS.length;i++)if(c.days>=GROUPS[i].min&&c.days<=GROUPS[i].max)return i};
  var byId=function(id){return CONTRACTS.filter(function(c){return c.id===id})[0]};
  var STATUS={decision:'Требуется ваше решение',review:'На проверке',draft:'Черновик',new:'Новое',working:'В работе',done:'Завершено'};
  var TASKS=[
    {id:'t1',status:'decision',title:'Определить дальнейшие действия после проверки',c:'c1',meta:'Результаты передал: прораб',label:'Открыть результаты'},
    {id:'t2',status:'review',title:'Проверка перед стартом',c:'c3',meta:'Исполнитель: прораб · передано сегодня'},
    {id:'t3',status:'draft',title:'Проверить письмо о расхождениях',c:'c2',meta:'Подготовлено по результатам замеров',label:'Открыть черновик'},
    {id:'t4',status:'review',title:'Подготовить план-график',c:'c4',meta:'Исполнитель: ПТО · передано вчера'},
    {id:'t5',status:'working',title:'Проверка перед стартом',c:'c5',meta:'Исполнитель: прораб · срок через 5 дней',label:'Открыть задание'},
    {id:'t6',status:'new',title:'Замер объёмов',c:'c3',meta:'Исполнитель: прораб · срок через 9 дней',label:'Открыть задание'},
    {id:'t7',status:'done',title:'Подготовить план-график',c:'c1',meta:'Результаты приняты',label:'Посмотреть результаты'},
    {id:'t8',status:'done',title:'Проверка перед стартом',c:'c2',meta:'Результаты приняты',label:'Посмотреть результаты'}
  ];
  var PEOPLE=[
    {id:'p1',last:'Смирнов',first:'Андрей',mid:'Викторович',pos:'Генеральный директор',phone:'+7 900 000-00-01',member:true,role:'Руководитель',contracts:['c1','c2','c3','c4','c5']},
    {id:'p2',last:'Кузнецов',first:'Павел',mid:'Игоревич',pos:'Прораб',phone:'+7 900 000-00-02',member:true,role:'Прораб',contracts:['c1','c3','c5']},
    {id:'p3',last:'Орлова',first:'Мария',mid:'Сергеевна',pos:'Инженер ПТО',phone:'+7 900 000-00-03',member:true,role:'ПТО',contracts:['c1','c2','c4']},
    {id:'p4',last:'Волков',first:'Дмитрий',mid:'Олегович',pos:'Снабженец',phone:'+7 900 000-00-04',member:true,role:'Снабженец',contracts:['c2','c4']},
    {id:'p5',last:'Морозов',first:'Илья',mid:'Андреевич',pos:'Мастер участка',phone:'+7 900 000-00-05',member:false,contracts:['c3']},
    {id:'p6',last:'Фёдоров',first:'Роман',mid:'',pos:'Электромонтажник',phone:'',member:false,contracts:['c1']},
    {id:'p7',last:'Лебедев',first:'Николай',mid:'Петрович',pos:'Сварщик',phone:'+7 900 000-00-07',member:false,contracts:[],archived:true}
  ];

  /* Изменения макета сохраняются между страницами */
  var KEY='tenderpult-cabinet-demo-v1';
  try{var saved=JSON.parse(localStorage.getItem(KEY)||'{}');
    (saved.tasks||[]).forEach(function(s){var t=TASKS.filter(function(x){return x.id===s[0]})[0];if(t)t.status=s[1]});
    (saved.people||[]).forEach(function(s){var p=PEOPLE.filter(function(x){return x.id===s.id})[0];if(p){p.archived=s.archived;p.contracts=s.contracts}});
  }catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({tasks:TASKS.map(function(t){return [t.id,t.status]}),people:PEOPLE.map(function(p){return {id:p.id,archived:!!p.archived,contracts:p.contracts}})}))}catch(e){}}

  var SPRITE='<svg class="defs" aria-hidden="true" focusable="false"><defs><filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4.4 3.3" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter><path id="ring" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs>'+
    '<symbol id="stamp-ok" viewBox="0 0 200 200"><g filter="url(#ink)" fill="#d52b1e" font-family="Onest,Arial,sans-serif" font-weight="700" text-anchor="middle"><circle cx="100" cy="100" r="94" fill="none" stroke="#d52b1e" stroke-width="6"/><circle cx="100" cy="100" r="60" fill="none" stroke="#d52b1e" stroke-width="3"/><text font-size="17"><textPath href="#ring" textLength="458" text-anchor="start">ТЕНДЕРПУЛЬТ • ТЕНДЕРПУЛЬТ •</textPath></text><text x="100" y="107" font-size="20">ПРИНЯТО</text></g></symbol>'+
    '<symbol id="i-home" viewBox="0 0 24 24"><path d="M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z"/></symbol>'+
    '<symbol id="i-contract" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7"/></symbol>'+
    '<symbol id="i-task" viewBox="0 0 24 24"><path d="M4 12.500 9 18 20 6"/></symbol>'+
    '<symbol id="i-doc" viewBox="0 0 24 24"><path d="M4 7h16v13H4zM8 7V4h8v3M9 12h6M9 16h6"/></symbol>'+
    '<symbol id="i-people" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2.500 20c.6-4 3-6 6.500-6s5.900 2 6.500 6M16 4.400a4 4 0 0 1 0 7.300M18 14.500c2 .8 3.200 2.600 3.500 5.500"/></symbol>'+
    '<symbol id="i-company" viewBox="0 0 24 24"><path d="M4 21V5l9-2v18M13 9l7 2v10M2 21h20M8 8h1M8 12h1M8 16h1M16 13h1M16 17h1"/></symbol>'+
    '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>'+
    '<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.500 1.500M17.500 17.500 19 19M5 19l1.500-1.500M17.500 6.500 19 5"/></symbol>'+
    '<symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500Z"/></symbol>'+
    '<symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3l1.900 5.600L19.500 10.500l-5.600 1.900L12 18l-1.900-5.600-5.600-1.900 5.600-1.900zM19 16l.8 2.200L22 19l-2.200.8L19 22l-.8-2.200L16 19l2.200-.8z"/></symbol>'+
    '<symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>'+
    '<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>'+
    '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>'+
    '<symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="5"/><path d="m11.600 11.400 8.900-8.900M16 7l3.500 3.500M12.800 10.200l2.700 2.700"/></symbol>'+
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="m4.500 12.500 5 5 10-11"/></symbol>'+
    '</svg>';

  var NAV=[['home','index.html','i-home','Главная'],['contracts','contracts.html','i-contract','Контракты'],['tasks','tasks.html','i-task','Мои задания','Задания'],['documents','documents.html','i-doc','Документы'],['people','people.html','i-people','Работники'],['company','company.html','i-company','Компания']];
  var themeFns=[],page='';

  function shell(o){
    page=o.page;
    document.body.insertAdjacentHTML('afterbegin',SPRITE);
    document.body.insertAdjacentHTML('beforeend','<div class="tip" id="tip" role="status" hidden></div><div class="toast" id="toast" role="status" aria-live="polite" hidden><span id="toast-text"></span><button type="button" class="link" id="toast-undo" hidden>Отменить</button></div>');
    $('#rail').innerHTML='<a class="logo" href="index.html"><span class="logo-mark">т</span><span class="logo-text">тендерпульт<i>.</i></span></a>'+
      '<div class="company"><b>ООО «Пример Строй»</b><a href="#" data-soon="Список компаний">Все компании</a></div>'+
      '<nav class="nav" aria-label="Меню компании">'+NAV.map(function(n){var on=n[0]===o.page;return '<a'+(on?' class="is-on" aria-current="page"':'')+' href="'+n[1]+'" title="'+n[3]+'"><svg class="ic"><use href="#'+n[2]+'"/></svg><span'+(n[4]?' data-short="'+n[4]+'"':'')+'>'+n[3]+'</span>'+(n[0]==='tasks'?'<b class="count" id="nav-count">0</b>':'')+'</a>'}).join('')+'</nav>'+
      '<div class="rail-foot"><section class="sofi" aria-label="Подсказка Софи"><div class="sofi-head"><span class="sofi-dot"><svg class="ic"><use href="#i-spark"/></svg></span><b>Софи</b></div><p id="sofi-text"></p><div class="sofi-acts"><button class="link" id="sofi-go" type="button">Показать</button><button class="link" id="sofi-ask" type="button">Спросить</button></div></section>'+
      '<details class="legal"><summary>О сервисе и соглашения</summary><div><a href="#" data-soon="О сервисе">О сервисе</a><a href="#" data-soon="Поддержка">Поддержка</a><a href="#" data-soon="Реквизиты">Реквизиты</a><a href="#" data-soon="Пользовательское соглашение">Пользовательское соглашение</a><a href="#" data-soon="Политика персональных данных">Политика персональных данных</a><button type="button" id="reset-demo">Сбросить изменения макета</button></div></details></div>';
    var cta=o.cta?'<button class="btn btn-red" type="button" data-soon="'+esc(o.cta)+'"><svg class="ic"><use href="#i-plus"/></svg><span>'+esc(o.cta)+'</span></button>':'';
    var dn=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'][today.getDay()];
    $('#top').innerHTML='<div class="title"><h1>'+esc(o.title)+'</h1><p>'+esc(o.sub)+' <span class="demo-tag">Примеры данных</span></p></div>'+
      '<div class="top-actions">'+(o.page==='home'?'<span class="today-text">'+dn.charAt(0).toUpperCase()+dn.slice(1)+', '+dateStr(today)+'</span>':'')+
      '<div class="theme" role="group" aria-label="Цветовая тема"><button type="button" data-theme-choice="day" aria-label="День"><svg class="ic"><use href="#i-sun"/></svg></button><button type="button" data-theme-choice="night" aria-label="Ночь"><svg class="ic"><use href="#i-moon"/></svg></button></div>'+cta+'<button class="avatar" type="button" id="me" aria-label="Профиль и выход">Т</button></div>';
    bindGlobal();setTheme(document.documentElement.dataset.theme||'night');count();sofi();
  }

  /* Подсказка и уведомление */
  var tip,toastBox,toastT=0,undoFn=null;
  function moveTip(e){var w=tip.offsetWidth,h=tip.offsetHeight;tip.style.transform='translate('+Math.min(innerWidth-w-8,e.clientX+12)+'px,'+Math.max(8,e.clientY-h-10)+'px)'}
  function toast(text,undo){
    $('#toast-text').textContent=text;undoFn=undo||null;$('#toast-undo').hidden=!undo;toastBox.hidden=false;
    if(G)G.fromTo(toastBox,{y:18,opacity:0},{y:0,opacity:1,duration:.25,ease:'power2.out'});
    clearTimeout(toastT);toastT=setTimeout(function(){toastBox.hidden=true;undoFn=null},undo?6500:2600);
  }
  function bindGlobal(){
    tip=$('#tip');toastBox=$('#toast');
    document.addEventListener('pointerover',function(e){var t=e.target.closest&&e.target.closest('[data-tip]');if(t&&e.pointerType!=='touch'){tip.textContent=t.dataset.tip;tip.hidden=false;moveTip(e)}});
    document.addEventListener('pointermove',function(e){if(!tip.hidden)moveTip(e)});
    document.addEventListener('pointerout',function(e){if(e.target.closest&&e.target.closest('[data-tip]'))tip.hidden=true});
    $('#toast-undo').addEventListener('click',function(){var f=undoFn;toastBox.hidden=true;undoFn=null;if(f)f()});
    document.addEventListener('click',function(e){var s=e.target.closest('[data-soon]');if(!s)return;e.preventDefault();if(api.openForm&&api.openForm(s.dataset.soon,s))return;toast('«'+s.dataset.soon+'» откроется в рабочем кабинете')});
    $$('[data-theme-choice]').forEach(function(b){b.addEventListener('click',function(){setTheme(b.dataset.themeChoice)})});
    $('#reset-demo').addEventListener('click',function(){try{localStorage.removeItem(KEY)}catch(e){}location.reload()});
  }
  function setTheme(t){
    document.documentElement.dataset.theme=t;
    $$('[data-theme-choice]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.themeChoice===t))});
    try{localStorage.setItem('tenderpult-cabinet-theme',t)}catch(e){}
    var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='night'?'#0a2a6e':'#eef3fa';
    themeFns.forEach(function(f){f(t)});
  }

  /* Задания */
  var DECIDE=['decision','review','draft'],WORK=['new','working'];
  var active=function(){return TASKS.filter(function(t){return t.status!=='done'})};
  function count(){var n=$('#nav-count');if(!n)return;var v=active().length;n.textContent=v;n.hidden=!v;if(G)G.fromTo(n,{scale:1.35},{scale:1,duration:.3,ease:'back.out(2.4)'})}
  function sofi(){
    var t=TASKS.filter(function(x){return DECIDE.indexOf(x.status)>-1})[0],box=$('#sofi-text');if(!box)return;
    if(t){box.textContent='Сначала решите: «'+t.title.toLowerCase()+'». Объект: '+byId(t.c).short+'.'}
    else{box.textContent='Срочных решений нет. Ближайший АОСР: '+CONTRACTS[0].acts[0][0].toLowerCase()+'.'}
    $('#sofi-go').onclick=function(){var id=t?t.c:'c1';if(api.onSofi)api.onSofi(id,t);else location.href='index.html?c='+id};
  }
  function taskHtml(t){
    var c=byId(t.c),acts=t.status==='review'
      ?'<button class="btn btn-pri btn-sm" type="button" data-do="accept">Принять</button><button class="btn btn-ghost btn-sm" type="button" data-do="return" aria-label="Вернуть на уточнение" title="Вернуть на уточнение">Вернуть</button>'
      :'<button class="btn btn-ghost btn-sm" type="button" data-task-open="'+t.id+'">'+esc(t.label||'Открыть')+'</button>';
    return '<article class="task'+(t.status==='decision'?' is-hot':'')+(t.status==='done'?' is-done':'')+'" data-task="'+t.id+'"><span class="t-state">'+STATUS[t.status]+'</span><h3>'+esc(t.title)+'</h3><button class="t-obj" type="button" data-pick="'+c.id+'">'+esc(c.title)+'</button><p class="t-meta">'+esc(t.meta)+'</p><div class="t-acts">'+acts+'</div></article>';
  }
  function moveTask(row,task,next,text,stamp,after){
    var prev=task.status,prevMeta=task.meta,prevLabel=task.label;
    $$('button',row).forEach(function(x){x.disabled=true});
    task.status=next;if(next==='done'){task.meta='Результаты приняты';task.label='Посмотреть результаты'}else{task.label='Открыть задание'}
    save();
    var finish=function(){count();sofi();after(false);toast(text,function(){task.status=prev;task.meta=prevMeta;task.label=prevLabel;save();count();sofi();after(true)})};
    if(!G){finish();return}
    var tl=G.timeline({onComplete:finish});
    if(stamp){
      var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','t-stamp');s.setAttribute('viewBox','0 0 200 200');s.innerHTML='<use href="#stamp-ok"/>';row.appendChild(s);
      tl.fromTo(s,{scale:2.8,opacity:0},{scale:1,opacity:1,duration:.22,ease:'power4.in'}).fromTo(row,{x:-3},{x:0,duration:.18,ease:'elastic.out(1.2,.3)'}).to({},{duration:.42});
    }
    tl.to(row,{height:0,opacity:0,paddingTop:0,paddingBottom:0,marginBottom:-8,duration:.26,ease:'power2.inOut'});
  }
  function bindTasks(box,after,onPick){
    box.addEventListener('click',function(e){
      var p=e.target.closest('[data-pick]');if(p){if(onPick)onPick(p.dataset.pick);return}
      var b=e.target.closest('[data-do]');if(!b)return;
      var row=b.closest('.task'),task=TASKS.filter(function(t){return t.id===row.dataset.task})[0];
      if(b.dataset.do==='accept')moveTask(row,task,'done','Результаты приняты',true,after);
      else moveTask(row,task,'working','Задание возвращено на уточнение',false,after);
    });
  }

  /* Здание: этажи показывают этапы графика */
  var NS='http://www.w3.org/2000/svg';
  function drawBuilding(svg,c,animate){
    svg.innerHTML='';
    var U=Math.min(17,17*7/Math.max(7,c.total)),W=6,D=5,H=.85,CX=176,CY=Math.round(112+((c.total*H*U)-101)*.42),base=.3;
    var P=function(x,y,z){return [(x-y)*U*.866+CX,(x+y)*U*.5-z*U+CY]};
    var str=function(a){return a.map(function(p){return P(p[0],p[1],p[2]).map(function(n){return n.toFixed(1)}).join(',')}).join(' ')};
    var el=function(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e};
    var g=function(p){return el('g',{},p)};
    var poly=function(p,a,fill,ex){var o={points:str(a),fill:fill};for(var k in ex||{})o[k]=ex[k];return el('polygon',o,p)};
    var box=function(p,x,y,z,w,d,h,col,ex){poly(p,[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],col[1],ex);poly(p,[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],col[2],ex);poly(p,[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],col[0],ex)};
    var cs=getComputedStyle(document.documentElement);
    var plotC=[cs.getPropertyValue('--plot').trim(),cs.getPropertyValue('--plot-l').trim(),cs.getPropertyValue('--plot-r').trim()],ghost=cs.getPropertyValue('--ghost').trim();
    var plot=g(),M=1;
    box(plot,-M,-M,-.3,W+2*M,D+2*M,.3,plotC);
    box(plot,-.15,-.15,0,W+.3,D+.3,base,['#7fa3d9','#4f78bf','#3a62a8']);
    var floors=[],ghosts=g(),f,k,a,lit;
    for(f=c.done;f<c.total;f++)box(ghosts,0,0,base+f*H,W,D,H,['none','none','none'],{stroke:ghost,'stroke-width':1,'stroke-dasharray':'3 3'});
    for(f=0;f<c.done;f++){
      var fg=g(),z0=base+f*H,ww=.56,wh=.44,wz=z0+.23;
      box(fg,0,0,z0,W,D,H,['#f4f8fe','#dfe9f7','#b9cce8']);
      poly(fg,[[0,D,z0],[W,D,z0],[W,D,z0+.09],[0,D,z0+.09]],'#fff');
      poly(fg,[[W,0,z0],[W,D,z0],[W,D,z0+.09],[W,0,z0+.09]],'#d3e0f2');
      for(k=0;k<W;k++){a=k+.5-ww/2;lit=(f*3+k*7)%10<6?'#2f7fe0':'#1a3f8f';poly(fg,[[a,D,wz],[a+ww,D,wz],[a+ww,D,wz+wh],[a,D,wz+wh]],lit)}
      for(k=0;k<D;k++){a=k+.5-ww/2;lit=(f*5+k*3)%10<5?'#6cc4ff':'#1a3f8f';poly(fg,[[W,a,wz],[W,a+ww,wz],[W,a+ww,wz+wh],[W,a,wz+wh]],lit)}
      floors.push(fg);
    }
    var topZ=base+c.done*H,tp=P(W/2,D/2,topZ),cr=g(),tx=P(-.7,D+.4,0),mast=Math.max(tp[1]-58,10),z='',y;
    el('path',{d:'M'+(tx[0]-4)+' '+tx[1]+'V'+mast+'M'+(tx[0]+4)+' '+tx[1]+'V'+mast+'M'+(tx[0]-22)+' '+mast+'H'+(tp[0]+64),stroke:'#6cc4ff','stroke-width':1.6,fill:'none'},cr);
    for(y=tx[1];y>mast+6;y-=12)z+='M'+(tx[0]-4)+' '+y+'L'+(tx[0]+4)+' '+(y-6)+'L'+(tx[0]-4)+' '+(y-12);
    el('path',{d:z,stroke:'#6cc4ff','stroke-width':.8,fill:'none'},cr);
    el('rect',{x:tx[0]-24,y:mast+1,width:13,height:9,rx:1.5,fill:'#6cc4ff'},cr);
    var cable=el('line',{x1:tp[0],y1:mast,x2:tp[0],y2:tp[1]-22,stroke:'#bfe4ff','stroke-width':1.2},cr);
    var hook=g(cr),pts=function(a){return a.map(function(p){return p.join(',')}).join(' ')};
    el('polygon',{points:pts([[tp[0],tp[1]-26],[tp[0]+22,tp[1]-16],[tp[0],tp[1]-6],[tp[0]-22,tp[1]-16]]),fill:'#6cc4ff'},hook);
    el('polygon',{points:pts([[tp[0]-22,tp[1]-16],[tp[0],tp[1]-6],[tp[0],tp[1]-1],[tp[0]-22,tp[1]-11]]),fill:'#1f63c4'},hook);
    if(G&&animate){
      var d=floors.length*.07;
      G.fromTo(floors,{y:-22,opacity:0},{y:0,opacity:1,duration:.34,stagger:.07,ease:'power2.out'});
      G.fromTo(ghosts,{opacity:0},{opacity:1,duration:.3,delay:d});
      G.fromTo(cr,{opacity:0},{opacity:1,duration:.3});
      G.fromTo(hook,{y:-34},{y:0,duration:.6,ease:'power2.inOut',delay:d});
      G.fromTo(cable,{attr:{y2:mast+6}},{attr:{y2:tp[1]-22},duration:.6,ease:'power2.inOut',delay:d});
    }
  }

  /* Паспорт объекта */
  var LINKS=[['Работы','works'],['План-график','schedule'],['Журнал','journal'],['АОСР','acts'],['Документы','docs']];
  function passport(card,c,animate,backLabel){
    var hot=groupOf(c)===0;
    card.classList.toggle('is-hot',hot);
    card.innerHTML='<button class="back" type="button" data-back><svg class="ic"><use href="#i-back"/></svg>'+esc(backLabel||'Назад')+'</button>'+
      '<header class="card-head"><span class="stage">'+(hot?'Завершение в ближайшие 30 дней':'По графику')+'</span><h2>'+esc(c.title)+'</h2><p class="sub">'+esc(c.number)+' · завершение '+dateStr(at(c.days))+'</p></header>'+
      '<div class="scene" aria-hidden="true"><svg class="iso" viewBox="0 0 340 250"></svg></div><p class="sr">На схеме здания '+c.done+' из '+c.total+' этапов графика.</p>'+
      '<dl class="facts"><div><dt>До завершения</dt><dd class="c-days">'+c.days+' '+plural(c.days,'день','дня','дней')+'</dd></div><div><dt>Стоимость</dt><dd>'+mln(c.price)+'</dd></div><div><dt>Этапы графика</dt><dd>'+c.done+' из '+c.total+'</dd></div><div><dt>Текущий этап</dt><dd title="'+esc(c.stage)+'">'+esc(c.stage)+'</dd></div></dl>'+
      '<div class="docs"><div class="docs-head"><b>Документы</b><span>создано '+c.docs[0]+', осталось '+(c.docs[1]-c.docs[0])+'</span></div><div class="docs-grid" aria-hidden="true">'+Array.apply(null,Array(c.docs[1])).map(function(_,i){return '<i class="dg'+(i<c.docs[0]?' on':'')+'"></i>'}).join('')+'</div></div>'+
      '<div class="links">'+LINKS.map(function(l){return '<a href="contract.html?c='+c.id+'#'+l[1]+'">'+l[0]+'</a>'}).join('')+'<a class="wide" href="contract.html?c='+c.id+'#overview">Открыть контракт</a></div>';
    var svg=$('.iso',card);drawBuilding(svg,c,animate);
    card._redraw=function(){drawBuilding(svg,c,false)};
    if(G&&animate){
      G.fromTo($$('.card-head>*, .facts div',card),{y:8,opacity:0},{y:0,opacity:1,duration:.3,stagger:.025,ease:'power2.out'});
      G.fromTo($$('.dg.on',card),{scale:.4,opacity:0},{scale:1,opacity:1,duration:.22,stagger:.018,ease:'back.out(2)'});
    }
  }

  /* Появление страницы */
  function enter(sel){if(G)G.from(sel||'.panel,.toolbar',{y:14,opacity:0,duration:.34,stagger:.05,ease:'power2.out',clearProps:'transform,opacity'})}

  var api={G:G,today:today,at:at,MON:MON,$:$,$$:$$,esc:esc,plural:plural,mln:mln,dateStr:dateStr,fullDate:fullDate,sum:sum,CONTRACTS:CONTRACTS,GROUPS:GROUPS,groupOf:groupOf,byId:byId,STATUS:STATUS,TASKS:TASKS,PEOPLE:PEOPLE,DECIDE:DECIDE,WORK:WORK,
    shell:shell,toast:toast,save:save,count:count,sofi:sofi,taskHtml:taskHtml,bindTasks:bindTasks,passport:passport,enter:enter,onTheme:function(f){themeFns.push(f)},isNarrow:function(){return matchMedia('(max-width:1023px)').matches}};
  return api;
})();
