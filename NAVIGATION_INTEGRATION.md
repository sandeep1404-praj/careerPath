# Navigation Integration Example

## Adding Resume Builder to Your Navigation

Here are examples of how to add Resume Builder links to your navigation components.

### Option 1: Add to Main Navbar

If you have a `Navbar.jsx` component, add this link:

```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav>
      {/* Other nav items */}
      
      {isAuthenticated && (
        <>
          <Link 
            to="/dashboard"
            className="nav-link"
          >
            Dashboard
          </Link>
          
          {/* Resume Builder Link */}
          <Link 
            to="/resumes"
            className="nav-link flex items-center gap-2"
          >
            📄 My Resumes
          </Link>
          
          <Link 
            to="/profile"
            className="nav-link"
          >
            Profile
          </Link>
        </>
      )}
    </nav>
  );
};
```

### Option 2: Add to Dashboard

Update your `Dashboard.jsx` to include a Resume section:

```jsx
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Roadmap Card */}
        <div className="card">
          <h3>Career Roadmap</h3>
          <p>Track your learning path</p>
          <button onClick={() => navigate('/roadmaps')}>
            View Roadmaps
          </button>
        </div>
        
        {/* Resume Builder Card */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-4xl mb-2">📄</div>
          <h3 className="text-xl font-bold mb-2">Resume Builder</h3>
          <p className="text-gray-600 mb-4">
            Create and manage professional resumes
          </p>
          <button 
            onClick={() => navigate('/resumes')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            My Resumes
          </button>
        </div>
        
        {/* Other dashboard cards */}
      </div>
    </div>
  );
};
```

### Option 3: Add Quick Action Button

Add a floating action button for quick resume creation:

```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const QuickActions = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Create Resume Button */}
      <button
        onClick={() => navigate('/resumes/new')}
        className="group relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        title="Create New Resume"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Create Resume
        </span>
      </button>
      
      {/* View All Resumes Button */}
      <button
        onClick={() => navigate('/resumes')}
        className="group relative bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110"
        title="View All Resumes"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          My Resumes
        </span>
      </button>
    </div>
  );
};

export default QuickActions;
```

Then add it to your App.jsx or main layout:

```jsx
// In App.jsx or AppLayout.jsx
import QuickActions from '@/components/QuickActions';

function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <QuickActions />  {/* Add this */}
    </>
  );
}
```

### Option 4: Update Sidebar Navigation

If you have a sidebar:

```jsx
const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      path: '/dashboard', 
      icon: '🏠', 
      label: 'Dashboard' 
    },
    { 
      path: '/roadmaps', 
      icon: '🗺️', 
      label: 'Roadmaps' 
    },
    { 
      path: '/resumes', 
      icon: '📄', 
      label: 'Resume Builder' 
    },
    { 
      path: '/profile', 
      icon: '👤', 
      label: 'Profile' 
    },
    { 
      path: '/settings', 
      icon: '⚙️', 
      label: 'Settings' 
    },
  ];

  return (
    <aside className="sidebar">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </aside>
  );
};
```

### Option 5: Add to User Profile Menu

```jsx
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        {user?.name}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <Link to="/profile">Profile</Link>
          <Link to="/roadmaps">My Roadmaps</Link>
          <Link to="/resumes">My Resumes</Link>  {/* Add this */}
          <Link to="/settings">Settings</Link>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};
```

## Usage Tips

### 1. Conditional Rendering
Only show resume links to authenticated users:

```jsx
{isAuthenticated && (
  <Link to="/resumes">My Resumes</Link>
)}
```

### 2. Active State
Highlight the active route:

```jsx
const isActive = location.pathname.startsWith('/resumes');

<Link 
  to="/resumes"
  className={`nav-link ${isActive ? 'active' : ''}`}
>
  Resumes
</Link>
```

### 3. Badge for Resume Count
Show the number of resumes:

```jsx
const [resumeCount, setResumeCount] = useState(0);

useEffect(() => {
  if (user?._id) {
    resumeAPI.getUserResumes(user._id)
      .then(res => setResumeCount(res.resumes?.length || 0));
  }
}, [user]);

<Link to="/resumes" className="relative">
  My Resumes
  {resumeCount > 0 && (
    <span className="badge">{resumeCount}</span>
  )}
</Link>
```

### 4. Mobile Menu
For mobile responsive menu:

```jsx
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)}>
        ☰ Menu
      </button>
      
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/roadmaps">Roadmaps</Link>
          <Link to="/resumes">Resume Builder</Link>
          <Link to="/profile">Profile</Link>
        </div>
      )}
    </div>
  );
};
```

Choose the option that best fits your existing navigation structure!
