// ========================================
// ADMIN DASHBOARD WITH SUPABASE - COMPLETE
// ========================================

class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupNavigation();
        this.setupEventListeners();
        this.setupSidebarToggle();
        await this.loadProfile();
        await this.loadProjects();
        await this.loadSkills();
        await this.loadSocials();
        await this.loadMessages();
        this.updateStats();
        console.log('✅ Dashboard Ready');
    }

    // ========================================
    // AUTH CHECK
    // ========================================

    async checkAuth() {
        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();

            if (!session) {
                window.location.href = 'login.html';
                return;
            }

            document.getElementById('admin-email').textContent = session.user.email;
            console.log('✅ User authenticated:', session.user.email);
        } catch (error) {
            console.error('Auth error:', error);
            window.location.href = 'login.html';
        }
    }

    // ========================================
    // SIDEBAR TOGGLE (মোবাইলের জন্য)
    // ========================================

    setupSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // মোবাইলে ক্লিক করলে সাইডবার বন্ধ হবে
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    // ========================================
    // NAVIGATION
    // ========================================

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link);
            });
        });
    }

    switchTab(element) {
        // আগের ট্যাব ডিঅ্যাক্টিভ করুন
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');

        // ট্যাব কন্টেন্ট স্যুইচ করুন
        const tabId = element.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabId}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // ফর্ম সাবমিট
        document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        document.getElementById('project-form')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        document.getElementById('skill-form')?.addEventListener('submit', (e) => this.handleSkillSubmit(e));
        document.getElementById('social-form')?.addEventListener('submit', (e) => this.handleSocialSubmit(e));

        // লগআউট
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    // ========================================
    // PROFILE - LOAD
    // ========================================

    async loadProfile() {
        try {
            const { data, error } = await window.supabaseClient
                .from('profile')
                .select('*')
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                console.log('No profile found');
                return;
            }

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

    // ========================================
    // PROFILE - SAVE
    // ========================================

    async handleProfileSubmit(e) {
        e.preventDefault();

        const btn = e.target.querySelector('button[type="submit"]');
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

            // চেক করুন প্রোফাইল আছে কিনা
            const { data: existing, error: checkError } = await window.supabaseClient
                .from('profile')
                .select('id')
                .limit(1);

            if (checkError) throw checkError;

            let result;

            if (existing && existing.length > 0) {
                // আপডেট করুন
                result = await window.supabaseClient
                    .from('profile')
                    .update(profileData)
                    .eq('id', existing[0].id);
            } else {
                // তৈরি করুন
                result = await window.supabaseClient
                    .from('profile')
                    .insert([profileData]);
            }

            if (result.error) throw result.error;

            this.showNotification('✅ Profile Updated Successfully!', 'success');
            console.log('✅ Profile saved');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    }

    // ========================================
    // PROJECTS - LOAD
    // ========================================

    async loadProjects() {
        try {
            const projectsList = document.getElementById('projects-list');

            const { data, error } = await window.supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            document.getElementById('project-count').textContent = data?.length || 0;

            if (!data || data.length === 0) {
                projectsList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No projects yet. Add your first project!</td></tr>';
                return;
            }

            projectsList.innerHTML = data.map(project => `
                <tr>
                    <td>
                        <img src="${project.image_url || 'https://via.placeholder.com/50'}" 
                             alt="${project.title}" 
                             class="table-img">
                    </td>
                    <td><strong>${project.title}</strong></td>
                    <td>${project.category || 'Uncategorized'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn delete" onclick="dashboard.deleteProject(${project.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            console.log('✅ Projects loaded:', data.length);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // ========================================
    // PROJECTS - ADD
    // ========================================

    async handleProjectSubmit(e) {
        e.preventDefault();

        const btn = e.target.querySelector('button[type="submit"]');
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
            this.showNotification('✅ Project Added Successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save Project';
        }
    }

    // ========================================
    // PROJECTS - DELETE
    // ========================================

    async deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project?')) return;

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
    // SKILLS - LOAD
    // ========================================

    async loadSkills() {
        try {
            const skillsList = document.getElementById('skills-list');

            const { data, error } = await window.supabaseClient
                .from('skills')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            document.getElementById('skill-count').textContent = data?.length || 0;

            if (!data || data.length === 0) {
                skillsList.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No skills yet. Add your first skill!</td></tr>';
                return;
            }

            skillsList.innerHTML = data.map(skill => `
                <tr>
                    <td><i class="${skill.icon_class || 'fas fa-star'}"></i></td>
                    <td><strong>${skill.name}</strong></td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn delete" onclick="dashboard.deleteSkill(${skill.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            console.log('✅ Skills loaded:', data.length);
        } catch (error) {
            console.error('Error loading skills:', error);
        }
    }

    // ========================================
    // SKILLS - ADD
    // ========================================

    async handleSkillSubmit(e) {
        e.preventDefault();

        const btn = e.target.querySelector('button[type="submit"]');
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
            this.showNotification('✅ Skill Added Successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save Skill';
        }
    }

    // ========================================
    // SKILLS - DELETE
    // ========================================

    async deleteSkill(id) {
        if (!confirm('Are you sure you want to delete this skill?')) return;

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
    // SOCIAL LINKS - LOAD
    // ========================================

    async loadSocials() {
        try {
            const socialsList = document.getElementById('socials-list');

            const { data, error } = await window.supabaseClient
                .from('social_links')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            document.getElementById('social-count').textContent = data?.length || 0;

            if (!data || data.length === 0) {
                socialsList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No social links yet. Add your profiles!</td></tr>';
                return;
            }

            socialsList.innerHTML = data.map(social => `
                <tr>
                    <td><strong>${social.name}</strong></td>
                    <td><i class="${social.icon_class || 'fas fa-link'}"></i></td>
                    <td><a href="${social.url}" target="_blank">${social.url}</a></td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn delete" onclick="dashboard.deleteSocial(${social.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            console.log('✅ Social links loaded:', data.length);
        } catch (error) {
            console.error('Error loading social links:', error);
        }
    }

    // ========================================
    // SOCIAL LINKS - ADD
    // ========================================

    async handleSocialSubmit(e) {
        e.preventDefault();

        const btn = e.target.querySelector('button[type="submit"]');
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
            this.showNotification('✅ Social Link Added Successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save Link';
        }
    }

    // ========================================
    // SOCIAL LINKS - DELETE
    // ========================================

    async deleteSocial(id) {
        if (!confirm('Are you sure you want to delete this social link?')) return;

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
    // MESSAGES - LOAD
    // ========================================

    async loadMessages() {
        try {
            const messagesList = document.getElementById('messages-list');

            const { data, error } = await window.supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            document.getElementById('total-messages').textContent = data?.length || 0;
            document.getElementById('message-count').textContent = data?.length || 0;

            if (!data || data.length === 0) {
                messagesList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No messages yet</td></tr>';
                return;
            }

            messagesList.innerHTML = data.map(msg => `
                <tr>
                    <td><strong>${msg.name || 'Unknown'}</strong></td>
                    <td>${msg.email || 'N/A'}</td>
                    <td>${msg.subject || 'No Subject'}</td>
                    <td>${new Date(msg.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');

            console.log('✅ Messages loaded:', data.length);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // ========================================
    // UPDATE STATS
    // ========================================

    async updateStats() {
        try {
            const [{ count: projectCount }, { count: skillCount }, { count: socialCount }, { count: messageCount }] = await Promise.all([
                window.supabaseClient.from('projects').select('*', { count: 'exact', head: true }),
                window.supabaseClient.from('skills').select('*', { count: 'exact', head: true }),
                window.supabaseClient.from('social_links').select('*', { count: 'exact', head: true }),
                window.supabaseClient.from('messages').select('*', { count: 'exact', head: true })
            ]);

            document.getElementById('project-count').textContent = projectCount || 0;
            document.getElementById('skill-count').textContent = skillCount || 0;
            document.getElementById('social-count').textContent = socialCount || 0;
            document.getElementById('total-messages').textContent = messageCount || 0;
            document.getElementById('message-count').textContent = messageCount || 0;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // ========================================
    // MODAL FUNCTIONS
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
    // NOTIFICATION
    // ========================================

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

let dashboard;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function switchTab(tabName) {
    if (dashboard) {
        const link = document.querySelector(`[data-tab="${tabName}"]`);
        if (link) {
            dashboard.switchTab(link);
        }
    }
}

// ========================================
// INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
});
