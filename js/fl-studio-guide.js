// =========================================================
// BEATLAB KZ — Dedicated FL Studio Pro Guide Module
// Mac (⌘) / Windows (Ctrl) Hotkeys, 10-Step Workflow,
// Stock Plugins Guide & 6 Secret FL Studio Pro Tricks
// =========================================================

const STORAGE_FL_STEPS = 'beatlab_fl_steps_v1';

const FL_COOKUP_STEPS = [
  {
    id: 'fl1',
    step: '01',
    title: 'Жобаны баптау және BPM қою',
    where: 'Top Toolbar • Options → Audio Settings',
    desc: 'FL Studio ашылғанда ең алдымен темпті қой (мысалы, Trap үшін <strong>140 BPM</strong>, Boom Bap үшін <strong>90 BPM</strong>, Drill үшін <strong>142 BPM</strong>). Дыбыс қатпауы үшін Audio Settings ішінде Buffer Length-ті <code>256–512 smp</code> шамасында ұста.',
    keyMac: '⌘ + S (бірден сақтап ал!)',
    keyWin: 'Ctrl + S (бірден сақтап ал!)'
  },
  {
    id: 'fl2',
    step: '02',
    title: 'Drum Kit папкаңды Browser-ге қосу',
    where: 'Options → File Settings → Browser extra search folders',
    desc: 'Жүктелген драм-кит папкаңды осында қоссаң, сол жақтағы Browser-де мәңгі тұрады. Дыбыстарды іздемей-ақ бірден Channel Rack-қа сүйреп саласың.',
    keyMac: '⌥ + F8 (Browser ашу/жабу)',
    keyWin: 'Alt + F8 (Browser ашу/жабу)'
  },
  {
    id: 'fl3',
    step: '03',
    title: 'Мелодия жазу және Scale Highlighting қосу',
    where: 'Channel Rack (+) → FLEX → Piano Roll (F7)',
    desc: 'Аспап ретінде встроенный <strong>FLEX</strong> (немесе FL Keys) қос. Piano Roll-да жоғарғы сол жақ үшбұрыштан <strong>View → Scale Highlighting → C + Minor Natural</strong> таңда. Ақшыл жолақтармен 4 аккорд және қарапайым әуен сал!',
    keyMac: 'F7 (Piano Roll) • ⌘ + B (көшіру)',
    keyWin: 'F7 (Piano Roll) • Ctrl + B (көшіру)'
  },
  {
    id: 'fl4',
    step: '04',
    title: 'Драм-партияны 2 минутта жинау',
    where: 'Channel Rack (F6)',
    desc: '<strong>Clap</strong>-ты 9-қадамға қой. <strong>Hi-Hat</strong> үстінен оң жақ батырма → <code>Fill each 2 steps</code> бас! Сосын <strong>Kick</strong>, <strong>Open Hat</strong> және <strong>Perc</strong> қос. Piano Roll-да хэттерге ролл жасау үшін нотаны таңдап Chopper қолдан.',
    keyMac: 'F6 (Channel Rack) • ⌥ + U (Hi-Hat Roll)',
    keyWin: 'F6 (Channel Rack) • Alt + U (Hi-Hat Roll)'
  },
  {
    id: 'fl5',
    step: '05',
    title: '808 Бас: Cut Itself + Envelope + Тюнинг',
    where: '808 Sampler → Envelope терезесі & Wrench',
    desc: '808 үстінен оң жақ батырма → <strong>Cut Itself</strong>! Одан соң 808 терезесінде <strong>Envelope</strong> (2-қойынды) ашып, <code>Attack 0</code>, <code>Hold 100%</code>, қалған бәрін <code>0%</code> қыл — сонда нота біткен сәтте 808 дәл тоқтайды! Нотасын тексеру үшін <strong>Edison → Detect Pitch Regions</strong> қолдан.',
    keyMac: '⌘ + ↓ (808-ді төменгі октаваға түсіру)',
    keyWin: 'Ctrl + ↓ (808-ді төменгі октаваға түсіру)'
  },
  {
    id: 'fl6',
    step: '06',
    title: 'Барлық дыбысты 1 секундта Mixer-ге жіберу',
    where: 'Channel Rack (F6) → Mixer (F9)',
    desc: 'Channel Rack-та әр аспаптың оң жағындағы кішкентай жасыл тіктөртбұрышты екi рет басып бәрін таңда. Сосын Mixer (<code>F9</code>) ашып, <strong>Insert 1</strong> үстінде тұрып төмендегі пернені бас — барлық аспап атымен және түсімен бөлек каналдарға автоматты таралады!',
    keyMac: '⌘ + ⇧ + L (Барлығын Mixer-ге бөлу)',
    keyWin: 'Ctrl + Shift + L (Барлығын Mixer-ге бөлу)'
  },
  {
    id: 'fl7',
    step: '07',
    title: 'Паттернді бөлек жолдарға бөлу (Split by channel)',
    where: 'Pattern Picker (сол жақ жоғарғы панель)',
    desc: 'Егер бәрін <code>Pattern 1</code> ішіне жазсаң, аранжировка үшін оның атынан оң жақ батырма басып <strong>Split by channel</strong> таңда. Әр аспап (Melody, Kick, 808, Hi-Hat) жеке паттернге бөлінеді!',
    keyMac: 'F5 (Playlist ашу)',
    keyWin: 'F5 (Playlist ашу)'
  },
  {
    id: 'fl8',
    step: '08',
    title: 'Playlist-те толық трек құрастыру (Аранжировка)',
    where: 'Playlist (F5)',
    desc: 'Бөлінген паттерндерді Playlist-ке тіз де, 2.5 минутқа көшір. Содан соң Intro-дан драмдарды өшір, Verse-тен артық мелодияны ал, Drop алдында 1–2 соққылық пауза (Slice құралы <code>C</code>) және Riser қос!',
    keyMac: '⌘ + B (көшіру) • C (кесу) • P (салу)',
    keyWin: 'Ctrl + B (көшіру) • C (кесу) • P (салу)'
  },
  {
    id: 'fl9',
    step: '09',
    title: 'Жылдам PRO Миксинг және Master Soft Clipper',
    where: 'Mixer (F9) • Master Channel',
    desc: '1) Деңгейлерді ретте (Kick -6dB, 808 -8dB, Melody -13dB). 2) Мелодияға <strong>Fruity Parametric EQ 2</strong> іліп 120Hz-тен төменін кес. 3) <strong>Master</strong> каналдан әдепкі Fruity Limiter-ді алып, орнына <strong>Fruity Soft Clipper</strong> қой — Trap битің бірден қатты әрі таза ұрады!',
    keyMac: 'F9 (Mixer ашу/жабу)',
    keyWin: 'F9 (Mixer ашу/жабу)'
  },
  {
    id: 'fl10',
    step: '10',
    title: 'Сапалы Экспорт (WAV + MP3)',
    where: 'File → Export → Wave / MP3',
    desc: 'Экспорт терезесінде <strong>Mode: Full song</strong>, <strong>Tail: Leave remainder</strong> (немесе Cut remainder), WAV үшін <strong>24-bit int</strong>, MP3 үшін <strong>320 kbps</strong> және <strong>HQ for all plugins</strong> белгіле де <strong>Start</strong> бас. Алғашқы битің дайын!',
    keyMac: '⌘ + R (WAV) • ⌘ + ⇧ + R (MP3)',
    keyWin: 'Ctrl + R (WAV) • Ctrl + Shift + R (MP3)'
  }
];

