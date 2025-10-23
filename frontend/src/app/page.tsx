import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Giant White Content Section */}
      <section className="bg-white py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-black">
              Content sections coming soon
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This is where we'll add more information about the product
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
