import { S, resetState } from './state.js';
import { morningMeetings, afternoonMeetings, DAY_WITH_SOUP_BEFORE_LAUNDRY, DAY_WITH_GYM } from './scenes.js';


const screen=document.getElementById('screen');

// v10.3: the game is intentionally silent. Prevent any accidental media playback.
document.addEventListener('play', (e)=>{
  const el=e.target;
  if(el && (el.tagName==='AUDIO' || el.tagName==='VIDEO')) { el.pause(); el.currentTime=0; }
}, true);

// v10.2: quiet atmosphere layer — no sounds, no vibration, no screen shake.
function eventEffect(kind='success'){
  document.body.classList.remove('event-flash','event-danger');
  void document.body.offsetWidth;
  if(kind==='danger') document.body.classList.add('event-danger');
  else document.body.classList.add('event-flash');
  setTimeout(()=>document.body.classList.remove('event-flash','event-danger'),360);
}

function setClock(t){ /* Час уже намальований на PNG; HTML його не дублює. */ }

// v9: smooth scene transitions without changing the artwork or its fixed UI layout.
function render(body){
  screen.classList.add('screen-fade-in-start');
  screen.innerHTML=body;
  window.scrollTo(0,0);
  void screen.offsetWidth;
  requestAnimationFrame(()=>screen.classList.remove('screen-fade-in-start'));
  if(body.includes('pizdarunok.webp')) setTimeout(()=>eventEffect('success'),180);
  else if(body.includes('or_not.webp') || body.includes('anu.webp')) setTimeout(()=>eventEffect('danger'),180);
  else if(body.includes('i_sho.webp')) setTimeout(()=>eventEffect('success'),180);
}

// v10.2: keep native click handling; no audio, vibration or gesture side effects.

// v9: gently warm up likely next scenes after the first screen is visible.
const preloadCache=new Set();
function preloadImages(list){
  list.forEach(src=>{
    if(!src || preloadCache.has(src))return;
    preloadCache.add(src);
    const img=new Image();
    img.decoding='async';
    img.src=src;
  });
}
setTimeout(()=>preloadImages([
 'images/alarm_0827.webp','images/alarm_0832.webp','images/alarm_0837.webp',
 'images/breakfast.webp','images/breakfast_egg.webp','images/breakfast_fish.webp','images/breakfast_bread.webp',
 'images/morning_calls.webp','images/home_call_0900.webp','images/home_call_1015.webp',
 'images/home_call_1130.webp','images/home_call_1215.webp'
]),1100);
function btn(text,fn,cls='option'){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;if(fn)b.onclick=fn;return b}
function addButtons(c,items){items.forEach(([t,f,cl])=>c.appendChild(btn(t,f,cl||'option')))}
function questLayout(title,subtitle,done,total,label,inner){
 return `<div class="card"><div class="art"><div class="turkey">🦃</div></div>
 <h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}
 <div class="quest-head">${label?`<b>${label}</b>`:`<span></span>`}<b>${done}/${total}</b></div>
 <div class="progress"><span style="width:${Math.round(done/total*100)}%"></span></div>
 <div class="quest-list">${inner}</div></div>`;
}

function calendar(){
 setClock('');
 render(`<div class="card calendar-card"><div class="menu-poster">
 <img src="images/cover.webp" alt="День індика — вибір дня тижня">
 <div class="day-hotspots">
 <button class="day-hotspot" data-day="ПОНЕДІЛОК"></button><button class="day-hotspot" data-day="ВІВТОРОК"></button>
 <button class="day-hotspot" data-day="СЕРЕДА"></button><button class="day-hotspot" data-day="ЧЕТВЕР"></button>
 <button class="day-hotspot" data-day="ПʼЯТНИЦЯ"></button></div></div></div>`);
 document.querySelectorAll('.day-hotspot').forEach(b=>b.onclick=()=>{S.day=b.dataset.day;wake(1)});
}

