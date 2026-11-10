/* Разделы кабинета */
(function(){
  'use strict';
  var T=window.TP,G=T.G,$=T.$,$$=T.$$,esc=T.esc,at=T.at,mln=T.mln,plural=T.plural,CONTRACTS=T.CONTRACTS,GROUPS=T.GROUPS,groupOf=T.groupOf,byId=T.byId;
  var page=document.body.dataset.page;
  var ic=function(n){return '<svg class="ic"><use href="#'+n+'"/></svg>'};
  var has=function(q,s){return String(s).toLowerCase().indexOf(q)>-1};
  /* На узком экране карточка открывается поверх списка */
  function openDetail(on){var s=$('.split');if(s)s.dataset.view=on?'detail':'list'}
  document.addEventListener('click',function(e){if(e.target.closest('[data-back]'))openDetail(false)});

  var P={contracts:contracts,tasks:tasks,documents:documents_,people:people,company:company};
  if(P[page])P[page]();
  T.enter();

  /* ---------- Контракты ---------- */
  function contracts(){
    T.shell({page:'contracts',title:'Контракты компании',sub:'Все доступные вам контракты',cta:'Добавить контракт'});
    var st={g:null,q:'',sort:'days',dir:1,sel:'c1'};
    $('#toolbar').innerHTML='<div class="keys-strip">'+ic('i-key')+'<div><b>Ключи: 3</b><small>Доступно для добавления контрактов</small></div><a class="link" href="company.html#keys">Пополнить ключи</a></div>'+
      '<label class="search">'+ic('i-search')+'<input id="q" type="search" placeholder="Найти контракт по названию или номеру" autocomplete="off" aria-label="Найти контракт"></label>'+
      '<div class="chips" role="group" aria-label="Срок завершения"><button class="chip-f is-on" type="button" data-g="">Все <b>'+CONTRACTS.length+'</b></button>'+GROUPS.map(function(g,i){return '<button class="chip-f" type="button" data-g="'+i+'">'+g.label+' <b>'+CONTRACTS.filter(function(c){return groupOf(c)===i}).length+'</b></button>'}).join('')+'</div>';
    var cols=[['title','Контракт'],['price','Стоимость'],['days','Завершение'],['time','Прошло времени'],['stages','Этапы'],['docs','Документы']];
    $('#list-head').innerHTML=cols.map(function(c){var s=['title','price','days'].indexOf(c[0])>-1;return s?'<button type="button" class="th" data-sort="'+c[0]+'">'+c[1]+'<i></i></button>':'<span class="th">'+c[1]+'</span>'}).join('');
    function draw(animate){
      var rows=CONTRACTS.filter(function(c){return (st.g===null||groupOf(c)===st.g)&&(!st.q||has(st.q,c.title)||has(st.q,c.number))}).slice();
      rows.sort(function(a,b){var k=st.sort,v=k==='title'?a.title.localeCompare(b.title,'ru'):a[k]-b[k];return v*st.dir});
      $('#list').innerHTML=rows.length?rows.map(function(c){
        var past=Math.round((c.dur-c.days)/c.dur*100),hot=groupOf(c)===0;
        return '<button class="tr'+(hot?' is-hot':'')+(c.id===st.sel?' is-on':'')+'" type="button" data-id="'+c.id+'"><span class="td-main"><b>'+esc(c.title)+'</b><small>'+esc(c.number)+'</small></span><span class="td-num" data-l="Стоимость">'+mln(c.price)+'</span><span class="td-num td-days" data-l="Завершение">'+T.dateStr(at(c.days))+'<small>'+c.days+' дн.</small></span><span class="td-bar" aria-label="Прошло времени '+past+'%"><i style="width:'+past+'%"></i></span><span class="td-num" data-l="Этапы">'+c.done+' из '+c.total+'</span><span class="td-num" data-l="Документы">'+c.docs[0]+' из '+c.docs[1]+'</span></button>'
      }).join(''):'<p class="empty">Доступных контрактов по этому запросу нет. Измените поиск или срок.</p>';
      $$('.th[data-sort]').forEach(function(t){t.dataset.dir=t.dataset.sort===st.sort?(st.dir>0?'asc':'desc'):''});
      if(G&&animate)G.fromTo('.td-bar i',{scaleX:0},{scaleX:1,duration:.5,stagger:.04,ease:'power2.out',transformOrigin:'left'});
    }
    function pick(id,animate){st.sel=id;$$('.tr').forEach(function(r){r.classList.toggle('is-on',r.dataset.id===id)});T.passport($('#detail'),byId(id),animate,'К контрактам')}
    $('#list').addEventListener('click',function(e){var r=e.target.closest('.tr');if(!r)return;pick(r.dataset.id,true);openDetail(true)});
    $('#list-head').addEventListener('click',function(e){var t=e.target.closest('[data-sort]');if(!t)return;var k=t.dataset.sort;if(st.sort===k)st.dir*=-1;else{st.sort=k;st.dir=1}draw(false)});
    $('#q').addEventListener('input',function(e){st.q=e.target.value.trim().toLowerCase();draw(false)});
    $$('.chip-f').forEach(function(b){b.addEventListener('click',function(){st.g=b.dataset.g===''?null:+b.dataset.g;$$('.chip-f').forEach(function(x){x.classList.toggle('is-on',x===b)});draw(true)})});
    T.onTheme(function(){var c=$('#detail');if(c._redraw)c._redraw()});
    draw(true);pick('c1',true);
  }

  /* ---------- Мои задания ---------- */
  function tasks(){
    T.shell({page:'tasks',title:'Мои задания',sub:'Решения, проверки и подготовка по вашим контрактам'});
    var cols=[['decide','Ожидают решения',['decision','draft']],['review','На проверке',['review']],['work','В работе',['new','working']],['done','Завершено',['done']]];
    var st={c:'',col:'decide'};
    $('#toolbar').innerHTML='<label class="field-inline">Контракт<select id="f-c"><option value="">Все контракты</option>'+CONTRACTS.map(function(c){return '<option value="'+c.id+'">'+esc(c.short)+'</option>'}).join('')+'</select></label><div class="seg seg-show" role="tablist" aria-label="Статус">'+cols.map(function(c,i){return '<button type="button" role="tab" data-col="'+c[0]+'" aria-selected="'+(i===0)+'">'+c[1]+'</button>'}).join('')+'</div>';
    function draw(animate){
      $('#kanban').innerHTML=cols.map(function(c){
        var list=T.TASKS.filter(function(t){return c[2].indexOf(t.status)>-1&&(!st.c||t.c===st.c)});
        return '<section class="panel col'+(c[0]===st.col?' is-open':'')+'" data-col="'+c[0]+'" aria-label="'+c[1]+'"><header class="col-head"><h2>'+c[1]+'</h2><b>'+list.length+'</b></header><div class="col-body scroll">'+(list.length?list.map(T.taskHtml).join(''):'<p class="empty">Здесь пока нет заданий.</p>')+'</div></section>';
      }).join('');
      if(G&&animate)G.fromTo('#kanban .task',{y:10,opacity:0},{y:0,opacity:1,duration:.28,stagger:.03,ease:'power2.out'});
    }
    T.bindTasks($('#kanban'),function(){draw(true)},function(id){location.href='index.html?c='+id});
    $('#f-c').addEventListener('change',function(e){st.c=e.target.value;draw(true)});
    $$('[data-col]',$('#toolbar')).forEach(function(b){b.addEventListener('click',function(){st.col=b.dataset.col;$$('[data-col]',$('#toolbar')).forEach(function(x){x.setAttribute('aria-selected',String(x===b))});draw(true)})});
    draw(true);
  }

  /* ---------- Документы ---------- */
  function documents_(){
    T.shell({page:'documents',title:'Документы',sub:'Всё для работы с контрактом — от старта до сдачи'});
    var cat=window.TP_CATALOG||[],notes=['Подготовка к началу работ','Документы во время выполнения контракта','Завершение и сдача работ','Другие документы'];
    var st={q:'',avail:'all',sec:'all',doc:null,c:'c1'};
    $('#toolbar').innerHTML='<label class="search">'+ic('i-search')+'<input id="q" type="search" placeholder="Найти документ: приказ, АОСР, письмо…" autocomplete="off" aria-label="Найти документ"></label><select id="avail" aria-label="Доступность"><option value="all">Все документы</option><option value="yes">Доступны сейчас</option><option value="no">В подготовке</option></select><div class="chips" role="group" aria-label="Этап контракта"><button class="chip-f is-on" type="button" data-s="all">Все</button>'+cat.map(function(g,i){return '<button class="chip-f" type="button" data-s="'+i+'">'+esc(g.section)+' <b>'+g.documents.length+'</b></button>'}).join('')+'</div>';
    function hint(d){return d.route==='aosr_list'?'Подготовка актов скрытых работ':d.route==='work_journal'?'Записи о выполненных работах':d.route==='schedules'?'Этапы и сроки выполнения':'Данные контракта помогут заполнить документ'}
    var isOpen=function(d){return ['aosr_list','work_journal','schedules'].indexOf(d.route)>-1};
    function draw(animate){
      var total=0,html=cat.map(function(g,i){
        if(st.sec!=='all'&&st.sec!==String(i))return '';
        var ds=g.documents.filter(function(d){return (!st.q||has(st.q,d.title))&&(st.avail==='all'||(st.avail==='yes')===!!d.available)});
        if(!ds.length)return '';total+=ds.length;
        return '<section class="doc-sec"><header><h2>'+esc(g.section)+'</h2><span>'+(notes[Math.min(i,3)])+'</span></header><div class="sheets">'+ds.map(function(d){
          var id=i+':'+g.documents.indexOf(d),on=st.doc===id;
          return d.available?'<button class="sheet is-ready'+(on?' is-on':'')+'" type="button" data-doc="'+id+'"><b>'+esc(d.title)+'</b><small>'+hint(d)+'</small><span class="sheet-act">'+(isOpen(d)?'Открыть':'Создать')+'</span></button>':'<div class="sheet"><b>'+esc(d.title)+'</b><small>Этот документ появится в каталоге позже</small><span class="sheet-soon">В подготовке</span></div>'
        }).join('')+'</div></section>';
      }).join('');
      $('#doc-list').innerHTML=total?html:'<p class="empty">Ничего не найдено. Попробуйте изменить запрос или фильтры.</p>';
      if(G&&animate)G.fromTo('.sheet',{y:10,opacity:0},{y:0,opacity:1,duration:.26,stagger:{each:.012,from:'start'},ease:'power2.out'});
    }
    function detail(animate){
      var el=$('#detail');
      if(!st.doc){el.innerHTML='<button class="back" type="button" data-back>'+ic('i-back')+'К каталогу</button><div class="pick-empty"><div class="paper-ico" aria-hidden="true"></div><h2>Выберите документ</h2><p class="sub">Затем укажите контракт: известные данные подставятся в форму.</p></div>';return}
      var a=st.doc.split(':'),g=cat[+a[0]],d=g.documents[+a[1]];
      el.innerHTML='<button class="back" type="button" data-back>'+ic('i-back')+'К каталогу</button><span class="stage">'+esc(g.section)+'</span><h2 class="d-title">'+esc(d.title)+'</h2><p class="sub">'+hint(d)+'</p><h3 class="mini-h">Контракт</h3><div class="radio-list scroll" role="radiogroup" aria-label="Контракт">'+CONTRACTS.map(function(c){return '<label class="radio"><input type="radio" name="dc" value="'+c.id+'"'+(c.id===st.c?' checked':'')+'><span><b>'+esc(c.short)+'</b><small>'+esc(c.number)+'</small></span></label>'}).join('')+'</div><button class="btn btn-pri" type="button" id="doc-go">'+(isOpen(d)?'Открыть':'Создать документ')+'</button>';
      $$('input[name=dc]',el).forEach(function(r){r.addEventListener('change',function(){st.c=r.value})});
      $('#doc-go').addEventListener('click',function(){var map={schedules:'schedule',aosr_list:'acts',work_journal:'journal'};if(map[d.route]){location.href='contract.html?c='+st.c+'#'+map[d.route];return}T.docForm(d.route==='create_order'||d.route==='create_workers_list'?d.route:'letter',d.title,st.c)});
      if(G&&animate)G.fromTo(el.children,{x:12,opacity:0},{x:0,opacity:1,duration:.26,stagger:.03,ease:'power2.out'});
    }
    $('#doc-list').addEventListener('click',function(e){var b=e.target.closest('[data-doc]');if(!b)return;st.doc=b.dataset.doc;$$('.sheet').forEach(function(s){s.classList.toggle('is-on',s===b)});detail(true);openDetail(true)});
    $('#q').addEventListener('input',function(e){st.q=e.target.value.trim().toLowerCase();draw(false)});
    $('#avail').addEventListener('change',function(e){st.avail=e.target.value;draw(true)});
    $$('.chip-f').forEach(function(b){b.addEventListener('click',function(){st.sec=b.dataset.s;$$('.chip-f').forEach(function(x){x.classList.toggle('is-on',x===b)});draw(true)})});
    draw(true);detail(false);
  }

  /* ---------- Работники ---------- */
  function people(){
    T.shell({page:'people',title:'Работники',sub:'Люди для документов и участия в контрактах',cta:'Добавить работника'});
    var st={q:'',arch:false,sel:'p2'};
    $('#toolbar').innerHTML='<label class="search">'+ic('i-search')+'<input id="q" type="search" placeholder="Найти по фамилии, имени или должности" autocomplete="off" aria-label="Найти работника"></label><div class="chips" role="group" aria-label="Список"><button class="chip-f is-on" type="button" data-a="0">Активные</button><button class="chip-f" type="button" data-a="1">Архив</button></div>';
    var full=function(p){return [p.last,p.first,p.mid].filter(Boolean).join(' ')};
    var byP=function(id){return T.PEOPLE.filter(function(p){return p.id===id})[0]};
    function draw(animate){
      var rows=T.PEOPLE.filter(function(p){return !!p.archived===st.arch&&(!st.q||has(st.q,full(p))||has(st.q,p.pos))});
      $('#list-title').textContent=st.arch?'В архиве':'Работники компании';
      $('#list').innerHTML=rows.length?rows.map(function(p){return '<button class="person'+(p.id===st.sel?' is-on':'')+'" type="button" data-id="'+p.id+'"><span class="ava">'+esc(p.first[0]+p.last[0])+'</span><span class="p-main"><b>'+esc(full(p))+'</b><small>'+esc(p.pos||'Должность не указана')+(p.phone?' · '+esc(p.phone):'')+'</small></span><span class="tag">Контрактов: '+p.contracts.length+'</span><span class="tag '+(p.member?'tag-on':'')+'">'+(p.member?'Участник команды':'С командой не связан')+'</span></button>'}).join(''):'<p class="empty">'+(st.q?'Работники не найдены. Попробуйте изменить запрос.':st.arch?'В архиве пока никого нет.':'Добавьте первого работника — его данные можно будет использовать в документах.')+'</p>';
      if(G&&animate)G.fromTo('.person',{y:8,opacity:0},{y:0,opacity:1,duration:.26,stagger:.03,ease:'power2.out'});
    }
    function detail(animate){
      var p=byP(st.sel),el=$('#detail');
      if(!p){el.innerHTML='<div class="pick-empty"><h2>Выберите работника</h2></div>';return}
      el.innerHTML='<button class="back" type="button" data-back>'+ic('i-back')+'К списку</button><header class="p-card-head"><span class="ava ava-l">'+esc(p.first[0]+p.last[0])+'</span><div><h2>'+esc(full(p))+'</h2><p class="sub">'+esc(p.pos||'Должность не указана')+'</p></div></header>'+
        '<dl class="facts facts-1"><div><dt>Телефон</dt><dd>'+esc(p.phone||'Не указан')+'</dd></div><div><dt>Доступ в ТендерПульт</dt><dd>'+(p.member?'Участник команды · '+esc(p.role):'Карточка не связана с участником команды')+'</dd></div></dl>'+
        '<h3 class="mini-h">Где работает</h3><div class="checks scroll">'+CONTRACTS.map(function(c){return '<label class="radio"><input type="checkbox" value="'+c.id+'"'+(p.contracts.indexOf(c.id)>-1?' checked':'')+'><span><b>'+esc(c.short)+'</b><small>'+esc(c.number)+'</small></span></label>'}).join('')+'</div><p class="fine">Участие в контракте и доступ к сервису настраиваются отдельно.</p>'+
        '<div class="row-acts"><button class="btn btn-ghost btn-sm" type="button" data-soon="Редактирование карточки">Изменить карточку</button><button class="btn btn-ghost btn-sm" type="button" id="arch">'+(p.archived?'Восстановить':'В архив')+'</button></div>';
      $$('.checks input',el).forEach(function(ch){ch.addEventListener('change',function(){var i=p.contracts.indexOf(ch.value);if(ch.checked&&i<0)p.contracts.push(ch.value);if(!ch.checked&&i>-1)p.contracts.splice(i,1);T.save();draw(false)})});
      $('#arch').addEventListener('click',function(){var prev=!!p.archived;p.archived=!prev;T.save();var first=T.PEOPLE.filter(function(x){return !!x.archived===st.arch})[0];st.sel=first?first.id:null;draw(true);detail(true);T.toast(prev?'Работник восстановлен':'Работник перемещён в архив',function(){p.archived=prev;T.save();st.sel=p.id;draw(true);detail(true)});openDetail(false)});
      if(G&&animate)G.fromTo(el.children,{x:12,opacity:0},{x:0,opacity:1,duration:.26,stagger:.03,ease:'power2.out'});
    }
    $('#list').addEventListener('click',function(e){var r=e.target.closest('.person');if(!r)return;st.sel=r.dataset.id;$$('.person').forEach(function(x){x.classList.toggle('is-on',x===r)});detail(true);openDetail(true)});
    $('#q').addEventListener('input',function(e){st.q=e.target.value.trim().toLowerCase();draw(false)});
    $$('.chip-f').forEach(function(b){b.addEventListener('click',function(){st.arch=b.dataset.a==='1';$$('.chip-f').forEach(function(x){x.classList.toggle('is-on',x===b)});var f=T.PEOPLE.filter(function(x){return !!x.archived===st.arch})[0];st.sel=f?f.id:null;draw(true);detail(true)})});
    draw(true);detail(false);
  }

  /* ---------- Компания ---------- */
  function company(){
    T.shell({page:'company',title:'Компания',sub:'Реквизиты, счета и настройки для работы с контрактами'});
    var TABS=[['req','Реквизиты'],['team','Команда и доступ'],['sign','Подписанты'],['keys','Ключи']];
    var cur=(location.hash||'').slice(1);if(!TABS.some(function(t){return t[0]===cur}))cur='req';
    $('#toolbar').innerHTML='<div class="co-card"><span class="ava ava-l">П</span><div><small>Профиль компании</small><b>ООО «Пример Строй»</b><span>ИНН 7700000000 · Смирнов Андрей Викторович</span></div></div><div class="tabs tabs-wide" role="tablist" aria-label="Разделы компании"><i class="tabs-ind" aria-hidden="true"></i>'+TABS.map(function(t){return '<button type="button" role="tab" data-t="'+t[0]+'" aria-selected="'+(t[0]===cur)+'">'+t[1]+'</button>'}).join('')+'</div>';
    var dl=function(a){return '<dl class="dl">'+a.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>'}).join('')+'</dl>'};
    var sec=function(t,b,noEdit){return '<section class="panel co-sec"><header class="p-head"><h2>'+t+'</h2>'+(noEdit?'':'<button class="link" type="button" data-soon="Изменение раздела «'+t+'»">Изменить</button>')+'</header>'+b+'</section>'};
    var V={
      req:function(){return '<div class="co-grid"><div class="co-main">'+
        sec('Компания',dl([['Полное наименование','Общество с ограниченной ответственностью «Пример Строй»'],['Тип организации','ООО'],['ИНН','7700000000'],['ОГРН / ОГРНИП','1027700000000'],['КПП','770001001'],['Юридический адрес / адрес ИП','г. Москва, ул. Примерная, д. 1']]))+
        sec('Руководитель',dl([['ФИО','Смирнов Андрей Викторович'],['Должность','Генеральный директор']]))+
        sec('Банковские счета · 2','<div class="acc"><div><b>Основной счёт <span class="tag tag-on">Основной</span></b><small>Банк Пример · счёт •••• 0001</small></div><button class="link" type="button" data-soon="Банковский счёт">Изменить</button></div><div class="acc"><div><b>Счёт для контрактов</b><small>Банк Образец · счёт •••• 0002</small></div><button class="link" type="button" data-soon="Банковский счёт">Изменить</button></div><button class="link add" type="button" data-soon="Новый банковский счёт">Добавить счёт</button>',true)+
        sec('Контакты',dl([['Телефон','+7 900 000-00-00'],['Электронная почта','info@example.ru'],['Фактический адрес','Совпадает с юридическим'],['Контактное лицо','Орлова Мария Сергеевна'],['Идентификатор ЭДО','Не указан']]))+
        '</div><aside class="co-side"><section class="panel"><h2>Биллинг и ключи</h2><div class="big-n"><span>Доступно для добавления контрактов</span><strong>3</strong></div><button class="btn btn-ghost btn-sm" type="button" data-go="keys">Ключи и пакеты</button><p class="fine">Покупка будет доступна после подключения оплаты.</p></section><section class="panel"><h2>Карточка компании</h2><p class="sub">Скачать сохранённые реквизиты и выбранный банковский счёт.</p><label class="fl"><span>Счёт для карточки</span><select><option>Основной счёт</option><option>Счёт для контрактов</option></select></label><button class="btn btn-pri btn-sm" type="button" data-soon="Скачивание карточки компании">Скачать карточку</button></section><section class="panel stamp-card"><h2>Подпись и печать</h2><p class="sub">Изображения для документов</p><svg viewBox="0 0 200 200" aria-hidden="true"><use href="#stamp-ok"/></svg><button class="link" type="button" data-soon="Подпись и печать">Настроить</button></section></aside></div>'},
      team:function(){var ms=T.PEOPLE.filter(function(p){return p.member});return '<div class="co-grid"><div class="co-main co-1"><section class="panel"><header class="p-head"><h2>Участники</h2><span class="sub">'+ms.length+' в списке</span></header><div class="scroll list-in">'+ms.map(function(p,i){return '<article class="member"><span class="ava">'+esc(p.first[0]+p.last[0])+'</span><div class="p-main"><b>'+esc(p.last+' '+p.first)+'</b><small>user'+(i+1)+'@example.ru</small></div><span class="tag">'+esc(p.role)+'</span><span class="tag tag-on">Доступ активен</span><span class="tag">'+(i===0?'Доступ ко всем контрактам · '+CONTRACTS.length:'Контракты: доступ · '+p.contracts.length)+'</span>'+(i===0?'':'<button class="link" type="button" data-soon="Настройка доступа">Настроить</button>')+'</article>'}).join('')+'</div></section><section class="panel"><header class="p-head"><h2>Приглашения</h2><span class="sub">1 в списке</span></header><article class="member"><div class="p-main"><b>new.user@example.ru</b><small>Прораб · Ожидает ответа · до '+T.fullDate(at(6))+'</small></div><span class="tag">Контракты: № 41-С/26</span><button class="link" type="button" data-soon="Настройка приглашения">Настроить</button></article></section></div><aside class="co-side"><section class="panel"><div class="big-n"><span>Участников команды</span><strong>'+ms.length+'</strong></div><div class="big-n"><span>Приглашения</span><strong>1</strong></div><a class="link" href="people.html">Справочник работников</a></section><section class="panel"><p class="fine">Доступ в сервис и участие в работах — разные вещи. Работников для документов можно вести без приглашения в команду.</p><button class="btn btn-red btn-sm" type="button" data-soon="Приглашение участника">Пригласить участника</button></section></aside></div>'},
      sign:function(){var s=[['Смирнов Андрей Викторович','Генеральный директор','Устав',1],['Орлова Мария Сергеевна','Инженер ПТО','Доверенность № 12',0]];return '<div class="co-grid"><div class="co-main co-1"><section class="panel"><header class="p-head"><div><h2>Подписанты</h2><p class="sub">Люди, которые могут подписывать документы компании.</p></div><button class="btn btn-ghost btn-sm" type="button" data-soon="Новый подписант">Добавить подписанта</button></header><div class="scroll list-in">'+s.map(function(p){return '<article class="member"><span class="ava">'+p[0][0]+'</span><div class="p-main"><b>'+p[0]+'</b><small>'+p[1]+' · основание: '+p[2]+'</small></div>'+(p[3]?'<span class="tag tag-on">Основной</span>':'')+'<span class="tag">Из справочника работников</span><button class="link" type="button" data-soon="Изменение подписанта">Изменить</button></article>'}).join('')+'</div></section></div><aside class="co-side"><section class="panel"><p class="fine">Здесь хранится справочник компании. Выбор подписанта для конкретного контракта и автоматическая подстановка в документы появятся позже.</p></section></aside></div>'},
      keys:function(){var k=[['Ключ 1 · бесплатный при регистрации',340],['Ключ 2',210],['Ключ 3',96]];return '<div class="co-grid"><div class="co-main co-1"><section class="panel"><header class="p-head"><div><h2>Доступные ключи</h2><p class="sub">Каждый ключ позволяет добавить один контракт.</p></div></header><div class="key-list">'+k.map(function(x){return '<div class="key-row"><span class="key-ico">'+ic('i-key')+'</span><b>'+x[0]+'</b><span class="sub">Действует до '+T.fullDate(at(x[1]))+'</span></div>'}).join('')+'</div></section><section class="panel"><h2>Пополнить ключи</h2><p class="sub">Выберите количество ключей и способ оплаты.</p><div class="packs" role="group" aria-label="Количество ключей"><button type="button" class="pack" data-n="1"><b>1 ключ</b><small>Цена уточняется</small></button><button type="button" class="pack" data-n="5"><b>5 ключей</b><small>Цена уточняется</small></button><button type="button" class="pack" data-n="10"><b>10 ключей</b><small>Цена уточняется</small></button></div><div class="pay"><div class="pay-opt is-on"><b>Банковская карта</b><small>Будет доступна после подключения оплаты</small></div><div class="pay-opt"><b>Счёт для организации или ИП</b><small>Временно недоступен</small></div></div></section></div><aside class="co-side"><section class="panel order"><h2>Ваш заказ</h2><p class="sub">Ключи для компании «Пример Строй»</p><dl class="dl dl-row"><div><dt>Количество</dt><dd id="ord-n">—</dd></div><div><dt>Способ оплаты</dt><dd>Банковская карта</dd></div><div><dt>Цена одного ключа</dt><dd>Уточняется</dd></div><div><dt>Срок ключа</dt><dd>1 год с покупки</dd></div><div><dt>Итого</dt><dd>Пока не рассчитано</dd></div></dl><button class="btn btn-pri btn-sm" type="button" disabled>Оплата пока недоступна</button><p class="fine">Оплата ещё не подключена. Покупка и начисление ключей через эту страницу пока недоступны.</p></section></aside></div>'}
    };
    var ind=$('.tabs-ind');
    function moveInd(){var on=$('.tabs-wide [aria-selected=true]');if(!on||!on.offsetWidth)return;ind.style.width=on.offsetWidth+'px';ind.style.transform='translateX('+on.offsetLeft+'px)'}
    function show(t,animate){
      cur=t;$$('.tabs-wide button').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.t===t))});moveInd();
      $('#co-view').innerHTML=V[t]();
      if(history.replaceState)history.replaceState(null,'','#'+t);
      $$('.pack').forEach(function(p){p.addEventListener('click',function(){$$('.pack').forEach(function(x){x.classList.toggle('is-on',x===p)});$('#ord-n').textContent=p.querySelector('b').textContent})});
      if(G&&animate)G.fromTo('#co-view .panel',{y:12,opacity:0},{y:0,opacity:1,duration:.28,stagger:.04,ease:'power2.out'});
    }
    $$('.tabs-wide button').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.t,true)})});
    $('#co-view').addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g)show(g.dataset.go,true)});
    window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(h!==cur&&V[h])show(h,true)});
    show(cur,false);moveInd();window.addEventListener('resize',moveInd);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(moveInd);
  }
})();
