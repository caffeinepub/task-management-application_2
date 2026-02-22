import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginButton from './components/LoginButton';
import ProfileSetupModal from './components/ProfileSetupModal';
import TaskList from './components/TaskList';
import CreateTaskForm from './components/CreateTaskForm';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { CheckSquare } from 'lucide-react';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Organize your work, achieve your goals</p>
                </div>
              </div>
              <LoginButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
              <div className="text-center max-w-md space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl">
                  <CheckSquare className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Welcome to TaskFlow</h2>
                  <p className="text-muted-foreground text-lg">
                    Your personal task management companion. Sign in to get started.
                  </p>
                </div>
                <div className="pt-4">
                  <LoginButton />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <CreateTaskForm />
              <TaskList />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-16 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} TaskFlow. Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-emerald-600 transition-colors font-medium"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>

        {/* Profile Setup Modal */}
        {showProfileSetup && <ProfileSetupModal />}
        
        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
