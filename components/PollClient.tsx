'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BasketSVG from './BasketSVG';
import { BABY_LAST_NAME, DAD_NAME, MOM_NAME } from '@/lib/config';

type Message = { name: string; message: string; created_at: string };
type Sticker = { id: number; rotation: number; name: string };
type FlyingFace = {
  id: number;
  side: 'boy' | 'girl';
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
} | null;

const MAX_STICKERS = 15;

const BOY = {
  bg: 'from-[#FFF0EA] to-[#FFE5D8]',
  accent: '#FF6634',   // orange — button bg
  text: '#CC4A20',     // orange-dark — own-side text
  border: '#FFB39B',
  ring: '#FFD5C3',
  bannerBg: '#FFF0EA',
  bannerBorder: '#FFB39B',
} as const;

const GIRL = {
  bg: 'from-[#FFCEEB] to-[#FFE8F4]',
  accent: '#D4548A',   // pink — button bg
  text: '#B84476',     // pink-dark — own-side text
  border: '#FFAAD4',
  ring: '#FFC5E4',
  bannerBg: '#FFCEEB',
  bannerBorder: '#FFAAD4',
} as const;

// All visible color on boy side uses GIRL colors; girl side uses BOY colors
const BOY_TEXT   = GIRL.text;    // #B84476 — pink text on orange bg
const BOY_COUNT  = GIRL.accent;  // #D4548A
const BOY_BTN    = GIRL.accent;  // #D4548A — pink button on orange bg
const GIRL_TEXT  = BOY.text;     // #CC4A20 — orange text on pink bg
const GIRL_COUNT = BOY.accent;   // #FF6634
const GIRL_BTN   = BOY.accent;   // #FF6634 — orange button on pink bg

