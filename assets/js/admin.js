// ========================================
// ADVANCED ADMIN DASHBOARD (FULL FIXED)
// ========================================

class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupUI();
        this.setupEventListeners();
        await this.loadInitialData();
    }

    // ========================================
    // AUTHENTICATION
    // ========================================

    async checkAuth() {
        try {
            const token =
                localStorage.getItem('admin_auth_token') ||
                sessionStorage.getItem('admin_auth_token');

            const adminEmail = localStorage.getItem('admin_email');

            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            document.getElementById('admin-email').textContent =
                adminEmail || 'Admin User';

            console.log('✅ Authentication successful');
        } catch (error) {
            console.error('Auth error:', error);
            window.location.href = 'login.html';
        }
    }

    // ========================================
    // UI SETUP
    // ========================================

    setupUI() {
        this.modals = {
            project: document.getElementById('project-modal'),
            skill: document.getElementById('skill-modal'),
            social: document.getElementById('social-modal')
        };

        // Close modal on outside click
        Object.values(this.modals).forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {

        // Sidebar Tabs
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link);
            });
        });

        // Forms
        document.getElementById('profile-form')
            ?.addEventListener('submit', (e) => this.handleProfileSubmit(e));

        document.getElementById('project-form')
            ?.addEventListener('submit', (e) => this.handleProjectSubmit(e));

        document.getElementById('skill-form')
            ?.addEventListener('submit', (e) => this.handleSkillSubmit(e));

        document.getElementById('social-form')
            ?.addEventListener('submit', (e) => this.handleSocialSubmit(e));

        // Logout
        document.getElementById('logout-btn')
            ?.addEventListener('click', () => this.logout());

        // Close Buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');

                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // ========================================
    // TAB SWITCHING
    // ========================================

    switchTab(element) {

        document.querySelectorAll('.sidebar-nav a')
            .forEach(a => a.classList.remove('active'));

        element.classList.add('active');

        const tabId = element.getAttribute('data-tab');

        document.querySelectorAll('.tab-content')
            .forEach(tab => tab.classList.remove('active'));

        const activeTab = document.getElementById(`${tabId}-tab`);

        if (activeTab) {
            activeTab.classList.add('active');
        }

        const titles = {
            profile: 'Profile Management',
            projects: 'Manage Projects',
            skills: 'Manage Skills',
            social: 'Manage Social Links',
            messages: 'Inbound Messages'
        };

        document.getElementById('tab-title').textContent =
            titles[tabId] || 'Management';
    }

    // ========================================
    // LOAD DATA
    // ========================================

    async loadInitialData() {
        await this.loadProfile();
        await this.loadProjects();
        await this.loadSkills();
        await this.loadSocials();
        await this.loadMessages();
    }

    async loadProfile() {

        const savedProfile = localStorage.getItem('admin_profile');

        if (!savedProfile) return;

        const profile = JSON.parse(savedProfile);

        document.getElementById('admin-full-name').value =
            profile.fullName || '';

        document.getElementById('admin-role').value =
            profile.role || '';

        document.getElementById('admin-email-field').value =
            profile.email || '';

        document.getElementById('admin-phone').value =
            profile.phone || '';

        document.getElementById('admin-location').value =
            profile.location || '';

        document.getElementById('admin-image-url').value =
            profile.imageUrl || '';

        document.getElementById('admin-bio').value =
            profile.bio || '';

        document.getElementById('admin-about').value =
            profile.about || '';
    }

    async loadProjects() {

        const projectsList = document.getElementById('projects-list');

        const projects =
            JSON.parse(localStorage.getItem('admin_projects') || '[]');

        if (projects.length === 0) {
            projectsList.innerHTML =
                '<tr><td colspan="4" class="text-center">No projects yet</td></tr>';
            return;
        }

        projectsList.innerHTML = projects.map((project, index) => `
            <tr>
                <td>
                    <img src="${project.image}"
                        alt="${project.title}"
                        style="width:50px;height:50px;border-radius:6px;object-fit:cover;">
                </td>

                <td>${project.title}</td>

                <td>${project.category}</td>

                <td>
                    <button class="btn small-btn danger-btn"
                        onclick="dashboard.deleteProject(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadSkills() {

        const skillsList = document.getElementById('skills-list');

        const skills =
            JSON.parse(localStorage.getItem('admin_skills') || '[]');

        if (skills.length === 0) {
            skillsList.innerHTML =
                '<tr><td colspan="3" class="text-center">No skills yet</td></tr>';
            return;
        }

        skillsList.innerHTML = skills.map((skill, index) => `
            <tr>
                <td><i class="${skill.icon}"></i></td>

                <td>${skill.name}</td>

                <td>
                    <button class="btn small-btn danger-btn"
                        onclick="dashboard.deleteSkill(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadSocials() {

        const socialsList = document.getElementById('socials-list');

        const socials =
            JSON.parse(localStorage.getItem('admin_socials') || '[]');

        if (socials.length === 0) {
            socialsList.innerHTML =
                '<tr><td colspan="4" class="text-center">No social links yet</td></tr>';
            return;
        }

        socialsList.innerHTML = socials.map((social, index) => `
            <tr>

                <td>${social.name}</td>

                <td>
                    <i class="${social.icon}"></i>
                </td>

                <td>
                    <a href="${social.url}" target="_blank">
                        ${social.url}
                    </a>
                </td>

                <td>
                    <button class="btn small-btn danger-btn"
                        onclick="dashboard.deleteSocial(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>

            </tr>
        `).join('');
    }

    async loadMessages() {

        const messagesList = document.getElementById('messages-list');

        const messages =
            JSON.parse(localStorage.getItem('admin_messages') || '[]');

        if (messages.length === 0) {
            messagesList.innerHTML =
                '<tr><td colspan="4" class="text-center">No messages yet</td></tr>';
            return;
        }

        messagesList.innerHTML = messages.map(msg => `
            <tr>
                <td>${msg.date}</td>
                <td>${msg.from}</td>
                <td>${msg.subject}</td>
                <td>${msg.message}</td>
            </tr>
        `).join('');
    }

    // ========================================
    // FORM SUBMIT
    // ========================================

    async handleProfileSubmit(e) {

        e.preventDefault();

        const profile = {
            fullName: document.getElementById('admin-full-name').value,
            role: document.getElementById('admin-role').value,
            email: document.getElementById('admin-email-field').value,
            phone: document.getElementById('admin-phone').value,
            location: document.getElementById('admin-location').value,
            imageUrl: document.getElementById('admin-image-url').value,
            bio: document.getElementById('admin-bio').value,
            about: document.getElementById('admin-about').value
        };

        localStorage.setItem('admin_profile', JSON.stringify(profile));

        this.showNotification('✅ Profile updated!', 'success');
    }

    async handleProjectSubmit(e) {

        e.preventDefault();

        const project = {
            title: document.getElementById('p-title').value,
            description: document.getElementById('p-desc').value,
            category: document.getElementById('p-category').value,
            image: document.getElementById('p-image').value,
            live: document.getElementById('p-live').value,
            github: document.getElementById('p-github').value
        };

        const projects =
            JSON.parse(localStorage.getItem('admin_projects') || '[]');

        projects.push(project);

        localStorage.setItem(
            'admin_projects',
            JSON.stringify(projects)
        );

        document.getElementById('project-form').reset();

        this.closeModal('project-modal');

        await this.loadProjects();

        this.showNotification('✅ Project added!', 'success');
    }

    async handleSkillSubmit(e) {

        e.preventDefault();

        const skill = {
            name: document.getElementById('s-name').value,
            icon: document.getElementById('s-icon').value
        };

        const skills =
            JSON.parse(localStorage.getItem('admin_skills') || '[]');

        skills.push(skill);

        localStorage.setItem(
            'admin_skills',
            JSON.stringify(skills)
        );

        document.getElementById('skill-form').reset();

        this.closeModal('skill-modal');

        await this.loadSkills();

        this.showNotification('✅ Skill added!', 'success');
    }

    async handleSocialSubmit(e) {

        e.preventDefault();

        const social = {
            name: document.getElementById('soc-name').value,
            icon: document.getElementById('soc-icon').value,
            url: document.getElementById('soc-url').value
        };

        const socials =
            JSON.parse(localStorage.getItem('admin_socials') || '[]');

        socials.push(social);

        localStorage.setItem(
            'admin_socials',
            JSON.stringify(socials)
        );

        document.getElementById('social-form').reset();

        this.closeModal('social-modal');

        await this.loadSocials();

        this.showNotification('✅ Social link added!', 'success');
    }

    // ========================================
    // DELETE
    // ========================================

    deleteProject(index) {

        let projects =
            JSON.parse(localStorage.getItem('admin_projects') || '[]');

        projects.splice(index, 1);

        localStorage.setItem(
            'admin_projects',
            JSON.stringify(projects)
        );

        this.loadProjects();

        this.showNotification('✅ Project deleted!', 'success');
    }

    deleteSkill(index) {

        let skills =
            JSON.parse(localStorage.getItem('admin_skills') || '[]');

        skills.splice(index, 1);

        localStorage.setItem(
            'admin_skills',
            JSON.stringify(skills)
        );

        this.loadSkills();

        this.showNotification('✅ Skill deleted!', 'success');
    }

    deleteSocial(index) {

        let socials =
            JSON.parse(localStorage.getItem('admin_socials') || '[]');

        socials.splice(index, 1);

        localStorage.setItem(
            'admin_socials',
            JSON.stringify(socials)
        );

        this.loadSocials();

        this.showNotification('✅ Social deleted!', 'success');
    }

    // ========================================
    // MODAL MANAGEMENT (FIXED)
    // ========================================

    openModal(modalId) {

        const modal = document.getElementById(modalId);

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {

        const modal = document.getElementById(modalId);

        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ========================================
    // LOGOUT
    // ========================================

    logout() {

        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_email');

        sessionStorage.removeItem('admin_auth_token');

        window.location.href = 'login.html';
    }

    // ========================================
    // NOTIFICATION
    // ========================================

    showNotification(message, type = 'success') {

        const notification = document.createElement('div');

        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 14px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ========================================
// INITIALIZE
// ========================================

let dashboard;

document.addEventListener('DOMContentLoaded', () => {

    dashboard = new AdminDashboard();

    console.log('✅ Dashboard initialized');
});

// ========================================
// GLOBAL MODAL FUNCTION FIX
// ========================================

window.openModal = function(modalId) {

    if (dashboard) {
        dashboard.openModal(modalId);
    }
};
