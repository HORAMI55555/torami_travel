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
const state=SSR?{version:1,albumIds:[],visited:[],wanted:[],bucket:[],trips:[],history:[]}:read('torami-my-trip',{version:1,albumIds:[],visited:[],wanted:[],bucket:[],trips:[],history:[]});
for(const key of ['albumIds','visited','wanted','bucket','trips','history'])if(!Array.isArray(state[key]))state[key]=[];
const save=()=>{try{localStorage.setItem('torami-my-trip',JSON.stringify(state));return true}catch{alert(t('保存できませんでした。バックアップをダウンロードしてください。','Storage is unavailable. Download a backup.'));return false}};
function refreshPassport(){
  if(SSR)return;
  const latest=read('torami-my-trip',null);
  if(latest&&['visited','wanted','bucket','trips','history'].every(k=>Array.isArray(latest[k])))Object.assign(state,latest);
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
  if(event.key==='torami-saved'){if(page==='mytrip')showTrip();return}if(event.key!==null&&event.key!=='torami-my-trip')return;
  if(!event.newValue)Object.assign(state,{version:1,albumIds:[],visited:[],wanted:[],bucket:[],trips:[],history:[]});
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
const compFields=[['temp','気温 °C（1月 / 7月）','Temperature °C (Jan / Jul)',d=>d.climate?d.climate.place+' · '+d.climate.temp[0]+' / '+d.climate.temp[6]:null],['currency','通貨','Currency',d=>d.practical?.currency],['language','言語','Language',d=>d.practical?.language],['arrivals','観光客到着数','Tourist arrivals',d=>d.arrivalsLast?compactCount(d.arrivalsLast[1])+' ('+d.arrivalsLast[0]+')':null],['budget','旅行費用／日','Daily travel budget',d=>d.budget?.daily?`${d.budget.currency==='JPY'?'¥':d.budget.currency+' '}${Number(d.budget.daily).toLocaleString()}`:null],['price','物価','Cost of living',d=>d.practical?.prices],['scenery','景色（体験評価）','Scenery · personal',d=>d.ratings?.scenery],['food','グルメ（体験評価）','Food · personal',d=>d.ratings?.food],['city','街並み（体験評価）','Cityscape · personal',d=>d.ratings?.city],['nature','自然（体験評価）','Nature · personal',d=>d.ratings?.nature],['safety','治安情報・出典','Travel advisory · source',d=>d.safety?.summary],['solo','ひとり旅（体験評価）','Solo travel · personal',d=>d.ratings?.solo],['access','アクセス','Access',d=>d.practical?.access],['season','ベストシーズン','Best season',d=>d.season?.join(', ')],['days','滞在日数','Suggested stay',d=>d.practical?.stayDays],['overall','トラみちゃんの評価','TORAMI personal rating',d=>d.ratings?.overall]];
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
const themesDiary = {
  scenic:['✧','絶景','Scenic views'], photo:['▣','フォトスポット','Photo spots'], nature:['♧','自然','Nature'], city:['⌖','街歩き','City walks'],
  culture:['☆','文化・体験','Culture'], food:['♧','グルメ','Food'],
  hotel:['⌂','ホテル','Hotels'], shopping:['♢','ショッピング','Shopping'], beach:['≈','ビーチ','Beaches']
};
const diaryQuery = new URLSearchParams(location.search);
const normalizeText = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const albumCity = a => t(a.cityJa || a.cityId, a.cityEn || a.cityId);
const visits = a => [...new Set((a.visitMonths?.length ? a.visitMonths : [a.date]).filter(Boolean))].sort();
const monthLabel = value => value.replace(/-0?/,'.');
function dateRange(a){
  const dates = visits(a);
  return dates.length > 1 ? monthLabel(dates[0])+' – '+monthLabel(dates.at(-1)) : dates.length ? monthLabel(dates[0]) : '';
}
let diaryCountry = diaryQuery.get('country') || '', diaryCity = diaryQuery.get('city') || '';
let diaryTab = ['log','favorites'].includes(diaryQuery.get('view')) ? diaryQuery.get('view') : 'album';
let diaryTheme = Object.hasOwn(themesDiary,diaryQuery.get('theme')) ? diaryQuery.get('theme') : '';
let diaryText = diaryQuery.get('q') || '', diaryYear = diaryQuery.get('year') || '', diaryOrder = 'new';
function matchingPhotos(a){
  const country=by(a.countryId), query=normalizeText(diaryText);
  const context=[country.ja,country.en,a.cityJa,a.cityEn,a.cityId,a.title,a.titleEn,...visits(a)].join(' ');
  return a.photos.map((p,index)=>({p,index})).filter(({p})=>{
    const labels=[...(p.tags||[])];
    const highlights={'los-angeles-lights':['9','3','5','7','4'],'cancun-colours':['caribbean','stairs','rainbow']};
    if(highlights[a.id]?.includes(p.id))labels.push('photo');
    if(a.id==='cancun-colours'&&['caribbean','shore','rainbow'].includes(p.id))labels.push('nature');
    if(diaryTheme&&diaryTheme!=='hotel'&&!labels.includes(diaryTheme))return false;
    const text=[context,p.alt,p.caption,p.altEn,p.captionEn,p.place,p.placeEn,...labels.flatMap(k=>themesDiary[k]||[])].join(' ');
    return !query || normalizeText(text).includes(query);
  });
}
function diaryCountryRail(catalog){
  const countryIds=[...new Set(catalog.map(a=>a.countryId))];
  const cards=countryIds.map(id=>{
    const choice=catalog.find(a=>a.countryId===id),country=by(id);
    return `<button class="arch-card" data-album-country="${esc(id)}" aria-pressed="${id===diaryCountry}"><img src="${esc(choice.cover||choice.photos[0].src)}" alt="" loading="lazy"><span><strong lang="en">${esc(country.en)}</strong>${lang==='ja'?`<small>${esc(country.ja)}</small>`:''}</span></button>`;
  }).join('');
  const arrow=(delta,label)=>countryIds.length>1?`<button class="diary-arrow" data-diary-country-step="${delta}" aria-label="${label}">${delta<0?'‹':'›'}</button>`:'';
  return `<section class="diary-country-block">${chapter('Select a Country',t('国から探す','Country albums'))}<div class="diary-carousel">${arrow(-1,t('前の国','Previous country'))}<div class="arch-rail">${cards}</div>${arrow(1,t('次の国','Next country'))}</div></section>`;
}
function diaryCityRail(activeCountry,catalog){
  if(!catalog.length)return '';
  const selected=activeCountry?by(activeCountry):null, album=catalog[0];
  const cityButtons=[...new Map(catalog.map(a=>[a.countryId+'/'+a.cityKey,a])).values()].map(a=>
    `<button class="city-slide" data-album-city="${esc(a.cityKey)}" data-city-in="${esc(a.countryId)}" aria-pressed="${diaryCity===a.cityKey}"><img src="${esc(a.cover||a.photos[0].src)}" alt="" loading="lazy"><span><strong lang="en">${esc(a.cityEn||a.cityId)}</strong><small>${esc(lang==='ja'?a.cityJa:by(a.countryId).en)}</small></span></button>`).join('');
  return `<section class="diary-city-block">${selected?`<div class="diary-country-banner"><img src="${esc(album.cover||album.photos[0].src)}" alt=""><div><h2 lang="en">${esc(selected.en)}</h2><a href="${esc(href(selected))}">${esc(name(selected))} ${t('の旅ガイド','guide')} ↗</a></div></div>`:''}${chapter('Select a City',t('都市から探す','City albums'))}<div class="city-rail">${cityButtons}</div></section>`;
}
function diaryThemes(){
  return `<section class="diary-themes" aria-label="${t('写真のテーマ','Photo themes')}"><h2>${t('テーマから探す','Explore by theme')}</h2><div>${Object.entries(themesDiary).map(([key,[icon,ja,en]])=>`<button data-diary-theme="${key}" aria-pressed="${diaryTheme===key}"><i aria-hidden="true">${icon}</i><strong>${t(ja,en)}</strong>${lang==='ja'?`<small>${en}</small>`:''}</button>`).join('')}</div></section>`;
}
function diarySpread(a,saved){
  const list=matchingPhotos(a),country=by(a.countryId),resources=D.cityResources?.[a.cityKey]||[];
  return `<article class="crystal-panel album-spread"><header><div><small>${esc(country.en)} · ${esc(dateRange(a))}</small><h3 lang="en">${esc(a.cityEn||a.cityId)}</h3><p>${esc(t(a.title,a.titleEn||a.title))}</p></div><button class="jewel-action" data-album="${esc(a.id)}">${t('全','All ')}${a.photos.length}${t('枚を見る',' photos')} ›</button></header><div class="filmstrip">${list.map(({p,index})=>`<button data-album="${esc(a.id)}" data-photo-index="${index}" aria-label="${esc(t(p.alt,p.altEn||p.alt))}"><img src="${esc(p.src)}" alt="${esc(t(p.alt,p.altEn||p.alt))}" loading="lazy"><span>${esc(t(p.caption,p.captionEn||p.caption))}</span></button>`).join('')}</div><footer><button class="jewel-action" data-bookmark-album="${esc(a.id)}" aria-pressed="${saved.includes(a.id)}">${saved.includes(a.id)?'♥':'♡'} ${saved.includes(a.id)?t('保存済み','Saved'):t('アルバムを保存','Save album')}</button><a href="${esc(href(country))}">${esc(name(country))} ${t('の旅ガイド','guide')} ↗</a></footer>${resources.length?`<details class="city-resources"><summary>${t('この街の体験・宿泊','Activities & stays')}</summary>${resources.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><small>${r.kind==='hotel'?'STAY':'EXPERIENCE'}</small>${esc(t(r.ja,r.en))} ↗</a>`).join('')}</details>`:''}</article>`;
}
function diaryView(){
  const saved=state.albumIds||[], catalog=albums().filter(a=>a.photos?.length);
  const available=catalog.filter(a=>diaryTab!=='favorites'||saved.includes(a.id));
  const countries=new Set(available.map(a=>a.countryId)),cities=new Set(available.map(a=>a.countryId+'/'+a.cityKey));
  const inCountry=available.filter(a=>!diaryCountry||diaryCountry===a.countryId);
  const matches=inCountry.filter(a=>(!diaryCity||a.cityKey===diaryCity)&&(!diaryYear||visits(a).some(m=>m.startsWith(diaryYear+'-')))&&matchingPhotos(a).length)
    .sort((a,b)=>diaryOrder==='name'?albumCity(a).localeCompare(albumCity(b),lang):(visits(b).at(-1)||'').localeCompare(visits(a).at(-1)||''));
  const emptyLabel=diaryTab==='favorites'&&!saved.length?t('アルバムの♡を押すと、ここで見返せます。','Save an album with its heart to find it here.'):t('この条件に合う写真はありません。','No photos match your filters.');
  const noResults=`<div class="collection-empty glass"><p>${emptyLabel}</p><button class="jewel-action" data-diary-reset>${t('すべての写真へ','Browse all photos')}</button></div>`;
  const filtersActive=diaryCountry||diaryCity||diaryYear||diaryTheme||diaryText;
  const reset=filtersActive?`<button data-diary-clear class="text-button">${t('絞り込みを解除','Clear filters')} ×</button>`:'';
  if(!available.length)return noResults;
  const totals=`<div class="diary-totals"><span><b>${countries.size}</b> ${t('掲載国','countries')}</span><span><b>${cities.size}</b> ${t('掲載都市','cities')}</span><span><b>${available.reduce((n,a)=>n+a.photos.length,0)}</b> ${t('枚の写真','photos')}</span></div>`;
  const logs=matches.flatMap(a=>visits(a).filter(month=>!diaryYear||month.startsWith(diaryYear+'-')).map(month=>({month,a}))).sort((x,y)=>diaryOrder==='name'?albumCity(x.a).localeCompare(albumCity(y.a),lang)||y.month.localeCompare(x.month):y.month.localeCompare(x.month));
  const log=`<section class="crystal-panel log-panel">${chapter('Travel Log',t('訪問の記録','Visit dates'))}<ol class="visit-log">${logs.map(({month,a})=>`<li><time datetime="${esc(month)}">${monthLabel(month)}</time><div><button data-album="${esc(a.id)}">${esc(albumCity(a))} ↗</button><small>${esc(name(by(a.countryId)))}</small></div></li>`).join('')}</ol></section>`;
  const stories=matches.map(a=>diarySpread(a,saved)).join('');
  const stays=diaryTheme==='hotel'?matches.flatMap(a=>(D.cityResources?.[a.cityKey]||[]).filter(r=>r.kind==='hotel').map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(albumCity(a))}</strong><span>${esc(t(r.ja,r.en))} ↗</span></a>`)).join(''):'';
  const content=diaryTheme==='hotel'?(stays?`<section class="crystal-panel diary-stays">${chapter('Official hotel guides',t('観光局の宿泊ガイド','Places to stay'))}${stays}</section>`:noResults):(matches.length?(diaryTab==='log'?log:stories):noResults);
  return `${diaryCountryRail(available)}${totals}${diaryCityRail(diaryCountry,inCountry)}${diaryThemes()}<div class="diary-current-filter">${reset}</div>${content}`;
}
function crystalDiary(){
  const tabs=[['album','▧','旅のアルバム','Photo Album'],['log','⌖','旅の記録','Travel Log'],['favorites','♡','お気に入り','Favorites']];
  const years=[...new Set(albums().flatMap(a=>visits(a).map(m=>m.slice(0,4))))].sort().reverse();
  return `${collectionHero('diary','Travel Diary')}<div class="collection-page diary-page"><nav class="glass-ribbon" aria-label="Diary">${tabs.map(([id,icon,ja,en])=>`<button data-diary-tab="${id}" aria-pressed="${id===diaryTab}"><i aria-hidden="true">${icon}</i><span>${t(ja,en)}${lang==='ja'?`<small>${en}</small>`:''}</span></button>`).join('')}</nav><div class="diary-search-row"><form id="diary-search" class="collection-search" role="search"><span aria-hidden="true">⌕</span><input name="q" type="search" value="${esc(diaryText)}" aria-label="${t('写真を検索','Search the diary')}" placeholder="${t('国・都市・スポットで検索…','Country, city or spot…')}"><button>${t('検索','Search')}</button></form><button class="diary-filter-button" data-diary-filter aria-expanded="false" aria-controls="diary-filters"><i aria-hidden="true">☷</i>${t('絞り込み','Filters')}</button></div><div id="diary-filters" hidden><label>${t('訪問年','Visit year')}<select id="diary-year"><option value="">${t('すべて','All years')}</option>${years.map(y=>`<option ${y===diaryYear?'selected':''}>${esc(y)}</option>`).join('')}</select></label><label>${t('表示順','Sort albums')}<select id="diary-order"><option value="new">${t('新しい旅から','Latest trip')}</option><option value="name">${t('都市名順','City name')}</option></select></label></div><div id="collection-diary-results">${diaryView()}</div></div>`;
}
function bindCrystalDiary(){
  const pageEl=document.querySelector('.diary-page'), area=document.getElementById('collection-diary-results'),form=document.getElementById('diary-search');
  function render(){area.innerHTML=diaryView();pageEl.querySelectorAll('[data-diary-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.diaryTab===diaryTab)))}
  function sync(){const url=new URL(location.href);for(const [k,v] of [['view',diaryTab==='album'?'':diaryTab],['country',diaryCountry],['city',diaryCity],['q',diaryText],['year',diaryYear],['theme',diaryTheme]]){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k)}history.replaceState(null,'',url.href);render()}
  function clear(){diaryCountry='';diaryCity='';diaryTheme='';diaryText='';diaryYear='';form.elements.q.value='';pageEl.querySelector('#diary-year').value=''}
  function search(){diaryText=form.elements.q.value;diaryCountry='';diaryCity='';sync()}
  form.oninput=search;form.onsubmit=e=>{e.preventDefault();search()};
  pageEl.querySelector('#diary-year').onchange=e=>{diaryYear=e.target.value;sync()};pageEl.querySelector('#diary-order').onchange=e=>{diaryOrder=e.target.value;render()};
  pageEl.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-diary-filter')){const f=pageEl.querySelector('#diary-filters');f.hidden=!f.hidden;b.setAttribute('aria-expanded',String(!f.hidden));return}
    if(b.hasAttribute('data-diary-tab')){clear();diaryTab=b.dataset.diaryTab}
    else if(b.hasAttribute('data-diary-country-step')){
      const ids=[...area.querySelectorAll('[data-album-country]')].map(el=>el.dataset.albumCountry);
      if(!ids.length)return;
      const delta=Number(b.dataset.diaryCountryStep),i=ids.indexOf(diaryCountry);diaryCountry=ids[((i<0?(delta>0?-1:0):i)+delta+ids.length)%ids.length];diaryCity='';
    }else if(b.hasAttribute('data-album-country')){diaryCountry=b.dataset.albumCountry;diaryCity=''}
    else if(b.hasAttribute('data-album-city')){diaryCity=b.dataset.albumCity;diaryCountry=b.dataset.cityIn}
    else if(b.hasAttribute('data-diary-theme')){diaryTheme=diaryTheme===b.dataset.diaryTheme?'':b.dataset.diaryTheme}
    else if(b.hasAttribute('data-diary-clear')||b.hasAttribute('data-diary-reset')){clear();if(b.hasAttribute('data-diary-reset'))diaryTab='album'}
    else if(b.hasAttribute('data-bookmark-album')){refreshPassport();const id=b.dataset.bookmarkAlbum,old=state.albumIds;state.albumIds=old.includes(id)?old.filter(k=>k!==id):[...old,id];if(!save())state.albumIds=old;else track('album_save',id)}
    else return;
    const key=['diaryCountryStep','albumCountry','albumCity','diaryTheme','bookmarkAlbum'].find(k=>b.dataset[k]!==undefined),value=key?b.dataset[key]:'';
    sync();
    if(key){const replacement=[...area.querySelectorAll('button')].find(el=>el.dataset[key]===value);replacement?.focus({preventScroll:true})}
  });
  window.addEventListener('torami-passport-change',render);
}

