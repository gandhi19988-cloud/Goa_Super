import { useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { signOutAdmin } from '../lib/adminAuth';
import {
  clearSlotContent,
  saveSlotContent,
  saveSiteSettings,
  touchSiteLastUpdated,
  uploadLogoFile,
} from '../lib/adminContentApi';
import {
  DEFAULT_TIME_SLOTS,
  getCurrentMonthDateRange,
  getCurrentMonthDates,
  getMonthLabel,
  getValidTimeSlots,
} from '../lib/calendarUtils';
import {
  fetchPublishedSlotContent,
  fetchSiteSettings,
  mapSlotContentByDate,
} from '../lib/displayContentApi';
import defaultLogoUrl from '../../logo/logo2.png';

const LEGACY_SITE_TITLE = 'Kolkata Fatafati';
const LEGACY_LOGO_FILENAME = 'logo1';

function getInputKey(date, slotTime) {
  return `${date}__${slotTime}`;
}

function isLegacyLogoUrl(value) {
  return value.toLowerCase().includes(LEGACY_LOGO_FILENAME);
}

const DEFAULT_SETTINGS_FORM = {
  id: '',
  siteTitle: 'Goa Super',
  logoUrl: '',
  emptyStateText: '*** *',
  defaultSlotsText: DEFAULT_TIME_SLOTS.join('\n'),
};

function getSettingsForm(settings) {
  if (!settings) {
    return DEFAULT_SETTINGS_FORM;
  }

  return {
    id: settings.id ?? '',
    siteTitle:
      settings.site_title === LEGACY_SITE_TITLE
        ? DEFAULT_SETTINGS_FORM.siteTitle
        : (settings.site_title ?? DEFAULT_SETTINGS_FORM.siteTitle),
    logoUrl:
      typeof settings.logo_url === 'string' && isLegacyLogoUrl(settings.logo_url)
        ? ''
        : (settings.logo_url ?? ''),
    emptyStateText:
      settings.empty_state_text ?? DEFAULT_SETTINGS_FORM.emptyStateText,
    defaultSlotsText: getValidTimeSlots(settings.default_slots).join('\n'),
  };
}

function parseSlotText(value) {
  return value
    .split('\n')
    .map((slot) => slot.trim())
    .filter(Boolean);
}

function AdminDashboardPage({ adminEmail, onSignOut }) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const monthDates = useMemo(
    () => getCurrentMonthDates(selectedMonth),
    [selectedMonth],
  );
  const monthDateRange = useMemo(
    () => getCurrentMonthDateRange(selectedMonth),
    [selectedMonth],
  );
  const monthLabel = useMemo(() => getMonthLabel(selectedMonth), [selectedMonth]);
  const [slotValues, setSlotValues] = useState({});
  const [timeSlots, setTimeSlots] = useState(DEFAULT_TIME_SLOTS);
  const [settingsForm, setSettingsForm] = useState(DEFAULT_SETTINGS_FORM);
  const [statusMessage, setStatusMessage] = useState('');
  const [settingsStatusMessage, setSettingsStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEditorData() {
      setIsLoading(true);
      setStatusMessage('');

      const { startDate, endDate } = monthDateRange;

      if (!startDate || !endDate) {
        setIsLoading(false);
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
        setStatusMessage('Unable to load editor data.');
        setIsLoading(false);
        return;
      }

      const slots = getValidTimeSlots(settingsResult.data?.default_slots);
      const contentByDate = mapSlotContentByDate(contentResult.data);
      const nextValues = {};

      monthDates.forEach((day) => {
        slots.forEach((slotTime) => {
          nextValues[getInputKey(day.isoDate, slotTime)] =
            contentByDate[day.isoDate]?.[slotTime] ?? '';
        });
      });

      setTimeSlots(slots);
      setSettingsForm(getSettingsForm(settingsResult.data));
      setSlotValues(nextValues);
      setIsLoading(false);
    }

    loadEditorData();

    return () => {
      isMounted = false;
    };
  }, [monthDates, monthDateRange]);

  async function handleSignOut() {
    const { error } = await signOutAdmin();

    if (!error) {
      onSignOut();
    }
  }

  function handleValueChange(inputKey, value) {
    setSlotValues((currentValues) => ({
      ...currentValues,
      [inputKey]: value,
    }));
  }

  function handlePreviousMonth() {
    setSelectedMonth((currentMonth) => subMonths(currentMonth, 1));
  }

  function handleCurrentMonth() {
    setSelectedMonth(new Date());
  }

  function handleNextMonth() {
    setSelectedMonth((currentMonth) => addMonths(currentMonth, 1));
  }

  function handleSettingsChange(field, value) {
    setSettingsForm((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }));
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    setSettingsStatusMessage('');

    const nextSlots = parseSlotText(settingsForm.defaultSlotsText);

    if (!settingsForm.siteTitle.trim()) {
      setSettingsStatusMessage('Site title is required.');
      return;
    }

    if (!settingsForm.emptyStateText.trim()) {
      setSettingsStatusMessage('Placeholder text is required.');
      return;
    }

    if (nextSlots.length === 0) {
      setSettingsStatusMessage('Add at least one default time slot.');
      return;
    }

    setIsSavingSettings(true);

    const { data, error } = await saveSiteSettings({
      id: settingsForm.id,
      siteTitle: settingsForm.siteTitle.trim(),
      logoUrl: settingsForm.logoUrl.trim(),
      emptyStateText: settingsForm.emptyStateText.trim(),
      defaultSlots: nextSlots,
    });

    if (error) {
      setSettingsStatusMessage(error.message || 'Unable to save settings.');
      setIsSavingSettings(false);
      return;
    }

    setSettingsForm(getSettingsForm(data));
    setTimeSlots(getValidTimeSlots(data.default_slots));
    setSettingsStatusMessage('Site settings saved.');
    setIsSavingSettings(false);
  }

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSettingsStatusMessage('Logo upload must be an image file.');
      event.target.value = '';
      return;
    }

    setIsUploadingLogo(true);
    setSettingsStatusMessage('');

    const { publicUrl, error } = await uploadLogoFile(file);

    if (error) {
      setSettingsStatusMessage(error.message || 'Unable to upload logo.');
      setIsUploadingLogo(false);
      event.target.value = '';
      return;
    }

    handleSettingsChange('logoUrl', publicUrl);
    setSettingsStatusMessage('Logo uploaded. Save settings to publish it.');
    setIsUploadingLogo(false);
    event.target.value = '';
  }

  async function handleSave(day, slotTime) {
    const inputKey = getInputKey(day.isoDate, slotTime);
    const value = slotValues[inputKey]?.trim() ?? '';

    setSavingKey(inputKey);
    setStatusMessage('');

    const { error } = value
      ? await saveSlotContent(day.isoDate, slotTime, value)
      : await clearSlotContent(day.isoDate, slotTime);

    if (error) {
      setStatusMessage(error.message || 'Unable to save slot.');
      setSavingKey('');
      return;
    }

    await touchSiteLastUpdated();

    setSlotValues((currentValues) => ({
      ...currentValues,
      [inputKey]: value,
    }));
    setStatusMessage(`Saved ${day.dateLabel} at ${slotTime}.`);
    setSavingKey('');
  }

  async function handleClear(day, slotTime) {
    const inputKey = getInputKey(day.isoDate, slotTime);

    setSavingKey(inputKey);
    setStatusMessage('');

    const { error } = await clearSlotContent(day.isoDate, slotTime);

    if (error) {
      setStatusMessage(error.message || 'Unable to clear slot.');
      setSavingKey('');
      return;
    }

    await touchSiteLastUpdated();

    setSlotValues((currentValues) => ({
      ...currentValues,
      [inputKey]: '',
    }));
    setStatusMessage(`Cleared ${day.dateLabel} at ${slotTime}.`);
    setSavingKey('');
  }

  return (
    <main className="admin-page dashboard-page">
      <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
        <header className="dashboard-header">
          <div className="admin-brand">
            <div className="logo-mark" aria-hidden="true">
              <img src={defaultLogoUrl} alt="" />
            </div>
            <div>
              <p className="brand-kicker">Private Control</p>
              <h1 id="admin-dashboard-title">Admin Dashboard</h1>
            </div>
          </div>

          <button className="secondary-button" type="button" onClick={handleSignOut}>
            Logout
          </button>
        </header>

        <div className="dashboard-summary">
          <p>Signed in as</p>
          <strong>{adminEmail}</strong>
        </div>

        <section className="settings-section" aria-labelledby="site-settings-title">
          <div className="editor-header">
            <div>
              <p className="dashboard-label">Display settings</p>
              <h2 id="site-settings-title">Site settings</h2>
            </div>
            {settingsStatusMessage ? (
              <p className="editor-status">{settingsStatusMessage}</p>
            ) : null}
          </div>

          <form className="settings-form" onSubmit={handleSettingsSubmit}>
            <label>
              <span>Site title</span>
              <input
                disabled={isSavingSettings}
                onChange={(event) =>
                  handleSettingsChange('siteTitle', event.target.value)
                }
                type="text"
                value={settingsForm.siteTitle}
              />
            </label>

            <label>
              <span>Logo URL</span>
              <input
                disabled={isSavingSettings || isUploadingLogo}
                onChange={(event) =>
                  handleSettingsChange('logoUrl', event.target.value)
                }
                placeholder="https://example.com/logo.png"
                type="url"
                value={settingsForm.logoUrl}
              />
            </label>

            <label>
              <span>Upload logo</span>
              <input
                accept="image/*"
                disabled={isSavingSettings || isUploadingLogo}
                onChange={handleLogoUpload}
                type="file"
              />
            </label>

            <label>
              <span>Blank placeholder</span>
              <input
                disabled={isSavingSettings}
                onChange={(event) =>
                  handleSettingsChange('emptyStateText', event.target.value)
                }
                type="text"
                value={settingsForm.emptyStateText}
              />
            </label>

            <label className="settings-slots-field">
              <span>Default time slots</span>
              <textarea
                disabled={isSavingSettings}
                onChange={(event) =>
                  handleSettingsChange('defaultSlotsText', event.target.value)
                }
                rows="6"
                value={settingsForm.defaultSlotsText}
              />
            </label>

            <button disabled={isSavingSettings} type="submit">
              {isSavingSettings || isUploadingLogo
                ? 'Working...'
                : 'Save settings'}
            </button>
          </form>
        </section>

        <section className="editor-section" aria-labelledby="slot-editor-title">
          <div className="editor-header">
            <div>
              <p className="dashboard-label">Editor month</p>
              <h2 id="slot-editor-title">Date/time slot editor</h2>
            </div>
            <div className="month-toolbar" aria-label="Editor month controls">
              <button type="button" onClick={handlePreviousMonth}>
                Previous
              </button>
              <strong>{monthLabel}</strong>
              <button type="button" onClick={handleCurrentMonth}>
                Current
              </button>
              <button type="button" onClick={handleNextMonth}>
                Next
              </button>
            </div>
            {statusMessage ? <p className="editor-status">{statusMessage}</p> : null}
          </div>

          {isLoading ? (
            <p className="admin-status">Loading editor...</p>
          ) : (
            <div className="editor-list">
              {monthDates.map((day) => (
                <article className="editor-date-row" key={day.isoDate}>
                  <div className="editor-date-cell">
                    <span>{day.dayLabel}</span>
                    <strong>{day.dateLabel}</strong>
                  </div>

                  <div className="editor-slot-list">
                    {timeSlots.map((slotTime) => {
                      const inputKey = getInputKey(day.isoDate, slotTime);
                      const isSaving = savingKey === inputKey;

                      return (
                        <div className="editor-slot-row" key={inputKey}>
                          <label>
                            <span>{slotTime}</span>
                            <input
                              disabled={isSaving}
                              onChange={(event) =>
                                handleValueChange(inputKey, event.target.value)
                              }
                              placeholder="*** *"
                              type="text"
                              value={slotValues[inputKey] ?? ''}
                            />
                          </label>

                          <div className="editor-actions">
                            <button
                              disabled={isSaving}
                              onClick={() => handleSave(day, slotTime)}
                              type="button"
                            >
                              {isSaving ? 'Saving' : 'Save'}
                            </button>
                            <button
                              className="secondary-button"
                              disabled={isSaving}
                              onClick={() => handleClear(day, slotTime)}
                              type="button"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminDashboardPage;
