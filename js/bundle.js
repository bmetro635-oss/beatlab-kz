(function(){
"use strict";
// ----- js/audio-engine.js -----
// =========================================================
// BEATLAB KZ — Web Audio API Synthesizer & Drum Engine
// Zero external audio dependencies, studio-grade synthesis
// =========================================================

class StudioAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.analyser = null;
    this.noiseBuffer = null;
    this.saturationCurve = null;
    this.active808 = null;
    this.activeOpenHat = null;
    this.volume = 0.8;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      // Soft studio bus compressor / limiter
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.14, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.noiseBuffer = this._createNoiseBuffer();
      this.saturationCurve = this._makeDistortionCurve(18);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMasterVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.015);
    }
  }

  _createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  _makeDistortionCurve(amount = 20) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // Trigger drum sound at precise Web Audio time
  triggerDrum(type, time = null, gainScale = 1) {
    const ctx = this.ensureContext();
    const t = time ?? ctx.currentTime;

    switch (type) {
      case '808': this._play808(t, gainScale); break;
      case 'kick': this._playKick(t, gainScale); break;
      case 'snare': this._playSnare(t, gainScale); break;
      case 'clap': this._playClap(t, gainScale); break;
      case 'ch': this._playClosedHat(t, gainScale); break;
      case 'oh': this._playOpenHat(t, gainScale); break;
      case 'perc': this._playPerc(t, gainScale); break;
      default: break;
    }
  }

  _play808(t, scale) {
    const ctx = this.ctx;
    // Monophonic "Cut Itself" behavior so 808 notes never clash
    if (this.active808) {
      try {
        this.active808.gain.cancelScheduledValues(t);
        this.active808.gain.setTargetAtTime(0.0001, t, 0.012);
      } catch (_) {}
    }

    const osc = ctx.createOscillator();
    const shaper = ctx.createWaveShaper();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(125, t);
    osc.frequency.exponentialRampToValueAtTime(46.25, t + 0.055); // F#1 punchy sub
    osc.frequency.exponentialRampToValueAtTime(43.65, t + 0.45);

    shaper.curve = this.saturationCurve;
    shaper.oversample = '2x';

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.85 * scale, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.32 * scale, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.62);

    osc.connect(shaper);
    shaper.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    this.active808 = gain;
    osc.start(t);
    osc.stop(t + 0.65);
  }

  _playKick(t, scale) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.075);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.2);

    gain.gain.setValueAtTime(1.0 * scale, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    // Subtle punch click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(900, t);
    clickOsc.frequency.exponentialRampToValueAtTime(120, t + 0.018);
    clickGain.gain.setValueAtTime(0.28 * scale, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

    osc.connect(gain);
    gain.connect(this.masterGain);
    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
    clickOsc.start(t);
    clickOsc.stop(t + 0.03);
  }

  _playSnare(t, scale) {
    const ctx = this.ctx;
    // Noise snap
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1150, t);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.55 * scale, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    // Body tone
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(215, t);
    osc.frequency.exponentialRampToValueAtTime(125, t + 0.08);

    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.45 * scale, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    osc.connect(oGain);
    oGain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.18);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  _playClap(t, scale) {
    const ctx = this.ctx;
    const bursts = [0, 0.011, 0.023, 0.036];
    bursts.forEach((offset, idx) => {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450, t + offset);
      filter.Q.setValueAtTime(1.5, t + offset);

      const gain = ctx.createGain();
      const isTail = idx === bursts.length - 1;
      const peak = (isTail ? 0.52 : 0.36) * scale;
      const dur = isTail ? 0.17 : 0.022;

      gain.gain.setValueAtTime(0.001, t + offset);
      gain.gain.linearRampToValueAtTime(peak, t + offset + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t + offset);
      noise.stop(t + offset + dur + 0.02);
    });
  }

  _playClosedHat(t, scale) {
    const ctx = this.ctx;
    // Choke open hat
    if (this.activeOpenHat) {
      try {
        this.activeOpenHat.gain.cancelScheduledValues(t);
        this.activeOpenHat.gain.setTargetAtTime(0.0001, t, 0.008);
      } catch (_) {}
    }

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(7200, t);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(10200, t);
    bp.Q.setValueAtTime(0.9, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32 * scale, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.065);
  }

  _playOpenHat(t, scale) {
    const ctx = this.ctx;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(6400, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * scale, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    noise.connect(hp);
    hp.connect(gain);
    gain.connect(this.masterGain);

    this.activeOpenHat = gain;
    noise.start(t);
    noise.stop(t + 0.34);
  }

  _playPerc(t, scale) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.045);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45 * scale, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.075);
  }

  // Convert MIDI note number (e.g. 60 = C4) to Hz
  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a melodic synth note for the Piano & Chord Lab
  playSynthNote(midi, { duration = 0.9, voice = 'keys', velocity = 0.55, delay = 0 } = {}) {
    const ctx = this.ensureContext();
    const t = ctx.currentTime + delay;
    const freq = this.midiToFreq(midi);

    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    if (voice === 'keys') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc2Gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, t);
      osc2Gain.gain.setValueAtTime(0.18, t);
      osc2Gain.gain.exponentialRampToValueAtTime(0.02, t + duration * 0.6);

      filter.frequency.setValueAtTime(2600, t);
      filter.frequency.exponentialRampToValueAtTime(900, t + duration);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.42, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(velocity * 0.18, t + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + duration + 0.25);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration + 0.3);
      osc2.stop(t + duration + 0.3);
    } else if (voice === 'bell') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 3.01, t); // glassy bell overtone
      g2.gain.setValueAtTime(0.24, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.45);

      filter.frequency.setValueAtTime(5200, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.38, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + duration + 0.4);

      osc1.connect(filter);
      osc2.connect(g2);
      g2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration + 0.45);
      osc2.stop(t + duration + 0.45);
    } else if (voice === 'pad') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.004, t); // warm detune

      filter.frequency.setValueAtTime(650, t);
      filter.frequency.linearRampToValueAtTime(1450, t + 0.35);
      filter.frequency.exponentialRampToValueAtTime(550, t + duration + 0.5);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.24, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + duration + 0.65);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration + 0.7);
      osc2.stop(t + duration + 0.7);
    } else {
      // pluck
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.frequency.setValueAtTime(4200, t);
      filter.frequency.exponentialRampToValueAtTime(380, t + 0.28);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.35, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.5);
    }
  }
}

const audioEngine = new StudioAudioEngine();


// ----- js/curriculum-data.js -----
// =========================================================
// BEATLAB KZ — Complete Kazakh Pro Beatmaker Curriculum Data
// 6 Modules, 18 Lessons, 30-Day Roadmap, Top 10 Mistakes,
// Free Starter Pack, Quiz (10 Qs), Glossary (36 Terms)
// =========================================================

