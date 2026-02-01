// Regional temperature data from message-data.csv (Beijing/China region)
// 186 records of monthly temps. 999.9 = missing. Pre-computed averages.

export const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const monthlyAverages = {
  jan: -4.2, feb: -1.3, mar: 5.5, apr: 14.0, may: 20.3, jun: 24.7,
  jul: 26.4, aug: 25.1, sep: 20.1, oct: 13.0, nov: 4.3, dec: -2.3,
};

export const monthlyMin = {
  jan: -8.1, feb: -6.2, mar: 0.4, apr: 10.3, may: 17.5, jun: 21.5,
  jul: 23.4, aug: 22.5, sep: 17.1, oct: 9.0, nov: 0.8, dec: -6.7,
};

export const monthlyMax = {
  jan: 0.1, feb: 3.7, mar: 10.7, apr: 17.5, may: 23.3, jun: 28.2,
  jul: 29.5, aug: 27.8, sep: 23.1, oct: 16.1, nov: 7.9, dec: 1.0,
};

export const recordCount = 186;
