import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../components/DataTable';
import ApiService from '../services/ApiService';

const TrainingSteps: React.FC = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('performance');
  const [trainingStepsData, setTrainingStepsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Load training steps data
  React.useEffect(() => {
    const loadTrainingSteps = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const stepsData = await ApiService.getTrainingSteps(userId);
        setTrainingStepsData(stepsData);
      } catch (error) {
        console.error('Failed to load training steps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingSteps();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/training" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Steps</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!trainingStepsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/training" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Steps Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">No training steps data found for user ID: {userId}</p>
        </div>
      </div>
    );
  }

  const { stepsData, timeData, summaryData, userName, courseCode } = trainingStepsData;

  const summaryColumns = [
    { key: 'stepNumber', label: 'Step' },
    { key: 'elapsedTime', label: 'Elapsed' },
    { key: 'expectedTime', label: 'Expected' },
    { key: 'errorSum', label: 'Errors' },
    { key: 'errorRate', label: 'Error %' },
    { 
      key: 'errorSummary', 
      label: 'Summary',
      render: (value: string) => (
        <span className="block truncate max-w-[120px]" title={value}>{value}</span>
      )
    },
    { key: 'successRate', label: 'Success %' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link 
          to="/training" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Training
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Steps</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          User: {userName} | Course: {courseCode}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Performance Graph
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'time'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Time Analysis
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Training Steps Performance
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stepsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" label={{ value: 'Step Number', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} name="Error Rate" />
                  <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} name="Success Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'time' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Elapsed vs Expected Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" label={{ value: 'Step Number', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="elapsedTime" stroke="#8b5cf6" strokeWidth={2} name="Elapsed Time" />
                  <Line type="monotone" dataKey="expectedTime" stroke="#06b6d4" strokeWidth={2} name="Expected Time" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary of Steps Conducted
        </h3>
        <DataTable columns={summaryColumns} data={summaryData} disableHover={true} />
      </div>
    </div>
  );
};

export default TrainingSteps;