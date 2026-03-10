<template>
  <div class="hero-banner">
    <div class="hero-content">
      <div class="brand-tag">OSHIMA</div>
      <h2>THƯƠNG HIỆU NỔI TIẾNG<br>ĐẾN TỪ VIỆT NAM</h2>
    </div>
    <div class="hero-image-placeholder">
      <!-- Mock image area -->
      <div class="mock-machine shape1"></div>
      <div class="mock-machine shape2"></div>
    </div>
  </div>
</template>

<style scoped>
/* Hero Banner */
.hero-banner {
  background: linear-gradient(to right, #d34a16, #e78c1d);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  padding: 30px;
  color: white;
  min-height: 200px;
  position: relative;
  overflow: hidden;
}
.brand-tag {
  background: white;
  color: red;
  border-radius: 20px;
  border: 2px solid red;
  padding: 5px 15px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 20px;
}
.hero-content h2 {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
}
.hero-image-placeholder {
  position: relative;
  width: 300px;
}
.mock-machine {
  position: absolute;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
}
.shape1 { width: 150px; height: 120px; bottom: -10px; right: 80px; }
.shape2 { width: 80px; height: 160px; bottom: -20px; right: 10px; }
</style>
