"use client";
import Header from './(main-web)/Header';
import HeroSection from './(main-web)/HeroSection';
import SectionHeader from './(main-web)/SectionHeader';
import NewsGrid from './(main-web)/NewsGrid';
import Footer from './(main-web)/Footer';
import Layout from './(main-web)/layout';
import { Button, Calendar, HeroUIProvider } from "@heroui/react";

export default function Page() {
  return (
    <HeroUIProvider>
      <Header />
      <main>
        {/* <HeroSection /> */}

        <section className="container mx-auto px-4 py-8">
          <SectionHeader
            title="ताज़ा खबरें"
            badgeText="शपथ ग्रहण"
          />
          <NewsGrid />
        </section>

        {/* <section className="container mx-auto px-4 py-8">
          <SectionHeader
            title="बड़ी खबरें"
          />
          <NewsGrid />
        </section> */}

        <Layout />
      </main>

      <Footer />
    </HeroUIProvider>
  );
}
