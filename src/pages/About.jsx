import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Coffee, Heart, Star, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const About = () => {
    const [storeSettings, setStoreSettings] = useState({
        store_name: 'Ligña',
        logo_url: '/logo.png'
    });

    useEffect(() => {
        const fetchStoreSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').limit(1).single();
            if (data) setStoreSettings(data);
        };
        fetchStoreSettings();
    }, []);

    return (
        <div className="page-wrapper">
            <header className="app-header glass">
                <div className="container header-container">
                    <Link to="/" className="brand">
                        <img src={storeSettings.logo_url || "/logo.png"} alt={`${storeSettings.store_name} Logo`} style={{ height: '48px', width: '48px' }} />
                    </Link>
                    <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                    </nav>
                </div>
            </header>

            <main className="container" style={{ padding: '120px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '100px' }} className="fade-in">
                    <h1 style={{ fontSize: '5rem', color: 'var(--primary-dark)', marginBottom: '32px' }}>Our Culinary <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Journey</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>Experience the heart and soul of Ligña. Exceptional food, premium atmosphere, and memories that last a lifetime.</p>
                </div>

                <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '100px', alignItems: 'center', marginBottom: '140px', display: 'grid' }} className="fade-in-up">
                    <div style={{ order: 2 }}>
                        <h2 style={{ fontSize: '3.5rem', marginBottom: '32px', color: 'var(--primary-dark)' }}>A Passion for <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Excellence</span></h2>
                        <p style={{ marginBottom: '24px', lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            {storeSettings.store_name} was born out of a desire to create a dining experience that blends tradition with modern sophistication. We believe that every meal is an opportunity to create lasting memories.
                        </p>
                        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            From our carefully curated menu to our elegant atmosphere, every detail at Ligña is designed to provide you with an unforgettable experience. We use only the finest ingredients, sourced locally and globally, to ensure each dish is a masterpiece.
                        </p>
                    </div>
                    <div style={{ order: 1 }}>
                        <img
                            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80"
                            alt="Presentation"
                            style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', objectFit: 'cover', height: '600px' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '100px' }} className="fade-in-up">
                    <div style={{ background: 'var(--white)', padding: '60px 40px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ color: 'var(--accent)', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}><Star size={48} /></div>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.75rem', color: 'var(--primary-dark)' }}>Premium Quality</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>We never compromise. Only the finest ingredients and culinary techniques are used in our kitchen.</p>
                    </div>
                    <div style={{ background: 'var(--white)', padding: '60px 40px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ color: 'var(--accent)', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}><Heart size={48} /></div>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.75rem', color: 'var(--primary-dark)' }}>Crafted with Care</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Every dish is a work of art, prepared with precision and passion by our expert chefs.</p>
                    </div>
                    <div style={{ background: 'var(--white)', padding: '60px 40px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ color: 'var(--accent)', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}><Users size={48} /></div>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.75rem', color: 'var(--primary-dark)' }}>Exquisite Service</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Our commitment to excellence extends to our service, ensuring every guest feels like royalty.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default About;
