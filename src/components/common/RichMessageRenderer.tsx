import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

interface ChatChartData {
  chart_type: string;
  title: string;
  items: ChartDataItem[];
  highlight_index?: number | null;
  unit?: string | null;
}

interface FormattedMessageTextProps {
  text: string;
}

const FormattedMessageText = ({ text }: FormattedMessageTextProps) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-base font-bold text-white mt-2 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith('| ')) {
          const cells = line.split('|').filter(c => c.trim());
          const isHeader = lines[i + 1]?.includes('---');
          const isSeparator = line.includes('---');
          if (isSeparator) return null;
          return (
            <div key={i} className={`flex gap-2 text-xs ${isHeader ? 'font-semibold text-slate-300 border-b border-slate-600 pb-1' : 'text-slate-400'}`}>
              {cells.map((cell, j) => (
                <span key={j} className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
              ))}
            </div>
          );
        }
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          const content = line.trim().replace(/^[•\-]\s*/, '');
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300 ml-2">
              <span className="text-cyan-400 mt-0.5 text-xs">▸</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }
        if (/^\d+\.\s/.test(line.trim())) {
          const match = line.trim().match(/^(\d+)\.\s*(.*)/);
          if (match) {
            return (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300 ml-2">
                <span className="text-cyan-400 font-mono text-xs mt-0.5 min-w-[16px]">{match[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(match[2]) }} />
              </div>
            );
          }
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
    </div>
  );
};

function formatInline(text: string): string {
  return text
    .replace(/\*\*`([^`]+)`\*\*/g, '<code class="bg-slate-700/50 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-bold">$1</code>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-700/50 text-cyan-300 px-1.5 py-0.5 rounded text-xs">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
}

const formatValue = (value: number, unit?: string | null): string => {
  if (unit === 'INR' || unit === '₹') {
    return `₹${value.toLocaleString('en-IN')}`;
  }
  if (unit === '%' || unit === 'priority') {
    return `${value}`;
  }
  if (unit === '/100') {
    return `${value}/100`;
  }
  if (unit === 'pts') {
    return `+${value}`;
  }
  if (value >= 1000) {
    return `₹${value.toLocaleString('en-IN')}`;
  }
  return `${value}`;
};

const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4'];

const StatCards = ({ chart }: { chart: ChatChartData }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
    {chart.items.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-center"
      >
        <div className="text-xs text-slate-400 mb-1">{item.label}</div>
        <div className="text-lg font-bold" style={{ color: item.color || '#fff' }}>
          {formatValue(item.value, chart.unit)}
        </div>
      </motion.div>
    ))}
  </div>
);

const GaugeChart = ({ chart }: { chart: ChatChartData }) => {
  const value = chart.items[0]?.value || 0;
  const maxVal = chart.unit === '/100' ? 100 : 100;
  const pct = Math.min((value / maxVal) * 100, 100);
  const color = value >= 80 ? '#ef4444' : value >= 60 ? '#f59e0b' : '#22c55e';

  return (
    <div className="mt-2 flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          <motion.path
            d="M10 55 A50 50 0 0 1 110 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pct / 100 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <text x="60" y="52" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
            {value}
          </text>
        </svg>
      </div>
      <div className="text-xs text-slate-400 mt-1">{chart.title}</div>
      {chart.items.length > 1 && (
        <div className="flex gap-4 mt-2 text-xs">
          {chart.items.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: item.color || CHART_COLORS[i] }} />
              <span className="text-slate-400">{item.label}: </span>
              <span className="text-white font-medium">{item.value}{chart.unit === '%' ? '%' : ''}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const BarChartComponent = ({ chart }: { chart: ChatChartData }) => {
  const data = chart.items.map((item, i) => ({
    name: item.label,
    value: item.value,
    fill: item.color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="mt-2">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(val: number) => [formatValue(val, chart.unit), '']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} opacity={chart.highlight_index != null && chart.highlight_index !== i ? 0.4 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const HorizontalBarChart = ({ chart }: { chart: ChatChartData }) => {
  const data = chart.items.map((item, i) => ({
    name: item.label,
    value: item.value,
    fill: item.color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="mt-2">
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            formatter={(val: number) => [formatValue(val, chart.unit), '']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} opacity={chart.highlight_index != null && chart.highlight_index !== i ? 0.4 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const PieChartComponent = ({ chart }: { chart: ChatChartData }) => {
  const data = chart.items.map((item, i) => ({
    name: item.label,
    value: item.value,
    fill: item.color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="mt-2">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            formatter={(val: number) => [formatValue(val, chart.unit), '']}
          />
          <Legend
            verticalAlign="bottom"
            iconSize={8}
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChartBlock = ({ chart, index }: { chart: ChatChartData; index: number }) => {
  const renderChart = () => {
    switch (chart.chart_type) {
      case 'stat_cards':
        return <StatCards chart={chart} />;
      case 'gauge':
      case 'risk_meter':
        return <GaugeChart chart={chart} />;
      case 'bar':
        return <BarChartComponent chart={chart} />;
      case 'horizontal_bar':
        return <HorizontalBarChart chart={chart} />;
      case 'pie':
        return <PieChartComponent chart={chart} />;
      default:
        return <BarChartComponent chart={chart} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
      className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 mt-3"
    >
      <div className="text-xs font-semibold text-cyan-400 mb-1 uppercase tracking-wider">{chart.title}</div>
      {renderChart()}
    </motion.div>
  );
};

interface RichMessageRendererProps {
  text: string;
  charts?: ChatChartData[];
}

const RichMessageRenderer = ({ text, charts }: RichMessageRendererProps) => {
  return (
    <div>
      <FormattedMessageText text={text} />
      {charts && charts.length > 0 && (
        <div className="mt-2">
          {charts.map((chart, i) => (
            <ChartBlock key={i} chart={chart} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RichMessageRenderer;
export type { ChatChartData, ChartDataItem };
