import { SimpleHero } from "@/components/SimpleHero";
import { PainPoints } from "@/components/PainPoints";
import { Testimonials } from "@/components/Testimonials";
import { CLEFooter } from "@/components/CLEFooter";

export default function Home() {
  return (
    <main>
      <SimpleHero />
      <PainPoints />
      <Testimonials />
      <CLEFooter />
    </main>
  );
}
