import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Contact = () => {
    const [storeSettings, setStoreSettings] = useState({
        store_name: 'Ligña Resto',
        address: 'Your Address Here',
        contact: '09XX XXX XXXX',
        open_time: '10:00',
        close_time: '23:00',
        logo_url: '/logo.png'
    });

    useEffect(() => {
        const fetchStoreSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').limit(1).single();
            if (data) setStoreSettings(data);
        };
        fetchStoreSettings();
    }, []);

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    return (
        <div className="page-wrapper">
            <header className="app-header">
                <div className="container header-container">
                    <Link to="/" className="brand">
                        <img src={storeSettings.logo_url || "/logo.png"} alt={`${storeSettings.store_name} Logo`} style={{ height: '42px', width: '42px', objectFit: 'cover', borderRadius: '50%' }} />
                        <div className="brand-text">
                            <span className="brand-name" style={{ color: 'var(--primary)' }}>Ligña Resto</span>
                        </div>
                    </Link>
                    <nav className="header-nav" style={{ display: 'flex', gap: '20px' }}>
                        <Link to="/contact" className="btn-primary" style={{ background: '#eab308', color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Contact</Link>
                    </nav>
                </div>
            </header>

            <main className="container" style={{ padding: '80px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#000', marginBottom: '15px' }}>Get in <span style={{ color: '#666' }}>Touch</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We'd love to hear from you! Visit us or order online.</p>
                </div>

                <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    <div className="contact-card" style={{ background: '#ffffff', padding: '40px', borderRadius: '2px', border: '1px solid #f0f0f0', textAlign: 'center', transition: 'transform 0.3s ease', color: '#1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#f5f5f5', width: '70px', height: '70px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#000', transform: 'rotate(-5deg)' }}>
                            <MapPin size={32} />
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.4rem', fontWeight: 800 }}>Our Location</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                            {storeSettings.address}
                        </p>
                    </div>

                    <div className="contact-card" style={{ background: '#ffffff', padding: '40px', borderRadius: '2px', border: '1px solid #f0f0f0', textAlign: 'center', transition: 'transform 0.3s ease', color: '#1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#f5f5f5', width: '70px', height: '70px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#000', transform: 'rotate(5deg)' }}>
                            <Phone size={32} />
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.4rem', fontWeight: 800 }}>Contact</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', fontWeight: 600 }}>
                            {storeSettings.contact}
                        </p>
                    </div>

                    <div className="contact-card" style={{ background: '#ffffff', padding: '40px', borderRadius: '2px', border: '1px solid #f0f0f0', textAlign: 'center', transition: 'transform 0.3s ease', color: '#1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#f5f5f5', width: '70px', height: '70px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#000', transform: 'rotate(-3deg)' }}>
                            <Clock size={32} />
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.4rem', fontWeight: 800 }}>Operating Hours</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                            Open daily from:<br />
                            <strong style={{ color: '#000', fontSize: '1.1rem', fontWeight: 800 }}>{formatTime(storeSettings.open_time)} - {formatTime(storeSettings.close_time)}</strong>
                        </p>
                    </div>
                </div>

                <div style={{ background: '#000', color: '#fff', borderRadius: '2px', padding: '80px 40px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Stay Connected</h2>
                    <p style={{ marginBottom: '40px', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px', fontWeight: 500 }}>Follow us for updates, special offers, and a look behind the scenes!</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="btn-social" style={{ background: '#fff', color: '#000', padding: '18px 40px', borderRadius: '2px', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }}>
                            <Facebook size={22} />
                            Facebook
                        </a>
                        <a href="mailto:contact@lignaresto.com" className="btn-social" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '18px 40px', borderRadius: '2px', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)', transition: 'transform 0.3s' }}>
                            <Mail size={22} />
                            Email Us
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
