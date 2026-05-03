import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ShoppingBag,
    Plus,
    Minus,
    X,
    MessageSquare,
    MapPin,
    Phone,
    Info,
    Facebook,
    Star,
    Coffee,
    UtensilsCrossed,
    Clock,
    User,
    Trash2,
    Copy,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories as initialCategories, menuItems as initialMenuItems } from '../data/MenuData';
import { supabase } from '../supabaseClient';

// Helper to safely parse localized storage data
const getLocalData = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return fallback;
        const parsed = JSON.parse(saved);
        // Ensure we have actual data, not just an empty array
        if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
            return fallback;
        }
        return parsed || fallback;
    } catch (e) {
        return fallback;
    }
};

// Helper to safely save to localStorage
const setLocalData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e.name === 'QuotaExceededError' ? 'Quota exceeded' : e.message);
    }
};

// Normalize menu items (ensure category_id is used for both fallback and DB)
const normalizeItems = (items) => {
    return items.map(item => ({
        ...item,
        category_id: item.category_id || item.categoryId // Handle both camelCase and snake_case
    }));
};

// Memoized menu item component
const MenuItem = React.memo(({ item, isOpen, onAddToCart }) => (
    <div className="menu-item-card fade-in-up" style={{ opacity: item.out_of_stock ? 0.6 : 1 }}>
        <div className="menu-item-image-wrapper">
            <img src={item.image} alt={item.name} className="menu-item-image" />
            {item.promo_price && <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--accent)', color: 'var(--primary-dark)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800, zIndex: 1, boxShadow: 'var(--shadow-sm)' }}>PROMO</span>}
            {item.out_of_stock && <span style={{ position: 'absolute', inset: 0, background: 'rgba(44,30,20,0.6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, zIndex: 2, backdropFilter: 'blur(4px)' }}>OUT OF STOCK</span>}
        </div>
        <div className="menu-item-info">
            <h3 className="menu-item-name">{item.name}</h3>
            <p className="menu-item-desc">{item.description}</p>
            <div className="menu-item-footer">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {item.promo_price ? (
                        <>
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>₱{item.price}</span>
                            <span className="menu-item-price">₱{item.promo_price}</span>
                        </>
                    ) : (
                        <span className="menu-item-price">₱{item.price}</span>
                    )}
                </div>
                <button
                    className="btn-primary"
                    disabled={item.out_of_stock || !isOpen}
                    onClick={() => onAddToCart(item)}
                >
                    <Plus size={16} /> Add
                </button>
            </div>
        </div>
    </div>
));

const Home = () => {
    const [cartItems, setCartItems] = useState([]);
    const [orderType, setOrderType] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        phone: '',
        table_number: '',
        address: '',
        landmark: '',
        pickup_time: ''
    });
    const [lastOrderDetails, setLastOrderDetails] = useState('');
    const [hasCopied, setHasCopied] = useState(false);

    // Derived values
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // INSTANT LOAD: Initialize states from LocalStorage or Fallback
    const [categories, setCategories] = useState(() => getLocalData('categories', initialCategories));
    const [items, setItems] = useState(() => normalizeItems(getLocalData('menuItems', initialMenuItems)));
    const [isLoading, setIsLoading] = useState(items.length === 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState(() => getLocalData('paymentSettings', []));
    const [orderTypes, setOrderTypes] = useState(() => getLocalData('orderTypes', [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Dine-in' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Take Out' },
        { id: 'cdf90bbb-4ab0-4159-9e3c-4d0f54572483', name: 'Delivery' }
    ]));

    const [storeSettings, setStoreSettings] = useState(() => {
        const fallback = {
            manual_status: 'auto',
            open_time: '10:00',
            close_time: '23:00',
            store_name: 'Ligña',
            address: 'Your Address Here',
            contact: '09XX XXX XXXX',
            logo_url: '/logo.png',
            hero_title: 'Ligña',
            hero_subtitle: 'Experience the authentic taste of premium dining at Ligña. From our kitchen to your table, we serve excellence in every bite. Fresh, flavorful, and unforgettable.',
            banner_images: [
                'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
            ]
        };
        const saved = getLocalData('storeSettings', fallback);
        return {
            ...fallback,
            ...saved,
            // Ensure the name is fixed even if localStorage has the old one
            store_name: (saved.store_name === 'Ligna' || !saved.store_name) ? fallback.store_name : saved.store_name,
            hero_title: (saved.hero_title === 'Ligna' || !saved.hero_title) ? fallback.hero_title : saved.hero_title,
            banner_images: (saved.banner_images && saved.banner_images.length > 0) ? saved.banner_images : fallback.banner_images
        };
    });

    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Helpers
    const getOrderType = useCallback((id) => {
        const type = orderTypes.find(t => t.id === id);
        return type ? type.name : '';
    }, [orderTypes]);

    const isDeliveryType = useCallback((id) => {
        const name = getOrderType(id).toLowerCase();
        return id === 'cdf90bbb-4ab0-4159-9e3c-4d0f54572483' || name.includes('delivery');
    }, [getOrderType]);

    const isDineInType = useCallback((id) => {
        const name = getOrderType(id).toLowerCase();
        return id === '11111111-1111-1111-1111-111111111111' || name.includes('dine-in');
    }, [getOrderType]);

    const isPickupType = useCallback((id) => {
        const name = getOrderType(id).toLowerCase();
        return id === '22222222-2222-2222-2222-222222222222' || name.includes('take out') || name.includes('pickup');
    }, [getOrderType]);

    const generateOrderSummary = useCallback(() => {
        const itemDetails = cartItems.map(item => {
            let d = `${item.name} (x${item.quantity})`;
            if (item.selectedVariation) d += ` - ${item.selectedVariation.name}`;
            if (item.selectedFlavors && item.selectedFlavors.length > 0) d += ` [${item.selectedFlavors.join(', ')}]`;
            if (item.selectedAddons.length > 0) d += ` + ${item.selectedAddons.map(a => a.name).join(', ')}`;
            return d;
        });

        const summary = itemDetails.join('\n');
        const typeName = getOrderType(orderType);
        let info = `${isDeliveryType(orderType) ? 'Designated Name' : 'Name'}: ${customerDetails.name}`;
        if (isDineInType(orderType)) info += ` | Table: ${customerDetails.table_number}`;
        if (isPickupType(orderType)) info += ` | Phone: ${customerDetails.phone} | Time: ${customerDetails.pickup_time}`;
        if (isDeliveryType(orderType)) info += ` | Phone: ${customerDetails.phone} | Address: ${customerDetails.address}`;

        return `Hi! New order for ${customerDetails.name}:
            
${summary}

Total: P${cartTotal}
Type: ${typeName}
${info}`.trim();
    }, [cartItems, orderType, customerDetails, cartTotal, getOrderType, isDeliveryType, isDineInType, isPickupType]);


    const isStoreOpen = () => {
        if (storeSettings.manual_status === 'open') return true;
        if (storeSettings.manual_status === 'closed') return false;

        try {
            const manilaTimeParts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Manila',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            }).formatToParts(new Date());

            const hours = parseInt(manilaTimeParts.find(p => p.type === 'hour').value);
            const minutes = parseInt(manilaTimeParts.find(p => p.type === 'minute').value);
            const currentTime = hours * 60 + minutes;

            const [openH, openM] = (storeSettings.open_time || '10:00').split(':').map(Number);
            const [closeH, closeM] = (storeSettings.close_time || '01:00').split(':').map(Number);

            const openMinutes = openH * 60 + openM;
            const closeMinutes = closeH * 60 + closeM;

            if (closeMinutes < openMinutes) {
                return currentTime >= openMinutes || currentTime < closeMinutes;
            }
            return currentTime >= openMinutes && currentTime < closeMinutes;
        } catch (e) {
            return true;
        }
    };

    const isOpen = isStoreOpen();

    // Background fetching with LocalStorage sync
    useEffect(() => {
        const fetchUpdates = async () => {
            if (items.length === 0) setIsLoading(true);

            try {
                const [
                    { data: catData, error: catErr },
                    { data: itemData, error: itemErr },
                    { data: payData },
                    { data: typeData },
                    { data: storeData }
                ] = await Promise.all([
                    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
                    supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
                    supabase.from('payment_settings').select('*').eq('is_active', true).order('created_at', { ascending: true }),
                    supabase.from('order_types').select('*').eq('is_active', true).order('created_at', { ascending: true }),
                    supabase.from('store_settings').select('*').limit(1).single()
                ]);

                if (catErr || itemErr) throw new Error("Supabase fetch failed");

                if (catData && catData.length > 0) {
                    setCategories(catData);
                    setLocalData('categories', catData);
                    if (!activeCategory) {
                        setActiveCategory(catData[0].id);
                    }
                }

                if (itemData && itemData.length > 0) {
                    setItems(normalizeItems(itemData));
                    setLocalData('menuItems', itemData);
                }

                // Other settings
                if (payData && payData.length > 0) { setPaymentSettings(payData); setLocalData('paymentSettings', payData); }
                if (typeData && typeData.length > 0) { setOrderTypes(typeData); setLocalData('orderTypes', typeData); }
                if (storeData) {
                    setStoreSettings(prev => ({
                        ...prev,
                        ...storeData,
                        banner_images: (storeData.banner_images && storeData.banner_images.length > 0) ? storeData.banner_images : prev.banner_images
                    }));
                    setLocalData('storeSettings', storeData);
                }

            } catch (error) {
                console.error("Background fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUpdates();
    }, []);

    // Slideshow functions
    const nextBanner = useCallback(() => {
        const count = (storeSettings.banner_images || []).length;
        if (count > 0) setCurrentBannerIndex(prev => (prev + 1) % count);
    }, [storeSettings.banner_images]);

    const prevBanner = useCallback(() => {
        const count = (storeSettings.banner_images || []).length;
        if (count > 0) setCurrentBannerIndex(prev => (prev - 1 + count) % count);
    }, [storeSettings.banner_images]);

    useEffect(() => {
        const bannerCount = (storeSettings.banner_images || []).length;
        if (bannerCount === 0) return;
        const timer = setInterval(nextBanner, 5000);
        return () => clearInterval(timer);
    }, [nextBanner, storeSettings.banner_images]);

    // Selection state for products with options
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectionOptions, setSelectionOptions] = useState({
        variation: null,
        flavors: [],
        addons: []
    });

    const openProductSelection = useCallback((item) => {
        const firstVariation = (item.variations || []).find(v => !v.disabled);
        setSelectedProduct(item);
        setSelectionOptions({
            variation: firstVariation || null,
            flavors: [],
            addons: []
        });
    }, []);

    const addToCart = (item, options) => {
        const cartItemId = `${item.id}-${options.variation?.name || ''}-${options.flavors.sort().join(',')}-${options.addons.map(a => a.name).join(',')}`;
        const existing = cartItems.find(i => i.cartItemId === cartItemId);

        const variationPrice = options.variation ? Number(options.variation.price) : 0;
        const basePrice = Number(item.promo_price || item.price);

        let price;
        if (item.name?.toLowerCase().includes('pork ribs')) {
            price = basePrice + variationPrice;
        } else {
            price = variationPrice > 0 ? variationPrice : basePrice;
        }
        const addonsPrice = options.addons.reduce((sum, a) => sum + Number(a.price), 0);
        const finalPrice = price + addonsPrice;

        if (existing) {
            setCartItems(cartItems.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCartItems([...cartItems, {
                ...item,
                cartItemId,
                selectedVariation: options.variation,
                selectedFlavors: options.flavors,
                selectedAddons: options.addons,
                finalPrice,
                quantity: 1
            }]);
        }
        setSelectedProduct(null);
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(cartItems.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity > 1 ? i.quantity - 1 : i.quantity } : i));
    };

    const deleteFromCart = (cartItemId) => {
        setCartItems(cartItems.filter(i => i.cartItemId !== cartItemId));
    };



    const handlePlaceOrder = async () => {
        if (!orderType) {
            alert('Please select an order type (Dine-in, Pickup, or Delivery).');
            return;
        }

        const { name, phone, table_number, address, pickup_time } = customerDetails;

        if (isDineInType(orderType) && (!name || !table_number)) { alert('Please provide your Name and Table Number.'); return; }
        if (isPickupType(orderType) && (!name || !phone || !pickup_time)) { alert('Please provide Name, Phone Number, and Pickup Time.'); return; }
        if (isDeliveryType(orderType) && (!name || !phone || !address)) { alert('Please provide Name, Phone Number, and Delivery Address.'); return; }

        if (!paymentMethod) { alert('Please select a payment method.'); return; }

        setIsSubmitting(true);

        try {
            const itemDetails = cartItems.map(item => {
                let d = `${item.name} (x${item.quantity})`;
                if (item.selectedVariation) d += ` - ${item.selectedVariation.name}`;
                if (item.selectedFlavors && item.selectedFlavors.length > 0) d += ` [${item.selectedFlavors.join(', ')}]`;
                if (item.selectedAddons.length > 0) d += ` + ${item.selectedAddons.map(a => a.name).join(', ')}`;
                return d;
            });

            const newOrder = {
                order_type: orderType,
                payment_method: paymentMethod,
                customer_details: customerDetails,
                items: itemDetails,
                total_amount: cartTotal,
                status: 'Pending'
            };

            const { error } = await supabase.from('orders').insert([newOrder]);

            // Backup to LocalStorage
            try {
                const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                setLocalData('orders', [...existingOrders, { ...newOrder, id: Date.now(), timestamp: new Date().toISOString() }]);
            } catch (e) { }

            const message = generateOrderSummary();
            setLastOrderDetails(message);
            const facebookUrl = `https://www.facebook.com/profile.php?id=61572872794852&sk=about`;

            setCartItems([]);
            setHasCopied(false);
            setIsCheckoutOpen(false); // Close modal immediately

            window.open(facebookUrl, '_blank');
        } catch (err) {
            console.error('Order process error:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    // MEMO: Filtered items memoized to prevent expensive re-filtering
    const filteredItems = useMemo(() => {
        if (!activeCategory || activeCategory === 'all') return items;
        return items.filter(item => item.category_id === activeCategory);
    }, [items, activeCategory]);

    return (
        <div className="page-wrapper">
            {/* Store Closed Overlay */}
            {!isOpen && (
                <div style={{ background: 'var(--accent)', color: 'white', textAlign: 'center', padding: '6px 12px', position: 'sticky', top: 0, zIndex: 1200, fontWeight: 700, fontSize: '0.75rem' }}>
                    <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    WE ARE CURRENTLY CLOSED. Our operating hours are {formatTime(storeSettings.open_time) || '10:00 AM'} to {formatTime(storeSettings.close_time) || '1:00 AM'}. Orders are disabled.
                </div>
            )}

            <header className="app-header glass">
                <div className="container header-container">
                    <Link to="/" className="brand">
                        <img src={storeSettings.logo_url || "/logo.png"} alt={`${storeSettings.store_name} Logo`} style={{ height: '48px', width: '48px' }} />
                    </Link>

                    <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Link to="/contact" className="nav-link">Contact</Link>
                        <button className="btn-primary" onClick={() => setIsCartOpen(true)}>
                            <ShoppingBag size={18} />
                            <span>Cart ({cartCount})</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Sticky Category Slider */}
            <div className="category-slider-wrapper glass">
                <div className="container">
                    <div className="category-slider">
                        <button
                            className={`category-slide-btn ${activeCategory === 'all' || !activeCategory ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory('all');
                                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            All Offerings
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-slide-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-split">
                    <div className="hero-content fade-in">
                        <h1>{storeSettings.hero_title || 'Ligña'}</h1>
                        <p>{storeSettings.hero_subtitle || 'Experience the authentic taste of premium dining at Ligña. From our kitchen to your table, we serve excellence in every bite.'}</p>
                        <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }} onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
                            Explore Menu <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="hero-image-container">
                        {(storeSettings.banner_images || []).map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt={`Hero Banner ${i + 1}`}
                                className={`hero-image ${currentBannerIndex === i ? 'active' : ''}`}
                                loading={i === 0 ? "eager" : "lazy"}
                                fetchPriority={i === 0 ? "high" : "auto"}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    opacity: currentBannerIndex === i ? 1 : 0,
                                    zIndex: currentBannerIndex === i ? 1 : 0
                                }}
                            />
                        ))}

                        {/* Navigation Arrows */}
                        <button className="hero-nav-btn prev" onClick={prevBanner} aria-label="Previous image">
                            <ChevronLeft size={24} />
                        </button>
                        <button className="hero-nav-btn next" onClick={nextBanner} aria-label="Next image">
                            <ChevronRight size={24} />
                        </button>

                        {/* Indicators (Dots) */}
                        <div className="hero-indicators">
                            {(storeSettings.banner_images || []).map((_, i) => (
                                <button
                                    key={i}
                                    className={`indicator-dot ${currentBannerIndex === i ? 'active' : ''}`}
                                    onClick={() => setCurrentBannerIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            <main className="container" id="menu" style={{ padding: '100px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }} className="fade-in-up">
                    <h2 style={{ fontSize: '4rem', marginBottom: '12px', color: 'var(--primary-dark)' }}>Our Menu</h2>
                    <div style={{ width: '80px', height: '4px', background: 'var(--accent)', margin: '0 auto 24px', borderRadius: '2px' }}></div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Handcrafted with Love</p>
                </div>


                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                        <p style={{ color: 'var(--text-muted)' }}>Loading delicious menu...</p>
                    </div>
                ) : (
                    <>
                        {filteredItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                <UtensilsCrossed size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px', opacity: 0.5 }} />
                                <h3>No items found in this category</h3>
                                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setActiveCategory('all')}>View All Items</button>
                            </div>
                        ) : (
                            <div className="menu-grid">
                                {filteredItems.map(item => (
                                    <MenuItem
                                        key={item.id}
                                        item={item}
                                        isOpen={isOpen}
                                        onAddToCart={(item) => {
                                            const firstVariation = (item.variations || []).find(v => !v.disabled);
                                            addToCart(item, {
                                                variation: firstVariation || null,
                                                flavors: [],
                                                addons: []
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Selection Modal (Remains same) */}
            {selectedProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: '#ffffff', maxWidth: '500px', width: '100%', borderRadius: '32px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', color: '#1a1a1a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #f0f0f0' }}>
                        <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f5f5f5', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#666' }}><X size={20} /></button>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
                            <img src={selectedProduct.image} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover' }} alt="" />
                            <div><h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800 }}>{selectedProduct.name}</h2><p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.4 }}>{selectedProduct.description}</p></div>
                        </div>

                        {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Select Size/Variation</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {selectedProduct.variations.map(v => (
                                        <button
                                            key={v.name}
                                            disabled={v.disabled}
                                            onClick={() => setSelectionOptions({ ...selectionOptions, variation: v })}
                                            style={{
                                                padding: '12px 20px', borderRadius: '15px', border: '2px solid',
                                                borderColor: selectionOptions.variation?.name === v.name ? '#000' : '#f0f0f0',
                                                background: selectionOptions.variation?.name === v.name ? '#000' : '#f5f5f5',
                                                color: selectionOptions.variation?.name === v.name ? '#fff' : '#444',
                                                cursor: v.disabled ? 'not-allowed' : 'pointer',
                                                opacity: v.disabled ? 0.3 : 1,
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {v.name} (+₱{v.price}) {v.disabled && '(Out of Stock)'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Add-ons (Optional)</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {selectedProduct.addons.map(a => (
                                        <button
                                            key={a.name}
                                            disabled={a.disabled}
                                            onClick={() => {
                                                const exists = selectionOptions.addons.find(x => x.name === a.name);
                                                if (exists) {
                                                    setSelectionOptions({ ...selectionOptions, addons: selectionOptions.addons.filter(x => x.name !== a.name) });
                                                } else {
                                                    setSelectionOptions({ ...selectionOptions, addons: [...selectionOptions.addons, a] });
                                                }
                                            }}
                                            style={{
                                                padding: '12px 20px', borderRadius: '15px', border: '2px solid',
                                                borderColor: selectionOptions.addons.find(x => x.name === a.name) ? '#000' : '#f0f0f0',
                                                background: selectionOptions.addons.find(x => x.name === a.name) ? '#000' : '#f5f5f5',
                                                color: selectionOptions.addons.find(x => x.name === a.name) ? '#fff' : '#444',
                                                cursor: a.disabled ? 'not-allowed' : 'pointer',
                                                opacity: a.disabled ? 0.3 : 1,
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            + {a.name} (₱{a.price}) {a.disabled && '(Out of Stock)'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedProduct.flavors && selectedProduct.flavors.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Select Flavors (You can pick multiple)</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {selectedProduct.flavors && (Array.isArray(selectedProduct.flavors) ? selectedProduct.flavors : []).map(f => {
                                        const name = typeof f === 'string' ? f : f.name;
                                        const disabled = typeof f === 'object' ? f.disabled : false;
                                        if (disabled) return null;
                                        return (
                                            <button
                                                key={name}
                                                onClick={() => {
                                                    const exists = selectionOptions.flavors.includes(name);
                                                    let newFlavors;
                                                    if (exists) {
                                                        newFlavors = selectionOptions.flavors.filter(x => x !== name);
                                                    } else {
                                                        newFlavors = [...selectionOptions.flavors, name];
                                                    }
                                                    setSelectionOptions({ ...selectionOptions, flavors: newFlavors });
                                                }}
                                                style={{
                                                    padding: '12px 20px', borderRadius: '15px', border: '2px solid',
                                                    borderColor: selectionOptions.flavors.includes(name) ? '#000' : '#f0f0f0',
                                                    background: selectionOptions.flavors.includes(name) ? '#000' : '#f5f5f5',
                                                    color: selectionOptions.flavors.includes(name) ? '#fff' : '#444',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <button className="btn-primary" style={{ width: '100%', padding: '12px', fontWeight: 700, fontSize: '1rem' }} onClick={() => addToCart(selectedProduct, selectionOptions)}>
                            Add to Cart - ₱{(
                                (selectionOptions.variation && Number(selectionOptions.variation.price) > 0)
                                    ? (selectedProduct.name?.toLowerCase().includes('pork ribs')
                                        ? Number(selectedProduct.promo_price || selectedProduct.price) + Number(selectionOptions.variation.price)
                                        : Number(selectionOptions.variation.price))
                                    : Number(selectedProduct.promo_price || selectedProduct.price)
                            ) + (selectionOptions.addons || []).reduce((sum, a) => sum + Number(a.price), 0)}
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: '#ffffff', maxWidth: '500px', width: '100%', borderRadius: '32px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #f0f0f0', color: '#1a1a1a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.8rem' }}>Checkout</h2>
                            <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '25px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontWeight: 700, fontSize: '1rem', display: 'block', marginBottom: '15px' }}>Payment Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                    {paymentSettings.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            style={{
                                                padding: '20px', borderRadius: '20px', border: '2px solid',
                                                borderColor: paymentMethod === method.id ? '#000' : '#f0f0f0',
                                                background: paymentMethod === method.id ? '#f9f9f9' : '#fff',
                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                                color: paymentMethod === method.id ? '#000' : '#666'
                                            }}
                                        >
                                            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>💳</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{method.name}</div>
                                        </button>
                                    ))}
                                </div>
                                                          {paymentMethod && paymentMethod !== 'Cash/COD' && (
                                    <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '25px', border: '1px solid #eee' }}>
                                        {paymentSettings.find(m => m.id === paymentMethod) ? (
                                            (() => {
                                                const method = paymentSettings.find(m => m.id === paymentMethod);
                                                return (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <h4 style={{ color: '#000', marginBottom: '20px', fontWeight: 800 }}>Send {method.name} Payment</h4>
                                                        {method.qr_url && (
                                                            <div style={{ background: 'white', padding: '15px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                                                <img src={method.qr_url} style={{ width: '180px', height: '180px', borderRadius: '10px', objectFit: 'contain' }} alt="QR Code" />
                                                            </div>
                                                        )}
                                                        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #eee' }}>
                                                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Account Number</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
                                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000' }}>{method.account_number}</div>
                                                                <button
                                                                    onClick={() => { navigator.clipboard.writeText(method.account_number); alert('Copied!'); }}
                                                                    style={{ border: 'none', background: '#000', color: 'white', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8rem' }}
                                                                >
                                                                    <Copy size={14} /> Copy
                                                                </button>
                                                            </div>
                                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#444' }}>{method.account_name}</div>
                                                        </div>
                                                        {method.name.toLowerCase().includes('gcash') && (
                                                            <div style={{ marginTop: '15px', padding: '10px', background: '#eff6ff', borderRadius: '10px', fontSize: '0.85rem', color: '#1e40af', fontWeight: 500 }}>
                                                                📸 Please send a screenshot of your GCash payment along with your order details.
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Details not found.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontWeight: 700, fontSize: '1rem', display: 'block', marginBottom: '15px' }}>Select Order Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                                    {orderTypes.map(type => (
                                        <button key={type.id} onClick={() => setOrderType(type.id)} style={{ padding: '8px', fontSize: '0.9rem', borderRadius: '12px', border: '1px solid var(--primary)', background: orderType === type.id ? 'var(--primary)' : 'transparent', color: orderType === type.id ? '#000' : 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>{type.name}</button>
                                    ))}
                                </div>
                            </div>

                            {orderType && (
                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700, color: '#444' }}>{isDeliveryType(orderType) ? 'Designated Name' : 'Full Name'}</label><input type="text" value={customerDetails.name} onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} style={{ padding: '15px', width: '100%', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontSize: '1rem', fontWeight: 500 }} /></div>
                                        {isDineInType(orderType) && <div><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700, color: '#444' }}>Table Number</label><input type="text" value={customerDetails.table_number} onChange={(e) => setCustomerDetails({ ...customerDetails, table_number: e.target.value })} style={{ padding: '15px', width: '100%', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontSize: '1rem', fontWeight: 500 }} /></div>}
                                        {!isDineInType(orderType) && <div><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700, color: '#444' }}>Phone</label><input type="tel" value={customerDetails.phone} onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })} style={{ padding: '15px', width: '100%', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontSize: '1rem', fontWeight: 500 }} /></div>}
                                        {isPickupType(orderType) && <div><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700, color: '#444' }}>Time</label><input type="time" value={customerDetails.pickup_time} onChange={(e) => setCustomerDetails({ ...customerDetails, pickup_time: e.target.value })} style={{ padding: '15px', width: '100%', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontSize: '1rem', fontWeight: 500 }} /></div>}
                                        {isDeliveryType(orderType) && <div><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700, color: '#444' }}>Address</label><textarea value={customerDetails.address} onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })} style={{ padding: '15px', width: '100%', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontSize: '1rem', fontWeight: 500, minHeight: '80px' }} /></div>}
                                        {!isDineInType(orderType) && !isPickupType(orderType) && !isDeliveryType(orderType) && <div><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700, color: '#444' }}>Notes / Instructions</label><textarea value={customerDetails.landmark} onChange={(e) => setCustomerDetails({ ...customerDetails, landmark: e.target.value })} placeholder="Any specific requests..." style={{ padding: '15px', width: '100%', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9f9', color: '#000', fontSize: '1rem', fontWeight: 500, minHeight: '80px' }} /></div>}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const summary = generateOrderSummary();
                                    navigator.clipboard.writeText(summary);
                                    setHasCopied(true);
                                    alert('Order details copied! You can now confirm your order.');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: hasCopied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(250, 205, 10, 0.05)',
                                    border: '2px dashed',
                                    borderColor: hasCopied ? '#22c55e' : 'var(--primary)',
                                    color: hasCopied ? '#22c55e' : 'var(--primary)',
                                    fontWeight: 700,
                                    marginBottom: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Copy size={18} /> {hasCopied ? 'Order Details Copied! ✅' : 'Step 1: Copy Order Details (Required)'}
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '20px', border: '1px solid #eee' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#666' }}>Total Amount:</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000' }}>₱{cartTotal}</span>
                            </div>

                            <button
                                className="btn-accent"
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting || !hasCopied}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    opacity: (isSubmitting || !hasCopied) ? 0.6 : 1,
                                    background: !hasCopied ? '#f5f5f5' : '#ffffff',
                                    color: !hasCopied ? '#aaa' : '#000000',
                                    border: !hasCopied ? '2px solid #eee' : '2px solid #000000',
                                    cursor: !hasCopied ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <><MessageSquare size={22} /> Confirm Order</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCartOpen && (
                <div style={{ position: 'fixed', top: 0, right: 0, width: '450px', maxWidth: '100%', height: '100vh', background: '#ffffff', boxShadow: '-20px 0 50px rgba(0,0,0,0.1)', zIndex: 2000, padding: '40px', display: 'flex', flexDirection: 'column', color: '#1a1a1a', borderLeft: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}><h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Cart</h2><button onClick={() => setIsCartOpen(false)} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', color: '#666' }}><X size={20} /></button></div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {cartItems.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#666', marginTop: '60px' }}>
                                <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                <h3 style={{ margin: 0, marginBottom: '10px' }}>Your cart is empty</h3>
                                <p style={{ fontSize: '0.9rem' }}>Looks like you haven't added anything yet.</p>
                                <button className="btn-primary" onClick={() => setIsCartOpen(false)} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px' }}>Browse Menu</button>
                            </div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.cartItemId} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-start' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                                        <p style={{ margin: '2px 0 5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {item.selectedVariation?.name}
                                            {item.selectedFlavors && item.selectedFlavors.length > 0 ? ` | ${item.selectedFlavors.join(', ')}` : ''}
                                        </p>
                                        <span style={{ fontWeight: 700 }}>₱{item.finalPrice}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => removeFromCart(item.cartItemId)} style={{ border: '1px solid var(--border)', background: 'none', padding: '2px', borderRadius: '4px' }}><Minus size={14} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => addToCart(item, { variation: item.selectedVariation, flavors: item.selectedFlavors, addons: item.selectedAddons })} style={{ border: '1px solid var(--border)', background: 'none', padding: '2px', borderRadius: '4px' }}><Plus size={14} /></button>
                                        <button onClick={() => deleteFromCart(item.cartItemId)} style={{ marginLeft: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <button className="btn-primary" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} style={{ width: '100%', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 800 }}>Proceed to Payment</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
