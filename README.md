# register-front

전자등기 front

<br><br>

## 🚀 Demo

👉 [https://](https://) (가상 링크)

<br><br>

## 🛠️ 기술 스택

| 항목                  | 기술                    |
| --------------------- | ----------------------- |
| 프론트엔드 프레임워크 | Vue 3 (Composition API) |
| 빌드 도구             | Vite                    |
| 상태 관리             | Pinia                   |
| 라우팅                | Vue Router              |
| 스타일링              | 추후지정                |
| 타입 시스템           | TypeScript              |
| HTTP 통신             | Axios + Vue-query       |
| 아이콘                | 추후지정                |
| Node                  | 22.17.1                 |
| npm                   | 11.5.2                  |

<br><br>

## 📦 Node.js 버전 지원 정책 (2025.07 기준)

| 버전               | Current 출시일 | Active LTS 시작   | Maintenance LTS 시작 | EOL (지원 종료) |
| ------------------ | -------------- | ----------------- | -------------------- | --------------- |
| **22.x (Jod)**     | 2024-04-24     | 2024-10-29        | 2025-10-21           | 2027-04-30      |
| **24.x (Krypton)** | 2025-05-06     | 2025-10-28 (예정) | 2026-10-20           | 2028-04-30      |

> ✅ **현재 기준(2025.07.22) 안정적인 개발 버전은 Node.js 22입니다.**  
> ⚠️ 다만, 약 **3개월 뒤인 2025년 10월 21일**, Active LTS가 종료되고 Maintenance LTS로 전환됩니다.  
> 🛠️ Node.js 22의 공식 지원 종료일(EOL)은 **2027년 4월 30일**로, 약 **1년 9개월의 유지보수 지원**이 남아 있습니다.

### 📌 장기 프로젝트 권장 사항

Node.js 22를 사용 중인 경우, **2027년 이전에 Node.js 24 이상 버전으로의 마이그레이션**을 계획하는 것이 좋습니다.

<br><br>

## Project Tree

```

```

<br><br>

## 📦 설치 및 실행 방법

```
# 1. 저장소 클론
git clone https://github.com/your-id/name.git
cd name

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build
```

```
register-front
├─ README.md
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ favicon
│     ├─ android-icon-144x144.png
│     ├─ android-icon-192x192.png
│     ├─ android-icon-36x36.png
│     ├─ android-icon-48x48.png
│     ├─ android-icon-72x72.png
│     ├─ android-icon-96x96.png
│     ├─ apple-icon-114x114.png
│     ├─ apple-icon-120x120.png
│     ├─ apple-icon-144x144.png
│     ├─ apple-icon-152x152.png
│     ├─ apple-icon-180x180.png
│     ├─ apple-icon-57x57.png
│     ├─ apple-icon-60x60.png
│     ├─ apple-icon-72x72.png
│     ├─ apple-icon-76x76.png
│     ├─ apple-icon-precomposed.png
│     ├─ apple-icon.png
│     ├─ browserconfig.xml
│     ├─ favicon-16x16.png
│     ├─ favicon-32x32.png
│     ├─ favicon-96x96.png
│     ├─ favicon.ico
│     ├─ manifest.json
│     ├─ ms-icon-144x144.png
│     ├─ ms-icon-150x150.png
│     ├─ ms-icon-310x310.png
│     └─ ms-icon-70x70.png
├─ src
│  ├─ App.vue
│  ├─ api
│  │  ├─ client
│  │  │  ├─ axios.ts
│  │  │  └─ setupAxios.ts
│  │  ├─ interceptors
│  │  │  ├─ auth.interceptor.ts
│  │  │  └─ logger.interceptor.ts
│  │  ├─ services
│  │  │  ├─ auth
│  │  │  ├─ auth.ts
│  │  │  ├─ index.ts
│  │  │  ├─ userSecurity
│  │  │  └─ userSecurity.ts
│  │  └─ types
│  │     ├─ common.ts
│  │     └─ dto
│  │        ├─ auth.ts
│  │        ├─ index.ts
│  │        └─ userSecurity.ts
│  ├─ assets
│  │  ├─ font
│  │  │  ├─ NotoSansKR-Light.ttf
│  │  │  ├─ NotoSansKR-SemiBold.ttf
│  │  │  └─ OneMobileTitle.ttf
│  │  ├─ images
│  │  │  ├─ login_img.svg
│  │  │  └─ logos
│  │  │     └─ bankclear.png
│  │  └─ styles
│  │     ├─ _index.scss
│  │     ├─ base
│  │     │  ├─ _reset.scss
│  │     │  ├─ _spacing.scss
│  │     │  ├─ _typography.scss
│  │     │  └─ _variables.scss
│  │     ├─ components
│  │     │  └─ _devBanner.scss
│  │     ├─ layout
│  │     │  ├─ _footer.scss
│  │     │  └─ _header.scss
│  │     ├─ main.scss
│  │     ├─ mixins
│  │     │  ├─ _media.scss
│  │     │  └─ _utils.scss
│  │     ├─ pages
│  │     └─ themes
│  │        ├─ _auth.scss
│  │        └─ _guest.scss
│  ├─ components
│  │  ├─ TokenCountdown.vue
│  │  └─ layout
│  │     ├─ Alert.vue
│  │     ├─ AuthBackground.vue
│  │     ├─ Body.vue
│  │     ├─ DevBanner.vue
│  │     ├─ Footer.vue
│  │     ├─ Header.vue
│  │     └─ ModalBackground.vue
│  ├─ composables
│  │  ├─ auth
│  │  │  ├─ useGetToken.ts
│  │  │  ├─ useLogin.ts
│  │  │  └─ useLogout.ts
│  │  └─ userSecurity
│  │     ├─ useChangeMyPassword.ts
│  │     ├─ useChangePassword.ts
│  │     ├─ useSendAuthEmail.ts
│  │     ├─ useSendAuthEmailBeforeChgPwd.ts
│  │     └─ useVerifyEmailAuthKey.ts
│  ├─ constants
│  ├─ main.ts
│  ├─ router
│  │  └─ index.ts
│  ├─ stores
│  │  └─ auth.ts
│  ├─ types
│  │  └─ env.d.ts
│  ├─ utils
│  │  └─ env.ts
│  ├─ views
│  │  ├─ ApiTest.vue
│  │  ├─ auth
│  │  │  ├─ AuthViews.vue
│  │  │  ├─ EmailAuth.vue
│  │  │  ├─ Login.vue
│  │  │  ├─ PasswordSetup.vue
│  │  │  └─ SiteBlocked.vue
│  │  ├─ common
│  │  │  ├─ PageNotFound.vue
│  │  │  ├─ PrivacyPolicy.vue
│  │  │  └─ TermsOfService.vue
│  │  ├─ main
│  │  │  └─ Main.vue
│  │  └─ onboarding
│  │     └─ SelectBank.vue
│  └─ vite-env.d.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```
