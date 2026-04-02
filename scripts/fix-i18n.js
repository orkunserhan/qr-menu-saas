/**
 * Global i18n Fixer Script
 * Fixes the auth section in all locale files to ensure proper translations
 * and adds any missing keys across all 5 languages.
 */
const fs = require('fs');

const authTranslations = {
  en: {
    login: "Login",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    submit: "Submit",
    title: "Sign in to Panel",
    desc: "Sign in to manage your QR Menu system.",
    processing: "Processing...",
    forgotPasswordDesc: "Forgot your password?",
    loginBtnText: "Login",
    emailPlaceholder: "example@company.com",
    resetTitle: "Password Reset",
    resetDesc: "Enter your registered email address.",
    resetLinkSent: "A password reset link has been sent to your email address.",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "← Back to Login",
    unexpectedError: "An error occurred"
  },
  de: {
    login: "Anmelden",
    email: "E-Mail",
    password: "Passwort",
    forgotPassword: "Passwort vergessen?",
    submit: "Absenden",
    title: "Am Panel anmelden",
    desc: "Melden Sie sich an, um Ihr QR-Menü-System zu verwalten.",
    processing: "Wird bearbeitet...",
    forgotPasswordDesc: "Passwort vergessen?",
    loginBtnText: "Einloggen",
    emailPlaceholder: "beispiel@firma.de",
    resetTitle: "Passwort zurücksetzen",
    resetDesc: "Geben Sie Ihre registrierte E-Mail-Adresse ein.",
    resetLinkSent: "Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.",
    sendResetLink: "Link senden",
    sending: "Wird gesendet...",
    backToLogin: "← Zurück zur Anmeldung",
    unexpectedError: "Ein Fehler ist aufgetreten"
  },
  it: {
    login: "Accedi",
    email: "E-mail",
    password: "Password",
    forgotPassword: "Password Dimenticata?",
    submit: "Invio",
    title: "Accedi al pannello",
    desc: "Accedi per gestire il tuo sistema di menu QR.",
    processing: "Elaborazione...",
    forgotPasswordDesc: "Hai dimenticato la password?",
    loginBtnText: "Accedi",
    emailPlaceholder: "esempio@azienda.it",
    resetTitle: "Recupera Password",
    resetDesc: "Inserisci il tuo indirizzo email registrato.",
    resetLinkSent: "Un link per reimpostare la password è stato inviato al tuo indirizzo email.",
    sendResetLink: "Invia link di recupero",
    sending: "Invio in corso...",
    backToLogin: "← Torna al login",
    unexpectedError: "Si è verificato un errore"
  },
  sk: {
    login: "Prihlásiť sa",
    email: "E-mail",
    password: "Heslo",
    forgotPassword: "Zabudli ste heslo?",
    submit: "Odoslať",
    title: "Prihlásenie do panela",
    desc: "Prihláste sa pre správu vášho QR menu systému.",
    processing: "Spracúva sa...",
    forgotPasswordDesc: "Zabudli ste heslo?",
    loginBtnText: "Prihlásiť sa",
    emailPlaceholder: "priklad@firma.sk",
    resetTitle: "Obnoviť heslo",
    resetDesc: "Zadajte svoju registrovanú e-mailovú adresu.",
    resetLinkSent: "Odkaz na obnovenie hesla bol odoslaný na vašu e-mailovú adresu.",
    sendResetLink: "Odoslať odkaz",
    sending: "Odosiela sa...",
    backToLogin: "← Späť na prihlásenie",
    unexpectedError: "Vyskytla sa chyba"
  },
  fr: {
    login: "Connexion",
    email: "E-mail",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié?",
    submit: "Soumettre",
    title: "Connexion au panneau",
    desc: "Connectez-vous pour gérer votre système de menu QR.",
    processing: "Traitement...",
    forgotPasswordDesc: "Mot de passe oublié ?",
    loginBtnText: "Se connecter",
    emailPlaceholder: "exemple@entreprise.fr",
    resetTitle: "Réinitialisation du mot de passe",
    resetDesc: "Entrez votre adresse e-mail enregistrée.",
    resetLinkSent: "Un lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.",
    sendResetLink: "Envoyer le lien",
    sending: "Envoi en cours...",
    backToLogin: "← Retour à la connexion",
    unexpectedError: "Une erreur est survenue"
  }
};

// Apply auth translations to all locale files
['en', 'de', 'it', 'sk', 'fr'].forEach(lang => {
  const path = 'messages/' + lang + '.json';
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.auth = authTranslations[lang];
  fs.writeFileSync(path, JSON.stringify(data, null, 4) + '\n', 'utf8');
  console.log('Fixed ' + lang.toUpperCase() + '.json auth section → ' + Object.keys(authTranslations[lang]).length + ' keys');
});

// Final parity check
function getKeys(obj, prefix) {
  if (!prefix) prefix = '';
  let keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) keys = keys.concat(getKeys(obj[k], full));
    else keys.push(full);
  }
  return keys;
}

console.log('\n=== FINAL KEY PARITY CHECK ===');
const en = new Set(getKeys(JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))));
console.log('EN: ' + en.size + ' total keys');
['de', 'it', 'sk', 'fr'].forEach(lang => {
  const other = new Set(getKeys(JSON.parse(fs.readFileSync('messages/' + lang + '.json', 'utf8'))));
  const missing = Array.from(en).filter(k => !other.has(k));
  const extra = Array.from(other).filter(k => !en.has(k));
  const icon = missing.length === 0 && extra.length === 0 ? '✅ PERFECT' : '❌ ' + missing.length + ' missing';
  console.log(lang.toUpperCase() + ': ' + other.size + ' keys | ' + icon);
  if (missing.length > 0) missing.forEach(k => console.log('  MISSING: ' + k));
  if (extra.length > 0) extra.forEach(k => console.log('  EXTRA: ' + k));
});
console.log('\nDone.');
