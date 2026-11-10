/* Окна, формы, задание, чат Софи, меню профиля */
(function(){
  'use strict';
  var T=window.TP,G=T.G,$=T.$,$$=T.$$,esc=T.esc,CONTRACTS=T.CONTRACTS,byId=T.byId;
  var ic=function(n){return '<svg class="ic"><use href="#'+n+'"/></svg>'};

  /* Окно: нативный dialog, закрывается по Esc и клику мимо */
  function dialog(o){
    var d=document.createElement('dialog');d.className='dlg'+(o.wide?' dlg-wide':'');
    d.innerHTML='<div class="dlg-box"><header class="dlg-head"><div><h2>'+esc(o.title)+'</h2>'+(o.sub?'<p class="sub">'+esc(o.sub)+'</p>':'')+'</div><button class="dlg-x" type="button" aria-label="Закрыть" data-close>'+ic('i-close')+'</button></header><div class="dlg-body scroll">'+o.body+'</div>'+(o.foot?'<footer class="dlg-foot">'+o.foot+'</footer>':'')+'</div>';
    document.body.appendChild(d);
    function close(){d.close()}
    d.addEventListener('close',function(){d.remove();if(o.onClose)o.onClose()});
    d.addEventListener('click',function(e){if(e.target===d||e.target.closest('[data-close]'))close()});
    d.showModal();
    if(G)G.fromTo($('.dlg-box',d),{y:18,opacity:0,scale:.98},{y:0,opacity:1,scale:1,duration:.24,ease:'power2.out'});
    return {el:d,close:close};
  }
  T.dialog=dialog;

  /* Поля формы */
  function field(f,i){
    var id='f'+i,req=f.req?' required':'',lab='<span>'+esc(f.label)+(f.req?' <i>*</i>':'')+'</span>',val=esc(f.value||'');
    if(f.type==='h')return '<h3 class="f-h">'+esc(f.label)+'</h3>'+(f.note?'<p class="sub f-note">'+esc(f.note)+'</p>':'');
    if(f.type==='select')return '<label class="fld">'+lab+'<select'+req+'>'+f.options.map(function(o){return '<option'+(o===f.value?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select></label>';
    if(f.type==='area')return '<label class="fld fld-w">'+lab+'<textarea rows="3"'+req+' placeholder="'+esc(f.ph||'')+'">'+val+'</textarea></label>';
    if(f.type==='check')return '<label class="fld-c fld-w"><input type="checkbox"'+(f.value?' checked':'')+'><span>'+esc(f.label)+'</span></label>';
    if(f.type==='contracts')return '<div class="fld fld-w"><span>'+esc(f.label)+'</span><div class="ck-grid">'+CONTRACTS.map(function(c,k){return '<label class="fld-c"><input type="checkbox"'+(f.checked&&f.checked.indexOf(c.id)>-1?' checked':'')+'><span>'+esc(c.short)+' <small>'+esc(c.number)+'</small></span></label>'}).join('')+'</div></div>';
    if(f.type==='more')return '<details class="f-more fld-w"><summary>'+esc(f.label)+'</summary><div class="f-grid">'+f.fields.map(function(x,k){return field(x,i+'_'+k)}).join('')+'</div></details>';
    if(f.type==='file')return '<div class="fld fld-w"><span>'+esc(f.label)+'</span><div class="drop"><span>'+esc(f.ph||'Здесь появится изображение')+'</span><button class="btn btn-ghost btn-sm" type="button" data-pickfile>Выбрать изображение</button></div></div>';
    return '<label class="fld'+(f.wide?' fld-w':'')+'">'+lab+'<input type="'+(f.type||'text')+'"'+req+' value="'+val+'" placeholder="'+esc(f.ph||'')+'"'+(f.ac?' autocomplete="'+f.ac+'"':'')+'></label>';
  }
  function formDialog(s){
    var dl=dialog({title:s.title,sub:s.sub,wide:s.wide,body:(s.note?'<div class="f-info">'+esc(s.note)+'</div>':'')+'<form class="f-grid" novalidate>'+s.fields.map(field).join('')+'<p class="f-err" role="alert" hidden>Заполните обязательные поля.</p></form>',foot:'<button class="btn btn-ghost" type="button" data-close>Отмена</button><button class="btn btn-pri" type="button" data-submit>'+esc(s.submit||'Сохранить')+'</button>'});
    var form=$('form',dl.el);
    $$('[data-pickfile]',dl.el).forEach(function(b){b.addEventListener('click',function(){T.toast('В макете файлы не загружаются')})});
    $('[data-submit]',dl.el).addEventListener('click',function(){
      var bad=$$('[required]',form).filter(function(x){return !x.value.trim()});
      $$('.is-bad',form).forEach(function(x){x.classList.remove('is-bad')});
      bad.forEach(function(x){x.classList.add('is-bad')});
      $('.f-err',form).hidden=!bad.length;
      if(bad.length){bad[0].focus();return}
      dl.close();T.toast(s.done||'Сохранено');if(s.onDone)s.onDone(form);
    });
    return dl;
  }
  T.formDialog=formDialog;

  var PERSON=[{label:'Фамилия',req:1},{label:'Имя',req:1},{label:'Отчество'},{label:'Должность'},{label:'Телефон',type:'tel',ac:'off'},
    {type:'more',label:'Документы и дополнительные сведения',fields:[{label:'Гражданство',type:'select',options:['Россия','Другое']},{label:'Тип документа',type:'select',options:['Паспорт','Иной документ']},{label:'Номер документа'},{label:'Кем выдан',wide:1},{label:'Дата выдачи',type:'date'},{label:'Код подразделения'},{label:'Номер патента'},{label:'Дата рождения',type:'date'},{label:'Марка автомобиля'},{label:'Номер автомобиля'}]},
    {type:'contracts',label:'Где работает'}];
  var REQS={
    'Компания':[{label:'Тип организации',type:'select',options:['ООО','ИП'],value:'ООО'},{label:'ИНН',value:'7700000000',req:1},{label:'Полное наименование',value:'Общество с ограниченной ответственностью «Пример Строй»',wide:1,req:1},{label:'ОГРН / ОГРНИП',value:'1027700000000'},{label:'КПП',value:'770001001'},{label:'Юридический адрес / адрес ИП',value:'г. Москва, ул. Примерная, д. 1',wide:1,req:1}],
    'Руководитель':[{label:'Фамилия',value:'Смирнов',req:1},{label:'Имя',value:'Андрей',req:1},{label:'Отчество',value:'Викторович'},{label:'Должность',value:'Генеральный директор'}],
    'Контакты':[{label:'Фактический адрес',wide:1},{type:'check',label:'Совпадает с юридическим адресом',value:1},{label:'Контактное лицо',value:'Орлова Мария Сергеевна'},{label:'Телефон',type:'tel',value:'+7 900 000-00-00'},{label:'Почта компании',type:'email',value:'info@example.ru'},{label:'Идентификатор ЭДО'}]
  };
  var BANK=[{label:'Название счёта',req:1},{label:'БИК',req:1,ph:'9 цифр'},{label:'Банк',wide:1},{label:'Расчётный счёт',req:1},{label:'Корреспондентский счёт'},{type:'check',label:'Основной счёт'},{type:'check',label:'Счёт активен',value:1}];
  var ROLES=['Руководитель','Прораб','ПТО','Снабженец'];
  var INVITE=[{label:'Электронная почта',type:'email',req:1,wide:1},{label:'Роль',type:'select',options:ROLES,value:'Прораб'},{label:'Карточка из справочника',type:'select',options:['Не выбрана'].concat(T.PEOPLE.filter(function(p){return !p.member&&!p.archived}).map(function(p){return p.last+' '+p.first}))},{type:'contracts',label:'Доступ к контрактам'},{type:'more',label:'Права доступа · раскрыть список',fields:[{type:'check',label:'Просмотр журнала',value:1},{type:'check',label:'Просмотр графика',value:1},{type:'check',label:'Акты скрытых работ'},{type:'check',label:'Создание документов'},{type:'check',label:'Просмотр работников'},{type:'check',label:'Приглашение участников'}]}];
  var FORMS={
    'Добавить работника':{title:'Новый работник',sub:'Основные данные можно дополнить позже',fields:PERSON,submit:'Сохранить',done:'Работник сохранён'},
    'Редактирование карточки':{title:'Редактирование карточки',sub:'Эти сведения используются в документах',fields:PERSON,done:'Карточка сохранена'},
    'Приглашение участника':{title:'Пригласить сотрудника',sub:'Сотрудник получит письмо со ссылкой. Ссылка действует 7 дней.',fields:INVITE,submit:'Отправить приглашение',done:'Приглашение отправлено'},
    'Настройка доступа':{title:'Настроить доступ',sub:'Изменения вступят в силу после сохранения.',fields:INVITE.slice(1),done:'Доступ обновлён'},
    'Настройка приглашения':{title:'Настроить приглашение',sub:'Изменения вступят в силу после сохранения.',fields:INVITE.slice(1),done:'Приглашение обновлено'},
    'Новый подписант':{title:'Новый подписант',sub:'Укажите человека и его полномочия',fields:[{label:'ФИО',req:1,wide:1},{label:'Должность'},{label:'Основание полномочий',ph:'Устав, доверенность'},{type:'check',label:'Основной подписант'}],done:'Подписант добавлен'},
    'Изменение подписанта':{title:'Изменить подписанта',fields:[{label:'ФИО',req:1,wide:1,value:'Смирнов Андрей Викторович'},{label:'Должность',value:'Генеральный директор'},{label:'Основание полномочий',value:'Устав'},{type:'check',label:'Основной подписант',value:1},{type:'check',label:'Подписант активен',value:1}],done:'Подписант сохранён'},
    'Банковский счёт':{title:'Банковский счёт',sub:'Введите БИК — данные банка подставятся автоматически.',fields:BANK,submit:'Сохранить счёт',done:'Счёт сохранён'},
    'Новый банковский счёт':{title:'Новый банковский счёт',sub:'Введите БИК — данные банка подставятся автоматически.',fields:BANK,submit:'Сохранить счёт',done:'Счёт добавлен'},
    'Изменение раздела «Компания»':{title:'Основные сведения',sub:'Для документов нужны наименование, ИНН и адрес',fields:REQS['Компания'],done:'Реквизиты сохранены'},
    'Изменение раздела «Руководитель»':{title:'Руководитель',fields:REQS['Руководитель'],done:'Реквизиты сохранены'},
    'Изменение раздела «Контакты»':{title:'Контакты',sub:'Адреса, телефон и электронная почта',fields:REQS['Контакты'],done:'Контакты сохранены'},
    'Подпись и печать':{title:'Подпись и печать',sub:'Загрузите изображения один раз. При создании документа можно выбрать, нужно ли их добавить.',fields:[{type:'file',label:'Подпись',ph:'Здесь появится изображение подписи'},{type:'file',label:'Печать',ph:'Здесь появится изображение печати'}],done:'Изображения сохранены'}
  };
  var DOC_FORMS={
    create_order:function(t,c){return {title:'Приказ об ответственном',sub:c.title,note:'Предварительный номер: 7/2026. Окончательно присваивается при создании.',fields:[{label:'Ответственный работник',type:'select',req:1,options:T.PEOPLE.filter(function(p){return !p.archived}).map(function(p){return p.last+' '+p.first})},{label:'ФИО в дательном падеже',wide:1,ph:'Проверьте склонение для приказа'},{label:'Дата приказа',type:'date'},{type:'check',label:'Добавить подпись и печать'}],submit:'Создать приказ',done:'Приказ создан'}},
    create_workers_list:function(t,c){return {title:'Список работников',sub:c.title,note:'Предварительный номер: 3/2026. Окончательный номер присваивается при создании.',fields:[{type:'h',label:'Работники',note:'Выберите людей, которые войдут в документ.'}].concat(T.PEOPLE.filter(function(p){return !p.archived}).map(function(p){return {type:'check',label:p.last+' '+p.first+' · '+p.pos,value:p.contracts.indexOf(c.id)>-1}})),submit:'Создать список',done:'Список создан'}},
    letter:function(t,c){return {title:'Письмо заказчику',sub:c.title,note:'Предварительный номер: 12/2026. Окончательный номер присваивается при создании.',fields:[{label:'Получатель',wide:1,req:1},{label:'Кому',wide:1},{label:'Тема',wide:1,req:1,value:t},{type:'check',label:'Ответ на письмо'},{label:'Текст письма',type:'area',req:1}],submit:'Создать письмо',done:'Письмо создано'}}
  };

  /* Добавление контракта: поиск закупки и списание ключа */
  function addContract(){
    var dl=dialog({title:'Найти закупку',sub:'Введите номер закупки по 44-ФЗ — получим данные напрямую из ЕИС.',wide:1,
      body:'<form class="find" id="find"><label class="fld fld-w"><span>Номер закупки</span><input id="num" inputmode="numeric" placeholder="Например, 0372200227526000014"></label><button class="btn btn-pri" type="submit">Найти</button></form><p class="f-err" id="find-err" role="alert" hidden></p><div id="find-out"></div>'});
    var out=$('#find-out',dl.el);
    $('#find',dl.el).addEventListener('submit',function(e){e.preventDefault();
      var v=$('#num',dl.el).value.replace(/\D/g,''),err=$('#find-err',dl.el);
      if(v.length<11){err.textContent='Введите номер закупки: не меньше 11 цифр.';err.hidden=false;out.innerHTML='';return}
      err.hidden=true;out.innerHTML='<div class="progress-box"><b>Ищем подписанный контракт в ЕИС</b><p class="sub">Это может занять несколько минут.</p><progress></progress></div>';
      setTimeout(function(){if(!dl.el.isConnected)return;
        out.innerHTML='<section class="found"><header><h3>Закупка</h3><span class="tag tag-on">Найдена в ЕИС</span></header><p>Ремонт административного здания</p><dl class="dl dl-row"><div><dt>Номер закупки</dt><dd>'+esc(v)+'</dd></div><div><dt>Начальная цена</dt><dd>3 900 000 ₽</dd></div><div><dt>Заказчик</dt><dd>ГБУ «Образец»</dd></div></dl></section><div class="f-info">После подтверждения спишется один ключ. Сейчас доступно ключей: 3. Контракт останется доступен после истечения ключа.</div><div class="dlg-actions"><button class="btn btn-pri" type="button" id="activate">Добавить контракт</button></div>';
        $('#activate',dl.el).addEventListener('click',function(){dl.close();T.toast('Контракт добавлен, списан один ключ')});
        if(G)G.fromTo(out.children,{y:10,opacity:0},{y:0,opacity:1,duration:.26,stagger:.05});
      },900);
    });
    setTimeout(function(){var n=$('#num',dl.el);if(n)n.focus()},60);
  }

  function companies(){
    var dl=dialog({title:'Ваши компании',sub:'Выберите рабочее пространство.',body:'<div class="list-pick"><a class="pick-row is-on" href="index.html"><span class="ava">П</span><span class="p-main"><b>ООО «Пример Строй»</b><small>Текущая компания</small></span></a><button class="pick-row" type="button" id="co2"><span class="ava">О</span><span class="p-main"><b>ИП Образцов</b><small>Переключение на другую компанию</small></span></button></div><button class="link add" type="button" id="co-add">Добавить компанию</button>'});
    $('#co2',dl.el).addEventListener('click',function(){dl.close();T.toast('В макете показана одна компания')});
    $('#co-add',dl.el).addEventListener('click',function(){dl.close();formDialog({title:'Добавить компанию',fields:[{label:'Название компании',req:1,wide:1},{label:'ИНН'}],done:'Компания добавлена'})});
  }

  /* Формы по названию действия */
  T.openForm=function(name,el){
    if(name==='Добавить контракт'||name==='Добавить новый контракт'||name==='Добавление контракта'){addContract();return true}
    if(name==='Список компаний'){companies();return true}
    if(FORMS[name]){formDialog(FORMS[name]);return true}
    return false;
  };
  T.docForm=function(route,title,cid){var c=byId(cid)||CONTRACTS[0],mk=DOC_FORMS[route]||DOC_FORMS.letter;formDialog(mk(title,c))};

  /* Окно задания с результатами проверки */
  function taskDialog(t){
    var c=byId(t.c),items=[['Демонтаж покрытия','м²',412,428],['Устройство стяжки','м²',398,398],['Облицовка стен','м²',256,241],['Установка светильников','шт.',64,64]];
    var measured=t.status!=='new';
    var rows=items.map(function(i){var d=i[3]-i[2];return '<tr><td>'+i[0]+'</td><td class="n">'+i[2]+' '+i[1]+'</td><td class="n">'+(measured?i[3]+' '+i[1]:'—')+'</td><td class="n'+(measured&&d?' diff':'')+'">'+(measured?(d>0?'+':'')+d:'—')+'</td></tr>'}).join('');
    var foot=t.status==='decision'?'<button class="btn btn-ghost" type="button" data-close>Позже</button><button class="btn btn-pri" type="button" data-pick-act>Выбрать действия</button>':t.status==='draft'?'<button class="btn btn-ghost" type="button" data-close>Закрыть</button><button class="btn btn-pri" type="button" data-draft>Открыть в письме</button>':'<button class="btn btn-ghost" type="button" data-close>Закрыть</button>';
    var body='<dl class="facts facts-3"><div><dt>Статус</dt><dd>'+T.STATUS[t.status]+'</dd></div><div><dt>Объект</dt><dd>'+esc(c.short)+'</dd></div><div><dt>Сведения</dt><dd>'+esc(t.meta)+'</dd></div></dl><h3 class="f-h">Смета и замеры</h3><div class="t-wrap"><table class="tbl"><thead><tr><th>Работа</th><th class="n">Смета</th><th class="n">Замер</th><th class="n">Разница</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(t.status==='decision'?'<h3 class="f-h">Что делать дальше</h3><div class="f-grid">'+['Письмо заказчику о расхождениях','Подготовить план-график','Поручить отложенные работы'].map(function(l){return '<label class="fld-c fld-w"><input type="checkbox"><span>'+l+'</span></label>'}).join('')+'</div>':'')+'<h3 class="f-h">Фото</h3><div class="photos" aria-hidden="true"><i></i><i></i><i></i></div>';
    var dl=dialog({title:t.title,sub:c.title,wide:1,body:body,foot:foot});
    var a=$('[data-pick-act]',dl.el);if(a)a.addEventListener('click',function(){dl.close();T.toast('Действия выбраны')});
    var b=$('[data-draft]',dl.el);if(b)b.addEventListener('click',function(){dl.close();T.docForm('letter',t.title,t.c)});
  }
  document.addEventListener('click',function(e){var b=e.target.closest('[data-task-open]');if(!b)return;var t=T.TASKS.filter(function(x){return x.id===b.dataset.taskOpen})[0];if(t)taskDialog(t)});

  /* Чат и пошаговые подсказки Софи */
  var HINTS={home:[['Главная','Здесь видно, что решить сегодня и какие контракты подходят к сроку.'],['Шкала','Нажмите на контракт: справа откроется его паспорт.'],['Задания','«Принять» можно отменить в течение нескольких секунд.']],contracts:[['Контракты','Сортируйте по стоимости или сроку, нажав на заголовок.'],['Ключи','Один ключ позволяет добавить один контракт.']],tasks:[['Задания','Карточки перемещаются между колонками по статусу.'],['Проверка','Откройте результаты, сверьте замеры и примите их.']],documents:[['Каталог','Выберите документ, затем контракт: данные подставятся в форму.']],people:[['Работники','Работник может быть в документах без доступа к сервису.']],company:[['Компания','Реквизиты нужны для создания документов по контракту.']],contract:[['Контракт','Вкладки ведут к работам, журналу, графику и актам.'],['График','Нажмите на период, чтобы изменить даты.'],['АОСР','Софи предлагает акты, но может ошибаться. Проверьте состав.']]};
  var ANSWERS=[[/аоср|акт/i,'Ближайший акт — гидроизоляция пола. Откройте раздел актов на странице контракта и проверьте состав.'],[/срок|график/i,'Ближе всего к завершению детский сад: 18 дней. Период этапа можно изменить в плане-графике.'],[/ключ/i,'Один ключ позволяет добавить один контракт. Сейчас доступно три.'],[/документ|приказ|письм/i,'Откройте раздел «Документы», выберите документ и контракт. Известные данные подставятся в форму.']];
  var chat=null;
  function openChat(){
    if(chat){chat.remove();chat=null;return}
    var page=document.body.dataset.page||'home';
    chat=document.createElement('section');chat.className='chat';chat.setAttribute('role','dialog');chat.setAttribute('aria-label','Софи, персональный помощник');
    chat.innerHTML='<header class="chat-head"><span class="sofi-dot">'+ic('i-spark')+'</span><div><b>Софи</b><small>Ваш персональный помощник</small></div><button class="dlg-x" type="button" aria-label="Закрыть" data-chat-x>'+ic('i-close')+'</button></header><label class="chat-ctx"><span>Контекст разговора</span><select><option>О компании</option>'+CONTRACTS.map(function(c){return '<option>'+esc(c.short)+'</option>'}).join('')+'</select></label><div class="chat-log scroll" id="chat-log" aria-live="polite"><p class="msg">Здравствуйте! Подскажу, что делать дальше по контрактам. Советы проверяйте: я могу ошибаться.</p></div><div class="chat-quick"><button type="button" data-q="Какие сроки ближе всего?">Сроки</button><button type="button" data-q="Что с АОСР?">АОСР</button><button type="button" data-hints>Подсказки по странице</button></div><form class="chat-form"><textarea rows="1" placeholder="Спросите Софи…" aria-label="Сообщение"></textarea><button class="btn btn-pri btn-sm" type="submit">Отправить</button></form>';
    document.body.appendChild(chat);
    if(G)G.fromTo(chat,{y:18,opacity:0},{y:0,opacity:1,duration:.24,ease:'power2.out'});
    var log=$('#chat-log',chat),ta=$('textarea',chat);
    function say(text,me){var p=document.createElement('p');p.className='msg'+(me?' me':'');p.textContent=text;log.appendChild(p);log.scrollTop=log.scrollHeight;if(G)G.from(p,{y:8,opacity:0,duration:.2})}
    function ask(q){if(!q.trim())return;say(q,true);var typing=document.createElement('p');typing.className='msg typing';typing.innerHTML='<i></i><i></i><i></i>';log.appendChild(typing);log.scrollTop=log.scrollHeight;setTimeout(function(){typing.remove();var a=ANSWERS.filter(function(x){return x[0].test(q)})[0];say(a?a[1]:'В макете я отвечаю только на примеры. Спросите о сроках, АОСР, ключах или документах.')},650)}
    $('.chat-form',chat).addEventListener('submit',function(e){e.preventDefault();ask(ta.value);ta.value=''});
    ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(ta.value);ta.value=''}});
    chat.addEventListener('click',function(e){
      if(e.target.closest('[data-chat-x]')){chat.remove();chat=null;return}
      var q=e.target.closest('[data-q]');if(q)ask(q.dataset.q);
      if(e.target.closest('[data-hints]')){chat.remove();chat=null;guide(HINTS[page]||HINTS.home)}
    });
    setTimeout(function(){ta.focus()},60);
  }
  function guide(steps){
    var i=0,el=document.createElement('section');el.className='chat guide';el.setAttribute('role','dialog');el.setAttribute('aria-label','Подсказки Софи');document.body.appendChild(el);
    function draw(){el.innerHTML='<header class="chat-head"><span class="sofi-dot">'+ic('i-spark')+'</span><div><b>Софи</b><small>Помощник по разделу</small></div><button class="dlg-x" type="button" aria-label="Закрыть" data-x>'+ic('i-close')+'</button></header><h3>'+esc(steps[i][0])+'</h3><p>'+esc(steps[i][1])+'</p><div class="guide-foot"><span>'+(i+1)+' из '+steps.length+'</span><button class="btn btn-ghost btn-sm" type="button" data-b'+(i?'':' disabled')+'>Назад</button><button class="btn btn-pri btn-sm" type="button" data-n>'+(i===steps.length-1?'Готово':'Дальше')+'</button></div>'}
    el.addEventListener('click',function(e){if(e.target.closest('[data-x]')){el.remove();return}if(e.target.closest('[data-b]')&&i){i--;draw()}if(e.target.closest('[data-n]')){if(i===steps.length-1)el.remove();else{i++;draw()}}});
    draw();if(G)G.fromTo(el,{y:18,opacity:0},{y:0,opacity:1,duration:.24,ease:'power2.out'});
  }
  T.guide=guide;

  /* Меню профиля */
  function meMenu(btn){
    var old=$('.menu-pop');if(old){old.remove();return}
    var r=btn.getBoundingClientRect(),m=document.createElement('div');m.className='menu-pop';m.setAttribute('role','menu');
    m.style.top=(r.bottom+6)+'px';m.style.right=Math.max(8,innerWidth-r.right)+'px';
    m.innerHTML='<div class="menu-me"><b>Смирнов Андрей</b><small>Руководитель · user@example.ru</small></div><a role="menuitem" href="company.html">Компания и реквизиты</a><a role="menuitem" href="company.html#team">Команда и доступ</a><button role="menuitem" type="button" data-logout>Выйти</button>';
    document.body.appendChild(m);
    $('[data-logout]',m).addEventListener('click',function(){m.remove();T.toast('В макете выход не выполняется')});
    setTimeout(function(){document.addEventListener('click',function h(e){if(!m.contains(e.target)&&e.target!==btn){m.remove();document.removeEventListener('click',h)}})},0);
  }

  /* Кнопки в меню появляются после отрисовки каркаса */
  var bind=function(){
    var a=$('#sofi-ask'),me=$('#me');
    if(a&&!a._b){a._b=1;a.addEventListener('click',openChat);$('.sofi-dot',$('.sofi')).style.cursor='pointer';$('.sofi-dot',$('.sofi')).addEventListener('click',openChat)}
    if(me&&!me._b){me._b=1;me.addEventListener('click',function(){meMenu(me)})}
  };
  var shell0=T.shell;T.shell=function(o){shell0(o);bind()};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){var m=$('.menu-pop');if(m)m.remove();if(chat){chat.remove();chat=null}var d=$('details.legal[open]');if(d)d.open=false}});
})();
