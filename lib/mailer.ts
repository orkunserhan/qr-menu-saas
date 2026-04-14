import nodemailer from 'nodemailer';

// ── Zoho SMTP Transporter ──────────────────────────────────────────────────
// Kimlik bilgileri KESİNLİKLE hardcode EDİLMEZ. Sadece env üzerinden okunur.
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ── Çok Dilli Çeviri Map'i ───────────────────────────────────────────────
type SupportedLocale = 'en' | 'de' | 'it' | 'sk' | 'fr' | 'tr';

const emailTranslations: Record<SupportedLocale, {
    subject: string;
    title: string;
    greeting: string;
    message: string;
    btnText: string;
    footer: string;
}> = {
    en: {
        subject: 'Welcome to GoDineQR – Set Up Your Account',
        title: 'Welcome to GoDineQR!',
        greeting: 'Hello,',
        message: 'Your restaurant account has been successfully created on the GoDineQR platform. Please click the button below to set up your password and activate your account. This link is valid for 7 days.',
        btnText: 'Set Up Password & Activate Account',
        footer: 'If you did not request this, please ignore this email.',
    },
    de: {
        subject: 'Willkommen bei GoDineQR – Konto einrichten',
        title: 'Willkommen bei GoDineQR!',
        greeting: 'Hallo,',
        message: 'Ihr Restaurantkonto wurde erfolgreich auf der GoDineQR-Plattform erstellt. Bitte klicken Sie auf die Schaltfläche unten, um Ihr Passwort einzurichten und Ihr Konto zu aktivieren. Dieser Link ist 7 Tage gültig.',
        btnText: 'Passwort einrichten & Konto aktivieren',
        footer: 'Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail.',
    },
    it: {
        subject: 'Benvenuto su GoDineQR – Configura il tuo account',
        title: 'Benvenuto su GoDineQR!',
        greeting: 'Salve,',
        message: 'Il tuo account ristorante è stato creato con successo sulla piattaforma GoDineQR. Clicca il pulsante qui sotto per impostare la tua password e attivare il tuo account. Questo link è valido per 7 giorni.',
        btnText: 'Imposta la password e attiva l\'account',
        footer: 'Se non hai richiesto questa operazione, ignora questa email.',
    },
    sk: {
        subject: 'Vitajte na GoDineQR – Nastavte si účet',
        title: 'Vitajte na GoDineQR!',
        greeting: 'Dobrý deň,',
        message: 'Váš reštauračný účet bol úspešne vytvorený na platforme GoDineQR. Kliknite na tlačidlo nižšie, aby ste si nastavili heslo a aktivovali účet. Tento odkaz je platný 7 dní.',
        btnText: 'Nastaviť heslo a aktivovať účet',
        footer: 'Ak ste túto žiadosť neposlali, ignorujte tento e-mail.',
    },
    fr: {
        subject: 'Bienvenue sur GoDineQR – Configurez votre compte',
        title: 'Bienvenue sur GoDineQR !',
        greeting: 'Bonjour,',
        message: 'Votre compte restaurant a été créé avec succès sur la plateforme GoDineQR. Cliquez sur le bouton ci-dessous pour configurer votre mot de passe et activer votre compte. Ce lien est valable 7 jours.',
        btnText: 'Configurer le mot de passe et activer le compte',
        footer: 'Si vous n\'avez pas demandé cela, veuillez ignorer cet e-mail.',
    },
    tr: {
        subject: 'GoDineQR\'a Hoş Geldiniz – Hesabınızı Kurun',
        title: 'GoDineQR\'a Hoş Geldiniz!',
        greeting: 'Merhaba,',
        message: 'Restoran hesabınız GoDineQR platformunda başarıyla oluşturuldu. Şifrenizi belirlemek ve hesabınızı aktifleştirmek için aşağıdaki butona tıklayın. Bu bağlantı 7 gün geçerlidir.',
        btnText: 'Şifre Belirle ve Hesabı Aktifleştir',
        footer: 'Bu işlemi siz yapmadıysanız bu e-postayı dikkate almayın.',
    },
};

