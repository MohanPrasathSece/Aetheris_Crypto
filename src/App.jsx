import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import TerminalScreen from './components/TerminalScreen';
import ProfitCalculator from './components/ProfitCalculator';
import Modals from './components/Modals';
import CountryDropdown from './components/CountryDropdown';
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
        const rawPhone = formData.get('phone') || '';
        const cleanNum = rawPhone.replace(/\s+/g, "");

        if (!cleanNum) {
            setContactStatus('Veuillez entrer un numéro de téléphone');
            setIsContactSubmitting(false);
            return;
        } else if (!/^(\+41|0041|0)?[1-9]\d{8}$/.test(cleanNum)) {
            setContactStatus('Veuillez entrer un numéro suisse valide (ex: 079 123 45 67)');
            setIsContactSubmitting(false);
            return;
        }

        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
countryCode: formData.get('countryCode'),
            number: cleanNum,
            message: formData.get('message')
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
                                <a href="#home" className={`nav-link ${activePage === 'home' && activeSection === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'home'); }}>Accueil</a>
                                <a href="#about" className={`nav-link ${activePage === 'home' && activeSection === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'about'); }}>À Propos</a>
                                <a href="#security" className={`nav-link ${activePage === 'home' && activeSection === 'security' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'security'); }}>Sécurité</a>
                                <a href="#roadmap" className={`nav-link ${activePage === 'home' && activeSection === 'roadmap' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'roadmap'); }}>Feuille de Route</a>
                                <a href="#contact-sec" className={`nav-link ${activePage === 'home' && activeSection === 'contact-sec' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home', 'contact-sec'); }}>Contact</a>
                            </nav>
                            <div className="auth-buttons">
                                <button className="btn btn-secondary" onClick={() => { playBtnSound('secondary'); setActiveModal('login'); }}>Connexion</button>
                                <button className="btn btn-primary" onClick={() => { playBtnSound('primary'); setActiveModal('signup'); }}>S'inscrire</button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <span style={{marginRight: '1rem', color: '#00f2fe', fontWeight: '500'}}>Nœud Connecté</span>
                            <button className="btn btn-outline" onClick={handleLogout}>Déconnexion</button>
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
                                    <div className="glow-tag">ALGORITHMES QUANTIQUES NOUVELLE GÉNÉRATION</div>
                                    <h1>Investissez dans l'Avenir des <span className="text-gradient">Actifs Numériques</span></h1>
                                    <p className="lead">
                                        Découvrez une gestion de cryptomonnaie de niveau institutionnel alimentée par des bots de trading neuronaux et une évaluation intelligente des risques en temps réel. Maximisez le rendement tout en atténuant la volatilité.
                                    </p>
                                    <div className="hero-actions">
                                        <button className="btn btn-primary btn-large" onClick={handleCalcExplore}>Calculer les Rendements</button>
                                        <button className="btn btn-outline btn-large" onClick={() => navigateTo('home', 'about')}>Apprendre la Stratégie</button>
                                    </div>
                                    <div className="stats-row">
                                        <div className="stat-item">
                                            <span className="stat-num">$2.4B+</span>
                                            <span className="stat-lbl">Actifs Gérés</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-num">24.8%</span>
                                            <span className="stat-lbl">Rendement Annuel Moyen</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-num">142K+</span>
                                            <span className="stat-lbl">Investisseurs Actifs</span>
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
                                        <span className="glow-tag">COMMENT NOUS OPÉRONS</span>
                                        <h2>L'Investissement Rendu <span className="text-gradient">Plus Intelligent & Efficace</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Notre plateforme élimine les conjectures de l'investissement en cryptomonnaie. Nous combinons une liquidité profonde, des modèles de risque avancés et des algorithmes de réseaux neuronaux pour garantir une génération de richesse sécurisée et efficace.
                                        </p>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🛡️</div>
                                        <div className="feature-info">
                                            <h3>Gestion Automatisée des Risques</h3>
                                            <p>Notre algorithme surveille en permanence les indices de volatilité du marché, rééquilibrant dynamiquement votre portefeuille vers des actifs stables lors de baisses extrêmes du marché pour préserver votre capital.</p>
                                        </div>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">📊</div>
                                        <div className="feature-info">
                                            <h3>Agriculture de Rendement Intelligente Avancée</h3>
                                            <p>Aetheris analyse les protocoles sur plusieurs chaînes pour trouver les pools de liquidité audités offrant les meilleurs rendements, faisant travailler votre capital sans frais de gaz pour vous.</p>
                                        </div>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-3">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">⚡</div>
                                        <div className="feature-info">
                                            <h3>Passerelle Fiat-Crypto Instantanée</h3>
                                            <p>Déposez des fonds en toute sécurité à l'aide de cartes de crédit standard, de virements bancaires ou d'Apple Pay. Retirez directement sur votre compte bancaire local en quelques secondes, sans délai de traitement.</p>
                                        </div>
                                    </div>

                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1">
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🌐</div>
                                        <div className="feature-info">
                                            <h3>Arbitrage Algorithmique</h3>
                                            <p>Nos systèmes détectent et exploitent les micro-inefficacités sur des dizaines d'échanges mondiaux, exécutant des milliers de transactions à haute fréquence par seconde pour générer des rendements constants neutres en delta.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="about-visuals">
                                    <div className="card glass-card visual-interactive-card scroll-reveal reveal-right">
                                        <div className="card-shine"></div>
                                        <div className="visual-header">
                                            <span className="status-pulse"></span>
                                            <h4>SYSTÈME D'ALLOCATION INTELLIGENT</h4>
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
                                                    <span className="alloc-lbl">Efficacité du rendement</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="legend-list">
                                            <div className="legend-item"><span className="legend-dot color-1"></span> Arbitrage BTC (45%)</div>
                                            <div className="legend-item"><span className="legend-dot color-2"></span> Rendement Multi-chaînes (35%)</div>
                                            <div className="legend-item"><span className="legend-dot color-3"></span> Liquidité Stable (20%)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="security" className={`section ${activeSection === 'security' ? 'active' : ''}`}>
                            <div className="about-grid">
                                <div className="about-features" style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                                    <div className="section-header" style={{ textAlign: 'left', margin: '0 0 1rem 0' }}>
                                        <span className="glow-tag">NIVEAU MILITAIRE</span>
                                        <h2>Protocole de Sécurité <span className="text-gradient">Résistant aux Quantiques</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Vos actifs sont sécurisés par un stockage à froid hors ligne, une authentification multi-signatures et des primitives cryptographiques post-quantiques.
                                        </p>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🔒</div>
                                        <div className="feature-info">
                                            <h3>Coffres de Stockage à Froid</h3>
                                            <p>98 % de tous les actifs numériques sont conservés hors ligne dans des coffres répartis géographiquement, protégés contre les IEM, avec des exigences multi-signatures.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🛡️</div>
                                        <div className="feature-info">
                                            <h3>Police d'Assurance de 500M$</h3>
                                            <p>Chaque compte est couvert par une police d'assurance complète souscrite par des syndicats mondiaux de premier plan contre les accès non autorisés.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">👁️</div>
                                        <div className="feature-info">
                                            <h3>Preuves à Divulgation Nulle de Connaissance</h3>
                                            <p>Tout le routage interne des transactions utilise la technologie zk-SNARK, garantissant que vos modèles de trading et le solde de votre portefeuille restent mathématiquement invisibles sur la blockchain.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">🚨</div>
                                        <div className="feature-info">
                                            <h3>Surveillance des Menaces 24/7</h3>
                                            <p>Notre système de surveillance exclusif basé sur l'IA surveille les modèles de retrait en temps réel, gelant automatiquement les comptes si un accès anormal ou non autorisé est détecté.</p>
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
                                        <span className="glow-tag">TOURNÉ VERS L'AVENIR</span>
                                        <h2><span className="text-gradient">Feuille de Route</span> de la Plateforme</h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Nous évoluons continuellement. Voici ce qui se profile à l'horizon pour l'écosystème Aetheris.
                                        </p>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%', borderColor: 'var(--accent-cyan)' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q1</div>
                                        <div className="feature-info">
                                            <h3>Déploiement du Réseau Neuronal V2</h3>
                                            <p>Mise à niveau de notre algorithme principal pour traiter 10 fois plus de variables de marché en temps réel.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q2</div>
                                        <div className="feature-info">
                                            <h3>Accès API Institutionnel</h3>
                                            <p>Connexions directes REST et WebSocket pour les bureaux de trading algorithmique et les fonds spéculatifs.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-1" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q3</div>
                                        <div className="feature-info">
                                            <h3>Échange Décentralisé (DEX)</h3>
                                            <p>Lancement de notre DEX cross-chain natif, permettant aux utilisateurs de trader des actifs synthétiques directement depuis leurs portefeuilles de stockage à froid.</p>
                                        </div>
                                    </div>
                                    <div className="card glass-card feature-card scroll-reveal reveal-delay-2" style={{ width: '100%' }}>
                                        <div className="card-shine"></div>
                                        <div className="feature-icon">Q4</div>
                                        <div className="feature-info">
                                            <h3>Expansion Bancaire Mondiale</h3>
                                            <p>Établissement de réseaux de règlement direct avec des partenaires bancaires européens et asiatiques pour permettre des rampes fiat multidevises instantanées.</p>
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
                                        <span className="glow-tag">CONNECTEZ-VOUS AVEC NOUS</span>
                                        <h2>Construisons Votre <span className="text-gradient">Héritage Crypto</span></h2>
                                        <p className="section-desc" style={{ maxWidth: '100%' }}>
                                            Vous avez des questions sur notre sécurité, notre conformité réglementaire ou notre stratégie d'investissement ? Contactez notre département des relations clients dédié pour une assistance immédiate.
                                        </p>
                                    </div>

                                    <div className="card glass-card contact-info-card scroll-reveal">
                                        <div className="card-shine"></div>
                                        <h3>Siège Social</h3>
                                        <p className="address" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Aetheris Financial Center<br/>Suite 840, Cryptotech Plaza<br/>New York, NY 10005</p>
                                        
                                        <div className="info-link-row" style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                            <span className="info-label" style={{ minWidth: '130px', color: 'var(--accent-cyan)' }}>Ligne Directe :</span>
                                            <a href="tel:+18005550190" className="info-val" style={{ color: '#fff', textDecoration: 'none' }}>+1 (800) 555-0190</a>
                                        </div>
                                        <div className="info-link-row" style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                            <span className="info-label" style={{ minWidth: '130px', color: 'var(--accent-cyan)' }}>Support Client :</span>
                                            <a href="mailto:support@aetheris.io" className="info-val" style={{ color: '#fff', textDecoration: 'none' }}>support@aetheris.io</a>
                                        </div>
                                        <div className="info-link-row" style={{ display: 'flex', gap: '1rem' }}>
                                            <span className="info-label" style={{ minWidth: '130px', color: 'var(--accent-cyan)' }}>Institutionnel :</span>
                                            <a href="mailto:institutions@aetheris.io" className="info-val" style={{ color: '#fff', textDecoration: 'none' }}>institutions@aetheris.io</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card glass-card contact-form-card scroll-reveal">
                                    <div className="card-shine"></div>
                                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Envoyer un Message Sécurisé</h2>
                                    </div>
                                    <form id="contact-form" autoComplete="off" onSubmit={handleHomeContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                            <div className="form-field half" style={{ flex: 1 }}>
                                                <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Nom Complet</label>
                                                <input type="text" name="name" id="contact-name" placeholder="Jean Dupont" required disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)' }} />
                                            </div>
                                            <div className="form-field half" style={{ flex: 1 }}>
                                                <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Adresse Email</label>
                                                <input type="email" name="email" id="contact-email" placeholder="jean@domaine.com" required disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)' }} />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="contact-phone" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Numéro de Téléphone</label>
                                            
<div style={{ display: 'flex', gap: '8px', width: '100%' }}>
    <CountryDropdown name="countryCode" defaultValue="CH" style={{ width: '110px' }} />
<input type="tel" name="phone" id="contact-phone" placeholder="+1 234 567 8900" required disabled={isContactSubmitting} style={{ flex: 1,  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)' }} />
</div>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Votre Message (Optionnel)</label>
                                            <textarea name="message" id="contact-message" rows="5" placeholder="Écrivez votre message ici..." disabled={isContactSubmitting} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.8rem', color: '#fff', fontFamily: 'var(--font-body)', resize: 'vertical' }}></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isContactSubmitting}>
                                            {isContactSubmitting ? 'TRANSMISSION...' : 'TRANSMETTRE LE MESSAGE'}
                                        </button>
                                    </form>
                                    {contactStatus === 'success' && (
                                        <div className="form-notification success-msg" style={{marginTop: '1rem', color: 'var(--state-success)', background: 'rgba(0, 255, 135, 0.1)', padding: '0.8rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                            <span className="notif-icon">✓</span>
                                            <span>Message transmis avec succès sur des canaux cryptés.</span>
                                        </div>
                                    )}
                                    {contactStatus === 'error' && (
                                        <div className="form-notification error-msg" style={{marginTop: '1rem', color: '#ff5f56', background: 'rgba(255, 95, 86, 0.1)', padding: '0.8rem', borderRadius: '8px'}}>
                                            <span>Échec de la transmission du message. Veuillez réessayer.</span>
                                        </div>
                                    )}
                                    {contactStatus && contactStatus !== 'success' && contactStatus !== 'error' && (
                                        <div className="form-notification error-msg" style={{marginTop: '1rem', color: '#ff5f56', background: 'rgba(255, 95, 86, 0.1)', padding: '0.8rem', borderRadius: '8px'}}>
                                            <span>{contactStatus}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>
                )}

                <footer className="main-footer">
                    <div className="footer-left">
                        <p>&copy; 2026 Aetheris Technologies Inc. Tous droits réservés.</p>
                        <p className="disclaimer">Les investissements en cryptomonnaie comportent un risque de marché élevé. Les performances passées ne garantissent pas les rendements futurs.</p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <a href="#" className="text-link" onClick={(e) => { e.preventDefault(); navigateTo('privacy'); }}>Politique de Confidentialité</a>
                            <a href="#" className="text-link" onClick={(e) => { e.preventDefault(); navigateTo('terms'); }}>Conditions Générales</a>
                        </div>
                    </div>
                    <div className="footer-right">
                        <button id="btn-admin-console" title="Accéder à la Console de Sécurité" onClick={() => { playBtnSound('secondary'); setActiveModal('admin'); }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                            <span>Protocole Système</span>
                        </button>
                    </div>
                </footer>
            </div>

            <Modals activeModal={activeModal} setActiveModal={setActiveModal} onTriggerDismantle={triggerDismantle} onLoginSuccess={handleLoginSuccess} />
        </>
    );
}

export default App;
