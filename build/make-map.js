/*
  用真實經緯度產生 index.html 裡的街廓示意圖。

  座標全部逐一在 Google 地圖上查證過（2026-08-26），不是估的。第一版是憑印象畫的，
  把禾禾放在松江路口、袖珍博物館放在更東邊，兩個都錯——禾禾其實在建國北路東邊約
  150 公尺，而袖珍博物館就在建國北路上，兩點只差 244 公尺。

  改街廓或加點的時候改這裡再跑 `node build/make-map.js`，不要手改 index.html 的 SVG。
*/

const fs = require('fs');
const path = require('path');

// ---- 實測座標 ---------------------------------------------------------------

const POI = {
  begood: { lat: 25.0516797, lng: 121.5328186 },
  sjnj:   { lat: 25.0518300, lng: 121.5330931 },
  park:   { lat: 25.0504789, lng: 121.5348439 },
  mmot:   { lat: 25.0504210, lng: 121.5360584 },
  hehe:   { lat: 25.0521750, lng: 121.5375235 },
  kafu:   { lat: 25.0522521, lng: 121.5415353 },  // 黑浮咖啡，落在圖框外
};

// 街道中心線，由上面的點反推（松江路＝捷運站與寒居酒店那條，建國北路＝袖珍博物館那條）
const ROADS = {
  nanjing:  { lat: 25.05210 },   // 南京東路，東西向
  songjiang:{ lng: 121.53300 },  // 松江路，南北向
  yitong:   { lng: 121.53480 },  // 伊通街，南北向
  jianguo:  { lng: 121.53610 },  // 建國北路，南北向
};

const M_PER_LAT = 110570;
const M_PER_LNG = 100900;   // 台北緯度

// ---- 投影 -------------------------------------------------------------------

const LEFT = 50, RIGHT = 368, TOP = 100;
const west = POI.begood.lng, east = POI.hehe.lng;
const south = POI.mmot.lat, north = POI.hehe.lat;

const widthM = (east - west) * M_PER_LNG;
const SCALE = (RIGHT - LEFT) / widthM;          // 每公尺幾個 SVG 單位
const heightU = (north - south) * M_PER_LAT * SCALE;
const BOTTOM = TOP + heightU;

const x = lng => +(LEFT + (lng - west) * M_PER_LNG * SCALE).toFixed(1);
const y = lat => +(BOTTOM - (lat - south) * M_PER_LAT * SCALE).toFixed(1);
const dist = (a, b) => Math.round(Math.hypot((a.lat - b.lat) * M_PER_LAT, (a.lng - b.lng) * M_PER_LNG));

const p = {};
for (const [k, v] of Object.entries(POI)) p[k] = { x: x(v.lng), y: y(v.lat) };

// ---- 組 SVG -----------------------------------------------------------------

const VB_W = 420, VB_H = 300;
const scaleBarM = 100;
const scaleBarU = +(scaleBarM * SCALE).toFixed(1);

const T = (tx, ty, cls, text) => `        <text x="${tx}" y="${ty}" class="${cls}">${text}</text>`;

