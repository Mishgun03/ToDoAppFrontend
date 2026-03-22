export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  if (score <= 2) return { score, label: "Слабый", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Средний", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Хороший", color: "bg-blue-500" };
  return { score, label: "Надёжный", color: "bg-green-500" };
}
