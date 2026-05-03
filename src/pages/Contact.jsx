import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Contact = () => {
    const [storeSettings, setStoreSettings] = useState({
        store_name: 'Ligña',
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
            <header className="app-header glass">
                <div className="container header-container">
                    <Link to="/" className="brand">
                        <img src={storeSettings.logo_url || "/logo.png"} alt={`${storeSettings.store_name} Logo`} style={{ height: '48px', width: '48px' }} />
                    </Link>
                    <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Link to="/" className="nav-link">Home</Link>
                    </nav>
                </div>
            </header>

            <main className="container" style={{ padding: '120px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }} className="fade-in">
                    <h1 style={{ fontSize: '5rem', color: 'var(--primary-dark)', marginBottom: '32px' }}>Get in <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Touch</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>We'd love to hear from you! Visit us or reach out through any of the channels below.</p>
                </div>

                <div className="contact-details-centered" style={{ maxWidth: '600px', margin: '0 auto 100px', display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in-up">
                    <div className="contact-card" style={{ background: 'var(--white)', padding: '48px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center', transition: 'var(--transition)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: 'var(--bg-dark)', width: '64px', height: '64px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                            <MapPin size={32} />
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Our Location</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                            {storeSettings.address}
                        </p>
                    </div>

                    <div className="contact-card" style={{ background: 'var(--white)', padding: '48px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center', transition: 'var(--transition)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: 'var(--bg-dark)', width: '64px', height: '64px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                            <Phone size={32} />
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Contact</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7', fontWeight: 600 }}>
                            {storeSettings.contact}
                        </p>
                    </div>

                    <div className="contact-card" style={{ background: 'var(--white)', padding: '48px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center', transition: 'var(--transition)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: 'var(--bg-dark)', width: '64px', height: '64px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                            <Clock size={32} />
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Operating Hours</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                            Open daily from:<br />
                            <strong style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>{formatTime(storeSettings.open_time)} - {formatTime(storeSettings.close_time)}</strong>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--primary-dark)', color: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '100px 40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }} className="fade-in-up">
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>

                    <h2 style={{ fontSize: '4rem', marginBottom: '24px', color: 'var(--white)' }}>Stay Connected</h2>
                    <p style={{ marginBottom: '48px', color: 'rgba(255,255,255,0.6)', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto 48px', lineHeight: '1.8' }}>Follow our journey on social media for exclusive updates, behind-the-scenes looks, and special treats.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '18px 48px', fontSize: '1.1rem', background: 'var(--white)', color: 'var(--primary-dark)' }}>
                            <Facebook size={24} /> Facebook
                        </a>
                        <a href="mailto:contact@ligna.com" className="btn-primary" style={{ padding: '18px 48px', fontSize: '1.1rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'var(--white)' }}>
                            <Mail size={24} /> Email Us
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