const svg = `      <svg class="mapsvg" viewBox="0 0 ${VB_W} ${VB_H}" role="img"
           aria-label="街廓示意圖，位置依實際經緯度繪製。松江南京站與 BeGood 所在的寒居酒店幾乎同一個點；往南約 230 公尺是伊通公園，再往東 120 公尺是袖珍博物館；禾禾文化空間在東北方、建國北路再往東約 150 公尺處。黑浮咖啡位於圖框外更東邊 400 公尺。">

        <!-- 街道 -->
        <line x1="16" y1="${y(ROADS.nanjing.lat)}" x2="404" y2="${y(ROADS.nanjing.lat)}" class="m-road m-road-major"/>
        <line x1="${x(ROADS.songjiang.lng)}" y1="60" x2="${x(ROADS.songjiang.lng)}" y2="270" class="m-road m-road-major"/>
        <line x1="${x(ROADS.yitong.lng)}" y1="${y(ROADS.nanjing.lat)}" x2="${x(ROADS.yitong.lng)}" y2="270" class="m-road"/>
        <line x1="${x(ROADS.jianguo.lng)}" y1="60" x2="${x(ROADS.jianguo.lng)}" y2="270" class="m-road m-road-major"/>

${T(20, y(ROADS.nanjing.lat) - 9, 'm-street', '南京東路')}
${T(x(ROADS.songjiang.lng) - 9, 52, 'm-street m-anchor-end', '松江路')}
${T(x(ROADS.yitong.lng) + 8, 52, 'm-street', '伊通街')}
${T(x(ROADS.jianguo.lng) + 8, 268, 'm-street', '建國北路')}

        <!-- 傍晚動線：禾禾 → 伊通公園 → BeGood -->
        <path d="M${p.hehe.x} ${p.hehe.y + 11} L${p.hehe.x} ${p.park.y - 24} L${p.park.x + 13} ${p.park.y - 9}" class="m-walk"/>
        <path d="M${p.park.x - 11} ${p.park.y - 7} L${p.begood.x + 11} ${p.begood.y + 11}" class="m-walk"/>

        <!-- 捷運站與 BeGood：實際只差 32 公尺，兩個標記幾乎重疊，標籤統一放下方 -->
        <rect x="${p.sjnj.x - 11}" y="${p.sjnj.y - 11}" width="22" height="22" rx="3" class="m-station"/>
${T(p.sjnj.x, p.sjnj.y + 5, 'm-stationtxt m-anchor-mid', '捷')}
        <circle cx="${p.begood.x}" cy="${p.begood.y}" r="6" class="m-dot m-dot-m"/>
${T(22, 170, 'm-poi', '松江南京站')}
${T(22, 191, 'm-poi m-poi-m', 'BeGood')}
${T(22, 210, 'm-note', '寒居酒店 2F')}
${T(22, 229, 'm-note', '兩點相距 ' + dist(POI.sjnj, POI.begood) + ' 公尺')}

        <!-- 伊通公園 -->
        <circle cx="${p.park.x}" cy="${p.park.y}" r="7" class="m-dot m-dot-m"/>
${T(p.park.x - 13, p.park.y + 29, 'm-poi m-poi-m', '伊通公園')}
${T(p.park.x - 13, p.park.y + 48, 'm-note', '散場後放電')}

        <!-- 袖珍博物館 -->
        <circle cx="${p.mmot.x}" cy="${p.mmot.y}" r="6" class="m-dot m-dot-b"/>
${T(p.mmot.x + 13, p.mmot.y - 24, 'm-poi m-poi-b', '袖珍博物館')}
${T(p.mmot.x + 13, p.mmot.y - 5, 'm-note', '建國北路一段 96 號')}

        <!-- 禾禾文化空間 -->
        <circle cx="${p.hehe.x}" cy="${p.hehe.y}" r="6" class="m-dot m-dot-a"/>
${T(p.hehe.x + 9, p.hehe.y - 32, 'm-poi m-poi-a m-anchor-end', '禾禾文化空間')}
${T(p.hehe.x + 9, p.hehe.y - 13, 'm-note m-anchor-end', '講座 · 南京東路三段 9 號')}

        <!-- 黑浮咖啡在圖框外 -->
        <path d="M${RIGHT + 14} 124 L${RIGHT + 34} 124 M${RIGHT + 28} 119 L${RIGHT + 34} 124 L${RIGHT + 28} 129" class="m-offarrow"/>
${T(RIGHT + 10, 143, 'm-note m-anchor-end', '黑浮咖啡在圖外')}
${T(RIGHT + 10, 161, 'm-note m-anchor-end', '再往東 ' + dist(POI.hehe, POI.kafu) + ' 公尺')}

        <!-- 指北針與比例尺 -->
        <g class="m-compass">
          <path d="M398 34 L404 52 L398 46 L392 52 Z"/>
${T(398, 70, 'm-note m-anchor-mid', '北')}
        </g>
        <line x1="20" y1="288" x2="${(20 + scaleBarU).toFixed(1)}" y2="288" class="m-scale"/>
${T(20 + scaleBarU + 7, 292, 'm-note', scaleBarM + ' 公尺')}
      </svg>`;

// ---- 換進 index.html --------------------------------------------------------

const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const START = '      <svg class="mapsvg" viewBox="0 0 420 392"';
const START2 = '      <svg class="mapsvg" viewBox="0 0 420 300"';
const END = '      </svg>\n    </figure>';

const s = html.indexOf(START) !== -1 ? html.indexOf(START) : html.indexOf(START2);
if (s === -1) { console.error('找不到近景圖的 <svg> 起點'); process.exit(1); }
const e = html.indexOf(END, s);
if (e === -1) { console.error('找不到近景圖的 </svg>'); process.exit(1); }

html = html.slice(0, s) + svg + '\n' + html.slice(e + '      </svg>\n'.length);
fs.writeFileSync(file, html);

console.log('地圖已更新。比例尺 1 公尺 =', SCALE.toFixed(4), 'SVG 單位');
console.log('圖框內東西向', Math.round(widthM), '公尺、南北向', Math.round((north - south) * M_PER_LAT), '公尺');
for (const [k, v] of Object.entries(p)) console.log('  ', k.padEnd(8), 'x=' + v.x, 'y=' + v.y);
