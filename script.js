import { config } from './config.js';

// State management
let quotes = [];
let wakeLock = null;

/**
 * Initialize the application
 */
async function init() {
  try {
    await loadQuotes();
    setupWakeLock();
    setupFallbackKeepAwake();
    applyEReaderStyles();
    setupResponsiveRefit();
    updateQuote();
    setInterval(updateQuote, config.updateInterval);
  } catch (error) {
    console.error('Failed to initialize application:', error);
    displayError('Failed to load quotes. Please refresh the page.');
  }
}

/**
 * Load quotes from external JSON file
 */
function getDataUrl() {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang') || config.language;
  return config.dataUrls[lang] || config.dataUrls.en;
}

async function loadQuotes() {
  try {
    const response = await fetch(getDataUrl());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    quotes = await response.json();
    console.log(`Loaded ${quotes.length} quotes`);
  } catch (error) {
    console.error('Error loading quotes:', error);
    throw error;
  }
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current time adjusted for UTC if necessary
 */
function getCurrentTime() {
  const now = new Date();
  
  if (isDeviceTimeUTC()) {
    // Adjust for UTC timezone
    const adjustedTime = new Date(now.getTime() + (config.utcTimezonesOffset * 60 * 60 * 1000));
    return {
      hours: adjustedTime.getHours(),
      minutes: adjustedTime.getMinutes()
    };
  }
  
  return {
    hours: now.getHours(),
    minutes: now.getMinutes()
  };
}

/**
 * Check if device is using UTC time
 */
function isDeviceTimeUTC() {
  const offset = new Date().getTimezoneOffset();
  return offset === 0;
}

/**
 * Find quote for current time
 */
function findQuoteForCurrentTime() {
  const { hours, minutes } = getCurrentTime();
  const currentMinutes = hours * 60 + minutes;
  const currentTimeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  // Try to find exact match
  let matchedQuote = quotes.find(q => q.time === currentTimeString);
  
  // If no exact match, find closest time
  if (!matchedQuote && quotes.length > 0) {
    let closestQuote = quotes[0];
    let smallestDifference = Math.abs(convertTimeToMinutes(quotes[0].time) - currentMinutes);
    
    for (const quote of quotes) {
      const quoteMinutes = convertTimeToMinutes(quote.time);
      const difference = Math.abs(quoteMinutes - currentMinutes);
      
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestQuote = quote;
      }
    }
    
    matchedQuote = closestQuote;
  }
  
  return matchedQuote;
}

/**
 * Shrink (or grow) the quote's font size until it fits inside the
 * container without needing to scroll, based on its actual rendered
 * dimensions rather than a character-count guess. Works for any
 * language/script and any viewport size or orientation.
 */
function fitQuoteText() {
  const quoteElement = document.querySelector(config.selectors.quote);
  const container = document.querySelector(config.selectors.quoteContainer);
  const authorElement = document.querySelector(config.selectors.author);
  if (!quoteElement || !container) return;

  // #quote is fixed to 100% width (see CSS), so it always wraps within
  // the container and can never overflow horizontally. Only the vertical
  // fit needs to be measured/solved for.
  const containerRect = container.getBoundingClientRect();
  const containerStyle = getComputedStyle(container);
  const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);

  // On narrow layouts the author line sits in normal flow below the quote
  // and takes up vertical space; on wide layouts it's absolutely
  // positioned and doesn't, so only reserve space for it when stacked.
  const authorIsStacked = authorElement && getComputedStyle(authorElement).position === 'static';
  const authorSpace = authorIsStacked ? authorElement.getBoundingClientRect().height + 32 : 0;

  const maxHeight = (containerRect.height - paddingY - authorSpace) * config.fontSize.heightRatio;

  const { minPx, maxPx } = config.fontSize;

  const fitsAt = (px) => {
    quoteElement.style.fontSize = `${px}px`;
    return quoteElement.scrollHeight <= maxHeight;
  };

  if (fitsAt(maxPx)) return;

  let lo = minPx;
  let hi = maxPx;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (fitsAt(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  quoteElement.style.fontSize = `${lo}px`;
}

/**
 * Highlight time string within quote text
 */
function highlightTimeString(quoteText, timeString) {
  // Escape special regex characters
  const escapedTimeString = timeString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTimeString})`, 'gi');
  return quoteText.replace(regex, '<strong>$1</strong>');
}

/**
 * Update displayed quote
 */
function updateQuote() {
  const matchedQuote = findQuoteForCurrentTime();
  
  if (!matchedQuote) {
    console.warn('No quote found for current time');
    return;
  }
  
  const quoteElement = document.querySelector(config.selectors.quote);
  const authorElement = document.querySelector(config.selectors.author);
  
  if (!quoteElement || !authorElement) {
    console.error('Quote or author element not found');
    return;
  }
  
  // Fade out
  quoteElement.style.opacity = '0';
  authorElement.style.opacity = '0';
  
  setTimeout(() => {
    // Update content
    const highlightedQuote = highlightTimeString(matchedQuote.quote, matchedQuote.timeString);
    quoteElement.innerHTML = `"${highlightedQuote}"`;
    authorElement.textContent = `${matchedQuote.title} – ${matchedQuote.author}`;
    
    // Shrink/grow font size to fit without scrolling
    fitQuoteText();

    // Fade in
    quoteElement.style.opacity = '1';
    authorElement.style.opacity = '1';
  }, config.fadeOutDuration);
}

/**
 * Re-fit the quote text whenever the viewport changes (resize, rotation)
 * or once the web font finishes loading (fallback-font metrics can differ
 * enough from the final font to leave the fit slightly off).
 */
function setupResponsiveRefit() {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(fitQuoteText, 150);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => fitQuoteText());
  }
}

/**
 * Display error message to user
 */
function displayError(message) {
  const container = document.querySelector(config.selectors.quoteContainer);
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; color: #ff0000; padding: 2rem;">
        <h2>Error</h2>
        <p>${message}</p>
      </div>
    `;
  }
}

/**
 * Setup screen wake lock to prevent screen from sleeping
 */
async function setupWakeLock() {
  if (!config.enableWakeLock || !('wakeLock' in navigator)) {
    console.log('Wake Lock API not supported');
    return;
  }
  
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock active');
    
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock released');
    });
    
    // Reacquire wake lock when page becomes visible
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && wakeLock !== null) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock reacquired');
        } catch (err) {
          console.error('Failed to reacquire wake lock:', err);
        }
      }
    });
  } catch (err) {
    console.error('Wake Lock request failed:', err);
  }
}

/**
 * Fallback method to keep screen awake on older devices
 */
function setupFallbackKeepAwake() {
  setInterval(() => {
    window.scrollBy(0, 1);
    window.scrollBy(0, -1);
  }, config.wakeLockFallbackInterval);
}

/**
 * Apply special styles for e-reader devices
 */
function applyEReaderStyles() {
  const isEReader = /\b(Kindle|NOOK|Kobo|Sony Reader)\b/i.test(navigator.userAgent);
  
  if (isEReader) {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
    console.log('E-reader styles applied');
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
