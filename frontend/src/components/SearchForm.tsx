"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  label: string;
}

interface SearchFormProps {
  onSearch: (country: string, airport: string, city: string) => void;
  isLoading: boolean;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  const [airportInput, setAirportInput] = useState("");
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [airportSuggestions, setAirportSuggestions] = useState<Airport[]>([]);
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);

  const airportRef = useRef<HTMLDivElement>(null);
  const debouncedAirport = useDebounce(airportInput, 200);

  // Fetch all countries on mount for the dropdown
  useEffect(() => {
    fetch(`${API_URL}/api/countries/all`)
      .then((r) => r.json())
      .then((data) => setAllCountries(data.results || []))
      .catch(() => {
        // Fallback: fetch with empty query
        fetch(`${API_URL}/api/countries?q=`)
          .then((r) => r.json())
          .then((data) => setAllCountries(data.results || []))
          .catch(() => setAllCountries([]));
      });
  }, []);

  // Close airport dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (airportRef.current && !airportRef.current.contains(e.target as Node)) {
        setShowAirportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch airport suggestions when user types or when country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setAirportSuggestions([]);
      return;
    }
    const params = new URLSearchParams();
    if (debouncedAirport) params.set("q", debouncedAirport);
    params.set("country", selectedCountry);
    fetch(`${API_URL}/api/airports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setAirportSuggestions(data.results || []))
      .catch(() => setAirportSuggestions([]));
  }, [debouncedAirport, selectedCountry]);

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    // Reset airport when country changes
    setAirportInput("");
    setSelectedAirport(null);
    setAirportSuggestions([]);
  }, []);

  const handleAirportSelect = useCallback((airport: Airport) => {
    setAirportInput(airport.label);
    setSelectedAirport(airport);
    setShowAirportDropdown(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry || !selectedAirport) return;
    onSearch(selectedCountry, selectedAirport.label, selectedAirport.city);
  };

  const canSubmit = selectedCountry && selectedAirport;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country dropdown */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country *
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={handleCountryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            required
          >
            <option value="">-- Select a country --</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Airport autocomplete */}
        <div ref={airportRef} className="relative">
          <label
            htmlFor="airport"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Airport *
          </label>
          <input
            id="airport"
            type="text"
            value={airportInput}
            onChange={(e) => {
              setAirportInput(e.target.value);
              setSelectedAirport(null);
              setShowAirportDropdown(true);
            }}
            onFocus={() => {
              if (selectedCountry) setShowAirportDropdown(true);
            }}
            placeholder={
              selectedCountry
                ? `Type to search airports in ${selectedCountry}...`
                : "Select a country first"
            }
            disabled={!selectedCountry}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            autoComplete="off"
            required
          />
          {showAirportDropdown && airportSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {airportSuggestions.map((a) => (
                <li
                  key={a.iata}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAirportSelect(a);
                  }}
                >
                  <span className="font-medium">{a.name}</span>
                  <span className="text-gray-500 ml-1">({a.iata})</span>
                  <span className="text-gray-400 ml-1">- {a.city}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Searching..." : "Find Transport Companies"}
        </button>
      </div>
    </form>
  );
}
