// Animation controller
class CampusAnimations {
    constructor() {
        this.animations = new Map();
    }

    // Number counter animation
    animateCounter(element, target, duration = 2000) {
        if (!element) return;

        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                element.textContent = target.toLocaleString();
                return;
            }
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(animate);
        };

        animate();
    }

    // Galaxy animation
    createGalaxy() {
        const galaxy = document.getElementById('galaxy-view');
        if (!galaxy) return;

        galaxy.innerHTML = '';
        const clubs = campusData.clubs;

        clubs.forEach((club, index) => {
            const planet = document.createElement('div');
            planet.className = 'planet float-animation';
            planet.style.background = club.color;
            planet.style.animationDelay = `${index * 0.5}s`;
            planet.textContent = club.name.split(' ').map(w => w[0]).join('');
            planet.title = club.name;

            // Create orbit
            const orbit = document.createElement('div');
            orbit.className = 'orbit';
            orbit.style.width = `${150 + index * 40}px`;
            orbit.style.height = `${150 + index * 40}px`;
            orbit.style.animationDuration = `${20 + index * 5}s`;

            // Position planet on orbit
            const angle = (index / clubs.length) * 2 * Math.PI;
            const radius = (150 + index * 40) / 2;
            planet.style.left = `calc(50% + ${Math.cos(angle) * radius}px)`;
            planet.style.top = `calc(50% + ${Math.sin(angle) * radius}px)`;

            orbit.appendChild(planet);
            galaxy.appendChild(orbit);
        });
    }

    // Health bar animation
    animateHealthBars() {
        const chart = document.getElementById('health-chart');
        if (!chart) return;

        chart.innerHTML = '';
        campusData.clubs.forEach(club => {
            const health = campusData.getClubHealth(club.id);

            const barContainer = document.createElement('div');
            barContainer.className = 'health-bar-horizontal';

            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = club.name;

            const track = document.createElement('div');
            track.className = 'bar-track';

            const fill = document.createElement('div');
            fill.className = 'bar-fill';
            fill.style.width = '0%';
            fill.style.background = this.getHealthColor(health.health);
            fill.textContent = `${Math.round(health.health)}%`;

            track.appendChild(fill);
            barContainer.appendChild(label);
            barContainer.appendChild(track);
            chart.appendChild(barContainer);

            // Animate width
            setTimeout(() => {
                fill.style.width = `${health.health}%`;
            }, 100);
        });
    }

    getHealthColor(score) {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    }

    // Venn diagram animation
    animateVennDiagram(clubA, clubB) {
        const venn = document.getElementById('venn-diagram');
        if (!venn) return;

        const circleA = venn.querySelector('.club-a');
        const circleB = venn.querySelector('.club-b');
        const overlap = venn.querySelector('.venn-overlap');

        if (clubA && clubB) {
            circleA.textContent = clubA.name;
            circleB.textContent = clubB.name;

            const intersection = campusData.intersection(clubA.id, clubB.id);
            overlap.textContent = `${intersection.length} overlap`;

            // Animate circles
            circleA.style.background = clubA.color + '30';
            circleB.style.background = clubB.color + '30';
        }
    }

    // Set operation visualization
    animateSetOperation(operation, clubA, clubB) {
        const setA = document.querySelector('.set-a');
        const setB = document.querySelector('.set-b');
        const overlap = document.querySelector('.set-overlap');

        if (!clubA || !clubB || !setA || !setB || !overlap) return;

        setA.textContent = clubA.name;
        setB.textContent = clubB.name;
        setA.style.background = clubA.color + '80';
        setB.style.background = clubB.color + '80';

        const intersection = campusData.intersection(clubA.id, clubB.id);
        overlap.textContent = `${intersection.length}`;

        switch (operation) {
            case 'intersection':
                setA.style.left = '35%';
                setB.style.right = '35%';
                overlap.style.opacity = '1';
                break;
            case 'union':
                setA.style.left = '20%';
                setB.style.right = '20%';
                overlap.style.opacity = '0.7';
                break;
            case 'difference':
                setA.style.left = '30%';
                setB.style.right = '60%';
                overlap.style.opacity = '0.3';
                break;
            case 'complement':
                setA.style.left = '70%';
                setB.style.right = '70%';
                overlap.style.opacity = '0';
                break;
        }
    }

    // Pulse animation for important updates
    pulseElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('pulse-animation');
            setTimeout(() => {
                element.classList.remove('pulse-animation');
            }, 2000);
        }
    }
}

const campusAnimations = new CampusAnimations();