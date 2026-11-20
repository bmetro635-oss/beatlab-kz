// =========================================================
// BEATLAB KZ — Interactive FL Studio Visual Screenshots Guide
// 6 Authentic FL Studio UI Diagrams with Clickable Hotspots
// =========================================================

export const FL_VISUALS = [
  {
    id: 'overview',
    shortLabel: '1. Негізгі панель',
    title: 'FL Studio Басты Терезесі және 5 Негізгі Батырма',
    subtitle: 'Бағдарламаны алғаш ашқанда көрінетін жоғарғы панель — осы 5 батырмамен бүкіл битті басқарасың.',
    pins: [
      {
        num: 1, x: 16.5, y: 21,
        title: 'PAT / SONG режимі және Ойнату (Space)',
        desc: '<strong>PAT (сары)</strong> — тек бір паттернді (мысалы, драм-лупты) тыңдау. <strong>SONG (жасыл)</strong> — Playlist-тегі бүкіл 2.5 минуттық тректі тыңдау! Ауыстыру пернесі: <code>L</code>.'
      },
      {
        num: 2, x: 35.5, y: 21,
        title: 'BPM (Темп) дисплейі — 140.000',
        desc: 'Биттің жылдамдығы! Үстінен тінтуірмен жоғары/төмен сүйреп өзгерт: Trap = <code>140</code>, Drill = <code>142</code>, Boom Bap = <code>90</code>, Lo-Fi = <code>78</code>.'
      },
      {
        num: 3, x: 64.5, y: 21,
        title: '5 басты терезе батырмасы (F5, F6, F7, F8, F9)',
        desc: 'Солдан оңға: <strong>Playlist (F5)</strong> → <strong>Piano Roll (F7)</strong> → <strong>Channel Rack (F6)</strong> → <strong>Mixer (F9)</strong> → <strong>Browser (⌥+F8)</strong>. Егер бір терезе жоғалып кетсе — дәл осы жерден ашасың!'
      },
      {
        num: 4, x: 14, y: 66,
        title: 'Browser (Сол жақ дыбыстар қоймасы)',
        desc: 'Барлық Drum Kit-тер (Kick, 808, Snare, Hi-Hat) мен сэмплдер осы жерде тұрады. Дыбысты тыңдап, Channel Rack-қа сүйреп тастайсың.'
      },
      {
        num: 5, x: 63, y: 66,
        title: 'Жұмыс ағыны: Channel Rack → Piano Roll → Playlist → Mixer',
        desc: 'FL Studio-да бәрі ретімен жүреді: 1) Дыбыс таңда → 2) Паттерн жаз → 3) Playlist-ке тіз → 4) Mixer-де тазала → 5) WAV/MP3 экспортта!'
      }
    ],
    svg: `
      <svg viewBox="0 0 920 470" xmlns="http://www.w3.org/2000/svg" class="fl-svg-screen">
        <defs>
          <linearGradient id="flTopBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3a454f"/>
            <stop offset="100%" stop-color="#2a333b"/>
          </linearGradient>
          <linearGradient id="flBodyBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e252c"/>
            <stop offset="100%" stop-color="#161b21"/>
          </linearGradient>
        </defs>
        <!-- Outer FL Studio Window -->
        <rect width="920" height="470" rx="12" fill="url(#flBodyBg)" stroke="#485563" stroke-width="2"/>
        <!-- Menu Bar -->
        <rect x="2" y="2" width="916" height="28" rx="10" fill="#232b32"/>
        <text x="16" y="20" fill="#ff8c24" font-family="Montserrat, sans-serif" font-weight="900" font-size="12">🌶️ FL STUDIO 24</text>
        <text x="142" y="20" fill="#b8c4d0" font-family="Inter, sans-serif" font-size="11">FILE   EDIT   ADD   PATTERNS   VIEW   OPTIONS   TOOLS   HELP</text>
        <text x="790" y="20" fill="#6f7f8f" font-family="JetBrains Mono, monospace" font-size="10">beat_01.flp</text>

        <!-- Main Top Toolbar -->
        <rect x="2" y="32" width="916" height="82" fill="url(#flTopBg)"/>
        <line x1="2" y1="114" x2="918" y2="114" stroke="#14191e" stroke-width="2"/>

        <!-- Transport Block -->
        <rect x="18" y="44" width="230" height="58" rx="7" fill="#20272e" stroke="#455360"/>
        <!-- PAT / SONG Toggle -->
        <rect x="28" y="52" width="44" height="20" rx="4" fill="#ff8c24"/>
        <text x="50" y="66" fill="#0d1115" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">PAT</text>
        <rect x="28" y="75" width="44" height="20" rx="4" fill="#2f3a44" stroke="#44525f"/>
        <text x="50" y="89" fill="#8898a8" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">SONG</text>
        <!-- Play / Stop / Rec -->
        <rect x="84" y="54" width="38" height="38" rx="6" fill="#2d3740" stroke="#00e5a0" stroke-width="1.5"/>
        <polygon points="98,64 112,73 98,82" fill="#00e5a0"/>
        <rect x="128" y="54" width="38" height="38" rx="6" fill="#2d3740" stroke="#4a5866"/>
        <rect x="140" y="66" width="14" height="14" rx="2" fill="#b8c4d0"/>
        <rect x="172" y="54" width="38" height="38" rx="6" fill="#2d3740" stroke="#4a5866"/>
        <circle cx="191" cy="73" r="7" fill="#ff4769"/>
        <text x="220" y="77" fill="#8898a8" font-family="JetBrains Mono, monospace" font-size="9">REC</text>

        <!-- BPM & Time LCD -->
        <rect x="262" y="44" width="180" height="58" rx="7" fill="#171d22" stroke="#455360"/>
        <text x="276" y="61" fill="#6f8090" font-family="JetBrains Mono, monospace" font-size="9">TEMPO (BPM)</text>
        <text x="276" y="90" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="800" font-size="25">140.000</text>
        <rect x="394" y="53" width="38" height="40" rx="5" fill="#263038"/>
        <text x="413" y="70" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">PAT</text>
        <text x="413" y="86" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="14" text-anchor="middle">1</text>

        <!-- 5 Main Window Buttons (Highlighted!) -->
        <rect x="458" y="44" width="295" height="58" rx="7" fill="#20272e" stroke="#ff8c24" stroke-width="1.8"/>
        <text x="470" y="58" fill="#ffb870" font-family="JetBrains Mono, monospace" font-size="9">5 НЕГІЗГІ ТЕРЕЗЕ БАТЫРМАСЫ</text>
        <!-- F5 -->
        <rect x="468" y="64" width="50" height="32" rx="5" fill="#2d3842" stroke="#596b7d"/>
        <text x="493" y="78" fill="#28d8f0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">F5</text>
        <text x="493" y="90" fill="#c7d3df" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">Playlist</text>
        <!-- F7 -->
        <rect x="524" y="64" width="50" height="32" rx="5" fill="#2d3842" stroke="#596b7d"/>
        <text x="549" y="78" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">F7</text>
        <text x="549" y="90" fill="#c7d3df" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">Piano</text>
        <!-- F6 -->
        <rect x="580" y="64" width="50" height="32" rx="5" fill="#3a4754" stroke="#ff8c24" stroke-width="1.5"/>
        <text x="605" y="78" fill="#ff8c24" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">F6</text>
        <text x="605" y="90" fill="#ffffff" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">Rack</text>
        <!-- F9 -->
        <rect x="636" y="64" width="50" height="32" rx="5" fill="#2d3842" stroke="#596b7d"/>
        <text x="661" y="78" fill="#8b6cff" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">F9</text>
        <text x="661" y="90" fill="#c7d3df" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">Mixer</text>
        <!-- F8 -->
        <rect x="692" y="64" width="50" height="32" rx="5" fill="#2d3842" stroke="#596b7d"/>
        <text x="717" y="78" fill="#f5c542" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">F8</text>
        <text x="717" y="90" fill="#c7d3df" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">Browser</text>

        <!-- CPU & Output Meter -->
        <rect x="768" y="44" width="134" height="58" rx="7" fill="#171d22" stroke="#455360"/>
        <text x="780" y="60" fill="#6f8090" font-family="JetBrains Mono, monospace" font-size="9">CPU: 12% • RAM 1.2GB</text>
        <rect x="780" y="68" width="110" height="9" rx="3" fill="#242e36"/>
        <rect x="780" y="68" width="76" height="9" rx="3" fill="#00e5a0"/>
        <rect x="780" y="82" width="110" height="9" rx="3" fill="#242e36"/>
        <rect x="780" y="82" width="68" height="9" rx="3" fill="#00e5a0"/>

        <!-- Left Sidebar: Browser -->
        <rect x="14" y="128" width="196" height="326" rx="8" fill="#232b33" stroke="#3c4854"/>
        <rect x="14" y="128" width="196" height="28" rx="8" fill="#2e3842"/>
        <text x="26" y="146" fill="#f5c542" font-family="JetBrains Mono, monospace" font-weight="700" font-size="11">📂 BROWSER (⌥+F8)</text>
        <g font-family="Inter, sans-serif" font-size="11" fill="#b4c0cc">
          <text x="26" y="178">▸ Packs (Стандартты)</text>
          <text x="26" y="202" fill="#ff9f43" font-weight="700">▾ MY DRUM KITS ⭐</text>
          <text x="40" y="224" fill="#e6edf5">📁 808s (Spinz, Zay)</text>
          <text x="40" y="246" fill="#e6edf5">📁 Kicks (Punchy)</text>
          <text x="40" y="268" fill="#e6edf5">📁 Claps &amp; Snares</text>
          <text x="40" y="290" fill="#e6edf5">📁 Hi-Hats &amp; Percs</text>
          <text x="40" y="312" fill="#e6edf5">📁 FX / Risers</text>
          <text x="26" y="342">▸ Plugin database</text>
          <text x="26" y="366">▸ Recorded / Sliced</text>
        </g>
        <rect x="24" y="392" width="176" height="48" rx="6" fill="#1a2127" stroke="#3b4754"/>
        <text x="34" y="411" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-size="10">Дыбысты сүйреп таста →</text>
        <text x="34" y="428" fill="#8998a8" font-family="Inter, sans-serif" font-size="10">Browser → Channel Rack</text>

        <!-- Right Workspace: Visual Workflow Cards representing the 4 windows -->
        <rect x="226" y="128" width="678" height="326" rx="8" fill="#1b2228" stroke="#34404b"/>
        <text x="244" y="152" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="11">FL STUDIO ЖҰМЫС АҒЫНЫ (БАСЫНАН АЯҒЫНА ДЕЙІН)</text>

        <!-- Mini Channel Rack -->
        <rect x="244" y="168" width="305" height="122" rx="8" fill="#263038" stroke="#ff8c24"/>
        <text x="258" y="190" fill="#ff8c24" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">1. CHANNEL RACK (F6)</text>
        <text x="258" y="208" fill="#b4c0cc" font-family="Inter, sans-serif" font-size="11">Драмдар мен VST аспаптар осында</text>
        <rect x="258" y="220" width="66" height="16" rx="3" fill="#3a4652"/>
        <rect x="332" y="220" width="14" height="16" rx="2" fill="#ff8c24"/>
        <rect x="350" y="220" width="14" height="16" rx="2" fill="#414e5b"/>
        <rect x="368" y="220" width="14" height="16" rx="2" fill="#414e5b"/>
        <rect x="386" y="220" width="14" height="16" rx="2" fill="#414e5b"/>
        <rect x="406" y="220" width="14" height="16" rx="2" fill="#6e4b4b"/>
        <rect x="424" y="220" width="14" height="16" rx="2" fill="#6e4b4b"/>
        <rect x="442" y="220" width="14" height="16" rx="2" fill="#ff8c24"/>
        <rect x="258" y="244" width="66" height="16" rx="3" fill="#3a4652"/>
        <rect x="332" y="244" width="14" height="16" rx="2" fill="#414e5b"/>
        <rect x="350" y="244" width="14" height="16" rx="2" fill="#414e5b"/>
        <rect x="442" y="244" width="14" height="16" rx="2" fill="#f5c542"/>
        <text x="258" y="279" fill="#7c8d9e" font-family="JetBrains Mono, monospace" font-size="10">Kick, Clap, Hi-Hat, 808, FLEX</text>

        <!-- Arrow 1->2 -->
        <text x="564" y="236" fill="#ff8c24" font-size="22" font-weight="900">→</text>

        <!-- Mini Piano Roll -->
        <rect x="586" y="168" width="300" height="122" rx="8" fill="#263038" stroke="#00e5a0"/>
        <text x="600" y="190" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">2. PIANO ROLL (F7)</text>
        <text x="600" y="208" fill="#b4c0cc" font-family="Inter, sans-serif" font-size="11">Мелодия, аккорд және 808 ноталары</text>
        <rect x="600" y="220" width="24" height="58" rx="3" fill="#dbe3ec"/>
        <rect x="630" y="220" width="242" height="58" rx="4" fill="#1e272e"/>
        <rect x="638" y="256" width="54" height="10" rx="2" fill="#9ed28a"/>
        <rect x="638" y="242" width="54" height="10" rx="2" fill="#9ed28a"/>
        <rect x="638" y="228" width="54" height="10" rx="2" fill="#9ed28a"/>
        <rect x="702" y="248" width="54" height="10" rx="2" fill="#9ed28a"/>
        <rect x="702" y="234" width="54" height="10" rx="2" fill="#9ed28a"/>
        <rect x="768" y="240" width="60" height="10" rx="2" fill="#00e5a0"/>

        <!-- Mini Playlist -->
        <rect x="244" y="312" width="305" height="126" rx="8" fill="#263038" stroke="#28d8f0"/>
        <text x="258" y="334" fill="#28d8f0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">3. PLAYLIST (F5)</text>
        <text x="258" y="352" fill="#b4c0cc" font-family="Inter, sans-serif" font-size="11">Intro → Hook → Verse → Outro жинау</text>
        <rect x="258" y="365" width="76" height="18" rx="4" fill="rgba(139,108,255,0.45)" stroke="#8b6cff"/>
        <rect x="340" y="365" width="120" height="18" rx="4" fill="rgba(139,108,255,0.45)" stroke="#8b6cff"/>
        <rect x="340" y="388" width="120" height="18" rx="4" fill="rgba(255,71,105,0.45)" stroke="#ff4769"/>
        <rect x="340" y="411" width="180" height="16" rx="4" fill="rgba(0,229,160,0.35)" stroke="#00e5a0"/>

        <!-- Arrow 3->4 -->
        <text x="564" y="382" fill="#28d8f0" font-size="22" font-weight="900">→</text>

        <!-- Mini Mixer -->
        <rect x="586" y="312" width="300" height="126" rx="8" fill="#263038" stroke="#8b6cff"/>
        <text x="600" y="334" fill="#8b6cff" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">4. MIXER (F9) + EXPORT</text>
        <text x="600" y="352" fill="#b4c0cc" font-family="Inter, sans-serif" font-size="11">EQ, Reverb, Soft Clipper және WAV</text>
        <g transform="translate(602,364)">
          <rect x="0" y="0" width="22" height="60" rx="4" fill="#1a2127" stroke="#475563"/>
          <rect x="6" y="14" width="10" height="40" rx="2" fill="#00e5a0"/>
          <rect x="30" y="0" width="22" height="60" rx="4" fill="#1a2127" stroke="#475563"/>
          <rect x="36" y="20" width="10" height="34" rx="2" fill="#ff8c24"/>
          <rect x="60" y="0" width="22" height="60" rx="4" fill="#1a2127" stroke="#475563"/>
          <rect x="66" y="18" width="10" height="36" rx="2" fill="#ff4769"/>
          <rect x="90" y="0" width="22" height="60" rx="4" fill="#1a2127" stroke="#475563"/>
          <rect x="96" y="28" width="10" height="26" rx="2" fill="#8b6cff"/>
          <rect x="128" y="4" width="136" height="22" rx="4" fill="#313d48" stroke="#ff8c24"/>
          <text x="138" y="19" fill="#ffd29d" font-family="JetBrains Mono, monospace" font-size="9">Soft Clipper (Master)</text>
          <rect x="128" y="32" width="136" height="22" rx="4" fill="#313d48" stroke="#28d8f0"/>
          <text x="138" y="47" fill="#9eeeff" font-family="JetBrains Mono, monospace" font-size="9">Parametric EQ 2</text>
        </g>
      </svg>
    `
  },
  {
    id: 'channel-rack',
    shortLabel: '2. Channel Rack',
    title: 'Channel Rack (F6) — Trap Драм-партия және «Fill each 2 steps»',
    subtitle: 'Биттің барлық аспаптары мен 16-қадамды драм-торы осы терезеде тұрады.',
    pins: [
      {
        num: 1, x: 7, y: 31,
        title: 'Жасыл LED — Mute / Solo',
        desc: 'Бір рет бассаң — каналдың дыбысы өшеді (Mute). <strong>Оң жақ батырмамен</strong> бассаң — тек сол жалғыз аспап ойнайды (Solo)!'
      },
      {
        num: 2, x: 16, y: 31,
        title: 'Mixer Track нөмірі (1, 2, 3, 4...)',
        desc: 'Әр аспаптың қай Mixer каналына баратынын көрсетеді. Егер бос (<code>---</code>) тұрса, ол тікелей Master-ге кетіп жатыр — оны міндетті түрде бөлек каналға байла!'
      },
      {
        num: 3, x: 35.5, y: 55,
        title: 'Жасыл таңдау белгісі → ⌘/Ctrl + ⇧ + L',
        desc: 'Осы кішкентай жасыл тіктөртбұрышты <strong>екі рет басып</strong> барлық аспапты таңда, сосын Mixer-де <code>⌘ + ⇧ + L</code> (Win: <code>Ctrl + Shift + L</code>) бассаң — бәрі автоматты түрде Mixer-ге таралады!'
      },
      {
        num: 4, x: 65, y: 53,
        title: 'Классикалық Trap: CLAP дәл 9-қадамда (3-соққы)',
        desc: 'Қара және қызыл-қоңыр түстер әр 4 қадамды (1 соққыны) бөліп тұрады. Trap-та <strong>Clap 3-ші топтың 1-түймесінде (9-қадам)</strong> тұрады!'
      },
      {
        num: 5, x: 43, y: 74,
        title: 'Оң жақ батырма: «Fill each 2 steps» & «Cut itself»',
        desc: 'Hi-Hat-ты қолмен 8 рет басып отырма! Үстінен оң жақ батырма → <strong>Fill each 2 steps</strong> бас — 1 секундта толтырады. Ал 808 баста дәл осы мәзірден <strong>Cut itself</strong> қос!'
      }
    ],
    svg: `
      <svg viewBox="0 0 920 470" xmlns="http://www.w3.org/2000/svg" class="fl-svg-screen">
        <rect width="920" height="470" rx="12" fill="#232b32" stroke="#495765" stroke-width="2"/>
        <!-- Window Header -->
        <rect x="2" y="2" width="916" height="36" rx="10" fill="#323d47"/>
        <text x="20" y="25" fill="#f4f6fb" font-family="Inter, sans-serif" font-weight="800" font-size="13">▾  Channel rack — Pattern 1 (140 BPM Trap)</text>
        <rect x="650" y="9" width="120" height="22" rx="5" fill="#20272e" stroke="#4a5866"/>
        <text x="710" y="24" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">All channels</text>
        <rect x="780" y="9" width="122" height="22" rx="5" fill="#20272e" stroke="#ff8c24"/>
        <text x="841" y="24" fill="#ffb870" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">SWING: 0%</text>

        <!-- Column Headers -->
        <text x="48" y="64" fill="#7c8d9e" font-family="JetBrains Mono, monospace" font-size="10">LED</text>
        <text x="128" y="64" fill="#7c8d9e" font-family="JetBrains Mono, monospace" font-size="10">MIXER</text>
        <text x="202" y="64" fill="#7c8d9e" font-family="JetBrains Mono, monospace" font-size="10">CHANNEL / АСПАП</text>
        <g font-family="JetBrains Mono, monospace" font-size="10" fill="#8898a8" text-anchor="middle">
          <text x="415" y="64" fill="#fff" font-weight="700">1</text><text x="444" y="64">2</text><text x="473" y="64">3</text><text x="502" y="64">4</text>
          <text x="537" y="64" fill="#fff" font-weight="700">5</text><text x="566" y="64">6</text><text x="595" y="64">7</text><text x="624" y="64">8</text>
          <text x="659" y="64" fill="#ff9f43" font-weight="800">9</text><text x="688" y="64">10</text><text x="717" y="64">11</text><text x="746" y="64">12</text>
          <text x="781" y="64" fill="#fff" font-weight="700">13</text><text x="810" y="64">14</text><text x="839" y="64">15</text><text x="868" y="64">16</text>
        </g>

        <!-- Row 1: FLEX Piano (Piano Roll preview) -->
        <g transform="translate(0, 76)">
          <rect x="18" y="0" width="884" height="46" rx="6" fill="#2a333c"/>
          <circle cx="58" cy="23" r="6" fill="#00e5a0"/>
          <circle cx="90" cy="23" r="10" fill="#1e252c" stroke="#536373"/>
          <line x1="90" y1="23" x2="90" y2="15" stroke="#ff8c24" stroke-width="2"/>
          <rect x="128" y="10" width="34" height="26" rx="4" fill="#1a2127" stroke="#475563"/>
          <text x="145" y="27" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">1</text>
          <rect x="172" y="7" width="136" height="32" rx="5" fill="#463d69" stroke="#8b6cff"/>
          <text x="240" y="27" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="12" text-anchor="middle">FLEX (Dark Piano)</text>
          <rect x="318" y="9" width="12" height="28" rx="3" fill="#00e5a0"/>
          <!-- Mini piano roll notes -->
          <rect x="398" y="7" width="490" height="32" rx="4" fill="#1b232a" stroke="#3c4956"/>
          <rect x="408" y="26" width="110" height="6" rx="2" fill="#9ed28a"/>
          <rect x="408" y="16" width="110" height="6" rx="2" fill="#9ed28a"/>
          <rect x="528" y="22" width="110" height="6" rx="2" fill="#9ed28a"/>
          <rect x="650" y="14" width="110" height="6" rx="2" fill="#9ed28a"/>
          <rect x="770" y="20" width="106" height="6" rx="2" fill="#9ed28a"/>
        </g>

        <!-- Row 2: 808 Spinz -->
        <g transform="translate(0, 130)">
          <rect x="18" y="0" width="884" height="46" rx="6" fill="#2a333c"/>
          <circle cx="58" cy="23" r="6" fill="#00e5a0"/>
          <circle cx="90" cy="23" r="10" fill="#1e252c" stroke="#536373"/>
          <rect x="128" y="10" width="34" height="26" rx="4" fill="#1a2127" stroke="#475563"/>
          <text x="145" y="27" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">2</text>
          <rect x="172" y="7" width="136" height="32" rx="5" fill="#632e3c" stroke="#ff4769"/>
          <text x="240" y="27" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Spinz 808</text>
          <rect x="318" y="9" width="12" height="28" rx="3" fill="#00e5a0"/>
          <!-- Steps -->
          <rect x="403" y="8" width="24" height="30" rx="4" fill="#ff4769"/>
          <rect x="432" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="461" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="490" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="525" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="554" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="583" y="8" width="24" height="30" rx="4" fill="#ff4769"/>
          <rect x="612" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="647" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="676" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="705" y="8" width="24" height="30" rx="4" fill="#ff4769"/>
          <rect x="734" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="769" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="798" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="827" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="856" y="8" width="24" height="30" rx="4" fill="#664549"/>
        </g>

        <!-- Row 3: Kick -->
        <g transform="translate(0, 184)">
          <rect x="18" y="0" width="884" height="46" rx="6" fill="#2a333c"/>
          <circle cx="58" cy="23" r="6" fill="#00e5a0"/>
          <circle cx="90" cy="23" r="10" fill="#1e252c" stroke="#536373"/>
          <rect x="128" y="10" width="34" height="26" rx="4" fill="#1a2127" stroke="#475563"/>
          <text x="145" y="27" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">3</text>
          <rect x="172" y="7" width="136" height="32" rx="5" fill="#63452a" stroke="#ff8c24"/>
          <text x="240" y="27" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Rack Kick</text>
          <rect x="318" y="9" width="12" height="28" rx="3" fill="#00e5a0"/>
          <rect x="403" y="8" width="24" height="30" rx="4" fill="#ff8c24"/>
          <rect x="432" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="461" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="490" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="525" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="554" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="583" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="612" y="8" width="24" height="30" rx="4" fill="#ff8c24"/>
          <rect x="647" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="676" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="705" y="8" width="24" height="30" rx="4" fill="#ff8c24"/>
          <rect x="734" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="769" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="798" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="827" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="856" y="8" width="24" height="30" rx="4" fill="#664549"/>
        </g>

        <!-- Row 4: Trap Clap (Step 9 lit!) -->
        <g transform="translate(0, 238)">
          <rect x="18" y="0" width="884" height="46" rx="6" fill="#2a333c" stroke="rgba(245,197,66,0.4)"/>
          <circle cx="58" cy="23" r="6" fill="#00e5a0"/>
          <circle cx="90" cy="23" r="10" fill="#1e252c" stroke="#536373"/>
          <rect x="128" y="10" width="34" height="26" rx="4" fill="#1a2127" stroke="#475563"/>
          <text x="145" y="27" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">4</text>
          <rect x="172" y="7" width="136" height="32" rx="5" fill="#5e5226" stroke="#f5c542"/>
          <text x="240" y="27" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Trap Clap</text>
          <rect x="318" y="9" width="12" height="28" rx="3" fill="#00e5a0"/>
          <rect x="403" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="432" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="461" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="490" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="525" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="554" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="583" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="612" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <!-- STEP 9 CLAP -->
          <rect x="647" y="8" width="24" height="30" rx="4" fill="#f5c542" stroke="#fff" stroke-width="1.5"/>
          <rect x="676" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="705" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="734" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="769" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="798" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="827" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="856" y="8" width="24" height="30" rx="4" fill="#664549"/>
        </g>

        <!-- Row 5: Closed Hi-Hat (every 2 steps!) -->
        <g transform="translate(0, 292)">
          <rect x="18" y="0" width="884" height="46" rx="6" fill="#2a333c"/>
          <circle cx="58" cy="23" r="6" fill="#00e5a0"/>
          <circle cx="90" cy="23" r="10" fill="#1e252c" stroke="#536373"/>
          <rect x="128" y="10" width="34" height="26" rx="4" fill="#1a2127" stroke="#475563"/>
          <text x="145" y="27" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">5</text>
          <rect x="172" y="7" width="136" height="32" rx="5" fill="#23545e" stroke="#28d8f0"/>
          <text x="240" y="27" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Closed Hi-Hat</text>
          <rect x="318" y="9" width="12" height="28" rx="3" fill="#00e5a0"/>
          <rect x="403" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="432" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="461" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="490" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="525" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="554" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="583" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="612" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="647" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="676" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="705" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="734" y="8" width="24" height="30" rx="4" fill="#46525e"/>
          <rect x="769" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="798" y="8" width="24" height="30" rx="4" fill="#664549"/>
          <rect x="827" y="8" width="24" height="30" rx="4" fill="#28d8f0"/>
          <rect x="856" y="8" width="24" height="30" rx="4" fill="#664549"/>
        </g>

        <!-- Authentic Floating Right-Click Context Menu -->
        <g transform="translate(274, 326)">
          <rect x="0" y="0" width="224" height="126" rx="8" fill="#181f26" stroke="#ff8c24" stroke-width="1.6"/>
          <text x="14" y="22" fill="#9fb0c0" font-family="Inter, sans-serif" font-size="11">Piano roll</text>
          <rect x="6" y="30" width="212" height="24" rx="4" fill="#ff8c24"/>
          <text x="14" y="46" fill="#090a0f" font-family="Inter, sans-serif" font-weight="800" font-size="11">✓ Fill each 2 steps  (Hi-Hat!)</text>
          <text x="14" y="70" fill="#9fb0c0" font-family="Inter, sans-serif" font-size="11">Fill each 4 steps</text>
          <rect x="6" y="79" width="212" height="24" rx="4" fill="rgba(0,229,160,0.18)" stroke="#00e5a0"/>
          <text x="14" y="95" fill="#00e5a0" font-family="Inter, sans-serif" font-weight="800" font-size="11">✓ Cut itself  (808 үшін міндетті!)</text>
          <text x="14" y="118" fill="#9fb0c0" font-family="Inter, sans-serif" font-size="11">Rename, color and icon...</text>
        </g>

        <!-- Bottom + Add Plugin Button -->
        <rect x="18" y="396" width="228" height="44" rx="8" fill="#2d3842" stroke="#4f6070"/>
        <text x="132" y="423" fill="#f4f6fb" font-family="Inter, sans-serif" font-weight="800" font-size="13" text-anchor="middle">+  Аспап қосу (FLEX / VST)</text>
      </svg>
    `
  },
  {
    id: 'piano-roll',
    shortLabel: '3. Piano Roll',
    title: 'Piano Roll (F7) — Scale Highlighting, Аккорд және Velocity',
    subtitle: 'Нота білмей-ақ фальшсыз мелодия мен 808 басты дәл осы терезеде саласың.',
    pins: [
      {
        num: 1, x: 14, y: 12,
        title: 'Piano Roll Құралдары + Slide (Үшбұрыш)',
        desc: '<strong>Draw (P)</strong> — нота салу, <strong>Slice (C)</strong> — нота кесу, ал <strong>Slide (үшбұрыш)</strong> — Drill 808 басын сырғанатып ойнау батырмасы!'
      },
      {
        num: 2, x: 30, y: 34,
        title: 'Scale Highlighting (Ақшыл жолақтар = Дұрыс нота!)',
        desc: 'Жоғарғы сол жақ үшбұрыш → <code>View → Scale highlighting → C + Minor Natural</code> таңда. Ақшыл жолақтардағы кез келген нота фальшсыз үйлеседі!'
      },
      {
        num: 3, x: 43, y: 58,
        title: '0 — 3 — 7 Minor Аккорды (C – D# – G)',
        desc: 'Төменгі нотаны (C5) қой, 3 тор жоғары (D#5), тағы 4 тор жоғары (G5) қой — дайын мұңды Trap аккорды! Сосын <code>⌥ + S</code> басып тірілт.'
      },
      {
        num: 4, x: 75, y: 26,
        title: 'Top Melody (Үстіңгі қарапайым әуен)',
        desc: 'Аккордтардың үстінде 1 октава жоғарыда 3–5 ноталық қарапайым әуен сал. Тым тығыз қылма — болашақ әншіге орын қалсын!'
      },
      {
        num: 5, x: 56, y: 86,
        title: 'Control: Velocity (Төменгі динамика бағандары)',
        desc: 'Әр нотаның басылу күші! <code>⌥ + R</code> (Win: <code>Alt + R</code>) басып Velocity-ді аздап әртүрлі қылсаң — мелодияң тірі пианиношы ойнағандай естіледі.'
      }
    ],
    svg: `
      <svg viewBox="0 0 920 470" xmlns="http://www.w3.org/2000/svg" class="fl-svg-screen">
        <rect width="920" height="470" rx="12" fill="#212930" stroke="#495765" stroke-width="2"/>
        <!-- Header Bar -->
        <rect x="2" y="2" width="916" height="44" rx="10" fill="#2f3a44"/>
        <text x="18" y="29" fill="#00e5a0" font-family="Inter, sans-serif" font-weight="800" font-size="13">▾  Piano roll — FLEX (Dark Piano)</text>
        <!-- Tools -->
        <rect x="255" y="10" width="32" height="26" rx="5" fill="#ff8c24"/>
        <text x="271" y="27" fill="#0a0d10" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11" text-anchor="middle">✎</text>
        <rect x="292" y="10" width="32" height="26" rx="5" fill="#232c34" stroke="#4a5866"/>
        <text x="308" y="27" fill="#b8c4d0" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">✂</text>
        <rect x="330" y="10" width="76" height="26" rx="5" fill="#232c34" stroke="#00e5a0"/>
        <text x="368" y="27" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">◢ SLIDE</text>
        <rect x="598" y="10" width="302" height="26" rx="5" fill="#1b2228" stroke="#8b6cff"/>
        <text x="749" y="27" fill="#cab9ff" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">View → Scale Highlighting: C Minor Natural</text>

        <!-- Timeline Bar Numbers -->
        <rect x="108" y="48" width="800" height="24" fill="#27313a"/>
        <g font-family="JetBrains Mono, monospace" font-size="10" fill="#9fb0c0">
          <text x="118" y="64" fill="#ff8c24" font-weight="700">1</text>
          <text x="318" y="64">2</text>
          <text x="518" y="64">3</text>
          <text x="718" y="64">4</text>
        </g>

        <!-- Piano Roll Grid with Scale Highlighting (lighter = in C minor, darker = out of scale) -->
        <g transform="translate(0, 72)">
          <!-- 12 semitone rows (22px each = 264px total) -->
          <!-- Row 0: C6 (in scale) -->
          <rect x="12" y="0" width="94" height="22" fill="#e8edf5" stroke="#222a32"/>
          <text x="80" y="15" fill="#182028" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">C6</text>
          <rect x="108" y="0" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 1: B5 (out) -->
          <rect x="12" y="22" width="94" height="22" fill="#dce3ee" stroke="#222a32"/>
          <rect x="108" y="22" width="800" height="22" fill="#242c34" stroke="#1e252c"/>
          <!-- Row 2: A#5 (in scale) -->
          <rect x="12" y="44" width="66" height="22" fill="#181e24" stroke="#0d1115"/>
          <text x="20" y="59" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9">A#5</text>
          <rect x="108" y="44" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 3: A5 (out) -->
          <rect x="12" y="66" width="94" height="22" fill="#dce3ee" stroke="#222a32"/>
          <rect x="108" y="66" width="800" height="22" fill="#242c34" stroke="#1e252c"/>
          <!-- Row 4: G#5 / Ab5 (in scale) -->
          <rect x="12" y="88" width="66" height="22" fill="#181e24" stroke="#0d1115"/>
          <text x="20" y="103" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9">G#5</text>
          <rect x="108" y="88" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 5: G5 (in scale) -->
          <rect x="12" y="110" width="94" height="22" fill="#e8edf5" stroke="#222a32"/>
          <text x="80" y="125" fill="#182028" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">G5</text>
          <rect x="108" y="110" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 6: F#5 (out) -->
          <rect x="12" y="132" width="66" height="22" fill="#181e24" stroke="#0d1115"/>
          <rect x="108" y="132" width="800" height="22" fill="#242c34" stroke="#1e252c"/>
          <!-- Row 7: F5 (in scale) -->
          <rect x="12" y="154" width="94" height="22" fill="#e8edf5" stroke="#222a32"/>
          <text x="80" y="169" fill="#182028" font-family="JetBrains Mono, monospace" font-size="10">F5</text>
          <rect x="108" y="154" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 8: E5 (out) -->
          <rect x="12" y="176" width="94" height="22" fill="#dce3ee" stroke="#222a32"/>
          <rect x="108" y="176" width="800" height="22" fill="#242c34" stroke="#1e252c"/>
          <!-- Row 9: D#5 (in scale) -->
          <rect x="12" y="198" width="66" height="22" fill="#181e24" stroke="#0d1115"/>
          <text x="20" y="213" fill="#ff8c24" font-family="JetBrains Mono, monospace" font-weight="700" font-size="9">D#5</text>
          <rect x="108" y="198" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 10: D5 (in scale) -->
          <rect x="12" y="220" width="94" height="22" fill="#e8edf5" stroke="#222a32"/>
          <rect x="108" y="220" width="800" height="22" fill="#323d47" stroke="#242d35"/>
          <!-- Row 11: C5 Root (in scale) -->
          <rect x="12" y="242" width="94" height="22" fill="#ffe1bd" stroke="#ff8c24"/>
          <text x="76" y="257" fill="#0d1115" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10">C5 ★</text>
          <rect x="108" y="242" width="800" height="22" fill="#38444f" stroke="#242d35"/>

          <!-- Vertical Bar Grid Lines -->
          <line x1="308" y1="0" x2="308" y2="264" stroke="#182026" stroke-width="2"/>
          <line x1="508" y1="0" x2="508" y2="264" stroke="#182026" stroke-width="2"/>
          <line x1="708" y1="0" x2="708" y2="264" stroke="#182026" stroke-width="2"/>

          <!-- Bar 1: Cm chord (C5, D#5, G5) -->
          <rect x="114" y="244" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <text x="122" y="257" fill="#0f240c" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10">C5 (0)</text>
          <rect x="118" y="200" width="182" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <text x="126" y="213" fill="#0f240c" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10">D#5 (+3)</text>
          <rect x="122" y="112" width="178" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <text x="130" y="125" fill="#0f240c" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10">G5 (+7)</text>

          <!-- Bar 2: Ab chord (G#5, C6, D#5) -->
          <rect x="314" y="90" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <text x="322" y="103" fill="#0f240c" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">G#5</text>
          <rect x="314" y="200" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <rect x="314" y="244" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>

          <!-- Bar 3: Fm / G chord -->
          <rect x="514" y="156" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <rect x="514" y="90" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <rect x="514" y="244" width="186" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>

          <!-- Bar 4 + Top Melody notes (bright emerald!) -->
          <rect x="714" y="112" width="184" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>
          <rect x="714" y="222" width="184" height="18" rx="4" fill="#9ed28a" stroke="#1f3b1a" stroke-width="1.5"/>

          <!-- Top melody notes in bars 1-4 -->
          <rect x="210" y="46" width="84" height="18" rx="4" fill="#00e5a0" stroke="#083628" stroke-width="1.5"/>
          <rect x="410" y="2" width="84" height="18" rx="4" fill="#00e5a0" stroke="#083628" stroke-width="1.5"/>
          <rect x="612" y="46" width="84" height="18" rx="4" fill="#00e5a0" stroke="#083628" stroke-width="1.5"/>
          <rect x="760" y="90" width="60" height="18" rx="4" fill="#00e5a0" stroke="#083628" stroke-width="1.5"/>
          <rect x="828" y="46" width="66" height="18" rx="4" fill="#00e5a0" stroke="#083628" stroke-width="1.5"/>
        </g>

        <!-- Bottom Velocity Pane -->
        <rect x="12" y="344" width="896" height="112" rx="6" fill="#1a2128" stroke="#3c4956"/>
        <text x="24" y="366" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">Control:</text>
        <text x="24" y="382" fill="#e6edf5" font-family="Inter, sans-serif" font-weight="700" font-size="11">Velocity</text>
        <text x="24" y="400" fill="#7c8d9e" font-family="Inter, sans-serif" font-size="10">(Соққы күші)</text>

        <!-- Velocity stems -->
        <g stroke-width="4" stroke-linecap="round">
          <line x1="118" y1="448" x2="118" y2="378" stroke="#9ed28a"/><circle cx="118" cy="378" r="4" fill="#fff"/>
          <line x1="126" y1="448" x2="126" y2="392" stroke="#9ed28a"/><circle cx="126" cy="392" r="4" fill="#fff"/>
          <line x1="216" y1="448" x2="216" y2="370" stroke="#00e5a0"/><circle cx="216" cy="370" r="4" fill="#fff"/>
          <line x1="318" y1="448" x2="318" y2="386" stroke="#9ed28a"/><circle cx="318" cy="386" r="4" fill="#fff"/>
          <line x1="416" y1="448" x2="416" y2="368" stroke="#00e5a0"/><circle cx="416" cy="368" r="4" fill="#fff"/>
          <line x1="518" y1="448" x2="518" y2="394" stroke="#9ed28a"/><circle cx="518" cy="394" r="4" fill="#fff"/>
          <line x1="618" y1="448" x2="618" y2="374" stroke="#00e5a0"/><circle cx="618" cy="374" r="4" fill="#fff"/>
          <line x1="718" y1="448" x2="718" y2="384" stroke="#9ed28a"/><circle cx="718" cy="384" r="4" fill="#fff"/>
          <line x1="766" y1="448" x2="766" y2="398" stroke="#00e5a0"/><circle cx="766" cy="398" r="4" fill="#fff"/>
          <line x1="834" y1="448" x2="834" y2="372" stroke="#00e5a0"/><circle cx="834" cy="372" r="4" fill="#fff"/>
        </g>
      </svg>
    `
  },
  {
    id: '808-setup',
    shortLabel: '4. 808 & Edison',
    title: '808 Бас Баптау: Envelope («Төртбұрыш»), Cut Itself және Edison Тюнинг',
    subtitle: 'Бұл 2 терезені дұрыс баптасаң — 808 басың ешқашан фальш бермейді және «балшық» болмайды!',
    pins: [
      {
        num: 1, x: 20, y: 12,
        title: 'Sampler ішіндегі 2-қойынды (Envelope / Instrument)',
        desc: 'Channel Rack-та 808-ді бас → ашылған терезеде <strong>Envelope</strong> белгішесін таңда да, Volume шамын жақ!'
      },
      {
        num: 2, x: 26, y: 46,
        title: '«Төртбұрыш» Envelope формуласы (PRO стандарт!)',
        desc: '<code>DEL = 0</code>, <code>ATT = 0</code>, <strong><code>HOLD = 100%</code></strong>, <code>DEC = 0</code>, <code>SUS = 0</code>, <code>REL = 0</code>! Сонда 808 нотасы Piano Roll-да аяқталған сәтте дәл тоқтайды.'
      },
      {
        num: 3, x: 25, y: 80,
        title: 'Wrench → Cut Self (Cut 4 / By 4)',
        desc: '3-қойындыда (кілт белгісі) <strong>Cut Self</strong> бас — жаңа 808 нотасы алдыңғысын лезде өшіріп, басты тап-таза етеді!'
      },
      {
        num: 4, x: 74, y: 36,
        title: 'Edison → Flag → Detect Pitch Regions',
        desc: '808-дің шын нотасын білу үшін Edison-да <strong>жалауша → Detect pitch regions</strong> бас. Егер мысалы <strong>F#2</strong> деп көрсетсе, демек бұл сэмпл C емес, F# нотасында жазылған!'
      },
      {
        num: 5, x: 74, y: 79,
        title: 'Root Note-ты оң жақ батырмамен F#-ке ауыстыру',
        desc: '808 терезесінің астындағы мини-пианинода Edison көрсеткен нотаны (мысалы <strong>F#5</strong>) <em>оң жақ батырмамен</em> бас (көк түспен жанады). Енді 808 100% дәл C-де ойнайды!'
      }
    ],
    svg: `
      <svg viewBox="0 0 920 470" xmlns="http://www.w3.org/2000/svg" class="fl-svg-screen">
        <rect width="920" height="470" rx="12" fill="#1b2228" stroke="#495765" stroke-width="2"/>

        <!-- LEFT WINDOW: 808 Sampler Envelope -->
        <rect x="18" y="18" width="432" height="434" rx="10" fill="#27313a" stroke="#ff4769" stroke-width="1.8"/>
        <rect x="18" y="18" width="432" height="34" rx="10" fill="#35424e"/>
        <text x="32" y="40" fill="#fff" font-family="Inter, sans-serif" font-weight="800" font-size="12">Sampler — Spinz 808.wav</text>
        <!-- 3 Sampler Tabs -->
        <rect x="34" y="62" width="90" height="24" rx="5" fill="#1e262d" stroke="#465462"/>
        <text x="79" y="78" fill="#8998a8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">Sample</text>
        <rect x="130" y="62" width="110" height="24" rx="5" fill="#ff8c24"/>
        <text x="185" y="78" fill="#090a0f" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10" text-anchor="middle">Envelope ★</text>
        <rect x="246" y="62" width="96" height="24" rx="5" fill="#1e262d" stroke="#465462"/>
        <text x="294" y="78" fill="#8998a8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">🔧 Wrench</text>

        <!-- Square Envelope Graph Box -->
        <rect x="34" y="100" width="400" height="148" rx="8" fill="#141a20" stroke="#465462"/>
        <text x="48" y="120" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">● VOLUME ENVELOPE: ON</text>
        <!-- Grid lines -->
        <line x1="48" y1="226" x2="418" y2="226" stroke="#2c3742" stroke-width="1.5"/>
        <line x1="48" y1="142" x2="418" y2="142" stroke="#2c3742" stroke-dasharray="4 4"/>
        <!-- THE SQUARE ENVELOPE! -->
        <polygon points="62,226 62,142 330,142 330,226" fill="rgba(255,140,36,0.22)"/>
        <polyline points="48,226 62,226 62,142 330,142 330,226 416,226" fill="none" stroke="#ff8c24" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="62" cy="142" r="5" fill="#00e5a0"/>
        <circle cx="330" cy="142" r="5" fill="#00e5a0"/>
        <text x="196" y="186" fill="#ffd29d" font-family="JetBrains Mono, monospace" font-weight="800" font-size="12" text-anchor="middle">HOLD = 100% (ТӨРТБҰРЫШ)</text>

        <!-- 6 ADSR Knobs -->
        <g transform="translate(38, 264)" font-family="JetBrains Mono, monospace" text-anchor="middle">
          <!-- DEL -->
          <circle cx="28" cy="24" r="18" fill="#1a2127" stroke="#536373" stroke-width="2"/>
          <line x1="28" y1="24" x2="18" y2="35" stroke="#8998a8" stroke-width="2.5"/>
          <text x="28" y="56" fill="#8998a8" font-size="9">DEL 0%</text>
          <!-- ATT -->
          <circle cx="94" cy="24" r="18" fill="#1a2127" stroke="#536373" stroke-width="2"/>
          <line x1="94" y1="24" x2="84" y2="35" stroke="#8998a8" stroke-width="2.5"/>
          <text x="94" y="56" fill="#8998a8" font-size="9">ATT 0%</text>
          <!-- HOLD 100%! -->
          <circle cx="160" cy="24" r="20" fill="#2a2219" stroke="#ff8c24" stroke-width="2.8"/>
          <line x1="160" y1="24" x2="172" y2="36" stroke="#ff8c24" stroke-width="3"/>
          <text x="160" y="57" fill="#ff8c24" font-weight="800" font-size="10">HOLD 100%</text>
          <!-- DEC -->
          <circle cx="226" cy="24" r="18" fill="#1a2127" stroke="#536373" stroke-width="2"/>
          <line x1="226" y1="24" x2="216" y2="35" stroke="#8998a8" stroke-width="2.5"/>
          <text x="226" y="56" fill="#8998a8" font-size="9">DEC 0%</text>
          <!-- SUS -->
          <circle cx="292" cy="24" r="18" fill="#1a2127" stroke="#536373" stroke-width="2"/>
          <line x1="292" y1="24" x2="282" y2="35" stroke="#8998a8" stroke-width="2.5"/>
          <text x="292" y="56" fill="#8998a8" font-size="9">SUS 0%</text>
          <!-- REL -->
          <circle cx="358" cy="24" r="18" fill="#1a2127" stroke="#536373" stroke-width="2"/>
          <line x1="358" y1="24" x2="348" y2="35" stroke="#8998a8" stroke-width="2.5"/>
          <text x="358" y="56" fill="#8998a8" font-size="9">REL 0%</text>
        </g>

        <!-- Cut Itself Box -->
        <rect x="34" y="346" width="400" height="88" rx="8" fill="#1c242b" stroke="#00e5a0"/>
        <text x="50" y="370" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">WRENCH → GROUP / CUT ITSELF</text>
        <rect x="50" y="382" width="110" height="34" rx="6" fill="#00e5a0"/>
        <text x="105" y="403" fill="#07150f" font-family="Inter, sans-serif" font-weight="800" font-size="12" text-anchor="middle">✓ Cut self</text>
        <rect x="176" y="382" width="90" height="34" rx="6" fill="#141a20" stroke="#4a5866"/>
        <text x="221" y="403" fill="#ffd29d" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">Cut: 4</text>
        <rect x="278" y="382" width="90" height="34" rx="6" fill="#141a20" stroke="#4a5866"/>
        <text x="323" y="403" fill="#ffd29d" font-family="JetBrains Mono, monospace" font-weight="700" font-size="12" text-anchor="middle">By: 4</text>

        <!-- RIGHT WINDOW: Edison Pitch Detection + Root Note Keyboard -->
        <rect x="470" y="18" width="432" height="434" rx="10" fill="#27313a" stroke="#28d8f0" stroke-width="1.8"/>
        <rect x="470" y="18" width="432" height="34" rx="10" fill="#35424e"/>
        <text x="484" y="40" fill="#fff" font-family="Inter, sans-serif" font-weight="800" font-size="12">Edison — 808 Нотасын анықтау (Tuning)</text>

        <!-- Edison Waveform Area -->
        <rect x="486" y="66" width="400" height="176" rx="8" fill="#121820" stroke="#465462"/>
        <!-- Flag Menu Banner -->
        <rect x="498" y="76" width="234" height="24" rx="5" fill="#233240" stroke="#28d8f0"/>
        <text x="510" y="92" fill="#8eeeff" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">🚩 Flag → Detect pitch regions</text>

        <!-- Pitch Marker Vertical Line -->
        <line x1="538" y1="108" x2="538" y2="232" stroke="#ff8c24" stroke-width="2"/>
        <rect x="538" y="110" width="60" height="22" rx="4" fill="#ff8c24"/>
        <text x="568" y="125" fill="#090a0f" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11" text-anchor="middle">F#2 !</text>

        <!-- Simulated 808 Waveform -->
        <path d="M494,178 L518,178 L526,132 L534,224 L542,138 L552,218 L562,144 L574,210 L588,150 L602,204 L618,156 L634,198 L654,162 L674,194 L698,166 L726,188 L760,170 L800,184 L845,175 L876,178" fill="none" stroke="#8b6cff" stroke-width="2.5"/>

        <!-- Arrow down to Root Note keyboard -->
        <text x="686" y="274" fill="#28d8f0" font-family="Inter, sans-serif" font-weight="800" font-size="12" text-anchor="middle">↓  Енді 808 Wrench ішінде F# пернесін ОҢ БАТЫРМАМЕН бас  ↓</text>

        <!-- Mini Root Note Keyboard -->
        <rect x="486" y="290" width="400" height="144" rx="8" fill="#1a2128" stroke="#465462"/>
        <text x="502" y="312" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="10">ROOT NOTE KEYBOARD (Көк түс = Root Note)</text>
        <!-- White Keys C D E F G A B -->
        <g transform="translate(510, 324)">
          <rect x="0" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="24" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-weight="700" font-size="11" text-anchor="middle">C5</text>
          <rect x="50" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="74" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">D</text>
          <rect x="100" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="124" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">E</text>
          <rect x="150" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="174" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">F</text>
          <rect x="200" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="224" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">G</text>
          <rect x="250" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="274" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">A</text>
          <rect x="300" y="0" width="48" height="92" rx="4" fill="#e5ebf3" stroke="#182028"/>
          <text x="324" y="82" fill="#222" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">B</text>
          <!-- Black keys -->
          <rect x="34" y="0" width="30" height="54" rx="3" fill="#181e24"/>
          <rect x="84" y="0" width="30" height="54" rx="3" fill="#181e24"/>
          <!-- F# HIGHLIGHTED BLUE (FL Studio Root Note color!) -->
          <rect x="184" y="0" width="30" height="58" rx="4" fill="#28a9ff" stroke="#fff" stroke-width="2"/>
          <text x="199" y="42" fill="#06121c" font-family="JetBrains Mono, monospace" font-weight="900" font-size="10" text-anchor="middle">F#</text>
          <rect x="234" y="0" width="30" height="54" rx="3" fill="#181e24"/>
          <rect x="284" y="0" width="30" height="54" rx="3" fill="#181e24"/>
        </g>
      </svg>
    `
  },
  {
    id: 'playlist',
    shortLabel: '5. Playlist (F5)',
    title: 'Playlist (F5) — «Split by channel» және Толық Аранжировка',
    subtitle: 'Бөлінген паттерндерді уақыт бойына тізіп, паузалар мен Riser қосып 2.5 минуттық хит жинаймыз.',
    pins: [
      {
        num: 1, x: 11, y: 36,
        title: 'Pattern Picker + «Split by channel»',
        desc: 'Барлық драмдар мен мелодия бір паттернде болса — Pattern 1 үстінен оң жақ батырма → <strong>Split by channel</strong> бас. Әр аспап бөлек клип болып шығады!'
      },
      {
        num: 2, x: 31, y: 17,
        title: 'Бөлім маркерлері (Intro, Hook, Verse, Bridge)',
        desc: 'Playlist-те <code>⌥ + T</code> (Win: <code>Alt + T</code>) басып бөлім атауларын белгілеп қойсаң, трек құрылымын көру өте оңай болады.'
      },
      {
        num: 3, x: 37, y: 49,
        title: 'Drum Dropout — Drop алдындағы Пауза (C = Slice)',
        desc: 'Intro-ның соңында немесе Verse бітерде <code>C</code> (Slice) құралымен драмдарды 1–2 соққыға кесіп таста — сосын Hook жарылып кіреді!'
      },
      {
        num: 4, x: 54, y: 49,
        title: 'Hook (Қайырма) — Барлық қабат бірге!',
        desc: 'Қайырмада Мелодия + 808 + Kick + Clap + Hi-Hat + Crash бәрі бірге ойнап, тректің максимум энергиясын береді.'
      },
      {
        num: 5, x: 76, y: 65,
        title: 'Verse (Шулық) — Артистке орын босату',
        desc: 'Шулықтың басында Counter-Melody мен 808/Kick-ті аздап алып таста — рэпер/әнші еркін тыныстап оқи алады!'
      }
    ],
    svg: `
      <svg viewBox="0 0 920 470" xmlns="http://www.w3.org/2000/svg" class="fl-svg-screen">
        <rect width="920" height="470" rx="12" fill="#1e252c" stroke="#495765" stroke-width="2"/>
        <!-- Top Bar -->
        <rect x="2" y="2" width="916" height="38" rx="10" fill="#2f3a44"/>
        <text x="18" y="26" fill="#28d8f0" font-family="Inter, sans-serif" font-weight="800" font-size="13">▾  Playlist — Arrangement (SONG Mode • ~2:30)</text>
        <g transform="translate(490, 8)" font-family="JetBrains Mono, monospace" font-size="10">
          <rect x="0" y="0" width="76" height="24" rx="5" fill="#ff8c24"/>
          <text x="38" y="16" fill="#090a0f" font-weight="800" text-anchor="middle">P / B Draw</text>
          <rect x="82" y="0" width="72" height="24" rx="5" fill="#212930" stroke="#ff4769"/>
          <text x="118" y="16" fill="#ff9eb0" font-weight="700" text-anchor="middle">C Slice</text>
          <rect x="160" y="0" width="70" height="24" rx="5" fill="#212930" stroke="#4a5866"/>
          <text x="195" y="16" fill="#b8c4d0" text-anchor="middle">T Mute</text>
          <rect x="236" y="0" width="174" height="24" rx="5" fill="#212930" stroke="#00e5a0"/>
          <text x="323" y="16" fill="#00e5a0" font-weight="700" text-anchor="middle">⌘+B: Көшіру (Duplicate)</text>
        </g>

        <!-- Left Pattern Picker -->
        <rect x="12" y="50" width="166" height="406" rx="8" fill="#232c34" stroke="#3c4956"/>
        <text x="24" y="72" fill="#f5c542" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">PATTERNS (Split!)</text>
        <g transform="translate(22, 84)" font-family="Inter, sans-serif" font-size="11" font-weight="700">
          <rect x="0" y="0" width="146" height="32" rx="6" fill="rgba(139,108,255,0.28)" stroke="#8b6cff"/>
          <text x="12" y="20" fill="#fff">🎹 FLEX Melody</text>
          <rect x="0" y="40" width="146" height="32" rx="6" fill="rgba(40,216,240,0.24)" stroke="#28d8f0"/>
          <text x="12" y="60" fill="#fff">🔔 Counter Bell</text>
          <rect x="0" y="80" width="146" height="32" rx="6" fill="rgba(255,71,105,0.28)" stroke="#ff4769"/>
          <text x="12" y="100" fill="#fff">🔊 Spinz 808</text>
          <rect x="0" y="120" width="146" height="32" rx="6" fill="rgba(255,140,36,0.28)" stroke="#ff8c24"/>
          <text x="12" y="140" fill="#fff">🥁 Rack Kick</text>
          <rect x="0" y="160" width="146" height="32" rx="6" fill="rgba(245,197,66,0.25)" stroke="#f5c542"/>
          <text x="12" y="180" fill="#fff">👏 Trap Clap</text>
          <rect x="0" y="200" width="146" height="32" rx="6" fill="rgba(0,229,160,0.25)" stroke="#00e5a0"/>
          <text x="12" y="220" fill="#fff">⚡ Hi-Hats</text>
        </g>
        <rect x="22" y="346" width="146" height="96" rx="6" fill="#182026" stroke="#ff8c24"/>
        <text x="32" y="366" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="700" font-size="9">PRO КЕҢЕС:</text>
        <text x="32" y="385" fill="#c7d3df" font-family="Inter, sans-serif" font-size="10">Pattern 1 → оң батырма</text>
        <text x="32" y="402" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">Split by channel</text>
        <text x="32" y="422" fill="#8998a8" font-family="Inter, sans-serif" font-size="10">бәрін жеке бөледі!</text>

        <!-- Right Timeline Grid -->
        <rect x="188" y="50" width="720" height="406" rx="8" fill="#1a2128" stroke="#3c4956"/>
        <!-- Section Markers Bar -->
        <rect x="188" y="50" width="720" height="42" rx="8" fill="#263038"/>
        <g font-family="JetBrains Mono, monospace" font-weight="800" font-size="10">
          <rect x="196" y="58" width="136" height="24" rx="5" fill="#323f4b"/>
          <text x="264" y="74" fill="#ffb870" text-anchor="middle">INTRO (1–8)</text>
          <rect x="342" y="58" width="174" height="24" rx="5" fill="rgba(0,229,160,0.2)" stroke="#00e5a0"/>
          <text x="429" y="74" fill="#00e5a0" text-anchor="middle">HOOK 1 (9–16) 🔥</text>
          <rect x="526" y="58" width="210" height="24" rx="5" fill="#323f4b"/>
          <text x="631" y="74" fill="#28d8f0" text-anchor="middle">VERSE 1 (17–32)</text>
          <rect x="746" y="58" width="152" height="24" rx="5" fill="rgba(255,140,36,0.2)" stroke="#ff8c24"/>
          <text x="822" y="74" fill="#ffb870" text-anchor="middle">HOOK 2 / OUTRO</text>
        </g>

        <!-- Vertical section lines -->
        <line x1="337" y1="92" x2="337" y2="452" stroke="#364452" stroke-dasharray="4 4"/>
        <line x1="521" y1="92" x2="521" y2="452" stroke="#364452" stroke-dasharray="4 4"/>
        <line x1="741" y1="92" x2="741" y2="452" stroke="#364452" stroke-dasharray="4 4"/>

        <!-- Track 1: Melody (plays all through) -->
        <rect x="196" y="106" width="136" height="44" rx="6" fill="rgba(139,108,255,0.34)" stroke="#8b6cff"/>
        <text x="208" y="132" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">FLEX Melody</text>
        <rect x="342" y="106" width="174" height="44" rx="6" fill="rgba(139,108,255,0.42)" stroke="#8b6cff"/>
        <text x="354" y="132" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">FLEX Melody</text>
        <rect x="526" y="106" width="210" height="44" rx="6" fill="rgba(139,108,255,0.3)" stroke="#8b6cff"/>
        <text x="538" y="132" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">FLEX Melody (Half-Time)</text>
        <rect x="746" y="106" width="152" height="44" rx="6" fill="rgba(139,108,255,0.42)" stroke="#8b6cff"/>
        <text x="758" y="132" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">FLEX Melody</text>

        <!-- Track 2: Counter Melody (Hooks only!) -->
        <rect x="342" y="160" width="174" height="42" rx="6" fill="rgba(40,216,240,0.34)" stroke="#28d8f0"/>
        <text x="354" y="185" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Counter Bell (Hook)</text>
        <rect x="746" y="160" width="96" height="42" rx="6" fill="rgba(40,216,240,0.34)" stroke="#28d8f0"/>
        <text x="756" y="185" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="10">Counter Bell</text>

        <!-- Track 3: 808 Bass -->
        <rect x="342" y="212" width="174" height="42" rx="6" fill="rgba(255,71,105,0.38)" stroke="#ff4769"/>
        <text x="354" y="237" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Spinz 808 (Full)</text>
        <rect x="614" y="212" width="122" height="42" rx="6" fill="rgba(255,71,105,0.32)" stroke="#ff4769"/>
        <text x="626" y="237" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">808 (2-бөлім)</text>
        <rect x="746" y="212" width="96" height="42" rx="6" fill="rgba(255,71,105,0.38)" stroke="#ff4769"/>
        <text x="756" y="237" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="10">Spinz 808</text>

        <!-- Track 4: Kick -->
        <rect x="342" y="264" width="154" height="42" rx="6" fill="rgba(255,140,36,0.38)" stroke="#ff8c24"/>
        <text x="354" y="289" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Rack Kick</text>
        <rect x="614" y="264" width="104" height="42" rx="6" fill="rgba(255,140,36,0.34)" stroke="#ff8c24"/>
        <text x="626" y="289" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Rack Kick</text>
        <rect x="746" y="264" width="96" height="42" rx="6" fill="rgba(255,140,36,0.38)" stroke="#ff8c24"/>

        <!-- Track 5: Clap + Hi-Hats -->
        <rect x="342" y="316" width="174" height="42" rx="6" fill="rgba(0,229,160,0.32)" stroke="#00e5a0"/>
        <text x="354" y="341" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Clap + Hi-Hats (Rolls)</text>
        <rect x="526" y="316" width="194" height="42" rx="6" fill="rgba(0,229,160,0.24)" stroke="#00e5a0"/>
        <text x="538" y="341" fill="#fff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Clap + 2-Step Hats</text>
        <rect x="746" y="316" width="96" height="42" rx="6" fill="rgba(0,229,160,0.32)" stroke="#00e5a0"/>

        <!-- Track 6: FX / Riser / Tag -->
        <rect x="278" y="370" width="56" height="36" rx="6" fill="rgba(255,112,200,0.32)" stroke="#ff70c8"/>
        <text x="286" y="392" fill="#fff" font-family="JetBrains Mono, monospace" font-size="9">Tag+Riser</text>
        <rect x="342" y="370" width="38" height="36" rx="6" fill="rgba(245,197,66,0.32)" stroke="#f5c542"/>
        <text x="348" y="392" fill="#fff" font-family="JetBrains Mono, monospace" font-size="9">Crash</text>
        <rect x="700" y="370" width="38" height="36" rx="6" fill="rgba(255,112,200,0.32)" stroke="#ff70c8"/>
        <text x="706" y="392" fill="#fff" font-family="JetBrains Mono, monospace" font-size="9">Riser</text>

        <!-- Dropout Callout Highlight right before Hook 1 & Hook 2 -->
        <rect x="322" y="210" width="16" height="150" rx="3" fill="rgba(255,71,105,0.22)" stroke="#ff4769" stroke-dasharray="3 3"/>
        <text x="298" y="432" fill="#ff9eb0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">✂ ПАУЗА (Drop алдында!)</text>
      </svg>
    `
  },
  {
    id: 'mixer',
    shortLabel: '6. Mixer & Master',
    title: 'Mixer (F9) — Gain Staging, Parametric EQ 2 және Master Soft Clipper',
    subtitle: 'Битіңді кәсіби, таза әрі қатты ететін соңғы кезең — дәл осы баптауларды қайтала!',
    pins: [
      {
        num: 1, x: 10, y: 50,
        title: 'Master Каналы (Қызылға тигізбе / Soft Clipper)',
        desc: 'Барлық дыбыс соңында <strong>Master</strong> каналға жиналады. Оң жақтағы Slot 1-ден әдепкі Fruity Limiter-ді өшіріп, <strong>Fruity Soft Clipper</strong> қой!'
      },
      {
        num: 2, x: 31, y: 56,
        title: 'Gain Staging Фейдерлері (Микстің 70%-ы!)',
        desc: 'Бастапқы идеал баланс: <strong>Kick (-6 dB)</strong>, <strong>808 (-8 dB)</strong>, <strong>Clap (-7 dB)</strong>, <strong>Melody (-13 dB)</strong>, <strong>Hi-Hat (-14 dB)</strong>.'
      },
      {
        num: 3, x: 29, y: 79,
        title: 'Stereo Separation → 100% MONO (Kick & 808)',
        desc: 'Mixer-де Kick пен 808 каналындағы <strong>Stereo Separation</strong> дөңгелек тұтқасын оңға соңына дейін бұра (күлгін = 100% Merged MONO) — сонда бас екі есе нық соғады!'
      },
      {
        num: 4, x: 43, y: 88,
        title: 'Sidechain сымы (Kick → 808)',
        desc: 'Kick каналын таңда, сосын 808 каналының астындағы <strong>кішкентай бағытшаны оң жақ батырмамен басып</strong> <code>Sidechain to this track</code> таңда!'
      },
      {
        num: 5, x: 76, y: 48,
        title: 'Оң жақ FX слоттары: EQ 2 (Low-Cut) & Soft Clipper',
        desc: 'Мелодияда <strong>Fruity Parametric EQ 2</strong> арқылы <code>120 Hz</code>-тен төменін кесіп таста (High-Pass Steep 8). Ал Master-де <strong>Fruity Soft Clipper</strong> тұрсын!'
      }
    ],
    svg: `
      <svg viewBox="0 0 920 470" xmlns="http://www.w3.org/2000/svg" class="fl-svg-screen">
        <rect width="920" height="470" rx="12" fill="#1e252c" stroke="#495765" stroke-width="2"/>
        <!-- Top Header -->
        <rect x="2" y="2" width="916" height="36" rx="10" fill="#2f3a44"/>
        <text x="18" y="25" fill="#8b6cff" font-family="Inter, sans-serif" font-weight="800" font-size="13">▾  Mixer — Master &amp; Insert Channels (F9)</text>

        <!-- LEFT: Mixer Channels (Master + 5 Inserts) -->
        <!-- Master Channel -->
        <g transform="translate(18, 52)">
          <rect x="0" y="0" width="92" height="398" rx="8" fill="#2a343e" stroke="#ff8c24" stroke-width="2"/>
          <text x="46" y="22" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11" text-anchor="middle">MASTER</text>
          <text x="46" y="38" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">-0.2 dB</text>
          <!-- VU meter -->
          <rect x="18" y="50" width="18" height="220" rx="4" fill="#141a20"/>
          <rect x="20" y="68" width="14" height="200" rx="3" fill="#00e5a0"/>
          <rect x="20" y="68" width="14" height="32" rx="3" fill="#ff8c24"/>
          <!-- Fader -->
          <line x1="62" y1="54" x2="62" y2="266" stroke="#141a20" stroke-width="5" stroke-linecap="round"/>
          <rect x="48" y="100" width="28" height="16" rx="4" fill="#dbe3ec" stroke="#0d1115"/>
          <text x="46" y="294" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">STEREO</text>
          <circle cx="46" cy="322" r="14" fill="#182026" stroke="#536373"/>
          <line x1="46" y1="322" x2="46" y2="310" stroke="#fff" stroke-width="2"/>
          <rect x="14" y="352" width="64" height="32" rx="5" fill="#ff8c24"/>
          <text x="46" y="372" fill="#090a0f" font-family="JetBrains Mono, monospace" font-weight="800" font-size="9" text-anchor="middle">SOFT CLIP</text>
        </g>

        <!-- Insert 1: Melody (-13dB) -->
        <g transform="translate(122, 52)">
          <rect x="0" y="0" width="76" height="398" rx="8" fill="#242d36" stroke="#8b6cff"/>
          <text x="38" y="20" fill="#cab9ff" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">1 Melody</text>
          <text x="38" y="36" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">-13 dB</text>
          <rect x="14" y="50" width="12" height="220" rx="3" fill="#141a20"/>
          <rect x="15" y="148" width="10" height="121" rx="2" fill="#8b6cff"/>
          <line x1="50" y1="54" x2="50" y2="266" stroke="#141a20" stroke-width="4" stroke-linecap="round"/>
          <rect x="38" y="162" width="24" height="14" rx="3" fill="#c7d3df"/>
          <circle cx="38" cy="322" r="13" fill="#182026" stroke="#28d8f0" stroke-width="2"/>
          <text x="38" y="352" fill="#28d8f0" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">WIDE</text>
        </g>

        <!-- Insert 2: 808 (-8dB MONO) -->
        <g transform="translate(206, 52)">
          <rect x="0" y="0" width="76" height="398" rx="8" fill="#242d36" stroke="#ff4769"/>
          <text x="38" y="20" fill="#ff9eb0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">2 808</text>
          <text x="38" y="36" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">-8 dB</text>
          <rect x="14" y="50" width="12" height="220" rx="3" fill="#141a20"/>
          <rect x="15" y="102" width="10" height="167" rx="2" fill="#ff4769"/>
          <line x1="50" y1="54" x2="50" y2="266" stroke="#141a20" stroke-width="4" stroke-linecap="round"/>
          <rect x="38" y="118" width="24" height="14" rx="3" fill="#c7d3df"/>
          <circle cx="38" cy="322" r="13" fill="#2d1c36" stroke="#8b6cff" stroke-width="2.5"/>
          <line x1="38" y1="322" x2="48" y2="330" stroke="#8b6cff" stroke-width="2.5"/>
          <text x="38" y="352" fill="#cab9ff" font-family="JetBrains Mono, monospace" font-weight="800" font-size="8" text-anchor="middle">100% MONO</text>
        </g>

        <!-- Insert 3: Kick (-6dB MONO) -->
        <g transform="translate(290, 52)">
          <rect x="0" y="0" width="76" height="398" rx="8" fill="#242d36" stroke="#ff8c24"/>
          <text x="38" y="20" fill="#ffc480" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">3 Kick</text>
          <text x="38" y="36" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">-6 dB</text>
          <rect x="14" y="50" width="12" height="220" rx="3" fill="#141a20"/>
          <rect x="15" y="84" width="10" height="185" rx="2" fill="#ff8c24"/>
          <line x1="50" y1="54" x2="50" y2="266" stroke="#141a20" stroke-width="4" stroke-linecap="round"/>
          <rect x="38" y="96" width="24" height="14" rx="3" fill="#c7d3df"/>
          <circle cx="38" cy="322" r="13" fill="#2d1c36" stroke="#8b6cff" stroke-width="2.5"/>
          <line x1="38" y1="322" x2="48" y2="330" stroke="#8b6cff" stroke-width="2.5"/>
          <text x="38" y="352" fill="#cab9ff" font-family="JetBrains Mono, monospace" font-weight="800" font-size="8" text-anchor="middle">100% MONO</text>
        </g>

        <!-- Insert 4: Clap (-7dB) -->
        <g transform="translate(374, 52)">
          <rect x="0" y="0" width="76" height="398" rx="8" fill="#242d36" stroke="#f5c542"/>
          <text x="38" y="20" fill="#ffe184" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">4 Clap</text>
          <text x="38" y="36" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">-7 dB</text>
          <rect x="14" y="50" width="12" height="220" rx="3" fill="#141a20"/>
          <rect x="15" y="100" width="10" height="169" rx="2" fill="#f5c542"/>
          <line x1="50" y1="54" x2="50" y2="266" stroke="#141a20" stroke-width="4" stroke-linecap="round"/>
          <rect x="38" y="112" width="24" height="14" rx="3" fill="#c7d3df"/>
          <circle cx="38" cy="322" r="13" fill="#182026" stroke="#536373"/>
          <text x="38" y="352" fill="#8998a8" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">CENTER</text>
        </g>

        <!-- Insert 5: Hi-Hat (-14dB) -->
        <g transform="translate(458, 52)">
          <rect x="0" y="0" width="76" height="398" rx="8" fill="#242d36" stroke="#28d8f0"/>
          <text x="38" y="20" fill="#8eeeff" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" text-anchor="middle">5 Hi-Hat</text>
          <text x="38" y="36" fill="#9fb0c0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">-14 dB</text>
          <rect x="14" y="50" width="12" height="220" rx="3" fill="#141a20"/>
          <rect x="15" y="160" width="10" height="109" rx="2" fill="#28d8f0"/>
          <line x1="50" y1="54" x2="50" y2="266" stroke="#141a20" stroke-width="4" stroke-linecap="round"/>
          <rect x="38" y="172" width="24" height="14" rx="3" fill="#c7d3df"/>
          <circle cx="38" cy="322" r="13" fill="#182026" stroke="#28d8f0"/>
          <text x="38" y="352" fill="#8eeeff" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">PAN 15%R</text>
        </g>

        <!-- Sidechain Wire from Kick (3) -> 808 (2) -->
        <path d="M328,434 Q286,462 244,434" fill="none" stroke="#00e5a0" stroke-width="2.5" stroke-dasharray="4 3"/>
        <polygon points="244,434 254,438 250,428" fill="#00e5a0"/>
        <text x="378" y="460" fill="#00e5a0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">← Sidechain: Kick → 808</text>

        <!-- RIGHT PANEL: FX Rack Slots + Mini Parametric EQ 2 Preview -->
        <rect x="550" y="52" width="352" height="398" rx="8" fill="#242d36" stroke="#495765"/>
        <text x="566" y="76" fill="#ff9f43" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">FX SLOTS (ЭФФЕКТІЛЕР)</text>

        <!-- Slot 1: EQ 2 -->
        <rect x="566" y="90" width="320" height="32" rx="6" fill="#192128" stroke="#28d8f0"/>
        <text x="580" y="110" fill="#8eeeff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Slot 1:  Fruity Parametric EQ 2</text>
        <circle cx="868" cy="106" r="6" fill="#00e5a0"/>

        <!-- Slot 2: Reverb 2 -->
        <rect x="566" y="130" width="320" height="32" rx="6" fill="#192128" stroke="#8b6cff"/>
        <text x="580" y="150" fill="#cab9ff" font-family="Inter, sans-serif" font-weight="700" font-size="11">Slot 2:  Fruity Reeverb 2 (Wet 18%)</text>
        <circle cx="868" cy="146" r="6" fill="#00e5a0"/>

        <!-- Slot 3: Master Soft Clipper -->
        <rect x="566" y="170" width="320" height="32" rx="6" fill="#2c2219" stroke="#ff8c24"/>
        <text x="580" y="190" fill="#ffc480" font-family="Inter, sans-serif" font-weight="800" font-size="11">Master:  Fruity Soft Clipper ⭐</text>
        <circle cx="868" cy="186" r="6" fill="#00e5a0"/>

        <!-- Embedded Mini Fruity Parametric EQ 2 Visual -->
        <rect x="566" y="220" width="320" height="212" rx="8" fill="#12161f" stroke="#475563"/>
        <text x="580" y="242" fill="#f4f6fb" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">FRUITY PARAMETRIC EQ 2 (Мелодия Low-Cut)</text>
        <!-- EQ Curve -->
        <line x1="576" y1="330" x2="876" y2="330" stroke="rgba(255,255,255,0.14)" stroke-dasharray="4 4"/>
        <path d="M576,420 L626,418 C646,418 656,330 676,330 L740,330 C760,330 770,350 790,348 C812,346 826,330 876,330" fill="none" stroke="#8b6cff" stroke-width="3.5"/>
        <circle cx="662" cy="356" r="7" fill="#ff4769" stroke="#fff" stroke-width="1.5"/>
        <text x="676" y="360" fill="#ff9eb0" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">1: High-Pass 120Hz!</text>
        <circle cx="786" cy="348" r="6" fill="#f5c542" stroke="#fff" stroke-width="1.5"/>
        <text x="742" y="382" fill="#ffe184" font-family="JetBrains Mono, monospace" font-size="9">4: -2dB Вокалға орын</text>
        <text x="584" y="416" fill="#6f8090" font-family="JetBrains Mono, monospace" font-size="9">20Hz      120Hz         500Hz        2kHz       16kHz</text>
      </svg>
    `
  }
];

