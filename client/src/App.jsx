import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { useEffect, useRef } from "react";
import { getMyReminders } from "./api/reminderApi";

const App = () => {
  const lastCheckedMinute = useRef("");

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const currentMinute = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const todayStr = now.toISOString().slice(0, 10);

      // Don't check multiple times in the same minute
      if (lastCheckedMinute.current === currentMinute) return;
      lastCheckedMinute.current = currentMinute;

      try {
        const { data } = await getMyReminders();
        const activeReminders = data?.reminders?.filter((r) => r.isActive) || [];

        activeReminders.forEach((reminder) => {
          const startDate = new Date(reminder.startDate).toISOString().slice(0, 10);
          const endDate = new Date(reminder.endDate).toISOString().slice(0, 10);

          if (todayStr >= startDate && todayStr <= endDate) {
            if (reminder.times?.includes(currentMinute)) {
              new Notification("Medicine Reminder", {
                body: `It's time to take ${reminder.medicineName}${reminder.dose ? ` (${reminder.dose})` : ""}.`,
                icon: "/favicon.ico",
              });
            }
          }
        });
      } catch (error) {
        console.error("Failed to check reminders for notifications:", error);
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <CartProvider>
      <ToastProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </CartProvider>
  );
};

export default App;
