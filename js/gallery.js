export const galleryMap = {
  home: ['./hotel.jpg', './hotel1.jpg'],
  hotel: ['./hotel1.jpg', './hotel.jpg', './apart.jpg'],
  shop: ['./apart1.jpg', './apart.jpg'],

  cube0: ['./hotel1.jpg', './apart.jpg'],
  cube1: ['./apart.jpg', './apart1.jpg'],
  cube2: ['./apart.jpg', './apart1.jpg'],
  cube3: ['./apart1.jpg', './apart.jpg'],
};

let currentCarouselImages = [];
let currentImageIndex = 0;

export function setupGallery() {
  const modal = document.getElementById('carouselModal');
  const mainImage = document.getElementById('mainCarouselImage');
  const thumbnailsContainer = document.getElementById('carouselThumbnails');
  const closeBtn = document.getElementById('closeCarousel');

  // Buka modal saat tombol galeri diklik
  document.querySelectorAll('.gallery').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();

      const id = button.getAttribute('data-gallery-id');
      const images = galleryMap[id] || [];

      if (images.length === 0) {
        alert("Belum ada gambar galeri untuk POI ini.");
        return;
      }

      modal.classList.remove('hidden');
      updateCarouselImages(images, mainImage, thumbnailsContainer);
    });
  });

  // Tombol tutup modal
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Tombol navigasi gambar
  document.getElementById('prevImage').addEventListener('click', () => {
    const newIndex = (currentImageIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length;
    updateMainImage(newIndex, mainImage, thumbnailsContainer);
  });

  document.getElementById('nextImage').addEventListener('click', () => {
    const newIndex = (currentImageIndex + 1) % currentCarouselImages.length;
    updateMainImage(newIndex, mainImage, thumbnailsContainer);
  });
}

function updateCarouselImages(images, mainImage, thumbnailsContainer) {
  currentCarouselImages = images;
  currentImageIndex = 0;
  thumbnailsContainer.innerHTML = '';

  images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.src = img;
    thumb.className = `h-20 cursor-pointer rounded border-2 ${idx === 0 ? 'border-blue-500' : 'border-transparent'}`;

    thumb.addEventListener('click', () => {
      updateMainImage(idx, mainImage, thumbnailsContainer);
    });

    thumbnailsContainer.appendChild(thumb);
  });

  updateMainImage(0, mainImage, thumbnailsContainer);
  if (window.lucide) lucide.createIcons(); // Optional, jika pakai Lucide
}

function updateMainImage(index, mainImage, thumbnailsContainer) {
  currentImageIndex = index;
  mainImage.src = currentCarouselImages[index];

  const allThumbnails = thumbnailsContainer.querySelectorAll('img');
  allThumbnails.forEach((thumb, idx) => {
    thumb.classList.toggle('border-blue-500', idx === index);
    thumb.classList.toggle('border-transparent', idx !== index);
  });
}