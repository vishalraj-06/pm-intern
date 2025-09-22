// AI Recommendation Engine
// Orchestrates LLM service and data processing for intelligent internship matching

const AIRecommendationEngine = {
    // Engine state
    isInitialized: false,
    isLLMConnected: false,
    userProfile: null,
    recommendations: [],
    
    // Cache for performance
    cache: {
        lastUserProfileHash: null,
        lastRecommendations: null,
        cacheTimestamp: null,
        cacheValidityMs: 5 * 60 * 1000 // 5 minutes
    },

    // Initialize the AI recommendation engine
    async initialize() {
        console.log('🤖 Initializing AI Recommendation Engine...');
        
        try {
            // Initialize data processor
            await DataProcessor.initialize();
            
            // Test LLM connection
            this.isLLMConnected = await LLMService.testConnection();
            
            if (this.isLLMConnected) {
                console.log('✅ AI Engine ready with LLM support');
            } else {
                console.log('⚠️ AI Engine ready with fallback mode (no LLM connection)');
            }
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize AI Engine:', error);
            this.isInitialized = false;
            return false;
        }
    },

    // Generate personalized recommendations for a user
    async generateRecommendations(userProfile, forceRefresh = false) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        console.log('🎯 Generating personalized recommendations...');
        
        try {
            // Check cache first
            const profileHash = this.hashUserProfile(userProfile);
            if (!forceRefresh && this.isCacheValid(profileHash)) {
                console.log('📦 Returning cached recommendations');
                return this.cache.lastRecommendations;
            }

            // Get filtered internship data based on user preferences
            const internshipData = this.getPreFilteredInternships(userProfile);
            
            console.log(`📊 Found ${internshipData.length} potentially matching internships`);

            let recommendations;
            
            if (this.isLLMConnected && internshipData.length > 0) {
                // Use AI-powered recommendations
                console.log('🧠 Using AI-powered matching...');
                recommendations = await LLMService.generateRecommendations(
                    userProfile, 
                    internshipData
                );
            } else {
                // Use rule-based fallback
                console.log('⚙️ Using rule-based matching...');
                recommendations = this.generateRuleBasedRecommendations(userProfile, internshipData);
            }

            // Add additional metadata and sort
            recommendations = this.enhanceRecommendations(recommendations, userProfile);
            
            // Cache the results
            this.updateCache(profileHash, recommendations);
            
            console.log(`✨ Generated ${recommendations.length} personalized recommendations`);
            return recommendations;
            
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            // Return fallback recommendations
            return this.getFallbackRecommendations();
        }
    },

    // Pre-filter internships based on user preferences for efficiency
    getPreFilteredInternships(userProfile) {
        const filters = {};
        
        // Add location filter if user has preference
        if (userProfile.preferredLocation && userProfile.preferredLocation !== 'Any') {
            filters.location = userProfile.preferredLocation;
        }
        
        // Add state filter if user specified
        if (userProfile.state) {
            filters.state = userProfile.state;
        }
        
        // Get filtered data
        let filtered = DataProcessor.filterInternships(filters);
        
        // Limit to reasonable number for LLM processing
        if (filtered.length > 50) {
            // Prioritize paid internships and recent postings
            filtered = filtered
                .sort((a, b) => {
                    // Prioritize paid internships
                    if (a.isPaid !== b.isPaid) {
                        return b.isPaid - a.isPaid;
                    }
                    // Then by number of openings (more opportunities)
                    const aOpenings = parseInt(a['Numer of Openings']) || 0;
                    const bOpenings = parseInt(b['Numer of Openings']) || 0;
                    return bOpenings - aOpenings;
                })
                .slice(0, 50);
        }
        
        return filtered;
    },

    // Generate rule-based recommendations as fallback
    generateRuleBasedRecommendations(userProfile, internshipData) {
        console.log('🔧 Generating rule-based recommendations...');
        
        // Score each internship
        const scoredInternships = internshipData.map(internship => {
            const score = this.calculateCompatibilityScore(userProfile, internship);
            return {
                ...internship,
                compatibility_score: score,
                ai_match_score: Math.min(95, score + Math.floor(Math.random() * 10)),
                ai_reasoning: this.generateReasoningText(userProfile, internship, score),
                recommended_by_ai: false
            };
        });

        // Sort by score and return top 10
        return scoredInternships
            .sort((a, b) => b.compatibility_score - a.compatibility_score)
            .slice(0, 10)
            .map((internship, index) => ({
                ...internship,
                ai_rank: index + 1
            }));
    },

    // Calculate compatibility score between user and internship
    calculateCompatibilityScore(userProfile, internship) {
        let score = 50; // Base score
        
        const jobTitle = (internship['Job Title'] || '').toLowerCase();
        const company = (internship['Company Name'] || '').toLowerCase();
        const location = internship.location.toLowerCase();
        
        // Education matching (25 points)
        if (userProfile.qualification) {
            const education = userProfile.qualification.toLowerCase();
            
            // Direct matches
            if (education.includes('engineering') && 
                (jobTitle.includes('engineer') || jobTitle.includes('civil') || jobTitle.includes('it'))) {
                score += 25;
            } else if (education.includes('computer') && jobTitle.includes('it')) {
                score += 25;
            } else if (education.includes('finance') && jobTitle.includes('finance')) {
                score += 25;
            } else if (education.includes('social') && jobTitle.includes('social')) {
                score += 25;
            } else {
                // Partial matches
                score += 10;
            }
        }

        // Skills matching (20 points)
        if (userProfile.skills) {
            const skills = userProfile.skills.toLowerCase();
            let skillMatch = 0;
            
            if (skills.includes('programming') && jobTitle.includes('it')) skillMatch += 15;
            if (skills.includes('finance') && jobTitle.includes('finance')) skillMatch += 15;
            if (skills.includes('social') && jobTitle.includes('social')) skillMatch += 15;
            if (skills.includes('communication') && jobTitle.includes('media')) skillMatch += 15;
            if (skills.includes('data') && jobTitle.includes('data')) skillMatch += 15;
            
            score += Math.min(20, skillMatch);
        }

        // Location preference (20 points)
        if (userProfile.preferredLocation && userProfile.preferredLocation !== 'Any') {
            if (location.includes(userProfile.preferredLocation.toLowerCase())) {
                score += 20;
            }
        } else {
            score += 10; // Neutral if no preference
        }

        // State matching (10 points)
        if (userProfile.state && internship['States']) {
            if (internship['States'].toLowerCase().includes(userProfile.state.toLowerCase())) {
                score += 10;
            }
        }

        // Paid internship preference (10 points)
        if (internship.isPaid) {
            score += 10;
        }

        // Career interest matching (15 points)
        if (userProfile.preferredIndustry && userProfile.preferredIndustry !== 'Open to all') {
            const industry = userProfile.preferredIndustry.toLowerCase();
            const sector = this.categorizeInternship(internship).toLowerCase();
            
            if (sector.includes(industry) || industry.includes(sector)) {
                score += 15;
            }
        }

        return Math.min(100, score);
    },

    // Generate reasoning text for recommendations
    generateReasoningText(userProfile, internship, score) {
        const reasons = [];
        
        if (score >= 80) {
            reasons.push('Excellent match for your profile');
        } else if (score >= 70) {
            reasons.push('Good alignment with your background');
        } else {
            reasons.push('Potential growth opportunity');
        }

        if (internship.isPaid) {
            reasons.push(`offers ${internship['Stipend']} stipend`);
        }

        if (userProfile.preferredLocation && 
            internship.location.toLowerCase().includes(userProfile.preferredLocation.toLowerCase())) {
            reasons.push('matches your location preference');
        }

        return reasons.join(', ') + '.';
    },

    // Categorize internship for matching
    categorizeInternship(internship) {
        const title = (internship['Job Title'] || '').toLowerCase();
        
        if (title.includes('it') || title.includes('software') || title.includes('data')) {
            return 'technology';
        }
        if (title.includes('finance')) {
            return 'finance';
        }
        if (title.includes('engineer')) {
            return 'engineering';
        }
        if (title.includes('social')) {
            return 'social work';
        }
        if (title.includes('urban')) {
            return 'urban planning';
        }
        
        return 'general';
    },

    // Enhance recommendations with additional metadata
    enhanceRecommendations(recommendations, userProfile) {
        return recommendations.map((rec, index) => ({
            ...rec,
            ai_benefits: this.generateBenefits(rec, userProfile),
            application_deadline: rec['Late date to apply'],
            start_date: rec['Start Date'],
            openings_available: parseInt(rec['Numer of Openings']) || 1,
            is_immediate_start: (rec['Start Date'] || '').toLowerCase().includes('immediately'),
            converted_format: DataProcessor.convertToLegacyFormat([rec])[0]
        }));
    },

    // Generate benefits list for recommendation
    generateBenefits(internship, userProfile) {
        const benefits = [];
        
        if (internship.isPaid) {
            benefits.push(`💰 Paid position: ${internship['Stipend']}`);
        }
        
        if (internship['Duration']) {
            benefits.push(`⏱️ Duration: ${internship['Duration']}`);
        }
        
        if (internship['Start Date'] && internship['Start Date'].toLowerCase().includes('immediately')) {
            benefits.push('🚀 Immediate start available');
        }
        
        const openings = parseInt(internship['Numer of Openings']) || 1;
        if (openings > 1) {
            benefits.push(`👥 ${openings} positions available`);
        }
        
        benefits.push('📈 Professional experience');
        benefits.push('🎓 Skill development');
        
        return benefits;
    },

    // Cache management
    hashUserProfile(userProfile) {
        const key = JSON.stringify({
            name: userProfile.candidateName || userProfile.name,
            qualification: userProfile.qualification,
            skills: userProfile.skills,
            location: userProfile.preferredLocation,
            industry: userProfile.preferredIndustry,
            state: userProfile.state
        });
        return btoa(key);
    },

    isCacheValid(profileHash) {
        return this.cache.lastUserProfileHash === profileHash &&
               this.cache.cacheTimestamp &&
               (Date.now() - this.cache.cacheTimestamp) < this.cache.cacheValidityMs;
    },

    updateCache(profileHash, recommendations) {
        this.cache.lastUserProfileHash = profileHash;
        this.cache.lastRecommendations = recommendations;
        this.cache.cacheTimestamp = Date.now();
    },

    // Get fallback recommendations when everything fails
    getFallbackRecommendations() {
        console.log('🔄 Using fallback recommendations...');
        
        const fallbackData = DataProcessor.getSampleData().slice(0, 5);
        return fallbackData.map((internship, index) => ({
            ...internship,
            ai_rank: index + 1,
            ai_match_score: 65 + Math.floor(Math.random() * 20),
            ai_reasoning: 'Basic compatibility based on available information',
            ai_benefits: ['Learning opportunity', 'Professional experience'],
            recommended_by_ai: false,
            converted_format: DataProcessor.convertToLegacyFormat([internship])[0]
        }));
    },

    // Get engine status for UI
    getStatus() {
        return {
            initialized: this.isInitialized,
            llmConnected: this.isLLMConnected,
            dataLoaded: DataProcessor.internshipData.length > 0,
            recommendationsCount: this.recommendations.length,
            cacheStatus: {
                hasCache: !!this.cache.lastRecommendations,
                cacheAge: this.cache.cacheTimestamp ? Date.now() - this.cache.cacheTimestamp : 0
            }
        };
    },

    // Clear cache (useful for testing)
    clearCache() {
        this.cache = {
            lastUserProfileHash: null,
            lastRecommendations: null,
            cacheTimestamp: null,
            cacheValidityMs: 5 * 60 * 1000
        };
        console.log('🗑️ Cache cleared');
    },

    // Get data statistics for UI
    getDataStatistics() {
        return DataProcessor.getDataStats();
    }
};

// Export to global scope
window.AIRecommendationEngine = AIRecommendationEngine;