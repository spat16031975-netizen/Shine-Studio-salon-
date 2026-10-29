(function(){'use strict';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
/* появление со смещением 26px, лесенка 90 мс внутри группы */
$$('.rv-group').forEach(function(g){$$('.rv',g).forEach(function(el,i){el.style.setProperty('--i',i)})});
if(!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  $$('.rv').forEach(function(el){io.observe(el)});
}else{$$('.rv').forEach(function(el){el.classList.add('in')})}
/* подсветка за курсором */
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  $$('.step,.spot').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});
}
/* вау-момент: линия этапов заполняется при прокрутке */
var steps=$$('.steps')[0];
if(steps){
  var items=$$('.step',steps),fill=$$('.fill',steps)[0];
  function upd(){var r=steps.getBoundingClientRect(),vh=innerHeight,
      p=Math.max(0,Math.min(1,(vh*.62-r.top)/r.height));
    steps.style.setProperty('--p',reduce?1:p.toFixed(3));
    items.forEach(function(s){var b=s.getBoundingClientRect();s.classList.toggle('on',reduce||b.top<vh*.62)})}
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
}
})();

/* ====== Цена: вкладки и набор ====== */
(function(){
var el=document.getElementById('pricedata');if(!el)return;
var D=JSON.parse(el.textContent),sel={},cur=0;
var isM=function(){return matchMedia('(max-width:820px)').matches},open=isM()?-1:0;
var tabs=document.querySelector('.pr-tabs'),panel=document.querySelector('.pr-panel');
var fm=function(x){return (Math.round(x*10)/10).toString().replace('.',',')};
function key(d,g,i){return d+'|'+g+'|'+i}
function drawTabs(){tabs.innerHTML=D.map(function(d,i){return '<button type="button" role="tab" id="tab'+i+'" aria-selected="'+(i===cur)+'" aria-controls="prpanel" data-i="'+i+'" aria-expanded="'+(isM()?i===open:i===cur)+'" style="order:'+(2*i)+'">'+d.n+'<span>'+(function(n){var a=n%10,b=n%100;return n+(b>10&&b<15?' услуг':a==1?' услуга':a>1&&a<5?' услуги':' услуг')})(d.g.reduce(function(n,g){return n+g.i.length},0))+'</span></button>'}).join('')}
function drawPanel(){var d=D[cur];if(isM()){panel.hidden=open<0;panel.style.order=2*Math.max(open,0)+1}else{panel.hidden=false;panel.style.order=''}panel.id='prpanel';panel.setAttribute('aria-labelledby','tab'+cur);
  panel.innerHTML='<h3>'+d.n+'</h3><div class="pr-cols">'+d.g.map(function(g,gi){return '<div class="pr-grp"><div class="pr-gt">'+g.t+'</div>'+g.i.map(function(it,ii){var k=key(cur,gi,ii);
    return '<label class="pr-row"><input type="checkbox" data-k="'+k+'"'+(sel[k]?' checked':'')+'><span class="pr-n">'+it.n+(it.m?'<small>Мастер: '+it.m+'</small>':'')+'</span><span class="pr-p">'+fm(it.p)+' BYN</span></label>'}).join('')+'</div>'}).join('')+'</div>'}
function items(){var out=[];Object.keys(sel).forEach(function(k){var a=k.split('|'),it=D[a[0]].g[a[1]].i[a[2]];out.push(it)});return out}
function sum(){var it=items(),t=it.reduce(function(s,x){return s+x.p},0);
  var sl=document.getElementById('sumList');if(it.length){sl.innerHTML=Object.keys(sel).map(function(k){var a=k.split('|'),x=D[a[0]].g[a[1]].i[a[2]];return '<span class="sl-chip"><span>'+x.n+'</span><button type="button" data-rm="'+k+'" aria-label="Убрать из выбора: '+x.n.replace(/"/g,'')+'">×</button></span>'}).join('')}else sl.textContent='Пока ничего не выбрано';var rb=document.getElementById('sumReset');if(rb)rb.hidden=!it.length;
  document.getElementById('sumTotal').textContent=fm(t)+' BYN';
  document.getElementById('sumDisc').textContent=it.length?'С первым визитом −10%: '+fm(t*.9)+' BYN':'С первым визитом −10% будет ниже';
  window.__calc=it.map(function(x){return {name:x.n,from:x.p}});window.__calcTotal=t;
  var fc=document.getElementById('fCalc');var M=window.__master;
  if(M){var mt=M.items.reduce(function(s,x){return s+x.p},0);window.__calc=M.items.map(function(x){return {name:x.n,from:x.p}});window.__calcTotal=mt;
    if(fc){fc.hidden=false;fc.textContent='Мастер: '+M.name+' ('+M.role+'). '+(M.items.length?'Услуги: '+M.items.map(function(x){return x.n+' — '+fm(x.p)+' BYN'}).join('; ')+'. Итого '+fm(mt)+' BYN, с первым визитом −10%: '+fm(mt*.9)+' BYN.':'Процедуру уточним при звонке.')}}
  else if(window.__looks){var L=window.__looks,lt=L.items.reduce(function(s,x){return s+x.p},0);window.__calc=L.items.map(function(x){return {name:x.n,from:x.p}});window.__calcTotal=lt;
    if(fc){fc.hidden=false;fc.textContent=L.title+': '+L.items.map(function(x){return x.n+' — '+fm(x.p)+' BYN'}).join('; ')+'. Итого '+fm(lt)+' BYN, с первым визитом −10%: '+fm(lt*.9)+' BYN.'}}
  else if(fc){fc.hidden=!it.length;fc.textContent=it.length?'Ваш набор: '+it.map(function(x){return x.n}).join(', ')+'. Итого '+fm(t)+' BYN (−10% на первый визит: '+fm(t*.9)+' BYN).':''}
  var fx=document.getElementById('fCalcX');if(fx&&fc)fx.hidden=fc.hidden}
tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var i=+b.dataset.i;if(isM())open=(open===i)?-1:i;cur=i;drawTabs();drawPanel()});
matchMedia('(max-width:820px)').addEventListener('change',function(){open=isM()?-1:cur;drawTabs();drawPanel()});
(function(){var sl=document.getElementById('sumList'),t=document.querySelector('.pr-sum-t');if(!sl||!t)return;
var rb=document.createElement('button');rb.type='button';rb.id='sumReset';rb.className='sl-reset';rb.textContent='Сбросить всё';rb.hidden=true;t.appendChild(rb);
rb.addEventListener('click',function(){document.dispatchEvent(new CustomEvent('reset-calc'))});
sl.addEventListener('click',function(e){var b=e.target.closest('[data-rm]');if(!b)return;delete sel[b.dataset.rm];drawPanel();sum()})})();
tabs.addEventListener('keydown',function(e){if(e.key!=='ArrowDown'&&e.key!=='ArrowUp'&&e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();cur=(cur+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:D.length-1))%D.length;drawTabs();drawPanel();document.getElementById('tab'+cur).focus()});
panel.addEventListener('change',function(e){var k=e.target.dataset.k;if(!k)return;window.__master=null;window.__looks=null;if(e.target.checked)sel[k]=1;else delete sel[k];sum()});
document.addEventListener('pick-master',function(e){sel={};window.__looks=null;window.__master=e.detail;drawPanel();sum()});
document.addEventListener('pick-looks',function(e){sel={};window.__master=null;window.__looks=e.detail;drawPanel();sum()});
(function(){var fc=document.getElementById('fCalc');if(!fc||document.getElementById('fCalcX'))return;var x=document.createElement('button');x.type='button';x.id='fCalcX';x.className='f-calc-x';x.textContent='Сбросить выбор';x.hidden=true;x.addEventListener('click',function(){document.dispatchEvent(new CustomEvent('reset-calc'))});fc.parentNode.insertBefore(x,fc.nextSibling)})();
document.addEventListener('reset-calc',function(){sel={};window.__master=null;window.__looks=null;window.__calc=[];window.__calcTotal=0;drawPanel();sum()});
drawTabs();drawPanel();sum();
})();

/* ====== Отзывы: стрелки ====== */
(function(){var row=document.querySelector('.rev-row');if(!row)return;
document.querySelectorAll('.rev-nav .arr').forEach(function(b){b.addEventListener('click',function(){var w=row.firstElementChild.getBoundingClientRect().width+20;row.scrollBy({left:w*(+b.dataset.dir),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})})})})();

/* ====== Частые вопросы: плавное раскрытие ====== */
document.querySelectorAll('.fq-b').forEach(function(b){b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')!=='true';document.querySelectorAll('.fq-b').forEach(function(x){x.setAttribute('aria-expanded','false')});b.setAttribute('aria-expanded',o)})});

/* ====== Форма ====== */
(function(){
var LEAD_URL='';   /* сюда адрес приёма заявок (Telegram-бот, CRM, Google Форма) */
var YM_ID='';      /* сюда номер счётчика Яндекс Метрики */
var f=document.getElementById('leadForm');if(!f)return;
var name=document.getElementById('f-name'),phone=document.getElementById('f-phone'),cons=document.getElementById('f-consent'),btn=document.getElementById('fBtn'),err=document.getElementById('fErr'),ok=document.getElementById('fOk');
function mask(){if(/^\s*\+/.test(phone.value)&&!/^\s*\+\s*3?7?5?\s*\(?\s*$/.test(phone.value)&&!/^\s*\+\s*375/.test(phone.value)&&!/^\s*\+\s*3(7(5)?)?$/.test(phone.value)){phone.value='';err.textContent='Принимаем номера Беларуси: +375 (XX) XXX-XX-XX.';err.hidden=false;return}err.hidden=true;var pm=phone.value.match(/^\s*\+(\d{1,3})\s*$/);if(pm&&'375'.indexOf(pm[1])===0){phone.value='+375 (';return}var d=phone.value.replace(/\D/g,'');for(var k=0;k<3;k++){if(d.indexOf('375')===0)d=d.slice(3);else if(d.indexOf('80')===0)d=d.slice(2);else if(d.charAt(0)==='8'&&d.length>9)d=d.slice(1)}d=d.slice(0,9);var s='';if(d){s='+375 ('+d.slice(0,2);if(d.length>=2)s+=')';if(d.length>2)s+=' '+d.slice(2,5);if(d.length>5)s+='-'+d.slice(5,7);if(d.length>7)s+='-'+d.slice(7,9)}phone.value=s}
phone.addEventListener('input',mask);
phone.addEventListener('focus',function(){if(!phone.value)phone.value='+375 ('});
var hint=document.getElementById('fHint');cons.addEventListener('change',function(){btn.disabled=!cons.checked;if(hint)hint.hidden=cons.checked});
f.addEventListener('submit',function(e){e.preventDefault();err.hidden=true;
  if(!cons.checked){return}
  var n=name.value.trim(),d=phone.value.replace(/\D/g,'');
  if(n.length<2){err.textContent='Введите имя.';err.hidden=false;name.focus();return}
  if(d.length<12){err.textContent='Введите телефон полностью: +375 (XX) XXX-XX-XX.';err.hidden=false;phone.focus();return}
  if(f.website.value){f.hidden=true;ok.hidden=false;return}   /* скрытое поле для ботов */
  var data={name:n,phone:phone.value,ads:document.getElementById('f-ads').checked,consent:true,calc:window.__calc||[],master:window.__master||null,calcTotalFrom:window.__calcTotal||0,page:location.href,time:new Date().toISOString()};
  console.log('Заявка',data);
  if(LEAD_URL){try{fetch(LEAD_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).catch(function(){})}catch(x){}}
  if(YM_ID&&window.ym){try{window.ym(YM_ID,'reachGoal','lead')}catch(x){}}
  var bs=btn.querySelector('span'),bt=bs?bs.textContent:'';if(bs)bs.textContent='Отправляем…';btn.disabled=true;
  setTimeout(function(){if(bs)bs.textContent=bt;
  btn.hidden=true;ok.hidden=false;f.querySelectorAll('input').forEach(function(i){i.disabled=true});
  document.dispatchEvent(new CustomEvent('reset-calc'));
  setTimeout(function(){name.value='';phone.value='';cons.checked=false;document.getElementById('f-ads').checked=false;f.querySelectorAll('input').forEach(function(i){i.disabled=false});btn.disabled=true;btn.hidden=false;ok.hidden=true;if(hint)hint.hidden=false},9000);
  },900);
});
})();

/* ====== Фишки: прогресс, параллакс, счётчики, пауза фона ====== */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var sp=document.createElement('div');sp.className='sp';sp.setAttribute('aria-hidden','true');document.body.appendChild(sp);
function prog(){var h=document.documentElement.scrollHeight-innerHeight;sp.style.setProperty('--sp',h>0?(scrollY/h).toFixed(4):0)}
addEventListener('scroll',prog,{passive:true});prog();
var hero=document.querySelector('.h5');
if(hero&&'IntersectionObserver' in window){new IntersectionObserver(function(e){hero.classList.toggle('paused',!e[0].isIntersecting)}).observe(hero)}
document.addEventListener('visibilitychange',function(){if(hero)hero.classList.toggle('paused',document.hidden)});
/* параллакс слоёв за курсором */
if(hero&&!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  var layers=Array.prototype.slice.call(hero.querySelectorAll('.l')),tx=0,ty=0,cx=0,cy=0,run=false;
  layers.forEach(function(l){l.style.setProperty('--dx',l.dataset.d||0)});
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*2-1;ty=(e.clientY-r.top)/r.height*2-1;if(!run){run=true;requestAnimationFrame(loop)}});
  hero.addEventListener('pointerleave',function(){tx=0;ty=0;if(!run){run=true;requestAnimationFrame(loop)}});
  function loop(){cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;hero.style.setProperty('--px',cx.toFixed(3));hero.style.setProperty('--py',cy.toFixed(3));
    if(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)requestAnimationFrame(loop);else run=false}
}
/* счётчики */
var cs=Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
function count(el){var to=+el.dataset.count,t0=performance.now(),d=1300;(function f(n){var k=Math.min(1,(n-t0)/d),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(f)})(t0)}
if(!reduce&&'IntersectionObserver' in window){
  cs.forEach(function(el){el.textContent='0'});
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;io2.unobserve(el);setTimeout(function(){count(el)},el.closest('.h5')?1500:0)}})},{threshold:.6});
  cs.forEach(function(el){io2.observe(el)});
}
})();


