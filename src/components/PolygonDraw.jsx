import { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function PolygonDraw({ onResults }) {
  const map = useMap();
  const drawnRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.L = window.L || L;
    Promise.all([
      import("leaflet-draw"),
      import("leaflet-draw/dist/leaflet.draw.css")
    ]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!map || !ready) return;

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: "#6A6BEF", weight: 2 },
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: new L.FeatureGroup(),
        edit: false,
        remove: true,
      },
    });

    map.addControl(drawControl);

    const handleCreated = async (e) => {
      const layer = e.layer;
      if (drawnRef.current) {
        map.removeLayer(drawnRef.current);
      }
      drawnRef.current = layer;
      map.addLayer(layer);

      const latlngs = layer.getLatLngs()[0];
      if (!latlngs || latlngs.length < 3) return;

      const coords = latlngs
        .map((ll) => `${ll.lng},${ll.lat}`)
        .join("|");

      setDrawing(true);
      try {
        const res = await fetch(`${API_URL}/apartments/by-polygon?coords=${encodeURIComponent(coords)}`);
        const data = await res.json();
        if (onResults) onResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error buscando por polígono:", err);
      } finally {
        setDrawing(false);
      }
    };

    const handleDeleted = () => {
      drawnRef.current = null;
      if (onResults) onResults(null);
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      if (drawnRef.current) map.removeLayer(drawnRef.current);
    };
  }, [map, onResults]);

  return null;
}

export default PolygonDraw;
