// =========================================================
// BEATLAB KZ — Interactive 16-Step Drum Machine Sequencer
// High-precision Web Audio Lookahead Scheduler + Visualizer
// =========================================================

import { audioEngine } from './audio-engine.js';

const TRACKS = [
  { id: '808',   name: '808 BASS',  color: '#ff4769', glow: 'rgba(255, 71, 105, 0.45)', gain: 0.95 },
  { id: 'kick',  name: 'KICK',      color: '#ff8c24', glow: 'rgba(255, 140, 36, 0.45)', gain: 1.0  },
  { id: 'clap',  name: 'CLAP',      color: '#f5c542', glow: 'rgba(245, 197, 66, 0.42)', gain: 0.85 },
  { id: 'snare', name: 'SNARE',     color: '#00e5a0', glow: 'rgba(0, 229, 160, 0.42)',  gain: 0.85 },
  { id: 'ch',    name: 'HI-HAT CH', color: '#28d8f0', glow: 'rgba(40, 216, 240, 0.42)', gain: 0.72 },
  { id: 'oh',    name: 'OPEN HAT',  color: '#8b6cff', glow: 'rgba(139, 108, 255, 0.42)', gain: 0.65 },
  { id: 'perc',  name: 'PERC / RIM',color: '#ff70c8', glow: 'rgba(255, 112, 200, 0.42)', gain: 0.7  }
];

