export const setUserData = (userData) => {
    if (userData) {
        localStorage.setItem("userData", JSON.stringify(userData));
    } else {
        localStorage.removeItem("userData");
    }
};

export const getUserData = () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
    localStorage.removeItem("userData");
};

export const logout = async () => {
    const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${BASE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    
    const data = await response.json(); 
    
    if (data.success) {
        removeUserData();
        return data.message;
    }
    
    return data.message;
};


export const initializeUserDataWatcher = () => {
    if (typeof window === 'undefined') return;

    // Listen for storage events (when localStorage is modified in other tabs/windows)
    window.addEventListener('storage', async (e) => {
        if (e.key === 'userData' && e.newValue === null) {
            // userData was deleted, try to reinitialize
            await reinitializeUserData();
        }
    });

    // Also check periodically if userData was deleted manually
    setInterval(async () => {
        const userData = getUserData();
        if (!userData) {
            // Check if user is still authenticated via cookie
            await reinitializeUserData();
        }
    }, 5000); // Check every 5 seconds
};

// Reinitialize userData from backend if user is still authenticated
export const reinitializeUserData = async () => {
    try {
        const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${BASE_API_URL}/api/auth/verify`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();
        
        if (data.success && data.data) {
            // User is still authenticated, restore userData
            setUserData(data.data);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error reinitializing userData:', error);
        return false;
    }
};

export const verifyAuth = async () => {
    try {
        const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${BASE_API_URL}/api/auth/verify`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();
        
        if (!data.success) {
            removeUserData();
            return false;
        }
        
        // If userData is missing but auth is successful, restore it
        if (data.success && data.data) {
            const currentUserData = getUserData();
            if (!currentUserData) {
                setUserData(data.data);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Auth verification error:', error);
        return false;
    }
};
