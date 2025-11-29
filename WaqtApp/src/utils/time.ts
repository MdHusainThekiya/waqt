import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const now = () => dayjs();

export const formatPrayerTime = (value: dayjs.Dayjs) => value.format('h:mm A');

export const formatCountdown = (target: dayjs.Dayjs | null) => {
  if (!target) {
    return '--:--:--';
  }

  const diff = target.diff(now(), 'second');
  if (diff <= 0) {
    return '00:00:00';
  }

  const dur = dayjs.duration(diff, 'seconds');
  const hours = String(dur.hours()).padStart(2, '0');
  const minutes = String(dur.minutes()).padStart(2, '0');
  const seconds = String(dur.seconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

