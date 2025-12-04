import { useState, useEffect } from "react";

interface Material {
  id: number;
  materialName: string;
  specifications: string | null;
  pricePerKg: string;
}

export function useMaterialAutocomplete() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all materials on mount
  useEffect(() => {
    async function fetchMaterials() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/sales/materials");
        if (!res.ok) throw new Error("Failed to fetch materials");
        const data = await res.json();
        setMaterials(data.materials || []);
      } catch (err) {
        console.error("Error fetching materials:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  return {
    materials,
    isLoading,
  };
}

