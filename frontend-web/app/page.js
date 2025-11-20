"use client";
import { Button, Calendar, HeroUIProvider } from "@heroui/react";

export default function Page() {
  return (
    <HeroUIProvider>
      <main>
        <Button className="bg-red-500 text-white">dfdjll</Button>
        <Calendar />
      </main>
    </HeroUIProvider>
  );
}
