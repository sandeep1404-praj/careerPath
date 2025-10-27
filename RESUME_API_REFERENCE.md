# Resume API Quick Reference

## Import the API

```javascript
import { resumeAPI, getInitialResumeData } from '@/api/resumeApi';
import { useAuth } from '@/contexts/AuthContext';
```

## API Methods

### 1. Create Resume

```javascript
const { user } = useAuth();

const newResume = {
  ...getInitialResumeData(),
  title: 'My Resume',
  userId: user._id,
  profileInfo: {
    fullName: 'John Doe',
    designation: 'Software Engineer',
    summary: 'Experienced developer...'
  }
};

try {
  const response = await resumeAPI.createResume(newResume);
  console.log('Created:', response.resume);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 2. Get User Resumes

```javascript
const { user } = useAuth();

try {
  const response = await resumeAPI.getUserResumes(user._id);
  console.log('Resumes:', response.resumes);
  // response.resumes is an array
} catch (error) {
  console.error('Error:', error.message);
}
```

### 3. Get Single Resume

```javascript
const resumeId = 'resume_id_here';

try {
  const response = await resumeAPI.getResumeById(resumeId);
  console.log('Resume:', response.resume);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 4. Update Resume

```javascript
const resumeId = 'resume_id_here';
const updates = {
  title: 'Updated Title',
  profileInfo: {
    fullName: 'Jane Doe',
    designation: 'Senior Engineer'
  }
};

try {
  const response = await resumeAPI.updateResume(resumeId, updates);
  console.log('Updated:', response.resume);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 5. Delete Resume

```javascript
const resumeId = 'resume_id_here';

try {
  const response = await resumeAPI.deleteResume(resumeId);
  console.log('Deleted:', response.message);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 6. Get All Resumes (with pagination)

```javascript
const params = {
  page: 1,
  limit: 10,
  search: 'software'
};

try {
  const response = await resumeAPI.getAllResumes(params);
  console.log('Resumes:', response.resumes);
  console.log('Total:', response.total);
} catch (error) {
  console.error('Error:', error.message);
}
```

## React Component Examples

### Fetch Resumes on Component Mount

```javascript
import { useState, useEffect } from 'react';
import { resumeAPI } from '@/api/resumeApi';
import { useAuth } from '@/contexts/AuthContext';

function MyResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const response = await resumeAPI.getUserResumes(user._id);
        setResumes(response.resumes);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchResumes();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {resumes.map(resume => (
        <div key={resume._id}>{resume.title}</div>
      ))}
    </div>
  );
}
```

### Create Resume Handler

```javascript
import { resumeAPI, getInitialResumeData } from '@/api/resumeApi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';

function CreateResumeButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const newResume = {
        ...getInitialResumeData(),
        userId: user._id
      };
      
      const response = await resumeAPI.createResume(newResume);
      toast.success('Resume created!');
      navigate(`/resumes/edit/${response.resume._id}`);
    } catch (error) {
      toast.error('Failed to create resume');
      console.error(error);
    }
  };

  return (
    <button onClick={handleCreate}>
      Create New Resume
    </button>
  );
}
```

### Update Resume Handler

```javascript
import { useState } from 'react';
import { resumeAPI } from '@/api/resumeApi';
import { toast } from '@/utils/toast';

function EditResume({ resumeId, initialData }) {
  const [resumeData, setResumeData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await resumeAPI.updateResume(resumeId, resumeData);
      toast.success('Resume updated!');
    } catch (error) {
      toast.error('Failed to update resume');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Form fields */}
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
```

### Delete Resume Handler

```javascript
import { resumeAPI } from '@/api/resumeApi';
import { toast } from '@/utils/toast';

function DeleteResumeButton({ resumeId, onDeleted }) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await resumeAPI.deleteResume(resumeId);
      toast.success('Resume deleted!');
      onDeleted?.(resumeId);
    } catch (error) {
      toast.error('Failed to delete resume');
      console.error(error);
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600">
      Delete
    </button>
  );
}
```

## Initial Resume Template

```javascript
import { getInitialResumeData } from '@/api/resumeApi';

const template = getInitialResumeData();

// Returns:
{
  title: 'Untitled Resume',
  thumbnail: '',
  template: {
    theme: 'modern',
    colorPalette: ['#3B82F6', '#1E40AF', '#60A5FA']
  },
  profileInfo: {
    profilePreviewUrl: '',
    fullName: '',
    designation: '',
    summary: ''
  },
  contactInfo: {
    email: '',
    phoneNo: '',
    location: '',
    linkedin: '',
    github: '',
    website: ''
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  languages: [],
  interests: []
}
```

## Error Handling

```javascript
try {
  const response = await resumeAPI.getUserResumes(userId);
  // Success
} catch (error) {
  if (error.message.includes('Unable to connect')) {
    // Backend is not running
    console.error('Backend server is offline');
  } else if (error.message.includes('401')) {
    // Unauthorized
    console.error('User not authenticated');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

## Authentication

All API calls automatically include the JWT token from localStorage. Make sure:

1. User is logged in
2. Token is stored in localStorage with key `'token'`
3. Token is valid and not expired

```javascript
// Check if user is authenticated
import { useAuth } from '@/contexts/AuthContext';

const { isAuthenticated, user, token } = useAuth();

if (!isAuthenticated) {
  // Redirect to login
  navigate('/login');
}
```

## Response Format

All API responses follow this pattern:

### Success Response

```javascript
{
  success: true,
  message: "Operation successful",
  resume: { /* resume object */ },
  // or
  resumes: [ /* array of resumes */ ],
  total: 10 // for paginated responses
}
```

### Error Response

```javascript
{
  success: false,
  message: "Error description"
}
```

The API wrapper automatically throws an Error with the message, so you can catch it in try-catch blocks.

## Common Patterns

### Loading State Pattern

```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resumeAPI.getUserResumes(userId);
      setData(response.resumes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [userId]);
```

### Optimistic Update Pattern

```javascript
const handleDelete = async (resumeId) => {
  // Optimistically remove from UI
  setResumes(resumes.filter(r => r._id !== resumeId));
  
  try {
    await resumeAPI.deleteResume(resumeId);
    toast.success('Deleted!');
  } catch (error) {
    // Revert on error
    const response = await resumeAPI.getUserResumes(userId);
    setResumes(response.resumes);
    toast.error('Failed to delete');
  }
};
```

## Tips

1. **Always check user authentication** before making API calls
2. **Use try-catch** for all async operations
3. **Show loading states** during API calls
4. **Display error messages** to users via toast
5. **Validate data** before sending to API
6. **Handle network errors** gracefully
7. **Use proper TypeScript types** if using TypeScript

---

This API is production-ready and follows REST conventions! 🚀
