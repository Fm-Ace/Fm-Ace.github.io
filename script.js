const dom = {
    year: document.getElementById('current-year'),
    copyButtons: document.querySelectorAll('.copy-btn'),
    tabs: document.querySelectorAll('.tab'),
    sections: document.querySelectorAll('.section'),
    clock: document.getElementById('local-clock')
};

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});

const updateClock = () => {
    dom.clock.textContent = `My time — ${timeFormatter.format(new Date())}`;
};

dom.year.textContent = new Date().getFullYear();
updateClock();
setInterval(updateClock, 30000);

dom.copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
        const badge = btn.querySelector('.copy-badge');
        try {
            await navigator.clipboard.writeText(btn.dataset.copy);
            badge.textContent = 'Copied!';
            badge.classList.add('copied');
            setTimeout(() => {
                badge.textContent = 'Copy';
                badge.classList.remove('copied');
            }, 2000);
        } catch {
            badge.textContent = 'Failed';
        }
    });
});

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        dom.tabs.forEach((tab) => {
            tab.classList.toggle('active', tab.getAttribute('href') === `#${id}`);
        });
    });
}, { rootMargin: '-30% 0px -70% 0px' });

dom.sections.forEach((section) => scrollObserver.observe(section));
