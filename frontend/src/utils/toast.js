// Toast utility using react-hot-toast
import toast from 'react-hot-toast';

// Re-export the toast instance with custom defaults
const customToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ',
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: '',
      style: {
        background: '#F59E0B',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        position: 'top-right',
        style: {
          padding: '16px',
          borderRadius: '8px',
        },
        ...options,
      }
    );
  },

  dismiss: (toastId) => {
    return toast.dismiss(toastId);
  },

  remove: (toastId) => {
    return toast.remove(toastId);
  },
};

export { customToast as toast };
export default customToast;
