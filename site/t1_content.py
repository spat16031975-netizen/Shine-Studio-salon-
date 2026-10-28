# Вариант 1 «Shine Studio»: только парикмахерские услуги, окрашивание, уход за волосами, маникюр, педикюр
import re,json
from gen import img as _img

KEEP_DIR=['Парикмахерские услуги','Ногтевой сервис','Брови и ресницы','Макияж и перманент']
N=0
MASTER_OF={
 'Коррекция бровей':'Ксения','Окрашивание бровей краской':'Ксения','Коррекция + окрашивание':'Ксения','Долговременная укладка бровей':'Ксения','Окрашивание ресниц':'Ксения','Ламинирование ресниц':'Ксения','Наращивание ресниц — классика':'Ксения','Наращивание ресниц — 2D':'Ксения', # услуга -> мастер (по новым ролям)
 'Женская стрижка — короткие':'Артём','Женская стрижка — длинные':'Артём','Укладка феном — средние волосы':'Артём',
 'Мужская модельная стрижка':'Дмитрий','Локоны / укладка плойкой':'Артём','Свадебная причёска':'Артём','Дневной макияж':'Вероника','Вечерний макияж':'Вероника','Свадебный макияж':'Вероника',
 'Окрашивание в один тон — средние волосы':'Диана','Окрашивание корней':'Диана','Тонирование — средние волосы':'Диана','Балаяж — средние волосы':'Диана',
 'Кератиновое выпрямление — длинные':'Ирина','Ботокс волос — средние':'Ирина',
 'Маникюр без покрытия':'Алина','Маникюр с гель-лаком':'Алина','Маникюр с гель-лаком и укреплением':'Алина','Снятие гель-лака отдельно':'Алина',
 'Наращивание ногтей':'Алина','Коррекция наращённых ногтей':'Алина','Снятие наращённых ногтей':'Алина',
 'Педикюр без покрытия':'Марина','Педикюр с гель-лаком':'Марина','SMART-педикюр с гель-лаком':'Марина'}
KEEP_WORKS={'Локоны / укладка плойкой','Свадебная причёска','Маникюр с гель-лаком','Балаяж, средние волосы','Педикюр с гель-лаком','Наращивание ногтей','Наращивание ресниц, классика','Коррекция + окрашивание бровей','Дневной макияж','Вечерний макияж','Женская стрижка, короткие','Кератиновое выпрямление'}

ROLES=[ # (имя, старая роль, новая роль, старое описание, новое описание)
 ('Ирина','Мастер SPA-ухода','Мастер по уходу за волосами','Дарит гостям тепло и тишину: мягкие полотенца, тёплые руки и целый час только для себя.','Возвращает волосам мягкость и блеск. Подбирает уход под структуру волос, чтобы результат держался долго.'),
 ('Диана','Мастер депиляции','Колорист','Работает с воском, сахарной пастой и лазером: бережно, быстро и с вниманием к чувствительной коже.','Работает с цветом: тонирование, балаяж, окрашивание в один тон. Подбирает оттенок, который подчёркивает вас.'),
 ('Марина','Косметолог','Мастер педикюра','Верит, что красота — это здоровая кожа. Подбирает уход бережно, шаг за шагом, без лишнего.','Делает педикюр без спешки: аккуратная обработка, ровное покрытие и лёгкость в каждом шаге.'),
 ('Дмитрий','Массажист','Парикмахер','Возвращает лёгкость телу. Его руки снимают напряжение, а вместе с ним и усталость целой недели.','Делает аккуратные модельные стрижки и следит за формой, чтобы образ оставался собранным между визитами.'),
]
REVIEWS=[ # имя, старый тег, новый тег, старый текст, новый текст, аватар
 ('Ольга','Уход для лица','Педикюр с гель-лаком','Очень бережно и без навязывания. Марина всё объяснила про мою кожу, а результат заметили даже коллеги.','Очень бережно и без навязывания. Марина всё объяснила про уход за стопами, а покрытие держится до сих пор.','work-pedikyur'),
 ('Наталья','Массаж','Кератиновое выпрямление','После сеанса вышла как будто новая. Спина больше не напоминает о себе, записалась на курс.','После процедуры волосы гладкие и послушные. Утренняя укладка теперь занимает пять минут.','work-vypryamlenie-volos'),
 ('Полина','Уход для лица','Тонирование','Кожа стала свежей и ровной, а ещё я впервые просто отдохнула. В салоне хочется остаться подольше.','Оттенок получился мягким и дорогим, а волосы остались живыми. В салоне хочется остаться подольше.','work-okrashivanie'),
 ('Ирина','SPA-уход','Уход за волосами',None,None,'work-kare'),
 ('Мария','Ритуал ухода за волосами','Ритуал ухода за волосами',None,None,'work-vypryamlenie-volos'),
]