/* ====== Страховка: блок всегда целиком на экране (рабочий стол) ====== */
(function(){
var secs=Array.prototype.slice.call(document.querySelectorAll('.sec'));
function fit(){
  var vh=innerHeight,desk=innerWidth>820;
  secs.forEach(function(s){var w=s.querySelector(':scope > .wrap-s');if(!w)return;
    w.style.zoom='';w.style.width='';w.style.maxWidth='';if(!desk)return;
    var cs=getComputedStyle(s),pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),h=w.offsetHeight;
    if(h+pad>vh){var z=Math.max(.6,(vh-pad)/h);
      if(s.classList.contains('price')&&/\bt[12]\b/.test(document.documentElement.className)){
        for(var k=0;k<4;k++){w.style.zoom=z.toFixed(3);w.style.maxWidth='none';w.style.width=(.94*innerWidth/z)+'px';h=w.offsetHeight;z=Math.min(1,Math.max(.6,(vh-pad)/h))}
        w.style.zoom=z.toFixed(3);w.style.width=(.94*innerWidth/z)+'px'}
      else w.style.zoom=z.toFixed(3)}});
}
var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fit,150)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
addEventListener('load',fit);setTimeout(fit,400);
})();

/* Работы: бегущая лента с изгибом */
(function(){
  var rail=document.querySelector('.wk-rail'),tr=rail&&rail.querySelector('.wk-track');if(!tr)return;
  var orig=[].slice.call(tr.children);
  orig.forEach(function(c){var k=c.cloneNode(true);k.setAttribute('aria-hidden','true');tr.appendChild(k)});
  var cards=[].slice.call(tr.children),off=0,vis=true,half=0,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function measure(){half=tr.scrollWidth/2+parseFloat(getComputedStyle(tr).columnGap||0)/2}
  function draw(){
    var w=rail.clientWidth,c=w/2;
    for(var i=0;i<cards.length;i++){
      var e=cards[i],x=e.offsetLeft-off+e.offsetWidth/2,t=Math.max(-1.4,Math.min(1.4,(x-c)/c));
      e.style.transform='translateY('+(t*t*46).toFixed(1)+'px) rotateY('+(-t*46).toFixed(1)+'deg) rotateZ('+(t*5).toFixed(2)+'deg) scale('+(1-.07*t*t).toFixed(3)+')';
    }
    tr.style.transform='translateX('+(-off).toFixed(1)+'px)';
  }
  function tick(){if(vis&&!reduce){off+=.45;if(off>=half)off-=half}draw();requestAnimationFrame(tick)}
  new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:0}).observe(rail);
  rail.addEventListener('pointerenter',function(){reduce=true});
  rail.addEventListener('pointerleave',function(){reduce=matchMedia('(prefers-reduced-motion:reduce)').matches});
  addEventListener('load',measure);measure();off=half*0+ (cards[0]?0:0);requestAnimationFrame(tick);
  addEventListener('resize',measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
})();

