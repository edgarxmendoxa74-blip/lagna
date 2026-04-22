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

        // Developer Bypass: Allow login with admin@lignaresto.com / ligna2026 if Supabase users aren't setup yet
        if (email === 'admin@lignaresto.com' && password === 'ligna2026') {
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
        <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '20px' }}>
            <div style={{ maxWidth: '450px', width: '100%', background: '#ffffff', padding: '50px 40px', borderRadius: '2px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', border: '1px solid #eee' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#000', marginBottom: '15px' }}>
                        <Lock size={18} />
                        <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1.5px' }}>Admin Portal</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#000', fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sign in to manage Ligña Resto.</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '15px', borderRadius: '2px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid #fee2e2', fontWeight: 600 }}>
                        <X size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: '#444' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@lignaresto.com"
                                style={{ width: '100%', padding: '15px 15px 15px 50px', borderRadius: '2px', border: '1px solid #eee', fontSize: '1rem', outline: 'none', transition: 'all 0.3s', background: '#f9f9f9', color: '#000', fontWeight: 500 }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: '#444' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '15px 15px 15px 50px', borderRadius: '2px', border: '1px solid #eee', fontSize: '1rem', outline: 'none', transition: 'all 0.3s', background: '#f9f9f9', color: '#000', fontWeight: 500 }}
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
                            width: '100%', padding: '18px', border: 'none', borderRadius: '2px',
                            fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'all 0.3s'
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
