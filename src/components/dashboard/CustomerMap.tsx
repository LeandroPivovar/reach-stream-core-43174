import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface CustomerLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  value: number;
}

interface CustomerMapProps {
  customers: CustomerLocation[];
}

export function CustomerMap({ customers }: CustomerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-47.9292, -15.7801], // Centro do Brasil
      zoom: 3,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for each customer location
    map.current.on('load', () => {
      customers.forEach((customer) => {
        if (!map.current) return;

        // Create a marker
        const el = document.createElement('div');
        el.className = 'customer-marker';
        el.style.backgroundColor = 'hsl(var(--primary))';
        el.style.width = `${Math.max(20, customer.value / 10)}px`;
        el.style.height = `${Math.max(20, customer.value / 10)}px`;
        el.style.borderRadius = '50%';
        el.style.opacity = '0.6';
        el.style.border = '2px solid hsl(var(--primary-foreground))';
        el.style.cursor = 'pointer';

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="color: hsl(var(--foreground)); padding: 8px;">
            <strong>${customer.name}</strong><br/>
            ${customer.value} clientes
          </div>`
        );

        new mapboxgl.Marker(el)
          .setLngLat(customer.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      });

      // Add heatmap layer
      map.current?.addSource('customers-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: customers.map(customer => ({
            type: 'Feature',
            properties: {
              value: customer.value
            },
            geometry: {
              type: 'Point',
              coordinates: customer.coordinates
            }
          }))
        }
      });

      map.current?.addLayer({
        id: 'customers-heat-layer',
        type: 'heatmap',
        source: 'customers-heat',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20
          ],
          'heatmap-opacity': 0.6
        }
      });
    });

    setIsTokenSet(true);
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isTokenSet) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg p-6">
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configure o Mapa de Clientes</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Para visualizar o mapa de calor dos seus clientes, adicione seu token público do Mapbox.
          <br />
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Obtenha seu token gratuito aqui
          </a>
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Cole seu token do Mapbox aqui"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button onClick={initializeMap}>
            Ativar Mapa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