/* Мастера: выбор */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.mx-t')),pans=[].slice.call(document.querySelectorAll('.mx-p'));if(!tabs.length)return;
  var cur=0,hold=false,vis=false,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function go(i){cur=i;tabs.forEach(function(t,k){var o=k===i;t.classList.toggle('on',o);t.setAttribute('aria-selected',o)});pans.forEach(function(p,k){var o=k===i;p.classList.toggle('on',o);p.hidden=!o})}
  tabs.forEach(function(t,i){t.addEventListener('click',function(){go(i);hold=true});t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=(cur+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;go(n);tabs[n].focus();hold=true}})});
  var st=document.querySelector('.masters');
  new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.4}).observe(st);
  st.addEventListener('pointerenter',function(){hold=true});
  if(!reduce)setInterval(function(){if(vis&&!hold)go((cur+1)%tabs.length)},5000);
})();

/* Мастер → выбор процедур → заявка */
(function(){
  var raw=document.getElementById('pricedata');if(!raw)return;
  var D=JSON.parse(raw.textContent),by={};
  D.forEach(function(d){d.g.forEach(function(g){g.i.forEach(function(it){if(it.m)(by[it.m]=by[it.m]||[]).push({n:it.n,p:it.p})})})});
  var fm=function(x){return (Math.round(x*10)/10).toString().replace('.',',')};
  var box=document.createElement('div');box.className='mdl';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','mdlT');
  box.innerHTML='<div class="mdl-b"></div><div class="mdl-c"><button type="button" class="mdl-x" aria-label="Закрыть">×</button><div class="mdl-who"><img alt="" width="64" height="64"><div><h3 id="mdlT"></h3><span></span></div></div><p class="mdl-h">Выберите процедуры этого мастера</p><div class="mdl-l"></div><div class="mdl-f"><div class="mdl-s">Итого: <b>0 BYN</b></div><button type="button" class="btn mdl-go"><span>Продолжить к заявке</span></button></div></div>';
  document.body.appendChild(box);
  var cur=null,last=null,list=box.querySelector('.mdl-l'),tot=box.querySelector('.mdl-s b');
  function recalc(){var t=0;list.querySelectorAll('input:checked').forEach(function(i){t+=+i.dataset.p});tot.textContent=fm(t)+' BYN'}
  function close(){box.hidden=true;document.body.classList.remove('mdl-open');if(last)last.focus()}
  function open(p,btn){last=btn;var n=p.querySelector('h3').textContent,r=p.querySelector('.mx-r').textContent,items=by[n]||[];cur={name:n,role:r};
    box.querySelector('#mdlT').textContent=n;box.querySelector('.mdl-who span').textContent=r;
    var im=p.querySelector('.mx-fig img');box.querySelector('img').src=im.src;
    list.innerHTML=items.length?items.map(function(it,i){return '<label class="mdl-r"><input type="checkbox" data-i="'+i+'" data-p="'+it.p+'"><span>'+it.n+'</span><b>'+fm(it.p)+' BYN</b></label>'}).join(''):'<p class="mdl-e">Услуги этого мастера уточним при звонке.</p>';
    cur.items=items;recalc();box.hidden=false;document.body.classList.add('mdl-open');box.querySelector('.mdl-x').focus()}
  document.addEventListener('click',function(e){
    var b=e.target.closest('.mx-txt .btn');if(b){e.preventDefault();open(b.closest('.mx-p'),b);return}
    if(box.hidden)return;
    if(e.target.closest('.mdl-x')||e.target.classList.contains('mdl-b'))close();
    if(e.target.closest('.mdl-go')){var ch=[].slice.call(list.querySelectorAll('input:checked')).map(function(i){return cur.items[+i.dataset.i]});
      document.dispatchEvent(new CustomEvent('pick-master',{detail:{name:cur.name,role:cur.role,items:ch}}));close();
      var t=document.getElementById('book');if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
  });
  list.addEventListener('change',recalc);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!box.hidden)close()});
})();

/* ====== Колода работ ====== */
(function(){
  var st=document.querySelector('.dk-stack');if(!st)return;
  var data=JSON.parse(document.getElementById('workdata').textContent),cards=[].slice.call(st.querySelectorAll('.dk-c')),end=st.querySelector('.dk-end');
  var fm=function(x){return (Math.round(x*10)/10).toString().replace('.',',')};
  var cur=0,liked=[],list=document.querySelector('.dk-list'),empty=document.querySelector('.dk-empty'),tot=document.querySelector('.dk-t'),dis=document.querySelector('.dk-d'),go=document.querySelector('.dk-go'),cnt=document.querySelector('.dk-n');
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function pos(){cards.forEach(function(c,i){var p=i-cur;c.classList.remove('out-l','out-r','yes','no');c.style.transform='';c.dataset.pos=p<0?'gone':(p>3?3:p)});
    end.hidden=cur<cards.length;cnt.textContent=cur<cards.length?(cur+1)+' из '+cards.length:''}
  function render(){list.innerHTML=liked.map(function(i){return '<li><span class="dk-th"><img src="'+cards[i].querySelector('img').getAttribute('src')+'" alt=""></span><span class="dk-nm">'+data[i].t+'</span><b>'+fm(data[i].p)+' BYN</b><button type="button" data-r="'+i+'" aria-label="Убрать">×</button></li>'}).join('');
    var t=liked.reduce(function(s,i){return s+data[i].p},0);empty.hidden=liked.length>0;tot.textContent=fm(t)+' BYN';dis.textContent=liked.length?'С первым визитом −10%: '+fm(t*.9)+' BYN':'';
    go.setAttribute('aria-disabled',liked.length?'false':'true');go.classList.toggle('off',!liked.length)}
  function swipe(dir){if(cur>=cards.length)return;var c=cards[cur];if(dir>0&&liked.indexOf(cur)<0){liked.push(cur);render()}
    c.style.transform='';c.classList.add(dir>0?'out-r':'out-l');c.dataset.pos='gone';cur++;
    cards.forEach(function(x,i){if(i>=cur){x.dataset.pos=(i-cur)>3?3:(i-cur)}});end.hidden=cur<cards.length;cnt.textContent=cur<cards.length?(cur+1)+' из '+cards.length:''}
  document.querySelector('.dk-yes').addEventListener('click',function(){swipe(1)});
  document.querySelector('.dk-no').addEventListener('click',function(){swipe(-1)});
  document.querySelector('.dk-re').addEventListener('click',function(){cur=0;pos()});
  st.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();swipe(1)}if(e.key==='ArrowLeft'){e.preventDefault();swipe(-1)}});
  list.addEventListener('click',function(e){var b=e.target.closest('button[data-r]');if(!b)return;liked.splice(liked.indexOf(+b.dataset.r),1);render()});
  go.addEventListener('click',function(e){e.preventDefault();if(!liked.length)return;
    document.dispatchEvent(new CustomEvent('pick-looks',{detail:{title:'Ваш образ',items:liked.map(function(i){return {n:data[i].t,p:data[i].p}})}}));
    var t=document.getElementById('book');if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth'})});
  var sx=0,drag=null;
  st.addEventListener('pointerdown',function(e){var c=cards[cur];if(!c||e.target.closest('.dk-c')!==c)return;drag=c;sx=e.clientX;try{c.setPointerCapture(e.pointerId)}catch(x){}c.style.transition='none'});
  st.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-sx;drag.style.transform='translateX('+dx+'px) rotate('+(dx/18)+'deg)';drag.classList.toggle('yes',dx>40);drag.classList.toggle('no',dx<-40)});
  function up(e){if(!drag)return;var dx=e.clientX-sx,c=drag;drag=null;c.style.transition='';c.classList.remove('yes','no');if(Math.abs(dx)>90){swipe(dx>0?1:-1)}else{c.style.transform=''}}
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',function(){if(!drag)return;var c=drag;drag=null;c.style.transition='';c.classList.remove('yes','no');c.style.transform=''});
  pos();render();
})();

