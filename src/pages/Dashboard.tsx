import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = React.useState<any>({
    metrics: null,
    improvementData: [],
    recentTrainees: []
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const userId = AuthService.getUserId();
        const [metrics, improvementData, recentTrainees] = await Promise.all([
          ApiService.getDashboardMetrics(userId),
          ApiService.getImprovementData(),
          ApiService.getRecentTrainees(5)
        ]);

        setDashboardData({
          metrics,
          improvementData,
          recentTrainees
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'userCode', label: 'User Code' },
    { key: 'trainedTime', label: 'Trained Time' },
    { key: 'elapsedTime', label: 'Elapsed Time' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const { metrics, improvementData, recentTrainees } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to Nova Space VR Training System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Trained Students"
          value={metrics?.trainedStudents?.toLocaleString() || '0'}
          icon={Users}
          trend={metrics?.trainedStudentsTrend || { value: 0, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Courses Available"
          value={metrics?.coursesAvailable?.toString() || '0'}
          icon={BookOpen}
          trend={metrics?.coursesAvailableTrend || { value: 0, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Graduated Students"
          value={metrics?.graduatedStudents?.toLocaleString() || '0'}
          icon={GraduationCap}
          trend={metrics?.graduatedStudentsTrend || { value: 0, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Virtual Users Telemetry"
          value={metrics?.virtualUsersTelemetry?.toLocaleString() || '0'}
          icon={Activity}
          trend={metrics?.virtualUsersTelemetryTrend || { value: 0, isPositive: true }}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Improvement Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={improvementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="improvement" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Error Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={improvementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trainees Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Trainees (Top 10)</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <DataTable columns={columns} data={recentTrainees} searchable={false} />
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Link
              to="/training"
              className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
            >
              Show more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;