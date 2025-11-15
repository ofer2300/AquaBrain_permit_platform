import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  FolderOpen,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  AlertCircle
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'completed' | 'pending' | 'archived' | 'under_review';
  createdAt: string;
}

interface Submission {
  id: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  result: 'pass' | 'fail' | 'pending';
  submittedAt: string;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  change?: string;
}

interface MonthlyData {
  month: string;
  submissions: number;
  approved: number;
  rejected: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  date: string;
  value: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'מתחם מגורים חדש - רמת אביב',
            city: 'תל אביב',
            status: 'active',
            createdAt: '2025-11-10T10:30:00Z'
          },
          {
            id: '2',
            name: 'בניין משרדים - פארק הייטק',
            city: 'הרצליה',
            status: 'active',
            createdAt: '2025-11-08T14:20:00Z'
          },
          {
            id: '3',
            name: 'מרכז מסחרי - עזריאלי',
            city: 'תל אביב',
            status: 'completed',
            createdAt: '2025-11-05T09:15:00Z'
          },
          {
            id: '4',
            name: 'פרויקט תשתית - כביש 6',
            city: 'נתניה',
            status: 'under_review',
            createdAt: '2025-11-03T16:45:00Z'
          },
          {
            id: '5',
            name: 'מגדל מגורים - נווה צדק',
            city: 'תל אביב',
            status: 'pending',
            createdAt: '2025-11-01T11:00:00Z'
          }
        ];

        const mockSubmissions: Submission[] = [
          {
            id: 's1',
            projectId: '1',
            projectName: 'מתחם מגורים חדש - רמת אביב',
            status: 'approved',
            result: 'pass',
            submittedAt: '2025-11-11T08:30:00Z'
          },
          {
            id: 's2',
            projectId: '2',
            projectName: 'בניין משרדים - פארק הייטק',
            status: 'under_review',
            result: 'pending',
            submittedAt: '2025-11-10T15:20:00Z'
          },
          {
            id: 's3',
            projectId: '3',
            projectName: 'מרכז מסחרי - עזריאלי',
            status: 'approved',
            result: 'pass',
            submittedAt: '2025-11-09T10:15:00Z'
          },
          {
            id: 's4',
            projectId: '1',
            projectName: 'מתחם מגורים חדש - רמת אביב',
            status: 'rejected',
            result: 'fail',
            submittedAt: '2025-11-08T14:45:00Z'
          },
          {
            id: 's5',
            projectId: '4',
            projectName: 'פרויקט תשתית - כביש 6',
            status: 'approved',
            result: 'pass',
            submittedAt: '2025-11-07T09:30:00Z'
          }
        ];

        const mockMonthlyData: MonthlyData[] = [
          { month: 'יוני', submissions: 45, approved: 32, rejected: 13 },
          { month: 'יולי', submissions: 52, approved: 38, rejected: 14 },
          { month: 'אוגוסט', submissions: 48, approved: 35, rejected: 13 },
          { month: 'ספטמבר', submissions: 61, approved: 45, rejected: 16 },
          { month: 'אוקטובר', submissions: 58, approved: 43, rejected: 15 },
          { month: 'נובמבר', submissions: 67, approved: 52, rejected: 15 }
        ];

        const totalSubmissions = mockSubmissions.length * 20;
        const passedSubmissions = mockSubmissions.filter(s => s.result === 'pass').length * 20;
        const failedSubmissions = mockSubmissions.filter(s => s.result === 'fail').length * 20;
        const passRate = Math.round((passedSubmissions / totalSubmissions) * 100);
        const failRate = Math.round((failedSubmissions / totalSubmissions) * 100);

        const mockPieData: PieData[] = [
          { name: 'עבר בהצלחה', value: passedSubmissions, color: '#10b981' },
          { name: 'נכשל', value: failedSubmissions, color: '#ef4444' },
          { name: 'בהמתנה', value: 20, color: '#f59e0b' }
        ];

        const mockTrendData: TrendData[] = [
          { date: '01/06', value: 45 },
          { date: '08/06', value: 48 },
          { date: '15/06', value: 52 },
          { date: '22/06', value: 49 },
          { date: '29/06', value: 55 },
          { date: '06/07', value: 58 },
          { date: '13/07', value: 61 },
          { date: '20/07', value: 59 },
          { date: '27/07', value: 64 },
          { date: '03/08', value: 67 },
          { date: '10/08', value: 70 },
          { date: '17/08', value: 68 },
          { date: '24/08', value: 72 },
          { date: '31/08', value: 75 },
          { date: '07/09', value: 78 },
          { date: '14/09', value: 76 },
          { date: '21/09', value: 82 },
          { date: '28/09', value: 85 },
          { date: '05/10', value: 88 },
          { date: '12/10', value: 91 }
        ];

        const mockStats: StatCard[] = [
          {
            title: 'סך הכל פרויקטים',
            value: mockProjects.length * 10,
            icon: <FolderOpen className="w-8 h-8" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: '+12% מהחודש הקודם'
          },
          {
            title: 'סך הכל הגשות',
            value: totalSubmissions,
            icon: <FileText className="w-8 h-8" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: '+8% מהחודש הקודם'
          },
          {
            title: 'אחוז הצלחה',
            value: `${passRate}%`,
            icon: <CheckCircle className="w-8 h-8" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '+3% מהחודש הקודם'
          },
          {
            title: 'אחוז כישלון',
            value: `${failRate}%`,
            icon: <XCircle className="w-8 h-8" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            change: '-2% מהחודש הקודם'
          }
        ];

        setStats(mockStats);
        setRecentProjects(mockProjects);
        setRecentSubmissions(mockSubmissions);
        setMonthlyData(mockMonthlyData);
        setPieData(mockPieData);
        setTrendData(mockTrendData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string): { text: string; className: string } => {
    const statusMap: Record<string, { text: string; className: string }> = {
      active: { text: 'פעיל', className: 'bg-green-100 text-green-800' },
      completed: { text: 'הושלם', className: 'bg-blue-100 text-blue-800' },
      pending: { text: 'ממתין', className: 'bg-yellow-100 text-yellow-800' },
      archived: { text: 'בארכיון', className: 'bg-gray-100 text-gray-800' },
      under_review: { text: 'בבדיקה', className: 'bg-purple-100 text-purple-800' },
      approved: { text: 'אושר', className: 'bg-green-100 text-green-800' },
      rejected: { text: 'נדחה', className: 'bg-red-100 text-red-800' }
    };

    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };

  const getResultBadge = (result: string): { text: string; className: string } => {
    const resultMap: Record<string, { text: string; className: string }> = {
      pass: { text: 'עבר', className: 'bg-green-100 text-green-800 border-green-200' },
      fail: { text: 'נכשל', className: 'bg-red-100 text-red-800 border-red-200' },
      pending: { text: 'בהמתנה', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    };

    return resultMap[result] || { text: result, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleSubmissionClick = (submissionId: string) => {
    navigate(`/submissions/${submissionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">לוח בקרה</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>עודכן לאחרונה: {formatDate(new Date().toISOString())}</span>
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" role="region" aria-label="סטטיסטיקות ראשיות">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              role="article"
              aria-label={`${stat.title}: ${stat.value}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              {stat.change && (
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              )}
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100" role="region" aria-label="גרף הגשות חודשי">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              הגשות לפי חודש
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="approved" fill="#10b981" name="אושרו" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" name="נדחו" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100" role="region" aria-label="התפלגות תוצאות">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              התפלגות תוצאות
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '12px' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100" role="region" aria-label="מגמת הגשות לאורך זמן">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-green-600" />
            מגמת הגשות לאורך זמן
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="סך הגשות"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" role="region" aria-label="פרויקטים אחרונים">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                פרויקטים אחרונים
              </h2>
            </div>
            <div className="overflow-x-auto">
              {recentProjects.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">אין פרויקטים להצגה</p>
                </div>
              ) : (
                <table className="w-full" role="table" aria-label="טבלת פרויקטים אחרונים">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        שם הפרויקט
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        עיר
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        סטטוס
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תאריך
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProjects.map((project) => {
                      const statusBadge = getStatusBadge(project.status);
                      return (
                        <tr
                          key={project.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleProjectClick(project.id)}
                          role="row"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleProjectClick(project.id);
                            }
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {project.city}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(project.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProjectClick(project.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                              aria-label={`צפה בפרויקט ${project.name}`}
                            >
                              <Eye className="w-4 h-4" />
                              צפה
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" role="region" aria-label="הגשות אחרונות">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                הגשות אחרונות
              </h2>
            </div>
            <div className="overflow-x-auto">
              {recentSubmissions.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">אין הגשות להצגה</p>
                </div>
              ) : (
                <table className="w-full" role="table" aria-label="טבלת הגשות אחרונות">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פרויקט
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        סטטוס
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תאריך
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תוצאה
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentSubmissions.map((submission) => {
                      const statusBadge = getStatusBadge(submission.status);
                      const resultBadge = getResultBadge(submission.result);
                      return (
                        <tr
                          key={submission.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleSubmissionClick(submission.id)}
                          role="row"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleSubmissionClick(submission.id);
                            }
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {submission.projectName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(submission.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${resultBadge.className}`}>
                              {resultBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubmissionClick(submission.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                              aria-label={`צפה בהגשה עבור ${submission.projectName}`}
                            >
                              <Eye className="w-4 h-4" />
                              צפה
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
