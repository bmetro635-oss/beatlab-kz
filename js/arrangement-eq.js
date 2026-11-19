// =========================================================
// BEATLAB KZ — Interactive Arrangement Blueprint & EQ Map
// =========================================================

import { audioEngine } from './audio-engine.js';

const ARR_SECTIONS = [
  {
    id: 'intro',
    name: 'Intro',
    kzName: 'Кіріспе',
    bars: '4–8 такт',
    energy: 3,
    summary: 'Тыңдарманды атмосфераға кіргізу. Артық драм жоқ — тек негізгі мелодия, Producer Tag және соңында көтерілетін Riser.',
    tip: 'Intro тым ұзақ болмасын (7–14 секунд жеткілікті). Соңғы 2 соққыда тыныштық жасасаң, Қайырма жарылып кіреді!'
  },
  {
    id: 'hook1',
    name: 'Hook / Chorus',
    kzName: '1-Қайырма',
    bars: '8 такт',
    energy: 10,
    summary: 'Тректің ең жоғарғы нүктесі (DROP)! Барлық элемент бірге ойнайды: Мелодия + Counter-Melody + Kick + 808 + Clap + Hi-Hats.',
    tip: 'Қайырмада бит максимум «кач» беруі тиіс. 1-соққыда Crash тарелкасын қос!'
  },
  {
    id: 'verse1',
    name: 'Verse 1',
    kzName: 'Шулық (Куплет)',
    bars: '16 такт',
    energy: 6,
    summary: 'Рэпер немесе әнші мәтін оқитын орын! Counter-Melody алынып тасталады, алғашқы 4 тактыда Kick/808 сәл демалып, кейін қайта қосылады.',
    tip: 'Шулықтың 8-тактысынан кейін аздап өзгеріс жаса (мысалы, Open Hat қос немесе мелодияны 1 октава түсір) — сонда 16 такт зеріктірмейді.'
  },
  {
    id: 'bridge',
    name: 'Pre-Chorus',
    kzName: 'Көпір (Bridge)',
    bars: '4 такт',
    energy: 4,
    summary: 'Екінші Қайырма алдындағы тыныс алу сәті! 808 бен Kick толық өшеді, тек мелодия мен Riser қалып, қайтадан жарылысқа дайындайды.',
    tip: 'Мелодияға Low-Pass Filter («су асты» эффектісі) қойып, 4 такт ішінде ашып отырсаң — өте кәсіби естіледі!'
  },
  {
    id: 'hook2',
    name: 'Hook 2',
    kzName: '2-Қайырма',
    bars: '8 такт',
    energy: 10,
    summary: 'Тыныштықтан кейінгі ең қуатты оралу! Тыңдарман 4 такт бойы күткен 808 бен Kick қайта соғып, максималды эмоция береді.',
    tip: '1-Қайырмадан сәл ерекшеленуі үшін қосымша Perc немесе жоғары октавадағы белл қосуға болады.'
  },
  {
    id: 'outro',
    name: 'Outro',
    kzName: 'Аяқталуы',
    bars: '4–8 такт',
    energy: 2,
    summary: 'Тректі әдемі жабу: драмдар мен бас біртіндеп өшеді, тек негізгі мелодия мен Reverb құйрығы қалып, баяу басылады (Fade Out).',
    tip: 'Мастер-каналда Volume-ды соңғы 4 тактыда 100%-дан 0%-ға тегіс түсіруге (Automation) болады.'
  }
];

const ARR_LAYERS = [
  { name: 'Негізгі Мелодия', color: '#8b6cff', bg: 'rgba(139,108,255,0.28)', border: '#8b6cff', active: [1, 1, 1, 1, 1, 1], clip: ['Melody', 'Melody', 'Melody', 'Filtered', 'Melody', 'Fade Out'] },
  { name: 'Counter-Melody',  color: '#28d8f0', bg: 'rgba(40,216,240,0.24)',  border: '#28d8f0', active: [0, 1, 0, 1, 1, 0], clip: ['', 'Bell/Pad', '', 'Pad', 'Bell/Pad', ''] },
  { name: '808 Bass',        color: '#ff4769', bg: 'rgba(255,71,105,0.28)',  border: '#ff4769', active: [0, 1, 1, 0, 1, 0], clip: ['', 'Full 808', 'Lite 808', '', 'Full 808', ''] },
  { name: 'Kick',            color: '#ff8c24', bg: 'rgba(255,140,36,0.28)',  border: '#ff8c24', active: [0, 1, 1, 0, 1, 0], clip: ['', 'Punch', 'Part 2', '', 'Punch', ''] },
  { name: 'Snare / Clap',    color: '#f5c542', bg: 'rgba(245,197,66,0.25)',  border: '#f5c542', active: [0, 1, 1, 0, 1, 0], clip: ['', 'Clap+Snr', 'Clap', '', 'Clap+Snr', ''] },
  { name: 'Hi-Hats',         color: '#00e5a0', bg: 'rgba(0,229,160,0.24)',   border: '#00e5a0', active: [0, 1, 1, 1, 1, 0], clip: ['', 'Rolls', '2-Step', 'Light', 'Rolls', ''] },
  { name: 'FX / Tag / Riser',color: '#ff70c8', bg: 'rgba(255,112,200,0.24)', border: '#ff70c8', active: [1, 1, 0, 1, 1, 1], clip: ['Tag+Riser', 'Crash', '', 'Riser', 'Crash', 'FX'] }
];

