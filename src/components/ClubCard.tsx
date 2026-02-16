import React from 'react';
import { Building2 } from 'lucide-react';

interface ClubCardProps {
    abbreviation: string;
    name: string;
    color: string;
}

export default function ClubCard({ abbreviation, name, color }: ClubCardProps) {
    return (
        <div
            className="admin-card"
            style={{
                borderTop: `4px solid ${color}`,
                padding: 0,
                transition: 'all 0.3s ease',
            }}
        >
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                            border: `1.5px solid ${color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Building2 size={20} style={{ color }} />
                    </div>
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                color: '#1E3A8A',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.3,
                            }}
                        >
                            {abbreviation}
                        </h3>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '0.8125rem',
                                color: '#475569',
                                lineHeight: 1.4,
                            }}
                        >
                            {name}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        alignSelf: 'flex-start',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '100px',
                        background: `${color}10`,
                        border: `1px solid ${color}20`,
                    }}
                >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Club Afiliado
                    </span>
                </div>
            </div>
        </div>
    );
}
