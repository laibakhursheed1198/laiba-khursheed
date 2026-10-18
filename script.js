// Turns each card's data-video link into a thumbnail + popup player.
// Supports Google Drive share links, YouTube links, and direct video files.

const PLAY_ICON = '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>';

function parseVideo(url) {
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (drive) {
    const id = drive[1];
    return {
      type: 'iframe',
      src: `https://drive.google.com/file/d/${id}/preview`,
      // Direct stream lets us autoplay and read the real video size
      direct: `https://drive.google.com/uc?export=download&id=${id}`,
      thumb: `https://drive.google.com/thumbnail?id=${id}&sz=w1280`,
    };
  }
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    const id = yt[1];
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  return { type: 'video', src: url, thumb: null };
}

const cards = document.querySelectorAll('.card');

cards.forEach((card, i) => {
  const info = parseVideo(card.dataset.video || '');
  const title = card.dataset.title || '';
  card.style.setProperty('--hue', `${i * 40}deg`);
  card.setAttribute('aria-label', `Play ${title || 'video ' + (i + 1)}`);

  let media = '';
  if (info.thumb) {
    media = `<img src="${info.thumb}" alt="" loading="lazy" onerror="this.parentNode.classList.add('art');this.remove()">`;
  } else if (info.type === 'video') {
    media = `<video src="${info.src}#t=1" muted playsinline preload="metadata"></video>`;
  }

  card.innerHTML = `
    <div class="thumb ${media ? '' : 'art'}">${media}</div>
    <span class="num">${String(i + 1).padStart(2, '0')}</span>
    <span class="play">${PLAY_ICON}</span>
    ${title ? `<span class="label">${title}</span>` : ''}
  `;

  // Live preview on hover for direct video files
  const preview = card.querySelector('.thumb video');
  if (preview) {
    card.addEventListener('mouseenter', () => preview.play().catch(() => {}));
    card.addEventListener('mouseleave', () => preview.pause());
  }

  // Spotlight follows the cursor
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  // Remember the thumbnail's shape as a fallback aspect ratio
  const img = card.querySelector('.thumb img');
  if (img) {
    const setRatio = () => { if (img.naturalWidth) info.ratio = img.naturalWidth / img.naturalHeight; };
    img.complete ? setRatio() : img.addEventListener('load', setRatio);
  }

  card.addEventListener('click', () => openModal(info, title));
});

// Staggered reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const idx = [...cards].indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('in'), (idx % 3) * 120);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
cards.forEach((c) => observer.observe(c));

// ---------- Modal ----------
const modal = document.getElementById('modal');
const player = document.getElementById('player');
const modalTitle = document.getElementById('modalTitle');
let lastFocus = null;

function setPlayerRatio(ratio) {
  if (ratio > 0 && isFinite(ratio)) player.style.setProperty('--ratio', ratio);
}

function showIframe(info) {
  setPlayerRatio(info.ratio || 16 / 9);
  player.innerHTML = `<iframe src="${info.src}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}

function showVideo(src, onFail) {
  player.innerHTML = `<video src="${src}" controls autoplay playsinline></video>`;
  const v = player.querySelector('video');
  // Fit the frame to the video's own dimensions
  v.addEventListener('loadedmetadata', () => setPlayerRatio(v.videoWidth / v.videoHeight));
  if (onFail) v.addEventListener('error', onFail, { once: true });
  // Some browsers block autoplay with sound; retry muted
  v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
}

function openModal(info, title) {
  lastFocus = document.activeElement;
  player.style.removeProperty('--ratio');
  if (info.direct) {
    setPlayerRatio(info.ratio || 16 / 9);
    showVideo(info.direct, () => { if (modal.classList.contains('open')) showIframe(info); });
  } else if (info.type === 'iframe') {
    showIframe(info);
  } else {
    showVideo(info.src);
  }
  modalTitle.textContent = title;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
  modal.querySelector('.close').focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('locked');
  // Clear after the exit animation so playback stops
  setTimeout(() => { if (!modal.classList.contains('open')) player.innerHTML = ''; }, 450);
  const v = player.querySelector('video');
  if (v) v.pause();
  if (lastFocus) lastFocus.focus();
}

modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
