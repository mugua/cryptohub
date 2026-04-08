import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface PriceChartProps {
  data: { time: string; price: number }[];
  color?: string;
  height?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  color = '#F0B90B',
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
      <XAxis dataKey="time" stroke="#848E9C" fontSize={12} />
      <YAxis stroke="#848E9C" fontSize={12} domain={['auto', 'auto']} />
      <Tooltip
        contentStyle={{
          background: '#1E2329',
          border: '1px solid #2B3139',
          borderRadius: 8,
          color: '#EAECEF',
        }}
      />
      <Line
        type="monotone"
        dataKey="price"
        stroke={color}
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

export default PriceChart;
