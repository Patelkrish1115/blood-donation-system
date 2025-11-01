// ==========================================
// ADMIN PANEL - admin-panel.js (FIXED)
// MySQL + PHP Backend Integration
// ==========================================

const API_URL = 'http://localhost/backend';

// ===== CHECK AUTHENTICATION =====
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

checkAuth();

// Display admin name
const adminUsername = localStorage.getItem('adminUsername');
if (adminUsername && document.getElementById('adminWelcome')) {
    document.getElementById('adminWelcome').textContent = `Welcome, ${adminUsername}`;
}

// ===== LOGOUT =====
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('loginTime');
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1500);
    }
}

// ===== NOTIFICATIONS SYSTEM =====
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'times-circle' : 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div>${message}</div>
        <i class="fas fa-times notification-close"></i>
    `;
    
    container.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => notification.remove(), 5000);
}

// ===== LOAD STATISTICS FROM DATABASE =====
async function loadStatistics() {
    try {
        const donorsRes = await fetch(`${API_URL}/donors.php`);
        const donorsData = await donorsRes.json();
        
        const requestsRes = await fetch(`${API_URL}/requests.php`);
        const requestsData = await requestsRes.json();
        
        if (donorsData.success) {
            document.getElementById('totalDonors').textContent = donorsData.count || 0;
        }
        
        if (requestsData.success) {
            document.getElementById('totalRequests').textContent = requestsData.count || 0;
            
            const pendingCount = (requestsData.data || []).filter(r => r.status === 'Pending').length;
            const fulfilledCount = (requestsData.data || []).filter(r => r.status === 'Fulfilled').length;
            
            document.getElementById('pendingRequests').textContent = pendingCount;
            document.getElementById('fulfilledRequests').textContent = fulfilledCount;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// ===== TAB SWITCHING =====
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'notifications') loadNotifications();
    if (tabName === 'donors') loadDonorsTable();
    if (tabName === 'requests') loadRequestsTable();
    if (tabName === 'analytics') loadAnalytics();
}

// ===== NOTIFICATIONS TAB =====
async function loadNotifications() {
    try {
        const donorsRes = await fetch(`${API_URL}/donors.php`);
        const donorsData = await donorsRes.json();
        
        const requestsRes = await fetch(`${API_URL}/requests.php`);
        const requestsData = await requestsRes.json();
        
        const contactsRes = await fetch(`${API_URL}/contacts.php`);
        const contactsData = await contactsRes.json();
        
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;
        
        let notifications = [];
        
        // Donors
        (donorsData.data || []).slice(-10).reverse().forEach(donor => {
            notifications.push({
                title: '🩸 New Donor Registered',
                message: `${donor.full_name} (${donor.blood_group}) from ${donor.city}`,
                time: donor.created_at,
                class: 'new'
            });
        });
        
        // Requests
        (requestsData.data || []).slice(-10).reverse().forEach(request => {
            const urgencyClass = request.urgency === 'Critical' ? 'critical' : 'new';
            notifications.push({
                title: request.urgency === 'Critical' ? '🚨 Critical Blood Request' : '💉 Blood Request',
                message: `${request.patient_name} needs ${request.units_required} units of ${request.blood_group}`,
                time: request.created_at,
                class: urgencyClass
            });
        });
        
        // Contacts
        (contactsData.data || []).slice(-5).reverse().forEach(contact => {
            notifications.push({
                title: '📧 New Contact Message',
                message: `${contact.name}: "${contact.subject}"`,
                time: contact.created_at,
                class: ''
            });
        });
        
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<p style="text-align:center; color:#7f8c8d;">No recent activities</p>';
            return;
        }
        
        notificationsList.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.class}">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <small><i class="fas fa-clock"></i> ${getTimeAgo(notif.time)}</small>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// ===== GET TIME AGO =====
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' mins ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
}

// ===== LOAD DONORS TABLE =====
let allDonors = [];

async function loadDonorsTable(filteredDonors = null) {
    try {
        if (!filteredDonors) {
            const response = await fetch(`${API_URL}/donors.php`);
            const result = await response.json();
            allDonors = result.data || [];
        } else {
            allDonors = filteredDonors;
        }
        
        const tbody = document.getElementById('donorsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (allDonors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem;">No donors found</td></tr>';
            return;
        }
        
        allDonors.reverse().forEach(donor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${donor.id}</td>
                <td>
                    <strong>${donor.full_name}</strong><br>
                    <small>${donor.email}</small>
                </td>
                <td><span class="blood-badge">${donor.blood_group}</span></td>
                <td>${donor.phone}</td>
                <td>${donor.city}</td>
                <td>
                    <span class="status-badge ${donor.availability === 'Available' ? 'status-available' : 'status-unavailable'}">
                        ${donor.availability}
                    </span>
                </td>
                <td>${new Date(donor.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary" title="View Details" style="padding:0.5rem 1rem; font-size:0.9rem; margin-right:0.5rem;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary" title="Delete" style="padding:0.5rem 1rem; font-size:0.9rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // Eye button - View Details
            const viewBtn = row.querySelectorAll('button')[0];
            viewBtn.addEventListener('click', () => viewDonor(donor.id));
            
            // Delete button
            const deleteBtn = row.querySelectorAll('button')[1];
            deleteBtn.addEventListener('click', () => deleteDonor(donor.id));
            
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading donors:', error);
        showNotification('Error loading donors data', 'error');
    }
}

// ===== APPLY DONOR FILTERS =====
function applyDonorFilters() {
    const bloodGroup = document.getElementById('filterBloodGroup').value;
    const availability = document.getElementById('filterAvailability').value;
    const city = document.getElementById('filterCity').value.toLowerCase();
    
    let filtered = allDonors;
    
    if (bloodGroup) filtered = filtered.filter(d => d.blood_group === bloodGroup);
    if (availability) filtered = filtered.filter(d => d.availability === availability);
    if (city) filtered = filtered.filter(d => d.city.toLowerCase().includes(city));
    
    loadDonorsTable(filtered);
    showNotification(`Found ${filtered.length} donor(s)`, 'success');
}

// ===== CLEAR DONOR FILTERS =====
function clearDonorFilters() {
    document.getElementById('filterBloodGroup').value = '';
    document.getElementById('filterAvailability').value = '';
    document.getElementById('filterCity').value = '';
    loadDonorsTable();
    showNotification('Filters cleared', 'success');
}

// ===== VIEW DONOR DETAILS =====
function viewDonor(id) {
    const donor = allDonors.find(d => d.id === id);
    if (donor) {
        const details = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    DONOR DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        alert(details);
    }
}

// ===== DELETE DONOR =====
function deleteDonor(id) {
    if (confirm('Are you sure you want to delete this donor? This cannot be undone!')) {
        fetch(`${API_URL}/donors.php?id=${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    showNotification('Donor deleted successfully', 'success');
                    loadDonorsTable();
                    loadStatistics();
                } else {
                    showNotification('Error deleting donor', 'error');
                }
            })
            .catch(err => {
                console.error('Delete error:', err);
                showNotification('Failed to delete donor', 'error');
            });
    }
}

