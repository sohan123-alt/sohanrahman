// Education Management for Public Portfolio
document.addEventListener('DOMContentLoaded', () => {
    fetchEducation();
});

async function fetchEducation() {
    const educationContainer = document.getElementById('education-timeline');
    if (!educationContainer) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('education')
            .select('*')
            .eq('visible', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            educationContainer.innerHTML = '<p class="text-center">No education history found.</p>';
            return;
        }

        renderEducation(data);
    } catch (error) {
        console.error('Error fetching education:', error.message);
        educationContainer.innerHTML = '<p class="text-center text-danger">Failed to load education data.</p>';
    }
}

function renderEducation(education) {
    const educationContainer = document.getElementById('education-timeline');
    educationContainer.innerHTML = '';

    education.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'timeline-item';
        if (window.AOS) {
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', index * 100);
        }

        card.innerHTML = `
            <div class="education-card">
                <div class="edu-header">
                    <div class="edu-title">
                        <h3>${item.degree}</h3>
                        <span class="edu-dept">${item.department}</span>
                    </div>
                    <span class="edu-status status-${item.status.toLowerCase()}">${item.status}</span>
                </div>
                <div class="edu-info">
                    <span class="edu-inst"><i class="fas fa-university"></i> ${item.institution}</span>
                    <div class="edu-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${item.session}</span>
                        <span><i class="fas fa-clock"></i> ${item.duration}</span>
                        ${item.result ? `<span><i class="fas fa-graduation-cap"></i> ${item.result}</span>` : ''}
                    </div>
                </div>
                ${item.description ? `<p class="edu-desc">${item.description}</p>` : ''}
            </div>
        `;
        educationContainer.appendChild(card);
    });
}
