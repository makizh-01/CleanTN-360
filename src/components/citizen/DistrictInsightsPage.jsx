import React, { useState } from 'react';
import {
  MapPin,
  Recycle,
  Wallet,
  Users,
  Target,
  ChartNoAxesColumn,
  CircleAlert,
  GitCompare,
  Layers,
  Globe2,
  Award
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import TamilNaduGISMap from '../common/TamilNaduGISMap';
import DistrictDirectory from '../district/DistrictDirectory';
import DistrictDetailDashboard from '../district/DistrictDetailDashboard';
import DistrictComparison from '../district/DistrictComparison';
import { useData } from '../../context/DataContext';

export default function DistrictInsightsPage({ notify }) {
  const { deposits, collectionPoints } = useData();

  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'directory' | 'comparison'
  const [inspectedDistrict, setInspectedDistrict] = useState(null); // When set, renders DistrictDetailDashboard

  // Aggregated platform metrics
  const totalVerifiedKg = deposits
    .filter((d) => d.status === 'admin_approved')
    .reduce((sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0);

  const totalPointsDistributed = deposits
    .filter((d) => d.status === 'admin_approved')
    .reduce((sum, d) => sum + (Number(d.approved_points) || 0), 0);

  return (
    <>
      <Banner
        kicker="38 DISTRICTS · SMART GIS INTELLIGENCE · PHASE 4"
        title="Tamil Nadu District Insights & Smart Waste Intelligence."
        desc="Explore geospatial collection point mapping, 38-district master directory, district performance benchmarks, and transparent environmental accounting."
      />

      <div className="stats four">
        <Stat
          Icon={Recycle}
          label="Verified Waste Collected"
          value={`${totalVerifiedKg.toFixed(2)} kg`}
        />
        <Stat
          Icon={Wallet}
          label="Green Points Disbursed"
          value={totalPointsDistributed.toLocaleString()}
          tone="purple"
        />
        <Stat
          Icon={Users}
          label="Active Participating Households"
          value={new Set(deposits.map((d) => d.citizen_id || d.citizen_name)).size}
          tone="amber"
        />
        <Stat
          Icon={Globe2}
          label="Districts Governed"
          value="38 Districts"
          tone="blue"
        />
      </div>

      {inspectedDistrict ? (
        /* Detailed Individual District Dashboard Drill-down */
        <DistrictDetailDashboard
          districtCode={inspectedDistrict.code}
          onBack={() => setInspectedDistrict(null)}
          notify={notify}
        />
      ) : (
        <>
          {/* Sub-Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                border: activeTab === 'map' ? '2px solid #15803d' : '1px solid #e2e8f0',
                background: activeTab === 'map' ? '#f0fdf4' : '#fff',
                color: activeTab === 'map' ? '#15803d' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MapPin size={14} /> Interactive Tamil Nadu GIS Map
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                border: activeTab === 'directory' ? '2px solid #15803d' : '1px solid #e2e8f0',
                background: activeTab === 'directory' ? '#f0fdf4' : '#fff',
                color: activeTab === 'directory' ? '#15803d' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Globe2 size={14} /> 38-District Master Directory
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                border: activeTab === 'comparison' ? '2px solid #15803d' : '1px solid #e2e8f0',
                background: activeTab === 'comparison' ? '#f0fdf4' : '#fff',
                color: activeTab === 'comparison' ? '#15803d' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <GitCompare size={14} /> Multi-District Benchmark
            </button>
          </div>

          {activeTab === 'map' && (
            <TamilNaduGISMap
              onSelectDistrict={(dist) => setInspectedDistrict(dist)}
            />
          )}

          {activeTab === 'directory' && (
            <DistrictDirectory
              onSelectDistrict={(dist) => setInspectedDistrict(dist)}
            />
          )}

          {activeTab === 'comparison' && (
            <DistrictComparison />
          )}
        </>
      )}
    </>
  );
}
