import { Anime, AudioLanguage, StreamSource } from '../types/anime';

function isHttps(value?: string): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function coversTerritory(territories?: string[], territory = 'IN'): boolean {
  return Boolean(territories?.some((item) => item === '*' || item.toUpperCase() === territory.toUpperCase()));
}

/** Only reviewed metadata with public evidence and matching territory can claim a Hindi dub. */
export function isHindiDubVerified(anime: Pick<Anime, 'hindiDub'>): boolean {
  const dub = anime.hindiDub;
  return Boolean(
    dub &&
    dub.isAvailable === true &&
    dub.verificationStatus === 'verified' &&
    isHttps(dub.evidenceUrl) &&
    coversTerritory(dub.territories)
  );
}

/**
 * A stream must have rights evidence, free/ad-free terms, a matching language,
 * a supported territory and HTTPS media/player URLs before the UI can expose it.
 */
export function getApprovedStreamSources(
  anime: Pick<Anime, 'streams'>,
  audio: AudioLanguage,
  territory = 'IN'
): StreamSource[] {
  const now = Date.now();
  return (anime.streams || []).filter((source) => {
    const expiryIsValid = !source.expiresAt ||
      (Number.isFinite(Date.parse(source.expiresAt)) && Date.parse(source.expiresAt) > now);
    const playerUrl = source.serverType === 'embed' ? (source.embedUrl || source.url) : source.url;
    return (
      source.rightsStatus === 'verified' &&
      isHttps(source.url) &&
      isHttps(source.rightsEvidenceUrl) &&
      isHttps(playerUrl) &&
      source.free === true &&
      source.adFree === true &&
      coversTerritory(source.territories, territory) &&
      Boolean(source.audioLanguages?.includes(audio)) &&
      expiryIsValid
    );
  });
}
