// ==================== CHECK AUTHENTICATION ====================
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

// Check auth on page load
checkAuth();

// Display admin name
const adminUsername = localStorage.getItem('adminUsername');
if (adminUsername) {
    document.getElementById('adminWelcome').textContent = `Welcome, ${adminUsername}`;
}

// ==================== LOGOUT ====================
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('loginTime');
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);
    }
}

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

// ==================== LOAD STATISTICS ====================
function loadStatistics() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    
    document.getElementById('totalDonors').textContent = donors.length;
    document.getElementById('totalRequests').textContent = requests.length;
    document.getElementById('pendingRequests').textContent = 
        requests.filter(r => r.status === 'Pending').length;
    document.getElementById('fulfilledRequests').textContent = 
        requests.filter(r => r.status === 'Fulfilled').length;
}

// ==================== TAB SWITCHING ====================
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
    
    // Load data for specific tab
    if (tabName === 'notifications') loadNotifications();
    if (tabName === 'donors') loadDonorsTable();
    if (tabName === 'requests') loadRequestsTable();
    if (tabName === 'analytics') loadAnalytics();
}

// ==================== NOTIFICATIONS TAB ====================
function loadNotifications() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = '';
    
    // Create notifications array with all activities
    let notifications = [];
    
    // New donor registrations
    donors.slice(-10).reverse().forEach(donor => {
        notifications.push({
            type: 'donor',
            title: '🩸 New Donor Registered',
            message: `${donor.full_name} (${donor.blood_group}) from ${donor.city} has registered as a donor.`,
            time: donor.created_at,
            class: 'new'
        });
    });
    
    // Blood requests
    requests.slice(-10).reverse().forEach(request => {
        const urgencyClass = request.urgency === 'Critical' ? 'critical' : 
                            request.urgency === 'Urgent' ? 'new' : '';
        notifications.push({
            type: 'request',
            title: request.urgency === 'Critical' ? '🚨 Critical Blood Request' : '💉 Blood Request',
            message: `${request.patient_name} needs ${request.units_required} units of ${request.blood_group} at ${request.hospital_name}, ${request.city}`,
            time: request.created_at,
            class: urgencyClass
        });
    });
    
    // Contact queries
    contacts.slice(-5).reverse().forEach(contact => {
        notifications.push({
            type: 'contact',
            title: '📧 New Contact Message',
            message: `${contact.name} sent a message: "${contact.subject}"`,
            time: contact.created_at,
            class: ''
        });
    });
    
    // Sort by time (newest first)
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Display notifications
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p style="text-align:center; color:#7f8c8d;">No recent activities</p>';
        return;
    }
    
    notifications.forEach(notif => {
        const timeAgo = getTimeAgo(notif.time);
        const item = document.createElement('div');
        item.className = `notification-item ${notif.class}`;
        item.innerHTML = `
            <h4>${notif.title}</h4>
            <p>${notif.message}</p>
            <small><i class="fas fa-clock"></i> ${timeAgo}</small>
        `;
        notificationsList.appendChild(item);
    });
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

// ==================== DONORS TABLE ====================
let allDonors = [];

