// ============================================
// PREMIUM LOGIN SYSTEM - JAVASCRIPT
// ============================================

let currentPage = 1;
const totalPages = 6;
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ============================================
// PAGE NAVIGATION
// ============================================

function nextPage() {
    if (currentPage < totalPages) {
        changeToPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        changeToPage(currentPage - 1);
    }
}

function goToPage(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages) {
        changeToPage(pageNum);
    }
}

function changeToPage(pageNum) {
    const oldPage = document.getElementById(`page${currentPage}`);
    const newPage = document.getElementById(`page${pageNum}`);

    // Remove active class from old page
    oldPage.classList.remove('active');
    oldPage.classList.add(pageNum > currentPage ? 'next' : 'prev');

    // Add active class to new page
    setTimeout(() => {
        oldPage.classList.remove('next', 'prev');
        newPage.classList.add('active');
    }, 50);

    // Update navigation dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === pageNum - 1);
    });

    currentPage = pageNum;
    updateBackgroundImage();

    // Scroll to top
    document.querySelectorAll('.page-content').forEach(content => {
        content.scrollTop = 0;
    });
}

function updateBackgroundImage() {
    const bgImages = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];

    const bgImage = document.querySelector('.bg-image');
    bgImage.style.backgroundImage = bgImages[currentPage - 1];
}

// ============================================
// FORM NAVIGATION
// ============================================

function showLoginForm() {
    changeToPage(3);
}

function showSignupForm() {
    changeToPage(4);
}

// ============================================
// FORM VALIDATION
// ============================================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?1?\d{9,15}$/;

function validateEmail(email) {
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validatePhone(phone) {
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ============================================
// LOGIN FORM HANDLING
// ============================================

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Validate email
    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    }

    if (!isValid) return;

    // Check if user exists
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        showError('emailError', 'No account found with this email');
        showToast('User not found', 'error');
        return;
    }

    // Check password (in production, use bcrypt)
    if (user.password !== password) {
        showError('passwordError', 'Incorrect password');
        showToast('Wrong password', 'error');
        return;
    }

    // Login successful
    currentUser = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry,
        createdAt: user.createdAt
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
    }

    showToast('Login successful! 🎉', 'success');
    
    // Load dashboard and go to page 5
    setTimeout(() => {
        loadDashboard();
        changeToPage(5);
    }, 1000);

    // Reset form
    this.reset();
});

// ============================================
// SIGNUP FORM HANDLING
// ============================================

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const isPremium = document.getElementById('isPremium').checked;
    const termsAgree = document.getElementById('termsAgree').checked;

    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Validate full name
    if (!fullName || fullName.length < 3) {
        showError('nameError', 'Full name must be at least 3 characters');
        isValid = false;
    }

    // Validate email
    if (!validateEmail(email)) {
        showError('signupEmailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showError('signupEmailError', 'Email already registered');
        isValid = false;
    }

    // Validate phone
    if (!validatePhone(phone)) {
        showError('phoneError', 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate password
    if (!validatePassword(password)) {
        showError('signupPasswordError', 'Password must be at least 8 characters');
        isValid = false;
    }

    // Confirm password match
    if (password !== confirmPassword) {
        showError('confirmError', 'Passwords do not match');
        isValid = false;
    }

    // Check terms agreement
    if (!termsAgree) {
        showToast('Please agree to Terms & Conditions', 'error');
        isValid = false;
    }

    if (!isValid) return;

    // Create new user
    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        phone: phone,
        password: password, // In production, hash this with bcrypt
        isPremium: isPremium,
        premiumExpiry: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        createdAt: new Date(),
        isEmailVerified: false,
        profileImage: null,
        userRole: isPremium ? 'premium' : 'user',
        lastLogin: new Date(),
        loginAttempts: 0,
        lockUntil: null
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user
    currentUser = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        isPremium: newUser.isPremium,
        premiumExpiry: newUser.premiumExpiry,
        createdAt: newUser.createdAt
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showToast(`Account created successfully! ${isPremium ? '💎 Premium activated!' : ''}`, 'success');

    // Load dashboard and go to page 5
    setTimeout(() => {
        loadDashboard();
        changeToPage(5);
    }, 1000);

    // Reset form
    this.reset();
});

// ============================================
// PASSWORD STRENGTH METER
// ============================================

document.getElementById('signupPassword').addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    let strength = 0;

    // Check password strength
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Update visual feedback
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    if (strength < 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak';
        strengthText.style.color = 'var(--danger)';
    } else if (strength < 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium';
        strengthText.style.color = 'var(--warning)';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong';
        strengthText.style.color = 'var(--success)';
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = event.target;

    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function loadDashboard() {
    if (!currentUser) return;

    // Update user info
    document.getElementById('dashboardName').textContent = `Welcome, ${currentUser.fullName}`;
    document.getElementById('dashboardEmail').textContent = currentUser.email;

    // Update profile info
    document.getElementById('profileName').textContent = currentUser.fullName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone || '-';
    document.getElementById('memberSince').textContent = new Date(currentUser.createdAt).toLocaleDateString();

    // Update premium status
    const premiumCard = document.getElementById('premiumCard');
    const premiumStatus = document.getElementById('premiumStatus');

    if (currentUser.isPremium) {
        const expiry = new Date(currentUser.premiumExpiry);
        const daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
        premiumStatus.textContent = `Premium Active (${daysLeft} days left)`;
        premiumCard.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)';
        premiumCard.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else {
        premiumStatus.textContent = 'Free Account';
        premiumCard.style.background = 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)';
    }

    // Update features
    const feature1 = document.getElementById('feature1');
    const feature2 = document.getElementById('feature2');

    if (currentUser.isPremium) {
        feature1.style.opacity = '1';
        feature2.style.opacity = '1';
        feature1.innerHTML = '<span class="feature-check">✓</span><span>Advanced Security</span>';
        feature2.innerHTML = '<span class="feature-check">✓</span><span>Priority Support</span>';
    }
}

function upgradePremium() {
    if (!currentUser) return;

    // Update user premium status
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].isPremium = true;
        users[userIndex].premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        users[userIndex].userRole = 'premium';

        currentUser.isPremium = true;
        currentUser.premiumExpiry = users[userIndex].premiumExpiry;

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showToast('Premium activated successfully! 💎', 'success');
        loadDashboard();
        changeToPage(5);
    }
}

