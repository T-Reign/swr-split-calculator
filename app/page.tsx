"use client";

import { useState } from "react";
import fares from "../data/fares.json";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

const stationOrder = [
  "London Terminals",
  "Clapham Junction",
  "Wimbledon",
  "Surbiton",
  "Woking",
  "Basingstoke",
  "Winchester",
  "Shawford",
  "Eastleigh",
  "Southampton Air",
  "St Denys",
  "Southampton Ctl",
  "Redbridge Hants",
  "Totton",
  "Ashurst N Forest",
  "Beaulieu Road",
  "Brockenhurst",
  "New Milton",
  "Hinton Admiral",
  "Christchurch",
  "Pokesdown",
  "Bournemouth",
  "Branksome",
  "Parkstone Dorset",
  "Poole",
  "Hamworthy",
  "Holton Heath",
  "Wareham Dorset",
  "Wool",
  "Dorchester South",
  "Upwey",
  "Weymouth",
];
//The list below isn't LIVE, it's just for the future chartdata for when the chart gets crowded with different stations. (Sandbox also keeps changing it, idk why)
const stationAbbreviations = {
  "London Terminals": "LON",
  "Clapham Junction": "CLJ",
  Wimbledon: "WIM",
  Surbiton: "SUR",
  Woking: "WOK",
  Basingstoke: "BSK",
  Winchester: "WIN",
  Shawford: "SHW",
  Eastleigh: "ESL",
  "Southampton Air": "SOA",
  "St Denys": "SDN",
  "Southampton Ctl": "SOU",
  "Redbridge Hants": "RDB",
  Totton: "TTN",
  "Ashurst N Forest": "ANF",
  "Beaulieu Road": "BEU",
  Brockenhurst: "BCU",
  "New Milton": "NWM",
  "Hinton Admiral": "HNA",
  Christchurch: "CHR",
  Pokesdown: "POK",
  Bournemouth: "BMH",
  Branksome: "BSM",
  "Parkstone Dorset": "PKS",
  Poole: "POO",
  Hamworthy: "HAM",
  "Holton Heath": "HOL",
  "Wareham Dorset": "WRM",
  Wool: "WOO",
  "Dorchester South": "DCH",
  Upwey: "UPW",
  Weymouth: "WEY",
};

