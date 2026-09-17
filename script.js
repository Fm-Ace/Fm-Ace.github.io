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
    if (!dom.clock) return;
    dom.clock.textContent = `My time — ${timeFormatter.format(new Date())}`;
};

if (dom.year) {
    dom.year.textContent = new Date().getFullYear();
}

updateClock();
setInterval(updateClock, 30000);

const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('copy failed');
};

dom.copyButtons.forEach((btn) => {
    let resetTimer;

    btn.addEventListener('click', async () => {
        const badge = btn.querySelector('.copy-badge');
        if (!badge) return;

        clearTimeout(resetTimer);

        const reset = (label, copied) => {
            badge.textContent = label;
            badge.classList.toggle('copied', copied);
        };

        try {
            await copyText(btn.dataset.copy);
            reset('Copied!', true);
            resetTimer = setTimeout(() => reset('Copy', false), 2000);
        } catch {
            reset('Failed', false);
            resetTimer = setTimeout(() => reset('Copy', false), 2000);
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
