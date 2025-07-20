import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth() as { user: User | null };
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-faith-blue rounded-lg flex items-center justify-center">
                <i className="fas fa-hands-helping text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Ministering Companion</h1>
                <p className="text-xs text-slate-500">Strengthening relationships through service</p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-slate-600">
                  {user?.firstName} {user?.lastName}
                </span>
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <a 
              href="/" 
              className={`flex items-center px-3 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive('/') 
                  ? 'text-faith-blue border-faith-blue' 
                  : 'text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-300'
              }`}
            >
              <i className="fas fa-home mr-2"></i>
              Dashboard
            </a>
            <a 
              href="/resources" 
              className={`flex items-center px-3 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive('/resources') 
                  ? 'text-faith-blue border-faith-blue' 
                  : 'text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-300'
              }`}
            >
              <i className="fas fa-book mr-2"></i>
              Resources
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-slate-500 mb-4 sm:mb-0">
              © 2024 Ministering Companion. Built with love to strengthen our communities.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
