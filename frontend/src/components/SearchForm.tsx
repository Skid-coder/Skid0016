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
  const [countryInput, setCountryInput] = useState("");
  const [airportInput, setAirportInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [airportSuggestions, setAirportSuggestions] = useState<Airport[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const airportRef = useRef<HTMLDivElement>(null);

  const debouncedCountry = useDebounce(countryInput, 200);
  const debouncedAirport = useDebounce(airportInput, 200);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (airportRef.current && !airportRef.current.contains(e.target as Node)) {
        setShowAirportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch country suggestions
  useEffect(() => {
    if (!debouncedCountry) {
      setCountrySuggestions([]);
      return;
    }
    fetch(`${API_URL}/api/countries?q=${encodeURIComponent(debouncedCountry)}`)
      .then((r) => r.json())
      .then((data) => setCountrySuggestions(data.results || []))
      .catch(() => setCountrySuggestions([]));
  }, [debouncedCountry]);

  // Fetch airport suggestions
  useEffect(() => {
    if (!debouncedAirport && !selectedCountry) {
      setAirportSuggestions([]);
      return;
    }
    const params = new URLSearchParams();
    if (debouncedAirport) params.set("q", debouncedAirport);
    if (selectedCountry) params.set("country", selectedCountry);
    fetch(`${API_URL}/api/airports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setAirportSuggestions(data.results || []))
      .catch(() => setAirportSuggestions([]));
  }, [debouncedAirport, selectedCountry]);

  const handleCountrySelect = useCallback((country: string) => {
    setCountryInput(country);
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    // Reset airport when country changes
    setAirportInput("");
    setSelectedAirport(null);
  }, []);

  const handleAirportSelect = useCallback((airport: Airport) => {
    setAirportInput(airport.label);
    setSelectedAirport(airport);
    setShowAirportDropdown(false);
    // Auto-fill country if not set
    if (!selectedCountry) {
      setCountryInput(airport.country);
      setSelectedCountry(airport.country);
    }
  }, [selectedCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const country = selectedCountry || countryInput.trim();
    const airport = selectedAirport
      ? selectedAirport.label
      : airportInput.trim();
    const city = selectedAirport ? selectedAirport.city : "";
    if (!country || !airport) return;
    onSearch(country, airport, city);
  };

  const canSubmit = (selectedCountry || countryInput.trim()) && (selectedAirport || airportInput.trim());

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country field */}
        <div ref={countryRef} className="relative">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country *
          </label>
          <input
            id="country"
            type="text"
            value={countryInput}
            onChange={(e) => {
              setCountryInput(e.target.value);
              setSelectedCountry("");
              setShowCountryDropdown(true);
            }}
            onFocus={() => {
              if (countryInput) setShowCountryDropdown(true);
            }}
            placeholder="Start typing a country..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            autoComplete="off"
            required
          />
          {showCountryDropdown && countrySuggestions.length > 0 && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {countrySuggestions.map((c) => (
                <li
                  key={c}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCountrySelect(c);
                  }}
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Airport field */}
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
              // Show airports for the selected country even without typing
              if (selectedCountry || airportInput) setShowAirportDropdown(true);
            }}
            placeholder={
              selectedCountry
                ? `Search airports in ${selectedCountry}...`
                : "Select a country first, or type an airport..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            autoComplete="off"
            required
          />
          {showAirportDropdown && airportSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
