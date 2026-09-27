import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const RSVP_API = 'https://script.google.com/macros/s/AKfycbwvGEIx3en8flVLpmQ5dT70_cXF4W0jSg3MjaQGD_qrjb__EianQkkm-a00SEvDO_5R/exec';

const SCENES = [
  { id: 'hero-scene', src: './assets/01-hero.webp', alt: 'Nithin and Kusuma — Join our wedding reception', aspect: 941 / 1672 },
  { id: 'city-scene', src: './assets/02-charlotte.webp', alt: 'Charlotte, North Carolina — Where our story began', aspect: 941 / 1672 },
  { id: 'invitation-scene', src: './assets/03-invitation.webp', alt: 'Wedding reception invitation — January 9, 2027 at 7:00 PM', aspect: 941 / 1671 },
  { id: 'venue-scene', src: './assets/04-venue.webp', alt: 'Utsav Event Spaces — 5533 Westpark Drive, Charlotte, North Carolina', aspect: 941 / 1671 },
  { id: 'dress-scene', src: './assets/05-dress.webp', alt: 'Dress code — An Evening to Shine, Indian or Western attire', aspect: 941 / 1672 },
  { id: 'rsvp-scene', src: './assets/06-rsvp.webp', alt: 'RSVP form', aspect: 824 / 1908 },
];

