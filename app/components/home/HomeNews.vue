<template>
  <section class="home-news">
    <div class="news-header">
      <div class="nh-left">
        <h2 class="nh-title">Tin tức hoạt động</h2>
      </div>
      <div class="nh-right">
        <NuxtLink to="/tin-tuc" class="view-all">Xem tất cả <i class="fa-solid fa-arrow-right"></i></NuxtLink>
      </div>
    </div>

    <div class="news-slider-wrapper">
      <button 
        class="nav-btn prev-btn" 
        @click="prevSlide" 
        :disabled="currentIndex === 0"
        aria-label="Previous">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      
      <div class="news-grid-container" ref="gridContainer">
        <div 
          class="news-grid" 
          :style="{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }"
        >
          <NuxtLink 
            v-for="(item, index) in mockNews" 
            :key="index" 
            :to="item.link"
            class="news-item-wrapper"
            :style="{ width: `${100 / itemsPerPage}%` }"
          >
            <div class="news-item">
              <div class="news-img-wrapper">
                <img :src="item.image" :alt="item.title" class="news-img" />
                <div class="news-tag">{{ item.tag }}</div>
              </div>
              <div class="news-content">
                <h3 class="news-title">{{ item.title }}</h3>
                <div class="news-divider"></div>
                <p class="news-desc">{{ item.description }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <button 
        class="nav-btn next-btn" 
        @click="nextSlide" 
        :disabled="currentIndex >= maxIndex"
        aria-label="Next">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    
    <div class="news-pagination">
      <span 
        v-for="dotIndex in (maxIndex + 1)" 
        :key="dotIndex - 1"
        class="dot" 
        :class="{ active: currentIndex === (dotIndex - 1) }"
        @click="goToSlide(dotIndex - 1)"
      ></span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const mockNews = [
  {
    image: 'https://picsum.photos/seed/machine1/600/400',
    tag: 'MÁY NÔNG NGHIỆP',
    title: 'Top 5 Máy Xới Đất Mini Đáng Mua Nhất Cho Vụ Mùa 2025',
    description: 'Máy xới đất mini ngày càng được bà con nông dân ưa chuộng nhờ tính linh hoạt, dễ sử dụng và giá thành phải chăng. Dưới đây là 5 mẫu máy xới đất đáng cân nhắc nhất...',
    link: '#'
  },
  {
    image: 'https://picsum.photos/seed/machine2/600/400',
    tag: 'MẸO CHỌN MÁY BƠM NƯỚC',
    title: 'Kinh Nghiệm Chọn Mua Máy Bơm Nước Phục Vụ Sinh Hoạt Và Sản Xuất',
    description: 'Việc lựa chọn máy bơm nước phù hợp không chỉ giúp cung cấp đủ lượng nước mà còn tiết kiệm điện năng đáng kể, đặc biệt là vào mùa khô hạn kéo dài...',
    link: '#'
  },
  {
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
    tag: 'REVIEW THIẾT BỊ',
    title: 'Đánh Giá Máy Phát Điện Oshima: Có Bền Bỉ Và Nhạy Nổ Như Lời Đồn?',
    description: 'Thương hiệu Oshima từ lâu đã nổi tiếng với các dòng máy công nghiệp và nông nghiệp. Cùng Tuấn Minh review chi tiết các dòng máy phát điện của hãng này...',
    link: '#'
  },
  {
    image: 'https://picsum.photos/seed/machine4/600/400',
    tag: 'HƯỚNG DẪN BẢO DƯỠNG',
    title: 'Hướng Dẫn Bảo Dưỡng Máy Cắt Cỏ Đúng Chuẩn Giúp Kéo Dài Tuổi Thọ',
    description: 'Sau một thời gian dài sử dụng, máy cắt cỏ cần được vệ sinh và bảo dưỡng định kỳ để đảm bảo công suất hoạt động tốt nhất. Hãy làm theo các bước cơ bản sau...',
    link: '#'
  },
  {
    image: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=600&q=80',
    tag: 'TƯ VẤN MUA HÀNG',
    title: 'Máy Bơm Chìm Và Máy Bơm Cạn: Lựa Chọn Nào Phù Hợp Cho Gia Đình?',
    description: 'Tìm hiểu ưu và nhược điểm của dòng máy bơm chìm và bơm cạn để có được lựa chọn đúng đắn và tối ưu chi phí cho nhu cầu sử dụng nước.',
    link: '#'
  },
  {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    tag: 'MÁY NÉN KHÍ',
    title: 'Tại Sao Nên Chọn Máy Nén Khí Không Dầu Dùng Trong Nha Khoa, Y Tế?',
    description: 'Khám phá lý do vì sao máy nén khí không dầu lại đóng vai trò tối quan trọng để đảm bảo tiêu chuẩn y khoa và sức khỏe người bệnh...',
    link: '#'
  },
  {
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
    tag: 'CHỐNG HÀNG GIẢ',
    title: 'Cách Phân Biệt Máy Nông Nghiệp Chính Hãng Oshima Và Hàng Nhái',
    description: 'Thị trường hiện nay xuất hiện nhiều máy nông nghiệp Oshima bị làm giả tinh vi. Dưới đây là cách kiểm tra tem mác và chi tiết máy để nhận biết hàng thật.',
    link: '#'
  },
  {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    tag: 'MÁY CÔNG NGHIỆP',
    title: 'Ứng Dụng Của Máy Nghiền Bột Trong Nông Nghiệp Hiện Đại',
    description: 'Máy nghiền bột giúp việc chế biến thức ăn chăn nuôi hoặc xay xát nông sản trở nên nhanh chóng, hiệu quả. Tham khảo ngay các dòng máy bán chạy.',
    link: '#'
  }
]

const currentIndex = ref(0)
const itemsPerPage = ref(4)

const updateItemsPerPage = () => {
  if (window.innerWidth <= 600) {
    itemsPerPage.value = 1
  } else if (window.innerWidth <= 900) {
    itemsPerPage.value = 2
  } else if (window.innerWidth <= 1200) {
    itemsPerPage.value = 3
  } else {
    itemsPerPage.value = 4
  }
  
  // Ensure we don't go out of bounds after resize
  if (currentIndex.value > maxIndex.value) {
    currentIndex.value = maxIndex.value
  }
}

const maxIndex = computed(() => {
  return Math.max(0, mockNews.length - itemsPerPage.value)
})

const nextSlide = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToSlide = (index: number) => {
  if (index >= 0 && index <= maxIndex.value) {
    currentIndex.value = index
  }
}

onMounted(() => {
  updateItemsPerPage()
  window.addEventListener('resize', updateItemsPerPage)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateItemsPerPage)
})
</script>

