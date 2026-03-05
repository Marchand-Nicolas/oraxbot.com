import { createContext, useContext, useEffect, useState } from "react";

const ScrollContext = createContext();

export function ScrollProvider({ children }) {
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    if (scrollLocked) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo({
          top: parseInt(scrollY || "0") * -1,
          behavior: "instant",
        });
      }
    }
  }, [scrollLocked]);

  const lockScroll = () => setScrollLocked(true);
  const unlockScroll = () => setScrollLocked(false);

  return (
    <ScrollContext.Provider value={{ scrollLocked, lockScroll, unlockScroll }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within ScrollProvider");
  }
  return context;
}
