// ==================== INITIALIZATION ====================

function initializeData() {
    if (!localStorage.getItem('donors')) {
        localStorage.setItem('donors', JSON.stringify([]));
    }
    if (!localStorage.getItem('requests')) {
        localStorage.setItem('requests', JSON.stringify([]));
    }
    if (!localStorage.getItem('contacts')) {
        localStorage.setItem('contacts', JSON.stringify([]));
    }
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light');
    }
}

// ==================== FIXED DARK MODE TOGGLE ====================

const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

loadTheme();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        if (typeof showNotification === 'function') {
            showNotification(isDark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'success');
        }
    });
}

// ==================== SCROLL TO TOP ====================

const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-times-circle' : 
                 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <div>${message}</div>
        <i class="fas fa-times notification-close"></i>
    `;
    
    container.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ==================== NAVIGATION ====================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==================== STATISTICS ====================

function loadStatistics() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    
    animateCounter('totalDonors', donors.length);
    animateCounter('totalRequests', requests.length);
    animateCounter('heroTotalDonors', donors.length);
    animateCounter('heroLivesSaved', requests.filter(r => r.status === 'Fulfilled').length * 3);
}

function animateCounter(id, target) {
    const element = document.getElementById(id);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// ==================== BLOOD GROUPS ====================

function loadBloodGroups() {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const grid = document.getElementById('bloodGroupsGrid');
    
    if (grid) {
        grid.innerHTML = '';
        bloodGroups.forEach((group, index) => {
            const count = donors.filter(d => d.blood_group === group && d.availability === 'Available').length;
            const card = document.createElement('div');
            card.className = 'blood-card animate__animated animate__fadeInUp';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <h3>${group}</h3>
                <div class="units">${count}</div>
                <div class="label">Donors Available</div>
            `;
            grid.appendChild(card);
        });
    }
}

// ==================== SEARCH DONORS ====================

