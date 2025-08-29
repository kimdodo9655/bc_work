// src/composables/useMacAddress.ts
// MAC 주소 관련 Composable

import { ref, computed } from "vue";
import { getMacAddress, checkPythonAgent, validateMacAddress } from "@/utils/macAddress";

export function useMacAddress() {
  const macAddress = ref<string>("");
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isAgentConnected = ref<boolean>(false);

  // MAC 주소 유효성 검사
  const isValidMacAddress = computed(() => {
    return macAddress.value ? validateMacAddress(macAddress.value) : false;
  });

  /**
   * 파이썬 Agent 연결 상태 확인
   */
  const checkAgentConnection = async (): Promise<boolean> => {
    try {
      isAgentConnected.value = await checkPythonAgent();
      return isAgentConnected.value;
    } catch (err) {
      isAgentConnected.value = false;
      return false;
    }
  };

  /**
   * MAC 주소 가져오기
   */
  const fetchMacAddress = async (): Promise<string> => {
    if (isLoading.value) {
      return macAddress.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // 먼저 Agent 연결 상태 확인
      await checkAgentConnection();

      if (!isAgentConnected.value) {
        throw new Error("파이썬 Agent에 연결할 수 없습니다.");
      }

      const fetchedMacAddress = await getMacAddress();

      if (!fetchedMacAddress) {
        throw new Error("MAC 주소를 가져올 수 없습니다.");
      }

      if (!validateMacAddress(fetchedMacAddress)) {
        throw new Error("올바르지 않은 MAC 주소 형식입니다.");
      }

      macAddress.value = fetchedMacAddress;
      console.log("✅ MAC 주소 가져오기 성공:", fetchedMacAddress);

      return fetchedMacAddress;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      error.value = errorMessage;
      console.error("🚨 MAC 주소 가져오기 실패:", errorMessage);

      // 개발 환경에서는 더미 데이터 사용
      if (import.meta.env.DEV) {
        const dummyMac = "42:00:40:f2:b8:43";
        macAddress.value = dummyMac;
        console.warn("🔧 개발 환경에서 더미 MAC 주소 사용:", dummyMac);
        return dummyMac;
      }

      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * MAC 주소 초기화
   */
  const resetMacAddress = () => {
    macAddress.value = "";
    error.value = null;
    isAgentConnected.value = false;
  };

  /**
   * 수동으로 MAC 주소 설정 (테스트용)
   */
  const setMacAddress = (mac: string) => {
    if (validateMacAddress(mac)) {
      macAddress.value = mac;
      error.value = null;
    } else {
      error.value = "올바르지 않은 MAC 주소 형식입니다.";
    }
  };

  return {
    // State
    macAddress: computed(() => macAddress.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAgentConnected: computed(() => isAgentConnected.value),
    isValidMacAddress,

    // Actions
    fetchMacAddress,
    checkAgentConnection,
    resetMacAddress,
    setMacAddress,
  };
}
