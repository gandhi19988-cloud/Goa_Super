import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TIME_SLOTS,
  EMPTY_SLOT_PLACEHOLDER,
  getCurrentMonthDateRange,
  getCurrentMonthDates,
  getSlotDisplayValue,
  getValidTimeSlots,
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

function PublicDisplayPage() {
  const monthDates = useMemo(() => getCurrentMonthDates(), []);
  const monthDateRange = useMemo(() => getCurrentMonthDateRange(), []);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [slotContentByDate, setSlotContentByDate] = useState({});
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDisplayContent() {
      const { startDate, endDate } = monthDateRange;

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
  }, [monthDates, monthDateRange]);

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

      <section className="display-intro" aria-label="Display board information">
        <p>Current Month Display</p>
        <h2>{monthDates[0]?.dateLabel.split(' ').slice(1).join(' ')}</h2>
        <span className="display-status">
          {formatLastUpdated(siteSettings.lastUpdatedAt)}
        </span>
        {loadError ? <span className="display-status">{loadError}</span> : null}
      </section>

      <section className="display-board" aria-label="Date-wise display board">
        {monthDates.map((day) => (
          <article className="date-row" key={day.isoDate}>
            <div className="date-cell">
              <span>{day.dayLabel}</span>
              <strong>{day.dateLabel}</strong>
            </div>

            <div className="slot-grid">
              {siteSettings.defaultSlots.map((slotTime) => (
                <div className="slot-cell" key={`${day.isoDate}-${slotTime}`}>
                  <span>{slotTime}</span>
                  <strong>
                    {getSlotDisplayValue(
                      slotContentByDate[day.isoDate]?.[slotTime],
                      siteSettings.emptyStateText,
                    )}
                  </strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="display-footer">
        <p>All values are shown date-wise for display purposes only.</p>
      </footer>
    </main>
  );
}

export default PublicDisplayPage;
