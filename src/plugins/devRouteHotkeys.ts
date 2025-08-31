import type { Router, RouteLocationRaw } from 'vue-router';

/**
 * 개발용 단축키 (Shift + A → QWERTYUIOP[])
 * - 한/영/자판 레이아웃 무관하게 event.code 사용 (KeyQ..KeyP, BracketLeft, BracketRight)
 * - 입력 필드에 포커스가 있을 땐 동작하지 않음
 * - Vite HMR에서 중복 등록 방지
 */
export function setupDevRouteHotkeys(router: Router) {
  //   if (typeof window === 'undefined') return;
  //   if (import.meta.env.PROD) return; // 개발 모드에서만

  // 중복 방지 (HMR 포함)
  if ((window as any).__DEV_ROUTE_HOTKEYS_BOUND__) return;
  (window as any).__DEV_ROUTE_HOTKEYS_BOUND__ = true;

  const ARMED_MS = 1200;
  let armed = false;
  let armTimer: number | null = null;

  // event.code 기준 매핑
  const hotkeyMap: Record<string, RouteLocationRaw> = {
    // Q W E R T
    KeyQ: { name: 'Home' },
    KeyW: { name: 'EstimateList' },
    KeyE: { name: 'EstimateCreateSubmit' },
    KeyR: { name: 'EstimateReviewWithdraw' },
    KeyT: { name: 'OnboardingInstitutionSelect' },

    // Y U I O P
    KeyY: { name: 'ProgramInstall' },
    KeyU: { name: 'SiteBlocked' },
    KeyI: { name: 'EmailVerificationKey' },
    KeyO: { name: 'PasswordSetup' },
    KeyP: { name: 'Login' },

    // [ ]
    BracketLeft: { name: 'AutoLogout' },
    BracketRight: { name: 'NotFound' },
  };

  const isEditable = (el: EventTarget | null) => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    if (el.isContentEditable) return true;
    return false;
  };

  const arm = () => {
    disarm();
    armed = true;
    armTimer = window.setTimeout(() => {
      armed = false;
      armTimer = null;
    }, ARMED_MS);
  };

  const disarm = () => {
    armed = false;
    if (armTimer !== null) {
      clearTimeout(armTimer);
      armTimer = null;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    // 입력 필드에서는 단축키 비활성
    if (isEditable(e.target)) return;

    // 1) Shift + A (물리키: KeyA) 로 준비 상태
    if (e.code === 'KeyA' && e.shiftKey) {
      arm();
      return;
    }

    // 2) 준비 상태에서 Q~] (물리키 코드) 입력 시 이동
    if (armed && hotkeyMap[e.code]) {
      e.preventDefault();
      const target = hotkeyMap[e.code];
      router.push(target).catch(() => void 0);
      disarm();
    }
  };

  window.addEventListener('keydown', onKeyDown, { capture: true });

  // Vite HMR 정리
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener('keydown', onKeyDown, {
        capture: true,
      } as any);
      disarm();
      (window as any).__DEV_ROUTE_HOTKEYS_BOUND__ = false;
    });
  }
}
