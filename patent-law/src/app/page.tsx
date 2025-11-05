import { SimpleHero } from "@/components/SimpleHero";
import { Testimonials } from "@/components/Testimonials";
import { CLEFooter } from "@/components/CLEFooter";

export default function Home() {
  return (
    <main>
      <SimpleHero />
      <Testimonials />
      <CLEFooter />
    </main>
  );
}