/* ====== Квиз: подбор услуги и мастера ====== */
(function(){
  var raw=document.getElementById('pricedata'),tz=document.getElementById('qzTeaser');if(!raw)return;
  var D=JSON.parse(raw.textContent),fm=function(x){return (Math.round(x*10)/10).toString().replace('.',',')};
  var DIR=['Волосы','Ногти','Брови и ресницы','Макияж и перманент','Кожа лица','Депиляция','Массаж и уход'];
  /* Что именно: подпись -> группы прайса */
  var KIND=[
    [{l:'Стрижка',g:['Стрижки']},{l:'Укладка или причёска',g:['Укладки']},{l:'Окрашивание',g:['Окрашивание']},{l:'Уход за волосами',g:['Уход и текстура']}],
    [{l:'Маникюр',g:['Маникюр']},{l:'Педикюр',g:['Педикюр']},{l:'Наращивание ногтей',g:['Наращивание']}],
    [{l:'Брови',g:['Брови']},{l:'Ресницы',g:['Ресницы']}],
    [{l:'Макияж',g:['Макияж']},{l:'Перманентный макияж',g:['Перманентный макияж']}],
    [{l:'Чистка лица',g:['Чистка лица']},{l:'Уход и пилинг',g:['Уход','Пилинги']},{l:'Массаж лица',g:['Массаж лица']},{l:'Не знаю — нужна консультация',g:['Консультации']}],
    [{l:'Воск',g:['Воск']},{l:'Шугаринг',g:['Шугаринг']},{l:'Лазерная эпиляция',g:['Лазер']}],
    [{l:'Массаж тела',g:['Массаж тела']},{l:'Обертывание',g:['Уход за телом']}]
  ];
  /* Что часто берут вместе (одна дополнительная услуга) */
  var PAIR={'Женская стрижка — короткие':'Укладка феном — средние волосы','Женская стрижка — длинные':'Укладка феном — средние волосы','Мужская модельная стрижка':null,
    'Локоны / укладка плойкой':null,'Свадебная причёска':'Свадебный макияж','Окрашивание в один тон — средние волосы':'Ботокс волос — средние','Окрашивание корней':'Укладка феном — средние волосы','Тонирование — средние волосы':'Ботокс волос — средние','Балаяж — средние волосы':'Ботокс волос — средние',
    'Маникюр без покрытия':'Педикюр без покрытия','Маникюр с гель-лаком':'Педикюр с гель-лаком','Маникюр с гель-лаком и укреплением':'Педикюр с гель-лаком',
    'Педикюр без покрытия':'Маникюр без покрытия','Педикюр с гель-лаком':'Маникюр с гель-лаком','SMART-педикюр с гель-лаком':'Маникюр с гель-лаком',
    'Коррекция бровей':'Окрашивание ресниц','Окрашивание бровей краской':'Окрашивание ресниц','Коррекция + окрашивание':'Окрашивание ресниц','Долговременная укладка бровей':'Окрашивание ресниц',
    'Окрашивание ресниц':'Коррекция бровей','Ламинирование ресниц':'Коррекция + окрашивание','Наращивание ресниц — классика':'Коррекция бровей','Наращивание ресниц — 2D':'Коррекция бровей',
    'Дневной макияж':'Укладка феном — средние волосы','Вечерний макияж':'Локоны / укладка плойкой','Свадебный макияж':'Свадебная причёска',
    'Комбинированная чистка':'Увлажняющий уход для лица','Ультразвуковая чистка':'Увлажняющий уход для лица','Атравматичная чистка':'Увлажняющий уход для лица',
    'Миндальный пилинг':'Косметический массаж лица','Увлажняющий уход для лица':'Косметический массаж лица',
    'Восковая депиляция подмышек':'Шугаринг глубокого бикини','Восковая депиляция ног полностью':'Шугаринг глубокого бикини','Шугаринг глубокого бикини':'Восковая депиляция подмышек',
    'Антицеллюлитный массаж':'Обертывание тела','Обертывание тела':'Антицеллюлитный массаж'};
  if(document.documentElement.classList.contains('t1')){DIR=['Волосы','Ногти','Брови и ресницы','Макияж'];KIND=[KIND[0],KIND[1],KIND[2],[KIND[3][0]]]}
  var ALL={};D.forEach(function(d){d.g.forEach(function(g){g.i.forEach(function(it){ALL[it.n]=it})})});
  var ans=[],cand=[],opts3=[],step=0,last=null,main=null,addon=null,addOn=true;
  if(tz)tz.innerHTML=DIR.map(function(d,i){return '<button type="button" data-qz="'+i+'">'+d+'</button>'}).join('');
  var box=document.createElement('div');box.className='mdl qzm';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','qzT');
  box.innerHTML='<div class="mdl-b"></div><div class="mdl-c"><button type="button" class="mdl-x" aria-label="Закрыть">×</button><div class="qzm-in"></div></div>';
  document.body.appendChild(box);var inn=box.querySelector('.qzm-in');
  function close(){box.hidden=true;document.body.classList.remove('mdl-open');if(last)last.focus()}
  function dots(n,s){var h='';for(var i=0;i<n;i++)h+='<i class="'+(i<=s?'on':'')+'"></i>';return '<div class="qzm-p">'+h+'</div>'}
  function candidates(){var k=KIND[ans[0]][ans[1]],out=[];D[ans[0]].g.forEach(function(g){if(k.g.indexOf(g.t)>=0)g.i.forEach(function(it){out.push(it)})});out.sort(function(a,b){return a.p-b.p});return out}
  function ask1(){inn.innerHTML=dots(2,0)+'<span class="qzm-s">Вопрос 1 из 2</span><h3 id="qzT">Что хотите обновить?</h3><div class="qzm-o">'+DIR.map(function(o,i){return '<button type="button" data-a="'+i+'">'+o+'</button>'}).join('')+'</div>'}
  function ask2(){inn.innerHTML=dots(2,1)+'<span class="qzm-s">Вопрос 2 из 2 · '+DIR[ans[0]]+'</span><h3 id="qzT">Что именно вас интересует?</h3><div class="qzm-o">'+KIND[ans[0]].map(function(o,i){return '<button type="button" data-a="'+i+'">'+o.l+'</button>'}).join('')+'</div><button type="button" class="qzm-b" data-back="1">← Назад</button>'}
  function ask3(){cand=candidates();opts3=cand.map(function(it){return {t:'',it:it,on:false}});result()}
  function result(){
    var first=opts3[0].it;addon=null;
    var rows=opts3.map(function(o,i){return '<label class="mdl-r qzm-add"><input type="checkbox" data-i="'+i+'"><span>'+o.it.n+'</span><b>'+fm(o.it.p)+' BYN</b></label>'}).join('');
    var role='',src='';
    [].slice.call(document.querySelectorAll('.mx-p')).forEach(function(p){if(p.querySelector('h3').textContent===first.m){role=p.querySelector('.mx-r').textContent;src=p.querySelector('.mx-fig img').getAttribute('src')}});
    inn.innerHTML='<span class="qzm-s">Ваша подборка</span><h3 id="qzT">'+KIND[ans[0]][ans[1]].l+': отметьте нужное</h3>'+
      (first.m?'<div class="mdl-who"><img src="'+src+'" alt="" width="52" height="52"><div><b class="qzm-mn">'+first.m+'</b><span>'+role+'</span></div></div>':'')+
      '<div class="mdl-l qzm-list">'+rows+'</div>'+
      '<div class="mdl-f"><div class="mdl-s">Итого: <b class="qzm-t"></b><br><small class="qzm-d"></small></div><button type="button" class="btn qzm-go"><span>Записаться</span></button></div><button type="button" class="qzm-b" data-back="2">← Назад</button> <button type="button" class="qzm-b qzm-re">Пройти заново</button>';
    function sel(){var it=[];[].slice.call(inn.querySelectorAll('input[data-i]')).forEach(function(c){if(c.checked)it.push(opts3[+c.dataset.i].it)});return it}
    function tot(){var s=sel(),t=s.reduce(function(a,x){return a+x.p},0),go=inn.querySelector('.qzm-go');
      inn.querySelector('.qzm-t').textContent=fm(t)+' BYN';inn.querySelector('.qzm-d').textContent=s.length?'с первым визитом −10%: '+fm(t*.9)+' BYN':'Отметьте одну или несколько процедур';go.disabled=!s.length;go.style.opacity=s.length?1:.45}
    tot();[].slice.call(inn.querySelectorAll('input')).forEach(function(c){c.addEventListener('change',tot)});
    inn.querySelector('.qzm-go').onclick=function(){var s=sel();if(!s.length)return;var m=first.m;
      document.dispatchEvent(new CustomEvent('pick-master',{detail:{name:m||'подберём при записи',role:role||'мастер',items:s.map(function(x){return {n:x.n+(x.m&&x.m!==m?' (мастер '+x.m+')':''),p:x.p}})}}));close();var bk=document.getElementById('book');if(bk)bk.scrollIntoView({behavior:'smooth'})};
    inn.querySelector('.qzm-re').onclick=function(){ans=[];step=0;ask1()}}
  function open(from,first){last=from;ans=[];step=0;box.hidden=false;document.body.classList.add('mdl-open');if(first!=null){ans[0]=first;step=1;ask2()}else ask1()}
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-qz]');if(t){e.preventDefault();open(t,t.dataset.qz===''?null:+t.dataset.qz);return}
    if(box.hidden)return;
    if(e.target.closest('.mdl-x')||e.target.classList.contains('mdl-b')){close();return}
    var bk=e.target.closest('[data-back]');if(bk){if(bk.dataset.back==='1')ask1();else ask2();return}
    var a=e.target.closest('.qzm-o button');if(!a)return;var v=+a.dataset.a;
    if(step===0){ans[0]=v;step=1;ask2()}
    else if(step===1){ans[1]=v;step=2;ask3()}
    
    if(step===2&&!a.closest('.qzm-o').querySelector('small')){}
  });
  /* шаги: определяем по заголовку при возврате */
  document.addEventListener('click',function(e){var bk=e.target.closest('[data-back]');if(!bk)return;step=bk.dataset.back==='1'?0:1});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!box.hidden)close()});
})();
(function(){var a=document.querySelector('.mx-acc');if(!a)return;
  var it=[].slice.call(a.children),info=[].slice.call(document.querySelectorAll('.mi')),leg=[].slice.call(document.querySelectorAll('.mx-legacy .mx-t'));
  it.forEach(function(c,i){c.style.setProperty('--i',i)});
  function go(i){it.forEach(function(c,k){c.classList.toggle('on',k===i);c.setAttribute('aria-pressed',k===i)});info.forEach(function(m,k){m.classList.toggle('on',k===i)});if(leg[i])leg[i].click()}
  var lastSc=0,pin=false,ut=0,hi=0;function unpin(){pin=false;a.classList.remove('pinned')}function relSoon(){clearInterval(ut);var t0=Date.now(),cl=0;ut=setInterval(function(){if(document.body.classList.contains('mdl-open')){cl=0;return}cl=cl||Date.now();if(Date.now()-cl>2500){clearInterval(ut);unpin()}},500)}window.__mxRel=relSoon;addEventListener('scroll',function(){lastSc=Date.now()},{passive:true});it.forEach(function(c,i){c.addEventListener('mouseenter',function(){if(pin||!matchMedia('(hover:hover)').matches||c.classList.contains('on'))return;if(Date.now()-lastSc<350||document.body.classList.contains('mdl-open'))return;clearTimeout(hi);hi=setTimeout(function(){if(!pin&&c.matches(':hover'))go(i)},170)});c.addEventListener('mouseleave',function(){clearTimeout(hi)});c.addEventListener('click',function(){if(c.classList.contains('on')&&pin){pin=false;a.classList.remove('pinned')}else{pin=true;a.classList.add('pinned');go(i)}});c.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=(i+(e.key==='ArrowRight'?1:-1)+it.length)%it.length;pin=true;a.classList.add('pinned');go(n);it[n].focus()}})});
  document.addEventListener('click',function(e){var b=e.target.closest('.mi-go');if(!b)return;if(pin)setTimeout(relSoon,300);var p=document.querySelector('.mx-legacy #mxp'+b.dataset.i+' .mx-txt .btn');if(p)p.click()});
  if(!('IntersectionObserver' in window)){a.classList.add('shelf-in');return}
  var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){a.classList.add('shelf-in');o.disconnect()}},{threshold:.25});o.observe(a);
})();
(function(){var tr=document.getElementById('rvTrack');if(!tr)return;
  var st=tr.querySelector('.rv-sticky'),cards=[].slice.call(tr.querySelectorAll('.rvr')),n=cards.length,mq=matchMedia('(min-width:821px)'),tk=0;
  function cl(x,a,b){return Math.max(a,Math.min(b,x))}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function draw(){tk=0;if(!mq.matches)return;
    var r=tr.getBoundingClientRect(),H=innerHeight,W=st.clientWidth,p=cl(-r.top/Math.max(1,r.height-H),0,1);
    var cw=cl(W*.135,170,240),ry=H*.36,rx=Math.min(W*.37,ry*1.75);
    st.style.setProperty('--cw2',cw+'px');
    var cx=W/2,cy=H/2;
    cards.forEach(function(c,i){
      var q=ease(cl((p-.1-i*.022)/.62,0,1));            /* раскрытие каждой карточки со сдвигом, как лепестки */
      var ring=q<.34?q/.34*.4:q<.67?.4+(q-.34)/.33*.3:.7+(q-.67)/.33*.3;   /* малая, средняя, большая окружность */
      var th=(-90+i*360/n)*Math.PI/180+(1-q)*1.1;
      var x=Math.cos(th)*rx*ring,y=Math.sin(th)*ry*ring;
      var off=i-(n-1)/2,fan=1-cl(q*3,0,1);
      x+=off*7*fan;y+=Math.abs(off)*1.5*fan;
      var rot=off*3.2*fan+Math.sin(th)*(-3)*q;
      var sc=.52+.48*cl(ring*1.25,0,1);
      c.style.transform='translate('+(x-cw/2)+'px,'+(y)+'px) translateY(-50%) rotate('+rot+'deg) scale('+sc+')';
      c.style.zIndex=Math.round(10+(n-Math.abs(off))*(1-q)+q*2);
      c.style.opacity=.6+.4*cl(q*4+.4,0,1);
    });
    var f=ease(cl((p-.1)/.7,0,1));
    st.style.setProperty('--cw',(rx*2+cw*.9)+'px');st.style.setProperty('--ch',(ry*2+60)+'px');
    st.style.setProperty('--rs',.12+.88*f);st.style.setProperty('--ro',cl((p-.6)*3,0,1));
    st.style.setProperty('--mo',cl((p-.72)/.18,0,1));st.style.setProperty('--ho',p<.04?1:0);
  }
  function req(){if(!tk)tk=requestAnimationFrame(draw)}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);draw();
})();
(function(){var box=document.querySelector('.ab-facts');if(!box)return;
  var ns=[].slice.call(box.querySelectorAll('[data-num]'));if(!ns.length||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var tm=[],raf=[];ns.forEach(function(e){e.textContent='0'});
  function stop(){tm.forEach(clearTimeout);raf.forEach(cancelAnimationFrame);tm=[];raf=[]}
  function run(e,delay){var to=+e.dataset.num,d=2200;tm.push(setTimeout(function(){var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/d),v=1-Math.pow(1-k,3);e.textContent=Math.round(to*v);if(k<1)raf.push(requestAnimationFrame(f))})(t0)},delay))}
  var io=new IntersectionObserver(function(es){var v=es[0].isIntersecting;stop();if(v){ns.forEach(function(e,i){e.textContent='0';run(e,i*160)})}else ns.forEach(function(e){e.textContent='0'})},{threshold:.3});io.observe(box);
})();

