import { useState, useEffect } from 'react';
import { useStore } from './store';
import { cn } from './lib/utils';
import { LibraryView } from './components/LibraryView';
import { CertView } from './components/CertView';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { StatsView } from './components/StatsView';
import { QuizSession } from './types';

export type ViewType = 'library' | 'cert' | 'quiz' | 'result' | 'stats';

export default function App() {
  const { data } = useStore();
  const [view, setView] = useState<ViewType>('library');
  const [activeCertId, setActiveCertId] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);

  const navigate = (v: ViewType) => setView(v);

  return (
    <div className={cn("max-w-2xl mx-auto min-h-screen bg-background relative flex flex-col")}>
      {view === 'library' && (
        <LibraryView 
          onOpenCert={(id) => { setActiveCertId(id); navigate('cert'); }} 
        />
      )}
      {view === 'cert' && activeCertId && (
        <CertView 
          certId={activeCertId} 
          onBack={() => navigate('library')}
          onStartQuiz={(sess) => { setSession(sess); navigate('quiz'); }}
          onOpenStats={() => navigate('stats')}
        />
      )}
      {view === 'quiz' && session && (
        <QuizView 
          session={session}
          onUpdateSession={setSession}
          onQuit={() => { setSession(null); navigate('cert'); }}
          onFinish={(completedSession) => { setSession(completedSession); navigate('result'); }}
        />
      )}
      {view === 'result' && session && (
        <ResultView 
          session={session}
          onBack={() => { setSession(null); navigate('cert'); }}
          onRetryWrong={(newSession) => { setSession(newSession); navigate('quiz'); }}
        />
      )}
      {view === 'stats' && activeCertId && (
        <StatsView 
          certId={activeCertId}
          onBack={() => navigate('cert')}
          onStartQuiz={(sess) => { setSession(sess); navigate('quiz'); }}
        />
      )}
    </div>
  );
}
