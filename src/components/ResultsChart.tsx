import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { ProposalResults } from '@/types';

interface ResultsChartProps {
  results: ProposalResults;
  proposalTitle: string;
}

export function ResultsChart({ results, proposalTitle }: ResultsChartProps) {
  const pieData = [
    { name: 'Yes', value: results.yesVotes, color: '#22c55e' },
    { name: 'No', value: results.noVotes, color: '#ef4444' },
  ];

  const barData = [
    {
      name: 'Votes',
      Yes: results.yesVotes,
      No: results.noVotes,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-white/20">
          <p className="text-white font-medium">{`${payload[0].name}: ${payload[0].value} votes`}</p>
          <p className="text-white/60">{`${((payload[0].value / results.totalVotes) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (results.totalVotes === 0) {
    return (
      <div className="card text-center py-12">
        <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Votes Yet</h3>
        <p className="text-white/60">Be the first to cast your vote on this proposal!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{results.totalVotes}</div>
              <div className="text-white/60">Total Votes</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-success-400">{results.yesVotes}</div>
              <div className="text-white/60">Yes Votes ({results.yesPercentage}%)</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger-500/20 rounded-lg">
              <XCircle className="w-6 h-6 text-danger-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-danger-400">{results.noVotes}</div>
              <div className="text-white/60">No Votes ({results.noPercentage}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Vote Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Vote Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Yes" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="No" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Results</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-success-500/10 border border-success-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-400" />
              <span className="font-medium text-success-300">Support (Yes)</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-success-400">{results.yesVotes}</div>
              <div className="text-sm text-success-300">{results.yesPercentage}% of total</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-danger-400" />
              <span className="font-medium text-danger-300">Opposition (No)</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-danger-400">{results.noVotes}</div>
              <div className="text-sm text-danger-300">{results.noPercentage}% of total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
