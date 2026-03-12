<template>
  <section class="hero-banner">
    <button class="nav-arrow left" aria-label="Xem trước">‹</button>

    <div class="hero-content">
      <p class="sub-title">Tươi mát mỗi ngày</p>
      <h2>Máy nông nghiệp Tuấn Minh</h2>
      <p class="price-note">Giá chỉ từ 2.190.000đ</p>
      <button class="cta-btn">Khám phá ngay</button>
    </div>

    <div class="hero-products">
      <div class="appliance mini"></div>
      <div class="appliance wide"></div>
      <div class="appliance tall"></div>
    </div>

    <button class="nav-arrow right" aria-label="Xem tiếp">›</button>

    <div class="dots">
      <span v-for="n in 5" :key="n" :class="{ active: n === 2 }"></span>
    </div>
  </section>
</template>

<style scoped>
.hero-banner {
  position: relative;
  min-height: 266px;
  background: linear-gradient(115deg, #42b5ff 0%, #8fe8ff 40%, #4dbbff 100%);
  border: 1px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.35), transparent 45%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  color: #fff;
  max-width: 420px;
}

.sub-title {
  font-size: 44px;
  font-style: italic;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hero-content h2 {
  margin-top: 8px;
  font-size: 48px;
  text-transform: uppercase;
  line-height: 1.05;
  font-weight: 900;
}

.price-note {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
}

.cta-btn {
  margin-top: 12px;
  border: none;
  background: #1580e8;
  color: #fff;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 700;
}

.hero-products {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 18px;
}

.appliance {
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff, #d8e8f6);
  box-shadow: inset 0 0 0 1px #b1cadf, 0 12px 20px rgba(0, 0, 0, 0.18);
}

.appliance::after {
  content: '';
  display: block;
  margin: 12px auto;
  width: 72%;
  height: 72%;
  border-radius: 10px;
  background: linear-gradient(180deg, #708397, #d2deea);
}

.appliance.mini {
  width: 110px;
  height: 160px;
}

.appliance.wide {
  width: 155px;
  height: 198px;
}

.appliance.tall {
  width: 128px;
  height: 220px;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  font-size: 35px;
  line-height: 1;
}

.nav-arrow.left {
  left: 10px;
}

.nav-arrow.right {
  right: 10px;
}

.dots {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.dots span.active {
  background: #fff;
  width: 18px;
  border-radius: 12px;
}

@media (max-width: 1200px) {
  .hero-banner {
    padding: 16px 36px;
    min-height: 220px;
  }

  .sub-title {
    font-size: 36px;
  }

  .hero-content h2 {
    font-size: 38px;
  }

  .price-note {
    font-size: 24px;
  }

  .cta-btn {
    font-size: 16px;
  }

  .appliance.mini {
    width: 84px;
    height: 132px;
  }

  .appliance.wide {
    width: 116px;
    height: 164px;
  }

  .appliance.tall {
    width: 98px;
    height: 188px;
  }
}

@media (max-width: 900px) {
  .hero-banner {
    padding: 16px;
  }

  .hero-products {
    display: none;
  }

  .hero-content {
    max-width: none;
    margin: 0 auto;
    text-align: center;
  }

  .sub-title {
    font-size: 30px;
  }

  .hero-content h2 {
    font-size: 34px;
  }
}
</style>
