// =========================================================
// BEATLAB KZ — Interactive Piano, Scale & Chord Lab
// 2-Octave Keyboard, Scale Highlighting, Chord Formulas
// =========================================================

import { audioEngine } from './audio-engine.js';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_SET = new Set([1, 3, 6, 8, 10]);

const SCALES = {
  minor: { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmonicMinor: { name: 'Harmonic Minor (Dark)', intervals: [0, 2, 3, 5, 7, 8, 11] },
  major: { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  pentatonicMinor: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] }
};

const CHORD_FORMULAS = {
  minor: {
    name: 'Minor (Мұңды / Қараңғы)',
    intervals: [0, 3, 7],
    desc: 'Root нота (0) + 3 жарты тон + 7 жарты тон. Trap, Drill, Rap биттеріндегі #1 негізгі аккорд!'
  },
  major: {
    name: 'Major (Көңілді / Жарқын)',
    intervals: [0, 4, 7],
    desc: 'Root нота (0) + 4 жарты тон + 7 жарты тон. Поп, жазғы хиттер мен шабытты тректер үшін.'
  },
  min7: {
    name: 'Minor 7th (Lo-Fi / R&B)',
    intervals: [0, 3, 7, 10],
    desc: 'Minor аккордқа + 10-шы жарты тон қосылады. Бірден қымбат, жұмсақ джаз және Lo-Fi атмосфера береді!'
  },
  sus2: {
    name: 'Sus2 (Атмосфералы / Кино)',
    intervals: [0, 2, 7],
    desc: '0 — 2 — 7 формуласы: мұңды да емес, көңілді де емес — ғарыштық, заманауи трап/поп вайбы.'
  }
};

// Prebuilt Pro Chord Progressions (MIDI arrays around C4=60)
const PROGRESSIONS = {
  darkTrap: {
    root: 0,
    scale: 'minor',
    stepMs: 950,
    chords: [
      { label: 'Cm', notes: [60, 63, 67, 72] },
      { label: 'Ab', notes: [56 + 12, 60, 63, 68] },
      { label: 'G',  notes: [55 + 12, 59 + 12, 62 + 12, 67] },
      { label: 'Cm', notes: [60, 63, 67, 75] }
    ]
  },
  melodicRap: {
    root: 9,
    scale: 'minor',
    stepMs: 1000,
    chords: [
      { label: 'Am', notes: [69, 72, 76] },
      { label: 'F',  notes: [65, 69, 72] },
      { label: 'C',  notes: [60, 64, 67, 72] },
      { label: 'G',  notes: [67, 71, 74] }
    ]
  },
  lofiChill: {
    root: 2,
    scale: 'minor',
    stepMs: 1150,
    chords: [
      { label: 'Dm7',   notes: [62, 65, 69, 72] },
      { label: 'Gm7',   notes: [67, 70, 74, 77] },
      { label: 'C7',    notes: [60, 64, 67, 70] },
      { label: 'Fmaj7', notes: [65, 69, 72, 76] }
    ]
  },
  qpopModern: {
    root: 4,
    scale: 'minor',
    stepMs: 900,
    chords: [
      { label: 'Em', notes: [64, 67, 71] },
      { label: 'C',  notes: [60, 64, 67] },
      { label: 'G',  notes: [67, 71, 74] },
      { label: 'D',  notes: [62, 66, 69] }
    ]
  }
};

const KBD_MAP = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65,
  t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72
};
const MIDI_TO_KBD = Object.fromEntries(Object.entries(KBD_MAP).map(([k, v]) => [v, k.toUpperCase()]));