const FL_STOCK_PLUGINS = [
  {
    name: 'FLEX',
    cat: 'instrument',
    catLabel: 'АСПАП (VST)',
    badge: '⭐ #1 ТЕГІН АСПАП',
    desc: 'FL Studio ішіндегі ең мықты дайын пресеттер базасы! Ішінде Essential Pianos, Guitars, Strings, Synthwave, 808 пактарын тегін жүктеуге болады.',
    useFor: 'Пианино, гитара, пэд, бас, заманауи лидтер'
  },
  {
    name: 'Fruity Parametric EQ 2',
    cat: 'mixing',
    catLabel: 'МИКСИНГ',
    badge: '🔥 МІНДЕТТІ',
    desc: 'Ең басты эквалайзер! Жиіліктерді көзбен көруге болады. 1-нүктені оң жақпен басып Type → High Pass, Order → Steep 8 қойсаң, мелодиядан артық басты 2 секундта кесесің.',
    useFor: 'Low-Cut (120Hz), балшықты тазалау, вокалға орын ашу'
  },
  {
    name: 'Fruity Soft Clipper',
    cat: 'master',
    catLabel: 'МАСТЕРИНГ',
    badge: '⚡ TRAP ҚҰПИЯСЫ',
    desc: 'Metro Boomin мен барлық дерлік Trap продюсерлердің мастер-каналдағы басты құралы! 0 dB-ден асқан Kick пен 808-ді бұрмаламай, жылы әрі қатты «панч» береді.',
    useFor: 'Master канал (Fruity Limiter орнына)'
  },
  {
    name: 'Gross Beat',
    cat: 'creative',
    catLabel: 'КРЕАТИВ FX',
    badge: '🎛️ HALF-TIME',
    desc: 'Мелодияны 1 басумен 2 есе баяулатып (Presets → Momentary → 1/2 speed), қараңғы Travis Scott / Future стиліндегі вайб береді. Glitch пен Reverse эффектілері де бар.',
    useFor: 'Half-Speed мелодия, Intro/Verse ауысуы'
  },
  {
    name: 'Fruity Reverb 2 & Delay 3',
    cat: 'mixing',
    catLabel: 'КЕҢІСТІК',
    badge: '☁️ АТМОСФЕРА',
    desc: 'Reverb 2 ішінде <code>Low Cut</code> тұтқасын міндетті түрде 250–300Hz-ке бұрап қой, сонда жаңғырық таза шығады. Delay 3-те «Ping Pong» режимі мелодияға кең стерео береді.',
    useFor: 'Пианино, белл, флейта, Producer Tag'
  },
  {
    name: 'Fruity Fast Dist / Blood Overdrive',
    cat: 'creative',
    catLabel: 'САТУРАЦИЯ',
    badge: '🔊 808 КҮШЕЙТКІШ',
    desc: '808 басы телефон динамигінде де қатты әрі «ырылдап» естілуі үшін қолданылады. Mixer-де плагиннің оң жағындағы дөңгелек Mix батырмасын 15–35% шамасында ұста!',
    useFor: '808 Bass сатурациясы, агрессивті Kick'
  },
  {
    name: 'Edison',
    cat: 'tool',
    catLabel: 'ҚҰРАЛ',
    badge: '🎯 808 ТЮНИНГ',
    desc: 'Аудио редактор. 808 сэмплін ішіне сүйреп, жалауша (Flag) → <code>Detect pitch regions</code> бассаң — 808-дің дәл қай нотада екенін 1 секундта көрсетіп береді!',
    useFor: '808 нотасын табу, вокал/сэмпл жазу және кесу'
  },
  {
    name: 'Fruity Slicer / SliceX',
    cat: 'instrument',
    catLabel: 'СЭМПЛИНГ',
    badge: '📼 BOOM BAP',
    desc: 'Ескі әнді немесе домбыра/пианино лупын автоматты түрде биттерге (Beat) кесіп, пианино пернелеріне бөліп береді. Boom Bap пен Sample Drill үшін таптырмас құрал.',
    useFor: 'Сэмпл кесу (Chopping), Speed/Pitch өзгерту'
  },
  {
    name: 'Fruity Limiter',
    cat: 'mixing',
    catLabel: 'SIDECHAIN',
    badge: '⚖️ КОМПРЕССОР',
    desc: 'Тек лимитер емес, ішінде керемет <strong>COMP</strong> режимі бар! Kick каналынан 808 каналына «Sidechain to this track» жасап, Limiter-де Sidechain = 1 таңдасаң, Kick пен 808 мүлде соқтығыспайды.',
    useFor: 'Kick → 808 Sidechain, таза лимитинг'
  }
];

