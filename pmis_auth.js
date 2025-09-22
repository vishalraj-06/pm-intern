// PM Internship Scheme Authentication Module
// This is a temporary implementation with hardcoded credentials

const PMISAuth = {
    // Hardcoded dummy credentials for testing
    dummyUsers: [
        {
            email: 'test@gmail.com',
            mobile: '9876543210',
            password: 'password123',
            name: 'John Doe'
        },
        {
            email: 'demo@gmail.com',
            mobile: '9123456789',
            password: 'demo123',
            name: 'Jane Smith'
        }
    ],

    // Get dummy credentials for display
    getDummyCredentials: function() {
        return this.dummyUsers[0]; // Return first user for display
    },

    // Login function
    login: function(identifier, password) {
        return new Promise((resolve, reject) => {
            // Simulate API delay
            setTimeout(() => {
                // Find user by email or mobile
                const user = this.dummyUsers.find(u => 
                    (u.email === identifier || u.mobile === identifier) && u.password === password
                );

                if (user) {
                    // Store user session in localStorage
                    const userSession = {
                        id: user.email,
                        name: user.name,
                        email: user.email,
                        loginTime: new Date().toISOString(),
                        isLoggedIn: true
                    };
                    localStorage.setItem('pmis_user_session', JSON.stringify(userSession));
                    console.log('Login successful for:', user.name);
                    resolve(userSession);
                } else {
                    reject(new Error('Invalid email/mobile or password'));
                }
            }, 500); // Simulate network delay
        });
    },

    // Register function
    register: function(userData) {
        return new Promise((resolve, reject) => {
            // Simulate API delay
            setTimeout(() => {
                // Basic validation
                if (!userData.name || !userData.email || !userData.mobile || !userData.password) {
                    reject(new Error('All fields are required'));
                    return;
                }

                // Check if user already exists
                const existingUser = this.dummyUsers.find(u => 
                    u.email === userData.email || u.mobile === userData.mobile
                );

                if (existingUser) {
                    reject(new Error('User with this email or mobile already exists'));
                    return;
                }

                // For now, just simulate successful registration
                // In real implementation, this would save to database
                console.log('Registration successful for:', userData.name);
                
                // Auto-login after registration
                const userSession = {
                    id: userData.email,
                    name: userData.name,
                    email: userData.email,
                    mobile: userData.mobile,
                    loginTime: new Date().toISOString(),
                    isLoggedIn: true
                };
                localStorage.setItem('pmis_user_session', JSON.stringify(userSession));
                resolve(userSession);
            }, 800); // Simulate network delay
        });
    },

    // Check if user is logged in
    isLoggedIn: function() {
        const session = localStorage.getItem('pmis_user_session');
        if (!session) return false;
        
        try {
            const userSession = JSON.parse(session);
            return userSession.isLoggedIn === true;
        } catch (e) {
            return false;
        }
    },

    // Get current user session
    getCurrentUser: function() {
        const session = localStorage.getItem('pmis_user_session');
        if (!session) return null;
        
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;
        }
    },

    // Logout function
    logout: function() {
        localStorage.removeItem('pmis_user_session');
        console.log('User logged out');
        return Promise.resolve();
    },

    // Initialize auth state on page load
    init: function() {
        console.log('PMISAuth initialized');
        
        // Display dummy credentials in console for developers
        console.log('=== DUMMY LOGIN CREDENTIALS ===');
        this.dummyUsers.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`Email: ${user.email}`);
            console.log(`Mobile: ${user.mobile}`);
            console.log(`Password: ${user.password}`);
            console.log('---');
        });
    }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', function() {
    PMISAuth.init();
});

// Export for use in other scripts (if needed)
window.PMISAuth = PMISAuth;