function wake(n){
 const d={
 1:{img:'images/alarm_0827.webp',alt:'08:27',next:'ЩЕ 5 ХВИЛИН'},
 2:{img:'images/alarm_0832.webp',alt:'08:32',next:'ЩЕ 5 ХВИЛИНОЧОК'},
 3:{img:'images/alarm_0837.webp',alt:'08:37',next:'ЧАС ВСТАВАТИ'}
 }[n];
 setClock(n===1?'08:27':n===2?'08:32':'08:37');
 render(`<div class="card wake-image-card"><div class="wake-image">
 <img src="${d.img}" alt="${d.alt}"><button class="wake-hotspot" id="wakeNext" aria-label="${d.next}"></button>
 </div></div>`);
 document.getElementById('wakeNext').onclick=()=>n<3?wake(n+1):breakfast();
}

function breakfast(){
 setClock('08:45');
 render(`<div class="card breakfast-image-card"><div class="breakfast-image">
 <img src="images/breakfast.webp" alt="08:45 — Сніданок">
 <div class="breakfast-food-hotspots">
 <button class="breakfast-food-hotspot" data-food="🥚"></button>
 <button class="breakfast-food-hotspot" data-food="🐟"></button>
 <button class="breakfast-food-hotspot" data-food="🍞"></button>
 </div></div></div>`);
 document.querySelectorAll('.breakfast-food-hotspot').forEach(b=>b.onclick=()=>foodConfirm(b.dataset.food));
}
function foodConfirm(emoji){
 const key=emoji==='🥚'?'egg':emoji==='🐟'?'fish':'bread';
 const imgs={egg:'images/breakfast_egg.webp',fish:'images/breakfast_fish.webp',bread:'images/breakfast_bread.webp'};
 setClock('08:45');
 render(`<div class="card breakfast-result-card"><div class="breakfast-result">
 <img src="${imgs[key]}" alt="Індик їсть"><button class="breakfast-work-hotspot" id="breakfastWork" aria-label="ДО ПРАЦІ"></button>
 </div></div>`);
 document.getElementById('breakfastWork').onclick=morningWork;
}
function morningWork(){
 setClock('09:00');
 S.morning=new Set();
 renderCalls('morning');
}
function afternoonWork(){S.afternoon=new Set();renderCalls('afternoon')}

function renderCalls(which){
 const arr=which==='morning'?morningMeetings:afternoonMeetings;
 const done=which==='morning'?S.morning:S.afternoon;
 const isAfternoon=which==='afternoon';
 const img=isAfternoon?'images/day_calls.webp':'images/morning_calls.webp';
 const prefix=isAfternoon?'a':'m';
 render(`<div class="card call-list-image-card"><div class="call-list-image">
 <img src="${img}" alt="Список коллів">
 <div class="quest-progress">${done.size}/4</div>
 <button class="call-list-hotspot" style="top:${isAfternoon?'58.55%':'64.5299%'}" data-call="${prefix}1"></button>
 <button class="call-list-hotspot" style="top:${isAfternoon?'67.91%':'72.2222%'}" data-call="${prefix}2"></button>
 <button class="call-list-hotspot" style="top:${isAfternoon?'76.79%':'79.9145%'}" data-call="${prefix}3"></button>
 <button class="call-list-hotspot" style="top:${isAfternoon?'85.56%':'87.6068%'}" data-call="${prefix}4"></button>
 </div></div>`);
 document.querySelectorAll('[data-call]').forEach(b=>b.onclick=()=>openCall(which,b.dataset.call));
}