function loadDonorsTable(filteredDonors = null) {
    const donors = filteredDonors || JSON.parse(localStorage.getItem('donors')) || [];
    allDonors = JSON.parse(localStorage.getItem('donors')) || [];
    const tbody = document.getElementById('donorsTableBody');
    
    tbody.innerHTML = '';
    
    if (donors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No donors found</td></tr>';
        return;
    }
    
    donors.reverse().forEach(donor => {
        const row = document.createElement('tr');
        const registeredDate = new Date(donor.created_at).toLocaleDateString();
        
        row.innerHTML = `
            <td>#${donor.id.toString().slice(-4)}</td>
            <td><strong>${donor.full_name}</strong><br><small>${donor.email}</small></td>
            <td><span class="blood-badge">${donor.blood_group}</span></td>
            <td>${donor.phone}</td>
            <td>${donor.city}</td>
            <td><span class="status-badge ${donor.availability === 'Available' ? 'status-available' : 'status-unavailable'}">${donor.availability}</span></td>
            <td>${registeredDate}</td>
            <td>
                <button class="btn btn-primary" onclick="viewDonor(${donor.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteDonor(${donor.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Advanced Donor Filters
function applyDonorFilters() {
    const bloodGroup = document.getElementById('filterBloodGroup').value;
    const availability = document.getElementById('filterAvailability').value;
    const city = document.getElementById('filterCity').value.toLowerCase();
    
    let filtered = allDonors;
    
    if (bloodGroup) {
        filtered = filtered.filter(d => d.blood_group === bloodGroup);
    }
    
    if (availability) {
        filtered = filtered.filter(d => d.availability === availability);
    }
    
    if (city) {
        filtered = filtered.filter(d => d.city.toLowerCase().includes(city));
    }
    
    loadDonorsTable(filtered);
    showNotification(`Found ${filtered.length} donor(s)`, 'success');
}

function clearDonorFilters() {
    document.getElementById('filterBloodGroup').value = '';
    document.getElementById('filterAvailability').value = '';
    document.getElementById('filterCity').value = '';
    loadDonorsTable();
    showNotification('Filters cleared', 'success');
}

function viewDonor(id) {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const donor = donors.find(d => d.id === id);
    if (donor) {
        alert(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
    DONOR DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: ${donor.full_name}
🩸 Blood Group: ${donor.blood_group}
📧 Email: ${donor.email}
📱 Phone: ${donor.phone}
🚻 Gender: ${donor.gender}
🎂 Age: ${donor.age}
🏙️ City: ${donor.city}, ${donor.state}
📮 Pincode: ${donor.pincode}
🏠 Address: ${donor.address}
✅ Availability: ${donor.availability}
💉 Last Donation: ${donor.last_donation_date || 'N/A'}
📅 Registered: ${new Date(donor.created_at).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    }
}

function deleteDonor(id) {
    if (confirm('⚠️ Are you sure you want to delete this donor?\n\nThis action cannot be undone!')) {
        let donors = JSON.parse(localStorage.getItem('donors')) || [];
        const donor = donors.find(d => d.id === id);
        donors = donors.filter(d => d.id !== id);
        localStorage.setItem('donors', JSON.stringify(donors));
        loadDonorsTable();
        loadStatistics();
        showNotification(`Donor "${donor.full_name}" deleted successfully`, 'success');
    }
}

// ==================== REQUESTS TABLE ====================
let allRequests = [];

function loadRequestsTable(filteredRequests = null) {
    const requests = filteredRequests || JSON.parse(localStorage.getItem('requests')) || [];
    allRequests = JSON.parse(localStorage.getItem('requests')) || [];
    const tbody = document.getElementById('requestsTableBody');
    
    tbody.innerHTML = '';
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No requests found</td></tr>';
        return;
    }
    
    requests.reverse().forEach(request => {
        const row = document.createElement('tr');
        const requestDate = new Date(request.created_at).toLocaleDateString();
        const urgencyClass = `urgency-${request.urgency.toLowerCase()}`;
        const statusClass = request.status === 'Fulfilled' ? 'status-fulfilled' : 
                           request.status === 'Pending' ? 'status-pending' : 'status-cancelled';
        
        row.innerHTML = `
            <td>#${request.id.toString().slice(-4)}</td>
            <td><strong>${request.patient_name}</strong><br><small>${request.phone}</small></td>
            <td><span class="blood-badge">${request.blood_group}</span></td>
            <td>${request.units_required}</td>
            <td>${request.hospital_name}<br><small>${request.city}</small></td>
            <td><span class="${urgencyClass}">${request.urgency}</span></td>
            <td><span class="status-badge ${statusClass}">${request.status}</span></td>
            <td>${requestDate}</td>
            <td>
                <button class="btn btn-primary" onclick="viewRequest(${request.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-light" onclick="updateRequestStatus(${request.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteRequest(${request.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Advanced Request Filters
function applyRequestFilters() {
    const bloodGroup = document.getElementById('filterRequestBloodGroup').value;
    const urgency = document.getElementById('filterUrgency').value;
    const status = document.getElementById('filterStatus').value;
    
    let filtered = allRequests;
    
    if (bloodGroup) {
        filtered = filtered.filter(r => r.blood_group === bloodGroup);
    }
    
    if (urgency) {
        filtered = filtered.filter(r => r.urgency === urgency);
    }
    
    if (status) {
        filtered = filtered.filter(r => r.status === status);
    }
    
    loadRequestsTable(filtered);
    showNotification(`Found ${filtered.length} request(s)`, 'success');
}

function clearRequestFilters() {
    document.getElementById('filterRequestBloodGroup').value = '';
    document.getElementById('filterUrgency').value = '';
    document.getElementById('filterStatus').value = '';
    loadRequestsTable();
    showNotification('Filters cleared', 'success');
}

function viewRequest(id) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const request = requests.find(r => r.id === id);
    if (request) {
        alert(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
   BLOOD REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━

🏥 Patient: ${request.patient_name}
📱 Phone: ${request.phone}
📧 Email: ${request.email}
🩸 Blood Group: ${request.blood_group}
💉 Units Required: ${request.units_required}
📅 Required Date: ${request.required_date}
🏥 Hospital: ${request.hospital_name}
🏙️ Location: ${request.city}, ${request.state}
⚠️ Urgency: ${request.urgency}
✅ Status: ${request.status}
💬 Message: ${request.message || 'N/A'}
📅 Requested: ${new Date(request.created_at).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    }
}

function updateRequestStatus(id) {
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    const request = requests.find(r => r.id === id);
    
    if (!request) return;
    
    const newStatus = prompt(
        `Current Status: ${request.status}\n\nEnter new status:\n1. Pending\n2. Fulfilled\n3. Cancelled`,
        request.status
    );
    
    if (newStatus && ['Pending', 'Fulfilled', 'Cancelled'].includes(newStatus)) {
        request.status = newStatus;
        localStorage.setItem('requests', JSON.stringify(requests));
        loadRequestsTable();
        loadStatistics();
        showNotification(`Request status updated to "${newStatus}"`, 'success');
    }
}

function deleteRequest(id) {
    if (confirm('⚠️ Are you sure you want to delete this request?\n\nThis action cannot be undone!')) {
        let requests = JSON.parse(localStorage.getItem('requests')) || [];
        const request = requests.find(r => r.id === id);
        requests = requests.filter(r => r.id !== id);
        localStorage.setItem('requests', JSON.stringify(requests));
        loadRequestsTable();
        loadStatistics();
        showNotification(`Request for "${request.patient_name}" deleted successfully`, 'success');
    }
}

// ==================== ANALYTICS ====================
function loadAnalytics() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    
    // Blood group distribution chart
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const counts = bloodGroups.map(group => 
        donors.filter(d => d.blood_group === group).length
    );
    
    const ctx = document.getElementById('bloodGroupChart');
    if (ctx && typeof Chart !== 'undefined') {
        if (window.bloodChart) {
            window.bloodChart.destroy();
        }
        
        window.bloodChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bloodGroups,
                datasets: [{
                    label: 'Donors by Blood Group',
                    data: counts,
                    backgroundColor: [
                        '#e74c3c', '#c0392b', '#3498db', '#2980b9',
                        '#9b59b6', '#8e44ad', '#2ecc71', '#27ae60'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // Activity timeline
    const timelineDiv = document.getElementById('activityTimeline');
    if (timelineDiv) {
        let activities = [];
        
        donors.slice(-5).forEach(d => {
            activities.push({
                text: `<strong>${d.full_name}</strong> registered as ${d.blood_group} donor`,
                time: d.created_at
            });
        });
        
        requests.slice(-5).forEach(r => {
            activities.push({
                text: `<strong>${r.patient_name}</strong> requested ${r.blood_group} (${r.urgency})`,
                time: r.created_at
            });
        });
        
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        timelineDiv.innerHTML = activities.map(a => `
            <div class="timeline-item">
                ${a.text}
                <br><small>${getTimeAgo(a.time)}</small>
            </div>
        `).join('') || '<p style="text-align:center; color:#7f8c8d;">No recent activities</p>';
    }
}

// ==================== EXPORT DATA ====================
function exportAllData() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    
    // Donors CSV
    let donorCSV = 'ID,Name,Email,Phone,Blood Group,Gender,Age,City,State,Pincode,Availability,Registered\n';
    donors.forEach(d => {
        donorCSV += `${d.id},"${d.full_name}","${d.email}","${d.phone}","${d.blood_group}","${d.gender}",${d.age},"${d.city}","${d.state}","${d.pincode}","${d.availability}","${new Date(d.created_at).toLocaleDateString()}"\n`;
    });
    
    // Requests CSV
    let requestCSV = 'ID,Patient,Phone,Email,Blood Group,Units,Hospital,City,Urgency,Status,Date\n';
    requests.forEach(r => {
        requestCSV += `${r.id},"${r.patient_name}","${r.phone}","${r.email}","${r.blood_group}",${r.units_required},"${r.hospital_name}","${r.city}","${r.urgency}","${r.status}","${new Date(r.created_at).toLocaleDateString()}"\n`;
    });
    
    downloadCSV(donorCSV, 'donors_data.csv');
    setTimeout(() => downloadCSV(requestCSV, 'requests_data.csv'), 500);
    
    showNotification('Data exported successfully!', 'success');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadNotifications();
    showNotification('Welcome to Admin Panel! 🎉', 'success');
});
// ==================== ANALYTICS ====================
function loadAnalytics() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    
    // Blood group distribution chart
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const counts = bloodGroups.map(group => 
        donors.filter(d => d.blood_group === group).length
    );
    
    const ctx = document.getElementById('bloodGroupChart');
    if (ctx && typeof Chart !== 'undefined') {
        if (window.bloodChart) {
            window.bloodChart.destroy();
        }
        
        window.bloodChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bloodGroups,
                datasets: [{
                    label: 'Donors by Blood Group',
                    data: counts,
                    backgroundColor: [
                        '#e74c3c', '#c0392b', '#3498db', '#2980b9',
                        '#9b59b6', '#8e44ad', '#2ecc71', '#27ae60'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // Activity timeline
    const timelineDiv = document.getElementById('activityTimeline');
    if (timelineDiv) {
        let activities = [];
        
        donors.slice(-5).forEach(d => {
            activities.push({
                text: `<strong>${d.full_name}</strong> registered as ${d.blood_group} donor`,
                time: d.created_at
            });
        });
        
        requests.slice(-5).forEach(r => {
            activities.push({
                text: `<strong>${r.patient_name}</strong> requested ${r.blood_group} (${r.urgency})`,
                time: r.created_at
            });
        });
        
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        timelineDiv.innerHTML = activities.map(a => `
            <div class="timeline-item">
                ${a.text}
                <br><small>${getTimeAgo(a.time)}</small>
            </div>
        `).join('') || '<p style="text-align:center; color:#7f8c8d;">No recent activities</p>';
    }
}

// ==================== EXPORT DATA ====================
function exportAllData() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    
    // Donors CSV
    let donorCSV = 'ID,Name,Email,Phone,Blood Group,Gender,Age,City,State,Pincode,Availability,Registered\n';
    donors.forEach(d => {
        donorCSV += `${d.id},"${d.full_name}","${d.email}","${d.phone}","${d.blood_group}","${d.gender}",${d.age},"${d.city}","${d.state}","${d.pincode}","${d.availability}","${new Date(d.created_at).toLocaleDateString()}"\n`;
    });
    
    // Requests CSV
    let requestCSV = 'ID,Patient,Phone,Email,Blood Group,Units,Hospital,City,Urgency,Status,Date\n';
    requests.forEach(r => {
        requestCSV += `${r.id},"${r.patient_name}","${r.phone}","${r.email}","${r.blood_group}",${r.units_required},"${r.hospital_name}","${r.city}","${r.urgency}","${r.status}","${new Date(r.created_at).toLocaleDateString()}"\n`;
    });
    
    downloadCSV(donorCSV, 'donors_data.csv');
    setTimeout(() => downloadCSV(requestCSV, 'requests_data.csv'), 500);
    
    showNotification('Data exported successfully!', 'success');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadNotifications();
    showNotification('Welcome to Admin Panel! 🎉', 'success');
});