const CURRICULUM = [
  {
    id: 'm1',
    number: '01',
    shortTitle: 'Бастама & DAW',
    title: 'Модуль 1: Бастама және DAW таңдау',
    summary: 'Битмейкинг әлеміне кіріспе: не керек, қай бағдарламаны орнату керек және интерфейсті 10 минутта түсіну.',
    lessons: [
      {
        id: 'l1-1',
        code: '1.1',
        title: 'Битмейкинг деген не және бастау үшін нақты не керек?',
        duration: '5 мин',
        level: 'Жаңадан бастаушы',
        lead: 'Көп адам «маған қымбат студия, 500 мыңдық монитор, MIDI-клавиатура керек» деп бастамай жүреді. Шындық басқаша: әлемдік хиттердің жартысы қарапайым ноутбук пен тінтуірде (мышкамен) жазылған.',
        blocks: [
          {
            heading: 'Битмейкер мен Продюсердің айырмашылығы',
            paragraphs: [
              '<strong>Битмейкер (Beatmaker)</strong> — тректің инструментал бөлігін (драмдар, 808 бас, мелодия, аранжировка) жасайтын адам. Яғни әнші немесе рэпер үстінен оқитын дайын музыканы құрастырады.',
              '<strong>Музыкалық продюсер (Producer)</strong> — бүкіл тректің режиссері: бит жасайды, вокалды бағыттайды, сведение жасайды, тректің соңғы идеясын аяғына дейін жеткізеді. Көбіне бәрі битмейкерліктен бастап, кейін толық продюсер болады.'
            ]
          },
          {
            heading: 'Дәл бүгін бастау үшін ең төменгі жиынтық',
            list: [
              '<strong>Ноутбук немесе компьютер:</strong> кез келген заманауи Windows немесе Mac жарайды (8 GB RAM бастауға жетеді, 16 GB болса тіпті жақсы).',
              '<strong>Құлаққап (Наушник):</strong> алғашқы 2–3 айда қолыңда бар кез келген сымды құлаққап жарайды. Bluetooth наушникте дыбыс кешігіп (latency) шығады, сондықтан сымды құлаққап тиімдірек.',
              '<strong>DAW бағдарламасы:</strong> музыка жазатын бағдарлама (келесі сабақта таңдаймыз).',
              '<strong>MIDI-клавиатура міндетті емес!</strong> Тінтуірмен (Piano Roll арқылы) кез келген мелодия мен аккордты оңай жазуға болады.'
            ]
          }
        ],
        proTip: 'Бүгіннен бастап сүйікті әндеріңді «құлақпен бөлшектеп» тыңда. Әншінің даусын емес, арттағы дыбыстарды тыңда: «қазір Kick соқты, қазір Hi-Hat жиілеп кетті, қайырмада бас кірді». Бұл — ең мықты жаттығу.',
        mistake: 'Алғашқы күні-ақ 50 ГБ плагин, 200 драм-кит жүктеп алу. Бұл сені шатастырады. Бастауға 1 DAW және 1 сапалы Drum Kit жеткілікті!',
        task: {
          text: 'Өзіңе ұнайтын 3 тректі таңдап, олардың ішінде қанша аспап ойнап тұрғанын қағазға жазып көр (мысалы: пианино, 808 бас, клэп, хэттер). Ал дәл қазір сайттағы Драм-машинаны ашып, алғашқы ырғағыңды тыңдап көр!',
          actionLabel: 'Драм-машинаны ашу →',
          actionType: 'drum',
          actionPayload: 'trap'
        }
      },
      {
        id: 'l1-2',
        code: '1.2',
        title: 'DAW деген не және қай бағдарламаны таңдау керек?',
        duration: '6 мин',
        level: 'Жаңадан бастаушы',
        lead: 'DAW (Digital Audio Workstation) — бұл сенің виртуалды дыбыс жазу студияң. Маңызды шындық: барлық DAW-да дыбыс сапасы бірдей! Хит бағдарламаға емес, сенің қолыңа байланысты.',
        blocks: [
          {
            heading: 'Ең танымал 4 DAW салыстыруы',
            table: {
              headers: ['DAW атауы', 'Кімге ыңғайлы?', 'Артықшылығы', 'Жүйе & Бағасы'],
              rows: [
                ['FL Studio', 'Trap, Hip-Hop, Drill, Q-Pop, жаңадан бастаушылар (#1 таңдау)', 'Ең ыңғайлы Piano Roll, шексіз тегін жаңартулар, YouTube-та миллион сабақ бар.', 'Win / Mac • Шектеусіз Trial бар'],
                ['Ableton Live', 'EDM, House, Boom Bap, Lo-Fi, сэмплинг & лайв', 'Өте жылдам жұмыс ағыны, мықты встроенный эффектілер, сэмпл кесуге керемет.', 'Win / Mac • 30 күн тегін / Lite нұсқа'],
                ['Logic Pro', 'Тек Mac иелері, поп/вокал + бит жазу', 'Ішінде өте бай дайын аспаптар мен дыбыстар кітапханасы бар, бағасы тиімді.', 'Тек macOS • 90 күн тегін сынақ'],
                ['BandLab', 'Телефоннан немесе браузерден 0 теңгемен бастау', 'Толық тегін, ештеңе орнатуды қажет етпейді, браузерде жұмыс істейді.', 'Web / iOS / Android • Тегін']
              ]
            }
          },
          {
            heading: 'Ментордың нақты кеңесі: неден баста?',
            paragraphs: [
              'Егер сен <strong>Hip-Hop, Trap, Drill, Melodic Rap немесе Q-Pop</strong> стилінде бит жазғың келсе — ойланбай <strong>FL Studio</strong> таңда. Оның Channel Rack пен Piano Roll терезелері бастаушыға өте түсінікті.',
              'Ал егер <strong>House, Lo-Fi, электронды музыка немесе сэмплинг</strong> көбірек қызықтырса — <strong>Ableton Live</strong> тамаша таңдау. Бір DAW таңда да, кемі 6 ай басқасына ауыспа!'
            ]
          }
        ],
        proTip: 'FL Studio-ның ресми сайтындағы тегін Trial нұсқасында БАРЛЫҚ функциялар ашық! Тек сақталған жобаны қайта ашу шектелген, бірақ дайын битті MP3/WAV қылып экспорттауға болады — үйренуге 100% жетеді.',
        mistake: 'Апта сайын «FL Studio жақсы ма, әлде Ableton ба?» деп ауыса беру. Бұл уақытты босқа кетіреді. Кез келген біреуін таңда да, жетік меңгер.',
        task: {
          text: 'Компьютеріңе FL Studio Trial (немесе Ableton Live / BandLab) орнатып ал. Ал орнатқанша осы сайттағы интерактивті студияда жаттыға бер!',
          actionLabel: 'Пианино зертханасын көру →',
          actionType: 'piano',
          actionPayload: { root: 0, scale: 'minor' }
        }
      },
      {
        id: 'l1-3',
        code: '1.3',
        title: 'DAW ішіндегі 5 басты терезе (10 минутта меңгер)',
        duration: '7 мин',
        level: 'Жаңадан бастаушы',
        lead: 'DAW-ды алғаш ашқанда 100 батырма көріп шошып кету қалыпты жағдай. Бірақ шын мәнінде бит жасау үшін саған тек 5 негізгі терезе керек!',
        blocks: [
          {
            heading: 'Биттің өмір жолы — 5 терезе:',
            list: [
              '<strong>1. Browser (Кітапхана / Сол жақта):</strong> сенің барлық дыбыстарың (Kick, Snare, Hi-Hat, 808) және сэмплдерің сақталатын папкалар. Осы жерден дыбысты тыңдап, жобаға сүйреп әкелесің.',
              '<strong>2. Channel Rack / Track View (Аспаптар тізімі):</strong> сенің драм-машинаң. Осында Kick, Snare, Hi-Hat және VST плагиндеріңді (пианино, синтезатор) жүктейсің. Дәл төмендегі біздің Драм-машина осы терезенің көшірмесі!',
              '<strong>3. Piano Roll (Ноталар торы):</strong> мелодия, аккордтар, 808 бас және күрделі хэттерді сызатын ең маңызды терезе. Сол жағында тігінен пианино пернелері, оң жағында уақыт торы тұрады.',
              '<strong>4. Playlist / Arrangement View (Таймлайн):</strong> кішкентай паттерндерді (драм, мелодия, бас) солдан оңға қарай тізіп, 2–3 минуттық толық трек (Intro, Қайырма, Шулық) құрастыратын орын.',
              '<strong>5. Mixer (Микшер):</strong> әр дыбыстың қаттылығын (Volume) реттейтін, панорама (сол/оң құлақ) қоятын және EQ, Reverb, Compressor сияқты эффектілерді ілетін дыбыс пульті.'
            ]
          },
          {
            heading: 'Жұмыс реті (Workflow) қалай жүреді?',
            paragraphs: [
              '<strong>Browser-дан дыбыс аласың</strong> → <strong>Channel Rack-қа қоясың</strong> → <strong>Piano Roll-да мелодия/808 жазасың</strong> → <strong>Playlist-те толық трекке жинайсың</strong> → <strong>Mixer-де тазалайсың</strong> → <strong>Export (MP3/WAV)</strong>!'
            ]
          }
        ],
        proTip: 'FL Studio-дағы 5 алтын пернені жаттап ал: F5 (Playlist), F6 (Channel Rack), F7 (Piano Roll), F9 (Mixer), Space (Ойнату/Тоқтату), Ctrl+S (Жобаны сақтау — әр 5 минут сайын бас!).',
        mistake: 'Барлық дыбыстарды бір паттернге (Pattern 1) салып тастап, кейін аранжировка жасай алмай қалу. Дұрысы: әр аспапты бөлек паттернге жаз немесе Playlist-ке қойғанда «Split by channel» функциясын қолдан.',
        task: {
          text: 'Төмендегі Аранжировка (Playlist) картасына өтіп, паттерндердің уақыт бойынша қалай орналасатынын көзбен көр!',
          actionLabel: 'Аранжировка картасын ашу →',
          actionType: 'arrangement'
        }
      }
    ]
  },

  {
    id: 'm2',
    number: '02',
    shortTitle: 'Ырғақ & Драм',
    title: 'Модуль 2: Ырғақ, BPM және Драм-партия',
    summary: 'Басты шайқататын ырғақ (Bounce) қалай жасалады? BPM, такт, Trap/Boom Bap/Drill формулалары және хэттер құпиясы.',
    lessons: [
      {
        id: 'l2-1',
        code: '2.1',
        title: 'BPM, 4/4 өлшемі, Такт (Bar) және 1/16 тор деген не?',
        duration: '6 мин',
        level: 'Жаңадан бастаушы',
        lead: 'Биттің «жүрек соғысы» — бұл ырғақ. Музыкалық білімің болмаса да, кез келген рэп немесе поп әннің 99%-ы қарапайым «1 — 2 — 3 — 4» санауымен жүреді.',
        blocks: [
          {
            heading: '3 негізгі ұғымды 1 минутта түсін:',
            list: [
              '<strong>BPM (Beats Per Minute — минутына соққы саны):</strong> тректің жылдамдығы. BPM төмен болса (80–90) — баяу әрі салмақты; жоғары болса (140–160) — жылдам не қарқынды.',
              '<strong>Такт (Bar) және 4/4 өлшемі:</strong> 1 такт = 4 негізгі соққы (Beat): «Бір, Екі, Үш, Төрт». Басыңды шайқап санағанда әр 4 соққы сайын 1 такт аяқталады.',
              '<strong>1/16 тор (Step Grid):</strong> әр 1 соққының (Beat) ішінде 4 кішкентай торша бар. Сонда 1 такт = 4 × 4 = <strong>16 қадам (Step)</strong>. Міне, драм-машинада неге дәл 16 түйме бар екенінің сыры!'
            ]
          },
          {
            heading: 'Жанрлар бойынша BPM анықтамалығы',
            table: {
              headers: ['Жанр', 'BPM диапазоны', 'Мінезі мен ерекшелігі'],
              rows: [
                ['Lo-Fi Hip-Hop', '70 – 88 BPM', 'Тыныш, түнгі вайб, жұмсақ драмдар және swing (кач).'],
                ['Boom Bap (Old School)', '85 – 98 BPM', '90-жылдар рэпі: қатты Kick/Snare, сэмплдер, 2 және 4-соққыда Snare.'],
                ['Q-Pop / Modern Pop-Rap', '95 – 125 BPM', 'Билеуге ыңғайлы, таза мелодия, заманауи поп-рэп ырғағы.'],
                ['House / Club', '120 – 128 BPM', 'Әр соққыда (1, 5, 9, 13-қадам) Kick ұрады (Four-on-the-floor).'],
                ['Trap (Қазіргі рэп)', '130 – 160 BPM', 'Half-time ырғағы: Clap 3-соққыда (9-қадам), жылдам Hi-Hat роллдар, ауыр 808.'],
                ['UK / NY Drill', '140 – 145 BPM', 'Агрессивті, сырғанайтын 808 slide, Snare 9-ші және 15-қадамда!']
              ]
            }
          }
        ],
        proTip: 'Trap жанры неге 140 BPM болса да баяу сияқты естіледі? Себебі ол <strong>Half-Time (екі есе баяу сезім)</strong> тәсілімен жазылады: 140 BPM — шын мәнінде 70 BPM сияқты сезіледі, бірақ Hi-Hat роллдарын салуға торша екі есе көп әрі ыңғайлы!',
        mistake: 'DAW-ды ашқанда әдепкі (default) 130 BPM-ді өзгертпей бит жаза беру. Алдымен қандай вайб қалайтыныңды шешіп, BPM-ді дұрыс қойып ал!',
        task: {
          text: 'Драм-машинада «Boom Bap (90 BPM)» пен «Trap (140 BPM)» пресеттерін кезек-кезек қосып, 1–16 қадамдардың айырмашылығын өз құлағыңмен естіп көр.',
          actionLabel: 'Драм-машинада салыстыру →',
          actionType: 'drum',
          actionPayload: 'boombap'
        }
      },
      {
        id: 'l2-2',
        code: '2.2',
        title: 'Trap, Boom Bap және Drill драм-партиясының нақты схемасы',
        duration: '8 мин',
        level: 'Жаңадан бастаушы',
        lead: 'Драм-партия — ғимараттың іргетасы. Егер драмдар дұрыс «кач» бермесе, ең әдемі мелодия да құтқара алмайды. Міне, 3 басты жанрдың дәл формуласы:',
        blocks: [
          {
            heading: '1. Классикалық Trap (135–150 BPM)',
            list: [
              '<strong>Clap немесе Snare:</strong> дәл <strong>9-қадамға</strong> (3-соққы / Beat 3) қойылады. Бұл — Trap-тың бұлжымас ережесі!',
              '<strong>Closed Hi-Hat:</strong> әр 2 қадам сайын (1, 3, 5, 7, 9, 11, 13, 15 — яғни «two-step» паттерн). Кейбір жерге 2–3 қатар жылдам соққы (roll) қосасың.',
              '<strong>Kick (Бочка):</strong> 1-қадамнан басталады, кейін ритмге қарай 7, 8, 11 немесе 14-қадамдарға бос орын қалдырып қойылады.',
              '<strong>Open Hat & Perc:</strong> Kick-тің немесе Clap-тың алдында/үстінде акцент беріп тұрады.'
            ]
          },
          {
            heading: '2. Boom Bap (85–95 BPM)',
            list: [
              '<strong>Snare:</strong> <strong>5-ші және 13-қадамда</strong> (2 және 4-соққы). Басты бірден шайқататын классикалық хип-хоп.',
              '<strong>Kick:</strong> 1-қадамда міндетті, ал одан кейін 8, 10, 11-қадамдарда синкопамен (сәл кешігіп не ерте) соғады.',
              '<strong>Hi-Hat:</strong> әр 2 қадам сайын, бірақ қаттылығы (Velocity) бірдей емес: «қатты — ақырын — қатты — ақырын».'
            ]
          },
          {
            heading: '3. UK / NY Drill (140–145 BPM)',
            list: [
              '<strong>Snare (құпиясы осында!):</strong> бірінші Snare <strong>9-қадамда</strong>, ал екінші Snare 13-те емес — <strong>15-қадамда (немесе 12-де)</strong> соғады! Осы кешіккен соққы Drill-дің ерекше секірмелі качын береді.',
              '<strong>Hi-Hat:</strong> «бір — бос — бос — бір — бос — бос — бір» (1, 4, 7, 10, 13...) деген 3 қадамдық синкопамен жүреді!'
            ]
          }
        ],
        proTip: 'Әрқашан алдымен <strong>Clap/Snare</strong> мен <strong>Hi-Hat</strong> қойып ал, содан кейін барып Kick пен 808-ді орналастыр. Сонда ырғақтың ортасы (қаңқасы) нық тұрады.',
        mistake: 'Kick-ті тым көп қою (16 қадамның 8-інде соғып тұрса, бұл рэп емес, балғамен ұрғандай болады). Бос орын (пауза) — ырғаққа ауа мен кач береді!',
        task: {
          text: 'Драм-машинада «Drill (142 BPM)» пресетін қос та, Snare-дің 9 және 15-қадамда қалай ерекше естілетінін зертте. Сосын өзің 1–2 Kick нүктесін өзгертіп көр!',
          actionLabel: 'Drill пресетін Драм-машинада ашу →',
          actionType: 'drum',
          actionPayload: 'drill'
        }
      },
      {
        id: 'l2-3',
        code: '2.3',
        title: 'Bounce & Groove құпиясы: Драмдар «робот» болмауы үшін не істеу керек?',
        duration: '7 мин',
        level: 'Орташа',
        lead: 'Жаңадан бастаушы мен PRO битмейкердің драм-партиясы ноталары бірдей болса да, мүлде бөлек естіледі. Неге? Өйткені PRO-лар <strong>динамика мен микро-ырғақты (Groove)</strong> қолданады.',
        blocks: [
          {
            heading: 'PRO драмдардың 4 құпия техникасы:',
            list: [
              '<strong>1. Velocity (Соққы күші):</strong> нағыз барабаншы ешқашан барлық хэтті бірдей күшпен ұрмайды. Piano Roll-дың астындағы Velocity бағандарын сәл толқын қылып өзгерт (мысалы: 100% — 65% — 85% — 60%). Дыбыс бірден тіріледі!',
              '<strong>2. Swing / Off-Grid (Тордан сәл ығыстыру):</strong> Boom Bap пен Lo-Fi-да хэт пен клэпті 100% торға жабыстырмай, сәл оңға жылжытады (Swing 15%–35%). Бұл «мас» әрі жұмсақ кач береді.',
              '<strong>3. Hi-Hat Rolls & Pitch:</strong> Trap-та 1/32 немесе 1/3 (Triplet) бөлінісімен қысқа хэт роллдарын қос, ал ролл ноталарын 2–3 жарты тон төмен түсірсең — заманауи PRO дыбыс шығады!',
              '<strong>4. Ghost Notes (Көлеңке соққылар):</strong> негізгі Snare-дің алдында немесе соңында өте ақырын (Velocity 25–35%) қосымша Snare/Rim соққысын қойып көр. Құлаққа білінбейді, бірақ басты шайқатады!'
            ]
          }
        ],
        proTip: 'Клэп пен Снэрді қабаттап (Layering) қолдан: негізгі соққыда Clap + жұмсақ Snare бірге ұрса, дыбыс қалың әрі «қымбат» естіледі.',
        mistake: 'Hi-Hat роллдарын әр секунд сайын тықпалай беру. Ролл — дәмдеуіш сияқты: тактының соңында немесе бос жерде аздап қолдансаң ғана әсерлі.',
        task: {
          text: 'Драм-машинада «Lo-Fi (78 BPM)» пресетін қосып, <strong>SWING</strong> сырғытпасын 0%-дан 35%-ға дейін баяу көтеріп көр. Ырғақ қалай «тіріліп» сала беретінін сезесің!',
          actionLabel: 'Swing әсерін Драм-машинада тыңдау →',
          actionType: 'drum',
          actionPayload: 'lofi'
        }
      }
    ]
  },

  {
    id: 'm3',
    number: '03',
    shortTitle: 'Мелодия & 808',
    title: 'Модуль 3: Мелодия, Аккорд және 808 Бас',
    summary: 'Музыка мектебінсіз-ақ хит мелодия мен аккорд жазу жолдары. 808 басты фальшсыз кілтке келтіру.',
    lessons: [
      {
        id: 'l3-1',
        code: '3.1',
        title: 'Музыкалық теориядан қорықпа: Нота, Октава және Гамма (Scale)',
        duration: '6 мин',
        level: 'Жаңадан бастаушы',
        lead: '«Мен пианино білмеймін, мелодия жаза алмаймын» деген ойды дәл қазір ұмыт! Заманауи DAW-да фальш жасау мүмкін емес — себебі <strong>Scale Highlighting</strong> бар.',
        blocks: [
          {
            heading: 'Тек 3 нәрсені білсең жеткілікті:',
            list: [
              '<strong>12 нота:</strong> пианинода небәрі 7 ақ перне (<strong>C, D, E, F, G, A, B</strong>) және 5 қара перне (<strong>C#, D#, F#, G#, A#</strong>) бар. Олар жоғары-төмен қайталана береді (осы қайталану — <strong>Октава</strong>).',
              '<strong>Жарты тон (Semitone):</strong> көршілес екі перненің арасы (ақ болсын, қара болсын). Мысалы, C мен C# арасы = 1 жарты тон.',
              '<strong>Гамма (Scale):</strong> 12 нотаның ішінен бір-бірімен үйлесетін <strong>7 нотаны</strong> таңдап алу. Сол 7 нотаның ішінде қандай ретпен бассаң да — дыбыс әдемі әрі фальшсыз шығады!'
            ]
          },
          {
            heading: 'Битмейкерлердің 90%-ы қолданатын 2 гамма:',
            list: [
              '<strong>Natural Minor (Минор):</strong> мұңды, салмақты, қараңғы, лирикалық. Барлық Trap, Drill, Rap биттерінің 85%-ы минорда жазылады! (Ең оңайы — <strong>A Minor</strong>: тек ақ пернелер!)',
              '<strong>Major (Мажор):</strong> көңілді, жарқын, поп, жазғы көңіл-күй. (Ең оңайы — <strong>C Major</strong>: тек ақ пернелер!)'
            ]
          }
        ],
        proTip: 'FL Studio-да <strong>Piano Roll → View → Scale Highlighting</strong> ашып, мысалы «C» және «Minor Natural (Aeolian)» таңда. Сонда барлық дұрыс ноталар ақшыл жолақпен жанып тұрады!',
        mistake: 'Гамма таңдамай кездейсоқ ноталарды баса беру. Нәтижесінде мелодия бір тональдікте, ал 808 бас басқа тональдікте болып, құлаққа жағымсыз фальш шығады.',
        task: {
          text: 'Пианино зертханасында «Natural Minor» гаммасын таңда да, тек күлгін/сары нүктесі жанған пернелерді басып ойнап көр. Бірде-бір қате дыбыс шықпайтынына көзің жетеді!',
          actionLabel: 'Пианинода Гамманы тексеру →',
          actionType: 'piano',
          actionPayload: { root: 0, scale: 'minor' }
        }
      },
      {
        id: 'l3-2',
        code: '3.2',
        title: '3 секундтық аккорд формуласы (0–3–7) және Мелодия құру',
        duration: '8 мин',
        level: 'Жаңадан бастаушы',
        lead: 'Аккорд дегеніміз — бір уақытта ойнайтын 3 (немесе одан көп) нота. Ол битке эмоция, тереңдік және көңіл-күй береді.',
        blocks: [
          {
            heading: 'Жаттап ал: 2 сиқырлы формула (жарты тонмен санау)',
            list: [
              '<strong>Minor аккорд (мұңды/қараңғы): 0 — 3 — 7.</strong> Кез келген нотаны қой (0), одан 3 жарты тон жоғары екінші нотаны қой, сосын бастапқы нотадан 7 жарты тон жоғары үшінші нотаны қой! Мысалы: <strong>C — D# — G</strong>.',
              '<strong>Major аккорд (жарқын/көңілді): 0 — 4 — 7.</strong> Бастапқы нота (0) + 4 жарты тон + 7 жарты тон. Мысалы: <strong>C — E — G</strong>.'
            ]
          },
          {
            heading: 'Қарапайым аккордты PRO-ға айналдырудың 3 тәсілі:',
            list: [
              '<strong>1. Bass Notes (Төменгі нотаны көшіру):</strong> әр аккордтың ең төменгі нотасын 1 октава төмен көшіріп қой — дыбыс бірден кең әрі ауыр болады.',
              '<strong>2. Inversion (Инверсия):</strong> аккордтың ортаңғы немесе үстіңгі нотасын 1 октава жоғары/төмен ауыстыр. Аккордтар бір-біріне жақындап, өте әдемі ауысады.',
              '<strong>3. Top Melody (Үстіңгі әуен):</strong> аккордтар ойнап тұрғанда, 1 октава жоғарыда сол гамманың ноталарымен қарапайым, есте қалатын 4–6 ноталық әуен сал. Әншіге орын қалдыр!'
            ]
          },
          {
            heading: 'Dark Trap / Drill-дің ең оңай «1 жарты тон» құпиясы',
            paragraphs: [
              'Қараңғы әрі қатал Trap мелодиясы керек пе? Гаммадағы бір-біріне <strong>1 жарты тон жақын тұрған</strong> екі нотаны қолдан (мысалы, C minor гаммасындағы <strong>G пен G#</strong>, немесе <strong>D мен D#</strong>). Бұл бірден қысым мен «dark vibe» береді!'
            ]
          }
        ],
        proTip: 'Хит мелодиялар әрқашан ҚАРАПАЙЫМ болады! 1 секундта 20 нота салма. Бала ысқырып қайталай алатын 3–5 ноталық идея — ең мықты мелодия.',
        mistake: 'Тым көп аспап қабаттау (пианино + гитара + скрипка + флейта + synth бәрі бір уақытта ойнауы). 2–3 жақсы таңдалған дыбыс (мысалы, аккордқа пианино + үстіне жұмсақ флейта/белл) әлдеқайда кәсіби естіледі.',
        task: {
          text: 'Пианино зертханасына өтіп, «Minor (0–3–7)» формуласын және «Dark Trap» дайын прогрессиясын тыңдап, пернетақтада ноталардың қалай орналасқанын көр!',
          actionLabel: 'Аккорд формуласын Пианинода көру →',
          actionType: 'piano',
          actionPayload: { root: 0, scale: 'minor', demoChord: 'minor' }
        }
      },
      {
        id: 'l3-3',
        code: '3.3',
        title: '808 Бас өнері: Тюнинг, Root Notes және «Cut Itself» ережесі',
        duration: '7 мин',
        level: 'Орташа',
        lead: 'Қазіргі рэп пен трэптің 50% энергиясы — 808 баста. Бірақ дәл осы жерде жаңадан бастаушылардың 90%-ы ең үлкен қателіктерді жасайды. Бүгін оны біржола шешеміз!',
        blocks: [
          {
            heading: '808 баспен жұмыс істеудің 4 темір ережесі:',
            list: [
              '<strong>1. «Cut Itself» міндетті түрде қос!</strong> 808 — ұзақ дыбыс. Егер жаңа 808 нотасы соққанда алдыңғысы өшпесе, екі бас бір-біріне қабаттасып «гүрілдеген балшық» болады. FL Studio-да 808 каналын оң жақпен басып <strong>Cut Itself</strong> (немесе Envelope → Hold толық, қалғаны 0) қой!',
              '<strong>2. 808-ді дұрыс нотаға бапта (Tuning):</strong> кейбір жүктелген 808 сэмплдері «C» нотасында емес, «F#» немесе «A» нотасында болуы мүмкін. FL Studio-да Edison (Detect Pitch Regions) арқылы оның шын нотасын біліп, Root Note-ын сәйкестендір.',
              '<strong>3. Аккордтың төменгі нотасымен жүр (Follow Root Notes):</strong> 808 ешқашан кездейсоқ нотада ойнамайды! Егер аккордтарың <strong>Cm → Ab → G</strong> болса, 808 басың да дәл <strong>C → G# (Ab) → G</strong> ноталарымен жүруі керек!',
              '<strong>4. Есту үшін 2 октава жоғарыда жаз:</strong> төмен жиілікте фальшті ажырату қиын. 808 партиясын C5–C6 октавасында (жоғарыда) жазып, әуенмен үйлескенін тексер де, соңында <strong>Ctrl + ↓</strong> басып төменгі бас октавасына түсір!'
            ]
          }
        ],
        proTip: '808 басың телефон динамигінен де естілуі үшін оған аздап <strong>Saturation / Distortion</strong> (мысалы, FL Fast Dist немесе Softube Saturation Knob) қос. Ол төмен бастың үстіне жылы гармоникалар қосып, кез келген құлаққаптан «ырылдап» естілтеді.',
        mistake: '808-ді тым төмен октаваға (30 Hz-тен төмен, мысалы C2-ге) немесе тым жоғарыға қою. 808-дің ең «тәтті» соғатын аумағы — <strong>C3 пен A3</strong> аралығы (шамамен 40–65 Hz).',
        task: {
          text: 'Миксинг бөліміндегі EQ картасында «808 Bass» қойындысын ашып, оның қай жиілікте өмір сүретінін және Kick-пен қалай дос болатынын көр!',
          actionLabel: '808 EQ картасын ашу →',
          actionType: 'eq',
          actionPayload: '808'
        }
      }
    ]
  },

  {
    id: 'm4',
    number: '04',
    shortTitle: 'Аранжировка',
    title: 'Модуль 4: Аранжировка — Луптан толық трекке өту',
    summary: 'Көбіне 8 тактылық лупта тоқтап қаласың ба? Хит тректің құрылымын, энергия толқынын және ауысу эффектілерін үйрен.',
    lessons: [
      {
        id: 'l4-1',
        code: '4.1',
        title: '«Loopitis» ауруын жеңу: 8 тактыдан толық бит құру тәсілі',
        duration: '5 мин',
        level: 'Жаңадан бастаушы',
        lead: 'Жаңадан бастаушылардың 80%-ында «100 аяқталмаған 8 тактылық жоба» бар. Луп жасайды да, «ары қарай не қосам?» деп тоқтап қалады. PRO-лар мүлде басқаша істейді!',
        blocks: [
          {
            heading: 'Алып тастау әдісі (Subtraction Method)',
            paragraphs: [
              'Кәсіби битмейкерлер тректі басынан бастап <em>қосып</em> отырмайды — олар алдымен <strong>ең бай, ең қуатты 8 тактылық Қайырманы (Hook/Chorus)</strong> жасап алады (барлық аспап бірге ойнайтын жер).',
              'Содан кейін сол 8 тактыны бүкіл Playlist бойына 2.5 минутқа көшіріп тастайды да, әр бөлімнен <strong>артық элементтерді ӨШІРІП (алып тастап)</strong> отырады!'
            ],
            list: [
              '<strong>Intro-да:</strong> драмдар мен 808-ді өшір — тек мелодия қалсын.',
              '<strong>Қайырмада (Hook):</strong> бәрі толық ойнасын — максимум энергия!',
              '<strong>Шулықта (Verse):</strong> қосымша мелодияны алып таста, алғашқы 4 тактыда Kick не 808-ді өшіріп, рэперге дем алатын орын аш!'
            ]
          }
        ],
        proTip: '«Әр 4 немесе 8 такт сайын бірдеңе өзгерсін!» ережесін ұстан. Бұл үлкен өзгеріс болуы шарт емес: Open Hat қосылсын, Hi-Hat бір тактқа тоқтасын немесе мелодия 1 октава жоғары көтерілсін — тыңдарман зерікпейді.',
        mistake: 'Шулық (Verse) пен Қайырманың (Hook) бір-бірінен еш айырмашылығы болмауы. Әнші тректі тыңдағанда қай жерде қайырма басталғанын музыкадан бірден сезуі тиіс.',
        task: {
          text: 'Аранжировка таймлайнына өтіп, «Бөлімдерді ретімен көрсету» батырмасын бас та, энергияның қалай өсіп-түсетінін бақыла!',
          actionLabel: 'Аранжировка таймлайнын ашу →',
          actionType: 'arrangement'
        }
      },
      {
        id: 'l4-2',
        code: '4.2',
        title: 'Коммерциялық биттің стандартты құрылымы (Blueprint)',
        duration: '6 мин',
        level: 'Орташа',
        lead: 'Егер битіңе әнші/рэпер жазсын немесе сатып алсын десең, трек құрылымы тыңдарман мен артистке таныс әрі ыңғайлы болуы керек.',
        blocks: [
          {
            heading: 'Алтын формула (140 BPM-де шамамен 2:20–2:50 минут):',
            table: {
              headers: ['Бөлім', 'Ұзақтығы', 'Ішінде не ойнайды?'],
              rows: [
                ['Intro (Кіріспе)', '4 – 8 такт', 'Негізгі мелодия + Producer Tag + соңында Riser (көтерілу).'],
                ['Hook / Chorus (Қайырма)', '8 – 16 такт', 'Бүкіл оркестр: Мелодия + Counter-Melody + Kick + 808 + Snare + Hi-Hats.'],
                ['Verse 1 (1-шулық)', '16 такт', 'Жеңілдеу: Counter-melody өшеді, алғашқы 4–8 тактыда драмның жартысы демалады, кейін қайта қосылады.'],
                ['Bridge / Pre-Chorus', '4 – 8 такт', 'Тыныштық сәті: 808 мен Kick тоқтайды, тек атмосфералы мелодия + Riser.'],
                ['Hook 2 (2-қайырма)', '8 – 16 такт', 'Қайтадан жарылыс (Drop)! Барлық аспап қосылады.'],
                ['Verse 2 & Hook 3 / Outro', '16 + 8 + 4 такт', '2-шулық, соңғы қайырма және біртіндеп өшу (Fade out / мелодия ғана).']
              ]
            }
          }
        ],
        proTip: 'Қазіргі тыңдарманның назары өте қысқа (TikTok дәуірі!). Intro 15 секундтан ұзақ болмасын — ең дұрысы 4 немесе 8 такт (шамамен 7–13 секунд), содан кейін бірден Drop келсін!',
        mistake: 'Битті 4–5 минутқа созып жіберу. Қазіргі стандартты коммерциялық биттің мінсіз ұзақтығы — <strong>2:15 пен 3:00 минут</strong> арасы.',
        task: {
          text: 'Аранжировка бөліміндегі әр 6 блокты (Intro, Hook, Verse, Bridge, Hook 2, Outro) басып, ментордың түсіндірмесін оқып шық.',
          actionLabel: 'Таймлайн бөлімдерін зерттеу →',
          actionType: 'arrangement'
        }
      },
      {
        id: 'l4-3',
        code: '4.3',
        title: 'Ауысулар (Transitions), Паузалар және Автоматизация',
        duration: '6 мин',
        level: 'Орташа',
        lead: 'Бір бөлімнен екінші бөлімге өту тегіс әрі «теріні тітіркендіретіндей» (goosebumps) болуы үшін PRO битмейкерлер арнайы ауысу тәсілдерін қолданады.',
        blocks: [
          {
            heading: 'Кәсіби ауысудың 5 оңай құралы:',
            list: [
              '<strong>1. Drum Dropout (Пауза):</strong> Қайырма кірерден дәл 1–2 соққы бұрын БАРЛЫҚ драм мен 808-ді қиып таста! Бір сәттік тыныштықтан кейін Drop екі есе қуатты ұрады.',
              '<strong>2. Riser & Crash:</strong> бөлімнің соңғы 1–2 тактысында көтерілетін шуыл (Riser / Reverse Crash) қойып, жаңа бөлімнің 1-соққысында Crash тарелкасын қос.',
              '<strong>3. Filter Sweep (Low-Pass Automation):</strong> Intro немесе Bridge кезінде мелодияның жоғарғы жиілігін жауып («су астындағыдай» дыбыс), Drop алдында біртіндеп аш!',
              '<strong>4. Gross Beat / HalfTime (½ жылдамдық):</strong> Шулықтың екінші жартысында немесе Intro-да мелодияны 2 есе баяулатып (HalfTime эффектісі) берсең, бір мелодиядан екі түрлі бөлім шығады.',
              '<strong>5. Reverse Melody:</strong> негізгі мелодияны аудиоға айналдырып, кері бұрып (Reverse) ақырын фонға қойсаң — сиқырлы атмосфера туады.'
            ]
          }
        ],
        proTip: 'Producer Tag-ты (өз дауыс қолтаңбаңды) дәл Intro-ның соңғы тактысына, Drop-тың алдына қой — сол сәтте бүкіл назар сенің атыңда болады!',
        mistake: 'Crash немесе Riser-ді тым қатты қою. FX дыбыстары негізгі драмнан 10–15 dB ақырын, тек фонды жалғап тұратындай болуы тиіс.',
        task: {
          text: 'Драм-машинада Trap битін ойнатып тұрып, 14–16 қадамдағы Kick пен Hi-Hat-ты уақытша өшіріп көр — дәл сол 1 такт соңындағы паузаның (Dropout) күшін бірден байқайсың!',
          actionLabel: 'Драм-машинада пауза жасап көру →',
          actionType: 'drum',
          actionPayload: 'trap'
        }
      }
    ]
  },

  {
    id: 'm5',
    number: '05',
    shortTitle: 'Миксинг & EQ',
    title: 'Модуль 5: Миксинг (Сведение) және Мастеринг негіздері',
    summary: 'Битің телефонда да, көлікте де, клубта да таза әрі қатты естілуі үшін Gain Staging, EQ, Sidechain және Soft Clipper.',
    lessons: [
      {
        id: 'l5-1',
        code: '5.1',
        title: 'Gain Staging (Деңгейлер балансы) — Микстің 70%-ы осы!',
        duration: '6 мин',
        level: 'Орташа',
        lead: 'Көбі «қандай сиқырлы плагин қоссам, миксім кәсіби естіледі?» деп іздейді. Құпия: ешқандай плагин дұрыс реттелмеген дыбыс деңгейін (Volume) алмастыра алмайды!',
        blocks: [
          {
            heading: 'Фейдерлерді реттеудің бастапқы бағдары (Trap / Hip-Hop):',
            table: {
              headers: ['Аспап', 'Бастапқы деңгей (Peak)', 'Мақсаты'],
              rows: [
                ['Kick (Бочка)', '-6 dB ... -4 dB', 'Микстің ең қатты, соққылы нүктесі.'],
                ['Snare / Clap', '-8 dB ... -6 dB', 'Айқын әрі нақты естілуі керек.'],
                ['808 Bass', '-9 dB ... -6 dB', 'Қуатты, бірақ Kick-ті басып кетпесін.'],
                ['Негізгі Мелодия', '-14 dB ... -11 dB', 'Артист даусына орын қалдырып, сәл артта тұрады.'],
                ['Hi-Hat & Percs', '-15 dB ... -12 dB', 'Құлақты кеспей, ырғақты ұстап тұрады.']
              ]
            }
          },
          {
            heading: 'Mono Check (Монода тексеру) лайфхакы',
            paragraphs: [
              'Миксинг жасап болған соң, Мастер-каналды 1 минутқа <strong>MONO</strong> режиміне ауыстыр. Егер Kick, 808 және Мелодия монода да таза естілсе — демек сенің битің телефон динамигінде де, клубта да керемет шығады!'
            ]
          }
        ],
        proTip: 'Миксіңді өте ақырын дыбыста (құлаққапты 20%-ға қойып) тыңдап көр. Ақырын тыңдағанда қай аспап тым қатты шығып тұрғаны немесе мүлде жоғалып кеткені бірден білінеді!',
        mistake: 'Мелодияны драмдармен бірдей қаттылыққа қойып қою. Рэп/Трэп битте басты жұлдыздар — <strong>Драмдар мен 808</strong>, ал мелодия — оларға көңіл-күй беретін фон.',
        task: {
          text: 'Миксинг & EQ бөліміне өтіп, әр аспаптың ұсынылған dB деңгейі мен панорамасын (Mono vs Stereo) қарап шық.',
          actionLabel: 'Миксинг & EQ консолін ашу →',
          actionType: 'eq',
          actionPayload: 'kick'
        }
      },
      {
        id: 'l5-2',
        code: '5.2',
        title: 'EQ (Эквалайзер), Компрессия және Sidechain қарапайым тілмен',
        duration: '8 мин',
        level: 'Орташа',
        lead: 'Әр дыбыс белгілі бір жиіліктерден (20 Hz төмен бас — 20 000 Hz жіңішке ауа) тұрады. Егер пианино да, 808 де 60 Hz-те таласса — микс «балшыққа» айналады.',
        blocks: [
          {
            heading: '1. EQ (Эквалайзер) — ең маңызды 3 қимыл:',
            list: [
              '<strong>Low-Cut (High-Pass Filter):</strong> БАРЛЫҚ мелодиялардан, вокал сэмплдерінен, клэп пен хэттерден <strong>100–150 Hz-тен төмен</strong> жиілікті кесіп таста! Сонда 808 бен Kick-ке тап-таза орын ашылады.',
              '<strong>Балшықты тазалау (200–450 Hz):</strong> егер бит «қораптың ішінен» шыққандай бұлыңғыр естілсе, мелодиядағы 250–400 Hz арасын 2–3 dB төмендет.',
              '<strong>Ауа қосу (8–12 kHz):</strong> Hi-Hat немесе акустикалық гитараға аздап жоғарғы жиілік қоссаң, жылтыр пайда болады.'
            ]
          },
          {
            heading: '2. Компрессор деген не? (4 батырмасын 1 минутта түсін)',
            list: [
              '<strong>Threshold (Шек):</strong> дыбыс қай деңгейден асқанда компрессор іске қосылады.',
              '<strong>Ratio (Қатынас):</strong> асқан дыбысты қаншалықты басу керек (мысалы, 4:1).',
              '<strong>Attack (Шабуыл):</strong> қаншалықты жылдам іске қосылады (баяу Attack драмның «соққысын» сақтайды).',
              '<strong>Release (Босату):</strong> дыбысты қаншалықты тез қайта жібереді.'
            ]
          },
          {
            heading: '3. Sidechain (Kick пен 808 дос болуы үшін)',
            paragraphs: [
              'Kick соққан миллисекундта 808 бастың дыбысын автоматты түрде сәл басып, Kick біткенде қайта көтеру тәсілі — <strong>Sidechain</strong> деп аталады. Нәтиже: Kick таза «ұрады», 808 гүрілдеп жалғастырады!'
            ]
          }
        ],
        proTip: 'Алдымен дыбысты «көтеруден» (Boost) емес, артық жиілікті <strong>«кесуден» (Cut)</strong> баста. Тазалау әрқашан үлкейтуден жақсы нәтиже береді.',
        mistake: '808 бен Kick-ке Stereo Enhancer немесе Reverb қосу. Төмен жиіліктер (150 Hz-тен төмен) ӘРҚАШАН ортада <strong>(MONO)</strong> болуы керек, әйтпесе бас күшін жоғалтады!',
        task: {
          text: 'Интерактивті EQ картасында «Мелодия / Пианино» мен «808 Bass» қисықтарын салыстырып, Low-Cut фильтрінің қай жерде тұрғанын көр!',
          actionLabel: 'Мелодия EQ қисығын көру →',
          actionType: 'eq',
          actionPayload: 'melody'
        }
      },
      {
        id: 'l5-3',
        code: '5.3',
        title: 'Кеңістік (Panning, Reverb, Delay) және Мастеринг / Экспорт',
        duration: '7 мин',
        level: 'PRO',
        lead: 'Дыбыс теңгеріліп, жиіліктер тазарған соң, битке 3D кеңістік беріп, коммерциялық қаттылыққа (Loudness) шығарамыз.',
        blocks: [
          {
            heading: 'Панорама (Сол және Оң құлақ)',
            list: [
              '<strong>Қатаң Ортада (Center / Mono):</strong> Kick, 808 Bass, негізгі Snare/Clap, болашақ Вокал.',
              '<strong>Аздап жан-жаққа (15%–35% L/R):</strong> Hi-Hat, Open Hat, Percs, Rimshots — осылай драмдар кең тыныстайды.',
              '<strong>Кең Stereo (30%–70%):</strong> Пэдтер, Counter-melody, FX, Reverb құйрығы.'
            ]
          },
          {
            heading: 'Reverb & Delay ережесі',
            paragraphs: [
              'Reverb (жаңғырық) мелодияға тереңдік береді, бірақ тым көп болса микс «жуынып кеткендей» алыстап кетеді. <strong>Mix/Wet</strong> деңгейін 10–25% шамасында ұста да, Reverb-тің өзінен 200 Hz-тен төмен жиілікті кесіп таста!'
            ]
          },
          {
            heading: 'Мастер-канал және Дұрыс Экспорт (WAV / MP3)',
            list: [
              '<strong>Trap / Hip-Hop стандарты:</strong> FL Studio-да Мастер-каналдан әдепкі Fruity Limiter-ді алып тастап, орнына <strong>Fruity Soft Clipper</strong> қой. Бұл Kick пен 808-ге агрессивті, таза «кәсіби соққы» береді!',
              '<strong>Лимитер (Limiter):</strong> егер өте таза поп/Lo-Fi жазсаң, Лимитердің Ceiling-ін <strong>-0.1 dB</strong> немесе <strong>-1.0 dB</strong> (стриминг үшін) қой.',
              '<strong>Экспорт форматы:</strong> Сатуға және студияға — <strong>WAV (24-bit, 44.1 kHz)</strong>. Телеграм/WhatsApp-пен жіберуге — <strong>MP3 (320 kbps)</strong>.'
            ]
          }
        ],
        proTip: 'Әншіге (вокал жазуға) жіберетін битті тым қатты сығып (Over-compressed) жіберме! Мастерде шамамен -9..-11 LUFS деңгейінде болса немесе вокалға бос тыныс (Headroom) қалса, звукорежиссер саған рақмет айтады.',
        mistake: 'Мастер-каналға 10 түрлі «сиқырлы мастеринг плагинін» тізіп тастау. Жақсы сведение жасалған битке мастерде тек <strong>EQ (аздап) + Soft Clipper / Limiter</strong> жеткілікті!',
        task: {
          text: 'Миксинг бөліміндегі «Вокалға орын» (Vocal Pocket) қойындысын ашып, әнші даусы үшін қай жиілікті сақтап қою керектігін тексер!',
          actionLabel: 'Вокал жиілігін EQ-да көру →',
          actionType: 'eq',
          actionPayload: 'vocal'
        }
      }
    ]
  },

  {
    id: 'm6',
    number: '06',
    shortTitle: 'PRO & Бизнес',
    title: 'Модуль 6: Саунд-дизайн, Сэмплинг және Бит сату',
    summary: 'Сапалы дыбыс таңдау, сэмплинг өнері, өз қолтаңбаңды (Producer Tag) жасау және алғашқы табыс табу жолдары.',
    lessons: [
      {
        id: 'l6-1',
        code: '6.1',
        title: 'Sound Selection (Дыбыс таңдау) және Сэмплинг өнері',
        duration: '6 мин',
        level: 'Орташа',
        lead: 'Metro Boomin, Tay Keith немесе қазақстандық топ-продюсерлердің басты құпиясы қандай? <strong>Дыбыс таңдау (Sound Selection)!</strong> Нашар Kick-ті 2 сағат EQ-мен түзегенше, 10 секундта мықты Kick таңда.',
        blocks: [
          {
            heading: 'Дыбыстардың 4 негізгі көзі:',
            list: [
              '<strong>Drum Kits (Драм-киттер):</strong> Kick, 808, Snare, Clap, Hi-Hat WAV файлдары. DAW-дың стандартты (stock) драмдары көбіне ескірген — міндетті түрде заманауи Trap/Boom Bap/Drill драм-киттерін жина!',
              '<strong>VST плагиндер (Синтезаторлар):</strong> пианино, гитара, synth дыбыстарын беретін виртуалды аспаптар. Тегін PRO баламалар: <strong>Vital, Spitfire LABS, Surge XT, FLEX (FL Studio)</strong>.',
              '<strong>One-Shots (Бір ноталы сэмплдер):</strong> ауыр VST орнына жеңіл бір WAV нотаны Sampler-ге салып, бүкіл пианинода ойнау. Компьютеріңді мүлде қинамайды!',
              '<strong>Сэмплинг (Sampling):</strong> ескі джаз, соул, домбыра немесе дайын мелодия лупын кесіп (Chopping), жылдамдығын (Time-Stretch) және тональдігін (Pitch) өзгертіп, жаңа бит жасау!'
            ]
          }
        ],
        proTip: 'Қазақтың төл аспаптары (домбыра, қобыз, сыбызғы, жетіген) заманауи Trap 808 және Drill драмдарымен керемет үйлеседі! Бұл — сені бүкіл әлемде ерекшелейтін бірегей стиль (Ethno-Trap / Qazaq Sound).',
        mistake: 'Жаман дыбысты «сведение кезінде түзеп аламын» деп қалдырып кету. Ереже: «Қоқыс кірсе — қоқыс шығады». Сапалы дыбыс миксингті 10 есе оңайлатады.',
        task: {
          text: 'Төмендегі «Тегін DAW және плагиндер» тізімін қарап, компьютеріңе Vital мен Spitfire LABS сияқты тегін аспаптарды белгілеп ал.',
          actionLabel: 'Тегін ресурстар тізімін көру →',
          actionType: 'scroll',
          actionPayload: '#resources'
        }
      },
      {
        id: 'l6-2',
        code: '6.2',
        title: 'PRO деңгейге 5 есе жылдам шығу: Remake әдісі және Producer Tag',
        duration: '5 мин',
        level: 'Орташа',
        lead: 'Ең жылдам өсетін битмейкерлер теорияны жаттап қана қоймайды — олар хит тректерді <strong>1-ге 1 қайталап жинап (Remake)</strong> үйренеді.',
        blocks: [
          {
            heading: 'Remake (Көшірме жасау) — ең мықты жаттығу:',
            list: [
              '1. Сүйікті битіңді MP3 түрінде DAW-ға сал да, оның BPM-ін дәл тап.',
              '2. Бөлімдерді (Intro, Hook, Verse) маркермен белгілеп шық.',
              '3. Драмдарын, 808 басын және мелодиясын дәл солай қайталап жасап көр.',
              '4. 5–10 рет осындай Remake жасасаң, миың кәсіби құрылым мен качты автоматты түрде сіңіріп алады!'
            ]
          },
          {
            heading: 'Producer Tag (Продюсерлік қолтаңба)',
            paragraphs: [
              'Биттің басында естілетін қысқа дауыстық фраза (мысалы, «Metro Boomin want some more» сияқты) — сенің брендің әрі битіңді ұрланудан қорғайтын белгі. Оны телефон диктофонына да жазып, EQ (телефон эффектісі) + Delay + Reverb қосып керемет жасауға болады.'
            ]
          }
        ],
        proTip: 'Бастапқыда сапа емес, <strong>САН (Quantity)</strong> жеңеді! 1 битті 2 апта шұқылап отырма. Күніне 1 бит жаса да, келесісіне өт — 30-шы битің 1-шіден аспан мен жердей болады.',
        mistake: 'Алғашқы битім мінсіз болмады деп көңілді түсіру (Перфекционизм). Барлық әйгілі продюсерлердің алғашқы 50 биті нашар болған — айырмашылығы, олар тастап кетпеген.',
        task: {
          text: '30 күндік жоспар бөліміне өтіп, 1-аптаның алғашқы тапсырмаларын белгілеуді дәл бүгіннен баста!',
          actionLabel: '30 күндік жоспарға өту →',
          actionType: 'scroll',
          actionPayload: '#roadmap'
        }
      },
      {
        id: 'l6-3',
        code: '6.3',
        title: 'Биттерді қалай жариялау, артист табу және сату?',
        duration: '7 мин',
        level: 'PRO',
        lead: '3–6 ай тәжірибеден кейін биттерің жақсы шыға бастағанда, оларды тек компьютерде сақтамай, әлемге көрсетіп, табыс табуға болады.',
        blocks: [
          {
            heading: 'Бит сату лицензияларының 4 түрі:',
            table: {
              headers: ['Лицензия түрі', 'Не беріледі?', 'Шамамен бағасы & Ерекшелігі'],
              rows: [
                ['MP3 Lease', 'Тэгсіз MP3 файл', 'Ең арзан ($20–$35 / 10–15 мың ₸). Битті басқаларға да сата бересің.'],
                ['WAV Lease', 'Жоғары сапалы WAV файл', 'Ең көп сатылатыны ($35–$60 / 15–30 мың ₸). Стриминг шегі бар.'],
                ['Trackout (Stems)', 'Әр аспап бөлек WAV жолмен', 'Кәсіби сведение үшін ($80–$150 / 40–70 мың ₸).'],
                ['Exclusive Rights', 'Толық құқық (тек 1 артистке)', 'Ең қымбат ($250–$2000+). Сатқан соң бұл битті басқа ешкімге сатпайсың.']
              ]
            }
          },
          {
            heading: 'Клиентті қайдан табуға болады?',
            list: [
              '<strong>YouTube «Type Beats»:</strong> «[Танымал артист аты] Type Beat» форматымен аптасына 2–3 бит жүктеу (атауы, мұқабасы, SEO тэгтері таза болсын).',
              '<strong>BeatStars / Airbit:</strong> биттерді автоматты түрде келісімшартпен сататын халықаралық дүкендер.',
              '<strong>Instagram Reels / TikTok:</strong> битті қалай жасағаныңды (Cook-up видео, 15–30 секунд) түсіріп сал — жергілікті рэперлер мен әншілер өздері жазады!',
              '<strong>Нетворкинг (Тікелей байланыс):</strong> Қазақстандағы жас, өсіп келе жатқан артистерге жазып, олардың стиліне сай 2–3 үздік битіңді жібер (спам емес, шын ниетпен!).'
            ]
          }
        ],
        proTip: 'Бірінші табыстан бұрын <strong>қарым-қатынас</strong> құр. 1 мықты жас артистпен дос болып, бірге хит жасасаң — сені бүкіл индустрия таниды!',
        mistake: 'Алғашқы 2 аптада жасаған шикі биттерді «сатып ал» деп барлық рэперге спам жіберу. Алдымен сапаны көтер, сосын сенімді түрде ұсын.',
        task: {
          text: 'Осы сайттағы 10 сұрақтық Мини-Тестті тапсырып, битмейкинг негіздерін қаншалықты меңгергеніңді тексеріп көр!',
          actionLabel: 'Мини-Тестті тапсыру →',
          actionType: 'scroll',
          actionPayload: '#quiz'
        }
      }
    ]
  }
];

