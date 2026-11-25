window.TORAMI_FEATURES=function(C){
'use strict';
const {D,all,by,esc,head,card,photo,href,heart,crystalMap,mapHeading,mapZoomControls,bindMapZoom,openDialog,track,SSR,page}=C;
let lang='ja';try{lang=new URLSearchParams(location.search).get('lang')||(!SSR&&localStorage.getItem('torami-language'))||'ja'}catch{}
const t=(ja,en)=>lang==='en'?en:ja, name=d=>lang==='en'?d.en:d.ja, empty=t('未登録','Not registered');
// Keep comparisons numeric; abbreviate only at display time.
function compactCount(value, people=false){
  if(lang==='en')return new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(value)+(people?' people':' arrivals');
  const unit=people?'人':'回';
  if(value<10000)return value.toLocaleString('ja-JP')+unit;
  const oku=value>=99999500,scaled=value/(oku?1e8:1e4);
  return '約'+Number(scaled.toFixed(1)).toLocaleString('ja-JP')+(oku?'億':'万')+unit;
}
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const state=SSR?{version:1,albumIds:[],photoIds:[],visited:[],wanted:[],bucket:[],trips:[],history:[]}:read('torami-my-trip',{version:1,albumIds:[],photoIds:[],visited:[],wanted:[],bucket:[],trips:[],history:[]});
for(const key of ['albumIds','photoIds','visited','wanted','bucket','trips','history'])if(!Array.isArray(state[key]))state[key]=[];
const save=()=>{try{localStorage.setItem('torami-my-trip',JSON.stringify(state));return true}catch{alert(t('保存できませんでした。バックアップをダウンロードしてください。','Storage is unavailable. Download a backup.'));return false}};
function refreshPassport(){
  if(SSR)return;
  const latest=read('torami-my-trip',null);
  if(latest&&['visited','wanted','bucket','trips','history'].every(k=>Array.isArray(latest[k])))Object.assign(state,{albumIds:[],photoIds:[]},latest);
}
function visitedIds(){refreshPassport();return state.visited}
function setPassportStatus(id,status){
  if(!by(id)||by(id).isCity||!['visited','wanted','unvisit','unwant','remove'].includes(status))return false;
  refreshPassport();
  const oldVisited=state.visited,oldWanted=state.wanted;
  if(['remove','visited','unvisit'].includes(status))state.visited=oldVisited.filter(x=>x!==id);
  if(['remove','wanted','unwant'].includes(status))state.wanted=oldWanted.filter(x=>x!==id);
  if(status==='visited'||status==='wanted')state[status].push(id);
  if(!save()){state.visited=oldVisited;state.wanted=oldWanted;return false}
  return true;
}
if(!SSR)window.addEventListener('storage',event=>{
  if(event.key==='torami-saved'){if(page==='mytrip'&&tripTab!==3)showTrip();return}if(event.key!==null&&event.key!=='torami-my-trip')return;
  if(!event.newValue)Object.assign(state,{version:1,albumIds:[],photoIds:[],visited:[],wanted:[],bucket:[],trips:[],history:[]});
  else refreshPassport();
  window.dispatchEvent(new Event('torami-passport-change'));
  if(page==='mytrip'&&tripTab!==3)showTrip();
});

const fav=()=>SSR?[]:read('torami-saved',[]), compare=()=>SSR?[]:read('torami-compare',[]);
const link=(url,ja,en)=>`<a class="button soft" href="${url}">${t(ja,en)} <span>↗</span></a>`;
const tabs=items=>`<nav class="feature-tabs glass">${items.map(([u,ja,en])=>`<a href="${u}" ${location.pathname?.endsWith(u)?'aria-current="page"':''}>${t(ja,en)}</a>`).join('')}</nav>`;
const exploreTabs=()=>tabs([['destinations.html','旅先検索','Search'],['compare.html','比較','Compare'],['rankings.html','ランキング','Rankings']]);
const options=(selected='',blank=true)=>`${blank?`<option value="">${t('国・地域を選ぶ','Choose a destination')}</option>`:''}${all.map(d=>`<option value="${d.id}" ${selected===d.id?'selected':''}>${esc(name(d))}</option>`).join('')}`;
const regionOptions=()=>`<option value="">${t('すべての大陸','All regions')}</option>${[...new Set(all.map(d=>d.region))].map(x=>`<option>${x}</option>`).join('')}`;
const missing=(ja,en)=>`<div class="empty-state glass"><span>✧</span><h3>${t(ja,en)}</h3><p>${t('登録された情報から、ここに表示していきます。','This space fills as verified information is added.')}</p></div>`;
function discover(){return `${head('Discover',t('旅を、もっと楽しく。','A little curiosity goes a long way.'))}<section class="wrap page-body"><div class="discover-grid">${[['gacha.html','GR','Travel Gacha','ひと回しから、次の旅へ。','A little chance. A new destination.'],['personality.html','IT','Travel Personality','いまの自分に似合う旅を。','Find the kind of journey that feels like you.'],['quiz.html','EG','Travel Quiz','知るほど、旅したくなる。','A little knowledge. A bigger world.']].map(([u,k,title,ja,en])=>`<a href="${u}" class="mood-card">${photo(by(k))}<div><h2>${title}</h2><p>${t(ja,en)} ↗</p></div></a>`).join('')}</div></section>`}
const compFields=[['temp','気温 °C（1月 / 7月）','Temperature °C (Jan / Jul)',d=>d.climate?d.climate.place+' · '+d.climate.temp[0]+' / '+d.climate.temp[6]:null],['currency','通貨','Currency',d=>d.practical?.currency],['language','言語','Language',d=>d.practical?.language],['arrivals','観光客到着数','Tourist arrivals',d=>d.arrivalsLast?compactCount(d.arrivalsLast[1])+' ('+d.arrivalsLast[0]+')':null],['budget','旅行費用／日','Daily travel budget',d=>d.budget?.daily?`${d.budget.currency==='JPY'?'¥':d.budget.currency+' '}${Number(d.budget.daily).toLocaleString()}`:null],['price','物価','Cost of living',d=>d.practical?.prices],['scenery','景色（体験評価）','Scenery · personal',d=>d.ratings?.scenery],['food','グルメ（体験評価）','Food · personal',d=>d.ratings?.food],['city','街並み（体験評価）','Cityscape · personal',d=>d.ratings?.city],['nature','自然（体験評価）','Nature · personal',d=>d.ratings?.nature],['safety','治安情報・出典','Travel advisory · source',d=>d.safety?.summary],['solo','ひとり旅（体験評価）','Solo travel · personal',d=>d.ratings?.solo],['access','アクセス','Access',d=>d.practical?.access],['season','ベストシーズン','Best season',d=>d.season?.join(', ')],['days','滞在日数','Suggested stay',d=>d.practical?.stayDays],['value','コスパ（体験評価）','Value · personal',d=>d.ratings?.value],['return','再訪したい（体験評価）','Would revisit · personal',d=>d.ratings?.return],['hidden','穴場（体験評価）','Hidden gems · personal',d=>d.ratings?.hidden],['resort','リゾート（体験評価）','Resorts · personal',d=>d.ratings?.resort],['overall','トラみちゃんの評価','TORAMI personal rating',d=>d.ratings?.overall]];
const compareOptions=()=>options()+all.flatMap(d=>(d.cities||[]).map(c=>`<option value="${esc(d.id+'~'+(c.id||c.name))}">${esc(c.name)} · ${esc(name(d))}</option>`)).join('');
function comparison(){const list=compare().map(by).filter(Boolean);return `${head('Compare Destinations',t('気になる旅先を、並べてみる。','Find the differences that matter to you.'))}<section class="wrap page-body">${exploreTabs()}<form id="compare-form" class="feature-form glass"><label>${t('国・地域','Destination')}<select name="country">${compareOptions()}</select></label><button class="button">${t('比較に追加','Add to compare')}</button><p>${t('最大4件。体験評価と一般情報を分けて表示します。','Up to four destinations. Personal ratings are distinguished from general facts.')}</p></form><div id="compare-table">${comparisonTable(list)}</div></section>`}
function comparisonTable(list){return list.length?`<div class="table-scroll glass"><table class="compare-table"><thead><tr><th>${t('項目','Feature')}</th>${list.map(d=>`<th>${photo(d)}<a href="${href(d)}">${esc(name(d))}</a><button class="text-button" data-remove-compare="${d.id}">${t('削除','Remove')} ×</button></th>`).join('')}</tr></thead><tbody>${compFields.map(([k,ja,en,fn])=>`<tr><th>${t(ja,en)}</th>${list.map(d=>`<td>${esc(fn(d)||empty)}${['budget','safety'].includes(k)&&d[k]?.updatedAt?`<small>${esc(d[k].updatedAt)} ${d[k].source?`<a href="${esc(d[k].source)}" target="_blank" rel="noopener">${t('出典','Source')}</a>`:''}</small>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:missing('比較したい旅先を選んでください。','Choose your first destination.');}
function calendar(){return `${head('Monthly Climate',t('旅行月の気温と雨量','A destination for your next free month.'))}<section class="wrap page-body">${exploreTabs()}<form id="calendar-form" class="feature-form glass"><label>${t('旅行月','Month')}<select name="month">${Array.from({length:12},(_,i)=>`<option value="${i+1}">${t(i+1+'月',new Intl.DateTimeFormat('en',{month:'long'}).format(new Date(2020,i,1)))}</option>`).join('')}</select></label><label>${t('大陸','Region')}<select name="region">${regionOptions()}</select></label><label>${t('並び順','Sort by')}<select name="climateSort"><option value="name">${t('国名順','Name')}</option><option value="warm">${t('暖かい順','Warmest')}</option><option value="dry">${t('雨が少ない順','Least rainfall')}</option></select></label></form><p>WorldClim 2.1 · 1970–2000 · ${t('代表都市の月平均気温・降水量','Monthly mean temperature and precipitation near the named city')} <a href="https://www.worldclim.org/data/worldclim21.html">↗</a></p><div id="calendar-results"></div></section>`}
// The masthead artwork is cropped from TORAMI's approved collection designs.
function collectionHero(kind,title){
  const art='assets/img/collection/'+kind+'-hero.webp';
  return `<header class="collection-hero hero-${kind}"><img src="${art}" alt="" fetchpriority="high">${kind==='rank'?`<span class="rank-art-caption">${t('旅のデータで見つける、次の目的地','Discover destinations through travel data')}</span>`:''}<h1 class="sr-only">${title}</h1></header>`;
}
function chapter(en,ja){return `<div class="collection-title"><h2>${esc(ja)}</h2><p lang="en">${esc(en)}</p></div>`}
const diaryQuery=new URLSearchParams(location.search);
const normalizeText=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const albumCity=a=>t(a.cityJa||a.cityId,a.cityEn||a.cityId);
const visits=a=>[...new Set((a.visitMonths?.length?a.visitMonths:[a.date]).filter(Boolean))].sort();
const dateRange=a=>{
 const months=visits(a),format=m=>m.replace(/-0?/,'.');
 return months.length>1?format(months[0])+' – '+format(months.at(-1)):months.length?format(months[0]):'';
};
let diaryCountry=diaryQuery.get('country')||'',diaryCity=diaryQuery.get('city')||'',diaryText=diaryQuery.get('q')||'';
function toggleMedia(key,id){
 refreshPassport();
 const previous=state[key];
 state[key]=previous.includes(id)?previous.filter(x=>x!==id):[...previous,id];
 if(!save()){state[key]=previous;return false}
 return true;
}
function mediaHeart(attribute,id,on,label){
 return `<button type="button" class="media-heart" ${attribute}="${esc(id)}" aria-pressed="${on}" aria-label="${esc(label)}" title="${esc(label)}"><span aria-hidden="true">${on?'♥':'♡'}</span></button>`;
}
function diaryGrid(){
 const query=normalizeText(diaryText);
 const items=albums().flatMap(a=>{
  const country=by(a.countryId);
  if(!a.photos.length||diaryCountry&&country.id!==diaryCountry||diaryCity&&a.cityKey!==diaryCity)return [];
  const whole=!query||normalizeText([country.ja,country.en,a.cityJa,a.cityEn,a.title,a.titleEn,...visits(a),dateRange(a)].join(' ')).includes(query);
  const matches=a.photos.map((p,i)=>({p,i})).filter(({p})=>whole||normalizeText([p.alt,p.altEn,p.caption,p.captionEn,p.place,p.placeEn,...(p.tags||[])].join(' ')).includes(query));
  if(!matches.length)return [];
  const cover=whole?a.cover:matches[0].p.src, start=whole?Math.max(0,a.photos.findIndex(p=>p.src===cover)):matches[0].i;
  const previews=matches.filter(({p})=>p.src!==cover).slice(0,2);
  return [`<article class="album-print"><button type="button" class="album-open" data-album="${esc(a.id)}" data-photo-index="${start}" aria-label="${esc(t(a.title,a.titleEn))}"><span class="album-window"><img src="${esc(cover)}" alt="${esc(t(a.photos.find(p=>p.src===cover)?.alt||'',a.photos.find(p=>p.src===cover)?.altEn||''))}"><span class="album-count">${whole?a.photos.length:matches.length} ${t('枚','photos')}</span></span><span class="album-caption"><small>${esc(country.en)} · ${esc(dateRange(a))}</small><strong lang="en">${esc(a.cityEn)}</strong><span>${esc(t(a.title,a.titleEn))}</span></span></button>${mediaHeart('data-bookmark-album',a.id,state.albumIds.includes(a.id),t(a.cityJa+'のアルバムを保存',a.cityEn+' · Save album'))}${previews.length?`<div class="album-peeks">${previews.map(({p,i})=>`<button data-album="${esc(a.id)}" data-photo-index="${i}"><img src="${esc(p.src)}" alt="${esc(t(p.alt,p.altEn))}" loading="lazy"></button>`).join('')}</div>`:''}</article>`];
 });
 return items.length?`<div class="album-shelf">${items.join('')}</div>`:`<div class="collection-empty"><p>${t('この条件に合う写真はありません。','No photos match this search.')}</p><button class="jewel-action" data-reset-diary>${t('すべてのアルバムへ','Show all albums')}</button></div>`;
}
function diaryCityOptions(){
 return '<option value="">'+t('すべての都市','All cities')+'</option>'+albums().filter(a=>!diaryCountry||a.countryId===diaryCountry).filter((a,i,rows)=>rows.findIndex(b=>b.cityKey===a.cityKey)===i).map(a=>`<option value="${esc(a.cityKey)}" ${a.cityKey===diaryCity?'selected':''}>${esc(albumCity(a))}</option>`).join('');
}
function crystalDiary(){
 const countries=[...new Set(albums().map(a=>a.countryId))].map(by);
 return `${collectionHero('diary','Travel Diary')}<section class="collection-page diary-page album-gallery-page"><form class="album-filters" id="album-search" role="search"><label><span class="sr-only">${t('国・都市・スポットで検索','Search countries, cities or places')}</span><input type="search" name="q" value="${esc(diaryText)}" placeholder="${t('街やスポットを検索…','Find a city or a spot…')}"></label><select name="country" aria-label="${t('国','Country')}"><option value="">${t('すべての国','All countries')}</option>${countries.map(d=>`<option value="${esc(d.id)}" ${diaryCountry===d.id?'selected':''}>${esc(name(d))}</option>`).join('')}</select><select name="city" aria-label="${t('都市','City')}">${diaryCityOptions()}</select></form><div id="collection-diary-results">${diaryGrid()}</div></section>`;
}
function bindCrystalDiary(){
 if(diaryQuery.get('view')==='favorites'){goToSaved();return}
 const form=document.getElementById('album-search'),area=document.getElementById('collection-diary-results');
 function draw(){area.innerHTML=diaryGrid()}
 function sync(){
  const url=new URL(location.href);url.searchParams.delete('view');
  for(const [k,v] of [['country',diaryCountry],['city',diaryCity],['q',diaryText]]){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k)}
  history.replaceState(null,'',url);draw();
 }
 form.onsubmit=e=>{e.preventDefault();sync()};
 form.elements.q.oninput=e=>{diaryText=e.target.value;sync()};
 form.elements.country.onchange=e=>{diaryCountry=e.target.value;diaryCity='';form.elements.city.innerHTML=diaryCityOptions();sync()};
 form.elements.city.onchange=e=>{diaryCity=e.target.value;sync()};
 area.onclick=e=>{
  const button=e.target.closest('[data-bookmark-album]');
  if(button&&toggleMedia('albumIds',button.dataset.bookmarkAlbum)){
    const on=state.albumIds.includes(button.dataset.bookmarkAlbum);button.setAttribute('aria-pressed',String(on));button.firstElementChild.textContent=on?'♥':'♡';track('album_save',button.dataset.bookmarkAlbum);
  }
  if(e.target.closest('[data-reset-diary]')){diaryCity=diaryCountry=diaryText='';form.elements.q.value='';form.elements.country.value='';form.elements.city.innerHTML=diaryCityOptions();sync()}
 };
 window.addEventListener('torami-passport-change',draw);
 window.addEventListener('pageshow',()=>{refreshPassport();draw()});
}
function goToSaved(){
 const url=new URL('my-trip.html',location.href);if(lang==='en')url.searchParams.set('lang','en');url.hash='saved';location.replace(url.href);
}

const mapLayers=[['visited','✈','訪問済み','Visited'],['favorite','♡','お気に入り','Favorites'],['wanted','☆','行きたい','Bucket List']];
let visibleLayers=['visited'];
function mapLists(){return {visited:new Set(state.visited.filter(id=>all.some(d=>d.id===id))),favorite:new Set(fav().filter(id=>all.some(d=>d.id===id))),wanted:new Set(state.wanted.filter(id=>all.some(d=>d.id===id)))}}
function myMap(){
 const lists=mapLists();
 
 return `${chapter('My Travel Map',t('わたしの世界地図','My world map'))}<p class="trip-hint">${t('国を選んで、訪問済み・お気に入り・行きたいを登録。訪問済みにするとスタンプが増えます。','Choose a country to mark it. Each visit adds a passport stamp.')}</p><div class="glass-ribbon map-modes">${mapLayers.map(([k,icon,ja,en])=>`<button data-only-layer="${k}" aria-pressed="${visibleLayers.length===1&&visibleLayers[0]===k}"><i>${icon}</i><span>${t(ja,en)}<small>${en}</small></span></button>`).join('')}</div><div class="map-layout"><section><div class="map-viewport own-map" id="own-map">${crystalMap().replace('<pattern id="gem-art"',`<pattern id="my-sky" width="1000" height="750" patternUnits="userSpaceOnUse"><image href="assets/img/collection/sky.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern><pattern id="my-purple" width="1000" height="750" patternUnits="userSpaceOnUse"><image href="assets/img/collection/purple.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern><pattern id="gem-art"`)}</div><div class="map-actions">${mapZoomControls()}<select aria-label="${t('国名で選ぶ','Choose country')}" id="my-country">${options()}</select></div></section></div><div class="diary-totals">${mapLayers.map(([k,i,ja,en])=>`<span>${i} ${t(ja,en)} <b>${lists[k].size}</b></span>`).join('')}<span><b>${Math.round(100*lists.visited.size/all.length)}%</b></span></div><div class="map-actions"><button class="jewel-action" id="map-export">${t('地図を画像で保存','Save map image')} ↓</button></div>${visitStamps()}`;
}
function paintMyMap(){
 const view=document.getElementById('own-map'),lists=mapLists();
 for(const el of view.querySelectorAll('[data-map-country]')){const active=visibleLayers.find(k=>lists[k].has(el.dataset.mapCountry));el.dataset.stone=active||'pearl'}
 document.querySelectorAll('[data-only-layer]').forEach(b=>b.setAttribute('aria-pressed',String(visibleLayers.length===1&&visibleLayers[0]===b.dataset.onlyLayer)));
}
let pendingMapCountry=new URLSearchParams(location.search).get('country');
function bindMyMap(){
 const view=document.getElementById('own-map');paintMyMap();bindMapZoom(view);
 document.querySelectorAll('[data-only-layer]').forEach(b=>b.onclick=()=>{visibleLayers=[b.dataset.onlyLayer];paintMyMap()});
 const choose=(id,trigger)=>{const d=by(id);if(!d)return;const lists=mapLists();openDialog(`<p class="eyebrow">MY TRAVEL MAP</p><h2>${esc(name(d))}</h2><div class="map-choices">${mapLayers.map(([k,i,ja,en])=>`<button data-mark="${k}" aria-pressed="${lists[k].has(id)}">${i} ${t(ja,en)} ${lists[k].has(id)?'✓':'＋'}</button>`).join('')}</div><a href="${href(d)}">${t('国別ガイド','Destination guide')} ↗</a>`,trigger);
 document.querySelectorAll('[data-mark]').forEach(b=>b.onclick=()=>{const k=b.dataset.mark,on=mapLists()[k].has(id);if(k==='favorite'){if(!C.toggleFavorite(id))return}else if(!setPassportStatus(id,on?(k==='visited'?'unvisit':'unwant'):k))return;
 if(!on)visibleLayers=[k];document.getElementById('travel-dialog').close();showTrip();track('map_record',k)})};
 view.onclick=e=>{const el=e.target.closest('[data-map-country]');if(el)choose(el.dataset.mapCountry,el)};view.onkeydown=e=>{const el=e.target.closest('[data-map-country]');if(el&&['Enter',' '].includes(e.key)){e.preventDefault();choose(el.dataset.mapCountry,el)}};
 const picker=document.querySelector('#my-country');
 picker.onchange=e=>{choose(e.target.value,e.target);e.target.value=''};
 if(pendingMapCountry&&by(pendingMapCountry)&&location.hash!=='#planner'){const id=pendingMapCountry;pendingMapCountry='';choose(id,picker)}
 document.querySelector('#map-export').onclick=async e=>{const button=e.currentTarget;button.disabled=true;try{await exportMyMap()}catch{button.textContent=t('画像を保存できませんでした。再試行','Could not save. Try again')}finally{button.disabled=false}};
}
async function exportMyMap(){
 const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1050;const ctx=canvas.getContext('2d');
 const list=mapLists(),art={pearl:'crystal-6',visited:'collection/purple',favorite:'world-map-jewels',wanted:'collection/sky'};
 const images=Object.fromEntries(await Promise.all(Object.entries(art).map(async([k,file])=>{const img=new Image();img.src='assets/img/'+file+'.webp';await img.decode();return [k,img]})));
 const bg=ctx.createLinearGradient(0,0,1400,1050);bg.addColorStop(0,'#a4e1e5');bg.addColorStop(.48,'#f0ffff');bg.addColorStop(1,'#a6dfe4');ctx.fillStyle=bg;ctx.fillRect(0,0,1400,1050);
 ctx.textAlign='center';ctx.fillStyle='#164f59';ctx.font='27px Georgia';ctx.fillText('T O R A M I   T R A V E L',700,72);ctx.font='italic 68px Georgia';ctx.fillText('My Travel Map',700,154);
 ctx.save();ctx.translate(20,65);ctx.scale(1.36,1.36);
 for(const shape of window.TORAMI_JEWEL_COUNTRIES){const id=by(shape.code)?.id,k=visibleLayers.find(key=>list[key].has(id))||'pearl',path=shape.point?new Path2D():new Path2D(shape.d);if(shape.point)path.arc(...shape.point,1.12,0,Math.PI*2);ctx.save();ctx.clip(path,'evenodd');ctx.drawImage(images[k],0,90,1000,591);ctx.restore();ctx.strokeStyle='#bf9d60';ctx.lineWidth=.65;ctx.stroke(path)}
 ctx.restore();ctx.font='28px Georgia';ctx.fillText(mapLayers.map(([k,,,en])=>en+'  '+list[k].size).join('     ·     '),700,997);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error();download(blob,'TORAMI-My-Travel-Map.png');
}
const rankGroups = [
  ['month','✧','旅先ランキング','Travel Stats','arrivals'],
  ['budget','◇','旅の予算','Budget','dailyCost'],
  ['photos','▧','写真映え','Photogenic','photo'],
  ['editor','☆','トラみの本音',"Editor’s Picks",'overall']
];
const rankCategories = [
  ['popular','人気','Popular','arrivals'], ['scenic','絶景','Scenic Views','scenic'],
  ['photo','フォトスポット','Photo Spots','photo'], ['sunset','サンセット','Sunsets','sunset'],
  ['food','カフェ・グルメ','Cafés & Food','foodPhotos'], ['hotel','ホテル','Hotels','hotel'],
  ['shopping','ショッピング','Shopping','shopping'], ['night','夜景','Night Views','night'],
  ['beach','ビーチ','Beaches','beach'], ['hidden','穴場','Hidden Gems','hidden']
];
const rankPhotoMetrics=['photo','scenic','sunset','foodPhotos','shopping','night','beach'];
const rankOpinionLabels={overall:['おすすめ度','Overall'],scenery:['景色','Scenery'],food:['食事','Food'],solo:['ひとり旅','Solo travel'],value:['コスパ','Value'],return:['もう一度行きたい','Return visits'],city:['街並み','Cityscape'],nature:['自然','Nature'],resort:['リゾート','Resorts'],hidden:['穴場','Hidden gems'],hotel:['ホテル','Hotels']};
const rankStatLabels={rain:['降水量の少ない旅先','Low rainfall'],arrivals:['国際観光客到着数','Tourist arrivals'],dailyCost:['現地予算／日','Daily budget'],population:['人口','Population']};
const knownRankKeys=new Set([...Object.keys(rankStatLabels),...rankPhotoMetrics,...Object.keys(rankOpinionLabels)]);
const rankParams=new URLSearchParams(location.search);
let rankKey=knownRankKeys.has(rankParams.get('type'))?rankParams.get('type'):'arrivals';
let rankCountry='',rankCity='',rankRegion='',rankText='',rankOrder='default',rankAll=false;
const rankMonth=new Date().getMonth();
function rankYears(key){
 return [...new Set(all.flatMap(d=>key==='arrivals'?[d.arrivalsLast?.[0],d.arrivals2019>0?'2019':null]:key==='population'?[d.population?.[0]]:[]).filter(Boolean).map(String))].sort().reverse();
}
let statYear=rankYears(rankKey)[0]||'';
function rankGroup(){
 if(rankKey==='dailyCost')return 'budget';
 if(rankPhotoMetrics.includes(rankKey))return 'photos';
 return rankOpinionLabels[rankKey]?'editor':'month';
}
const rankCityName=a=>t(a.cityJa||a.cityId,a.cityEn||a.cityId);
const rankAlbumLink=a=>'diary.html?country='+encodeURIComponent(a.countryId)+'&city='+encodeURIComponent(a.cityKey);
function rankHeading(){
 if(rankKey==='rain')return t((rankMonth+1)+'月の旅先',new Intl.DateTimeFormat('en',{month:'long'}).format(new Date(2020,rankMonth,1))+' destinations');
 const labels=rankStatLabels[rankKey]||rankOpinionLabels[rankKey];
 if(labels)return t(...labels);
 const cat=rankCategories.find(item=>item[3]===rankKey);return t(cat[1]+'の旅先',cat[2]);
}
function rankBasis(){
 if(rankKey==='rain')return t('代表都市の平年降水量が少ない順 · WorldClim 1970–2000','Mean rainfall at the featured city · WorldClim 1970–2000');
 if(rankKey==='dailyCost')return t('1人1日あたりの費用が低い順 · 固定レートの円換算','Lower daily costs per person · fixed JPY conversion');
 if(rankKey==='arrivals'||rankKey==='population')return statYear+t('年・同じ年の収録値を比較',' · same-year observations');
 if(rankPhotoMetrics.includes(rankKey))return t('トラみ撮影 · 該当する掲載写真の枚数順','TORAMI albums · ranked by matching published photos');
 return t('トラみの訪問先・入力済みの体験評価順','Visited destinations · scored by TORAMI');
}
function matchRankPhoto(p){
 const tags=p.tags||[],caption=[p.caption,p.captionEn,p.alt,p.altEn].join(' ');
 if(rankKey==='sunset')return /夕暮|夕日|夕焼|sunset|dusk/i.test(caption)||tags.includes('sunset');
 if(rankKey==='night')return /ネオン|夜景|night|neon/i.test(caption)||tags.includes('night');
 return rankKey==='photo'||tags.includes(rankKey==='foodPhotos'?'food':rankKey);
}
function hasRankText(values){return !rankText||normalizeText(values.join(' ')).includes(normalizeText(rankText))}
function rankRows(){
 const catalog=albums(),rows=[];
 if(rankPhotoMetrics.includes(rankKey)){
  for(const a of catalog){const d=by(a.countryId);if(!d||rankCountry&&d.id!==rankCountry||rankCity&&a.cityKey!==rankCity||rankRegion&&d.region!==rankRegion)continue;
   const photos=a.photos.filter(matchRankPhoto),mainMatch=hasRankText([d.ja,d.en,a.cityJa,a.cityEn,a.title,a.titleEn]);
   const found=mainMatch?photos:photos.filter(p=>hasRankText([p.alt,p.caption,p.altEn,p.captionEn,...(p.tags||[])]));if(!found.length)continue;
   rows.push({d,a,value:found.length,ja:a.cityJa,en:a.cityEn,src:found[0].src,url:rankAlbumLink(a),sub:name(d)});
  }
 }else{
  for(const d of all){
   if(rankCountry&&rankCountry!==d.id||rankRegion&&rankRegion!==d.region)continue;
   const cityAlbums=catalog.filter(a=>a.countryId===d.id&&(!rankCity||rankCity===a.cityKey));
   if(rankCity&&!cityAlbums.length)continue;
   if(!hasRankText([d.ja,d.en,...cityAlbums.flatMap(a=>[a.cityJa,a.cityEn])]))continue;
   let value=null;
   if(rankKey==='rain')value=d.climate?.rain?.[rankMonth];
   else if(rankKey==='arrivals')value=String(d.arrivalsLast?.[0])===statYear?d.arrivalsLast[1]:statYear==='2019'?d.arrivals2019:null;
   else if(rankKey==='population')value=String(d.population?.[0])===statYear?d.population[1]:null;
   else if(rankKey==='dailyCost')value=d.budget?.status!=='review'&&d.budget?.currency==='JPY'?d.budget.daily:null;
   else if(d.visited)value=d.ratings?.[rankKey];
   if(!Number.isFinite(value)||value<0||value===0&&rankKey!=='rain')continue;
   rows.push({d,value,ja:d.ja,en:d.en,src:'assets/img/'+d.image,url:href(d),sub:rankKey==='rain'?d.climate.place:''});
  }
 }
 const asc=['rain','dailyCost'].includes(rankKey);
 rows.sort((a,b)=>(a.value-b.value)*(asc?1:-1)||a.en.localeCompare(b.en));
 let rank=0;rows.forEach((row,i)=>{if(!i||row.value!==rows[i-1].value)rank=i+1;row.rank=rank});
 if(rankOrder==='reverse')rows.reverse();
 return rows;
}
function rankDisplay(n){
 if(rankKey==='arrivals'||rankKey==='population')return compactCount(n,rankKey==='population');
 if(rankKey==='dailyCost')return lang!=='en'&&n>=10000?'約'+Number((n/10000).toFixed(1))+'万円':'¥'+n.toLocaleString();
 if(rankKey==='rain')return n+' mm';
 return rankPhotoMetrics.includes(rankKey)?n+t('枚',' photos'):n+' / 5';
}
function rankCard(r,i,podium){
 const isSaved=r.a?state.albumIds.includes(r.a.id):fav().includes(r.d.id);
 const label=t(r.ja,r.en),small=lang==='en'?(r.sub||''):r.en;
 return `<article class="${podium?'podium-card pos-'+i:'rank-postcard'}"><a class="rank-image-link" href="${esc(r.url)}"><img src="${esc(r.src)}" alt="" loading="${podium?'eager':'lazy'}"><span class="rank-ink"><strong>${esc(label)}</strong><small>${esc(small)}</small></span></a><b class="medal">${r.rank}</b><footer><span>${esc(rankDisplay(r.value))}</span><button class="rank-bookmark" ${r.a?'data-rank-album="'+esc(r.a.id)+'"':'data-rank-save="'+esc(r.d.id)+'"'} aria-pressed="${isSaved}" aria-label="${esc(label+' '+t('を保存','bookmark'))}">${isSaved?'♥':'♡'}</button></footer></article>`;
}
function rankEmpty(){
 if(rankGroup()==='editor'&&!all.some(d=>d.visited&&d.ratings?.[rankKey]>0)){
  if(rankKey==='hotel')return `<p>${t('宿泊レビューはまだありません。宿探しには公式ガイドをどうぞ。','Hotel reviews are coming. Browse the official hotel guides.')}</p>${Object.entries(D.cityResources||{}).filter(([city])=>!rankCity||rankCity===city).filter(([city])=>!rankCountry||albums().some(a=>a.cityKey===city&&a.countryId===rankCountry)).flatMap(([,links])=>links.filter(l=>l.kind==='hotel')).map(l=>`<a class="jewel-action" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(t(l.ja,l.en))} ↗</a>`).join(' ')}`;
  return `<p>${t('このテーマの体験評価はまだありません。写真で旅先を見てみる。','There are no personal scores for this theme yet. Explore TORAMI’s photos.')}</p><a class="jewel-action" href="diary.html">${t('旅のアルバムへ','Explore albums')} ↗</a>`;
 }
 return `<p>${t('この条件に合う旅先はありません。','No destinations match these filters.')}</p><button class="jewel-action" data-rank-reset>${t('条件をクリア','Clear filters')}</button>`;
}
function rankCategoriesHTML(){
 return `<section class="ranking-categories">${chapter('Ranking Categories',t('ランキングカテゴリー','Ranking categories'))}<div>${rankCategories.map(([key,ja,en,metric])=>`<button data-rank-shortcut="${metric}" aria-pressed="${metric===rankKey}"><img src="assets/img/collection/rank-${key}.webp" alt="" loading="lazy"><span>${t(ja,en)}<small>${lang==='ja'?en:''}</small></span></button>`).join('')}</div></section>`;
}
function collectionRankResults(){
 const rows=rankRows(),first=rows.slice(0,3),rest=rows.slice(3,rankAll?undefined:10);
 const topText=rows.length>=3&&rankOrder==='default'?' TOP 3':'';
 return `<section class="rank-lead">${chapter('Travel Ranking',rankHeading()+topText)}<p class="rank-scope">${esc(rankBasis())} · ${rows.length}${t('件',' results')}</p>${rows.length?`<div class="podium">${first.map((r,i)=>rankCard(r,i,true)).join('')}</div>`:`<div class="collection-empty crystal-panel">${rankEmpty()}</div>`}</section>${rankCategoriesHTML()}${rest.length?`<section class="crystal-panel rank-continuation"><header><h3>${esc(rankHeading())}</h3>${rows.length>10?`<button id="rank-more" class="jewel-action">${rankAll?t('10位までに戻す','Show ten'):t('もっと見る','Show more')} ↗</button>`:''}</header><div class="rank-rail"><button data-rank-scroll="-1" aria-label="${t('前へ','Previous')}">‹</button><div class="rank-gallery">${rest.map((r,i)=>rankCard(r,i,false)).join('')}</div><button data-rank-scroll="1" aria-label="${t('次へ','Next')}">›</button></div></section>`:''}`;
}
function rankTools(){
 const cityAlbums=albums().filter(a=>!rankCountry||a.countryId===rankCountry);
 const cities=[...new Map(cityAlbums.map(a=>[a.cityKey,a])).values()];
 const yearOptions=rankYears(rankKey),stats=Object.entries(rankStatLabels),opinion=Object.entries(rankOpinionLabels).filter(([key])=>key===rankKey||key==='overall'||all.some(d=>d.visited&&d.ratings?.[key]>0));
 const group=rankGroup(),metrics=group==='month'?stats:group==='editor'?opinion:[];
 const selected=(v,cur)=>v===cur?' selected':'';
 return `<div class="rank-picker-pair"><label>⌖ <select id="rank-country" aria-label="${t('国を選ぶ','Select country')}">${options(rankCountry).replace(t('国・地域を選ぶ','Choose a destination'),t('国を選ぶ','Select country'))}</select></label><label>⌂ <select id="rank-city" aria-label="${t('都市を選ぶ','Select city')}"><option value="">${t('都市を選ぶ','Select city')}</option>${cities.map(a=>`<option value="${esc(a.cityKey)}"${selected(a.cityKey,rankCity)}>${esc(rankCityName(a))}</option>`).join('')}</select></label></div><div class="rank-more-filters" id="rank-extra" hidden>${metrics.length?`<label>${t('比較項目','Measure')}<select id="rank-metric">${metrics.map(([id,pair])=>`<option value="${id}"${selected(id,rankKey)}>${t(...pair)}</option>`).join('')}</select></label>`:''}${yearOptions.length?`<label>${t('統計年','Year')}<select id="rank-year">${yearOptions.map(y=>`<option${selected(y,statYear)}>${y}</option>`).join('')}</select></label>`:''}<label>${t('地域','Region')}<select id="rank-region">${regionOptions()}</select></label><label>${t('並び順','Sort')}<select id="rank-order"><option value="default">${t('上位から','Highest rank first')}</option><option value="reverse"${selected('reverse',rankOrder)}>${t('下位から','Lowest rank first')}</option></select></label></div>`;
}
function collectionRank(){
 return `${collectionHero('rank','Travel Ranking')}<div class="collection-page rank-page"><nav class="glass-ribbon rank-sections" aria-label="Travel Ranking">${rankGroups.map(([id,icon,ja,en,key])=>`<button data-rank="${key}" data-rank-group="${id}" aria-pressed="${rankGroup()===id}"><i aria-hidden="true">${icon}</i><span>${t(ja,en)}<small>${lang==='ja'?en:''}</small></span></button>`).join('')}</nav><div class="rank-find"><form class="collection-search" id="rank-search" role="search"><span aria-hidden="true">⌕</span><input type="search" name="q" aria-label="${t('国・都市・キーワードを検索','Search destinations')}" placeholder="${t('国・都市・キーワードで検索…','Country, city or keyword…')}"><button>${t('検索','Search')}</button></form><button id="rank-filter-toggle" aria-controls="rank-extra" aria-expanded="false">☷ <span>${t('絞り込み','Filters')}</span></button></div><div id="collection-rank-tools">${rankTools()}</div><div id="ranking-results">${collectionRankResults()}</div></div>`;
}
function bindRank(){
 if(rankParams.get('type')==='saved'){goToSaved();return}
 const pageEl=document.querySelector('.rank-page'),panel=document.querySelector('#ranking-results'),filters=document.querySelector('#collection-rank-tools'),extraButton=document.querySelector('#rank-filter-toggle'),form=document.querySelector('#rank-search');
 const draw=()=>{panel.innerHTML=collectionRankResults()};
 function drawFilters(){
  filters.innerHTML=rankTools();filters.querySelector('#rank-region').value=rankRegion;filters.querySelector('#rank-extra').hidden=extraButton.getAttribute('aria-expanded')!=='true';
 }
 function choose(key){
  if(!knownRankKeys.has(key))return;
  rankKey=key;statYear=rankYears(key)[0]||'';rankAll=false;
  if(rankGroup()!=='photos')rankCity='';
  const url=new URL(location.href);url.searchParams.set('type',key);history.replaceState(null,'',url);
  pageEl.querySelectorAll('[data-rank-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rankGroup===rankGroup())));drawFilters();draw();track('ranking',key);
 }
 pageEl.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.dataset.rank||btn.dataset.rankShortcut){choose(btn.dataset.rank||btn.dataset.rankShortcut);if(btn.dataset.rankShortcut)panel.scrollIntoView({block:'start'});return}
  if(btn===extraButton){const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));filters.querySelector('#rank-extra').hidden=!open;return}
  if(btn.id==='rank-more'){rankAll=!rankAll;draw();if(rankAll)panel.querySelectorAll('.rank-postcard .rank-image-link')[7]?.focus();return}
  if(btn.dataset.rankScroll){const rail=btn.parentElement.querySelector('.rank-gallery');rail.scrollBy({left:Number(btn.dataset.rankScroll)*rail.clientWidth*.8,behavior:'smooth'});return}
  if(btn.hasAttribute('data-rank-reset')){rankCountry=rankCity=rankRegion=rankText='';rankAll=false;form.elements.q.value='';drawFilters();draw();return}
  if(btn.dataset.rankSave){if(C.toggleFavorite(btn.dataset.rankSave))draw();return}
  if(btn.dataset.rankAlbum&&toggleMedia('albumIds',btn.dataset.rankAlbum))draw()
 });
 const search=()=>{rankText=form.elements.q.value;rankAll=false;draw()};form.onsubmit=e=>{e.preventDefault();search()};form.oninput=search;
 filters.onchange=e=>{const id=e.target.id,value=e.target.value;rankAll=false;
  if(id==='rank-metric'){choose(value);return}
  if(id==='rank-country'){rankCountry=value;rankCity='';drawFilters()}
  if(id==='rank-city'){rankCity=value;if(value){rankCountry=albums().find(a=>a.cityKey===value)?.countryId||'';if(rankGroup()!=='photos'){choose('photo');return}}drawFilters()}
  if(id==='rank-year')statYear=value;
  if(id==='rank-region')rankRegion=value;
  if(id==='rank-order')rankOrder=value;
  draw();
 };
 window.addEventListener('pageshow',()=>{refreshPassport();draw()});
 window.addEventListener('storage',e=>{if(!e.key||e.key==='torami-my-trip'||e.key==='torami-saved'){refreshPassport();draw()}});
}

