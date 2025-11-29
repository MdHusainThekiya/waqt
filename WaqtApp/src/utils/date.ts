import dayjs from 'dayjs';

export const formatHijriDate = (date: Date | string | dayjs.Dayjs): string => {
  const dateObj = dayjs(date).toDate();
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch (e) {
    // Fallback if islamic-umalqura is not supported
    try {
      return new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.warn('Hijri date formatting failed', error);
      return '';
    }
  }
};
