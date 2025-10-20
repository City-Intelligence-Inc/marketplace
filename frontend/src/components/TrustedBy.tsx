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
    { name: "Harvard Law School", logo: "/logos/harvard-law.png" },
    { name: "Stanford University", logo: "/logos/stanford.avif" },
    { name: "UC Berkeley", logo: "/logos/berkeley.png" },
    { name: "Purdue University", logo: "/logos/purdue.png" },
    { name: "Meta", logo: "/logos/meta.png" },
    { name: "IIT Kharagpur", logo: "/logos/iit-kgp.svg" },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
          Trusted by listeners from
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
                <div className="py-2 px-1 flex items-center justify-center min-h-[100px]">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={180}
                    height={90}
                    className="object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