def apply(secs):
    # прайс
    def fix_price(m):
        D=[d for d in json.loads(m.group(1)) if d['n'] in KEEP_DIR]
        for d in D:
            if d['n']=='Макияж и перманент':
                d['n']='Макияж';d['g']=[g for g in d['g'] if g['t']=='Макияж'];d['from']=min(i['p'] for g in d['g'] for i in g['i'])
        for d in D:
            for g in d['g']:
                for it in g['i']: it['m']=MASTER_OF.get(it['n'],'')
        return '<script type="application/json" id="pricedata">'+json.dumps(D,ensure_ascii=False)+'</script>'
    secs=re.sub(r'<script type="application/json" id="pricedata">(.*?)</script>',fix_price,secs,flags=re.S)
    # работы
    wd=json.loads(re.search(r'id="workdata">(.*?)</script>',secs,re.S).group(1))
    kept=[w for w in wd if w['t'] in KEEP_WORKS]
    secs=re.sub(r'(id="workdata">).*?(</script>)',lambda m:m.group(1)+json.dumps(kept,ensure_ascii=False)+m.group(2),secs,flags=re.S)
    cards=re.findall(r'<figure class="dk-c" data-i="\d+">.*?</figure>',secs,re.S)
    k=0
    for c in cards:
        t=re.search(r'<b>(.*?)</b>',c).group(1)
        if t in KEEP_WORKS:
            secs=secs.replace(c,re.sub(r'data-i="\d+"',f'data-i="{k}"',c,1),1);k+=1
        else: secs=secs.replace(c,'',1)
    # мастера
    for n,orole,nrole,obio,nbio in ROLES:
        secs=secs.replace(orole,nrole).replace(orole.lower(),nrole.lower()).replace(obio,nbio)
    # отзывы
    for n,ot,nt,oq,nq,av in REVIEWS:
        if oq: secs=secs.replace(oq,nq)
        secs=secs.replace(f'<b>{n}</b><span>{ot}</span>',f'<b>{n}</b><span>{nt}</span>')
        secs=re.sub(r'<span class="av"><img [^>]*></span>(<div><b>'+n+r'</b>)',lambda m:'<span class="av">'+_img(av,'Фото клиента (демо)')+'</span>'+m.group(1),secs)
    # шаги, FAQ
    secs=secs.replace('Восемь мастеров в семи направлениях.','Восемь мастеров, у каждого своя специальность.')
    secs=secs.replace('волосы, ногти, брови, кожу или просто отдохнуть','волосы, цвет, уход, маникюр или педикюр')
    secs=re.sub(r'Запишитесь на консультацию косметолога: 25 BYN\. Марина подберёт уход под вашу кожу и объяснит, что и зачем\.','Оставьте заявку и коротко опишите, что хотите изменить: мастер подскажет подходящую услугу и назовёт стоимость при записи.',secs)
    secs=secs.replace('7</i></b><span>направлений','4</i></b><span>направления').replace('data-num="7"','data-num="4"')
    global N
    n_services=N=sum(len(g['i']) for d in json.loads(re.search(r'id="pricedata">(.*?)</script>',secs,re.S).group(1)) for g in d['g'])
    secs=secs.replace('data-num="50"',f'data-num="{n_services}"').replace('>50</i></b><span>услуг',f'>{n_services}</i></b><span>услуг').replace('В прайсе 50 услуг','В прайсе '+str(n_services)+' услуг')
    return secs

