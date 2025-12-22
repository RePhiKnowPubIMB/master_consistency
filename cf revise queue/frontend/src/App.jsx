import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ProblemForm from './components/ProblemForm';
import ProblemList from './components/ProblemList';
import api from './utils/api';
import toast from 'react-hot-toast';

function App() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch problems on mount
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.getProblems();
      
      if (response.data.success) {
        setProblems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddProblem = async (problemLink) => {
    try {
      const response = await api.addProblem(problemLink);
      
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchProblems();
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add problem';
      toast.error(message);
      return false;
    }
  };

  const handlePopProblem = async () => {
    if (problems.length === 0) {
      toast.error('No problems in the queue');
      return;
    }

    try {
      const response = await api.popProblem();
      
      if (response.data.success) {
        const poppedProblem = response.data.data;
        toast.success(
          <div>
            <div className="font-semibold">Problem Popped!</div>
            <a 
              href={poppedProblem.problemLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Click to solve
            </a>
          </div>,
          { duration: 5000 }
        );
        await fetchProblems();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to pop problem';
      toast.error(message);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    try {
      const response = await api.deleteProblem(problemId);
      
      if (response.data.success) {
        toast.success('Problem deleted successfully');
        await fetchProblems();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete problem';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-fade-in">
          <ProblemForm 
            onAddProblem={handleAddProblem}
            onPopProblem={handlePopProblem}
            problemCount={problems.length}
          />
          
          <ProblemList 
            problems={problems}
            loading={loading}
            refreshing={refreshing}
            onRefresh={() => fetchProblems(true)}
            onDeleteProblem={handleDeleteProblem}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
