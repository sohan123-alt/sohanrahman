document.addEventListener('DOMContentLoaded', () => {
    // Select Elements
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const themeToggle = document.getElementById('theme-toggle');
    const preloader = document.getElementById('preloader');
    const fadeElements = document.querySelectorAll('.fade-in');
    const contactForm = document.getElementById('contact-form');

    // 1. Preloader
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    });

    // 2. Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link on Scroll
        updateActiveLink();
    });

    function updateActiveLink() {
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').includes(current)) {
                a.classList.add('active');
            }
        });
    }

    // 3. Mobile Menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when link clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // 4. Dark/Light Mode
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

    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // 5. Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 6. Supabase Data Integration
    async function fetchData() {
        if (!window.supabaseClient) {
            console.error("Supabase not initialized. Check your config.");
            return;
        }

        try {
            // Fetch Profile
            const { data: profile, error: pError } = await window.supabaseClient
                .from('profile')
                .select('*')
                .single();

            if (profile) {
                document.getElementById('hero-name').textContent = profile.full_name || 'Loading...';
                document.getElementById('hero-role').textContent = profile.role || 'Creative Developer';
                document.getElementById('hero-bio').textContent = profile.bio || '';
                document.getElementById('about-text').textContent = profile.about_text || '';
                document.getElementById('profile-img').src = profile.image_url || 'https://via.placeholder.com/500';
                document.getElementById('contact-email').textContent = profile.email || '';
                document.getElementById('contact-phone').textContent = profile.phone || '';
                document.getElementById('contact-location').textContent = profile.location || '';
            }

            // Fetch Skills
            const { data: skills, error: sError } = await window.supabaseClient
                .from('skills')
                .select('*');

            if (skills) {
                const skillsContainer = document.getElementById('skills-container');
                skillsContainer.innerHTML = skills.map(skill => `
                    <div class="skill-card fade-in">
                        <i class="${skill.icon_class}"></i>
                        <h4>${skill.name}</h4>
                    </div>
                `).join('');
                // Observe new elements
                document.querySelectorAll('.skill-card').forEach(el => observer.observe(el));
            }

            // Fetch Projects
            const { data: projects, error: prError } = await window.supabaseClient
                .from('projects')
                .select('*');

            if (projects) {
                const projectsContainer = document.getElementById('projects-container');
                projectsContainer.innerHTML = projects.map(project => `
                    <div class="project-card fade-in" data-category="${project.category}">
                        <div class="project-img">
                            <img src="${project.image_url}" alt="${project.title}">
                        </div>
                        <div class="project-info">
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <div class="project-links">
                                <a href="${project.live_url}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
                                <a href="${project.github_url}" target="_blank"><i class="fab fa-github"></i></a>
                            </div>
                        </div>
                    </div>
                `).join('');
                document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
            }

            // Fetch Social Links
            const { data: socials, error: socError } = await window.supabaseClient
                .from('social_links')
                .select('*');

            if (socials) {
                const socialHtml = socials.map(soc => `
                    <a href="${soc.url}" target="_blank"><i class="${soc.icon_class}"></i></a>
                `).join('');
                document.getElementById('hero-socials').innerHTML = socialHtml;
                document.getElementById('footer-socials').innerHTML = socialHtml;
            }

        } catch (error) {
            console.error("Error fetching data from Supabase:", error);
        }
    }

    // Call fetch if supabase is ready
    if (window.supabaseClient) {
        fetchData();
    }

    // 7. Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                created_at: new Date()
            };

            try {
                const { error } = await window.supabaseClient
                    .from('messages')
                    .insert([formData]);

                if (error) throw error;

                alert('Message sent successfully!');
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to send message. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
