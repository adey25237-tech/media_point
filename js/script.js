const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const navigationLinks = document.querySelectorAll(".nav-links a, .mobile-menu a");
const navigationSections = ["home", "services", "work", "about"]
    .map(function (id) {
        return document.getElementById(id);
    });
const siteHeader = document.querySelector("header");
const modal = document.getElementById("inquiryModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const inquiryForm = document.getElementById("inquiryForm");
const toastBox = document.getElementById("toastBox");
const imageLightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxVideo = document.getElementById("lightboxVideo");
const lightboxCaption = document.getElementById("lightboxCaption");
const mediaVideoStatus = document.getElementById("mediaVideoStatus");
const closeImageLightboxBtn = document.getElementById("closeImageLightbox");
let lastFocusedMediaTrigger = null;

document.querySelectorAll(".team-photo").forEach(function (image) {
    function hideMissingPhoto() {
        image.classList.add("is-missing");
    }

    image.addEventListener("error", hideMissingPhoto);
    if (image.complete && image.naturalWidth === 0) {
        hideMissingPhoto();
    }
});

function closeMobileMenu() {
    mobileMenu.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
}

function setActiveNavigation(targetId) {
    navigationLinks.forEach(function (link) {
        if (link.hash === "#" + targetId) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateActiveNavigation() {
    if (window.innerWidth <= 768) {
        return;
    }

    const activeLine = siteHeader.offsetHeight + 24;
    let activeSectionId = "home";

    navigationSections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= activeLine) {
            activeSectionId = section.id;
        }
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        activeSectionId = "contact";
    }

    setActiveNavigation(activeSectionId);
}

menuBtn.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
});

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        setActiveNavigation(link.hash.slice(1));
        closeMobileMenu();
    });
});

mobileMenu.querySelector(".btn").addEventListener("click", closeMobileMenu);

window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
    updateActiveNavigation();
});

let navigationUpdateScheduled = false;
window.addEventListener("scroll", function () {
    if (navigationUpdateScheduled) {
        return;
    }

    navigationUpdateScheduled = true;
    window.requestAnimationFrame(function () {
        navigationUpdateScheduled = false;
        updateActiveNavigation();
    });
}, { passive: true });

updateActiveNavigation();

// inquiry form-er popup khola ar bondho korar code
function openModal(topic) {
    modalTitle.textContent = topic || "Project Inquiry";
    modal.classList.add("open");
}

function closeModal() {
    modal.classList.remove("open");
}

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", function (e) {
    if (e.target === modal) {
        closeModal();
    }
});

function stopLightboxVideo() {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.removeAttribute("poster");
    lightboxVideo.load();
    lightboxVideo.hidden = true;
    mediaVideoStatus.hidden = true;
    mediaVideoStatus.textContent = "";
}

// portfolio-r chobi ba video bondho kore
function closeImageLightbox() {
    stopLightboxVideo();
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxImage.hidden = true;
    lightboxCaption.textContent = "";
    imageLightbox.classList.remove("open");
    imageLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    if (lastFocusedMediaTrigger && lastFocusedMediaTrigger.isConnected) {
        lastFocusedMediaTrigger.focus();
    }

    lastFocusedMediaTrigger = null;
}

function getMediaCaption(media) {
    const customCaption = media.dataset.caption;
    if (customCaption) {
        return customCaption;
    }

    const workCaption = media.closest(".work-thumb")?.querySelector(".work-caption");
    if (workCaption) {
        return workCaption.textContent.trim();
    }

    const card = media.closest(".hero-card, .service-card, .team-card");
    const title = card?.querySelector("h2, h3, .hero-status strong");
    const categoryTitle = media.closest(".work-category")?.querySelector("h3");
    return title?.textContent.trim() || media.alt || categoryTitle?.textContent.trim() || "";
}

function findMediaPreview(target) {
    if (!(target instanceof Element)) {
        return null;
    }

    const media = target.closest("img, video");
    if (media && !media.closest(".logo-badge, #imageLightbox")) {
        return media;
    }

    const previewCard = target.closest(".hero-card, .work-thumb, .logo-box");
    return previewCard?.querySelector("img, video") || null;
}

// image/video click korle modal khule, video auto play hoy
function openMediaPreview(media) {
    stopLightboxVideo();
    lightboxImage.removeAttribute("src");
    lightboxImage.hidden = true;
    lightboxCaption.textContent = getMediaCaption(media);
    lastFocusedMediaTrigger = media.closest("button, a") || media;

    imageLightbox.classList.add("open");
    imageLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeImageLightboxBtn.focus();

    if (media instanceof HTMLVideoElement) {
        const source = media.currentSrc || media.querySelector("source")?.src || media.src;
        if (!source) {
            mediaVideoStatus.textContent = "Video file-er path paoa jacche na.";
            mediaVideoStatus.hidden = false;
            return;
        }

        lightboxVideo.hidden = false;
        lightboxVideo.poster = media.poster || "";
        // preview video-te loop thakle modal-eo loop chole
        lightboxVideo.loop = media.loop;
        lightboxVideo.src = source;
        lightboxVideo.controls = true;
        lightboxVideo.load();

        const playPromise = lightboxVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (!imageLightbox.classList.contains("open") || lightboxVideo.hidden) {
                    return;
                }

                mediaVideoStatus.textContent = "Auto-play hoyni. Play button tip diye chalu korun.";
                mediaVideoStatus.hidden = false;
            });
        }
        return;
    }

    lightboxImage.src = media.currentSrc || media.src;
    lightboxImage.alt = media.alt || "";
    lightboxImage.hidden = false;
}

document.addEventListener("click", function (e) {
    const media = findMediaPreview(e.target);
    if (!media) {
        return;
    }

    e.preventDefault();
    openMediaPreview(media);
});

closeImageLightboxBtn.addEventListener("click", closeImageLightbox);

imageLightbox.addEventListener("click", function (e) {
    if (e.target === imageLightbox) {
        closeImageLightbox();
    }
});

document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".media-preview[role='button']")) {
        e.preventDefault();
        openMediaPreview(e.target);
    }

    if (e.key === "Escape") {
        if (imageLightbox.classList.contains("open")) {
            closeImageLightbox();
        }

        if (mobileMenu.classList.contains("active")) {
            closeMobileMenu();
            menuBtn.focus();
        }
    }
});

// form submit korle message ta dekhay
inquiryForm.addEventListener("submit", function (e) {
    e.preventDefault();
    closeModal();
    inquiryForm.reset();
    toastBox.classList.add("show");
    setTimeout(function () {
        toastBox.classList.remove("show");
    }, 3000);
});