export default function Home() {
  const [origin, setOrigin] = useState("London Terminals");
  const [destination, setDestination] = useState("Southampton Ctl");
  const [ODGroups, setODGroups] = useState([
    { name: "LONG", type: "S1B" },
    { name: "MID", type: "S3B" },
    { name: "WIN", type: "S9A" },
    { name: "Non-London", type: "S1B" },
    { name: "Non-AP", type: "SDS" },
  ]);

  const toTitleCase = (text: string): string => {
    if (!text) return "";

    return text
      .toLowerCase()
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const parseSaving = (saving: string): number => {
    if (!saving) return 0;
    const number = parseFloat(saving.replace(/[^\d.]/g, ""));
    if (saving.trim().startsWith("+")) return number;
    if (saving.trim().startsWith("-")) return -number;
    return number;
  };

  const mappedFares = useMemo(() => {
    return fares.map((item: any) => ({
      origin: toTitleCase(item.ORIGIN_DESCRIPTION),
      destination: toTitleCase(item.DESTINATION_DESCRIPTION),
      ODGroup: item["ODGroup"],
      fareType: item.TICKET_CODE,
      fare: item.FARE / 100,
    }));
  }, []);

  const fareLookup = useMemo(() => {
    const lookup: any = {};
    mappedFares.forEach((f: any) => {
      lookup[`${f.origin}__${f.destination}__${f.fareType}`] = f;
    });
    return lookup;
  }, [mappedFares]);

  const routeStations = useMemo(() => {
    return [
      ...new Set(
        mappedFares
          .filter((f: any) => f.origin === origin)
          .map((f: any) => f.destination)
      ),
    ];
  }, [mappedFares, origin]);

  const orderedStations = useMemo(() => {
    return [...routeStations].sort((a, b) => {
      const aIndex = stationOrder.indexOf(a);
      const bIndex = stationOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }, [routeStations]);

  // 1. Define these FIRST
  const ODGroupConfig = useMemo(() => {
    return ODGroups.reduce((acc, group) => {
      acc[group.name] = group.type;
      return acc;
    }, {});
  }, [ODGroups]);

  const ODGroup = useMemo(() => {
    const priority = ["LONG", "MID", "WIN", "Non-London", "Non-AP"];
    const allMatches = mappedFares.filter(
      (f) =>
        f.origin.toUpperCase().trim() === origin.toUpperCase().trim() &&
        f.destination.toUpperCase().trim() === destination.toUpperCase().trim()
    );
    for (const groupName of priority) {
      const match = allMatches.find((f) => f.ODGroup === groupName);
      if (match) return match.ODGroup;
    }
    return "N/A";
  }, [mappedFares, origin, destination]);

  const selectedFareType = ODGroupConfig[ODGroup] || "S3B";

  const testFare = useMemo(() => {
    return mappedFares.find(
      (f) =>
        f.origin.toUpperCase().trim() === origin.toUpperCase().trim() &&
        f.destination.toUpperCase().trim() ===
          destination.toUpperCase().trim() &&
        f.fareType === selectedFareType
    );
  }, [mappedFares, origin, destination, selectedFareType]);

  const { realSplits, orderedSplits } = useMemo(() => {
    if (!origin || !destination || !testFare)
      return { realSplits: [], orderedSplits: [] };

    const getBestFareForRoute = (start: string, end: string) => {
      const priority = ["LONG", "MID", "WIN", "Non-London", "Non-AP"];
      const allMatches = mappedFares.filter(
        (f) =>
          f.origin.toUpperCase().trim() === start.toUpperCase().trim() &&
          f.destination.toUpperCase().trim() === end.toUpperCase().trim()
      );

      for (const groupName of priority) {
        const match = allMatches.find((f) => f.ODGroup === groupName);
        if (match) {
          const type = ODGroupConfig[match.ODGroup] || "S3B";
          return allMatches.find((f) => f.fareType === type);
        }
      }
      return null;
    };

    const intermediateStations = [
      ...new Set(mappedFares.map((f) => f.destination)),
    ];

    const calculatedSplits = intermediateStations
      .map((splitStation) => {
        const leg1 = getBestFareForRoute(origin, splitStation);
        const leg2 = getBestFareForRoute(splitStation, destination);

        if (!leg1 || !leg2) return null;

        const totalFare = leg1.fare + leg2.fare;
        const saving = testFare.fare - totalFare;

        return {
          location: splitStation,
          fare: `£${totalFare.toFixed(2)}`,
          savingValue: saving,
          saving: `${saving >= 0 ? "+" : "-"} £${Math.abs(saving).toFixed(2)}`,
          fareType: `${leg1.fareType}/${leg2.fareType}`,
        };
      })
      .filter(Boolean);

    const startIndex = stationOrder.indexOf(origin);
    const endIndex = stationOrder.indexOf(destination);
    const stationsInRange = stationOrder.slice(
      Math.min(startIndex, endIndex),
      Math.max(startIndex, endIndex) + 1
    );

    const ordered = stationsInRange
      .map((station) => {
        const splitData = calculatedSplits.find(
          (s) =>
            s.location.toLowerCase().trim() === station.toLowerCase().trim()
        );
        return {
          location: station,
          fare: splitData ? splitData.fare : "N/A",
          saving: splitData ? splitData.saving : "-",
          savingValue: splitData ? splitData.savingValue : 0,
          fareType: splitData ? splitData.fareType : "-",
        };
      })
      .filter((row) => row.fare !== "N/A");

    return { realSplits: calculatedSplits, orderedSplits: ordered };
  }, [origin, destination, testFare, ODGroupConfig, mappedFares, fareLookup]);

  const chartData = useMemo(() => {
    return realSplits.map((split: any) => ({
      name: split.location,
      fare: parseFloat(split.fare.replace("£", "")),
      fareType: split.fareType,
    }));
  }, [realSplits]);

  const activeFareTypes = ODGroups.map((group) => group.type);

  const filteredChartData = useMemo(() => {
    const result = chartData.filter((entry: any) => entry.fare > 0);

    return result.filter((e) => activeFareTypes.includes(e.fareType));
  }, [chartData, activeFareTypes]);

  const maxFare = filteredChartData.length
    ? Math.max(
        ...filteredChartData.map((e: any) => e.fare),
        testFare?.fare || 0
      )
    : 10;

  const orderedChartData = useMemo(() => {
    const startIndex = stationOrder.indexOf(origin);
    const endIndex = stationOrder.indexOf(destination);
    const stationsInRange = stationOrder.slice(
      Math.min(startIndex, endIndex),
      Math.max(startIndex, endIndex) + 1
    );

    return stationsInRange
      .map((station) => {
        const data = realSplits.find(
          (s: any) =>
            s.location.toLowerCase().trim() === station.toLowerCase().trim()
        );
        return {
          name: station,
          fare: data ? parseFloat(data.fare.replace("£", "")) : 0,
          fareType: data ? data.fareType : "N/A",
        };
      })
      .filter((entry) => entry.fare > 0);
  }, [origin, destination, realSplits]);

  const { yMin, yMax, yTicks } = useMemo(() => {
    const allValues = [
      ...orderedChartData.map((e) => e.fare),
      testFare?.fare || 0,
    ].filter((v) => v > 0);

    const minFare = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxFare = allValues.length > 0 ? Math.max(...allValues) : 10;

    const yMin = Math.max(0, Math.floor((minFare - 5) / 5) * 5);
    const yMax = Math.ceil((maxFare + 5) / 5) * 5;

    const step = 5;
    const ticks = [];
    for (let i = yMin; i <= yMax; i += step) {
      ticks.push(i);
    }

    return { yMin, yMax, yTicks: ticks };
  }, [orderedChartData, testFare]);

  const bestSplit = realSplits.reduce((best: any, current: any) => {
    const currentValue = parseSaving(current.saving);
    const bestValue = best ? parseSaving(best.saving) : -Infinity;
    if (currentValue <= 0) return best;
    return currentValue > bestValue ? current : best;
  }, null);

  const origins = useMemo(() => {
    return [...new Set(mappedFares.map((f: any) => f.origin))];
  }, [mappedFares]);

  const uniqueDestinations = useMemo(() => {
    return [
      ...new Set(
        mappedFares
          .filter((f: any) => f.origin === origin)
          .map((f: any) => f.destination)
      ),
    ];
  }, [mappedFares, origin]);

  const fareOptions = useMemo(() => {
    const allCodes = fares.map((item: any) => item.TICKET_CODE);
    return [...new Set(allCodes)].sort();
  }, [fares]);

  const handleFareChange = (index: number, newValue: string): void => {
    const updated = [...ODGroups];
    updated[index].type = newValue;
    setODGroups(updated);
  };

  const [isHoveringLine, setIsHoveringLine] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      {/* 1. Header Banner */}
      <header className="bg-[#001f3f] shadow-lg mb-6">
        <img
          src="/swr-banner.jpg"
          alt="SWR Split Calculator"
          className="w-full h-auto"
        />
      </header>
      {/* 2. Header Information (Interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-6">
        {/* Origin/Destination Card with Integrated Filters */}
        <div className="bg-white p-6 rounded-b-lg shadow-md border-t-4 border-gray-300 text-center md:col-span-2">
          <div className="flex justify-between gap-4">
            {/* Origin Filter */}
            <div className="w-1/2">
              <p className="text-s text-gray-500 mb-1">Origin</p>

              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                list="origin-options"
                className="w-full text-lg font-bold text-black text-center border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent"
              />

              <datalist id="origin-options">
                {origins.map((o: any) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </div>

            {/* Destination Filter */}
            <div className="w-1/2 relative">
              <p className="text-s text-gray-500 mb-1">Destination</p>

              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                list="destination-options"
                className="w-full text-lg font-bold text-black text-center border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"></div>

              <datalist id="destination-options">
                {uniqueDestinations.map((d: any) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Advance OD Group Card */}
        <div className="bg-white p-6 rounded-b-lg shadow-md border-t-4 border-gray-300 text-center">
          <div className="flex justify-between">
            <div>
              <p className="text-s text-gray-500">Advance OD Group</p>
              <p className="text-2xl font-bold text-black">
                {ODGroup || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-s text-gray-500">Advance Fare Type</p>
              <p className="text-2xl font-bold text-black">S3B</p>
            </div>
          </div>
        </div>

        {/* Through Fare Card */}
        <div className="bg-sky-100 p-6 rounded-b-lg shadow-md border-t-4 border-sky-500 text-center">
          <p className="text-s text-black">Through Fare</p>
          <p className="text-3xl font-bold text-sky-900">
            £{testFare ? testFare.fare.toFixed(2) : "0.00"}
          </p>
        </div>

        {/* Cheapest Split Destination Card */}
        <div className="bg-yellow-50 p-6 rounded-b-lg shadow-md border-t-4 border-yellow-500 text-center">
          <p className="text-s text-black">Cheapest Split Destination</p>
          <p className="text-3xl font-bold text-red-600">
            {bestSplit ? bestSplit.location : "N/A"}
          </p>
        </div>

        {/* Cheapest Split Card */}
        <div className="bg-yellow-50 p-6 rounded-b-lg shadow-md border-t-4 border-yellow-500 text-center">
          <p className="text-s text-black">Cheapest Split Saving</p>
          <p className="text-3xl font-bold text-red-600">
            {bestSplit ? bestSplit.saving : "£0.00"}
          </p>
        </div>
      </div>
      {/* 3. Main Content Grid (Left, Middle, Right) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 text-center">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-[#07396e] text-white p-4 font-bold rounded-t-lg text-lg">
            OD Group Information
          </div>
          <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
            <table className="w-full text-center text-lg">
              <thead className="bg-[#607c99]">
                <tr>
                  <th className="py-1 px-1">OD Group</th>
                  <th className="py-1 px-1">Fare Type</th>
                </tr>
              </thead>
              <tbody>
                {ODGroups.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1 px-2 text-black">{item.name}</td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={item.type}
                        onChange={(e) => handleFareChange(i, e.target.value)}
                        className="w-full text-center font-bold text-gray-700 bg-transparent border-b border-gray-300 focus:outline-none"
                        list={`fare-options-${i}`}
                      />

                      <datalist id={`fare-options-${i}`}>
                        {fareOptions.map((option: any) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-4">
          <div className="bg-[#001f3f] text-white p-4 font-bold rounded-t-lg text-center">
            Split Ticketing Analysis
          </div>
          <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
            <table className="w-full text-center text-l">
              <thead className="bg-[#607c99]">
                <tr>
                  <th className="py-2 px-3">Split Location</th>
                  <th className="py-2 px-3">Split Fare</th>
                  <th className="py-2 px-3">Split Saving</th>
                </tr>
              </thead>
              <tbody>
                {orderedSplits.map((row, index) =>
                  row ? (
                    <tr key={index} className="border-b">
                      <td className="text-black">{row.location}</td>
                      <td className="text-black">{row.fare}</td>
                      <td
                        className={`p-2 font-bold ${
                          row.savingValue > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {row.saving}
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-6">
          <div className="bg-[#001f3f] text-white p-4 font-bold rounded-t-lg text-center">
            Analysis Chart
          </div>
          <div className="bg-white p-4 shadow-md rounded-b-lg h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderedChartData}>
                <CartesianGrid
                  vertical={false}
                  stroke="#f2f2f2"
                  strokeWidth={2}
                />

                <XAxis dataKey="name" />
                <YAxis
                  domain={[yMin, yMax]}
                  ticks={yTicks}
                  tickFormatter={(value) => `£${value.toFixed(2)}`}
                  tickMargin={5}
                />
                <Tooltip
                  formatter={(value) => [
                    `£${Number(value).toFixed(2)}`,
                    "Fare",
                  ]}
                />

                <Bar dataKey="fare" stroke="#009dff" strokeWidth={2}>
                  {orderedChartData.map((entry, index) => {
                    const isBelowThreshold = entry.fare < (testFare?.fare || 0);

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isBelowThreshold ? "#f87171" : "#84DDFF"}
                        fillOpacity={0.85}
                      />
                    );
                  })}
                </Bar>

                <ReferenceLine
                  y={testFare?.fare || 0}
                  stroke="#4282b3"
                  strokeWidth={8}
                  strokeOpacity={0.8}
                  onMouseOver={() => setIsHoveringLine(true)}
                  onMouseLeave={() => setIsHoveringLine(false)}
                  label={
                    isHoveringLine
                      ? {
                          value: `Through Fare: £${(
                            testFare?.fare || 0
                          ).toFixed(2)}`,
                          position: "top",
                          fill: "#4282b3",
                          fontWeight: "bold",
                        }
                      : null
                  }
                  ifOverflow="visible"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
