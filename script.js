const form = document.getElementById('shorten-form');
const input = document.getElementById('url-input');
const button = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-msg');
const section = document.getElementById('history-section');
const list = document.getElementById('link-list');
const clearBtn = document.getElementById('clear-btn');

let links = JSON.parse(localStorage.getItem('links') || '[]');

const save = () => localStorage.setItem('links', JSON.stringify(links));

const showError = (message) => {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
};

const render = () => {
    section.style.display = links.length ? 'block' : 'none';
    list.replaceChildren();
    links.forEach(({ shortUrl, originalUrl }) => {
        const item = document.createElement('div');
        item.className = 'link-item';

        const details = document.createElement('div');
        details.className = 'link-details';

        const a = document.createElement('a');
        a.className = 'short-url';
        a.href = shortUrl;
        a.target = '_blank';
        a.textContent = shortUrl;

        const original = document.createElement('span');
        original.className = 'original-url';
        original.textContent = originalUrl;

        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'copy-btn';
        copy.textContent = 'Copy';
        copy.addEventListener('click', async () => {
            await navigator.clipboard.writeText(shortUrl);
            copy.textContent = 'Copied';
            copy.classList.add('copied');
            setTimeout(() => {
                copy.textContent = 'Copy';
                copy.classList.remove('copied');
            }, 1500);
        });

        details.append(a, original);
        item.append(details, copy);
        list.append(item);
    });
};

const isValidUrl = (value) => {
    try {
        const { protocol } = new URL(value);
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalUrl = input.value.trim();

    if (!isValidUrl(originalUrl)) {
        showError('Please enter a valid URL including http:// or https://');
        return;
    }
    errorMsg.style.display = 'none';
    button.disabled = true;

    try {
        const res = await fetch('/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const shortUrl = `${location.origin}/${data.shortUrl}`;
        links = [{ shortUrl, originalUrl }, ...links.filter(l => l.shortUrl !== shortUrl)];
        save();
        render();
        input.value = '';
    } catch (err) {
        showError(err.message || 'Something went wrong');
    } finally {
        button.disabled = false;
    }
});

clearBtn.addEventListener('click', () => {
    links = [];
    save();
    render();
});

render();