SALON=[('obschiy-vid-salona','Общий вид салона'),('resepshen-i-zona-ozhidaniya','Ресепшен и зона ожидания'),('zal-stilistov','Зал стилистов'),('rabochie-mesta-parikmaherov','Рабочие места парикмахеров'),('zona-myt-ya-volos','Зона мытья волос'),('manikyurnaya-zona','Маникюрная зона'),('pedikyurnaya-zona','Педикюрная зона'),('konsul-tatsionnaya-zona','Зона консультаций'),('salon','Салон изнутри')]
def salon_slider():
    sl=''.join(f'<figure class="ab-slide{" on" if i==0 else ""}"><img src="assets/salon-{k}.webp" width="900" height="675" alt="{c}, Shine Studio"{"" if i==0 else " loading=\"lazy\""} decoding="async"><figcaption>{c}</figcaption></figure>' for i,(k,c) in enumerate(SALON))
    dots=''.join(f'<button type="button" class="ab-dot{" on" if i==0 else ""}" aria-label="Фото {i+1}: {c}" data-i="{i}"></button>' for i,(k,c) in enumerate(SALON))
    return f'<div class="ab-photo ab-slider rv" role="region" aria-roledescription="карусель" aria-label="Фотографии салона"><div class="ab-track">{sl}</div><button type="button" class="ab-arr ab-prev" aria-label="Предыдущее фото">←</button><button type="button" class="ab-arr ab-next" aria-label="Следующее фото">→</button><div class="ab-bar"><div class="ab-dots">{dots}</div><span class="ab-count" aria-live="polite">1 / {len(SALON)}</span></div></div>'
