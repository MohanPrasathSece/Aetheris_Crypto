import React, { useState, useEffect } from 'react';
import { playBtnSound } from '../utils/audioUtils';
import { submitLead } from '../utils/crm';

const CANDLE_DATA = Array.from({ length: 20 }, (_, i) => {
    const isUp = Math.random() > 0.45;
    const height = Math.random() * 40 + 10;
    const top = Math.random() * 30 + 10;
    return { isUp, height, top };
});

export default function EducationalHub() {
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState('');

    const tabs = [
        { id: 0, title: 'Intro Crypto', content: 'La cryptomonnaie est une monnaie numérique ou virtuelle sécurisée par la cryptographie...' },
        { id: 1, title: 'Blockchain', content: 'Une blockchain est un registre distribué appliqué par un réseau disparate d\'ordinateurs...' },
        { id: 2, title: 'Investissement', content: 'L\'investissement dans les actifs numériques implique l\'acquisition de cryptomonnaies dans l\'espoir de générer un rendement...' },
        { id: 3, title: 'Bases du Trading', content: 'Le trading implique l\'achat et la vente fréquents d\'actifs pour tirer parti des fluctuations de prix à court terme.' },
        { id: 4, title: 'Analyse IA', content: 'L\'Intelligence Artificielle analyse des ensembles de données massifs pour prédire les tendances du marché et optimiser l\'exécution des transactions.' },
        { id: 5, title: 'Diversification', content: 'Répartir les investissements entre diverses classes d\'actifs réduit le risque global du portefeuille.' },
        { id: 6, title: 'Gestion des Risques', content: 'Utilisation de stratégies telles que les ordres stop-loss et le dimensionnement des positions pour limiter les pertes potentielles.' },
        { id: 7, title: 'Tendances du Marché', content: 'Comprendre les cycles haussiers et baissiers est crucial pour chronométrer les entrées et sorties du marché.' },
        { id: 8, title: 'Sécurité', content: 'Utilisation de portefeuilles matériels, 2FA et de stockage à froid pour protéger les actifs numériques contre les accès non autorisés.' },
        { id: 9, title: 'FAQ', content: 'Questions fréquemment posées concernant les frais de gaz, la vitesse des transactions et la congestion du réseau.' },
    ];

    useEffect(() => {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [activeTab]);

    const handleTabClick = (index) => {
        playBtnSound('secondary');
        setActiveTab(index);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus('');

        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get('name').split(' ')[0] || '',
            last_name: formData.get('name').split(' ').slice(1).join(' ') || '',
            email: formData.get('email'),
            phone: formData.get('phone'),
            description: formData.get('message') || 'Demande depuis le Hub Éducatif'
        };

        try {
            await submitLead(data);
            setFormStatus('success');
            e.target.reset();
            setTimeout(() => setFormStatus(''), 5000);
        } catch (error) {
            setFormStatus('error');
            setTimeout(() => setFormStatus(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="content-wrapper">
            <section className="section active">
                <div className="section-header">
                    <span className="glow-tag">BASE DE CONNAISSANCES</span>
                    <h2>Hub <span className="text-gradient">Éducatif</span></h2>
                    <p className="section-desc">
                        Explorez nos ressources complètes pour comprendre les actifs numériques, la technologie blockchain et les stratégies de trading avancées.
                    </p>
                </div>

                <div className="card glass-card scroll-reveal reveal-delay-1" style={{ marginBottom: '4rem', overflow: 'hidden' }}>
                    <div className="mac-window-header">
                        <div className="mac-dots">
                            <span className="mac-dot red"></span>
                            <span className="mac-dot yellow"></span>
                            <span className="mac-dot green"></span>
                        </div>
                        <div className="mac-tabs">
                            {tabs.map((tab, idx) => (
                                <button 
                                    key={tab.id} 
                                    className={`mac-tab ${activeTab === idx ? 'active' : ''}`}
                                    onClick={() => handleTabClick(idx)}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mac-window-content" style={{ position: 'relative', overflow: 'hidden' }}>
                        <style>
                            {`
                                @keyframes scanLine {
                                    0% { top: -10%; opacity: 0; }
                                    10% { opacity: 1; }
                                    90% { opacity: 1; }
                                    100% { top: 110%; opacity: 0; }
                                }
                                @keyframes dataStream {
                                    0% { left: -50%; }
                                    100% { left: 110%; }
                                }
                                @keyframes nodePulse {
                                    0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 5px var(--accent-cyan); }
                                    100% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 15px var(--accent-cyan); }
                                }
                                @keyframes rotateRing {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                @keyframes barPulse {
                                    0% { transform: scaleX(0.8); opacity: 0.8; }
                                    100% { transform: scaleX(1.1); opacity: 1; }
                                }
                                @keyframes floatUp {
                                    0% { transform: translateY(0) scale(0.8); opacity: 0; }
                                    50% { opacity: 0.6; }
                                    100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
                                }
                                .data-node {
                                    animation: nodePulse 2s infinite alternate;
                                }
                            `}
                        </style>

                        {/* Animated background grid */}
                        <div className="scanning-grid" style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(rgba(0, 242, 254, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.03) 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                            zIndex: 0, pointerEvents: 'none'
                        }}>
                            <div className="scan-line" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                background: 'var(--accent-cyan)',
                                boxShadow: '0 0 20px var(--accent-cyan), 0 0 40px var(--accent-cyan)',
                                animation: 'scanLine 3s linear infinite'
                            }}></div>
                        </div>

                        {/* Floating Background Particles */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100 + 20}%`,
                                    width: `${Math.random() * 4 + 2}px`,
                                    height: `${Math.random() * 4 + 2}px`,
                                    background: i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-pink)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px currentColor',
                                    animation: `floatUp ${Math.random() * 3 + 3}s linear infinite`,
                                    animationDelay: `${Math.random() * 2}s`
                                }}></div>
                            ))}
                        </div>

                        <div className="tab-content animate-modal-enter" key={activeTab} style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.8rem', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{tabs[activeTab].title}</h3>
                                    <p style={{ lineHeight: '1.8', marginTop: '1rem', color: '#b0b5be', maxWidth: '800px' }}>
                                        {tabs[activeTab].content}
                                    </p>
                                </div>
                                
                                {/* Animated Status Ring */}
                                <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed var(--accent-cyan)', borderRadius: '50%', animation: 'rotateRing 10s linear infinite', opacity: 0.5 }}></div>
                                    <div style={{ position: 'absolute', width: '70%', height: '70%', border: '2px solid var(--accent-pink)', borderRadius: '50%', animation: 'rotateRing 5s linear infinite reverse', opacity: 0.5 }}></div>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--state-success)', borderRadius: '50%', boxShadow: '0 0 10px var(--state-success)' }}></div>
                                </div>
                            </div>
                            
                            {/* Neural Network Processing Visual */}
                            <div className="neural-network-visual" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '3rem 0', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(0,242,254,0.1)' }}>
                                <div className="data-node" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-pink))', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: '#fff', boxShadow: '0 0 10px #fff', animation: 'dataStream 2s linear infinite' }}></div>
                                </div>
                                <div className="data-node" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-pink)', animationDelay: '0.5s' }}></div>
                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-gold))', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: '#fff', boxShadow: '0 0 10px #fff', animation: 'dataStream 2.5s linear infinite', animationDelay: '0.7s' }}></div>
                                </div>
                                <div className="data-node" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-gold)', animationDelay: '1s' }}></div>
                            </div>

                            {/* Live Server Metrics Visualization */}
                            <div className="server-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'var(--border-light)' }}>
                                        <div style={{ width: '85%', height: '100%', background: 'var(--accent-cyan)', transformOrigin: 'left', animation: 'barPulse 1.5s infinite alternate' }}></div>
                                    </div>
                                    <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>LATENCE RÉSEAU</h5>
                                    <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--accent-cyan)' }}>
                                        <span style={{ animation: 'nodePulse 2s infinite' }}>14</span> ms
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'var(--border-light)' }}>
                                        <div style={{ width: '62%', height: '100%', background: 'var(--accent-pink)', transformOrigin: 'left', animation: 'barPulse 2.1s infinite alternate-reverse' }}></div>
                                    </div>
                                    <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>TAUX DE HACHAGE</h5>
                                    <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--accent-pink)' }}>
                                        128.4 TH/s
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'var(--border-light)' }}>
                                        <div style={{ width: '96%', height: '100%', background: 'var(--state-success)', transformOrigin: 'left', animation: 'barPulse 3s infinite alternate' }}></div>
                                    </div>
                                    <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>TEMPS DE DISPONIBILITÉ</h5>
                                    <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--state-success)' }}>
                                        99.99%
                                    </div>
                                </div>
                            </div>

                            {/* Animated Candlestick Chart Visualization */}
                            <div className="candlestick-chart">
                                {CANDLE_DATA.map((candle, idx) => (
                                    <div key={idx} className="candle-wrapper">
                                        <div className="wick" style={{ height: `${candle.height + 20}%`, top: `${candle.top - 10}%` }}></div>
                                        <div 
                                            className={`candle ${candle.isUp ? 'up' : 'down'}`} 
                                            style={{ 
                                                height: `${candle.height}%`, 
                                                top: `${candle.top}%`,
                                                animationDelay: `${idx * 0.05}s`
                                            }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-grid" style={{ marginTop: '4rem' }}>
                    <div className="contact-info-panel">
                        <div className="card glass-card contact-info-card scroll-reveal">
                            <div className="card-shine"></div>
                            <h3>Support Éducatif</h3>
                            <p className="address">Besoin de précisions sur des sujets avancés ? Nos spécialistes sont là pour vous guider.</p>
                            
                            <div className="info-link-row">
                                <span className="info-label">Ligne Directe :</span>
                                <a href="tel:+18005550190" className="info-val">+1 (800) 555-0190</a>
                            </div>
                            <div className="info-link-row">
                                <span className="info-label">Email Support :</span>
                                <a href="mailto:support@aetheris.io" className="info-val">support@aetheris.io</a>
                            </div>
                        </div>
                    </div>

                    <div className="card glass-card contact-form-card scroll-reveal">
                        <div className="card-shine"></div>
                        <div className="card-header">
                            <h2>Soumettre une demande</h2>
                        </div>
                        <form id="edu-contact-form" autoComplete="off" onSubmit={handleContactSubmit}>
                            <div className="form-row">
                                <div className="form-field half">
                                    <label htmlFor="edu-name">Nom Complet</label>
                                    <input type="text" name="name" id="edu-name" placeholder="Jean Dupont" required disabled={isSubmitting} />
                                </div>
                                <div className="form-field half">
                                    <label htmlFor="edu-email">Adresse Email</label>
                                    <input type="email" name="email" id="edu-email" placeholder="jean@domaine.com" required disabled={isSubmitting} />
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="edu-phone">Numéro de Téléphone</label>
                                <input type="tel" name="phone" id="edu-phone" placeholder="+1 234 567 8900" required disabled={isSubmitting} />
                            </div>
                            <div className="form-field">
                                <label htmlFor="edu-message">Votre Message (Optionnel)</label>
                                <textarea name="message" id="edu-message" rows="5" placeholder="Écrivez votre message ici..." disabled={isSubmitting}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                                {isSubmitting ? 'TRANSMISSION...' : 'TRANSMETTRE LE MESSAGE'}
                            </button>
                        </form>
                        {formStatus === 'success' && (
                            <div className="form-notification success-msg" style={{marginTop: '1rem'}}>
                                <span className="notif-icon">✓</span>
                                <span>Message transmis avec succès sur des canaux cryptés.</span>
                            </div>
                        )}
                        {formStatus === 'error' && (
                            <div className="form-notification error-msg" style={{marginTop: '1rem', color: '#ff5f56'}}>
                                <span>Échec de la transmission du message. Veuillez réessayer.</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
