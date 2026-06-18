import React, { useState, useEffect } from 'react';
import { playCoinClink, playChaChing } from '../utils/audioUtils';

export default function ProfitCalculator({ onCalculateInteraction }) {
    const [initial, setInitial] = useState(10000);
    const [monthly, setMonthly] = useState(500);
    const [annualRate, setAnnualRate] = useState(18);
    const [years, setYears] = useState(5);

    const formatCurrency = (val) => '$' + Math.round(val).toLocaleString();

    // Derived states
    const n = 12; // monthly compounding
    const periods = n * years;
    const monthlyRate = (annualRate / 100) / n;

    const fvInitial = initial * Math.pow(1 + monthlyRate, periods);
    let fvAnnuity = 0;
    if (monthlyRate > 0) {
        fvAnnuity = monthly * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
    } else {
        fvAnnuity = monthly * periods;
    }

    const totalPortfolio = fvInitial + fvAnnuity;
    const totalInvested = initial + (monthly * periods);
    const interestEarned = Math.max(0, totalPortfolio - totalInvested);

    const total = totalInvested + interestEarned;
    const principalPct = total > 0 ? (totalInvested / total) * 100 : 100;
    const interestPct = total > 0 ? (interestEarned / total) * 100 : 0;

    const handleInput = (setter) => (e) => {
        const val = parseFloat(e.target.value);
        setter(val);
        const pitchShift = 0.85 + Math.random() * 0.3;
        playCoinClink(pitchShift);
        if (onCalculateInteraction) onCalculateInteraction();
    };

    return (
        <div className="card glass-card calculator-card" id="profit-calculator">
            <div className="card-shine"></div>
            <div className="card-header">
                <span className="card-icon">⚡</span>
                <h2>Calculateur de Valeur Future</h2>
            </div>
            <div className="calculator-inputs">
                <div className="input-group">
                    <div className="input-labels">
                        <label htmlFor="calc-initial">Capital Initial</label>
                        <span className="input-val-display" id="display-initial">{formatCurrency(initial)}</span>
                    </div>
                    <input type="range" id="calc-initial" min="1000" max="250000" step="1000" value={initial} onChange={handleInput(setInitial)} />
                </div>

                <div className="input-group">
                    <div className="input-labels">
                        <label htmlFor="calc-monthly">Ajout Mensuel</label>
                        <span className="input-val-display" id="display-monthly">{formatCurrency(monthly)}</span>
                    </div>
                    <input type="range" id="calc-monthly" min="0" max="10000" step="100" value={monthly} onChange={handleInput(setMonthly)} />
                </div>

                <div className="input-group-row">
                    <div className="input-group half">
                        <div className="input-labels">
                            <label htmlFor="calc-return">Rendement Annuel (%)</label>
                            <span className="input-val-display" id="display-return">{Math.round(annualRate)}%</span>
                        </div>
                        <input type="range" id="calc-return" min="5" max="80" step="1" value={annualRate} onChange={handleInput(setAnnualRate)} />
                    </div>
                    <div className="input-group half">
                        <div className="input-labels">
                            <label htmlFor="calc-years">Durée (Années)</label>
                            <span className="input-val-display" id="display-years">{years} Année{years > 1 ? 's' : ''}</span>
                        </div>
                        <input type="range" id="calc-years" min="1" max="20" step="1" value={years} onChange={handleInput(setYears)} />
                    </div>
                </div>
            </div>

            <div className="card-divider"></div>

            <div className="calculator-results">
                <div className="results-grid">
                    <div className="result-box highlighted">
                        <span className="result-label">PORTFEUILLE PROJETÉ</span>
                        <span className="result-value" id="res-total-value">{formatCurrency(totalPortfolio)}</span>
                    </div>
                    <div className="result-box">
                        <span className="result-label">CAPITAL TOTAL</span>
                        <span className="result-value" id="res-total-principal">{formatCurrency(totalInvested)}</span>
                    </div>
                    <div className="result-box">
                        <span className="result-label">INTÉRÊTS GAGNÉS</span>
                        <span className="result-value pos" id="res-total-interest">{formatCurrency(interestEarned)}</span>
                    </div>
                </div>

                <div className="visualizer-container">
                    <div className="visualizer-labels">
                        <span>Capital</span>
                        <span>Intérêts</span>
                    </div>
                    <div className="bar-visualizer">
                        <div className="bar-fill principal-fill" style={{ width: `${principalPct}%` }}></div>
                        <div className="bar-fill interest-fill" style={{ width: `${interestPct}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
