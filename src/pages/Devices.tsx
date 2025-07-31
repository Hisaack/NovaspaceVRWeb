import React, { useState } from 'react';
import { Monitor, MapPin, HardDrive, Cpu, Shield, ShieldOff, Trash2, Wifi, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'unblock' | 'remove'>('block');

  // Load devices on component mount
  React.useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const userId = AuthService.getUserId();
        const devicesData = await ApiService.getDevices(userId);
        setDevices(devicesData);
      } catch (error) {
        console.error('Failed to load devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  const getBrandImage = (brand: string, model: string) => {
    const brandImages = {
      'Quest 3': '/metaquest3.png',
      'Quest 3S': '/metaquest3s.png',
      'Quest 2': '/quest2.png'
    };
    return brandImages[model as keyof typeof brandImages] || '/metaquest3.png';
  };

  const handleDeviceClick = (device: any) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
  };

  const handleDeviceAction = (action: 'block' | 'unblock' | 'remove') => {
    setActionType(action);
    setShowConfirmModal(true);
  };

  const executeAction = () => {
    if (!selectedDevice) return;
    
    const executeDeviceAction = async () => {
      try {
        if (actionType === 'remove') {
          await ApiService.deleteDevice(selectedDevice.id);
        } else {
          const newStatus = actionType === 'block' ? 'Blocked' : 'Active';
          await ApiService.updateDevice(selectedDevice.id, { status: newStatus });
        }
        
        // Refresh devices list
        const devicesData = await ApiService.getDevices();
        setDevices(devicesData);
        
        setShowConfirmModal(false);
        setShowDeviceModal(false);
        setSelectedDevice(null);
      } catch (error) {
        console.error('Failed to execute device action:', error);
      }
    };

    executeDeviceAction();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Devices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Devices</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage VR devices connected to your account</p>
      </div>

      {/* Devices Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connected VR Devices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Click on any device card to manage access controls
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => handleDeviceClick(device)}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* Device Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={getBrandImage(device.brand, device.model)} 
                    alt={device.brand}
                    className="w-16 h-12 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                      {device.deviceName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{device.brand} {device.model}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    device.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {/* Device Info Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Location</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={`${device.city}, ${device.country}`}>
                      {device.city}, {device.country}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">RAM</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{device.ram}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Storage</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{device.storage}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Last Seen</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[80px]" title={device.lastSeen}>{device.lastSeen}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">User ID</span>
                    </div>
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{device.userId}</span>
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 truncate">
                    Click to manage device →
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Management Modal */}
      <Modal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        title="Device Management"
        size="lg"
      >
        {selectedDevice && (
          <div className="space-y-6">
            {/* Device Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <img 
                src={getBrandImage(selectedDevice.brand, selectedDevice.model)} 
                alt={selectedDevice.brand}
                className="w-16 h-12 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedDevice.deviceName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Device ID: {selectedDevice.id}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedDevice.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {selectedDevice.status}
                </span>
              </div>
            </div>

            {/* Device Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Brand & Model</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.brand} {selectedDevice.model}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.city}, {selectedDevice.country}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">User ID</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.userId}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">OS Version</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.osVersion}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Specifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.ram} RAM, {selectedDevice.storage}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Last Seen</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDevice.lastSeen}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {selectedDevice.status === 'Active' ? (
                <button
                  onClick={() => handleDeviceAction('block')}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Block Device
                </button>
              ) : (
                <button
                  onClick={() => handleDeviceAction('unblock')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Unblock Device
                </button>
              )}
              <button
                onClick={() => handleDeviceAction('remove')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Device
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Device`}
        footer={
          <>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={executeAction}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
                actionType === 'remove' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : actionType === 'block'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </button>
          </>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to {actionType} the device <strong>"{selectedDevice?.deviceName}"</strong>?
        </p>
        {actionType === 'remove' && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            This action cannot be undone and will permanently remove the device from your account.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Devices;