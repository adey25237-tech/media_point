const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const modal = document.getElementById("inquiryModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const inquiryForm = document.getElementById("inquiryForm");
const toastBox = document.getElementById("toastBox");

menuBtn.addEventListener("click", function () {
    mobileMenu.classList.toggle("active");
});

mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        mobileMenu.classList.remove("active");
    });
});

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

inquiryForm.addEventListener("submit", function (e) {
    e.preventDefault();
    closeModal();
    inquiryForm.reset();
    toastBox.classList.add("show");
    setTimeout(function () {
        toastBox.classList.remove("show");
    }, 3000);
});
