import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  city: string;
  address: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
}

type SortField = 'name' | 'city' | 'address' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

interface DeleteDialogState {
  isOpen: boolean;
  project: Project | null;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpToPage, setJumpToPage] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ isOpen: false, project: null });

  const projectsPerPage = 10;

  useEffect(() => {
    const loadProjects = async () => {
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
            createdAt: '2025-11-10T10:30:00Z'
          },
          {
            id: '2',
            name: 'בניין משרדים - פארק הייטק',
            city: 'הרצליה',
            address: 'דרך המדע 25',
            status: 'submitted',
            createdAt: '2025-11-08T14:20:00Z'
          },
          {
            id: '3',
            name: 'מרכז מסחרי - עזריאלי',
            city: 'תל אביב',
            address: 'דרך מנחם בגין 132',
            status: 'approved',
            createdAt: '2025-11-05T09:15:00Z'
          },
          {
            id: '4',
            name: 'פרויקט תשתית - כביש 6',
            city: 'נתניה',
            address: 'צומת נתניה דרום',
            status: 'submitted',
            createdAt: '2025-11-03T16:45:00Z'
          },
          {
            id: '5',
            name: 'מגדל מגורים - נווה צדק',
            city: 'תל אביב',
            address: 'רחוב שבזי 45',
            status: 'draft',
            createdAt: '2025-11-01T11:00:00Z'
          },
          {
            id: '6',
            name: 'בית ספר יסודי חדש',
            city: 'ירושלים',
            address: 'רחוב הרצל 88',
            status: 'approved',
            createdAt: '2025-10-28T08:30:00Z'
          },
          {
            id: '7',
            name: 'גן ילדים - שכונת נחלת יצחק',
            city: 'תל אביב',
            address: 'רחוב נחלת יצחק 12',
            status: 'rejected',
            createdAt: '2025-10-25T13:20:00Z'
          },
          {
            id: '8',
            name: 'מפעל תעשייתי',
            city: 'חיפה',
            address: 'אזור התעשייה - רחוב הפלדה 3',
            status: 'submitted',
            createdAt: '2025-10-22T10:15:00Z'
          },
          {
            id: '9',
            name: 'מרכז קהילתי',
            city: 'באר שבע',
            address: 'שדרות בן גוריון 55',
            status: 'draft',
            createdAt: '2025-10-20T09:45:00Z'
          },
          {
            id: '10',
            name: 'קניון אזורי',
            city: 'רעננה',
            address: 'רחוב אחוזה 100',
            status: 'approved',
            createdAt: '2025-10-18T14:30:00Z'
          },
          {
            id: '11',
            name: 'בית חולים פרטי',
            city: 'פתח תקווה',
            address: 'רחוב ז\'בוטינסקי 150',
            status: 'submitted',
            createdAt: '2025-10-15T11:20:00Z'
          },
          {
            id: '12',
            name: 'מגרש חניון תת קרקעי',
            city: 'תל אביב',
            address: 'רחוב דיזנגוף 200',
            status: 'approved',
            createdAt: '2025-10-12T08:10:00Z'
          },
          {
            id: '13',
            name: 'מבנה ציבור - ספרייה',
            city: 'ירושלים',
            address: 'רחוב יפו 45',
            status: 'draft',
            createdAt: '2025-10-10T15:25:00Z'
          },
          {
            id: '14',
            name: 'יחידות דיור ציבורי',
            city: 'אשדוד',
            address: 'רחוב המעפילים 75',
            status: 'rejected',
            createdAt: '2025-10-08T12:40:00Z'
          },
          {
            id: '15',
            name: 'מתקן ספורט עירוני',
            city: 'ראשון לציון',
            address: 'רחוב הרצל 120',
            status: 'submitted',
            createdAt: '2025-10-05T09:30:00Z'
          },
          {
            id: '16',
            name: 'בניין מגורים - 8 קומות',
            city: 'הרצליה',
            address: 'רחוב סוקולוב 33',
            status: 'approved',
            createdAt: '2025-10-03T16:15:00Z'
          },
          {
            id: '17',
            name: 'מרכז לוגיסטי',
            city: 'מודיעין',
            address: 'אזור התעשייה - רחוב הברזל 8',
            status: 'draft',
            createdAt: '2025-10-01T10:50:00Z'
          },
          {
            id: '18',
            name: 'מלון בוטיק',
            city: 'תל אביב',
            address: 'רחוב אלנבי 88',
            status: 'submitted',
            createdAt: '2025-09-28T13:35:00Z'
          },
          {
            id: '19',
            name: 'מתחם תעסוקה משולב',
            city: 'נתניה',
            address: 'שדרות בנימין 45',
            status: 'approved',
            createdAt: '2025-09-25T11:10:00Z'
          },
          {
            id: '20',
            name: 'גשר הולכי רגל',
            city: 'חיפה',
            address: 'שדרות הנשיא 220',
            status: 'submitted',
            createdAt: '2025-09-22T08:25:00Z'
          },
          {
            id: '21',
            name: 'פארק עירוני',
            city: 'ירושלים',
            address: 'רחוב עמק רפאים 65',
            status: 'draft',
            createdAt: '2025-09-20T14:45:00Z'
          },
          {
            id: '22',
            name: 'מרכז רפואי',
            city: 'באר שבע',
            address: 'רחוב רגר 180',
            status: 'rejected',
            createdAt: '2025-09-18T09:20:00Z'
          },
          {
            id: '23',
            name: 'מתחם תעשייה ירוקה',
            city: 'רעננה',
            address: 'רחוב האומנים 15',
            status: 'approved',
            createdAt: '2025-09-15T12:30:00Z'
          },
          {
            id: '24',
            name: 'מועדון ספורט',
            city: 'פתח תקווה',
            address: 'רחוב הגפן 42',
            status: 'submitted',
            createdAt: '2025-09-12T10:15:00Z'
          },
          {
            id: '25',
            name: 'בניין היי-טק',
            city: 'תל אביב',
            address: 'רחוב תובל 25',
            status: 'draft',
            createdAt: '2025-09-10T15:40:00Z'
          }
        ];

        setProjects(mockProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        project =>
          project.name.toLowerCase().includes(query) ||
          project.city.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    return filtered;
  }, [projects, searchQuery, statusFilter]);

  const sortedProjects = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return filteredProjects;
    }

    return [...filteredProjects].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      if (sortConfig.field === 'createdAt') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      const comparison = String(aValue).localeCompare(String(bValue), 'he');
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredProjects, sortConfig]);

  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = sortedProjects.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => {
      if (prevConfig.field === field) {
        if (prevConfig.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return { field: null, direction: null };
        }
      }
      return { field, direction: 'asc' };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const getStatusBadge = (status: Project['status']): { text: string; className: string } => {
    const statusMap: Record<Project['status'], { text: string; className: string }> = {
      draft: { text: 'טיוטה', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      submitted: { text: 'הוגש', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      approved: { text: 'אושר', className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { text: 'נדחה', className: 'bg-red-100 text-red-800 border-red-200' }
    };
    return statusMap[status];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const handleRowClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleViewProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    navigate(`/projects/${projectId}`);
  };

  const handleEditProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, project });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.project) {
      setProjects(prevProjects =>
        prevProjects.filter(p => p.id !== deleteDialog.project!.id)
      );
      setDeleteDialog({ isOpen: false, project: null });

      if (currentProjects.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, project: null });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpToPage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewProject = () => {
    navigate('/projects/new');
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => handlePageChange(page as number)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
          aria-label={`עמוד ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">טוען פרויקטים...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';
  const showingStart = sortedProjects.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, sortedProjects.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FolderOpen className="w-10 h-10 text-blue-600" />
                פרויקטים
              </h1>
              <p className="text-gray-600">ניהול ומעקב אחר כל הפרויקטים שלך</p>
            </div>
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              aria-label="יצירת פרויקט חדש"
            >
              <Plus className="w-5 h-5" />
              פרויקט חדש
            </button>
          </div>
        </header>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                חיפוש פרויקטים
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="חפש לפי שם פרויקט או עיר..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  aria-label="חיפוש פרויקטים"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="נקה חיפוש"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                סינון לפי סטטוס
              </label>
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  aria-label="סינון לפי סטטוס"
                >
                  <option value="all">הכל</option>
                  <option value="draft">טיוטה</option>
                  <option value="submitted">הוגש</option>
                  <option value="approved">אושר</option>
                  <option value="rejected">נדחה</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{sortedProjects.length}</span>
              {' '}תוצאות נמצאו
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                aria-label="נקה מסננים"
              >
                <X className="w-4 h-4" />
                נקה מסננים
              </button>
            )}
          </div>
        </section>

        {sortedProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-100">
            {hasActiveFilters ? (
              <>
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">לא נמצאו תוצאות</h3>
                <p className="text-gray-600 mb-6">
                  לא נמצאו פרויקטים התואמים את החיפוש שלך.
                  נסה לשנות את פרמטרי החיפוש או המסנן.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  <X className="w-5 h-5" />
                  נקה מסננים
                </button>
              </>
            ) : (
              <>
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">אין פרויקטים עדיין</h3>
                <p className="text-gray-600 mb-6">
                  התחל על ידי יצירת הפרויקט הראשון שלך
                </p>
                <button
                  onClick={handleNewProject}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  <Plus className="w-5 h-5" />
                  צור פרויקט חדש
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full" role="table" aria-label="טבלת פרויקטים">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                          aria-label="מיין לפי שם פרויקט"
                        >
                          שם הפרויקט
                          {getSortIcon('name')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('city')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                          aria-label="מיין לפי עיר"
                        >
                          עיר
                          {getSortIcon('city')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('address')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                          aria-label="מיין לפי כתובת"
                        >
                          כתובת
                          {getSortIcon('address')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                          aria-label="מיין לפי סטטוס"
                        >
                          סטטוס
                          {getSortIcon('status')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors"
                          aria-label="מיין לפי תאריך יצירה"
                        >
                          תאריך יצירה
                          {getSortIcon('createdAt')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProjects.map((project) => {
                      const statusBadge = getStatusBadge(project.status);
                      return (
                        <tr
                          key={project.id}
                          onClick={() => handleRowClick(project.id)}
                          className="hover:bg-blue-50 transition-colors cursor-pointer"
                          role="row"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleRowClick(project.id);
                            }
                          }}
                          aria-label={`פרויקט: ${project.name}`}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {project.city}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{project.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusBadge.className}`}
                            >
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(project.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleViewProject(e, project.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                aria-label={`צפה בפרויקט ${project.name}`}
                                title="צפה"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleEditProject(e, project.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                aria-label={`ערוך פרויקט ${project.name}`}
                                title="ערוך"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, project)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                aria-label={`מחק פרויקט ${project.name}`}
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
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  מציג {showingStart}-{showingEnd} מתוך {sortedProjects.length} פרויקטים
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="עמוד קודם"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {renderPageNumbers()}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="עמוד הבא"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="jump-to-page" className="text-sm text-gray-600 whitespace-nowrap">
                    קפוץ לעמוד:
                  </label>
                  <input
                    id="jump-to-page"
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleJumpToPage();
                      }
                    }}
                    placeholder="מספר"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="קפוץ לעמוד"
                  />
                  <button
                    onClick={handleJumpToPage}
                    disabled={!jumpToPage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    עבור
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {deleteDialog.isOpen && deleteDialog.project && (
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
              האם אתה בטוח שברצונך למחוק את הפרויקט:
            </p>
            <p className="text-gray-900 font-semibold mb-6">
              "{deleteDialog.project.name}"?
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
                כן, מחק פרויקט
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

export default ProjectsPage;
