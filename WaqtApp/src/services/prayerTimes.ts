import { Coordinates, Madhab, PrayerTimes, Qibla } from 'adhan';
import dayjs from 'dayjs';

import {
  PRAYER_LABELS,
  PRAYER_SEQUENCE,
} from '@/constants/prayers';
import {
  CALCULATION_METHODS,
  DEFAULT_CALCULATION_METHOD,
} from '@/constants/calculations';
import type {
  CalculationMethodId,
  JuristicMethod,
  NextPrayerMeta,
  PrayerIdentifier,
  PrayerScheduleItem,
  UserLocation,
} from '@/types/prayer';

interface ScheduleInput {
  location: UserLocation;
  offsets: Record<PrayerIdentifier, number>;
  juristicMethod: JuristicMethod;
  calculationMethod?: CalculationMethodId;
  forDate?: Date;
}

const buildCalculationParams = (
  juristicMethod: JuristicMethod,
  method: CalculationMethodId = DEFAULT_CALCULATION_METHOD,
) => {
  const params =
    CALCULATION_METHODS[method]?.build() ??
    CALCULATION_METHODS[DEFAULT_CALCULATION_METHOD].build();
  params.madhab =
    juristicMethod === 'HANAFI' ? Madhab.Hanafi : Madhab.Shafi;
  params.adjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };
  params.methodAdjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };
  return params;
};

export const calculatePrayerSchedule = ({
  location,
  offsets,
  juristicMethod,
  calculationMethod = DEFAULT_CALCULATION_METHOD,
  forDate = new Date(),
}: ScheduleInput): PrayerScheduleItem[] => {
  const coordinates = new Coordinates(
    location.latitude,
    location.longitude,
  );
  const params = buildCalculationParams(juristicMethod, calculationMethod);
  const prayerTimes = new PrayerTimes(coordinates, forDate, params);

  const baseMap: Record<PrayerIdentifier, Date> = {
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  return PRAYER_SEQUENCE.map((id, index) => {
    const label = PRAYER_LABELS[id].title;
    const azan = dayjs(baseMap[id]);
    const offsetMinutes = offsets[id] ?? 0;
    const adjusted = azan.add(offsetMinutes, 'minute');
    return {
      id,
      label,
      azan,
      adjusted,
      offsetMinutes,
      order: index,
    };
  });
};

export const determineNextPrayer = (
  schedule: PrayerScheduleItem[],
): NextPrayerMeta | null => {
  const current = dayjs();
  const upcoming = schedule.find(item => item.adjusted.isAfter(current));
  if (upcoming) {
    return {
      ...upcoming,
      index:
        typeof upcoming.order === 'number'
          ? upcoming.order
          : PRAYER_SEQUENCE.indexOf(upcoming.id),
    };
  }

  if (schedule.length === 0) {
    return null;
  }

  // Day has passed, surface the first prayer of next day.
  const first = schedule[0];
  return {
    ...first,
    adjusted: first.adjusted.add(1, 'day'),
    azan: first.azan.add(1, 'day'),
    index: typeof first.order === 'number' ? first.order : 0,
  };
};


export const calculateMonthSchedule = ({
  location,
  offsets,
  juristicMethod,
  calculationMethod = DEFAULT_CALCULATION_METHOD,
  month = new Date(),
}: ScheduleInput & { month?: Date }): { date: string; schedule: PrayerScheduleItem[] }[] => {
  const startOfMonth = dayjs(month).startOf('month');
  const daysInMonth = startOfMonth.daysInMonth();

  return Array.from({ length: daysInMonth }).map((_, index) => {
    const date = startOfMonth.add(index, 'day').toDate();
    const schedule = calculatePrayerSchedule({
      location,
      offsets,
      juristicMethod,
      calculationMethod,
      forDate: date,
    });
    return {
      date: dayjs(date).format('YYYY-MM-DD'),
      schedule,
    };
  });
};

export const calculateQibla = (location: UserLocation): number => {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  return Qibla(coordinates);
};
