import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Filter, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Info,
  Maximize2
} from 'lucide-react';
import L from 'leaflet';
import { Grievance, GrievanceCategory } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface InteractiveMapProps {
  language: Language;
  onSelectGrievance: (grievance: Grievance) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  language,
  onSelectGrievance
}) => {
  const t = translations[language];
  const grievances = store.grievances;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // Complaints with valid coordinates
  const mappedGrievances = grievances.filter(g => {
    if (g.latitude === undefined || g.longitude === undefined) return false;
    if (activeCategory !== 'all' && g.category !== activeCategory) return false;
    if (activeStatus !== 'all' && g.status !== activeStatus) return false;
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map centered at Tiruchirappalli City Corporation & District
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.8050, 78.6950],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers for grievances
    mappedGrievances.forEach(g => {
      if (g.latitude && g.longitude) {
        // Custom color marker based on status
        const isClosed = g.status === 'Closed';
        const isEscalated = g.isEscalated;
        const color = isClosed ? '#10b981' : isEscalated ? '#ef4444' : '#0284c7';

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([g.latitude, g.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedGrievance(g);
        });

        markersRef.current.push(marker);
      }
    });

    return () => {
      // cleanup on unmount
    };
  }, [mappedGrievances]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>{language === 'ta' ? 'புவியியல் வரைபடம்' : 'District Spatial GIS View'}</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {language === 'ta' ? 'திருச்சிராப்பள்ளி மாநகராட்சி & மாவட்ட கள வரைபடம்' : 'Tiruchirappalli City Corporation & District GIS Map'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'ta'
              ? 'திருச்சி மாநகராட்சி 5 மண்டலங்கள் (ஸ்ரீரங்கம், அரியமங்கலம், பொன்மலை, கே.அபிஷேகபுரம், கோட்டை) மற்றும் வட்ட எல்லைகளில் உள்ள பொதுக் குறைகள்.'
              : 'Interactive spatial overview across Tiruchirappalli City Corporation (Zones 1-5) and district taluk boundaries.'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white" />
            <span className="text-slate-300">Closed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600 inline-block border border-white" />
            <span className="text-slate-300">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block border border-white" />
            <span className="text-slate-300">Escalated</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="roads">{t.cat_roads}</option>
              <option value="drinking_water">{t.cat_drinking_water}</option>
              <option value="sanitation">{t.cat_sanitation}</option>
              <option value="streetlights">{t.cat_streetlights}</option>
              <option value="waste_management">{t.cat_waste_management}</option>
              <option value="drainage">{t.cat_drainage}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={activeStatus}
              onChange={e => setActiveStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="Closed">Closed</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolution Submitted">Resolution Submitted</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 text-xs font-mono">
          Showing {mappedGrievances.length} mapped incidents
        </div>
      </div>

      {/* Map View & Active Pin Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs h-[520px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Selected Complaint Sidebar Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between text-xs space-y-4">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider mb-2">
              Selected Map Location
            </span>

            {selectedGrievance ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedGrievance.referenceNumber}
                  </span>
                  <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                    {selectedGrievance.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {language === 'ta' && selectedGrievance.titleTa ? selectedGrievance.titleTa : selectedGrievance.title}
                </h3>

                <p className="text-slate-600 leading-relaxed text-xs">
                  {language === 'ta' && selectedGrievance.descriptionTa ? selectedGrievance.descriptionTa : selectedGrievance.description}
                </p>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div><strong>Locality:</strong> {selectedGrievance.locality}, {selectedGrievance.taluk}</div>
                  <div><strong>Coordinates:</strong> {selectedGrievance.latitude}, {selectedGrievance.longitude}</div>
                  <div><strong>Priority:</strong> {selectedGrievance.priority}</div>
                </div>

                <button
                  onClick={() => onSelectGrievance(selectedGrievance)}
                  className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs text-center transition-colors"
                >
                  View Full Case Dossier →
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                <p>Click on any map pin to inspect public coordinates, complaint status, and field updates.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed">
            <strong>Privacy Note:</strong> Coordinates are collected only with citizen consent. Residential house numbers are sanitized in the public GIS visualization.
          </div>
        </div>
      </div>
    </div>
  );
};
