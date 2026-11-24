/* Atlas display rules. Values on the map and on the country card use the same record. */
window.TORAMI_ATLAS = function({all,by,t,esc,photo,href,validURL,compactCount,visitedIds}){
  const data=window.TORAMI_ATLAS_RATINGS;
  const pdf='https://www.tourism.gov.in/static/uploads/2026/09/a1ff37713ad3922f69778dca13aa65ab.pdf';
  const colors=['#157bcb', '#24ccd1', '#68dbad', '#f0bf63', '#df85aa'];
  const primary=[['all','All'],['safety','Safety'],['budget','Budget'],['trending','Arrivals']];
  const collections=[
    {key:'summer',title:'Summer',caption:t('6〜8月のおすすめ月を登録した旅先','Destinations with June–August in their season notes')},
    {key:'winter',title:'Winter',caption:t('12〜2月のおすすめ月を登録した旅先','Destinations with December–February in their season notes')},
    {key:'my',title:'My Travels',caption:t('あなたが訪問済みに登録した旅先','Places in your passport')},
    {key:'torami',title:'TORAMI’s Travels',caption:t('トラみちゃんが訪れた旅先','Places TORAMI has visited')}
  ];
  const scales={
    safety:{
      title:t('渡航情報の見方','Reading travel advisories'),
      note:t('外務省の危険情報を5色に対応させています。国・地域内で最も高い警戒レベルで着色しています。旅行する場所の最新情報は国別の出典で確認できます。','Colours reflect the highest Japanese MOFA advisory within each destination. Open the source for current advice for your specific route.'),
      labels:[t('外務省4・退避','MOFA 4 · evacuate'),t('外務省3・渡航中止','MOFA 3 · avoid travel'),t('外務省2・不要不急の渡航中止','MOFA 2 · essential travel only'),t('外務省1・十分注意','MOFA 1 · caution'),t('危険情報の発出なし','No advisory issued')].reverse()
    },
    budget:{
      title:t('1人・1日あたりの現地旅費','Local travel cost per person, per day'),
      note:t('旅行者の支出をもとにした目安。比較用の固定換算は1米ドル＝150円、1ユーロ＝165円。航空券や旅の総額は含みません。','Travel-spending estimates, using fixed comparison rates of ¥150 per US dollar and ¥165 per euro. Figures exclude travel to the destination.'),
      labels:[t('¥5,000未満','Under ¥5,000'),'¥5,000–9,999','¥10,000–19,999','¥20,000–29,999','¥30,000'+t('以上','+')]
    },
    trending:{
      title:t('海外からの観光客到着数','International tourist arrivals'),
      note:t('各国の最新収録年の到着延べ回数。国により日帰り客を含む場合があります。','Latest recorded arrivals by destination. M = million. Some countries include same-day visitors.'),
      labels:[t('50万回未満','< 0.5M'),t('50万回〜','0.5M+'),t('200万回〜','2M+'),t('500万回〜','5M+'),t('1,500万回〜','15M+')]
    }
  };
  function budgetRecord(d){
    const b=d.budget||{};if(b.status==='review')return null;
    const stored=Number(b.daily)>0&&b.updatedAt&&b.basis;
    const row=data.budget[d.code];
    if(!stored&&!row)return null;
    const [value,currency,region]=stored?[Number(b.daily),b.currency]:row;
    const rate={JPY:1,EUR:165,USD:150}[currency];
    if(!rate||!(value>0))return null;
    const yen=Math.round(value*rate);
    const level=1+[5000,10000,20000,30000].filter(limit=>yen>=limit).length;
    return {level,value:yen,detail:'¥'+yen.toLocaleString()+' / '+t('人・日','person/day')+(currency==='JPY'?'':' · '+currency+' '+value.toLocaleString()),note:stored?b.basis:'Budget Your Trip',date:stored?b.updatedAt:data.checked,source:stored?validURL(b.source):'https://www.budgetyourtrip.com/'+region+'/rankings'};
  }
  function safetyRecord(d){
    const info=d.safety||{},saved=info.summary&&info.updatedAt&&validURL(info.source);
    const row=data.safety[d.code];
    if(!saved&&!row)return null;
    const risk=saved?info.mofaLevel:row[0];
    if(!Number.isInteger(risk)||risk<0||risk>4)return null;
    const level=1+risk;
    return {level,value:risk,detail:scales.safety.labels[level-1],note:saved?info.summary:t('外務省海外安全情報・域内の最高警戒レベル','Japan MOFA · highest advisory within the destination'),date:saved?info.updatedAt:data.checked,source:saved?validURL(info.source):row[1]};
  }
  function trendRecord(d){
    const value=d.arrivalsLast?.[1];if(value==null)return null;
    return {level:1+[5e5,2e6,5e6,15e6].filter(n=>value>=n).length,value,detail:compactCount(value)+' ('+d.arrivalsLast[0]+')',date:'2026-11-24',note:d.arrivalsLast[0],source:d.arrSource};
  }
  function seasonal(d,key){
    if(!d.climate)return null;
    const months=key==='summer'?[5,6,7]:[11,0,1],c=d.climate;
    const value=Math.round(months.reduce((s,m)=>s+c.temp[m],0)*10/3)/10;
    const rain=months.reduce((s,m)=>s+c.rain[m],0);
    return {level:1+[5,15,22,28].filter(n=>value>=n).length,value,detail:c.place+' · '+value+' °C · '+rain+' mm',note:t('3か月の平均気温・合計降水量','Three-month mean temperature and total precipitation')+' · WorldClim 2.1 (1970–2000)',date:'2026-11-24',source:'https://www.worldclim.org/data/worldclim21.html'};
  }
  for(const key of ['summer','winter']){
    scales[key]={title:(key==='summer'?'6–8':'12–2')+t('月の気候',' · monthly climate'),note:t('代表都市付近の平年値（WorldClim 2.1、1970–2000年）。どの国も同じ暦月で比較。色は気温を表し、国を選ぶと降水量も表示します。','WorldClim 2.1, 1970–2000 normals near the named city. Colours show temperature for the same calendar months worldwide. Select a destination for rainfall.'),labels:['< 5°C','5–<15°C','15–<22°C','22–<28°C','28°C+']};
  }
  const readers={safety:safetyRecord,budget:budgetRecord,trending:trendRecord,summer:d=>seasonal(d,'summer'),winter:d=>seasonal(d,'winter')};
  function legend(key){
    const scale=scales[key];
    return `<div class="scale-header"><p class="eyebrow">${key.toUpperCase()}</p><h3>${scale.title}</h3></div><ol class="jewel-scale">${scale.labels.map((label,i)=>`<li><i class="scale-stone" style="--stone:${colors[i]}"></i><span>LEVEL ${i+1}</span><strong>${label}</strong></li>`).join('')}</ol><p class="scale-note">${scale.note}</p><p class="scale-missing"><i></i>${t('パールホワイト：データなし・対象外','Pearl white marks unavailable or inapplicable data')}</p>`;
  }
  function menu(){
    return `<div class="primary-modes" role="group" aria-label="${t('地図テーマ','Map themes')}">${primary.map(([key,title])=>`<button type="button" data-mode="${key}" aria-pressed="${key==='all'}">${title}</button>`).join('')}</div><button class="more-modes-toggle" id="more-modes-toggle" aria-label="${t('旅のテーマを選ぶ','More travel themes')}" aria-expanded="false" aria-controls="more-modes">›</button><div class="more-modes glass atlas-menu" id="more-modes" hidden><div class="mood-options">${collections.filter(c=>c.ids).map(c=>`<button type="button" data-mode="${c.key}" aria-pressed="false">${photo(by(c.ids[0]))}<span><strong>${c.title}</strong><small>${c.caption}</small></span></button>`).join('')}</div><div class="map-shortcuts">${collections.filter(c=>!c.ids).map(c=>`<button type="button" data-mode="${c.key}" aria-pressed="false">${c.title}</button>`).join('')}</div></div>`;
  }
  function selectedDestinations(key){
    const collection=collections.find(c=>c.key===key);
    if(collection.ids)return collection.ids.map(by).filter(Boolean);
    if(key==='my'){const ids=new Set(visitedIds());return all.filter(d=>ids.has(d.id))}
    if(key==='torami')return all.filter(d=>d.visited);
    if(key==='resort')return all.filter(d=>d.tags.includes('resort'));
    const months=key==='summer'?[6,7,8]:[12,1,2];
    return all.filter(d=>d.season?.some(m=>months.includes(m)));
  }
  function bind(map){
    const heading=document.getElementById('atlas-caption'),results=document.getElementById('map-results');
    const more=document.getElementById('more-modes'),toggle=document.getElementById('more-modes-toggle');
    let mode='all',records=new Map();
    const status=document.getElementById('map-highlight-status');
    function closeMenu(){more.hidden=true;toggle.setAttribute('aria-expanded','false')}
    toggle.onclick=()=>{const open=more.hidden;more.hidden=!open;toggle.setAttribute('aria-expanded',String(open))};
    document.addEventListener('click',e=>{if(!more.hidden&&!e.target.closest('.map-switcher'))closeMenu()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&more.contains(document.activeElement)){closeMenu();toggle.focus()}});
    function choose(key){
      mode=key;map.dataset.theme=key;
      const scale=scales[key],collection=collections.find(c=>c.key===key);
      const reader=readers[key];records=new Map();
      if(reader)for(const d of all){const record=reader(d);if(record)records.set(d.id,record)}
      const list=reader?all.filter(d=>records.has(d.id)):collection?selectedDestinations(key):all;
      const ids=new Set(list.map(d=>d.id));
      closeMenu();
      document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===key)));
      toggle.classList.toggle('is-current',!!collection);
      for(const el of map.querySelectorAll('[data-map-country]')){
        const record=records.get(el.dataset.mapCountry);
        el.classList.toggle('mood-match',!!collection&&ids.has(el.dataset.mapCountry));
        el.classList.toggle('unrated',!!scale&&!record);
        el.style.setProperty('--gem-fill','url(#jewel-tone-'+(record?.level||6)+')');
        el.style.setProperty('--stone',record?colors[record.level-1]:'transparent');
        el.classList.toggle('rated',!!record);
      }
      map.classList.toggle('rated-map',!!scale);
      map.classList.toggle('mood-map',!!collection&&!scale);
      heading.hidden=key==='all';
      heading.innerHTML=scale?legend(key):collection?`<h3>${collection.title}</h3><p>${collection.caption}</p>`:'';
      const label=primary.find(p=>p[0]===key)?.[1]||collection?.title;
      status.textContent=key==='all'?t('世界の197カ国','197 countries'):label+' · '+list.length+t('カ国・地域',' destinations');
      results.hidden=key==='all';results.innerHTML='';
      if(key==='all')return;
      if(!list.length){
        results.innerHTML=`<p>${key==='my'?t('国を選んで、最初の旅を記録しましょう。','Select a country to record your first visit.'):t('このテーマの旅先はまだ登録されていません。','No destinations have been added to this theme yet.')}</p>`;
        return;
      }
      if(scale)list.sort((a,b)=>(key==='budget'||key==='safety')?records.get(a.id).value-records.get(b.id).value:records.get(b.id).level-records.get(a.id).level);
      const links=list.map(d=>`<a class="atlas-postcard" href="${href(d)}">${photo(d)}<span><strong>${esc(d.en)}</strong><small>${esc(t(d.ja,d.region))}</small>${reader?`<small>Lv.${records.get(d.id).level} · ${esc(records.get(d.id).detail)}</small>`:''}</span></a>`).join('');
      results.innerHTML=scale?`<details><summary>${t('データのある旅先を見る','Explore destinations with data')} (${list.length})</summary><div class="atlas-postcards">${links}</div></details>`:`<div class="atlas-postcards">${links}</div>`;
    }
    for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{
      const fromMenu=more.contains(b);choose(b.dataset.mode);if(fromMenu)toggle.focus({preventScroll:true});
    };
    choose('all');
    return {
      refresh(){if(mode==='my')choose('my')},
      detail(d){
        if(!scales[mode])return '';
        const record=records.get(d.id),label=primary.find(p=>p[0]===mode)?.[1]||collections.find(c=>c.key===mode)?.title;
        if(mode==='safety'&&d.code==='KP')return `<div class="atlas-country-info">${t('北朝鮮全土への渡航自粛要請（段階評価の対象外）','Japan requests that its nationals refrain from travel throughout North Korea. Outside the numeric scale.')}<a href="https://www.anzen.mofa.go.jp/info/pcinfectionspothazardinfo_035.html" target="_blank" rel="noopener noreferrer">${t('外務省の情報を見る','View MOFA advice')} ↗</a></div>`;
        if(mode==='safety'&&d.code==='JP')return `<div class="atlas-country-info">${t('日本国内は外務省の海外危険情報の対象外です。','Japan is outside the scope of MOFA’s overseas travel advisories.')}</div>`;
        if(!record)return `<div class="atlas-country-info">${label} · ${t('比較データ未収録','No comparable data')}${mode==='safety'?`<a href="https://www.anzen.mofa.go.jp/riskmap/" target="_blank" rel="noopener noreferrer">${t('外務省の地域別情報を見る','Check MOFA advisories')} ↗</a>`:''}</div>`;
        return `<div class="atlas-country-info"><span class="scale-stone" style="--stone:${colors[record.level-1]}"></span><strong>${label} · Lv.${record.level} · ${esc(record.detail)}</strong><small>${esc(record.note)} · ${t('確認','Checked')} ${esc(record.date)}</small>${record.source?`<a href="${esc(record.source)}" target="_blank" rel="noopener noreferrer">${mode==='safety'?t('外務省で地域別の最新情報を見る','Check current regional advice at MOFA'):t('出典を見る','View source')} ↗</a>`:''}</div>`;
      }
    };
  }
  return {menu,bind};
};