export function initFlVisuals() {
  const thumbsEl = document.getElementById('flVisualThumbs');
  const stageEl = document.getElementById('flVisualStage');
  const infoEl = document.getElementById('flVisualPinInfo');
  const titleEl = document.getElementById('flVisualTitle');
  const subEl = document.getElementById('flVisualSub');
  const prevBtn = document.getElementById('flVisualPrev');
  const nextBtn = document.getElementById('flVisualNext');
  const zoomBtn = document.getElementById('flVisualZoom');
  const modal = document.getElementById('flLightboxModal');
  const modalBody = document.getElementById('flLightboxBody');
  const modalTitle = document.getElementById('flLightboxTitle');
  const modalClose = document.getElementById('flLightboxClose');

  if (!thumbsEl || !stageEl) return null;

  let activeVisualIdx = 0;
  let activePinNum = 1;

  function renderThumbs() {
    thumbsEl.innerHTML = FL_VISUALS.map((v, idx) => `
      <button type="button" class="fl-vthumb ${idx === activeVisualIdx ? 'active' : ''}" data-vidx="${idx}">
        ${v.shortLabel}
      </button>
    `).join('');

    thumbsEl.querySelectorAll('.fl-vthumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectVisual(Number(btn.dataset.vidx));
      });
    });
  }

  function renderPinInfo() {
    const v = FL_VISUALS[activeVisualIdx];
    const pin = v.pins.find((p) => p.num === activePinNum) || v.pins[0];

    infoEl.innerHTML = `
      <div class="fl-pin-pills">
        ${v.pins.map((p) => `
          <button type="button" class="fl-pin-pill ${p.num === pin.num ? 'active' : ''}" data-pin="${p.num}">
            <span class="pin-circle">${p.num}</span>
            <span>${p.title.split('—')[0].trim()}</span>
          </button>
        `).join('')}
      </div>
      <div class="fl-pin-detail-box">
        <div class="fl-pin-detail-head">
          <span class="pin-circle-lg">${pin.num}</span>
          <h4>${pin.title}</h4>
        </div>
        <p>${pin.desc}</p>
      </div>
    `;

    infoEl.querySelectorAll('.fl-pin-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePinNum = Number(btn.dataset.pin);
        updatePinStates();
        renderPinInfo();
      });
    });
  }

  function updatePinStates() {
    stageEl.querySelectorAll('.fl-hotspot').forEach((el) => {
      el.classList.toggle('active', Number(el.dataset.pin) === activePinNum);
    });
  }

  function renderStage() {
    const v = FL_VISUALS[activeVisualIdx];
    titleEl.textContent = v.title;
    subEl.textContent = v.subtitle;

    stageEl.innerHTML = `
      ${v.svg}
      <div class="fl-hotspots-layer">
        ${v.pins.map((p) => `
          <button
            type="button"
            class="fl-hotspot ${p.num === activePinNum ? 'active' : ''}"
            style="left:${p.x}%;top:${p.y}%;"
            data-pin="${p.num}"
            title="${p.title}"
            aria-label="${p.num}: ${p.title}"
          >${p.num}</button>
        `).join('')}
      </div>
    `;

    stageEl.querySelectorAll('.fl-hotspot').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePinNum = Number(btn.dataset.pin);
        updatePinStates();
        renderPinInfo();
      });
    });

    prevBtn.disabled = activeVisualIdx === 0;
    nextBtn.disabled = activeVisualIdx === FL_VISUALS.length - 1;
    renderPinInfo();
  }

  function selectVisual(idx) {
    activeVisualIdx = Math.max(0, Math.min(FL_VISUALS.length - 1, idx));
    activePinNum = 1;
    renderThumbs();
    renderStage();
  }

  prevBtn.addEventListener('click', () => selectVisual(activeVisualIdx - 1));
  nextBtn.addEventListener('click', () => selectVisual(activeVisualIdx + 1));

  // Fullscreen Lightbox Modal
  function openModal() {
    const v = FL_VISUALS[activeVisualIdx];
    modalTitle.textContent = v.title;
    modalBody.innerHTML = v.svg;
    modal.classList.remove('hidden');
  }
  function closeModal() {
    modal.classList.add('hidden');
  }

  zoomBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  selectVisual(0);

  return {
    openVisualById(id) {
      const idx = FL_VISUALS.findIndex((v) => v.id === id);
      if (idx !== -1) selectVisual(idx);
    }
  };
}
