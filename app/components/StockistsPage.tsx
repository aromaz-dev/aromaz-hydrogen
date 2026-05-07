import {type PointerEvent, useEffect, useMemo, useRef, useState} from 'react';

const STOCKIST_CATEGORIES = ['All', 'Retail', 'Refill', 'Wholesale'];

const STOCKIST_LOCATIONS = [
  {
    name: 'Shop Makers Park Royal',
    type: 'Retail',
    city: 'West Vancouver, BC',
    address: '2002 Park Royal S #967, West Vancouver, BC V7T 2W4',
    detail: 'Aromaz is available at Shop Makers Park Royal.',
    coordinates: {lat: 49.3262, lng: -123.1365},
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2002%20Park%20Royal%20S%20%23967%2C%20West%20Vancouver%2C%20BC%20V7T%202W4',
  },
  {
    name: 'Every Small Objects',
    type: 'Retail',
    city: 'Burnaby, BC',
    address: '420 Grove Ave, Burnaby, BC V5B 4G3',
    detail: 'Aromaz is available at Every Small Objects.',
    coordinates: {lat: 49.2829, lng: -123.0145},
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=420%20Grove%20Ave%2C%20Burnaby%2C%20BC%20V5B%204G3',
  },
  {
    name: 'Daydream Factory',
    type: 'Retail',
    city: 'Vancouver, BC',
    address: '2987 Granville St, Vancouver, BC V6H 3J6',
    detail: 'Aromaz is available at Daydream Factory.',
    coordinates: {lat: 49.2587, lng: -123.1391},
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2987%20Granville%20St%2C%20Vancouver%2C%20BC%20V6H%203J6',
  },
];

const DEFAULT_MAP_CENTER = {lat: 49.292, lng: -123.08, zoom: 11};
const TILE_SIZE = 256;
const MIN_ZOOM = 10;
const MAX_ZOOM = 16;