function logout() {
    currentUser = null;
    users = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('users');

    showToast('Logged out successfully', 'success');

    setTimeout(() => {
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        
        // Go to welcome page
        changeToPage(1);
    }, 1000);
}

// ============================================
// SCROLL DOWN ANIMATION
// ============================================

function scrollDown() {
    const pageContent = document.querySelector('.page.active .page-content');
    if (pageContent) {
        pageContent.scrollBy({
            top: 200,
            behavior: 'smooth'
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadDashboard();
        changeToPage(5);
    }

    // Check for remembered email
    const rememberEmail = localStorage.getItem('rememberEmail');
    if (rememberEmail) {
        document.getElementById('loginEmail').value = rememberEmail;
    }

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
    });

    // Prevent form submission on Enter for some fields
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.type !== 'submit') {
                e.preventDefault();
            }
        });
    });

    // Add input validation on blur
    document.getElementById('loginEmail')?.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('emailError', 'Please enter a valid email');
        } else {
            document.getElementById('emailError').classList.remove('show');
        }
    });

    document.getElementById('signupEmail')?.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('signupEmailError', 'Please enter a valid email');
        } else {
            document.getElementById('signupEmailError').classList.remove('show');
        }
    });

    document.getElementById('phoneNumber')?.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            showError('phoneError', 'Please enter a valid phone number');
        } else {
            document.getElementById('phoneError').classList.remove('show');
        }
    });

    document.getElementById('loginPassword')?.addEventListener('blur', function() {
        if (this.value && !validatePassword(this.value)) {
            showError('passwordError', 'Password must be at least 8 characters');
        } else {
            document.getElementById('passwordError').classList.remove('show');
        }
    });
});

// ============================================
// SOCIAL LOGIN HANDLERS
// ============================================

document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const platform = this.classList[1];
        showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} login coming soon!`, 'info');
    });
});

// ============================================
// SETTINGS HANDLERS
// ============================================

document.querySelectorAll('.setting-item').forEach(item => { 
    item.addEventListener('click', function() {
        const setting = this.querySelector('span').textContent;
        showToast(`${setting} - Coming soon!`, 'info');
    });
});

// ============================================
// FORGOT PASSWORD HANDLER
// ============================================

document.querySelector('.forgot-password')?.addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Password reset - Check your email!', 'success');
});

// ============================================
// CONTACT SALES BUTTON
// ============================================

document.querySelectorAll('.btn-outline').forEach(btn => {
    if (btn.textContent.includes('Contact')) {
        btn.addEventListener('click', function() {
            showToast('Sales team will contact you soon!', 'info');
        });
    }
});

