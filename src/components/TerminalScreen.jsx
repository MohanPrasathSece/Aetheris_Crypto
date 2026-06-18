import React, { useState, useEffect, useRef } from 'react';
import { playTickSound } from '../utils/audioUtils';

export default function TerminalScreen({ isVisible, onRestoreSuccess }) {
    const [lines, setLines] = useState([]);
    const [showRecovery, setShowRecovery] = useState(false);
    const [restoreKey, setRestoreKey] = useState('');
    const [restoreError, setRestoreError] = useState(false);
    const inputRef = useRef(null);

    const logSequence = [
        { text: '>>> SECURE CONNECTION SHUTDOWN...', color: '#ff5f56', delay: 500 },
        { text: '>>> DISMANTLING WEB PACKAGES [OK]', color: '#1aff80', delay: 850 },
        { text: '>>> DESTROYING 3D BITCOIN NODE ASSETS [OK]', color: '#1aff80', delay: 1200 },
        { text: '>>> CORE ENGINE SHUTDOWN... [AETHERIS_OFFLINE]', color: '#ff5f56', delay: 1550 },
        { text: 'SYSTEM LOCKED', color: '#ff3838', type: 'header', delay: 1900 }
    ];

    useEffect(() => {
        if (isVisible) {
            setLines([]);
            setShowRecovery(false);
            setRestoreKey('');
            setRestoreError(false);

            const timeouts = [];
            
            logSequence.forEach((log, idx) => {
                const t = setTimeout(() => {
                    setLines(prev => [...prev, log]);
                    playTickSound();
                    
                    if (idx === logSequence.length - 1) {
                        setTimeout(() => {
                            setShowRecovery(true);
                        }, 350);
                    }
                }, log.delay);
                timeouts.push(t);
            });

            return () => timeouts.forEach(clearTimeout);
        }
    }, [isVisible]);

    useEffect(() => {
        if (showRecovery && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showRecovery]);

    const attemptRestore = () => {
        const entered = restoreKey.toLowerCase().trim();
        if (entered === 'restore' || entered === 'aetheris' || entered === 'admin') {
            if (onRestoreSuccess) onRestoreSuccess();
        } else {
            setRestoreError(true);
            playTickSound();
            setTimeout(() => {
                setRestoreError(false);
            }, 3000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            attemptRestore();
        }
    };

    return (
        <div id="system-terminated-screen" className={isVisible ? '' : 'hidden'}>
            <div className="terminal-content">
                <div className="terminal-header">
                    <span className="terminal-dot red"></span>
                    <span className="terminal-dot yellow"></span>
                    <span className="terminal-dot green"></span>
                    <span className="terminal-title">SYSTEM_CORE_LOG</span>
                </div>
                <div className="terminal-body">
                    {/* Default messages */}
                    <p className="error-msg">{'>>> SYSTEM INTRUSION DETECTED...'}</p>
                    <p className="error-msg">{'>>> INITIALIZING DISMANTLE PROTOCOL...'}</p>
                    <p className="error-msg">{'>>> TERMINATING WEB ASSETS...'}</p>
                    <p className="error-msg">{'>>> DESTRUCTING 3D_BITCOIN_CORE...'}</p>

                    {/* Printed lines */}
                    {lines.map((line, idx) => {
                        if (line.type === 'header') {
                            return <h1 key={idx} className="blink-text">{line.text}</h1>;
                        }
                        return <p key={idx} style={{ color: line.color }}>{line.text}</p>;
                    })}

                    <p className="system-status">All connections severed. Web presence offline.</p>
                    
                    <div className={`recovery-box ${showRecovery ? '' : 'hidden'}`}>
                        <p className="restore-hint">Secure restore interface: Enter recovery key</p>
                        <div className="restore-input-group">
                            <input 
                                type="password" 
                                id="restore-key" 
                                placeholder="••••••••" 
                                autoComplete="off"
                                value={restoreKey}
                                onChange={e => setRestoreKey(e.target.value)}
                                onKeyDown={handleKeyDown}
                                ref={inputRef}
                            />
                            <button id="btn-restore" onClick={attemptRestore}>RESTORE SYSTEM</button>
                        </div>
                        <span id="restore-error" className={restoreError ? '' : 'hidden'}>INVALID SECURITY CREDENTIALS</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
