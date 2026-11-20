import React, { useState } from 'react';
import {
  GitCompare,
  BarChart3,
  Scale,
  Users,
  Recycle,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import Panel from '../common/Panel';
import { TN_DISTRICTS_DIRECTORY } from '../../lib/districtData';
import { useData } from '../../context/DataContext';

export default function DistrictComparison() {
  const { getDistrictMetrics, calculateDistrictGreenScore } = useData();

  const [distA, setDistA] = useState('TN-CBE'); // Default Coimbatore
  const [distB, setDistB] = useState('TN-CHN'); // Default Chennai
  const [distC, setDistC] = useState('TN-MDU'); // Default Madurai

  const metricsA = getDistrictMetrics(distA);
  const metricsB = getDistrictMetrics(distB);
  const metricsC = getDistrictMetrics(distC);

  const scoreA = calculateDistrictGreenScore(distA);
  const scoreB = calculateDistrictGreenScore(distB);
  const scoreC = calculateDistrictGreenScore(distC);

  // Comparison Chart Data
  const chartData = [
    {
      metric: 'Verified Waste (kg)',
      [metricsA?.district.name || 'District A']: metricsA?.totalVerifiedWeight || 0,
      [metricsB?.district.name || 'District B']: metricsB?.totalVerifiedWeight || 0,
      [metricsC?.district.name || 'District C']: metricsC?.totalVerifiedWeight || 0
    },
    {
      metric: 'Recyclable (kg)',
      [metricsA?.district.name || 'District A']: metricsA?.totalRecyclableWeight || 0,
      [metricsB?.district.name || 'District B']: metricsB?.totalRecyclableWeight || 0,
      [metricsC?.district.name || 'District C']: metricsC?.totalRecyclableWeight || 0
    },
    {
      metric: 'Collection Hubs',
      [metricsA?.district.name || 'District A']: metricsA?.hubs.length || 0,
      [metricsB?.district.name || 'District B']: metricsB?.hubs.length || 0,
      [metricsC?.district.name || 'District C']: metricsC?.hubs.length || 0
    },
    {
      metric: 'Citizen Users',
      [metricsA?.district.name || 'District A']: metricsA?.citizenCount || 0,
      [metricsB?.district.name || 'District B']: metricsB?.citizenCount || 0,
      [metricsC?.district.name || 'District C']: metricsC?.citizenCount || 0
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* District Selectors Row */}
      <Panel title="Select Districts for Multi-Parameter Benchmark" Icon={GitCompare}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', display: 'block', marginBottom: '4px' }}>
              DISTRICT 1 (BENCHMARK)
            </label>
            <select
              value={distA}
              onChange={(e) => setDistA(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff', fontWeight: 600 }}
            >
              {TN_DISTRICTS_DIRECTORY.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code}) {d.isPilot ? '· Pilot' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', display: 'block', marginBottom: '4px' }}>
              DISTRICT 2 (COMPARISON)
            </label>
            <select
              value={distB}
              onChange={(e) => setDistB(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff', fontWeight: 600 }}
            >
              {TN_DISTRICTS_DIRECTORY.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code}) {d.isPilot ? '· Pilot' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '4px' }}>
              DISTRICT 3 (COMPARISON)
            </label>
            <select
              value={distC}
              onChange={(e) => setDistC(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff', fontWeight: 600 }}
            >
              {TN_DISTRICTS_DIRECTORY.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code}) {d.isPilot ? '· Pilot' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {/* Comparison Chart */}
      <Panel title="Side-by-Side Waste & Participation Metrics" Icon={BarChart3}>
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey={metricsA?.district.name || 'District A'} fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey={metricsB?.district.name || 'District B'} fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey={metricsC?.district.name || 'District C'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Detailed Side-by-Side Matrix Table */}
      <Panel title="Parametric Comparison Matrix" Icon={Layers}>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Comparison Indicator</th>
                <th>{metricsA?.district.name} ({metricsA?.district.code})</th>
                <th>{metricsB?.district.name} ({metricsB?.district.code})</th>
                <th>{metricsC?.district.name} ({metricsC?.district.code})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Administrative Zone</b></td>
                <td>{metricsA?.district.zone} Zone</td>
                <td>{metricsB?.district.zone} Zone</td>
                <td>{metricsC?.district.zone} Zone</td>
              </tr>
              <tr>
                <td><b>Data Integrity Status</b></td>
                <td>
                  <span className={`status ${metricsA?.dataStatus === 'verified_pilot' ? 'completed' : 'pending'}`}>
                    {metricsA?.dataStatus}
                  </span>
                </td>
                <td>
                  <span className={`status ${metricsB?.dataStatus === 'verified_pilot' ? 'completed' : 'pending'}`}>
                    {metricsB?.dataStatus}
                  </span>
                </td>
                <td>
                  <span className={`status ${metricsC?.dataStatus === 'verified_pilot' ? 'completed' : 'pending'}`}>
                    {metricsC?.dataStatus}
                  </span>
                </td>
              </tr>
              <tr>
                <td><b>Total Verified Waste (kg)</b></td>
                <td><b style={{ color: '#15803d' }}>{metricsA?.totalVerifiedWeight} kg</b></td>
                <td><b>{metricsB?.totalVerifiedWeight} kg</b></td>
                <td><b>{metricsC?.totalVerifiedWeight} kg</b></td>
              </tr>
              <tr>
                <td><b>Recycling Efficiency (%)</b></td>
                <td><b>{metricsA?.recyclingRatePct}%</b></td>
                <td><b>{metricsB?.recyclingRatePct}%</b></td>
                <td><b>{metricsC?.recyclingRatePct}%</b></td>
              </tr>
              <tr>
                <td><b>Active Collection Hubs</b></td>
                <td>{metricsA?.activeHubsCount} / {metricsA?.hubs.length}</td>
                <td>{metricsB?.activeHubsCount} / {metricsB?.hubs.length}</td>
                <td>{metricsC?.activeHubsCount} / {metricsC?.hubs.length}</td>
              </tr>
              <tr>
                <td><b>Registered Citizens</b></td>
                <td>{metricsA?.citizenCount} households</td>
                <td>{metricsB?.citizenCount} households</td>
                <td>{metricsC?.citizenCount} households</td>
              </tr>
              <tr>
                <td><b>Green Money Points Issued</b></td>
                <td><b style={{ color: '#15803d' }}>{metricsA?.pointsIssued.toLocaleString()} pts</b></td>
                <td><b>{metricsB?.pointsIssued.toLocaleString()} pts</b></td>
                <td><b>{metricsC?.pointsIssued.toLocaleString()} pts</b></td>
              </tr>
              <tr>
                <td><b>District Green Score</b></td>
                <td>
                  <b style={{ color: scoreA?.isSufficientData ? '#15803d' : '#94a3b8' }}>
                    {scoreA?.isSufficientData ? `${scoreA.totalScore}/100 (${scoreA.performanceLabel})` : 'Insufficient Data'}
                  </b>
                </td>
                <td>
                  <b style={{ color: scoreB?.isSufficientData ? '#15803d' : '#94a3b8' }}>
                    {scoreB?.isSufficientData ? `${scoreB.totalScore}/100 (${scoreB.performanceLabel})` : 'Insufficient Data'}
                  </b>
                </td>
                <td>
                  <b style={{ color: scoreC?.isSufficientData ? '#15803d' : '#94a3b8' }}>
                    {scoreC?.isSufficientData ? `${scoreC.totalScore}/100 (${scoreC.performanceLabel})` : 'Insufficient Data'}
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
