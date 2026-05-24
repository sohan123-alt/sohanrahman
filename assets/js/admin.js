// ========================================
// ADMIN DASHBOARD - SMOOTH VERSION
// ========================================

class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Initializing Admin Dashboard...');
        
        await this.checkAuth();
        this.setupEventListeners();
        this.setupNavigation();
        this.setupSidebarToggle();
        
        // Load all data
        await Promise.all([
            this.loadProfile(),
            this.loadProjects(),
            this.loadSkills(),
            this.loadSocials(),
            this.loadMessages()
        ]);

        console.log('✅ Admin Dashboard Ready');
    }

    // ========================================
    // AUTHENTICATION
    // ========================================

    async checkAuth() {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();

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
    // SIDEBAR & NAVIGATION
    // ========================================

    setupSidebarToggle() {
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar on mobile when nav item clicked
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link);
            });
        });
    }

    switchTab(element) {
        // Remove active from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');

        // Switch tab content
        const tabId = element.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabId}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'profile': 'Profile Management',
            'projects': 'Projects',
            'skills': 'Skills',
            'social': 'Social Links',
            'messages': 'Messages'
        };
        document.getElementById('page-title').textContent = titles[tabId] || 'Dashboard';
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('project-form')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('skill-form')?.addEventListener('submit', (e) => this.handleSkillSubmit(e));
        document.getElementById('social-form')?.addEventListener('submit', (e) => this.handleSocialSubmit(e));
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    // ========================================
    // PROFILE
    // ========================================

    async loadProfile() {
        try {
            const { data, error } = await window.supabaseClient
                .from('profile')
                .select('*')
                .limit(1);

            if (error) throw error;
            if (!data || data.length === 0) return;

            const profile = data[0];

            document.getElementById('admin-full-name').value = profile.full_name || '';
            document.getElementById('admin-role').value = profile.role || '';
            document.getElementById('admin-email-field').value = profile.email || '';
            document.getElementById('admin-phone').value = profile.phone || '';
            document.getElementById('admin-location').value = profile.location || '';
            document.getElementById('admin-image-url').value = profile.image_url || '';
            document.getElementById('admin-bio').value = profile.bio || '';
            document.getElementById('admin-about').value = profile.about_text || '';

            console.log('✅ Profile loaded');
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

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

            const { data: existing, error: checkError } = await window.supabaseClient
                .from('profile')
                .select('id')
                .limit(1);

            if (checkError) throw checkError;

            let result;
            if (existing && existing.length > 0) {
                result = await window.supabaseClient
                    .from('profile')
                    .update(profileData)
                    .eq('id', existing[0].id);
            } else {
                result = await window.supabaseClient
                    .from('profile')
                    .insert([profileData]);
            }

            if (result.error) throw result.error;
            this.showNotification('✅ Profile Updated!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // ========================================
    // PROJECTS
    // ========================================

    async loadProjects() {
        try {
            const { data, error } = await window.supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            document.getElementById('project-count').textContent = data?.length || 0;

            const projectsList = document.getElementById('projects-list');
            if (!data || data.length === 0) {
                projectsList.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i> No projects</td></tr>';
                return;
            }

            projectsList.innerHTML = data.map(project => `
                <tr>
                    <td><img src="${project.image_url || 'https://via.placeholder.com/50'}" alt="${project.title}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;"></td>
                    <td>${project.title}</td>
                    <td>${project.category || '-'}</td>
                    <td>
                        <button class="action-btn" onclick="dashboard.deleteProject(${project.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            console.log('✅ Projects loaded:', data.length);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            const projectData = {
                title: document.getElementById('p-title').value,
                description: document.getElementById('p-desc').value,
                category: document.getElementById('p-category').value,
                image_url: document.getElementById('p-image').value,
                live_url: document.getElementById('p-live').value,
                github_url: document.getElementById('p-github').value
            };

            const { error } = await window.supabaseClient
                .from('projects')
                .insert([projectData]);

            if (error) throw error;

            e.target.reset();
            this.closeModal('project-modal');
            await this.loadProjects();
            this.showNotification('✅ Project Added!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    async deleteProject(id) {
        if (!confirm('Delete this project?')) return;

        try {
            const { error } = await window.supabaseClient
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await this.loadProjects();
            this.showNotification('✅ Project Deleted!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        }
    }

    // ========================================
    // SKILLS
    // ========================================

    async loadSkills() {
        try {
            const { data, error } = await window.supabaseClient
                .from('skills')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            document.getElementById('skill-count').textContent = data?.length || 0;

            const skillsList = document.getElementById('skills-list');
            if (!data || data.length === 0) {
                skillsList.innerHTML = '<tr><td colspan="3" class="empty-state"><i class="fas fa-inbox"></i> No skills</td></tr>';
                return;
            }

            skillsList.innerHTML = data.map(skill => `
                <tr>
                    <td><i class="${skill.icon_class || 'fas fa-star'}"></i></td>
                    <td>${skill.name}</td>
                    <td>
                        <button class="action-btn" onclick="dashboard.deleteSkill(${skill.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            console.log('✅ Skills loaded:', data.length);
        } catch (error) {
            console.error('Error loading skills:', error);
        }
    }

    async handleSkillSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            const skillData = {
                name: document.getElementById('s-name').value,
                icon_class: document.getElementById('s-icon').value
            };

            const { error } = await window.supabaseClient
                .from('skills')
                .insert([skillData]);

            if (error) throw error;

            e.target.reset();
            this.closeModal('skill-modal');
            await this.loadSkills();
            this.showNotification('✅ Skill Added!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
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
            await this.loadSkills();
            this.showNotification('✅ Skill Deleted!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        }
    }

    // ========================================
    // SOCIAL LINKS
    // ========================================

    async loadSocials() {
        try {
            const { data, error } = await window.supabaseClient
                .from('social_links')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            document.getElementById('social-count').textContent = data?.length || 0;

            const socialsList = document.getElementById('socials-list');
            if (!data || data.length === 0) {
                socialsList.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i> No social links</td></tr>';
                return;
            }

            socialsList.innerHTML = data.map(social => `
                <tr>
                    <td>${social.name}</td>
                    <td><i class="${social.icon_class || 'fas fa-link'}"></i></td>
                    <td><a href="${social.url}" target="_blank">${social.url}</a></td>
                    <td>
                        <button class="action-btn" onclick="dashboard.deleteSocial(${social.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            console.log('✅ Social links loaded:', data.length);
        } catch (error) {
            console.error('Error loading social links:', error);
        }
    }

    async handleSocialSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            const socialData = {
                name: document.getElementById('soc-name').value,
                icon_class: document.getElementById('soc-icon').value,
                url: document.getElementById('soc-url').value
            };

            const { error } = await window.supabaseClient
                .from('social_links')
                .insert([socialData]);

            if (error) throw error;

            e.target.reset();
            this.closeModal('social-modal');
            await this.loadSocials();
            this.showNotification('✅ Social Link Added!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
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
            await this.loadSocials();
            this.showNotification('✅ Social Link Deleted!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        }
    }

    // ========================================
    // MESSAGES
    // ========================================

    async loadMessages() {
        try {
            const { data, error } = await window.supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            document.getElementById('total-messages').textContent = data?.length || 0;
            document.getElementById('msg-badge').textContent = data?.length || 0;

            const messagesList = document.getElementById('messages-list');
            if (!data || data.length === 0) {
                messagesList.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i> No messages</td></tr>';
                return;
            }

            messagesList.innerHTML = data.map(msg => `
                <tr>
                    <td>${msg.name || 'Unknown'}</td>
                    <td>${msg.email || 'N/A'}</td>
                    <td>${msg.subject || '-'}</td>
                    <td>${new Date(msg.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');

            console.log('✅ Messages loaded:', data.length);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // ========================================
    // MODALS
    // ========================================

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ========================================
    // LOGOUT
    // ========================================

    async logout() {
        try {
            await window.supabaseClient.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // ========================================
    // NOTIFICATIONS
    // ========================================

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

let dashboard;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function switchTab(tabName) {
    if (dashboard) {
        const link = document.querySelector(`[data-tab="${tabName}"]`);
        if (link) dashboard.switchTab(link);
    }
}

// ========================================
// INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
});
