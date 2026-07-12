import React, { useState, useRef, useEffect } from 'react';

const COUNTRIES = [
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
    { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
    { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
    { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
    { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹' },
    { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮' },
    { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
    { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
    { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
    { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
    { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
];

export default function CountryDropdown({ defaultValue = 'CH', onChange, name = "countryCode", style = {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [value, setValue] = useState(defaultValue);
    const dropdownRef = useRef(null);

    const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES.find(c => c.code === 'CH');

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCountries = COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.dial.includes(search)
    );

    return (
        <div ref={dropdownRef} className="country-dropdown-container" style={{ position: 'relative', width: style.width || '120px' }}>
            <select name={name} value={value} onChange={() => {}} style={{ display: 'none' }}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>

            <div 
                className="country-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(0, 255, 135, 0.4)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '0.8rem 0.5rem',
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 10px rgba(0, 255, 135, 0.2)' : 'none',
                    transition: 'all 0.2s',
                    ...style
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{selectedCountry?.flag}</span>
                    <span style={{ fontWeight: '500' }}>{selectedCountry?.dial}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </div>

            {isOpen && (
                <div 
                    className="country-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: '-50px',
                        marginTop: '8px',
                        background: '#0d1117',
                        border: '1px solid rgba(0, 255, 135, 0.4)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '220px'
                    }}
                >
                    <div style={{ padding: '8px' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {filteredCountries.map(c => (
                            <div
                                key={c.code}
                                onClick={() => {
                                    setValue(c.code);
                                    if (onChange) onChange({ target: { name, value: c.code } });
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                style={{
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    background: value === c.code ? 'rgba(0, 255, 135, 0.15)' : 'transparent',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = value === c.code ? 'rgba(0, 255, 135, 0.15)' : 'transparent'}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
                                <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.9rem' }}>{c.name}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{c.dial}</span>
                            </div>
                        ))}
                        {filteredCountries.length === 0 && (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                No results
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