function searchDonors() {
    const bloodGroup = document.getElementById('searchBloodGroup').value;
    const city = document.getElementById('searchCity').value.toLowerCase();
    const resultsDiv = document.getElementById('donorsResult');
    
    if (!bloodGroup && !city) {
        showNotification('Please select blood group or enter city', 'warning');
        return;
    }
    
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    
    let filteredDonors = donors;
    
    if (bloodGroup) {
        filteredDonors = filteredDonors.filter(d => d.blood_group === bloodGroup);
    }
    
    if (city) {
        filteredDonors = filteredDonors.filter(d => d.city.toLowerCase().includes(city));
    }
    
    if (filteredDonors.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-color);">❌ No donors found matching your criteria. Try different filters!</p>';
        showNotification('No donors found', 'warning');
        return;
    }
    
    resultsDiv.innerHTML = '';
    filteredDonors.forEach((donor, index) => {
        const initial = donor.full_name.charAt(0).toUpperCase();
        const statusClass = donor.availability === 'Available' ? 'status-available' : 'status-unavailable';
        
        const card = document.createElement('div');
        card.className = 'donor-card animate__animated animate__fadeInUp';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="donor-header">
                <div class="donor-avatar">${initial}</div>
                <div class="donor-info">
                    <h3>${donor.full_name}</h3>
                    <span class="blood-badge">${donor.blood_group}</span>
                </div>
            </div>
            <div class="donor-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${donor.city}, ${donor.state}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${donor.phone}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <span>${donor.email}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-venus-mars"></i>
                    <span>${donor.gender}, ${donor.age} years</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-circle"></i>
                    <span class="status-badge ${statusClass}">${donor.availability}</span>
                </div>
            </div>
        `;
        resultsDiv.appendChild(card);
    });
    
    showNotification(`✅ Found ${filteredDonors.length} donor(s)`, 'success');
}

function clearSearch() {
    document.getElementById('searchBloodGroup').value = '';
    document.getElementById('searchCity').value = '';
    document.getElementById('donorsResult').innerHTML = '<p style="text-align: center; color: #7f8c8d; grid-column: 1/-1;">🔍 Search for donors using blood group or city</p>';
    showNotification('Search cleared', 'success');
}

// ==================== FORM SUBMISSIONS ====================

const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const request = {
            id: Date.now(),
            patient_name: formData.get('patient_name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            blood_group: formData.get('blood_group'),
            units_required: formData.get('units_required'),
            required_date: formData.get('required_date'),
            hospital_name: formData.get('hospital_name'),
            urgency: formData.get('urgency'),
            city: formData.get('city'),
            state: formData.get('state'),
            message: formData.get('message') || '',
            status: 'Pending',
            created_at: new Date().toISOString()
        };
        
        const requests = JSON.parse(localStorage.getItem('requests')) || [];
        requests.push(request);
        localStorage.setItem('requests', JSON.stringify(requests));
        
        showAlert(this, '✅ Blood request submitted successfully! We will contact you soon.', 'success');
        showNotification('Request submitted successfully!', 'success');
        this.reset();
        loadStatistics();
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const email = formData.get('email');
        
        const donors = JSON.parse(localStorage.getItem('donors')) || [];
        const emailExists = donors.some(d => d.email === email);
        
        if (emailExists) {
            showAlert(this, '❌ This email is already registered!', 'error');
            showNotification('Email already registered!', 'error');
            return;
        }
        
        const donor = {
            id: Date.now(),
            full_name: formData.get('full_name'),
            email: email,
            phone: formData.get('phone'),
            blood_group: formData.get('blood_group'),
            gender: formData.get('gender'),
            age: formData.get('age'),
            city: formData.get('city'),
            state: formData.get('state'),
            pincode: formData.get('pincode'),
            address: formData.get('address'),
            availability: formData.get('availability'),
            last_donation_date: formData.get('last_donation_date') || '',
            created_at: new Date().toISOString()
        };
        
        donors.push(donor);
        localStorage.setItem('donors', JSON.stringify(donors));
        
        showAlert(this, '🎉 Registration successful! Thank you for becoming a donor.', 'success');
        showNotification('Welcome to BloodConnect! 🩸', 'success');
        this.reset();
        loadStatistics();
        loadBloodGroups();
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const contact = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            status: 'Pending',
            created_at: new Date().toISOString()
        };
        
        const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        contacts.push(contact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        
        showAlert(this, '✅ Message sent successfully! We will get back to you soon.', 'success');
        showNotification('Message sent!', 'success');
        this.reset();
    });
}

function showAlert(form, message, type) {
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    form.insertBefore(alertDiv, form.firstChild);
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// ==================== DATE IMPROVEMENTS ====================

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    document.querySelectorAll('input[name="last_donation_date"]').forEach(input => {
        input.setAttribute('max', todayString);
    });
    
    document.querySelectorAll('input[name="required_date"]').forEach(input => {
        input.setAttribute('min', todayString);
    });
});

// ==================== INITIALIZE ON PAGE LOAD ====================

window.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadStatistics();
    loadBloodGroups();
    
    if (!localStorage.getItem('sampleDataAdded')) {
        const sampleDonors = [
            {
                id: 1698234567890,
                full_name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '9876543210',
                blood_group: 'A+',
                gender: 'Male',
                age: 28,
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                address: '123 Main Street, Andheri',
                availability: 'Available',
                last_donation_date: '2024-06-15',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567891,
                full_name: 'Priya Patel',
                email: 'priya@example.com',
                phone: '9876543211',
                blood_group: 'O+',
                gender: 'Female',
                age: 25,
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
                address: '456 Park Avenue, Connaught Place',
                availability: 'Available',
                last_donation_date: '2024-08-20',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567892,
                full_name: 'Amit Kumar',
                email: 'amit@example.com',
                phone: '9876543212',
                blood_group: 'B+',
                gender: 'Male',
                age: 32,
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                address: '789 Tech Park, Whitefield',
                availability: 'Available',
                last_donation_date: '',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567893,
                full_name: 'Sneha Verma',
                email: 'sneha@example.com',
                phone: '9876543213',
                blood_group: 'AB+',
                gender: 'Female',
                age: 29,
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411001',
                address: '321 College Road, Kothrud',
                availability: 'Available',
                last_donation_date: '2024-09-10',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567894,
                full_name: 'Vikram Singh',
                email: 'vikram@example.com',
                phone: '9876543214',
                blood_group: 'O-',
                gender: 'Male',
                age: 35,
                city: 'Chennai',
                state: 'Tamil Nadu',
                pincode: '600001',
                address: '567 Beach Road, Marina',
                availability: 'Available',
                last_donation_date: '2024-07-22',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567895,
                full_name: 'Anjali Reddy',
                email: 'anjali@example.com',
                phone: '9876543215',
                blood_group: 'A-',
                gender: 'Female',
                age: 27,
                city: 'Hyderabad',
                state: 'Telangana',
                pincode: '500001',
                address: '890 Banjara Hills',
                availability: 'Available',
                last_donation_date: '2024-05-15',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567896,
                full_name: 'Karan Malhotra',
                email: 'karan@example.com',
                phone: '9876543216',
                blood_group: 'B-',
                gender: 'Male',
                age: 31,
                city: 'Kolkata',
                state: 'West Bengal',
                pincode: '700001',
                address: '234 Park Street',
                availability: 'Available',
                last_donation_date: '',
                created_at: new Date().toISOString()
            },
            {
                id: 1698234567897,
                full_name: 'Meera Nair',
                email: 'meera@example.com',
                phone: '9876543217',
                blood_group: 'AB-',
                gender: 'Female',
                age: 26,
                city: 'Kochi',
                state: 'Kerala',
                pincode: '682001',
                address: '678 Marine Drive',
                availability: 'Available',
                last_donation_date: '2024-04-10',
                created_at: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('donors', JSON.stringify(sampleDonors));
        localStorage.setItem('sampleDataAdded', 'true');
        
        loadStatistics();
        loadBloodGroups();
    }
    
    setTimeout(() => {
        showNotification('Welcome to BloodConnect! 🩸', 'success');
    }, 1000);
});
