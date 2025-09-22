// API Service Layer for PM Internship Scheme
// This layer abstracts all database operations for easy Supabase integration

const ApiService = {
    // Configuration
    config: {
        baseUrl: 'https://ntuufkpnneqszfyzyzyv.supabase.co', // Replace with your Supabase URL
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dXVma3BubmVxc3pmeXp5enl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Nzc0OTAsImV4cCI6MjA3NDE1MzQ5MH0.MLmMu2KNZz8s1E81bFYgXqCkYQJyDz1Vt0XhlQgmvl8', // Replace with your Supabase anon key
        isDevelopment: false // Set to false in production
    },

    // Development mode - uses local data
    developmentData: {
        users: [
            {
                id: 1,
                email: 'test@gmail.com',
                mobile: '9876543210',
                password: 'password123',
                name: 'John Doe',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                email: 'demo@gmail.com',
                mobile: '9123456789',
                password: 'demo123',
                name: 'Jane Smith',
                created_at: new Date().toISOString()
            }
        ],
        internships: [
            {
                id: 'INT001',
                title: 'Software Development Intern',
                company: 'Tech Corp India',
                company_logo: 'https://via.placeholder.com/100x100/2d4f93/ffffff?text=TECH',
                location: 'Bangalore, Karnataka',
                type: 'paid',
                sector: 'Information Technology',
                area: 'Web Development',
                state: 'Karnataka',
                district: 'Bangalore Urban',
                opportunities: 25,
                remaining_slots: 20,
                description: 'Work on web applications using modern technologies',
                qualifications: 'Bachelor of Technology',
                course: 'Computer Science Engineering',
                specialization: 'Software Engineering',
                skills: 'JavaScript, HTML, CSS, React',
                preferred_gender: 'Any',
                salary: '₹25,000/month',
                duration: '6 months',
                is_top_company: true,
                created_at: new Date().toISOString()
            },
            {
                id: 'INT002',
                title: 'Digital Marketing Intern',
                company: 'Marketing Solutions Ltd',
                company_logo: 'https://via.placeholder.com/100x100/ff7a00/ffffff?text=MKT',
                location: 'Mumbai, Maharashtra',
                type: 'paid',
                sector: 'Marketing & Sales',
                area: 'Digital Marketing',
                state: 'Maharashtra',
                district: 'Mumbai',
                opportunities: 15,
                remaining_slots: 12,
                description: 'Assist in digital marketing campaigns and social media management',
                qualifications: 'Bachelor of Business Administration',
                course: 'Marketing',
                specialization: 'Digital Marketing',
                skills: 'SEO, Social Media, Google Analytics',
                preferred_gender: 'Any',
                salary: '₹20,000/month',
                duration: '4 months',
                is_top_company: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'INT003',
                title: 'Financial Analyst Intern',
                company: 'Finance Hub India',
                company_logo: 'https://via.placeholder.com/100x100/28a745/ffffff?text=FIN',
                location: 'New Delhi, Delhi',
                type: 'unpaid',
                sector: 'Banking & Finance',
                area: 'Financial Analysis',
                state: 'Delhi',
                district: 'New Delhi',
                opportunities: 10,
                remaining_slots: 3,
                description: 'Support financial analysis and reporting activities',
                qualifications: 'Bachelor of Commerce',
                course: 'Finance',
                specialization: 'Corporate Finance',
                skills: 'Excel, Financial Modeling, Analytics',
                preferred_gender: 'Any',
                salary: 'Certificate + Experience',
                duration: '3 months',
                is_top_company: true,
                created_at: new Date().toISOString()
            }
        ],
        applications: [],
        grievances: [],
        user_profiles: []
    },

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        if (this.config.isDevelopment) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            return this.handleLocalData(endpoint, options);
        }

        // Production API call to Supabase
        try {
            const response = await fetch(`${this.config.baseUrl}/rest/v1/${endpoint}`, {
                headers: {
                    'apikey': this.config.apiKey,
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    },

    // Handle local data operations (development mode)
    handleLocalData(endpoint, options) {
        const { method = 'GET', body } = options;
        
        switch (endpoint) {
            case 'users':
                if (method === 'POST') {
                    const userData = typeof body === 'string' ? JSON.parse(body) : body;
                    const newUser = {
                        id: Date.now(),
                        ...userData,
                        created_at: new Date().toISOString()
                    };
                    this.developmentData.users.push(newUser);
                    return [newUser];
                }
                return this.developmentData.users;
                
            case 'internships':
                return this.developmentData.internships;
                
            case 'applications':
                if (method === 'POST') {
                    const appData = typeof body === 'string' ? JSON.parse(body) : body;
                    const newApplication = {
                        id: Date.now(),
                        ...appData,
                        created_at: new Date().toISOString()
                    };
                    this.developmentData.applications.push(newApplication);
                    return [newApplication];
                }
                return this.developmentData.applications;
                
            case 'grievances':
                if (method === 'POST') {
                    const grievanceData = typeof body === 'string' ? JSON.parse(body) : body;
                    const newGrievance = {
                        id: Date.now(),
                        ...grievanceData,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    };
                    this.developmentData.grievances.push(newGrievance);
                    return [newGrievance];
                }
                return this.developmentData.grievances;
                
            case 'user_profiles':
                if (method === 'POST') {
                    const profileData = typeof body === 'string' ? JSON.parse(body) : body;
                    const newProfile = {
                        id: Date.now(),
                        ...profileData,
                        created_at: new Date().toISOString()
                    };
                    this.developmentData.user_profiles.push(newProfile);
                    return [newProfile];
                }
                return this.developmentData.user_profiles;
                
            default:
                return [];
        }
    },

    // User authentication methods
    async login(email, password) {
        const users = await this.apiCall('users');
        const user = users.find(u => 
            (u.email === email || u.mobile === email) && u.password === password
        );
        
        if (!user) {
            throw new Error('Invalid email/mobile or password');
        }
        
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile
        };
    },

    async register(userData) {
        // Check if user exists
        const users = await this.apiCall('users');
        const existingUser = users.find(u => 
            u.email === userData.email || u.mobile === userData.mobile
        );
        
        if (existingUser) {
            throw new Error('User with this email or mobile already exists');
        }
        
        // Create new user
        const result = await this.apiCall('users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        return result[0];
    },

    // Internship methods
    async getInternships(filters = {}) {
        let internships = await this.apiCall('internships');
        
        // Apply filters
        if (filters.location) {
            internships = internships.filter(i => 
                i.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }
        
        if (filters.type) {
            internships = internships.filter(i => i.type === filters.type);
        }
        
        if (filters.top_companies === 'true') {
            internships = internships.filter(i => i.is_top_company);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            internships = internships.filter(i => 
                i.title.toLowerCase().includes(searchTerm) ||
                i.company.toLowerCase().includes(searchTerm) ||
                i.area.toLowerCase().includes(searchTerm) ||
                i.sector.toLowerCase().includes(searchTerm)
            );
        }

        // Capacity filter: keep internships with remaining slots > 0 if field exists
        internships = internships.filter(i => (typeof i.remaining_slots === 'number' ? i.remaining_slots > 0 : true));

        // Sort by remaining capacity desc, then by top company, then by opportunities desc
        internships.sort((a, b) => {
            const ra = typeof a.remaining_slots === 'number' ? a.remaining_slots : a.opportunities || 0;
            const rb = typeof b.remaining_slots === 'number' ? b.remaining_slots : b.opportunities || 0;
            if (rb !== ra) return rb - ra;
            if (!!b.is_top_company !== !!a.is_top_company) return (b.is_top_company ? 1 : 0) - (a.is_top_company ? 1 : 0);
            return (b.opportunities || 0) - (a.opportunities || 0);
        });
        
        return internships;
    },

    async getInternshipById(id) {
        const internships = await this.apiCall('internships');
        return internships.find(i => i.id === id);
    },

    // Application methods
    async applyToInternship(userId, internshipId, applicationData) {
        const application = {
            user_id: userId,
            internship_id: internshipId,
            ...applicationData
        };
        
        const result = await this.apiCall('applications', {
            method: 'POST',
            body: JSON.stringify(application)
        });
        
        return result[0];
    },

    async getUserApplications(userId) {
        const applications = await this.apiCall('applications');
        return applications.filter(app => app.user_id === userId);
    },

    // Participation count helper (dev mode only; in prod use Supabase view or RPC)
    async getParticipationCount(userId) {
        const applications = await this.getUserApplications(userId);
        // In real setup, completed status would come from backend; assume all are active here
        return applications.length;
    },

    async withdrawApplication(applicationId) {
        // In development mode, remove from array
        if (this.config.isDevelopment) {
            const index = this.developmentData.applications.findIndex(app => app.id === applicationId);
            if (index > -1) {
                this.developmentData.applications.splice(index, 1);
                return { success: true };
            }
        }
        
        // In production, make DELETE request to Supabase
        return await this.apiCall(`applications?id=eq.${applicationId}`, {
            method: 'DELETE'
        });
    },

    // Profile methods
    async saveUserProfile(userId, profileData) {
        const profile = {
            user_id: userId,
            ...profileData
        };
        
        const result = await this.apiCall('user_profiles', {
            method: 'POST',
            body: JSON.stringify(profile)
        });
        
        return result[0];
    },

    async getUserProfile(userId) {
        const profiles = await this.apiCall('user_profiles');
        const raw = profiles.find(p => p.user_id === userId);
        if (!raw) return undefined;
        // Normalize snake_case to camelCase for UI compatibility
        const normalized = {
            ...raw,
            candidateName: raw.candidate_name || raw.candidateName,
            guardianName: raw.guardian_name || raw.guardianName,
            mobileNumber: raw.mobile_number || raw.mobileNumber,
            emailAddress: raw.email_address || raw.emailAddress,
            houseNo: raw.house_no || raw.houseNo,
            addressLine1: raw.address_line1 || raw.addressLine1,
            addressLine2: raw.address_line2 || raw.addressLine2,
            zipCode: raw.zip_code || raw.zipCode,
            preferredLocation: raw.preferred_location || raw.preferredLocation,
            preferredIndustry: raw.preferred_industry || raw.preferredIndustry,
            yearOfPassing: raw.year_of_passing || raw.yearOfPassing
        };
        return normalized;
    },

    // Grievance methods
    async submitGrievance(userId, grievanceData) {
        const grievance = {
            user_id: userId,
            ...grievanceData
        };
        
        const result = await this.apiCall('grievances', {
            method: 'POST',
            body: JSON.stringify(grievance)
        });
        
        return result[0];
    },

    async getUserGrievances(userId) {
        const grievances = await this.apiCall('grievances');
        return grievances.filter(g => g.user_id === userId);
    },

    // Utility methods
    calculateMatchScore(userProfile, internship) {
        if (!userProfile) return Math.floor(Math.random() * 40) + 60; // Random 60-100% if no profile
        
        let score = 0;
        let factors = 0;
        
        // Education match (30% weight)
        if (userProfile.qualification === internship.qualifications) {
            score += 30;
        } else if (userProfile.qualification && internship.qualifications) {
            score += 15; // Partial match
        }
        factors += 30;
        
        // Skills match (25% weight)
        if (userProfile.skills && internship.skills) {
            const userSkills = userProfile.skills.toLowerCase().split(',');
            const jobSkills = internship.skills.toLowerCase().split(',');
            const matchingSkills = userSkills.filter(skill => 
                jobSkills.some(jobSkill => jobSkill.trim().includes(skill.trim()))
            );
            score += Math.min(25, (matchingSkills.length / jobSkills.length) * 25);
        }
        factors += 25;
        
        // Location preference (20% weight)
        if (userProfile.preferred_location && internship.location) {
            if (internship.location.toLowerCase().includes(userProfile.preferred_location.toLowerCase())) {
                score += 20;
            }
        } else {
            score += 10; // Neutral if no preference
        }
        factors += 20;
        
        // Experience level (15% weight)
        score += 15; // Assuming entry level for interns
        factors += 15;
        
        // Random factor for realism (10% weight)
        score += Math.random() * 10;
        factors += 10;
        
        return Math.min(100, Math.floor(score));
    },

    // Company data for swiper
    getCompanyLogos() {
        return [
            { name: 'ACC', logo: 'https://via.placeholder.com/120x60/2d4f93/ffffff?text=ACC' },
            { name: 'ZOHO', logo: 'https://via.placeholder.com/120x60/ff7a00/ffffff?text=ZOHO' },
            { name: 'BPCL', logo: 'https://via.placeholder.com/120x60/28a745/ffffff?text=BPCL' },
            { name: 'SBI', logo: 'https://via.placeholder.com/120x60/dc3545/ffffff?text=SBI' },
            { name: 'Titan', logo: 'https://via.placeholder.com/120x60/6f42c1/ffffff?text=TITAN' },
            { name: 'CCL', logo: 'https://via.placeholder.com/120x60/fd7e14/ffffff?text=CCL' },
            { name: 'Reliance', logo: 'https://via.placeholder.com/120x60/e83e8c/ffffff?text=RIL' },
            { name: 'Infosys', logo: 'https://via.placeholder.com/120x60/20c997/ffffff?text=INFY' },
            { name: 'TCS', logo: 'https://via.placeholder.com/120x60/0dcaf0/ffffff?text=TCS' },
            { name: 'Wipro', logo: 'https://via.placeholder.com/120x60/6610f2/ffffff?text=WIPRO' }
        ];
    }
};

// Export to global scope
window.ApiService = ApiService;