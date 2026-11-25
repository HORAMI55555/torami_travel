(()=>{'use strict';
const D=window.TORAMI_DATA,all=D.destinations,Q=new URLSearchParams(location.search),page=document.body.dataset.page||'home',root=document.getElementById('app'),SSR=!!window.TORAMI_SSR;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const by=id=>{const direct=all.find(d=>[d.id,d.code].includes(id));if(direct)return direct;if(typeof id!=='string'||!id.includes('~'))return;const [parent,cid]=id.split('~');const d=all.find(x=>x.id===parent),c=d?.cities?.find(x=>(x.id||x.name)===cid);return c?{...d,...c,id,parentId:parent,en:c.nameEn||c.name,ja:c.nameJa||c.name,image:c.image||d.image,isCity:true}:undefined},asset=x=>'assets/img/'+x,href=d=>d.isCity?'city.html?country='+encodeURIComponent(d.parentId)+'&city='+encodeURIComponent(d.id.split('~')[1]):'country-'+d.id+'.html';
const validURL=u=>{try{return ['https:','http:'].includes(new URL(u).protocol)?u:''}catch{return ''}};
const safePhoto=u=>typeof u==='string'&&(/^(assets\/img\/|https:\/\/)/.test(u))&&!u.includes('..')?u:'';
const themes=[['beach','Beach & Resort','海とリゾート'],['city','City Wanderlust','街歩き'],['nature','Nature & Escape','自然と絶景'],['romance','Romantic Places','ロマンチック'],['history','Across the Centuries','歴史をたどる'],['winter','Winter Magic','冬の旅'],['design','Design & Discovery','デザイン']];
const reg={All:'すべて',Europe:'ヨーロッパ',Asia:'アジア',Africa:'アフリカ','North America':'北米・中米','South America':'南米',Oceania:'オセアニア'};
const ratingNames={city:'街並み',nature:'自然',hidden:'穴場',resort:'リゾート',overall:'おすすめ度',scenery:'景色',food:'ごはん',value:'コスパ',solo:'ひとり旅',return:'もう一度行きたい'};
const rankOptions={dailyCost:'旅費が手頃な順',arrivals:'国際観光客到着数',...ratingNames};
const nav=[['home','Home','ホーム','index.html'],['destinations','Explore','旅先を探す','destinations.html'],['discover','Discover','旅を楽しむ','discover.html'],['mytrip','My Trip','自分の旅','my-trip.html'],['diary','Diary','旅のアルバム','diary.html']];
const plane='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
let favorites=[];try{const v=JSON.parse(localStorage.getItem('torami-saved')||'[]');favorites=Array.isArray(v)?v:[]}catch{}
let lastResult=null,lastTrigger=null;const track=(event,id='')=>{if(location.hostname==='horami55555.github.io')try{window.goatcounter?.count({path:'torami-'+event+(id?'-'+id:''),title:event,event:true})}catch{}};
const btn=(label,url,soft=false)=>`<a class="button ${soft?'soft':''}" href="${esc(url)}">${label}<span aria-hidden="true">↗</span></a>`;
const head=(en,ja,copy='')=>`<header class="page-intro wrap"><p class="eyebrow">TORAMI TRAVEL</p><h1>${en}</h1><p class="ja-title">${ja}</p>${copy?`<p class="intro-copy">${copy}</p>`:''}</header>`;
const title=(en,ja,link='')=>`<div class="section-heading"><div><p class="eyebrow">${en}</p><h2>${ja}</h2></div>${link?`<a class="text-link" href="${link}">すべて見る ↗</a>`:''}</div>`;
function header(){return `<a class="skip-link" href="#main">本文へ</a><header class="site-header"><div class="header-inner">${page==='home'?'':`<a class="nav-back" href="${page==='country'||page==='rankings'||page==='compare'?'destinations.html':'index.html'}" aria-label="${F.t('前のページへ','Go back')}" title="${F.t('戻る','Back')}">‹</a>`}<a class="brand" href="index.html" aria-label="TORAMI TRAVEL ホーム">${plane}<span>TORAMI TRAVEL</span></a><button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="メニューを開く"><span></span><span></span><span></span></button><button class="language-toggle" id="language-toggle" type="button" aria-label="Switch to English">EN</button><nav class="site-nav" id="site-nav" aria-label="メインメニュー">${nav.map(([p,en,ja,url])=>`<a href="${url}" ${p===page?'aria-current="page"':''}><span>${en}</span><small>${ja}</small></a>`).join('')}</nav></div></header>`;}
function footer(){return `<footer class="site-footer wrap"><div class="footer-top"><div><a class="footer-brand" href="index.html">TORAMI TRAVEL</a><p>次の旅に恋する場所。</p></div><nav aria-label="フッター">${nav.slice(1).map(([,en,ja,u])=>`<a href="${u}">${en}</a>`).join('')}<a href="about.html">About TORAMI</a><a href="insights.html">TORAMI INSIGHTS</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="disclaimer.html">Disclaimer</a></nav></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} TORAMI TRAVEL</span><a class="instagram-pill" href="${D.instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div></footer>`;}
function photo(d,cls='',eager=false){return `<img class="country-photo ${cls}" src="${asset(d.image)}" alt="${esc(d.ja)}の旅先イメージ" width="900" height="1200" loading="${eager?'eager':'lazy'}" decoding="async">`;}
function heart(d){return `<button class="heart ${favorites.includes(d.id)?'saved':''}" data-save="${d.id}" aria-label="${esc(d.ja)}を保存" aria-pressed="${favorites.includes(d.id)}">${favorites.includes(d.id)?'♥':'♡'}</button>`;}
function card(d){return `<article class="destination-card"><div class="card-visual"><a href="${href(d)}">${photo(d)}<span class="image-glint" aria-hidden="true">✧</span></a>${heart(d)}${d.visited?'<span class="visited-badge">✦ Visited</span>':''}</div><div class="card-copy"><p class="eyebrow">${d.region}</p><h3><a href="${href(d)}">${esc(d.en)}</a></h3><p>${esc(d.ja)}</p><a class="text-link" href="${href(d)}">この旅先を見る <span>↗</span></a><button class="text-button" data-compare-add="${d.id}">Compare ＋</button></div></article>`;}
function empty(en,ja,link=''){return `<div class="empty-state glass"><span aria-hidden="true">✧</span><h3>${en}</h3><p>${ja}</p>${link?btn('旅先を探す',link,true):''}</div>`;}
function crystalMap(readOnly=false){
  const title=F.t('国を選べる宝石の世界地図','Interactive crystal world map');
  const countries=(window.TORAMI_JEWEL_COUNTRIES||[]).map(shape=>{
    const d=by(shape.code);
    const id='jewel-'+shape.code;
    const point=shape.point;
    const face=point
      ? `<circle id="${id}" cx="${point[0]}" cy="${point[1]}" r="1.12"/>`
      : `<path id="${id}" fill-rule="evenodd" d="${shape.d}"/>`;
    const layers=`<defs>${face}</defs><use href="#${id}" class="gem-face ${point?'gem-pin':''}"/><use href="#${id}" class="gem-rim"/><use href="#${id}" class="gem-light"/>`;
    if(!d)return `<g class="gem-land" aria-hidden="true">${layers}</g>`;
    if(readOnly)return `<g class="pass-country" data-pass-id="${d.id}">${layers}</g>`;
    const name=esc(F.t(d.ja,d.en));
    return `<g class="gem-country" data-map-country="${d.id}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="${name}"><title>${name}</title>${layers}</g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="jewel-world" viewBox="8 94 978 584" role="group" aria-label="${title}"><defs>
    ${[1,2,3,4,5,6].map(i=>`<pattern id="jewel-tone-${i}" width="1000" height="750" patternUnits="userSpaceOnUse"><image href="assets/img/crystal-${i}.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern>`).join('')}
    ${readOnly?`<pattern id="pass-visited" width="1000" height="750" patternUnits="userSpaceOnUse"><image href="assets/img/collection/purple.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern>`:''}
    <pattern id="gem-art" x="0" y="0" width="1000" height="750" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse"><image href="assets/img/world-map-jewels.webp" x="0" y="90" width="1000" height="591" preserveAspectRatio="none"/></pattern>
    <linearGradient id="lit-stone" x2=".7" y2="1"><stop stop-color="#ffffff" stop-opacity=".84"/><stop offset=".33" stop-color="#b6ffe4" stop-opacity=".65"/><stop offset=".54" stop-color="#fff5bc" stop-opacity=".78"/><stop offset=".69" stop-color="#dcfff3" stop-opacity=".43"/><stop offset="1" stop-color="#66f9da" stop-opacity=".55"/></linearGradient>
    </defs>${countries}</svg>`;
}
function mapHeading(){return `<div class="map-heading"><h2>The World is Yours.</h2><p>Collect the world, one journey at a time.</p><span aria-hidden="true">──── ✧ ────</span></div>`}
function mapZoomControls(){return `<div class="gem-zoom-buttons" role="group" aria-label="${F.t('地図の倍率','Map zoom')}"><button type="button" id="gem-minus" aria-label="${F.t('地図を縮小','Zoom out')}" disabled>−</button><button type="button" id="gem-scale" aria-label="${F.t('地図を等倍に戻す','Reset zoom')}">100%</button><button type="button" id="gem-plus" aria-label="${F.t('地図を拡大','Zoom in')}">＋</button></div>`}
function mapHero(){return `<section class="map-picture live-atlas" id="travel-map" aria-label="宝石の世界地図">${mapHeading()}<div class="map-toolbar"><div class="map-switcher">${atlas.menu()}</div></div><aside id="atlas-caption" class="atlas-caption glass" aria-live="polite" hidden></aside><div class="map-viewport" id="map-viewport">${crystalMap()}</div><div class="map-utility"><p id="map-highlight-status" role="status">${F.t('世界の197カ国','197 countries')}</p><div class="map-zoom">${mapZoomControls()}<label class="map-picker-label">国名から選ぶ<select id="map-country-picker"><option value="">国・地域を選ぶ</option>${all.map(d=>`<option value="${d.id}">${esc(d.ja)}</option>`).join('')}</select></label></div><a class="my-map-link" href="my-trip.html#map"><span aria-hidden="true">✧</span> My Map <small>${F.t('自分の地図を見る','Open my map')}</small> →</a></div></section><section class="map-results wrap" id="map-results" hidden aria-live="polite"></section>`;}

function home(){return `<div class="hero-brand-area wrap"><p class="eyebrow">DISCOVER · DREAM · EXPLORE</p><h1 class="pearl-brand"><img src="assets/img/torami-pearl.webp" alt="TORAMI" width="1392" height="464" fetchpriority="high"><span>TRAVEL</span></h1>${['GR','IT','JP','FR','IS','MX'].map((c,i)=>`<a class="photo-bubble photo-bubble-${i}" href="${href(by(c))}" aria-label="${by(c).ja}へ">${photo(by(c),'',true)}</a>`).join('')}${Array.from({length:6},(_,i)=>`<span class="soap-bubble bubble-${i}" aria-hidden="true"></span>`).join('')}</div><nav class="home-quick-links" aria-label="旅の見つけ方"><a href="#travel-map">地図で探す</a><a href="destinations.html">写真で探す</a><a href="gacha.html">ガチャで選ぶ</a></nav>${mapHero()}<div class="wrap home-sections"><section class="home-paths" aria-label="旅の見つけ方">${[['01','Destinations','好きな景色から選ぶ','destinations.html'],['02','Travel Gacha','次の行き先を引いてみる','gacha.html'],['03','Travel Ranking','データや写真から旅先を比べる','rankings.html']].map(([n,en,ja,u])=>`<a class="glass path-card" href="${u}"><small>${n}</small><div><h2>${en}</h2><p>${ja}</p></div><span>↗</span></a>`).join('')}</section><section class="mood-section">${title('FOLLOW YOUR FEELING','どんな景色に会いに行く？','destinations.html')}<div class="mood-grid">${[['beach','GR','Sea, softly.','透明な海で、何もしない休日。'],['city','FR','A little romance.','路地のカフェと、美しい街並み。'],['nature','IS','Into the wonder.','写真に収まりきらない景色へ。']].map(([id,c,en,ja])=>`<a class="mood-card" href="destinations.html?theme=${id}">${photo(by(c))}<div><h3>${en}</h3><p>${ja} ↗</p></div></a>`).join('')}</div></section><section class="home-diary">${title('POSTCARDS FROM TORAMI','旅の記憶を、ひとつずつ。','diary.html')}${D.diaries.filter(x=>x.published).length?`<div class="diary-grid">${D.diaries.filter(x=>x.published).slice(0,3).map(s=>{const album=(window.TORAMI_ALBUMS||[]).find(a=>a.id===s.id);return album?`<a class="home-album" href="diary.html?country=${esc(album.countryId)}&amp;city=${esc(album.cityKey)}"><img src="${esc(album.cover)}" alt="${esc(F.t(album.photos[0].alt,album.photos[0].altEn||album.cityEn))}" loading="lazy"><span><small>${album.photos.length} PHOTOS</small><strong>${esc(album.cityEn)}</strong><em>${esc(F.t(album.cityJa,by(album.countryId).en))} ↗</em></span></a>`:story(s)}).join('')}</div>`:`<a class="diary-invitation glass" href="diary.html"><span class="diary-monogram">T.</span><div><p class="eyebrow">THE PERSONAL ALBUM</p><h3>Some places stay with you.</h3><p>旅先で撮った写真と、そのときの気持ちを。<br>旅先で撮った写真を、少しずつまとめていきます。</p></div><span>↗</span></a>`}</section></div>`;}
function moodShelf(){return `<section class="mood-shelf" aria-label="旅の気分から選ぶ"><div class="mood-shelf-heading"><p class="eyebrow">THE MOODBOARD</p><h2>いま、惹かれる景色。</h2><p>写真を選んで、旅先を絞り込む。</p></div><div class="mood-scroll">${[['','JP','Everywhere','すべての旅'],['beach','GR','Blue Escape','海辺の休日'],['city','FR','City Reverie','絵になる街'],['nature','IS','Wild Wonder','忘れられない絶景'],['romance','IT','Amore','ふたりの時間'],['history','EG','Timeless','歴史を歩く'],['winter','FI','Winter Glow','雪と光の旅'],['design','DK','Aesthetic Days','好きなデザインを探す']].map(([k,c,en,ja])=>`<button type="button" class="mood-tile" data-mood="${k}" aria-pressed="${(Q.get('theme')||'')===k}">${photo(by(c))}<span class="mood-tile-copy"><strong>${en}</strong><small>${ja}</small></span><span class="mood-tick" aria-hidden="true">✓</span></button>`).join('')}</div></section>`}
function destinations(){return `${head('Destinations','写真から、次の旅へ。','197カ国から旅先を探す。')}<section class="wrap page-body">${moodShelf()}<form id="directory-form" class="directory-filters glass"><label class="search-field"><span>⌕</span><input id="country-query" type="search" placeholder="国名・地域・キーワードで探す" aria-label="旅先を検索" value="${esc(Q.get('q')||'')}"></label><div class="filter-selects"><label>地域<select id="country-region">${Object.entries(reg).map(([k,v])=>`<option value="${k}" ${Q.get('region')===k?'selected':''}>${v}</option>`).join('')}</select></label><label class="mood-select-fallback">旅の気分<select id="country-theme"><option value="">すべての気分</option>${themes.map(([k,en,j])=>`<option value="${k}" ${Q.get('theme')===k?'selected':''}>${j}</option>`).join('')}</select></label><label>表示する旅先<select id="country-collection">${[['all','すべての旅先'],['visited','トラみちゃんの訪問先'],['saved','♡ このブラウザに保存した旅先']].map(([k,j])=>`<option value="${k}" ${Q.get('collection')===k?'selected':''}>${j}</option>`).join('')}</select></label></div><div class="filter-bottom"><p>テーマは旅先を見つけるためのイメージ分類です。</p><button type="reset" class="text-button">条件をリセット</button></div></form><div class="list-meta"><p id="directory-count" role="status">${all.length}件の旅先</p><span>YOUR NEXT CHAPTER</span></div><div class="destination-grid" id="destination-grid">${all.slice(0,18).map(card).join('')}</div><div class="load-more-row"><button id="load-more" class="button soft">もっと旅先を見る ＋</button></div><p class="saved-explanation">♡はこのブラウザだけに保存されます。ログイン不要・ほかの端末とは同期しません。</p><p class="fine-print">197カ国の画像は旅先を表現したイメージビジュアルです。本人が撮影した写真はDiaryに掲載します。保存内容はこのブラウザ内に残ります。</p></section>`;}
function related(d){const options=all.filter(x=>x.id!==d.id);return options.sort((a,b)=>b.tags.filter(t=>d.tags.includes(t)).length-a.tags.filter(t=>d.tags.includes(t)).length).slice(0,3);}

function guideSource(url,label){
 const clean=validURL(url);
 return clean?`<a class="guide-source" href="${esc(clean)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
}
function countryMoney(budget){
 if(!(Number(budget?.daily)>0)||budget.status==='review')return '';
 const n=Number(budget.daily);
 if(budget.currency==='JPY')return F.t(n>=10000?'約'+Number((n/10000).toFixed(1))+'万円':'約'+(Math.round(n/100)*100).toLocaleString()+'円','≈ ¥'+(Math.round(n/100)*100).toLocaleString('en'));
 return budget.currency+' '+n.toLocaleString();
}
function climateTable(d){
 const c=d.climate,t=F.t;if(!c)return '';
 const month=new Date().getMonth(),monthName=i=>t((i+1)+'月',new Intl.DateTimeFormat('en',{month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2020,i,1))));
 return `<section class="guide-climate guide-paper" id="climate"><header class="guide-heading"><div><p class="eyebrow">CLIMATE</p><h2>${t('旅する月の気候','Climate by month')}</h2><p>${esc(c.place)} · ${t('代表地点の平年値','Reference location · climate normals')}</p></div><label>${t('旅行月','Travel month')}<select id="guide-month">${c.temp.map((_,i)=>`<option value="${i}" ${month===i?'selected':''}>${monthName(i)}</option>`).join('')}</select></label></header><div class="climate-readings" aria-live="polite"><div><span>${t('平均気温','Mean temperature')}</span><b id="guide-temp">${esc(c.temp[month])} °C</b></div><div><span>${t('月間降水量','Monthly rainfall')}</span><b id="guide-rain">${esc(c.rain[month])} mm</b></div></div><details><summary>${t('12カ月を比べる','Compare all 12 months')}</summary><div class="table-scroll"><table><thead><tr><th scope="col">${t('月','Month')}</th>${c.temp.map((_,i)=>`<th scope="col">${monthName(i)}</th>`).join('')}</tr></thead><tbody>${[[c.temp,t('気温','Temp.')+' °C'],[c.rain,t('雨量','Rain')+' mm']].map(([r,label])=>`<tr><th scope="row">${label}</th>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>${guideSource('https://www.worldclim.org/data/worldclim21.html','WorldClim 2.1 · 1970–2000')}</section>`;
}
function detail(){
 const t=F.t,d=by(document.body.dataset.destination||Q.get('country'));if(!d)return notFound();
 const b=d.budget||{},safe=d.safety||{},pr=d.practical||{},price=countryMoney(b);
 const records=(window.TORAMI_ALBUMS||[]).filter(a=>a.published&&a.countryId===d.id&&a.photos?.length);
 const rates=Object.entries(ratingNames).filter(([key])=>Number(d.ratings?.[key])>0);
 const hasNotes=d.visited&&(d.review||d.recommendation||rates.length||d.highlights?.length||d.visitCount);
 const monthURL='my-trip.html?country='+encodeURIComponent(d.id),diaryURL='diary.html?country='+encodeURIComponent(d.id);
 const selections=d.tags.filter(id=>themes.some(row=>row[0]===id)).map(id=>{const [,en,ja]=themes.find(row=>row[0]===id);return `<a href="destinations.html?theme=${id}">${esc(t(ja,en))}</a>`}).join('');
 const links=(id,label)=>`<a href="#${id}">${label}</a>`;
 const fact=(label,value,caption='')=>value?`<div><dt>${label}</dt><dd>${esc(value)}</dd>${caption?`<small>${caption}</small>`:''}</div>`:'';
 const region=t(reg[d.region]||d.region,d.region);
 const mapAction=`<a class="button" href="${monthURL}#map">${t('My Mapに記録','Mark on My Map')} ↗</a>`;
 const guideName=t(d.ja,d.en);
 const level=Number.isInteger(safe.mofaLevel)?safe.mofaLevel:null;
 const levelNames=[t('危険情報の発出なし','No advisory issued'),t('十分注意','Exercise caution'),t('不要不急の渡航中止','Avoid nonessential travel'),t('渡航中止','Avoid travel'),t('退避','Evacuate')];
 const risk=level===null?(d.code==='JP'?t('日本国内','Domestic destination in Japan'):t('公式情報を確認','Check official advice')):level===0?levelNames[0]:t('域内最高レベル','Highest regional level ')+level+' · '+levelNames[level];
 const stat=(v,label,source,person)=>v?`<div><dt>${label}</dt><dd>${esc(F.compactCount(v[1],person))}</dd><small>${esc(v[0])} · ${guideSource(source,t('出典','Source'))}</small></div>`:'';
 const visitDate=a=>(a.visitMonths?.length?a.visitMonths:[a.date]).filter(Boolean).slice().sort().filter((_,i,r)=>!i||i===r.length-1).map(m=>m.replace('-','.')).join(' – ');
 return `<article class="wrap country-guide">
 <nav class="breadcrumb" aria-label="${t('現在地','Breadcrumb')}"><a href="destinations.html">Explore</a><span>／</span><span>${esc(guideName)}</span></nav>
 <header class="guide-cover"><figure>${photo(d,'',true)}<figcaption>${esc(d.imageType==='photo'?t('旅先写真','Destination photograph'):t('旅先のイメージ','Destination illustration'))}${d.imageSource?' · '+guideSource(d.imageSource,'Unsplash'):''}</figcaption></figure><div class="guide-title"><p class="eyebrow">${esc(region)}${d.visited?' · TORAMI VISITED':''}</p><h1>${esc(guideName)}</h1><p class="guide-title-en">${esc(t(d.en,''))}</p><p class="guide-lede">${esc(t(d.lineJa,d.lineEn||d.lineJa))}</p>${d.summary?`<p>${esc(d.summary)}</p>`:''}<div class="guide-tags">${selections}</div><div class="guide-actions" id="plan">${mapAction}<button class="button soft" data-save="${d.id}" aria-pressed="${favorites.includes(d.id)}">${favorites.includes(d.id)?t('♥ お気に入り済み','♥ Saved'):t('♡ お気に入り','♡ Favorite')}</button><a class="button soft" href="${monthURL}#planner">${t('計画する','Plan a trip')} ↗</a></div></div></header>
 <nav class="guide-index" aria-label="${t('ページ内メニュー','Page sections')}">${links('essentials',t('基本情報','Essentials'))}${d.climate?links('climate',t('月別の気候','Climate')):''}${records.length?links('country-diary',t('旅の写真','Photo diary')):''}${hasNotes?links('notes',t('旅のノート','Travel notes')):''}</nav>
 <section class="guide-paper" id="essentials"><header class="guide-heading"><div><p class="eyebrow">BEFORE YOU GO</p><h2>${t('ひと目でわかる旅の基本','Travel essentials')}</h2></div></header><dl class="guide-facts">${fact(t('1人1日の現地予算','Local budget per person/day'),price||t('データなし','No data'),price?'<a href="#guide-budget">'+t('内訳・換算','Basis & conversion')+' ↓</a>':'')}${fact(t('通貨','Currency'),pr.currency)}${fact(t('言語','Language'),pr.language)}${d.season?.length?fact(t('おすすめの月','Suggested months'),d.season.join(' / ')):''}</dl><div class="guide-advisory"><div><span class="guide-advisory-label">${t('外務省の渡航情報','Japan MOFA travel advisory')}</span><strong>${esc(risk)}</strong>${safe.updatedAt?`<small>${t('確認','Checked')} ${esc(safe.updatedAt)}</small>`:''}</div>${d.code==='JP'?'':guideSource(safe.source||'https://www.anzen.mofa.go.jp/',t('地域別の最新情報','Latest regional advice'))}</div>
 ${price?`<details id="guide-budget"><summary>${t('現地予算の算出条件','Budget estimate details')}</summary><p>${Number(b.daily).toLocaleString()} ${esc(b.currency)} · ${esc(b.basis)} · ${t('収録','Recorded')} ${esc(b.updatedAt)}</p>${guideSource(b.source,t('費用の出典','Budget source'))}</details>`:''}
 <details><summary>${t('統計・出典','Statistics and sources')}</summary><dl class="guide-facts">${stat(d.arrivalsLast,t('国際観光客到着数','International arrivals'),d.arrSource,false)}${stat(d.population,t('人口','Population'),'https://data.worldbank.org/indicator/SP.POP.TOTL',true)}${fact(t('物価水準','Price level'),pr.prices,pr.prices?guideSource('https://data.worldbank.org/indicator/PA.NUS.PRVT.PP','PPP')+' · '+guideSource('https://data.worldbank.org/indicator/PA.NUS.FCRF',t('為替','Exchange rate')):'')}</dl>${guideSource('https://github.com/restcountries/restcountries','Currency & language · REST Countries')}</details>
 ${[pr.access,pr.clothing,pr.tips].some(Boolean)?`<dl class="guide-facts">${fact(t('アクセス','Getting there'),pr.access)}${fact(t('服装','What to wear'),pr.clothing)}${fact(t('旅のヒント','Travel tips'),pr.tips)}</dl>`:''}</section>
 ${climateTable(d)}
 ${records.length?`<section class="guide-paper" id="country-diary"><header class="guide-heading"><div><p class="eyebrow">TORAMI’S PHOTO DIARY</p><h2>${t('旅先で撮った写真','Photographed on the journey')}</h2></div></header><div class="guide-albums">${records.map(a=>`<a href="${diaryURL}&amp;city=${encodeURIComponent(a.cityKey||a.cityId||'')}"><img src="${esc(a.cover||a.photos[0].src)}" alt="${esc(t(a.title,a.titleEn||a.title))}" loading="lazy"><span><small>${esc(visitDate(a))}</small><b>${esc(t(a.cityJa||a.cityId,a.cityEn||a.cityId))}</b>${a.photos.length}${t('枚を見る',' photos')} ↗</span></a>`).join('')}</div></section>`:''}
 ${hasNotes?`<section class="guide-paper" id="notes"><p class="eyebrow">TORAMI’S NOTES</p><h2>${t('旅のノート','Personal travel notes')}</h2>${d.recommendation?`<h3>${esc(d.recommendation)}</h3>`:''}${d.review?`<p>${esc(d.review).replace(/\n/g,'<br>')}</p>`:''}${d.visitCount?`<p>${esc(d.visitCount)} ${t('回訪問','visits')} · ${esc(d.visitedAt)}</p>`:''}<dl class="guide-facts">${rates.map(([key,label])=>fact(t(label,key),String(d.ratings[key])+' / 5')).join('')}</dl>${(d.highlights||[]).map(h=>`<h3>${esc(h.title)}</h3><p>${esc(h.text)}</p>`).join('')}</section>`:''}
 ${d.cities?.length?`<section class="guide-paper"><h2>${t('都市ガイド','City guides')}</h2>${d.cities.map(c=>`<p><a href="city.html?country=${d.id}&amp;city=${encodeURIComponent(c.id||c.name)}">${esc(c.name)} ↗</a> ${esc(c.text||'')}</p>`).join('')}</section>`:''}
 <div class="guide-secondary"><button type="button" class="text-button" data-compare-add="${d.id}">${t('比較に追加','Add to compare')} ＋</button><button type="button" class="text-button" data-country-share="${d.id}">${t('この旅先をシェア','Share destination')} ↗</button><p class="share-status" role="status"></p></div>
 <section class="country-section"><div class="guide-heading"><div><p class="eyebrow">EXPLORE MORE</p><h2>${t('雰囲気の似た旅先','Similar destinations')}</h2></div></div><div class="destination-grid related-grid">${related(d).map(card).join('')}</div></section></article>`;
}
function gacha(){return `${head('Travel Gacha','行き先が決まらない日に。','気になるテーマを選んで、ひと回し。')}<div class="wrap page-body"><section class="gacha-layout"><div class="gacha-stage glass"><p class="eyebrow">YOUR NEXT ADVENTURE</p><div class="gacha-machine" id="gacha-machine"><img src="assets/img/gacha.webp" alt="旅のカプセルが詰まった宝石のガチャ" width="562" height="796"><div class="capsule-wheel" aria-hidden="true">${['JP','GR','FR','IS','IT','EG'].map((k,i)=>`<i style="--i:${i};background-image:url('${asset(by(k).image)}')"></i>`).join('')}</div><button class="gacha-handle" id="gacha-handle" aria-label="ガチャのハンドルを回す"><span></span></button><div class="capsule-drop" aria-hidden="true"><span>✧</span></div><button class="machine-spin" id="spin-button">今すぐ旅ガチャを回す <span>↻</span></button></div><p class="draw-status" id="draw-status" role="status">次は、どこへ行こう。</p></div><div class="gacha-controls glass"><p class="eyebrow">A LITTLE CHANCE</p><h2>Where to next?</h2><p>今の気分に合う条件を選んでね。</p><label>旅の気分<select id="gacha-theme"><option value="">すべての気分</option>${themes.filter(x=>all.some(d=>d.tags.includes(x[0]))).map(([k,e,j])=>`<option value="${k}" ${Q.get('theme')===k?'selected':''}>${j}</option>`).join('')}</select></label><label>行きたいエリア<select id="gacha-region">${Object.entries(reg).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>抽選する旅先<select id="gacha-collection"><option value="all">すべての国・地域</option><option value="visited">トラみちゃんの訪問先</option><option value="saved">♡ このブラウザに保存した旅先</option></select></label><p class="gacha-count" id="gacha-count"></p><div class="control-divider"></div><p>気分が決まらないときは…</p><a class="text-link" href="personality.html">Travel Personality ↗</a></div></section><section class="gacha-result" id="gacha-result" aria-live="polite"></section><section class="gacha-history glass"><h2>Recent journeys</h2><div id="gacha-history-list"></div></section></div>`;}
const quizOptions=[['旅先で、いちばん心が動くのは？',['透き通る海','美しい街並み','壮大な自然','歴史を感じる場所']],['理想の休日の過ごし方は？',['波音を聞いてのんびり','カフェと路地を散歩','森や山で深呼吸','古い物語を探検']],['旅から持ち帰りたいものは？',['ゆったりした気持ち','街角の小さなときめき','忘れられない絶景','知らなかった世界の発見']]];
const quizTypes=[['beach','Crystal Coast Dreamer','海辺で心をほどく旅'],['city','Romantic City Wanderer','街角の物語を探す旅'],['nature','Nature & Wonder Seeker','写真に収まりきらない景色へ。'],['history','Timeless Story Collector','時を越える物語を集める旅']];
function quizHTML(step,answers){if(step===3){let scores=[0,0,0,0];answers.forEach(x=>scores[x]++);const chosen=answers.find(x=>scores[x]===Math.max(...scores)),r=quizTypes[chosen];return `<p class="eyebrow">YOUR TRAVEL PERSONALITY</p><h3>${r[1]}</h3><p>${r[2]}</p>${btn('このタイプの旅先を見る','destinations.html?theme='+r[0])}<button class="text-button" data-quiz-apply="${r[0]}">この気分でガチャを回す ↑</button><button class="text-button" id="quiz-reset">もう一度診断する</button><p class="fine-print">旅の気分を探すエンターテインメント診断です。</p>`;}return `<p class="eyebrow">${step+1} / 3</p><h3>${quizOptions[step][0]}</h3><div class="quiz-options">${quizOptions[step][1].map((s,i)=>`<button data-answer="${i}">${s}<span>↗</span></button>`).join('')}</div>${step?'<button id="quiz-back" class="text-button">← 前の質問</button>':''}`;}
function resultHTML(d){return `<article class="destiny-card glass"><div class="result-image">${photo(d,'',true)}</div><div class="result-copy"><p class="eyebrow">YOUR TRAVEL DESTINY</p><h2>${esc(d.en)}</h2><h3>${esc(d.ja)}</h3>${d.safety?.mofaLevel>=2?`<a class="jewel-action" target="_blank" rel="noopener" href="${esc(d.safety.source)}">外務省の地域別危険情報を見る ↗</a>`:''}<p class="result-line">${esc(d.lineJa)}</p>${btn('この国・地域の詳細を見る',href(d))}<div class="result-actions">${heart(d)}<button class="button soft" id="result-share">シェア ↗</button><button class="button soft" id="result-export">画像を保存 ↓</button></div><p class="share-status" role="status"></p><button class="text-button" id="spin-again">もう一度ガチャへ ↑</button></div></article>`;}
function rankings(){const selected=Object.hasOwn(rankOptions,Q.get('type'))?Q.get('type'):'dailyCost';return `${head('Real Rankings','旅したからこそ、伝えたい。','旅費や観光統計、トラみちゃんの体験評価から旅先を比較。')}<div class="wrap page-body"><div class="ranking-tabs" role="group" aria-label="ランキングの種類">${Object.entries(rankOptions).map(([k,l])=>`<button data-rank="${k}" aria-pressed="${selected===k}">${l}</button>`).join('')}</div><section id="ranking-results">${rankingHTML(selected)}</section></div>`;}
let rankDirection='default',expanded=false,rankYear='2025';
function rankingHTML(key){
 const cost=key==='dailyCost', arrivals=key==='arrivals';
 const score=d=>cost?d.budget?.daily:arrivals?(String(d.arrivalsLast?.[0])===rankYear?d.arrivalsLast[1]:0):(d.visited?d.ratings?.[key]:0);
 const rows=all.filter(d=>score(d)>0).sort((a,b)=>(score(a)-score(b))*(cost?1:-1));
 let rank=0;const ranked=rows.map((d,i)=>{if(!i||score(rows[i-1])!==score(d))rank=i+1;return {d,rank}});
 if(rankDirection==='reverse')ranked.reverse();
 const years=[...new Set(all.filter(d=>d.arrivalsLast).map(d=>String(d.arrivalsLast[0])))].sort().reverse();
 return `<section class="rank-panel glass"><h2>${esc(rankOptions[key])}</h2><p class="fine-print">${rows.length}カ国の収録値</p><div class="rank-tools">${arrivals?`<label>収録年 <select id="rank-year">${years.map(y=>`<option ${y===rankYear?'selected':''}>${y}</option>`).join('')}</select></label>`:''}<label>並び順 <select id="rank-order"><option value="default">上位から</option><option value="reverse" ${rankDirection==='reverse'?'selected':''}>下位から</option></select></label></div><ol class="objective-ranks">${ranked.slice(0,expanded?undefined:10).map(({d,rank})=>`<li><span>${rank}</span><a href="${href(d)}">${esc(d.ja)}</a><strong>${cost?'¥':''}${arrivals?F.compactCount(score(d)):score(d).toLocaleString()}${cost||arrivals?'':' / 5'}</strong></li>`).join('')}</ol>${!rows.length?'評価はまだありません。':''}${rows.length>10?`<button id="rank-more" class="button soft">${expanded?'閉じる':'もっと見る'}</button>`:''}</section>`
}
function story(s){const d=by(s.country);if(!d||!s.photos?.length)return '';return `<article class="diary-card glass"><button class="diary-cover" data-story="${esc(s.id)}"><img src="${esc(safePhoto(s.photos[0].src))}" alt="${esc(s.photos[0].alt||s.title)}" loading="lazy"><span>${s.photos.length} PHOTOS ↗</span></button><div><p class="eyebrow">${esc(d.en)} · ${esc(s.date)}</p><h3><button class="text-button" data-story="${esc(s.id)}">${esc(s.title)}</button></h3><p>${esc(s.caption||'')}</p><div class="tags">${(s.emotions||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></article>`;}
function diary(){let records=D.diaries.filter(s=>s.published);let country=Q.get('country')||'';return `${head('Travel Diary','私の目で見た、世界のかけら。','ここには、実際に旅先で撮った写真と、その日の気持ちを。')}<div class="wrap page-body"><div class="diary-toolbar glass"><label>旅先のアルバム<select id="diary-country"><option value="">すべての旅先</option>${all.filter(d=>d.visited||records.some(s=>s.country===d.id)).map(d=>`<option value="${d.id}" ${country===d.id?'selected':''}>${esc(d.ja)}</option>`).join('')}</select></label><p id="diary-count">${records.filter(s=>!country||s.country===country).length}つの旅の記録</p></div><div class="diary-grid" id="diary-grid">${diaryList(country)}</div></div>`;}
function diaryList(country){const entries=D.diaries.filter(s=>s.published&&(!country||s.country===country)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));return entries.length?entries.map(story).join(''):empty('Dear travel diary,','一枚の写真、一瞬の気持ち。アルバムの最初のページは、これから。');}
function about(){return `${head('The Story of TORAMI','次の旅に恋する場所。')}<section class="wrap page-body"><div class="about-panel glass"><div class="about-pearl"><img src="assets/img/torami-pearl.webp" alt="TORAMI" width="1392" height="464"><span>${D.stats.countries}<small>COUNTRIES VISITED</small></span></div><div><p class="eyebrow">COLLECT MOMENTS</p><h2>For the places<br>that stay with you.</h2><p>世界を旅して集めた、私だけの宝物。<br>TORAMI TRAVELは、トラみちゃんの旅の記録と、次の旅へのときめきを集める場所です。</p><p>写真から心の動く場所を探したり、ガチャで思いがけない旅先に出会ったり。本音の評価と、実際の旅の写真を、少しずつ重ねていきます。</p><a class="instagram-pill" href="${D.instagram}" target="_blank" rel="noopener noreferrer">Instagram @findmeoutthere25 ↗</a></div></div><div class="about-notes"><h2>このサイトの写真と記録について</h2><p>197カ国のカードは、旅先を表現するためのイメージビジュアルです。トラみちゃんが撮った写真はDiaryで紹介します。</p><p>おすすめ度とランキングは個人の体験をもとに作成します。治安・予算・季節の情報には確認日を添え、空欄を推測で補いません。</p><p>♡やチェックリストはこのブラウザ内に保存されます。アクセス解析にはGoatCounterを利用しています。</p></div></section>`;}
function notFound(){return `${head('A little detour.','このページは見つかりませんでした。')}<div class="wrap page-body">${empty('Let’s find another path.','旅先一覧から、次に心が動く場所を探してみてね。','destinations.html')}</div>`;}
function toggleFavorite(id){try{const ids=JSON.parse(localStorage.getItem('torami-saved')||'[]');const updated=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];localStorage.setItem('torami-saved',JSON.stringify(updated));favorites=updated;return true}catch{return false}}
const F=window.TORAMI_FEATURES({toggleFavorite,D,all,by,esc,head,card,photo,href,heart,crystalMap,mapHeading,mapZoomControls,bindMapZoom,openDialog,track,SSR,page});
const atlas=page==='home'?window.TORAMI_ATLAS({all,by,t:F.t,esc,photo,href,validURL,compactCount:F.compactCount,visitedIds:F.visitedIds}):null;
function render(){root.innerHTML=`<img class="mobile-backdrop" src="assets/img/jewel-atmosphere-mobile.png" alt="" aria-hidden="true">${header()}<main id="main">${F.enhance(({home,destinations,country:detail,gacha,rankings,diary,about,'404':notFound,...F.pages}[page]||notFound)())}</main>${footer()}<dialog id="travel-dialog" class="travel-dialog"><button class="dialog-close" aria-label="閉じる">×</button><div id="dialog-content"></div></dialog>`;if(!SSR){bind();F.bind();if(!document.getElementById('torami-i18n-script')){const script=document.createElement('script');script.id='torami-i18n-script';script.src='assets/js/i18n.js?v=7';document.head.append(script)}}}
function openDialog(html,trigger){lastTrigger=trigger||document.activeElement;const dialog=document.getElementById('travel-dialog');document.getElementById('dialog-content').innerHTML=html;dialog.showModal();dialog.querySelector('.dialog-close').focus();}
function closeDialog(){document.getElementById('travel-dialog').close();lastTrigger?.focus();}
function bind(){
 const back=document.querySelector('.nav-back');
 if(back&&document.referrer){try{const from=new URL(document.referrer),base=new URL('.',location.href);if(from.origin===base.origin&&from.pathname.startsWith(base.pathname)&&from.pathname!==location.pathname){
 back.href=from.href;back.onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||history.length<=1)return;e.preventDefault();history.back()};
 }}catch{}}
 document.getElementById('language-toggle').onclick=()=>{if(!window.TORAMI_I18N){const u=new URL(location.href);u.searchParams.set('lang','en');location.assign(u.href)}};const menu=document.getElementById('menu-toggle'),navEl=document.getElementById('site-nav');menu.onclick=()=>{let on=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(on));menu.setAttribute('aria-label',on?'メニューを閉じる':'メニューを開く');navEl.classList.toggle('open',on)};document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');navEl.classList.remove('open');document.getElementById('more-modes')?.setAttribute('hidden','');document.getElementById('more-modes-toggle')?.setAttribute('aria-expanded','false')}});const dialog=document.getElementById('travel-dialog');dialog.querySelector('.dialog-close').onclick=closeDialog;dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}};dialog.addEventListener('close',()=>lastTrigger?.focus());
root.addEventListener('click',e=>{const b=e.target.closest('[data-save]');if(b){let id=b.dataset.save;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];try{localStorage.setItem('torami-saved',JSON.stringify(favorites))}catch{}document.querySelectorAll(`[data-save="${id}"]`).forEach(x=>{const on=favorites.includes(id);x.setAttribute('aria-pressed',String(on));x.classList.toggle('saved',on);x.textContent=x.classList.contains('heart')?(on?'♥':'♡'):(on?'♥ 保存済み':'♡ この旅先を保存')});track(favorites.includes(id)?'favorite_add':'favorite_remove',id);if(page==='gacha')updateGachaCount();if(page==='destinations'&&document.getElementById('country-collection').value==='saved')filterDirectory();}const s=e.target.closest('[data-story]');if(s)openStory(s.dataset.story,s);const a=e.target.closest('a');if(a?.href.includes('instagram.com'))track('instagram');if(a?.getAttribute('href')?.startsWith('country-'))track('destination_link');});
if(page==='home')bindMap();if(page==='destinations')bindDirectory();if(page==='gacha')bindGacha();if(page==='country')bindCountry();}
function replaceQuery(values){const q=new URLSearchParams(values);for(const [k,v] of [...q])if(!v||v==='all'||v==='All')q.delete(k);history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash);}
function bindMap(){
  const map=document.getElementById('map-viewport');
  const theme=atlas.bind(map);
  const picker=document.getElementById('map-country-picker');
  const t=F.t;
  function refreshVisits(){
    const visited=F.visitedIds();
    map.querySelectorAll('[data-map-country]').forEach(el=>{
      el.classList.toggle('is-visited',visited.includes(el.dataset.mapCountry));
    });
    const action=document.getElementById('gem-visit');
    if(action)labelVisit(action,visited.includes(action.dataset.destination));
    theme.refresh();
  }
  function labelVisit(button,on){
    button.setAttribute('aria-pressed',String(on));
    button.textContent=on?t('✓ 訪問済みを解除','✓ Remove from visited'):t('訪問済みに登録','Mark as visited');
  }
  function showCountry(d,trigger){
    if(!d)return;
    const visited=F.visitedIds().includes(d.id);
    openDialog(`<div class="map-country-card">${photo(d,'',true)}<p class="eyebrow">${esc(d.region)}</p><h2>${esc(d.en)}</h2><p>${esc(d.ja)}</p><p>${esc(d.lineJa)}</p>${theme.detail(d)}<div class="gem-actions"><button class="button" id="gem-visit" aria-pressed="${visited}"></button>${btn(t('この国・地域を見る','Destination guide'),href(d),true)}</div><p class="gem-save-status" role="status"></p></div>`,trigger);
    const button=document.getElementById('gem-visit');
    button.dataset.destination=d.id;
    labelVisit(button,visited);
    button.onclick=()=>{
      const on=!F.visitedIds().includes(d.id);
      if(!F.setPassportStatus(d.id,on?'visited':'unvisit'))return;
      labelVisit(button,on);
      const status=document.querySelector('.gem-save-status');
      status.textContent=on?t('このブラウザに保存しました。','Saved in this browser.'):t('訪問済みの記録を解除しました。','Visit removed.');
      refreshVisits();

    };
    track('map-country',d.id);
  }
  map.addEventListener('click',e=>{
    const hit=e.detail>0?document.elementFromPoint(e.clientX,e.clientY):e.target;
    const el=hit?.closest('[data-map-country]');
    if(el&&map.contains(el))showCountry(by(el.dataset.mapCountry),el);
  });
  map.addEventListener('keydown',e=>{
    const el=e.target.closest('[data-map-country]');
    if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(!e.repeat)showCountry(by(el.dataset.mapCountry),el)}
  });
  picker.onchange=()=>{const d=by(picker.value);picker.value='';showCountry(d,picker)};
  window.addEventListener('torami-passport-change',refreshVisits);
  window.addEventListener('pageshow',refreshVisits);
  refreshVisits();
  const heading=document.querySelector('.map-heading h2'),logo=document.querySelector('.pearl-brand img');
  function sizeMap(){
    const range=document.createRange();
    range.selectNodeContents(heading);
    const headingWidth=range.getBoundingClientRect().width;
    const target=Math.max(headingWidth*1.07,Math.min(logo.clientHeight*2*978/584,headingWidth*1.14));
    const desktopFactor=matchMedia('(min-width:851px)').matches?1.5:1;
    map.style.setProperty('--map-width',Math.round(target*desktopFactor)+'px');
  }
  sizeMap();
  const resize=new ResizeObserver(sizeMap);
  resize.observe(heading);resize.observe(logo);
  document.fonts?.ready.then(sizeMap);
  bindMapZoom(map);
  if(Q.has('country'))showCountry(by(Q.get('country')),picker);
}
function bindMapZoom(view){
  const svg=view.querySelector('svg'),minus=document.getElementById('gem-minus'),plus=document.getElementById('gem-plus'),reset=document.getElementById('gem-scale');
  const levels=[1,1.5,2,3,4,6,8,12];
  let scale=1,pinch=null,drag=null,ignoreClickUntil=0;
  const center=()=>[view.clientWidth/2,view.clientHeight/2];
  const point=(x,y)=>{const r=view.getBoundingClientRect();return [x-r.left,y-r.top]};
  const locationAt=([x,y])=>[(view.scrollLeft+x)/Math.max(1,svg.clientWidth),(view.scrollTop+y)/Math.max(1,svg.clientHeight)];
  function setScale(next,at=center(),anchor=locationAt(at)){
    scale=Math.min(12,Math.max(1,next));
    svg.style.width=(scale*100)+'%';
    view.scrollLeft=anchor[0]*svg.clientWidth-at[0];
    view.scrollTop=anchor[1]*svg.clientHeight-at[1];
    minus.disabled=scale<=1.001;plus.disabled=scale>=11.999;
    reset.textContent=Math.round(scale*100)+'%';
    view.classList.toggle('can-pan',scale>1.001);
  }
  minus.onclick=()=>setScale(levels.filter(n=>n<scale-.001).pop()||1);
  plus.onclick=()=>setScale(levels.find(n=>n>scale+.001)||12);
  reset.onclick=()=>setScale(1);
  const fingers=touches=>{
    const [a,b]=touches;
    return {at:point((a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2),distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)};
  };
  view.addEventListener('touchstart',e=>{
    if(e.touches.length!==2)return;
    e.preventDefault();
    const f=fingers(e.touches);
    pinch={scale,anchor:locationAt(f.at),distance:Math.max(1,f.distance)};
  },{passive:false});
  view.addEventListener('touchmove',e=>{
    if(!pinch||e.touches.length!==2)return;
    e.preventDefault();const f=fingers(e.touches);
    setScale(pinch.scale*f.distance/pinch.distance,f.at,pinch.anchor);
  },{passive:false});
  const finishTouch=()=>{if(pinch){ignoreClickUntil=performance.now()+450;pinch=null}};
  view.addEventListener('touchend',finishTouch);view.addEventListener('touchcancel',finishTouch);
  view.addEventListener('pointerdown',e=>{
    if(scale>1&&e.pointerType==='mouse'&&e.button===0)drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:view.scrollLeft,top:view.scrollTop,moved:false};
  });
  view.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<5)return;
    drag.moved=true;view.setPointerCapture(e.pointerId);
    view.scrollLeft=drag.left-dx;view.scrollTop=drag.top-dy;
  });
  const stopDrag=()=>{if(drag?.moved)ignoreClickUntil=performance.now()+200;drag=null};
  view.addEventListener('pointerup',stopDrag);view.addEventListener('pointercancel',stopDrag);
  view.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null});
  view.addEventListener('click',e=>{if(performance.now()<ignoreClickUntil){e.stopImmediatePropagation();e.preventDefault()}},true);
  setScale(1);
}
let directoryLimit=18;
function filtered(){const query=document.getElementById('country-query').value.normalize('NFKC').toLocaleLowerCase().trim(),region=document.getElementById('country-region').value,theme=document.getElementById('country-theme').value,collection=document.getElementById('country-collection').value;return all.filter(d=>(region==='All'||d.region===region)&&(!theme||d.tags.includes(theme))&&(collection==='all'||collection==='visited'&&d.visited||collection==='saved'&&favorites.includes(d.id))&&[d.ja,d.en,d.code,d.region,reg[d.region],...(d.cities||[]).map(c=>c.name)].join(' ').normalize('NFKC').toLocaleLowerCase().includes(query));}
function filterDirectory(){document.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===document.getElementById("country-theme").value)));const list=filtered();document.getElementById('directory-count').textContent=list.length+'件の旅先';document.getElementById('destination-grid').innerHTML=list.length?list.slice(0,directoryLimit).map(card).join(''):empty('A different path, perhaps?','条件を変えて探してみてね。保存した旅先は、このブラウザの♡から集められます。');document.getElementById('load-more').hidden=directoryLimit>=list.length;replaceQuery({q:document.getElementById('country-query').value,region:document.getElementById('country-region').value,theme:document.getElementById('country-theme').value,collection:document.getElementById('country-collection').value});}
function bindDirectory(){document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{document.getElementById('country-theme').value=b.dataset.mood;directoryLimit=18;filterDirectory()});const form=document.getElementById('directory-form');form.onsubmit=e=>e.preventDefault();form.oninput=()=>{directoryLimit=18;filterDirectory()};form.onreset=()=>{setTimeout(()=>{document.getElementById('country-query').value='';document.getElementById('country-region').value='All';document.getElementById('country-theme').value='';document.getElementById('country-collection').value='all';directoryLimit=18;filterDirectory()},0)};document.getElementById('load-more').onclick=()=>{directoryLimit+=18;filterDirectory()};filterDirectory();}
const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
function gachaPool(){const theme=document.getElementById('gacha-theme').value,region=document.getElementById('gacha-region').value,collection=document.getElementById('gacha-collection').value;const budget=Number(document.getElementById('gacha-budget')?.value)||0,kind=document.getElementById('gacha-kind')?.value;const pool=all.filter(d=>d.id!=='north-korea'&&(!theme||d.tags.includes(theme))&&(region==='All'||d.region===region)&&(collection==='all'||collection==='visited'&&d.visited||collection==='saved'&&favorites.includes(d.id))&&(!budget||(d.budget?.currency==='JPY'&&Number(d.budget.daily)>0&&Number(d.budget.daily)<=budget&&d.budget.updatedAt)));return kind==='city'?pool.flatMap(d=>(d.cities||[]).map(c=>({...d,id:d.id+'~'+(c.id||c.name),parentId:d.id,isCity:true,en:c.nameEn||c.name,ja:c.nameJa||c.name,image:c.image||d.image,lineJa:c.text||d.lineJa,lineEn:c.textEn||d.lineEn}))):pool;}
function updateGachaCount(){const count=gachaPool().length;document.getElementById('gacha-count').textContent=count?`${count}の旅先が、あなたを待っています。`:'この条件の旅先はまだありません。条件を変えてみてね。';}
function bindGacha(){const spin=document.getElementById('spin-button'),handle=document.getElementById('gacha-handle'),machine=document.getElementById('gacha-machine');let busy=false;const play=()=>{if(busy)return;let pool=gachaPool();if(!pool.length){document.getElementById('draw-status').textContent='条件に合う旅先がありません。右の条件を変えてみてね。';return}if(lastResult&&pool.length>1)pool=pool.filter(d=>d.id!==lastResult.id);const d=pool[Math.floor(Math.random()*pool.length)];busy=true;spin.disabled=handle.disabled=true;machine.classList.add('spinning');document.getElementById('draw-status').textContent='旅のカプセルが回っています…';document.getElementById('gacha-result').innerHTML='';machine.scrollIntoView({behavior:motion(),block:'center'});setTimeout(()=>{lastResult=d;busy=false;spin.disabled=handle.disabled=false;machine.classList.remove('spinning');document.getElementById('draw-status').textContent='今回の行き先はこちら。';showResult(d);F.recordGacha(d);track('gacha_draw',d.id)},motion()==='auto'?0:2800);};spin.onclick=handle.onclick=play;['gacha-theme','gacha-region','gacha-collection','gacha-budget','gacha-kind'].forEach(id=>document.getElementById(id).onchange=updateGachaCount);updateGachaCount();let answers=[];function bindQuiz(){document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{answers.push(Number(b.dataset.answer));document.getElementById('quiz-body').innerHTML=quizHTML(answers.length,answers);bindQuiz();if(answers.length===3)track('quiz-complete')});const back=document.getElementById('quiz-back');if(back)back.onclick=()=>{answers.pop();document.getElementById('quiz-body').innerHTML=quizHTML(answers.length,answers);bindQuiz()};const reset=document.getElementById('quiz-reset');if(reset)reset.onclick=()=>{answers=[];document.getElementById('quiz-body').innerHTML=quizHTML(0,[]);bindQuiz()};const apply=document.querySelector('[data-quiz-apply]');if(apply)apply.onclick=()=>{document.getElementById('gacha-theme').value=apply.dataset.quizApply;updateGachaCount();machine.scrollIntoView({behavior:motion(),block:'center'});spin.focus({preventScroll:true})};}const initial=by(Q.get('result'));if(initial){lastResult=initial;showResult(initial,false);}}
function showResult(d,scroll=true){const result=document.getElementById('gacha-result');result.innerHTML=resultHTML(d);document.getElementById('result-share').onclick=()=>share('次の旅先は '+d.ja+'！',new URL('gacha.html?result='+d.id,location.href).href,result.querySelector('.share-status'));document.getElementById('result-export').onclick=()=>exportResult(d);document.getElementById('spin-again').onclick=()=>{document.getElementById('gacha-machine').scrollIntoView({behavior:motion(),block:'center'});document.getElementById('spin-button').focus({preventScroll:true})};if(scroll)result.scrollIntoView({behavior:motion(),block:'start'});}
async function share(title,url,status){if(window.TORAMI_I18N?.language==='en'){title=window.TORAMI_I18N.text(title);const u=new URL(url,location.href);u.searchParams.set('lang','en');url=u.href}try{if(navigator.share){await navigator.share({title:'TORAMI TRAVEL',text:title,url});status.textContent='シェアしました。'}else{await navigator.clipboard.writeText(title+'\n'+url);status.textContent='リンクをコピーしました。'}track('share_click')}catch(e){if(e.name==='AbortError')return;status.innerHTML=`<label>このリンクをコピーしてください<input readonly value="${esc(url)}"></label>`;status.querySelector('input').select();}}
async function exportResult(d){const status=document.querySelector('#gacha-result .share-status'),button=document.getElementById('result-export');button.disabled=true;status.textContent='保存用の画像を作っています…';try{const image=new Image();image.src=asset(d.image);await image.decode();const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');const bg=x.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#a4d8da');bg.addColorStop(1,'#edf6ef');x.fillStyle=bg;x.fillRect(0,0,1080,1350);x.fillStyle='#ffffffb0';x.fillRect(40,40,1000,1270);x.textAlign='center';x.fillStyle='#245b67';x.font='28px Georgia';x.fillText('TORAMI TRAVEL',540,112);x.font='18px sans-serif';x.fillText('YOUR TRAVEL DESTINY',540,158);const scale=Math.min(880/image.width,700/image.height),w=image.width*scale,h=image.height*scale;x.drawImage(image,540-w/2,195,w,h);let size=80;do{x.font=size+'px Georgia';size-=2}while(x.measureText(d.en).width>930&&size>28);x.fillText(d.en,540,1000);x.font='30px sans-serif';x.fillText(window.TORAMI_I18N?.language==='en'?'A place to put on your list':d.ja,540,1060);x.font='26px sans-serif';const words=Array.from(window.TORAMI_I18N?.language==='en'?(d.lineEn||window.TORAMI_I18N.text(d.lineJa)):d.lineJa);let lines=[''];for(let ch of words){let i=lines.length-1;if(x.measureText(lines[i]+ch).width>880)lines.push(ch);else lines[i]+=ch;}lines.slice(0,2).forEach((l,i)=>x.fillText(l,540,1120+i*38));x.font='21px Georgia';x.fillText('The World is Yours.',540,1240);const blob=await new Promise(res=>c.toBlob(res,'image/png'));if(!blob)throw Error('画像生成に失敗');const u=URL.createObjectURL(blob);status.innerHTML=`<a class="text-link" href="${u}" download="torami-${d.id}.png">PNGをダウンロード ↓</a><details><summary>画像を表示して保存</summary><img src="${u}" alt="${esc(d.ja)}のガチャ結果カード" width="1080" height="1350"></details>`;status.querySelector('a').click();track('image-save',d.id);}catch{status.textContent='画像を保存できませんでした。もう一度お試しください。'}finally{button.disabled=false}}
function bindCountry(){const d=by(document.body.dataset.destination);const month=document.querySelector('#guide-month');if(month&&d?.climate)month.onchange=()=>{const i=Number(month.value);document.getElementById('guide-temp').textContent=d.climate.temp[i]+' °C';document.getElementById('guide-rain').textContent=d.climate.rain[i]+' mm'};const basis=document.querySelector('a[href="#guide-budget"]');if(basis)basis.onclick=()=>{document.getElementById('guide-budget').open=true};document.querySelector('[data-country-share]').onclick=e=>{let d=by(e.currentTarget.dataset.countryShare);share(d.ja+'への旅を見つけた',new URL(href(d),location.href).href,document.querySelector('.share-status'))};}
function openStory(id,trigger){const s=D.diaries.find(x=>x.id===id&&x.published);if(!s)return;const d=by(s.country);let index=0;const draw=()=>{document.getElementById('dialog-content').innerHTML=`<article class="story-view"><p class="eyebrow">${esc(d.en)} · ${esc(s.date)}</p><h2>${esc(s.title)}</h2><img src="${esc(safePhoto(s.photos[index].src))}" alt="${esc(s.photos[index].alt||s.title)}"><div class="gallery-controls"><button id="photo-prev" aria-label="前の写真" ${index===0?'disabled':''}>←</button><span>${index+1} / ${s.photos.length}</span><button id="photo-next" aria-label="次の写真" ${index===s.photos.length-1?'disabled':''}>→</button></div><p>${esc(s.photos[index].caption||s.caption||'')}</p><div class="story-text">${esc(s.body||'').replace(/\n/g,'<br>')}</div><a class="text-link" href="${href(d)}">${esc(d.ja)}の国情報へ ↗</a></article>`;document.getElementById('photo-prev').onclick=()=>{index--;draw()};document.getElementById('photo-next').onclick=()=>{index++;draw()};};openDialog('',trigger);draw();track('diary',id);}
window.TORAMI={render,by,rankingHTML,diaryList,quizHTML};render();
})();
