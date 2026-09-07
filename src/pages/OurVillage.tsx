
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polygon,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import {
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import "./OurVillage.css";

// ======================================================
// TYPES
// ======================================================

type MapFeatureType =
  | "streetLight"
  | "tree"
  | "school"
  | "mosque"
  | "clinic"
  | "water"
  | "important";

type LatLngPoint = [number, number];

interface MapFeature {
  id: string;
  type: MapFeatureType;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  status?: string;
}

interface RoadFeature {
  id: string;
  type: "road";
  name: string;
  points: LatLngPoint[];
  description?: string;
}

// ======================================================
// VILLAGE CENTER
// ======================================================

const VILLAGE_CENTER: LatLngPoint = [
  22.6905625,
  89.7430625,
];

// ======================================================
// CATEGORY CONFIG
// ======================================================

const categoryConfig: Record<
  MapFeatureType,
  {
    label: string;
    emoji: string;
    color: string;
  }
> = {
  streetLight: {
    label: "Street Light",
    emoji: "💡",
    color: "#f59e0b",
  },

  tree: {
    label: "Tree",
    emoji: "🌳",
    color: "#16a34a",
  },

  school: {
    label: "School",
    emoji: "🏫",
    color: "#2563eb",
  },

  mosque: {
    label: "Mosque",
    emoji: "🕌",
    color: "#059669",
  },

  clinic: {
    label: "Clinic",
    emoji: "🏥",
    color: "#dc2626",
  },

  water: {
    label: "Water Point",
    emoji: "🚰",
    color: "#0891b2",
  },

  important: {
    label: "Important Place",
    emoji: "📍",
    color: "#7c3aed",
  },
};

// ======================================================
// TYPE GUARD
// ======================================================

const isMapFeatureType = (
  value: unknown
): value is MapFeatureType => {
  return (
    typeof value === "string" &&
    value in categoryConfig
  );
};

// ======================================================
// LAT LNG PARSER
// ======================================================
// Supports both:
//
// NEW FORMAT:
// [
//   { lat: 22.123, lng: 89.123 },
//   { lat: 22.124, lng: 89.124 }
// ]
//
// OLD FORMAT:
// [
//   [22.123, 89.123],
//   [22.124, 89.124]
// ]
// ======================================================

const parseLatLngPoints = (
  points: unknown
): LatLngPoint[] => {
  if (!Array.isArray(points)) {
    return [];
  }

  return points
    .map((point: unknown) => {

      // ================================================
      // NEW FIRESTORE FORMAT
      // { lat, lng }
      // ================================================

      if (
        point &&
        typeof point === "object" &&
        "lat" in point &&
        "lng" in point
      ) {
        const item = point as {
          lat: unknown;
          lng: unknown;
        };

        if (
          typeof item.lat === "number" &&
          typeof item.lng === "number"
        ) {
          return [
            item.lat,
            item.lng,
          ] as LatLngPoint;
        }
      }

      // ================================================
      // OLD ARRAY FORMAT
      // [lat, lng]
      // ================================================

      if (
        Array.isArray(point) &&
        point.length === 2 &&
        typeof point[0] === "number" &&
        typeof point[1] === "number"
      ) {
        return [
          point[0],
          point[1],
        ] as LatLngPoint;
      }

      return null;
    })
    .filter(
      (
        point
      ): point is LatLngPoint =>
        point !== null
    );
};

// ======================================================
// MARKER ICON
// ======================================================

const createMarkerIcon = (
  type: MapFeatureType
) => {

  const config = categoryConfig[type];

  return L.divIcon({
    className: "public-map-marker-wrapper",

    html: `
      <div
        class="public-map-marker"
        style="background:${config.color};"
      >
        <span>${config.emoji}</span>
      </div>
    `,

    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
  });
};

// ======================================================
// MAP RESIZE CONTROLLER
// ======================================================

const MapResizeController = () => {

  const map = useMap();

  useEffect(() => {

    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };

  }, [map]);

  return null;
};

// ======================================================
// FIT MAP TO VILLAGE BOUNDARY
// ======================================================

interface FitBoundaryProps {
  points: LatLngPoint[];
}