DEMO_TXT='Демонстрационная версия сайта. Отзывы и имена гостей — примеры, заявки никуда не отправляются.'
def apply_final(h):
    h=h.replace('<title>Shine Studio — салон красоты в Минске</title>','<title>Shine Studio — салон красоты в Минске (демо-версия)</title>',1)
    h=h.replace('<p>Минск · ежедневно 9:00–21:00</p></div>','<p>Минск · ежедневно 9:00–21:00</p><p class="demo-foot">Демонстрационная версия сайта</p></div>',1)
    h=h.replace('Мы используем cookie, чтобы сайт работал и мы понимали, чем он полезен. Подробнее в <a href="privacy.html">политике конфиденциальности</a>.','Сайт использует cookie. <a href="privacy.html">Подробнее</a>').replace('<span>Принять</span>','<span>Ок</span>').replace('>Только необходимые<','>Только нужные<')
    import re as _re
    h=_re.sub(r'<div class="fq rv"><button[^>]*aria-controls="fq7">.*?</div></div></div>','',h,count=1,flags=_re.S)
    # --- правки по аудиту (демо) ---
    h=h.replace('<i>★★★★★</i>','')
    import re as _r2
    h=_r2.sub(r'<span class="gf-stars">★+</span>','',h)
    h=h.replace('<p class="rf-ms">★★★★★</p>','')
    h=h.replace(' <i class="todo">[ЗАМЕНИТЬ]</i>','').replace('Названия брендов по каждому направлению <span class="todo">[ЗАМЕНИТЬ]</span>','Названия брендов по каждому направлению назовёт администратор при записи.')
    h=h.replace('Условия переноса и отмены записи <span class="todo">[ЗАМЕНИТЬ]</span> Пока можно позвонить в салон заранее.','Перенести или отменить запись можно по телефону салона заранее.')
    h=h.replace('Какие услуги входят и можно ли её суммировать с другими акциями <span class="todo">[ЗАМЕНИТЬ]</span>','Она относится к любым услугам из прайса и не суммируется с другими акциями. Условия в демо-версии примерные.')
    h=h.replace('<span class="todo">[ЗАМЕНИТЬ] улица и дом</span>','[улица и дом]')
    h=h.replace('Cookie',"Cookie").replace('Сайт использует cookie. <a href="privacy.html">Подробнее</a>','Cookie нужны для работы сайта и статистики. <a href="privacy.html">Подробнее</a>')
    h=h.replace('<p class="demo-foot">Демонстрационная версия сайта</p>','<p class="demo-foot">Демонстрационная версия сайта: адрес, телефон и реквизиты — заглушки</p>')
    h=h.replace('у каждого своя специальность и свой подход.</p></div>','у каждого своя специальность и свой подход.</p><p class="ex-note">Фото мастеров — примеры для демо-версии.</p></div>',1)
    h=h.replace('ваш образ с ценой.</p></div>','ваш образ с ценой.</p><p class="ex-note">Фото работ — примеры для демо-версии.</p></div>',1)
    h=h.replace('<h3>Выберите день и время</h3><p>Показываем только свободные дни и часы мастера. Салон работает ежедневно с 9:00 до 21:00.</p>','<h3>Назовите удобные день и время</h3><p>Напишите их в заявке или скажите администратору: он подтвердит время или предложит ближайшее свободное. Салон работает ежедневно с 9:00 до 21:00.</p>')
    h=h.replace('</body>','<aside class="demo-flag" role="note" aria-label="Демо-версия"><div class="demo-p" id="demoP" hidden><b>Демо-версия</b><span>'+DEMO_TXT+'</span></div><button type="button" class="demo-b" aria-expanded="false" aria-controls="demoP"><i aria-hidden="true"></i>Демо-версия</button></aside></body>',1)
    h=h.replace('<li><a href="#reviews">Отзывы</a></li>','<li><a href="#reviews">Отзывы</a></li><li><a href="#about">Салон</a></li><li><a href="#faq">Частые вопросы</a></li>',1)
    h=re.sub(r'<div class="ab-photo rv"><img src="assets/salon-obschiy-vid-salona\.webp"[^>]*></div>',lambda m:salon_slider(),h,count=1)
    h=h.replace('</body>','<button type="button" class="totop" aria-label="Наверх, к началу сайта" hidden><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></body>',1)
    n_services=N
    h=h.replace('Семь бьюти-направлений в одном салоне и мастер, которого выберете вы. Скидка 10% на первый визит.','Приём строго по записи, без очередей и ожидания. Ваше время для нас так же важно, как результат.')
    h=h.replace('<p class="sub">','<p class="h-what">Парикмахерские услуги, ногти, брови и макияж в Минске</p>\n<p class="sub">',1)
    h=h.replace('он подтвердит время или предложит ближайшее свободное. Салон','администратор ответит в рабочее время, подтвердит время или предложит ближайшее свободное. Салон',1)
    h=h.replace('<button class="btn" type="submit" id="fBtn" disabled>','<p class="f-hint" id="fHint">Отметьте согласие, чтобы записаться</p>\n  <button class="btn" type="submit" id="fBtn" disabled>',1)
    h=h.replace('так же важно, как результат.</p>','так же важно, как результат.</p>\n<p class="promo-t"><i aria-hidden="true">✓</i>Цены на сайте актуальные</p>',1)
    h=h.replace('<div class="halo" aria-hidden="true"></div>','<div class="halo" aria-hidden="true"></div>\n <div class="off-wheel" role="img" aria-label="Скидка 10% на первый визит"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ow" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"/></defs><text><textPath href="#ow" textLength="500" lengthAdjust="spacing">скидка на первый визит · скидка на первый визит · </textPath></text></svg><span class="ow-c"><b>−10%</b><i>первый визит</i></span></div>',1)
    h=h.replace('<b data-count="7">7</b><span>направлений','<b data-count="4">4</b><span>направления').replace('data-count="50">50<',f'data-count="{n_services}">{n_services}<')
    h=re.sub(r'<span><b>7</b> направлений в одном салоне</span>','<span><b>4</b> направления в одном салоне</span>',h)
    h=h.replace('<b>50</b> услуг с ценами в прайсе',f'<b>{n_services}</b> услуг с ценами в прайсе')
    h=h.replace('7 направлений, 50 услуг',f'4 направления, {n_services} услуг').replace('Портрет девушки с естественным макияжем и сияющей кожей','Девушка с волнистыми окрашенными волосами')
    for old in ['Брови и ресницы','Макияж и перманент','Косметология лица','Депиляция и эпиляция','Массаж и уход за телом']:
        h=h.replace(f'<i></i><span>{old}</span>','')
    h=h.replace('<span>Ногтевой сервис</span>','<span>Окрашивание и уход за волосами</span><i></i><span>Маникюр и педикюр</span><i></i><span>Брови и ресницы</span><i></i><span>Макияж</span>',)
    return h

