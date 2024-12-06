import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend, {HttpBackendOptions} from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpBackend)
  .init<HttpBackendOptions>({
    fallbackng: 'en_US',
    debug: 'true',
    backend: {
      loadPath: 'i18n/{{ns}}/{{lng}}.json',
    },
  });
