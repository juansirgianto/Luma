const images = ["./bedroom.jpg", "./2.jpg", "./3.jpg", "./1.jpg", "./2.jpg"];
let index = 0;

const carouselImage = document.getElementById("carouselImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const thumbnails = document.querySelectorAll(".thumbnail");

function updateCarousel() {
  carouselImage.src = images[index];

  thumbnails.forEach((thumb, idx) => {
    if (idx === index) {
      thumb.classList.add("border-blue-500");
      thumb.classList.remove("border-transparent");
    } else {
      thumb.classList.remove("border-blue-500");
      thumb.classList.add("border-transparent");
    }
  });
}

prevBtn.addEventListener("click", () => {
  index = (index - 1 + images.length) % images.length;
  updateCarousel();
});

nextBtn.addEventListener("click", () => {
  index = (index + 1) % images.length;
  updateCarousel();
});

// Klik thumbnail
thumbnails.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    index = parseInt(thumb.dataset.index);
    updateCarousel();
  });
});

// Inisialisasi pertama
updateCarousel();

// arrow thumbnail
const scrollContainer = document.getElementById("thumbnailScroll");
  const scrollAmount = 150; // jumlah pixel scroll setiap klik

  document.getElementById("thumbLeft").addEventListener("click", () => {
    scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  document.getElementById("thumbRight").addEventListener("click", () => {
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });