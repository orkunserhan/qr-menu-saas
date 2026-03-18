const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de', 'fr', 'sk', 'it'];

const dict = {
    en: {
        happyBirthday: "Happy Birthday, {name}!",
        birthdayWish: "From the BetterQR family, we wish your new age brings you luck and success."
    },
    tr: {
        happyBirthday: "İyi ki Doğdun, {name}!",
        birthdayWish: "BetterQR ailesi olarak yeni yaşının sana şans ve başarı getirmesini dileriz."
    },
    de: {
        happyBirthday: "Alles Gute zum Geburtstag, {name}!",
        birthdayWish: "Die BetterQR-Familie wünscht, dass Ihr neues Lebensjahr Ihnen Glück und Erfolg bringt."
    },
    fr: {
        happyBirthday: "Joyeux Anniversaire, {name}!",
        birthdayWish: "De la part de la famille BetterQR, nous souhaitons que cette nouvelle année vous apporte chance et succès."
    },
    sk: {
        happyBirthday: "Všetko najlepšie k narodeninám, {name}!",
        birthdayWish: "Rodina BetterQR vám želá, aby vám nový vek priniesol šťastie a úspech."
    },
    it: {
        happyBirthday: "Buon Compleanno, {name}!",
        birthdayWish: "Dalla famiglia BetterQR, ti auguriamo che questa nuova età ti porti fortuna e successo."
    }
};

locales.forEach(loc => {
    const filePath = path.join('c:\\projelerim\\stil_kocum\\qr-menu-saas\\messages', `${loc}.json`);
    let content = {};
    if (fs.existsSync(filePath)) {
        content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    if (!content.admin) content.admin = {};
    if (!content.admin.dashboard) content.admin.dashboard = {};

    content.admin.dashboard = { ...content.admin.dashboard, ...dict[loc] };

    fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
    console.log(`Updated ${loc}.json`);
});
