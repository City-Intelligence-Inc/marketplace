"use client";

import Image from "next/image";

export function TrustedBy() {
  const companies = [
    { name: "MIT", logo: "/logos/mit.png", height: 50 },
    { name: "Harvard Law School", logo: "/logos/harvard-law.png", height: 40 },
    { name: "Stanford University", logo: "/logos/stanford.avif", height: 80 },
    { name: "UC Berkeley", logo: "/logos/berkeley.png", height: 40 },
    { name: "University of Pennsylvania", logo: "/logos/penn.png", height: 70 },
    { name: "Princeton University", logo: "/logos/princeton.png", height: 50 },
    { name: "Purdue University", logo: "/logos/purdue.png", height: 35 },
    { name: "Meta", logo: "/logos/meta.png", height: 25 },
    { name: "IIT Kharagpur", logo: "/logos/iit-kgp.svg", height: 60 },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
          Trusted by listeners from
        </p>

        {/* 2 rows of 3 logos */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {companies.map((company) => (
            <div
              key={company.name}
              className={`flex items-center justify-center py-4 ${
                company.name === "IIT Kharagpur" ? "pl-0" : "px-4"
              }`}
            >
              <Image
                src={company.logo}
                alt={company.name}
                width={240}
                height={company.height}
                unoptimized
                style={{ height: `${company.height}px`, width: 'auto' }}
                className="object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
