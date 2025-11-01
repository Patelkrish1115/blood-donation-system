// ==========================================
// BLOOD DONATION SYSTEM - MAIN.JS (FIXED)
// MySQL + PHP Backend Integration
// ==========================================

const API_URL = 'http://localhost/backend';

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer') || document.body;
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== DONOR REGISTRATION (FIXED) =====
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const data = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            blood_group: formData.get('blood_group'),
            gender: formData.get('gender'),
            age: parseInt(formData.get('age')),
            city: formData.get('city'),
            state: formData.get('state'),
            pincode: formData.get('pincode'),
            address: formData.get('address'),
            availability: formData.get('availability'),
            last_donation_date: formData.get('last_donation_date') || null
        };
        
        try {
            const response = await fetch(`${API_URL}/donors.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('✅ Registration successful! Thank you for becoming a donor.', 'success');
                registerForm.reset();
                loadDonors();
            } else {
                showNotification(`❌ ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('❌ Registration failed. Please check your connection.', 'error');
        }
    });
}

// ===== BLOOD REQUEST (FIXED) =====
const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(requestForm);
        const data = {
            patient_name: formData.get('patient_name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            blood_group: formData.get('blood_group'),
            units_required: parseInt(formData.get('units_required')),
            required_date: formData.get('required_date'),
            hospital_name: formData.get('hospital_name'),
            city: formData.get('city'),
            state: formData.get('state'),
            urgency: formData.get('urgency'),
            message: formData.get('message') || ''
        };
        
        try {
            const response = await fetch(`${API_URL}/requests.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('✅ Blood request submitted successfully!', 'success');
                requestForm.reset();
            } else {
                showNotification(`❌ ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Request error:', error);
            showNotification('❌ Request failed. Please try again.', 'error');
        }
    });
}

// ===== CONTACT FORM (FIXED) =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        try {
            const response = await fetch(`${API_URL}/contacts.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('✅ Message sent successfully!', 'success');
                contactForm.reset();
            } else {
                showNotification(`❌ ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Contact error:', error);
            showNotification('❌ Failed to send message.', 'error');
        }
    });
}

// ===== LOAD DONORS =====
async function loadDonors() {
    try {
        const response = await fetch(`${API_URL}/donors.php`);
        const result = await response.json();
        
        if (result.success) {
            displayDonors(result.data);
            updateStats();
        }
    } catch (error) {
        console.error('Load donors error:', error);
    }
}

// ===== DISPLAY DONORS (FIXED) =====
function displayDonors(donors) {
    const container = document.getElementById('donorsResult');
    if (!container) return;
    
    if (donors.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#7f8c8d; grid-column:1/-1;">No donors found. Try different search criteria.</p>';
        return;
    }
    
    container.innerHTML = donors.map(donor => `
        <div class="donor-card">
            <div class="donor-header">
                <div class="donor-avatar">${donor.blood_group}</div>
                <div class="donor-info">
                    <h3>${donor.full_name}</h3>
                    <span class="blood-badge">${donor.blood_group}</span>
                </div>
            </div>
            <div class="donor-details">
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${donor.phone}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <span>${donor.email}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${donor.city}, ${donor.state}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-venus-mars"></i>
                    <span>${donor.gender} | Age: ${donor.age}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-check-circle"></i>
                    <span class="status-badge ${donor.availability === 'Available' ? 'status-available' : 'status-unavailable'}">${donor.availability}</span>
                </div>
            </div>
            ${donor.last_donation_date ? `
                <p style="font-size:0.85rem; color:#7f8c8d; margin-top:1rem;">
                    <i class="fas fa-calendar"></i> Last Donation: ${new Date(donor.last_donation_date).toLocaleDateString('en-IN')}
                </p>
            ` : ''}
        </div>
    `).join('');
}

// ===== SEARCH DONORS (FIXED) =====
window.searchDonors = async function() {
    const bloodGroup = document.getElementById('searchBloodGroup').value;
    const city = document.getElementById('searchCity').value.trim();
    
    if (!bloodGroup && !city) {
        showNotification('Please select blood group or enter city', 'error');
        return;
    }
    
    try {
        const params = new URLSearchParams();
        if (bloodGroup) params.append('blood_group', bloodGroup);
        if (city) params.append('city', city);
        params.append('search', 'true');
        
        const response = await fetch(`${API_URL}/donors.php?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
            displayDonors(result.data);
            showNotification(`Found ${result.count} donor(s)`, 'success');
        } else {
            showNotification('No donors found', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed', 'error');
    }
};

// ===== CLEAR SEARCH (FIXED) =====
window.clearSearch = function() {
    document.getElementById('searchBloodGroup').value = '';
    document.getElementById('searchCity').value = '';
    const container = document.getElementById('donorsResult');
    if (container) {
        container.innerHTML = '<p style="text-align:center; color:#7f8c8d; grid-column:1/-1;">🔍 Search for donors using blood group or city</p>';
    }
};

// ===== UPDATE STATS =====
async function updateStats() {
    try {
        const donorsRes = await fetch(`${API_URL}/donors.php`);
        const donorsData = await donorsRes.json();
        
        const requestsRes = await fetch(`${API_URL}/requests.php`);
        const requestsData = await requestsRes.json();
        
        if (donorsData.success) {
            const totalDonorsEl = document.getElementById('totalDonors');
            const heroTotalDonorsEl = document.getElementById('heroTotalDonors');
            if (totalDonorsEl) totalDonorsEl.textContent = donorsData.count;
            if (heroTotalDonorsEl) heroTotalDonorsEl.textContent = donorsData.count;
        }
        
        if (requestsData.success) {
            const totalRequestsEl = document.getElementById('totalRequests');
            if (totalRequestsEl) totalRequestsEl.textContent = requestsData.count;
        }
    } catch (error) {
        console.error('Stats update error:', error);
    }
}

// ===== LOAD BLOOD GROUPS =====
function loadBloodGroups() {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const container = document.getElementById('bloodGroupsGrid');
    
    if (container) {
        container.innerHTML = bloodGroups.map(group => `
            <div class="blood-card">
                <h3>${group}</h3>
                <div class="units" id="count-${group}">0</div>
                <p class="label">Donors</p>
            </div>
        `).join('');
        
        updateBloodGroupCounts();
    }
}

async function updateBloodGroupCounts() {
    try {
        const response = await fetch(`${API_URL}/donors.php`);
        const result = await response.json();
        
        if (result.success) {
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            bloodGroups.forEach(group => {
                const count = result.data.filter(d => d.blood_group === group).length;
                const el = document.getElementById(`count-${group}`);
                if (el) el.textContent = count;
            });
        }
    } catch (error) {
        console.error('Blood group count error:', error);
    }
}

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// ===== MOBILE MENU =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            if (navMenu) navMenu.classList.remove('active');
        }
    });
});

// ===== SCROLL TO TOP =====
const scrollTop = document.getElementById('scrollTop');
if (scrollTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('show');
        } else {
            scrollTop.classList.remove('show');
        }
    });
    
    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
    console.log('🩸 BloodConnect System Initialized');
    updateStats();
    loadBloodGroups();
    
    // Set min date for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.setAttribute('min', today);
    });
});

// Auto refresh every 60 seconds
setInterval(() => {
    updateStats();
    updateBloodGroupCounts();
}, 60000);

console.log('✅ BloodConnect v2.0 | Backend: ' + API_URL);
