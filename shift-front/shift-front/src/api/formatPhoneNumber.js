export function formatPhoneNumber(input) {
  if (input === null || input === undefined) return "";

  const digits = String(input).replace(/\D/g, ""); // 숫자 추출
  if (digits.length === 0) return "";

  // 010으로 시작하는지 체크
  if (!digits.startsWith("010")) return digits;

  // 정상 길이(11자리)라면 포맷팅 실행
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  // 그 외에는 숫자만 반환
  return digits;
}
