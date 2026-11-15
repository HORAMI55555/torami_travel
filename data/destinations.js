/*
 * TORAMI TRAVEL — editable content database.
 * The 35-country count comes from the supplied November 2026 screenshot.
 * visitedCountryNames below is an APPROXIMATE transcription of colored areas,
 * not a verified itinerary. Replace it with your actual list before publication.
 * The featured places and city ideas are EDITORIAL EXAMPLES, not claims of trips taken.
 */
window.TORAMI_DATA = {
  brand: 'TORAMI',
  tripCountFromScreenshot: 35,
  regionCountFromScreenshot: 2,
  mapSourceDate: '2026-11',
  visitedListVerified: false,
  instagramUrl: '', // Paste your real TORAMI Instagram link once the username is decided.
  visitedCountryNames: [
    'United States of America','Mexico','United Kingdom','France','Spain',
    'Portugal','Germany','Netherlands','Belgium','Switzerland','Austria',
    'Italy','Czechia','Poland','Hungary','Greece','Turkey','Sweden',
    'Norway','Finland','Denmark','Estonia','Latvia','Lithuania','Egypt',
    'United Arab Emirates','India','China','Japan','South Korea',
    'Thailand','Vietnam','Malaysia','Indonesia','Philippines'
  ],
  /* Country/city ideas are general travel inspiration. Modify as your own trips are documented. */
  guides: [
    {key:'greece',name:'Greece',ja:'ギリシャ',continent:'Europe',type:['coast','summer','culture'],budget:'mid',photo:'greece.webp',city:'Santorini',cityJa:'サントリーニ',cities:[['Santorini','サントリーニ'],['Athens','アテネ'],['Crete','クレタ島']],tag:'ISLAND & SUNSET',tagJa:'島と夕景',desc:'Whitewashed villages, deep-blue horizons and slow Mediterranean evenings.',descJa:'白い街並みとエーゲ海。海辺で過ごす、余白のある時間。'},
    {key:'czechia',name:'Czechia',ja:'チェコ',continent:'Europe',type:['culture','city','budget'],budget:'low',photo:'czechia.webp',city:'Prague',cityJa:'プラハ',cities:[['Prague','プラハ'],['Český Krumlov','チェスキー・クルムロフ'],['Brno','ブルノ']],tag:'OLD-WORLD CHARM',tagJa:'中世の街並み',desc:'A city of spires, stone bridges, and little discoveries after dark.',descJa:'尖塔と石畳の先に、物語のような景色が広がる。'},
    {key:'maldives',name:'Maldives',ja:'モルディブ',continent:'Asia',type:['coast','summer','nature'],budget:'high',photo:'maldives.webp',city:'Malé',cityJa:'マレ',cities:[['Malé','マレ'],['Ari Atoll','アリ環礁'],['Baa Atoll','バア環礁']],tag:'BAREFOOT LUXURY',tagJa:'海の楽園',desc:'Lagoon blues, quiet mornings and the luxury of doing very little.',descJa:'透き通るラグーンと、何もしない贅沢に出会う旅。'},
    {key:'japan',name:'Japan',ja:'日本',continent:'Asia',type:['culture','nature','city'],budget:'mid',photo:'',city:'Kyoto',cityJa:'京都',cities:[['Tokyo','東京'],['Kyoto','京都'],['Osaka','大阪'],['Nara','奈良']],tag:'ART OF CONTRAST',tagJa:'伝統と現代',desc:'Quiet gardens meet illuminated streets and artful everyday rituals.',descJa:'庭園の静けさと街のきらめき。伝統と新しさを巡る。'},
    {key:'italy',name:'Italy',ja:'イタリア',continent:'Europe',type:['culture','coast','city'],budget:'mid',photo:'',city:'Rome',cityJa:'ローマ',cities:[['Rome','ローマ'],['Florence','フィレンツェ'],['Venice','ヴェネツィア'],['Amalfi Coast','アマルフィ海岸']],tag:'LA DOLCE VITA',tagJa:'美しき日常',desc:'Art, architecture and small pleasures around every corner.',descJa:'芸術と街の記憶が、何気ない一日を特別にする。'},
    {key:'thailand',name:'Thailand',ja:'タイ',continent:'Asia',type:['coast','culture','budget'],budget:'low',photo:'',city:'Bangkok',cityJa:'バンコク',cities:[['Bangkok','バンコク'],['Chiang Mai','チェンマイ'],['Phuket','プーケット']],tag:'TROPICAL RHYTHM',tagJa:'南国のリズム',desc:'Vibrant markets, temple details and laid-back island days.',descJa:'寺院と市場の活気、南国の島時間を楽しむ。'},
    {key:'indonesia',name:'Indonesia',ja:'インドネシア',continent:'Asia',type:['coast','nature','budget'],budget:'low',photo:'',city:'Bali',cityJa:'バリ島',cities:[['Bali','バリ島'],['Yogyakarta','ジョグジャカルタ'],['Jakarta','ジャカルタ']],tag:'ISLAND SOUL',tagJa:'島の時間',desc:'Volcanic horizons, green terraces and warm island air.',descJa:'火山の景色と緑の棚田。五感で楽しむ島旅。'},
    {key:'france',name:'France',ja:'フランス',continent:'Europe',type:['culture','city','coast'],budget:'high',photo:'',city:'Paris',cityJa:'パリ',cities:[['Paris','パリ'],['Nice','ニース'],['Lyon','リヨン']],tag:'TIMELESS DETAILS',tagJa:'街角の美学',desc:'Slow afternoons, layered history and understated elegance.',descJa:'街角に漂う文化と、気負わないエレガンス。'},
    {key:'turkey',name:'Turkey',ja:'トルコ',continent:'Asia',type:['culture','nature','budget'],budget:'mid',photo:'',city:'Istanbul',cityJa:'イスタンブール',cities:[['Istanbul','イスタンブール'],['Cappadocia','カッパドキア'],['Antalya','アンタルヤ']],tag:'BETWEEN WORLDS',tagJa:'大陸の交差点',desc:'Layered cities and extraordinary landscapes between continents.',descJa:'大陸が交わる街と、大地がつくる幻想的な景色。'},
    {key:'norway',name:'Norway',ja:'ノルウェー',continent:'Europe',type:['nature','summer'],budget:'high',photo:'',city:'Bergen',cityJa:'ベルゲン',cities:[['Oslo','オスロ'],['Bergen','ベルゲン'],['Tromsø','トロムソ']],tag:'THE NORTHERN LIGHT',tagJa:'北欧の自然',desc:'Fjords, crisp air and landscapes that make you feel small.',descJa:'フィヨルドと澄んだ空気。自然に心をほどく旅。'},
    {key:'egypt',name:'Egypt',ja:'エジプト',continent:'Africa',type:['culture','nature'],budget:'mid',photo:'',city:'Cairo',cityJa:'カイロ',cities:[['Cairo','カイロ'],['Luxor','ルクソール'],['Aswan','アスワン']],tag:'ANCIENT WONDERS',tagJa:'悠久の歴史',desc:'Ancient monuments and stories etched into desert landscapes.',descJa:'砂漠に刻まれた、何千年もの時間に会いに行く。'},
    {key:'united-states',name:'United States of America',ja:'アメリカ',continent:'North America',type:['nature','city'],budget:'high',photo:'',city:'New York',cityJa:'ニューヨーク',cities:[['New York','ニューヨーク'],['Los Angeles','ロサンゼルス'],['San Francisco','サンフランシスコ']],tag:'ENDLESS SCENES',tagJa:'広がる景色',desc:'Big-city energy and epic natural landscapes in one journey.',descJa:'大都会の熱気も、スケールの大きな自然も。'},
    {key:'india',name:'India',ja:'インド',continent:'Asia',type:['culture','nature','budget'],budget:'low',photo:'',city:'Jaipur',cityJa:'ジャイプール',cities:[['Delhi','デリー'],['Jaipur','ジャイプール'],['Agra','アーグラ']],tag:'COLOUR & HERITAGE',tagJa:'彩りと歴史',desc:'Intricate craft, palaces and a remarkable mix of traditions.',descJa:'色とりどりの文化、宮殿、受け継がれる手仕事。'},
    {key:'china',name:'China',ja:'中国',continent:'Asia',type:['culture','nature','city'],budget:'mid',photo:'',city:'Shanghai',cityJa:'上海',cities:[['Shanghai','上海'],['Beijing','北京'],['Xi’an','西安']],tag:'MANY WORLDS',tagJa:'多彩な表情',desc:'From urban skylines to centuries of history and sweeping nature.',descJa:'都市の輪郭から壮大な自然、悠久の歴史まで。'},
    {key:'vietnam',name:'Vietnam',ja:'ベトナム',continent:'Asia',type:['coast','culture','budget'],budget:'low',photo:'',city:'Hanoi',cityJa:'ハノイ',cities:[['Hanoi','ハノイ'],['Hội An','ホイアン'],['Ho Chi Minh City','ホーチミン']],tag:'EVERYDAY MAGIC',tagJa:'暮らしの風景',desc:'Colourful streets, atmospheric old towns and coastal discoveries.',descJa:'路地に息づく暮らしと、色彩豊かな街並み。'}
  ],
  // City pages use general discovery ideas; none of the entries are first-person reviews.
  journalEntries: [],
  instagramDrafts: [
    {pillar:'WORLD MAP',ja:'世界地図',en:'My travel map',ideaJa:'35ヶ国＋2地域の旅マップを紹介。最後に「次はどこ？」と質問。',ideaEn:'Introduce your journey map and ask followers where you should go next.'},
    {pillar:'DESTINATION GUIDE',ja:'国・都市ガイド',en:'Destination diary',ideaJa:'実際に行った国の「初めて行く前に知りたいこと」を5枚で紹介。',ideaEn:'Create a five-slide first-time visitor guide using real experience.'},
    {pillar:'TRAVEL TIPS',ja:'旅のコツ',en:'Saveable travel tips',ideaJa:'旅行前にチェックすることリスト。自分の体験から具体例を追加。',ideaEn:'A saveable pre-trip checklist with your first-hand tips.'},
    {pillar:'TRAVEL GACHA',ja:'旅ガチャ',en:'Destination roulette',ideaJa:'ガチャ結果から一つの都市を紹介。リンクでサイトに誘導。',ideaEn:'Reveal a surprise destination with a link to the website.'},
    {pillar:'MY JOURNEY',ja:'旅の記録',en:'Personal travel story',ideaJa:'1枚の思い出写真から始まるミニストーリー。',ideaEn:'Tell a short story beginning with one original travel photo.'}
  ]
};
