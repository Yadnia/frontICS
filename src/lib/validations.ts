// ==========================================
// UTILIDADES DE VALIDACIÓN Y CALIDAD DE SOFTWARE
// ==========================================

export interface PasswordValidationResult {
  isValid: boolean;
  message: string | null;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

/**
 * Valida que un campo no esté vacío ni contenga solo espacios en blanco
 */
export function validateNotEmpty(value: string | null | undefined, fieldName: string): string | null {
  if (value === null || value === undefined || value.trim().length === 0) {
    return `El campo "${fieldName}" es obligatorio y no puede estar vacío.`;
  }
  return null;
}

/**
 * Valida formato estándar de correo electrónico
 */
export function validateEmail(email: string | null | undefined): string | null {
  if (!email || email.trim().length === 0) {
    return "El correo electrónico es obligatorio.";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return "Ingresa un correo electrónico válido (ejemplo: usuario@ipsfas.edu).";
  }
  if (email.length > 160) {
    return "El correo electrónico no puede exceder los 160 caracteres.";
  }
  return null;
}

/**
 * Valida contraseñas con estándares de seguridad:
 * - Mínimo 8 caracteres
 * - Al menos 1 número (dígito)
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 carácter especial
 */
export function validatePassword(password: string | null | undefined): PasswordValidationResult {
  const p = password || "";
  const hasMinLength = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  const errors: string[] = [];
  if (!hasMinLength) errors.push("mínimo 8 caracteres");
  if (!hasNumber) errors.push("al menos un dígito numérico (0-9)");
  if (!hasUpper) errors.push("al menos una letra mayúscula");
  if (!hasLower) errors.push("al menos una letra minúscula");
  if (!hasSpecial) errors.push("al menos un carácter especial (@, #, $, etc.)");

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    isValid,
    message: isValid ? null : `La contraseña debe contener: ${errors.join(", ")}.`,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

/**
 * Valida nombre de usuario
 */
export function validateUsername(username: string | null | undefined): string | null {
  if (!username || username.trim().length === 0) {
    return "El nombre de usuario es obligatorio.";
  }
  const clean = username.trim();
  if (clean.length < 3) {
    return "El nombre de usuario debe tener al menos 3 caracteres.";
  }
  if (clean.length > 40) {
    return "El nombre de usuario no puede exceder los 40 caracteres.";
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(clean)) {
    return "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.";
  }
  return null;
}

/**
 * Valida cédula de identidad
 */
export function validateCedula(cedula: string | null | undefined): string | null {
  if (!cedula || cedula.trim().length === 0) {
    return "La cédula de identidad es obligatoria.";
  }
  const clean = cedula.trim();
  if (clean.length < 5) {
    return "La cédula debe tener al menos 5 caracteres.";
  }
  if (clean.length > 30) {
    return "La cédula no puede superar los 30 caracteres.";
  }
  return null;
}

/**
 * Valida teléfono institucional o de contacto
 */
export function validatePhone(phone: string | null | undefined, isRequired: boolean = false): string | null {
  if (!phone || phone.trim().length === 0) {
    return isRequired ? "El número de teléfono es obligatorio." : null;
  }
  const clean = phone.trim();
  if (clean.length < 8) {
    return "El número de teléfono debe tener al menos 8 dígitos.";
  }
  if (clean.length > 30) {
    return "El número de teléfono no puede exceder los 30 caracteres.";
  }
  if (!/^[0-9+\s()-]+$/.test(clean)) {
    return "El teléfono solo puede contener números, espacios, guiones y el signo '+'.";
  }
  return null;
}

/**
 * Valida código de estudiante institucional
 */
export function validateCodigoEstudiante(codigo: string | null | undefined): string | null {
  if (!codigo || codigo.trim().length === 0) {
    return "El código de estudiante es obligatorio.";
  }
  const clean = codigo.trim();
  if (clean.length < 3) {
    return "El código debe tener al menos 3 caracteres.";
  }
  if (clean.length > 30) {
    return "El código no puede superar los 30 caracteres.";
  }
  return null;
}

/**
 * Valida fecha de nacimiento (no futura, edad coherente)
 */
export function validateDateOfBirth(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim().length === 0) {
    return "La fecha de nacimiento es obligatoria.";
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return "Formato de fecha inválido. Utiliza el formato AAAA-MM-DD.";
  }
  const today = new Date();
  if (date > today) {
    return "La fecha de nacimiento no puede ser una fecha futura.";
  }
  const ageYears = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (ageYears < 2) {
    return "La edad mínima registrada debe ser de al menos 2 años.";
  }
  if (ageYears > 100) {
    return "Por favor ingresa una fecha de nacimiento válida.";
  }
  return null;
}
