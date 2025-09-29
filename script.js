// Main application controller
class CampusNexusApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupNavigation();
    }

    checkAuthentication() {
        if (campusData.isAuthenticated()) {
            this.showMainApp();
        } else {
            this.showLoginModal();
        }
    }

    showMainApp() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('registerModal').classList.add('hidden');
        document.querySelector('.main-content').classList.remove('hidden');
        document.querySelector('.navbar').classList.remove('hidden');
        this.updateUserInfo();
        this.loadDashboard();
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('registerModal').classList.add('hidden');
        document.querySelector('.main-content').classList.add('hidden');
        document.querySelector('.navbar').classList.add('hidden');
    }

    showRegisterModal() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('registerModal').classList.remove('hidden');
    }

    updateUserInfo() {
        const user = campusData.getCurrentUser();
        if (user) {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.textContent = `${user.name} (${user.role})`;
            }
        }
    }

    setupEventListeners() {
        // Authentication forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.getAttribute('href').substring(1));
            });
        });

        // Search functionality
        const searchInput = document.getElementById('club-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterClubs(e.target.value);
            });
        }

        // Time filter
        const timeFilter = document.getElementById('time-range');
        if (timeFilter) {
            timeFilter.addEventListener('change', () => {
                this.loadAnalytics();
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = campusData.authenticateUser(username, password);
        if (user) {
            this.showMainApp();
            campusAnimations.pulseElement('.stats-grid');
        } else {
            alert('Invalid username or password');
        }
    }

    handleRegister() {
        const formData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            username: document.getElementById('regUsername').value,
            password: document.getElementById('regPassword').value,
            role: document.getElementById('regRole').value
        };

        const result = campusData.registerUser(formData);
        if (result.success) {
            campusData.currentUser = result.user;
            this.showMainApp();
            alert('Account created successfully!');
        } else {
            alert(result.message);
        }
    }

    setupNavigation() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveNav(sectionId);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    updateActiveNav(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            switch (sectionId) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'clubs':
                    this.loadClubs();
                    break;
                case 'analytics':
                    this.loadAnalytics();
                    break;
                case 'operations':
                    this.loadOperations();
                    break;
            }
        }
    }

    loadDashboard() {
        this.updateStats();
        campusAnimations.createGalaxy();
    }

    loadClubs() {
        this.displayClubs();
        this.populateClubSelects();
    }

    loadAnalytics() {
        campusAnimations.animateHealthBars();
        this.displayAtRiskStudents();
        this.updateVennDiagram();
    }

    loadOperations() {
        this.populateClubSelects();
    }

    filterClubs(query) {
        const clubs = document.querySelectorAll('.club-card');
        clubs.forEach(card => {
            const clubName = card.querySelector('.club-name').textContent.toLowerCase();
            const matches = clubName.includes(query.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }

    updateStats() {
        const totalStudents = campusData.students.length;
        const totalClubs = campusData.clubs.length;
        const multiClubMembers = campusData.students.filter(student => {
            const clubs = campusData.getStudentClubs(student.id);
            return clubs.length > 1;
        }).length;
        const participationRate = Math.round((campusData.students.filter(student => {
            const clubs = campusData.getStudentClubs(student.id);
            return clubs.length > 0;
        }).length / totalStudents) * 100);

        campusAnimations.animateCounter(document.getElementById('total-students'), totalStudents);
        campusAnimations.animateCounter(document.getElementById('total-clubs'), totalClubs);
        campusAnimations.animateCounter(document.getElementById('multi-club'), multiClubMembers);
        campusAnimations.animateCounter(document.getElementById('participation-rate'), participationRate);
    }

    displayClubs() {
        const grid = document.getElementById('clubs-grid');
        if (!grid) return;

        grid.innerHTML = '';
        campusData.clubs.forEach(club => {
            const health = campusData.getClubHealth(club.id);
            const members = campusData.getClubMembers(club.id);

            const card = document.createElement('div');
            card.className = 'club-card';
            card.innerHTML = `
                <div class="club-header">
                    <h3 class="club-name">${club.name}</h3>
                    <span class="club-category" style="background: ${club.color}20; color: ${club.color}">${club.category}</span>
                </div>
                <div class="member-count">${members.length} members</div>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${health.health}%; background: ${campusAnimations.getHealthColor(health.health)}"></div>
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
                    Health Score: ${Math.round(health.health)}%
                </div>
            `;
            grid.appendChild(card);
        });
    }

    displayAtRiskStudents() {
        const riskStudents = campusData.getAtRiskStudents();
        const riskList = document.getElementById('risk-list');
        const riskCount = document.getElementById('risk-count');

        if (riskCount) riskCount.textContent = riskStudents.length;
        if (!riskList) return;

        riskList.innerHTML = '';
        riskStudents.forEach(student => {
            const clubs = campusData.getStudentClubs(student.id);
            const item = document.createElement('div');
            item.className = 'risk-item';
            item.innerHTML = `
                <div>
                    <strong>${student.name}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">
                        ${student.major} • ${student.year} • ${clubs.length} clubs
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--danger); font-weight: 600;">${Math.round(student.engagement)}%</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">engagement</div>
                </div>
            `;
            riskList.appendChild(item);
        });
    }

    updateVennDiagram() {
        if (campusData.clubs.length >= 2) {
            campusAnimations.animateVennDiagram(campusData.clubs[0], campusData.clubs[1]);
        }
    }

    populateClubSelects() {
        const clubA = document.getElementById('club-a');
        const clubB = document.getElementById('club-b');

        if (clubA && clubB) {
            [clubA, clubB].forEach(select => {
                select.innerHTML = '<option value="">Select Club</option>';
                campusData.clubs.forEach(club => {
                    const option = document.createElement('option');
                    option.value = club.id;
                    option.textContent = club.name;
                    select.appendChild(option);
                });
            });
        }
    }
}

// Global functions
function showLogin() {
    app.showLoginModal();
}

function showRegister() {
    app.showRegisterModal();
}

function loginAsDemo() {
    const user = campusData.authenticateUser('admin', 'admin123');
    if (user) {
        app.showMainApp();
        campusAnimations.pulseElement('.stats-grid');
    }
}

function logout() {
    campusData.logout();
    app.showLoginModal();
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function addDemoClub() {
    const newClub = campusData.addDemoClub();
    app.displayClubs();
    app.populateClubSelects();
    campusAnimations.pulseElement('.clubs-grid');
}

function performOperation() {
    const operationType = document.getElementById('operation-type').value;
    const clubAId = document.getElementById('club-a').value;
    const clubBId = document.getElementById('club-b').value;

    if (!clubAId || !clubBId) {
        alert('Please select both clubs');
        return;
    }

    const clubA = campusData.clubs.find(c => c.id === clubAId);
    const clubB = campusData.clubs.find(c => c.id === clubBId);

    let result = [];
    switch (operationType) {
        case 'intersection':
            result = campusData.intersection(clubAId, clubBId);
            break;
        case 'union':
            result = campusData.union(clubAId, clubBId);
            break;
        case 'difference':
            result = campusData.difference(clubAId, clubBId);
            break;
        case 'complement':
            result = campusData.complement([clubAId, clubBId]);
            break;
    }

    const resultCount = document.getElementById('result-count');
    const resultList = document.getElementById('operation-result-list');

    if (resultCount) resultCount.textContent = result.length;
    if (resultList) {
        resultList.innerHTML = '';
        result.forEach(student => {
            const item = document.createElement('div');
            item.className = 'risk-item';
            item.innerHTML = `
                <div>
                    <strong>${student.name}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">
                        ${student.major} • ${student.year}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--primary); font-weight: 600;">${Math.round(student.engagement)}%</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">engagement</div>
                </div>
            `;
            resultList.appendChild(item);
        });
    }

    campusAnimations.animateSetOperation(operationType, clubA, clubB);
}

function refreshData() {
    campusData.generateDemoData();
    app.loadDashboard();
    app.loadClubs();
    app.loadAnalytics();
    app.loadOperations();
    campusAnimations.pulseElement('.stats-grid');
}

// Initialize the application
const app = new CampusNexusApp();