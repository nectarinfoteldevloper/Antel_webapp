document.addEventListener('DOMContentLoaded', () => {
    // --- Common Elements & Functions ---
    const errorMessage = document.getElementById('errorMessage');

    function showMessage(element, message, type = 'error') {
        element.textContent = message;
        element.style.color = type === 'success' ? 'green' : 'red';
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
    
    // --- Sign In / Sign Up Page Logic ---
    if (window.location.pathname.endsWith('/signin.html')) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const formTitle = document.getElementById('formTitle');
       
        let isLoginFormActive = true;

        const setFormVisibility = (isLogin) => {
            isLoginFormActive = isLogin;
            if (isLogin) {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                formTitle.textContent = 'Sign In to AnTel';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                formTitle.textContent = 'Create Your AnTel Account';
            }
            errorMessage.style.display = 'none';
        };

        const toggleAuthMode = document.getElementById('toggleAuthMode');
        if (toggleAuthMode) {
            toggleAuthMode.addEventListener('click', (e) => {
                e.preventDefault();
                setFormVisibility(false);
            });
        }
        
        const toggleAuthModeSignup = document.getElementById('toggleAuthModeSignup');
        if (toggleAuthModeSignup) {
            toggleAuthModeSignup.addEventListener('click', (e) => {
                e.preventDefault();
                setFormVisibility(true);
            });
        }
        
        // --- Sign Up Form Submission (uses backend API) ---
        if (signupForm) {
            signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const name = document.getElementById('signupName').value.trim();
                const mobileNumber = document.getElementById('signupMobileNumber').value.trim();
                const password = document.getElementById('signupPassword').value.trim();

                if (!name || !mobileNumber || !password) {
                    showMessage(errorMessage, 'All fields are required.', 'error');
                    return;
                }
                
                try {
                    const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, mobileNumber, password })
                    });

                    const result = await response.json();
                    if (result.success) {
                        showMessage(errorMessage, 'Registration successful! Please log in.', 'success');
                        setFormVisibility(true);
                        document.getElementById('mobileNumber').value = mobileNumber;
                    } else {
                        showMessage(errorMessage, result.message, 'error');
                    }
                } catch (e) {
                    console.error('Signup error:', e);
                    showMessage(errorMessage, 'Network error. Please try again later.', 'error');
                }
            });
        }

        // --- Login Form Submission (uses backend API) ---
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const mobileNumber = document.getElementById('mobileNumber').value.trim();
                const password = document.getElementById('password').value.trim();

                if (!mobileNumber || !password) {
                    showMessage(errorMessage, 'Mobile number and password are required.', 'error');
                    return;
                }

                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mobileNumber, password })
                    });

                    const result = await response.json();
                    if (result.success) {
                        localStorage.setItem('loggedInUserMobile', result.user.mobileNumber);
                        localStorage.setItem('loggedInUserName', result.user.name);
                        localStorage.setItem('authToken', result.token);
                        
                        showMessage(errorMessage, 'Login successful! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = '/dashboard.html';
                        }, 1000);
                    } else {
                        showMessage(errorMessage, result.message, 'error');
                    }
                } catch (e) {
                    console.error('Login error:', e);
                    showMessage(errorMessage, 'Network error. Please try again later.', 'error');
                }
            });
        }
    }

    // --- All Dashboard Pages Common & Specific Logic ---
    const isDashboardPage = window.location.pathname.startsWith('/dashboard.html') ||
                            window.location.pathname.startsWith('/my_account.html') ||
                            window.location.pathname.startsWith('/recharge_history.html') ||
                            window.location.pathname.startsWith('/my_devices.html') ||
                            window.location.pathname.startsWith('/rewards.html') ||
                            window.location.pathname.startsWith('/support.html');

    if (isDashboardPage) {
        const loggedInUserMobile = localStorage.getItem('loggedInUserMobile');
        const authToken = localStorage.getItem('authToken');

        if (!loggedInUserMobile || !authToken) {
            alert('You are not logged in. Please sign in.');
            window.location.href = '/';
            return;
        }

        // Fetch and populate sidebar on all dashboard-style pages
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/user/dashboard/${loggedInUserMobile}`);
                const result = await response.json();
                if (result.success) {
                    const currentUser = result.user;
                    // Populate sidebar info on all pages
                    document.getElementById('sidebarUserName').textContent = currentUser.name || 'User';
                    document.getElementById('sidebarUserMobile').textContent = currentUser.mobileNumber;
                    
                    return currentUser;
                } else {
                    throw new Error(result.message);
                }
            } catch (e) {
                console.error("Error fetching user data:", e);
                alert("Error loading user data. Please log in again.");
                localStorage.clear();
                window.location.href = '/';
            }
        };

        const initPage = async () => {
            const currentUser = await fetchUserData();
            if (!currentUser) return;
            
            // --- Specific Page Logic ---

            // Dashboard Page
            if (window.location.pathname.endsWith('/dashboard.html')) {
                document.getElementById('dataLeft').textContent = `${currentUser.dataBalance}GB`;
                document.getElementById('packValidity').textContent = currentUser.packValidity;
                document.getElementById('callStatus').textContent = currentUser.callStatus;
            }

            // My Account Page
            if (window.location.pathname.endsWith('/my_account.html')) {
                document.getElementById('accountUserName').textContent = currentUser.name;
                document.getElementById('accountUserMobile').textContent = currentUser.mobileNumber;
                document.getElementById('accountUserEmail').textContent = 'example@antel.com'; 
                document.getElementById('accountUserServiceType').textContent = 'Prepaid';
                document.getElementById('smsAlertsStatus').textContent = 'Enabled';
                document.getElementById('emailNotificationStatus').textContent = 'Enabled';
                document.getElementById('promoOffersStatus').textContent = 'Disabled';
            }

            // Recharge History Page
            if (window.location.pathname.endsWith('/recharge_history.html')) {
                const rechargeTableBody = document.getElementById('rechargeHistoryTableBody');
                const noRechargesMessage = document.getElementById('noRechargesMessage');

                try {
                    const response = await fetch(`/api/user/recharge-history/${currentUser.mobileNumber}`);
                    const result = await response.json();
                    
                    if (result.success && result.recharges.length > 0) {
                        rechargeTableBody.innerHTML = ''; // Clear existing content
                        result.recharges.forEach(recharge => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${recharge.date}</td>
                                <td>₹${recharge.amount}</td>
                                <td>${recharge.plan}</td>
                                <td style="color: ${recharge.status === 'Success' ? 'green' : 'red'};">${recharge.status}</td>
                            `;
                            rechargeTableBody.appendChild(row);
                        });
                        noRechargesMessage.style.display = 'none';
                    } else {
                        rechargeTableBody.innerHTML = '';
                        noRechargesMessage.style.display = 'block';
                    }
                } catch (e) {
                    console.error("Error fetching recharge history:", e);
                    noRechargesMessage.textContent = 'Could not load recharge history.';
                    noRechargesMessage.style.display = 'block';
                }
            }

            // My Devices Page
            if (window.location.pathname.endsWith('/my_devices.html')) {
                const devicesContainer = document.getElementById('connectedDevicesContainer');
                const noDevicesMessage = document.getElementById('noDevicesMessage');

                try {
                    const response = await fetch(`/api/user/devices/${currentUser.mobileNumber}`);
                    const result = await response.json();

                    if (result.success && result.devices.length > 0) {
                        devicesContainer.innerHTML = ''; // Clear existing content
                        result.devices.forEach(device => {
                            const deviceCard = document.createElement('div');
                            deviceCard.className = 'device-card';
                            deviceCard.innerHTML = `
                                <h4>${device.name}</h4>
                                <p><strong>Last Active:</strong> ${device.lastActive}</p>
                                <p><strong>Location:</strong> ${device.location}</p>
                            `;
                            devicesContainer.appendChild(deviceCard);
                        });
                        noDevicesMessage.style.display = 'none';
                    } else {
                        devicesContainer.innerHTML = '';
                        noDevicesMessage.style.display = 'block';
                    }
                } catch (e) {
                    console.error("Error fetching devices:", e);
                    noDevicesMessage.textContent = 'Could not load connected devices.';
                    noDevicesMessage.style.display = 'block';
                }
            }

            // Rewards Page
            if (window.location.pathname.endsWith('/rewards.html')) {
                const rewardsContainer = document.getElementById('rewardsContainer');
                const noRewardsMessage = document.getElementById('noRewardsMessage');

                try {
                    const response = await fetch(`/api/user/rewards/${currentUser.mobileNumber}`);
                    const result = await response.json();

                    if (result.success && result.rewards.length > 0) {
                        rewardsContainer.innerHTML = '';
                        result.rewards.forEach(reward => {
                            const rewardCard = document.createElement('div');
                            rewardCard.className = 'reward-card';
                            rewardCard.innerHTML = `
                                <i class="fas fa-gift reward-icon"></i>
                                <div>
                                    <h4>${reward.title}</h4>
                                    <p>${reward.description}</p>
                                </div>
                            `;
                            rewardsContainer.appendChild(rewardCard);
                        });
                        noRewardsMessage.style.display = 'none';
                    } else {
                        rewardsContainer.innerHTML = '';
                        noRewardsMessage.style.display = 'block';
                    }
                } catch (e) {
                    console.error("Error fetching rewards:", e);
                    noRewardsMessage.textContent = 'Could not load rewards.';
                    noRewardsMessage.style.display = 'block';
                }
            }

            // Support Page
            if (window.location.pathname.endsWith('/support.html')) {
                const ticketsContainer = document.getElementById('ticketsContainer');
                const noTicketsMessage = document.getElementById('noTicketsMessage');
                
                try {
                    const response = await fetch(`/api/user/support-tickets/${currentUser.mobileNumber}`);
                    const result = await response.json();

                    if (result.success && result.tickets.length > 0) {
                        ticketsContainer.innerHTML = '';
                        result.tickets.forEach(ticket => {
                            const ticketCard = document.createElement('div');
                            ticketCard.className = 'support-card';
                            ticketCard.innerHTML = `
                                <p><strong>Ticket ID:</strong> #${ticket.ticketId}</p>
                                <p><strong>Issue:</strong> ${ticket.issue}</p>
                                <p><strong>Submitted On:</strong> ${ticket.submittedOn}</p>
                                <span class="status-badge ${ticket.status.toLowerCase()}">${ticket.status}</span>
                            `;
                            ticketsContainer.appendChild(ticketCard);
                        });
                        noTicketsMessage.style.display = 'none';
                    } else {
                        ticketsContainer.innerHTML = '';
                        noTicketsMessage.style.display = 'block';
                    }
                } catch (e) {
                    console.error("Error fetching support tickets:", e);
                    noTicketsMessage.textContent = 'Could not load support tickets.';
                    noTicketsMessage.style.display = 'block';
                }
            }
        };

        // Initialize the page by fetching user data and then populating the specific page content
        initPage();

        // --- Logout Logic (Common for all dashboard pages) ---
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear();
                alert('You have been logged out successfully!');
                window.location.href = '/';
            });
        }
    }
    
    // --- Homepage promo slider ---
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        };
        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };
        showSlide(currentSlide);
        setInterval(nextSlide, 5000);
    }
    
    // --- Feature Modal Logic (if present on any page) ---
    const featureModalOverlay = document.getElementById('featureModal');
    const closeFeatureModalButton = document.getElementById('closeFeatureModal');
    const modalTitle = document.getElementById('featureModalTitle');
    const modalText = document.getElementById('featureModalText');
    
    function openFeatureModal(title, text) {
        modalTitle.textContent = title;
        modalText.textContent = text;
        if (featureModalOverlay) {
            featureModalOverlay.classList.add('visible');
        }
    }

    function closeFeatureModal() {
        if (featureModalOverlay) {
            featureModalOverlay.classList.remove('visible');
        }
    }

    document.querySelectorAll('.button-link[data-feature-title]').forEach(button => {
        button.addEventListener('click', (e) => {
            const featureTitle = button.getAttribute('data-feature-title');
            const featureText = button.getAttribute('data-feature-text');
            if (featureTitle && featureText) {
                e.preventDefault();
                openFeatureModal(featureTitle, featureText);
            }
        });
    });

    if (closeFeatureModalButton) {
        closeFeatureModalButton.addEventListener('click', closeFeatureModal);
    }
    if (featureModalOverlay) {
        featureModalOverlay.addEventListener('click', (e) => {
            if (e.target === featureModalOverlay) {
                closeFeatureModal();
            }
        });
    }
});