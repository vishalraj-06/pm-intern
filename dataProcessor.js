// Data Processor for AICTE Internship Dataset
// Handles CSV loading, parsing, and data transformation

const DataProcessor = {
    // Store processed internship data
    internshipData: [],
    rawData: '',

    // Load CSV file (for development, we'll use the local file)
    async loadCSVData() {
        try {
            // In a real application, you might fetch from a server
            // For now, we'll read the local file
            console.log('Loading AICTE internship dataset...');
            
            // Try to fetch the CSV file
            const response = await fetch('./Aicte Intership Dataset (1).csv');
            if (!response.ok) {
                throw new Error('Could not load CSV file');
            }
            
            this.rawData = await response.text();
            this.internshipData = this.parseCSV(this.rawData);
            
            console.log(`Loaded ${this.internshipData.length} internships from AICTE dataset`);
            return this.internshipData;
            
        } catch (error) {
            console.error('Failed to load CSV data:', error);
            // Return sample data for development
            return this.getSampleData();
        }
    },

    // Parse CSV data into JavaScript objects
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        if (lines.length < 2) return [];
        
        // Get headers from first line
        const headers = this.parseCSVLine(lines[0]);
        const data = [];
        
        // Process each data line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0) continue;
            
            try {
                const values = this.parseCSVLine(line);
                if (values.length >= headers.length - 1) { // Allow some flexibility
                    const rowData = {};
                    headers.forEach((header, index) => {
                        rowData[header] = values[index] || '';
                    });
                    
                    // Add some additional computed fields
                    rowData.id = `AICTE_${i}`;
                    rowData.isPaid = rowData['Stipend'] !== 'Unpaid';
                    rowData.location = `${rowData['Cities']}, ${rowData['States']}`;
                    rowData.type = rowData['Job Type'] === 'Full Time' ? 'full-time' : 'part-time';
                    
                    data.push(rowData);
                }
            } catch (error) {
                console.warn(`Error parsing line ${i}:`, error);
                continue;
            }
        }
        
        return data;
    },

    // Parse a single CSV line, handling quoted values
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    },

    // Get sample data for development/fallback
    getSampleData() {
        return [
            {
                id: 'AICTE_1',
                'Job Title': 'IT & E-GOVERNANCE',
                'Job Type': 'Full Time',
                'Company Name': 'State Mission Management Unit, AMRUT Kerala',
                'Posted Date': '06-10-2023',
                'Cities': 'Thiruvananthapuram',
                'States': 'Kerala',
                'Stipend': '10000 /month',
                'Start Date': 'Immediately',
                'Duration': '6 Months',
                'Numer of Openings': '1',
                'Late date to apply': '12-11-2023',
                isPaid: true,
                location: 'Thiruvananthapuram, Kerala',
                type: 'full-time'
            },
            {
                id: 'AICTE_2',
                'Job Title': 'CIVIL ENGINEER (INTERN)',
                'Job Type': 'Full Time',
                'Company Name': 'Thrissur Municipal Corporation',
                'Posted Date': '18-06-2024',
                'Cities': 'Thrissur',
                'States': 'Kerala',
                'Stipend': '10000 /month',
                'Start Date': 'Immediately',
                'Duration': '6 Months',
                'Numer of Openings': '1',
                'Late date to apply': '25-01-2025',
                isPaid: true,
                location: 'Thrissur, Kerala',
                type: 'full-time'
            },
            {
                id: 'AICTE_3',
                'Job Title': 'DATA SCIENCE INTERN',
                'Job Type': 'Full Time',
                'Company Name': 'Tech Solutions India',
                'Posted Date': '01-01-2025',
                'Cities': 'Bangalore',
                'States': 'Karnataka',
                'Stipend': '15000 /month',
                'Start Date': 'Immediately',
                'Duration': '12 Months',
                'Numer of Openings': '5',
                'Late date to apply': '15-02-2025',
                isPaid: true,
                location: 'Bangalore, Karnataka',
                type: 'full-time'
            }
            // Add more sample data as needed
        ];
    },

    // Filter internships based on criteria
    filterInternships(filters = {}) {
        let filtered = [...this.internshipData];
        
        if (filters.location) {
            filtered = filtered.filter(internship => 
                internship.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }
        
        if (filters.type === 'paid') {
            filtered = filtered.filter(internship => internship.isPaid);
        } else if (filters.type === 'unpaid') {
            filtered = filtered.filter(internship => !internship.isPaid);
        }
        
        if (filters.jobType) {
            filtered = filtered.filter(internship => 
                internship.type === filters.jobType
            );
        }
        
        if (filters.state) {
            filtered = filtered.filter(internship => 
                internship['States']?.toLowerCase() === filters.state.toLowerCase()
            );
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(internship => 
                internship['Job Title']?.toLowerCase().includes(searchTerm) ||
                internship['Company Name']?.toLowerCase().includes(searchTerm) ||
                internship.location.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    },

    // Get unique values for filters
    getUniqueStates() {
        const states = new Set(this.internshipData.map(i => i['States']).filter(Boolean));
        return Array.from(states).sort();
    },

    getUniqueCities() {
        const cities = new Set(this.internshipData.map(i => i['Cities']).filter(Boolean));
        return Array.from(cities).sort();
    },

    getUniqueCompanies() {
        const companies = new Set(this.internshipData.map(i => i['Company Name']).filter(Boolean));
        return Array.from(companies).sort();
    },

    // Get statistics about the dataset
    getDataStats() {
        const total = this.internshipData.length;
        const paid = this.internshipData.filter(i => i.isPaid).length;
        const fullTime = this.internshipData.filter(i => i.type === 'full-time').length;
        const states = this.getUniqueStates().length;
        const companies = this.getUniqueCompanies().length;
        
        return {
            total,
            paid,
            unpaid: total - paid,
            fullTime,
            partTime: total - fullTime,
            states,
            companies,
            avgStipend: this.calculateAverageStipend()
        };
    },

    // Calculate average stipend
    calculateAverageStipend() {
        const paidInternships = this.internshipData.filter(i => i.isPaid);
        if (paidInternships.length === 0) return 0;
        
        let totalStipend = 0;
        let count = 0;
        
        paidInternships.forEach(internship => {
            const stipend = internship['Stipend'];
            if (stipend && stipend !== 'Unpaid') {
                // Extract number from stipend string (e.g., "10000 /month")
                const match = stipend.match(/(\d+)/);
                if (match) {
                    totalStipend += parseInt(match[1]);
                    count++;
                }
            }
        });
        
        return count > 0 ? Math.round(totalStipend / count) : 0;
    },

    // Convert internship data to format compatible with existing system
    convertToLegacyFormat(internships) {
        return internships.map(internship => ({
            id: internship.id,
            role: internship['Job Title'],
            company: internship['Company Name'],
            location: internship.location,
            state: internship['States'],
            district: internship['Cities'],
            sector: this.categorizeJobTitle(internship['Job Title']),
            area: internship['Job Title'],
            opportunities: parseInt(internship['Numer of Openings']) || 1,
            description: `${internship['Job Title']} position at ${internship['Company Name']}`,
            qualifications: 'As per job requirements',
            skills: this.extractSkillsFromTitle(internship['Job Title']),
            salary: internship['Stipend'],
            duration: internship['Duration'],
            type: internship.isPaid ? 'paid' : 'unpaid',
            preferredGender: 'Any',
            company_logo: `https://via.placeholder.com/100x100/2d4f93/ffffff?text=${encodeURIComponent(internship['Company Name'].substring(0, 3))}`,
            applied: 0,
            created_at: new Date().toISOString()
        }));
    },

    // Categorize job titles into sectors
    categorizeJobTitle(jobTitle) {
        const title = jobTitle.toLowerCase();
        
        if (title.includes('it') || title.includes('software') || title.includes('data') || title.includes('tech')) {
            return 'Information Technology';
        }
        if (title.includes('finance') || title.includes('account')) {
            return 'Banking & Finance';
        }
        if (title.includes('civil') || title.includes('engineer')) {
            return 'Engineering';
        }
        if (title.includes('social') || title.includes('community')) {
            return 'Social Work';
        }
        if (title.includes('urban') || title.includes('planning')) {
            return 'Urban Planning';
        }
        if (title.includes('media') || title.includes('communication')) {
            return 'Media & Communication';
        }
        
        return 'General';
    },

    // Extract skills from job title
    extractSkillsFromTitle(jobTitle) {
        const title = jobTitle.toLowerCase();
        const skills = [];
        
        if (title.includes('it') || title.includes('software')) skills.push('Programming', 'Software Development');
        if (title.includes('data')) skills.push('Data Analysis', 'Database Management');
        if (title.includes('finance')) skills.push('Financial Analysis', 'Accounting');
        if (title.includes('civil')) skills.push('Civil Engineering', 'Construction Management');
        if (title.includes('social')) skills.push('Community Development', 'Social Work');
        if (title.includes('urban')) skills.push('Urban Planning', 'Project Management');
        if (title.includes('media')) skills.push('Communication', 'Social Media');
        
        return skills.join(', ') || 'Professional Skills';
    },

    // Initialize the data processor
    async initialize() {
        console.log('Initializing Data Processor...');
        const data = await this.loadCSVData();
        console.log('Data processor ready with', data.length, 'internships');
        return data;
    }
};

// Export to global scope
window.DataProcessor = DataProcessor;