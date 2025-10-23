import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { FeaturedEpisodes } from "@/components/FeaturedEpisodes";
import { FinalCTA } from "@/components/FinalCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <FeaturedCategories />
      <FeaturedEpisodes />
      <FinalCTA />
    </main>
  );
}
