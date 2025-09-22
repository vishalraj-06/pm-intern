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
            // Prefer ApiService login to ensure consistent user IDs
            if (typeof window.ApiService !== 'undefined' && window.ApiService && typeof window.ApiService.login === 'function') {
                window.ApiService.login(identifier, password)
                    .then(user => {
                        const userSession = {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            mobile: user.mobile,
                            loginTime: new Date().toISOString(),
                            isLoggedIn: true
                        };
                        localStorage.setItem('pmis_user_session', JSON.stringify(userSession));
                        resolve(userSession);
                    })
                    .catch(err => {
                        // Fallback to dummy users if ApiService login fails (dev convenience)
                        setTimeout(() => {
                            const user = this.dummyUsers.find(u => 
                                (u.email === identifier || u.mobile === identifier) && u.password === password
                            );

                            if (user) {
                                const userSession = {
                                    id: user.email,
                                    name: user.name,
                                    email: user.email,
                                    mobile: user.mobile,
                                    loginTime: new Date().toISOString(),
                                    isLoggedIn: true
                                };
                                localStorage.setItem('pmis_user_session', JSON.stringify(userSession));
                                resolve(userSession);
                            } else {
                                reject(new Error(err && err.message ? err.message : 'Invalid email/mobile or password'));
                            }
                        }, 300);
                    });
                return;
            }

            // Legacy dummy login (no ApiService available)
            setTimeout(() => {
                const user = this.dummyUsers.find(u => 
                    (u.email === identifier || u.mobile === identifier) && u.password === password
                );

                if (user) {
                    const userSession = {
                        id: user.email,
                        name: user.name,
                        email: user.email,
                        loginTime: new Date().toISOString(),
                        isLoggedIn: true
                    };
                    localStorage.setItem('pmis_user_session', JSON.stringify(userSession));
                    resolve(userSession);
                } else {
                    reject(new Error('Invalid email/mobile or password'));
                }
            }, 500);
        });
    },

    // Register function
    register: function(userData) {
        return new Promise((resolve, reject) => {
            // Basic validation
            if (!userData || !userData.name || !userData.email || !userData.mobile || !userData.password) {
                reject(new Error('All fields are required'));
                return;
            }

            // If ApiService is available, use it to create user and profile
            if (typeof window.ApiService !== 'undefined' && window.ApiService && typeof window.ApiService.register === 'function') {
                window.ApiService.register({
                    name: userData.name,
                    email: userData.email,
                    mobile: userData.mobile,
                    password: userData.password
                }).then(createdUser => {
                    const userId = createdUser.id;

                    // Persist profile details captured during registration
                    if (typeof window.ApiService.saveUserProfile === 'function') {
                        const profilePayload = {
                            candidate_name: userData.name,
                            mobile_number: userData.mobile,
                            email_address: userData.email,
                            qualification: userData.qualification,
                            course: userData.course,
                            specialization: userData.specialization,
                            skills: userData.skills,
                            preferred_location: userData.preferredLocation,
                            preferred_industry: userData.preferredIndustry,
                            state: userData.state,
                            district: userData.district,
                            career_goals: userData.careerGoals,
                            internship_type: userData.internshipType,
                            duration_preference: userData.durationPreference
                        };
                        console.log('Saving profile for user:', userId, profilePayload);
                        return window.ApiService.saveUserProfile(userId, profilePayload).then(result => {
                            console.log('Profile saved successfully:', result);
                            return result;
                        }).catch(err => {
                            console.error('Failed to save profile:', err);
                            return null;
                        });
                    }
                    return null;
                }).then(() => {
                    // Auto-login after registration using ApiService login
                    return this.login(userData.email, userData.password);
                }).then(session => {
                    resolve(session);
                }).catch(err => {
                    // Fallback to legacy behavior if ApiService is unavailable or fails
                    setTimeout(() => {
                        const existingUser = this.dummyUsers.find(u => 
                            u.email === userData.email || u.mobile === userData.mobile
                        );
                        if (existingUser) {
                            reject(new Error('User with this email or mobile already exists'));
                            return;
                        }
                        // Simulate success and auto-login
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
                    }, 800);
                });
                return;
            }

            // Legacy fallback registration (no ApiService)
            setTimeout(() => {
                const existingUser = this.dummyUsers.find(u => 
                    u.email === userData.email || u.mobile === userData.mobile
                );

                if (existingUser) {
                    reject(new Error('User with this email or mobile already exists'));
                    return;
                }

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
            }, 800);
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
        return Promise.resolve();
    },

    // Initialize auth state on page load
    init: function() {
        // Display dummy credentials in console for developers
        try {
            console.log('=== DUMMY LOGIN CREDENTIALS ===');
            this.dummyUsers.forEach((user, index) => {
                console.log(`User ${index + 1}:`);
                console.log(`Email: ${user.email}`);
                console.log(`Mobile: ${user.mobile}`);
                console.log(`Password: ${user.password}`);
                console.log('---');
            });
        } catch (e) {}
    }
};

document.addEventListener('DOMContentLoaded', function() {
    PMISAuth.init();
});

window.PMISAuth = PMISAuth;