<style scoped>
.home-news {
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-top: 20px;
  padding-bottom: 20px;
  border-radius: 4px;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.nh-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.view-all {
  font-size: 14px;
  color: #555;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.view-all:hover {
  color: #1a73e8;
}

.news-slider-wrapper {
  position: relative;
  padding: 20px 40px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  color: #555;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #f8f8f8;
  color: #1a73e8;
  border-color: #1a73e8;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.news-grid-container {
  overflow: hidden;
  width: 100%;
}

.news-grid {
  display: flex;
  transition: transform 0.4s ease-in-out;
}

.news-item-wrapper {
  flex-shrink: 0;
  padding: 0 10px;
  box-sizing: border-box;
}

.news-item {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
  height: 100%;
}

.news-item-wrapper:hover .news-item {
  transform: translateY(-4px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
}

.news-img-wrapper {
  position: relative;
  width: 100%;
  padding-top: 65%; /* aspect ratio */
  overflow: hidden;
  background: #f5f5f5;
}

.news-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.news-item-wrapper:hover .news-img {
  transform: scale(1.05);
}

.news-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(54, 126, 203, 0.85); /* blue translucent */
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  text-align: center;
  text-transform: uppercase;
  line-height: 1.3;
}

.news-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-title {
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin: 0 0 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-divider {
  width: 30px;
  height: 2px;
  background: #ddd;
  margin-bottom: 12px;
}

.news-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  padding-bottom: 5px;
}

.dot {
  width: 20px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #1a73e8;
  width: 30px;
}

@media (max-width: 900px) {
  .news-slider-wrapper {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .nh-title {
    font-size: 18px;
  }
  .news-slider-wrapper {
    padding: 15px 10px;
  }
  .nav-btn {
    display: none;
  }
}
</style>
