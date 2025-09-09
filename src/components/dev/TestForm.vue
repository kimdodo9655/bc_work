<template>
  <!-- 1) 기본 상태(Default) -->
  <section>
    <h2>① 기본(Default)</h2>
    <form action="#">
      <!-- 📌 텍스트 계열 -->
      <div class="floating-input">
        <input type="text" id="text-default" placeholder="텍스트를 입력하세요" />
        <label for="text-default">Text</label>
      </div>

      <div class="floating-input">
        <input type="password" id="password-default" placeholder="비밀번호를 입력하세요" />
        <label for="password-default">Password</label>
      </div>

      <div class="floating-input">
        <input type="email" id="email-default" placeholder="이메일을 입력하세요" />
        <label for="email-default">Email</label>
      </div>

      <div class="floating-input">
        <input type="url" id="url-default" placeholder="웹사이트 주소를 입력하세요" />
        <label for="url-default">Website URL</label>
      </div>

      <div class="floating-input has-icon search">
        <input type="search" id="search-default" placeholder="검색어를 입력하세요" v-model="searchValue" @input="onSearchInput" />
        <label for="search-default">Search</label>
        <svg class="icon search-icon" viewBox="0 0 24 24" v-show="!searchValue">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <svg class="icon clear-icon" viewBox="0 0 24 24" v-show="searchValue" @click="clearSearch">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      <div class="floating-input">
        <input type="tel" id="tel-default" placeholder="전화번호를 입력하세요" />
        <label for="tel-default">Phone number</label>
      </div>

      <div class="floating-input has-icon number">
        <input type="number" id="number-default" placeholder="숫자를 입력하세요" v-model="numberValue" />
        <label for="number-default">Number</label>
        <svg class="icon" viewBox="0 0 24 24" @click="incrementNumber">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      <input type="hidden" value="hidden value" />

      <!-- 📌 날짜 및 시간 -->
      <div class="floating-input has-icon date">
        <input type="date" id="date-default" ref="dateInput" />
        <label for="date-default">Date</label>
        <svg class="icon" viewBox="0 0 24 24" @click="openDatePicker">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      <!-- 📌 Select -->
      <div class="custom-select">
        <select id="select-default" v-model="selectValue">
          <option value="">선택해주세요</option>
          <option value="option1">옵션 1</option>
          <option value="option2">옵션 2</option>
          <option value="option3">옵션 3</option>
        </select>
        <label for="select-default">Select Option</label>
        <svg class="dropdown-icon" viewBox="0 0 24 24">
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      <!-- 📌 선택 계열 -->
      <div class="custom-checkbox">
        <input type="checkbox" id="checkbox-default" />
        <label for="checkbox-default">Checkbox</label>
      </div>

      <div class="custom-radio-group">
        <div class="custom-radio">
          <input type="radio" id="radio-default-1" name="radio-default" />
          <label for="radio-default-1">Radio 1</label>
        </div>
        <div class="custom-radio">
          <input type="radio" id="radio-default-2" name="radio-default" />
          <label for="radio-default-2">Radio 2</label>
        </div>
      </div>

      <!-- 📌 파일 업로드 -->
      <div class="floating-input">
        <input type="file" id="file-default" />
      </div>

      <!-- 📌 버튼 계열 -->
      <input type="button" value="Button" />
      <input type="submit" value="Submit" />
      <input type="reset" value="Reset" />
    </form>
  </section>

  <!-- 2) Readonly 전용 -->
  <section>
    <h2>② Readonly</h2>
    <form action="#">
      <div class="floating-input">
        <input type="text" id="text-readonly" value="읽기 전용" readonly />
        <label for="text-readonly">Text</label>
      </div>

      <div class="floating-input">
        <input type="password" id="password-readonly" value="password" readonly />
        <label for="password-readonly">Password</label>
      </div>

      <div class="floating-input">
        <input type="email" id="email-readonly" value="name@example.com" readonly />
        <label for="email-readonly">Email</label>
      </div>

      <div class="floating-input">
        <input type="url" id="url-readonly" value="https://example.com" readonly />
        <label for="url-readonly">Website URL</label>
      </div>

      <div class="floating-input has-icon search">
        <input type="search" id="search-readonly" value="keyword" readonly />
        <label for="search-readonly">Search</label>
        <svg class="icon" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div class="floating-input">
        <input type="tel" id="tel-readonly" value="010-1234-5678" readonly />
        <label for="tel-readonly">Phone number</label>
      </div>

      <div class="floating-input has-icon number">
        <input type="number" id="number-readonly" value="10" readonly />
        <label for="number-readonly">Number</label>
        <svg class="icon" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      </div>

      <div class="floating-input has-icon date">
        <input type="date" id="date-readonly" value="2025-09-03" readonly />
        <label for="date-readonly">Date</label>
        <svg class="icon" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      <div class="custom-select">
        <select id="select-readonly" disabled>
          <option value="option1" selected>옵션 1</option>
          <option value="option2">옵션 2</option>
          <option value="option3">옵션 3</option>
        </select>
        <label for="select-readonly">Select Option</label>
        <svg class="dropdown-icon" viewBox="0 0 24 24">
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      <!-- checkbox/radio는 readonly 개념이 없어 제외 -->
      <div class="floating-input">
        <input type="file" disabled />
        <!-- 파일은 readonly가 없어 disabled로 표기 -->
      </div>

      <input type="button" value="Button" />
      <input type="submit" value="Submit" />
      <input type="reset" value="Reset" />
    </form>
  </section>

  <!-- 3) Disabled 전용 -->
  <section>
    <h2>③ Disabled</h2>
    <form action="#">
      <div class="floating-input">
        <input type="text" id="text-disabled" value="비활성화" disabled />
        <label for="text-disabled">Text</label>
      </div>

      <div class="floating-input">
        <input type="password" id="password-disabled" value="password" disabled />
        <label for="password-disabled">Password</label>
      </div>

      <div class="floating-input">
        <input type="email" id="email-disabled" value="name@example.com" disabled />
        <label for="email-disabled">Email</label>
      </div>

      <div class="floating-input">
        <input type="url" id="url-disabled" value="https://example.com" disabled />
        <label for="url-disabled">Website URL</label>
      </div>

      <div class="floating-input has-icon search">
        <input type="search" id="search-disabled" value="keyword" disabled />
        <label for="search-disabled">Search</label>
        <svg class="icon" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div class="floating-input">
        <input type="tel" id="tel-disabled" value="010-1234-5678" disabled />
        <label for="tel-disabled">Phone number</label>
      </div>

      <div class="floating-input has-icon number">
        <input type="number" id="number-disabled" value="10" disabled />
        <label for="number-disabled">Number</label>
        <svg class="icon" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      </div>

      <div class="floating-input has-icon date">
        <input type="date" id="date-disabled" value="2025-09-03" disabled />
        <label for="date-disabled">Date</label>
        <svg class="icon" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      <div class="custom-select">
        <select id="select-disabled" disabled>
          <option value="option1" selected>옵션 1</option>
          <option value="option2">옵션 2</option>
          <option value="option3">옵션 3</option>
        </select>
        <label for="select-disabled">Select Option</label>
        <svg class="dropdown-icon" viewBox="0 0 24 24">
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      <div class="custom-checkbox">
        <input type="checkbox" id="checkbox-disabled" disabled />
        <label for="checkbox-disabled">Checkbox</label>
      </div>

      <div class="custom-radio-group">
        <div class="custom-radio">
          <input type="radio" id="radio-disabled-1" name="radio-disabled" disabled />
          <label for="radio-disabled-1">Radio 1</label>
        </div>
        <div class="custom-radio">
          <input type="radio" id="radio-disabled-2" name="radio-disabled" disabled />
          <label for="radio-disabled-2">Radio 2</label>
        </div>
      </div>

      <div class="floating-input">
        <input type="file" disabled />
      </div>

      <input type="button" value="Button" disabled />
      <input type="submit" value="Submit" disabled />
      <input type="reset" value="Reset" disabled />
    </form>
  </section>
