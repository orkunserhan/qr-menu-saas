export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    calories: number;
    preparation_time: number;
    is_available: boolean;
    video_url?: string | null;
    category_id: string;
    stock_quantity: number | null; // null means unlimited
    track_stock: boolean;
};

export type Category = {
    id: string;
    name: string;
    products: Product[];
};

export type Restaurant = {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    currency: string;
    cover_image_url?: string;
    logo_url?: string;
    social_instagram?: string;
    social_facebook?: string;
    social_twitter?: string;
    google_review_url?: string;
    is_campaign_active?: boolean;
    campaign_title?: string;
    campaign_text?: string;
    show_calories?: boolean;
    show_preparation_time?: boolean;
    category?: string; // Restaurant category (e.g. "Italian")
    subscription_end_date?: string | null;
    is_active?: boolean;
    is_payment_enabled?: boolean;
    stripe_account_id?: string | null;
};

export type CartItem = {
    product: Product;
    quantity: number;
};

export type WaiterCallType = 'waiter' | 'bill' | 'order' | 'other';

export type LangCode = 'tr' | 'en' | 'de' | 'it' | 'sk';