/* ====== Лента работ (вариант 1) ====== */
(function(){
  var rail=document.querySelector('.lb-rail');if(!rail)return;
  var data=JSON.parse(document.getElementById('lbdata').textContent),cards=[].slice.call(rail.querySelectorAll('.lb-c'));
  var fm=function(x){return (Math.round(x*10)/10).toString().replace('.',',')},reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var sel=[],n=document.querySelector('.lb-n'),nm=document.querySelector('.lb-names'),t=document.querySelector('.lb-t'),d=document.querySelector('.lb-d'),go=document.querySelector('.lb-go');
  function render(){var s=sel.slice().sort(function(a,b){return a-b}),sum=s.reduce(function(a,i){return a+data[i].p},0);
    n.textContent='Выбрано: '+s.length;nm.textContent=s.length?s.map(function(i){return data[i].t}).join(' · '):'Пока ничего не выбрано';
    t.textContent=fm(sum)+' BYN';d.textContent=s.length?'С первым визитом −10%: '+fm(sum*.9)+' BYN':'';
    go.setAttribute('aria-disabled',s.length?'false':'true');go.classList.toggle('off',!s.length);
    cards.forEach(function(c,i){var on=sel.indexOf(i)>-1;c.classList.toggle('on',on);c.querySelector('.lb-add').setAttribute('aria-pressed',on);c.querySelector('.lb-add span').textContent=on?'Выбрано':'Хочу так'})}
  rail.addEventListener('click',function(e){var b=e.target.closest('.lb-add');if(!b||moved)return;var i=+b.parentNode.dataset.i,k=sel.indexOf(i);if(k<0)sel.push(i);else sel.splice(k,1);render()});
  function step(dir){var w=cards[0].getBoundingClientRect().width+14;rail.scrollBy({left:dir*w*2,behavior:reduce?'auto':'smooth'})}
  document.querySelector('.lb-prev').addEventListener('click',function(){step(-1)});
  document.querySelector('.lb-next').addEventListener('click',function(){step(1)});
  document.querySelectorAll('.lb-chips button').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('.lb-chips button').forEach(function(x){x.classList.toggle('on',x===b)});
    var c=b.dataset.c;cards.forEach(function(k){k.hidden=!!c&&k.dataset.cat!==c});rail.scrollTo({left:0})})});
  var down=false,sx=0,sl=0,moved=false;
  rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.target.closest('.lb-add'))return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;rail.classList.add('drag')}rail.scrollLeft=sl-dx});
  window.addEventListener('pointerup',function(){if(!down)return;down=false;rail.classList.remove('drag');setTimeout(function(){moved=false},0)});
  go.addEventListener('click',function(e){e.preventDefault();if(!sel.length)return;
    document.dispatchEvent(new CustomEvent('pick-looks',{detail:{title:'Ваш образ',items:sel.slice().sort(function(a,b){return a-b}).map(function(i){return {n:data[i].t,p:data[i].p}})}}));
    var b=document.getElementById('book');if(b)b.scrollIntoView({behavior:reduce?'auto':'smooth'})});
  document.addEventListener('reset-calc',function(){sel=[];render()});
  render();
})();