const mapLayers=[['visited','✈','訪問済み','Visited'],['favorite','♡','お気に入り','Favorites'],['wanted','☆','行きたい','Bucket List']];
let visibleLayers=['visited'];
function mapLists(){return {visited:new Set(state.visited.filter(id=>all.some(d=>d.id===id))),favorite:new Set(fav().filter(id=>all.some(d=>d.id===id))),wanted:new Set(state.wanted.filter(id=>all.some(d=>d.id===id)))}}
function myMap(){
 const lists=mapLists();
 const trip=state.trips.at(-1),recent=trip&&by(trip.country);
 return `${chapter('My Travel Map',t('わたしの世界地図','My world map'))}<p class="trip-hint">${t('国を選んで、訪問済み・お気に入り・行きたいを登録。訪問済みの国はPassportにも並びます。','Choose a country to mark it. Visited countries also appear in your Passport.')}</p><div class="glass-ribbon map-modes">${mapLayers.map(([k,icon,ja,en])=>`<button data-only-layer="${k}" aria-pressed="${visibleLayers.length===1&&visibleLayers[0]===k}"><i>${icon}</i><span>${t(ja,en)}<small>${en}</small></span></button>`).join('')}</div><div class="map-layout"><section><div class="map-viewport own-map" id="own-map">${crystalMap().replace('<pattern id="gem-art"',`<pattern id="my-sky" width="1000" height="750" patternUnits="userSpaceOnUse"><image href="assets/img/collection/sky.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern><pattern id="my-purple" width="1000" height="750" patternUnits="userSpaceOnUse"><image href="assets/img/collection/purple.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern><pattern id="gem-art"`)}</div><div class="map-actions">${mapZoomControls()}<select aria-label="${t('国名で選ぶ','Choose country')}" id="my-country">${options()}</select></div></section></div><div class="diary-totals">${mapLayers.map(([k,i,ja,en])=>`<span>${i} ${t(ja,en)} <b>${lists[k].size}</b></span>`).join('')}<span><b>${Math.round(100*lists.visited.size/all.length)}%</b></span></div><div class="map-actions"><button class="jewel-action" id="map-export">${t('地図を画像で保存','Save map image')} ↓</button></div><div class="saved-tiles"><section class="crystal-panel"><h3>Saved</h3><a href="diary.html?view=favorites">♡ ${t('保存したアルバム','Saved albums')} · ${state.albumIds.length} ↗</a></section><section class="crystal-panel"><h3>Recent Trip</h3><a href="my-trip.html#planner" data-open-planner>${esc(trip?trip.title:t('次の旅を計画する','Plan your next trip'))} ${recent?'· '+esc(name(recent)):''} ↗</a></section></div>`;
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
 document.querySelector('[data-open-planner]').onclick=e=>{e.preventDefault();document.querySelector('[data-trip-tab="3"]').click()};
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
  ['saved','♡','わたしの保存','My Saves','saved'],
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
const rankOpinionLabels={overall:['おすすめ度','Overall'],scenery:['景色','Scenery'],food:['食事','Food'],solo:['ひとり旅','Solo travel'],value:['コスパ','Value'],return:['もう一度行きたい','Return visits'],hidden:['穴場','Hidden gems'],hotel:['ホテル','Hotels']};
const rankStatLabels={rain:['降水量の少ない旅先','Low rainfall'],arrivals:['国際観光客到着数','Tourist arrivals'],dailyCost:['現地予算／日','Daily budget'],population:['人口','Population']};
const knownRankKeys=new Set([...Object.keys(rankStatLabels),...rankPhotoMetrics,...Object.keys(rankOpinionLabels),'saved']);
const rankParams=new URLSearchParams(location.search);
let rankKey=knownRankKeys.has(rankParams.get('type'))?rankParams.get('type'):'arrivals';
let rankCountry='',rankCity='',rankRegion='',rankText='',rankOrder='default',rankAll=false;
const rankMonth=new Date().getMonth();
function rankYears(key){
 return [...new Set(all.flatMap(d=>key==='arrivals'?[d.arrivalsLast?.[0],d.arrivals2019>0?'2019':null]:key==='population'?[d.population?.[0]]:[]).filter(Boolean).map(String))].sort().reverse();
}
let statYear=rankYears(rankKey)[0]||'';
function rankGroup(){
 if(rankKey==='saved')return 'saved';
 if(rankPhotoMetrics.includes(rankKey))return 'photos';
 return rankOpinionLabels[rankKey]?'editor':'month';
}
const rankCityName=a=>t(a.cityJa||a.cityId,a.cityEn||a.cityId);
const rankAlbumLink=a=>'diary.html?country='+encodeURIComponent(a.countryId)+'&city='+encodeURIComponent(a.cityKey);
function rankHeading(){
 if(rankKey==='saved')return t('保存した旅先','Your saved destinations');
 if(rankKey==='rain')return t((rankMonth+1)+'月の旅先',new Intl.DateTimeFormat('en',{month:'long'}).format(new Date(2020,rankMonth,1))+' destinations');
 const labels=rankStatLabels[rankKey]||rankOpinionLabels[rankKey];
 if(labels)return t(...labels);
 const cat=rankCategories.find(item=>item[3]===rankKey);return t(cat[1]+'の旅先',cat[2]);
}
function rankBasis(){
 if(rankKey==='rain')return t('代表都市の平年降水量が少ない順 · WorldClim 1970–2000','Mean rainfall at the featured city · WorldClim 1970–2000');
 if(rankKey==='dailyCost')return t('1人1日あたりの費用が低い順 · 固定レートの円換算','Lower daily costs per person · fixed JPY conversion');
 if(rankKey==='arrivals'||rankKey==='population')return statYear+t('年・同じ年の収録値を比較',' · same-year observations');
 if(rankKey==='saved')return t('この端末で保存した国・都市・アルバムの件数','Country, city and album bookmarks on this device');
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
  const savedIds=new Set(fav()),savedAlbums=new Set(state.albumIds);
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
   else if(rankKey==='saved'){
    value=cityAlbums.filter(a=>savedAlbums.has(a.id)).length;
    if(!rankCity)value+=[...savedIds].filter(id=>id===d.id||id.startsWith(d.id+'~')).length;
   }else if(d.visited)value=d.ratings?.[rankKey];
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
 if(rankKey==='saved')return n+t('件',' saved');
 return rankPhotoMetrics.includes(rankKey)?n+t('枚',' photos'):n+' / 5';
}
function rankCard(r,i,podium){
 const isSaved=r.a?state.albumIds.includes(r.a.id):fav().includes(r.d.id);
 const label=t(r.ja,r.en),small=lang==='en'?(r.sub||''):r.en;
 return `<article class="${podium?'podium-card pos-'+i:'rank-postcard'}"><a class="rank-image-link" href="${esc(r.url)}"><img src="${esc(r.src)}" alt="" loading="${podium?'eager':'lazy'}"><span class="rank-ink"><strong>${esc(label)}</strong><small>${esc(small)}</small></span></a><b class="medal">${r.rank}</b><footer><span>${esc(rankDisplay(r.value))}</span><button class="rank-bookmark" ${r.a?'data-rank-album="'+esc(r.a.id)+'"':'data-rank-save="'+esc(r.d.id)+'"'} aria-pressed="${isSaved}" aria-label="${esc(label+' '+t('を保存','bookmark'))}">${isSaved?'♥':'♡'}</button></footer></article>`;
}
function rankEmpty(){
 if(rankKey==='saved'&&!fav().length&&!state.albumIds.length)return `<p>${t('旅先やアルバムの♡を押すと、ここに集まります。','Tap a heart on a destination or album to start your collection.')}</p><a class="jewel-action" href="diary.html">${t('アルバムを開く','Browse albums')} ↗</a>`;
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
 const pageEl=document.querySelector('.rank-page'),panel=document.querySelector('#ranking-results'),filters=document.querySelector('#collection-rank-tools'),extraButton=document.querySelector('#rank-filter-toggle'),form=document.querySelector('#rank-search');
 const draw=()=>{panel.innerHTML=collectionRankResults()};
 function drawFilters(){
  filters.innerHTML=rankTools();filters.querySelector('#rank-region').value=rankRegion;filters.querySelector('#rank-extra').hidden=extraButton.getAttribute('aria-expanded')!=='true';
 }
 function choose(key){
  if(!knownRankKeys.has(key))return;
  rankKey=key;statYear=rankYears(key)[0]||'';rankAll=false;
  if(rankGroup()!=='photos'&&rankGroup()!=='saved')rankCity='';
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
  if(btn.dataset.rankAlbum){refreshPassport();const id=btn.dataset.rankAlbum,prev=state.albumIds;state.albumIds=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];if(!save())state.albumIds=prev;draw()}
 });
 const search=()=>{rankText=form.elements.q.value;rankAll=false;draw()};form.onsubmit=e=>{e.preventDefault();search()};form.oninput=search;
 filters.onchange=e=>{const id=e.target.id,value=e.target.value;rankAll=false;
  if(id==='rank-metric'){choose(value);return}
  if(id==='rank-country'){rankCountry=value;rankCity='';drawFilters()}
  if(id==='rank-city'){rankCity=value;if(value){rankCountry=albums().find(a=>a.cityKey===value)?.countryId||'';if(!['photos','saved'].includes(rankGroup())){choose('photo');return}}drawFilters()}
  if(id==='rank-year')statYear=value;
  if(id==='rank-region')rankRegion=value;
  if(id==='rank-order')rankOrder=value;
  draw();
 };
 window.addEventListener('pageshow',()=>{refreshPassport();draw()});
 window.addEventListener('storage',e=>{if(!e.key||e.key==='torami-my-trip'||e.key==='torami-saved'){refreshPassport();draw()}});
}

