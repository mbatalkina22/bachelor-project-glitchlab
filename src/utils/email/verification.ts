import nodemailer from 'nodemailer';

// Define translations directly in the file to avoid import issues
const translations = {
  en: {
    emailVerificationSubject: 'Verify Your Email',
    emailVerificationTitle: 'Email Verification',
    emailVerificationBody: 'Thank you for registering with GlitchLab. Please verify your email address by entering the following code:',
    emailVerificationFooter: 'This code will expire in 30 minutes.',
    emailVerificationIgnore: 'If you did not request this email, please ignore it.',
    // Password reset translations
    passwordResetSubject: 'Reset Your Password',
    passwordResetTitle: 'Password Reset',
    passwordResetBody: 'We received a request to reset your password. Please enter the following verification code:',
    passwordResetFooter: 'This code will expire in 30 minutes.',
    passwordResetIgnore: 'If you did not request this password reset, please ignore this email.'
  },
  it: {
    emailVerificationSubject: 'Verifica la tua email',
    emailVerificationTitle: 'Verifica la tua email',
    emailVerificationBody: 'Grazie per esserti registrato su GlitchLab! Per completare la registrazione, inserisci il codice di verifica qui sotto:',
    emailVerificationFooter: 'Questo codice scadrà tra 30 minuti.',
    emailVerificationIgnore: 'Se non hai richiesto questa email, puoi ignorarla in sicurezza.',
    // Password reset translations in Italian
    passwordResetSubject: 'Reimposta la tua password',
    passwordResetTitle: 'Reimposta la password',
    passwordResetBody: 'Abbiamo ricevuto una richiesta di reimpostazione della password. Inserisci il seguente codice di verifica:',
    passwordResetFooter: 'Questo codice scadrà tra 30 minuti.',
    passwordResetIgnore: 'Se non hai richiesto questa reimpostazione della password, puoi ignorare questa email.'
  }
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (to: string, code: string, language: string = 'en') => {
  try {
    // Get translations for the requested language or fallback to English
    const localeKey = language === 'it' ? 'it' : 'en';
    const t = translations[localeKey];

    console.log(`Sending verification email in ${localeKey} language to ${to}`);

    const info = await transporter.sendMail({
      from: `"GlitchLab" <${process.env.EMAIL_USER}>`,
      to,
      subject: t.emailVerificationSubject,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="font-family: 'Secular One', sans-serif; color: #333; text-align: center;">${t.emailVerificationTitle}</h2>
        <p>${t.emailVerificationBody}</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
        </div>
        <p>${t.emailVerificationFooter}</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
        ${t.emailVerificationIgnore}
        </p>
      </div>
      `,
    });
    
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (to: string, code: string, language: string = 'en') => {
  try {
    // Get translations for the requested language or fallback to English
    const localeKey = language === 'it' ? 'it' : 'en';
    const t = translations[localeKey];

    console.log(`Sending password reset email in ${localeKey} language to ${to}`);

    const info = await transporter.sendMail({
      from: `"GlitchLab" <${process.env.EMAIL_USER}>`,
      to,
      subject: t.passwordResetSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">${t.passwordResetTitle}</h2>
          <p>${t.passwordResetBody}</p>
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>${t.passwordResetFooter}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            ${t.passwordResetIgnore}
          </p>
        </div>
      `,
    });
    
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
};

export const generateVerificationCode = (): string => {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
};