function mytrip(){return `${collectionHero('trip','My Trip')}<section class="collection-page trip-page"><nav class="glass-ribbon trip-tabs" role="tablist">${[[4,'♢','My Map','わたしの地図'],[2,'♡','Saved','保存したもの'],[3,'▦','Planner','旅の計画']].map(([n,i,en,ja])=>`<button role="tab" data-trip-tab="${n}" aria-selected="${n===tripTab}"><i>${i}</i><span>${lang==='en'?en:ja}${lang==='ja'?`<small>${en}</small>`:''}</span></button>`).join('')}</nav><div id="trip-panel">${tripTab===4?myMap():''}</div><p class="storage-note">${t('このブラウザに保存されます。端末の変更にはバックアップをご利用ください。','Saved in this browser. Export a backup to switch devices.')}</p><div class="backup-bar glass"><button class="button soft" id="backup-download">${t('バックアップを保存','Export backup')}</button><label class="button soft">${t('バックアップを復元','Import backup')}<input type="file" id="backup-import" accept="application/json" class="sr-only"></label><p id="backup-status" role="status"></p></div></section>`}
function savedCollection(){
 const groups=[];
 const places=fav().map(by).filter(Boolean);
 const countryCards=places.map(d=>savedTile(name(d),t(d.en,d.region),href(d),'assets/img/'+d.image,mediaHeart('data-remove-place',d.id,true,t('旅先の保存を解除','Unsave destination'))));
 const albumCards=[],photoCards=[];
 for(const a of albums()){
  if(state.albumIds.includes(a.id))albumCards.push(savedTile(t(a.title,a.titleEn),a.cityEn,'',a.cover,mediaHeart('data-remove-album',a.id,true,t('アルバムの保存を解除','Unsave album')),a.id,0));
  a.photos.forEach((p,i)=>{
   const key=a.id+'/'+p.id;
   if(state.photoIds.includes(key))photoCards.push(savedTile(t(p.caption,p.captionEn),a.cityEn,'',p.src,mediaHeart('data-remove-photo',key,true,t('写真の保存を解除','Unlike photo')),a.id,i));
  });
 }
 for(const [title,cards] of [[t('旅先','Destinations'),countryCards],[t('アルバム','Albums'),albumCards],[t('いいねした写真','Liked photos'),photoCards]]){
  if(cards.length)groups.push(`<section class="saved-group"><h3>${title} <small>${cards.length}</small></h3><div class="save-grid">${cards.join('')}</div></section>`);
 }
 return `<section class="saved-collection">${chapter('Saved',t('保存したもの','Your collection'))}${groups.join('')||`<div class="crystal-panel saved-empty"><p>${t('旅先・アルバム・写真の ♡ を押すと、ここに集まります。','Tap the heart on a destination, album or photo to keep it here.')}</p><a class="jewel-action" href="diary.html">${t('写真を見に行く','Browse the diary')} ↗</a></div>`}</section>`;
}
function savedTile(label,sub,url,src,button,album='',index=0){
 const inner=`<img src="${esc(src)}" alt="" loading="lazy"><span><small>${esc(sub)}</small><strong>${esc(label)}</strong></span>`;
 const item=url?`<a class="saved-item" href="${esc(url)}">${inner}</a>`:`<button class="saved-item" data-album="${esc(album)}" data-photo-index="${index}">${inner}</button>`;
 return `<article class="saved-tile">${item}${button}</article>`;
}
function bindSaved(){
 const panel=document.getElementById('trip-panel');
 panel.querySelectorAll('[data-remove-place],[data-remove-album],[data-remove-photo]').forEach(b=>b.onclick=()=>{
  const ok=b.hasAttribute('data-remove-place')?C.toggleFavorite(b.dataset.removePlace):b.hasAttribute('data-remove-album')?toggleMedia('albumIds',b.dataset.removeAlbum):toggleMedia('photoIds',b.dataset.removePhoto);
  if(ok)showTrip();
 });
}
function visitStamps(){
 const list=all.filter(d=>state.visited.includes(d.id)).sort((a,b)=>name(a).localeCompare(name(b),lang));
 return `<details class="crystal-panel travel-stamps" ${location.hash==='#passport'?'open':''}><summary>Passport · ${t('訪問スタンプ','Travel stamps')} <b>${list.length} / ${all.length}</b></summary>${list.length?`<div class="stamp-book">${list.map(d=>`<a class="visit-stamp" href="${href(d)}">${photo(d)}<span>${esc(name(d))}</span></a>`).join('')}</div><button class="button soft" data-result-image="passport">${t('パスポート画像を保存','Save passport image')} ↓</button>`:`<p>${t('地図で訪問済みにした国が並びます。','Mark a country as visited on the map to collect its stamp.')}</p>`}</details>`;
}