const ROADMAP_WEEKS = [
  {
    id: 'w1',
    badge: '1-АПТА (1–7 КҮН)',
    title: 'DAW & Ырғақ іргетасы',
    tasks: [
      { id: 't1', text: 'DAW орнату (FL Studio / Ableton / BandLab) және 5 негізгі терезені танып шығу' },
      { id: 't2', text: '1 сапалы тегін Drum Kit жүктеу және Browser-ге қосу' },
      { id: 't3', text: 'Күніне 1 драм-луптан 5 түрлі ырғақ жасау (Trap, Boom Bap, Drill, Lo-Fi)' },
      { id: 't4', text: 'Velocity (соққы күші) мен Hi-Hat roll жасауды тәжірибеде байқап көру' }
    ]
  },
  {
    id: 'w2',
    badge: '2-АПТА (8–14 КҮН)',
    title: 'Мелодия, Аккорд & 808',
    tasks: [
      { id: 't5', text: 'Piano Roll-да Scale Highlighting (Natural Minor) қосып үйрену' },
      { id: 't6', text: '0-3-7 (Minor) және 0-4-7 (Major) формуласымен 4 аккордты прогрессия құру' },
      { id: 't7', text: '808 басын «Cut Itself» қылып, аккордтың төменгі нотасымен үйлестіру' },
      { id: 't8', text: 'Алғашқы 3 қысқа бит (8–16 такт: Мелодия + Драм + 808) жасау' }
    ]
  },
  {
    id: 'w3',
    badge: '3-АПТА (15–21 КҮН)',
    title: 'Аранжировка & Миксинг',
    tasks: [
      { id: 't9', text: '«Алып тастау» әдісімен 8 тактылық лупты 2.5 минуттық толық трекке айналдыру' },
      { id: 't10', text: 'Ауысулар қосу: Riser, Crash және Drop алдында 1-2 соққылық пауза (Dropout)' },
      { id: 't11', text: 'Mixer-де Gain Staging жасау және мелодиядан 120 Hz-тен төмен Low-Cut кесу' },
      { id: 't12', text: 'Мастерге Soft Clipper/Limiter қойып, 3 толық битті WAV + MP3 қылып экспорттау' }
    ]
  },
  {
    id: 'w4',
    badge: '4-АПТА (22–30 КҮН)',
    title: 'Remake, Стиль & Алғашқы Релиз',
    tasks: [
      { id: 't13', text: 'Сүйікті 2 хит тректің битін басынан аяғына дейін Remake (қайталап) жасап көру' },
      { id: 't14', text: 'Өзіңе Producer Tag (қолтаңба) жазып, EQ + Delay + Reverb өңдеу' },
      { id: 't15', text: 'Сэмплингпен (немесе домбыра/этникалық дыбыспен) 1 бірегей бит құрастыру' },
      { id: 't16', text: 'Ең үздік 3 битіңді таңдап, YouTube/TikTok/Instagram-ға алғашқы жазбаңды салу!' }
    ]
  }
];

