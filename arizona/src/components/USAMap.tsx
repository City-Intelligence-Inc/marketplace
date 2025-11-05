"use client";

import { useState } from "react";

interface StateInfo {
  name: string;
  status: "available" | "pending" | "planned";
  credits: string;
  details: string;
}

const stateData: Record<string, StateInfo> = {
  CA: {
    name: "California",
    status: "pending",
    credits: "12-15 credits/year",
    details: "Target: Q2 2026. Application in progress. California requires 25 hours of MCLE every 3 years, including 4 hours of legal ethics and 1 hour of competence issues. Our quarterly bundles (3-4 credits each) will satisfy general CLE requirements."
  },
  NY: {
    name: "New York",
    status: "planned",
    credits: "12-15 credits/year",
    details: "Target: Q3 2026. New York requires 24 CLE credits every 2 years, including 4 ethics credits. Our weekly episodes will be bundled quarterly to provide general skills credit."
  },
  TX: {
    name: "Texas",
    status: "planned",
    credits: "12-15 credits/year",
    details: "Target: Q3 2026. Texas requires 15 hours of CLE per year. Our podcast format is pre-approved for self-study CLE in Texas."
  },
  AZ: {
    name: "Arizona",
    status: "available",
    credits: "Available via self-certification",
    details: "Available Now! Arizona allows self-certification of CLE. Attorneys can immediately use our episodes for CLE credit by self-reporting. No pre-approval required."
  },
  FL: {
    name: "Florida",
    status: "planned",
    credits: "Target: 2027",
    details: "Florida requires 33 hours every 3 years. We plan to apply for Florida accreditation in 2027 based on subscriber demand."
  },
  IL: {
    name: "Illinois",
    status: "planned",
    credits: "Target: 2027",
    details: "Illinois requires 30 hours every 2 years for new admittees, 20 hours for experienced attorneys. Planned for 2027."
  },
};

export function USAMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const getStateColor = (stateCode: string) => {
    const info = stateData[stateCode];
    if (!info) return "#e5e7eb"; // gray for unavailable

    switch (info.status) {
      case "available":
        return "#10b981"; // green
      case "pending":
        return "#3b82f6"; // blue
      case "planned":
        return "#f59e0b"; // orange
      default:
        return "#e5e7eb";
    }
  };

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-12">
        {/* State List */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Your State</h3>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Not Yet</span>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(stateData).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setSelectedState(code)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedState === code
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStateColor(code) }}
                    ></div>
                    <div>
                      <div className="font-bold text-gray-900">{info.name}</div>
                      <div className="text-sm text-gray-600">{info.credits}</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Don&apos;t see your state?</strong>
            </p>
            <p className="text-sm text-gray-600">
              We prioritize state applications based on subscriber demand. Subscribe now and let us know where you&apos;re licensed—we&apos;ll add it to our roadmap.
            </p>
          </div>
        </div>

        {/* State Details */}
        <div>
          {selectedState ? (
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getStateColor(selectedState) }}
                  ></div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stateData[selectedState].name}
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold mb-4">
                    {stateData[selectedState].status === "available" && "✓ Available Now"}
                    {stateData[selectedState].status === "pending" && "⏳ In Progress"}
                    {stateData[selectedState].status === "planned" && "📅 Planned"}
                  </div>

                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {stateData[selectedState].credits}
                  </p>
                </div>

                <div className="prose prose-gray">
                  <p className="text-gray-700 leading-relaxed">
                    {stateData[selectedState].details}
                  </p>
                </div>

                {stateData[selectedState].status === "available" && (
                  <div className="mt-8 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                    <p className="font-bold text-green-900 mb-2">Ready to Use!</p>
                    <p className="text-sm text-green-800">
                      Start listening today and self-certify your CLE hours according to {stateData[selectedState].name} bar requirements.
                    </p>
                  </div>
                )}

                {stateData[selectedState].status === "pending" && (
                  <div className="mt-8 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
                    <p className="font-bold text-blue-900 mb-2">Coming Soon!</p>
                    <p className="text-sm text-blue-800">
                      Subscribe now at $10/month to lock in your rate. When CLE launches, you&apos;ll automatically get credits at your grandfathered price.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-lg font-medium">Select a state to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
