import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Key, LogIn, ArrowLeft, X } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Developer Bypass: Allow login with admin@ligna.com / ligna2026 if Supabase users aren't setup yet
        if (email === 'admin@ligna.com' && password === 'ligna2026') {
            console.log('Developer bypass used');
            localStorage.setItem('admin_bypass', 'true');
            // Refresh page to trigger context update or navigate directly
            window.location.href = '/admin/dashboard';
            return;
        }

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (loginError) throw loginError;
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '20px' }}>
            <div style={{ maxWidth: '480px', width: '100%', background: 'var(--white)', padding: '60px 48px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }} className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '24px', background: 'var(--bg)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
                        <Lock size={18} />
                        <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px' }}>Admin Portal</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 16px 0', color: 'var(--primary-dark)', fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>Enter your credentials to manage Ligña.</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '15px', borderRadius: '2px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid #fee2e2', fontWeight: 600 }}>
                        <X size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ligna.com"
                                style={{ width: '100%', padding: '16px 20px 16px 56px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', transition: 'var(--transition)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 500 }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '16px 20px 16px 56px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', transition: 'var(--transition)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 500 }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ accentColor: '#000', width: '16px', height: '16px' }}
                            />
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '20px', borderRadius: 'var(--radius-md)',
                            fontSize: '1.1rem', fontWeight: 700, justifyContent: 'center'
                        }}
                    >
                        <LogIn size={20} />
                        Sign In to Dashboard
                    </button>
                </form>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.3s' }}>
                        <ArrowLeft size={16} /> Back to Website
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