const TOP_MISTAKES = [
  {
    num: '01',
    title: '808 басын «Cut Itself» жасамау',
    bad: '❌ 808 ноталары бір-бірінің үстіне қабаттасып, түсініксіз гүрілге айналады.',
    fix: '✅ 808 каналында әрқашан Cut Itself (немесе Mono/Polyphony = 1) режимін қос.'
  },
  {
    num: '02',
    title: '808-ді мелодия кілтіне (Key) келтірмеу',
    bad: '❌ Мелодия C minor-да, ал 808 мүлде басқа нотада ойнап фальш береді.',
    fix: '✅ 808-ді аккордтың төменгі нотасымен (Root Note) жүргіз және алдымен жоғары октавада тексер.'
  },
  {
    num: '03',
    title: 'Мелодиядан төмен жиілікті кеспеу',
    bad: '❌ Пианиноның төменгі ноталары 808 баспен соқтығысып, бас әлсірейді.',
    fix: '✅ EQ-мен мелодиялардан 100–150 Hz-тен төмен жиілікті (Low-Cut) алып таста.'
  },
  {
    num: '04',
    title: 'Битті тым көп аспаппен толтырып тастау',
    bad: '❌ 10 түрлі синтезатор бір уақытта ойнаса, әншінің даусына мүлде орын қалмайды.',
    fix: '✅ «Аз — бірақ дәл» қағидасы. 2–3 сапалы мелодия қабаты мен мықты драм жеткілікті.'
  },
  {
    num: '05',
    title: 'Ескі стандартты драмдарды қолдану',
    bad: '❌ DAW ішіндегі әдепкі 2005 жылғы Kick/Snare битті әуесқой қылып көрсетеді.',
    fix: '✅ Заманауи, таза Trap/Drill/Boom Bap Drum Kit-терді жүктеп, өз таңдаулы папкаңды жина.'
  },
  {
    num: '06',
    title: 'Бүкіл битті 8 тактылық луп күйінде қалдыру',
    bad: '❌ 3 минут бойы бір нәрсе өзгеріссіз қайталана берсе, ешкім тыңдамайды.',
    fix: '✅ Әр 4–8 такт сайын аспап қосып/алып таста, пауза мен Riser жаса.'
  },
  {
    num: '07',
    title: 'Дыбысты қатты шығарып миксинг жасау',
    bad: '❌ Құлақ 15 минутта шаршап, басты дұрыс естімей қаласың (құлаққа да зиян).',
    fix: '✅ Орташа және ақырын дыбыста миксинг жаса, әр 45 минут сайын 5 минут үзіліс ал.'
  },
  {
    num: '08',
    title: 'Басқалардың трегімен салыстырмау (Reference Track)',
    bad: '❌ Өз битіңді 2 сағат тыңдаған соң құлақ үйреніп, қателерін байқамай қаласың.',
    fix: '✅ Жобаға өзіңе ұнайтын дайын хит тректі салып, дыбыс балансын сонымен салыстырып отыр.'
  },
  {
    num: '09',
    title: 'Жобаны сақтамау (Ctrl + S ұмыту)',
    bad: '❌ 3 сағат жасаған ең мықты битің бағдарлама ілініп қалғанда өшіп кетеді.',
    fix: '✅ Автосақтауды (Autosave — әр 5 мин) қос және әр қадам сайын Ctrl+S бас!'
  },
  {
    num: '10',
    title: 'Қымбат плагин сатып алсам PRO болам деп ойлау',
    bad: '❌ 50 плагин орнатып, бірде-бірін дұрыс білмеу — уақыт жоғалту.',
    fix: '✅ 3–4 құралды (EQ, Compressor, Reverb, 1 Synth) терең меңгерген адам кез келген хит жасай алады.'
  }
];

