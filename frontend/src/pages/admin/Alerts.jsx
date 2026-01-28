import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock, Phone, Mail, User } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function Alerts() {
  const [alerts, setAlerts] = useState({
    summary: {},
    alerts: { HIGH: [], MEDIUM: [], LOW: [] },
    allAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/alerts/overdue');
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLateFees = async () => {
    setUpdating(true);
    try {
      const response = await makeAuthenticatedRequest('/api/alerts/update-late-fees', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setToast({
          type: 'success',
          message: `Late fees updated! ${data.totalUpdated} EMIs processed.`
        });
        fetchAlerts(); // Refresh alerts
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to update late fees'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overdue Alerts"
        subtitle="Monitor and manage overdue payments and EMIs"
        icon={AlertTriangle}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alerts.summary.totalOverdue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">H</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-red-600">
                {alerts.summary.highPriority || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">M</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Medium Priority</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {alerts.summary.mediumPriority || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">L</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Priority</p>
              <p className="text-2xl font-semibold text-blue-600">
                {alerts.summary.lowPriority || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overdue Amount</h3>
          <div className="text-3xl font-bold text-red-600">
            ₹{alerts.summary.totalOverdueAmount?.toLocaleString() || '0'}
          </div>
          <p className="text-sm text-gray-500 mt-2">Total amount overdue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Late Fee Income</h3>
          <div className="text-3xl font-bold text-green-600">
            ₹{alerts.summary.totalLateFee?.toLocaleString() || '0'}
          </div>
          <p className="text-sm text-gray-500 mt-2">Total late fee collected</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchAlerts}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={updateLateFees}
            disabled={updating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Updating...' : 'Update Late Fees'}
          </Button>
        </div>
      </div>

      {/* Alerts by Priority */}
      {['HIGH', 'MEDIUM', 'LOW'].map((priority) => (
        <div key={priority} className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`px-6 py-4 border-b ${
            priority === 'HIGH' ? 'bg-red-50 border-red-200' :
            priority === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`text-lg font-medium ${
              priority === 'HIGH' ? 'text-red-800' :
              priority === 'MEDIUM' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {priority} Priority Alerts ({alerts.alerts[priority]?.length || 0})
            </h3>
          </div>

          {alerts.alerts[priority]?.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No {priority.toLowerCase()} priority alerts
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Overdue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.alerts[priority]?.map((alert, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {alert.memberName || alert.borrowerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {alert.type === 'MEMBER_EMI' ? 'Member' : 'External Borrower'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {alert.memberPhone || alert.borrowerPhone ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="w-3 h-3 mr-1" />
                              {alert.memberPhone || alert.borrowerPhone}
                            </div>
                          ) : null}
                          {alert.memberEmail || alert.borrowerEmail ? (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              {alert.memberEmail || alert.borrowerEmail}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(alert.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{alert.amount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          ₹{alert.lateFee?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                          {alert.daysOverdue} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}