# ---------- Отзывы в виде кассовых чеков ----------
import html as _h
_P=json.load(open('../src/prices.json',encoding='utf-8'))
_PR={it['n']:it['p'] for g in _P.values() for sg in g.values() for it in sg}
RC={ # гость -> услуга из прайса
 'Анастасия':'Свадебная причёска','Мария':'Ботокс волос — средние','Екатерина':'Балаяж — средние волосы','Виктория':'Наращивание ресниц — классика',
 'Ольга':'Педикюр с гель-лаком','Алёна':'Вечерний макияж','Юлия':'Маникюр с гель-лаком','Наталья':'Кератиновое выпрямление — длинные',
 'Светлана':'Окрашивание в один тон — средние волосы','Полина':'Тонирование — средние волосы','Ирина':'Женская стрижка — короткие'}
def _fm(x): return (('%.1f'%x).rstrip('0').rstrip('.')).replace('.',',')
def reviews_section(cs):
    rows=''
    for i,c in enumerate(cs):
        q=re.search(r'<blockquote>(.*?)</blockquote>',c,re.S).group(1)
        nm=re.search(r'<b>(.*?)</b>',c).group(1)
        im=re.search(r'<img [^>]*>',c).group(0)
        sv=RC.get(nm,'');pr=_PR.get(sv,0);ms=MASTER_OF.get(sv,'')
        rows+=f'''<article class="rc-c" style="--i:{i};--r:{[-1.6,1.2,-0.8,1.8,-1.2,0.9][i%6]}deg" tabindex="0">
 <div class="rc-top"><b>SHINE STUDIO</b><span>Минск · чек гостя</span></div>
 <div class="rc-ln"><span>{_h.escape(sv)}</span><i>{_fm(pr)}</i></div>
 <div class="rc-m">Мастер: {ms}</div>
 <div class="rc-tot"><span>Итого, BYN</span><b data-to="{pr}">{_fm(pr)}</b></div>
 <blockquote>{q}</blockquote>
 <div class="rc-by"><span class="av">{im}</span><div><b>{nm}</b><span class="rc-st" aria-label="5 из 5">★★★★★</span></div></div>
 <div class="rc-bar" aria-hidden="true"></div>
</article>'''
    return f'''<section class="sec reviews rc-s" id="reviews" aria-labelledby="rev-h2"><div class="wrap-s rc-w">
 <div class="rc-head"><div><h2 id="rev-h2">Что говорят <em>те, кто уже был</em></h2><p>Отзывы гостей салона. К каждому — чек с услугой и ценой по прайсу.</p></div>
  <div class="rc-nav"><button type="button" class="rc-b" data-d="-1" aria-label="Назад">←</button><button type="button" class="rc-b" data-d="1" aria-label="Вперёд">→</button></div></div>
 <div class="rc-slot" aria-hidden="true"></div>
 <div class="rc-rail" tabindex="0" aria-label="Отзывы гостей">{rows}</div></div></section>'''

