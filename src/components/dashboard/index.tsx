import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Users, 
  UserCheck, 
  Store, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '../../reducers/store';
import { BASE_URL } from '../../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MonthlyData {
  year: number;
  month: number;
  total: number;
  verified: number;
}

interface DashboardData {
  farmers: MonthlyData[];
  posUsers: MonthlyData[];
}

interface DashboardStats {
  totalFarmers: number;
  verifiedFarmers: number;
  totalPOS: number;
  verifiedPOS: number;
  farmerVerificationRate: number;
  posVerificationRate: number;
}

const Dashboard: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!token) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}api/admin/get-dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status_code === 200) {
        const data = response.data.data;
        setDashboardData(data);
        calculateStats(data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate statistics
  const calculateStats = (data: DashboardData) => {
    const totalFarmers = data.farmers.reduce((sum, item) => sum + item.total, 0);
    const verifiedFarmers = data.farmers.reduce((sum, item) => sum + item.verified, 0);
    const totalPOS = data.posUsers.reduce((sum, item) => sum + item.total, 0);
    const verifiedPOS = data.posUsers.reduce((sum, item) => sum + item.verified, 0);

    const farmerVerificationRate = totalFarmers > 0 ? (verifiedFarmers / totalFarmers) * 100 : 0;
    const posVerificationRate = totalPOS > 0 ? (verifiedPOS / totalPOS) * 100 : 0;

    setStats({
      totalFarmers,
      verifiedFarmers,
      totalPOS,
      verifiedPOS,
      farmerVerificationRate,
      posVerificationRate
    });
  };

  // Transform data for charts
  const transformDataForCharts = () => {
    if (!dashboardData) return null;

    const getMonthName = (month: number) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[month - 1];
    };

    const labels = dashboardData.farmers.map(item => `${getMonthName(item.month)} ${item.year}`);

    // Line chart data for trends
    const trendData = {
      labels,
      datasets: [
        {
          label: 'Total Farmers',
          data: dashboardData.farmers.map(item => item.total),
          borderColor: '#01A63C',
          backgroundColor: 'rgba(1, 166, 60, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Verified Farmers',
          data: dashboardData.farmers.map(item => item.verified),
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Total POS',
          data: dashboardData.posUsers.map(item => item.total),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Verified POS',
          data: dashboardData.posUsers.map(item => item.verified),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };

    // Bar chart data for comparison
    const comparisonData = {
      labels,
      datasets: [
        {
          label: 'Farmers',
          data: dashboardData.farmers.map(item => item.total),
          backgroundColor: '#01A63C',
          borderRadius: 6,
        },
        {
          label: 'POS Users',
          data: dashboardData.posUsers.map(item => item.total),
          backgroundColor: '#3B82F6',
          borderRadius: 6,
        }
      ]
    };

    return { trendData, comparisonData };
  };

  const chartData = transformDataForCharts();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Verification rate doughnut charts
  const farmerVerificationData = stats ? {
    labels: ['Verified', 'Unverified'],
    datasets: [{
      data: [stats.verifiedFarmers, stats.totalFarmers - stats.verifiedFarmers],
      backgroundColor: ['#22C55E', '#EF4444'],
      borderWidth: 0,
    }]
  } : null;

  const posVerificationData = stats ? {
    labels: ['Verified', 'Unverified'],
    datasets: [{
      data: [stats.verifiedPOS, stats.totalPOS - stats.verifiedPOS],
      backgroundColor: ['#8B5CF6', '#F97316'],
      borderWidth: 0,
    }]
  } : null;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01A63C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#01A63C] rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-600">
          Overview of farmers and POS management statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Farmers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#01A63C]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#01A63C] text-white">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Farmers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalFarmers.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Farmers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified Farmers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.verifiedFarmers.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 font-medium">
                {stats?.farmerVerificationRate.toFixed(1)}% verified
              </p>
            </div>
          </div>
        </div>

        {/* Total POS */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Store className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total POS</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalPOS.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Verified POS */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified POS</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.verifiedPOS.toLocaleString() || 0}
              </p>
              <p className="text-sm text-purple-600 font-medium">
                {stats?.posVerificationRate.toFixed(1)}% verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[#01A63C]" />
            <h3 className="text-lg font-semibold text-gray-900">Growth Trends</h3>
          </div>
          <div className="h-80">
            {chartData?.trendData && (
              <Line data={chartData.trendData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-[#01A63C]" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Comparison</h3>
          </div>
          <div className="h-80">
            {chartData?.comparisonData && (
              <Bar data={chartData.comparisonData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Verification Status Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Farmer Verification Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 col-span-1 md:col-span-1 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-5 h-5 text-[#01A63C]" />
            <h3 className="text-lg font-semibold text-gray-900">Farmer Verification Status</h3>
          </div>
          <div className="h-64">
            {farmerVerificationData && (
              <Doughnut data={farmerVerificationData} options={doughnutOptions} />
            )}
          </div>
        </div>

        {/* POS Verification Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 col-span-1 md:col-span-1 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-5 h-5 text-[#01A63C]" />
            <h3 className="text-lg font-semibold text-gray-900">POS Verification Status</h3>
          </div>
          <div className="h-64">
            {posVerificationData && (
              <Doughnut data={posVerificationData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#01A63C]" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Farmers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified Farmers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total POS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified POS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.farmers.map((farmerData, index) => {
                const posData = dashboardData.posUsers[index];
                const monthName = new Date(farmerData.year, farmerData.month - 1).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                });
                
                const prevFarmerData = dashboardData.farmers[index - 1];
                const growthRate = prevFarmerData ? 
                  (((farmerData.total - prevFarmerData.total) / prevFarmerData.total) * 100).toFixed(1) : 
                  'N/A';

                return (
                  <tr key={`${farmerData.year}-${farmerData.month}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {farmerData.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center gap-1">
                        {farmerData.verified.toLocaleString()}
                        <span className="text-xs text-green-600 font-medium">
                          ({((farmerData.verified / farmerData.total) * 100).toFixed(1)}%)
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {posData?.total.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center gap-1">
                        {posData?.verified.toLocaleString() || 0}
                        <span className="text-xs text-purple-600 font-medium">
                          ({posData && posData.total > 0 ? ((posData.verified / posData.total) * 100).toFixed(1) : '0'}%)
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {growthRate !== 'N/A' ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          parseFloat(growthRate) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parseFloat(growthRate) >= 0 ? '+' : ''}{growthRate}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-[#01A63C] to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Manage Farmers</h4>
              <p className="text-green-100 text-sm mt-1">View and manage farmer accounts</p>
            </div>
            <Users className="h-8 w-8 text-green-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Manage POS</h4>
              <p className="text-blue-100 text-sm mt-1">View and manage POS locations</p>
            </div>
            <Store className="h-8 w-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Analytics</h4>
              <p className="text-purple-100 text-sm mt-1">Detailed reports and insights</p>
            </div>
            <Activity className="h-8 w-8 text-purple-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
