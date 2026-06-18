import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import TerminalScreen from './components/TerminalScreen';
import ProfitCalculator from './components/ProfitCalculator';
import Modals from './components/Modals';
import EducationalHub from './components/EducationalHub';
import { PrivacyPolicy, TermsAndConditions } from './components/LegalPages';
import { playBtnSound, playFallSound } from './utils/audioUtils';
import { submitLead } from './utils/crm';

function App() {
    const [activePage, setActivePage] = useState('home'); // 'home', 'edu', 'privacy', 'terms'
    const [activeSection, setActiveSection] = useState('home'); // for scrolling on home
    const [activeModal, setActiveModal] = useState(null);
    const [isDestructMode, setIsDestructMode] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [isContactSubmitting, setIsContactSubmitting] = useState(false);
    const [contactStatus, setContactStatus] = useState('');

    useEffect(() => {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    
                    const style = window.getComputedStyle(entry.target);
                    const delayMs = (parseFloat(style.transitionDelay) * 1000) || 0;
                    setTimeout(() => {
                        playFallSound();
                    }, delayMs);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [activePage, activeSection, isLoggedIn]);

    useEffect(() => {
        if (window.innerWidth < 1024) return;

        const cards = document.querySelectorAll('.card');

        const handleMouseEnter = (e) => {
            const card = e.currentTarget;
            const shine = card.querySelector('.card-shine');
            if (shine) shine.style.opacity = '1';
        };

        const handleMouseMove = (e) => {
            const card = e.currentTarget;
            const shine = card.querySelector('.card-shine');
            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width) * 2 - 1;
            const yPercent = (y / rect.height) * 2 - 1;

            const hasFocus = card.contains(document.activeElement);
            const maxTilt = hasFocus ? 0 : 2.5; 
            const tiltX = -yPercent * maxTilt;
            const tiltY = xPercent * maxTilt;

            card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

            if (shine) {
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.08) 0%, transparent 65%)`;
            }
        };

        const handleMouseLeave = (e) => {
            const card = e.currentTarget;
            const shine = card.querySelector('.card-shine');
            card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (shine) {
                shine.style.opacity = '0';
            }
        };

        cards.forEach(card => {
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            cards.forEach(card => {
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mousemove', handleMouseMove);
                card.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [activePage, activeSection, isLoggedIn]);

    const navigateTo = (page, section = 'home') => {
        playBtnSound('secondary');
        setActivePage(page);
        if (page === 'home') {
            setActiveSection(section);
            if (section === 'contact-sec') {
                setTimeout(() => {
                    const formCard = document.querySelector('.contact-form-card');
                    if (formCard) {
                        formCard.style.borderColor = 'var(--accent-cyan)';
                        formCard.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.2)';
                        setTimeout(() => {
                            formCard.style.borderColor = 'var(--border-light)';
                            formCard.style.boxShadow = '';
                        }, 2000);
                    }
                }, 100);
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCalcExplore = () => {
        playBtnSound('primary');
        navigateTo('home', 'home');
        setTimeout(() => {
            const calcCard = document.getElementById('profit-calculator');
            if (calcCard) {
                calcCard.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    triggerCardSparkles(calcCard);
                }, 650);
            }
        }, 100);
    };

    const triggerCardSparkles = (cardElement) => {
        cardElement.classList.add('card-pop-active');

        const colors = ['#00f2fe', '#e100ff', '#f3ba2f', '#7f00ff'];
        const glyphs = ['★', '✧', '✦', '•'];
        const totalSparkles = 22;

        for (let i = 0; i < totalSparkles; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-particle';
            sparkle.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

            const startX = Math.random() * 90 + 5; 
            const startY = Math.random() * 90 + 5; 

            const targetX = (Math.random() - 0.5) * 120; 
            const targetY = - (Math.random() * 100 + 60); 

            const size = Math.random() * 14 + 10; 
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rot = (Math.random() - 0.5) * 360; 
            const delay = Math.random() * 0.35; 

            sparkle.style.left = `${startX}%`;
            sparkle.style.top = `${startY}%`;
            sparkle.style.setProperty('--color', color);
            sparkle.style.setProperty('--size', `${size}px`);
            sparkle.style.setProperty('--tx', `${targetX}px`);
            sparkle.style.setProperty('--ty', `${targetY}px`);
            sparkle.style.setProperty('--rot', `${rot}deg`);
            sparkle.style.animationDelay = `${delay}s`;

            cardElement.appendChild(sparkle);

            setTimeout(() => {
                if (sparkle.parentNode) sparkle.remove();
            }, (delay + 1.5) * 1000);
        }

        setTimeout(() => {
            cardElement.classList.remove('card-pop-active');
        }, 2500);
    };

    const handleHomeContactSubmit = async (e) => {
        e.preventDefault();
        setIsContactSubmitting(true);
        setContactStatus('');

        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get('name').split(' ')[0] || '',
            last_name: formData.get('name').split(' ').slice(1).join(' ') || '',
            email: formData.get('email'),
            phone: formData.get('phone'),
            description: formData.get('message') || 'Enquiry from Home Page'
        };

        try {
            await submitLead(data);
            setContactStatus('success');
            e.target.reset();
            setTimeout(() => setContactStatus(''), 5000);
        } catch (error) {
            setContactStatus('error');
            setTimeout(() => setContactStatus(''), 5000);
        } finally {
            setIsContactSubmitting(false);
        }
    };

    const triggerDismantle = () => {
        setIsDestructMode(true);
        window.dispatchEvent(new Event('trigger-destruct'));
    };

    const handleDestructComplete = () => {
        setShowTerminal(true);
    };

    const handleRestore = () => {
        window.dispatchEvent(new Event('trigger-restore'));
        setIsDestructMode(false);
        setShowTerminal(false);
    };

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        navigateTo('edu');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigateTo('home');
    };

    return (
        <>
            <ThreeBackground isDestructMode={isDestructMode} onDestructComplete={handleDestructComplete} />
            <div id="glitch-overlay"></div>
            <TerminalScreen isVisible={showTerminal} onRestoreSuccess={handleRestore} />

            <div className={`ticker-wrap ${isDestructMode ? 'crumble-item' : ''}`}>
                <div className="ticker">
                    <div className="ticker-item"><span className="coin-symbol">BTC</span> <span className="coin-price" id="ticker-btc">$68,432.10</span> <span className="coin-change pos" id="ticker-btc-change">+3.42%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">ETH</span> <span className="coin-price" id="ticker-eth">$3,842.50</span> <span className="coin-change pos" id="ticker-eth-change">+2.18%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">SOL</span> <span className="coin-price" id="ticker-sol">$168.25</span> <span className="coin-change neg" id="ticker-sol-change">-0.85%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">BNB</span> <span className="coin-price" id="ticker-bnb">$592.40</span> <span className="coin-change pos" id="ticker-bnb-change">+1.05%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">ADA</span> <span className="coin-price" id="ticker-ada">$0.482</span> <span className="coin-change neg" id="ticker-ada-change">-1.54%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">DOT</span> <span className="coin-price" id="ticker-dot">$6.85</span> <span className="coin-change pos" id="ticker-dot-change">+0.92%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">BTC</span> <span className="coin-price">$68,432.10</span> <span className="coin-change pos">+3.42%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">ETH</span> <span className="coin-price">$3,842.50</span> <span className="coin-change pos">+2.18%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">SOL</span> <span className="coin-price">$168.25</span> <span className="coin-change neg">-0.85%</span></div>
                    <div className="ticker-item"><span className="coin-symbol">BNB</span> <span className="coin-price">$592.40</span> <span className="coin-change pos">+1.05%</span></div>
                </div>
            </div>

            <div id="app-wrapper" className={showTerminal ? 'hidden' : ''}>
                <header className="navbar">
                    <div className="logo" onClick={() => navigateTo(isLoggedIn ? 'edu' : 'home')}>
                        <span className="logo-text">AETHERIS</span>
                        <span className="logo-dot"></span>
                    </div>
                    
                    {!isLoggedIn ? (
                        <>
                            <nav className="nav-links">
                                <a href="#home" className={`nav-link ${activePage === 'home' && activeSection === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'home'); }}>Home</a>
                                <a href="#about" className={`nav-link ${activePage === 'home' && activeSection === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'about'); }}>About</a>
                                <a href="#security" className={`nav-link ${activePage === 'home' && activeSection === 'security' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'security'); }}>Security</a>
                                <a href="#roadmap" className={`nav-link ${activePage === 'home' && activeSection === 'roadmap' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'roadmap'); }}>Roadmap</a>
                                <a href="#contact-sec" className={`nav-link ${activePage === 'home' && activeSection === 'contact-sec' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'contact-sec'); }}>Contact</a>
                            </nav>
                            <div className="auth-buttons">
                                <button className="btn btn-secondary" onClick={() => { playBtnSound('secondary'); setActiveModal('login'); }}>Login</button>
                                <button className="btn btn-primary" onClick={() => { playBtnSound('primary'); setActiveModal('signup'); }}>Sign Up</button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <span style={{marginRight: '1rem', color: '#00f2fe', fontWeight: '500'}}>Node Connected</span>
                            <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
                        </div>
                    )}
                </header>

                {activePage === 'edu' && isLoggedIn && <EducationalHub />}
                {activePage === 'privacy' && <PrivacyPolicy />}
                {activePage === 'terms' && <TermsAndConditions />}

                {activePage === 'home' && (
                    <main className="content-wrapper">
                        <section id="home" className={`section ${activeSection === 'home' ? 'active' : ''}`}>
                            <div className="hero-grid">
                                <div className="hero-text-content">
                                    <div className="glow-tag">NEXT-GEN QUANTUM ALGORITHMS</div>
                                    <h1>Invest in the Future of <span className="text-gradient">Digital Assets</span></h1>
                                    <p className="lead">
                                        Experience institutional-grade cryptocurrency management powered by neural trading bots and real-time smart risk assessment. Maximize yield while mitigating volatility.
                                    </p>
                                    <div className="hero-actions">
                                        <button className="btn btn-primary btn-large" onClick={handleCalcExplore}>Calculate Yields</button>
                                        <button className="btn btn-outline btn-large" onClick={() => navigateTo('home', 'about')}>Learn Strategy</button>
                                    </div>
                                    <div className="stats-row">
                                        <div className="stat-item">
                                            <span className="stat-num">$2.4B+</span>
                                            <span className="stat-lbl">Assets Managed</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-num">24.8%</span>
                                            <span className="stat-lbl">Avg. Annual APY</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-num">142K+</span>
                                            <span className="stat-lbl">Active Investors</span>
                                        </div>
                                    </div>
                                </div>
                                <ProfitCalculator onCalculateInteraction={() => {}} />
                            </div>
                        </section>

                        <section id="about" className={`section ${activeSection === 'about' ? 'active' : ''}`}>
                            <div className="about-grid">
                                <div className="about-features">
                                    <div className="section-header" style={{ textAlign: 'left', margin: '0 0 2rem 0' }}>
                                        <span className="glow-tag">HOW WE OPERATE</span>
                                        <h2>Investing Made <span className="text-gradient">Smarter & Efficient</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Our platform removes the guesswork from cryptocurrency investing. We combine deep liquidity, advanced risk models, and neural network algorithms to guarantee secure and efficient wealth generation.
                                        </p>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🛡️</div>
                                        <div className="feature-info">
                                            <h3>Automated Risk Management</h3>
                                            <p>Our algorithm continuously monitors market volatility indices, dynamically rebalancing your portfolio into stable assets during extreme market drawdowns to preserve your capital.</p>
                                        </div>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">📊</div>
                                        <div className="feature-info">
                                            <h3>Advanced Smart-Yield Farming</h3>
                                            <p>Aetheris scans protocols across multiple chains to find the highest yielding, audited liquidity pools, putting your capital to work with zero gas costs on your end.</p>
                                        </div>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-3">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">⚡</div>
                                        <div className="feature-info">
                                            <h3>Instant Fiat-Crypto Gateway</h3>
                                            <p>Deposit funds securely using standard credit cards, wire transfers, or Apple Pay. Withdraw directly to your local bank account in seconds, with zero processing delay.</p>
                                        </div>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🌐</div>
                                        <div className="feature-info">
                                            <h3>Algorithmic Arbitrage</h3>
                                            <p>Our systems detect and exploit micro-inefficiencies across dozens of global exchanges, executing thousands of high-frequency trades per second to generate consistent delta-neutral returns.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="about-visuals">
                                    <div className="card glass-card visual-interactive-card scroll-reveal reveal-right">
                                        <div className="card-shine"></div>
                                        <div className="visual-header">
                                            <span className="status-pulse"></span>
                                            <h4>INTELLIGENT ALLOCATION SYSTEM</h4>
                                        </div>
                                        <div className="circular-progress-container">
                                            <div className="circular-chart">
                                                <svg viewBox="0 0 36 36" className="circular-svg">
                                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                    <path className="circle-fill-1" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                    <path className="circle-fill-2" strokeDasharray="35, 100" strokeDashoffset="-45" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                    <path className="circle-fill-3" strokeDasharray="20, 100" strokeDashoffset="-80" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                </svg>
                                                <div className="circular-center-text">
                                                    <span className="alloc-num">94.8%</span>
                                                    <span className="alloc-lbl">Yield efficiency</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="legend-list">
                                            <div className="legend-item"><span className="legend-dot color-1"></span> BTC Arbitrage (45%)</div>
                                            <div className="legend-item"><span className="legend-dot color-2"></span> Multi-chain Yield (35%)</div>
                                            <div className="legend-item"><span className="legend-dot color-3"></span> Stable Liquidity (20%)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="security" className={`section ${activeSection === 'security' ? 'active' : ''}`}>
                            <div className="about-grid">
                                <div className="about-features" style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                                    <div className="section-header" style={{ textAlign: 'left', margin: '0 0 1rem 0' }}>
                                        <span className="glow-tag">MILITARY GRADE</span>
                                        <h2>Quantum-Resistant <span className="text-gradient">Security Protocol</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Your assets are secured by offline cold storage, multi-signature authentication, and post-quantum cryptographic primitives.
                                        </p>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🔒</div>
                                        <div className="feature-info">
                                            <h3>Cold Storage Vaults</h3>
                                            <p>98% of all digital assets are kept offline in geographically distributed, EMP-shielded vaults with multi-sig requirements.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🛡️</div>
                                        <div className="feature-info">
                                            <h3>$500M Insurance Policy</h3>
                                            <p>Every account is backed by a comprehensive insurance policy underwritten by top-tier global syndicates against unauthorized access.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">👁️</div>
                                        <div className="feature-info">
                                            <h3>Zero-Knowledge Proofs</h3>
                                            <p>All internal transaction routing utilizes zk-SNARK technology, ensuring your trading patterns and portfolio balance remain mathematically invisible on the blockchain.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🚨</div>
                                        <div className="feature-info">
                                            <h3>24/7 Threat Monitoring</h3>
                                            <p>Our proprietary AI-driven surveillance system monitors withdrawal patterns in real-time, automatically freezing accounts if anomalous or unauthorized access is detected.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="security-visual"></div>
                            </div>
                        </section>

                        <section id="roadmap" className={`section ${activeSection === 'roadmap' ? 'active' : ''}`}>
                            <div className="about-grid">
                                <div className="about-features" style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                                    <div className="section-header" style={{ textAlign: 'left', margin: '0 0 1rem 0' }}>
                                        <span className="glow-tag">FUTURE FORWARD</span>
                                        <h2>Platform <span className="text-gradient">Roadmap</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            We are continuously evolving. Here is what is on the horizon for the Aetheris ecosystem.
                                        </p>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%', borderColor: 'var(--accent-cyan)' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q1</div>
                                        <div className="feature-info">
                                            <h3>Neural Net V2 Rollout</h3>
                                            <p>Upgrading our core algorithm to process 10x more market variables in real-time.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q2</div>
                                        <div className="feature-info">
                                            <h3>Institutional API Access</h3>
                                            <p>Direct REST & WebSocket connections for algorithmic trading desks and hedge funds.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q3</div>
                                        <div className="feature-info">
                                            <h3>Decentralized Exchange (DEX)</h3>
                                            <p>Launch of our native cross-chain DEX, allowing users to trade synthetic assets directly from their cold storage wallets.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q4</div>
                                        <div className="feature-info">
                                            <h3>Global Banking Expansion</h3>
                                            <p>Establishing direct settlement networks with European and Asian banking partners to enable instantaneous multi-currency fiat ramps.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="roadmap-visual"></div>
                            </div>
                        </section>

                        <section id="contact-sec" className={`section ${activeSection === 'contact-sec' ? 'active' : ''}`}>
                            <div className="about-grid" style={{ alignItems: 'start' }}>
                                <div className="about-features" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div className="section-header" style={{ textAlign: 'left', margin: '0' }}>
                                        <span className="glow-tag">CONNECT WITH US</span>
                                        <h2>Let's Build Your <span className="text-gradient">Crypto Legacy</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Have questions about our security, regulatory compliance, or investment strategy? Reach out to our dedicated client relations department for immediate assistance.
                                        </p>
                                    </div>

                                    <div className="card glass-card contact-info-card scroll-reveal">
                                        <div className="card-shine"></div>
                                        <h3>Corporate Headquarters</h3>
                                        <p className="address" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Aetheris Financial Center<br/>Suite 840, Cryptotech Plaza<br/>New York, NY 10005</p>
                                        
                                        <div className="info-link-row" style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                            <span className="info-label" style={{ minWidth: '130px', color: 'var(--accent-cyan)' }}>Direct Line:</span>
                                            <a href="tel:+18005550190" className="info-val" style={{ color: '#fff', textDecoration: 'none' }}>+1 (800) 555-0190</a>
                                        </div>
                                        <div className="info-link-row" style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                            <span className="info-label" style={{ minWidth: '130px', color: 'var(--accent-cyan)' }}>Client Support:</span>
                                            <a href="mailto:support@aetheris.io" className="info-val" style={{ color: '#fff', textDecoration: 'none' }}>support@aetheris.io</a>
                                        </div>
                                        <div className="info-link-row" style={{ display: 'flex', gap: '1rem' }}>
                                            <span className="info-label" style={{ minWidth: '130px', color: 'var(--accent-cyan)' }}>Institutional:</span>
                                            <a href="mailto:institutions@aetheris.io" className="info-val" style={{ color: '#fff', textDecoration: 'none' }}>institutions@aetheris.io</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card glass-card contact-form-card scroll-reveal">
                                    <div className="card-shine"></div>
                                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Send Secure Message</h2>
                                    </div>
                                    <form id="contact-form" autoComplete="off" onSubmit={handleHomeContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                            <div className="form-field half" style={{ flex: 1 }}>
                                                <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Full Name</label>
                                                <input type="text" name="name" id="contact-name" placeholder="John Doe" required disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)' }} />
                                            </div>
                                            <div className="form-field half" style={{ flex: 1 }}>
                                                <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Email Address</label>
                                                <input type="email" name="email" id="contact-email" placeholder="john@domain.com" required disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)' }} />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="contact-phone" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Phone Number</label>
                                            <input type="tel" name="phone" id="contact-phone" placeholder="+1 234 567 8900" required disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)' }} />
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Your Message (Optional)</label>
                                            <textarea name="message" id="contact-message" rows="5" placeholder="Write your message here..." disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)', resize: 'vertical' }}></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isContactSubmitting}>
                                            {isContactSubmitting ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
                                        </button>
                                    </form>
                                    {contactStatus === 'success' && (
                                        <div className="form-notification success-msg" style={{marginTop: '1rem', color: 'var(--state-success)', background: 'rgba(0, 255, 135, 0.1)', padding: '0.8rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                            <span className="notif-icon">✓</span>
                                            <span>Message transmitted successfully over encrypted channels.</span>
                                        </div>
                                    )}
                                    {contactStatus === 'error' && (
                                        <div className="form-notification error-msg" style={{marginTop: '1rem', color: '#ff5f56', background: 'rgba(255, 95, 86, 0.1)', padding: '0.8rem', borderRadius: '8px'}}>
                                            <span>Failed to transmit message. Please try again.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>
                )}

                <footer className="main-footer">
                    <div className="footer-left">
                        <p>&copy; 2026 Aetheris Technologies Inc. All rights reserved.</p>
                        <p className="disclaimer">Cryptocurrency investments involve high market risk. Past performance does not guarantee future yields.</p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <a href="#" className="text-link" onClick={(e) => { e.preventDefault(); navigateTo('privacy'); }}>Privacy Policy</a>
                            <a href="#" className="text-link" onClick={(e) => { e.preventDefault(); navigateTo('terms'); }}>Terms & Conditions</a>
                        </div>
                    </div>
                    <div className="footer-right">
                        <button id="btn-admin-console" title="Access Security Console" onClick={() => { playBtnSound('secondary'); setActiveModal('admin'); }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                            <span>System Protocol</span>
                        </button>
                    </div>
                </footer>
            </div>

            <Modals activeModal={activeModal} setActiveModal={setActiveModal} onTriggerDismantle={triggerDismantle} onLoginSuccess={handleLoginSuccess} />
        </>
    );
}

export default App;
