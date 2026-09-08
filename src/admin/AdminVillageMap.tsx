import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polygon,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import {
  FaRoad,
  FaUndo,
  FaTrash,
  FaSave,
  FaTimes,
  FaEdit,
} from "react-icons/fa";

import "./AdminVillageMap.css";
import AdminLayout from "./AdminLayout";

/* =========================================================
   TYPES
========================================================= */

type LatLngPoint = [number, number];

type DrawMode =
  | "none"
  | "boundary"
  | "road"
  | "location";

type LocationType =
  | "streetLight"
  | "tree"
  | "school"
  | "mosque"
  | "mondir"
  | "home"
  | "important";

/* =========================================================
   ROAD FEATURE
========================================================= */

interface RoadFeature {
  id: string;
  type: "road";
  nameBn: string;
  nameEn: string;
  description: string;
  points: LatLngPoint[];
  createdAt?: Timestamp;
}

/* =========================================================
   MAP LOCATION FEATURE
========================================================= */

interface MapFeature {
  id: string;
  type: LocationType;
  nameBn: string;
  nameEn: string;
  description: string;
  lat: number;
  lng: number;
  status: string;
  createdAt?: Timestamp;
}

/* =========================================================
   VILLAGE CENTER
========================================================= */

const VILLAGE_CENTER: LatLngPoint = [
  22.6905625,
  89.7430625,
];

/* =========================================================
   LOCATION ICONS
========================================================= */

