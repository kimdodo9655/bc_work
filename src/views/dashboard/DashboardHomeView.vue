<template>
  <div class="dashboard-bg">
    <div class="dashboard-area">
      <div class="dashboard-row">
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div class="dashboard-row">
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div class="dashboard-row">
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <ul>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.dashboard-bg {
  width: 100%;
  min-width: 1024px;
  min-height: calc(100vh - 80px);
  background-color: #ebf7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.dashboard-area {
  width: 100%;
  max-width: 1024px;
  margin: 60px auto;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 15px 25px #00000026, 0 5px 10px #0000000d;
  display: flex;
}

.dashboard-row {
  display: flex;
  justify-content: space-between;
}
</style>