// ===== LOAD REQUESTS TABLE =====
let allRequests = [];

async function loadRequestsTable(filteredRequests = null) {
    try {
        if (!filteredRequests) {
            const response = await fetch(`${API_URL}/requests.php`);
            const result = await response.json();
            allRequests = result.data || [];
        } else {
            allRequests = filteredRequests;
        }
        
        const tbody = document.getElementById('requestsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (allRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem;">No requests found</td></tr>';
            return;
        }
        
        allRequests.reverse().forEach(request => {
            const urgencyClass = `urgency-${request.urgency.toLowerCase()}`;
            const statusClass = request.status === 'Fulfilled' ? 'status-fulfilled' : 
                               request.status === 'Pending' ? 'status-pending' : 'status-cancelled';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${request.id}</td>
                <td>
                    <strong>${request.patient_name}</strong><br>
                    <small>${request.phone}</small>
                </td>
                <td><span class="blood-badge">${request.blood_group}</span></td>
                <td>${request.units_required}</td>
                <td>${request.hospital_name}<br><small>${request.city}</small></td>
                <td><span class="${urgencyClass}">${request.urgency}</span></td>
                <td><span class="status-badge ${statusClass}">${request.status}</span></td>
                <td>${new Date(request.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary" title="View Details" style="padding:0.5rem 1rem; font-size:0.9rem; margin-right:0.5rem;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-light" title="Update Status" style="padding:0.5rem 1rem; font-size:0.9rem; margin-right:0.5rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" title="Delete" style="padding:0.5rem 1rem; font-size:0.9rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // Eye button - View Details
            const viewBtn = row.querySelectorAll('button')[0];
            viewBtn.addEventListener('click', () => viewRequest(request.id));
            
            // Edit button - Update Status
            const editBtn = row.querySelectorAll('button')[1];
            editBtn.addEventListener('click', () => updateRequestStatus(request.id));
            
            // Delete button
            const deleteBtn = row.querySelectorAll('button')[2];
            deleteBtn.addEventListener('click', () => deleteRequest(request.id));
            
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading requests:', error);
        showNotification('Error loading requests data', 'error');
    }
}


// ===== APPLY REQUEST FILTERS =====
function applyRequestFilters() {
    const bloodGroup = document.getElementById('filterRequestBloodGroup').value;
    const urgency = document.getElementById('filterUrgency').value;
    const status = document.getElementById('filterStatus').value;
    
    let filtered = allRequests;
    
    if (bloodGroup) filtered = filtered.filter(r => r.blood_group === bloodGroup);
    if (urgency) filtered = filtered.filter(r => r.urgency === urgency);
    if (status) filtered = filtered.filter(r => r.status === status);
    
    loadRequestsTable(filtered);
    showNotification(`Found ${filtered.length} request(s)`, 'success');
}

// ===== CLEAR REQUEST FILTERS =====
function clearRequestFilters() {
    document.getElementById('filterRequestBloodGroup').value = '';
    document.getElementById('filterUrgency').value = '';
    document.getElementById('filterStatus').value = '';
    loadRequestsTable();
    showNotification('Filters cleared', 'success');
}

// ===== VIEW REQUEST =====
function viewRequest(id) {
    const request = allRequests.find(r => r.id === id);
    if (request) {
        const details = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    BLOOD REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        alert(details);
    }
}

// ===== UPDATE REQUEST STATUS =====
function updateRequestStatus(id) {
    const request = allRequests.find(r => r.id === id);
    if (!request) return;
    
    const status = prompt(
        `Current Status: ${request.status}\n\nEnter new status:\n- Pending\n- Fulfilled\n- Cancelled`,
        request.status
    );
    
    if (status && ['Pending', 'Fulfilled', 'Cancelled'].includes(status)) {
        const data = { id: id, status: status };
        
        fetch(`${API_URL}/requests.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                showNotification(`Status updated to "${status}"`, 'success');
                loadRequestsTable();
                loadStatistics();
            } else {
                showNotification('Error updating status', 'error');
            }
        })
        .catch(err => {
            console.error('Update error:', err);
            showNotification('Failed to update status', 'error');
        });
    }
}

// ===== DELETE REQUEST =====
function deleteRequest(id) {
    if (confirm('Are you sure you want to delete this request?')) {
        fetch(`${API_URL}/requests.php?id=${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    showNotification('Request deleted successfully', 'success');
                    loadRequestsTable();
                    loadStatistics();
                } else {
                    showNotification('Error deleting request', 'error');
                }
            })
            .catch(err => {
                console.error('Delete error:', err);
                showNotification('Failed to delete request', 'error');
            });
    }
}

// ===== ANALYTICS =====
async function loadAnalytics() {
    try {
        const donorsRes = await fetch(`${API_URL}/donors.php`);
        const donorsData = await donorsRes.json();
        
        const donors = donorsData.data || [];
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const counts = bloodGroups.map(group => donors.filter(d => d.blood_group === group).length);
        
        const ctx = document.getElementById('bloodGroupChart');
        if (ctx && typeof Chart !== 'undefined') {
            if (window.bloodChart) window.bloodChart.destroy();
            
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
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
        
        // Timeline
        const timeline = document.getElementById('activityTimeline');
        if (timeline) {
            let activities = [];
            
            donors.slice(-5).forEach(d => {
                activities.push({
                    text: `<strong>${d.full_name}</strong> registered as ${d.blood_group} donor`,
                    time: d.created_at
                });
            });
            
            const requestsRes = await fetch(`${API_URL}/requests.php`);
            const requestsData = await requestsRes.json();
            (requestsData.data || []).slice(-5).forEach(r => {
                activities.push({
                    text: `<strong>${r.patient_name}</strong> requested ${r.blood_group} (${r.urgency})`,
                    time: r.created_at
                });
            });
            
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            timeline.innerHTML = activities.map(a => `
                <div class="timeline-item">
                    ${a.text}
                    <br><small>${getTimeAgo(a.time)}</small>
                </div>
            `).join('') || '<p style="text-align:center;">No activities</p>';
        }
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// ===== EXPORT DATA =====
function exportAllData() {
    let csv = 'Donor ID,Name,Email,Phone,Blood Group,City,Status,Registered\n';
    
    allDonors.forEach(d => {
        csv += `${d.id},"${d.full_name}","${d.email}","${d.phone}","${d.blood_group}","${d.city}","${d.availability}","${new Date(d.created_at).toLocaleDateString()}"\n`;
    });
    
    downloadCSV(csv, 'donors_export.csv');
    
    let csv2 = 'Request ID,Patient,Phone,Blood Group,Units,Hospital,Urgency,Status\n';
    allRequests.forEach(r => {
        csv2 += `${r.id},"${r.patient_name}","${r.phone}","${r.blood_group}",${r.units_required},"${r.hospital_name}","${r.urgency}","${r.status}"\n`;
    });
    
    setTimeout(() => downloadCSV(csv2, 'requests_export.csv'), 500);
    showNotification('Data exported successfully!', 'success');
}

// ===== DOWNLOAD CSV =====
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

// ===== INITIALIZE =====
window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Admin Panel Loaded');
    loadStatistics();
    loadNotifications();
    showNotification('Welcome to Admin Panel! 🎉', 'success');
});

console.log('Admin Panel v2.0 | API: ' + API_URL);
