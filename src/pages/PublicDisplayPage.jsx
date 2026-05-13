import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TIME_SLOTS,
  EMPTY_SLOT_PLACEHOLDER,
  formatLocalDateKey,
  getRollingDisplayDateRange,
  getRollingDisplayDates,
  getSlotDisplayValue,
  getValidTimeSlots,
  parseLocalDateKey,
} from '../lib/calendarUtils';
import {
  fetchSiteSettings,
  fetchPublishedSlotContent,
  mapSlotContentByDate,
} from '../lib/displayContentApi';
import { hasSupabaseConfig } from '../lib/supabaseClient';
import defaultLogoUrl from '../../logo/logo2.png';

const LEGACY_SITE_TITLE = 'Kolkata Fatafati';
const LEGACY_LOGO_FILENAME = 'logo1';

const DEFAULT_SITE_SETTINGS = {
  siteTitle: 'Goa Super Satta',
  logoUrl: '',
  emptyStateText: EMPTY_SLOT_PLACEHOLDER,
  defaultSlots: DEFAULT_TIME_SLOTS,
  lastUpdatedAt: '',
};

function isLegacyLogoUrl(value) {
  return value.toLowerCase().includes(LEGACY_LOGO_FILENAME);
}

function normalizeSiteSettings(settings) {
  if (!settings) {
    return DEFAULT_SITE_SETTINGS;
  }

  return {
    siteTitle:
      typeof settings.site_title === 'string' && settings.site_title.trim()
        ? settings.site_title.trim() === LEGACY_SITE_TITLE
          ? DEFAULT_SITE_SETTINGS.siteTitle
          : settings.site_title.trim()
        : DEFAULT_SITE_SETTINGS.siteTitle,
    logoUrl:
      typeof settings.logo_url === 'string' && settings.logo_url.trim()
        ? isLegacyLogoUrl(settings.logo_url.trim())
          ? DEFAULT_SITE_SETTINGS.logoUrl
          : settings.logo_url.trim()
        : DEFAULT_SITE_SETTINGS.logoUrl,
    emptyStateText:
      typeof settings.empty_state_text === 'string' &&
      settings.empty_state_text.trim()
        ? settings.empty_state_text.trim()
        : DEFAULT_SITE_SETTINGS.emptyStateText,
    defaultSlots: getValidTimeSlots(settings.default_slots),
    lastUpdatedAt:
      typeof settings.last_updated_at === 'string'
        ? settings.last_updated_at
        : DEFAULT_SITE_SETTINGS.lastUpdatedAt,
  };
}

function formatLastUpdated(value) {
  if (!value) {
    return 'Last updated: Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Last updated: Not available';
  }

  return `Last updated: ${date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })}`;
}

function formatDisplayTime(date) {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getBoardValueParts(value, placeholder) {
  const displayValue = getSlotDisplayValue(value, placeholder);
  const parts = displayValue.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return {
      mainValue: parts.slice(0, -1).join(' '),
      subValue: parts[parts.length - 1],
    };
  }

  return {
    mainValue: displayValue,
    subValue: '',
  };
}

function formatBoardDateLabel(day) {
  const [year, month, date] = day.isoDate.split('-');

  return `${date}-${month}-${year} (${day.dayLabel})`;
}

function PublicDisplayPage() {
  const [todayKey, setTodayKey] = useState(() => formatLocalDateKey());
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const todayDate = useMemo(() => parseLocalDateKey(todayKey), [todayKey]);
  const displayDates = useMemo(
    () => getRollingDisplayDates(todayDate),
    [todayDate],
  );
  const displayDateRange = useMemo(
    () => getRollingDisplayDateRange(todayDate),
    [todayDate],
  );
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [slotContentByDate, setSlotContentByDate] = useState({});
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const latestTodayKey = formatLocalDateKey();

      if (latestTodayKey !== todayKey) {
        setTodayKey(latestTodayKey);
      }
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [todayKey]);

  useEffect(() => {
    let isMounted = true;

    async function loadDisplayContent() {
      const { startDate, endDate } = displayDateRange;

      if (!startDate || !endDate || !hasSupabaseConfig) {
        return;
      }

      const [settingsResult, contentResult] = await Promise.all([
        fetchSiteSettings(),
        fetchPublishedSlotContent(startDate, endDate),
      ]);

      if (!isMounted) {
        return;
      }

      if (settingsResult.error || contentResult.error) {
        setLoadError('Display data is temporarily unavailable.');
        return;
      }

      setSiteSettings(normalizeSiteSettings(settingsResult.data));
      setSlotContentByDate(mapSlotContentByDate(contentResult.data));
    }

    loadDisplayContent();

    return () => {
      isMounted = false;
    };
  }, [displayDateRange]);

  return (
    <main className="display-page">
      <header className="display-header">
        <div className="logo-mark" aria-hidden="true">
          <img src={defaultLogoUrl} alt="" />
        </div>
        <div>
          <p className="brand-kicker">Welcome to</p>
          <h1>{siteSettings.siteTitle}</h1>
        </div>
      </header>

      <section className="refresh-strip" aria-label="Refresh display">
        <button type="button" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </section>

      <section className="display-intro" aria-label="Display board information">
        <p>Rolling 30 Day Display</p>
        <h2>{displayDates[0]?.dateLabel}</h2>
        <span className="display-clock">{formatDisplayTime(currentTime)}</span>
        <span className="display-status">
          {formatLastUpdated(siteSettings.lastUpdatedAt)}
        </span>
        {loadError ? <span className="display-status">{loadError}</span> : null}
      </section>

      <section className="display-board" aria-label="Date-wise display board">
        {displayDates.map((day) => {
          const boardDateLabel = formatBoardDateLabel(day);

          return (
            <article className="date-row" key={day.isoDate}>
              <div className="date-cell">
                <span>{day.dayLabel}</span>
                <strong>{day.dateLabel}</strong>
              </div>

              <div className="mobile-date-header">{boardDateLabel}</div>

              <div className="slot-grid">
                {siteSettings.defaultSlots.map((slotTime) => {
                  const { mainValue, subValue } = getBoardValueParts(
                    slotContentByDate[day.isoDate]?.[slotTime],
                    siteSettings.emptyStateText,
                  );

                  return (
                    <div className="slot-cell" key={`${day.isoDate}-${slotTime}`}>
                      <span>{slotTime}</span>
                      <strong>
                        <span className="main-value">{mainValue}</span>
                        {subValue ? (
                          <span className="sub-value">{subValue}</span>
                        ) : null}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <footer className="display-footer">
        <p>All values are shown date-wise for display purposes only.</p>
        <section
          className="disclaimer-section"
          aria-labelledby="disclaimer-title"
        >
          <h2 id="disclaimer-title">Disclaimer</h2>
          <p>
            Please use this astrology and numerology-based platform at your own
            judgment and discretion. The information displayed here is intended
            only for educational, reference, and calculation-related purposes.
            We respect applicable regional access guidelines and are not
            connected with any outside organization, betting platform, or
            unauthorized service.
          </p>
          <p>
            By using this website, you agree that you are fully responsible for
            how you interpret or use the information shown here. If this content
            is not suitable for you, or if it does not match your local rules or
            personal preferences, please leave the website immediately.
          </p>
          <p>
            Copying, reproducing, or reusing any content from this website
            without permission is strictly prohibited.
          </p>
        </section>
      </footer>
    </main>
  );
}

export default PublicDisplayPage;