function openCall(which,id){
 const arr=which==='morning'?morningMeetings:afternoonMeetings,call=arr.find(x=>x[0]===id);
 if(!call)return;
 setClock(call[1]);
 if(which==='morning' || which==='afternoon'){
  const files=which==='morning'
   ?{m1:'home_call_0900.webp',m2:'home_call_1015.webp',m3:'home_call_1130.webp',m4:'home_call_1215.webp'}
   :{a1:'home_call_1415.webp',a2:'home_call_1530.webp',a3:'home_call_1645.webp',a4:'home_call_1745.webp'};
  const img=files[id];
  render(`<div class="card call-detail-image-card"><div class="call-detail-image call-detail-image-hotspot" data-complete-call="1">
  <img src="images/${img}" alt="${call[1]} — ${call[2]}"></div></div>`);
  document.querySelector('[data-complete-call]').onclick=()=>completeCall(which,id);
  return;
 }
}
function completeCall(which,id){
 const arr=which==='morning'?morningMeetings:afternoonMeetings,set=which==='morning'?S.morning:S.afternoon;
 set.add(id);
 if(set.size>=arr.length){which==='morning'?morningFinished():finishWork();return}
 renderCalls(which);
}
function morningFinished(){lunchHome()}
function lunchHome(){
 setClock('13:00');
 render(`<div class="card breakfast-image-card"><div class="breakfast-image">
 <img src="images/lunch.webp?v=3" alt="13:00 — Обід" decoding="async">
 <div class="breakfast-food-hotspots">
  <button class="breakfast-food-hotspot" data-food-key="egg" aria-label="Яйце"></button>
  <button class="breakfast-food-hotspot" data-food-key="fish" aria-label="Риба"></button>
  <button class="breakfast-food-hotspot" data-food-key="bread" aria-label="Хліб"></button>
 </div></div></div>`);
 document.querySelectorAll('.breakfast-food-hotspot').forEach(b=>{
   b.addEventListener('pointerup', e=>{ e.preventDefault(); lunchConfirm(b.dataset.foodKey); }, {passive:false});
 });
}
function lunchConfirm(key){
 const imgs={egg:'images/lunch_egg.webp?v=3',fish:'images/lunch_fish.webp?v=3',bread:'images/lunch_bread.webp?v=3'};
 if(!imgs[key]) return;
 setClock('14:14');
 render(`<div class="card breakfast-result-card"><div class="breakfast-result">
 <img src="${imgs[key]}" alt="14:14 — Обід" decoding="async" fetchpriority="high" onerror="this.closest('.breakfast-result').dataset.imageError='1'">
 <button class="breakfast-work-hotspot" id="lunchNext" aria-label="ОЙ ЛІШЕНЬКО, ЗНОВУ ХТОСЬ ДЗВОНИТЬ!!!"></button>
 </div></div>`);
 document.getElementById('lunchNext').addEventListener('pointerup', e=>{e.preventDefault(); afternoonWork();}, {passive:false});
}
function finishWork(){
 // Пн/Ср/Пт: після денних коллів спочатку «варимо суп», потім переходимо до прання.
 if(DAY_WITH_SOUP_BEFORE_LAUNDRY.includes(S.day))return turkeySoup(laundryStart);
 laundryStart();
}
function turkeySoup(next){
 setClock('18:00');
 render(`<div class="card soup-card"><div class="soup-scene">
  <img src="images/turkey_soup.webp" alt="Час варити суп">
  <input type="range" class="soup-slider" id="soupSlider" min="0" max="100" value="0" aria-label="Температура води" aria-valuetext="Холодна вода">
 </div></div>`);
 const slider=document.getElementById('soupSlider');
 let finished=false;
 slider.addEventListener('input',()=>{
   const value=Number(slider.value);
   slider.setAttribute('aria-valuetext', value>=70 ? (value>=95 ? 'Дуже гаряча вода' : 'Гаряча вода') : 'Холодна вода');
   if(!finished && value>=95){
     finished=true;
     next();
   }
 });
}

