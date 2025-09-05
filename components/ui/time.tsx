// "use client"

// import {useEffect, useState} from 'react';

// const Time = () => {
//     const [time, setTime] = useState(new Date());

//     useEffect(() => {
//         const interval = setInterval(() => setTime(new Date()), 1000); //update every second
//         return () => clearInterval(interval);
//     }, []);

//     const timeNow = time.toLocaleTimeString([], {
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true, // set to false for 24-hour time format
//     });

//     return <span className="">{timeNow}</span>
// };

// export default Time;

// "use client";

// import { useEffect, useState } from "react";

// const Time = () => {
//   const [time, setTime] = useState<string | null>(null);

//   useEffect(() => {
//     // Initialize immediately after mount
//     const updateTime = () => {
//       const now = new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true, // false for 24-hour format
//       });
//       setTime(now);
//     };

//     updateTime(); // first run
//     const interval = setInterval(updateTime, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // Avoid rendering until after client mount
//   if (time === null) return null;

//   return <span>{time}</span>;
// };

// export default Time;

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const TimeComponent = () => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTime(now);
    };

    updateTime(); // run immediately on mount
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (time === null) return null;

  return <span>{time}</span>;
};

// ✅ disables SSR, only renders on client
export default dynamic(() => Promise.resolve(TimeComponent), { ssr: false });