const FREE_RESOURCES = [
  {
    category: 'ТЕГІН DAW БАҒДАРЛАМАЛАР',
    title: 'Бастауға арналған 0 теңгелік студиялар',
    desc: 'FL Studio Trial (шектеусіз уақыт, экспорт бар), BandLab (браузерде толық тегін), GarageBand (Mac/iPad үшін тегін), Cakewalk / Waveform Free.',
    tags: ['FL Studio Trial', 'BandLab', 'GarageBand', 'Waveform Free']
  },
  {
    category: 'ТЕГІН СИНТЕЗАТОРЛАР (VST)',
    title: 'PRO сападағы виртуалды аспаптар',
    desc: 'Vital (ақылы Serum-ның тегін баламасы), Spitfire LABS (керемет пианино, скрипка, пэдтер), Surge XT, Decent Sampler, FL Studio FLEX.',
    tags: ['Vital Synth', 'Spitfire LABS', 'Surge XT', 'Decent Sampler']
  },
  {
    category: 'ТЕГІН МИКСИНГ ПЛАГИНДЕРІ',
    title: 'Таза сведение және мастерингке',
    desc: 'TDR Nova (динамикалық EQ), Valhalla Supermassive (ғарыштық Reverb/Delay), Xfer OTT (компрессор), Voxengo SPAN (жиілік анализаторы), Fresh Air.',
    tags: ['TDR Nova', 'Valhalla Supermassive', 'OTT', 'Voxengo SPAN']
  },
  {
    category: 'ДРАМ-КИТТЕР & СЭМПЛДЕР',
    title: 'Сапалы дыбыстарды қайдан алуға болады?',
    desc: 'Cymatics Free Packs (тегін trap/lofi киттер), Reddit r/Drumkits қауымдастығы, Looperman (тегін роялти-фри луптар), Freesound (FX дыбыстар).',
    tags: ['Cymatics Free', 'r/Drumkits', 'Looperman', 'Freesound']
  },
  {
    category: 'КҮНДЕЛІКТІ ЖАТТЫҒУ',
    title: 'Құлақты дамыту және шабыт',
    desc: 'YouTube-та «How [Артист] beat was made» (Deconstructed) видеоларын көр, күн сайын 15 минут пианинода аккорд теріп жаттық.',
    tags: ['Deconstructed', 'Remake', 'Ear Training', '1 Beat/Day']
  },
  {
    category: 'БИТ САТУ ПЛАТФОРМАЛАРЫ',
    title: 'Алғашқы тыңдарман мен клиенттер',
    desc: 'YouTube (Type Beats каналы), BeatStars (тегін тарифте 10 битке дейін сатуға болады), Instagram Reels, TikTok және SoundCloud.',
    tags: ['YouTube', 'BeatStars', 'TikTok', 'Instagram Reels']
  }
];

