import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  FileIcon,
  FileImage,
  Printer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
  Gauge,
  Brain,
  Timer,
  Shield,
  File,
  FileArchive,
  FileCode
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url: string;
}

interface Violation {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  location?: string;
  details: string;
}

interface AIAnalysisResult {
  overallScore: number;
  passed: boolean;
  processingTime: number;
  modelVersion: string;
  confidenceLevel: number;
  analysisDate: string;
}

interface Submission {
  id: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: 'pass' | 'fail' | 'pending';
  submittedDate: string;
  processedDate?: string;
  submittedBy: string;
  files: UploadedFile[];
  aiAnalysis?: AIAnalysisResult;
  violations: Violation[];
}

const SubmissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortedViolations, setSortedViolations] = useState<Violation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    const loadSubmissionData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockSubmissions: Submission[] = [
          {
            id: 'sub-1',
            projectId: '1',
            projectName: 'מתחם מגורים חדש - רמת אביב',
            status: 'completed',
            result: 'pass',
            submittedDate: '2025-11-10T10:30:00Z',
            processedDate: '2025-11-10T10:35:00Z',
            submittedBy: 'אינג\' דוד כהן',
            files: [
              {
                id: 'file-1',
                name: 'תוכנית_קומה_ראשונה.pdf',
                size: 2457600,
                type: 'pdf',
                uploadDate: '2025-11-10T10:25:00Z',
                url: '#'
              },
              {
                id: 'file-2',
                name: 'חזיתות.dwg',
                size: 5242880,
                type: 'dwg',
                uploadDate: '2025-11-10T10:26:00Z',
                url: '#'
              },
              {
                id: 'file-3',
                name: 'חתכים.dwg',
                size: 4194304,
                type: 'dwg',
                uploadDate: '2025-11-10T10:27:00Z',
                url: '#'
              },
              {
                id: 'file-4',
                name: 'תמונת_אתר.jpg',
                size: 1048576,
                type: 'jpg',
                uploadDate: '2025-11-10T10:28:00Z',
                url: '#'
              }
            ],
            aiAnalysis: {
              overallScore: 92,
              passed: true,
              processingTime: 324,
              modelVersion: 'BIM-Compliance-AI v2.4.1',
              confidenceLevel: 95,
              analysisDate: '2025-11-10T10:35:00Z'
            },
            violations: [
              {
                id: 'viol-1',
                ruleId: 'ACC-RAMP-002',
                ruleName: 'שיפוע רמפת נגישות',
                severity: 'medium',
                description: 'שיפוע הרמפה בכניסה הראשית (8.5%) חורג מהמותר על פי התקן',
                recommendation: 'יש להקטין את שיפוع הרמפה ל-8% או פחות בהתאם לתקן ישראלי 1918',
                location: 'כניסה ראשית, קומת קרקע',
                details: 'התקן הישראלי דורש שיפוע מקסימלי של 8% לרמפות נגישות באורך עד 10 מטרים. השיפוע הנמדד בתוכנית הוא 8.5%.'
              },
              {
                id: 'viol-2',
                ruleId: 'SAF-FIRE-003',
                ruleName: 'רוחב דרך מילוט',
                severity: 'low',
                description: 'רוחב דרך המילוט בקומה 2 (1.15 מ\') נמוך מהמומלץ',
                recommendation: 'מומלץ להרחיב את דרך המילוט ל-1.20 מ\' לפחות לשיפור בטיחות',
                location: 'קומה 2, מסדרון מזרחי',
                details: 'למרות שהרוחב עומד במינימום הנדרש (1.10 מ\'), מומלץ להרחיב ל-1.20 מ\' לשיפור זרימת אנשים במצבי חירום.'
              }
            ]
          },
          {
            id: 'sub-2',
            projectId: '1',
            projectName: 'מתחם מגורים חדש - רמת אביב',
            status: 'completed',
            result: 'fail',
            submittedDate: '2025-11-05T14:20:00Z',
            processedDate: '2025-11-05T14:28:00Z',
            submittedBy: 'אינג\' דוד כהן',
            files: [
              {
                id: 'file-5',
                name: 'תוכנית_קומה_ראשונה_v1.pdf',
                size: 2097152,
                type: 'pdf',
                uploadDate: '2025-11-05T14:15:00Z',
                url: '#'
              },
              {
                id: 'file-6',
                name: 'חזיתות_v1.dwg',
                size: 4718592,
                type: 'dwg',
                uploadDate: '2025-11-05T14:16:00Z',
                url: '#'
              },
              {
                id: 'file-7',
                name: 'דוח_קונסטרוקציה.pdf',
                size: 1572864,
                type: 'pdf',
                uploadDate: '2025-11-05T14:17:00Z',
                url: '#'
              }
            ],
            aiAnalysis: {
              overallScore: 68,
              passed: false,
              processingTime: 456,
              modelVersion: 'BIM-Compliance-AI v2.4.0',
              confidenceLevel: 91,
              analysisDate: '2025-11-05T14:28:00Z'
            },
            violations: [
              {
                id: 'viol-3',
                ruleId: 'ZON-SETBACK-001',
                ruleName: 'נסיגה מגבול מגרש',
                severity: 'high',
                description: 'הבניין חורג מקו הבניין המותר בחזית הצפונית ב-0.8 מטר',
                recommendation: 'יש להזיז את קו החזית הצפונית 0.8 מטר דרומה או לבקש היתר סטייה',
                location: 'חזית צפונית, קומות 1-3',
                details: 'על פי תכנית המתאר, הנסיגה הנדרשת מהגבול הצפוני היא 5 מטרים. בתוכנית הנוכחית הנסיגה היא 4.2 מטרים בלבד.'
              },
              {
                id: 'viol-4',
                ruleId: 'STR-LOAD-001',
                ruleName: 'עומסים על קורות',
                severity: 'high',
                description: 'העומס המתוכנן על הקורה K-12 חורג ב-15% מהעומס המקסימלי המותר',
                recommendation: 'יש להגדיל את חתך הקורה מ-30x60 ס"מ ל-30x70 ס"מ או להוסיף תמיכה נוספת',
                location: 'קומה 2, ציר C בין צירים 3-4',
                details: 'העומס המחושב: 52 טון. העומס המותר לקורה בחתך 30x60: 45 טון. יש לשדרג את החתך או לשנות את תכנון התמיכות.'
              },
              {
                id: 'viol-5',
                ruleId: 'SAF-FIRE-001',
                ruleName: 'מרחק מדרך מילוט',
                severity: 'high',
                description: 'חדרים בקומה 3 נמצאים במרחק של 32 מטר מיציאת חירום, מעבר למותר',
                recommendation: 'יש להוסיף יציאת חירום נוספת בקצה המערבי של הבניין או לשנות את תכנון הפנים',
                location: 'קומה 3, חדרים 301-304',
                details: 'התקן דורש שהמרחק המקסימלי מכל נקודה לדרך מילוט יהיה 25 מטרים במבני מגורים. יש צורך בפתרון תכנוני.'
              },
              {
                id: 'viol-6',
                ruleId: 'ACC-RAMP-001',
                ruleName: 'חניות נגישות',
                severity: 'medium',
                description: 'מספר חניות הנגישות (2) נמוך מהנדרש (3) עבור חניון בן 85 מקומות',
                recommendation: 'יש להוסיף חניית נגישות אחת נוספת ולסמן אותה כנדרש בתקן',
                location: 'חניון תת-קרקעי, רמה -1',
                details: 'לפי התקן הישראלי, בחניון בן 85 מקומות נדרשות 3 חניות נגישות לפחות (4% ראשונים + 2% נוספים).'
              },
              {
                id: 'viol-7',
                ruleId: 'ENV-VENT-001',
                ruleName: 'אוורור חדרי שירות',
                severity: 'medium',
                description: 'חדר האשפה בקומת הקרקע חסר מערכת אוורור מכאנית',
                recommendation: 'יש להתקין מאוורר מכאני בהספק מינימלי של 10 החלפות אוויר לשעה',
                location: 'קומת קרקע, חדר אשפה',
                details: 'חדרי אשפה חייבים להיות מאוררים מכאנית על פי תקנות בריאות הציבור. יש להוסיף מערכת אוורור מתאימה.'
              },
              {
                id: 'viol-8',
                ruleId: 'STR-FOUND-001',
                ruleName: 'עומק יסודות',
                severity: 'low',
                description: 'עומק היסודות המתוכנן (1.2 מ\') נמוך מהמומלץ לסוג קרקע זה',
                recommendation: 'מומלץ להעמיק את היסודות ל-1.5 מ\' בהתאם לחוות דעת קרקע',
                location: 'יסודות כלליים',
                details: 'על פי חוות דעת הקרקע, קרקע הבניה היא בעלת יכולת נשיאות בינונית. מומלץ להעמיק את היסודות ל-1.5 מ\' לייצוב טוב יותר.'
              }
            ]
          },
          {
            id: 'sub-3',
            projectId: '2',
            projectName: 'בניין משרדים - פארק הייטק',
            status: 'processing',
            result: 'pending',
            submittedDate: '2025-11-01T09:15:00Z',
            submittedBy: 'אינג\' שרה לוי',
            files: [
              {
                id: 'file-8',
                name: 'תוכנית_קומה_טיפוסית.pdf',
                size: 3145728,
                type: 'pdf',
                uploadDate: '2025-11-01T09:10:00Z',
                url: '#'
              },
              {
                id: 'file-9',
                name: 'מערכות_מיזוג.dwg',
                size: 6291456,
                type: 'dwg',
                uploadDate: '2025-11-01T09:11:00Z',
                url: '#'
              }
            ],
            violations: []
          }
        ];

        const foundSubmission = mockSubmissions.find(s => s.id === id);

        if (!foundSubmission) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setSubmission(foundSubmission);
        setSortedViolations(sortViolationsBySeverity(foundSubmission.violations));
      } catch (error) {
        console.error('Error loading submission data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmissionData();
  }, [id]);

  const sortViolationsBySeverity = (violations: Violation[]): Violation[] => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return [...violations].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  };

  useEffect(() => {
    if (submission) {
      let filtered = submission.violations;
      if (severityFilter !== 'all') {
        filtered = filtered.filter(v => v.severity === severityFilter);
      }
      setSortedViolations(sortViolationsBySeverity(filtered));
    }
  }, [severityFilter, submission]);

  const getStatusBadge = (status: Submission['status']): { text: string; className: string; icon: React.ReactNode } => {
    const statusMap: Record<Submission['status'], { text: string; className: string; icon: React.ReactNode }> = {
      pending: {
        text: 'ממתין',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <Clock className="w-4 h-4" />
      },
      processing: {
        text: 'בעיבוד',
        className: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: <Brain className="w-4 h-4 animate-pulse" />
      },
      completed: {
        text: 'הושלם',
        className: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="w-4 h-4" />
      },
      failed: {
        text: 'נכשל',
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircle className="w-4 h-4" />
      }
    };
    return statusMap[status];
  };

  const getResultBadge = (result: Submission['result']): { text: string; className: string; icon: React.ReactNode } => {
    const resultMap: Record<Submission['result'], { text: string; className: string; icon: React.ReactNode }> = {
      pass: {
        text: 'עבר',
        className: 'bg-green-500 text-white border-green-600 shadow-lg',
        icon: <CheckCircle className="w-8 h-8" />
      },
      fail: {
        text: 'נכשל',
        className: 'bg-red-500 text-white border-red-600 shadow-lg',
        icon: <XCircle className="w-8 h-8" />
      },
      pending: {
        text: 'בהמתנה',
        className: 'bg-gray-400 text-white border-gray-500 shadow-lg',
        icon: <Clock className="w-8 h-8" />
      }
    };
    return resultMap[result];
  };

  const getSeverityBadge = (severity: Violation['severity']): { text: string; className: string } => {
    const severityMap: Record<Violation['severity'], { text: string; className: string }> = {
      high: { text: 'גבוהה', className: 'bg-red-100 text-red-800 border-red-300' },
      medium: { text: 'בינונית', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      low: { text: 'נמוכה', className: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    return severityMap[severity];
  };

  const getFileIcon = (fileType: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      pdf: <FileText className="w-8 h-8 text-red-600" />,
      dwg: <FileCode className="w-8 h-8 text-blue-600" />,
      dxf: <FileCode className="w-8 h-8 text-purple-600" />,
      jpg: <FileImage className="w-8 h-8 text-green-600" />,
      jpeg: <FileImage className="w-8 h-8 text-green-600" />,
      png: <FileImage className="w-8 h-8 text-green-600" />,
      zip: <FileArchive className="w-8 h-8 text-orange-600" />,
      rar: <FileArchive className="w-8 h-8 text-orange-600" />
    };
    return iconMap[fileType.toLowerCase()] || <File className="w-8 h-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    if (submission) {
      navigate(`/projects/${submission.projectId}`);
    } else {
      navigate('/projects');
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    console.log('Downloading file:', file.name);
    alert(`הורדת קובץ: ${file.name}`);
  };

  const handlePreviewFile = (file: UploadedFile) => {
    if (file.type === 'pdf' || file.type === 'jpg' || file.type === 'jpeg' || file.type === 'png') {
      setPreviewFile(file);
    } else {
      alert(`תצוגה מקדימה זמינה רק עבור קבצי PDF ותמונות`);
    }
  };

  const handleExportPDF = () => {
    console.log('Exporting submission to PDF');
    alert('מייצא דוח מלא ל-PDF...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRerunAnalysis = () => {
    console.log('Re-running analysis for submission:', id);
    alert('מפעיל מחדש את ניתוח ה-AI...');
  };

  const handleDeleteSubmission = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting submission:', id);
    setDeleteDialogOpen(false);
    if (submission) {
      navigate(`/projects/${submission.projectId}`);
    }
  };

  const toggleViolationExpanded = (violationId: string) => {
    setExpandedViolation(expandedViolation === violationId ? null : violationId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">טוען פרטי הגשה...</p>
        </div>
      </div>
    );
  }

  if (notFound || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-100">
            <AlertCircle className="w-24 h-24 text-red-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">הגשה לא נמצאה</h2>
            <p className="text-gray-600 mb-8 text-lg">
              ההגשה שחיפשת אינה קיימת או שהוסרה מהמערכת
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium shadow-lg transition-all transform hover:scale-105"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(submission.status);
  const resultBadge = getResultBadge(submission.result);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 print:bg-white" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לפרויקט
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              ייצוא PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              הדפסה
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-gray-900">הגשה {submission.id}</h1>
                <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border ${statusBadge.className}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
              </div>

              <div className="mb-4">
                <Link
                  to={`/projects/${submission.projectId}`}
                  className="text-xl text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  {submission.projectName}
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">הוגש:</span>
                  <span>{formatDateTime(submission.submittedDate)}</span>
                </div>
                {submission.processedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">עובד:</span>
                    <span>{formatDateTime(submission.processedDate)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`px-8 py-6 inline-flex flex-col items-center gap-3 rounded-xl border-2 ${resultBadge.className}`}>
              {resultBadge.icon}
              <span className="text-2xl font-bold">{resultBadge.text}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileIcon className="w-6 h-6 text-blue-600" />
              קבצים שהועלו
            </h2>
          </div>

          <div className="p-6">
            {submission.files.length === 0 ? (
              <div className="text-center py-12">
                <FileIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">אין קבצים מצורפים</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submission.files.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">
                          {file.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-1">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(file.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        <Download className="w-4 h-4" />
                        הורד
                      </button>
                      {(file.type === 'pdf' || file.type === 'jpg' || file.type === 'jpeg' || file.type === 'png') && (
                        <button
                          onClick={() => handlePreviewFile(file)}
                          className="flex-1 flex items-center justify-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          תצוגה
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {submission.aiAnalysis && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                תוצאות ניתוח AI
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Gauge className="w-8 h-8 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">ציון כולל</h3>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {submission.aiAnalysis.overallScore}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        submission.aiAnalysis.overallScore >= 80
                          ? 'bg-green-500'
                          : submission.aiAnalysis.overallScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${submission.aiAnalysis.overallScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">מתוך 100</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    {submission.aiAnalysis.passed ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">תוצאה</h3>
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${submission.aiAnalysis.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {submission.aiAnalysis.passed ? 'עבר' : 'נכשל'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {submission.aiAnalysis.passed ? 'עומד בכל התקנות' : 'נמצאו אי התאמות'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Timer className="w-8 h-8 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">זמן עיבוד</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-2">
                    {submission.aiAnalysis.processingTime}
                  </p>
                  <p className="text-sm text-gray-600">שניות</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">רמת ביטחון</h3>
                  </div>
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    {submission.aiAnalysis.confidenceLevel}%
                  </p>
                  <p className="text-sm text-gray-600">דיוק המודל</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium">גרסת מודל:</span>
                  <span>{submission.aiAnalysis.modelVersion}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">תאריך ניתוח:</span>
                  <span>{formatDateTime(submission.aiAnalysis.analysisDate)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                אי התאמות ותקלות
                {submission.violations.length > 0 && (
                  <span className="text-lg font-normal text-gray-600">
                    ({submission.violations.length})
                  </span>
                )}
              </h2>

              {submission.violations.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">הכל</option>
                    <option value="high">חומרה גבוהה</option>
                    <option value="medium">חומרה בינונית</option>
                    <option value="low">חומרה נמוכה</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {sortedViolations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {severityFilter === 'all' ? 'אין אי התאמות' : 'אין אי התאמות בפילטר זה'}
                </h3>
                <p className="text-gray-600">
                  {severityFilter === 'all'
                    ? 'ההגשה עומדת בכל התקנות והתקנים'
                    : 'נסה לשנות את הפילטר כדי לראות אי התאמות אחרות'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                        קוד תקנה
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        שם תקנה
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                        חומרה
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        תיאור
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                        פרטים
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedViolations.map((violation) => {
                      const severityBadge = getSeverityBadge(violation.severity);
                      const isExpanded = expandedViolation === violation.id;

                      return (
                        <React.Fragment key={violation.id}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono font-semibold text-blue-600">
                                {violation.ruleId}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {violation.ruleName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${severityBadge.className}`}>
                                {severityBadge.text}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-700">
                                {violation.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => toggleViolationExpanded(violation.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                aria-label={isExpanded ? 'סגור פרטים' : 'פתח פרטים'}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-blue-50">
                              <td colSpan={5} className="px-6 py-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 text-blue-600" />
                                      המלצה לתיקון
                                    </h4>
                                    <p className="text-sm text-gray-700 bg-white rounded-lg p-4 border border-blue-200">
                                      {violation.recommendation}
                                    </p>
                                  </div>
                                  {violation.location && (
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-900 mb-2">מיקום</h4>
                                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-blue-200">
                                        {violation.location}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">פרטים נוספים</h4>
                                    <p className="text-sm text-gray-700 bg-white rounded-lg p-4 border border-blue-200 leading-relaxed">
                                      {violation.details}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:hidden">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              פעולות נוספות
            </h3>
            <button
              onClick={handleRerunAnalysis}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
              disabled={submission.status === 'processing'}
            >
              <RotateCcw className="w-5 h-5" />
              הרץ ניתוח מחדש
            </button>
            <p className="text-sm text-gray-600 mt-3">
              הפעל מחדש את ניתוח ה-AI עבור הגשה זו לקבלת תוצאות מעודכנות
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              אזור מסוכן
            </h3>
            <button
              onClick={handleDeleteSubmission}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
            >
              <Trash2 className="w-5 h-5" />
              מחק הגשה
            </button>
            <p className="text-sm text-gray-600 mt-3">
              מחיקת ההגשה תסיר אותה לצמיתות מהמערכת
            </p>
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          dir="rtl"
          onClick={() => setDeleteDialogOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">אישור מחיקה</h3>
            </div>

            <p className="text-gray-600 mb-2">
              האם אתה בטוח שברצונך למחוק את ההגשה:
            </p>
            <p className="text-gray-900 font-semibold mb-6">
              "{submission.id}"?
            </p>
            <p className="text-sm text-red-600 mb-6">
              פעולה זו אינה ניתנת לביטול.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
              >
                כן, מחק
              </button>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          dir="rtl"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">תצוגה מקדימה של: {previewFile.name}</p>
                <p className="text-sm text-gray-500 mt-2">(אינטגרציה עם מציג קבצים תתווסף בעתיד)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetailPage;