export function initArrangement() {
  const gridEl = document.getElementById('arrangementTimeline');
  const detailEl = document.getElementById('arrangementDetail');
  const walkBtn = document.getElementById('arrWalkthroughBtn');

  let activeIdx = 1; // Start highlighted on Hook 1
  let walkTimer = null;

  function renderTimeline() {
    gridEl.innerHTML = '';

    // Top-left corner
    const corner = document.createElement('div');
    corner.className = 'tl-label-cell';
    corner.style.color = '#ff8c24';
    corner.textContent = 'ТРЕКТЕР / БӨЛІМ';
    gridEl.appendChild(corner);

    // Column headers
    ARR_SECTIONS.forEach((sec, idx) => {
      const h = document.createElement('button');
      h.type = 'button';
      h.className = 'tl-header-cell' + (idx === activeIdx ? ' active' : '');
      h.innerHTML = `<strong>${sec.name}</strong><span>${sec.bars}</span>`;
      h.addEventListener('click', () => {
        stopWalkthrough();
        selectSection(idx);
      });
      gridEl.appendChild(h);
    });

    // Track rows
    ARR_LAYERS.forEach((layer) => {
      const lbl = document.createElement('div');
      lbl.className = 'tl-label-cell';
      lbl.innerHTML = `<span style="width:8px;height:16px;border-radius:3px;background:${layer.color};display:inline-block;"></span>${layer.name}`;
      gridEl.appendChild(lbl);

      layer.active.forEach((isOn, colIdx) => {
        const block = document.createElement('div');
        block.className = 'tl-block' + (isOn ? ' filled' : '') + (colIdx === activeIdx ? ' col-active' : '');
        if (isOn) {
          block.style.setProperty('--clip-bg', layer.bg);
          block.style.setProperty('--clip-border', layer.border);
          block.textContent = layer.clip[colIdx];
        }
        block.addEventListener('click', () => {
          stopWalkthrough();
          selectSection(colIdx);
        });
        gridEl.appendChild(block);
      });
    });

    renderDetail();
  }

  function renderDetail() {
    const sec = ARR_SECTIONS[activeIdx];
    const barsHtml = Array.from({ length: 10 }, (_, i) => {
      const hPct = 35 + i * 7;
      return `<i class="${i < sec.energy ? 'lit' : ''}" style="height:${hPct}%"></i>`;
    }).join('');

    detailEl.innerHTML = `
      <div>
        <div class="arr-detail-title">
          <span class="badge badge-amber">${sec.bars}</span>
          <h3>${sec.name} — ${sec.kzName}</h3>
        </div>
        <p>${sec.summary}</p>
        <p style="color:#00e5a0;font-size:0.88rem;margin:0;"><strong>💡 PRO Кеңес:</strong> ${sec.tip}</p>
      </div>
      <div class="energy-meter-box">
        <span>ЭНЕРГИЯ ДЕҢГЕЙІ: ${sec.energy * 10}%</span>
        <div class="energy-bars">${barsHtml}</div>
        <div style="font-size:0.78rem;color:#9ba3b8;">
          Ойнап тұрған қабаттар: <strong style="color:#f4f6fb;">${ARR_LAYERS.filter((l) => l.active[activeIdx]).length} / ${ARR_LAYERS.length}</strong>
        </div>
      </div>
    `;
  }

  function selectSection(idx) {
    activeIdx = idx;
    renderTimeline();
  }

  function stopWalkthrough() {
    if (walkTimer) {
      clearInterval(walkTimer);
      walkTimer = null;
      walkBtn.textContent = '▶ Бөлімдерді ретімен көрсету';
    }
  }

  walkBtn.addEventListener('click', () => {
    if (walkTimer) {
      stopWalkthrough();
      return;
    }
    let idx = 0;
    walkBtn.textContent = '■ Тоқтату';
    const stepFn = () => {
      selectSection(idx);
      // Subtle chord/kick audio cue reflecting section energy
      const sec = ARR_SECTIONS[idx];
      if (sec.energy >= 8) {
        audioEngine.triggerDrum('kick');
        audioEngine.triggerDrum('808', null, 0.7);
      } else if (sec.energy >= 5) {
        audioEngine.triggerDrum('clap', null, 0.5);
      } else {
        audioEngine.playSynthNote(60, { duration: 0.9, voice: 'pad', velocity: 0.35 });
        audioEngine.playSynthNote(67, { duration: 0.9, voice: 'pad', velocity: 0.3 });
      }
      idx = (idx + 1) % ARR_SECTIONS.length;
    };
    stepFn();
    walkTimer = window.setInterval(stepFn, 2200);
  });

  renderTimeline();
}

