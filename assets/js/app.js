
(()=>{
"use strict";
const db=window.TORAMI_DATA||{posts:[],countries:[],visitedConfirmed:[]};
const C=new Map(db.countries.map(c=>[c.iso,c]));
const posts=db.posts;
const IG="https://www.instagram.com/findmeoutthere25";
const regions={"Europe":["ヨーロッパ","Europe"],"Asia":["アジア","Asia"],"North America":["北アメリカ","North America"],"South America":["南アメリカ","South America"],"Africa":["アフリカ","Africa"],"Oceania":["オセアニア","Oceania"]};
const dict={
nav_home:["ホーム","Home"],nav_atlas:["世界地図","World Atlas"],nav_destinations:["国・都市","Destinations"],nav_destination:["旅先ガイド","Guide"],nav_themes:["旅のテーマ","Travel Themes"],nav_rankings:["ランキング","The Picks"],nav_gacha:["旅ガチャ","Travel Gacha"],nav_diary:["旅日記","Travel Diary"],nav_about:["About","About"],
footer_tag:["世界のまだ見ぬ景色に、会いにいこう。","Discover the world beyond the map."],
map_eyebrow:["CRYSTAL WORLD ATLAS","CRYSTAL WORLD ATLAS"],tap_map:["国をタップして旅を始めよう","Tap a country to begin your journey"],
search_placeholder:["国・都市・スポットを検索…","Search countries, cities or places…"],
countries_count:["ヶ国","countries"],regions_count:["地域","regions"],
see_journeys:["旅の記録を見る ↗","Explore my journeys ↗"],latest_stories:["旅のフォトストーリー","Travel photo stories"],
view_all:["すべて見る ↗","View all ↗"],gacha_teaser:["次の旅先は、クリスタルの中に。","Your next destination awaits inside a crystal."],
gacha_teaser_body:["国を引いて、都市を引く。偶然から始まる新しい旅。","Draw a country, then a city. Let chance lead the way."],spin_gacha:["旅ガチャを回す ✧","Spin the travel gacha ✧"],
atlas_title:["世界は、ひとつの宝石箱。","The world is a treasure chest."],atlas_desc:["世界地図の国を選んで、まだ知らない景色に出会おう。","Choose a country and discover a world of wonders."],
mode_visits:["訪問した国","My journeys"],mode_all:["すべての国","All countries"],mode_photos:["写真のある国","With photos"],
atlas_note:["地図上の訪問国の色分けは、Instagram投稿から確認できた国を先行表示しています。35ヶ国すべての確定リストは後日反映します。","Highlighted countries currently reflect locations confirmed from Instagram posts. The complete list of 35 visited countries will be updated."],
countries_photo_title:["写真でたどる旅先","Destinations in photos"],
dest_title:["世界の景色を探す。","Find your next destination."],dest_desc:["国からも、都市からも。あなたの次の旅の入口。","Discover places by country or city."],
filter_all:["すべて","All"],region_europe:["ヨーロッパ","Europe"],region_asia:["アジア","Asia"],region_northamerica:["北アメリカ","North America"],region_africa:["アフリカ","Africa"],region_oceania:["オセアニア","Oceania"],
photos_only:["投稿写真のある国だけ表示","Show countries with travel photos only"],
theme_title:["今の気分で、旅を選ぶ。","Choose a journey to match your mood."],theme_desc:["海、街並み、自然、非日常。気になる世界へ。","The coast, beautiful cities, nature and extraordinary escapes."],
ranking_title:["心を奪われる、旅の景色。","Places that stay with you."],ranking_desc:["Instagramの旅写真から選んだフォトセレクション。個人的な順位はこれから公開予定。","A photo edit drawn from real Instagram journeys. Personal rankings are coming soon."],
ranking_future:["本音ランキング、近日公開。","Personal rankings, coming soon."],ranking_future_desc:["訪問した35ヶ国から「もう一度行きたい国」「絶景」「コスパ」など、実体験に基づく順位を追加する予定です。","Based on 35 countries visited, future rankings will cover favorite returns, views and value, grounded in first-hand experience."],
gacha_title:["運命の旅先を引いてみよう。","Let fate choose your next trip."],gacha_desc:["まず国を、次に都市を。世界のどこかで、あなたを待つ景色へ。","First a country, then a city. Discover a destination chosen just for you."],gacha_prompt:["次の冒険は、どこから？","Where will your next adventure begin?"],gacha_filter:["旅する地域","Choose a region"],gacha_pending:["クリスタルに運命を尋ねてみて。","Ask the crystal where to go next."],draw_country:["✧ 国を引く","✧ Draw a country"],draw_city:["✧ 都市を引く","✧ Draw a city"],save_share:["結果を画像で保存","Save result as an image"],again:["もう一度","Start again"],
diary_title:["旅の記憶を、宝石のように。","Collect memories like precious gems."],diary_desc:["Instagramに残した実際の旅写真を、場所ごとに集めたアルバム。","An album of actual travel photos shared on Instagram, gathered by location."],diary_select:["国を選ぶ","Choose a country"],
about_intro:["世界35ヶ国、そして2つの地域。旅で出会った景色や記憶を、一粒ずつ宝石のように集めて。","35 countries and two regions explored. Collecting the landscapes and memories from each journey like precious jewels."],about_body:["ここは、まだ知らない世界に出会うための小さな旅の宝箱。写真を眺めたり、地図を開いたり、ガチャを回したり。次の旅がもっと楽しみになる場所を目指しています。","A little treasure chest for discovering places you've never seen. Explore photos, open the map and spin a travel gacha to find your next adventure."],
tap_country:["国を選ぶ","Choose a country"],see_details:["この国を見る ↗","Explore this country ↗"],photos_verified:["Instagram投稿の写真","Photos from Instagram posts"],no_photos:["写真は準備中","Photos coming soon"],region_text:["地域","Region"],city_text:["都市・スポット","Cities & places"],gallery_text:["旅の写真","Travel gallery"],places_text:["訪れた場所の記録","Places in the album"],unverified:["詳しい旅行情報・体験談はこれから追加予定。","Detailed travel information and first-hand notes will be added."],
all_destinations:["すべての旅先","All destinations"],count_label:["件の旅先","destinations"],post_label:["件の記録","posts"],
selected_country:["選択した国","Selected country"],no_photo_note:["この国の投稿写真はまだ登録されていません。","No Instagram photos are registered for this country yet."],
country_drew:["運命の国","Your country"],city_drew:["次の街","Your city"],travel_guide:["旅先を見る ↗","View destination ↗"],show_more:["もっと見る","See more"],
theme_coast:["きらめく海","Crystal coasts"],theme_nature:["大自然","Nature & wonder"],theme_cities:["美しい街並み","Beautiful cities"],theme_culture:["文化と物語","Culture & stories"],theme_escape:["特別な旅","Extraordinary escapes"],theme_hidden:["まだ知らない発見","Hidden gems"],
theme_coast_sub:["光と海を探す旅","For turquoise seas and golden light"],theme_nature_sub:["心がほどける壮大な景色","Mountains, forests and northern lights"],theme_cities_sub:["街を歩くと絵になる旅","Wander through remarkable streets"],theme_culture_sub:["歴史や風景に出会う","History, heritage and discovery"],theme_escape_sub:["少しだけ贅沢な時間","A little extra sparkle"],theme_hidden_sub:["旅先で見つけた小さな宝物","Unforgettable places off the usual path"],
ranking_photo:["PHOTO EDIT · Instagramから","PHOTO EDIT · From Instagram"],
};
let lang="ja";try{lang=localStorage.getItem("torami_lang")==="en"?"en":"ja"}catch(e){}
let activeCountry=null,activeMode="visits",activeRegion="all",gachaCountry=null,gachaCity=null;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const tr=k=>(dict[k]||[k,k])[lang==="ja"?0:1];
const name=c=>c?(lang==="ja"?c.ja:c.en):"";
const country=iso=>C.get(iso)||{iso,en:iso,ja:iso,region:"",cover:""};
const countryName=iso=>name(country(iso));
const rname=r=>regions[r]?(lang==="ja"?regions[r][0]:regions[r][1]):r;
const cityName=p=>lang==="ja"?p.cityJa:p.cityEn;
const esc=s=>String(s??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[t]));
const countryLink=iso=>"destination.html?country="+encodeURIComponent(iso);
const cityLink=p=>countryLink(p.iso)+"&city="+encodeURIComponent(p.slug);
const covers=iso=>posts.filter(p=>p.iso===iso);
const featuredCountryCodes=[...new Set(posts.map(p=>p.iso))];
const track=(action,label="")=>{try{if(window.goatcounter&&typeof window.goatcounter.count==="function")window.goatcounter.count({path:"/event/"+action+(label?"/"+String(label).replace(/[^a-z0-9-]/gi,""):""),title:action,event:true});}catch(e){}};
function toast(message){const el=$("#toast");if(!el)return;el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2600)}
function photoOrPlaceholder(src,label="✧"){return src?`<img loading="lazy" src="${esc(src)}" alt="${esc(label)}">`:`<div class="destination-placeholder" aria-label="${esc(tr("no_photos"))}">✧</div>`}
function card(c){
return `<a class="destination-card glass" href="${countryLink(c.iso)}">
<div class="destination-photo">${photoOrPlaceholder(c.cover,name(c))}</div>
<div class="destination-title"><span>${esc(name(c))}<small>${esc(rname(c.region))}</small></span><span aria-hidden="true">↗</span></div></a>`;
}
function normalize(v){return String(v??"").toLocaleLowerCase().normalize("NFKC").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}
function searchItems(value){const q=normalize(value);if(!q)return[];
const locations=posts.filter(x=>[x.cityJa,x.cityEn,countryName(x.iso),country(x.iso).en].some(v=>normalize(v).includes(q))).map(x=>({title:cityName(x),sub:countryName(x.iso),href:cityLink(x)}));
const countries=db.countries.filter(c=>[c.en,c.ja].some(v=>normalize(v).includes(q))).map(c=>({title:name(c),sub:rname(c.region),href:countryLink(c.iso)}));
const found=[...countries,...locations],seen=new Set();return found.filter(x=>{if(seen.has(x.href))return false;seen.add(x.href);return true}).slice(0,8);
}
function localizeStatic(){
document.documentElement.lang=lang;
$$("[data-i18n]").forEach(el=>{el.textContent=tr(el.dataset.i18n)});
$$("[data-i18n-placeholder]").forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));
$("#language-toggle").innerHTML=(lang==="ja"?"日本語":"English")+" <span>⌄</span>";
document.title=($("body").dataset.page==="home"?"TORAMI TRAVEL":document.title.split(" | ")[0]+" | TORAMI TRAVEL");
}
function imageUrl(p){return p?.photo||"assets/img/aurora-ribbons.webp"}
function renderMap(container,context){
if(!container||!window.TORAMI_GEM_MAP)return;
container.innerHTML=window.TORAMI_GEM_MAP;
const hits=container.querySelectorAll(".country-hit");
const fillByIso=new Map([...container.querySelectorAll(".map-fill")].map(el=>[el.dataset.iso,el]));
function highlight(){fillByIso.forEach((el,iso)=>{let active=activeMode==="visits"?db.visitedConfirmed.includes(iso):activeMode==="photos"?!!covers(iso).length:true;el.classList.toggle("visited",active)})}
highlight();
const choose=(iso)=>{track("map-country",iso);if(context==="home"){location.href=countryLink(iso)}else{activeCountry=iso;renderAtlasInfo();container.querySelectorAll(".country-hit").forEach(el=>el.classList.toggle("selected",el.dataset.iso===iso))}};
hits.forEach(el=>{
  el.addEventListener("click",()=>choose(el.dataset.iso));
  el.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();choose(el.dataset.iso)}});
  el.addEventListener("mouseenter",()=>{const c=country(el.dataset.iso);const hint=context==="home"?$(".map-hover-hint"):null;if(hint)hint.textContent=name(c)});
  el.addEventListener("mouseleave",()=>{const hint=context==="home"?$(".map-hover-hint"):null;if(hint)hint.textContent=tr("tap_map")});
});
container.dataset.ready="true";
}
function renderHome(){
renderMap($("#home-map"),"home");
const featured=[50,44,40].map(id=>posts.find(p=>p.id===id)).filter(Boolean);
$("#home-stories").innerHTML=featured.map(p=>`<a class="story-card" href="${cityLink(p)}"><img loading="lazy" src="${esc(p.photo)}" alt="${esc(cityName(p))}"><div class="story-caption"><h3>${esc(cityName(p))}</h3><small>${esc(countryName(p.iso))} · ${esc(p.date)}</small></div></a>`).join("");
const form=$("#home-search-form"),inp=$("#home-search"),sug=$("#home-suggestions");
if(!form.dataset.bound){
form.addEventListener("submit",ev=>{ev.preventDefault();const item=searchItems(inp.value)[0];track("home-search");location.href=item?item.href:"destinations.html?q="+encodeURIComponent(inp.value)});
inp.addEventListener("input",()=>{sug.innerHTML=searchItems(inp.value).map(o=>`<a class="suggestion-item" href="${o.href}">${esc(o.title)} <small>· ${esc(o.sub)}</small></a>`).join("")});
inp.addEventListener("blur",()=>setTimeout(()=>sug.innerHTML="",200));
form.dataset.bound="yes";
}}
function renderAtlasInfo(){
const elem=$("#atlas-selected");if(!elem)return;
const c=activeCountry?country(activeCountry):null;
if(!c){elem.innerHTML=`<div class="map-empty-icon">✧</div><h2>${esc(tr("tap_country"))}</h2><p>${esc(tr("atlas_desc"))}</p>`;return}
const has=!!c.cover;
elem.innerHTML=`${has?`<img src="${esc(c.cover)}" alt="${esc(name(c))}">`:"<div class='map-empty-icon'>✧</div>"}
<span class="eyebrow">${esc(tr("selected_country"))}</span>
<h2>${esc(name(c))}</h2><p>${esc(rname(c.region))} · ${esc(has?tr("photos_verified"):tr("no_photo_note"))}</p>
<a class="pearl-button" href="${countryLink(c.iso)}">${esc(tr("see_details"))}</a>`;
}
function renderAtlas(){
const el=$("#atlas-map");renderMap(el,"atlas");renderAtlasInfo();
const photoCountries=db.countries.filter(c=>c.cover);$("#atlas-cards").innerHTML=photoCountries.map(card).join("");
if(!$("#map-modes").dataset.bound){$("#map-modes").addEventListener("click",ev=>{const b=ev.target.closest("[data-mode]");if(!b)return;activeMode=b.dataset.mode;$$("#map-modes .pill").forEach(x=>x.classList.toggle("active",x===b));renderMap(el,"atlas");track("map-mode",activeMode)});$("#map-modes").dataset.bound="yes";}
}
function renderDestinations(){
const input=$("#destination-search");const only=$("#has-photo-only"),list=$("#country-cards");let q=new URLSearchParams(location.search).get("q")||input.value||"";
if(input.value!==q)input.value=q;
const query=normalize(q);
let all=db.countries.filter(c=>(!only.checked||!!c.cover)&& (activeRegion==="all"||c.region===activeRegion));
if(query){all=all.filter(c=>[c.ja,c.en,...covers(c.iso).flatMap(p=>[p.cityJa,p.cityEn])].some(t=>normalize(t).includes(query)))}
all.sort((a,b)=>(Number(!!b.cover)-Number(!!a.cover))||name(a).localeCompare(name(b),lang==="ja"?"ja":"en"));
list.innerHTML=all.map(card).join("")||`<p>${esc(lang==="ja"?"該当する旅先がありません。":"No destinations found.")}</p>`;
$("#destination-count").textContent=all.length+" "+tr("count_label");
if(!list.dataset.bound){
input.addEventListener("input",()=>{history.replaceState(null,"",location.pathname+(input.value?"?q="+encodeURIComponent(input.value):""));renderDestinations()});
$("#listing-search-form").addEventListener("submit",e=>e.preventDefault());
only.addEventListener("change",renderDestinations);
$("#country-filters").addEventListener("click",e=>{const b=e.target.closest("[data-region]");if(!b)return;activeRegion=b.dataset.region;$$("#country-filters .pill").forEach(x=>x.classList.toggle("active",x===b));renderDestinations();track("region-filter",activeRegion)});
list.dataset.bound="yes";
}}
function renderDestination(){
const el=$("#destination-detail");if(!el)return;
const qs=new URLSearchParams(location.search),iso=qs.get("country")||"GRC",c=country(iso),pall=covers(iso);
const slug=qs.get("city"),selected=slug?pall.find(p=>p.slug===slug):null;
const cityposts=selected?pall.filter(x=>x.slug===slug):pall;
const cover=selected?.photo||c.cover||"";
const title=selected?cityName(selected):name(c);
const engTitle=selected?selected.cityEn:c.en;
const uniq=[...new Map(pall.map(x=>[x.slug,x])).values()];
const gallery=[...new Set(cityposts.flatMap(x=>x.photos))].slice(0,15);
let hero=`<section class="destination-hero ${cover?"":"destination-empty-hero"}">${cover?`<img src="${esc(cover)}" alt="${esc(title)}">`:""}<div class="destination-hero-text"><span class="eyebrow" style="color:white">TORAMI DESTINATION GUIDE</span><h1>${esc(title)}</h1><p>${esc(engTitle)} · ${esc(rname(c.region))}</p></div></section>`;
let cities=uniq.length?uniq.map(p=>`<a class="glass" href="${cityLink(p)}">${esc(cityName(p))} ↗</a>`).join(""):`<p>${esc(tr("unverified"))}</p>`;
el.innerHTML=`<a href="destinations.html" class="destination-back">← ${esc(tr("all_destinations"))}</a>${hero}
<div class="destination-layout"><section><div class="section-top"><h2>${esc(tr("places_text"))}</h2><span class="eyebrow">${esc(pall.length)} ${esc(tr("post_label"))}</span></div>
<div class="city-pills"><a class="glass" href="${countryLink(iso)}">${esc(name(c))}</a>${cities}</div>
<h2 style="margin-top:40px">${esc(tr("gallery_text"))}</h2>
${gallery.length?`<div class="photo-gallery">${gallery.map(src=>`<img loading="lazy" src="${esc(src)}" alt="${esc(title)}">`).join("")}</div>`:`<div class="glass notice-box"><p>${esc(tr("no_photo_note"))}</p></div>`}</section>
<aside class="side-panel glass"><span class="eyebrow">THE WORLD IS YOURS</span><h3>${esc(title)}</h3><p>${esc(rname(c.region))}</p><p class="info-unverified">${esc(tr("unverified"))}</p>
<a class="pearl-button" href="atlas.html">${esc(tr("nav_atlas"))} ↗</a>
<p style="margin-top:25px"><a href="${IG}" target="_blank" rel="noopener noreferrer">Instagram ↗</a></p></aside></div>`;
document.title=title+" | TORAMI TRAVEL";
}
const themes=[
{id:"coast",codes:["MEX","GRC","PRT","THA","PHL","ITA","IDN","ESP","GUM"]},
{id:"nature",codes:["CHE","FIN","SWE","USA","IDN","PRT"]},
{id:"cities",codes:["FRA","CZE","ITA","DNK","GBR","KOR","CHN","ESP","USA"]},
{id:"culture",codes:["KHM","EGY","JPN","GRC","ITA","VNM","TWN"]},
{id:"escape",codes:["GRC","CHE","ARE","QAT","PRT","FRA"]},
{id:"hidden",codes:["VNM","PRT","MEX","FIN","PHL","CZE"]}
];
let themeId="coast";
function renderThemes(){
$("#theme-tabs").innerHTML=themes.map(t=>`<button class="pill ${t.id===themeId?"active":""}" data-theme="${t.id}">${esc(tr("theme_"+t.id))}</button>`).join("");
const chosen=themes.find(t=>t.id===themeId);
$("#theme-results").innerHTML=`<div class="theme-intro-card glass"><span class="eyebrow">THEMED JOURNEYS</span><h2>${esc(tr("theme_"+themeId))}</h2><p>${esc(tr("theme_"+themeId+"_sub"))}</p></div><div class="destination-grid">${chosen.codes.map(iso=>card(country(iso))).join("")}</div>`;
if(!$("#theme-tabs").dataset.bound){$("#theme-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-theme]");if(!b)return;themeId=b.dataset.theme;track("theme-select",themeId);renderThemes()});$("#theme-tabs").dataset.bound="yes";}
}
function renderRankings(){
const choices=[50,44,41,47,58,17,1,48,38,29,7,25].map(i=>posts.find(p=>p.id===i)).filter(Boolean);
$("#ranking-collection").innerHTML=choices.map((p,i)=>`<a class="ranking-card glass" href="${cityLink(p)}"><div class="ranking-img"><img loading="lazy" src="${esc(p.photo)}" alt="${esc(cityName(p))}"><span class="ranking-index">${String(i+1).padStart(2,"0")}</span></div><div class="ranking-caption"><span class="eyebrow">${esc(tr("ranking_photo"))}</span><h3>${esc(cityName(p))}</h3><p>${esc(countryName(p.iso))}</p></div></a>`).join("");
}
function dateLabel(t){const d=new Date(t+"T00:00:00Z");return lang==="ja"?`${d.getUTCFullYear()}年${d.getUTCMonth()+1}月`:`${d.toLocaleDateString("en-US",{month:"short",year:"numeric",timeZone:"UTC"})}`}
let diaryFilter="all";
function renderDiary(){
const select=$("#diary-select");
select.innerHTML=`<option value="all">${esc(tr("filter_all"))}</option>`+[...new Set(posts.map(p=>p.iso))].sort((a,b)=>countryName(a).localeCompare(countryName(b),lang==="ja"?"ja":"en")).map(iso=>`<option value="${esc(iso)}" ${diaryFilter===iso?"selected":""}>${esc(countryName(iso))}</option>`).join("");
let match=posts.filter(p=>diaryFilter==="all"||p.iso===diaryFilter);
$("#diary-count").textContent=match.length+" "+tr("post_label");
$("#diary-posts").innerHTML=match.map(p=>`<article class="diary-card glass"><div class="diary-img"><img loading="lazy" src="${esc(p.photo)}" alt="${esc(cityName(p))}"></div><div class="diary-body"><span class="eyebrow">${esc(dateLabel(p.date))} · ${esc(countryName(p.iso))}</span><h3>${esc(cityName(p))}</h3><div class="diary-thumbs">${p.photos.map(img=>`<img loading="lazy" src="${esc(img)}" alt="${esc(cityName(p))}">`).join("")}</div><p><a href="${cityLink(p)}">${esc(tr("travel_guide"))}</a></p></div></article>`).join("");
if(!select.dataset.bound){select.addEventListener("change",()=>{diaryFilter=select.value;track("diary-filter",diaryFilter);renderDiary()});select.dataset.bound="yes";}
}
function selectGachaCountry(){
const region=$("#gacha-region").value;
const eligible=[...new Set(posts.map(p=>p.iso))].filter(iso=>region==="all"||country(iso).region===region);
if(!eligible.length){toast(lang==="ja"?"この地域の旅行写真は準備中です。":"More photos are coming for this region.");return}
gachaCountry=eligible[Math.floor(Math.random()*eligible.length)];gachaCity=null;
$("#gacha-city").disabled=false;$("#gacha-share").disabled=false;
$("#gacha-machine").parentElement.classList.remove("spinning");void $("#gacha-machine").offsetWidth;$("#gacha-machine").parentElement.classList.add("spinning");
renderGachaResult();track("gacha-country",gachaCountry);
}
function selectGachaCity(){
if(!gachaCountry)return;const pool=covers(gachaCountry);gachaCity=pool[Math.floor(Math.random()*pool.length)];renderGachaResult();track("gacha-city",gachaCity.slug)
}
function renderGachaResult(){
const el=$("#gacha-result");if(!gachaCountry){el.innerHTML=`<div class="gacha-pending"><span>✧</span><p>${esc(tr("gacha_pending"))}</p></div>`;return}
const c=country(gachaCountry),photo=gachaCity?.photo||c.cover;
el.innerHTML=`<div class="gacha-result-photo"><img src="${esc(photo)}" alt="${esc(name(c))}"><div class="gacha-result-label"><span class="eyebrow" style="color:#fff">${esc(tr(gachaCity?"city_drew":"country_drew"))}</span><h3>${esc(gachaCity?cityName(gachaCity):name(c))}</h3><p>${esc(gachaCity?name(c):rname(c.region))} · <a href="${gachaCity?cityLink(gachaCity):countryLink(gachaCountry)}">${esc(tr("travel_guide"))}</a></p></div></div>`;
}
async function saveResult(){
if(!gachaCountry)return;
const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext("2d");
const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,"#f0ffff");bg.addColorStop(.5,"#b0eeee");bg.addColorStop(1,"#64bacc");ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
let img=new Image();img.src=gachaCity?.photo||country(gachaCountry).cover;
await new Promise(resolve=>{img.onload=resolve;img.onerror=resolve});
if(img.complete&&img.naturalWidth){const scale=Math.max(930/img.width,770/img.height);let iw=img.width*scale,ih=img.height*scale;ctx.drawImage(img,75+(930-iw)/2,235+(770-ih)/2,iw,ih);}
ctx.strokeStyle="#ffffff";ctx.lineWidth=14;ctx.strokeRect(65,225,950,790);
ctx.font="italic 86px Georgia,serif";ctx.fillStyle="#1a6c7b";ctx.textAlign="center";ctx.fillText("TORAMI TRAVEL",540,145);
ctx.font="30px serif";ctx.fillText("THE WORLD IS YOURS",540,195);
ctx.fillStyle="#e6fcfa";ctx.fillRect(40,1030,1000,230);ctx.fillStyle="#185f70";
ctx.font="600 66px serif";ctx.fillText(gachaCity?cityName(gachaCity):countryName(gachaCountry),540,1128);
ctx.font="30px serif";ctx.fillText(gachaCity?countryName(gachaCountry):rname(country(gachaCountry).region),540,1194);
ctx.font="28px serif";ctx.fillText("@findmeoutthere25",540,1296);
const a=document.createElement("a");a.download="torami-travel-gacha.png";a.href=canvas.toDataURL("image/png");a.click();
track("gacha-share");toast(lang==="ja"?"画像を作成しました。保存を確認してね。":"Your share image is ready.");
}
function renderGacha(){
renderGachaResult();
if(!$("#gacha-country").dataset.bound){
$("#gacha-country").addEventListener("click",selectGachaCountry);
$("#gacha-city").addEventListener("click",selectGachaCity);
$("#gacha-again").addEventListener("click",()=>{gachaCountry=null;gachaCity=null;$("#gacha-city").disabled=true;$("#gacha-share").disabled=true;renderGachaResult()});
$("#gacha-share").addEventListener("click",saveResult);
$("#gacha-country").dataset.bound="yes";
}}
function pageRender(){
localizeStatic();
const page=$("body").dataset.page;
if(page==="home")renderHome();
if(page==="atlas")renderAtlas();
if(page==="destinations")renderDestinations();
if(page==="destination")renderDestination();
if(page==="themes")renderThemes();
if(page==="rankings")renderRankings();
if(page==="gacha")renderGacha();
if(page==="diary")renderDiary();
}
$("#language-toggle").addEventListener("click",()=>{lang=lang==="ja"?"en":"ja";try{localStorage.setItem("torami_lang",lang)}catch(e){}pageRender();track("language-change",lang)});
$("#mobile-toggle").addEventListener("click",()=>{const nav=$("#site-nav"),v=!nav.classList.contains("open");nav.classList.toggle("open",v);$("#mobile-toggle").setAttribute("aria-expanded",String(v))});
document.addEventListener("click",ev=>{const a=ev.target.closest("a");if(a&&a.href)track("navigation",a.getAttribute("href")||"")});
pageRender();
})();
