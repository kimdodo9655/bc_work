// src/utils/macAddress.ts
// MAC 주소 가져오기 유틸리티 함수

/**
 * 파이썬 Agent를 통해 MAC 주소를 가져옵니다.
 * 실제 환경에서는 파이썬 Agent와 통신하는 로직이 필요합니다.
 * @returns Promise<string> - MAC 주소
 */
export async function getMacAddress(): Promise<string> {
  try {
    // 방법 1: 파이썬 Agent가 로컬 서버를 띄워서 HTTP로 통신하는 경우
    const response = await fetch("http://localhost:8600/get/address", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 응답 구조에 따라 조정 필요
    if (data && data.macAddress) {
      return data.macAddress;
    }

    throw new Error("MAC 주소를 찾을 수 없습니다.");
  } catch (error) {
    console.error("MAC 주소 가져오기 실패:", error);

    // 개발 환경에서는 더미 MAC 주소 반환
    if (import.meta.env.DEV) {
      console.warn("🔧 개발 환경에서 더미 MAC 주소 사용");
      return "42:00:40:f2:b8:43";
    }

    throw new Error("MAC 주소를 가져올 수 없습니다. 프로그램이 정상적으로 설치되었는지 확인해주세요.");
  }
}

/**
 * 파이썬 Agent와의 통신 가능 여부를 확인합니다.
 * @returns Promise<boolean> - 통신 가능 여부
 */
export async function checkPythonAgent(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:8600/health", {
      method: "GET",
      timeout: 3000, // 3초 타임아웃
    });
    return response.ok;
  } catch (error) {
    console.warn("파이썬 Agent와 통신할 수 없습니다:", error);
    return false;
  }
}

/**
 * MAC 주소 형식 검증
 * @param macAddress - 검증할 MAC 주소
 * @returns boolean - 유효한 형식인지 여부
 */
export function validateMacAddress(macAddress: string): boolean {
  // MAC 주소 형식: XX:XX:XX:XX:XX:XX (6개의 16진수 쌍)
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(macAddress);
}

/**
 * MAC 주소 형식 정규화 (하이픈을 콜론으로 변경)
 * @param macAddress - 정규화할 MAC 주소
 * @returns string - 정규화된 MAC 주소
 */
export function normalizeMacAddress(macAddress: string): string {
  return macAddress.replace(/-/g, ":").toLowerCase();
}
