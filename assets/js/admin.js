// ========================================
// ADVANCED ADMIN DASHBOARD (FIXED)
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
    // AUTHENTICATION (FIXED)
    // ========================================

    async checkAuth() {
        try {
            // Check both localStorage and sessionStorage for token
            const token = localStorage.getItem('admin_auth_token') || sessionStorage.getItem('admin_auth_token');
            const adminEmail = localStorage.getItem('admin_email');

            if (!token) {
                // No token found - redirect to login
                window.location.href = 'login.html';
                return;
            }

            // Token found - set email in dashboard
            if (adminEmail) {
                document.getElementById('admin-email').textContent = adminEmail;
            } else {
                document.getElementById('admin-email').textContent = 'Admin User';
            }

            console.log('✅ Authentication successful - Dashboard loaded');
        } catch (error) {
            console.error('Auth error:', error);
            window.location.href = 'login.html';
        }
    }

    // ========================================
    // UI SETUP
    // ========================================

    setupUI() {
        // Initialize modals
        this.modals = {
            project: document.getElementById('project-modal'),
            skill: document.getElementById('skill-modal'),
            social: document.getElementById('social-modal')
        };

        // Close modal on overlay click
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
        // Tab Navigation
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link);
            });
        });

        // Forms
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('project-form')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('skill-form')?.addEventListener('submit', (e) => this.handleSkillSubmit(e));
        document.getElementById('social-form')?.addEventListener('submit', (e) => this.handleSocialSubmit(e));

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

        // Close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });
    }

    // ========================================
    // TAB SWITCHING
    // ========================================

    switchTab(element) {
        // Update active nav item
        document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
        element.classList.add('active');

        // Update active tab
        const tabId = element.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.getElementById(`${tabId}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update title
        const titles = {
            profile: 'Profile Management',
            projects: 'Manage Projects',
            skills: 'Manage Skills',
            social: 'Manage Social Links',
            messages: 'Inbound Messages'
        };
        document.getElementById('tab-title').textContent = titles[tabId] || 'Management';
    }

    // ========================================
    // DATA LOADING
    // ========================================

    async loadInitialData() {
        try {
            await this.loadProfile();
            await this.loadProjects();
            await this.loadSkills();
            await this.loadSocials();
            await this.loadMessages();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadProfile() {
        try {
            // Simulate loading profile from localStorage or API
            const savedProfile = localStorage.getItem('admin_profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                document.getElementById('admin-full-name').value = profile.fullName || '';
                document.getElementById('admin-role').value = profile.role || '';
                document.getElementById('admin-email-field').value = profile.email || '';
                document.getElementById('admin-phone').value = profile.phone || '';
                document.getElementById('admin-location').value = profile.location || '';
                document.getElementById('admin-image-url').value = profile.imageUrl || '';
                document.getElementById('admin-bio').value = profile.bio || '';
                document.getElementById('admin-about').value = profile.about || '';
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async loadProjects() {
        try {
            const projectsList = document.getElementById('projects-list');
            const savedProjects = localStorage.getItem('admin_projects');
            
            if (savedProjects) {
                const projects = JSON.parse(savedProjects);
                if (projects.length > 0) {
                    projectsList.innerHTML = projects.map((project, index) => `
                        <tr>
                            <td><img src="${project.image}" alt="${project.title}" style="width: 50px; height: 50px; border-radius: 4px;"></td>
                            <td>${project.title}</td>
                            <td>${project.category}</td>
                            <td>
                                <button class="btn small-btn primary-btn" onclick="dashboard.editProject(${index})"><i class="fas fa-edit"></i></button>
                                <button class="btn small-btn danger-btn" onclick="dashboard.deleteProject(${index})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    projectsList.innerHTML = '<tr><td colspan="4" class="text-center">No projects yet</td></tr>';
                }
            } else {
                projectsList.innerHTML = '<tr><td colspan="4" class="text-center">No projects yet</td></tr>';
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    async loadSkills() {
        try {
            const skillsList = document.getElementById('skills-list');
            const savedSkills = localStorage.getItem('admin_skills');
            
            if (savedSkills) {
                const skills = JSON.parse(savedSkills);
                if (skills.length > 0) {
                    skillsList.innerHTML = skills.map((skill, index) => `
                        <tr>
                            <td><i class="${skill.icon}"></i></td>
                            <td>${skill.name}</td>
                            <td>
                                <button class="btn small-btn primary-btn" onclick="dashboard.editSkill(${index})"><i class="fas fa-edit"></i></button>
                                <button class="btn small-btn danger-btn" onclick="dashboard.deleteSkill(${index})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    skillsList.innerHTML = '<tr><td colspan="3" class="text-center">No skills yet</td></tr>';
                }
            } else {
                skillsList.innerHTML = '<tr><td colspan="3" class="text-center">No skills yet</td></tr>';
            }
        } catch (error) {
            console.error('Error loading skills:', error);
        }
    }

    async loadSocials() {
        try {
            const socialsList = document.getElementById('socials-list');
            const savedSocials = localStorage.getItem('admin_socials');
            
            if (savedSocials) {
                const socials = JSON.parse(savedSocials);
                if (socials.length > 0) {
                    socialsList.innerHTML = socials.map((social, index) => `
                        <tr>
                            <td>${social.name}</td>
                            <td><i class="${social.icon}"></i></td>
                            <td><a href="${social.url}" target="_blank">${social.url}</a></td>
                            <td>
                                <button class="btn small-btn primary-btn" onclick="dashboard.editSocial(${index})"><i class="fas fa-edit"></i></button>
                                <button class="btn small-btn danger-btn" onclick="dashboard.deleteSocial(${index})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    socialsList.innerHTML = '<tr><td colspan="4" class="text-center">No social links yet</td></tr>';
                }
            } else {
                socialsList.innerHTML = '<tr><td colspan="4" class="text-center">No social links yet</td></tr>';
            }
        } catch (error) {
            console.error('Error loading socials:', error);
        }
    }

    async loadMessages() {
        try {
            const messagesList = document.getElementById('messages-list');
            const savedMessages = localStorage.getItem('admin_messages');
            
            if (savedMessages) {
                const messages = JSON.parse(savedMessages);
                if (messages.length > 0) {
                    messagesList.innerHTML = messages.map((msg) => `
                        <tr>
                            <td>${msg.date}</td>
                            <td>${msg.from}</td>
                            <td>${msg.subject}</td>
                            <td>${msg.message.substring(0, 50)}...</td>
                        </tr>
                    `).join('');
                } else {
                    messagesList.innerHTML = '<tr><td colspan="4" class="text-center">No messages yet</td></tr>';
                }
            } else {
                messagesList.innerHTML = '<tr><td colspan="4" class="text-center">No messages yet</td></tr>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // ========================================
    // FORM SUBMISSIONS
    // ========================================

    async handleProfileSubmit(e) {
        e.preventDefault();
        try {
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
            this.showNotification('✅ Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('❌ Error updating profile', 'error');
        }
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        try {
            const newProject = {
                title: document.getElementById('p-title').value,
                description: document.getElementById('p-desc').value,
                category: document.getElementById('p-category').value,
                image: document.getElementById('p-image').value,
                live: document.getElementById('p-live').value,
                github: document.getElementById('p-github').value
            };

            let projects = JSON.parse(localStorage.getItem('admin_projects') || '[]');
            projects.push(newProject);
            localStorage.setItem('admin_projects', JSON.stringify(projects));

            this.closeModal('project-modal');
            document.getElementById('project-form').reset();
            await this.loadProjects();
            this.showNotification('✅ Project added successfully!', 'success');
        } catch (error) {
            console.error('Error saving project:', error);
            this.showNotification('❌ Error adding project', 'error');
        }
    }

    async handleSkillSubmit(e) {
        e.preventDefault();
        try {
            const newSkill = {
                name: document.getElementById('s-name').value,
                icon: document.getElementById('s-icon').value
            };

            let skills = JSON.parse(localStorage.getItem('admin_skills') || '[]');
            skills.push(newSkill);
            localStorage.setItem('admin_skills', JSON.stringify(skills));

            this.closeModal('skill-modal');
            document.getElementById('skill-form').reset();
            await this.loadSkills();
            this.showNotification('✅ Skill added successfully!', 'success');
        } catch (error) {
            console.error('Error saving skill:', error);
            this.showNotification('❌ Error adding skill', 'error');
        }
    }

    async handleSocialSubmit(e) {
        e.preventDefault();
        try {
            const newSocial = {
                name: document.getElementById('soc-name').value,
                icon: document.getElementById('soc-icon').value,
                url: document.getElementById('soc-url').value
            };

            let socials = JSON.parse(localStorage.getItem('admin_socials') || '[]');
            socials.push(newSocial);
            localStorage.setItem('admin_socials', JSON.stringify(socials));

            this.closeModal('social-modal');
            document.getElementById('social-form').reset();
            await this.loadSocials();
            this.showNotification('✅ Social link added successfully!', 'success');
        } catch (error) {
            console.error('Error saving social link:', error);
            this.showNotification('❌ Error adding social link', 'error');
        }
    }

    deleteProject(index) {
        if (confirm('Are you sure?')) {
            let projects = JSON.parse(localStorage.getItem('admin_projects') || '[]');
            projects.splice(index, 1);
            localStorage.setItem('admin_projects', JSON.stringify(projects));
            this.loadProjects();
            this.showNotification('✅ Project deleted!', 'success');
        }
    }

    deleteSkill(index) {
        if (confirm('Are you sure?')) {
            let skills = JSON.parse(localStorage.getItem('admin_skills') || '[]');
            skills.splice(index, 1);
            localStorage.setItem('admin_skills', JSON.stringify(skills));
            this.loadSkills();
            this.showNotification('✅ Skill deleted!', 'success');
        }
    }

    deleteSocial(index) {
        if (confirm('Are you sure?')) {
            let socials = JSON.parse(localStorage.getItem('admin_socials') || '[]');
            socials.splice(index, 1);
            localStorage.setItem('admin_socials', JSON.stringify(socials));
            this.loadSocials();
            this.showNotification('✅ Social link deleted!', 'success');
        }
    }

    // ========================================
    // MODAL MANAGEMENT
    // ========================================

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    // ========================================
    // LOGOUT
    // ========================================

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin_email');
            localStorage.removeItem('remember_me');
            sessionStorage.removeItem('admin_auth_token');
            window.location.href = 'login.html';
        }
    }

    // ========================================
    // NOTIFICATIONS
    // ========================================

    showNotification(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize dashboard when DOM is ready
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
    console.log('✅ Admin Dashboard initialized');
});
