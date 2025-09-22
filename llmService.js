// LLM Integration Service for AI-Powered Internship Recommendations
// Connects to local LLM (Ollama/LM Studio) running on localhost

const LLMService = {
    config: {
        baseUrl: 'http://localhost:11434', // Default Ollama endpoint
        model: 'llama2', // Default model - can be changed to your preferred model
        maxTokens: 2000,
        temperature: 0.3, // Lower temperature for more focused recommendations
        timeout: 30000 // 30 second timeout
    },

    // Test connection to local LLM
    async testConnection() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('LLM Connection successful. Available models:', data.models?.map(m => m.name) || []);
                return true;
            }
            return false;
        } catch (error) {
            console.error('LLM Connection failed:', error);
            return false;
        }
    },

    // Generate AI-powered internship recommendations
    async generateRecommendations(userProfile, internshipData) {
        try {
            console.log('Generating AI recommendations for user profile...');
            
            // Create a focused prompt for the LLM
            const prompt = this.createRecommendationPrompt(userProfile, internshipData);
            
            const response = await fetch(`${this.config.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: this.config.temperature,
                        num_predict: this.config.maxTokens,
                        top_p: 0.9,
                        repeat_penalty: 1.1
                    }
                }),
                signal: AbortSignal.timeout(this.config.timeout)
            });

            if (!response.ok) {
                throw new Error(`LLM API error: ${response.statusText}`);
            }

            const result = await response.json();
            return this.parseRecommendationResponse(result.response, internshipData);

        } catch (error) {
            console.error('AI recommendation generation failed:', error);
            // Fallback to rule-based matching
            return this.fallbackRecommendation(userProfile, internshipData);
        }
    },

    // Create optimized prompt for internship matching
    createRecommendationPrompt(userProfile, internships) {
        const userContext = `
User Profile:
- Name: ${userProfile.candidateName || userProfile.name}
- Education: ${userProfile.qualification} in ${userProfile.course || 'General'}
- Skills: ${userProfile.skills || 'Not specified'}
- Location Preference: ${userProfile.preferredLocation || 'Any'}
- Industry Interest: ${userProfile.preferredIndustry || 'Open to all'}
- State: ${userProfile.state || 'Not specified'}
- Specialization: ${userProfile.specialization || 'General'}`;

        // Create a condensed view of internships for the LLM
        const internshipSummary = internships.slice(0, 20).map((internship, index) => 
            `${index + 1}. ${internship['Job Title']} at ${internship['Company Name']} (${internship['Cities']}, ${internship['States']}) - Stipend: ${internship['Stipend']}, Duration: ${internship['Duration']}`
        ).join('\n');

        return `You are an AI career counselor specializing in internship recommendations for Indian students. 

${userContext}

Available Internships (showing top 20):
${internshipSummary}

Task: Analyze the user's profile and rank the top 10 most suitable internships from the list above. Consider:

1. Field/Domain Match: How well does the internship align with the user's education and skills?
2. Location Preference: Geographic compatibility with user's preference
3. Career Growth: Relevance to user's career aspirations
4. Skill Development: Opportunity to develop relevant skills
5. Company Reputation: Quality of work environment and learning

Provide response in this EXACT JSON format:
{
  "recommendations": [
    {
      "rank": 1,
      "internship_index": 5,
      "match_score": 95,
      "reasoning": "Perfect match because...",
      "key_benefits": ["Skill development in relevant area", "Good location match"]
    }
  ]
}

Ensure internship_index corresponds to the number in the list above. Provide exactly 10 recommendations, ranked from best (1) to good (10).`;
    },

    // Parse LLM response and match with internship data
    parseRecommendationResponse(llmResponse, internshipData) {
        try {
            // Try to extract JSON from the response
            let jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in LLM response');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            const recommendations = parsed.recommendations || [];

            // Map LLM recommendations to actual internship data
            const result = recommendations.map(rec => {
                const internshipIndex = rec.internship_index - 1; // Convert to 0-based index
                if (internshipIndex >= 0 && internshipIndex < internshipData.length) {
                    const internship = internshipData[internshipIndex];
                    return {
                        ...internship,
                        ai_rank: rec.rank,
                        ai_match_score: rec.match_score,
                        ai_reasoning: rec.reasoning,
                        ai_benefits: rec.key_benefits || [],
                        recommended_by_ai: true
                    };
                }
                return null;
            }).filter(Boolean);

            console.log(`AI generated ${result.length} personalized recommendations`);
            return result;

        } catch (error) {
            console.error('Failed to parse LLM response:', error);
            console.log('Raw LLM response:', llmResponse);
            return this.fallbackRecommendation(null, internshipData);
        }
    },

    // Fallback recommendation system (rule-based)
    fallbackRecommendation(userProfile, internshipData) {
        console.log('Using fallback rule-based recommendations');
        
        if (!userProfile) {
            // If no user profile, return top paid internships
            return internshipData
                .filter(internship => internship['Stipend'] !== 'Unpaid')
                .slice(0, 10)
                .map((internship, index) => ({
                    ...internship,
                    ai_rank: index + 1,
                    ai_match_score: 70 + Math.floor(Math.random() * 20), // Random score 70-89
                    ai_reasoning: "Selected based on stipend and general suitability",
                    ai_benefits: ["Paid internship", "Good learning opportunity"],
                    recommended_by_ai: false
                }));
        }

        // Simple rule-based matching
        let scored = internshipData.map(internship => {
            let score = 50; // Base score
            const jobTitle = internship['Job Title']?.toLowerCase() || '';
            const location = `${internship['Cities']} ${internship['States']}`.toLowerCase();
            
            // Education/field matching
            if (userProfile.qualification) {
                const qual = userProfile.qualification.toLowerCase();
                if (qual.includes('engineering') && (jobTitle.includes('engineer') || jobTitle.includes('civil'))) score += 25;
                if (qual.includes('finance') && jobTitle.includes('finance')) score += 25;
                if (qual.includes('computer') && jobTitle.includes('it')) score += 25;
            }

            // Skills matching
            if (userProfile.skills) {
                const skills = userProfile.skills.toLowerCase();
                if (skills.includes('finance') && jobTitle.includes('finance')) score += 15;
                if (skills.includes('it') && jobTitle.includes('it')) score += 15;
                if (skills.includes('social') && jobTitle.includes('social')) score += 15;
            }

            // Location preference
            if (userProfile.preferredLocation && location.includes(userProfile.preferredLocation.toLowerCase())) {
                score += 20;
            }

            // State matching
            if (userProfile.state && internship['States']?.toLowerCase().includes(userProfile.state.toLowerCase())) {
                score += 15;
            }

            // Prefer paid internships
            if (internship['Stipend'] !== 'Unpaid') score += 10;

            return { ...internship, calculated_score: Math.min(score, 95) };
        });

        // Sort by score and return top 10
        return scored
            .sort((a, b) => b.calculated_score - a.calculated_score)
            .slice(0, 10)
            .map((internship, index) => ({
                ...internship,
                ai_rank: index + 1,
                ai_match_score: internship.calculated_score,
                ai_reasoning: "Matched based on education, skills, and location preferences",
                ai_benefits: this.generateBenefits(internship),
                recommended_by_ai: false
            }));
    },

    // Generate benefits for fallback recommendations
    generateBenefits(internship) {
        const benefits = [];
        
        if (internship['Stipend'] !== 'Unpaid') {
            benefits.push(`Paid internship - ${internship['Stipend']}`);
        }
        
        if (internship['Duration']) {
            benefits.push(`${internship['Duration']} duration`);
        }
        
        benefits.push('Professional work experience');
        benefits.push('Skill development opportunity');
        
        return benefits;
    },

    // Explain recommendation reasoning to user
    async explainRecommendation(userProfile, recommendation) {
        try {
            const prompt = `
User Profile: ${JSON.stringify(userProfile, null, 2)}
Recommended Internship: ${recommendation['Job Title']} at ${recommendation['Company Name']}

Provide a brief, friendly explanation (2-3 sentences) of why this internship is a good match for this user. Focus on practical benefits and career relevance.`;

            const response = await fetch(`${this.config.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 150
                    }
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const result = await response.json();
                return result.response.trim();
            }
            
        } catch (error) {
            console.error('Failed to generate explanation:', error);
        }
        
        return "This internship matches your profile based on your educational background and career interests.";
    },

    // Get available models from local LLM
    async getAvailableModels() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            }
        } catch (error) {
            console.error('Failed to get available models:', error);
        }
        return [];
    },

    // Switch model dynamically
    setModel(modelName) {
        this.config.model = modelName;
        console.log(`Switched to model: ${modelName}`);
    }
};

// Export to global scope
window.LLMService = LLMService;