const createIcon = (emoji: string) =>
  L.divIcon({
    html: `
      <div
        style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 2px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "
      >
        ${emoji}
      </div>
    `,
    className: "custom-map-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

const LOCATION_ICONS: Record<
  LocationType,
  L.DivIcon
> = {
  streetLight: createIcon("💡"),
  tree: createIcon("🌳"),
  school: createIcon("🏫"),
  mosque: createIcon("🕌"),
  mondir: createIcon("⛪"),
  home: createIcon("🏠"),
  important: createIcon("📍"),
};

/* =========================================================
   LOCATION LABEL
========================================================= */

const getLocationLabel = (
  type: LocationType
): string => {
  switch (type) {
    case "streetLight":
      return "💡 Street Light";

    case "tree":
      return "🌳 Tree";

    case "school":
      return "🏫 School";

    case "mosque":
      return "🕌 Mosque";

    case "mondir":
      return "⛪ Mondir";

    case "home":
      return "🏠 Home";

    case "important":
      return "📍 Important Place";

    default:
      return type;
  }
};

/* =========================================================
   VALID LOCATION TYPES
========================================================= */

const VALID_LOCATION_TYPES: LocationType[] = [
  "streetLight",
  "tree",
  "school",
  "mosque",
  "mondir",
  "home",
  "important",
];

/* =========================================================
   FIRESTORE POINT PARSER
========================================================= */

const parseLatLngPoints = (
  points: unknown
): LatLngPoint[] => {
  if (!Array.isArray(points)) {
    return [];
  }

  return points
    .map((point: unknown) => {
      /* =========================================
         NEW FIRESTORE FORMAT
         { lat, lng }
      ========================================= */

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

      /* =========================================
         OLD FORMAT
         [lat, lng]
      ========================================= */

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

/* =========================================================
   MAP CLICK HANDLER
========================================================= */

interface MapClickHandlerProps {
  drawMode: DrawMode;
  onMapClick: (
    point: LatLngPoint
  ) => void;
}

const MapClickHandler = ({
  drawMode,
  onMapClick,
}: MapClickHandlerProps) => {
  useMapEvents({
    click(e) {
      if (drawMode === "none") {
        return;
      }

      onMapClick([
        e.latlng.lat,
        e.latlng.lng,
      ]);
    },
  });

  return null;
};

/* =========================================================
   MAP RESIZE CONTROLLER
========================================================= */

const MapResizeController = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

/* =========================================================
   FLY TO LOCATION
========================================================= */

interface FlyToLocationProps {
  location: LatLngPoint | null;
}

const FlyToLocation = ({
  location,
}: FlyToLocationProps) => {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo(location, 17, {
      duration: 1,
    });
  }, [location, map]);

  return null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdminVillageMap = () => {
  /* =======================================================
     DRAW STATE
  ======================================================= */

  const [drawMode, setDrawMode] =
    useState<DrawMode>("none");

  /* =======================================================
     BOUNDARY
  ======================================================= */

  const [boundaryPoints, setBoundaryPoints] =
    useState<LatLngPoint[]>([]);

  const [editingBoundary, setEditingBoundary] =
    useState(false);

  /* =======================================================
     ROAD
  ======================================================= */

  const [roadPoints, setRoadPoints] =
    useState<LatLngPoint[]>([]);

  const [roads, setRoads] =
    useState<RoadFeature[]>([]);

  const [editingRoadId, setEditingRoadId] =
    useState<string | null>(null);

  /* =======================================================
     LOCATIONS
  ======================================================= */

  const [locations, setLocations] =
    useState<MapFeature[]>([]);

  const [editingLocationId, setEditingLocationId] =
    useState<string | null>(null);

  /* =======================================================
     COMMON STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* =======================================================
     NAME STATES
  ======================================================= */

  const [nameBn, setNameBn] =
    useState("");

  const [nameEn, setNameEn] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState("");

  /* =======================================================
     LOCATION COORDINATES
  ======================================================= */

  const [selectedPoint, setSelectedPoint] =
    useState<LatLngPoint | null>(null);

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  /* =======================================================
     LOAD MAP DATA
  ======================================================= */

  const loadMapData = async () => {
    try {
      setLoading(true);
      setMessage("");

      /* =========================================
         LOAD BOUNDARY
      ========================================= */

      const boundaryRef = doc(
        db,
        "villageMap",
        "villageBoundary"
      );

      const boundarySnap =
        await getDoc(boundaryRef);

      if (boundarySnap.exists()) {
        const data =
          boundarySnap.data();

        const parsedPoints =
          parseLatLngPoints(
            data.points
          );

        setBoundaryPoints(
          parsedPoints
        );
      } else {
        setBoundaryPoints([]);
      }

      /* =========================================
         LOAD ROADS + LOCATIONS
      ========================================= */

      const snapshot =
        await getDocs(
          collection(
            db,
            "villageMap"
          )
        );

      const loadedRoads: RoadFeature[] =
        [];

      const loadedLocations: MapFeature[] =
        [];

      snapshot.forEach(
        (item) => {
          /* =====================================
             SKIP BOUNDARY DOCUMENT
          ===================================== */

          if (
            item.id ===
            "villageBoundary"
          ) {
            return;
          }

          const data =
            item.data();

          /* =====================================
             ROAD
          ===================================== */

          if (
            data.type === "road"
          ) {
            const points =
              parseLatLngPoints(
                data.points
              );

            loadedRoads.push({
              id: item.id,

              type: "road",

              /*
                New format:
                nameBn + nameEn

                Old format:
                name
              */

              nameBn:
                typeof data.nameBn ===
                "string"
                  ? data.nameBn
                  : typeof data.name ===
                    "string"
                  ? data.name
                  : "",

              nameEn:
                typeof data.nameEn ===
                "string"
                  ? data.nameEn
                  : typeof data.name ===
                    "string"
                  ? data.name
                  : "",

              description:
                typeof data.description ===
                "string"
                  ? data.description
                  : "",

              points,

              createdAt:
                data.createdAt,
            });

            return;
          }

          /* =====================================
             LOCATION
          ===================================== */

          if (
            VALID_LOCATION_TYPES.includes(
              data.type
            ) &&
            typeof data.lat ===
              "number" &&
            typeof data.lng ===
              "number"
          ) {
            loadedLocations.push({
              id: item.id,

              type:
                data.type as LocationType,

              /*
                New format:
                nameBn + nameEn

                Old format:
                name
              */

              nameBn:
                typeof data.nameBn ===
                "string"
                  ? data.nameBn
                  : typeof data.name ===
                    "string"
                  ? data.name
                  : "",

              nameEn:
                typeof data.nameEn ===
                "string"
                  ? data.nameEn
                  : typeof data.name ===
                    "string"
                  ? data.name
                  : "",

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

              createdAt:
                data.createdAt,
            });
          }
        }
      );

      setRoads(
        loadedRoads
      );

      setLocations(
        loadedLocations
      );
    } catch (error) {
      console.error(
        "Map load error:",
        error
      );

      setMessage(
        "❌ Map data load করতে সমস্যা হয়েছে."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadMapData();
  }, []);

  /* =======================================================
     MAP CLICK
  ======================================================= */

  const handleMapClick = (
    point: LatLngPoint
  ) => {
    /* =========================================
       BOUNDARY
    ========================================= */

    if (
      drawMode === "boundary"
    ) {
      setBoundaryPoints(
        (prev) => [
          ...prev,
          point,
        ]
      );

      return;
    }

    /* =========================================
       ROAD
    ========================================= */

    if (
      drawMode === "road"
    ) {
      setRoadPoints(
        (prev) => [
          ...prev,
          point,
        ]
      );

      return;
    }

    /* =========================================
       LOCATION
    ========================================= */

    if (
      drawMode === "location"
    ) {
      setSelectedPoint(
        point
      );

      setLatitude(
        point[0].toFixed(7)
      );

      setLongitude(
        point[1].toFixed(7)
      );
    }
  };

  /* =======================================================
     START NEW BOUNDARY
  ======================================================= */

  const startBoundary = () => {
    setDrawMode(
      "boundary"
    );

    setEditingBoundary(
      false
    );

    setBoundaryPoints([]);

    setRoadPoints([]);

    setSelectedPoint(null);

    setEditingRoadId(null);

    setEditingLocationId(null);

    setNameBn("");

    setNameEn("");

    setDescription("");

    setStatus("");

    setMessage(
      "📍 Map-এ click করে village boundary-এর points দিন."
    );
  };

  /* =======================================================
     EDIT BOUNDARY
  ======================================================= */

  const editBoundary = () => {
    if (
      boundaryPoints.length < 3
    ) {
      setMessage(
        "⚠️ Edit করার মতো boundary পাওয়া যায়নি."
      );

      return;
    }

    setDrawMode(
      "boundary"
    );

    setEditingBoundary(
      true
    );

    setRoadPoints([]);

    setSelectedPoint(null);

    setEditingRoadId(null);

    setEditingLocationId(null);

    setNameBn("");

    setNameEn("");

    setDescription("");

    setStatus("");

    setMessage(
      "✏️ Boundary edit mode active. Map-এ point add/remove করতে পারবেন."
    );
  };

  /* =======================================================
     START NEW ROAD
  ======================================================= */

  const startRoad = () => {
    setDrawMode(
      "road"
    );

    setEditingRoadId(
      null
    );

    setEditingBoundary(
      false
    );

    setRoadPoints([]);

    setSelectedPoint(null);

    setEditingLocationId(null);

    setNameBn("");

    setNameEn("");

    setDescription("");

    setStatus("");

    setMessage(
      "🛣️ Map-এ click করে road-এর points দিন."
    );
  };

  /* =======================================================
     EDIT ROAD
  ======================================================= */

  const editRoad = (
    road: RoadFeature
  ) => {
    setDrawMode(
      "road"
    );

    setEditingRoadId(
      road.id
    );

    setEditingBoundary(
      false
    );

    setRoadPoints([
      ...road.points,
    ]);

    setBoundaryPoints([]);

    setSelectedPoint(null);

    setEditingLocationId(null);

    setNameBn(
      road.nameBn
    );

    setNameEn(
      road.nameEn
    );

    setDescription(
      road.description
    );

    setStatus("");

    setMessage(
      `✏️ "${road.nameBn}" edit mode active.`
    );
  };

  /* =======================================================
     START NEW LOCATION
  ======================================================= */

  const startLocation = () => {
    setDrawMode(
      "location"
    );

    setEditingLocationId(
      null
    );

    setEditingBoundary(
      false
    );

    setSelectedPoint(null);

    setLatitude("");

    setLongitude("");

    setNameBn("");

    setNameEn("");

    setDescription("");

    setStatus("");

    setRoadPoints([]);

    setBoundaryPoints([]);

    setMessage(
      "📍 Map-এ click করে location select করুন."
    );
  };

  /* =======================================================
     EDIT LOCATION
  ======================================================= */

  const editLocation = (
    location: MapFeature
  ) => {
    setDrawMode(
      "location"
    );

    setEditingLocationId(
      location.id
    );

    setEditingBoundary(
      false
    );

    setEditingRoadId(null);

    setSelectedPoint([
      location.lat,
      location.lng,
    ]);

    setLatitude(
      location.lat.toFixed(7)
    );

    setLongitude(
      location.lng.toFixed(7)
    );

    setNameBn(
      location.nameBn
    );

    setNameEn(
      location.nameEn
    );

    setDescription(
      location.description
    );

    setStatus(
      location.type
    );

    setRoadPoints([]);

    setBoundaryPoints([]);

    setMessage(
      `✏️ "${location.nameBn}" edit mode active.`
    );
  };

  /* =======================================================
     CANCEL DRAW / EDIT
  ======================================================= */

  const cancelDrawing = () => {
    setDrawMode(
      "none"
    );

    setEditingBoundary(
      false
    );

    setEditingRoadId(
      null
    );

    setEditingLocationId(
      null
    );

    setRoadPoints([]);

    setSelectedPoint(null);

    setLatitude("");

    setLongitude("");

    setNameBn("");

    setNameEn("");

    setDescription("");

    setStatus("");

    /*
      Existing saved boundary
      clear করা হবে না।
    */

    loadMapData();

    setMessage("");
  };

  /* =======================================================
     UNDO LAST POINT
  ======================================================= */

  const undoLastPoint = () => {
    if (
      drawMode === "boundary"
    ) {
      setBoundaryPoints(
        (prev) =>
          prev.slice(
            0,
            -1
          )
      );

      return;
    }

    if (
      drawMode === "road"
    ) {
      setRoadPoints(
        (prev) =>
          prev.slice(
            0,
            -1
          )
      );
    }
  };

  /* =======================================================
     SAVE / UPDATE BOUNDARY
  ======================================================= */

  const saveBoundary = async () => {
    if (
      boundaryPoints.length < 3
    ) {
      setMessage(
        "⚠️ Boundary save করতে কমপক্ষে 3টি point দিন."
      );

      return;
    }

    try {
      setSaving(true);

      const firestorePoints =
        boundaryPoints.map(
          ([lat, lng]) => ({
            lat,
            lng,
          })
        );

      await setDoc(
        doc(
          db,
          "villageMap",
          "villageBoundary"
        ),
        {
          type: "boundary",

          points:
            firestorePoints,

          updatedAt:
            Timestamp.now(),
        }
      );

      setDrawMode(
        "none"
      );

      setEditingBoundary(
        false
      );

      setMessage(
        editingBoundary
          ? "✅ Village boundary successfully updated."
          : "✅ Village boundary successfully saved."
      );
    } catch (error) {
      console.error(
        "Boundary save error:",
        error
      );

      setMessage(
        "❌ Boundary save/update করতে সমস্যা হয়েছে."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     SAVE / UPDATE ROAD
  ======================================================= */

  const saveRoad = async () => {
    if (
      roadPoints.length < 2
    ) {
      setMessage(
        "⚠️ Road save করতে কমপক্ষে 2টি point দিন."
      );

      return;
    }

    if (
      !nameBn.trim() ||
      !nameEn.trim()
    ) {
      setMessage(
        "⚠️ Road-এর বাংলা এবং English দুইটি নামই দিন."
      );

      return;
    }

    try {
      setSaving(true);

      const firestorePoints =
        roadPoints.map(
          ([lat, lng]) => ({
            lat,
            lng,
          })
        );

      /* =========================================
         UPDATE EXISTING ROAD
      ========================================= */

      if (
        editingRoadId
      ) {
        await updateDoc(
          doc(
            db,
            "villageMap",
            editingRoadId
          ),
          {
            type: "road",

            nameBn:
              nameBn.trim(),

            nameEn:
              nameEn.trim(),

            /*
              Backward compatibility
              পুরনো public map-এর জন্য
            */
            name:
              nameBn.trim(),

            description:
              description.trim(),

            points:
              firestorePoints,

            updatedAt:
              Timestamp.now(),
          }
        );

        setRoads(
          (prev) =>
            prev.map(
              (road) =>
                road.id ===
                editingRoadId
                  ? {
                      ...road,

                      nameBn:
                        nameBn.trim(),

                      nameEn:
                        nameEn.trim(),

                      description:
                        description.trim(),

                      points:
                        [
                          ...roadPoints,
                        ],
                    }
                  : road
            )
        );

        setMessage(
          "✅ Road successfully updated."
        );
      } else {
        /* =========================================
           ADD NEW ROAD
        ========================================= */

        const roadData = {
          type:
            "road" as const,

          nameBn:
            nameBn.trim(),

          nameEn:
            nameEn.trim(),

          /*
            Backward compatibility
          */
          name:
            nameBn.trim(),

          description:
            description.trim(),

          points:
            firestorePoints,

          createdAt:
            Timestamp.now(),
        };

        const roadRef =
          await addDoc(
            collection(
              db,
              "villageMap"
            ),
            roadData
          );

        const newRoad: RoadFeature = {
          id:
            roadRef.id,

          type:
            "road",

          nameBn:
            roadData.nameBn,

          nameEn:
            roadData.nameEn,

          description:
            roadData.description,

          points:
            [...roadPoints],

          createdAt:
            roadData.createdAt,
        };

        setRoads(
          (prev) => [
            ...prev,
            newRoad,
          ]
        );

        setMessage(
          "✅ Road successfully saved."
        );
      }

      setRoadPoints([]);

      setNameBn("");

      setNameEn("");

      setDescription("");

      setEditingRoadId(
        null
      );

      setDrawMode(
        "none"
      );
    } catch (error) {
      console.error(
        "Road save/update error:",
        error
      );

      setMessage(
        "❌ Road save/update করতে সমস্যা হয়েছে."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     SAVE / UPDATE LOCATION
  ======================================================= */

  const saveLocation = async () => {
    if (
      !nameBn.trim() ||
      !nameEn.trim()
    ) {
      setMessage(
        "⚠️ বাংলা এবং English দুইটি নামই দিন."
      );

      return;
    }

    const lat =
      Number(latitude);

    const lng =
      Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setMessage(
        "⚠️ Valid latitude এবং longitude দিন."
      );

      return;
    }

    if (
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setMessage(
        "⚠️ Latitude অথবা longitude valid range-এর মধ্যে নেই."
      );

      return;
    }

    if (
      !VALID_LOCATION_TYPES.includes(
        status as LocationType
      )
    ) {
      setMessage(
        "⚠️ Location type select করুন."
      );

      return;
    }

    try {
      setSaving(true);

      const locationType =
        status as LocationType;

      /* =========================================
         UPDATE EXISTING LOCATION
      ========================================= */

      if (
        editingLocationId
      ) {
        await updateDoc(
          doc(
            db,
            "villageMap",
            editingLocationId
          ),
          {
            type:
              locationType,

            nameBn:
              nameBn.trim(),

            nameEn:
              nameEn.trim(),

            /*
              Backward compatibility
            */
            name:
              nameBn.trim(),

            description:
              description.trim(),

            lat,

            lng,

            status:
              locationType,

            updatedAt:
              Timestamp.now(),
          }
        );

        setLocations(
          (prev) =>
            prev.map(
              (location) =>
                location.id ===
                editingLocationId
                  ? {
                      ...location,

                      type:
                        locationType,

                      nameBn:
                        nameBn.trim(),

                      nameEn:
                        nameEn.trim(),

                      description:
                        description.trim(),

                      lat,

                      lng,

                      status:
                        locationType,
                    }
                  : location
            )
        );

        setMessage(
          "✅ Location successfully updated."
        );
      } else {
        /* =========================================
           ADD NEW LOCATION
        ========================================= */

        const locationData = {
          type:
            locationType,

          nameBn:
            nameBn.trim(),

          nameEn:
            nameEn.trim(),

          /*
            Backward compatibility
          */
          name:
            nameBn.trim(),

          description:
            description.trim(),

          lat,

          lng,

          status:
            locationType,

          createdAt:
            Timestamp.now(),
        };

        const locationRef =
          await addDoc(
            collection(
              db,
              "villageMap"
            ),
            locationData
          );

        const newLocation: MapFeature =
          {
            id:
              locationRef.id,

            type:
              locationType,

            nameBn:
              locationData.nameBn,

            nameEn:
              locationData.nameEn,

            description:
              locationData.description,

            lat:
              locationData.lat,

            lng:
              locationData.lng,

            status:
              locationData.status,

            createdAt:
              locationData.createdAt,
          };

        setLocations(
          (prev) => [
            ...prev,
            newLocation,
          ]
        );

        setMessage(
          "✅ Location successfully saved."
        );
      }

      setSelectedPoint(
        null
      );

      setLatitude("");

      setLongitude("");

      setNameBn("");

      setNameEn("");

      setDescription("");

      setStatus("");

      setEditingLocationId(
        null
      );

      setDrawMode(
        "none"
      );
    } catch (error) {
      console.error(
        "Location save/update error:",
        error
      );

      setMessage(
        "❌ Location save/update করতে সমস্যা হয়েছে."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE ROAD
  ======================================================= */

  const deleteRoad = async (
    roadId: string
  ) => {
    const confirmed =
      window.confirm(
        "এই road টি delete করতে চান?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await deleteDoc(
        doc(
          db,
          "villageMap",
          roadId
        )
      );

      setRoads(
        (prev) =>
          prev.filter(
            (road) =>
              road.id !==
              roadId
          )
      );

      if (
        editingRoadId ===
        roadId
      ) {
        setEditingRoadId(
          null
        );

        setRoadPoints([]);

        setDrawMode(
          "none"
        );
      }

      setMessage(
        "✅ Road deleted successfully."
      );
    } catch (error) {
      console.error(
        "Road delete error:",
        error
      );

      setMessage(
        "❌ Road delete করতে সমস্যা হয়েছে."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE LOCATION
  ======================================================= */

  const deleteLocation = async (
    locationId: string
  ) => {
    const confirmed =
      window.confirm(
        "এই location টি delete করতে চান?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await deleteDoc(
        doc(
          db,
          "villageMap",
          locationId
        )
      );

      setLocations(
        (prev) =>
          prev.filter(
            (location) =>
              location.id !==
              locationId
          )
      );

      if (
        editingLocationId ===
        locationId
      ) {
        setEditingLocationId(
          null
        );

        setSelectedPoint(
          null
        );

        setDrawMode(
          "none"
        );
      }

      setMessage(
        "✅ Location deleted successfully."
      );
    } catch (error) {
      console.error(
        "Location delete error:",
        error
      );

      setMessage(
        "❌ Location delete করতে সমস্যা হয়েছে."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE BOUNDARY
  ======================================================= */

  const deleteBoundary =
    async () => {
      const confirmed =
        window.confirm(
          "Village boundary delete করতে চান?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setSaving(true);

        await deleteDoc(
          doc(
            db,
            "villageMap",
            "villageBoundary"
          )
        );

        setBoundaryPoints([]);

        setEditingBoundary(
          false
        );

        if (
          drawMode ===
          "boundary"
        ) {
          setDrawMode(
            "none"
          );
        }

        setMessage(
          "✅ Village boundary deleted successfully."
        );
      } catch (error) {
        console.error(
          "Boundary delete error:",
          error
        );

        setMessage(
          "❌ Boundary delete করতে সমস্যা হয়েছে."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     FLY LOCATION
  ======================================================= */

  const flyLocation =
    selectedPoint;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AdminLayout>
      <div className="admin-village-map">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fw-bold mb-1">
              🗺️ Village Map Management
            </h3>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={loadMapData}
            disabled={
              loading ||
              saving
            }
          >
            🔄 Refresh
          </button>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`alert ${
              message.startsWith("❌")
                ? "alert-danger"
                : message.startsWith("⚠️")
                ? "alert-warning"
                : "alert-success"
            } d-flex justify-content-between align-items-center`}
          >
            <span>
              {message}
            </span>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() =>
                setMessage("")
              }
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="card shadow-sm mb-3">
          <div className="card-body">

            <div className="d-flex flex-wrap gap-2">

              {/* =========================================
                  BOUNDARY
              ========================================= */}

              <button
                type="button"
                className={`btn ${
                  drawMode ===
                  "boundary"
                    ? "btn-danger"
                    : "btn-primary"
                }`}
                onClick={
                  drawMode ===
                  "boundary"
                    ? cancelDrawing
                    : startBoundary
                }
                disabled={
                  saving
                }
              >
                📐{" "}
                {drawMode ===
                "boundary"
                  ? "Cancel Boundary"
                  : "Draw Boundary"}
              </button>

              {/* =========================================
                  EDIT BOUNDARY
              ========================================= */}

              {boundaryPoints.length >=
                3 &&
                drawMode ===
                  "none" && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={
                      editBoundary
                    }
                    disabled={
                      saving
                    }
                  >
                    <FaEdit className="me-1" />
                    Edit Boundary
                  </button>
                )}

              {/* =========================================
                  ROAD
              ========================================= */}

              <button
                type="button"
                className={`btn ${
                  drawMode ===
                  "road"
                    ? "btn-danger"
                    : "btn-success"
                }`}
                onClick={
                  drawMode ===
                  "road"
                    ? cancelDrawing
                    : startRoad
                }
                disabled={
                  saving
                }
              >
                <FaRoad className="me-1" />

                {drawMode ===
                "road"
                  ? editingRoadId
                    ? "Cancel Road Edit"
                    : "Cancel Road"
                  : "Draw Road"}
              </button>

              {/* =========================================
                  LOCATION
              ========================================= */}

              <button
                type="button"
                className={`btn ${
                  drawMode ===
                  "location"
                    ? "btn-danger"
                    : "btn-warning"
                }`}
                onClick={
                  drawMode ===
                  "location"
                    ? cancelDrawing
                    : startLocation
                }
                disabled={
                  saving
                }
              >
                📍{" "}
                {drawMode ===
                "location"
                  ? editingLocationId
                    ? "Cancel Location Edit"
                    : "Cancel Location"
                  : "Add Location"}
              </button>

              {/* =========================================
                  UNDO
              ========================================= */}

              {(drawMode ===
                "boundary" ||
                drawMode ===
                  "road") && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={
                    undoLastPoint
                  }
                  disabled={
                    saving ||
                    (drawMode ===
                      "boundary" &&
                      boundaryPoints.length ===
                        0) ||
                    (drawMode ===
                      "road" &&
                      roadPoints.length ===
                        0)
                  }
                >
                  <FaUndo className="me-1" />
                  Undo
                </button>
              )}

              {/* =========================================
                  CANCEL
              ========================================= */}

              {drawMode !==
                "none" && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={
                    cancelDrawing
                  }
                  disabled={
                    saving
                  }
                >
                  <FaTimes className="me-1" />
                  Cancel
                </button>
              )}
            </div>

            {/* =========================================
                BOUNDARY INFO
            ========================================= */}

            {drawMode ===
              "boundary" && (
              <div className="alert alert-info mt-3 mb-0">
                {editingBoundary
                  ? "✏️ Boundary edit mode active."
                  : "📍 Boundary draw mode active."}

                <br />

                Map-এ click করে
                boundary points দিন।

                <br />

                Current points:{" "}
                <strong>
                  {
                    boundaryPoints.length
                  }
                </strong>
              </div>
            )}

            {/* =========================================
                ROAD INFO
            ========================================= */}

            {drawMode ===
              "road" && (
              <div className="alert alert-info mt-3 mb-0">
                {editingRoadId
                  ? "✏️ Road edit mode active."
                  : "🛣️ Road draw mode active."}

                <br />

                Map-এ click করে road
                points add করুন।

                <br />

                Current points:{" "}
                <strong>
                  {
                    roadPoints.length
                  }
                </strong>
              </div>
            )}

            {/* =========================================
                LOCATION INFO
            ========================================= */}

            {drawMode ===
              "location" && (
              <div className="alert alert-info mt-3 mb-0">
                {editingLocationId
                  ? "✏️ Location edit mode active."
                  : "📍 Location mode active."}

                <br />

                {editingLocationId
                  ? "Map-এ click করলে location-এর coordinates পরিবর্তন হবে।"
                  : "Map-এ click করে একটি location select করুন।"}
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            BOUNDARY FORM
        ================================================= */}

        {drawMode ===
          "boundary" &&
          boundaryPoints.length >=
            3 && (
          <div className="card shadow-sm mb-3">
            <div className="card-body">

              <h5 className="fw-bold">
                📐{" "}
                {editingBoundary
                  ? "Edit Village Boundary"
                  : "Village Boundary"}
              </h5>

              <p className="text-muted small mb-3">
                Total points:{" "}
                {
                  boundaryPoints.length
                }
              </p>

              <div className="d-flex flex-wrap gap-2">

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    saveBoundary
                  }
                  disabled={
                    saving
                  }
                >
                  <FaSave className="me-1" />

                  {saving
                    ? "Saving..."
                    : editingBoundary
                    ? "Update Boundary"
                    : "Save Boundary"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setBoundaryPoints(
                      []
                    )
                  }
                  disabled={
                    saving
                  }
                >
                  Clear Points
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            ROAD FORM
        ================================================= */}

        {drawMode ===
          "road" &&
          roadPoints.length >=
            2 && (
          <div className="card shadow-sm mb-3">
            <div className="card-body">

              <h5 className="fw-bold">
                🛣️{" "}
                {editingRoadId
                  ? "Edit Road"
                  : "Road Information"}
              </h5>

              <div className="row g-3">

                {/* ROAD NAME BANGLA */}

                <div className="col-md-6">
                  <label className="form-label">
                    Road Name (বাংলা)
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="যেমন: প্রধান সড়ক"
                    value={
                      nameBn
                    }
                    onChange={(e) =>
                      setNameBn(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* ROAD NAME ENGLISH */}

                <div className="col-md-6">
                  <label className="form-label">
                    Road Name (English)
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Main Road"
                    value={
                      nameEn
                    }
                    onChange={(e) =>
                      setNameEn(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="col-md-12">
                  <label className="form-label">
                    Description
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Road সম্পর্কে কিছু লিখুন"
                    value={
                      description
                    }
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={
                    saveRoad
                  }
                  disabled={
                    saving
                  }
                >
                  <FaSave className="me-1" />

                  {saving
                    ? "Saving..."
                    : editingRoadId
                    ? "Update Road"
                    : "Save Road"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={
                    cancelDrawing
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            LOCATION FORM
        ================================================= */}

        {drawMode ===
          "location" &&
          selectedPoint && (
          <div className="card shadow-sm mb-3">
            <div className="card-body">

              <h5 className="fw-bold">
                📍{" "}
                {editingLocationId
                  ? "Edit Location"
                  : "Location Information"}
              </h5>

              <div className="row g-3">

                {/* TYPE */}

                <div className="col-md-4">
                  <label className="form-label">
                    Location Type
                  </label>

                  <select
                    className="form-select"
                    value={
                      status
                    }
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    <option value="">
                      Select Type
                    </option>

                    <option value="streetLight">
                      💡 Street Light
                    </option>

                    <option value="tree">
                      🌳 Tree
                    </option>

                    <option value="school">
                      🏫 School
                    </option>

                    <option value="mosque">
                      🕌 Mosque
                    </option>

                    <option value="mondir">
                      🏥 mondir
                    </option>

                    <option value="home">
                      🏠 Home
                    </option>

                    <option value="important">
                      📍 Important Place
                    </option>
                  </select>
                </div>

                {/* NAME BANGLA */}

                <div className="col-md-4">
                  <label className="form-label">
                    Name (বাংলা)
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="যেমন: সুদীপের বাড়ি"
                    value={
                      nameBn
                    }
                    onChange={(e) =>
                      setNameBn(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* NAME ENGLISH */}

                <div className="col-md-4">
                  <label className="form-label">
                    Name (English)
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sudip's House"
                    value={
                      nameEn
                    }
                    onChange={(e) =>
                      setNameEn(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="col-md-4">
                  <label className="form-label">
                    Description
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Description"
                    value={
                      description
                    }
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* LATITUDE */}

                <div className="col-md-6">
                  <label className="form-label">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={
                      latitude
                    }
                    onChange={(e) =>
                      setLatitude(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* LONGITUDE */}

                <div className="col-md-6">
                  <label className="form-label">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={
                      longitude
                    }
                    onChange={(e) =>
                      setLongitude(
                        e.target.value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={
                    saveLocation
                  }
                  disabled={
                    saving
                  }
                >
                  <FaSave className="me-1" />

                  {saving
                    ? "Saving..."
                    : editingLocationId
                    ? "Update Location"
                    : "Save Location"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={
                    cancelDrawing
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            MAP
        ================================================= */}

        <div
          className="card shadow-sm overflow-hidden"
          style={{
            borderRadius:
              "12px",
          }}
        >
          <div
            style={{
              height:
                "650px",
              width: "100%",
            }}
          >
            {loading ? (
              <div className="h-100 d-flex align-items-center justify-content-center">
                <div className="text-center">

                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  />

                  <div>
                    Loading map...
                  </div>
                </div>
              </div>
            ) : (
              <MapContainer
                center={
                  VILLAGE_CENTER
                }
                zoom={16}
                scrollWheelZoom={
                  true
                }
                style={{
                  height:
                    "100%",
                  width: "100%",
                }}
              >

                {/* =========================================
                    TILE LAYER
                ========================================= */}

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* =========================================
                    MAP CONTROLLERS
                ========================================= */}

                <MapResizeController />

                <MapClickHandler
                  drawMode={
                    drawMode
                  }
                  onMapClick={
                    handleMapClick
                  }
                />

                <FlyToLocation
                  location={
                    flyLocation
                  }
                />

                {/* =========================================
                    SAVED VILLAGE BOUNDARY
                ========================================= */}

                {boundaryPoints.length >=
                  3 && (
                  <Polygon
                    positions={
                      boundaryPoints
                    }
                    pathOptions={{
                      color:
                        "#0d6efd",

                      weight: 4,

                      fillColor:
                        "#0d6efd",

                      fillOpacity:
                        0.12,
                    }}
                  />
                )}

                {/* =========================================
                    CURRENT BOUNDARY
                ========================================= */}

                {drawMode ===
                  "boundary" &&
                  boundaryPoints.length >=
                    2 && (
                  <Polyline
                    positions={
                      boundaryPoints
                    }
                    pathOptions={{
                      color:
                        editingBoundary
                          ? "#6610f2"
                          : "#dc3545",

                      weight: 4,

                      dashArray:
                        "8, 8",
                    }}
                  />
                )}

                {/* =========================================
                    CURRENT ROAD
                ========================================= */}

                {drawMode ===
                  "road" &&
                  roadPoints.length >=
                    2 && (
                  <Polyline
                    positions={
                      roadPoints
                    }
                    pathOptions={{
                      color:
                        editingRoadId
                          ? "#6f42c1"
                          : "#198754",

                      weight: 5,

                      dashArray:
                        "10, 6",
                    }}
                  />
                )}

                {/* =========================================
                    SAVED ROADS
                ========================================= */}

                {roads.map(
                  (road) =>
                    road.points.length >=
                      2 && (
                      <Polyline
                        key={
                          road.id
                        }
                        positions={
                          road.points
                        }
                        pathOptions={{
                          color:
                            editingRoadId ===
                            road.id
                              ? "#6f42c1"
                              : "#ff6600",

                          weight: 5,
                        }}
                      >
                        <Popup>
                          <div
                            style={{
                              minWidth:
                                "240px",
                            }}
                          >

                            <h6 className="fw-bold mb-1">
                              🛣️{" "}
                              {
                                road.nameBn
                              }
                            </h6>

                            <div className="small text-muted mb-2">
                              {
                                road.nameEn
                              }
                            </div>

                            {road.description && (
                              <p className="mb-2 small">
                                {
                                  road.description
                                }
                              </p>
                            )}

                            <div className="small text-muted mb-2">
                              Points:{" "}
                              <strong>
                                {
                                  road
                                    .points
                                    .length
                                }
                              </strong>
                            </div>

                            <hr className="my-2" />

                            <div className="d-flex gap-2">

                              <button
                                type="button"
                                className="btn btn-sm btn-primary flex-fill"
                                onClick={() =>
                                  editRoad(
                                    road
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaEdit className="me-1" />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-danger flex-fill"
                                onClick={() =>
                                  deleteRoad(
                                    road.id
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaTrash className="me-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Polyline>
                    )
                )}

                {/* =========================================
                    SELECTED LOCATION
                ========================================= */}

                {selectedPoint && (
                  <Marker
                    position={
                      selectedPoint
                    }
                    icon={
                      LOCATION_ICONS
                        .important
                    }
                  >
                    <Popup>

                      <strong>
                        {editingLocationId
                          ? "Editing Location"
                          : "Selected Location"}
                      </strong>

                      <br />

                      Lat:{" "}
                      {
                        selectedPoint[0]
                      }

                      <br />

                      Lng:{" "}
                      {
                        selectedPoint[1]
                      }
                    </Popup>
                  </Marker>
                )}

                {/* =========================================
                    SAVED LOCATIONS
                ========================================= */}

                {locations.map(
                  (
                    location
                  ) => (
                    <Marker
                      key={
                        location.id
                      }
                      position={[
                        location.lat,
                        location.lng,
                      ]}
                      icon={
                        LOCATION_ICONS[
                          location.type
                        ] ??
                        LOCATION_ICONS
                          .important
                      }
                    >
                      <Popup>

                        <div
                          style={{
                            minWidth:
                              "240px",
                          }}
                        >

                          <h6 className="fw-bold mb-1">
                            {
                              getLocationLabel(
                                location.type
                              )
                            }
                          </h6>

                          <div className="fw-semibold mb-1">
                            {
                              location.nameBn
                            }
                          </div>

                          <div className="small text-muted mb-2">
                            {
                              location.nameEn
                            }
                          </div>

                          {location.description && (
                            <p className="small text-muted mb-2">
                              {
                                location.description
                              }
                            </p>
                          )}

                          <div className="small mb-3">

                            <strong>
                              Latitude:
                            </strong>{" "}
                            {
                              location.lat
                            }

                            <br />

                            <strong>
                              Longitude:
                            </strong>{" "}
                            {
                              location.lng
                            }
                          </div>

                          <div className="d-flex gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-primary flex-fill"
                              onClick={() =>
                                editLocation(
                                  location
                                )
                              }
                              disabled={
                                saving
                              }
                            >
                              <FaEdit className="me-1" />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-danger flex-fill"
                              onClick={() =>
                                deleteLocation(
                                  location.id
                                )
                              }
                              disabled={
                                saving
                              }
                            >
                              <FaTrash className="me-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                )}

                {/* =========================================
                    BOUNDARY POINT MARKERS
                ========================================= */}

                {drawMode ===
                  "boundary" &&
                  boundaryPoints.map(
                    (
                      point,
                      index
                    ) => (
                      <Marker
                        key={`boundary-point-${index}`}
                        position={
                          point
                        }
                      >
                        <Popup>

                          <strong>
                            Boundary Point{" "}
                            {index +
                              1}
                          </strong>

                          <br />

                          Lat:{" "}
                          {
                            point[0]
                          }

                          <br />

                          Lng:{" "}
                          {
                            point[1]
                          }
                        </Popup>
                      </Marker>
                    )
                  )}

                {/* =========================================
                    ROAD POINT MARKERS
                ========================================= */}

                {drawMode ===
                  "road" &&
                  roadPoints.map(
                    (
                      point,
                      index
                    ) => (
                      <Marker
                        key={`road-point-${index}`}
                        position={
                          point
                        }
                      >
                        <Popup>

                          <strong>
                            Road Point{" "}
                            {index +
                              1}
                          </strong>

                          <br />

                          Lat:{" "}
                          {
                            point[0]
                          }

                          <br />

                          Lng:{" "}
                          {
                            point[1]
                          }
                        </Popup>
                      </Marker>
                    )
                  )}
              </MapContainer>
            )}
          </div>
        </div>

        {/* =================================================
            DATA SUMMARY
        ================================================= */}

        <div className="row g-3 mt-1">

          {/* ===============================================
              BOUNDARY
          =============================================== */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">

                <h6 className="fw-bold">
                  📐 Village Boundary
                </h6>

                <div className="mb-3">
                  Points:{" "}
                  <strong>
                    {
                      boundaryPoints.length
                    }
                  </strong>
                </div>

                <div className="d-flex flex-wrap gap-2">

                  {boundaryPoints.length >=
                    3 && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={
                          editBoundary
                        }
                        disabled={
                          saving
                        }
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={
                          deleteBoundary
                        }
                        disabled={
                          saving
                        }
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================
              ROADS
          =============================================== */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">

                <h6 className="fw-bold">
                  🛣️ Roads
                </h6>

                <div>
                  Total Roads:{" "}
                  <strong>
                    {
                      roads.length
                    }
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================
              LOCATIONS
          =============================================== */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">

                <h6 className="fw-bold">
                  📍 Locations
                </h6>

                <div>
                  Total Locations:{" "}
                  <strong>
                    {
                      locations.length
                    }
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            LOCATION LIST
        ================================================= */}

        {locations.length >
          0 && (
          <div className="card shadow-sm mt-3">

            <div className="card-header bg-white">
              <h5 className="fw-bold mb-0">
                📍 Saved Locations
              </h5>
            </div>

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>

                    <th>
                      Type
                    </th>

                    <th>
                      Name (বাংলা)
                    </th>

                    <th>
                      Name (English)
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Latitude
                    </th>

                    <th>
                      Longitude
                    </th>

                    <th className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {locations.map(
                    (
                      location
                    ) => (
                      <tr
                        key={
                          location.id
                        }
                      >

                        <td>
                          {getLocationLabel(
                            location.type
                          )}
                        </td>

                        <td className="fw-semibold">
                          {
                            location.nameBn
                          }
                        </td>

                        <td className="fw-semibold">
                          {
                            location.nameEn
                          }
                        </td>

                        <td>
                          {
                            location.description ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            location.lat
                          }
                        </td>

                        <td>
                          {
                            location.lng
                          }
                        </td>

                        <td className="text-end">

                          <div className="d-flex justify-content-end gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                editLocation(
                                  location
                                )
                              }
                              disabled={
                                saving
                              }
                              title="Edit Location"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                deleteLocation(
                                  location.id
                                )
                              }
                              disabled={
                                saving
                              }
                              title="Delete Location"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================
            ROAD LIST
        ================================================= */}

        {roads.length >
          0 && (
          <div className="card shadow-sm mt-3">

            <div className="card-header bg-white">
              <h5 className="fw-bold mb-0">
                🛣️ Saved Roads
              </h5>
            </div>

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>

                    <th>
                      Road (বাংলা)
                    </th>

                    <th>
                      Road (English)
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Points
                    </th>

                    <th className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {roads.map(
                    (
                      road
                    ) => (
                      <tr
                        key={
                          road.id
                        }
                      >

                        <td className="fw-semibold">

                          <FaRoad className="me-2" />

                          {
                            road.nameBn
                          }
                        </td>

                        <td className="fw-semibold">
                          {
                            road.nameEn
                          }
                        </td>

                        <td>
                          {
                            road.description ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            road.points
                              .length
                          }
                        </td>

                        <td className="text-end">

                          <div className="d-flex justify-content-end gap-2">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                editRoad(
                                  road
                                )
                              }
                              disabled={
                                saving
                              }
                              title="Edit Road"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                deleteRoad(
                                  road.id
                                )
                              }
                              disabled={
                                saving
                              }
                              title="Delete Road"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================
            LOCATION TYPE SUMMARY
        ================================================= */}

        {locations.length >
          0 && (
          <div className="card shadow-sm mt-3">

            <div className="card-header bg-white">
              <h5 className="fw-bold mb-0">
                📊 Location Summary
              </h5>
            </div>

            <div className="card-body">

              <div className="row g-3">

                {VALID_LOCATION_TYPES.map(
                  (type) => {
                    const count =
                      locations.filter(
                        (location) =>
                          location.type ===
                          type
                      ).length;

                    return (
                      <div
                        className="col-6 col-md-3"
                        key={
                          type
                        }
                      >

                        <div className="border rounded p-3 text-center h-100">

                         

                          <div className="small fw-semibold">
                            {
                              getLocationLabel(
                                type
                              )
                            }
                          </div>

                          <div className="fs-5 fw-bold mt-1">
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminVillageMap;