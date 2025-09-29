// Demo data generator
class CampusNexusData {
    constructor() {
        this.students = [];
        this.clubs = [];
        this.memberships = [];
        this.users = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        if (this.students.length === 0) {
            this.generateDemoData();
        }
        if (this.users.length === 0) {
            this.generateDemoUsers();
        }
    }

    generateDemoData() {
        // Generate students
        const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Peyton', 'Dakota'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const majors = ['Computer Science', 'Biology', 'Business', 'Psychology', 'Engineering', 'Mathematics', 'Physics', 'Chemistry'];
        const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

        this.students = Array.from({
            length: 50
        }, (_, i) => ({
            id: `s${i + 1}`,
            name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            email: `student${i + 1}@university.edu`,
            major: majors[i % majors.length],
            year: years[i % years.length],
            engagement: Math.random() * 100
        }));

        // Generate clubs
        this.clubs = [{
                id: 'c1',
                name: 'Computer Science Club',
                category: 'academic',
                color: '#6366f1'
            },
            {
                id: 'c2',
                name: 'Basketball Team',
                category: 'sports',
                color: '#10b981'
            },
            {
                id: 'c3',
                name: 'Debate Society',
                category: 'academic',
                color: '#8b5cf6'
            },
            {
                id: 'c4',
                name: 'Art Club',
                category: 'arts',
                color: '#f59e0b'
            },
            {
                id: 'c5',
                name: 'Volunteer Corps',
                category: 'service',
                color: '#ef4444'
            },
            {
                id: 'c6',
                name: 'Music Society',
                category: 'arts',
                color: '#06b6d4'
            }
        ];

        // Generate memberships with realistic distribution
        this.memberships = [];
        this.students.forEach(student => {
            const numClubs = Math.floor(Math.random() * 4) + 1; // 1-4 clubs per student
            const clubIndices = this.getRandomIndices(this.clubs.length, numClubs);

            clubIndices.forEach(clubIndex => {
                this.memberships.push({
                    studentId: student.id,
                    clubId: this.clubs[clubIndex].id,
                    role: Math.random() > 0.9 ? 'officer' : 'member',
                    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
                });
            });
        });

        this.saveToStorage();
    }

    generateDemoUsers() {
        this.users = [{
                id: 'u1',
                username: 'admin',
                email: 'admin@campus.edu',
                password: 'admin123',
                name: 'System Administrator',
                role: 'admin',
                createdAt: new Date()
            },
            {
                id: 'u2',
                username: 'student1',
                email: 'student1@campus.edu',
                password: 'student123',
                name: 'Alex Johnson',
                role: 'student',
                createdAt: new Date()
            },
            {
                id: 'u3',
                username: 'leader1',
                email: 'leader1@campus.edu',
                password: 'leader123',
                name: 'Taylor Smith',
                role: 'club_leader',
                createdAt: new Date()
            }
        ];
        this.saveToStorage();
    }


    getRandomIndices(max, count) {
        const indices = new Set();
        while (indices.size < count) {
            indices.add(Math.floor(Math.random() * max));
        }
        return Array.from(indices);
    }

    // Set operations
    intersection(clubA, clubB) {
        const clubAMembers = this.getClubMembers(clubA);
        const clubBMembers = this.getClubMembers(clubB);
        return clubAMembers.filter(student =>
            clubBMembers.some(s => s.id === student.id)
        );
    }

    union(clubA, clubB) {
        const clubAMembers = this.getClubMembers(clubA);
        const clubBMembers = this.getClubMembers(clubB);
        const allMembers = [...clubAMembers, ...clubBMembers];
        return this.removeDuplicates(allMembers);
    }

    difference(clubA, clubB) {
        const clubAMembers = this.getClubMembers(clubA);
        const clubBMembers = this.getClubMembers(clubB);
        return clubAMembers.filter(student =>
            !clubBMembers.some(s => s.id === student.id)
        );
    }

    complement(clubIds) {
        if (clubIds.length === 0) {
            // Students not in any club
            const allClubMembers = new Set();
            this.memberships.forEach(m => allClubMembers.add(m.studentId));
            return this.students.filter(student => !allClubMembers.has(student.id));
        }

        const excludedMembers = new Set();
        clubIds.forEach(clubId => {
            this.getClubMembers(clubId).forEach(student => excludedMembers.add(student.id));
        });

        return this.students.filter(student => !excludedMembers.has(student.id));
    }

    getClubMembers(clubId) {
        const memberIds = this.memberships
            .filter(m => m.clubId === clubId)
            .map(m => m.studentId);

        return this.students.filter(student => memberIds.includes(student.id));
    }

    getStudentClubs(studentId) {
        return this.memberships
            .filter(m => m.studentId === studentId)
            .map(m => this.clubs.find(c => c.id === m.clubId));
    }

    getClubHealth(clubId) {
        const members = this.getClubMembers(clubId);
        const totalStudents = this.students.length;
        const engagement = members.reduce((sum, student) => sum + student.engagement, 0) / members.length;

        return {
            memberCount: members.length,
            engagement: engagement,
            health: Math.min((members.length / 20) * 40 + (engagement / 100) * 60, 100) // Weighted score
        };
    }

    getAtRiskStudents(threshold = 30) {
        return this.students.filter(student => {
            const clubs = this.getStudentClubs(student.id);
            return clubs.length === 0 || student.engagement < threshold;
        });
    }

    removeDuplicates(array) {
        const seen = new Set();
        return array.filter(item => {
            const duplicate = seen.has(item.id);
            seen.add(item.id);
            return !duplicate;
        });
    }

    // Authentication methods
    authenticateUser(username, password) {
        const user = this.users.find(u =>
            (u.username === username || u.email === username) && u.password === password
        );
        if (user) {
            this.currentUser = user;
            this.saveToStorage();
            return user;
        }
        return null;
    }

    registerUser(userData) {
        const existingUser = this.users.find(u =>
            u.username === userData.username || u.email === userData.email
        );

        if (existingUser) {
            return {
                success: false,
                message: 'Username or email already exists'
            };
        }

        const newUser = {
            id: `u${this.users.length + 1}`,
            ...userData,
            createdAt: new Date()
        };

        this.users.push(newUser);
        this.saveToStorage();
        return {
            success: true,
            user: newUser
        };
    }

    logout() {
        this.currentUser = null;
        this.saveToStorage();
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Storage methods
    saveToStorage() {
        localStorage.setItem('campusNexusData', JSON.stringify({
            students: this.students,
            clubs: this.clubs,
            memberships: this.memberships,
            users: this.users,
            currentUser: this.currentUser
        }));
    }

    loadFromStorage() {
        const data = localStorage.getItem('campusNexusData');
        if (data) {
            const parsed = JSON.parse(data);
            this.students = parsed.students || [];
            this.clubs = parsed.clubs || [];
            this.memberships = parsed.memberships || [];
            this.users = parsed.users || [];
            this.currentUser = parsed.currentUser || null;
        }
    }

    addDemoClub() {
        const newClub = {
            id: `c${this.clubs.length + 1}`,
            name: `New Club ${this.clubs.length + 1}`,
            category: ['academic', 'sports', 'arts', 'service'][Math.floor(Math.random() * 4)],
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        this.clubs.push(newClub);
        this.saveToStorage();
        return newClub;
    }
}

// Global instance
const campusData = new CampusNexusData();