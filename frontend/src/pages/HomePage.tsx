import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, BarChart3, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: 'עיבוד מהיר',
      description: 'עיבוד בקשות הרשאות בנייה בדקות במקום שבועות'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: 'ניתוח חכם',
      description: 'בדיקה אוטומטית של תקנות ודרישות בנייה בעזרת AI'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'ציות מובטח',
      description: 'הבטח ציות מלא לתקנות המקומיות והארציות'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-orange-600" />,
      title: 'שקיפות מלאה',
      description: 'עקוב אחר מצב בקשתך בזמן אמת'
    }
  ];

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Building Permit Platform</h1>
            <div className="flex gap-6">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                כניסה
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                הרשמה
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                הפלטפורמה החכמה להרשאות בנייה
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                שימוש בטכנולוגיית AI להפחתת זמן השכרה וההגשה של בקשות הרשאות בנייה. קבל אישור מהיר וביעיל.
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                aria-label="התחל עכשיו"
              >
                התחל עכשיו
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center shadow-2xl">
                <div className="text-white text-center">
                  <BarChart3 className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg font-semibold">ניתוח תקנות חכם</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20" role="region" aria-label="תכונות הפלטפורמה">
          <div className="container mx-auto px-4 max-w-7xl">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">תכונות עיקריות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  role="article"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
            <h3 className="text-4xl font-bold mb-4">מוכן להתחיל?</h3>
            <p className="text-lg mb-8 opacity-90">
              הצטרף לאלפי משתמשים שחוסכים זמן וכסף עם הפלטפורמה שלנו
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              aria-label="התחל עכשיו"
            >
              התחל עכשיו
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Building Permit Platform. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
