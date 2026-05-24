document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // SELECT ELEMENTS
    // ========================================

    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const themeToggle = document.getElementById('theme-toggle');
    const preloader = document.getElementById('preloader');
    const fadeElements = document.querySelectorAll('.fade-in');
    const contactForm = document.getElementById('contact-form');

    // ========================================
    // PRELOADER
    // ========================================

    window.addEventListener('load', () => {

        if (!preloader) return;

        setTimeout(() => {

            preloader.style.opacity = '0';

            setTimeout(() => {

                preloader.style.display = 'none';

            }, 500);

        }, 800);

    });

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================

    window.addEventListener('scroll', () => {

        if (window.scrollY > 50) {

            navbar.classList.add('scrolled');

        } else {

            navbar.classList.remove('scrolled');

        }

        updateActiveLink();

    });

    function updateActiveLink() {

        let current = '';

        const sections = document.querySelectorAll('section');

        sections.forEach(section => {

            const sectionTop = section.offsetTop;

            if (window.pageYOffset >= sectionTop - 200) {

                current = section.getAttribute('id');

            }

        });

        document.querySelectorAll('.nav-links a').forEach(link => {

            link.classList.remove('active');

            if (link.getAttribute('href') === `#${current}`) {

                link.classList.add('active');

            }

        });

    }

    // ========================================
    // MOBILE MENU
    // ========================================

    if (hamburger && navLinks) {

        hamburger.addEventListener('click', () => {

            hamburger.classList.toggle('active');

            navLinks.classList.toggle('active');

        });

    }

    // CLOSE MOBILE MENU

    document.querySelectorAll('.nav-links a').forEach(link => {

        link.addEventListener('click', () => {

            navLinks.classList.remove('active');

            hamburger.classList.remove('active');

        });

    });

    // ========================================
    // DARK / LIGHT MODE
    // ========================================

    if (themeToggle) {

        themeToggle.addEventListener('click', () => {

            document.body.classList.toggle('dark-mode');

            const icon = themeToggle.querySelector('i');

            if (document.body.classList.contains('dark-mode')) {

                icon.classList.replace('fa-moon', 'fa-sun');

                localStorage.setItem('theme', 'dark');

            } else {

                icon.classList.replace('fa-sun', 'fa-moon');

                localStorage.setItem('theme', 'light');

            }

        });

    }

    // LOAD SAVED THEME

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {

        document.body.classList.add('dark-mode');

        if (themeToggle) {

            themeToggle
                .querySelector('i')
                .classList.replace('fa-moon', 'fa-sun');

        }

    }

    // ========================================
    // SCROLL ANIMATION
    // ========================================

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add('visible');

            }

        });

    }, {
        threshold: 0.1
    });

    fadeElements.forEach(el => observer.observe(el));

    // ========================================
    // FETCH DATA FROM SUPABASE
    // ========================================

    async function fetchData() {

        try {

            if (!window.supabaseClient) {

                console.error('❌ Supabase client not found');

                return;
            }

            // ========================================
            // PROFILE
            // ========================================
// ========================================
// FETCH PROFILE
// ========================================

const { data: profiles, error: pError } = await window.supabaseClient
    .from('profile')
    .select('*')
    .limit(1);

if (pError) {
    console.error('Profile Error:', pError);
} else {

    const profile = profiles?.[0];

    if (profile) {

        document.getElementById('hero-name').textContent =
            profile.full_name || 'Your Name';

        document.getElementById('hero-role').textContent =
            profile.role || 'Creative Developer';

        document.getElementById('hero-bio').textContent =
            profile.bio || '';

        document.getElementById('about-text').textContent =
            profile.about_text || '';

        document.getElementById('profile-img').src =
            profile.image_url ||
            'https://i.imgur.com/6VBx3io.png';

        document.getElementById('contact-email').textContent =
            profile.email || '';

        document.getElementById('contact-phone').textContent =
            profile.phone || '';

        document.getElementById('contact-location').textContent =
            profile.location || '';
    }
}
            

            // ========================================
            // SKILLS
            // ========================================

            const {
                data: skills,
                error: skillsError
            } = await window.supabaseClient
                .from('skills')
                .select('*')
                .order('id', {
                    ascending: true
                });

            if (skillsError) {

                console.error('Skills Error:', skillsError);

            }

            if (skills) {

                const skillsContainer =
                    document.getElementById('skills-container');

                skillsContainer.innerHTML = skills.map(skill => `

                    <div class="skill-card fade-in">

                        <i class="${skill.icon_class}"></i>

                        <h4>${skill.name}</h4>

                    </div>

                `).join('');

                document
                    .querySelectorAll('.skill-card')
                    .forEach(el => observer.observe(el));

            }

            // ========================================
            // PROJECTS
            // ========================================

            const {
                data: projects,
                error: projectsError
            } = await window.supabaseClient
                .from('projects')
                .select('*')
                .order('id', {
                    ascending: false
                });

            if (projectsError) {

                console.error('Projects Error:', projectsError);

            }

            if (projects) {

                const projectsContainer =
                    document.getElementById('projects-container');

                projectsContainer.innerHTML = projects.map(project => `

                    <div
                        class="project-card fade-in"
                        data-category="${project.category || 'all'}"
                    >

                        <div class="project-img">

                            <img
                                src="${project.image_url || 'https://via.placeholder.com/600'}"
                                alt="${project.title}"
                                loading="lazy"
                                onerror="this.src='https://via.placeholder.com/600'"
                            >

                        </div>

                        <div class="project-info">

                            <h3>${project.title || 'Untitled Project'}</h3>

                            <p>${project.description || ''}</p>

                            <div class="project-links">

                                ${project.live_url ? `
                                    <a
                                        href="${project.live_url}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                ` : ''}

                                ${project.github_url ? `
                                    <a
                                        href="${project.github_url}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i class="fab fa-github"></i>
                                    </a>
                                ` : ''}

                            </div>

                        </div>

                    </div>

                `).join('');

                document
                    .querySelectorAll('.project-card')
                    .forEach(el => observer.observe(el));

            }

            // ========================================
            // SOCIAL LINKS
            // ========================================

            const {
                data: socials,
                error: socialsError
            } = await window.supabaseClient
                .from('social_links')
                .select('*');

            if (socialsError) {

                console.error('Social Error:', socialsError);

            }

            if (socials) {

                const socialHTML = socials.map(social => `

                    <a
                        href="${social.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <i class="${social.icon_class}"></i>

                    </a>

                `).join('');

                document.getElementById('hero-socials').innerHTML =
                    socialHTML;

                document.getElementById('footer-socials').innerHTML =
                    socialHTML;

            }

            console.log('✅ Portfolio data loaded');

        } catch (error) {

            console.error('❌ Fetch Error:', error);

        }

    }

    // ========================================
    // CALL FETCH DATA
    // ========================================

    fetchData();

    // ========================================
    // CONTACT FORM
    // ========================================

    if (contactForm) {

        contactForm.addEventListener('submit', async (e) => {

            e.preventDefault();

            const submitBtn =
                contactForm.querySelector('button');

            const originalText =
                submitBtn.innerHTML;

            submitBtn.disabled = true;

            submitBtn.innerHTML = 'Sending...';

            const formData = {

                name:
                    document.getElementById('name').value.trim(),

                email:
                    document.getElementById('email').value.trim(),

                subject:
                    document.getElementById('subject').value.trim(),

                message:
                    document.getElementById('message').value.trim(),

                created_at:
                    new Date().toISOString()

            };

            try {

                const {
                    error
                } = await window.supabaseClient
                    .from('messages')
                    .insert([formData]);

                if (error) {

                    throw error;

                }

                alert('✅ Message sent successfully');

                contactForm.reset();

            } catch (error) {

                console.error(error);

                alert('❌ Failed to send message');

            } finally {

                submitBtn.disabled = false;

                submitBtn.innerHTML = originalText;

            }

        });

    }

});