// =========================================================
// Interactive EQ & Mixing Spectrum Visualizer
// =========================================================

const EQ_PROFILES = [
  {
    id: '808',
    label: '808 Bass',
    title: 'PARAMETRIC EQ 2 • 808 BASS',
    pan: 'MONO • 0% PAN',
    peak: '-9 dB ... -6 dB',
    space: '100% MONO (Ортада)',
    color: '#ff4769',
    // SVG path points [x(0..700), y(130=0dB, smaller=boost, larger=cut)]
    points: [[0,245],[35,215],[70,130],[125,95],[200,115],[310,135],[420,175],[560,235],[700,250]],
    nodes: [
      { x: 65, y: 130, label: 'HPF 25–30Hz' },
      { x: 125, y: 95, label: '+3dB Sub (45–65Hz)' },
      { x: 420, y: 175, label: 'LPF (Артық шуды кесу)' }
    ],
    fx: ['EQ', 'Saturation / Dist', 'Sidechain (Kick)', 'Mono Utility'],
    tips: [
      '<strong>25–30 Hz-тен төменін кес (HPF):</strong> адам құлағы естімейтін, бірақ миксті ластайтын ультра-субты алып таста.',
      '<strong>45–70 Hz аумағы:</strong> 808-дің нағыз діріл мен салмақ беретін жүрегі.',
      '<strong>Телефонда естілуі үшін:</strong> 120–250 Hz аумағына аздап <strong>Saturation</strong> қос!'
    ]
  },
  {
    id: 'kick',
    label: 'Kick (Бочка)',
    title: 'PARAMETRIC EQ 2 • KICK DRUM',
    pan: 'MONO • 0% PAN',
    peak: '-6 dB ... -4 dB',
    space: '100% MONO (Ортада)',
    color: '#ff8c24',
    points: [[0,250],[55,220],[95,130],[165,86],[265,165],[390,130],[485,108],[600,145],[700,170]],
    nodes: [
      { x: 95, y: 130, label: 'HPF 35Hz' },
      { x: 165, y: 86, label: '+3dB Punch (60–100Hz)' },
      { x: 265, y: 165, label: '-3dB Boxy (300Hz)' },
      { x: 485, y: 108, label: '+2dB Click (3kHz)' }
    ],
    fx: ['EQ', 'Transient Shaper', 'Soft Clipper'],
    tips: [
      '<strong>60–100 Hz:</strong> Kick-тің кеудені ұратын «Панч» нүктесі. 808-бен соқтығысса, Kick-ке 80–100 Hz, 808-ге 45–60 Hz қалдыр!',
      '<strong>250–400 Hz:</strong> картон қорап сияқты «бұлыңғыр» дыбысты сәл кесуге болады.',
      '<strong>2–4 kHz:</strong> бочканың айқын «щелчок» (Click) соққысы.'
    ]
  },
  {
    id: 'snare',
    label: 'Snare / Clap',
    title: 'PARAMETRIC EQ 2 • SNARE & CLAP',
    pan: 'CENTER • 0–10% STEREO',
    peak: '-8 dB ... -6 dB',
    space: 'Ортада (Clap сәл кең)',
    color: '#f5c542',
    points: [[0,250],[120,248],[185,180],[230,130],[275,105],[380,140],[490,102],[610,122],[700,130]],
    nodes: [
      { x: 195, y: 170, label: 'Low-Cut 130Hz' },
      { x: 275, y: 105, label: '+2dB Денесі (200Hz)' },
      { x: 490, y: 102, label: '+2.5dB Snap (2–5kHz)' }
    ],
    fx: ['EQ (Low-Cut)', 'Short Reverb (10%)', 'Clipper'],
    tips: [
      '<strong>120–150 Hz-тен төменін міндетті түрде кес!</strong> Snare-де бас болмауы керек.',
      '<strong>200 Hz:</strong> Snare-ге салмақ пен «дене» береді.',
      '<strong>2–5 kHz:</strong> клэп пен снэрдің өткір әрі анық шарт еткен дыбысы.'
    ]
  },
  {
    id: 'hihat',
    label: 'Hi-Hats',
    title: 'PARAMETRIC EQ 2 • HI-HATS & PERCS',
    pan: 'PAN 15–30% L/R',
    peak: '-15 dB ... -12 dB',
    space: 'Сәл солға не оңға (Pan)',
    color: '#28d8f0',
    points: [[0,250],[240,250],[310,190],[360,130],[480,132],[585,100],[660,112],[700,125]],
    nodes: [
      { x: 325, y: 175, label: 'Low-Cut 350–500Hz' },
      { x: 585, y: 100, label: '+2dB Air (10–14kHz)' }
    ],
    fx: ['EQ (High-Pass)', 'Panning', 'Subtle Delay'],
    tips: [
      '<strong>300–500 Hz-тен төменін толық кес!</strong> Хэтте төмен жиілік мүлде қажет емес.',
      '<strong>Құлақты кеспесін:</strong> егер хэт тым ащы («цссс») естілсе, 6–8 kHz арасын -2 dB төмендет.',
      '<strong>Кеңістік:</strong> Closed Hat-ты сәл оңға (15% R), Open Hat-ты сәл солға (20% L) жылжыт.'
    ]
  },
  {
    id: 'melody',
    label: 'Мелодия / Пианино',
    title: 'PARAMETRIC EQ 2 • MELODY / KEYS',
    pan: 'STEREO • WIDE',
    peak: '-14 dB ... -11 dB',
    space: 'Кең Stereo (Вокалға орта бос)',
    color: '#8b6cff',
    points: [[0,250],[120,248],[195,180],[245,130],[325,158],[430,132],[520,148],[625,120],[700,132]],
    nodes: [
      { x: 205, y: 172, label: 'Low-Cut 120–150Hz!', dy: -16 },
      { x: 330, y: 158, label: '-2.5dB Балшық (300Hz)', dy: 24 },
      { x: 520, y: 148, label: '-2dB Вокалға орын (2.5kHz)', dy: -16 }
    ],
    fx: ['EQ (Low-Cut)', 'Chorus / Stereo', 'Reverb (15–25%)', 'Delay'],
    tips: [
      '<strong>Ең маңызды ереже:</strong> 100–150 Hz-тен төменін кесіп таста (Low-Cut) — 808 басқа толық еркіндік бер!',
      '<strong>250–400 Hz:</strong> сәл төмендетсең, микс бірден мөлдір әрі таза болады.',
      '<strong>1–3 kHz:</strong> болашақ рэпердің даусы осында отырады, сондықтан мелодияны осы жерде аздап жұмсарт.'
    ]
  },
  {
    id: 'vocal',
    label: 'Вокалға орын',
    title: 'VOCAL POCKET • ӘНШІГЕ ОРЫН ҚАЛДЫРУ',
    pan: 'CENTER • MAIN FOCUS',
    peak: 'Битте -3..6 dB Headroom',
    space: 'Ортадағы басты орын',
    color: '#00e5a0',
    points: [[0,245],[140,240],[210,160],[260,130],[360,128],[460,88],[560,96],[650,115],[700,125]],
    nodes: [
      { x: 210, y: 160, label: 'HPF 100Hz' },
      { x: 460, y: 88, label: 'Вокал жүрегі (1–4kHz)' },
      { x: 580, y: 98, label: 'Айқындық (6–10kHz)' }
    ],
    fx: ['Мелодияны Mid-те азайту', 'Аз аспап', 'Таза Headroom'],
    tips: [
      '<strong>Бит сатылуының #1 сыры:</strong> әнші битіңді қосып, үстінен бірден оңай ән айта алуы керек!',
      '<strong>1 kHz – 4 kHz:</strong> адам даусының басты аумағы. Биттің мелодиясы бұл аймақты толық бітеп тастамасын.',
      '<strong>Шулықта (Verse):</strong> артық лид-синтезаторларды өшіріп, артистке кеңістік аш!'
    ]
  }
];

