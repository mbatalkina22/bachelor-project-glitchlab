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
    passwordResetIgnore: 'If you did not request this password reset, please ignore this email.',
    // Workshop cancellation translations
    workshopCanceledSubject: 'Workshop Canceled',
    workshopCanceledTitle: 'Workshop Cancellation Notice',
    workshopCanceledBody: 'We regret to inform you that the following workshop has been canceled:',
    workshopCanceledContact: 'If you have any questions, please contact us.',
    workshopCanceledThankYou: 'Thank you for your understanding.',
    // Workshop update translations
    workshopUpdatedSubject: 'Workshop Details Updated',
    workshopUpdatedTitle: 'Workshop Details Updated',
    workshopUpdatedBody: 'We would like to inform you that the details of the following workshop have been updated:',
    workshopUpdatedNote: 'Please note these changes in your calendar.',
    workshopUpdatedQuestions: 'If you have any questions, please contact us.',
    workshopUpdatedThankYou: 'Thank you for your understanding.',
    previouslyScheduledFor: 'Previously scheduled for',
    previousLocation: 'Previous location',
    newDateAndTime: 'New date and time',
    newLocation: 'New location'
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
    passwordResetIgnore: 'Se non hai richiesto questa reimpostazione della password, puoi ignorare questa email.',
    // Workshop cancellation translations in Italian
    workshopCanceledSubject: 'Workshop Annullato',
    workshopCanceledTitle: 'Avviso di Annullamento Workshop',
    workshopCanceledBody: 'Ci dispiace informarti che il seguente workshop è stato annullato:',
    workshopCanceledContact: 'Se hai domande, non esitare a contattarci.',
    workshopCanceledThankYou: 'Grazie per la comprensione.',
    // Workshop update translations in Italian
    workshopUpdatedSubject: 'Dettagli Workshop Aggiornati',
    workshopUpdatedTitle: 'Dettagli Workshop Aggiornati',
    workshopUpdatedBody: 'Desideriamo informarti che i dettagli del seguente workshop sono stati aggiornati:',
    workshopUpdatedNote: 'Ti preghiamo di prendere nota di queste modifiche nel tuo calendario.',
    workshopUpdatedQuestions: 'Se hai domande, non esitare a contattarci.',
    workshopUpdatedThankYou: 'Grazie per la comprensione.',
    previouslyScheduledFor: 'Precedentemente programmato per',
    previousLocation: 'Località precedente',
    newDateAndTime: 'Nuova data e ora',
    newLocation: 'Nuova località'
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

export const sendWorkshopCancellationEmail = async (to: string, workshopName: string, originalDate: Date, language: string = 'en') => {
  try {
    const localeKey = language === 'it' ? 'it' : 'en';
    const t = translations[localeKey];

    console.log(`Sending workshop cancellation email in ${localeKey} language to ${to}`);

    const formattedDate = originalDate.toLocaleDateString(localeKey === 'it' ? 'it-IT' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const info = await transporter.sendMail({
      from: `"GlitchLab" <${process.env.EMAIL_USER}>`,
      to,
      subject: t.workshopCanceledSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="font-family: 'Secular One', sans-serif; color: #333; text-align: center;">${t.workshopCanceledTitle}</h2>
          <p>${t.workshopCanceledBody}</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>${workshopName}</strong><br>
            ${formattedDate}
          </div>
          <p>${t.workshopCanceledContact}</p>
          <p>${t.workshopCanceledThankYou}</p>
        </div>
      `,
    });
    
    console.log('Workshop cancellation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send workshop cancellation email:', error);
    return false;
  }
};

interface WorkshopChangeDetails {
  workshopName: string;
  newDateTime?: Date;
  newLocation?: string;
  previousDateTime?: Date;
  previousLocation?: string;
  currentLocation?: string;  // Added for unchanged location reference
}

export const sendWorkshopUpdateEmail = async (
  to: string, 
  changes: WorkshopChangeDetails,
  language: string = 'en'
) => {
  try {
    const localeKey = language === 'it' ? 'it' : 'en';
    const t = translations[localeKey];

    console.log(`Sending workshop update email in ${localeKey} language to ${to}`);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString(localeKey === 'it' ? 'it-IT' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const info = await transporter.sendMail({
      from: `"GlitchLab" <${process.env.EMAIL_USER}>`,
      to,
      subject: t.workshopUpdatedSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="font-family: 'Secular One', sans-serif; color: #333; text-align: center;">${t.workshopUpdatedTitle}</h2>
          <p>${t.workshopUpdatedBody}</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">${changes.workshopName}</h3>
            
            ${(changes.previousDateTime || changes.previousLocation) ? `
              <div style="border-left: 3px solid #dc3545; padding-left: 15px; margin: 15px 0;">
                ${changes.previousDateTime ? `
                  <div style="margin: 10px 0; color: #333;">
                    <strong>${t.previouslyScheduledFor}:</strong><br>
                    ${formatDate(changes.previousDateTime)}
                  </div>
                ` : ''}
                ${changes.previousDateTime || changes.previousLocation ? `
                  <div style="margin: 10px 0; color: #333;">
                    <strong>${t.previousLocation}:</strong><br>
                    ${changes.previousLocation || changes.currentLocation}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${(changes.newDateTime || changes.newLocation) ? `
              <div style="border-left: 3px solid #28a745; padding-left: 15px; margin: 15px 0;">
                ${changes.newDateTime ? `
                  <div style="margin: 10px 0; color: #333;">
                    <strong>${t.newDateAndTime}:</strong><br>
                    ${formatDate(changes.newDateTime)}
                  </div>
                ` : ''}
                ${changes.newDateTime || changes.newLocation ? `
                  <div style="margin: 10px 0; color: #333;">
                    <strong>${t.newLocation}:</strong><br>
                    ${changes.newLocation || changes.currentLocation}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          
          <p>${t.workshopUpdatedNote}</p>
          <p>${t.workshopUpdatedQuestions}</p>
          <p>${t.workshopUpdatedThankYou}</p>
        </div>
      `,
    });
    
    console.log('Workshop update email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send workshop update email:', error);
    return false;
  }
};

export const generateVerificationCode = (): string => {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
};