// Research Management for Public Portfolio
let allPapers = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchResearchPapers();
    setupSearchAndFilters();
});

async function fetchResearchPapers() {
    const researchContainer = document.getElementById('research-grid');
    if (!researchContainer) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('research_papers')
            .select('*')
            .eq('visible', true)
            .order('year', { ascending: false });

        if (error) throw error;

        allPapers = data;
        renderResearchPapers(allPapers);
        updateFilterOptions(allPapers);
    } catch (error) {
        console.error('Error fetching research papers:', error.message);
        researchContainer.innerHTML = '<p class="text-center text-danger">Failed to load research papers.</p>';
    }
}

function renderResearchPapers(papers) {
    const researchContainer = document.getElementById('research-grid');
    researchContainer.innerHTML = '';

    if (papers.length === 0) {
        researchContainer.innerHTML = '<p class="text-center col-span-full">No research papers found matching your criteria.</p>';
        return;
    }

    papers.forEach((paper, index) => {
        const card = document.createElement('div');
        card.className = 'research-card';
        // Check if AOS is available
        if (window.AOS) {
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', index * 100);
        }

        card.innerHTML = `
            <div class="research-content">
                <div class="research-badge-wrapper">
                    <span class="research-badge">${paper.category || 'Research'}</span>
                    ${paper.featured ? '<span class="research-badge featured-badge"><i class="fas fa-star mr-1"></i> Featured</span>' : ''}
                </div>
                <h3 class="research-title">${paper.title}</h3>
                <p class="research-authors">${paper.authors}</p>
                <p class="research-journal">${paper.journal} (${paper.year})</p>
                <p class="research-abstract">${paper.abstract || 'No abstract available.'}</p>
            </div>
            <div class="research-footer">
                <div class="research-year">
                    <i class="fas fa-calendar-alt"></i> ${paper.year}
                </div>
                <div class="research-links">
                    ${paper.doi ? `<a href="https://doi.org/${paper.doi}" target="_blank" class="research-link" title="DOI"><i class="fas fa-fingerprint"></i></a>` : ''}
                    ${paper.pdf_url ? `<a href="${paper.pdf_url}" target="_blank" class="research-link" title="Download PDF"><i class="fas fa-file-pdf"></i></a>` : ''}
                    ${paper.external_url ? `<a href="${paper.external_url}" target="_blank" class="research-link" title="External Link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            </div>
        `;
        researchContainer.appendChild(card);
    });
}

function updateFilterOptions(papers) {
    const categoryFilter = document.getElementById('category-filters');
    if (!categoryFilter) return;

    const categories = ['All', ...new Set(papers.map(p => p.category).filter(Boolean))];
    
    categoryFilter.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    categoryFilter.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            categoryFilter.querySelector('.active').classList.remove('active');
            btn.classList.add('active');
            filterPapers();
        });
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('research-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterPapers);
    }
}

function filterPapers() {
    const searchTerm = document.getElementById('research-search')?.value.toLowerCase() || '';
    const activeCategory = document.querySelector('#category-filters .active')?.dataset.category || 'All';

    const filtered = allPapers.filter(paper => {
        const matchesSearch = paper.title.toLowerCase().includes(searchTerm) || 
                             paper.authors.toLowerCase().includes(searchTerm) ||
                             paper.keywords?.toLowerCase().includes(searchTerm);
        
        const matchesCategory = activeCategory === 'All' || paper.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    renderResearchPapers(filtered);
}