const FL_HOTKEYS = [
  { cat: 'windows', mac: 'F5', win: 'F5', action: 'Playlist (Аранжировка терезесін ашу/жабу)' },
  { cat: 'windows', mac: 'F6', win: 'F6', action: 'Channel Rack (Драм-машина терезесі)' },
  { cat: 'windows', mac: 'F7', win: 'F7', action: 'Piano Roll (Ноталар терезесі)' },
  { cat: 'windows', mac: 'F9', win: 'F9', action: 'Mixer (Микшер пульті)' },
  { cat: 'windows', mac: '⌥ + F8', win: 'Alt + F8', action: 'Browser (Сол жақ дыбыстар панелі)' },
  { cat: 'windows', mac: 'Space', win: 'Space', action: 'Ойнату / Тоқтату (Play / Pause)' },
  { cat: 'windows', mac: 'L', win: 'L', action: 'Pattern және Song режимдерінің арасында ауысу' },
  { cat: 'windows', mac: '⌘ + S', win: 'Ctrl + S', action: 'Жобаны сақтау (әр 5 мин сайын бас!)' },
  { cat: 'windows', mac: '⌘ + N', win: 'Ctrl + N', action: 'Жаңа нұсқа ретінде сақтау (beat_2.flp, beat_3.flp)' },

  { cat: 'pianoroll', mac: '⌘ + B', win: 'Ctrl + B', action: 'Таңдалған ноталарды дәл жанына көшіру (Duplicate #1!)' },
  { cat: 'pianoroll', mac: '⌘ + Q', win: 'Ctrl + Q', action: 'Quick Quantize — қисық ноталарды торға туралау' },
  { cat: 'pianoroll', mac: '⌥ + U', win: 'Alt + U', action: 'Chopper — 1 секундта Hi-Hat Roll жасау!' },
  { cat: 'pianoroll', mac: '⌥ + S', win: 'Alt + S', action: 'Strumizer — аккордты тірі пианино/гитарадай ығыстыру' },
  { cat: 'pianoroll', mac: '⌥ + R', win: 'Alt + R', action: 'Randomizer — ноталардың Velocity күшін тірілту' },
  { cat: 'pianoroll', mac: '⌘ + ↑ / ↓', win: 'Ctrl + ↑ / ↓', action: 'Ноталарды 1 октава жоғары немесе төмен түсіру' },
  { cat: 'pianoroll', mac: '⇧ + ↑ / ↓', win: 'Shift + ↑ / ↓', action: 'Ноталарды 1 жарты тон жоғары / төмен жылжыту' },
  { cat: 'pianoroll', mac: '⌘ + L', win: 'Ctrl + L', action: 'Quick Legato — ноталарды келесі нотаға дейін созу' },
  { cat: 'pianoroll', mac: '⌥ + Scroll', win: 'Alt + Scroll', action: 'Меңзер тұрған нотаның Velocity-ін тез өзгерту' },
  { cat: 'pianoroll', mac: '⌘ + A', win: 'Ctrl + A', action: 'Барлық нотаны таңдау (⌘ + D — таңдауды алу)' },

  { cat: 'playlist', mac: 'P / B', win: 'P / B', action: 'Draw (Қалам) / Brush (Паттернді сырғытып қою)' },
  { cat: 'playlist', mac: 'C', win: 'C', action: 'Slice — паттернді немесе аудионы кесу (пауза жасау!)' },
  { cat: 'playlist', mac: 'T', win: 'T', action: 'Mute — клипті уақытша өшіріп-қосу' },
  { cat: 'playlist', mac: '⌘ + ⌥ + C', win: 'Ctrl + Alt + C', action: 'Consolidate — паттернді WAV аудиоға айналдыру (CPU үнемдеу!)' },
  { cat: 'playlist', mac: '⇧ + Click', win: 'Shift + Click', action: 'Таңдалған клипті сүйреп көшірмесін жасау' },

  { cat: 'mixer', mac: '⌘ + L', win: 'Ctrl + L', action: 'Channel Rack-тағы 1 аспапты бос Mixer каналына жіберу' },
  { cat: 'mixer', mac: '⌘ + ⇧ + L', win: 'Ctrl + Shift + L', action: 'БАРЛЫҚ таңдалған аспапты бөлек Mixer каналдарына тарату!' },
  { cat: 'mixer', mac: '⌥ + ← / →', win: 'Alt + ← / →', action: 'Mixer-дегі каналдың орнын солға/оңға ауыстыру' },
  { cat: 'mixer', mac: '⌘ + R', win: 'Ctrl + R', action: 'Дайын тректі WAV форматында экспорттау' }
];

