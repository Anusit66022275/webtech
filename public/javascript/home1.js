// ไว้ทำสไลด์เลื่อนรูปภาพ
let currentIndex = 0;
const slides = document.querySelector('.carousel-control-prev');


function moveSlide(direction) {
    currentIndex += direction;

    if (currentIndex >= images.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = images.length - 1;

    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
}
const images = document.querySelectorAll('.carousel-item');
let maxHeight = 0;

images.forEach(image => {
  image.onload = () => {
    maxHeight = Math.max(maxHeight, image.height);
    image.style.height = `${maxHeight}px`;
  };
});


// Auto Slide 5 วินาทีเปลี่ยนทีละรูป
setInterval(() => moveSlide(1), 5000);


