import { useState, useEffect } from "react";

const utcNow = () => {
  const d = new Date();
  return d.getTime()*1000;
};

export const TimeAgo = ({ ts }: { ts?: number }) => {
  const now = utcNow();
  const [diff, setDiff] = useState(now - (ts ?? 0));

  useEffect(() => {
    if (ts == null) {
      return;
    }
    const interval = setInterval(() => {
      setDiff(utcNow() - ts);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [ts]);
  if (ts == null) {
    return null;
  }
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (diff < 0) {
    return <span>Just nu</span>;
  }
  if (days > 0) {
    return <span>{days} dagar sedan</span>;
  }
  if (hours > 0) {
    return <span>{hours} timmar sedan</span>;
  }
  if (minutes > 0) {
    return <span>{minutes} minuter sedan</span>;
  }
  return <span>{seconds} sekunder sedan</span>;
};
