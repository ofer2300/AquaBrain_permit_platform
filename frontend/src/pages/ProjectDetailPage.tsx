import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Edit,
  MapPin,
  Calendar,
  User,
  FileText,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader,
  FolderPlus,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  city: string;
  address: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  owner: string;
  engineer: string;
  description: string;
}

interface Submission {
  id: string;
  projectId: string;
  dateSubmitted: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: 'pass' | 'fail' | 'pending';
  submittedBy: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'submitted' | 'approved' | 'rejected' | 'updated';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

interface Statistics {
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  pendingSubmissions: number;
}

interface DeleteDialogState {
  isOpen: boolean;
  type: 'project' | 'submission';
  id: string | null;
  name: string | null;
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    pendingSubmissions: 0
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    type: 'project',
    id: null,
    name: null
  });

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'מתחם מגורים חדש - רמת אביב',
            city: 'תל אביב',
            address: 'רחוב ארלוזורוב 120',
            status: 'approved',
            createdAt: '2025-10-15T10:30:00Z',
            updatedAt: '2025-11-10T14:20:00Z',
            owner: 'חברת בנייה מודרנית בע"מ',
            engineer: 'אינג\' דוד כהן',
            description: 'פרויקט מגורים חדש הכולל 3 בניינים בני 8 קומות כל אחד, עם חניון תת-קרקעי משותף. הפרויקט כולל דירות 3-5 חדרים עם גימורים ברמה גבוהה, שטחי ציבור ומרחבים ירוקים.'
          },
          {
            id: '2',
            name: 'בניין משרדים - פארק הייטק',
            city: 'הרצליה',
            address: 'דרך המדע 25',
            status: 'submitted',
            createdAt: '2025-10-20T14:20:00Z',
            updatedAt: '2025-11-08T09:15:00Z',
            owner: 'קבוצת תעשיות בע"מ',
            engineer: 'אינג\' שרה לוי',
            description: 'בניין משרדים חדש בן 12 קומות בפארק הייטק בהרצליה. הבניין מתוכנן לעמוד בתקני בנייה ירוקה עם מערכות חכמות לניהול אנרגיה.'
          },
          {
            id: '3',
            name: 'מרכז מסחרי - עזריאלי',
            city: 'תל אביב',
            address: 'דרך מנחם בגין 132',
            status: 'approved',
            createdAt: '2025-09-05T09:15:00Z',
            updatedAt: '2025-11-05T16:45:00Z',
            owner: 'עזריאלי קבוצת ניהול בע"מ',
            engineer: 'אינג\' מיכאל רוזנברג',
            description: 'מרכז מסחרי חדש הכולל חנויות, מסעדות, קולנוע ומרכז בילויים. השטח הכולל 15,000 מ"ר על פני 4 קומות.'
          }
        ];

        const foundProject = mockProjects.find(p => p.id === id);

        if (!foundProject) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setProject(foundProject);

        const mockSubmissions: Submission[] = [
          {
            id: 'sub-1',
            projectId: foundProject.id,
            dateSubmitted: '2025-11-10T10:30:00Z',
            status: 'completed',
            result: 'pass',
            submittedBy: 'אינג\' דוד כהן'
          },
          {
            id: 'sub-2',
            projectId: foundProject.id,
            dateSubmitted: '2025-11-05T14:20:00Z',
            status: 'completed',
            result: 'fail',
            submittedBy: 'אינג\' דוד כהן'
          },
          {
            id: 'sub-3',
            projectId: foundProject.id,
            dateSubmitted: '2025-11-01T09:15:00Z',
            status: 'processing',
            result: 'pending',
            submittedBy: 'אינג\' שרה לוי'
          },
          {
            id: 'sub-4',
            projectId: foundProject.id,
            dateSubmitted: '2025-10-28T16:45:00Z',
            status: 'completed',
            result: 'pass',
            submittedBy: 'אינג\' דוד כהן'
          },
          {
            id: 'sub-5',
            projectId: foundProject.id,
            dateSubmitted: '2025-10-22T11:00:00Z',
            status: 'pending',
            result: 'pending',
            submittedBy: 'אינג\' מיכאל רוזנברג'
          }
        ];

        setSubmissions(mockSubmissions);

        const stats: Statistics = {
          totalSubmissions: mockSubmissions.length,
          approvedSubmissions: mockSubmissions.filter(s => s.result === 'pass').length,
          rejectedSubmissions: mockSubmissions.filter(s => s.result === 'fail').length,
          pendingSubmissions: mockSubmissions.filter(s => s.result === 'pending').length
        };

        setStatistics(stats);

        const events: TimelineEvent[] = [
          {
            id: 'event-1',
            type: 'updated',
            title: 'פרויקט עודכן',
            description: 'עודכנו פרטי הפרויקט והוגשה בקשה חדשה לאישור',
            timestamp: foundProject.updatedAt,
            icon: <RefreshCw className="w-5 h-5" />,
            iconBgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
          },
          {
            id: 'event-2',
            type: 'approved',
            title: 'הגשה אושרה',
            description: 'ההגשה האחרונה עברה בהצלחה את כל הבדיקות ואושרה על ידי המערכת',
            timestamp: '2025-11-10T14:30:00Z',
            icon: <CheckCircle className="w-5 h-5" />,
            iconBgColor: 'bg-green-100',
            iconColor: 'text-green-600'
          },
          {
            id: 'event-3',
            type: 'rejected',
            title: 'הגשה נדחתה',
            description: 'ההגשה מתאריך 05/11 נדחתה עקב אי התאמה לתקנות בנייה',
            timestamp: '2025-11-05T16:45:00Z',
            icon: <XCircle className="w-5 h-5" />,
            iconBgColor: 'bg-red-100',
            iconColor: 'text-red-600'
          },
          {
            id: 'event-4',
            type: 'submitted',
            title: 'הגשה חדשה',
            description: 'הוגשה בקשה חדשה לאישור תוכניות הבנייה',
            timestamp: '2025-11-01T09:15:00Z',
            icon: <FileCheck className="w-5 h-5" />,
            iconBgColor: 'bg-purple-100',
            iconColor: 'text-purple-600'
          },
          {
            id: 'event-5',
            type: 'created',
            title: 'פרויקט נוצר',
            description: 'הפרויקט נוצר במערכת והוגדרו פרטיו הבסיסיים',
            timestamp: foundProject.createdAt,
            icon: <FolderPlus className="w-5 h-5" />,
            iconBgColor: 'bg-gray-100',
            iconColor: 'text-gray-600'
          }
        ];

        setTimelineEvents(events);
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [id]);

  const getStatusBadge = (status: Project['status']): { text: string; className: string } => {
    const statusMap: Record<Project['status'], { text: string; className: string }> = {
      draft: { text: 'טיוטה', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      submitted: { text: 'הוגש', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      approved: { text: 'אושר', className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { text: 'נדחה', className: 'bg-red-100 text-red-800 border-red-200' }
    };
    return statusMap[status];
  };

  const getSubmissionStatusBadge = (status: Submission['status']): { text: string; className: string } => {
    const statusMap: Record<Submission['status'], { text: string; className: string }> = {
      pending: { text: 'ממתין', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      processing: { text: 'בעיבוד', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { text: 'הושלם', className: 'bg-green-100 text-green-800 border-green-200' },
      failed: { text: 'נכשל', className: 'bg-red-100 text-red-800 border-red-200' }
    };
    return statusMap[status];
  };

  const getResultBadge = (result: Submission['result']): { text: string; className: string; icon: React.ReactNode } => {
    const resultMap: Record<Submission['result'], { text: string; className: string; icon: React.ReactNode }> = {
      pass: {
        text: 'עבר',
        className: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="w-4 h-4" />
      },
      fail: {
        text: 'נכשל',
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircle className="w-4 h-4" />
      },
      pending: {
        text: 'בהמתנה',
        className: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: <Clock className="w-4 h-4" />
      }
    };
    return resultMap[result];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleNewSubmission = () => {
    navigate(`/projects/${id}/submissions/new`);
  };

  const handleViewSubmission = (submissionId: string) => {
    navigate(`/submissions/${submissionId}`);
  };

  const handleDeleteProjectClick = () => {
    if (project) {
      setDeleteDialog({
        isOpen: true,
        type: 'project',
        id: project.id,
        name: project.name
      });
    }
  };

  const handleDeleteSubmissionClick = (submission: Submission) => {
    setDeleteDialog({
      isOpen: true,
      type: 'submission',
      id: submission.id,
      name: `הגשה מתאריך ${formatDate(submission.dateSubmitted)}`
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === 'project') {
      navigate('/projects');
    } else if (deleteDialog.type === 'submission' && deleteDialog.id) {
      setSubmissions(prev => prev.filter(s => s.id !== deleteDialog.id));
      const updatedSubmissions = submissions.filter(s => s.id !== deleteDialog.id);
      const stats: Statistics = {
        totalSubmissions: updatedSubmissions.length,
        approvedSubmissions: updatedSubmissions.filter(s => s.result === 'pass').length,
        rejectedSubmissions: updatedSubmissions.filter(s => s.result === 'fail').length,
        pendingSubmissions: updatedSubmissions.filter(s => s.result === 'pending').length
      };
      setStatistics(stats);
    }
    setDeleteDialog({ isOpen: false, type: 'project', id: null, name: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, type: 'project', id: null, name: null });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">טוען פרטי פרויקט...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-100">
            <AlertCircle className="w-24 h-24 text-red-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">פרויקט לא נמצא</h2>
            <p className="text-gray-600 mb-8 text-lg">
              הפרויקט שחיפשת אינו קיים או שהוסר מהמערכת
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium shadow-lg transition-all transform hover:scale-105"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה לרשימת הפרויקטים
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(project.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            aria-label="חזרה לרשימת פרויקטים"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לפרויקטים
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{project.city}</span>
                  <span>•</span>
                  <span>{project.address}</span>
                </div>
              </div>
              <div className="mb-4">
                <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${statusBadge.className}`}>
                  {statusBadge.text}
                </span>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
              aria-label="ערוך פרויקט"
            >
              <Edit className="w-5 h-5" />
              ערוך
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">תאריך יצירה</p>
                <p className="font-semibold text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">עדכון אחרון</p>
                <p className="font-semibold text-gray-900">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">בעלים</p>
                <p className="font-semibold text-gray-900">{project.owner}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">מהנדס אחראי</p>
                <p className="font-semibold text-gray-900">{project.engineer}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              תיאור הפרויקט
            </h3>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">סך הכל הגשות</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.totalSubmissions}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">הגשות שאושרו</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.approvedSubmissions}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">הגשות שנדחו</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.rejectedSubmissions}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">הגשות ממתינות</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.pendingSubmissions}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              הגשות
            </h2>
            <button
              onClick={handleNewSubmission}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
              aria-label="הגשה חדשה"
            >
              <Plus className="w-5 h-5" />
              הגשה חדשה
            </button>
          </div>

          <div className="overflow-x-auto">
            {submissions.length === 0 ? (
              <div className="p-16 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">אין הגשות עדיין</h3>
                <p className="text-gray-600 mb-6">
                  התחל על ידי יצירת ההגשה הראשונה שלך
                </p>
                <button
                  onClick={handleNewSubmission}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  <Plus className="w-5 h-5" />
                  צור הגשה חדשה
                </button>
              </div>
            ) : (
              <table className="w-full" role="table" aria-label="טבלת הגשות">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      מזהה
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      תאריך הגשה
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      תוצאה
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => {
                    const statusBadge = getSubmissionStatusBadge(submission.status);
                    const resultBadge = getResultBadge(submission.result);
                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-blue-50 transition-colors"
                        role="row"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{submission.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDateTime(submission.dateSubmitted)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusBadge.className}`}>
                            {submission.status === 'processing' && (
                              <Loader className="w-3 h-3 mr-1 animate-spin" />
                            )}
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${resultBadge.className}`}>
                            {resultBadge.icon}
                            {resultBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewSubmission(submission.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                              aria-label={`צפה בהגשה ${submission.id}`}
                              title="צפה"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmissionClick(submission)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                              aria-label={`מחק הגשה ${submission.id}`}
                              title="מחק"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              ציר זמן ואירועים
            </h2>
          </div>

          <div className="p-8">
            <div className="relative">
              <div className="absolute top-0 bottom-0 right-6 w-0.5 bg-gray-200"></div>

              <div className="space-y-8">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-6">
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 ${event.iconBgColor} rounded-full flex items-center justify-center ${event.iconColor} ring-4 ring-white`}>
                      {event.icon}
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-sm text-gray-500 whitespace-nowrap mr-4">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            אזור מסוכן
          </h3>
          <p className="text-gray-600 mb-4">
            מחיקת הפרויקט תסיר אותו לצמיתות מהמערכת, כולל כל ההגשות והנתונים הקשורים אליו.
          </p>
          <button
            onClick={handleDeleteProjectClick}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
            aria-label="מחק פרויקט"
          >
            <Trash2 className="w-5 h-5" />
            מחק פרויקט
          </button>
        </div>
      </div>

      {deleteDialog.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          dir="rtl"
          onClick={handleDeleteCancel}
          role="dialog"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 id="delete-dialog-title" className="text-xl font-bold text-gray-900">
                אישור מחיקה
              </h3>
            </div>

            <p id="delete-dialog-description" className="text-gray-600 mb-2">
              האם אתה בטוח שברצונך למחוק את {deleteDialog.type === 'project' ? 'הפרויקט' : 'ההגשה'}:
            </p>
            <p className="text-gray-900 font-semibold mb-6">
              "{deleteDialog.name}"?
            </p>
            <p className="text-sm text-red-600 mb-6">
              פעולה זו אינה ניתנת לביטול.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
                autoFocus
              >
                כן, מחק
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