function buildSmoothPath(points) {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export function initEqVisualizer() {
  const tabsEl = document.getElementById('eqInstrumentTabs');
  const svgEl = document.getElementById('eqSvg');
  const titleEl = document.getElementById('eqGraphTitle');
  const panEl = document.getElementById('eqPanBadge');
  const adviceEl = document.getElementById('eqAdvicePanel');

  let activeId = '808';

  function renderTabs() {
    tabsEl.innerHTML = '';
    EQ_PROFILES.forEach((prof) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eq-tab' + (prof.id === activeId ? ' active' : '');
      btn.textContent = prof.label;
      btn.addEventListener('click', () => selectProfile(prof.id));
      tabsEl.appendChild(btn);
    });
  }

  function renderSvg(prof) {
    const curveD = buildSmoothPath(prof.points);
    const areaD = `${curveD} L 700 260 L 0 260 Z`;

    const gridCols = [
      { x: 55, lbl: '30Hz' }, { x: 125, lbl: '60Hz' }, { x: 205, lbl: '125Hz' },
      { x: 290, lbl: '250Hz' }, { x: 375, lbl: '500Hz' }, { x: 455, lbl: '1kHz' },
      { x: 530, lbl: '3kHz' }, { x: 605, lbl: '8kHz' }, { x: 670, lbl: '16kHz' }
    ];

    const vLines = gridCols.map((g) => `
      <line x1="${g.x}" y1="15" x2="${g.x}" y2="240" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="${g.x}" y="253" fill="#646d85" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="middle">${g.lbl}</text>
    `).join('');

    const hLines = [
      { y: 55, lbl: '+6dB' }, { y: 130, lbl: '0dB' }, { y: 205, lbl: '-6dB' }
    ].map((h) => `
      <line x1="0" y1="${h.y}" x2="700" y2="${h.y}" stroke="${h.y === 130 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}" stroke-dasharray="${h.y === 130 ? '4 4' : ''}" stroke-width="1"/>
      <text x="8" y="${h.y - 4}" fill="#646d85" font-size="10" font-family="JetBrains Mono, monospace">${h.lbl}</text>
    `).join('');

    const nodesHtml = prof.nodes.map((n) => {
      const anchor = n.x > 540 ? 'end' : (n.x < 120 ? 'start' : 'middle');
      const labelY = n.dy !== undefined ? n.y + n.dy : (n.y < 70 ? n.y + 20 : n.y - 12);
      return `
        <circle cx="${n.x}" cy="${n.y}" r="9" fill="${prof.color}" opacity="0.22"/>
        <circle cx="${n.x}" cy="${n.y}" r="5" fill="${prof.color}" stroke="#090a0f" stroke-width="2"/>
        <text x="${n.x}" y="${labelY}" fill="#f4f6fb" font-size="11" font-weight="700" font-family="Inter, sans-serif" text-anchor="${anchor}">${n.label}</text>
      `;
    }).join('');

    svgEl.innerHTML = `
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${prof.color}" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="${prof.color}" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      ${vLines}
      ${hLines}
      <path d="${areaD}" fill="url(#eqGrad)"/>
      <path d="${curveD}" fill="none" stroke="${prof.color}" stroke-width="3" stroke-linecap="round"/>
      ${nodesHtml}
    `;
  }

  function renderAdvice(prof) {
    titleEl.textContent = prof.title;
    panEl.textContent = prof.pan;

    adviceEl.innerHTML = `
      <h3>${prof.label} — Миксинг нұсқаулығы</h3>
      <div class="eq-stat-row">
        <div class="eq-mini-stat">
          <span>ҰСЫНЫЛҒАН ДЕҢГЕЙ</span>
          <strong>${prof.peak}</strong>
        </div>
        <div class="eq-mini-stat">
          <span>ПАНОРАМА</span>
          <strong style="color:#28d8f0;">${prof.space}</strong>
        </div>
      </div>
      <div>
        <div class="mono-label" style="margin-bottom:7px;">ЭФФЕКТІЛЕР ТІЗБЕГІ (FX CHAIN):</div>
        <div class="fx-chain">
          ${prof.fx.map((f) => `<span class="fx-chip">${f}</span>`).join('<span style="color:#6c758f;">→</span>')}
        </div>
      </div>
      <ul class="eq-tips-list">
        ${prof.tips.map((t) => `<li>${t}</li>`).join('')}
      </ul>
    `;
  }

  function selectProfile(id) {
    const prof = EQ_PROFILES.find((p) => p.id === id) || EQ_PROFILES[0];
    activeId = prof.id;
    renderTabs();
    renderSvg(prof);
    renderAdvice(prof);
  }

  selectProfile('808');

  return { selectProfile };
}
