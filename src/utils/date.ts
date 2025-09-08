export const tenMinutesFromNow = () => new Date(Date.now() + 10 * 60 * 1000);
export const fiftenMinutesFromNow = () => new Date(Date.now() + 15 * 60 * 1000);
export const thirtyDaysFromNow = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000);

export const getTodaysDate = () => {
  const today = new Date();
  const { day, month, year } = {
    day: today.getDate(),
    month: today.toLocaleString("en-US", { month: "long" }).toLowerCase(),
    year: today.getFullYear(),
  };
  return `${day} ${month} ${year}`;
};

export const twentyFourHoursAgo = () =>
  new Date(Date.now() - 24 * 60 * 60 * 1000);
