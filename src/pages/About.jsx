import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Coffee, Heart, Star, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const About = () => {
    const [storeSettings, setStoreSettings] = useState({
        store_name: 'Ligña Resto',
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
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#000', marginBottom: '20px' }}>Our <span style={{ color: '#666' }}>Culinary Journey</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>Experience the heart and soul of Ligña Resto. Exceptional food, premium atmosphere.</p>
                </div>

                <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center', marginBottom: '100px', display: 'grid' }}>
                    <div style={{ order: 2 }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#000', fontWeight: 800 }}>A Passion for <span style={{ color: '#666' }}>Excellence</span></h2>
                        <p style={{ marginBottom: '20px', lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            {storeSettings.store_name} was born out of a desire to create a dining experience that blends tradition with modern sophistication. We believe that every meal is an opportunity to create lasting memories.
                        </p>
                        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            From our carefully curated menu to our elegant atmosphere, every detail at Ligña Resto is designed to provide you with an unforgettable experience. We use only the finest ingredients, sourced locally and globally, to ensure each dish is a masterpiece.
                        </p>
                    </div>
                    <div style={{ order: 1 }}>
                        <img
                            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80"
                            alt="Presentation"
                            style={{ width: '100%', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', objectFit: 'cover', height: '500px', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                    <div style={{ background: '#ffffff', padding: '40px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#000', marginBottom: '20px' }}><Star size={40} fill="#000" /></div>
                        <h3 style={{ marginBottom: '10px', fontWeight: 800 }}>Premium Quality</h3>
                        <p style={{ color: 'var(--text-muted)' }}>We never compromise. Only the finest ingredients and culinary techniques are used in our kitchen.</p>
                    </div>
                    <div style={{ background: '#ffffff', padding: '40px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#000', marginBottom: '20px' }}><Heart size={40} fill="#000" /></div>
                        <h3 style={{ marginBottom: '10px', fontWeight: 800 }}>Crafted with Care</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Every dish is a work of art, prepared with precision and passion by our expert chefs.</p>
                    </div>
                    <div style={{ background: '#ffffff', padding: '40px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#000', marginBottom: '20px' }}><Users size={40} fill="#000" /></div>
                        <h3 style={{ marginBottom: '10px', fontWeight: 800 }}>Exquisite Service</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Our commitment to excellence extends to our service, ensuring every guest feels like royalty.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default About;
