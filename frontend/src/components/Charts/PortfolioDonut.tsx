import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PortfolioItem {
  name: string;
  value: number;
  color: string;
}

interface PortfolioDonutProps {
  data: PortfolioItem[];
  height?: number;
}

const PortfolioDonut: React.FC<PortfolioDonutProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius="55%"
        outerRadius="80%"
        paddingAngle={3}
        dataKey="value"
        nameKey="name"
      >
        {data.map((entry, index) => (
          <Cell key={index} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          background: '#1E2329',
          border: '1px solid #2B3139',
          borderRadius: 8,
          color: '#EAECEF',
        }}
        formatter={(value) => `$${Number(value).toLocaleString()}`}
      />
      <Legend
        wrapperStyle={{ color: '#848E9C', fontSize: 12 }}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default PortfolioDonut;
