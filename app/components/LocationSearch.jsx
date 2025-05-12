'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const LocationSearch = ({ onLocationSelect, useAdvancedMarker = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
        version: 'weekly',
        libraries: ['places', 'marker']
      });

      try {
        const google = await loader.load();
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심 좌표
          zoom: 13,
          mapId: 'DEMO_MAP_ID'
        });

        // 정보창 초기화
        const infoWindowInstance = new google.maps.InfoWindow();
        setInfoWindow(infoWindowInstance);

        const searchBox = new google.maps.places.SearchBox(searchBoxRef.current);
        
        mapInstance.addListener('bounds_changed', () => {
          searchBox.setBounds(mapInstance.getBounds());
        });

        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();

          if (places.length === 0) {
            return;
          }

          const place = places[0];
          if (!place.geometry || !place.geometry.location) {
            return;
          }

          setSelectedPlace(place);

          // 기존 마커 제거
          if (marker) {
            marker.setMap(null);
          }

          // 마커 정보
          const markerPosition = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          // 마커 콘텐츠
          const markerContent = `
            <div style="padding: 10px; max-width: 300px; word-wrap: break-word;">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${place.name}</h3>
              <p style="margin: 0; color: #555;">${place.formatted_address}</p>
            </div>
          `;

          let newMarker;

          if (useAdvancedMarker && google.maps.marker) {
            // AdvancedMarkerElement 사용 (Google Maps API v3.53 이상 필요)
            const markerView = new google.maps.marker.AdvancedMarkerView({
              map: mapInstance,
              position: markerPosition,
              title: place.name,
            });

            markerView.addListener('click', () => {
              infoWindowInstance.setContent(markerContent);
              infoWindowInstance.open(mapInstance, markerView);
            });

            newMarker = markerView;
          } else {
            // 기본 Marker 사용
            newMarker = new google.maps.Marker({
              map: mapInstance,
              position: markerPosition,
              title: place.name,
              animation: google.maps.Animation.DROP
            });

            newMarker.addListener('click', () => {
              infoWindowInstance.setContent(markerContent);
              infoWindowInstance.open(mapInstance, newMarker);
            });
          }

          // 지도 중심 이동
          mapInstance.setCenter(markerPosition);
          mapInstance.setZoom(17);

          // 마커 저장
          setMarker(newMarker);
          setMap(mapInstance);

          // 정보창 표시 명시적 처리
          setTimeout(() => {
            infoWindowInstance.setContent(markerContent);
            infoWindowInstance.open(mapInstance, newMarker);
          }, 100);

          // 선택된 위치 정보 전달
          onLocationSelect({
            name: place.name,
            address: place.formatted_address,
            lat: markerPosition.lat,
            lng: markerPosition.lng
          });
        });

        setMap(mapInstance);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [onLocationSelect, useAdvancedMarker]);

  return (
    <div className="w-full">
      <input
        id="location-search-input"
        ref={searchBoxRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="위치를 검색하세요"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg mb-4"
      />
      {selectedPlace && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-semibold text-blue-800">{selectedPlace.name}</h4>
          <p className="text-sm text-gray-700">{selectedPlace.formatted_address}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch; 