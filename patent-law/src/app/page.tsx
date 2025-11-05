import { CLEHero } from "@/components/CLEHero";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CLEFooter } from "@/components/CLEFooter";

export default function Home() {
  return (
    <main>
      <CLEHero />
      <Testimonials />
      <FAQ />
      <CLEFooter />
    </main>
  );
}