/* ====== Стена отзывов (вариант 1) ====== */
(function(){
  var board=document.querySelector('.wl-board');if(!board)return;
  var cards=[].slice.call(board.querySelectorAll('.wl-c')),z=10;
  var P=[[34,4,-3],[57,3,2],[80,5,-2],[3,46,2],[27,36,-3],[51,33,3],[75,36,-2],[3,72,-2],[27,67,3],[51,65,-3],[75,67,2]];
  cards.forEach(function(c,i){var p=P[i%P.length];c.style.setProperty('--x',p[0]+'%');c.style.setProperty('--y',p[1]+'%');c.style.setProperty('--r',p[2]+'deg')});
  var cur=null,sx=0,sy=0,ox=0,oy=0,moved=false;
  function bring(c){c.style.zIndex=++z}
  board.addEventListener('pointerdown',function(e){var c=e.target.closest('.wl-c');if(!c||e.pointerType!=='mouse'||innerWidth<821)return;cur=c;moved=false;sx=e.clientX;sy=e.clientY;ox=+c.dataset.dx||0;oy=+c.dataset.dy||0;bring(c)});
  window.addEventListener('pointermove',function(e){if(!cur)return;var dx=e.clientX-sx,dy=e.clientY-sy;if(!moved&&Math.abs(dx)+Math.abs(dy)<5)return;moved=true;cur.classList.add('drag');cur.dataset.dx=ox+dx;cur.dataset.dy=oy+dy;cur.style.translate=(ox+dx)+'px '+(oy+dy)+'px'});
  window.addEventListener('pointerup',function(){if(!cur)return;cur.classList.remove('drag');cur=null;setTimeout(function(){moved=false},0)});
  function toggle(c){var on=!c.classList.contains('open');cards.forEach(function(x){x.classList.remove('open');x.setAttribute('aria-expanded','false')});if(on){c.classList.add('open');c.setAttribute('aria-expanded','true');bring(c)}}
  board.addEventListener('click',function(e){var c=e.target.closest('.wl-c');if(c&&!moved)toggle(c)});
  board.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){var c=e.target.closest('.wl-c');if(c){e.preventDefault();toggle(c)}}});
})();

/* ====== Отзывы-чеки (вариант 1) ====== */
(function(){
  var sec=document.querySelector('.rc-s'),rail=document.querySelector('.rc-rail');if(!sec||!rail)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fm(x){return (Math.round(x*10)/10).toString().replace('.',',')}
  function count(){[].forEach.call(sec.querySelectorAll('.rc-tot b'),function(b){
    var to=parseFloat(b.getAttribute('data-to'))||0;if(reduce||!to)return;var t0=null;
    (function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/900);b.textContent=fm(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);else b.textContent=fm(to)})(performance.now());
  })}
  function show(){if(sec.classList.contains('in'))return;sec.classList.add('in');count()}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show();io.disconnect()}})},{threshold:.25});io.observe(sec)}else show();
  [].forEach.call(sec.querySelectorAll('.rc-b'),function(b){b.addEventListener('click',function(){
    var c=rail.querySelector('.rc-c');var w=c?c.getBoundingClientRect().width+24:300;rail.scrollBy({left:(+b.getAttribute('data-d'))*w*1.5,behavior:reduce?'auto':'smooth'})})});
  var down=false,sx=0,sl=0,moved=false;
  rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;rail.classList.add('drag')}rail.scrollLeft=sl-dx});
  window.addEventListener('pointerup',function(){down=false;rail.classList.remove('drag')});
  rail.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){rail.scrollBy({left:300,behavior:'smooth'})}if(e.key==='ArrowLeft'){rail.scrollBy({left:-300,behavior:'smooth'})}});
})();

/* ====== Отзывы-чат (вариант 1) ====== */
(function(){
  var sec=document.querySelector('.ch-s');if(!sec)return;
  var tabs=[].slice.call(sec.querySelectorAll('.ch-i')),pans=[].slice.call(sec.querySelectorAll('.ch-p')),cur=0,timer=null,user=false,seen=false;
  function sel(i,byUser){cur=i;tabs.forEach(function(t,k){var on=k===i;t.classList.toggle('on',on);t.setAttribute('aria-selected',on)});
    pans.forEach(function(p,k){var on=k===i;p.hidden=!on;p.classList.toggle('on',on);p.classList.remove('go');if(on){void p.offsetWidth;p.classList.add('go')}});
    if(byUser){user=true;clearTimeout(timer)}}
  function auto(){clearTimeout(timer);if(user)return;timer=setTimeout(function(){sel((cur+1)%tabs.length,false);auto()},9000)}
  tabs.forEach(function(t,k){t.addEventListener('click',function(){sel(k,true)})});
  sec.addEventListener('keydown',function(e){if(e.target.classList.contains('ch-i')&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();var n=(cur+(e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length;sel(n,true);tabs[n].focus()}});
  function start(){if(seen)return;seen=true;sel(0,false);auto()}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){start();io.disconnect()}})},{threshold:.3});io.observe(sec)}else start();
})();

/* ====== Вариант 1: плавный «проезд камеры» по меню и кнопка «назад» на телефоне ====== */
(function(){
  var root=document.documentElement;if(!root.classList.contains('t1'))return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,anim=0;
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function goTo(y,done){
    var from=window.pageYOffset,dist=y-from;if(!dist){done&&done();return}
    if(reduce){window.scrollTo(0,y);done&&done();return}
    var dur=Math.max(700,Math.min(1500,Math.abs(dist)*0.55)),t0=null,id=++anim;
    var prev=root.style.scrollSnapType;root.style.scrollSnapType='none';
    function stop(){anim++}
    window.addEventListener('wheel',stop,{once:true,passive:true});window.addEventListener('touchstart',stop,{once:true,passive:true});
    (function step(t){if(id!==anim){root.style.scrollSnapType=prev;return}
      if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur);window.scrollTo(0,from+dist*ease(k));
      if(k<1)requestAnimationFrame(step);else{root.style.scrollSnapType=prev;done&&done()}})(performance.now());
  }
  window.__goTo=goTo;
  function initTop(){var tt=document.querySelector('.totop');
    if(!tt)return;tt.hidden=false;
    var vis=function(){tt.classList.toggle('show',window.pageYOffset>window.innerHeight*.6)};
    window.addEventListener('scroll',vis,{passive:true});vis();
    tt.addEventListener('click',function(){goTo(0)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTop);else initTop();
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented)return;
    var h=a.getAttribute('href');if(h.length<2){if(h==='#'){return}return}
    var t=document.getElementById(h.slice(1));if(!t)return;
    e.preventDefault();goTo(Math.max(0,Math.round(t.getBoundingClientRect().top+window.pageYOffset)));
  });
  /* Кнопка «назад» на телефоне: из любого места сайта возвращает к началу, а не закрывает сайт */
  var mob=function(){return window.matchMedia&&matchMedia('(max-width:820px)').matches},pushed=false;
  function push(){try{history.pushState({ioTop:1},'');pushed=true}catch(e){}}
  window.addEventListener('scroll',function(){if(mob()&&!pushed&&window.pageYOffset>240)push()},{passive:true});
  window.addEventListener('popstate',function(){
    if(!pushed)return;pushed=false;
    if(window.pageYOffset>60)goTo(0);
  });
})();