function StarField() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const state = useRef({ stars: [], scrollY: 0, w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 768 ? 62 : 125;
      const stars = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.0,
        a: 0.16 + Math.random() * 0.42,
        depth: i % 3 === 0 ? 0.025 : i % 3 === 1 ? 0.055 : 0.095,
        tw: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      }));
      state.current = { ...state.current, stars, w, h };
    }

    function draw(t) {
      const { stars, w, h, scrollY } = state.current;
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      for (const s of stars) {
        const y = ((s.y - scrollY * s.depth) % h + h) % h;
        const twinkle = reduced ? 1 : 0.82 + Math.sin(time * s.tw + s.phase) * 0.10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,236,205,${Math.max(0.08, s.a * twinkle)})`;
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    build();
    const onResize = () => build();
    const onScroll = () => { state.current.scrollY = window.scrollY; };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" aria-hidden="true" />;
}

function ShootingStar() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer;

    const launch = () => {
      const x = 5 + Math.random() * 50;
      const y = 5 + Math.random() * 24;
      gsap.set(el, { left: `${x}%`, top: `${y}%`, opacity: 0, x: 0, y: 0, rotate: -28 });
      gsap.timeline()
        .to(el, { opacity: 0.62, duration: 0.10 })
        .to(el, { x: 180, y: 90, opacity: 0, duration: 0.9, ease: 'power2.out' });
      timer = window.setTimeout(launch, 14000 + Math.random() * 10000);
    };

    timer = window.setTimeout(launch, 5000);
    return () => window.clearTimeout(timer);
  }, []);

  return <div ref={ref} className="shooting-star" aria-hidden="true" />;
}

function Scene({ scene, index, children }) {
  return (
    <div
      id={scene.id}
      className="scene"
      style={{ '--scene-z': index + 1, '--scene-aspect': scene.aspect }}
    >
      <img className="scene-backdrop" src={scene.src} alt="" aria-hidden="true" draggable="false" />
      <div className="art-frame">
        <img
          className="section-art"
          src={scene.src}
          alt={scene.alt}
          draggable="false"
          loading={index < 2 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
        {children}
      </div>
      <div className="scene-vignette" />
    </div>
  );
}

function VenueHotspot({ enabled }) {
  return (
    <a
      className={`map-hotspot ${enabled ? 'is-enabled' : ''}`}
      href="https://www.google.com/maps/search/?api=1&query=5533+Westpark+Dr+Charlotte+NC+28217"
      target="_blank"
      rel="noreferrer"
      aria-label="Open Utsav Event Spaces in Google Maps"
      tabIndex={enabled ? 0 : -1}
    >
      <span className="sr-only">View map</span>
    </a>
  );
}

function RSVPOverlay({ enabled }) {
  const [attendance, setAttendance] = useState('Attending');
  const [guestName, setGuestName] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!guestName.trim()) {
      setStatus('error');
      setMessage('Please enter your name.');
      return;
    }

    setStatus('loading');
    setMessage('');
    const payload = {
      guestName: guestName.trim(),
      attendance,
      adults: attendance === 'Attending' ? Number(adults || 0) : 0,
      children: attendance === 'Attending' ? Number(children || 0) : 0,
      phone: phone.trim(),
      email: email.trim(),
    };

    try {
      try {
        const res = await fetch(RSVP_API, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        if (res.type !== 'opaque') {
          const json = await res.json().catch(() => null);
          if (json && json.success === false) throw new Error(json.message || 'Unable to save RSVP.');
        }
      } catch (firstError) {
        await fetch(RSVP_API, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
      }

      setStatus('success');
      setMessage(attendance === 'Attending'
        ? "You're on the list! We can't wait to celebrate with you in Charlotte."
        : "Thank you for letting us know. We'll miss having you there, and we truly appreciate your response.");
    } catch (error) {
      setStatus('error');
      setMessage(error?.message || 'We could not save your RSVP. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className={`rsvp-success ${enabled ? 'is-enabled' : ''}`} aria-live="polite">
        <div className="success-star">✦</div>
        <strong>{attendance === 'Attending' ? "You're on the list!" : 'Thank you!'}</strong>
        <p>{message}</p>
        <button type="button" onClick={() => setStatus('idle')}>Edit response</button>
      </div>
    );
  }

  return (
    <form className={`rsvp-overlay ${enabled ? 'is-enabled' : ''}`} onSubmit={submit} aria-label="Wedding reception RSVP">
      <div className="rsvp-choice-group" role="radiogroup" aria-label="Attendance">
        <label className={`rsvp-choice ${attendance === 'Attending' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="attendance"
            value="Attending"
            checked={attendance === 'Attending'}
            onChange={() => setAttendance('Attending')}
            tabIndex={enabled ? 0 : -1}
          />
          <span className="choice-dot" aria-hidden="true" />
          <span>I’ll be attending</span>
        </label>
        <label className={`rsvp-choice ${attendance === 'Not Attending' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="attendance"
            value="Not Attending"
            checked={attendance === 'Not Attending'}
            onChange={() => setAttendance('Not Attending')}
            tabIndex={enabled ? 0 : -1}
          />
          <span className="choice-dot" aria-hidden="true" />
          <span>I’m not attending</span>
        </label>
      </div>

      <div className="rsvp-field">
        <label htmlFor="guestName">Guest Name</label>
        <input
          id="guestName"
          className="rsvp-control"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          tabIndex={enabled ? 0 : -1}
        />
      </div>

      {attendance === 'Attending' && (
        <div className="rsvp-count-row">
          <div className="rsvp-field">
            <label htmlFor="adults">Adults</label>
            <select
              id="adults"
              className="rsvp-control"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              tabIndex={enabled ? 0 : -1}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="rsvp-field">
            <label htmlFor="children">Children</label>
            <select
              id="children"
              className="rsvp-control"
              value={children}
              onChange={(e) => setChildren(e.target.value)}
              tabIndex={enabled ? 0 : -1}
            >
              {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="rsvp-field">
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          className="rsvp-control"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          tabIndex={enabled ? 0 : -1}
        />
      </div>

      <div className="rsvp-field">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          className="rsvp-control"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="youremail@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          tabIndex={enabled ? 0 : -1}
        />
      </div>

      <button
        className="rsvp-submit"
        type="submit"
        disabled={!enabled || status === 'loading'}
        tabIndex={enabled ? 0 : -1}
      >
        {status === 'loading' ? 'SENDING…' : 'SUBMIT RSVP'}
      </button>

      {status === 'error' && <div className="rsvp-error" role="alert">{message}</div>}
    </form>
  );
}

function App() {
  const stageRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      SCENES.forEach((scene, i) => {
        gsap.set(`#${scene.id}`, {
          opacity: i === 0 ? 1 : 0,
          yPercent: 0,
          scale: 1,
          filter: i === 0 ? 'brightness(1)' : 'brightness(0.72)',
        });
      });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      if (reduced) {
        for (let i = 0; i < SCENES.length - 1; i++) {
          tl.to(`#${SCENES[i + 1].id}`, { opacity: 1, duration: 1 }, i)
            .to(`#${SCENES[i].id}`, { opacity: 0, duration: 1 }, i);
        }
      } else {
        for (let i = 0; i < SCENES.length - 1; i++) {
          const outgoing = `#${SCENES[i].id}`;
          const incoming = `#${SCENES[i + 1].id}`;
          const base = i;

          if (i === 4) {
            // Dress Code <-> RSVP: intentionally quicker and cleaner than the
            // cinematic chapter transitions. Because the master timeline is
            // scrubbed, the same crossfade runs identically in reverse when
            // scrolling from RSVP back to Dress Code.
            tl.to(incoming, {
              opacity: 1,
              yPercent: 0,
              filter: 'brightness(1)',
              duration: 0.30,
            }, base + 0.12);

            tl.to(outgoing, {
              opacity: 0,
              yPercent: 0,
              filter: 'brightness(0.82)',
              duration: 0.32,
            }, base + 0.14);
          } else {
            // Locked V5 transition model for story chapters: incoming becomes
            // visible first; outgoing only recedes after the next scene is present.
            tl.to(incoming, {
              opacity: 1,
              yPercent: 0,
              filter: 'brightness(1)',
              duration: 0.60,
            }, base + 0.14);

            tl.to(outgoing, {
              opacity: 0.88,
              filter: 'brightness(0.92)',
              duration: 0.18,
            }, base + 0.25);

            tl.to(outgoing, {
              opacity: 0.62,
              filter: 'brightness(0.78)',
              yPercent: -0.30,
              duration: 0.24,
            }, base + 0.43);

            tl.to(outgoing, {
              opacity: 0.34,
              filter: 'brightness(0.64)',
              yPercent: -0.55,
              duration: 0.22,
            }, base + 0.67);

            tl.to(outgoing, {
              opacity: 0.16,
              filter: 'brightness(0.54)',
              yPercent: -0.70,
              duration: 0.11,
            }, base + 0.89);

            tl.to(outgoing, {
              opacity: 0,
              duration: 0.10,
            }, base + 1.00);

            tl.to(`${incoming} .section-art`, {
              yPercent: -0.25,
              duration: 0.24,
            }, base + 0.76);
          }
        }

        // Hold the final RSVP view long enough to interact comfortably.
        tl.to({}, { duration: 0.90 });
      }

      ScrollTrigger.create({
        animation: tl,
        trigger: stageRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduced ? true : 0.72,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Interaction thresholds follow the actual overlap timeline rather than
          // dividing the page into equal chunks. The final RSVP becomes usable as
          // soon as it has visually taken over the viewport.
          const p = self.progress;
          const approx = p < 0.15 ? 0
            : p < 0.31 ? 1
            : p < 0.47 ? 2
            : p < 0.63 ? 3
            : p < 0.78 ? 4
            : 5;
          setActiveIndex((prev) => prev === approx ? prev : approx);
        },
      });
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="celestial-layer" aria-hidden="true">
        <StarField />
        <ShootingStar />
      </div>

      <main>
        <section ref={stageRef} className="story-stage" aria-label="Nithin and Kusuma wedding reception invitation">
          <div className="sticky-viewport">
            {SCENES.map((scene, index) => (
              <Scene key={scene.id} scene={scene} index={index}>
                {index === 3 && <VenueHotspot enabled={activeIndex === 3} />}
                {index === 5 && <>
                  <div className="rsvp-art-mask" aria-hidden="true" />
                  <RSVPOverlay enabled={activeIndex === 5} />
                </>}
              </Scene>
            ))}
            <div className="transition-atmosphere" aria-hidden="true" />
          </div>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