# ---------- Отзывы в виде чата ----------
def reviews_chat(cs):
    items='';wins=''
    for i,c in enumerate(cs):
        q=re.search(r'<blockquote>(.*?)</blockquote>',c,re.S).group(1)
        nm=re.search(r'<b>(.*?)</b>',c).group(1)
        im=re.search(r'<img [^>]*>',c).group(0)
        sv=RC.get(nm,'');pr=_PR.get(sv,0);ms=MASTER_OF.get(sv,'')
        short=_h.escape(sv.split(' — ')[0])
        pv=re.sub(r'<[^>]+>','',q);pv=pv[:46].rstrip()+'…'
        items+=f'''<button type="button" class="ch-i{' on' if i==0 else ''}" data-i="{i}" role="tab" aria-selected="{'true' if i==0 else 'false'}"><span class="av">{im}</span><span class="ch-t"><b>{nm}</b><small>{pv}</small></span><em>{short}</em></button>'''
        wins+=f'''<div class="ch-p{' on' if i==0 else ''}" data-i="{i}" role="tabpanel"{'' if i==0 else ' hidden'}>
 <div class="ch-hd"><span class="av">{im}</span><div><b>{nm}</b><small>отзыв гостя · {_h.escape(sv.split(' — ')[0])}</small></div></div>
 <div class="ch-bd">
  <div class="ch-m ch-g"><p>{q}</p></div>
  <div class="ch-m ch-card"><span>Услуга</span><b>{_h.escape(sv)}</b><i>{_fm(pr)} BYN · мастер {ms}</i></div>
  <div class="ch-typing" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="ch-m ch-s"><p>Спасибо, {nm}! Очень рады, что вам понравилось. Ждём вас снова. {ms} и команда Shine Studio</p></div>
 </div></div>'''
    return f'''<section class="sec reviews ch-s" id="reviews" aria-labelledby="rev-h2"><div class="wrap-s ch-w">
 <div class="ch-head"><h2 id="rev-h2">Что говорят <em>те, кто уже был</em></h2><p>Отзывы гостей салона. Выберите диалог слева: услуга, цена и мастер указаны по прайсу.</p></div>
 <div class="ch"><div class="ch-l" role="tablist" aria-label="Гости">{items}</div><div class="ch-r">{wins}</div></div></div></section>'''

# ---------- Отзывы как «истории» ----------
BG={'Анастасия':'work-pricheska','Мария':'work-vypryamlenie-volos','Екатерина':'work-okrashivanie','Виктория':'work-brovi-i-resnitsy','Ольга':'work-pedikyur',
 'Алёна':'work-makiyazh-2','Юлия':'work-dizayn-nogtey','Наталья':'work-vypryamlenie-volos','Светлана':'work-kare','Полина':'work-lokony','Ирина':'work-kare'}
def reviews_stories(cs):
    cards=''
    for i,c in enumerate(cs):
        q=re.search(r'<blockquote>(.*?)</blockquote>',c,re.S).group(1)
        nm=re.search(r'<b>(.*?)</b>',c).group(1)
        im=re.search(r'<img [^>]*>',c).group(0)
        sv=RC.get(nm,'');pr=_PR.get(sv,0);ms=MASTER_OF.get(sv,'')
        bg=_img(BG.get(nm,'work-lokony'),'Работа мастера',"",True)
        cards+=f'''<article class="st-c" data-i="{i}" tabindex="-1" aria-roledescription="история" aria-label="Отзыв: {nm}">
 <div class="st-bg">{bg}</div><div class="st-sh"></div>
 <div class="st-top"><i class="st-bar"><b></b></i>
  <div class="st-who"><span class="av">{im}</span><div><b>{nm}</b><small>{_h.escape(sv.split(' — ')[0])}</small></div></div></div>
 <blockquote>{q}</blockquote>
 <div class="st-ft"><span>{_h.escape(sv)}</span><i>{_fm(pr)} BYN · мастер {ms}</i></div>
</article>'''
    return f'''<section class="sec reviews st-s" id="reviews" aria-labelledby="rev-h2"><div class="wrap-s st-w">
 <div class="st-head"><h2 id="rev-h2">Что говорят <em>те, кто уже был</em></h2><p>Отзывы гостей в формате историй. Нажмите на соседнюю карточку или листайте стрелками.</p></div>
 <div class="st-stage"><button type="button" class="st-a st-p" aria-label="Предыдущий отзыв">←</button><div class="st-track" role="group" aria-label="Отзывы гостей">{cards}</div><button type="button" class="st-a st-n" aria-label="Следующий отзыв">→</button></div></div></section>'''

