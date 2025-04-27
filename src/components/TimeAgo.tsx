//import { useState, useEffect } from "react";

// const utcNow = () => {
//   const d = new Date();
//   return d.getTime();
// };

const ranges = {
  years: 3600 * 24 * 365,
  months: 3600 * 24 * 30,
  weeks: 3600 * 24 * 7,
  days: 3600 * 24,
  hours: 3600,
  minutes: 60,
  seconds: 1,
} as const;

export const TimeAgo = ({ ts }: { ts?: number }) => {
  //const now = utcNow();
  //const [diff, setDiff] = useState(now - (ts ?? 0));
  const date = new Date(ts ?? 0);
  // useEffect(() => {
  //   if (ts == null) {
  //     return;
  //   }
  //   const initialDiff = utcNow() - ts;
  //   if (initialDiff > 60000 * 10) {
  //     setDiff(initialDiff);
  //     return;
  //   }
  //   const interval = setInterval(
  //     () => {
  //       setDiff(utcNow() - ts);
  //     },
  //     initialDiff > 60000 ? 60000 : 1000
  //   );
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [ts]);
  if (ts == null) {
    return null;
  }

  const formatter = new Intl.RelativeTimeFormat("sv-SE");

  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (const [key, range] of Object.entries(ranges)) {
    if (range < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / range;
      return formatter.format(
        Math.round(delta),
        key as Intl.RelativeTimeFormatUnit
      );
    }
  }

  // const seconds = Math.floor(diff / 1000);
  // const minutes = Math.floor(seconds / 60);
  // const hours = Math.floor(minutes / 60);
  // const days = Math.floor(hours / 24);
  // if (diff < 0) {
  //   return <span>Just nu</span>;
  // }
  // if (days > 0) {
  //   return <span>{days} dagar sedan</span>;
  // }
  // if (hours > 0) {
  //   return <span>{hours} timmar sedan</span>;
  // }
  // if (minutes > 0) {
  //   return <span>{minutes} minuter sedan</span>;
  // }
  // return <span>{seconds} sekunder sedan</span>;
};
