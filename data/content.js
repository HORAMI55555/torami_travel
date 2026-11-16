/* TORAMI TRAVEL editorial / design-stage content. Not a verified visit log. */
window.TORAMI_DATA = {
  stats: {countries:35,regions:2,total:195},
  visitedCountries: [], // Intentionally empty until the actual visited-country list is verified.
  instagram:'https://www.instagram.com/findmeoutthere25',
  destinations: [
    {id:'greece',iso:'GRC',ja:'ギリシャ',en:'Greece',cityJa:'サントリーニ',cityEn:'Santorini',region:'Europe',image:'greece.webp',lineJa:'白と青が溶け合う、エーゲ海の夢。',lineEn:'A daydream in Aegean blue.',tags:['beach','romance','summer','views','luxury'],budget:3},
    {id:'iceland',iso:'ISL',ja:'アイスランド',en:'Iceland',cityJa:'レイキャビク',cityEn:'Reykjavík',region:'Europe',image:'iceland.webp',lineJa:'氷とオーロラが描く、地球の魔法。',lineEn:'Where ice meets the northern lights.',tags:['nature','winter','adventure','views'],budget:3},
    {id:'italy',iso:'ITA',ja:'イタリア',en:'Italy',cityJa:'ポジターノ',cityEn:'Positano',region:'Europe',image:'italy.webp',lineJa:'地中海の光に包まれる、色彩の街。',lineEn:'Sunlit colors along the coast.',tags:['romance','beach','summer','views','luxury'],budget:3},
    {id:'france',iso:'FRA',ja:'フランス',en:'France',cityJa:'パリ',cityEn:'Paris',region:'Europe',image:'europe.webp',lineJa:'何度でも夢見たくなる街角へ。',lineEn:'A city made of little daydreams.',tags:['romance','city','luxury'],budget:3},
    {id:'japan',iso:'JPN',ja:'日本',en:'Japan',cityJa:'京都',cityEn:'Kyoto',region:'Asia',image:'asia.webp',lineJa:'静けさの中に、美しさを見つける旅。',lineEn:'Find beauty in the quiet moments.',tags:['city','nature','solo'],budget:2},
    {id:'norway',iso:'NOR',ja:'ノルウェー',en:'Norway',cityJa:'ベルゲン',cityEn:'Bergen',region:'Europe',image:'iceland.webp',lineJa:'フィヨルドの奥へ、自然を抱きしめに。',lineEn:'Into the heart of the fjords.',tags:['nature','winter','adventure'],budget:3},
    {id:'thailand',iso:'THA',ja:'タイ',en:'Thailand',cityJa:'バンコク',cityEn:'Bangkok',region:'Asia',image:'asia.webp',lineJa:'心踊る街と、やわらかな南国の風。',lineEn:'City lights and tropical breezes.',tags:['beach','summer','budget','city'],budget:1},
    {id:'egypt',iso:'EGY',ja:'エジプト',en:'Egypt',cityJa:'カイロ',cityEn:'Cairo',region:'Africa',image:'africa.webp',lineJa:'時を越える景色に出会う。',lineEn:'Wonders beyond the centuries.',tags:['adventure','history','views'],budget:2},
    {id:'switzerland',iso:'CHE',ja:'スイス',en:'Switzerland',cityJa:'ルツェルン',cityEn:'Lucerne',region:'Europe',image:'south-america.webp',lineJa:'絵本のような山々と湖の風景。',lineEn:'An alpine storybook come alive.',tags:['nature','winter','luxury','views'],budget:3},
    {id:'indonesia',iso:'IDN',ja:'インドネシア',en:'Indonesia',cityJa:'バリ',cityEn:'Bali',region:'Asia',image:'oceania.webp',lineJa:'波音と光にほどける休暇。',lineEn:'A gentle escape to island light.',tags:['beach','summer','romance','nature'],budget:2},
    {id:'usa',iso:'USA',ja:'アメリカ',en:'United States',cityJa:'ニューヨーク',cityEn:'New York',region:'North America',image:'north-america.webp',lineJa:'世界中の物語が交差する街へ。',lineEn:'Where a thousand stories meet.',tags:['city','adventure'],budget:3},
    {id:'peru',iso:'PER',ja:'ペルー',en:'Peru',cityJa:'クスコ',cityEn:'Cusco',region:'South America',image:'south-america.webp',lineJa:'アンデスの山々に、歴史が息づく。',lineEn:'Ancient wonders among the Andes.',tags:['nature','adventure','views','history'],budget:2},
    {id:'australia',iso:'AUS',ja:'オーストラリア',en:'Australia',cityJa:'シドニー',cityEn:'Sydney',region:'Oceania',image:'oceania.webp',lineJa:'海と街が出会う、自由な風景。',lineEn:'Coastal freedom and city sparkle.',tags:['beach','summer','city'],budget:3}
  ],
  themes: [
    {id:'beach',ja:'透き通る海とリゾート',en:'Beach & Resort',subJa:'海の青に恋する旅',subEn:'Fall in love with the ocean',symbol:'✧',image:'greece.webp'},
    {id:'romance',ja:'おとぎ話の街',en:'Fairytale Cities',subJa:'心に残るロマンチックな景色',subEn:'Romance around every corner',symbol:'♡',image:'italy.webp'},
    {id:'luxury',ja:'ご褒美ラグジュアリー',en:'Luxury Escapes',subJa:'とっておきの非日常',subEn:'A little extraordinary',symbol:'♢',image:'europe.webp'},
    {id:'views',ja:'一生忘れない絶景',en:'Hidden Gems & Views',subJa:'思わず息をのむ景色',subEn:'Landscapes worth remembering',symbol:'✦',image:'iceland.webp'},
    {id:'nature',ja:'自然と冒険',en:'Nature & Adventure',subJa:'地球の美しさに触れる',subEn:'Meet the wild world',symbol:'☼',image:'south-america.webp'},
    {id:'solo',ja:'ひとり旅のインスピレーション',en:'Solo Inspiration',subJa:'自分だけの景色を探しに',subEn:'Go where curiosity leads',symbol:'✳',image:'asia.webp'},
    {id:'budget',ja:'お財布にやさしい旅',en:'Budget Inspiration',subJa:'気軽に世界を楽しむ',subEn:'Dream big, spend thoughtfully',symbol:'◈',image:'asia.webp'},
    {id:'winter',ja:'冬の魔法',en:'Winter Magic',subJa:'雪とオーロラの幻想世界',subEn:'Snow, stars, and northern lights',symbol:'❄',image:'iceland.webp'},
    {id:'summer',ja:'夏の逃避行',en:'Summer Escape',subJa:'陽射しの向こうへ',subEn:'Chase the golden days',symbol:'☀',image:'italy.webp'},
    {id:'city',ja:'憧れの街歩き',en:'City Wanderlust',subJa:'何気ない路地も旅の宝物',subEn:'Lose yourself in the streets',symbol:'✧',image:'europe.webp'}
  ],
  rankings: [
    {id:'views',ja:'人生で見たい絶景 TOP 10',en:'Unforgettable Views',subtitleJa:'忘れられない景色を集めて',subtitleEn:'Places that stay with you',icon:'✦',image:'iceland.webp'},
    {id:'return',ja:'もう一度行きたい国 TOP 10',en:'Places to Return To',subtitleJa:'また恋しくなる旅先',subtitleEn:'Destinations worth revisiting',icon:'♡',image:'greece.webp'},
    {id:'solo',ja:'ひとり旅におすすめ TOP 10',en:'Solo Travel Favorites',subtitleJa:'ひとりだから見える世界',subtitleEn:'Adventures for independent souls',icon:'✳',image:'asia.webp'},
    {id:'value',ja:'コスパが魅力の旅先 TOP 10',en:'Great Value Escapes',subtitleJa:'賢く旅して、心は贅沢に',subtitleEn:'More wonder for your budget',icon:'◈',image:'europe.webp'},
    {id:'photogenic',ja:'写真に残したい街 TOP 10',en:'Photogenic Cities',subtitleJa:'シャッターを切るたび、ときめく',subtitleEn:'Every corner tells a story',icon:'✧',image:'italy.webp'},
    {id:'surprise',ja:'想像を超えた旅先 TOP 10',en:'Unexpected Wonders',subtitleJa:'予想外の感動を探して',subtitleEn:'The best kind of surprise',icon:'❋',image:'africa.webp'}
  ],
  quiz: [
    {ja:'休日、心が惹かれるのは？',en:'What does your perfect day feel like?',answers:[{ja:'透き通る海',en:'A turquoise coastline',v:'coast'},{ja:'美しい街並み',en:'A romantic city',v:'city'},{ja:'静かなホテル',en:'A serene retreat',v:'luxury'},{ja:'雄大な大自然',en:'Wild landscapes',v:'adventure'}]},
    {ja:'旅で大切にしたいのは？',en:'What matters most when you travel?',answers:[{ja:'のんびり癒やされること',en:'Relaxation',v:'coast'},{ja:'カフェと街歩き',en:'Cafés and strolls',v:'city'},{ja:'特別な体験',en:'Indulgent moments',v:'luxury'},{ja:'未知の発見',en:'Discovery',v:'adventure'}]},
    {ja:'好きな風景の色は？',en:'Pick a travel color',answers:[{ja:'エメラルドブルー',en:'Emerald blue',v:'coast'},{ja:'夕暮れのピンク',en:'Sunset rose',v:'city'},{ja:'真珠のホワイト',en:'Pearl white',v:'luxury'},{ja:'森のグリーン',en:'Forest green',v:'adventure'}]},
    {ja:'旅の思い出に残したいのは？',en:'What will you remember most?',answers:[{ja:'波音と夕焼け',en:'Waves and sunsets',v:'coast'},{ja:'路地裏での発見',en:'Wandering side streets',v:'city'},{ja:'上質なひととき',en:'An exquisite moment',v:'luxury'},{ja:'冒険した瞬間',en:'That first adventure',v:'adventure'}]}
  ],
  types:{
    coast:{en:'Crystal Coast Dreamer',ja:'クリスタル・コースト・ドリーマー',descJa:'青い海、やわらかな光、風にほどける時間。あなたは海辺で心を満たすタイプ。',descEn:'You feel most yourself beside sunlit water and dreamy coastlines.',dest:'greece'},
    city:{en:'Romantic City Wanderer',ja:'ロマンチック・シティ・ワンダラー',descJa:'美しい街角や小さなカフェに、心のときめきを見つけるタイプ。',descEn:'You find magic in winding streets, old façades and slow afternoons.',dest:'italy'},
    luxury:{en:'Quiet Luxury Traveler',ja:'クワイエット・ラグジュアリー',descJa:'賑やかさより、静かで洗練された非日常を大切にするタイプ。',descEn:'You are drawn to understated beauty and deeply restorative escapes.',dest:'switzerland'},
    adventure:{en:'Hidden Gem Collector',ja:'ヒドゥン・ジェム・コレクター',descJa:'まだ知らない景色や驚きを、自分の足で探しに行くタイプ。',descEn:'You collect extraordinary landscapes and unexpected discoveries.',dest:'iceland'}
  }
};