function bucket(){return `<form id="bucket-form" class="feature-form glass"><label>${t('行きたい国・地域','Destination')}<select name="country">${options()}</select></label><label>${t('叶えたいこと','A place or experience')}<input name="title" maxlength="140" placeholder="${t('例：北欧でオーロラを見る','For example: see the northern lights')}" required></label><button class="button">${t('追加','Add')}</button></form><div class="bucket-list">${state.bucket.map(b=>`<article class="glass bucket-row"><input type="checkbox" data-bucket-done="${esc(b.id)}" ${b.done?'checked':''} aria-label="${t('達成','Completed')}"><div><strong>${esc(b.title)}</strong><p>${esc(by(b.country)?name(by(b.country)):'')}</p></div><button class="text-button" data-bucket-edit="${esc(b.id)}">${t('編集','Edit')}</button><button class="text-button" data-bucket-remove="${esc(b.id)}">×</button></article>`).join('')||missing('次の旅で、叶えたいこと。','What would you love to do?')}</div><p>${state.bucket.filter(b=>b.done).length} / ${state.bucket.length} · ${state.bucket.length?Math.round(state.bucket.filter(b=>b.done).length/state.bucket.length*100):0}%</p>`}
const costs=[['flight','航空券','Flights'],['hotel','ホテル','Hotels'],['food','食費','Food'],['transport','交通費','Transport'],['activities','観光費','Activities'],['other','その他','Other']];
let activeTrip=state.trips[0]?.id||'';
function planner(){const p=state.trips.find(x=>x.id===activeTrip);return `<div class="feature-form glass"><label>${t('保存した旅行','Saved trips')}<select id="trip-select"><option value="">${t('旅行を選ぶ','Choose a trip')}</option>${state.trips.map(x=>`<option value="${esc(x.id)}" ${x.id===activeTrip?'selected':''}>${esc(x.title)}</option>`).join('')}</select></label><button class="button" id="trip-new">${t('新しい旅行','New trip')}</button></div>${p?`<form id="planner-form" class="glass planner-form"><div class="feature-form"><label>${t('旅行名','Trip name')}<input name="title" required value="${esc(p.title)}" maxlength="100"></label><label>${t('旅行先','Destination')}<select name="country">${options(p.country)}</select></label><label>${t('出発日','Departure')}<input type="date" name="start" value="${esc(p.start)}"></label><label>${t('帰国日','Return')}<input type="date" name="end" value="${esc(p.end)}"></label></div><h3>${t('日別の予定','Daily itinerary')}</h3><div id="itinerary-rows">${(p.days||[]).map((d,i)=>`<div class="itinerary-row"><input type="date" data-day-date="${i}" value="${esc(d.date)}" aria-label="${t('日付','Date')}"><textarea data-day-note="${i}" aria-label="${t('予定','Plan')}" maxlength="3000">${esc(d.note)}</textarea><button type="button" data-day-remove="${i}">×</button></div>`).join('')}</div><button type="button" class="text-button" id="day-add">＋ ${t('予定を追加','Add a day')}</button><h3>${t('予算（日本円・旅行全体）','Budget · JPY for the whole trip')}</h3><div class="budget-inputs">${costs.map(([k,j,e])=>`<label>${t(j,e)}<input type="number" name="cost-${k}" min="0" max="100000000" value="${Number(p.costs?.[k])||0}"></label>`).join('')}</div><output id="trip-total"></output><div id="budget-chart"></div><h3>${t('持ち物','Packing list')}</h3><div id="packing-list">${(p.packing||[]).map((x,i)=>`<label class="packing-item"><input type="checkbox" data-pack-check="${i}" ${x.done?'checked':''}><input data-pack-text="${i}" value="${esc(x.text)}" maxlength="200" aria-label="${t('持ち物','Packing item')}"><button type="button" data-pack-remove="${i}">×</button></label>`).join('')}</div><button type="button" class="text-button" id="pack-add">＋ ${t('持ち物を追加','Add an item')}</button><div class="feature-actions"><button class="button">${t('旅行計画を保存','Save plan')}</button><button type="button" class="button soft" id="trip-print">${t('印刷・PDF保存','Print / save PDF')}</button><button type="button" class="text-button" id="trip-delete">${t('この旅行を削除','Delete trip')}</button></div><p id="planner-status" role="status"></p></form>`:missing('新しい旅の計画を。','Start planning something lovely.')}`}
const albums=()=> (window.TORAMI_ALBUMS||[]).filter(a=>a.published&&by(a.countryId));
function albumSection(country=''){const list=albums().filter(a=>!country||a.countryId===country);return `<section class="country-section photo-album-section"><p class="eyebrow">MY PHOTO ALBUM</p><h2>${t('トラみちゃんの旅のアルバム','Photographs from my travels')}</h2><p class="fine-print">${t('実際に旅先で撮影した写真をまとめています。','Original photographs taken on my travels.')}</p><div class="album-list">${list.map(albumCard).join('')||missing('アルバム準備中','The album is coming soon.')}</div></section>`}
function albumCard(a){const photos=a.photos||[],cover=a.cover||photos[0]?.src;return `<button class="album-card glass" data-album="${esc(a.id)}">${cover?`<img src="${esc(cover)}" alt="${esc(lang==='en'?a.titleEn||a.title:a.title)}" loading="lazy">`:''}<span><strong>${esc(lang==='en'?a.titleEn||a.title:a.title)}</strong><small>${esc(name(by(a.countryId)))} · ${esc(a.date||'')}</small><small>${photos.length} ${t('枚の写真','photographs')}</small></span><span>↗</span></button>`}
function diaryEnhance(){return `<section class="wrap album-directory"><form id="album-filters" class="feature-form glass"><label>${t('国・地域','Destination')}<select name="country">${options(new URLSearchParams(location.search).get('country')||'')}</select></label><label>${t('都市','City')}<input name="city" maxlength="80"></label><label>${t('旅行時期','Travel month')}<input type="month" name="month"></label></form><div id="album-results">${albumSection(new URLSearchParams(location.search).get('country')||'')}</div></section>`}
function insights(){const d=window.TORAMI_INSIGHTS||{};return `${head('TORAMI INSIGHTS',t('旅のデータで、世界をもっと身近に。','A closer look at the way we travel.'))}<section class="wrap page-body"><div class="insight-kpis">${(d.metrics||[]).length?d.metrics.map(m=>`<article class="glass"><h3>${esc(t(m.label,m.labelEn||m.label))}</h3><strong>${esc(m.value)} ${esc(m.unit||'')}</strong><p>${esc(m.period||'')}</p><small>${esc(m.definition||'')} · ${esc(m.updatedAt||'')}</small>${source(m.source)}</article>`).join(''):['Monthly Visits','Favorites','Gacha Plays'].map(x=>`<article class="glass"><p>${x}</p><strong>—</strong><small>${t('データ集計中','Collecting data')}</small></article>`).join('')}</div><div class="insight-grid">${(d.series||[]).map(s=>`<article class="glass"><h2>${esc(t(s.title,s.titleEn||s.title))}</h2>${bars(s.points||[])}<p>${esc(s.period||'')} · ${esc(s.updatedAt||'')}</p><p>${esc(s.definition||'')}</p>${source(s.source)}</article>`).join('')||['Travel Trends','Popular Regions','Seasonal Demand','Travel Costs'].map(x=>`<article class="glass"><h2>${x}</h2><div class="chart-empty">${t('データ集計中','Collecting data')}</div><p>${t('出典・対象期間・更新日・集計定義を添えて公開します。','Published with source, period, update date and metric definitions.')}</p></article>`).join('')}</div><section class="glass feature-panel"><h2>Analysis & Reports</h2>${(d.reports||[]).map(r=>`<p><a href="${safeURL(r.url)}">${esc(t(r.title,r.titleEn||r.title))} ↗</a> · ${esc(r.updatedAt||'')}</p>`).join('')||`<p>${t('分析レポートは準備中です。','Analysis reports are coming soon.')}</p>`}${(d.embeds||[]).map(e=>`<iframe class="report-embed" src="${safeURL(e.url)}" title="${esc(e.title)}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`).join('')}</section></section>`}
const safeURL=u=>{try{const x=new URL(u);return x.protocol==='https:'?esc(x.href):''}catch{return ''}};
const source=u=>safeURL(u)?`<a class="text-link" href="${safeURL(u)}" rel="noopener" target="_blank">${t('出典','Source')} ↗</a>`:'';
function bars(points){const max=Math.max(1,...points.map(p=>Number(p.value)||0));return `<div class="bar-chart">${points.map(p=>`<div><span>${esc(p.label)}</span><i style="--bar:${Math.max(0,Number(p.value)||0)/max*100}%"></i><strong>${esc(p.value)}</strong></div>`).join('')}</div>`}
function legal(kind){const entries={privacy:['Privacy',t('プライバシーについて','Privacy'),t('お気に入り、訪問記録、旅程はブラウザ内に保存します。端末間同期はありません。GoatCounterでページ閲覧と機能の利用を集計します。検索の自由入力、旅程、個人の訪問先リストは計測イベントに含めません。ブラウザ保存データはMy Tripからバックアップ・復元でき、ブラウザのサイトデータ削除で消去できます。','Favourites, visits and plans are saved in your browser without cross-device sync. GoatCounter counts page views and feature use. Search text, itineraries and personal visit lists are excluded from feature events. Back up or restore from My Trip; clear site data in your browser to remove local records.')],disclaimer:['Disclaimer',t('ご利用にあたって','Before you travel'),t('旅行情報や個人の感想は、今後の体験や安全を保証するものではありません。入国条件、治安、料金、運行情報は渡航前に公式情報をご確認ください。国別カバーは旅先のイメージ画像で、Diaryの実写写真とは区別しています。','Travel information and personal reviews do not guarantee future experiences or safety. Check official entry requirements, advisories, prices and schedules before travel. Destination covers are inspiration artwork, separate from original Diary photographs.')],contact:['Contact',t('お問い合わせ','Get in touch'),t('お問い合わせはInstagramのメッセージへ。予約手配や緊急対応は行っていません。','Please contact me through Instagram. TORAMI does not handle bookings or emergencies.')]};const [en,ja,copy]=entries[kind];return `${head(en,ja)}<section class="wrap page-body"><div class="glass feature-panel"><p>${copy}</p>${kind==='contact'?link(D.instagram,'Instagramへ','Open Instagram'):''}</div></section>`}
function enhance(html){if(page==='gacha')html=html.replace('<p class="gacha-count"',`<label>${t('国・都市','Country or city')}<select id="gacha-kind"><option value="country">${t('国・地域','Countries & regions')}</option><option value="city">${t('登録された都市','Registered cities')}</option></select></label><label>${t('現地予算／日（登録情報のみ）','Daily local budget · recorded JPY only')}<select id="gacha-budget"><option value="">${t('指定なし','Any budget')}</option><option value="10000">≤ ¥10,000</option><option value="20000">≤ ¥20,000</option><option value="40000">≤ ¥40,000</option></select></label><p class="gacha-count"`);if(page==='destinations')html=html.replace('<section class="wrap page-body">','<section class="wrap page-body">'+exploreTabs()+`<p class="insights-link"><a href="insights.html">TORAMI INSIGHTS ↗</a></p>`);if(page==='home')html+=`<section class="wrap feature-shortcuts">${link('discover.html','診断・クイズで旅を楽しむ','Discover your travel style')}${link('my-trip.html#map','わたしの地図','My travel map')}${link('insights.html','旅のデータを見る','Travel insights')}</section>`;return html}
function countryActions(d){
 const parent=d.isCity?d.parentId:d.id;
 return `<button class="button soft" data-save="${esc(d.id)}" aria-pressed="${fav().includes(d.id)}">${fav().includes(d.id)?t('♥ 保存済み','♥ Saved'):t('♡ この旅先を保存','♡ Save destination')}</button><button class="button soft" data-compare-add="${esc(d.id)}">${t('比較に追加','Compare')}</button><a class="button soft" href="my-trip.html?country=${encodeURIComponent(parent)}#map">${t('国を地図で記録','Record country on map')}</a>`;
}
function download(blob,filename){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),20000)}
async function resultImage(title,subtitle){const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const x=canvas.getContext('2d'),g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#a8e0df');g.addColorStop(1,'#edf9f3');x.fillStyle=g;x.fillRect(0,0,1080,1350);x.strokeStyle='white';x.lineWidth=4;x.strokeRect(40,40,1000,1270);const logo=new Image();logo.src='assets/img/torami-pearl.webp';await logo.decode();x.drawImage(logo,120,110,840,280);x.textAlign='center';x.fillStyle='#245562';x.font='44px Georgia';x.fillText('TRAVEL',540,420);let size=70;do{x.font=size+'px Georgia';size-=2}while(x.measureText(title).width>950);x.fillText(title,540,620);x.font='36px sans-serif';const parts=Array.from(subtitle);let line='',y=720;for(const c of parts){if(x.measureText(line+c).width>880){x.fillText(line,540,y);y+=55;line=''}line+=c}x.fillText(line,540,y);x.font='30px Georgia';x.fillText('The World is Yours.',540,1190);const b=await new Promise(r=>canvas.toBlob(r,'image/png'));if(b)download(b,'torami-result.png')}
async function featureShare(){track('share_click');try{if(navigator.share)await navigator.share({title:'TORAMI TRAVEL',url:location.href});else{await navigator.clipboard.writeText(location.href);alert(t('リンクをコピーしました。','Link copied.'))}}catch(e){if(e.name!=='AbortError')openDialog(`<input value="${esc(location.href)}" readonly aria-label="URL">`)}}
const tripFromHash=()=>({'#planner':3,'#bucket':3,'#favorites':2,'#saved':2})[location.hash]??4;
let tripTab=tripFromHash(),wishesOpen=location.hash==='#bucket';
function showTrip(){
 const panel=document.getElementById('trip-panel');if(!panel)return;
 panel.innerHTML=tripTab===4?myMap():tripTab===2?savedCollection():planner()+`<details class="crystal-panel planner-wishes" ${wishesOpen?'open':''}><summary>${t('やってみたいこと','Things to do')} · ${state.bucket.length}</summary>${bucket()}</details>`;
 document.querySelectorAll('[data-trip-tab]').forEach(b=>b.setAttribute('aria-selected',String(Number(b.dataset.tripTab)===tripTab)));
 bindTripPanel();
}
function bindTripPanel(){
 if(tripTab===4){bindMyMap();return}
 if(tripTab===2){bindSaved();return}
 document.querySelector('.planner-wishes').ontoggle=e=>{wishesOpen=e.currentTarget.open};
if(tripTab===3){document.getElementById('bucket-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget,title=f.elements.title.value.trim();if(!title)return;state.bucket.push({id:crypto.randomUUID(),title,country:f.elements.country.value,done:false});if(f.elements.country.value&&!state.wanted.includes(f.elements.country.value))state.wanted.push(f.elements.country.value);save();showTrip()};document.querySelectorAll('[data-bucket-done]').forEach(b=>b.onchange=()=>{state.bucket.find(x=>x.id===b.dataset.bucketDone).done=b.checked;save();showTrip()});document.querySelectorAll('[data-bucket-remove]').forEach(b=>b.onclick=()=>{state.bucket=state.bucket.filter(x=>x.id!==b.dataset.bucketRemove);save();showTrip()});document.querySelectorAll('[data-bucket-edit]').forEach(b=>b.onclick=()=>{const item=state.bucket.find(x=>x.id===b.dataset.bucketEdit);openDialog(`<form id="bucket-edit-form"><label>${t('叶えたいこと','Your wish')}<input name="title" required maxlength="140" value="${esc(item.title)}"></label><button class="button">${t('保存','Save')}</button></form>`);document.getElementById('bucket-edit-form').onsubmit=e=>{e.preventDefault();item.title=e.currentTarget.elements.title.value.trim();save();document.getElementById('travel-dialog').close();showTrip()}})}
if(tripTab===3){document.getElementById('trip-new').onclick=()=>{activeTrip=crypto.randomUUID();state.trips.push({id:activeTrip,title:t('新しい旅行','A new journey'),country:by(diaryQuery.get('country'))?.id||'',start:'',end:'',days:[],costs:{},packing:[]});save();showTrip()};document.getElementById('trip-select').onchange=e=>{activeTrip=e.target.value;showTrip()};const f=document.getElementById('planner-form');if(!f)return;const p=state.trips.find(x=>x.id===activeTrip);const collect=()=>{p.title=f.elements.title.value;p.country=f.elements.country.value;p.start=f.elements.start.value;p.end=f.elements.end.value;p.costs={};costs.forEach(([k])=>p.costs[k]=Math.max(0,Math.min(1e8,Number(f.elements['cost-'+k].value)||0)));p.days=p.days.map((d,i)=>({date:f.querySelector(`[data-day-date="${i}"]`).value,note:f.querySelector(`[data-day-note="${i}"]`).value}));p.packing=p.packing.map((x,i)=>({text:f.querySelector(`[data-pack-text="${i}"]`).value,done:f.querySelector(`[data-pack-check="${i}"]`).checked}));return p};const calc=()=>{const vals=costs.map(([k,j,e])=>({label:t(j,e),value:Math.max(0,Number(f.elements['cost-'+k].value)||0)}));document.getElementById('trip-total').textContent='¥'+vals.reduce((n,x)=>n+x.value,0).toLocaleString();document.getElementById('budget-chart').innerHTML=bars(vals)};f.oninput=calc;calc();f.onsubmit=e=>{e.preventDefault();collect();if(p.start&&p.end&&p.start>p.end){document.getElementById('planner-status').textContent=t('帰国日は出発日以降にしてください。','Return date must be after departure.');return}save();document.getElementById('planner-status').textContent=t('このブラウザに保存しました。','Saved in this browser.')};document.getElementById('day-add').onclick=()=>{collect();p.days.push({date:p.start,note:''});showTrip()};document.getElementById('pack-add').onclick=()=>{collect();p.packing.push({text:'',done:false});showTrip()};document.querySelectorAll('[data-day-remove]').forEach(b=>b.onclick=()=>{collect();p.days.splice(Number(b.dataset.dayRemove),1);showTrip()});document.querySelectorAll('[data-pack-remove]').forEach(b=>b.onclick=()=>{collect();p.packing.splice(Number(b.dataset.packRemove),1);showTrip()});document.getElementById('trip-delete').onclick=()=>{if(confirm(t('この旅行計画を削除しますか？','Delete this trip plan?'))){state.trips=state.trips.filter(x=>x.id!==activeTrip);activeTrip=state.trips[0]?.id||'';save();showTrip()}};document.getElementById('trip-print').onclick=()=>{collect();save();window.print()}}}
function validBackup(v){if(!v||v.version!==1||!v.state||!Array.isArray(v.favorites))return false;const s=v.state;return (s.photoIds===undefined||Array.isArray(s.photoIds)&&s.photoIds.length<10000&&s.photoIds.every(x=>typeof x==='string'))&&(s.albumIds===undefined||Array.isArray(s.albumIds)&&s.albumIds.every(x=>typeof x==='string'))&&['visited','wanted','bucket','trips','history'].every(k=>Array.isArray(s[k])&&s[k].length<10000)&&s.visited.every(x=>typeof x==='string'&&by(x))&&s.wanted.every(x=>typeof x==='string'&&by(x))&&v.favorites.every(x=>typeof x==='string'&&by(x))&&s.bucket.every(x=>typeof x.id==='string'&&typeof x.title==='string'&&x.title.length<=140&&typeof x.done==='boolean')&&s.trips.every(x=>typeof x.id==='string'&&typeof x.title==='string'&&typeof x.start==='string'&&typeof x.end==='string'&&Array.isArray(x.days)&&x.days.every(d=>typeof d.date==='string'&&typeof d.note==='string')&&Array.isArray(x.packing)&&x.packing.every(p=>typeof p.text==='string'&&typeof p.done==='boolean')&&x.costs&&costs.every(([k])=>x.costs[k]===undefined||typeof x.costs[k]==='number'&&x.costs[k]>=0&&x.costs[k]<=1e8));}
let quizRun=null,personAnswers=[];try{const a=new URLSearchParams(location.search).get('answers');if(a&&/^[0-5]{6}$/.test(a))personAnswers=a.split('').map(Number)}catch{}
function personality(){return `${head('Travel Personality',t('いまのあなたは、どんな旅人？','What kind of traveller are you?'))}<section class="wrap page-body"><div class="glass question-panel" id="personality-body">${personalityBody()}</div></section>`}
function personalityBody(){const data=window.TORAMI_DISCOVERY?.personality;if(!data)return missing('診断を準備しています。','The quiz is being prepared.');if(personAnswers.length<data.questions.length){const q=data.questions[personAnswers.length];return `<p class="eyebrow">${personAnswers.length+1} / ${data.questions.length}</p><h2>${esc(q.question[lang])}</h2><div class="quiz-options">${q.options.map((o,i)=>`<button data-person-answer="${i}">${esc(o.label[lang])}<span>↗</span></button>`).join('')}</div>${personAnswers.length?`<button class="text-button" id="person-back">← ${t('前の質問','Previous')}</button>`:''}`};const scores={};personAnswers.forEach((a,i)=>Object.entries(data.questions[i].options[a].scores).forEach(([k,v])=>scores[k]=(scores[k]||0)+v));const type=[...data.types].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0)||(data.tieBreakOrder||[]).indexOf(a.id)-(data.tieBreakOrder||[]).indexOf(b.id))[0];return `<p class="eyebrow">YOUR TRAVEL PERSONALITY</p><h2>${esc(type.name)}</h2><p>${esc(type.description[lang])}</p><div class="destination-grid">${type.countryCodes.map(by).filter(d=>d&&d.safety?.mofaLevel<2).slice(0,3).map(card).join('')}</div><div class="feature-actions"><button class="button soft" id="person-reset">${t('もう一度診断','Try again')}</button><button class="button soft" data-result-image="${esc(type.name)}" data-subtitle="${esc(type.tagline[lang])}">${t('結果画像を保存','Save result image')}</button><button class="button soft" data-feature-share>${t('シェア','Share')}</button></div><p class="fine-print">${t('旅の好みを探すエンターテインメント診断です。','An entertainment quiz for discovering travel preferences.')}</p>`}
function travelQuiz(){const data=window.TORAMI_DISCOVERY?.travelQuiz;return `${head('Travel Quiz',t('世界を知る、小さな旅。','A little journey through what you know.'))}<section class="wrap page-body"><form id="travel-quiz-form" class="glass feature-form"><label>${t('ジャンル','Category')}<select name="category"><option value="">${t('すべて','All')}</option>${(data?.categories||[]).map(c=>`<option value="${c.id}">${esc(c.label[lang])}</option>`).join('')}</select></label><label>${t('難易度','Difficulty')}<select name="difficulty"><option value="">${t('すべて','All')}</option><option value="easy">${t('やさしい','Easy')}</option><option value="medium">${t('ふつう','Medium')}</option></select></label><button class="button">${t('クイズを始める','Start quiz')}</button></form><div id="travel-quiz-body" class="question-panel glass">${missing('ひとつ知ると、行ってみたくなる。','Curiosity is the start of a journey.')}</div></section>`}
function quizBody(){const q=quizRun.questions[quizRun.index];if(!q)return `<p class="eyebrow">YOUR RESULT</p><h2>${quizRun.score} / ${quizRun.questions.length}</h2><p>${t('次の旅で、確かめてみたくなるね。','A few more things to look out for on your travels.')}</p><button class="button soft" data-result-image="Travel Quiz" data-subtitle="${quizRun.score} / ${quizRun.questions.length}">${t('結果画像を保存','Save result image')}</button><button class="text-button" data-feature-share>${t('シェア','Share')}</button>`;return `<p class="eyebrow">${quizRun.index+1} / ${quizRun.questions.length}</p><h2>${esc(q.question[lang])}</h2><div class="quiz-options">${q.options.map((o,i)=>`<button data-quiz-choice="${i}" ${quizRun.answered?'disabled':''}>${esc(o[lang])}</button>`).join('')}</div>${quizRun.answered?`<div class="quiz-explanation"><h3>${quizRun.correct?t('正解！','Correct!'):t('正解は…','The answer is…')}</h3><strong>${esc(q.options[q.correctIndex][lang])}</strong><p>${esc(q.explanation[lang])}</p>${source(q.source?.url)}<button class="button" id="quiz-next">${t('次へ','Continue')}</button></div>`:''}`}
function bind(){document.getElementById('app').addEventListener('click',async e=>{const add=e.target.closest('[data-compare-add]');if(add){let ids=compare();if(!ids.includes(add.dataset.compareAdd)){if(ids.length>=4){alert(t('比較は4件までです。比較ページで入れ替えられます。','Compare up to four places. Remove one on the compare page.'));return}ids.push(add.dataset.compareAdd)}try{localStorage.setItem('torami-compare',JSON.stringify(ids))}catch{}track('compare_use');add.textContent=t('追加しました ✓','Added ✓')}const rem=e.target.closest('[data-remove-compare]');if(rem){localStorage.setItem('torami-compare',JSON.stringify(compare().filter(x=>x!==rem.dataset.removeCompare)));document.getElementById('compare-table').innerHTML=comparisonTable(compare().map(by).filter(Boolean))}const want=e.target.closest('[data-wanted]');if(want){if(!setPassportStatus(want.dataset.wanted,'wanted'))return;want.textContent=t('リストに追加 ✓','Added to your list ✓')}if(e.target.closest('[data-feature-share]'))featureShare();const image=e.target.closest('[data-result-image]');if(image){image.disabled=true;try{await resultImage(image.dataset.resultImage==='passport'?'My Travel Passport':image.dataset.resultImage,image.dataset.resultImage==='passport'?state.visited.map(by).filter(d=>d&&!d.isCity).length+' / 197 '+t('カ国を訪問','countries visited'):image.dataset.subtitle||'')}catch{alert(t('画像を保存できませんでした。','The image could not be saved.'))}finally{image.disabled=false}}const a=e.target.closest('[data-album]');if(a)openAlbum(a.dataset.album,Number(a.dataset.photoIndex)||0);const p=e.target.closest('[data-person-answer]');if(p){if(!personAnswers.length)track('personality_start');personAnswers.push(Number(p.dataset.personAnswer));document.getElementById('personality-body').innerHTML=personalityBody();if(personAnswers.length===window.TORAMI_DISCOVERY.personality.questions.length){const u=new URL(location.href);u.searchParams.set('answers',personAnswers.join(''));history.replaceState(null,'',u);track('personality_complete')}}if(e.target.closest('#person-back')){personAnswers.pop();document.getElementById('personality-body').innerHTML=personalityBody()}if(e.target.closest('#person-reset')){const u=new URL(location.href);u.searchParams.delete('answers');history.replaceState(null,'',u);personAnswers=[];document.getElementById('personality-body').innerHTML=personalityBody()}const answer=e.target.closest('[data-quiz-choice]');if(answer&&quizRun&&!quizRun.answered){quizRun.answered=true;quizRun.correct=Number(answer.dataset.quizChoice)===quizRun.questions[quizRun.index].correctIndex;if(quizRun.correct)quizRun.score++;document.getElementById('travel-quiz-body').innerHTML=quizBody()}if(e.target.closest('#quiz-next')){quizRun.index++;quizRun.answered=false;document.getElementById('travel-quiz-body').innerHTML=quizBody()}});
if(page==='compare')document.getElementById('compare-form').onsubmit=e=>{e.preventDefault();const id=e.currentTarget.elements.country.value,ids=compare();if(!id||ids.includes(id))return;if(ids.length>=4){alert(t('最大4件までです。','Maximum four destinations.'));return}ids.push(id);localStorage.setItem('torami-compare',JSON.stringify(ids));track('compare_use');document.getElementById('compare-table').innerHTML=comparisonTable(ids.map(by).filter(Boolean))};
if(page==='calendar'){
 const form=document.getElementById('calendar-form'),results=document.getElementById('calendar-results');
 let limit=12;
 function update(){
   const month=Number(form.elements.month.value)-1,region=form.elements.region.value,sort=form.elements.climateSort.value;
   const list=all.filter(d=>d.climate&&(!region||d.region===region));
   list.sort((a,b)=>(sort==='warm'?b.climate.temp[month]-a.climate.temp[month]:sort==='dry'?a.climate.rain[month]-b.climate.rain[month]:0)||name(a).localeCompare(name(b),lang));
   results.innerHTML=`<p aria-live="polite">${list.length}${t('カ国',' destinations')}</p><div class="destination-grid">${list.slice(0,limit).map(d=>`<div>${card(d)}<p class="weather-reading">${esc(d.climate.place)} · ${d.climate.temp[month]} °C · ${d.climate.rain[month]} mm</p></div>`).join('')}</div>${list.length>limit?`<button class="button soft" id="more-climate">${t('もっと見る','Show more')}</button>`:''}`;
 }
 form.elements.month.value=String(new Date().getMonth()+1);form.onsubmit=e=>e.preventDefault();form.onchange=()=>{limit=12;update()};results.onclick=e=>{if(e.target.closest('#more-climate')){const firstNew=limit;limit+=12;update();results.querySelectorAll('.destination-card .card-visual a')[firstNew]?.focus()}};update();
}
if(page==='mytrip'){window.addEventListener('hashchange',()=>{tripTab=tripFromHash();wishesOpen=location.hash==='#bucket';showTrip()});window.addEventListener('pageshow',e=>{if(e.persisted){refreshPassport();tripTab=tripFromHash();showTrip()}});document.querySelectorAll('[data-trip-tab]').forEach(b=>b.onclick=()=>{tripTab=Number(b.dataset.tripTab);history.replaceState(null,'',({2:'#saved',3:'#planner',4:'#map'})[tripTab]);document.querySelectorAll('[data-trip-tab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));showTrip()});showTrip();document.getElementById('backup-download').onclick=()=>download(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state,favorites:fav()},null,2)],{type:'application/json'}),'torami-my-trip-backup.json');document.getElementById('backup-import').onchange=async e=>{const f=e.target.files[0],status=document.getElementById('backup-status');try{if(!f||f.size>5e6)throw Error();const v=JSON.parse(await f.text());if(!validBackup(v))throw Error();if(!confirm(t('現在のMy Tripをこのバックアップで置き換えますか？','Replace current My Trip data with this backup?')))return;Object.assign(state,{albumIds:[],photoIds:[]},v.state);localStorage.setItem('torami-saved',JSON.stringify(v.favorites));save();location.reload()}catch{status.textContent=t('復元できませんでした。有効なTORAMIバックアップを選んでください。','Could not restore. Choose a valid TORAMI backup.')}}}
if(page==='quiz')document.getElementById('travel-quiz-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget,list=(window.TORAMI_DISCOVERY?.travelQuiz.questions||[]).filter(q=>(!f.elements.category.value||q.category===f.elements.category.value)&&(!f.elements.difficulty.value||q.difficulty===f.elements.difficulty.value));if(!list.length){document.getElementById('travel-quiz-body').innerHTML=missing('この条件の問題は準備中です。','No questions match these filters yet.');return}quizRun={questions:[...list].sort(()=>Math.random()-.5).slice(0,5),index:0,score:0,answered:false};track('quiz_start');document.getElementById('travel-quiz-body').innerHTML=quizBody()};
if(page==='diary')bindCrystalDiary();
if(page==='rankings')bindRank();

if(page==='gacha'){const h=document.getElementById('gacha-history-list');if(h){h.className='gacha-history-list';h.innerHTML=historyHTML()}}if(page==='destinations'){const form=document.getElementById('directory-form');let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>track('search_filter'),700)})}if(page==='country')track('destination_view',document.body.dataset.destination);
}
function openAlbum(id,start=0){const a=albums().find(x=>x.id===id);if(!a?.photos?.length)return;let index=Math.max(0,Math.min(start,a.photos.length-1));const draw=()=>{const p=a.photos[index];document.getElementById('dialog-content').innerHTML=`<article class="photo-lightbox"><h2>${esc(t(a.title,a.titleEn||a.title))}</h2><img src="${esc(p.src)}" alt="${esc(t(p.alt||'',p.altEn||p.alt||''))}"><p>${esc(t(p.caption||'',p.captionEn||p.caption||''))}</p><small>${[p.takenAt,t(p.place,p.placeEn||p.place)].filter(Boolean).map(esc).join(' · ')}</small><div class="lightbox-save">${mediaHeart('data-like-photo',p.id,state.photoIds.includes(a.id+'/'+p.id),t('この写真にいいね','Like this photo'))}<span>${t('この写真にいいね','Like this photo')}</span><a href="my-trip.html#saved">${t('保存したもの','Saved')} ↗</a></div><div class="gallery-controls"><button id="album-prev" ${index===0?'disabled':''} aria-label="${t('前の写真','Previous photo')}">←</button><span>${index+1} / ${a.photos.length}</span><button id="album-next" ${index===a.photos.length-1?'disabled':''} aria-label="${t('次の写真','Next photo')}">→</button></div><div class="album-gallery">${a.photos.map((photo,i)=>`<button data-album-photo="${i}" aria-label="${t('写真','Photo')} ${i+1}"><img src="${esc(photo.src)}" alt="${esc(t(photo.alt||'',photo.altEn||photo.alt||''))}" loading="lazy"></button>`).join('')}</div></article>`;document.querySelector('[data-like-photo]').onclick=()=>{if(toggleMedia('photoIds',a.id+'/'+p.id)){draw();if(page==='mytrip'&&tripTab===2)showTrip();document.querySelector('[data-like-photo]').focus()}};document.querySelectorAll('[data-album-photo]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.albumPhoto);draw()});document.getElementById('album-prev').onclick=()=>{index--;draw()};document.getElementById('album-next').onclick=()=>{index++;draw()}};openDialog('');draw();track('album_open',a.countryId)}
function historyHTML(){return state.history.map(x=>by(x.id)).filter(Boolean).map(d=>`<a href="${href(d)}">${photo(d)}${esc(name(d))}</a>`).join('')||`<p>${t('次のひと回しから、ここに残ります。','Your next draw will appear here.')}</p>`}function recordGacha(d){state.history.unshift({id:d.id,at:new Date().toISOString()});state.history=state.history.slice(0,30);save();const h=document.getElementById('gacha-history-list');if(h)h.innerHTML=historyHTML()}
function city(){const q=new URLSearchParams(location.search),d=by(q.get('country')),c=d?.cities?.find(x=>(x.id||x.name)===q.get('city'));return c?`${head(esc(c.name),esc(d.ja))}<section class="wrap page-body"><div class="glass feature-panel"><p>${esc(c.text||empty)}</p>${countryActions(by(d.id+'~'+(c.id||c.name)))}${link(href(d),'国の詳細へ','Country details')}</div>${albumSection(d.id)}</section>`:`${head('City Guide',t('都市の情報','City details'))}<div class="wrap page-body">${missing('都市を選んでください。','Choose a city from a destination page.')}${link('destinations.html','旅先を探す','Explore destinations')}</div>`}
return {pages:{rankings:collectionRank,diary:crystalDiary,city,discover,compare:comparison,calendar,mytrip,personality,quiz:travelQuiz,insights,privacy:()=>legal('privacy'),disclaimer:()=>legal('disclaimer'),contact:()=>legal('contact')},enhance,bind,countryActions,recordGacha,exploreTabs,t,compactCount,validBackup,visitedIds,setPassportStatus};
};