export function initPianoLab() {
  const keyboardEl = document.getElementById('pianoKeyboard');
  const rootSelect = document.getElementById('rootNoteSelect');
  const scaleSelect = document.getElementById('scaleSelect');
  const voiceSelect = document.getElementById('synthVoiceSelect');
  const statusInfo = document.getElementById('pianoActiveInfo');
  const formulaBtns = document.querySelectorAll('#chordFormulaBtns .formula-btn');
  const formulaExplain = document.getElementById('chordFormulaExplain');
  const progBtns = document.querySelectorAll('#progressionList .prog-btn');

  let rootNote = 0; // C
  let scaleKey = 'minor';
  let voice = 'keys';
  let progTimer = null;
  let activeProgBtn = null;
  const keyEls = new Map();

  // Build 2 octaves: MIDI 60 (C4) through 83 (B5)
  keyboardEl.innerHTML = '';
  let whiteCount = 0;
  const totalWhites = 14;

  for (let midi = 60; midi <= 83; midi++) {
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const noteLabel = `${NOTE_NAMES[pitchClass]}${octave}`;
    const isBlack = BLACK_SET.has(pitchClass);

    const keyBtn = document.createElement('button');
    keyBtn.type = 'button';
    keyBtn.dataset.midi = midi;
    keyBtn.dataset.pc = pitchClass;

    if (!isBlack) {
      keyBtn.className = 'piano-key-white';
      const kbdHint = MIDI_TO_KBD[midi] ? `<span class="key-kbd">${MIDI_TO_KBD[midi]}</span>` : '';
      keyBtn.innerHTML = `${kbdHint}<span class="key-note">${noteLabel}</span>`;
      keyboardEl.appendChild(keyBtn);
      whiteCount++;
    } else {
      keyBtn.className = 'piano-key-black';
      keyBtn.style.left = `${(whiteCount / totalWhites) * 100}%`;
      keyBtn.innerHTML = `<span class="key-note">${NOTE_NAMES[pitchClass]}</span>`;
      keyboardEl.appendChild(keyBtn);
    }

    keyBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      stopProgression();
      triggerKey(midi, 0.8);
    });

    keyEls.set(midi, keyBtn);
  }

  function updateScaleHighlight() {
    const scale = SCALES[scaleKey];
    const allowed = new Set(scale.intervals.map((i) => (rootNote + i) % 12));

    keyEls.forEach((el, midi) => {
      const pc = midi % 12;
      el.classList.toggle('is-root', pc === rootNote);
      el.classList.toggle('in-scale', allowed.has(pc) && pc !== rootNote);
    });

    const scaleNoteNames = scale.intervals.map((i) => NOTE_NAMES[(rootNote + i) % 12]).join(' – ');
    statusInfo.innerHTML = `Гамма: <strong>${NOTE_NAMES[rootNote]} ${scale.name}</strong> → Ноталар: <span class="mono-accent">${scaleNoteNames}</span>`;
  }

  function flashKey(midi, durationMs = 360) {
    const el = keyEls.get(midi);
    if (!el) return;
    el.classList.add('pressed');
    window.setTimeout(() => el.classList.remove('pressed'), durationMs);
  }

  function triggerKey(midi, duration = 0.85, silentStatus = false) {
    audioEngine.playSynthNote(midi, { duration, voice, velocity: 0.6 });
    flashKey(midi, Math.min(750, duration * 700));

    if (!silentStatus) {
      const pc = midi % 12;
      const octave = Math.floor(midi / 12) - 1;
      const scale = SCALES[scaleKey];
      const inScale = scale.intervals.some((i) => (rootNote + i) % 12 === pc);
      const badge = inScale
        ? '<span style="color:#00e5a0;font-weight:700;">✓ Гамма ішінде (дұрыс нота)</span>'
        : '<span style="color:#ff7c95;font-weight:700;">• Гаммадан тыс</span>';
      statusInfo.innerHTML = `Басылған нота: <strong>${NOTE_NAMES[pc]}${octave}</strong> — ${badge}`;
    }
  }

  function playChordFormula(formulaKey) {
    stopProgression();
    const formula = CHORD_FORMULAS[formulaKey];
    if (!formula) return;

    const baseMidi = 60 + rootNote;
    const notes = formula.intervals.map((iv) => {
      const m = baseMidi + iv;
      return m <= 83 ? m : m - 12;
    });

    notes.forEach((m, idx) => {
      audioEngine.playSynthNote(m, { duration: 1.25, voice, velocity: 0.45, delay: idx * 0.035 });
      flashKey(m, 950);
    });

    const names = notes.map((m) => NOTE_NAMES[m % 12]).join(' + ');
    formulaExplain.innerHTML = `
      <strong style="color:#f4f6fb;">${NOTE_NAMES[rootNote]} ${formula.name}:</strong>
      <span class="mono-accent">${names}</span><br/>
      ${formula.desc}
    `;
  }

  function stopProgression() {
    if (progTimer) {
      clearTimeout(progTimer);
      progTimer = null;
    }
    if (activeProgBtn) {
      activeProgBtn.classList.remove('playing');
      activeProgBtn.querySelector('.play-pill').textContent = '▶ Тыңдау';
      activeProgBtn = null;
    }
  }

  function playProgression(progKey, btn) {
    if (activeProgBtn === btn) {
      stopProgression();
      return;
    }
    stopProgression();

    const prog = PROGRESSIONS[progKey];
    if (!prog) return;

    // Align scale highlight to progression
    rootNote = prog.root;
    scaleKey = prog.scale;
    rootSelect.value = String(rootNote);
    scaleSelect.value = scaleKey;
    updateScaleHighlight();

    activeProgBtn = btn;
    btn.classList.add('playing');
    btn.querySelector('.play-pill').textContent = '■ Тоқтату';

    let step = 0;
    const playNext = () => {
      if (activeProgBtn !== btn) return;
      const chord = prog.chords[step];
      chord.notes.forEach((m, idx) => {
        const clamped = m > 83 ? m - 12 : m;
        audioEngine.playSynthNote(clamped, {
          duration: prog.stepMs / 1000,
          voice,
          velocity: 0.42,
          delay: idx * 0.025
        });
        flashKey(clamped, prog.stepMs - 90);
      });
      statusInfo.innerHTML = `Прогрессия ойнап тұр: <strong class="mono-accent">${chord.label}</strong> (${step + 1}/4 такт)`;

      step = (step + 1) % prog.chords.length;
      progTimer = window.setTimeout(playNext, prog.stepMs);
    };

    playNext();
  }

  // Events
  rootSelect.addEventListener('change', (e) => {
    rootNote = Number(e.target.value);
    updateScaleHighlight();
  });

  scaleSelect.addEventListener('change', (e) => {
    scaleKey = e.target.value;
    updateScaleHighlight();
  });

  voiceSelect.addEventListener('change', (e) => {
    voice = e.target.value;
  });

  formulaBtns.forEach((btn) => {
    btn.addEventListener('click', () => playChordFormula(btn.dataset.chord));
  });

  progBtns.forEach((btn) => {
    btn.addEventListener('click', () => playProgression(btn.dataset.prog, btn));
  });

  // Computer keyboard support
  const heldKeys = new Set();
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (KBD_MAP[key] !== undefined && !heldKeys.has(key)) {
      heldKeys.add(key);
      stopProgression();
      triggerKey(KBD_MAP[key], 0.8);
    }
  });
  window.addEventListener('keyup', (e) => {
    heldKeys.delete(e.key.toLowerCase());
  });

  updateScaleHighlight();

  return {
    configure({ root, scale, demoChord }) {
      if (root !== undefined) {
        rootNote = root;
        rootSelect.value = String(root);
      }
      if (scale) {
        scaleKey = scale;
        scaleSelect.value = scale;
      }
      updateScaleHighlight();
      if (demoChord) {
        window.setTimeout(() => playChordFormula(demoChord), 350);
      }
    }
  };
}
