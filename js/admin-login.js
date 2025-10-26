// Load saved credentials if "Remember Me" was checked
window.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('savedAdminUsername');
    const savedPassword = localStorage.getItem('savedAdminPassword');
    const rememberMe = localStorage.getItem('rememberAdminLogin');
    
    if (rememberMe === 'true' && savedUsername && savedPassword) {
        document.getElementById('adminUsername').value = savedUsername;
        document.getElementById('adminPassword').value = savedPassword;
        document.getElementById('rememberMe').checked = true;
    }
});

// Admin Login Authentication with Remember Me
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Default credentials
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('loginTime', new Date().toISOString());
        
        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
            localStorage.setItem('savedAdminUsername', username);
            localStorage.setItem('savedAdminPassword', password);
            localStorage.setItem('rememberAdminLogin', 'true');
        } else {
            // Clear saved credentials
            localStorage.removeItem('savedAdminUsername');
            localStorage.removeItem('savedAdminPassword');
            localStorage.removeItem('rememberAdminLogin');
        }
        
        alert('✅ Login Successful! Redirecting to Admin Panel...');
        window.location.href = 'admin-panel.html';
    } else {
        alert('❌ Invalid username or password!\n\nDefault credentials:\nUsername: admin\nPassword: admin123');
    }
});