export const DRUM_PRESETS = {
  trap: {
    label: 'Trap (140 BPM)',
    bpm: 140,
    swing: 0,
    insightTitle: '🔥 Trap (140 BPM — Half-Time) қалай құрылған?',
    insightBody: 'Назар аудар: CLAP дәл 9-қадамда (3-соққы) соғады — бұл Trap-тың басты ережесі. HI-HAT әр 2 қадам сайын жүріп, 7–8 және 13–15 қадамдарда жылдам «ролл» жасайды. 808 бас пен KICK бос орындарда серпінді кач береді!',
    grid: {
      '808': [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
      kick:  [1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
      clap:  [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1],
      ch:    [1,0,1,0, 1,0,1,1, 1,0,1,0, 1,1,1,0],
      oh:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0],
      perc:  [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0]
    }
  },
  boombap: {
    label: 'Boom Bap (90 BPM)',
    bpm: 90,
    swing: 24,
    insightTitle: '📼 Boom Bap (90 BPM) — Классикалық хип-хоп құпиясы',
    insightBody: 'SNARE 5-ші және 13-қадамда (2 және 4-соққы) нақты ұрады. SWING 24%-ға қойылған — сол арқылы хэттер мен Kick сәл «еркін» қозғалып, 90-жылдардағы нағыз Old School кач береді!',
    grid: {
      '808': [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      kick:  [1,0,0,0, 0,0,0,1, 0,1,1,0, 0,0,0,0],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      ch:    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      oh:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
      perc:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1]
    }
  },
  drill: {
    label: 'Drill (142 BPM)',
    bpm: 142,
    swing: 0,
    insightTitle: '⚡ UK / NY Drill (142 BPM) — Ерекше синкопа!',
    insightBody: 'SNARE-ге қара: 9-қадамда және кешігіп 15-қадамда соғады (13-те емес!). Ал HI-HAT 1–4–7–9–12–15 қадамдарымен 3 қадамдық секіріспен жүреді. Дәл осы екі нәрсе Drill стилін бірден танытады!',
    grid: {
      '808': [1,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,1,0],
      kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
      ch:    [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
      oh:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
      perc:  [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,0,0,1]
    }
  },
  lofi: {
    label: 'Lo-Fi (78 BPM)',
    bpm: 78,
    swing: 32,
    insightTitle: '🌙 Lo-Fi Hip-Hop (78 BPM) — Тыныш түнгі вайб',
    insightBody: 'Баяу темп (78 BPM) + жоғары SWING (32%). Мұнда 808 жоқ, драмдар өте қарапайым әрі бос орыны көп. Жоғарыдағы SWING сырғытпасын 0% пен 40% арасында бұрап, айырмашылығын сезіп көр!',
    grid: {
      '808': [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,1],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      ch:    [1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0],
      oh:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      perc:  [0,0,1,0, 0,0,0,0, 0,1,0,0, 0,0,0,0]
    }
  },
  house: {
    label: 'House (124 BPM)',
    bpm: 124,
    swing: 12,
    insightTitle: '🪩 House / Club (124 BPM) — Four-on-the-Floor',
    insightBody: 'KICK әрбір негізгі соққыда (1, 5, 9, 13-қадам) тоқтаусыз соғады! OPEN HAT пен 808 бас дәл ортадағы «бос» 3, 7, 11, 15-қадамдарда (Offbeat) билеуге жетелейтін энергия береді.',
    grid: {
      '808': [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ch:    [1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,0,1],
      oh:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      perc:  [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0]
    }
  }
};

export function initDrumMachine() {
  const rulerEl = document.getElementById('stepRuler');
  const rowsEl = document.getElementById('sequencerRows');
  const playBtn = document.getElementById('drumPlayBtn');
  const playLabel = document.getElementById('drumPlayLabel');
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconStop = playBtn.querySelector('.icon-stop');
  const bpmSlider = document.getElementById('bpmSlider');
  const bpmValue = document.getElementById('bpmValue');
  const swingSlider = document.getElementById('swingSlider');
  const swingValue = document.getElementById('swingValue');
  const masterVolSlider = document.getElementById('masterVolSlider');
  const masterVolValue = document.getElementById('masterVolValue');
  const clearBtn = document.getElementById('drumClearBtn');
  const randomBtn = document.getElementById('drumRandomBtn');
  const tapTempoBtn = document.getElementById('tapTempoBtn');
  const presetBtns = document.querySelectorAll('#drumPresets .preset-btn');
  const insightEl = document.getElementById('drumMentorInsight');
  const canvas = document.getElementById('drumVisualizer');
  const canvasCtx = canvas.getContext('2d');

  // Sequencer state
  let bpm = 140;
  let swing = 0; // 0..45 (%)
  let isPlaying = false;
  let currentStep = 0;
  let nextNoteTime = 0;
  let schedulerTimer = null;
  let activePresetKey = 'trap';
  const muted = {};
  const pattern = {};
  const padElements = {};
  const rulerCells = [];
  let tapTimes = [];

  TRACKS.forEach((tr) => {
    muted[tr.id] = false;
    pattern[tr.id] = new Array(16).fill(0);
    padElements[tr.id] = [];
  });

  // Render 16-step beat ruler
  rulerEl.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'ruler-step' + (i % 4 === 0 ? ' beat-start' : '');
    cell.textContent = i + 1;
    rulerEl.appendChild(cell);
    rulerCells.push(cell);
  }

  // Render 7 drum rows
  rowsEl.innerHTML = '';
  TRACKS.forEach((tr) => {
    const row = document.createElement('div');
    row.className = 'seq-row';
    row.dataset.track = tr.id;

    const meta = document.createElement('div');
    meta.className = 'track-meta';

    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'track-trigger';
    triggerBtn.title = `${tr.name} дыбысын тыңдау`;
    triggerBtn.innerHTML = `<span class="track-color" style="background:${tr.color}"></span><span>${tr.name}</span>`;
    triggerBtn.addEventListener('click', () => {
      audioEngine.triggerDrum(tr.id, null, tr.gain);
    });

    const muteBtn = document.createElement('button');
    muteBtn.className = 'track-mute';
    muteBtn.textContent = 'M';
    muteBtn.title = 'Дыбысын өшіру (Mute)';
    muteBtn.addEventListener('click', () => {
      muted[tr.id] = !muted[tr.id];
      muteBtn.classList.toggle('muted', muted[tr.id]);
      row.classList.toggle('is-muted', muted[tr.id]);
    });

    meta.appendChild(triggerBtn);
    meta.appendChild(muteBtn);

    const stepsWrap = document.createElement('div');
    stepsWrap.className = 'track-steps';

    for (let s = 0; s < 16; s++) {
      const pad = document.createElement('button');
      const isAltBeat = Math.floor(s / 4) % 2 === 1;
      pad.className = 'step-pad' + (isAltBeat ? ' beat-alt' : '');
      pad.style.setProperty('--pad-color', tr.color);
      pad.style.setProperty('--pad-glow', tr.glow);
      pad.setAttribute('aria-label', `${tr.name} ${s + 1}-қадам`);
      pad.addEventListener('click', () => {
        pattern[tr.id][s] = pattern[tr.id][s] ? 0 : 1;
        pad.classList.toggle('active', !!pattern[tr.id][s]);
        if (pattern[tr.id][s] && !isPlaying) {
          audioEngine.triggerDrum(tr.id, null, tr.gain);
        }
      });
      stepsWrap.appendChild(pad);
      padElements[tr.id].push(pad);
    }

    row.appendChild(meta);
    row.appendChild(stepsWrap);
    rowsEl.appendChild(row);
  });

  function syncGridUI() {
    TRACKS.forEach((tr) => {
      for (let s = 0; s < 16; s++) {
        padElements[tr.id][s].classList.toggle('active', !!pattern[tr.id][s]);
      }
    });
  }

  function updateInsight(title, body) {
    insightEl.innerHTML = `
      <div class="mentor-insight-icon">🎧</div>
      <div>
        <h4>${title}</h4>
        <p>${body}</p>
      </div>
    `;
  }

  function loadPreset(key, autoPlay = false) {
    const preset = DRUM_PRESETS[key];
    if (!preset) return;
    activePresetKey = key;
    bpm = preset.bpm;
    swing = preset.swing;
    bpmSlider.value = bpm;
    bpmValue.textContent = bpm;
    swingSlider.value = swing;
    swingValue.textContent = `${swing}%`;

    TRACKS.forEach((tr) => {
      pattern[tr.id] = [...(preset.grid[tr.id] || new Array(16).fill(0))];
    });

    presetBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.preset === key);
    });

    syncGridUI();
    updateInsight(preset.insightTitle, preset.insightBody);

    if (autoPlay && !isPlaying) {
      startSequencer();
    }
  }

  function highlightStep(stepIndex) {
    rulerCells.forEach((cell, i) => cell.classList.toggle('current-step', i === stepIndex));
    TRACKS.forEach((tr) => {
      for (let s = 0; s < 16; s++) {
        padElements[tr.id][s].classList.toggle('playing', s === stepIndex);
      }
    });
  }

  function clearStepHighlights() {
    rulerCells.forEach((c) => c.classList.remove('current-step'));
    TRACKS.forEach((tr) => {
      padElements[tr.id].forEach((p) => p.classList.remove('playing'));
    });
  }

  function scheduleStep(step, time) {
    // Apply swing delay on odd 16th steps (1, 3, 5, 7, ...)
    const stepDur = 60.0 / bpm / 4.0;
    const swingOffset = step % 2 === 1 ? (swing / 100) * stepDur * 0.65 : 0;
    const playTime = time + swingOffset;

    TRACKS.forEach((tr) => {
      if (pattern[tr.id][step] && !muted[tr.id]) {
        audioEngine.triggerDrum(tr.id, playTime, tr.gain);
      }
    });

    // Visual sync scheduled closely with audio time
    const delayMs = Math.max(0, (playTime - audioEngine.ctx.currentTime) * 1000);
    window.setTimeout(() => {
      if (isPlaying) highlightStep(step);
    }, delayMs);
  }

  function scheduler() {
    const lookahead = 0.1; // 100ms lookahead
    const stepDur = 60.0 / bpm / 4.0;

    while (nextNoteTime < audioEngine.ctx.currentTime + lookahead) {
      scheduleStep(currentStep, nextNoteTime);
      nextNoteTime += stepDur;
      currentStep = (currentStep + 1) % 16;
    }
  }

  function startSequencer() {
    const ctx = audioEngine.ensureContext();
    isPlaying = true;
    currentStep = 0;
    nextNoteTime = ctx.currentTime + 0.04;
    schedulerTimer = window.setInterval(scheduler, 25);

    playBtn.classList.add('playing');
    playLabel.textContent = 'ТОҚТАТУ';
    iconPlay.classList.add('hidden');
    iconStop.classList.remove('hidden');
  }

  function stopSequencer() {
    isPlaying = false;
    if (schedulerTimer) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
    clearStepHighlights();
    playBtn.classList.remove('playing');
    playLabel.textContent = 'ОЙНАТУ';
    iconPlay.classList.remove('hidden');
    iconStop.classList.add('hidden');
  }

  // Event Listeners
  playBtn.addEventListener('click', () => {
    if (isPlaying) stopSequencer();
    else startSequencer();
  });

  bpmSlider.addEventListener('input', (e) => {
    bpm = Number(e.target.value);
    bpmValue.textContent = bpm;
  });

  swingSlider.addEventListener('input', (e) => {
    swing = Number(e.target.value);
    swingValue.textContent = `${swing}%`;
  });

  masterVolSlider.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    masterVolValue.textContent = `${v}%`;
    audioEngine.setMasterVolume(v / 100);
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
  });

  clearBtn.addEventListener('click', () => {
    TRACKS.forEach((tr) => pattern[tr.id].fill(0));
    presetBtns.forEach((b) => b.classList.remove('active'));
    syncGridUI();
    updateInsight(
      '✨ Таза парақ! Өз битіңді 0-ден жина',
      'Кеңес: алдымен CLAP-ты 9-қадамға қой, сосын HI-HAT-ты әр 2 қадам сайын (1, 3, 5, 7, 9, 11, 13, 15) қос, одан кейін 1-қадамнан бастап KICK пен 808-ді қойып көр!'
    );
  });

  randomBtn.addEventListener('click', () => {
    presetBtns.forEach((b) => b.classList.remove('active'));
    const isHalfTime = bpm >= 125;
    TRACKS.forEach((tr) => pattern[tr.id].fill(0));

    // Musical randomization so it actually grooves!
    pattern.kick[0] = 1;
    for (let s = 2; s < 16; s++) {
      if (s !== 4 && s !== 8 && s !== 12 && Math.random() < 0.22) pattern.kick[s] = 1;
    }
    if (isHalfTime) {
      pattern.clap[8] = 1;
      pattern['808'][0] = 1;
      [6, 10, 14].forEach((s) => { if (Math.random() < 0.6) pattern['808'][s] = 1; });
    } else {
      pattern.snare[4] = 1;
      pattern.snare[12] = 1;
    }
    for (let s = 0; s < 16; s += 2) pattern.ch[s] = 1;
    [7, 13, 15].forEach((s) => { if (Math.random() < 0.5) pattern.ch[s] = 1; });
    pattern.oh[Math.random() < 0.5 ? 4 : 14] = 1;
    pattern.perc[Math.random() < 0.5 ? 3 : 11] = 1;

    syncGridUI();
    updateInsight(
      `🎲 Кездейсоқ идея (${bpm} BPM)`,
      'Кейде кездейсоқ паттерннен хит идея туады! Ұнамаған 1–2 торшаны өшіріп, өзіңе сай етіп жөндеп көр.'
    );
  });

  tapTempoBtn.addEventListener('click', () => {
    const now = performance.now();
    if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
      tapTimes = [];
    }
    tapTimes.push(now);
    if (tapTimes.length > 6) tapTimes.shift();
    if (tapTimes.length >= 2) {
      let sum = 0;
      for (let i = 1; i < tapTimes.length; i++) {
        sum += tapTimes[i] - tapTimes[i - 1];
      }
      const avgMs = sum / (tapTimes.length - 1);
      const calcBpm = Math.round(Math.max(65, Math.min(175, 60000 / avgMs)));
      bpm = calcBpm;
      bpmSlider.value = bpm;
      bpmValue.textContent = bpm;
    }
  });

  // Live Oscilloscope Canvas Loop
  function drawScope() {
    requestAnimationFrame(drawScope);
    const w = canvas.width;
    const h = canvas.height;
    canvasCtx.fillStyle = '#07090e';
    canvasCtx.fillRect(0, 0, w, h);

    // Center grid line
    canvasCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, h / 2);
    canvasCtx.lineTo(w, h / 2);
    canvasCtx.stroke();

    if (!audioEngine.analyser) return;

    const bufferLength = audioEngine.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioEngine.analyser.getByteTimeDomainData(dataArray);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = isPlaying ? '#00e5a0' : '#ff8c24';
    canvasCtx.beginPath();

    const sliceWidth = w / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);
      x += sliceWidth;
    }
    canvasCtx.stroke();
  }
  drawScope();

  // Initialize with Trap preset
  loadPreset('trap', false);

  return {
    loadPreset,
    stopSequencer,
    startSequencer
  };
}
