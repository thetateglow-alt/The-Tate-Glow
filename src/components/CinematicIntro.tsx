import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, FastForward, Play, RefreshCw } from 'lucide-react';
import pureAtmosphereImg from '../assets/images/intro_scene_pure_atmosphere_1793118477459.jpg';
import necklaceMacroImg from '../assets/images/intro_scene_necklace_macro_1793118410677.jpg';
import ringSculptureImg from '../assets/images/intro_scene_ring_sculpture_1793118423962.jpg';
import cuffEarringsImg from '../assets/images/intro_scene_cuff_earrings_1793118445322.jpg';
import { BRAND_CONFIG } from '../data/products';
import { Language } from '../i18n/translations';

interface CinematicIntroProps {
  onComplete: () => void;
  lang?: Language;
}

type Scene = 'atmosphere' | 'reveal_necklace' | 'reveal_accessories' | 'signature' | 'transition';

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, lang = 'en' }) => {
  const [currentScene, setCurrentScene] = useState<Scene>('atmosphere');
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const TOTAL_DURATION_MS = 6800; // 6.8 seconds total cinematic experience

  // Preload images immediately
  useEffect(() => {
    const imagesToPreload = [pureAtmosphereImg, necklaceMacroImg, ringSculptureImg, cuffEarringsImg];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Web Audio API ambient sound generator (Quiet luxury drone & gentle chime)
  const initLuxuryAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  };

  const playAtmosphericChime = () => {
    if (!audioCtxRef.current || !masterGainRef.current || !isAudioEnabled) return;
    try {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Soft warm base drone (warm pad chord: D-minor / F-major luxury harmony)
      const freqs = [146.83, 220.0, 261.63, 329.63, 440.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035 / (idx + 1), now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(gain);
        gain.connect(masterGainRef.current!);
        osc.start(now);
        osc.stop(now + 4.8);
      });
    } catch (e) {
      // ignore
    }
  };

  const toggleAudio = () => {
    if (!isAudioEnabled) {
      initLuxuryAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
      }
      setIsAudioEnabled(true);
      playAtmosphericChime();
    } else {
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(0.0001, audioCtxRef.current.currentTime);
      }
      setIsAudioEnabled(false);
    }
  };

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Golden stardust particle system (Canvas 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      targetAlpha: number;
      goldTone: string;
      phase: number;
    }

    const goldTones = [
      'rgba(255, 230, 160, ',
      'rgba(240, 205, 120, ',
      'rgba(255, 245, 210, ',
      'rgba(215, 175, 85, '
    ];

    const particleCount = Math.min(window.innerWidth > 768 ? 65 : 35, 70);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.5 + 0.1,
      targetAlpha: Math.random() * 0.8 + 0.2,
      goldTone: goldTones[Math.floor(Math.random() * goldTones.length)],
      phase: Math.random() * Math.PI * 2
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.phase += 0.02;
        p.alpha = Math.sin(p.phase) * 0.35 + 0.45;

        // Wrap around bounds
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Soft radial glow for each gold speck
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        gradient.addColorStop(0, `${p.goldTone}${p.alpha})`);
        gradient.addColorStop(1, `${p.goldTone}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `${p.goldTone}${Math.min(1, p.alpha * 1.4)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Main master clock driving the 4 scenes
  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progressPercent = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);
      setProgress(progressPercent);

      // Choreographed Scene timings:
      // Scene 1: 0ms - 1700ms (The Atmosphere)
      // Scene 2A: 1700ms - 2900ms (The Reveal - Necklace)
      // Scene 2B: 2900ms - 3900ms (The Reveal - Dome Ring & Cuff/Earrings)
      // Scene 3: 3900ms - 5500ms (The Signature - The Taté Glow Logo & Shimmer)
      // Scene 4: 5500ms - 6800ms (The Transition - Forward Camera Glide & Dissolve)
      if (elapsed < 1700) {
        setCurrentScene('atmosphere');
      } else if (elapsed < 2900) {
        setCurrentScene('reveal_necklace');
      } else if (elapsed < 3900) {
        setCurrentScene('reveal_accessories');
      } else if (elapsed < 5500) {
        setCurrentScene('signature');
      } else {
        setCurrentScene('transition');
      }

      if (elapsed >= TOTAL_DURATION_MS) {
        triggerFinish();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const triggerFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic Brand Intro"
      className={`fixed inset-0 z-50 overflow-hidden bg-[#050506] select-none transition-opacity duration-700 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 16:9 Cinematic Container with responsive crop */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* ======================================================== */}
        {/* SCENE 1: THE ATMOSPHERE (Deep black & soft warm lighting)*/}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentScene === 'atmosphere' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={pureAtmosphereImg}
            alt="Pure Atmosphere"
            className="w-full h-full object-cover object-center scale-100 animate-subtle-float"
          />

          {/* Gentle ambient dark vignette overlay */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#050506]/30 to-[#050506]/85 pointer-events-none" />

          {/* Elegant Scene 1 Editorial Kicker */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-amber-200/60 font-light mb-2">
              The Essence of Quiet Luxury
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent my-3" />
            <p className="text-xs sm:text-sm font-serif italic text-stone-300 tracking-[0.2em] font-light max-w-sm">
              Where pure steel meets golden light.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCENE 2A: THE REVEAL — LIQUID HERRINGBONE NECKLACE       */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            currentScene === 'reveal_necklace'
              ? 'opacity-100 z-10 scale-100'
              : 'opacity-0 z-0 pointer-events-none scale-105'
          }`}
        >
          <img
            src={necklaceMacroImg}
            alt="Luxury Liquid Herringbone Necklace"
            className="w-full h-full object-cover object-center transition-transform duration-2000 ease-out scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-transparent to-[#050506]/70 pointer-events-none" />

          {/* Editorial Micro Caption */}
          <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-12 rtl:left-auto rtl:right-6 sm:rtl:right-12 z-20 pointer-events-none">
            <span className="text-[10px] tracking-[0.3em] uppercase text-amber-300/80 font-medium block">
              The Reveal · Capsule 01
            </span>
            <h2 className="text-lg sm:text-2xl font-serif text-white tracking-wide font-normal mt-0.5">
              Liquid Herringbone Chain
            </h2>
            <p className="text-[11px] text-stone-400 font-light tracking-wider mt-1">
              Pure Surgical Stainless Steel · Hand Mirror Polished
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCENE 2B: THE REVEAL — DOME RING & SCULPTURAL ACCENTS    */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            currentScene === 'reveal_accessories'
              ? 'opacity-100 z-10 scale-100'
              : 'opacity-0 z-0 pointer-events-none scale-105'
          }`}
        >
          {/* Split Screen / Dual Macro Showcase on desktop, elegant cross-fade on mobile */}
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-1/2 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-amber-500/10">
              <img
                src={ringSculptureImg}
                alt="Sculpted Dome Signet Ring"
                className="w-full h-full object-cover object-center transition-transform duration-2000 ease-out scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 rtl:left-auto rtl:right-6 pointer-events-none">
                <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-amber-200/70 font-light">
                  Sculptural Form
                </span>
                <p className="text-sm sm:text-base font-serif text-stone-100">Dome Signet Ring</p>
              </div>
            </div>

            <div className="relative h-1/2 md:h-full overflow-hidden">
              <img
                src={cuffEarringsImg}
                alt="Faceted Cuff & Hoops"
                className="w-full h-full object-cover object-center transition-transform duration-2000 ease-out scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 rtl:left-auto rtl:right-6 pointer-events-none">
                <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-amber-200/70 font-light">
                  Architectural Accents
                </span>
                <p className="text-sm sm:text-base font-serif text-stone-100">Faceted Arc Cuff & Hoops</p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCENE 3 & 4: THE SIGNATURE & SEAMLESS TRANSITION         */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-out flex items-center justify-center ${
            currentScene === 'signature' || currentScene === 'transition'
              ? 'opacity-100 z-20'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Subtle dark backdrop with soft golden light cone */}
          <div className="absolute inset-0 bg-[#050506]/90 backdrop-blur-xs" />
          
          {/* Subtle golden ambient aura breathing behind logo */}
          <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-amber-500/10 blur-3xl animate-gold-halo pointer-events-none" />

          {/* Sweeping diagonal light beam */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-[200%] h-40 bg-gradient-to-r from-transparent via-amber-200/15 to-transparent -rotate-45 transform -translate-x-full -translate-y-full animate-light-beam" />
          </div>

          {/* EXACT BRAND LOGO & SIGNATURE MOMENT */}
          <div
            className={`relative z-30 text-center px-6 max-w-2xl transform transition-transform duration-1000 ease-out ${
              currentScene === 'transition' ? 'scale-[1.08] opacity-90' : 'scale-100 opacity-100'
            }`}
          >
            {/* Signature Emblem: Interlocking Luxury Aura Ring with TG Monogram */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 relative flex items-center justify-center">
              {/* Outer delicate faceted golden ring */}
              <div className="absolute inset-0 rounded-full border border-amber-300/40 animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute inset-1 rounded-full border border-amber-200/20" />
              
              {/* Monogram emblem */}
              <svg className="w-10 h-10 text-amber-200/90" viewBox="0 0 100 100" fill="none">
                {/* Geometric radiant jewelry star */}
                <circle cx="50" cy="50" r="42" stroke="url(#goldGradient)" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="32" stroke="url(#goldGradient)" strokeWidth="1.2" />
                <path d="M50 12 L50 88 M12 50 L88 50" stroke="url(#goldGradient)" strokeWidth="0.8" strokeOpacity="0.4" />
                <path d="M26 26 L74 74 M26 74 L74 26" stroke="url(#goldGradient)" strokeWidth="0.8" strokeOpacity="0.25" />
                {/* Center stylized TG luxury initial */}
                <text
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fill="url(#goldGradient)"
                  fontFamily="'Cormorant Garamond', Georgia, serif"
                  fontSize="24"
                  fontWeight="600"
                  letterSpacing="2"
                >
                  TG
                </text>
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF4D0" />
                    <stop offset="40%" stopColor="#E5C77B" />
                    <stop offset="70%" stopColor="#C99E41" />
                    <stop offset="100%" stopColor="#FFF8E5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* EXACT BRAND NAME: The Taté Glow */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-[0.22em] sm:tracking-[0.25em] font-medium uppercase text-metallic-gold animate-shimmer-sweep drop-shadow-sm">
              The Taté Glow
            </h1>

            {/* Subtle Divider Hairline */}
            <div className="flex items-center justify-center gap-3 my-4 sm:my-5">
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-amber-200/50" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-300/80" />
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-amber-200/50" />
            </div>

            {/* EXACT SLOGAN: Your Daily Dose of Glow */}
            <p className="text-xs sm:text-sm tracking-[0.35em] sm:tracking-[0.4em] uppercase text-stone-300/90 font-light">
              Your Daily Dose of Glow
            </p>

            {/* Final Transition Prompt */}
            {currentScene === 'transition' && (
              <div className="mt-8 transition-opacity duration-500 opacity-90 animate-pulse">
                <span className="text-[10px] tracking-[0.3em] uppercase text-amber-200/70">
                  Entering Boutique...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE FLOATING GOLDEN PARTICLES (CANVAS)           */}
        {/* ======================================================== */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-25"
          aria-hidden="true"
        />

        {/* ======================================================== */}
        {/* TOP CONTROLS: AUDIO TOGGLE & SKIP BUTTON                 */}
        {/* ======================================================== */}
        <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between text-xs text-stone-300">
          {/* Brand mark mini whisper */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-light">
              Haute Joaillerie
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/60 hover:bg-stone-800/80 border border-stone-700/60 text-stone-300 text-[11px] tracking-wider transition-colors cursor-pointer backdrop-blur-md"
              title={isAudioEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">Audio Off</span>
                </>
              )}
            </button>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900/80 hover:bg-amber-950/40 border border-amber-300/30 hover:border-amber-300/60 text-stone-200 hover:text-amber-200 text-[11px] uppercase tracking-[0.2em] font-medium transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <span>Skip Intro</span>
              <FastForward className="w-3 h-3 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM TIMELINE & CHAPTER INDICATORS                     */}
        {/* ======================================================== */}
        <div className="absolute bottom-6 left-6 right-6 z-40 flex flex-col items-center gap-2">
          {/* Subtle Chapter Tabs */}
          <div className="flex items-center gap-6 sm:gap-10 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-stone-500 font-light">
            <span className={currentScene === 'atmosphere' ? 'text-amber-300 font-normal' : ''}>
              01 Atmosphere
            </span>
            <span className="text-stone-700">·</span>
            <span className={currentScene.startsWith('reveal') ? 'text-amber-300 font-normal' : ''}>
              02 The Reveal
            </span>
            <span className="text-stone-700">·</span>
            <span className={currentScene === 'signature' ? 'text-amber-300 font-normal' : ''}>
              03 The Signature
            </span>
          </div>

          {/* Minimalist Progress Line */}
          <div className="w-full max-w-md h-[1px] bg-stone-800/80 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