const QUIZ_QUESTIONS = [
  {
    q: '1. Trap жанрының классикалық BPM (темп) диапазоны қандай?',
    options: ['60 – 75 BPM', '85 – 95 BPM', '130 – 160 BPM', '180 – 210 BPM'],
    correct: 2,
    explain: 'Trap көбіне 130–160 BPM диапазонында Half-Time (екі есе баяу сезім) стилінде жазылады.'
  },
  {
    q: '2. 16-қадамды драм-машинада Trap битінің негізгі Clap/Snare қай қадамға қойылады?',
    options: ['1-қадамда', '5-ші және 13-қадамда', '9-қадамда (3-соққы)', '16-қадамда'],
    correct: 2,
    explain: 'Trap-та (Half-time) негізгі Clap/Snare дәл 3-соққыға, яғни 9-қадамға қойылады! Ал 5 және 13-қадам — Boom Bap пен House-қа тән.'
  },
  {
    q: '3. 808 бастың ноталары бір-бірімен қабаттасып «балшық» болмауы үшін нені қосу керек?',
    options: ['Reverb 100%', 'Cut Itself (Monophonic)', 'Stereo Widener', 'Delay'],
    correct: 1,
    explain: 'Cut Itself қосылғанда, жаңа 808 нотасы соққан сәтте алдыңғы 808 дыбысы бірден өшіп, бас тап-таза шығады.'
  },
  {
    q: '4. Minor (мұңды) аккордын Piano Roll-да жарты тонмен санап құру формуласы қандай?',
    options: ['0 — 4 — 7', '0 — 3 — 7', '0 — 2 — 5', '0 — 5 — 9'],
    correct: 1,
    explain: 'Minor аккорд = 0 — 3 — 7 жарты тон! Ал 0 — 4 — 7 — бұл Major (көңілді) аккорд.'
  },
  {
    q: '5. 808 басы мелодиямен фальшсыз үйлесуі үшін қай ноталармен жүруі керек?',
    options: ['Кез келген ақ пернемен', 'Әр аккордтың төменгі нотасымен (Root Notes)', 'Тек C нотасымен', 'Ең жоғарғы октавамен'],
    correct: 1,
    explain: '808 бас әрдайым аккорд прогрессиясының негізгі (төменгі) ноталарымен — Root Notes бойынша жүруі керек.'
  },
  {
    q: '6. Мелодия 808 баспен соқтығыспауы үшін мелодияға қандай EQ фильтрін қоямыз?',
    options: ['Low-Cut (High-Pass) ~100–150 Hz', '60 Hz-ті +12 dB көтеру', 'Барлық жоғарғы жиілікті өшіру', 'EQ мүлде керек емес'],
    correct: 0,
    explain: 'Low-Cut (High-Pass) фильтрі мелодиядағы артық төмен жиілікті кесіп, 808 бен Kick-ке таза орын босатады.'
  },
  {
    q: '7. UK / NY Drill битін басқа жанрлардан бірден ажырататын басты белгі?',
    options: ['Тек пианино ойнайды', 'Екінші Snare 13-те емес, кешігіп (15-қадамда) соғады', 'BPM 70 болады', 'Hi-Hat мүлде болмайды'],
    correct: 1,
    explain: 'Drill-дің атақты синкопалы качы — Snare-дің 9-қадамда және кешігіп 15-қадамда (немесе 12-де) соғуында!'
  },
  {
    q: '8. Kick соққан сәтте 808 бастың дыбысын автоматты түрде аздап басып тұратын техника қалай аталады?',
    options: ['Quantize', 'Sidechain', 'Arpeggio', 'Time-Stretch'],
    correct: 1,
    explain: 'Sidechain компрессиясы Kick-ке жол ашып, 808-бен төмен жиіліктегі соқтығысты жояды.'
  },
  {
    q: '9. Миксинг кезінде қай аспаптар міндетті түрде ортада (MONO) тұруы керек?',
    options: ['Hi-Hat және Pad', 'Kick және 808 Bass', 'Reverb және FX', 'Counter-Melody'],
    correct: 1,
    explain: 'Kick пен 808 (барлық 150 Hz-тен төмен дыбыстар) қуатын жоғалтпау үшін ортада (MONO) болуы тиіс.'
  },
  {
    q: '10. Студияға немесе артистке битті сатуға жібергенде ең сапалы аудио формат қандай?',
    options: ['MP3 128 kbps', 'WAV 24-bit / 44.1 kHz', 'OGG', 'MIDI ғана'],
    correct: 1,
    explain: 'WAV (24-bit, 44.1 kHz) — сығылмаған, ең таза студиялық формат. MP3 (320 kbps) тек алдын ала тыңдатуға жарайды.'
  }
];

