'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Lock, Mail, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError('Credenciales incorrectas');
                return;
            }

            // Redirect handled by middleware mostly, but explicit push helps
            router.push('/admin');
            router.refresh();
        } catch {
            setError('Error de conexión al iniciar sesión');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
            }}>
                {/* Branding Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        padding: '1rem',
                        margin: '0 auto 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Image
                            src="/logo fpdt.svg"
                            alt="FPT Logo"
                            width={90}
                            height={90}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#171717',
                        letterSpacing: '-0.03em',
                        marginBottom: '0.5rem'
                    }}>
                        Panel Administrativo
                    </h2>
                    <p style={{
                        color: '#737373',
                        fontSize: '0.9375rem'
                    }}>
                        Federación Paraguaya de Tiro
                    </p>
                </div>

                {/* Login Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.04)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {error && (
                            <div style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#991B1B',
                                fontSize: '0.875rem'
                            }}>
                                <AlertTriangle size={18} strokeWidth={1.5} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#171717',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem'
                            }}>
                                Email Corporativo
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#A3A3A3',
                                    display: 'flex', alignItems: 'center'
                                }}>
                                    <Mail size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@dominio.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        background: '#FAFAFA',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '10px',
                                        fontSize: '0.9375rem',
                                        color: '#171717',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    className="login-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#171717',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem'
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#A3A3A3',
                                    display: 'flex', alignItems: 'center'
                                }}>
                                    <Lock size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        background: '#FAFAFA',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '10px',
                                        fontSize: '0.9375rem',
                                        color: '#171717',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    className="login-input"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                padding: '0.875rem',
                                background: '#000000',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 500,
                                fontSize: '0.9375rem',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.7 : 1,
                                transition: 'transform 0.1s ease'
                            }}
                            className="login-btn"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-sm" style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    Autenticando...
                                </>
                            ) : (
                                <>
                                    Ingresar al Sistema
                                    <ArrowRight size={18} strokeWidth={1.5} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: '#A3A3A3',
                    fontSize: '0.75rem'
                }}>
                    <ShieldCheck size={14} strokeWidth={1.5} />
                    <span>Acceso Seguro · Solo Personal Autorizado</span>
                </div>
            </div>

            <style jsx global>{`
                .login-input:focus {
                    background: white !important;
                    border-color: rgba(0,0,0,0.15) !important;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.03);
                }
                .login-btn:active {
                    transform: scale(0.98);
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