/* ====== Отзывы-истории (вариант 1) ====== */
(function(){
  var sec=document.querySelector('.st-s');if(!sec)return;
  var cs=[].slice.call(sec.querySelectorAll('.st-c')),n=cs.length,cur=0,timer=null,paused=false,seen=false,user=false,DUR=8000;
  sec.querySelector('.st-track').style.setProperty('--dur',DUR+'ms');
  function layout(){cs.forEach(function(c,i){var d=((i-cur)%n+n)%n;if(d>n/2)d-=n;c.style.setProperty('--d',d);c.style.setProperty('--ad',Math.min(Math.abs(d),3));
    var on=d===0;c.classList.toggle('on',on);c.classList.toggle('hide',Math.abs(d)>2);c.setAttribute('aria-current',on?'true':'false');if(!on)c.classList.remove('run')})}
  function run(){var c=cs[cur];c.classList.remove('run');void c.offsetWidth;if(!paused)c.classList.add('run');clearTimeout(timer);if(!user&&!paused)timer=setTimeout(function(){go(cur+1>=n?0:cur+1,false)},DUR)}
  function go(i,byUser){if(byUser)user=true;cur=(i+n)%n;layout();run()}
  cs.forEach(function(c,i){c.addEventListener('click',function(){if(i!==cur)go(i,true)})});
  sec.querySelector('.st-p').addEventListener('click',function(){go(cur-1,true)});
  sec.querySelector('.st-n').addEventListener('click',function(){go(cur+1,true)});
  sec.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(cur+1,true)}if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1,true)}});
  var sx=null;sec.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')sx=e.clientX});
  sec.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1),true)});
  sec.querySelector('.st-stage').addEventListener('mouseenter',function(){paused=true;clearTimeout(timer);cs[cur].classList.remove('run');cs[cur].querySelector('.st-bar b').style.width='0'});
  sec.querySelector('.st-stage').addEventListener('mouseleave',function(){paused=false;cs[cur].querySelector('.st-bar b').style.width='';run()});
  layout();
  function start(){if(seen)return;seen=true;run()}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){start();io.disconnect()}})},{threshold:.3});io.observe(sec)}else start();
})();

/* ====== Отзывы: папки по сторонам, колода карточек в центре ====== */
(function(){
  var sec=document.querySelector('.gf-s');if(!sec)return;
  var tray=sec.querySelector('.gf-tray'),folders=[].slice.call(sec.querySelectorAll('.gf-folder')).sort(function(a,b){return a.dataset.i-b.dataset.i}),sets=[].slice.call(sec.querySelectorAll('.gf-set')),
      modal=sec.querySelector('.rf-modal'),cnt=sec.querySelector('.gf-cnt'),mid=sec.querySelector('.gf-mid'),open=-1,cur=[0,0,0,0],lastCard=null,sx=0,dragging=false,moved=false;
  document.body.appendChild(modal);
  function pathBack(w,h,r,th,tw,sl){return 'M'+r+','+th+' L'+(w-tw-sl)+','+th+' C'+(w-tw-sl*.45)+','+th+' '+(w-tw-sl*.55)+',0 '+(w-tw)+',0 L'+(w-r)+',0 Q'+w+',0 '+w+','+r+' L'+w+','+(h-r)+' Q'+w+','+h+' '+(w-r)+','+h+' L'+r+','+h+' Q0,'+h+' 0,'+(h-r)+' L0,'+(th+r)+' Q0,'+th+' '+r+','+th+' Z'}
  function pathFront(w,h,r,th,tw,sl){return 'M'+r+',0 L'+tw+',0 C'+(tw+sl*.45)+',0 '+(tw+sl*.55)+','+th+' '+(tw+sl)+','+th+' L'+(w-r)+','+th+' Q'+w+','+th+' '+w+','+(th+r)+' L'+w+','+(h-r)+' Q'+w+','+h+' '+(w-r)+','+h+' L'+r+','+h+' Q0,'+h+' 0,'+(h-r)+' L0,'+r+' Q0,0 '+r+',0 Z'}
  function shapes(){folders.forEach(function(f){
    [['.gf-back',pathBack,.12,.5],['.gf-front',pathFront,.14,.44]].forEach(function(o){
      var el=f.querySelector(o[0]),w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;
      var d=o[1](w,h,Math.min(22,w*.07),h*o[2],w*o[3],Math.min(50,w*.16));
      [].forEach.call(el.querySelectorAll('.gf-clip'),function(c){c.style.clipPath='path("'+d+'")'});
      var sv=el.querySelector('.gf-sv');if(!sv){sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('class','gf-sv');sv.setAttribute('aria-hidden','true');sv.appendChild(document.createElementNS('http://www.w3.org/2000/svg','path'));el.appendChild(sv)}
      sv.setAttribute('viewBox','0 0 '+w+' '+h);sv.firstChild.setAttribute('d',d)})})}
  function mobile(){return window.innerWidth<=740}
  function pad(n){return ('0'+n).slice(-2)}
  function layout(){var mob=mobile(),tr=tray.getBoundingClientRect(),TW=tr.width,TH=tr.height;
    sets.forEach(function(set,si){var cs=[].slice.call(set.children),n=cs.length,on=si===open,fr=folders[si].getBoundingClientRect();
      set.classList.toggle('is-open',on);
      var cw=cs[0]?cs[0].offsetWidth:260,fx=fr.left+fr.width/2-(tr.left+TW/2),fy=fr.top+fr.height/2-(tr.top+TH/2);
      cs.forEach(function(c,j){
        if(mob){c.style.transform='';c.style.opacity='';c.style.transitionDelay='';c.tabIndex=on?0:-1;return}
        var d=j-cur[si];while(d>n/2)d-=n;while(d<-n/2)d+=n;var a=Math.abs(d),tf,o;
        if(on&&a<=2){tf='translate3d('+(d*cw*.5)+'px,'+(a*6)+'px,0) rotate('+(d*3.5)+'deg) scale('+(1-a*.08)+')';o=1}
        else if(on){tf='translate3d('+(Math.sign(d)*cw*1.2)+'px,10px,0) scale(.8)';o=0}
        else{tf='translate3d('+fx+'px,'+fy+'px,0) scale(.3)';o=0}
        c.style.transform=tf;c.style.opacity=o;c.style.zIndex=on?(20-a):0;c.style.transitionDelay='0ms';c.style.pointerEvents=(on&&a<=2)?'auto':'none';c.tabIndex=(on&&a===0)?0:-1;c.classList.toggle('is-front',on&&a===0)})});
    mid.classList.toggle('empty',open<0);if(open>=0){var n0=sets[open].children.length;cnt.textContent=pad(cur[open]+1)+' / '+pad(n0)}
    folders.forEach(function(f,i){f.classList.toggle('is-open',i===open);f.setAttribute('aria-expanded',String(i===open))})}
  function step(k){if(open<0)return;var n=sets[open].children.length;cur[open]=(cur[open]+k+n)%n;layout()}
  folders.forEach(function(f,i){
    f.addEventListener('click',function(){open=(open===i)?-1:i;layout()});
    f.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;var r=f.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;f.style.setProperty('--ry',(nx*12)+'deg');f.style.setProperty('--rx',(-ny*9)+'deg')});
    f.addEventListener('pointerleave',function(){f.style.setProperty('--ry','0deg');f.style.setProperty('--rx','0deg')})});
  sec.querySelector('.gf-prev').onclick=function(){step(-1)};sec.querySelector('.gf-next').onclick=function(){step(1)};
  function openM(c){modal.querySelector('.rf-mav').src=c.dataset.av;modal.querySelector('.rf-mk').textContent=c.dataset.kind;
    modal.querySelector('.rf-mq').textContent=c.querySelector('.gf-q').textContent;modal.querySelector('.rf-mf').innerHTML=c.querySelector('.rf-full').innerHTML;
    modal.querySelector('.rf-mn').textContent=c.dataset.name+' · демонстрационный отзыв';
    modal.querySelector('.rf-msv').innerHTML='<b>'+c.dataset.svc+'</b><span>Мастер: '+c.dataset.master+'</span>';
    lastCard=c;modal.classList.add('open');modal.setAttribute('aria-hidden','false');modal.querySelector('.rf-x').focus()}
  function closeM(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');if(lastCard)lastCard.focus()}
  sets.forEach(function(set,si){[].forEach.call(set.children,function(c,j){c.addEventListener('click',function(){if(moved)return;if(mobile()||c.classList.contains('is-front'))openM(c);else{cur[si]=j;layout()}})})});
  tray.addEventListener('pointerdown',function(e){dragging=true;moved=false;sx=e.clientX});
  window.addEventListener('pointermove',function(e){if(!dragging||mobile())return;var d=e.clientX-sx;if(Math.abs(d)>60){moved=true;dragging=false;step(d<0?1:-1);setTimeout(function(){moved=false},120)}});
  window.addEventListener('pointerup',function(){dragging=false});
  modal.querySelector('.rf-x').onclick=closeM;modal.addEventListener('click',function(e){if(e.target===modal)closeM()});
  sec.addEventListener('keydown',function(e){if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(modal.classList.contains('open'))closeM();else if(open>-1){open=-1;layout()}}});
  window.addEventListener('resize',function(){shapes();layout()});
  shapes();layout();
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){sec.classList.add('in');shapes();layout();io.disconnect()}})},{threshold:.25});io.observe(sec)}else sec.classList.add('in');
  setTimeout(function(){shapes();layout()},400);
})();