function laundryStart(){
 setClock('18:00');
 S.laundry=new Set();
 renderLaundry();
}
function renderLaundry(){
 const done=S.laundry.size;
 render(`<div class="card breakfast-image-card"><div class="breakfast-image">
 <img src="images/1sock.webp" alt="18:00 — Час прати!">
 <button class="laundry-hotspot" style="top:72.2222%" data-laundry="wash" aria-label="Завантажити пральну машину"></button>
 <button class="laundry-hotspot" style="top:79.9145%" data-laundry="hang" aria-label="Розвісити білизну"></button>
 <button class="laundry-hotspot" style="top:87.6068%" data-laundry="sock" aria-label="Знайти другу шкарпетку"></button>
 <div class="quest-progress">${done}/3</div>
 </div></div>`);
 document.querySelectorAll('[data-laundry]').forEach(b=>b.onclick=()=>completeLaundry(b.dataset.laundry));
}
function completeLaundry(id){
 S.laundry.add(id);
 if(S.laundry.size>=3){
  // У вівторок і четвер після прання вдома одразу йдемо до спортзалу.
  if(DAY_WITH_GYM.includes(S.day))return gymLine();
  eveningChoice();
  return;
 }
 renderLaundry();
}
function eveningChoice(){
 setClock('18:05');
 render(`<div class="card evening-image-card"><div class="evening-scene">
  <img src="images/drink_vegan.webp" alt="18:05 — ЩО РОБИМО СЬОГОДНІ?">
  <button class="evening-hotspot evening-dimon" id="eveningDimon" aria-label="Дімон"></button>
  <button class="evening-hotspot evening-maika" id="eveningMaika" aria-label="Майка"></button>
  <button class="evening-hotspot evening-mykyta" id="eveningMykyta" aria-label="Микита — аферіст"></button>
  <button class="evening-hotspot evening-dinner" id="eveningDinner" aria-label="Вечеря"></button>
 </div></div>`);
 document.getElementById('eveningDimon').onclick=dimonChoice;
 document.getElementById('eveningMaika').onclick=maikaChoice;
 document.getElementById('eveningMykyta').onclick=mykytaChoice;
 document.getElementById('eveningDinner').onclick=dinner;
}

function dimonChoice(){
 setClock('18:05');
 render(`<div class="card person-choice-card"><div class="person-choice-scene dimon-choice-scene">
  <img src="images/dimon_to_do.webp?v=5" alt="Дімон — що обираємо?" draggable="false">
  <button class="person-choice-hotspot dimon-choice dimon-call" id="dimonCallChoice" aria-label="ПОДЗВОНИТИ ДІМОНУ"></button>
  <button class="person-choice-hotspot dimon-choice dimon-walk" id="dimonWalkChoice" aria-label="ПРОГУЛЯНКА З ДІМОНОМ"></button>
  <button class="person-choice-hotspot dimon-choice dimon-refuse" id="dimonRefuseChoice" aria-label="ВІДМОВИТИСЯ"></button>
 </div></div>`);
 document.getElementById('dimonCallChoice').onclick=dimonCallScene;
 document.getElementById('dimonWalkChoice').onclick=()=>warningThenNight('images/dimon_drink.webp?v=4');
 document.getElementById('dimonRefuseChoice').onclick=dinner;
}

function dimonCallScene(){
 render(`<div class="card night-image-card"><div class="night-image-scene">
  <img src="images/dimon_call.webp" alt="Колл із Дімоном">
  <button class="night-next-hotspot" id="dimonCallNext" style="top:83.3%;height:6.4%" aria-label="А ось тепер вечеря!"></button>
 </div></div>`);
 document.getElementById('dimonCallNext').onclick=dinner;
}

function maikaChoice(){
 setClock('18:05');
 render(`<div class="card person-choice-card"><div class="person-choice-scene">
  <img src="images/maika_to_do.webp" alt="Майка — що обираємо?">
  <button class="person-choice-hotspot maika-choice maika-1" data-maika="1" aria-label="Веганський ресторан"></button>
  <button class="person-choice-hotspot maika-choice maika-2" data-maika="2" aria-label="Веганський ресторан"></button>
  <button class="person-choice-hotspot maika-choice maika-3" data-maika="3" aria-label="Веганський ресторан"></button>
 </div></div>`);
 document.querySelectorAll('[data-maika]').forEach(b=>b.onclick=maikaToRest);
}
function maikaToRest(){
 // Усі три однакові варіанти Майки відкривають один і той самий кадр ресторану.
 setClock('21:30');
 render(`<div class="card night-image-card"><div class="night-image-scene">
  <img src="images/maika.webp" alt="Майка — веганський ресторан">
  <button class="night-next-hotspot" id="maikaNext" aria-label="Продовжити"></button>
 </div></div>`);
 document.getElementById('maikaNext').onclick=restChoice;
}

