<template>
  <div class="order-layout">
    <div class="top-line"></div>
    <main class="order-main">
      <slot />
    </main>
    <FloatingContact />
  </div>
</template>

<style scoped>
.order-layout {
  min-height: 100vh;
  background: #efefef;
}

.top-line {
  height: 8px;
  background: #df1f1f;
}

.order-main {
  width: min(1280px, calc(100vw - 24px));
  margin: 12px auto 0;
}
</style>
