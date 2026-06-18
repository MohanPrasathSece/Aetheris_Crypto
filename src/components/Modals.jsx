import React, { useState, useEffect } from 'react';
import { playSwirlSound, playBtnSound } from '../utils/audioUtils';
import { authLogin, authSignup } from '../utils/auth';

export default function Modals({ 
    activeModal, 
    setActiveModal, 
    onTriggerDismantle,
    onLoginSuccess
}) {
    const [dismantleCode, setDismantleCode] = useState('');
    const [isDismantleValid, setIsDismantleValid] = useState(false);
    
    // Auth Form States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupError, setSignupError] = useState('');
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
            setSignupError('');
            setLoginError('');
        } else {
            document.body.style.overflow = '';
        }

        return () => { document.body.style.overflow = ''; };
    }, [activeModal]);

    const closeModal = () => {
        if (isSubmitting) return; // Prevent closing while processing
        playBtnSound('secondary');
        setActiveModal(null);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoginError('');
        playBtnSound('primary');
        
        const email = e.target.email.value;
        
        try {
            await authLogin(email);
            setIsSubmitting(false);
            closeModal();
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            setLoginError(error.message || 'Authentication failed.');
            setIsSubmitting(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSignupError('');
        setIsSubmitting(true);
        playBtnSound('primary');

        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get('name').split(' ')[0] || '',
            last_name: formData.get('name').split(' ').slice(1).join(' ') || '',
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        try {
            await authSignup(data);
            setIsSubmitting(false);
            closeModal();
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            setSignupError(error.message || 'Failed to establish node connection.');
            setIsSubmitting(false);
        }
    };

    const handleDismantleInput = (e) => {
        const val = e.target.value;
        setDismantleCode(val);
        setIsDismantleValid(val.toUpperCase() === 'DISMANTLE');
    };

    const handleDismantleSubmit = () => {
        playBtnSound('primary');
        closeModal();
        if (onTriggerDismantle) onTriggerDismantle();
    };

    const triggerGalaxyVortex = (e) => {
        const modalElement = e.currentTarget;
        if (modalElement.querySelector('.galaxy-vortex')) return;

        const vortex = document.createElement('div');
        vortex.className = 'galaxy-vortex';
        modalElement.appendChild(vortex);

        playSwirlSound();

        const colors = ['#00f2fe', '#7f00ff', '#e100ff', '#f3ba2f'];
        const totalParticles = 65;

        for (let i = 0; i < totalParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'galaxy-particle';

            const color = colors[Math.floor(Math.random() * colors.length)];
            const startRadius = Math.random() * 250 + 150;
            const startAngle = Math.random() * 360;
            const endRadius = Math.random() * 60 + 30;
            const spinCount = Math.random() * 3.5 + 2.0;
            const endAngle = startAngle + (spinCount * 360);

            const size = Math.random() * 6 + 3;
            const delay = Math.random() * 0.25;

            particle.style.setProperty('--color', color);
            particle.style.setProperty('--size', `${size}px`);
            particle.style.setProperty('--start-radius', `${startRadius}px`);
            particle.style.setProperty('--end-radius', `${endRadius}px`);
            particle.style.setProperty('--start-angle', `${startAngle}deg`);
            particle.style.setProperty('--end-angle', `${endAngle}deg`);
            particle.style.animationDelay = `${delay}s`;

            vortex.appendChild(particle);
        }

        setTimeout(() => {
            if (vortex.parentNode) vortex.remove();
        }, 1600);
    };

    useEffect(() => {
        if (activeModal) {
            const modals = document.querySelectorAll('.modal-card:not(.hidden)');
            modals.forEach(m => triggerGalaxyVortex({ currentTarget: m }));
        }
    }, [activeModal]);

    return (
        <>
            {/* Login Modal */}
            <div className={`modal-overlay ${activeModal === 'login' ? '' : 'hidden'}`} id="modal-login" onClick={(e) => { if(e.target === e.currentTarget) closeModal(); }}>
                <div className="card glass-card modal-card animate-modal-enter">
                    <button className="modal-close" onClick={closeModal} disabled={isSubmitting}>&times;</button>
                    <div className="modal-header">
                        <h2>Access Portal</h2>
                        <p>Authenticate to access the Educational Hub.</p>
                    </div>
                    {loginError && <p style={{color: '#ff5f56', textAlign: 'center', marginBottom: '1rem'}}>{loginError}</p>}
                    <form id="login-form" onSubmit={handleLoginSubmit}>
                        <div className="form-field">
                            <label htmlFor="login-email">Account Email</label>
                            <input type="email" name="email" id="login-email" placeholder="name@domain.com" required disabled={isSubmitting} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
                        </button>
                    </form>
                    <p className="modal-footer-text">Don't have an account? <span className="text-link" onClick={() => { if(!isSubmitting) { playBtnSound('secondary'); setActiveModal('signup'); } }}>Create one</span></p>
                </div>
            </div>

            {/* Sign Up Modal */}
            <div className={`modal-overlay ${activeModal === 'signup' ? '' : 'hidden'}`} id="modal-signup" onClick={(e) => { if(e.target === e.currentTarget) closeModal(); }}>
                <div className="card glass-card modal-card animate-modal-enter">
                    <button className="modal-close" onClick={closeModal} disabled={isSubmitting}>&times;</button>
                    <div className="modal-header">
                        <h2>Initialize Account</h2>
                        <p>Register to establish your nodes.</p>
                    </div>
                    {signupError && <p style={{color: '#ff5f56', textAlign: 'center', marginBottom: '1rem'}}>{signupError}</p>}
                    <form id="signup-form" onSubmit={handleSignupSubmit}>
                        <div className="form-field">
                            <label htmlFor="signup-name">Full Name</label>
                            <input type="text" name="name" id="signup-name" placeholder="John Doe" required disabled={isSubmitting} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="signup-email">Email Address</label>
                            <input type="email" name="email" id="signup-email" placeholder="john@domain.com" required disabled={isSubmitting} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="signup-phone">Phone Number</label>
                            <input type="tel" name="phone" id="signup-phone" placeholder="+1 234 567 8900" required disabled={isSubmitting} />
                        </div>
                        <div className="form-fieldcheckbox">
                            <input type="checkbox" id="signup-terms" required disabled={isSubmitting} />
                            <label htmlFor="signup-terms">I consent to market risk disclosure and yield protocols.</label>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE NODES'}
                        </button>
                    </form>
                    <p className="modal-footer-text">Already registered? <span className="text-link" onClick={() => { if(!isSubmitting) { playBtnSound('secondary'); setActiveModal('login'); } }}>Log In</span></p>
                </div>
            </div>

            {/* Admin Modal */}
            <div className={`modal-overlay ${activeModal === 'admin' ? '' : 'hidden'}`} id="modal-admin" onClick={(e) => { if(e.target === e.currentTarget) closeModal(); }}>
                <div className="card glass-card modal-card admin-card animate-modal-enter">
                    <button className="modal-close" onClick={closeModal}>&times;</button>
                    <div className="modal-header">
                        <h2 className="critical-text">⚠️ Asset Security Protocol</h2>
                        <p>Client authorization console. Initiates web package dismantle.</p>
                    </div>
                    <div className="admin-body">
                        <div className="security-warning">
                            <p><strong>CRITICAL WARNING:</strong> Executing this command triggers the 3D core breakdown. This will visually shatter the 3D assets, crumble the UI layout, and locking the webpage. Use only when asset disposal is authorized by the client.</p>
                        </div>
                        <div className="dismantle-controls">
                            <p className="dismantle-hint">Type <strong>DISMANTLE</strong> below to authorize:</p>
                            <input type="text" id="dismantle-confirm" placeholder="DISMANTLE" autoComplete="off" value={dismantleCode} onChange={handleDismantleInput} />
                            <button className={`btn btn-critical btn-block ${!isDismantleValid ? 'disabled' : ''}`} disabled={!isDismantleValid} onClick={handleDismantleSubmit}>EXECUTE DISMANTLE SIGNALS</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
