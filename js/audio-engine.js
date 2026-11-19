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

export const audioEngine = new StudioAudioEngine();
