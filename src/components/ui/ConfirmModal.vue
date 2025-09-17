<template>
  <teleport to="body">
    <div v-if="store.confirm.show" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ store.confirm.title }}</h3>
          <button @click="handleCancel">
            <Xmark color="#bbbbbb" :width="30" :height="30" :stroke-width="2.5" />
          </button>
        </div>
        <div class="modal-body">
          <p>{{ store.confirm.message }}</p>
        </div>
        <div class="confirm-modal-footer">
          <button class="btn btn--secondary" @click="handleCancel">취소</button>
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
  if (store.confirm.onConfirm) {
    store.confirm.onConfirm();
  }
  store.hideConfirm();
};

const handleCancel = () => {
  if (store.confirm.onCancel) {
    store.confirm.onCancel();
  }
  store.hideConfirm();
};
</script>
