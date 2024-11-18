import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';

import currentLocale from '../currentLocale';
import HttpClient from '../HttpClient';

/**
 * Manages the recommended {@link SpeechSynthesisVoice} for the current locale.
 * Uses https://hadriengardeur.github.io/web-speech-recommended-voices/
 * to fetch recommended voices.
 */

/**
 * Partial interface definition for the JSON schema for recommended voices,
 * limited to the properties we need.
 *
 * See https://github.com/HadrienGardeur/web-speech-recommended-voices/blob/main/voices.schema.json
 * for the full schema.
 */
interface PartialRecommendedVoices {
  voices: {
    name: string;
    altNames?: string[];
    language: string;
  }[];
}

let recommendedVoice: SpeechSynthesisVoice | undefined = undefined;

// Update the recommended voice when the voices change.
speechSynthesis.addEventListener?.('voiceschanged', () =>
  fetchRecommendedVoice().then(voice => (recommendedVoice = voice))
);

/**
 * Returns the recommended voice for the current locale, based on
 * https://hadriengardeur.github.io/web-speech-recommended-voices/
 *
 * If no recommended voice is found, returns undefined.
 */
async function fetchRecommendedVoice() {
  if (speechSynthesis.getVoices().length === 0) {
    return;
  }

  const locale = currentLocale();
  const lang = locale.split('-')[0];

  try {
    const {value} = await HttpClient.fetchJson<PartialRecommendedVoices>(
      `https://hadriengardeur.github.io/web-speech-recommended-voices/json/${lang}.json`
    );

    const recommendedVoices = value.voices.filter(
      voice => voice.language === locale
    );
    const availableVoices = speechSynthesis
      .getVoices()
      .filter(voice => voice.lang === locale);

    // The recommended voices are sorted by quality, so we can just pick the first one that is available.
    for (const recommended of recommendedVoices) {
      const availableVoice = availableVoices.find(
        available =>
          available.name === recommended.name ||
          (recommended.altNames &&
            recommended.altNames.includes(available.name))
      );
      if (availableVoice) {
        return availableVoice;
      }
    }
  } catch (error) {
    MetricsReporter.logError({
      errorMessage: 'BrowserTextToSpeech: error fetching recommended voice',
      error,
    });
  }
}

function getRecommendedVoice() {
  return recommendedVoice;
}

export {getRecommendedVoice};
