import { useEffect, useState } from "react";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();

  let greeting = "🌙 Good Evening";

  if (hour >= 5 && hour < 12) {
    greeting = "🌅 Good Morning";
  } else if (hour >= 12 && hour < 15) {
    greeting = "☀️ Good Noon";
  } else if (hour >= 15 && hour < 18) {
    greeting = "☀️ Good Afternoon";
  } else if (hour >= 18 && hour < 21) {
    greeting = "🌇 Good Evening";
  } else {
    greeting = "🌙 Good Night";
  }

 

  return (
    <div className="border-bottom p-3 bg-white shadow-sm d-flex justify-content-between align-items-center">
      <h4 className="mb-0">
        {greeting}, Dear Member 👋
      </h4>

      <div className="header-date-time">

        <div className="header-date">
          📅
          <span>
            {currentTime.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="header-clock">
          🕐
          <span>
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        </div>
    </div>
  );
};

export default Header;