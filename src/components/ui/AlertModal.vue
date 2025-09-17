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
        <div class="alert-modal-footer">
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
