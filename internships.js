// PM Internship Scheme - Internships Management Module
// This contains dummy data and management functions

const internshipManager = {
    // Internship data will be loaded from API
    internships: [],
    userProfile: null,

    // Applied internships (stored in localStorage)
    appliedInternships: [],

    // Pagination settings
    currentPage: 1,
    itemsPerPage: 5,

    // Filter state
    currentFilters: {
        location: '',
        type: '',
        top_companies: '',
        search: ''
    },

    // Initialize the internship manager
    async init() {
        console.log('Initializing Internship Manager...');
        await this.loadInternships();
        await this.loadUserProfile();
        this.loadAppliedInternships();
        this.updateAppliedCounts();
        this.renderInternships();
    },
    
    // Load internships from API
    async loadInternships() {
        try {
            this.internships = await ApiService.getInternships();
            console.log('Loaded', this.internships.length, 'internships');
        } catch (error) {
            console.error('Error loading internships:', error);
            this.internships = [];
        }
    },
    
    // Load user profile for match scoring
    async loadUserProfile() {
        const currentUser = PMISAuth.getCurrentUser();
        if (currentUser) {
            try {
                this.userProfile = await ApiService.getUserProfile(currentUser.id);
            } catch (error) {
                console.error('Error loading user profile:', error);
            }
        }
    },

    // Load applied internships from localStorage
    loadAppliedInternships: function() {
        const applied = localStorage.getItem('pmis_applied_internships');
        if (applied) {
            try {
                this.appliedInternships = JSON.parse(applied);
                // Update applied count in internships data
                this.appliedInternships.forEach(appId => {
                    const internship = this.internships.find(i => i.id === appId);
                    if (internship) {
                        internship.applied = 1;
                    }
                });
            } catch (e) {
                console.error('Error loading applied internships:', e);
                this.appliedInternships = [];
            }
        }
    },

    // Save applied internships to localStorage
    saveAppliedInternships: function() {
        localStorage.setItem('pmis_applied_internships', JSON.stringify(this.appliedInternships));
    },

    // Update applied counts in UI
    updateAppliedCounts: function() {
        const appliedCount = this.appliedInternships.length;
        const remainingCount = Math.max(0, 10 - appliedCount); // Max 10 applications allowed
        
        const appliedCountEl = document.getElementById('appliedCount');
        const remainingCountEl = document.getElementById('remainingCount');
        
        if (appliedCountEl) appliedCountEl.textContent = appliedCount;
        if (remainingCountEl) remainingCountEl.textContent = remainingCount;
    },

    // Get filtered internships
    async getFilteredInternships() {
        try {
            const filtered = await ApiService.getInternships(this.currentFilters);
            return filtered;
        } catch (error) {
            console.error('Error filtering internships:', error);
            return this.internships;
        }
    },

    // Apply filters and re-render
    async applyFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.currentPage = 1; // Reset to first page
        await this.renderInternships();
    },

    // Get paginated internships
    async getPaginatedInternships() {
        const filtered = await this.getFilteredInternships();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        return {
            internships: filtered.slice(startIndex, endIndex),
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / this.itemsPerPage)
        };
    },

    // Render internships table
    async renderInternships() {
        const tableBody = document.getElementById('internshipTableBody');
        if (!tableBody) return;

        const { internships, totalItems, totalPages } = await this.getPaginatedInternships();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;

        // Clear existing content
        tableBody.innerHTML = '';

        if (internships.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">
                        No internships found matching your criteria.
                    </td>
                </tr>
            `;
        } else {
            internships.forEach((internship, index) => {
                const isApplied = this.appliedInternships.includes(internship.id);
                const rowClass = isApplied ? 'applied-row' : '';
                const actionButtons = isApplied
                    ? `<button class="btn-withdraw" onclick="internshipManager.withdrawApplication('${internship.id}')">Withdraw</button>`
                    : `<button class="btn-apply" onclick="internshipManager.applyToInternship('${internship.id}')">Apply</button>`;

                // Calculate match score - adapt to either internal or legacy field names
                const matchScore = ApiService.calculateMatchScore(this.userProfile, internship);
                const matchScoreHtml = `<span style="color: ${matchScore >= 80 ? '#28a745' : matchScore >= 60 ? '#ff7a00' : '#dc3545'}; font-weight: 600;">${matchScore}%</span>`;

                const row = `
                    <tr class="${rowClass}">
                        <td>${startIndex + index + 1}</td>
                        <td>
                            <button class="btn-view" onclick="viewInternship('${internship.id}')">View</button>
                            ${actionButtons}
                        </td>
                        <td>${internship.id}</td>
                        <td>${internship.company || 'N/A'}</td>
                        <td>${internship.location || 'N/A'}</td>
                        <td><span style="text-transform: capitalize; color: ${internship.type === 'paid' ? '#28a745' : '#666'}; font-weight: 600;">${internship.type || 'N/A'}</span></td>
                        <td>${internship.salary || 'N/A'}</td>
                        <td>${matchScoreHtml}</td>
                        <td>${internship.opportunities}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }

        // Update pagination
        this.renderPagination(totalPages);
    },

    // Render pagination
    renderPagination: function(totalPages) {
        const paginationEl = document.getElementById('pagination');
        if (!paginationEl || totalPages <= 1) {
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button onclick="internshipManager.changePage(${this.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            paginationHTML += `<button class="${activeClass}" onclick="internshipManager.changePage(${i})">${i}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button onclick="internshipManager.changePage(${this.currentPage + 1})">Next</button>`;
        }

        paginationEl.innerHTML = paginationHTML;
    },

    // Change page
    async changePage(page) {
        this.currentPage = page;
        await this.renderInternships();
    },

    // Get unique values for filters
    getUniqueStates: function() {
        return [...new Set(this.internships.map(i => i.state))].sort();
    },

    getUniqueDistricts: function(state = null) {
        let filtered = this.internships;
        if (state) {
            filtered = filtered.filter(i => i.state === state);
        }
        return [...new Set(filtered.map(i => i.district))].sort();
    },

    getUniqueSectors: function() {
        return [...new Set(this.internships.map(i => i.sector))].sort();
    },

    getUniqueAreas: function() {
        return [...new Set(this.internships.map(i => i.area))].sort();
    },

    // Get internship by ID
    getInternshipById: function(id) {
        return this.internships.find(i => i.id === id);
    },

    // Apply to internship
    applyToInternship: function(internshipId) {
        if (this.appliedInternships.length >= 10) {
            alert('You can only apply to a maximum of 10 internships.');
            return;
        }

        if (this.appliedInternships.includes(internshipId)) {
            alert('You have already applied to this internship.');
            return;
        }

        const currentUser = PMISAuth.getCurrentUser();
        if (currentUser && typeof ApiService.getParticipationCount === 'function') {
            // Check past participation (simple guard; in production rely on Supabase trigger/view)
            ApiService.getParticipationCount(currentUser.id).then(count => {
                if (count > 1) {
                    alert('Participation limit reached: You cannot apply for more than one completed internship.');
                    return;
                }
                // Proceed with applying
                this.appliedInternships.push(internshipId);
                this.saveAppliedInternships();
                const internship = this.getInternshipById(internshipId);
                if (internship) {
                    internship.applied = 1;
                }
                this.updateAppliedCounts();
                this.renderInternships();
                console.log('Applied to internship:', internshipId);
            }).catch(() => {
                // On error, fall back to existing behavior
                this.appliedInternships.push(internshipId);
                this.saveAppliedInternships();
                const internship = this.getInternshipById(internshipId);
                if (internship) {
                    internship.applied = 1;
                }
                this.updateAppliedCounts();
                this.renderInternships();
                console.log('Applied to internship:', internshipId);
            });
            return;
        }

        // Add to applied list
        this.appliedInternships.push(internshipId);
        this.saveAppliedInternships();

        // Update internship data
        const internship = this.getInternshipById(internshipId);
        if (internship) {
            internship.applied = 1;
        }

        this.updateAppliedCounts();
        this.renderInternships();

        console.log('Applied to internship:', internshipId);
    },

    // Withdraw application
    withdrawApplication: function(internshipId) {
        const index = this.appliedInternships.indexOf(internshipId);
        if (index > -1) {
            this.appliedInternships.splice(index, 1);
            this.saveAppliedInternships();

            // Update internship data
            const internship = this.getInternshipById(internshipId);
            if (internship) {
                internship.applied = 0;
            }

            this.updateAppliedCounts();
            this.renderInternships();

            console.log('Withdrew application for internship:', internshipId);
        }
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('internshipTableBody')) {
        internshipManager.init();
    }
});

// Export to global scope
window.internshipManager = internshipManager;