type StockistLocation = (typeof STOCKIST_LOCATIONS)[number];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function projectLatLng({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);

  return {
    x: ((lng + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
      scale,
  };
}

function unprojectPoint({
  x,
  y,
  zoom,
}: {
  x: number;
  y: number;
  zoom: number;
}) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  return {lat, lng};
}

function googleDirectionsUrl(location: StockistLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    location.address,
  )}`;
}

export function StockistsPage() {
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(
    null,
  );
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const selectedLocation = STOCKIST_LOCATIONS.find(
    (location) => location.name === selectedLocationName,
  );

  const selectLocation = (location: StockistLocation, shouldScroll = false) => {
    setSelectedLocationName(location.name);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        mapAreaRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
  };

  return (
    <main className="stockists-page">
      <section className="stockists-hero">
        <div className="stockists-hero-copy">
          <p>Find a Store</p>
          <h1>Aromaz stockists and refill partners.</h1>
          <span>
            Find Aromaz at current Vancouver-area retail partners carrying our
            natural personal care.
          </span>
          <a href="mailto:info@aromazco.com?subject=Aromaz%20Stockist%20Inquiry">
            Become a stockist
          </a>
        </div>
        <div className="stockists-map-anchor" ref={mapAreaRef}>
          <StockistsMap
            locations={STOCKIST_LOCATIONS}
            selectedLocation={selectedLocation}
            onReset={() => setSelectedLocationName(null)}
            onSelect={(location) => selectLocation(location)}
          />
        </div>
      </section>

      <section className="stockists-directory">
        <div className="stockists-directory-heading">
          <div>
            <p>Locate Aromaz</p>
            <h2>Available now at three local shops.</h2>
          </div>
          <span>
            Visit one of the current Aromaz stockists below, or contact us for
            wholesale and partnership inquiries.
          </span>
        </div>

        <div className="stockists-filters" aria-label="Stockist categories">
          {STOCKIST_CATEGORIES.map((category) => (
            <button key={category} type="button">
              {category}
            </button>
          ))}
        </div>

        <div className="stockists-list">
          {STOCKIST_LOCATIONS.map((location) => (
            <article
              className={
                selectedLocationName === location.name
                  ? 'stockists-list-item--active'
                  : undefined
              }
              key={location.name}
            >
              <span>{location.type}</span>
              <h3>{location.name}</h3>
              <strong>{location.city}</strong>
              <address>{location.address}</address>
              <p>{location.detail}</p>
              <div className="stockists-list-actions">
                <button
                  type="button"
                  onClick={() => selectLocation(location, true)}
                >
                  Show on map
                </button>
                <a
                  href={location.mapUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open Google Maps
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StockistsMap({
  locations,
  selectedLocation,
  onReset,
  onSelect,
}: {
  locations: StockistLocation[];
  selectedLocation?: StockistLocation;
  onReset: () => void;
  onSelect: (location: StockistLocation) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    centerPoint: {x: number; y: number};
    pointer: {x: number; y: number};
  } | null>(null);
  const [mapSize, setMapSize] = useState({width: 820, height: 520});
  const [mapView, setMapView] = useState(DEFAULT_MAP_CENTER);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const updateSize = () => {
      setMapSize({
        width: map.clientWidth || 820,
        height: map.clientHeight || 520,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(map);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMapView(
      selectedLocation
        ? {...selectedLocation.coordinates, zoom: 15}
        : DEFAULT_MAP_CENTER,
    );
  }, [selectedLocation]);

  const centerPoint = projectLatLng(mapView);

  const tiles = useMemo(() => {
    const startX = Math.floor((centerPoint.x - mapSize.width / 2) / TILE_SIZE);
    const endX = Math.floor((centerPoint.x + mapSize.width / 2) / TILE_SIZE);
    const startY = Math.floor((centerPoint.y - mapSize.height / 2) / TILE_SIZE);
    const endY = Math.floor((centerPoint.y + mapSize.height / 2) / TILE_SIZE);
    const maxTile = 2 ** mapView.zoom;
    const nextTiles = [];

    for (let x = startX - 1; x <= endX + 1; x += 1) {
      for (let y = startY - 1; y <= endY + 1; y += 1) {
        if (y < 0 || y >= maxTile) continue;

        const wrappedX = ((x % maxTile) + maxTile) % maxTile;

        nextTiles.push({
          id: `${mapView.zoom}-${x}-${y}`,
          left: x * TILE_SIZE - centerPoint.x + mapSize.width / 2,
          top: y * TILE_SIZE - centerPoint.y + mapSize.height / 2,
          url: `https://tile.openstreetmap.org/${mapView.zoom}/${wrappedX}/${y}.png`,
        });
      }
    }

    return nextTiles;
  }, [centerPoint.x, centerPoint.y, mapSize.height, mapSize.width, mapView.zoom]);

  const markerPositions = locations.map((location) => {
    const point = projectLatLng({...location.coordinates, zoom: mapView.zoom});

    return {
      location,
      left: point.x - centerPoint.x + mapSize.width / 2,
      top: point.y - centerPoint.y + mapSize.height / 2,
    };
  });

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest('button, a')
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      centerPoint,
      pointer: {x: event.clientX, y: event.clientY},
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    const nextPoint = {
      x: dragRef.current.centerPoint.x - (event.clientX - dragRef.current.pointer.x),
      y: dragRef.current.centerPoint.y - (event.clientY - dragRef.current.pointer.y),
    };
    const nextCenter = unprojectPoint({...nextPoint, zoom: mapView.zoom});

    setMapView((current) => ({
      ...current,
      lat: clamp(nextCenter.lat, 48.8, 49.7),
      lng: clamp(nextCenter.lng, -123.6, -122.5),
    }));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const zoomMap = (direction: 1 | -1) => {
    setMapView((current) => ({
      ...current,
      zoom: clamp(current.zoom + direction, MIN_ZOOM, MAX_ZOOM),
    }));
  };

  return (
    <div className="stockists-map-card" aria-label="Interactive Aromaz stockist map">
      <div
        className="stockists-slippy-map"
        onPointerDown={startDrag}
        onPointerLeave={endDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        ref={mapRef}
        role="application"
        aria-label="Drag map to explore Aromaz stockists"
      >
        <div className="stockists-map-tiles" aria-hidden="true">
          {tiles.map((tile) => (
            <img
              alt=""
              draggable={false}
              key={tile.id}
              src={tile.url}
              style={{
                left: tile.left,
                top: tile.top,
              }}
            />
          ))}
        </div>

        {markerPositions.map(({location, left, top}) => (
          <button
            className={
              selectedLocation?.name === location.name
                ? 'stockists-map-pin stockists-map-pin--selected'
                : 'stockists-map-pin'
            }
            key={location.name}
            type="button"
            style={{left, top}}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(location);
            }}
            aria-label={`Show ${location.name}`}
          >
            <span>{location.name}</span>
          </button>
        ))}

        {selectedLocation && (
          <div className="stockists-map-info" aria-live="polite" role="status">
            <button
              className="stockists-map-info-close"
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onReset();
              }}
              aria-label="Close selected store"
            >
              x
            </button>
            <span>{selectedLocation.type}</span>
            <h3>{selectedLocation.name}</h3>
            <address>{selectedLocation.address}</address>
            <div className="stockists-map-info-actions">
              <a
                href={googleDirectionsUrl(selectedLocation)}
                rel="noopener noreferrer"
                target="_blank"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                Directions
              </a>
              <a
                href={selectedLocation.mapUrl}
                rel="noopener noreferrer"
                target="_blank"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                Open Google Maps
              </a>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onReset();
                }}
              >
                Show all stores
              </button>
            </div>
          </div>
        )}

        <div className="stockists-map-zoom" aria-label="Map zoom controls">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              zoomMap(1);
            }}
          >
            +
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              zoomMap(-1);
            }}
          >
            -
          </button>
        </div>

        {selectedLocation && (
          <button
            className="stockists-map-reset"
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onReset();
            }}
            aria-label="Show all stores on map"
          >
            <span aria-hidden="true">x</span>
            Show all
          </button>
        )}
        <p className="stockists-map-attribution">
          Map data OpenStreetMap contributors
        </p>
      </div>

      {!selectedLocation && (
        <div className="stockists-map-caption">
          <strong>Current stockists</strong>
          <small>West Vancouver, Burnaby, and Vancouver locations.</small>
        </div>
      )}
    </div>
  );
}
