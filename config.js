// Configuration settings for the Open Author Clock
export const config = {
  // Data source
  // Default language ('en' or 'ko'); can be overridden with ?lang=ko in the URL
  language: 'ko',
  dataUrls: {
    en: 'data.json',
    ko: 'data.ko.json'
  },
  
  // Update interval in milliseconds (60000 = 1 minute)
  updateInterval: 60000,
  
  // Transition settings
  fadeOutDuration: 1000,  // milliseconds
  fadeInDuration: 1000,   // milliseconds
  
  // Font size adjustment
  // The quote is measured after rendering and shrunk until it fits the
  // container's height without scrolling, rather than guessed from
  // character count. Width always fills the container (see #quote's
  // width: 100% in styles.css), so only height needs to be solved for.
  fontSize: {
    minPx: 16,       // Smallest the quote is allowed to shrink to
    maxPx: 160,      // Largest the quote is allowed to grow to (short quotes)
    heightRatio: 0.8 // Fraction of the available container height to fill
  },
  
  // Screen wake lock settings
  enableWakeLock: true,
  wakeLockFallbackInterval: 30000, // milliseconds
  
  // UTC timezone detection
  utcTimezonesOffset: -7, // Hours to adjust for UTC timezones
  
  // Selectors
  selectors: {
    quote: '#quote',
    author: '#author',
    quoteContainer: '#quoteContainer'
  }
};