const FL_PRO_TRICKS = [
  {
    num: '01',
    title: '1 секундтық Hi-Hat Roll (Chopper)',
    shortcutMac: '⌥ + U',
    shortcutWin: 'Alt + U',
    steps: 'Piano Roll-да Hi-Hat нотасын ұзартып сал (мысалы 1 соққыға), оны таңда да <strong>Chopper</strong> аш. <code>Time Mul</code> тұтқасын бұрасаң — нота лезде 1/32 немесе 1/3 Trap роллына бөлінеді! Соңынан төмендегі Velocity-ді сатылап көтеріп қой.'
  },
  {
    num: '02',
    title: 'Drill 808 Slide (Сырғанайтын бас)',
    shortcutMac: 'Piano Roll → Slide үшбұрышы (S)',
    shortcutWin: 'Piano Roll → Slide үшбұрышы (S)',
    steps: 'Drill стиліндегі «уууиии» деп жоғары секіретін 808 жасау өте оңай: негізгі ұзын 808 нотасының үстіне 1–2 октава жоғарыда қысқа нота қой, оны екі рет басып <strong>Slide (үшбұрыш белгісі)</strong> қос. Екі нота қабаттасқанда бас жібектей сырғанайды!'
  },
  {
    num: '03',
    title: 'Мелодияны «тірі адам ойнағандай» ету',
    shortcutMac: '⌥ + S сосын ⌥ + R',
    shortcutWin: 'Alt + S сосын Alt + R',
    steps: 'Тінтуірмен салынған аккордтар кейде робот сияқты естіледі. Барлық аккордты таңдап <strong>Strumizer (⌥/Alt + S)</strong> қос — ноталар сәл кешігіп тіріледі. Сосын <strong>Randomizer (⌥/Alt + R)</strong> арқылы тек <code>Levels → Velocity</code> тұтқасын аздап бұра!'
  },
  {
    num: '04',
    title: '808 нотасын дәл анықтау (Фальшты жою)',
    shortcutMac: 'Edison → Flag → Detect Pitch',
    shortcutWin: 'Edison → Flag → Detect Pitch',
    steps: '808 сэмплін оң жақпен басып <strong>Edit in audio editor (Edison)</strong> аш. Жалауша белгісі → <code>Detect pitch regions</code> бас — мысалы «F#2» деп шықты делік. Енді 808 терезесінде <strong>Wrench (кілт)</strong> қойындысына кіріп, астындағы пернетақтадан <strong>F#</strong> пернесін <em>оң жақ батырмамен</em> бас! Енді 808-ің 100% дәл C-де!'
  },
  {
    num: '05',
    title: '808 соққанда Kick-пен таласпау (Cut & Envelope)',
    shortcutMac: 'Channel Settings → Envelope',
    shortcutWin: 'Channel Settings → Envelope',
    steps: '808 терезесінде <strong>Cut Itself</strong> қосумен қатар, Envelope бөлімінде <code>Delay 0 • Attack 0 • Hold 100% • Decay 0 • Sustain 0 • Release 0</code> қылып қой. Сонда Piano Roll-да нотаны қай жерде қысқартсаң, 808 дәл сол миллисекундта тап-таза үзіледі — Drop алдындағы паузалар идеал шығады!'
  },
  {
    num: '06',
    title: 'Ноутбук қатпауы үшін 2 сиқырлы батырма',
    shortcutMac: '⌘ + ⌥ + C • Smart Disable',
    shortcutWin: 'Ctrl + Alt + C • Smart Disable',
    steps: 'Ауыр плагиндерден дыбыс тырсылдай бастаса: 1) Жоғарғы мәзірден <strong>Tools → Macros → Switch smart disable for all plugins</strong> бас. 2) Дайын мелодия паттернін <strong>Consolidate (⌘/Ctrl + Alt + C)</strong> арқылы жеңіл WAV-қа айналдырып, ескі VST-ді өшіріп таста!'
  }
];

