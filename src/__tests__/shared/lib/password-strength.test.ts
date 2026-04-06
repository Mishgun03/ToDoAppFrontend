import { getPasswordStrength } from "@/shared/lib/password-strength";

describe("getPasswordStrength()", () => {
  // проверка score и label для конкретных паролей
  it.each([
    ["", 0, "Слабый"],
    ["abc", 1, "Слабый"],
    ["Abc", 2, "Слабый"],
    ["Abc1", 3, "Средний"],
    ["Abcdefg1", 4, "Хороший"],
    ["Abcdefg1!", 5, "Надёжный"],
    ["12345678", 2, "Слабый"],
    ["MyP@ssw0rd", 5, "Надёжный"],
    ["!@#", 1, "Слабый"],
    ["abcdefghij", 2, "Слабый"],
  ])("'%s' → score=%d, label='%s'", (password, expectedScore, expectedLabel) => {
    const result = getPasswordStrength(password);
    expect(result.score).toBe(expectedScore);
    expect(result.label).toBe(expectedLabel);
  });

  // каждый критерий увеличивает score
  it.each([
    ["длина >= 8", "a", "aaaaaaaa"],
    ["заглавная буква", "aaaa", "Aaaa"],
    ["цифра", "aaaa", "aaaa1"],
    ["спецсимвол", "aaaa", "aaaa!"],
  ])("критерий: %s увеличивает score", (_label, weak, strong) => {
    expect(getPasswordStrength(strong).score).toBeGreaterThan(
        getPasswordStrength(weak).score,
    );
  });
});