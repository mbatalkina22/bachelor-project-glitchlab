import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Ensure locale has a value, default to 'en'
  const safeLocale = locale || 'en';
  
  try {
    // Load messages for the requested locale
    const messages = (await import(`./app/messages/${safeLocale}.json`)).default;
    
    return {
      locale: safeLocale,
      messages,
      timeZone: 'Europe/Rome'
    };
  } catch (error) {
    console.error(`Error loading messages for locale "${safeLocale}":`, error);
    // Fallback to English if there's an error
    const messages = (await import('./app/messages/en.json')).default;
    
    return {
      locale: 'en',
      messages,
      timeZone: 'Europe/Rome'
    };
  }
}); 