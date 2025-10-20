"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function TrustedBy() {
  const companies = [
    { name: "Stanford University", logo: "/logos/stanford.png" },
    { name: "MIT", logo: "/logos/mit.png" },
    { name: "Google Research", logo: "/logos/google.png" },
    { name: "OpenAI", logo: "/logos/openai.png" },
    { name: "DeepMind", logo: "/logos/deepmind.png" },
    { name: "Harvard", logo: "/logos/harvard.png" },
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
          Trusted by researchers and professionals at
        </p>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {companies.map((company) => (
              <CarouselItem key={company.name} className="md:basis-1/3 lg:basis-1/6">
                <div className="p-4 flex items-center justify-center h-24">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={120}
                    height={60}
                    className="object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