# ---------- Отзывы: 3D-кольцо (Cylinder 3D Ring) ----------
AV={'Анастасия':7,'Мария':2,'Екатерина':9,'Виктория':4,'Ольга':2,'Алёна':1,'Юлия':6,'Наталья':8,'Светлана':5,'Полина':3,'Ирина':10}
def _short(q):
    q=re.sub(r'<[^>]+>','',q).strip()
    s=re.split(r'(?<=[.!?])\s',q)[0].rstrip('.')
    if len(s)>74:
        s=s[:74].rsplit(' ',1)[0].rstrip(',;:—- ')+'…'
    return '«'+s+'»'
CATS=[('hair','Волосы','Окрашивание, уход, укладки'),('nails','Ногти','Маникюр и педикюр'),('brows','Брови и ресницы','Наращивание, ламинирование'),('makeup','Макияж','Вечерний и дневной образ')]
def _cat(sv):
    s=sv.lower()
    if any(k in s for k in('маникюр','педикюр','гель','покрыт','ногт')):return 'nails'
    if any(k in s for k in('ресниц','бров','коррекция +')):return 'brows'
    if any(k in s for k in('макияж','визаж','перманент')):return 'makeup'
    return 'hair'
def _pl(n):
    return f'{n} отзыв' if n%10==1 and n%100!=11 else (f'{n} отзыва' if 2<=n%10<=4 and not 12<=n%100<=14 else f'{n} отзывов')
EXTRA=[('Дарья','Наращивание ногтей','Раньше ногти ломались через неделю. После наращивания у Алины форма получилась идеальной: ношу уже третью неделю и не заметила ни одного скола.',9),
 ('Елена','Маникюр с гель-лаком и укреплением','Хотела сохранить свою длину и укрепить ногти. Алина подобрала спокойный нюд, покрытие лежит ровно, а руки выглядят по-настоящему ухоженными.',5),
 ('Кристина','Коррекция + окрашивание','Форму подобрали под мои черты лица, а не по шаблону. Ксения показала оттенок заранее, и брови получились естественными.',8),
 ('Софья','Ламинирование ресниц','Ресницы стали длиннее и темнее без туши, по утрам больше не нужно краситься. Эффект держится уже пятую неделю.',6),
 ('Татьяна','Долговременная укладка бровей','Брови наконец лежат так, как задумано, даже после душа и спортзала. Ксения всё объяснила про домашний уход.',10),
 ('Евгения','Свадебный макияж','Боялась, что слёзы всё смоют. Вероника сделала стойкую базу, и к концу вечера лицо выглядело так же свежо, как утром.',7),
 ('Карина','Дневной макияж','Пришла на фотосессию без идей. Вероника предложила лёгкий дневной образ: кожа выглядит живой, а не нарисованной.',4)]