const FitBoundary = ({
  points,
}: FitBoundaryProps) => {

  const map = useMap();

  useEffect(() => {

    if (points.length < 3) {
      return;
    }

    const bounds =
      L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 17,
    });

  }, [map, points]);

  return null;
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const VillageMap = () => {

  // ====================================================
  // STATE
  // ====================================================

  const [boundaryPoints, setBoundaryPoints] =
    useState<LatLngPoint[]>([]);

  const [roads, setRoads] =
    useState<RoadFeature[]>([]);

  const [locations, setLocations] =
    useState<MapFeature[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // FILTER
  // ====================================================

  const [activeCategory, setActiveCategory] =
    useState<MapFeatureType | "all">("all");

  // ====================================================
  // LOAD BOUNDARY
  // ====================================================

  useEffect(() => {

    const boundaryRef = doc(
      db,
      "villageMap",
      "villageBoundary"
    );

    const unsubscribe =
      onSnapshot(
        boundaryRef,

        (snapshot) => {

          // ============================================
          // NO BOUNDARY
          // ============================================

          if (!snapshot.exists()) {

            setBoundaryPoints([]);

            return;
          }

          const data =
            snapshot.data();

          // ============================================
          // PARSE BOUNDARY
          // ============================================

          const validPoints =
            parseLatLngPoints(
              data.points
            );

          setBoundaryPoints(
            validPoints
          );
        },

        (snapshotError) => {

          console.error(
            "Boundary listener error:",
            snapshotError
          );

          setError(
            "Village boundary load করতে সমস্যা হয়েছে."
          );
        }
      );

    return () => {
      unsubscribe();
    };

  }, []);

  // ====================================================
  // LOAD ROADS + LOCATIONS
  // ====================================================

  useEffect(() => {

    const mapRef =
      collection(db, "villageMap");

    const unsubscribe =
      onSnapshot(
        mapRef,

        (snapshot) => {

          const loadedRoads: RoadFeature[] = [];

          const loadedLocations: MapFeature[] = [];

          snapshot.forEach((item) => {

            // ==========================================
            // SKIP BOUNDARY DOCUMENT
            // ==========================================

            if (
              item.id ===
              "villageBoundary"
            ) {
              return;
            }

            const data =
              item.data();

            // ==========================================
            // ROAD
            // ==========================================

            if (
              data.type === "road"
            ) {

              if (
                typeof data.name === "string" &&
                Array.isArray(data.points)
              ) {

                const validPoints =
                  parseLatLngPoints(
                    data.points
                  );

                if (
                  validPoints.length >= 2
                ) {

                  loadedRoads.push({
                    id: item.id,

                    type: "road",

                    name: data.name,

                    description:
                      typeof data.description ===
                      "string"
                        ? data.description
                        : "",

                    points:
                      validPoints,
                  });
                }
              }

              return;
            }

            // ==========================================
            // LOCATION
            // ==========================================

            if (
              isMapFeatureType(
                data.type
              ) &&
              typeof data.name === "string" &&
              typeof data.lat === "number" &&
              typeof data.lng === "number"
            ) {

              loadedLocations.push({
                id: item.id,

                type: data.type,

                name: data.name,

                description:
                  typeof data.description ===
                  "string"
                    ? data.description
                    : "",

                lat: data.lat,

                lng: data.lng,

                status:
                  typeof data.status ===
                  "string"
                    ? data.status
                    : "",
              });
            }
          });

          // ==========================================
          // UPDATE STATE
          // ==========================================

          setRoads(
            loadedRoads
          );

          setLocations(
            loadedLocations
          );

          setLoading(false);

          setError("");
        },

        (snapshotError) => {

          console.error(
            "Village map listener error:",
            snapshotError
          );

          setLoading(false);

          setError(
            "Village map load করতে সমস্যা হয়েছে."
          );
        }
      );

    return () => {
      unsubscribe();
    };

  }, []);

  // ====================================================
  // FILTERED LOCATIONS
  // ====================================================

  const filteredLocations =
    activeCategory === "all"
      ? locations
      : locations.filter(
          (location) =>
            location.type ===
            activeCategory
        );

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="village-map-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="village-map-header">

        <div>

          <div className="village-map-title">

            <span className="village-map-title-icon">
              🗺️
            </span>

            <div>

              <h2>
                Village Map
              </h2>

              <p>
                Explore Badokhali village
              </p>

            </div>

          </div>

        </div>

        {/* ===============================================
            STATS
        =============================================== */}

        <div className="village-map-stats">

          <div className="public-map-stat">

            <strong>
              {roads.length}
            </strong>

            <span>
              Roads
            </span>

          </div>

          <div className="public-map-stat">

            <strong>
              {locations.length}
            </strong>

            <span>
              Places
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>

      )}

      {/* =================================================
          CATEGORY FILTER
      ================================================= */}

      {!loading && (

        <div className="village-map-filter">

          {/* ALL */}

          <button
            type="button"
            className={
              activeCategory === "all"
                ? "map-filter-btn active"
                : "map-filter-btn"
            }
            onClick={() =>
              setActiveCategory("all")
            }
          >

            <span>
              🌐
            </span>

            All

          </button>

          {/* CATEGORIES */}

          {(
            Object.keys(
              categoryConfig
            ) as MapFeatureType[]
          ).map((type) => {

            const config =
              categoryConfig[type];

            const count =
              locations.filter(
                (location) =>
                  location.type === type
              ).length;

            return (

              <button
                key={type}
                type="button"
                className={
                  activeCategory === type
                    ? "map-filter-btn active"
                    : "map-filter-btn"
                }
                onClick={() =>
                  setActiveCategory(type)
                }
              >

                <span>
                  {config.emoji}
                </span>

                {config.label}

                {count > 0 && (

                  <small>
                    {count}
                  </small>

                )}

              </button>

            );
          })}

        </div>

      )}

      {/* =================================================
          MAP
      ================================================= */}

      <div className="village-public-map-wrapper">

        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (

          <div className="village-map-loading">

            <div
              className="spinner-border"
              role="status"
            />

            <p>
              Village map loading...
            </p>

          </div>

        )}

        <MapContainer
          center={VILLAGE_CENTER}
          zoom={15}
          minZoom={13}
          maxZoom={19}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
          zoomControl={true}
          className="village-public-map"
        >

          {/* =============================================
              TILE
          ============================================= */}

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* =============================================
              MAP RESIZE
          ============================================= */}

          <MapResizeController />

          {/* =============================================
              FIT BOUNDARY
          ============================================= */}

          {boundaryPoints.length >= 3 && (

            <FitBoundary
              points={
                boundaryPoints
              }
            />

          )}

          {/* =============================================
              VILLAGE BOUNDARY
          ============================================= */}

          {boundaryPoints.length >= 3 && (

            <Polygon
              positions={
                boundaryPoints
              }
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.12,
                weight: 3,
              }}
            />

          )}

          {/* =============================================
              ROADS
          ============================================= */}

          {roads.map((road) => (

            <Polyline
              key={road.id}
              positions={
                road.points
              }
              pathOptions={{
                color: "#dc2626",
                weight: 5,
                opacity: 0.85,
              }}
            >

              <Popup>

                <div className="public-map-popup">

                  <div className="public-popup-title">
                    🛣️ {road.name}
                  </div>

                  {road.description && (

                    <div className="public-popup-description">
                      {road.description}
                    </div>

                  )}

                  <div className="public-popup-meta">
                    Road
                  </div>

                </div>

              </Popup>

            </Polyline>

          ))}

          {/* =============================================
              LOCATIONS
          ============================================= */}

          {filteredLocations.map(
            (location) => {

              const config =
                categoryConfig[
                  location.type
                ];

              return (

                <Marker
                  key={location.id}
                  position={[
                    location.lat,
                    location.lng,
                  ]}
                  icon={
                    createMarkerIcon(
                      location.type
                    )
                  }
                >

                  <Popup>

                    <div className="public-map-popup">

                      {/* CATEGORY */}

                      <div className="public-popup-category">

                        <span>
                          {config.emoji}
                        </span>

                        {config.label}

                      </div>

                      {/* NAME */}

                      <div className="public-popup-title">

                        {location.name}

                      </div>

                      {/* DESCRIPTION */}

                      {location.description && (

                        <div className="public-popup-description">

                          {
                            location.description
                          }

                        </div>

                      )}

                      {/* STATUS */}

                      {location.status && (

                        <div className="public-popup-status">

                          <span>
                            Status
                          </span>

                          <strong>
                            {
                              location.status
                            }
                          </strong>

                        </div>

                      )}

                      {/* COORDINATES */}

                      <div className="public-popup-coordinates">

                        {location.lat.toFixed(6)}

                        {" , "}

                        {location.lng.toFixed(6)}

                      </div>

                    </div>

                  </Popup>

                </Marker>

              );
            }
          )}

        </MapContainer>

        {/* =================================================
            MAP LEGEND
        ================================================= */}

        <div className="village-map-legend">

          <div className="legend-title">
            Map Legend
          </div>

          {/* ROAD */}

          <div className="legend-item">

            <span
              className="legend-line road"
            />

            Road

          </div>

          {/* BOUNDARY */}

          <div className="legend-item">

            <span
              className="legend-line boundary"
            />

            Village Boundary

          </div>

          {/* LOCATION TYPES */}

          {(
            Object.keys(
              categoryConfig
            ) as MapFeatureType[]
          ).map((type) => {

            const config =
              categoryConfig[type];

            return (

              <div
                key={type}
                className="legend-item"
              >

                <span
                  className="legend-marker"
                  style={{
                    background:
                      config.color,
                  }}
                >
                  {config.emoji}
                </span>

                {config.label}

              </div>

            );
          })}

        </div>

        {/* =================================================
            LOCATION COUNT
        ================================================= */}

        {!loading &&
          activeCategory !== "all" && (

            <div className="active-filter-info">

              {categoryConfig[
                activeCategory
              ].emoji}

              {" "}

              <strong>
                {
                  categoryConfig[
                    activeCategory
                  ].label
                }
              </strong>

              {" — "}

              {filteredLocations.length}

              {" "}

              location

              {filteredLocations.length !== 1
                ? "s"
                : ""}

            </div>

          )}

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!loading &&
        locations.length === 0 &&
        roads.length === 0 &&
        boundaryPoints.length === 0 && (

          <div className="village-map-empty">

            <div className="empty-icon">
              🗺️
            </div>

            <h5>
              Village map is being prepared
            </h5>

            <p>
              Map information will appear here
              once it is added by the administrator.
            </p>

          </div>

        )}

    </div>
  );
};

export default VillageMap;

