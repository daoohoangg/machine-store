<template>
  <div class="news-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <strong>Tin tức hoạt động</strong>
    </nav>

    <div class="news-container">
      <h1 class="page-title">Tin tức hoạt động</h1>
      
      <div class="news-page-grid">
        <NuxtLink 
          v-for="(item, index) in mockNews" 
          :key="index" 
          :to="item.link"
          class="news-item"
        >
          <div class="news-img-wrapper">
            <img :src="item.image" :alt="item.title" class="news-img" />
            <div class="news-tag">{{ item.tag }}</div>
          </div>
          <div class="news-content">
            <h3 class="news-title">{{ item.title }}</h3>
            <div class="news-divider"></div>
            <p class="news-desc">{{ item.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Tin tức hoạt động | Tuấn Minh'
})

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
</script>

<style scoped>
.news-page {
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  gap: 6px;
}

.breadcrumb a {
  color: #0066cc;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 24px;
  color: #222;
  margin-bottom: 24px;
  text-transform: uppercase;
  font-weight: 700;
  border-left: 4px solid #1a73e8;
  padding-left: 12px;
}

.news-page-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 20px;
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

.news-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
}

.news-img-wrapper {
  position: relative;
  width: 100%;
  padding-top: 65%;
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

.news-item:hover .news-img {
  transform: scale(1.05);
}

.news-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(54, 126, 203, 0.85);
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

@media (max-width: 1024px) {
  .news-page-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .news-page-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .news-page-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 20px;
  }
}
</style>