const GLOSSARY = [
  { term: 'DAW', cat: 'basics', def: 'Digital Audio Workstation — музыка жазатын бағдарлама (FL Studio, Ableton Live, Logic Pro, BandLab).' },
  { term: 'BPM', cat: 'rhythm', def: 'Beats Per Minute — минутына соққы саны, яғни биттің жылдамдығы (темпі).' },
  { term: 'Bar (Такт)', cat: 'rhythm', def: '4/4 өлшемінде 4 негізгі соққыдан (16 қадамнан) тұратын музыкалық бөлік.' },
  { term: 'Pattern (Паттерн)', cat: 'basics', def: 'Бір бөлек драм немесе мелодия үзіндісі. Паттерндерден толық трек жиналады.' },
  { term: 'Piano Roll', cat: 'melody', def: 'Мелодия, аккорд және 808 ноталарын тінтуірмен сызатын виртуалды пернетақта терезесі.' },
  { term: 'VST / Plugin', cat: 'basics', def: 'DAW-ға қосылатын виртуалды аспап (синтезатор) немесе дыбыс өңдейтін эффект (EQ, Reverb).' },
  { term: '808 Bass', cat: 'rhythm', def: 'Roland TR-808 драм-машинасынан шыққан, қазіргі Trap/Hip-Hop-тың басты терең суб-басы.' },
  { term: 'Kick (Бочка)', cat: 'rhythm', def: 'Драм-партиядағы төменгі жиілікті, соққылы бас-барабан.' },
  { term: 'Snare / Clap', cat: 'rhythm', def: 'Ырғақтың ортаңғы акцентін ұстайтын кіші барабан (Snare) және шапалақ (Clap).' },
  { term: 'Hi-Hat (CH / OH)', cat: 'rhythm', def: 'Ырғаққа жылдамдық пен кач беретін жабық (Closed) және ашық (Open) тарелка дыбысы.' },
  { term: 'Bounce / Groove', cat: 'rhythm', def: 'Тыңдағанда басты еріксіз шайқататын биттің ішкі ырғақтық «качы».' },
  { term: 'Swing', cat: 'rhythm', def: 'Жұп ноталарды тордан сәл кешіктіріп, робот емес, тірі әрі жұмсақ ырғақ жасау.' },
  { term: 'Velocity', cat: 'rhythm', def: 'Әр нотаның немесе барабан соққысының басылу күші (динамикасы).' },
  { term: 'Quantize (Квантайз)', cat: 'rhythm', def: 'Қолмен қисық ойнаған ноталарды автоматты түрде ырғақ торына (Grid) туралау.' },
  { term: 'Half-Time', cat: 'rhythm', def: 'Жоғары BPM-де (140) екі есе баяу сезілетіндей етіп Clap-ты 3-соққыға қою тәсілі (Trap негізі).' },
  { term: 'Scale (Гамма)', cat: 'melody', def: 'Бір-бірімен фальшсыз үйлесетін 7 нотаның жиынтығы (мысалы, C Natural Minor).' },
  { term: 'Root Note', cat: 'melody', def: 'Гамманың немесе аккордтың негізгі (түбір) нотасы. 808 бас осы нотамен жүреді.' },
  { term: 'Chord (Аккорд)', cat: 'melody', def: 'Бір уақытта ойнап, гармония мен эмоция беретін 3 немесе одан көп нота.' },
  { term: 'Inversion (Инверсия)', cat: 'melody', def: 'Аккорд ноталарын басқа октаваға ауыстырып, әдемі әрі тегіс дыбысталуын алу.' },
  { term: 'Counter-Melody', cat: 'melody', def: 'Негізгі мелодияны толықтырып, Қайырмада энергияны арттыратын қосымша әуен.' },
  { term: 'Layering (Қабаттау)', cat: 'melody', def: 'Екі немесе үш аспапты (мысалы, пианино + пэд) бір нотамен қабаттап, қалың дыбыс алу.' },
  { term: 'Cut Itself', cat: 'rhythm', def: 'Жаңа нота ойнағанда алдыңғы дыбысты дереу өшіретін режим (808 бас үшін міндетті!).' },
  { term: 'Sample (Сэмпл)', cat: 'basics', def: 'Дайын аудио үзінді (мелодия лупы, вокал кесіндісі немесе драм соққысы).' },
  { term: 'One-Shot', cat: 'basics', def: 'Тек бір рет ойнайтын қысқа дыбыс файлы (1 нота пианино, 1 Kick, 1 Snare).' },
  { term: 'Loop (Луп)', cat: 'basics', def: 'Тоқтаусыз шеңбер бойымен қайталанатын 4 немесе 8 тактылық музыкалық үзінді.' },
  { term: 'Gain Staging', cat: 'mixing', def: 'Микшердегі барлық аспаптардың дыбыс деңгейін бұрмаланбайтындай (клиппингсіз) теңестіру.' },
  { term: 'EQ (Эквалайзер)', cat: 'mixing', def: 'Дыбыстағы төмен, ортаңғы және жоғарғы жиіліктерді кесетін не көтеретін негізгі құрал.' },
  { term: 'Low-Cut / High-Pass', cat: 'mixing', def: 'Белгілі бір нүктеден (мысалы 120 Hz) төменгі артық басты кесіп тастайтын EQ фильтрі.' },
  { term: 'Sidechain', cat: 'mixing', def: 'Бір дыбыс (Kick) соққанда екінші дыбыстың (808) қаттылығын автоматты түрде азайту.' },
  { term: 'Panning (Панорама)', cat: 'mixing', def: 'Дыбысты сол немесе оң құлаққа (Left / Right) орналастырып, стерео кеңістік ашу.' },
  { term: 'Reverb & Delay', cat: 'mixing', def: 'Reverb — бөлме/зал жаңғырығы, Delay — дыбыстың ырғақпен қайталануы (эхо).' },
  { term: 'Soft Clipper', cat: 'mixing', def: '0 dB-ден асқан соққыларды жұмсақ кесіп, битке қанық әрі қатты Trap дыбысын беретін плагин.' },
  { term: 'Headroom', cat: 'mixing', def: 'Микстің ең биік нүктесі мен 0 dB арасындағы бос қор (мастеринг пен вокалға қажет).' },
  { term: 'Stems / Trackout', cat: 'business', def: 'Биттің әр аспабы (Kick, 808, Melody бөлек) жеке-жеке WAV файл ретінде экспортталған пакеті.' },
  { term: 'Lease (Лизинг)', cat: 'business', def: 'Битті бірнеше артистке шектеулі құқықпен қайта-қайта сату лицензиясы.' },
  { term: 'Producer Tag', cat: 'business', def: 'Биттің басында продюсердің атын танытатын қысқа дауыстық қолтаңба.' }
];


// ----- js/drum-machine.js -----
// =========================================================
// BEATLAB KZ — Interactive 16-Step Drum Machine Sequencer
// High-precision Web Audio Lookahead Scheduler + Visualizer
// =========================================================


const TRACKS = [
  { id: '808',   name: '808 BASS',  color: '#ff4769', glow: 'rgba(255, 71, 105, 0.45)', gain: 0.95 },
  { id: 'kick',  name: 'KICK',      color: '#ff8c24', glow: 'rgba(255, 140, 36, 0.45)', gain: 1.0  },
  { id: 'clap',  name: 'CLAP',      color: '#f5c542', glow: 'rgba(245, 197, 66, 0.42)', gain: 0.85 },
  { id: 'snare', name: 'SNARE',     color: '#00e5a0', glow: 'rgba(0, 229, 160, 0.42)',  gain: 0.85 },
  { id: 'ch',    name: 'HI-HAT CH', color: '#28d8f0', glow: 'rgba(40, 216, 240, 0.42)', gain: 0.72 },
  { id: 'oh',    name: 'OPEN HAT',  color: '#8b6cff', glow: 'rgba(139, 108, 255, 0.42)', gain: 0.65 },
  { id: 'perc',  name: 'PERC / RIM',color: '#ff70c8', glow: 'rgba(255, 112, 200, 0.42)', gain: 0.7  }
];

