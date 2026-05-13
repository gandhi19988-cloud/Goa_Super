import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
} from 'date-fns';

export const EMPTY_SLOT_PLACEHOLDER = '*** *';

export const DEFAULT_TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

function getMonthDays(referenceDate) {
  return eachDayOfInterval({
    start: startOfMonth(referenceDate),
    end: endOfMonth(referenceDate),
  });
}

function formatMonthDate(date) {
  return {
    date,
    isoDate: formatLocalDateKey(date),
    dayLabel: format(date, 'EEE'),
    dateLabel: format(date, 'dd MMM yyyy'),
  };
}

export function formatLocalDateKey(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function parseLocalDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function getCurrentMonthDates(referenceDate = new Date(), order = 'desc') {
  const dates = getMonthDays(referenceDate);
  const orderedDates = order === 'asc' ? dates : [...dates].reverse();

  return orderedDates.map(formatMonthDate);
}

export function getCurrentMonthDateRange(referenceDate = new Date()) {
  return {
    startDate: formatLocalDateKey(startOfMonth(referenceDate)),
    endDate: formatLocalDateKey(endOfMonth(referenceDate)),
  };
}

export function getRollingDisplayDates(
  baseDate = new Date(),
  totalDays = 30,
) {
  return Array.from({ length: totalDays }, (_, index) =>
    formatMonthDate(subDays(baseDate, index)),
  );
}

export function getRollingDisplayDateRange(
  baseDate = new Date(),
  totalDays = 30,
) {
  return {
    startDate: formatLocalDateKey(subDays(baseDate, totalDays - 1)),
    endDate: formatLocalDateKey(baseDate),
  };
}

export function getMonthLabel(referenceDate = new Date()) {
  return format(referenceDate, 'MMMM yyyy');
}

export function getSlotDisplayValue(value, placeholder = EMPTY_SLOT_PLACEHOLDER) {
  if (typeof value !== 'string') {
    return placeholder;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : placeholder;
}

export function getValidTimeSlots(value, fallback = DEFAULT_TIME_SLOTS) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const slots = value.filter((slot) => typeof slot === 'string' && slot.trim());

  return slots.length > 0 ? slots : fallback;
}
