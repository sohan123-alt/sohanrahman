// ========================================
// ADVANCED ADMIN DASHBOARD
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
            const { data: { session } } = await window.supabaseClient?.auth.getSession?.();
            if (!session) {
                window.location.href = 'login.html';
                return;
            }
            document.getElementById('admin-email').textContent = session.user.email;
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
            document.getElementById('tab-title').textContent = `${element.textContent.trim()} Management`;
        }

        // Load tab data
        this.loadTabData(tabId);
    }

    async loadTabData(tab) {
        switch (tab) {
            case 'profile':
                await this.loadProfile();
                break;
            case 'projects':
                await this.loadProjects();
                break;
            case 'skills':
                await this.loadSkills();
                break;
            case 'social':
                await this.loadSocials();
                break;
            case 'messages':
                await this.loadMessages();
                break;
        }
    }

    async loadInitialData() {
        await this.loadProfile();
    }

    // ========================================
    // PROFILE MANAGEMENT
    // ========================================

    async loadProfile() {
        try {
            const { data, error } = await window.supabaseClient
                .from('profile')
                .select('*')
                .single();

            if (data) {
                document.getElementById('admin-full-name').value = data.full_name || '';
                document.getElementById('admin-role').value = data.role || '';
                document.getElementById('admin-email-field').value = data.email || '';
                document.getElementById('admin-phone').value = data.phone || '';
                document.getElementById('admin-location').value = data.location || '';
                document.getElementById('admin-image-url').value = data.image_url || '';
                document.getElementById('admin-bio').value = data.bio || '';
                document.getElementById('admin-about').value = data.about_text || '';

                this.profileId = data.id;
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showAlert('Error loading profile', 'error');
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();

        const button = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(button, true);

        try {
            const profileData = {
                full_name: document.getElementById('admin-full-name').value,
                role: document.getElementById('admin-role').value,
                email: document.getElementById('admin-email-field').value,
                phone: document.getElementById('admin-phone').value,
                location: document.getElementById('admin-location').value,
                image_url: document.getElementById('admin-image-url').value,
                bio: document.getElementById('admin-bio').value,
                about_text: document.getElementById('admin-about').value
            };

            let result;
            if (this.profileId) {
                result = await window.supabaseClient
                    .from('profile')
                    .update(profileData)
                    .eq('id', this.profileId);
            } else {
                result = await window.supabaseClient
                    .from('profile')
                    .insert([profileData]);

                if (result.data?.[0]) {
                    this.profileId = result.data[0].id;
                }
            }

            if (result.error) throw result.error;

            this.showAlert('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Profile error:', error);
            this.showAlert(`Error: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    // ========================================
    // PROJECTS MANAGEMENT
    // ========================================

    async loadProjects() {
        try {
            const { data, error } = await window.supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            const list = document.getElementById('projects-list');
            if (data && data.length > 0) {
                list.innerHTML = data.map(p => `
                    <tr>
                        <td>
                            <img src="${p.image_url || 'https://via.placeholder.com/50'}" 
                                 class="table-img" alt="${p.title}">
                        </td>
                        <td><strong>${p.title}</strong></td>
                        <td>${p.category || 'Uncategorized'}</td>
                        <td>
                            <div class="actions">
                                <button class="action-btn delete-btn" onclick="adminDashboard.deleteProject('${p.id}')" 
                                        title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                list.innerHTML = '<tr><td colspan="4" class="text-center">No projects yet. Add one to get started!</td></tr>';
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showAlert('Error loading projects', 'error');
        }
    }

    async handleProjectSubmit(e) {
        e.preventDefault();

        const button = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(button, true);

        try {
            const projectData = {
                title: document.getElementById('p-title').value,
                description: document.getElementById('p-desc').value,
                category: document.getElementById('p-category').value,
                image_url: document.getElementById('p-image').value,
                live_url: document.getElementById('p-live').value,
                github_url: document.getElementById('p-github').value
            };

            const result = await window.supabaseClient
                .from('projects')
                .insert([projectData]);

            if (result.error) throw result.error;

            this.showAlert('Project added successfully!', 'success');
            e.target.reset();
            this.closeModal('project-modal');
            await this.loadProjects();
        } catch (error) {
            console.error('Project error:', error);
            this.showAlert(`Error: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    async deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const { error } = await window.supabaseClient
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showAlert('Project deleted!', 'success');
            await this.loadProjects();
        } catch (error) {
            console.error('Delete error:', error);
            this.showAlert('Error deleting project', 'error');
        }
    }

    // ========================================
    // SKILLS MANAGEMENT
    // ========================================

    async loadSkills() {
        try {
            const { data, error } = await window.supabaseClient
                .from('skills')
                .select('*')
                .order('name', { ascending: true });

            const list = document.getElementById('skills-list');
            if (data && data.length > 0) {
                list.innerHTML = data.map(s => `
                    <tr>
                        <td><i class="${s.icon_class || 'fas fa-star'}"></i></td>
                        <td><strong>${s.name}</strong></td>
                        <td>
                            <div class="actions">
                                <button class="action-btn delete-btn" onclick="adminDashboard.deleteSkill('${s.id}')" 
                                        title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                list.innerHTML = '<tr><td colspan="3" class="text-center">No skills yet. Add your skills!</td></tr>';
            }
        } catch (error) {
            console.error('Error loading skills:', error);
            this.showAlert('Error loading skills', 'error');
        }
    }

    async handleSkillSubmit(e) {
        e.preventDefault();

        const button = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(button, true);

        try {
            const skillData = {
                name: document.getElementById('s-name').value,
                icon_class: document.getElementById('s-icon').value
            };

            const result = await window.supabaseClient
                .from('skills')
                .insert([skillData]);

            if (result.error) throw result.error;

            this.showAlert('Skill added successfully!', 'success');
            e.target.reset();
            this.closeModal('skill-modal');
            await this.loadSkills();
        } catch (error) {
            console.error('Skill error:', error);
            this.showAlert(`Error: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    async deleteSkill(id) {
        if (!confirm('Delete this skill?')) return;

        try {
            const { error } = await window.supabaseClient
                .from('skills')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showAlert('Skill deleted!', 'success');
            await this.loadSkills();
        } catch (error) {
            console.error('Delete error:', error);
            this.showAlert('Error deleting skill', 'error');
        }
    }

    // ========================================
    // SOCIAL LINKS MANAGEMENT
    // ========================================

    async loadSocials() {
        try {
            const { data, error } = await window.supabaseClient
                .from('social_links')
                .select('*')
                .order('name', { ascending: true });

            const list = document.getElementById('socials-list');
            if (data && data.length > 0) {
                list.innerHTML = data.map(s => `
                    <tr>
                        <td><i class="${s.icon_class || 'fas fa-link'}"></i></td>
                        <td><strong>${s.name}</strong></td>
                        <td><a href="${s.url}" target="_blank" title="Open link">${s.url}</a></td>
                        <td>
                            <div class="actions">
                                <button class="action-btn delete-btn" onclick="adminDashboard.deleteSocial('${s.id}')" 
                                        title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                list.innerHTML = '<tr><td colspan="4" class="text-center">No social links yet. Add your profiles!</td></tr>';
            }
        } catch (error) {
            console.error('Error loading socials:', error);
            this.showAlert('Error loading social links', 'error');
        }
    }

    async handleSocialSubmit(e) {
        e.preventDefault();

        const button = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(button, true);

        try {
            const socialData = {
                name: document.getElementById('soc-name').value,
                icon_class: document.getElementById('soc-icon').value,
                url: document.getElementById('soc-url').value
            };

            const result = await window.supabaseClient
                .from('social_links')
                .insert([socialData]);

            if (result.error) throw result.error;

            this.showAlert('Social link added successfully!', 'success');
            e.target.reset();
            this.closeModal('social-modal');
            await this.loadSocials();
        } catch (error) {
            console.error('Social error:', error);
            this.showAlert(`Error: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    async deleteSocial(id) {
        if (!confirm('Delete this social link?')) return;

        try {
            const { error } = await window.supabaseClient
                .from('social_links')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showAlert('Social link deleted!', 'success');
            await this.loadSocials();
        } catch (error) {
            console.error('Delete error:', error);
            this.showAlert('Error deleting social link', 'error');
        }
    }

    // ========================================
    // MESSAGES MANAGEMENT
    // ========================================

    async loadMessages() {
        try {
            const { data, error } = await window.supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            const list = document.getElementById('messages-list');
            if (data && data.length > 0) {
                list.innerHTML = data.map(m => `
                    <tr>
                        <td><small>${new Date(m.created_at).toLocaleDateString()}</small></td>
                        <td><strong>${m.name}</strong></td>
                        <td>${m.subject}</td>
                        <td><small>${m.message.substring(0, 50)}...</small></td>
                    </tr>
                `).join('');
            } else {
                list.innerHTML = '<tr><td colspan="4" class="text-center">No messages yet.</td></tr>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showAlert('Error loading messages', 'error');
        }
    }

    // ========================================
    // UTILITIES
    // ========================================

    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        const container = document.querySelector('.admin-content');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 4000);
        }
    }

    async logout() {
        try {
            await window.supabaseClient.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.showAlert('Error logging out', 'error');
        }
    }
}

// ========================================
// INITIALIZE
// ========================================

let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

// Global functions for HTML onclick handlers
window.openModal = (id) => adminDashboard?.openModal(id);
window.closeModal = (id) => adminDashboard?.closeModal(id);
window.deleteProject = (id) => adminDashboard?.deleteProject(id);
window.deleteSkill = (id) => adminDashboard?.deleteSkill(id);
window.deleteSocial = (id) => adminDashboard?.deleteSocial(id);