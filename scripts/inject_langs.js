const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de', 'fr', 'sk', 'it'];

const translations = {
    en: {
        auth: {
            title: "Login to Panel",
            desc: "Log in to manage your QR Menu system.",
            processing: "Processing...",
            forgotPasswordDesc: "Forgot your password?",
            loginBtnText: "Login"
        },
        restAdmin: {
            tableLayout: "Table Layout",
            reports: "📊 Reports",
            orders: "🔔 Orders",
            waiter: "🛎️ Waiter",
            analytics: "📈 Analytics",
            comments: "💬 Comments",
            settings: "⚙️ Settings",
            viewMenu: "✨ View Menu",
            menuAndCategories: "Menu & Categories",
            deleteCategory: "Delete Category",
            menuEmpty: "Your Menu is Empty",
            addCategoryPrompt: "Add a category first so your customers can order.",
            appearanceAndLang: "Appearance & Language",
            themeAndLangDesc: "Select your management panel theme and default language.",
            panelTheme: "Panel Theme",
            panelLang: "Panel Language",
            not_found: "Restaurant not found."
        }
    },
    tr: {
        auth: {
            title: "Panel'e Giriş Yap",
            desc: "QR Menü sisteminizi yönetmek için giriş yapın.",
            processing: "İşleniyor...",
            forgotPasswordDesc: "Şifremi unuttun mu?",
            loginBtnText: "Giriş Yap"
        },
        restAdmin: {
            tableLayout: "Masa Düzeni",
            reports: "📊 Raporlar",
            orders: "🔔 Siparişler",
            waiter: "🛎️ Garson",
            analytics: "📈 Analiz",
            comments: "💬 Yorumlar",
            settings: "⚙️ Ayarlar",
            viewMenu: "✨ Menüyü Gör",
            menuAndCategories: "Menü & Kategoriler",
            deleteCategory: "Kategoriyi Sil",
            menuEmpty: "Menünüz Boş",
            addCategoryPrompt: "Müşterilerinizin sipariş verebilmesi için önce kategori ekleyin.",
            appearanceAndLang: "Görünüm ve Dil",
            themeAndLangDesc: "Yönetim paneli temanızı ve varsayılan dilinizi seçin.",
            panelTheme: "Panel Teması",
            panelLang: "Panel Dili",
            not_found: "Restoran bulunamadı."
        }
    },
    de: {
        auth: {
            title: "Am Panel anmelden",
            desc: "Melden Sie sich an, um Ihr QR-Menü-System zu verwalten.",
            processing: "Wird bearbeitet...",
            forgotPasswordDesc: "Passwort vergessen?",
            loginBtnText: "Einloggen"
        },
        restAdmin: {
            tableLayout: "Tischlayout",
            reports: "📊 Berichte",
            orders: "🔔 Bestellungen",
            waiter: "🛎️ Kellner",
            analytics: "📈 Analytik",
            comments: "💬 Kommentare",
            settings: "⚙️ Einstellungen",
            viewMenu: "✨ Menü ansehen",
            menuAndCategories: "Menü & Kategorien",
            deleteCategory: "Kategorie löschen",
            menuEmpty: "Ihr Menü ist leer",
            addCategoryPrompt: "Fügen Sie zuerst eine Kategorie hinzu, damit Ihre Kunden bestellen können.",
            appearanceAndLang: "Aussehen & Sprache",
            themeAndLangDesc: "Wählen Sie das Thema und die Standardsprache Ihres Admin-Panels.",
            panelTheme: "Panel-Thema",
            panelLang: "Panel-Sprache",
            not_found: "Restaurant nicht gefunden."
        }
    },
    fr: {
        auth: {
            title: "Connexion au panneau",
            desc: "Connectez-vous pour gérer votre système de menu QR.",
            processing: "Traitement...",
            forgotPasswordDesc: "Mot de passe oublié ?",
            loginBtnText: "Se connecter"
        },
        restAdmin: {
            tableLayout: "Disposition des tables",
            reports: "📊 Rapports",
            orders: "🔔 Commandes",
            waiter: "🛎️ Serveur",
            analytics: "📈 Analytique",
            comments: "💬 Commentaires",
            settings: "⚙️ Paramètres",
            viewMenu: "✨ Voir le menu",
            menuAndCategories: "Menu & Catégories",
            deleteCategory: "Supprimer la catégorie",
            menuEmpty: "Votre menu est vide",
            addCategoryPrompt: "Ajoutez d'abord une catégorie pour que vos clients puissent commander.",
            appearanceAndLang: "Apparence et langue",
            themeAndLangDesc: "Sélectionnez le thème et la langue par défaut de votre panneau d'administration.",
            panelTheme: "Thème du panneau",
            panelLang: "Langue du panneau",
            not_found: "Restaurant introuvable."
        }
    },
    sk: {
        auth: {
            title: "Prihlásenie do panela",
            desc: "Prihláste sa pre správu vášho QR menu systému.",
            processing: "Spracúva sa...",
            forgotPasswordDesc: "Zabudli ste heslo?",
            loginBtnText: "Prihlásiť sa"
        },
        restAdmin: {
            tableLayout: "Rozloženie stolov",
            reports: "📊 Správy",
            orders: "🔔 Objednávky",
            waiter: "🛎️ Čašník",
            analytics: "📈 Analytika",
            comments: "💬 Komentáre",
            settings: "⚙️ Nastavenia",
            viewMenu: "✨ Zobraziť menu",
            menuAndCategories: "Menu a kategórie",
            deleteCategory: "Vymazať kategóriu",
            menuEmpty: "Vaše menu je prázdne",
            addCategoryPrompt: "Najskôr pridajte kategóriu, aby si vaši zákazníci mohli objednať.",
            appearanceAndLang: "Vzhľad a jazyk",
            themeAndLangDesc: "Vyberte si tému a predvolený jazyk vášho administračného panela.",
            panelTheme: "Téma panela",
            panelLang: "Jazyk panela",
            not_found: "Reštaurácia sa nenašla."
        }
    },
    it: {
        auth: {
            title: "Accedi al pannello",
            desc: "Accedi per gestire il tuo sistema di menu QR.",
            processing: "Elaborazione...",
            forgotPasswordDesc: "Hai dimenticato la password?",
            loginBtnText: "Accedi"
        },
        restAdmin: {
            tableLayout: "Disposizione dei tavoli",
            reports: "📊 Rapporti",
            orders: "🔔 Ordini",
            waiter: "🛎️ Cameriere",
            analytics: "📈 Analitica",
            comments: "💬 Commenti",
            settings: "⚙️ Impostazioni",
            viewMenu: "✨ Visualizza menu",
            menuAndCategories: "Menu e categorie",
            deleteCategory: "Elimina categoria",
            menuEmpty: "Il tuo menu è vuoto",
            addCategoryPrompt: "Aggiungi prima una categoria in modo che i tuoi clienti possano ordinare.",
            appearanceAndLang: "Aspetto e lingua",
            themeAndLangDesc: "Seleziona il tema e la lingua predefinita del tuo pannello di amministrazione.",
            panelTheme: "Tema del pannello",
            panelLang: "Lingua del pannello",
            not_found: "Ristorante non trovato."
        }
    }
};

locales.forEach(loc => {
    const filePath = path.join('c:\\projelerim\\stil_kocum\\qr-menu-saas\\messages', `${loc}.json`);
    let content = {};
    if (fs.existsSync(filePath)) {
        content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    if (!content.auth) content.auth = {};
    // merge specific new auth keys without overriding existing ones like "email"
    content.auth = { ...content.auth, ...translations[loc].auth };

    // merge restAdmin
    content.restAdmin = translations[loc].restAdmin;

    fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
    console.log(`Updated ${loc}.json`);
});
