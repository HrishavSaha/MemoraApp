import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import as from './locales/as.json';
import bn from './locales/bn.json';
import en from './locales/en.json';
import hi from './locales/hi.json';

// Bodo (brx), Manipuri (mni), Khasi (kha), Mizo (lus), Garo (grt) and Nagamese
// (nag) are selectable on the Localisation screen but don't have reviewed
// translations yet. i18next's fallbackLng renders them in English until a
// native speaker can verify copy for this health-context app.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    bn: { translation: bn },
    as: { translation: as },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
