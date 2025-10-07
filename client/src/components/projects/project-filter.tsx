import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";

interface ProjectFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  category: string;
  country: string;
}

export function ProjectFilter({ onFilterChange }: ProjectFilterProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  // Fetch active projects to extract available countries
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["projects-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Extract unique countries from projects
  useEffect(() => {
    if (projects) {
      const countries = projects
        .map(project => project.country)
        .filter((country): country is string => Boolean(country)) // Filter out null/undefined
        .filter((value, index, self) => self.indexOf(value) === index) // Get unique values
        .sort(); // Sort alphabetically
      
      setAvailableCountries(countries);
    }
  }, [projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert "all" values to empty strings for the API
    const filterCategory = category === "all" ? "" : category;
    const filterCountry = country === "all" ? "" : country;
    onFilterChange({ search, category: filterCategory, country: filterCountry });
  };

  const handleReset = () => {
    setSearch("");
    setCategory("all");
    setCountry("all");
    onFilterChange({ search: "", category: "", country: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 w-full bg-[#f8f8f5]">
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative md:flex-1 md:max-w-sm">
          <Input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="w-full md:w-52 bg-white border-gray-200">
            <SelectValue placeholder="All...">
              {category === "all" ? "All..." : category}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Agriculture">Agriculture</SelectItem>
            <SelectItem value="Conservation">Conservation</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Energy">Energy</SelectItem>
            <SelectItem value="Environment">Environment</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Housing">Housing</SelectItem>
            <SelectItem value="Livelihood">Livelihood</SelectItem>
            <SelectItem value="Sanitation">Sanitation</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Water">Water</SelectItem>
            <SelectItem value="Women Empowerment">Women Empowerment</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={country}
          onValueChange={setCountry}
        >
          <SelectTrigger className="w-full md:w-52 bg-white border-gray-200">
            <SelectValue placeholder="All...">
              {country === "all" ? "All..." : country}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {availableCountries.map((countryName) => (
              <SelectItem key={countryName} value={countryName}>
                {countryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 md:w-auto">
          <Button type="submit" className="bg-[#e94e35] hover:bg-[#cc4530] text-white">Filter</Button>
          <Button type="button" variant="outline" onClick={handleReset} className="bg-white">
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