/* ====== Фото салона: карусель ====== */
(function(){
  var box=document.querySelector('.ab-slider');if(!box)return;
  var sl=[].slice.call(box.querySelectorAll('.ab-slide')),dots=[].slice.call(box.querySelectorAll('.ab-dot')),cnt=box.querySelector('.ab-count'),n=sl.length,i=0,hover=false,timer=null,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function show(k){i=(k+n)%n;sl.forEach(function(s,j){s.classList.toggle('on',j===i);s.setAttribute('aria-hidden',j===i?'false':'true')});dots.forEach(function(d,j){d.classList.toggle('on',j===i)});cnt.textContent=(i+1)+' / '+n;var nx=sl[(i+1)%n].querySelector('img');if(nx&&nx.loading==='lazy')nx.loading='eager'}
  function play(){clearInterval(timer);if(reduce)return;timer=setInterval(function(){if(!hover)show(i+1)},5200)}
  box.querySelector('.ab-prev').addEventListener('click',function(){show(i-1);play()});
  box.querySelector('.ab-next').addEventListener('click',function(){show(i+1);play()});
  dots.forEach(function(d){d.addEventListener('click',function(){show(+d.dataset.i);play()})});
  box.addEventListener('mouseenter',function(){hover=true});box.addEventListener('mouseleave',function(){hover=false});
  box.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(i+1);play()}if(e.key==='ArrowLeft'){show(i-1);play()}});
  var sx=null;box.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  box.addEventListener('touchend',function(e){if(sx===null)return;var d=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(d)>40){show(i+(d<0?1:-1));play()}},{passive:true});
  /* перелистывание мышью: потянуть влево или вправо */
  var track=box.querySelector('.ab-track'),pd=false,px=0,pm=false;
  [].forEach.call(box.querySelectorAll('img'),function(im){im.draggable=false});
  box.addEventListener('pointerdown',function(e){if(e.pointerType==='touch'||e.button!==0||e.target.closest('.ab-arr,.ab-dot'))return;pd=true;pm=false;px=e.clientX});
  window.addEventListener('pointermove',function(e){if(!pd)return;var d=e.clientX-px;if(Math.abs(d)>4&&!pm){pm=true;box.classList.add('drag');track.style.transition='none'}if(pm)track.style.transform='translateX('+(d*.35)+'px)'});
  window.addEventListener('pointerup',function(e){if(!pd)return;pd=false;box.classList.remove('drag');var d=e.clientX-px;track.style.transition='';track.style.transform='';if(pm&&Math.abs(d)>50){show(i+(d<0?1:-1));play()}box._dr=pm;pm=false;setTimeout(function(){box._dr=false},0)});
  box.addEventListener('click',function(e){if(box._dr||e.target.closest('.ab-arr,.ab-dot'))return;show(i+1);play()});
  window.addEventListener('pointercancel',function(){if(!pd)return;pd=false;pm=false;box.classList.remove('drag');track.style.transition='';track.style.transform=''});
  box.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>20){e.preventDefault();var now=Date.now();if(now-(box._w||0)>500){box._w=now;show(i+(e.deltaX>0?1:-1));play()}}},{passive:false});
  show(0);
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)play();else clearInterval(timer)})},{threshold:.3}).observe(box)}else play();
})();

/* ====== Пометка «демо-версия» ====== */
(function(){function init(){var f=document.querySelector('.demo-flag');if(!f)return;var b=f.querySelector('.demo-b'),p=f.querySelector('.demo-p');
  b.addEventListener('click',function(){var o=p.hidden;p.hidden=!o;b.setAttribute('aria-expanded',String(o))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!p.hidden){p.hidden=true;b.setAttribute('aria-expanded','false')}});
  document.addEventListener('click',function(e){if(!p.hidden&&!f.contains(e.target)){p.hidden=true;b.setAttribute('aria-expanded','false')}})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

(function(){var r=document.documentElement;if(!r.classList.contains('t1'))return;function u(){try{r.classList.toggle('tk-off',window.scrollY>window.innerHeight*0.5)}catch(e){}}window.addEventListener('scroll',u,{passive:true});u()})();
(function(){if(!document.documentElement.classList.contains('t1'))return;var bs=[].slice.call(document.querySelectorAll('.fq-b'));if(!bs.length)return;
function closeAll(){bs.forEach(function(x){x.setAttribute('aria-expanded','false')})}
document.addEventListener('click',function(e){var q=e.target.closest&&e.target.closest('.fq');if(!q){closeAll();return}
if(e.target.closest('.fq-p')){var b=q.querySelector('.fq-b');if(b)b.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll()});
var s=document.getElementById('faq');if(s&&'IntersectionObserver' in window){new IntersectionObserver(function(en){if(!en[0].isIntersecting)closeAll()},{threshold:0}).observe(s)}
})();

(function(){var b=document.querySelector('.cond-b'),p=document.getElementById('condP');if(!b||!p)return;
function pos(){var r=b.getBoundingClientRect();p.style.left=Math.max(16,Math.min(r.left,innerWidth-p.offsetWidth-16))+'px';var below=r.bottom+p.offsetHeight+90<innerHeight;p.style.top=(below?r.bottom+16:r.top-p.offsetHeight-14)+'px'}
document.body.appendChild(p);
function close(){p.hidden=true;b.setAttribute('aria-expanded','false')}
b.addEventListener('click',function(e){e.stopPropagation();var o=p.hidden;p.hidden=!o;b.setAttribute('aria-expanded',String(o));if(o)pos()});
document.addEventListener('click',function(e){if(!p.hidden&&!p.contains(e.target))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
window.addEventListener('scroll',function(){if(!p.hidden)close()},{passive:true});
})();

(function(){var r=document.documentElement;if(!r.classList.contains('t1'))return;var on=false;function u(){var m=window.scrollY>140;if(m!==on){on=m;r.classList.toggle('demo-min',m)}}window.addEventListener('scroll',u,{passive:true});u()})();

/* ====== Нижняя панель: прячется, пока человек вводит текст ====== */
(function(){var r=document.documentElement,t=null;
document.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches('input:not([type=checkbox]),textarea,select')){clearTimeout(t);r.classList.add('kb')}});
document.addEventListener('focusout',function(){clearTimeout(t);t=setTimeout(function(){r.classList.remove('kb')},250)});
})();
