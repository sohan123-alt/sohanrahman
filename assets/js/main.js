/**
 * ============================================
 * PORTFOLIO MAIN JAVASCRIPT
 * ============================================
 * Modern, well-structured JS with proper error handling
 */

class PortfolioApp {
    constructor() {
        this.DOM = this.cacheDOM();
        this.init();
    }

    /**
     * Cache all DOM elements
     */
    cacheDOM() {
        return {
            navbar: document.querySelector('.navbar'),
            hamburger: document.querySelector('.hamburger'),
            navLinks: document.querySelector('.nav-links'),
            navLink: document.querySelectorAll('.nav-link'),
            themeToggle: document.getElementById('theme-toggle'),
            preloader: document.getElementById('preloader'),
            fadeElements: document.querySelectorAll('.fade-in'),
            contactForm: document.getElementById('contact-form'),
            body: document.body,
            window: window,
            // Hero Section
            heroName: document.getElementById('hero-name'),
            heroRole: document.getElementById('hero-role'),
            heroBio: document.getElementById('hero-bio'),
            profileImg: document.getElementById('profile-img'),
            // About Section
            aboutText: document.getElementById('about-text'),
            statsContainer: document.getElementById('stats-container'),
            // Contact Section
            contactEmail: document.getElementById('contact-email'),
            contactPhone: document.getElementById('contact-phone'),
            contactLocation: document.getElementById('contact-location'),
            // Containers
            skillsContainer: document.getElementById('skills-container'),
            projectsContainer: document.getElementById('projects-container'),
            heroSocials: document.getElementById('hero-socials'),
            footerSocials: document.getElementById('footer-socials')
        };
    }

