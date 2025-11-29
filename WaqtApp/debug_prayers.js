const { Coordinates, CalculationMethod, PrayerTimes, Madhab, Qibla } = require('adhan');
const dayjs = require('dayjs');

// Mock Location (User Screenshot)
const coordinates = new Coordinates(19.184, 73.024);
const date = new Date();

console.log('--- Debugging Prayer Times ---');
console.log(`Date: ${date.toDateString()}`);
console.log(`Location: ${coordinates.latitude}, ${coordinates.longitude}`);

const params = CalculationMethod.Karachi();
params.madhab = Madhab.Shafi;

console.log('Method: Karachi');
console.log('Madhab: Standard (Shafi)');

const prayerTimes = new PrayerTimes(coordinates, date, params);
const qibla = Qibla(coordinates);

console.log('Fajr:', dayjs(prayerTimes.fajr).format('h:mm A'));
console.log('Sunrise:', dayjs(prayerTimes.sunrise).format('h:mm A'));
console.log('Dhuhr:', dayjs(prayerTimes.dhuhr).format('h:mm A'));
console.log('Asr:', dayjs(prayerTimes.asr).format('h:mm A'));
console.log('Maghrib:', dayjs(prayerTimes.maghrib).format('h:mm A'));
console.log('Isha:', dayjs(prayerTimes.isha).format('h:mm A'));
console.log('Qibla Direction:', qibla);

console.log('--- End Debug ---');
