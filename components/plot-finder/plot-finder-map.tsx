'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Society {
  id: string;
  name: string;
  geoJsonData: string;
  city: {
    name: string;
  };
}

interface PlotFinderMapProps {
  cityId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function PlotFinderMap({ 
  cityId, 
  initialCenter = [24.8607, 67.0011],
  initialZoom = 12 
}: PlotFinderMapProps) {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedCity, setSelectedCity] = useState(cityId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);

  useEffect(() => {
    if (selectedCity) {
      fetchSocieties();
    }
  }, [selectedCity]);

  const fetchSocieties = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/society-overlays?cityId=${selectedCity}`);
      const data = await response.json();
      setSocieties(data);
    } catch (error) {
      console.error('Error fetching societies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const found = societies.find(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (found) {
      const geoJson = JSON.parse(found.geoJsonData);
      if (geoJson.type === 'Feature' && geoJson.geometry.coordinates) {
        const coords = geoJson.geometry.coordinates[0][0];
        setMapCenter([coords[1], coords[0]]);
        setMapZoom(15);
      }
    }
  };

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
    }
  };

  const geoJsonStyle = {
    fillColor: '#3388ff',
    weight: 2,
    opacity: 1,
    color: '#3388ff',
    fillOpacity: 0.2,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Plot Finder</CardTitle>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Search for society, plot, or block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {societies.map((society) => {
              try {
                const geoJson = JSON.parse(society.geoJsonData);
                return (
                  <GeoJSON
                    key={society.id}
                    data={geoJson}
                    style={geoJsonStyle}
                    onEachFeature={onEachFeature}
                  />
                );
              } catch (error) {
                console.error('Error parsing GeoJSON:', error);
                return null;
              }
            })}
          </MapContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Click on a highlighted area to see society information. Use the search to find specific plots or blocks.
        </div>
      </CardContent>
    </Card>
  );
}
