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
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getProjectCountry } from "@/lib/i18n/project-content";

interface ProjectFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  category: string;
  country: string;
}

export function ProjectFilter({ onFilterChange }: ProjectFilterProps) {
  const { t } = useTranslation();
  const { language } = useI18n();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCountriesDisplay, setAvailableCountriesDisplay] = useState<Map<string, string>>(new Map());

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

  // Extract unique categories and countries from projects
  useEffect(() => {
    if (projects) {
      // Extract unique categories
      const categories = projects
        .map(project => project.category || '')
        .filter((category): category is string => Boolean(category)) // Filter out null/undefined
        .filter((value, index, self) => self.indexOf(value) === index) // Get unique values
        .sort(); // Sort alphabetically
      
      setAvailableCategories(categories);

      // Extract unique countries with language-specific display names
      const countryMap = new Map<string, string>();
      const countries = projects
        .map(project => {
          const countryValue = project.country || '';
          const countryDisplay = getProjectCountry(project, language) || countryValue;
          if (countryValue) {
            countryMap.set(countryValue, countryDisplay);
          }
          return countryValue;
        })
        .filter((country): country is string => Boolean(country)) // Filter out null/undefined
        .filter((value, index, self) => self.indexOf(value) === index) // Get unique values
        .sort(); // Sort alphabetically
      
      setAvailableCountries(countries);
      setAvailableCountriesDisplay(countryMap);
    }
  }, [projects, language]);

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
    <form onSubmit={handleSubmit} className="mb-8 w-full bg-white">
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative md:flex-1 md:max-w-sm">
          <Input
            type="text"
            placeholder={t("projects.searchPlaceholder")}
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
            <SelectValue>
              {category === "all" ? t("projects.allCategories") : category}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("projects.allCategories")}</SelectItem>
            {availableCategories.map((categoryName) => (
              <SelectItem key={categoryName} value={categoryName}>
                {categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={country}
          onValueChange={setCountry}
        >
          <SelectTrigger className="w-full md:w-52 bg-white border-gray-200">
            <SelectValue>
              {country === "all" ? t("projects.allCountries") : (availableCountriesDisplay.get(country) || country)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("projects.allCountries")}</SelectItem>
            {availableCountries.map((countryName) => (
              <SelectItem key={countryName} value={countryName}>
                {availableCountriesDisplay.get(countryName) || countryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 w-full md:w-auto md:flex-shrink-0">
          <Button type="submit" className="text-white flex-1 md:flex-none md:px-6" style={{ backgroundColor: '#f2662d' }}>{t("projects.filterButton")}</Button>
          <Button type="button" variant="outline" onClick={handleReset} className="bg-white flex-1 md:flex-none md:px-6">
            {t("projects.resetButton")}
          </Button>
        </div>
      </div>
    </form>
  );
}