function FlyingFaceAnim({ face, onDone }: { face: NonNullable<FlyingFace>; onDone: () => void }) {
  const { side, startX, startY, endX, endY } = face;
  const src = side === 'boy' ? '/dad.jpg' : '/mom.jpg';
  const midY = Math.min(startY, endY) - 160;
  const borderColor = side === 'boy' ? BOY.border : GIRL.border;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: startX - 60,
        top: startY - 60,
        width: 120,
        height: 120,
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
        border: `4px solid ${borderColor}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}
      animate={{
        x: [0, (endX - startX) * 0.5, endX - startX],
        y: [0, midY - startY, endY - startY],
        scale: [1, 1.05, 0.3],
        rotate: [0, -8, 15],
      }}
      transition={{ duration: 0.72, times: [0, 0.42, 1], ease: ['easeOut', 'easeIn'] }}
      onAnimationComplete={onDone}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
    </motion.div>
  );
}

function StickerPile({ stickers, src, alt }: { stickers: Sticker[]; src: string; alt: string }) {
  const [activeTip, setActiveTip] = useState<number | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTip = (id: number) => {
    if (tipTimer.current) clearTimeout(tipTimer.current);
    setActiveTip(id);
    tipTimer.current = setTimeout(() => setActiveTip(null), 1800);
  };

  return (
    <div className="relative w-44 h-28" style={{ overflow: 'visible' }}>
      {stickers.map((s, i) => (
        <div
          key={s.id}
          className="group absolute"
          onClick={() => showTip(s.id)}
          style={{
            bottom: `${Math.floor(i / 5) * 30 + 4}px`,
            left: `${8 + (i % 5) * 34}px`,
            width: 34,
            height: 34,
            zIndex: i + 1,
            cursor: 'pointer',
          }}
        >
          {/* Tooltip — visible on hover (desktop) or tap (mobile) */}
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
              bg-gray-900/85 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full
              whitespace-nowrap pointer-events-none transition-opacity duration-150
              ${activeTip === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ zIndex: 100 }}
          >
            {s.name}
          </div>

          {/* Face circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.25, 1], opacity: 1 }}
            transition={{ duration: 0.35, times: [0, 0.55, 1], ease: 'easeOut' }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              rotate: `${s.rotation}deg`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default function PollClient() {
  const [name, setName] = useState('');
  const [msgText, setMsgText] = useState('');
  const [boyCount, setBoyCount] = useState(0);
  const [girlCount, setGirlCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [flyingFace, setFlyingFace] = useState<FlyingFace>(null);
  const [boyStickers, setBoyStickers] = useState<Sticker[]>([]);
  const [girlStickers, setGirlStickers] = useState<Sticker[]>([]);
  const [myVote, setMyVote] = useState<'boy' | 'girl' | null>(null);
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const noteSentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dadRef = useRef<HTMLDivElement>(null);
  const momRef = useRef<HTMLDivElement>(null);
  const boyBasketRef = useRef<HTMLDivElement>(null);
  const girlBasketRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return;
      const data = await res.json();
      setBoyCount(data.boyCount ?? 0);
      setGirlCount(data.girlCount ?? 0);
      setMessages(data.messages ?? []);
    } catch {
      // silently ignore polling errors
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Restore vote state from localStorage whenever the name changes
  useEffect(() => {
    const key = name.trim().toLowerCase();
    if (!key) { setMyVote(null); return; }
    const stored = localStorage.getItem(`bbvote_${key}`);
    setMyVote(stored === 'boy' || stored === 'girl' ? stored : null);
  }, [name]);

  const fireConfetti = useCallback(async (side: 'boy' | 'girl') => {
    const confetti = (await import('canvas-confetti')).default;
    const colors = side === 'boy'
      ? ['#FF6634', '#FF8C65', '#FFB39B', '#FF4500', '#ffffff']
      : ['#FFCEEB', '#FF9DD3', '#D4548A', '#FFB3D9', '#ffffff'];
    confetti({ particleCount: 130, spread: 80, colors, origin: { y: 0.55, x: side === 'boy' ? 0.25 : 0.75 }, gravity: 0.9 });
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!name.trim()) { setNameError('Please enter your name first!'); return; }
    if (!msgText.trim()) return;
    setNameError('');

    // Optimistic: show message immediately
    const optimistic = { name: name.trim(), message: msgText.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [optimistic, ...prev]);
    setMsgText('');
    if (noteSentTimer.current) clearTimeout(noteSentTimer.current);
    setNoteSent(true);
    noteSentTimer.current = setTimeout(() => setNoteSent(false), 2500);

    try {
      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: optimistic.message }),
      });
      await fetchData(); // reconcile with server
    } catch {
      // silently ignore; optimistic message stays visible
    }
  }, [name, msgText, fetchData]);

  const handleChangeVote = useCallback(async (newSide: 'boy' | 'girl') => {
    const oldSide = newSide === 'boy' ? 'girl' : 'boy';
    setLoading(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), vote: newSide, force: true }),
      });
      const data = await res.json();
      if (!data.updated && !data.alreadyVoted === false) return;

      // Persist updated vote
      localStorage.setItem(`bbvote_${name.trim().toLowerCase()}`, newSide);
      setMyVote(newSide);

      // Optimistic count swap
      if (oldSide === 'boy') setBoyCount(prev => Math.max(0, prev - 1));
      else setGirlCount(prev => Math.max(0, prev - 1));
      if (newSide === 'boy') setBoyCount(prev => prev + 1);
      else setGirlCount(prev => prev + 1);

      // Arc animation to new basket
      const faceEl = newSide === 'boy' ? dadRef.current : momRef.current;
      const basketEl = newSide === 'boy' ? boyBasketRef.current : girlBasketRef.current;
      if (faceEl && basketEl) {
        const fr = faceEl.getBoundingClientRect();
        const br = basketEl.getBoundingClientRect();
        nextId.current += 1;
        setFlyingFace({
          id: nextId.current, side: newSide, name: name.trim(),
          startX: fr.left + fr.width / 2, startY: fr.top + fr.height / 2,
          endX: br.left + br.width / 2, endY: br.top + br.height / 2,
        });
      }

      setTimeout(() => fireConfetti(newSide), 380);
      await fetchData();
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [name, dadRef, momRef, boyBasketRef, girlBasketRef, fetchData, fireConfetti]);

  const handleVote = useCallback(async (side: 'boy' | 'girl') => {
    if (!name.trim()) { setNameError('Please enter your name first!'); return; }
    setNameError('');
    setLoading(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), vote: side, message: msgText.trim() }),
      });
      const data = await res.json();

      if (data.alreadyVoted) {
        // Sync localStorage with what the server knows
        localStorage.setItem(`bbvote_${name.trim().toLowerCase()}`, data.existingVote);
        setMyVote(data.existingVote);
        fetchData();
        return;
      }

      // Persist vote
      localStorage.setItem(`bbvote_${name.trim().toLowerCase()}`, side);
      setMyVote(side);

      // Optimistic: increment count immediately
      if (side === 'boy') setBoyCount(prev => prev + 1);
      else setGirlCount(prev => prev + 1);

      // Optimistic: show message immediately if provided
      const trimmedMsg = msgText.trim();
      if (trimmedMsg) {
        setMessages(prev => [{
          name: name.trim(),
          message: trimmedMsg,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }

      const faceEl = side === 'boy' ? dadRef.current : momRef.current;
      const basketEl = side === 'boy' ? boyBasketRef.current : girlBasketRef.current;
      if (faceEl && basketEl) {
        const fr = faceEl.getBoundingClientRect();
        const br = basketEl.getBoundingClientRect();
        nextId.current += 1;
        setFlyingFace({
          id: nextId.current, side, name: name.trim(),
          startX: fr.left + fr.width / 2, startY: fr.top + fr.height / 2,
          endX: br.left + br.width / 2, endY: br.top + br.height / 2,
        });
      }

      setMsgText('');
      setTimeout(() => fireConfetti(side), 380);
      await fetchData(); // reconcile with server
    } catch {
      setNameError('Something went wrong. Please try again!');
    } finally {
      setLoading(false);
    }
  }, [name, msgText, fetchData, fireConfetti]);

  const onFlyDone = useCallback(() => {
    if (!flyingFace) return;
    const { side, name: voterName } = flyingFace;
    const sticker: Sticker = { id: nextId.current, rotation: Math.random() * 38 - 19, name: voterName };
    if (side === 'boy') setBoyStickers(prev => prev.length < MAX_STICKERS ? [...prev, sticker] : prev);
    else setGirlStickers(prev => prev.length < MAX_STICKERS ? [...prev, sticker] : prev);
    setFlyingFace(null);
  }, [flyingFace]);

  const total = boyCount + girlCount;
  const boyPct = total === 0 ? 50 : Math.round((boyCount / total) * 100);
  const girlPct = 100 - boyPct;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fef9f0' }}>
      <AnimatePresence>
        {flyingFace && <FlyingFaceAnim key={flyingFace.id} face={flyingFace} onDone={onFlyDone} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <header
        className="text-center py-5 sm:py-8 px-4 shadow-sm"
        style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }}
      >
        <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-1" style={{ color: BOY.accent }}>
          🍃 A Baby is on the Way 🍃
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 leading-tight">
          Baby {BABY_LAST_NAME}
        </h1>
        <p className="text-lg sm:text-2xl font-bold text-gray-500 mt-0.5">Boy or Girl?</p>

        {/* Split bar */}
        <div className="mt-4 mx-auto max-w-xs sm:max-w-sm h-4 sm:h-5 rounded-full overflow-hidden flex shadow-inner bg-gray-100">
          <motion.div
            style={{ background: BOY.accent, height: '100%' }}
            animate={{ width: `${boyPct}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          <motion.div
            style={{ background: GIRL.accent, height: '100%' }}
            animate={{ width: `${girlPct}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>
        <div className="flex justify-between max-w-xs sm:max-w-sm mx-auto text-xs font-semibold mt-1 px-1">
          <span style={{ color: BOY.text }}>🌿 Boy {boyPct}%</span>
          <span style={{ color: GIRL.text }}>Girl {girlPct}% 🪸</span>
        </div>
      </header>

      {/* ── Input section ── */}
      <section className="py-4 sm:py-6 px-4 flex flex-col items-center gap-2 sm:gap-3">
        <div className="w-full max-w-md flex flex-col gap-2 sm:gap-3">
          <div>
            <input
              type="text"
              placeholder="Your name (required)"
              value={name}
              onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }}
              // text-base = 16px, prevents iOS auto-zoom on focus
              className={`w-full text-base px-4 py-3 rounded-2xl border-2 bg-white shadow-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors ${
                nameError ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {nameError && <p className="text-red-500 text-sm mt-1.5 ml-1">{nameError}</p>}
          </div>
          <div className="relative">
            <textarea
              placeholder={`Leave a note for ${DAD_NAME} & ${MOM_NAME} — press Enter to send`}
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={3}
              // text-base = 16px, prevents iOS auto-zoom on focus
              className="w-full text-base px-4 py-3 pb-12 rounded-2xl border-2 border-gray-200 focus:outline-none bg-white shadow-sm text-gray-800 placeholder:text-gray-400 resize-none transition-colors"
            />
            {/* Send button inside textarea, bottom-right */}
            <button
              onClick={handleSendMessage}
              disabled={!msgText.trim()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white shadow transition-all disabled:opacity-30 active:scale-95"
              style={{ background: noteSent ? '#22c55e' : BOY.accent }}
            >
              {noteSent ? '✓ Sent!' : 'Send note 💌'}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {myVote && name.trim() && (
            <motion.div
              key="voted"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full rounded-2xl px-4 py-3 text-sm shadow-sm border"
              style={{
                background: myVote === 'boy' ? BOY.bannerBg : GIRL.bannerBg,
                borderColor: myVote === 'boy' ? BOY.bannerBorder : GIRL.bannerBorder,
                color: myVote === 'boy' ? BOY.text : GIRL.text,
              }}
            >
              <p>
                <strong>{name.trim()}</strong> voted{' '}
                <strong>{myVote === 'boy' ? 'Boy 🌿' : 'Girl 🪸'}</strong>! 🎉
              </p>
              <button
                onClick={() => handleChangeVote(myVote === 'boy' ? 'girl' : 'boy')}
                disabled={loading}
                className="mt-1.5 text-xs font-bold underline underline-offset-2 disabled:opacity-40"
                style={{ color: myVote === 'boy' ? GIRL.accent : BOY.accent }}
              >
                Changed your mind? Switch to {myVote === 'boy' ? 'Girl 🪸' : 'Boy 🌿'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Split screen ── */}
      <div className="flex flex-col md:flex-row flex-1">

        {/* ─ Boy ─ */}
        <div className={`flex-1 bg-gradient-to-b ${BOY.bg} flex flex-col items-center py-6 sm:py-10 px-4 sm:px-6 gap-3 sm:gap-5`}>
          {/* Text uses GIRL colors for contrast on orange bg */}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: BOY_TEXT }}>Boy 🌿</h2>

          <div
            ref={dadRef}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-xl"
            style={{ border: `4px solid ${BOY.border}`, outline: `4px solid ${BOY.ring}`, outlineOffset: '0px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dad.jpg" alt={DAD_NAME} className="w-full h-full object-cover object-[25%_top]" />
          </div>
          <p className="font-bold text-base sm:text-lg -mt-1 sm:-mt-2" style={{ color: BOY_TEXT }}>{DAD_NAME}</p>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleVote('boy')}
            disabled={loading || !!myVote}
            className="px-8 sm:px-10 py-3 sm:py-3.5 text-white font-black text-base sm:text-lg rounded-full shadow-lg disabled:opacity-40 active:opacity-80"
            style={{ background: BOY_BTN }}
          >
            {myVote === 'boy' ? '✓ Your vote' : 'Boy 🌿'}
          </motion.button>

          <div className="relative w-44" ref={boyBasketRef}>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
              <StickerPile stickers={boyStickers} src="/dad.jpg" alt={DAD_NAME} />
            </div>
            <BasketSVG />
          </div>

          <div className="text-center -mt-2 sm:-mt-3">
            <motion.span
              key={boyCount}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl sm:text-5xl font-black block"
              style={{ color: BOY_COUNT }}
            >
              {boyCount}
            </motion.span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: BOY_TEXT }}>
              {boyCount === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex w-px" style={{ background: `linear-gradient(to bottom, ${BOY.border}, #e5d5c5, ${GIRL.border})` }} />
        <div className="md:hidden h-px" style={{ background: `linear-gradient(to right, ${BOY.border}, #e5d5c5, ${GIRL.border})` }} />

        {/* ─ Girl ─ */}
        <div className={`flex-1 bg-gradient-to-b ${GIRL.bg} flex flex-col items-center py-6 sm:py-10 px-4 sm:px-6 gap-3 sm:gap-5`}>
          {/* Text uses BOY colors for contrast on pink bg */}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: GIRL_TEXT }}>Girl 🪸</h2>

          <div
            ref={momRef}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-xl"
            style={{ border: `4px solid ${GIRL.border}`, outline: `4px solid ${GIRL.ring}`, outlineOffset: '0px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mom.jpg" alt={MOM_NAME} className="w-full h-full object-cover object-top" />
          </div>
          <p className="font-bold text-base sm:text-lg -mt-1 sm:-mt-2" style={{ color: GIRL_TEXT }}>{MOM_NAME}</p>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleVote('girl')}
            disabled={loading || !!myVote}
            className="px-8 sm:px-10 py-3 sm:py-3.5 text-white font-black text-base sm:text-lg rounded-full shadow-lg disabled:opacity-40 active:opacity-80"
            style={{ background: GIRL_BTN }}
          >
            {myVote === 'girl' ? '✓ Your vote' : 'Girl 🪸'}
          </motion.button>

          <div className="relative w-44" ref={girlBasketRef}>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
              <StickerPile stickers={girlStickers} src="/mom.jpg" alt={MOM_NAME} />
            </div>
            <BasketSVG />
          </div>

          <div className="text-center -mt-2 sm:-mt-3">
            <motion.span
              key={girlCount}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl sm:text-5xl font-black block"
              style={{ color: GIRL_COUNT }}
            >
              {girlCount}
            </motion.span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: GIRL_TEXT }}>
              {girlCount === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Message wall ── */}
      <section className="py-8 sm:py-10 px-4 border-t border-amber-100" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <h2 className="text-xl sm:text-2xl font-black text-center text-gray-700 mb-5 sm:mb-6">
          💌 Notes for {DAD_NAME} & {MOM_NAME}
        </h2>
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No messages yet — be the first to leave one!</p>
        ) : (
          <div className="max-w-2xl mx-auto grid gap-3 sm:gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={`${m.name}-${m.created_at}-${i}`}
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-amber-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: i % 2 === 0 ? BOY.accent : GIRL.accent }}
                    >
                      {m.name[0].toUpperCase()}
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed italic pl-9">
                    &ldquo;{m.message}&rdquo;
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <footer className="py-3 text-center text-xs text-gray-400">
        Made with 💛 for Baby {BABY_LAST_NAME}
      </footer>
    </div>
  );
}