const DRUM_PRESETS = {
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

function initDrumMachine() {
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


// ----- js/piano-lab.js -----
// =========================================================
// BEATLAB KZ — Interactive Piano, Scale & Chord Lab
// 2-Octave Keyboard, Scale Highlighting, Chord Formulas
// =========================================================


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

function initPianoLab() {
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


// ----- js/arrangement-eq.js -----
// =========================================================
// BEATLAB KZ — Interactive Arrangement Blueprint & EQ Map
// =========================================================


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

function initArrangement() {
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

function initEqVisualizer() {
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


// ----- js/fl-studio-guide.js -----
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

function initFlStudioGuide() {
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


// ----- js/app.js -----
// =========================================================
// BEATLAB KZ — Main Application Controller
// =========================================================






const STORAGE_LESSONS = 'beatlab_completed_lessons_v1';
const STORAGE_ROADMAP = 'beatlab_roadmap_tasks_v1';

// Toast helper
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
}

// LocalStorage helpers
function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function saveSet(key, setObj) {
  try {
    localStorage.setItem(key, JSON.stringify([...setObj]));
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize interactive studios
  const drumApi = initDrumMachine();
  const pianoApi = initPianoLab();
  initArrangement();
  const eqApi = initEqVisualizer();
  initFlStudioGuide();

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  mobileBtn.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    mobileBtn.setAttribute('aria-expanded', String(open));
  });
  mainNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Hero quick-jump drum presets
  document.querySelectorAll('[data-jump-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.jumpPreset;
      document.getElementById('drum-studio').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        drumApi.loadPreset(preset, true);
        showToast(`🎧 ${preset.toUpperCase()} пресеті қосылды!`);
      }, 350);
    });
  });

  // =========================================================
  // 1. Curriculum Renderer & Progress Tracking
  // =========================================================
  const completedLessons = loadSet(STORAGE_LESSONS);
  const allLessonsFlat = CURRICULUM.flatMap((m, mIdx) =>
    m.lessons.map((l, lIdx) => ({ moduleIdx: mIdx, lessonIdx: lIdx, id: l.id }))
  );

  let activeModuleIdx = 0;
  let activeLessonIdx = 0;

  const moduleTabsEl = document.getElementById('moduleTabs');
  const lessonSidebarEl = document.getElementById('lessonSidebar');
  const lessonReaderEl = document.getElementById('lessonReader');
  const headerProgressText = document.getElementById('headerProgressText');
  const progressStatusTitle = document.getElementById('progressStatusTitle');
  const progressStatusSubtitle = document.getElementById('progressStatusSubtitle');
  const progressCounter = document.getElementById('progressCounter');
  const courseProgressFill = document.getElementById('courseProgressFill');

  function updateProgressUI() {
    const total = allLessonsFlat.length;
    const done = completedLessons.size;
    const pct = Math.round((done / total) * 100);

    headerProgressText.textContent = `${done} / ${total} сабақ`;
    progressCounter.textContent = `${done} / ${total}`;
    courseProgressFill.style.width = `${pct}%`;
    progressStatusTitle.textContent = `Оқу прогресі: ${pct}%`;

    if (done === 0) {
      progressStatusSubtitle.textContent = '1-модуль, 1-сабақтан баста — барлығы оңай түсіндірілген.';
    } else if (pct < 40) {
      progressStatusSubtitle.textContent = 'Керемет бастама! Ырғақ пен драмдарды тәжірибеде байқап отыр.';
    } else if (pct < 80) {
      progressStatusSubtitle.textContent = 'Жарты жолдан астың! Енді толық аранжировка мен миксингті меңгер.';
    } else if (done < total) {
      progressStatusSubtitle.textContent = 'PRO деңгейге бір қадам қалды — соңғы сабақтарды аяқта!';
    } else {
      progressStatusSubtitle.textContent = '🏆 ҚҰТТЫҚТАЙМЫЗ! Толық курсты бітірдің — енді күн сайын бит жаз!';
    }
  }

  function renderModuleTabs() {
    moduleTabsEl.innerHTML = '';
    CURRICULUM.forEach((mod, idx) => {
      const doneInMod = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      btn.className = 'module-tab' + (idx === activeModuleIdx ? ' active' : '');
      btn.setAttribute('aria-selected', String(idx === activeModuleIdx));
      btn.innerHTML = `
        <span class="module-tab-num">
          <span>МОДУЛЬ ${mod.number}</span>
          <span class="module-tab-done">${doneInMod}/${mod.lessons.length}</span>
        </span>
        <span class="module-tab-title">${mod.shortTitle}</span>
      `;
      btn.addEventListener('click', () => {
        activeModuleIdx = idx;
        activeLessonIdx = 0;
        renderCurriculum();
      });
      moduleTabsEl.appendChild(btn);
    });
  }

  function renderLessonSidebar() {
    const mod = CURRICULUM[activeModuleIdx];
    lessonSidebarEl.innerHTML = `
      <div class="sidebar-module-head">
        <span>МОДУЛЬ ${mod.number}</span>
        <h3>${mod.title}</h3>
        <p>${mod.summary}</p>
      </div>
    `;

    mod.lessons.forEach((lesson, idx) => {
      const isDone = completedLessons.has(lesson.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lesson-btn' + (idx === activeLessonIdx ? ' active' : '') + (isDone ? ' completed' : '');
      btn.innerHTML = `
        <span class="lesson-check-icon">${isDone ? '✓' : lesson.code}</span>
        <span class="lesson-btn-meta">
          <strong>${lesson.title}</strong>
          <span>${lesson.duration} • ${lesson.level}</span>
        </span>
      `;
      btn.addEventListener('click', () => {
        activeLessonIdx = idx;
        renderCurriculum();
      });
      lessonSidebarEl.appendChild(btn);
    });
  }

  function renderBlocksHtml(blocks) {
    return blocks.map((b) => {
      let inner = `<h4>${b.heading}</h4>`;
      if (b.paragraphs) {
        inner += b.paragraphs.map((p) => `<p>${p}</p>`).join('');
      }
      if (b.list) {
        inner += `<ul class="lesson-list">${b.list.map((li) => `<li>${li}</li>`).join('')}</ul>`;
      }
      if (b.table) {
        inner += `
          <div class="lesson-table-wrap">
            <table class="lesson-table">
              <thead><tr>${b.table.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${b.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      return `<div class="lesson-block">${inner}</div>`;
    }).join('');
  }

  function handleTaskAction(task) {
    if (task.actionType === 'drum') {
      document.getElementById('drum-studio').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        drumApi.loadPreset(task.actionPayload || 'trap', false);
        showToast('🥁 Драм-машина дайын! ОЙНАТУ батырмасын бас.');
      }, 350);
    } else if (task.actionType === 'piano') {
      document.getElementById('piano-lab').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        pianoApi.configure(task.actionPayload || {});
        showToast('🎹 Пианино бапталды!');
      }, 350);
    } else if (task.actionType === 'arrangement') {
      document.getElementById('arrangement').scrollIntoView({ behavior: 'smooth' });
    } else if (task.actionType === 'eq') {
      document.getElementById('mixing').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        eqApi.selectProfile(task.actionPayload || '808');
      }, 300);
    } else if (task.actionType === 'scroll' && task.actionPayload) {
      const target = document.querySelector(task.actionPayload);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderLessonReader() {
    const mod = CURRICULUM[activeModuleIdx];
    const lesson = mod.lessons[activeLessonIdx];
    const isDone = completedLessons.has(lesson.id);
    const flatIdx = allLessonsFlat.findIndex((item) => item.id === lesson.id);

    const levelBadgeClass = lesson.level === 'PRO'
      ? 'badge-violet'
      : lesson.level === 'Орташа'
        ? 'badge-amber'
        : 'badge-emerald';

    lessonReaderEl.innerHTML = `
      <div class="lesson-top-meta">
        <span class="badge badge-amber">САБАҚ ${lesson.code}</span>
        <span class="badge ${levelBadgeClass}">${lesson.level}</span>
        <span class="mono-label">⏱ Оқу уақыты: ${lesson.duration}</span>
      </div>
      <h3 class="lesson-heading">${lesson.title}</h3>
      <p class="lesson-lead">${lesson.lead}</p>

      ${renderBlocksHtml(lesson.blocks)}

      <div class="callout callout-pro">
        <div class="callout-title">🔥 PRO МЕНТОР КЕҢЕСІ</div>
        <p>${lesson.proTip}</p>
      </div>

      <div class="callout callout-warn">
        <div class="callout-title">⚠️ ЖАҢАДАН БАСТАУШЫНЫҢ ҚАТЕСІ</div>
        <p>${lesson.mistake}</p>
      </div>

      <div class="callout callout-task">
        <div class="callout-title">🎯 ПРАКТИКАЛЫҚ ТАПСЫРМА</div>
        <p>${lesson.task.text}</p>
        ${lesson.task.actionLabel ? `<button type="button" class="task-action-btn" id="lessonTaskActionBtn">${lesson.task.actionLabel}</button>` : ''}
      </div>

      <div class="lesson-footer">
        <button type="button" class="btn-complete ${isDone ? 'is-done' : ''}" id="toggleCompleteBtn">
          ${isDone ? '✓ Сабақ аяқталды (Қайтару)' : '✓ Сабақты аяқтадым деп белгілеу'}
        </button>

        <div class="lesson-nav-btns">
          <button type="button" class="btn-ghost" id="prevLessonBtn" ${flatIdx <= 0 ? 'disabled' : ''}>← Алдыңғы</button>
          <button type="button" class="btn-ghost" id="nextLessonBtn" ${flatIdx >= allLessonsFlat.length - 1 ? 'disabled' : ''}>Келесі сабақ →</button>
        </div>
      </div>
    `;

    const actionBtn = document.getElementById('lessonTaskActionBtn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => handleTaskAction(lesson.task));
    }

    document.getElementById('toggleCompleteBtn').addEventListener('click', () => {
      if (completedLessons.has(lesson.id)) {
        completedLessons.delete(lesson.id);
        showToast('Белгі алынды');
      } else {
        completedLessons.add(lesson.id);
        showToast(`✓ Сабақ ${lesson.code} аяқталды! Жарайсың!`);
      }
      saveSet(STORAGE_LESSONS, completedLessons);
      renderCurriculum();
    });

    document.getElementById('prevLessonBtn').addEventListener('click', () => {
      if (flatIdx > 0) {
        const prev = allLessonsFlat[flatIdx - 1];
        activeModuleIdx = prev.moduleIdx;
        activeLessonIdx = prev.lessonIdx;
        renderCurriculum();
        document.getElementById('curriculum').scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('nextLessonBtn').addEventListener('click', () => {
      if (flatIdx < allLessonsFlat.length - 1) {
        const next = allLessonsFlat[flatIdx + 1];
        activeModuleIdx = next.moduleIdx;
        activeLessonIdx = next.lessonIdx;
        renderCurriculum();
        document.getElementById('curriculum').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function renderCurriculum() {
    updateProgressUI();
    renderModuleTabs();
    renderLessonSidebar();
    renderLessonReader();
  }

  renderCurriculum();

  // =========================================================
  // 2. 30-Day Roadmap Checklist
  // =========================================================
  const completedRoadmap = loadSet(STORAGE_ROADMAP);
  const roadmapGrid = document.getElementById('roadmapGrid');

  function renderRoadmap() {
    roadmapGrid.innerHTML = '';
    ROADMAP_WEEKS.forEach((week) => {
      const card = document.createElement('div');
      card.className = 'week-card';
      const doneCount = week.tasks.filter((t) => completedRoadmap.has(t.id)).length;

      card.innerHTML = `
        <div>
          <span class="week-badge">${week.badge} • ${doneCount}/${week.tasks.length}</span>
          <h3>${week.title}</h3>
        </div>
        <ul class="week-tasks">
          ${week.tasks.map((t) => {
            const checked = completedRoadmap.has(t.id);
            return `
              <li class="week-task-item ${checked ? 'done' : ''}">
                <label>
                  <input type="checkbox" data-task-id="${t.id}" ${checked ? 'checked' : ''} />
                  <span>${t.text}</span>
                </label>
              </li>
            `;
          }).join('')}
        </ul>
      `;

      card.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener('change', () => {
          const tid = cb.dataset.taskId;
          if (cb.checked) {
            completedRoadmap.add(tid);
            showToast('🔥 Тапсырма орындалды!');
          } else {
            completedRoadmap.delete(tid);
          }
          saveSet(STORAGE_ROADMAP, completedRoadmap);
          renderRoadmap();
        });
      });

      roadmapGrid.appendChild(card);
    });
  }
  renderRoadmap();

  // =========================================================
  // 3. Top 10 Mistakes & Free Resources
  // =========================================================
  const mistakesGrid = document.getElementById('mistakesGrid');
  mistakesGrid.innerHTML = TOP_MISTAKES.map((m) => `
    <div class="mistake-card">
      <div class="mistake-top">
        <span class="mistake-num">#${m.num}</span>
        <h4>${m.title}</h4>
      </div>
      <p class="mistake-bad">${m.bad}</p>
      <p class="mistake-fix">${m.fix}</p>
    </div>
  `).join('');

  const resourcesGrid = document.getElementById('resourcesGrid');
  resourcesGrid.innerHTML = FREE_RESOURCES.map((r) => `
    <div class="resource-card">
      <span class="resource-cat">${r.category}</span>
      <h4>${r.title}</h4>
      <p>${r.desc}</p>
      <div class="resource-tags">
        ${r.tags.map((tag) => `<span class="resource-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');

  // =========================================================
  // 4. Interactive Quiz (10 Questions)
  // =========================================================
  const quizContainer = document.getElementById('quizContainer');
  const quizScoreBadge = document.getElementById('quizScoreBadge');
  let quizIdx = 0;
  let quizScore = 0;
  let quizAnswered = false;

  function renderQuiz() {
    quizScoreBadge.textContent = `Ұпай: ${quizScore} / ${QUIZ_QUESTIONS.length}`;

    if (quizIdx >= QUIZ_QUESTIONS.length) {
      let rank = '🎧 Жас Талант';
      let msg = 'Жақсы бастама! Сабақтарды тағы бір шолып шығып, тесті қайта тапсырып көр.';
      if (quizScore >= 9) {
        rank = '🏆 PRO БИТМЕЙКЕР';
        msg = 'Ғажап нәтиже! Сен битмейкингтің барлық басты ережелерін жетік білесің. Енді DAW ашып, хиттер жаса!';
      } else if (quizScore >= 6) {
        rank = '🔥 Студия Шебері';
        msg = 'Мықты деңгей! Негізін жақсы түсіндің, енді күнделікті тәжірибемен шыңдай бер.';
      }

      quizContainer.innerHTML = `
        <div style="text-align:center;padding:18px 0;">
          <div class="badge badge-emerald" style="font-size:0.95rem;padding:8px 18px;margin-bottom:12px;">${rank}</div>
          <h4 style="font-family:var(--font-display);font-size:1.5rem;margin:0 0 8px;">Нәтижең: ${quizScore} / ${QUIZ_QUESTIONS.length}</h4>
          <p style="color:var(--text-2);max-width:540px;margin:0 auto 20px;">${msg}</p>
          <button type="button" class="btn btn-primary" id="restartQuizBtn">Тесті қайта тапсыру</button>
        </div>
      `;
      document.getElementById('restartQuizBtn').addEventListener('click', () => {
        quizIdx = 0;
        quizScore = 0;
        quizAnswered = false;
        renderQuiz();
      });
      return;
    }

    const item = QUIZ_QUESTIONS[quizIdx];
    quizAnswered = false;

    quizContainer.innerHTML = `
      <div class="mono-label" style="margin-bottom:8px;">СҰРАҚ ${quizIdx + 1} / ${QUIZ_QUESTIONS.length}</div>
      <h4 class="quiz-q-title">${item.q}</h4>
      <div class="quiz-options">
        ${item.options.map((opt, idx) => `<button type="button" class="quiz-opt" data-opt="${idx}">${opt}</button>`).join('')}
      </div>
      <div class="quiz-feedback hidden" id="quizFeedback"></div>
      <button type="button" class="btn btn-secondary hidden" id="quizNextBtn">
        ${quizIdx === QUIZ_QUESTIONS.length - 1 ? 'Нәтижені көру →' : 'Келесі сұрақ →'}
      </button>
    `;

    const optBtns = quizContainer.querySelectorAll('.quiz-opt');
    const feedbackEl = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('quizNextBtn');

    optBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;
        const chosen = Number(btn.dataset.opt);
        const isCorrect = chosen === item.correct;

        if (isCorrect) {
          quizScore++;
          btn.classList.add('correct');
          feedbackEl.innerHTML = `<strong style="color:#00e5a0;">✓ Дұрыс!</strong> ${item.explain}`;
        } else {
          btn.classList.add('wrong');
          optBtns[item.correct].classList.add('correct');
          feedbackEl.innerHTML = `<strong style="color:#ff7c95;">✕ Қате.</strong> ${item.explain}`;
        }

        optBtns.forEach((b) => { b.disabled = true; });
        quizScoreBadge.textContent = `Ұпай: ${quizScore} / ${QUIZ_QUESTIONS.length}`;
        feedbackEl.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
      });
    });

    nextBtn.addEventListener('click', () => {
      quizIdx++;
      renderQuiz();
    });
  }
  renderQuiz();

  // =========================================================
  // 5. Searchable Producer Glossary
  // =========================================================
  const glossarySearch = document.getElementById('glossarySearch');
  const glossaryFilters = document.querySelectorAll('#glossaryFilters .filter-pill');
  const glossaryGrid = document.getElementById('glossaryGrid');

  const CAT_LABELS = {
    basics: 'Негіздер',
    rhythm: 'Ырғақ',
    melody: 'Мелодия',
    mixing: 'Миксинг',
    business: 'Бизнес'
  };

  let activeGlossaryCat = 'all';
  let glossaryQuery = '';

  function renderGlossary() {
    const q = glossaryQuery.trim().toLowerCase();
    const filtered = GLOSSARY.filter((item) => {
      const catMatch = activeGlossaryCat === 'all' || item.cat === activeGlossaryCat;
      const textMatch = !q || item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q);
      return catMatch && textMatch;
    });

    if (filtered.length === 0) {
      glossaryGrid.innerHTML = `<p style="color:var(--text-3);grid-column:1/-1;">«${glossaryQuery}» бойынша термин табылмады.</p>`;
      return;
    }

    glossaryGrid.innerHTML = filtered.map((item) => `
      <div class="glossary-card">
        <div class="glossary-card-head">
          <span class="glossary-term">${item.term}</span>
          <span class="glossary-cat">${CAT_LABELS[item.cat] || item.cat}</span>
        </div>
        <p>${item.def}</p>
      </div>
    `).join('');
  }

  glossarySearch.addEventListener('input', (e) => {
    glossaryQuery = e.target.value;
    renderGlossary();
  });

  glossaryFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeGlossaryCat = btn.dataset.cat;
      glossaryFilters.forEach((b) => b.classList.toggle('active', b === btn));
      renderGlossary();
    });
  });

  renderGlossary();
});

})();