function mytrip(){return `${collectionHero('trip','My Trip')}<section class="collection-page trip-page"><nav class="glass-ribbon trip-tabs" role="tablist">${[[0,'✧','Passport','訪問記録'],[4,'♢','My Map','地図で登録'],[1,'☆','Bucket List','行きたい'],[2,'♡','Favorites','お気に入り'],[3,'▦','Planner','旅の予定']].map(([n,i,en,ja])=>`<button role="tab" data-trip-tab="${n}" aria-selected="${n===tripTab}"><i>${i}</i><span>${en}<small>${t(ja,en)}</small></span></button>`).join('')}</nav><div id="trip-panel">${tripTab===4?myMap():''}</div><p class="storage-note">${t('このブラウザに保存されます。端末の変更にはバックアップをご利用ください。','Saved in this browser. Export a backup to switch devices.')}</p><div class="backup-bar glass"><button class="button soft" id="backup-download">${t('バックアップを保存','Export backup')}</button><label class="button soft">${t('バックアップを復元','Import backup')}<input type="file" id="backup-import" accept="application/json" class="sr-only"></label><p id="backup-status" role="status"></p></div></section>`}
function passport(){
 const list=all.filter(d=>state.visited.includes(d.id)).sort((a,b)=>name(a).localeCompare(name(b),lang));
 return `<section class="passport-ledger crystal-panel">${chapter('My Travel Passport',t('わたしの訪問記録','My visited countries'))}<div class="passport-summary"><p><b>${list.length}</b> / ${all.length} ${t('カ国','countries')}</p><progress max="${all.length}" value="${list.length}"></progress><small>${Math.round(list.length*100/all.length)}%</small></div><div class="passport-atlas passport-mini" aria-hidden="true">${crystalMap(true)}</div><p class="trip-hint">${t('My Mapで訪問済みにした国が、ここに集まります。','Countries you mark as visited on My Map appear here.')}</p><button class="jewel-action" data-map-edit>${t('My Mapで訪問国を登録・編集','Edit visits on My Map')} ↗</button>${list.length?`<div class="stamp-book">${list.map(d=>`<a class="visit-stamp" href="${href(d)}">${photo(d)}<span>${esc(name(d))}</span></a>`).join('')}</div><button class="button soft" data-result-image="passport">${t('パスポート画像を保存','Save passport image')} ↓</button>`:''}</section>`;
}
function bucket(){return `<form id="bucket-form" class="feature-form glass"><label>${t('行きたい国・地域','Destination')}<select name="country">${options()}</select></label><label>${t('叶えたいこと','A place or experience')}<input name="title" maxlength="140" placeholder="${t('例：北欧でオーロラを見る','For example: see the northern lights')}" required></label><button class="button">${t('追加','Add')}</button></form><div class="bucket-list">${state.bucket.map(b=>`<article class="glass bucket-row"><input type="checkbox" data-bucket-done="${esc(b.id)}" ${b.done?'checked':''} aria-label="${t('達成','Completed')}"><div><strong>${esc(b.title)}</strong><p>${esc(by(b.country)?name(by(b.country)):'')}</p></div><button class="text-button" data-bucket-edit="${esc(b.id)}">${t('編集','Edit')}</button><button class="text-button" data-bucket-remove="${esc(b.id)}">×</button></article>`).join('')||missing('次の旅で、叶えたいこと。','What would you love to do?')}</div><p>${state.bucket.filter(b=>b.done).length} / ${state.bucket.length} · ${state.bucket.length?Math.round(state.bucket.filter(b=>b.done).length/state.bucket.length*100):0}%</p><h3>${t('行きたい国','Want to go')}</h3><div class="trip-tags">${state.wanted.map(by).filter(Boolean).map(d=>`<a href="${href(d)}">${esc(name(d))}</a>`).join('')}</div>`}
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
function enhance(html){if(page==='gacha')html=html.replace('<p class="gacha-count"',`<label>${t('国・都市','Country or city')}<select id="gacha-kind"><option value="country">${t('国・地域','Countries & regions')}</option><option value="city">${t('登録された都市','Registered cities')}</option></select></label><label>${t('現地予算／日（登録情報のみ）','Daily local budget · recorded JPY only')}<select id="gacha-budget"><option value="">${t('指定なし','Any budget')}</option><option value="10000">≤ ¥10,000</option><option value="20000">≤ ¥20,000</option><option value="40000">≤ ¥40,000</option></select></label><p class="gacha-count"`);if(page==='destinations')html=html.replace('<section class="wrap page-body">','<section class="wrap page-body">'+exploreTabs()+`<p class="insights-link"><a href="insights.html">TORAMI INSIGHTS ↗</a></p>`);if(page==='home')html+=`<section class="wrap feature-shortcuts">${link('discover.html','診断・クイズで旅を楽しむ','Discover your travel style')}${link('my-trip.html','My Travel Passport','My Travel Passport')}${link('insights.html','旅のデータを見る','Travel insights')}</section>`;return html}
const countryActions=d=>`<button class="button soft" data-compare-add="${d.id}">${t('比較に追加','Compare')}</button><button class="button soft" data-wanted="${d.id}">${t('行きたい','Want to go')}</button><a class="button soft" href="my-trip.html?country=${d.id}">${t('訪問・計画に追加','Record or plan a visit')}</a>`;
function download(blob,filename){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),20000)}
async function resultImage(title,subtitle){const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const x=canvas.getContext('2d'),g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#a8e0df');g.addColorStop(1,'#edf9f3');x.fillStyle=g;x.fillRect(0,0,1080,1350);x.strokeStyle='white';x.lineWidth=4;x.strokeRect(40,40,1000,1270);const logo=new Image();logo.src='assets/img/torami-pearl.webp';await logo.decode();x.drawImage(logo,120,110,840,280);x.textAlign='center';x.fillStyle='#245562';x.font='44px Georgia';x.fillText('TRAVEL',540,420);let size=70;do{x.font=size+'px Georgia';size-=2}while(x.measureText(title).width>950);x.fillText(title,540,620);x.font='36px sans-serif';const parts=Array.from(subtitle);let line='',y=720;for(const c of parts){if(x.measureText(line+c).width>880){x.fillText(line,540,y);y+=55;line=''}line+=c}x.fillText(line,540,y);x.font='30px Georgia';x.fillText('The World is Yours.',540,1190);const b=await new Promise(r=>canvas.toBlob(r,'image/png'));if(b)download(b,'torami-result.png')}
async function featureShare(){track('share_click');try{if(navigator.share)await navigator.share({title:'TORAMI TRAVEL',url:location.href});else{await navigator.clipboard.writeText(location.href);alert(t('リンクをコピーしました。','Link copied.'))}}catch(e){if(e.name!=='AbortError')openDialog(`<input value="${esc(location.href)}" readonly aria-label="URL">`)}}
let tripTab=({'#planner':3,'#passport':0,'#bucket':1,'#favorites':2})[location.hash]??4;
function showTrip(){const panel=document.getElementById('trip-panel');if(!panel)return;panel.innerHTML=[passport,bucket,()=>`<div class="destination-grid">${fav().map(by).filter(Boolean).map(card).join('')||missing('心に留まった旅先を。','Save the places that catch your eye.')}</div><p>${t('お気に入りは気になった旅先のブックマーク。行きたい国・達成したいことはBucket Listへ。','Favourites are bookmarks. Use Bucket List for places and experiences you want to pursue.')}</p>`,planner,myMap][tripTab]();bindTripPanel();}
function bindTripPanel(){if(tripTab===4)bindMyMap();if(tripTab===0){
 document.querySelectorAll('[data-pass-id]').forEach(el=>el.classList.toggle('stamped',state.visited.includes(el.dataset.passId)));
 document.querySelector('[data-map-edit]').onclick=()=>document.querySelector('[data-trip-tab="4"]').click();
}
if(tripTab===1){document.getElementById('bucket-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget,title=f.elements.title.value.trim();if(!title)return;state.bucket.push({id:crypto.randomUUID(),title,country:f.elements.country.value,done:false});if(f.elements.country.value&&!state.wanted.includes(f.elements.country.value))state.wanted.push(f.elements.country.value);save();showTrip()};document.querySelectorAll('[data-bucket-done]').forEach(b=>b.onchange=()=>{state.bucket.find(x=>x.id===b.dataset.bucketDone).done=b.checked;save();showTrip()});document.querySelectorAll('[data-bucket-remove]').forEach(b=>b.onclick=()=>{state.bucket=state.bucket.filter(x=>x.id!==b.dataset.bucketRemove);save();showTrip()});document.querySelectorAll('[data-bucket-edit]').forEach(b=>b.onclick=()=>{const item=state.bucket.find(x=>x.id===b.dataset.bucketEdit);openDialog(`<form id="bucket-edit-form"><label>${t('叶えたいこと','Your wish')}<input name="title" required maxlength="140" value="${esc(item.title)}"></label><button class="button">${t('保存','Save')}</button></form>`);document.getElementById('bucket-edit-form').onsubmit=e=>{e.preventDefault();item.title=e.currentTarget.elements.title.value.trim();save();document.getElementById('travel-dialog').close();showTrip()}})}
if(tripTab===3){document.getElementById('trip-new').onclick=()=>{activeTrip=crypto.randomUUID();state.trips.push({id:activeTrip,title:t('新しい旅行','A new journey'),country:by(diaryQuery.get('country'))?.id||'',start:'',end:'',days:[],costs:{},packing:[]});save();showTrip()};document.getElementById('trip-select').onchange=e=>{activeTrip=e.target.value;showTrip()};const f=document.getElementById('planner-form');if(!f)return;const p=state.trips.find(x=>x.id===activeTrip);const collect=()=>{p.title=f.elements.title.value;p.country=f.elements.country.value;p.start=f.elements.start.value;p.end=f.elements.end.value;p.costs={};costs.forEach(([k])=>p.costs[k]=Math.max(0,Math.min(1e8,Number(f.elements['cost-'+k].value)||0)));p.days=p.days.map((d,i)=>({date:f.querySelector(`[data-day-date="${i}"]`).value,note:f.querySelector(`[data-day-note="${i}"]`).value}));p.packing=p.packing.map((x,i)=>({text:f.querySelector(`[data-pack-text="${i}"]`).value,done:f.querySelector(`[data-pack-check="${i}"]`).checked}));return p};const calc=()=>{const vals=costs.map(([k,j,e])=>({label:t(j,e),value:Math.max(0,Number(f.elements['cost-'+k].value)||0)}));document.getElementById('trip-total').textContent='¥'+vals.reduce((n,x)=>n+x.value,0).toLocaleString();document.getElementById('budget-chart').innerHTML=bars(vals)};f.oninput=calc;calc();f.onsubmit=e=>{e.preventDefault();collect();if(p.start&&p.end&&p.start>p.end){document.getElementById('planner-status').textContent=t('帰国日は出発日以降にしてください。','Return date must be after departure.');return}save();document.getElementById('planner-status').textContent=t('このブラウザに保存しました。','Saved in this browser.')};document.getElementById('day-add').onclick=()=>{collect();p.days.push({date:p.start,note:''});showTrip()};document.getElementById('pack-add').onclick=()=>{collect();p.packing.push({text:'',done:false});showTrip()};document.querySelectorAll('[data-day-remove]').forEach(b=>b.onclick=()=>{collect();p.days.splice(Number(b.dataset.dayRemove),1);showTrip()});document.querySelectorAll('[data-pack-remove]').forEach(b=>b.onclick=()=>{collect();p.packing.splice(Number(b.dataset.packRemove),1);showTrip()});document.getElementById('trip-delete').onclick=()=>{if(confirm(t('この旅行計画を削除しますか？','Delete this trip plan?'))){state.trips=state.trips.filter(x=>x.id!==activeTrip);activeTrip=state.trips[0]?.id||'';save();showTrip()}};document.getElementById('trip-print').onclick=()=>{collect();save();window.print()}}}
function validBackup(v){if(!v||v.version!==1||!v.state||!Array.isArray(v.favorites))return false;const s=v.state;return (s.albumIds===undefined||Array.isArray(s.albumIds)&&s.albumIds.every(x=>typeof x==='string'))&&['visited','wanted','bucket','trips','history'].every(k=>Array.isArray(s[k])&&s[k].length<10000)&&s.visited.every(x=>typeof x==='string'&&by(x))&&s.wanted.every(x=>typeof x==='string'&&by(x))&&v.favorites.every(x=>typeof x==='string'&&by(x))&&s.bucket.every(x=>typeof x.id==='string'&&typeof x.title==='string'&&x.title.length<=140&&typeof x.done==='boolean')&&s.trips.every(x=>typeof x.id==='string'&&typeof x.title==='string'&&typeof x.start==='string'&&typeof x.end==='string'&&Array.isArray(x.days)&&x.days.every(d=>typeof d.date==='string'&&typeof d.note==='string')&&Array.isArray(x.packing)&&x.packing.every(p=>typeof p.text==='string'&&typeof p.done==='boolean')&&x.costs&&costs.every(([k])=>x.costs[k]===undefined||typeof x.costs[k]==='number'&&x.costs[k]>=0&&x.costs[k]<=1e8));}
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
if(page==='mytrip'){document.querySelectorAll('[data-trip-tab]').forEach(b=>b.onclick=()=>{tripTab=Number(b.dataset.tripTab);history.replaceState(null,'',['#passport','#bucket','#favorites','#planner','#map'][tripTab]);document.querySelectorAll('[data-trip-tab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));showTrip()});showTrip();document.getElementById('backup-download').onclick=()=>download(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state,favorites:fav()},null,2)],{type:'application/json'}),'torami-my-trip-backup.json');document.getElementById('backup-import').onchange=async e=>{const f=e.target.files[0],status=document.getElementById('backup-status');try{if(!f||f.size>5e6)throw Error();const v=JSON.parse(await f.text());if(!validBackup(v))throw Error();if(!confirm(t('現在のMy Tripをこのバックアップで置き換えますか？','Replace current My Trip data with this backup?')))return;Object.assign(state,{albumIds:[]},v.state);localStorage.setItem('torami-saved',JSON.stringify(v.favorites));save();location.reload()}catch{status.textContent=t('復元できませんでした。有効なTORAMIバックアップを選んでください。','Could not restore. Choose a valid TORAMI backup.')}}}
if(page==='quiz')document.getElementById('travel-quiz-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget,list=(window.TORAMI_DISCOVERY?.travelQuiz.questions||[]).filter(q=>(!f.elements.category.value||q.category===f.elements.category.value)&&(!f.elements.difficulty.value||q.difficulty===f.elements.difficulty.value));if(!list.length){document.getElementById('travel-quiz-body').innerHTML=missing('この条件の問題は準備中です。','No questions match these filters yet.');return}quizRun={questions:[...list].sort(()=>Math.random()-.5).slice(0,5),index:0,score:0,answered:false};track('quiz_start');document.getElementById('travel-quiz-body').innerHTML=quizBody()};
if(page==='diary')bindCrystalDiary();
if(page==='rankings')bindRank();

if(page==='gacha'){const h=document.getElementById('gacha-history-list');if(h){h.className='gacha-history-list';h.innerHTML=historyHTML()}}if(page==='destinations'){const form=document.getElementById('directory-form');let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>track('search_filter'),700)})}if(page==='country')track('destination_view',document.body.dataset.destination);
}
function openAlbum(id,start=0){const a=albums().find(x=>x.id===id);if(!a?.photos?.length)return;let index=Math.max(0,Math.min(start,a.photos.length-1));const draw=()=>{const p=a.photos[index];document.getElementById('dialog-content').innerHTML=`<article class="photo-lightbox"><h2>${esc(t(a.title,a.titleEn||a.title))}</h2><img src="${esc(p.src)}" alt="${esc(t(p.alt||'',p.altEn||p.alt||''))}"><p>${esc(t(p.caption||'',p.captionEn||p.caption||''))}</p><small>${esc(p.takenAt||'')} · ${esc(t(p.place||'',p.placeEn||p.place||''))}</small><div class="gallery-controls"><button id="album-prev" ${index===0?'disabled':''} aria-label="${t('前の写真','Previous photo')}">←</button><span>${index+1} / ${a.photos.length}</span><button id="album-next" ${index===a.photos.length-1?'disabled':''} aria-label="${t('次の写真','Next photo')}">→</button></div><div class="album-gallery">${a.photos.map((photo,i)=>`<button data-album-photo="${i}" aria-label="${t('写真','Photo')} ${i+1}"><img src="${esc(photo.src)}" alt="${esc(t(photo.alt||'',photo.altEn||photo.alt||''))}" loading="lazy"></button>`).join('')}</div></article>`;document.querySelectorAll('[data-album-photo]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.albumPhoto);draw()});document.getElementById('album-prev').onclick=()=>{index--;draw()};document.getElementById('album-next').onclick=()=>{index++;draw()}};openDialog('');draw();track('album_open',a.countryId)}
function historyHTML(){return state.history.map(x=>by(x.id)).filter(Boolean).map(d=>`<a href="${href(d)}">${photo(d)}${esc(name(d))}</a>`).join('')||`<p>${t('次のひと回しから、ここに残ります。','Your next draw will appear here.')}</p>`}function recordGacha(d){state.history.unshift({id:d.id,at:new Date().toISOString()});state.history=state.history.slice(0,30);save();const h=document.getElementById('gacha-history-list');if(h)h.innerHTML=historyHTML()}
function city(){const q=new URLSearchParams(location.search),d=by(q.get('country')),c=d?.cities?.find(x=>(x.id||x.name)===q.get('city'));return c?`${head(esc(c.name),esc(d.ja))}<section class="wrap page-body"><div class="glass feature-panel"><p>${esc(c.text||empty)}</p>${countryActions(by(d.id+'~'+(c.id||c.name)))}${link(href(d),'国の詳細へ','Country details')}</div>${albumSection(d.id)}</section>`:`${head('City Guide',t('都市の情報','City details'))}<div class="wrap page-body">${missing('都市を選んでください。','Choose a city from a destination page.')}${link('destinations.html','旅先を探す','Explore destinations')}</div>`}
return {pages:{rankings:collectionRank,diary:crystalDiary,city,discover,compare:comparison,calendar,mytrip,personality,quiz:travelQuiz,insights,privacy:()=>legal('privacy'),disclaimer:()=>legal('disclaimer'),contact:()=>legal('contact')},enhance,bind,countryActions,recordGacha,exploreTabs,t,compactCount,validBackup,visitedIds,setPassportStatus};
};
