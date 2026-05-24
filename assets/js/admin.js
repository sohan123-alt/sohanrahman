// ========================================
// ADMIN DASHBOARD WITH SUPABASE
// ========================================

class AdminDashboard {

    constructor() {
        this.init();
    }

    async init() {

        await this.checkAuth();

        this.setupEventListeners();

        await this.loadProfile();
        await this.loadProjects();
        await this.loadSkills();
        await this.loadSocials();
        await this.loadMessages();
    }

    // ========================================
    // AUTH CHECK
    // ========================================

    async checkAuth() {

        const { data: { session } } =
            await window.supabaseClient.auth.getSession();

        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('admin-email').textContent =
            session.user.email;
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {

        document.getElementById('profile-form')
            ?.addEventListener('submit',
                (e) => this.handleProfileSubmit(e));

        document.getElementById('project-form')
            ?.addEventListener('submit',
                (e) => this.handleProjectSubmit(e));

        document.getElementById('skill-form')
            ?.addEventListener('submit',
                (e) => this.handleSkillSubmit(e));

        document.getElementById('social-form')
            ?.addEventListener('submit',
                (e) => this.handleSocialSubmit(e));

        document.getElementById('logout-btn')
            ?.addEventListener('click',
                () => this.logout());
    }

    // ========================================
    // LOAD PROFILE
    // ========================================

    async loadProfile() {

        const { data, error } =
            await window.supabaseClient
                .from('profile')
                .select('*')
                .limit(1);

        if (error) {
            console.error(error);
            return;
        }

        const profile = data[0];

        if (!profile) return;

        document.getElementById('admin-full-name').value =
            profile.full_name || '';

        document.getElementById('admin-role').value =
            profile.role || '';

        document.getElementById('admin-email-field').value =
            profile.email || '';

        document.getElementById('admin-phone').value =
            profile.phone || '';

        document.getElementById('admin-location').value =
            profile.location || '';

        document.getElementById('admin-image-url').value =
            profile.image_url || '';

        document.getElementById('admin-bio').value =
            profile.bio || '';

        document.getElementById('admin-about').value =
            profile.about_text || '';
    }

    // ========================================
    // SAVE PROFILE
    // ========================================

    async handleProfileSubmit(e) {

        e.preventDefault();

        const profileData = {
            full_name:
                document.getElementById('admin-full-name').value,

            role:
                document.getElementById('admin-role').value,

            email:
                document.getElementById('admin-email-field').value,

            phone:
                document.getElementById('admin-phone').value,

            location:
                document.getElementById('admin-location').value,

            image_url:
                document.getElementById('admin-image-url').value,

            bio:
                document.getElementById('admin-bio').value,

            about_text:
                document.getElementById('admin-about').value
        };

        const { data: existing } =
            await window.supabaseClient
                .from('profile')
                .select('id')
                .limit(1);

        let error;

        if (existing.length > 0) {

            ({ error } = await window.supabaseClient
                .from('profile')
                .update(profileData)
                .eq('id', existing[0].id));

        } else {

            ({ error } = await window.supabaseClient
                .from('profile')
                .insert([profileData]));
        }

        if (error) {
            console.error(error);
            alert('Profile update failed');
            return;
        }

        alert('✅ Profile Updated');
    }

    // ========================================
    // LOAD PROJECTS
    // ========================================

    async loadProjects() {

        const projectsList =
            document.getElementById('projects-list');

        const { data, error } =
            await window.supabaseClient
                .from('projects')
                .select('*');

        if (error) {
            console.error(error);
            return;
        }

        if (!data.length) {

            projectsList.innerHTML =
                `<tr>
                    <td colspan="4">
                        No Projects
                    </td>
                </tr>`;

            return;
        }

        projectsList.innerHTML = data.map(project => `
            <tr>

                <td>
                    <img src="${project.image_url}"
                    style="width:60px;height:60px;object-fit:cover;">
                </td>

                <td>${project.title}</td>

                <td>${project.category}</td>

                <td>
                    <button onclick="dashboard.deleteProject(${project.id})">
                        Delete
                    </button>
                </td>

            </tr>
        `).join('');
    }

    // ========================================
    // ADD PROJECT
    // ========================================

    async handleProjectSubmit(e) {

        e.preventDefault();

        const project = {

            title:
                document.getElementById('p-title').value,

            description:
                document.getElementById('p-desc').value,

            category:
                document.getElementById('p-category').value,

            image_url:
                document.getElementById('p-image').value,

            live_url:
                document.getElementById('p-live').value,

            github_url:
                document.getElementById('p-github').value
        };

        const { error } =
            await window.supabaseClient
                .from('projects')
                .insert([project]);

        if (error) {
            console.error(error);
            alert('Project insert failed');
            return;
        }

        document.getElementById('project-form').reset();

        await this.loadProjects();

        alert('✅ Project Added');
    }

    // ========================================
    // DELETE PROJECT
    // ========================================

    async deleteProject(id) {

        const { error } =
            await window.supabaseClient
                .from('projects')
                .delete()
                .eq('id', id);

        if (error) {
            console.error(error);
            return;
        }

        await this.loadProjects();
    }

    // ========================================
    // LOAD SKILLS
    // ========================================

    async loadSkills() {

        const skillsList =
            document.getElementById('skills-list');

        const { data, error } =
            await window.supabaseClient
                .from('skills')
                .select('*');

        if (error) {
            console.error(error);
            return;
        }

        skillsList.innerHTML = data.map(skill => `
            <tr>

                <td>
                    <i class="${skill.icon_class}"></i>
                </td>

                <td>${skill.name}</td>

                <td>
                    <button onclick="dashboard.deleteSkill(${skill.id})">
                        Delete
                    </button>
                </td>

            </tr>
        `).join('');
    }

    // ========================================
    // ADD SKILL
    // ========================================

    async handleSkillSubmit(e) {

        e.preventDefault();

        const skill = {

            name:
                document.getElementById('s-name').value,

            icon_class:
                document.getElementById('s-icon').value
        };

        const { error } =
            await window.supabaseClient
                .from('skills')
                .insert([skill]);

        if (error) {
            console.error(error);
            return;
        }

        document.getElementById('skill-form').reset();

        await this.loadSkills();

        alert('✅ Skill Added');
    }

    // ========================================
    // DELETE SKILL
    // ========================================

    async deleteSkill(id) {

        await window.supabaseClient
            .from('skills')
            .delete()
            .eq('id', id);

        await this.loadSkills();
    }

    // ========================================
    // LOAD SOCIAL LINKS
    // ========================================

    async loadSocials() {

        const socialsList =
            document.getElementById('socials-list');

        const { data } =
            await window.supabaseClient
                .from('social_links')
                .select('*');

        socialsList.innerHTML = data.map(social => `
            <tr>

                <td>${social.name}</td>

                <td>
                    <i class="${social.icon_class}"></i>
                </td>

                <td>${social.url}</td>

                <td>
                    <button onclick="dashboard.deleteSocial(${social.id})">
                        Delete
                    </button>
                </td>

            </tr>
        `).join('');
    }

    // ========================================
    // ADD SOCIAL
    // ========================================

    async handleSocialSubmit(e) {

        e.preventDefault();

        const social = {

            name:
                document.getElementById('soc-name').value,

            icon_class:
                document.getElementById('soc-icon').value,

            url:
                document.getElementById('soc-url').value
        };

        await window.supabaseClient
            .from('social_links')
            .insert([social]);

        document.getElementById('social-form').reset();

        await this.loadSocials();

        alert('✅ Social Added');
    }

    // ========================================
    // DELETE SOCIAL
    // ========================================

    async deleteSocial(id) {

        await window.supabaseClient
            .from('social_links')
            .delete()
            .eq('id', id);

        await this.loadSocials();
    }

    // ========================================
    // LOAD MESSAGES
    // ========================================

    async loadMessages() {

        const messagesList =
            document.getElementById('messages-list');

        const { data } =
            await window.supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

        messagesList.innerHTML = data.map(msg => `
            <tr>

                <td>${msg.name}</td>

                <td>${msg.email}</td>

                <td>${msg.subject}</td>

                <td>${msg.message}</td>

            </tr>
        `).join('');
    }

    // LOGOUT
    async logout() {

        await window.supabaseClient.auth.signOut();

        window.location.href = 'login.html';
    }
}

// INITIALIZE
let dashboard;

document.addEventListener('DOMContentLoaded', () => {

    dashboard = new AdminDashboard();

    console.log('✅ Dashboard Ready');
});