def reviews_formation(cs):
    sets={k:'' for k,_,_ in CATS};cnt={k:0 for k,_,_ in CATS}
    items=[(re.search(r'<b>(.*?)</b>',c).group(1),re.search(r'<blockquote>(.*?)</blockquote>',c,re.S).group(1)) for c in cs]
    for nm,sv_,q_,a_ in EXTRA:
        RC[nm]=sv_;AV[nm]=a_;items.append((nm,q_))
    for i,(nm,q) in enumerate(items):
        sv=RC.get(nm,'');pr=_PR.get(sv,0);ms=MASTER_OF.get(sv,'')
        av='assets/avatar-%02d.webp'%AV.get(nm,1)
        kind=sv.split(' — ')[0];k=_cat(sv);cnt[k]+=1
        sets[k]+=f"""<button type="button" class="gf-card" tabindex="-1" aria-label="Читать отзыв: {_h.escape(kind)}, {nm}" data-kind="{_h.escape(kind)}" data-name="{nm}" data-av="{av}" data-svc="{_h.escape(sv)}" data-price="{_fm(pr)}" data-master="{ms}"><span class="gf-ct">{_h.escape(kind)}</span><span class="gf-stars">★★★★★</span><span class="gf-q">{_short(q)}</span><span class="gf-bot"><span class="gf-who"><img src="{av}" alt="" width="28" height="28" loading="lazy" decoding="async">{nm}</span><span>Читать ↗</span></span><span class="rf-full" hidden>{q}</span></button>"""
    peek={k:[] for k,_,_ in CATS}
    for nm,q in items:
        peek[_cat(RC.get(nm,''))].append((nm,RC.get(nm,'').split(' — ')[0]))
    fol=[];tray=''
    for n,(k,name,sub) in enumerate(CATS):
        fl=''.join(f'<span class="gf-file f{j+1}"><i>★★★★★</i><b>{_h.escape(nm)}</b><small>{_h.escape(sv)}</small></span>' for j,(nm,sv) in enumerate(peek[k][:3]))
        fol.append(f"""<button type="button" class="gf-folder gf-{k}" data-i="{n}" aria-expanded="false" aria-label="Папка «{name}», {_pl(cnt[k])}"><span class="gf-back"><span class="gf-clip gf-glass"></span></span><span class="gf-files">{fl}</span><span class="gf-front"><span class="gf-clip gf-glass"></span><span class="gf-name">{name}</span><span class="gf-meta">{_pl(cnt[k])}</span><span class="gf-plus" aria-hidden="true">+</span></span></button>""")
        tray+=f'<div class="gf-set" data-i="{n}">{sets[k]}</div>'
    return f"""<section class="sec reviews gf-s" id="reviews" aria-labelledby="rev-h2"><div class="wrap-s rf-w">
 <div class="rf-head"><div><span class="rf-kicker">Отзывы гостей</span><h2 id="rev-h2">Слова, которые <em>мы бережно храним</em></h2></div><p>Откройте папку с нужной услугой, чтобы прочитать отзывы гостей. Нажмите на карточку, чтобы раскрыть её целиком.</p></div>
 <div class="gf-desk"><div class="gf-col gf-l">{fol[0]}{fol[1]}</div><div class="gf-mid"><div class="gf-tray" aria-live="polite">{tray}<div class="gf-hint"><b>Все отзывы лежат в папках</b><span>Нажмите «+» на папке, чтобы открыть её и прочитать отзывы по этой услуге.</span></div></div><div class="gf-ctl"><button type="button" class="gf-prev" aria-label="Предыдущий отзыв">←</button><span class="gf-cnt">01 / 01</span><button type="button" class="gf-next" aria-label="Следующий отзыв">→</button></div></div><div class="gf-col gf-r">{fol[2]}{fol[3]}</div></div>
 <p class="rf-disc">Отзывы и имена представлены как пример оформления. Реальные отзывы будут добавлены после согласования с гостями.</p></div>
 <div class="rf-modal" role="dialog" aria-modal="true" aria-label="Отзыв гостя" aria-hidden="true"><div class="rf-panel"><button type="button" class="rf-x" aria-label="Закрыть">×</button><div class="rf-mh"><img class="rf-mav" src="" alt="" width="64" height="64"><div><span class="rf-mk"></span><p class="rf-ms">★★★★★</p></div></div><h3 class="rf-mq"></h3><p class="rf-mf"></p><span class="rf-mn"></span><div class="rf-msv"></div></div></div></section>"""
