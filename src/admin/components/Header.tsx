const Header = () => {
  const hour = new Date().getHours();

  let greeting = "🌙 Good Evening";

  if (hour >= 5 && hour < 12) {
    greeting = "🌅 Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "☀️ Good Afternoon";
  } else if (hour >= 17 && hour < 22) {
    greeting = "🌇 Good Evening";
  } else {
    greeting = "🌙 Good Night";
  }

  return (
    <div className="border-bottom p-3 bg-white shadow-sm d-flex justify-content-between align-items-center">
      <h4 className="mb-0">
        {greeting}, Dear Member 👋
      </h4>

      <span className="text-muted">
        {new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </span>
    </div>
  );
};

export default Header;