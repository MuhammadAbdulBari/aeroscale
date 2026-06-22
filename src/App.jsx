import React, { useState, useEffect, useRef } from 'react';
import logoSymbol from '../logo_symbol.png';

// ─────────────────────────────────────────────────────────
// Interactive Particle Canvas Component with Mouse Repulsion
// ─────────────────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero-section');
    if (!hero) return;

    let particles = [];
    let rafId;

    const resize = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };

    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.vx = (Math.random() - 0.5) * 0.28;
        this.vy = -(Math.random() * 0.38 + 0.14);
        this.baseVx = this.vx;
        this.baseVy = this.vy;
        this.r = Math.random() * 1.5 + 0.4;
        this.life = 0;
        this.maxLife = Math.random() * 220 + 140;
        this.color = Math.random() > 0.5 ? '2,195,154' : '59,130,246'; // Teal or Blue
      }
      update() {
        // Mouse Repulsion logic
        if (mouseRef.current.active && mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = this.x - mouseRef.current.x;
          const dy = this.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 120;

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius; // 0 to 1
            const dirX = dx / dist;
            const dirY = dy / dist;
            const pushMultiplier = 0.8;
            
            // Apply gentle acceleration away from cursor
            this.x += dirX * force * pushMultiplier;
            this.y += dirY * force * pushMultiplier;
          }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y < -10) this.reset();
      }
      draw() {
        const t = this.life / this.maxLife;
        const alpha = Math.sin(t * Math.PI) * (isDark() ? 0.75 : 0.35);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${alpha})`;
        ctx.fill();
      }
    }

    const COUNT = window.innerWidth < 768 ? 45 : 90;

    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(2,195,154,${(1 - dist / 100) * (isDark() ? 0.18 : 0.07)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw();
      }
      rafId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resize();
      particles.forEach((p) => {
        p.x = Math.random() * canvas.width;
      });
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    hero.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="particle-canvas" ref={canvasRef}></canvas>;
};

// ─────────────────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────────────────
function App() {
  const THEME_KEY = 'aeroscale-theme';
  
  // Theme state setup
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) return stored;
    } catch (e) {}
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  const [isThemeSwitching, setIsThemeSwitching] = useState(false);

  // Layout states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Typing cursor
  const [showCursor, setShowCursor] = useState(true);
  const [cursorOpacity, setCursorOpacity] = useState(1);

  // Form handling
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formService, setFormService] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState({ show: false, type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive dashboard comparison tab
  const [comparisonMetric, setComparisonMetric] = useState('speed'); // speed | hours | conversions

  // 1. Theme handler
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  // System theme preference listener
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e) => {
      try {
        if (!localStorage.getItem(THEME_KEY)) {
          setThemeState(e.matches ? 'light' : 'dark');
        }
      } catch (err) {}
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    setIsThemeSwitching(true);
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    setTimeout(() => setIsThemeSwitching(false), 400);
  };

  // 2. Scroll event handling (Sticky Header & Progress Bar)
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. Scroll Reveal Animation Setup (Intersection Observer)
  useEffect(() => {
    const revealEls = document.querySelectorAll(
      '.fade-in, .fade-in-left, .fade-in-right, .fade-in-scale'
    );

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    const timer = setTimeout(() => {
      revealEls.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('reveal');
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      revealEls.forEach((el) => revealObserver.unobserve(el));
    };
  }, []);

  // 4. Navigation highlights
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.4, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((s) => navObserver.observe(s));

    return () => {
      sections.forEach((s) => navObserver.unobserve(s));
    };
  }, []);

  // 5. Button click ripples
  useEffect(() => {
    const handleRipple = (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    };

    document.body.addEventListener('click', handleRipple);
    return () => {
      document.body.removeEventListener('click', handleRipple);
    };
  }, []);

  // 6. Magnetic Buttons
  useEffect(() => {
    const btns = document.querySelectorAll('.btn-primary, .btn-outline');
    
    const handleMouseMove = (e) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const dy = (e.clientY - rect.top - rect.height / 2) * 0.2;
      btn.style.transform = `translate(${dx}px,${dy}px) translateY(-2px)`;
    };

    const handleMouseLeave = (e) => {
      e.currentTarget.style.transform = '';
    };

    btns.forEach((btn) => {
      btn.addEventListener('mousemove', handleMouseMove);
      btn.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      btns.forEach((btn) => {
        btn.removeEventListener('mousemove', handleMouseMove);
        btn.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // 7. Ambient Orbs Visibility
  useEffect(() => {
    const sections = document.querySelectorAll('#services, #about, #team, #contact');
    const observers = [];

    sections.forEach((sec) => {
      const orb = sec.querySelector('.ambient-orb');
      if (!orb) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          orb.classList.toggle('visible', entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      obs.observe(sec);
      observers.push({ obs, sec });
    });

    return () => {
      observers.forEach(({ obs, sec }) => obs.unobserve(sec));
    };
  }, []);

  // 8. 3D Tilt Card effect
  useEffect(() => {
    const cards = document.querySelectorAll('.service-card, .contact-info-card, .hero-dashboard, .comparison-card, .team-card');

    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const factor = card.classList.contains('hero-dashboard') ? 3 : 5;
      card.style.transform = `translateY(-6px) rotateX(${-y * factor}deg) rotateY(${x * factor}deg)`;
      card.style.transition = 'transform 0.08s ease';
    };

    const handleMouseLeave = (e) => {
      const card = e.currentTarget;
      card.style.transform = '';
      card.style.transition = 'all 0.4s cubic-bezier(0.16,1,0.3,1)';
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // 9. Typing cursor timer logic
  useEffect(() => {
    const fadeTimer = setTimeout(() => setCursorOpacity(0), 4500);
    const removeTimer = setTimeout(() => setShowCursor(false), 5400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // 9b. Optimized Lag-Free Smooth Scroll with Sticky Header Offset
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href === '#') return; // Do not intercept mock links

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        
        setIsMobileMenuOpen(false);
        document.body.classList.remove('overflow-hidden');

        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // 10. Contact form submit handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setFormStatus({ show: false, type: '', text: '' });

    setTimeout(() => {
      try {
        localStorage.setItem(
          `aeroscale_lead_${Date.now()}`,
          JSON.stringify({
            name: formName,
            email: formEmail,
            brand: formBrand,
            service: formService,
            message: formMessage,
            timestamp: new Date().toISOString(),
          })
        );

        setFormStatus({
          show: true,
          type: 'success',
          text: `Thank you, <strong>${formName}</strong>! Your brand audit request for <strong>${formBrand}</strong> has been received. Our sales engineer will email you at <strong>${formEmail}</strong> within 12 hours.`,
        });

        // Reset inputs
        setFormName('');
        setFormEmail('');
        setFormBrand('');
        setFormService('');
        setFormMessage('');
      } catch (err) {
        setFormStatus({
          show: true,
          type: 'error',
          text: 'Oops! Something went wrong. Please try again, or email hello@aeroscale.agency.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 1800);
  };

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
      return next;
    });
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
    document.body.classList.remove('overflow-hidden');
  };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div id="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="nav-overlay" onClick={handleNavLinkClick}></div>
      )}

      {/* Navigation Header */}
      <header className={`header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#home" className="logo" id="nav-logo-link" onClick={handleNavLinkClick}>
            <img src={logoSymbol} alt="Aero Scale Symbol" className="logo-symbol-img" />
            <div className="logo-text">
              <span className="brand-name">AEROSCALE</span>
              <span className="brand-sub">AUTOMATION</span>
            </div>
          </a>

          <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} id="nav-menu">
            <a
              href="#home"
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={handleNavLinkClick}
            >
              Home
            </a>
            <a
              href="#services"
              className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}
              onClick={handleNavLinkClick}
            >
              Services
            </a>
            <a
              href="#about"
              className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={handleNavLinkClick}
            >
              About Us
            </a>
            <a
              href="#team"
              className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}
              onClick={handleNavLinkClick}
            >
              Team
            </a>
            <a
              href="#contact"
              className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={handleNavLinkClick}
            >
              Contact Us
            </a>
            <a
              href="#contact"
              className="btn btn-secondary mobile-cta"
              onClick={handleNavLinkClick}
            >
              Get Free Audit
            </a>
          </nav>

          <div className="nav-actions">
            <button
              className={`theme-toggle ${isThemeSwitching ? 'switching' : ''}`}
              id="theme-toggle"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              type="button"
              onClick={toggleTheme}
            >
              <i className="fa-solid fa-sun icon-sun" aria-hidden="true"></i>
              <i className="fa-solid fa-moon icon-moon" aria-hidden="true"></i>
            </button>
            <a href="#contact" className="btn btn-primary" id="header-cta-btn">
              Get Free Audit
            </a>
            <button
              className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
              id="hamburger-menu"
              aria-label="Toggle menu"
              onClick={handleMobileMenuClick}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Home (Hero) Section */}
      <section id="home" className="hero-section" style={{ position: 'relative' }}>
        <ParticleCanvas />
        <div className="hero-bg-glow"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title fade-in">
              Scale Your Sales. <br />
              <span className="text-gradient">Automate the Rest.</span>
              {showCursor && (
                <span
                  className="typing-cursor"
                  style={{
                    transition: 'opacity 0.8s ease',
                    opacity: cursorOpacity,
                  }}
                ></span>
              )}
            </h1>
            <p className="hero-subtitle fade-in">
              Don't let slow response times kill your conversions. We build intelligent systems
              that instantly answer customer queries on WhatsApp, Instagram, and Live Chat turning
              raw leads into paying customers <span className="stat-inline">around the clock</span>.
              Replies land in <span className="stat-inline">under a second</span>, and conversion
              rates climb <span className="stat-inline">past 3x</span> once the automation takes
              over.
            </p>
            <div className="hero-cta fade-in">
              <a href="#contact" className="btn btn-primary btn-large">
                Book a Free Demo
              </a>
              <a href="#services" className="btn btn-outline btn-large">
                Explore Services <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <div className="hero-visual fade-in">
            <div className="glass-card hero-dashboard">
              <div className="dashboard-header">
                <div className="dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="dashboard-title">AeroScale Sales Engine v1.0</div>
              </div>
              <div className="dashboard-body">
                <div className="chat-sim">
                  <div className="chat-bubble client">
                    <span className="chat-sender">Customer</span>
                    <p>Hi is shirt ki price kia ha ? kia apke pas medium size ha?</p>
                    <span className="chat-time">02:14 PM</span>
                  </div>
                  <div className="chat-bubble bot reply-animate">
                    <span className="chat-sender text-gradient font-bold">
                      <i className="fa-solid fa-robot"></i> AeroScale Agent
                    </span>
                    <p>
                      Hello dear!jee bilkul hamare pas ye shirt medium size me ha or iski price 2500
                      rupees ha. Kia ap isey kharidna chahte hain?
                    </p>
                    <span className="chat-time">02:14 PM (Instant)</span>
                  </div>
                  <div className="chat-bubble client reply-animate-delayed">
                    <p>Yes, send the checkout link please!</p>
                    <span className="chat-time">02:15 PM</span>
                  </div>
                  <div className="chat-bubble bot reply-animate-delayed-2">
                    <span className="chat-sender text-gradient font-bold">
                      <i className="fa-solid fa-robot"></i> AeroScale Bot
                    </span>
                    <p>
                      Perfect! Here is your secure checkout link:{' '}
                      <a href="#" className="chat-link" onClick={(e) => e.preventDefault()}>
                        aero.scale/checkout/snk-10
                      </a>
                      . apka order juld hi ship ho jaega
                    </p>
                    <span className="chat-time">02:15 PM (Instant)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="services-section"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div
          className="ambient-orb orb-teal"
          style={{ width: '420px', height: '420px', top: '5%', left: '-8%', position: 'absolute' }}
        ></div>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">
              <i className="fa-solid fa-bolt-lightning"></i> Our Capabilities
            </span>
            <h2 className="section-title">High-Converting Automation Channels</h2>
            <p className="section-desc">
              We replace human delays with automated precision. Our tailored integrations capture,
              nurture, and close leads on the platforms your customers use most.
            </p>
          </div>

          <div className="services-grid">
            {/* Service 1: WhatsApp Automation (Featured) */}
            <div className="service-card service-card-featured glass-card">
              <span className="featured-tag">Most Requested</span>
              <div className="featured-main">
                <div className="service-icon-wrapper">
                  <i className="fa-brands fa-whatsapp service-icon text-green"></i>
                </div>
                <h3 className="service-title">WhatsApp Automation</h3>
                <p className="service-text">
                  Automate customer replies, display product catalogs, answer sizing/pricing questions,
                  and process order bookings directly inside WhatsApp. No more lost chats.
                </p>
              </div>
              <ul className="service-features featured-features">
                <li>
                  <i className="fa-solid fa-circle-check"></i> Automated Product Catalogs
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Instant Size & Price Checker
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Multi-agent Dashboard integration
                </li>
              </ul>
            </div>

            {/* Service 2: Instagram Automation */}
            <div className="service-card glass-card fade-in-scale">
              <div className="service-icon-wrapper">
                <i className="fa-brands fa-instagram service-icon text-pink"></i>
              </div>
              <h3 className="service-title">Instagram DM Automation</h3>
              <p className="service-text">
                Turn story mentions, comments, and DMs into sales funnels. Automatically reply to
                product inquiries and send direct purchase links to interested buyers.
              </p>
              <ul className="service-features">
                <li>
                  <i className="fa-solid fa-circle-check"></i> Comment-to-DM Sales Funnels
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Auto-Reply to Story Mentions
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Lead Qualification Chatbots
                </li>
              </ul>
            </div>

            {/* Service 3: Live Chat Automation */}
            <div className="service-card glass-card fade-in-scale">
              <div className="service-icon-wrapper">
                <i className="fa-solid fa-comments service-icon text-blue"></i>
              </div>
              <h3 className="service-title">Website Live Chat AI</h3>
              <p className="service-text">
                Install custom-trained AI chatbots on your website. Guide visitors through their
                buying journey, address objections, and resolve queries instantly to boost checkout
                rates.
              </p>
              <ul className="service-features">
                <li>
                  <i className="fa-solid fa-circle-check"></i> 24/7 E-commerce Store Assistant
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> FAQ & Order Status Lookup
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Custom-Trained on Your Brand Data
                </li>
              </ul>
            </div>

            {/* Service 4: Web & App Development */}
            <div className="service-card glass-card fade-in-scale">
              <div className="service-icon-wrapper">
                <i className="fa-solid fa-code service-icon text-cyan"></i>
              </div>
              <h3 className="service-title">Web & App Development</h3>
              <p className="service-text">
                High-performance websites, e-commerce stores, and applications built from scratch,
                fully optimized to house our advanced automation integrations.
              </p>
              <ul className="service-features">
                <li>
                  <i className="fa-solid fa-circle-check"></i> High-Speed Modern Architectures
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Conversational UI Integrations
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Fully Responsive, Custom Coding
                </li>
              </ul>
            </div>
          </div>

          <div className="future-badge-wrapper text-center">
            <span className="future-badge">
              <i className="fa-solid fa-lightbulb"></i> Custom AI CRMs, Email Automations, and
              more integrations coming soon!
            </span>
          </div>
        </div>
      </section>

      {/* About Us Section (Before vs After Refined) */}
      <section
        id="about"
        className="about-section"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div
          className="ambient-orb orb-blue"
          style={{ width: '380px', height: '380px', top: '15%', right: '-6%', position: 'absolute' }}
        ></div>
        <div className="container">
          <div className="about-grid">
            <div className="about-info fade-in-left">
              <span className="section-subtitle">
                <i className="fa-solid fa-users"></i> Who We Are
              </span>
              <h2 className="section-title">Bridging the Gap Between Inquiry and Conversion</h2>
              <p className="about-text">
                At <strong>Aero Scale</strong>, we solved the biggest problem modern e-commerce and
                retail brands face: <strong>delayed responses lead to lost sales.</strong>
              </p>
              <p className="about-text">
                When a customer reaches out asking about size, color, or price, they are at their peak
                purchase intent. If they wait hours for a response, they close the tab or buy from a
                competitor.
              </p>
              <p className="about-text">
                Our systems integrate seamlessly with your sales channels to automate conversation
                flows, answer FAQs instantly, and convert chats into sales—so your brand is always
                open, even when you or your team is offline.
              </p>

              <div className="about-features">
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h4>Reliable Architecture</h4>
                    <p>Our bots run on official APIs with 99.9% uptime guarantees.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div>
                    <h4>Data-Driven Scaling</h4>
                    <p>Track conversion rates and conversation flows in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* S-Tier Before vs After Visual Panel */}
            <div className="about-visual fade-in-right">
              <h3 className="visual-header-title text-center">Why Automation Matters</h3>

              {/* Metric Tab Selector */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  background: 'var(--w03)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '99px',
                  padding: '4px',
                  marginBottom: '2.5rem',
                  maxWidth: '380px',
                  marginHorizontal: 'auto',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                <button 
                  onClick={() => setComparisonMetric('speed')}
                  style={{
                    flex: 1,
                    background: comparisonMetric === 'speed' ? 'var(--clr-mint)' : 'transparent',
                    color: comparisonMetric === 'speed' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '99px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Speed
                </button>
                <button 
                  onClick={() => setComparisonMetric('hours')}
                  style={{
                    flex: 1,
                    background: comparisonMetric === 'hours' ? 'var(--clr-mint)' : 'transparent',
                    color: comparisonMetric === 'hours' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '99px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Availability
                </button>
                <button 
                  onClick={() => setComparisonMetric('conversions')}
                  style={{
                    flex: 1,
                    background: comparisonMetric === 'conversions' ? 'var(--clr-mint)' : 'transparent',
                    color: comparisonMetric === 'conversions' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '99px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Conversions
                </button>
              </div>

              <div className="comparison-container">
                {/* Before Aero Scale Panel */}
                <div className="comparison-card before fade-in-scale">
                  <div className="card-badge badge-red">Manual System</div>
                  <h4>Traditional Operational Bottlenecks</h4>
                  
                  {comparisonMetric === 'speed' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Response Delay</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#EF4444' }}>Hours</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '85%', height: '100%', background: '#EF4444', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  )}

                  {comparisonMetric === 'hours' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Active Coverage</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#EF4444' }}>25% of day</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '25%', height: '100%', background: '#EF4444', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  )}

                  {comparisonMetric === 'conversions' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Abandoned Leads</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#EF4444' }}>Up to 45% lost</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '70%', height: '100%', background: '#EF4444', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  )}

                  <ul className="comp-list" style={{ marginTop: '1.5rem' }}>
                    <li>
                      <i className="fa-solid fa-xmark text-red"></i> Staff online only during office hours
                    </li>
                    <li>
                      <i className="fa-solid fa-xmark text-red"></i> Leaking conversions on weekends
                    </li>
                  </ul>
                  <div className="outcome text-red">
                    <i className="fa-solid fa-arrow-trend-down"></i> Slow sales scaling, leaking ROI
                  </div>
                </div>

                {/* After Aero Scale Panel */}
                <div className="comparison-card after glass-card fade-in-scale">
                  <div className="card-badge badge-green">AeroScale Engine</div>
                  <h4>Intelligent Automated Closings</h4>

                  {comparisonMetric === 'speed' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Response Speed</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--clr-mint)' }}>0.5 Seconds</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '99%', height: '100%', background: 'var(--clr-mint)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  )}

                  {comparisonMetric === 'hours' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Active Coverage</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--clr-mint)' }}>100% (24/7/365)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--clr-mint)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  )}

                  {comparisonMetric === 'conversions' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Conversion Boost</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--clr-mint)' }}>3x Increase</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '95%', height: '100%', background: 'var(--clr-mint)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  )}

                  <ul className="comp-list" style={{ marginTop: '1.5rem' }}>
                    <li>
                      <i className="fa-solid fa-check text-green"></i> AI answers size, color & price catalogs
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-green"></i> Autopilot lead qualification funnel
                    </li>
                  </ul>
                  <div className="outcome text-green">
                    <i className="fa-solid fa-arrow-trend-up"></i> Maximized conversions and zero wasted leads
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="team-section"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div
          className="ambient-orb orb-teal"
          style={{ width: '400px', height: '400px', top: '10%', left: '-10%', position: 'absolute' }}
        ></div>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">
              <i className="fa-solid fa-users-gear"></i> Our Specialists
            </span>
            <h2 className="section-title">Meet the Visionaries</h2>
            <p className="section-desc">
              We combine advanced conversation automation, performance marketing, and seamless web experiences to scale your brand 24/7.
            </p>
          </div>

          <div className="team-grid">
            {/* Saad Khan Card */}
            <div className="team-card glass-card fade-in-scale">
              <div className="team-avatar-wrapper">
                <div className="team-avatar-icon-bg">
                  <i className="fa-solid fa-chart-line team-avatar-icon"></i>
                </div>
              </div>
              <h3 className="team-name">Saad Khan</h3>
              <p className="team-role text-gradient">Marketer & Performance Expert</p>
              <p className="team-bio">
                Automates paid traffic pathways and customer qualification algorithms to turn WhatsApp and Instagram leads into predictable revenue.
              </p>
              <div className="team-socials">
                <a href="#" className="team-social-link" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* Abdul Bari Card */}
            <div className="team-card glass-card fade-in-scale">
              <div className="team-avatar-wrapper">
                <div className="team-avatar-icon-bg design-dev-gradient">
                  <i className="fa-solid fa-laptop-code team-avatar-icon"></i>
                </div>
              </div>
              <h3 className="team-name">Abdul Bari</h3>
              <p className="team-role text-gradient">Developer & Designer</p>
              <p className="team-bio">
                Architects reliable systems, high-speed user interfaces, and custom visual design structures that make conversion systems run flawlessly.
              </p>
              <div className="team-socials">
                <a href="#" className="team-social-link" aria-label="GitHub" onClick={(e) => e.preventDefault()}>
                  <i className="fa-brands fa-github"></i>
                </a>
                <a href="#" className="team-social-link" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                <a href="#" className="team-social-link" aria-label="Portfolio" onClick={(e) => e.preventDefault()}>
                  <i className="fa-solid fa-globe"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section
        id="contact"
        className="contact-section"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div className="contact-bg-glow"></div>
        <div
          className="ambient-orb orb-teal"
          style={{ width: '460px', height: '460px', bottom: '0px', left: '8%', position: 'absolute' }}
        ></div>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">
              <i className="fa-solid fa-envelope"></i> Get in Touch
            </span>
            <h2 className="section-title">Ready to Automate Your Brand?</h2>
            <p className="section-desc">
              Schedule a free strategy call or drop us a message. We'll show you exactly how much
              revenue your brand is leaving on the table and how we can help you capture it.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-info-cards fade-in-left">
              <div className="contact-info-card-wrapper">
                <div className="contact-info-card glass-card">
                  <div className="info-icon-wrapper">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <h5>Email Us</h5>
                    <p>hello@aeroscale.agency</p>
                  </div>
                </div>
              </div>

              <div className="contact-info-card-wrapper">
                <a
                  href="https://wa.me/yourwhatsapplink"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-info-card glass-card link-card"
                >
                  <div className="info-icon-wrapper whatsapp-bg">
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div>
                    <h5>WhatsApp Us</h5>
                    <p>Talk directly with our solutions expert</p>
                  </div>
                  <i className="fa-solid fa-chevron-right arrow-link"></i>
                </a>
              </div>

              <div className="contact-info-card-wrapper">
                <div className="contact-info-card glass-card">
                  <div className="info-icon-wrapper">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <h5>Our Location</h5>
                    <p>Remote First | Global Coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Wrapper */}
            <div className="contact-form-wrapper glass-card fade-in-right">
              <form id="contact-form" className="contact-form" onSubmit={handleFormSubmit}>
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="John Doe"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="john@brand.com"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="brand">Brand Name</label>
                    <input
                      type="text"
                      id="brand"
                      placeholder="My E-Commerce Brand"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="service-select">Main Interest</label>
                    <select
                      id="service-select"
                      required
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a Service
                      </option>
                      <option value="whatsapp">WhatsApp Sales Automation</option>
                      <option value="instagram">Instagram DM Automation</option>
                      <option value="livechat">Website Live Chat AI</option>
                      <option value="development">Web & App Development</option>
                      <option value="multiple">Multiple / Full Setup</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message / Problem Statement</label>
                  <textarea
                    id="message"
                    rows="5"
                    placeholder="Tell us about your brand. E.g., 'We sell clothes on Instagram, but lose 30% of sales because we reply after hours...'"
                    required
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  id="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span>Sending Request...</span>{' '}
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span> <i className="fa-solid fa-paper-plane"></i>
                    </>
                  )}
                </button>

                {formStatus.show && (
                  <div className={`form-status ${formStatus.type === 'success' ? 'success' : 'error'}`}>
                    {formStatus.type === 'success' ? (
                      <i className="fa-solid fa-circle-check"></i>
                    ) : (
                      <i className="fa-solid fa-circle-exclamation"></i>
                    )}
                    <span dangerouslySetInnerHTML={{ __html: ` ${formStatus.text}` }} />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <a href="#home" className="logo footer-logo" onClick={handleNavLinkClick}>
              <img src={logoSymbol} alt="Aero Scale Symbol" className="logo-symbol-img" />
              <div className="logo-text">
                <span className="brand-name">AEROSCALE</span>
                <span className="brand-sub">AUTOMATION</span>
              </div>
            </a>
            <p className="footer-desc">
              Scale your operations, automate sales conversations, and eliminate response delays
              forever. Aero Scale is your growth partner in the age of conversational commerce.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter" onClick={(e) => e.preventDefault()}>
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h5>Navigation</h5>
            <ul className="footer-links">
              <li>
                <a href="#home" onClick={handleNavLinkClick}>Home</a>
              </li>
              <li>
                <a href="#services" onClick={handleNavLinkClick}>Services</a>
              </li>
              <li>
                <a href="#about" onClick={handleNavLinkClick}>About Us</a>
              </li>
              <li>
                <a href="#team" onClick={handleNavLinkClick}>Team</a>
              </li>
              <li>
                <a href="#contact" onClick={handleNavLinkClick}>Contact Us</a>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5>Services</h5>
            <ul className="footer-links">
              <li>
                <a href="#services" onClick={handleNavLinkClick}>WhatsApp Sales Automation</a>
              </li>
              <li>
                <a href="#services" onClick={handleNavLinkClick}>Instagram DM Automation</a>
              </li>
              <li>
                <a href="#services" onClick={handleNavLinkClick}>Website Live Chat AI</a>
              </li>
              <li>
                <a href="#services" onClick={handleNavLinkClick}>Web & App Development</a>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5>Solutions</h5>
            <ul className="footer-links">
              <li>
                <a href="#about" onClick={handleNavLinkClick}>Before vs After Case Study</a>
              </li>
              <li>
                <a href="#contact" onClick={handleNavLinkClick}>Book Free Demo</a>
              </li>
              <li>
                <a href="#contact" onClick={handleNavLinkClick}>Request Brand Audit</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom text-center">
          <div className="container footer-bottom-content">
            <p>&copy; 2026 Aero Scale Automation Agency. All rights reserved.</p>
            <p>Designed for brands that want to grow without limits.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