function mykytaChoice(){
 setClock('18:05');
 render(`<div class="card person-choice-card"><div class="person-choice-scene">
  <img src="images/nikita_to_do.webp" alt="Микита — аферіст — що обираємо?">
  <button class="person-choice-hotspot mykyta-choice mykyta-spati" id="mykytaSpati" aria-label="Пиво Шпеті"></button>
  <button class="person-choice-hotspot mykyta-choice mykyta-bar" id="mykytaBar" aria-label="Пиво — прокурений бар"></button>
  <button class="person-choice-hotspot mykyta-choice mykyta-velodrom" id="mykytaVelodrom" aria-label="Пиво Сходинки (велодром)"></button>
  <button class="person-choice-hotspot mykyta-choice mykyta-refuse" id="mykytaRefuse" aria-label="Відмовитися"></button>
 </div></div>`);
 document.getElementById('mykytaSpati').onclick=()=>warningThenNight('images/nik_spati.webp');
 document.getElementById('mykytaBar').onclick=()=>warningThenNight('images/nik_bar.webp');
 document.getElementById('mykytaVelodrom').onclick=()=>warningThenNight('images/nik_velodrom.webp');
 document.getElementById('mykytaRefuse').onclick=dinner;
}

function warningThenNight(scene){
 // Показуємо обраний сюжетний кадр, а наступний клік веде на червоне попередження.
 render(`<div class="card night-image-card"><div class="night-image-scene">
  <img src="${scene}" alt="Вечірня пригода">
  <button class="night-next-hotspot" id="sceneNext" aria-label="І шо?"></button>
 </div></div>`);
 document.getElementById('sceneNext').onclick=night;
}

