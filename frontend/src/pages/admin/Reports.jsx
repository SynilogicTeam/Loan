import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Users, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Toast from '../../components/ui/Toast';
import { makeAuthenticatedRequest } from '../../utils/auth';

export default function Reports() {
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [externalBorrowers, setExternalBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    communityId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch members
      const membersResponse = await makeAuthenticatedRequest('/api/members');
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
      }

      // Fetch sessions
      const sessionsResponse = await makeAuthenticatedRequest('/api/sessions'); // Changed from /sessions/all
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || sessionsData || []);
      }

      // Fetch external borrowers
      const borrowersResponse = await makeAuthenticatedRequest('/api/external-borrowers');
      if (borrowersResponse.ok) {
        const borrowersData = await borrowersResponse.json();
        setExternalBorrowers(borrowersData.borrowers || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type, format, id = null) => {
    setExporting(true);
    try {
      let url = '';
      let filename = '';

      switch (type) {
        case 'member-ledger':
          url = `/api/export/member-ledger/${id}/${format}`;
          filename = `member-ledger-${format}`;
          break;
        case 'session-summary':
          url = `/api/export/session-summary/${id}/${format}`;
          filename = `session-summary-${format}`;
          break;
        case 'interest-income':
          url = `/api/export/interest-income-report/${format}?startDate=${reportFilters.startDate}&endDate=${reportFilters.endDate}`;
          filename = `interest-income-report-${format}`;
          break;
        case 'external-borrower':
          url = `/api/export/external-borrower-ledger/${id}/${format}`;
          filename = `external-borrower-ledger-${format}`;
          break;
      }

      const response = await makeAuthenticatedRequest(url);

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${filename}-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        setToast({
          type: 'success',
          message: `${filename} exported successfully!`
        });
      } else {
        const error = await response.json();
        setToast({
          type: 'error',
          message: error.message || 'Export failed'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Export failed due to network error'
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Export"
        subtitle="Generate and export various reports in PDF and Excel formats"
        icon={Download}
      />

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Member Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Member Reports</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member for Ledger Export
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Choose a member...</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const select = document.querySelector('select');
                  const memberId = select.value;
                  if (memberId) {
                    exportReport('member-ledger', 'pdf', memberId);
                  } else {
                    setToast({ type: 'error', message: 'Please select a member' });
                  }
                }}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Session Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Session Reports</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Session for Summary Export
              </label>
              <select
                id="session-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a session...</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name} - {session.communityId?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const select = document.getElementById('session-select');
                  const sessionId = select.value;
                  if (sessionId) {
                    exportReport('session-summary', 'pdf', sessionId);
                  } else {
                    setToast({ type: 'error', message: 'Please select a session' });
                  }
                }}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Interest Income Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Interest Income Reports</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                if (reportFilters.startDate && reportFilters.endDate) {
                  exportReport('interest-income', 'pdf');
                } else {
                  setToast({ type: 'error', message: 'Please select start and end dates' });
                }
              }}
              disabled={exporting}
              className="flex items-center gap-2 w-full"
            >
              <FileText className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* External Borrower Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">External Borrower Reports</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select External Borrower for Ledger Export
              </label>
              <select
                id="borrower-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a borrower...</option>
                {externalBorrowers.map((borrower) => (
                  <option key={borrower._id} value={borrower._id}>
                    {borrower.name} - {borrower.email}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => {
                const select = document.getElementById('borrower-select');
                const borrowerId = select.value;
                if (borrowerId) {
                  exportReport('external-borrower', 'pdf', borrowerId);
                } else {
                  setToast({ type: 'error', message: 'Please select a borrower' });
                }
              }}
              disabled={exporting}
              className="flex items-center gap-2 w-full"
            >
              <FileText className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Export Status */}
      {exporting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800">Generating report... Please wait.</p>
          </div>
        </div>
      )}

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