</template>

<script>
export default {
  name: "FloatingLabelForm",
  data() {
    return {
      searchValue: "",
      numberValue: "",
      selectValue: "",
    };
  },
  methods: {
    onSearchInput() {
      // 검색어 입력 시 추가 로직이 필요하면 여기에
    },
    clearSearch() {
      this.searchValue = "";
    },
    incrementNumber() {
      const currentValue = parseInt(this.numberValue) || 0;
      this.numberValue = currentValue + 1;
    },
    openDatePicker() {
      if (this.$refs.dateInput && !this.$refs.dateInput.disabled && !this.$refs.dateInput.readOnly) {
        this.$refs.dateInput.showPicker();
      }
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
  padding: 20px;
}

section {
  background: white;
  margin: 30px 0;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

/* 기본 플로팅 라벨 컨테이너 */
.floating-input {
  position: relative;
  margin-bottom: 25px;
  width: 100%;
}

.floating-input input[type="text"],
.floating-input input[type="password"],
.floating-input input[type="email"],
.floating-input input[type="url"],
.floating-input input[type="search"],
.floating-input input[type="tel"],
.floating-input input[type="number"],
.floating-input input[type="date"] {
  width: 100%;
  padding: 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

/* 아이콘이 있는 input의 패딩 조정 */
.floating-input.has-icon input {
  padding-right: 50px;
}

/* Number input의 기본 스피너 제거 */
.floating-input input[type="number"]::-webkit-outer-spin-button,
.floating-input input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.floating-input input[type="number"] {
  -moz-appearance: textfield;
}

/* date 타입 기본 아이콘 숨김 */
.floating-input.has-icon input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 50px;
  height: 100%;
  cursor: pointer;
}

.floating-input input[type="file"] {
  width: 100%;
  padding: 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

/* 플로팅 라벨 */
.floating-input label {
  position: absolute;
  left: 16px;
  top: 20px;
  color: #666;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
  background: white;
  padding: 0 4px;
}

/* 기본 상태에서는 플레이스홀더 숨김 */
.floating-input input::placeholder {
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 포커스 및 값이 있을 때 라벨 위치 */
.floating-input input:focus + label,
.floating-input input:not(:placeholder-shown) + label,
.floating-input input[value]:not([value=""]) + label {
  top: -8px;
  left: 12px;
  font-size: 12px;
  color: #3498db;
  font-weight: 600;
}

/* 포커스 시에만 플레이스홀더 표시 */
.floating-input input:focus::placeholder {
  opacity: 1;
}

/* date 타입 특별 처리 - 값이 없어도 라벨을 위로 */
.floating-input input[type="date"] + label {
  top: -8px;
  left: 12px;
  font-size: 12px;
  color: #3498db;
  font-weight: 600;
}

/* 커스텀 Select */
.custom-select {
  position: relative;
  margin-bottom: 25px;
  width: 100%;
}

.custom-select select {
  width: 100%;
  padding: 16px 50px 16px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.custom-select label {
  position: absolute;
  left: 16px;
  top: 16px;
  color: #666;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
  background: white;
  padding: 0 4px;
}

.custom-select select:focus + label,
.custom-select select:not([value=""]) + label {
  top: -8px;
  left: 12px;
  font-size: 12px;
  color: #3498db;
  font-weight: 600;
}

.custom-select .dropdown-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #666;
  stroke-width: 2;
  transition: all 0.3s ease;
  pointer-events: none;
}

.custom-select select:focus ~ .dropdown-icon {
  stroke: #3498db;
  transform: translateY(-50%) rotate(180deg);
}

/* 아이콘 */
.floating-input .icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #666;
  stroke-width: 2;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* Search, Number, Date input의 아이콘은 클릭 가능 */
.floating-input.has-icon.search .icon,
.floating-input.has-icon.number .icon,
.floating-input.has-icon.date .icon {
  pointer-events: auto;
  cursor: pointer;
}

/* 포커스 상태 */
.floating-input input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.floating-input input:focus ~ .icon {
  stroke: #3498db;
}

.custom-select select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* Disabled 상태 */
.floating-input input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
}

.floating-input input:disabled + label {
  color: #6c757d;
}

.floating-input input:disabled ~ .icon {
  stroke: #6c757d;
  pointer-events: none;
  cursor: not-allowed;
}

.custom-select select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
}

.custom-select select:disabled + label {
  color: #6c757d;
}

.custom-select select:disabled ~ .dropdown-icon {
  stroke: #6c757d;
}

/* Readonly 상태 */
.floating-input input:read-only {
  background-color: #f8f9fa;
}

.floating-input input:read-only ~ .icon {
  pointer-events: none;
  cursor: not-allowed;
}

/* 커스텀 체크박스 */
.custom-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  cursor: pointer;
}

.custom-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox label {
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
}

.custom-checkbox label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  background: white;
  transition: all 0.3s ease;
}

.custom-checkbox label::after {
  content: "✓";
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  line-height: 12px;
  opacity: 0;
  transition: all 0.3s ease;
}

/* 체크박스 체크 상태 */
.custom-checkbox input[type="checkbox"]:checked + label::before {
  background-color: #3498db;
  border-color: #3498db;
}

.custom-checkbox input[type="checkbox"]:checked + label::after {
  opacity: 1;
}

/* 체크박스 disabled 상태 */
.custom-checkbox input[type="checkbox"]:disabled + label {
  color: #6c757d;
  cursor: not-allowed;
}

.custom-checkbox input[type="checkbox"]:disabled + label::before {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.custom-checkbox input[type="checkbox"]:disabled:checked + label::before {
  background-color: #6c757d;
  border-color: #6c757d;
}

/* 커스텀 라디오 버튼 */
.custom-radio-group {
  margin-bottom: 20px;
}

.custom-radio {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.custom-radio input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-radio label {
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
}

.custom-radio label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid #e1e8ed;
  border-radius: 50%;
  background: white;
  transition: all 0.3s ease;
}

.custom-radio label::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: all 0.3s ease;
}

/* 라디오 버튼 체크 상태 */
.custom-radio input[type="radio"]:checked + label::before {
  background-color: #3498db;
  border-color: #3498db;
}

.custom-radio input[type="radio"]:checked + label::after {
  opacity: 1;
}

/* 라디오 버튼 disabled 상태 */
.custom-radio input[type="radio"]:disabled + label {
  color: #6c757d;
  cursor: not-allowed;
}

.custom-radio input[type="radio"]:disabled + label::before {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.custom-radio input[type="radio"]:disabled:checked + label::before {
  background-color: #6c757d;
  border-color: #6c757d;
}

/* 버튼 */
input[type="button"],
input[type="submit"],
input[type="reset"] {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;
}

input[type="submit"] {
  background-color: #3498db;
  color: white;
}

input[type="submit"]:hover:not(:disabled) {
  background-color: #2980b9;
}

input[type="button"] {
  background-color: #95a5a6;
  color: white;
}

input[type="button"]:hover:not(:disabled) {
  background-color: #7f8c8d;
}

input[type="reset"] {
  background-color: #e74c3c;
  color: white;
}

input[type="reset"]:hover:not(:disabled) {
  background-color: #c0392b;
}

input[type="button"]:disabled,
input[type="submit"]:disabled,
input[type="reset"]:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
