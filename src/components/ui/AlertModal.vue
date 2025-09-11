<template>
  <teleport to="body">
    <div v-if="store.alert.show" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ store.alert.title }}</h3>
          <button @click="handleClose">
            <Xmark color="#bbbbbb" :width="30" :height="30" :stroke-width="2.5" />
          </button>
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
import { Xmark } from "@iconoir/vue";
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
  background: #00000099;
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
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.modal-header button {
  width: 30px;
  height: 30px;
  border: 0;
  background-color: transparent;
  color: #999999;
  cursor: pointer;
  transition: 0.5s;
  padding: 0;
}

.modal-header button svg {
  transition: 0.5s;
}

.modal-header button:hover svg {
  color: #5f9ea0;
}

.modal-body {
  padding: 1rem 1.5rem;
}

.modal-body p {
  background-color: #ebf7f8;
  padding: 25px;
  border-radius: 5px;
  margin: 10px 0 0;
  color: #4d9294;
  line-height: 1.7;
  font-weight: 600;
}

.modal-footer {
  padding: 0 1.5rem 1.5rem;
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
  width: 100%;
  background: #5f9ea0;
  color: white;
}

.btn--primary:hover {
  background: #4d9294;
}
</style>
