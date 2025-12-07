"use client";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { initializeUserDataWatcher } from "./utils/auth";
import { useEffect } from "react";

export default function Providers({ children }) {
  useEffect(() => {
    initializeUserDataWatcher();
  }, []);

  return (
    <HeroUIProvider>
      <ToastProvider duration={1000} />
      {children}
    </HeroUIProvider>
  );
}