    /**
     * Initialize the app
     */
    init() {
        this.setupEventListeners();
        this.restoreTheme();
        this.hidePreloader();
        this.fetchData();
        this.setupIntersectionObserver();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile menu
        if (this.DOM.hamburger) {
            this.DOM.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Nav links
        this.DOM.navLink.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Theme toggle
        if (this.DOM.themeToggle) {
            this.DOM.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Contact form
        if (this.DOM.contactForm) {
            this.DOM.contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
    }

    /**
     * Handle navbar scroll effect
     */
    handleScroll() {
        if (window.scrollY > 50) {
            this.DOM.navbar.classList.add('scrolled');
        } else {
            this.DOM.navbar.classList.remove('scrolled');
        }
        this.updateActiveNavLink();
    }

    /**
     * Update active navigation link
     */
    updateActiveNavLink() {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        this.DOM.navLink.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.DOM.hamburger.classList.toggle('active');
        this.DOM.navLinks.classList.toggle('active');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.DOM.hamburger.classList.remove('active');
        this.DOM.navLinks.classList.remove('active');
    }

    /**
     * Toggle dark/light theme
     */
    toggleTheme() {
        const isDarkMode = this.DOM.body.classList.toggle('dark-mode');
        const icon = this.DOM.themeToggle.querySelector('i');

        if (isDarkMode) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    }

    /**
     * Restore saved theme from localStorage
     */
    restoreTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.DOM.body.classList.add('dark-mode');
            const icon = this.DOM.themeToggle.querySelector('i');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    /**
     * Hide preloader after page load
     */
    hidePreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.DOM.preloader) {
                    this.DOM.preloader.classList.add('hidden');
                    setTimeout(() => {
                        this.DOM.preloader.style.display = 'none';
                    }, 500);
                }
            }, 800);
        });
    }

    /**
     * Setup Intersection Observer for animations
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        this.DOM.fadeElements.forEach(el => observer.observe(el));
    }

    /**
     * Fetch data from Supabase
     */
    async fetchData() {
        try {
            if (!window.supabaseClient) {
                console.error('❌ Supabase client not found');
                this.setDefaultData();
                return;
            }

            await this.fetchProfile();
            await this.fetchSkills();
            await this.fetchProjects();
            await this.fetchSocialLinks();

            console.log('✅ All portfolio data loaded successfully');
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            this.setDefaultData();
        }
    }

    /**
     * Fetch profile data
     */
    async fetchProfile() {
        try {
            const { data: profiles, error } = await window.supabaseClient
                .from('profile')
                .select('*')
                .limit(1);

            if (error) throw error;

            const profile = profiles?.[0];
            if (profile) {
                this.DOM.heroName.textContent = profile.full_name || 'Your Name';
                this.DOM.heroRole.textContent = profile.role || 'Creative Developer';
                this.DOM.heroBio.textContent = profile.bio || '';
                this.DOM.aboutText.textContent = profile.about_text || '';
                this.DOM.profileImg.src = profile.image_url || 'https://i.imgur.com/6VBx3io.png';
                this.DOM.contactEmail.textContent = profile.email || '';
                this.DOM.contactPhone.textContent = profile.phone || '';
                this.DOM.contactLocation.textContent = profile.location || '';
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
        }
    }

    /**
     * Fetch skills data
     */
    async fetchSkills() {
        try {
            const { data: skills, error } = await window.supabaseClient
                .from('skills')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            if (skills && skills.length > 0) {
                this.DOM.skillsContainer.innerHTML = skills.map(skill => `
                    <div class="skill-card fade-in" role="listitem">
                        <i class="${skill.icon_class}"></i>
                        <h4>${this.escapeHtml(skill.name)}</h4>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Skills fetch error:', error);
        }
    }

    /**
     * Fetch projects data
     */
    async fetchProjects() {
        try {
            const { data: projects, error } = await window.supabaseClient
                .from('projects')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (projects && projects.length > 0) {
                this.DOM.projectsContainer.innerHTML = projects.map(project => `
                    <div class="project-card fade-in" data-category="${this.escapeHtml(project.category || 'all')}" role="listitem">
                        <div class="project-img">
                            <img 
                                src="${this.escapeHtml(project.image_url || 'https://via.placeholder.com/600')}" 
                                alt="${this.escapeHtml(project.title)}"
                                loading="lazy"
                                onerror="this.src='https://via.placeholder.com/600'"
                            >
                        </div>
                        <div class="project-info">
                            <h3>${this.escapeHtml(project.title || 'Untitled Project')}</h3>
                            <p>${this.escapeHtml(project.description || '')}</p>
                            <div class="project-links">
                                ${project.live_url ? `
                                    <a 
                                        href="${this.escapeHtml(project.live_url)}" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title="View Live Project"
                                    >
                                        <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                                    </a>
                                ` : ''}
                                ${project.github_url ? `
                                    <a 
                                        href="${this.escapeHtml(project.github_url)}" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title="View GitHub"
                                    >
                                        <i class="fab fa-github" aria-hidden="true"></i>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Projects fetch error:', error);
        }
    }

    /**
     * Fetch social links
     */
    async fetchSocialLinks() {
        try {
            const { data: socials, error } = await window.supabaseClient
                .from('social_links')
                .select('*');

            if (error) throw error;

            if (socials && socials.length > 0) {
                const socialHTML = socials.map(social => `
                    <a 
                        href="${this.escapeHtml(social.url)}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="${this.escapeHtml(social.name || '')}"
                        role="listitem"
                    >
                        <i class="${this.escapeHtml(social.icon_class)}" aria-hidden="true"></i>
                    </a>
                `).join('');

                this.DOM.heroSocials.innerHTML = socialHTML;
                this.DOM.footerSocials.innerHTML = socialHTML;
            }
        } catch (error) {
            console.error('Social links fetch error:', error);
        }
    }

    /**
     * Handle contact form submission
     */
    async handleContactSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            created_at: new Date().toISOString()
        };

        // Validate form data
        if (!this.validateForm(formData)) {
            return;
        }

        const submitBtn = this.DOM.contactForm.querySelector('button');
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const { error } = await window.supabaseClient
                .from('messages')
                .insert([formData]);

            if (error) throw error;

            this.showNotification('✅ Message sent successfully!', 'success');
            this.DOM.contactForm.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('❌ Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * Validate form data
     */
    validateForm(formData) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name || formData.name.length < 2) {
            this.showNotification('❌ Please enter a valid name', 'error');
            return false;
        }

        if (!emailRegex.test(formData.email)) {
            this.showNotification('❌ Please enter a valid email', 'error');
            return false;
        }

        if (!formData.subject || formData.subject.length < 3) {
            this.showNotification('❌ Please enter a subject', 'error');
            return false;
        }

        if (!formData.message || formData.message.length < 10) {
            this.showNotification('❌ Message must be at least 10 characters', 'error');
            return false;
        }

        return true;
    }

    /**
     * Show notification toast
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideInUp 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInUp 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Set default data when Supabase fails
     */
    setDefaultData() {
        this.DOM.heroName.textContent = 'Your Name';
        this.DOM.heroRole.textContent = 'Creative Developer';
        this.DOM.heroBio.textContent = 'Building digital experiences that matter.';
        this.DOM.aboutText.textContent = 'Your bio goes here.';
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    console.log('✅ Portfolio app initialized');
});
