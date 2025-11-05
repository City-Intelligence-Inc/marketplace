"use client";

import Image from "next/image";

export function TrustedBy() {
  const companies = [
    { name: "MIT", logo: "/logos/mit.png", height: 35, mobileHeight: 50 },
    { name: "Harvard Law School", logo: "/logos/harvard-law.png", height: 28, mobileHeight: 42 },
    { name: "Stanford University", logo: "/logos/stanford.avif", height: 56, mobileHeight: 70 },
    { name: "UC Berkeley", logo: "/logos/berkeley.png", height: 28, mobileHeight: 42 },
    { name: "University of Pennsylvania", logo: "/logos/penn.png", height: 56, mobileHeight: 70 },
    { name: "Purdue University", logo: "/logos/purdue.png", height: 40, mobileHeight: 50 },
    { name: "IIT Kharagpur", logo: "/logos/iit-kgp.svg", height: 42, mobileHeight: 60 },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider mb-8 sm:mb-6">
          Join listeners from
        </p>

        {/* Responsive grid: 1 col mobile, 2 cols tablet, 7 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 sm:gap-6 max-w-7xl mx-auto">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-center py-6 sm:py-4 px-4"
            >
              <Image
                src={company.logo}
                alt={company.name}
                width={240}
                height={company.height}
                unoptimized
                className="object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 w-auto max-w-full h-auto"
                style={{
                  maxHeight: `${company.mobileHeight}px`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
