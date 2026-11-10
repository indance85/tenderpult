/* Страница контракта: обзор, работы, журнал, план-график, АОСР, документы */
(function(){
  'use strict';
  var T=window.TP,G=T.G,$=T.$,$$=T.$$,esc=T.esc,at=T.at,MON=T.MON,mln=T.mln,byId=T.byId,today=T.today,DAY=864e5;
  var ic=function(n){return '<svg class="ic"><use href="#'+n+'"/></svg>'};
  var c=byId(new URLSearchParams(location.search).get('c'))||T.CONTRACTS[0];
  var fd=T.fullDate;
  T.shell({page:'contract',title:'Контракт '+c.number,sub:c.title});
  $$('.nav a').forEach(function(a){if(a.getAttribute('href')==='contracts.html'){a.classList.add('is-on');a.setAttribute('aria-current','page')}});

  /* Данные контракта */
  var STAGES=['Демонтажные работы','Подготовка основания','Гидроизоляция','Устройство стяжки','Полы','Отделка стен','Потолки','Инженерные системы'].slice(0,c.total);
  var POOL=[['Демонтаж покрытия','м²',412],['Вывоз мусора','т',18],['Грунтование основания','м²',398],['Устройство гидроизоляции','м²',188],['Армирование основания','м²',204],['Устройство стяжки','м²',398],['Укладка плитки','м²',164],['Облицовка стен','м²',256],['Окраска стен','м²',512],['Монтаж потолка','м²',312],['Прокладка кабеля','м',860],['Установка светильников','шт.',64]];
  var HIDDEN={'Устройство гидроизоляции':1,'Армирование основания':1,'Устройство стяжки':1,'Прокладка кабеля':1};
  var stages=STAGES.map(function(n,i){var w=[];for(var k=0;k<3;k++){var p=POOL[(i*2+k)%POOL.length];w.push({name:p[0],unit:p[1],qty:p[2]+i*3,ok:i<c.done,hidden:!!HIDDEN[p[0]]})}
    var start=-(c.dur-c.days)+Math.round(i*c.dur/c.total),len=Math.round(c.dur/c.total)+4;return {id:i,name:n,works:w,periods:[{s:start,e:start+len}],open:false}});
  var acts=c.acts.map(function(a,i){return {t:a[0],d:a[1],on:true,doc:false,works:[a[0]]}}).concat([{t:'Подготовка основания под покрытие',d:-12,on:true,doc:true,works:['Грунтование основания']},{t:'Скрытая прокладка кабеля',d:null,on:false,doc:false,works:['Прокладка кабеля']}]);
  var journal={};
  (function(){var names=[];stages.forEach(function(s){s.works.forEach(function(w){names.push(w.name)})});for(var i=1;i<36;i+=(i%3===0?2:1)){var k=at(-i).toDateString();journal[k]=[names[i%names.length]];if(i%4===0)journal[k].push(names[(i+3)%names.length])}})();
  var graphs=[{n:'Основной график',on:true,when:-40},{n:'Вариант со сдвигом отделки',on:false,when:-12}];
  var ms=function(d){return d.getDate()+' '+MON[d.getMonth()]};

  var TABS=[['overview','Обзор'],['works','Работы и этапы'],['journal','Журнал работ'],['schedule','План-график'],['acts','Акты скрытых работ'],['docs','Документы']];
  var cur=(location.hash||'').slice(1);if(!TABS.some(function(t){return t[0]===cur}))cur='overview';
  $('#toolbar').innerHTML='<a class="back-link" href="contracts.html">'+ic('i-back')+'Контракты компании</a><div class="tabs tabs-wide" role="tablist" aria-label="Разделы контракта"><i class="tabs-ind" aria-hidden="true"></i>'+TABS.map(function(t){return '<button type="button" role="tab" data-t="'+t[0]+'" aria-selected="'+(t[0]===cur)+'">'+t[1]+'</button>'}).join('')+'</div>';
  var ind=$('.tabs-ind');
  function moveInd(){var on=$('.tabs-wide [aria-selected=true]');if(!on||!on.offsetWidth)return;ind.style.width=on.offsetWidth+'px';ind.style.transform='translateX('+on.offsetLeft+'px)';if(on.scrollIntoView&&T.isNarrow())on.scrollIntoView({block:'nearest',inline:'center'})}
  var view=$('#view');
  var R={overview:overview,works:works,journal:journal_,schedule:schedule,acts:acts_,docs:docs};
  function show(t,anim){cur=t;$$('.tabs-wide button').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.t===t))});moveInd();R[t]();if(history.replaceState)history.replaceState(null,'','#'+t);if(G&&anim)G.fromTo('#view .panel',{y:12,opacity:0},{y:0,opacity:1,duration:.28,stagger:.04,ease:'power2.out',clearProps:'transform,opacity'})}
  $$('.tabs-wide button').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.t,true)})});
  view.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g)show(g.dataset.go,true)});
  window.addEventListener('resize',moveInd);
  window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(h!==cur&&R[h])show(h,true)});

  /* ---------- Обзор ---------- */
  function overview(){
    var days=[];for(var i=6;i>=0;i--){var d=at(-i),n=(journal[d.toDateString()]||[]).length;days.push({d:d,n:n})}
    var max=Math.max(1,Math.max.apply(null,days.map(function(x){return x.n}))),on=acts.filter(function(a){return a.on}),dn=on.filter(function(a){return a.doc}).length;
    var pct=on.length?Math.round(dn/on.length*100):0;
    var worksN=stages.reduce(function(s,x){return s+x.works.filter(function(w){return w.ok}).length},0);
    var last=null;for(var k=0;k<40&&!last;k++)if(journal[at(-k).toDateString()])last=at(-k);
    view.innerHTML='<div class="ov">'+
      '<section class="panel ov-go"><h2>Работа с контрактом</h2><div class="go-grid">'+[['works','Работы и сметы','Состав и этапы работ'],['journal','Журнал работ','Ежедневные записи'],['schedule','План-график','Этапы и сроки'],['acts','Акты скрытых работ','Подготовка АОСР'],['docs','Документы','Создать документ']].map(function(x){return '<button type="button" data-go="'+x[0]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>'}).join('')+'</div></section>'+
      '<section class="panel ov-start"><h2>Подготовка к старту</h2><p class="sub">Проверьте список работ, затем выберите: обмеры, график и документы.</p><button class="btn btn-pri btn-sm" type="button" id="prep">Подготовить начало работ</button></section>'+
      '<section class="panel ov-state"><header class="p-head"><div><h2>Состояние контракта</h2><p class="sub">То, что уже известно системе</p></div></header><div class="st-grid"><button type="button" data-go="works"><span>Работы в списке</span><b>'+worksN+'</b><small>Подтверждённые работы</small></button><button type="button" data-go="journal"><span>Последняя запись</span><b>'+(last?fd(last):'Пока нет')+'</b><small>Дата работ в журнале</small></button><button type="button" data-go="schedule"><span>План-график</span><b>Активен</b><small>'+esc(graphs.filter(function(g){return g.on})[0].n)+'</small></button><button type="button" data-go="acts"><span>АОСР без документа</span><b>'+(on.length-dn)+'</b><small>Активные акты</small></button></div></section>'+
      '<section class="panel ov-chart"><h2>Работы в журнале</h2><p class="sub">Число записей по дате выполнения · последние 7 дней</p><div class="mini-bars">'+days.map(function(x){return '<div data-tip="'+ms(x.d)+': '+x.n+'"><b>'+x.n+'</b><i style="height:'+(x.n/max*100)+'%"></i><span>'+('0'+x.d.getDate()).slice(-2)+'</span></div>'}).join('')+'</div><p class="fine">Одна запись — одна работа за день, не объём выполнения.</p></section>'+
      '<section class="panel ov-ring"><h2>Акты скрытых работ</h2><p class="sub">Активные АОСР по наличию документа</p><div class="ring-w"><div class="ring" style="--p:'+pct+'"><b>'+on.length+'</b></div><ul><li><i class="dot"></i>Создан документ: '+dn+'</li><li><i class="dot dot-2"></i>Без документа: '+(on.length-dn)+'</li></ul></div><p class="fine">Наличие файла не означает, что акт подписан.</p></section>'+
      '<section class="panel ov-more"><details open><summary><b>Реквизиты контракта</b><small>Адрес, заказчик, номера и сроки</small></summary><dl class="dl dl-row"><div><dt>Адрес объекта</dt><dd>г. Москва, ул. Образцовая, д. 5</dd></div><div><dt>Город для документов</dt><dd>Москва</dd></div><div><dt>Цена контракта</dt><dd>'+mln(c.price)+'</dd></div><div><dt>Срок исполнения</dt><dd>'+fd(at(c.days-c.dur))+' — '+fd(at(c.days))+'</dd></div><div><dt>Заказчик</dt><dd>ГБУ «Образец»</dd></div><div><dt>Исполнитель</dt><dd>ООО «Пример Строй»</dd></div></dl><button class="link add" type="button" id="addr">Выбрать или изменить адрес</button></details><details><summary><b>Документы из ЕИС</b><small>Исходные файлы контракта · 3</small></summary><ul class="files"><li><span class="tag">PDF</span>Контракт</li><li><span class="tag">XLSX</span>Локальная смета</li><li><span class="tag">DOCX</span>Техническое задание</li></ul></details></section>'+
      '</div>';
    $('#prep').addEventListener('click',prepDialog);
    $('#addr').addEventListener('click',function(){T.formDialog({title:'Данные контракта',sub:'Выберите адрес для документов или укажите его вручную.',fields:[{label:'Адрес объекта',wide:1,req:1,value:'г. Москва, ул. Образцовая, д. 5'},{label:'Город для документов',value:'Москва'}],done:'Данные контракта сохранены'})});
    if(G)G.from('.mini-bars i',{scaleY:0,transformOrigin:'bottom',duration:.45,stagger:.05,ease:'power2.out',clearProps:'transform'});
  }
  function prepDialog(){
    var dl=T.dialog({title:'Подготовка к старту',sub:c.title,wide:1,body:'<ol class="steps-v"><li><b>Проверьте список работ</b><p class="sub">Доступно работ: '+stages.length*3+'. Проверьте список по смете, уберите лишнее и подтвердите готовность.</p><button class="btn btn-ghost btn-sm" type="button" data-to="works">Открыть список работ</button></li><li><b>Выберите, что нужно сейчас</b><p class="sub">Обмеры необязательны. Можно поручить их прорабу или сразу перейти к подготовке графика.</p><div class="t-acts"><button class="btn btn-ghost btn-sm" type="button" id="assign">Поручить проверку объёмов</button><button class="btn btn-ghost btn-sm" type="button" data-to="schedule">Открыть план-график</button></div></li></ol>'});
    dl.el.addEventListener('click',function(e){var t=e.target.closest('[data-to]');if(t){dl.close();show(t.dataset.to,true)}});
    $('#assign',dl.el).addEventListener('click',function(){dl.close();T.formDialog({title:'Распределить проверку',sub:'Каждый исполнитель увидит своё задание.',fields:[{label:'Исполнитель',type:'select',req:1,options:T.PEOPLE.filter(function(p){return p.member}).map(function(p){return p.last+' '+p.first+' · '+p.role})},{label:'Срок',type:'date'},{label:'Комментарий',wide:1}],submit:'Создать задание',done:'Задание создано'})});
  }

  /* ---------- Работы и этапы ---------- */
  var worksState={mode:'ready',q:''};
  function works(){
    var modes=[['ready','Готово'],['running','Обрабатывается'],['error','Ошибка']];
    view.innerHTML='<section class="panel full"><header class="p-head"><div><h2>Работы и этапы</h2><p class="sub">Контракт '+esc(c.number)+' · '+stages.length*3+' работ</p></div><div class="t-acts"><div class="mock-sw" role="group" aria-label="Состояние сметы, только в макете"><span>Смета:</span>'+modes.map(function(m){return '<button type="button" data-m="'+m[0]+'" aria-pressed="'+(worksState.mode===m[0])+'">'+m[1]+'</button>'}).join('')+'</div><button class="btn btn-ghost btn-sm" type="button" data-units>Единицы измерения</button><button class="btn btn-ghost btn-sm" type="button" data-soon="Скачивание таблицы работ">Скачать таблицу</button></div></header><div id="w-body" class="grow"></div></section>';
    drawWorks();
    $$('[data-m]').forEach(function(b){b.addEventListener('click',function(){worksState.mode=b.dataset.m;$$('[data-m]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});drawWorks()})});
    $('[data-units]').addEventListener('click',function(){T.formDialog({title:'Единицы измерения',sub:'Настройки действуют для компании. Исходные значения сметы остаются без изменений.',fields:[{label:'Площадь',type:'select',options:['Как в смете','м²','100 м²']},{label:'Длина',type:'select',options:['Как в смете','м','100 м']},{label:'Масса',type:'select',options:['Как в смете','т','кг']}],submit:'Сохранить настройки',done:'Настройки сохранены'})});
  }
  function drawWorks(){
    var b=$('#w-body');
    if(worksState.mode==='running'){b.innerHTML='<div class="state-box"><b>Обработка названий работ</b><p class="sub">Обработано позиций: 42 из 118. ИИ вернул варианты, они потребуют проверки.</p><progress max="118" value="42"></progress><p class="fine">Прогресс относится к текущему этапу; страница обновляется автоматически.</p></div>';return}
    if(worksState.mode==='error'){b.innerHTML='<div class="state-box is-err"><b>Смета не обработана</b><p class="sub">Файл сметы не удалось прочитать. Можно повторить поиск.</p><button class="btn btn-pri btn-sm" type="button" id="retry">Повторить поиск</button></div>';$('#retry').addEventListener('click',function(){worksState.mode='ready';works()});return}
    b.innerHTML='<label class="search">'+ic('i-search')+'<input id="wq" type="search" placeholder="Найти работу" value="'+esc(worksState.q)+'" aria-label="Найти работу"></label><div class="acc-list scroll" id="wlist"></div>';
    function list(){
      var q=worksState.q.toLowerCase(),html=stages.map(function(s){
        var ws=s.works.filter(function(w){return !q||w.name.toLowerCase().indexOf(q)>-1});if(!ws.length)return '';
        var ok=s.works.filter(function(w){return w.ok}).length;
        return '<details class="stage-acc"'+(s.open||q?' open':'')+' data-s="'+s.id+'"><summary><b>'+esc(s.name)+'</b><span class="tag'+(ok===s.works.length?' tag-on':'')+'">'+ok+' из '+s.works.length+' подтверждено</span></summary>'+ws.map(function(w){var i=s.works.indexOf(w);return '<label class="work"><input type="checkbox" data-w="'+s.id+':'+i+'"'+(w.ok?' checked':'')+'><span>'+esc(w.name)+(w.hidden?' <span class="tag tag-red">Скрытая работа · АОСР</span>':'')+'</span><em>'+w.qty+' '+w.unit+'</em></label>'}).join('')+'</details>'
      }).join('');
      $('#wlist').innerHTML=html||'<p class="empty">Работы не найдены. Попробуйте другое название.</p>';
    }
    list();
    $('#wq').addEventListener('input',function(e){worksState.q=e.target.value;list()});
    $('#wlist').addEventListener('change',function(e){var v=e.target.dataset.w;if(!v)return;var a=v.split(':');stages[+a[0]].works[+a[1]].ok=e.target.checked;stages[+a[0]].open=true;var q=worksState.q;list()});
    $('#wlist').addEventListener('toggle',function(e){if(e.target.dataset&&e.target.dataset.s!=null)stages[+e.target.dataset.s].open=e.target.open},true);
  }

  /* ---------- Журнал ---------- */
  var jr={m:new Date(today.getFullYear(),today.getMonth(),1),sel:null,picked:{}};
  function journal_(){
    view.innerHTML='<div class="jr"><section class="panel"><header class="p-head"><h2>Дни с записями</h2><div class="m-nav"><button type="button" data-mv="-1" aria-label="Предыдущий месяц">'+ic('i-back')+'</button><b id="m-l"></b><button type="button" data-mv="1" aria-label="Следующий месяц" class="flip">'+ic('i-back')+'</button></div></header><p class="sub" id="m-s"></p><div class="cal" id="cal"></div><p class="fine">Цветом отмечены даты, за которые есть записи. Нажмите на день, чтобы увидеть их.</p></section><section class="panel"><h2>Добавить работы</h2><p class="sub">Выберите дату и одну или несколько работ. Каждая сохранится отдельной записью.</p><label class="fld"><span>Дата выполнения</span><input type="date" id="j-date" value="'+today.getFullYear()+'-'+('0'+(today.getMonth()+1)).slice(-2)+'-'+('0'+today.getDate()).slice(-2)+'"></label><div class="j-works scroll" id="j-works"></div><div class="j-foot"><span id="j-n">Выбрано: 0</span><button class="btn btn-pri btn-sm" type="button" id="j-add" disabled>Добавить в журнал</button></div><button class="link add" type="button" id="j-new">Работы нет в списке</button></section><section class="panel"><h2 id="e-h"></h2><p class="sub">Раздел 3 · по датам выполнения работ</p><div class="entries scroll" id="entries"></div></section></div>';
    function cal(){
      var m=jr.m,first=(m.getDay()+6)%7,len=new Date(m.getFullYear(),m.getMonth()+1,0).getDate(),html=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(function(d){return '<span class="dow">'+d+'</span>'}).join(''),filled=0,total=0;
      for(var i=0;i<first;i++)html+='<span></span>';
      for(var d=1;d<=len;d++){var dt=new Date(m.getFullYear(),m.getMonth(),d),e=journal[dt.toDateString()],isT=dt.getTime()===today.getTime(),on=jr.sel&&dt.getTime()===jr.sel.getTime();if(e){filled++;total+=e.length}
        html+=e?'<button type="button" class="day has'+(on?' is-on':'')+(isT?' is-t':'')+'" data-d="'+dt.getTime()+'" aria-label="'+ms(dt)+', записей: '+e.length+'">'+d+'</button>':'<span class="day'+(isT?' is-t':'')+'">'+d+'</span>'}
      $('#cal').innerHTML=html;$('#m-l').textContent=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'][m.getMonth()]+' '+m.getFullYear();$('#m-s').textContent='Дней с записями: '+filled+' · Всего записей: '+total;
    }
    function ent(){
      var keys=Object.keys(journal).map(function(k){return new Date(k)}).sort(function(a,b){return b-a});
      if(jr.sel)keys=keys.filter(function(k){return k.getTime()===jr.sel.getTime()});
      var n=keys.reduce(function(s,k){return s+journal[k.toDateString()].length},0);
      $('#e-h').textContent='Записи журнала · '+n;
      $('#entries').innerHTML=(jr.sel?'<button class="chip" type="button" id="e-all">Показать все '+ic('i-close')+'</button>':'')+(keys.length?keys.slice(0,40).map(function(k){return '<div class="e-day"><b>'+fd(k)+'</b>'+journal[k.toDateString()].map(function(w){return '<p>'+esc(w)+'</p>'}).join('')+'</div>'}).join(''):'<p class="empty">Записей пока нет.</p>');
      var a=$('#e-all');if(a)a.addEventListener('click',function(){jr.sel=null;cal();ent()});
    }
    var names=[];stages.forEach(function(s){s.works.forEach(function(w){if(names.indexOf(w.name)<0)names.push(w.name)})});
    $('#j-works').innerHTML=names.map(function(n){return '<label class="radio"><input type="checkbox" value="'+esc(n)+'"><span><b>'+esc(n)+'</b></span></label>'}).join('');
    function count(){var n=$$('#j-works input:checked').length;$('#j-n').textContent='Выбрано: '+n;$('#j-add').disabled=!n}
    $('#j-works').addEventListener('change',count);
    $('#j-add').addEventListener('click',function(){var v=$('#j-date').value.split('-'),d=new Date(+v[0],+v[1]-1,+v[2]),k=d.toDateString(),picked=$$('#j-works input:checked').map(function(x){return x.value});journal[k]=(journal[k]||[]).concat(picked);$$('#j-works input:checked').forEach(function(x){x.checked=false});count();jr.m=new Date(d.getFullYear(),d.getMonth(),1);jr.sel=d;cal();ent();T.toast('Записей добавлено: '+picked.length)});
    $('#j-new').addEventListener('click',function(){T.formDialog({title:'Работы нет в списке',sub:'Добавленная работа появится серым цветом и будет ждать решения руководителя.',fields:[{label:'Дата выполнения',type:'date',req:1},{label:'Название работы',wide:1,req:1}],submit:'Добавить работу',done:'Работа ждёт решения руководителя'})});
    $('#cal').addEventListener('click',function(e){var b=e.target.closest('[data-d]');if(!b)return;jr.sel=new Date(+b.dataset.d);cal();ent()});
    $$('[data-mv]').forEach(function(b){b.addEventListener('click',function(){jr.m=new Date(jr.m.getFullYear(),jr.m.getMonth()+ +b.dataset.mv,1);cal()})});
    cal();ent();
  }

  /* ---------- План-график ---------- */
  var sc={unit:'weeks',all:false,move:false,saved:true};
  var CELL={days:30,weeks:13,months:5};
  function schedule(){
    var g=graphs.filter(function(x){return x.on})[0];
    view.innerHTML='<section class="panel full"><header class="p-head sc-head"><div class="sc-title"><h2>'+esc(g.n)+'</h2><p class="sub"><span class="tag tag-on">Активный</span> · Этапы и периоды относятся к этому графику. Журнал работ ведётся отдельно.</p></div><div class="t-acts"><button class="btn btn-ghost btn-sm" type="button" id="variants">Варианты графика</button><button class="btn btn-ghost btn-sm" type="button" id="sc-sofi">'+ic('i-spark')+'Софи</button><button class="btn btn-ghost btn-sm" type="button" data-soon="Печатная форма">Печатная форма</button><button class="btn btn-pri btn-sm" type="button" id="sc-save">Сохранить</button></div></header>'+
      '<div class="sc-bar"><div class="unit" role="group" aria-label="Масштаб">'+[['days','Дни'],['weeks','Недели'],['months','Месяцы']].map(function(u){return '<button type="button" data-u="'+u[0]+'" aria-pressed="'+(sc.unit===u[0])+'">'+u[1]+'</button>'}).join('')+'</div><button class="chip-f" type="button" id="to-today">Сегодня</button><button class="chip-f'+(sc.all?' is-on':'')+'" type="button" id="all-w" aria-pressed="'+sc.all+'">'+(sc.all?'Скрыть работы':'Показать все работы')+'</button><button class="chip-f'+(sc.move?' is-on':'')+'" type="button" id="mv" aria-pressed="'+sc.move+'">Переставить этапы</button><button class="chip-f" type="button" id="add-st">Этап</button><span class="saved" id="saved">'+(sc.saved?'Сохранено':'Есть несохранённые изменения')+'</span></div>'+
      '<ul class="legend"><li><i class="lg lg-past"></i>Период этапа</li><li><i class="lg lg-act"></i>АОСР · подготовить</li><li><i class="lg lg-made"></i>АОСР · изготовлен</li><li><i class="lg lg-hot"></i>Срок близко</li><li><i class="lg lg-now"></i>Сегодня</li></ul>'+
      '<div class="gantt scroll-x" id="gantt" tabindex="0" role="region" aria-label="Таблица графика, прокручивается"></div></section>';
    drawGantt();
    $$('[data-u]').forEach(function(b){b.addEventListener('click',function(){sc.unit=b.dataset.u;$$('[data-u]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});drawGantt()})});
    $('#to-today').addEventListener('click',function(){scrollToday(true)});
    $('#all-w').addEventListener('click',function(){sc.all=!sc.all;schedule()});
    $('#mv').addEventListener('click',function(){sc.move=!sc.move;schedule()});
    $('#add-st').addEventListener('click',function(){T.formDialog({title:'Новый этап',fields:[{label:'Название этапа',wide:1,req:1}],submit:'Добавить этап',done:'Этап добавлен',onDone:function(f){stages.push({id:stages.length,name:$('input',f).value,works:[],periods:[],open:false});dirty();drawGantt()}})});
    $('#sc-save').addEventListener('click',function(){sc.saved=true;$('#saved').textContent='Сохранено';T.toast('График сохранён')});
    $('#variants').addEventListener('click',variants);
    $('#sc-sofi').addEventListener('click',function(){T.guide([['План-график','Для добавления периода выберите начало и конец в строке этапа.'],['Период','Нажмите на существующий период, чтобы изменить его даты.'],['АОСР','Предлагаемая дата берётся из начала связанной работы или этапа.']])});
  }
  function dirty(){sc.saved=false;var s=$('#saved');if(s)s.textContent='Есть несохранённые изменения'}
  var from=-(c.dur-c.days)-7,to=c.days+14;
  /* Дата АОСР показывается в строке этапа, который идёт в эту дату */
  function stageFor(d){var best=null,gap=Infinity;stages.forEach(function(s){s.periods.forEach(function(p){var g=d<p.s?p.s-d:d>p.e?d-p.e:0;if(g<gap){gap=g;best=s}})});return best}
  function scrollToday(smooth){var b=$('#gantt');if(!b)return;var x=(0-from)*CELL[sc.unit]-b.clientWidth/2+220;b.scrollTo({left:Math.max(0,x),behavior:smooth?'smooth':'auto'})}
  function drawGantt(){
    var pxd=CELL[sc.unit],W=(to-from)*pxd,heads='',lines='';
    if(sc.unit==='days'){for(var i=from;i<to;i++){var d=at(i);heads+='<span class="g-h" style="left:'+((i-from)*pxd)+'px;width:'+pxd+'px">'+d.getDate()+'</span>';if(d.getDay()===1)lines+='<i style="left:'+((i-from)*pxd)+'px"></i>'}}
    else if(sc.unit==='weeks'){for(var w=from;w<to;w+=7){heads+='<span class="g-h" style="left:'+((w-from)*pxd)+'px;width:'+(7*pxd)+'px">'+ms(at(w))+'</span>';lines+='<i style="left:'+((w-from)*pxd)+'px"></i>'}}
    else{var m=new Date(at(from).getFullYear(),at(from).getMonth(),1);while(m.getTime()<at(to).getTime()){var off=Math.max(0,Math.round((m-today)/DAY)-from),nx=new Date(m.getFullYear(),m.getMonth()+1,1),end=Math.min(to-from,Math.round((nx-today)/DAY)-from);heads+='<span class="g-h" style="left:'+(off*pxd)+'px;width:'+((end-off)*pxd)+'px">'+MON[m.getMonth()]+'</span>';lines+='<i style="left:'+(off*pxd)+'px"></i>';m=nx}}
    var rows=stages.map(function(s,i){
      var bars=s.periods.map(function(p,k){var hot=p.e>=0&&p.e<=14&&p.e>0;return '<button type="button" class="g-bar'+(hot?' is-hot':'')+'" style="left:'+((p.s-from)*pxd)+'px;width:'+Math.max(8,(p.e-p.s)*pxd)+'px" data-p="'+i+':'+k+'" data-tip="'+esc(s.name)+': '+ms(at(p.s))+' — '+ms(at(p.e))+'" aria-label="Период этапа '+esc(s.name)+', '+ms(at(p.s))+' — '+ms(at(p.e))+'"></button>'}).join('');
      var dm=acts.filter(function(a){return a.on&&a.d!=null&&stageFor(a.d)===s}).map(function(a){return '<i class="g-ms'+(a.doc?' made':'')+'" style="left:'+((a.d-from)*pxd)+'px" data-tip="АОСР: '+esc(a.t)+'"></i>'}).join('');
      var head='<div class="g-name">'+(sc.move?'<span class="g-mv"><button type="button" data-up="'+i+'" aria-label="Выше"'+(i?'':' disabled')+'>↑</button><button type="button" data-dn="'+i+'" aria-label="Ниже"'+(i===stages.length-1?' disabled':'')+'>↓</button></span>':'')+'<span>'+esc(s.name)+'</span></div>';
      var sub=sc.all?s.works.map(function(w){return '<div class="g-row g-sub"><div class="g-name">'+esc(w.name)+'</div><div class="g-track" style="width:'+W+'px"></div></div>'}).join(''):'';
      return '<div class="g-row"><div class="g-name-w">'+head+'</div><div class="g-track" style="width:'+W+'px" data-track="'+i+'">'+bars+dm+'</div></div>'+sub;
    }).join('');
    var nowX=(0-from)*pxd;
    $('#gantt').innerHTML='<div class="g-in" style="width:'+(W+220)+'px"><div class="g-row g-top"><div class="g-name-w"><div class="g-name">Этап</div></div><div class="g-track" style="width:'+W+'px">'+heads+'</div></div><div class="g-body">'+rows+'<div class="g-lines" style="left:220px;width:'+W+'px">'+lines+'<b class="g-now" style="left:'+nowX+'px"></b></div></div></div>';
    if(G)G.from('.g-bar',{scaleX:0,transformOrigin:'left',duration:.35,stagger:.03,ease:'power2.out',clearProps:'transform'});
    scrollToday(false);
  }
  view.addEventListener('click',function(e){
    var b=e.target.closest('.g-bar');
    if(b){var a=b.dataset.p.split(':'),s=stages[+a[0]],p=s.periods[+a[1]];periodDialog(s,p);return}
    var up=e.target.closest('[data-up]');if(up){var i=+up.dataset.up,t=stages[i];stages[i]=stages[i-1];stages[i-1]=t;dirty();drawGantt();return}
    var dn=e.target.closest('[data-dn]');if(dn){var j=+dn.dataset.dn,x=stages[j];stages[j]=stages[j+1];stages[j+1]=x;dirty();drawGantt()}
  });
  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function periodDialog(s,p){
    var dl=T.dialog({title:'Период этапа',sub:s.name,body:'<div class="f-grid"><label class="fld"><span>Начало</span><input type="date" id="ps" value="'+iso(at(p.s))+'"></label><label class="fld"><span>Окончание</span><input type="date" id="pe" value="'+iso(at(p.e))+'"></label><div class="fld fld-w"><span>Работы в периоде</span>'+(s.works.length?s.works.map(function(w){return '<label class="fld-c"><input type="checkbox" checked><span>'+esc(w.name)+'</span></label>'}).join(''):'<p class="sub">В этапе пока нет работ.</p>')+'</div><p class="f-err fld-w" id="pe-err" role="alert" hidden>Окончание не может быть раньше начала.</p></div>',foot:'<button class="btn btn-ghost" type="button" id="del-p">Удалить период</button><span style="flex:1"></span><button class="btn btn-ghost" type="button" data-close>Отмена</button><button class="btn btn-pri" type="button" id="ok-p">Применить</button>'});
    function n(id){var v=$(id,dl.el).value.split('-');return Math.round((new Date(+v[0],+v[1]-1,+v[2])-today)/DAY)}
    $('#ok-p',dl.el).addEventListener('click',function(){var a=n('#ps'),b=n('#pe');if(b<a){$('#pe-err',dl.el).hidden=false;return}p.s=a;p.e=b;dirty();dl.close();drawGantt()});
    $('#del-p',dl.el).addEventListener('click',function(){var i=s.periods.indexOf(p);s.periods.splice(i,1);dirty();dl.close();drawGantt();T.toast('Период удалён',function(){s.periods.splice(i,0,p);drawGantt()})});
  }
  function variants(){
    var dl;function body(){return '<div class="f-info">Можно создать несколько вариантов. Только один график может быть активным; новый график не активируется автоматически.</div><div class="list-pick">'+graphs.map(function(g,i){return '<article class="var"><div class="p-main"><b>'+esc(g.n)+'</b><small>Создан '+fd(at(g.when))+'</small></div><span class="tag'+(g.on?' tag-on':'')+'">'+(g.on?'Активный':'Неактивный')+'</span><div class="t-acts">'+(g.on?'':'<button class="btn btn-ghost btn-sm" type="button" data-on="'+i+'">Активировать</button>')+'<button class="btn btn-ghost btn-sm" type="button" data-cp="'+i+'">Создать копию</button>'+(g.on?'':'<button class="btn btn-ghost btn-sm" type="button" data-rm="'+i+'">Удалить</button>')+'</div></article>'}).join('')+'</div><form class="find" id="g-new"><label class="fld fld-w"><span>Название графика</span><input id="g-n" placeholder="Новый вариант"></label><button class="btn btn-pri" type="submit">Создать график</button></form>'}
    dl=T.dialog({title:'Графики работ',sub:'Контракт '+c.number,wide:1,body:body(),onClose:function(){schedule()}});
    function re(){$('.dlg-body',dl.el).innerHTML=body();bind()}
    function bind(){$('#g-new',dl.el).addEventListener('submit',function(e){e.preventDefault();var v=$('#g-n',dl.el).value.trim();if(!v){$('#g-n',dl.el).focus();return}graphs.push({n:v,on:false,when:0});re()})}
    bind();
    dl.el.addEventListener('click',function(e){var a=e.target.closest('[data-on]'),cp=e.target.closest('[data-cp]'),r=e.target.closest('[data-rm]');
      if(a){graphs.forEach(function(g){g.on=false});graphs[+a.dataset.on].on=true;re()}
      if(cp){var g=graphs[+cp.dataset.cp];graphs.push({n:g.n+' (копия)',on:false,when:0});re()}
      if(r){graphs.splice(+r.dataset.rm,1);re()}
    });
  }

  /* ---------- АОСР ---------- */
  var af={f:'on',q:''};
  function acts_(){
    var on=acts.filter(function(a){return a.on}),made=on.filter(function(a){return a.doc}).length;
    view.innerHTML='<section class="panel full"><header class="p-head"><div class="stat-row"><div><b>'+on.length+'</b><span>Активных АОСР</span></div><div><b>'+made+'</b><span>Документ создан</span></div><div><b>'+(on.length-made)+'</b><span>Нужно подготовить</span></div></div><div class="t-acts"><button class="btn btn-ghost btn-sm" type="button" id="hid">Выбрать скрытые работы</button><button class="btn btn-ghost btn-sm" type="button" id="merge">Объединить предложения</button><button class="btn btn-pri btn-sm" type="button" id="a-add">Добавить акт</button></div></header><div class="f-info">Софи предлагает акты по работам, но может ошибаться. Проверьте состав и необходимость освидетельствования.</div><div class="sc-bar"><label class="search">'+ic('i-search')+'<input id="aq" type="search" placeholder="Название работы или акта" value="'+esc(af.q)+'" aria-label="Поиск акта"></label><div class="unit" role="group" aria-label="Фильтр актов">'+[['on','Активные'],['all','Все'],['off','Неактивные']].map(function(x){return '<button type="button" data-af="'+x[0]+'" aria-pressed="'+(af.f===x[0])+'">'+x[1]+'</button>'}).join('')+'</div></div><div class="act-list scroll" id="alist"></div></section>';
    function list(){
      var q=af.q.toLowerCase(),rows=acts.filter(function(a){return (af.f==='all'||(af.f==='on')===a.on)&&(!q||a.t.toLowerCase().indexOf(q)>-1||a.works.join(' ').toLowerCase().indexOf(q)>-1)});
      $('#alist').innerHTML=rows.length?rows.map(function(a){var i=acts.indexOf(a),st=!a.on?['Неактивен','']:a.doc?['Документ создан','tag-on']:['Нужно подготовить','tag-red'];return '<article class="act-c"><div class="p-main"><b>'+esc(a.t)+'</b><small>'+(a.d!=null?'Дата подготовки: '+fd(at(a.d)):'Дата подготовки не назначена')+' · '+esc(a.works.join(', '))+'</small></div><span class="tag '+st[1]+'">'+st[0]+'</span><div class="t-acts"><button class="btn btn-ghost btn-sm" type="button" data-e="'+i+'">'+(a.doc?'Посмотреть':'Подготовить')+'</button><button class="btn btn-ghost btn-sm" type="button" data-t="'+i+'">'+(a.on?'Отключить':'Включить')+'</button></div></article>'}).join(''):'<p class="empty">Актов по этому запросу нет.</p>';
    }
    list();
    $('#aq').addEventListener('input',function(e){af.q=e.target.value;list()});
    $$('[data-af]').forEach(function(b){b.addEventListener('click',function(){af.f=b.dataset.af;$$('[data-af]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});list()})});
    $('#alist').addEventListener('click',function(e){var a=e.target.closest('[data-e]'),t=e.target.closest('[data-t]');if(a)aosrForm(acts[+a.dataset.e]);if(t){var x=acts[+t.dataset.t];x.on=!x.on;acts_()}});
    $('#a-add').addEventListener('click',function(){T.formDialog({title:'Добавить акт',fields:[{label:'Название акта',wide:1,req:1}],submit:'Добавить акт',done:'Акт добавлен',onDone:function(f){acts.push({t:$('input',f).value,d:null,on:true,doc:false,works:[]});acts_()}})});
    $('#hid').addEventListener('click',function(){var all=[];stages.forEach(function(s){s.works.forEach(function(w){all.push(w)})});T.formDialog({title:'Выбрать скрытые работы',sub:'Отметьте работы, для которых нужен АОСР. По каждой появится предложение.',fields:all.slice(0,12).map(function(w){return {type:'check',label:w.name,value:w.hidden}}),done:'Скрытые работы сохранены'})});
    $('#merge').addEventListener('click',function(){T.formDialog({title:'Объединить предложения',fields:acts.filter(function(a){return a.on&&!a.doc}).map(function(a){return {type:'check',label:a.t}}).concat([{label:'Название объединённого акта',wide:1,req:1}]),submit:'Объединить',done:'Акты объединены'})});
  }
  function aosrForm(a){
    T.formDialog({title:'Подготовка АОСР',sub:'Контракт '+c.number+' · '+(a.doc?'номер акта':'предварительный номер')+': 12',wide:1,note:'Тестовая версия: проверьте форму, реквизиты и состав представителей перед использованием. Можно сохранить акт с незаполненными полями и дополнить позже.',
      fields:[{label:'Название акта',wide:1,value:a.t,req:1},{type:'more',label:'Объект и организации',fields:[{label:'Адрес объекта',wide:1,value:'г. Москва, ул. Образцовая, д. 5'},{label:'Заказчик',value:'ГБУ «Образец»'},{label:'Исполнитель',value:'ООО «Пример Строй»'}]},{type:'more',label:'Представители и подписанты',fields:[{label:'Представитель заказчика',type:'select',options:['Уточните у заказчика']},{label:'Представитель исполнителя',type:'select',options:T.PEOPLE.filter(function(p){return !p.archived}).map(function(p){return p.last+' '+p.first})}]},{type:'more',label:'Материалы и документы',fields:[{label:'Применённые материалы',type:'area'},{label:'Документы, подтверждающие соответствие',type:'area'}]},{type:'h',label:'Даты работ'},{label:'Начало работ',type:'date'},{label:'Окончание работ',type:'date'},{label:'Дата акта',type:'date'},{label:'Нормативы',wide:1,ph:'Например, СП 71.13330'}],
      submit:a.doc?'Сохранить':'Создать документ',done:a.doc?'Акт сохранён':'Документ создан',onDone:function(){a.doc=true;acts_()}});
  }

  /* ---------- Документы контракта ---------- */
  function docs(){
    var ev=[['Приказ об ответственном','Приказ','create_order',-30],['Список работников и специалистов','Список','create_workers_list',-26],['Письмо о расхождениях','Письмо','letter',-9]];
    view.innerHTML='<section class="panel full"><header class="p-head"><div><h2>События контракта</h2><p class="sub">Документов: '+ev.length+' · Писем: 1 · Приказов: 1 · Списков: 1</p></div><div class="t-acts"><button class="btn btn-ghost btn-sm" type="button" id="num">Настройки нумератора</button><button class="btn btn-pri btn-sm" type="button" id="new-d">Создать документ</button></div></header><div class="act-list scroll">'+ev.map(function(e,i){return '<article class="act-c"><div class="p-main"><b>'+e[0]+'</b><small>'+fd(at(e[3]))+' · № '+(i+1)+'/2026</small></div><span class="tag">'+e[1]+'</span><div class="t-acts"><button class="btn btn-ghost btn-sm" type="button" data-soon="Скачивание документа">Скачать</button></div></article>'}).join('')+'</div></section>';
    $('#new-d').addEventListener('click',function(){var dl=T.dialog({title:'Создать документ',sub:c.title,body:'<div class="list-pick">'+[['create_order','Приказ об ответственном','Назначение ответственного за производство работ'],['create_workers_list','Список работников','Люди для допуска на объект'],['letter','Письмо заказчику','Официальное письмо по контракту']].map(function(x){return '<button class="pick-row" type="button" data-df="'+x[0]+'" data-dt="'+x[1]+'"><span class="p-main"><b>'+x[1]+'</b><small>'+x[2]+'</small></span></button>'}).join('')+'</div>'});dl.el.addEventListener('click',function(e){var b=e.target.closest('[data-df]');if(b){dl.close();T.docForm(b.dataset.df,b.dataset.dt,c.id)}})});
    $('#num').addEventListener('click',function(){T.formDialog({title:'Настройки нумератора',sub:'Сохранённые документы не изменятся.',fields:[{label:'Группа документов',type:'select',options:['Приказы','Списки работников','Акты скрытых работ','Письма']},{label:'Название нумератора',req:1},{label:'Шаблон номера',value:'{номер}/{год}'},{label:'Сброс',type:'select',options:['Каждый год','Каждый месяц','Без сброса']}],done:'Нумератор сохранён'})});
  }

  show(cur,false);moveInd();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(moveInd);
  T.enter('.toolbar,#view .panel');
})();
