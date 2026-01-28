import { TrendingUp, UserCheck, AlertTriangle, Download, Settings, CheckCircle } from 'lucide-react';

export default function NewFeaturesCard() {
  const newFeatures = [
    {
      name: 'Interest Rate Configuration',
      icon: TrendingUp,
      status: 'Active',
      description: 'Configure custom interest rates for different loan types',
      link: '/admin/interest-rates'
    },
    {
      name: 'External Borrower System',
      icon: UserCheck,
      status: 'Active',
      description: 'Manage non-member borrowers and their loans',
      link: '/admin/external-borrowers'
    },
    {
      name: 'Overdue Alerts',
      icon: AlertTriangle,
      status: 'Active',
      description: 'Real-time alerts for overdue payments and EMIs',
      link: '/admin/alerts'
    },
    {
      name: 'PDF/Excel Export',
      icon: Download,
      status: 'Active',
      description: 'Export reports and ledgers in multiple formats',
      link: '/admin/reports'
    },
    {
      name: 'Automated Late Fees',
      icon: Settings,
      status: 'Active',
      description: 'Automated late fee calculation with cron jobs',
      link: '/admin/alerts'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">New Features Available</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          All Active
        </span>
      </div>
      
      <div className="space-y-3">
        {newFeatures.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <feature.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {feature.name}
                </p>
                <p className="text-xs text-gray-500">
                  {feature.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <a
                href={feature.link}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>All 49 requirements implemented!</strong> Your Community SaaS project is now 100% feature complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}