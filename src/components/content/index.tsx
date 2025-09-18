import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle,
  FileText,
  Settings,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Image,
  ChevronRight,
  Plus,
  TrendingUp
} from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  stats?: {
    total: number;
    published: number;
    drafts: number;
  };
  bgColor: string;
  iconColor: string;
}

const Content = () => {
  const navigate = useNavigate();

  // Mock stats data - replace with actual API data
  const contentSections: ContentSection[] = [
    {
      id: 'faq',
      title: 'FAQ Management',
      description: 'Manage frequently asked questions and help articles',
      icon: HelpCircle,
      route: '/faq',
      stats: { total: 12, published: 10, drafts: 2 },
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];



  const handleSectionClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage all your website content from one place
                </p>
              </div>
            </div>
           
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* Main Content Sections */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentSections.map((section) => (
              <div
                key={section.id}
                onClick={() => handleSectionClick(section.route)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${section.bgColor} rounded-lg`}>
                    <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {section.stats && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-600">
                        <span className="font-medium text-gray-900">{section.stats.total}</span> total
                      </div>
                      <div className="text-green-600">
                        <span className="font-medium">{section.stats.published}</span> published
                      </div>
                      {section.stats.drafts > 0 && (
                        <div className="text-yellow-600">
                          <span className="font-medium">{section.stats.drafts}</span> drafts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