function gymLine(){
 setClock('19:00');
 render(`<div class="card breakfast-image-card"><div class="breakfast-image">
 <img src="images/gym_line.webp" alt="19:00 — Черга в зал">
 <button class="wake-hotspot" id="gymLineNext" aria-label="Стати в чергу до залу"></button>
 </div></div>`);
 document.getElementById('gymLineNext').onclick=gymStart;
}
function gymStart(){
 S.gym=new Set();
 renderGym();
}
function renderGym(){
 const done=S.gym.size;
 setClock('19:15');
 render(`<div class="card breakfast-image-card"><div class="breakfast-image">
 <img src="images/gym.webp" alt="Індик у залі — три завдання">
 <button class="laundry-hotspot" style="top:72.2222%" data-gym="task1" aria-label="Перше завдання в залі"></button>
 <button class="laundry-hotspot" style="top:79.9145%" data-gym="task2" aria-label="Друге завдання в залі"></button>
 <button class="laundry-hotspot" style="top:87.6068%" data-gym="task3" aria-label="Третє завдання в залі"></button>
 <div class="quest-progress">${done}/3</div>
 </div></div>`);
 document.querySelectorAll('[data-gym]').forEach(b=>b.onclick=()=>completeGym(b.dataset.gym));
}
function completeGym(id){
 S.gym.add(id);
 if(S.gym.size>=3){
  // Вт/Чт: після спортзалу спочатку «варимо суп», а вже потім вечеря.
  if(DAY_WITH_GYM.includes(S.day))return turkeySoup(dinner);
  dinner();
  return;
}
 renderGym();
}
function dinner(){
 setClock('20:30');
 render(`<div class="card breakfast-image-card"><div class="breakfast-image">
 <img src="images/dinner.webp" alt="20:30 — Вечеря">
 <div class="breakfast-food-hotspots"><button class="breakfast-food-hotspot" data-food="🥚"></button>
 <button class="breakfast-food-hotspot" data-food="🐟"></button><button class="breakfast-food-hotspot" data-food="🍞"></button></div></div></div>`);
 document.querySelectorAll('.breakfast-food-hotspot').forEach(b=>b.onclick=()=>dinnerFood(b.dataset.food));
}
function dinnerFood(emoji){
 const key=emoji==='🥚'?'egg':emoji==='🐟'?'fish':'bread';
 const imgs={egg:'images/dinner_egg.webp',fish:'images/dinner_fish.webp',bread:'images/dinner_bread.webp'};
 render(`<div class="card breakfast-result-card"><div class="breakfast-result"><img src="${imgs[key]}" alt="Вечеря">
 <button class="breakfast-work-hotspot" id="dinnerNext" aria-label="А ЩО ДАЛІ?"></button></div></div>`);
 document.getElementById('dinnerNext').onclick=dinnerAfterFood;
}
function dinnerAfterFood(){
 setClock('21:00');
 render(`<div class="card fox-time-card"><div class="fox-time-scene">
 <img src="images/fox_time.webp" alt="Час зустрітися з лисою">
 <button class="fox-choice-hotspot laptop" id="foxLaptop" aria-label="ЗУСТРІТИ ЛИСУ В НОУТІ"></button>
 <button class="fox-choice-hotspot park" id="foxPark" aria-label="ЗУСТРІТИ ЛИСУ В ПАРКУ"></button>
 </div></div>`);
 document.getElementById('foxLaptop').onclick=()=>lisaMeeting('laptop');
 document.getElementById('foxPark').onclick=()=>lisaMeeting('park');
}
function lisaMeeting(where){
 const choice = where==='laptop' ? 'slow_foxes' : 'fox_forest';
 const src = choice==='slow_foxes' ? 'images/slow_fox.webp' : 'images/fast_fox.webp';
 S.fox=choice;
 render(`<div class="card fox-meeting-card"><div class="fox-meeting-scene">
 <img src="${src}" alt="Зустріч з лисою">
 <button class="fox-next-hotspot" id="foxMeetingNext"></button>
 </div></div>`);
 document.getElementById('foxMeetingNext').onclick=restChoice;
}
function restChoice(){
 setClock('21:30');
 /* Нова логіка після вибору лиси:
    slow_foxes — рівно 3 активні кнопки;
    лиса у лісі (fox_forest) — усі 4 активні кнопки. */
 const count=S.fox==='slow_foxes'?3:4;
 const hotspots=Array.from({length:count},(_,i)=>`<button class="rest-choice-hotspot rest-choice-${i+1}" data-rest="${i+1}" aria-label="Варіант відпочинку ${i+1}"></button>`).join('');
 render(`<div class="card rest-choice-card"><div class="rest-choice-scene">
 <img src="images/wtd_fast.webp" alt="21:30 — Відпочинок">
 ${hotspots}
 </div></div>`);
 document.querySelectorAll('[data-rest]').forEach(b=>b.onclick=night);
}
function night(){
 setClock('00:50');
 render(`<div class="card night-image-card"><div class="night-image-scene">
  <img src="images/0050.webp" alt="00:50">
  <button class="night-next-hotspot" id="night0050Next" aria-label="ТЕРМІНОВО ТРЕБА СПАТИ"></button>
 </div></div>`);
 document.getElementById('night0050Next').onclick=sleepQuest;
}
function sleepQuest(){
 S.sleep=new Set();
 renderToothpasteQuest();
}
function bedScreen(){
 setClock('00:55');
 render(`<div class="card night-image-card"><div class="night-image-scene">
 <img src="images/bed.webp" alt="00:55 — А ТЕПЕР СПАТИ">
 <button class="night-next-hotspot" id="sleepStart" aria-label="Продовжити"></button>
 </div></div>`);
 document.getElementById('sleepStart').onclick=daySummary;
}
function renderToothpasteQuest(){
 const done=S.sleep.size;
 render(`<div class="card laundry-card"><div class="laundry-scene">
 <img src="images/toothpaste.webp" alt="00:50 — Вечірній квест">
 <div class="quest-progress">${done}/3</div>
 <button class="laundry-hotspot" style="top:72.2222%;height:6.4103%" data-sleep="teeth" aria-label="Перше завдання"></button>
 <button class="laundry-hotspot" style="top:79.9145%;height:6.4103%" data-sleep="alarm" aria-label="Друге завдання"></button>
 <button class="laundry-hotspot" style="top:87.6068%;height:6.4103%" data-sleep="light" aria-label="Третє завдання"></button>
 </div></div>`);
 document.querySelectorAll('[data-sleep]').forEach(b=>b.onclick=()=>{
   S.sleep.add(b.dataset.sleep);
   if(S.sleep.size>=3) bedScreen(); else renderToothpasteQuest();
 });
}
function daySummary(){
 setClock('00:55');
 render(`<div class="card day-summary-card finale-card"><div class="night-image-scene">
 <img src="images/day_is_over.webp" alt="ДЕНЬ ЗАВЕРШЕНО! — Ти прожив ще один «абсолютно звичайний день».">
 <button class="day-summary-next-hotspot" id="summaryNext" aria-label="…ЧИ НІ?"></button>
 </div></div>`);
 document.getElementById('summaryNext').onclick=surprise;
}
function surprise(){
 setClock('00:55');
 render(`<div class="card day-summary-card finale-card"><div class="night-image-scene">
 <img src="images/or_not.webp" alt="ТИ ДУМАВ, ЦЕ БУВ ПРОСТО ЗВИЧАЙНИЙ ДЕНЬ?">
 <button class="day-summary-next-hotspot" id="know" aria-label="ТАК НІ МОЖЛИВО"></button>
 </div></div>`);
 document.getElementById('know').onclick=notNormal;
}
function notNormal(){
 setClock('00:55');
 render(`<div class="card day-summary-card finale-card"><div class="night-image-scene">
 <img src="images/anu.webp" alt="АНУ?"><button class="day-summary-next-hotspot" id="whyBirthday" aria-label="АНУ?"></button>
 </div></div>`);
 document.getElementById('whyBirthday').onclick=birthday;
}
function birthday(){
 setClock('00:55');
 render(`<div class="card day-summary-card finale-card"><div class="night-image-scene">
 <img src="images/i_sho.webp" alt="ТОМУ ЩО У ТЕБЕ СЬОГОДНІ ДЕНЬ НАРОДЖЕННЯ!">
 <button class="day-summary-next-hotspot" id="birthdayWhat" aria-label="І ШО?"></button>
 </div></div>`);
 document.getElementById('birthdayWhat').onclick=birthdayGift;
}
function birthdayGift(){
 setClock('00:55');
 render(`<div class="card day-summary-card finale-card"><div class="night-image-scene gift-final-scene">
 <img src="images/pizdarunok.webp" alt="Подарунок">
 <button class="day-summary-next-hotspot" id="gift" aria-label="Відкрити подарунок"></button>
 </div></div>`);
 const gift=document.getElementById('gift');
 if(gift){
   gift.addEventListener('pointerup', ()=>{
     gift.disabled=true;
     gift.style.pointerEvents='none';
     giftNext();
   }, {once:true});
 }
}
function giftNext(){
 setClock('00:55');
 render(`<div class="card day-summary-card finale-card"><div class="night-image-scene gift-home-scene">
 <img src="images/pizdarunok_waits_at_home.webp" alt="Він з П’ятачоком чекають на тебе вдома">
 <div class="gift-confetti" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>
 </div></div>`);
 setTimeout(()=>eventEffect('success'),120);
}

// The game is now public: no secret query parameter is required.
calendar();
