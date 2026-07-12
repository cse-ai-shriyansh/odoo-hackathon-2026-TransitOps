"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import type { FleetMapPoint } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/utils/format";

const markerIcon = divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#111111;border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.18)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export function FleetMap({ points }: { points: FleetMapPoint[] }): JSX.Element {
  const center = useMemo<[number, number]>(() => [40.741, -73.98], []);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Fleet Map</CardTitle>
        <CardDescription>Mock GPS feed routed through the API abstraction.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[420px] w-full">
          <MapContainer center={center} zoom={12} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
              <Marker key={point.vehicleId} position={[point.position.lat, point.position.lng]} icon={markerIcon}>
                <Popup>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold">{point.vehicleName}</p>
                      <p className="text-muted-foreground">{point.driverName}</p>
                    </div>
                    <Badge tone={point.status === "available" ? "success" : point.status === "in_shop" ? "warning" : point.status === "retired" ? "muted" : "default"}>
                      {point.status.replace("_", " ")}
                    </Badge>
                    <p>Destination: {point.destination}</p>
                    <p>ETA: {formatDateTime(point.eta)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