export function initFlStudioGuide() {
  const osBtns = document.querySelectorAll('#flOsToggle .os-btn');
  const tabBtns = document.querySelectorAll('#flGuideTabs .fl-tab-btn');
  const panels = document.querySelectorAll('.fl-tab-panel');

  const stepsContainer = document.getElementById('flStepsContainer');
  const pluginsContainer = document.getElementById('flPluginsContainer');
  const pluginFilterBtns = document.querySelectorAll('#flPluginFilters .filter-pill');
  const hotkeysContainer = document.getElementById('flHotkeysContainer');
  const hotkeyFilterBtns = document.querySelectorAll('#flHotkeyFilters .filter-pill');
  const tricksContainer = document.getElementById('flTricksContainer');
  const stepsProgressEl = document.getElementById('flStepsProgress');

  // Detect macOS automatically, default to Mac for macOS users
  let currentOs = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? 'mac' : 'win';
  let activePluginCat = 'all';
  let activeHotkeyCat = 'all';

  let completedSteps = new Set();
  try {
    const saved = localStorage.getItem(STORAGE_FL_STEPS);
    if (saved) completedSteps = new Set(JSON.parse(saved));
  } catch (_) {}

  function saveSteps() {
    try {
      localStorage.setItem(STORAGE_FL_STEPS, JSON.stringify([...completedSteps]));
    } catch (_) {}
  }

  function updateOsUI() {
    osBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.os === currentOs));
    renderSteps();
    renderHotkeys();
    renderTricks();
  }

  function renderSteps() {
    const doneCount = completedSteps.size;
    if (stepsProgressEl) {
      stepsProgressEl.textContent = `${doneCount} / ${FL_COOKUP_STEPS.length} қадам`;
    }

    stepsContainer.innerHTML = FL_COOKUP_STEPS.map((s) => {
      const done = completedSteps.has(s.id);
      const keyTxt = currentOs === 'mac' ? s.keyMac : s.keyWin;
      return `
        <div class="fl-step-card ${done ? 'done' : ''}" data-fl-step="${s.id}">
          <div class="fl-step-top">
            <label class="fl-step-check">
              <input type="checkbox" data-step-cb="${s.id}" ${done ? 'checked' : ''} />
              <span class="fl-step-num">ҚАДАМ ${s.step}</span>
            </label>
            <span class="fl-where-tag">${s.where}</span>
          </div>
          <h4>${s.title}</h4>
          <p>${s.desc}</p>
          <div class="fl-step-key">⌨️ <span>${keyTxt}</span></div>
        </div>
      `;
    }).join('');

    stepsContainer.querySelectorAll('input[data-step-cb]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.stepCb;
        if (cb.checked) completedSteps.add(id);
        else completedSteps.delete(id);
        saveSteps();
        renderSteps();
      });
    });
  }

  function renderPlugins() {
    const filtered = activePluginCat === 'all'
      ? FL_STOCK_PLUGINS
      : FL_STOCK_PLUGINS.filter((p) => p.cat === activePluginCat);

    pluginsContainer.innerHTML = filtered.map((p) => `
      <div class="fl-plugin-card">
        <div class="fl-plugin-head">
          <span class="fl-plugin-cat">${p.catLabel}</span>
          <span class="fl-plugin-badge">${p.badge}</span>
        </div>
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <div class="fl-plugin-use"><strong>Не үшін:</strong> ${p.useFor}</div>
      </div>
    `).join('');
  }

  function renderHotkeys() {
    const filtered = activeHotkeyCat === 'all'
      ? FL_HOTKEYS
      : FL_HOTKEYS.filter((h) => h.cat === activeHotkeyCat);

    hotkeysContainer.innerHTML = filtered.map((h) => {
      const k = currentOs === 'mac' ? h.mac : h.win;
      return `
        <div class="fl-hotkey-row">
          <kbd class="fl-kbd-pill">${k}</kbd>
          <span class="fl-hotkey-desc">${h.action}</span>
        </div>
      `;
    }).join('');
  }

  function renderTricks() {
    tricksContainer.innerHTML = FL_PRO_TRICKS.map((t) => {
      const sc = currentOs === 'mac' ? t.shortcutMac : t.shortcutWin;
      return `
        <div class="fl-trick-card">
          <div class="fl-trick-head">
            <span class="fl-trick-num">ТРЮК #${t.num}</span>
            <kbd class="fl-kbd-pill">${sc}</kbd>
          </div>
          <h4>${t.title}</h4>
          <p>${t.steps}</p>
        </div>
      `;
    }).join('');
  }

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.flTab;
      tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
      panels.forEach((p) => p.classList.toggle('hidden', p.id !== targetId));
    });
  });

  // OS switch
  osBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentOs = btn.dataset.os;
      updateOsUI();
    });
  });

  // Plugin filters
  pluginFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activePluginCat = btn.dataset.pcat;
      pluginFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderPlugins();
    });
  });

  // Hotkey filters
  hotkeyFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeHotkeyCat = btn.dataset.hcat;
      hotkeyFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderHotkeys();
    });
  });

  updateOsUI();
  renderPlugins();
}