// ── HTML E-Posta Şablonu ──────────────────────────────────────────────────
function buildEmailHtml(params: {
    title: string;
    greeting: string;
    message: string;
    btnText: string;
    setupUrl: string;
    restaurantName: string;
    footer: string;
}): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#312e81 100%);padding:40px 48px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Godine<span style="color:#818cf8;">QR</span></span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">${params.title}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">${params.greeting}</p>
              <div style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">📍 ${params.restaurantName}</p>
              </div>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:#374151;">${params.message}</p>
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                    <a href="${params.setupUrl}" style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">${params.btnText} →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;font-size:12px;color:#9ca3af;text-align:center;">${params.footer}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;text-align:center;">
                Or copy: <a href="${params.setupUrl}" style="color:#6366f1;">${params.setupUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} GoDineQR. All Rights Reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function sendWelcomeEmail({
    email,
    token,
    locale,
    restaurantName,
}: {
    email: string;
    token: string;
    locale: string;
    restaurantName: string;
}): Promise<void> {
    const lang = (emailTranslations[locale as SupportedLocale] ? locale : 'en') as SupportedLocale;
    const t = emailTranslations[lang];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.godineqr.com';
    const setupUrl = `${baseUrl}/${lang}/auth/set-password?token=${token}`;

    const html = buildEmailHtml({
        title: t.title,
        greeting: t.greeting,
        message: t.message,
        btnText: t.btnText,
        setupUrl,
        restaurantName,
        footer: t.footer,
    });

    await transporter.sendMail({
        from: `"GoDineQR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: t.subject,
        html,
    });
}

export async function sendPasswordResetEmail({
    email,
    token,
    locale,
}: {
    email: string;
    token: string;
    locale: string;
}): Promise<void> {
    const lang = (emailTranslations[locale as SupportedLocale] ? locale : 'en') as SupportedLocale;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.godineqr.com';
    const resetUrl = `${baseUrl}/${lang}/auth/set-password?token=${token}&mode=reset`;

    const subjectMap: Record<SupportedLocale, string> = {
        en: 'GoDineQR – Password Reset Request',
        de: 'GoDineQR – Passwort zurücksetzen',
        it: 'GoDineQR – Reimpostazione password',
        sk: 'GoDineQR – Obnovenie hesla',
        fr: 'GoDineQR – Réinitialisation du mot de passe',
        tr: 'GoDineQR – Şifre Sıfırlama',
    };

    const bodyMap: Record<SupportedLocale, { title: string; message: string; btn: string }> = {
        en: { title: 'Password Reset', message: 'You requested a password reset. Click below to set a new password. This link expires in 1 hour.', btn: 'Reset Password' },
        de: { title: 'Passwort zurücksetzen', message: 'Sie haben eine Passwortzurücksetzung angefordert. Klicken Sie unten, um ein neues Passwort festzulegen. Dieser Link läuft in 1 Stunde ab.', btn: 'Passwort zurücksetzen' },
        it: { title: 'Reimposta password', message: 'Hai richiesto una reimpostazione della password. Clicca qui sotto per impostare una nuova password. Questo link scade tra 1 ora.', btn: 'Reimposta password' },
        sk: { title: 'Obnovenie hesla', message: 'Požiadali ste o obnovenie hesla. Kliknite nižšie pre nastavenie nového hesla. Tento odkaz vyprší za 1 hodinu.', btn: 'Obnoviť heslo' },
        fr: { title: 'Réinitialisation du mot de passe', message: 'Vous avez demandé une réinitialisation de mot de passe. Cliquez ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.', btn: 'Réinitialiser le mot de passe' },
        tr: { title: 'Şifre Sıfırlama', message: 'Şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıya tıklayın. Bu bağlantı 1 saat içinde geçersiz olacak.', btn: 'Şifremi Sıfırla' },
    };

    const b = bodyMap[lang];

    const html = buildEmailHtml({
        title: b.title,
        greeting: '',
        message: b.message,
        btnText: b.btn,
        setupUrl: resetUrl,
        restaurantName: '',
        footer: emailTranslations[lang].footer,
    });

    await transporter.sendMail({
        from: `"GoDineQR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subjectMap[lang],
        html,
    });
}
