<template>
  <teleport to="body">
    <div v-if="store.alert.show" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ store.alert.title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ store.alert.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn--primary" @click="handleConfirm">확인</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useUIStore } from "@/stores/ui";
const store = useUIStore();

const handleConfirm = () => {
  if (store.alert.onConfirm) {
    store.alert.onConfirm();
  }
  store.hideAlert();
};

const handleClose = () => {
  store.hideAlert();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
  width: 90%;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.modal-body {
  padding: 1rem 1.5rem;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  text-align: center;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.btn--primary {
  background: #5f9ea0;
  color: white;
}

.btn--primary:hover {
  background: #4d9294;
}
</style>
