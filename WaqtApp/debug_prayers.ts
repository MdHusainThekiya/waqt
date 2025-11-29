import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import dayjs from 'dayjs';

// Mock Location (Mumbai)
const coordinates = new Coordinates(19.0760, 72.8777);
const date = new Date();

console.log('--- Debugging Prayer Times ---');
console.log(`Date: ${date.toDateString()}`);
console.log(`Location: ${coordinates.latitude}, ${coordinates.longitude}`);

const params = CalculationMethod.Karachi();
params.madhab = Madhab.Hanafi;

console.log('Method: Karachi');
console.log('Madhab: Hanafi');

const prayerTimes = new PrayerTimes(coordinates, date, params);

console.log('Fajr:', dayjs(prayerTimes.fajr).format('h:mm A'));
console.log('Sunrise:', dayjs(prayerTimes.sunrise).format('h:mm A'));
console.log('Dhuhr:', dayjs(prayerTimes.dhuhr).format('h:mm A'));
console.log('Asr:', dayjs(prayerTimes.asr).format('h:mm A'));
console.log('Maghrib:', dayjs(prayerTimes.maghrib).format('h:mm A'));
console.log('Isha:', dayjs(prayerTimes.isha).format('h:mm A'));

console.log('--- End Debug ---');
