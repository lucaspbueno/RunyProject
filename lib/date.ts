/**
 * Utilitários centralizados para manipulação de datas
 * Elimina duplicação de lógica entre componentes
 */

/**
 * Extrai apenas a parte da data de uma string datetime (ISO)
 * @param valor - Data como string ou objeto Date
 * @returns Data no formato YYYY-MM-DD
 */
export function parseDateOnly(valor: Date | string): string {
  if (typeof valor === "string") {
    return valor.slice(0, 10);
  }

  return valor.toISOString().slice(0, 10);
}

/**
 * Formata data para o padrão brasileiro DD/MM/YYYY
 * @param valor - Data como string ou objeto Date
 * @returns Data formatada em português brasileiro
 */
export function formatDateBR(valor: Date | string): string {
  const dataPura: string = parseDateOnly(valor);
  const [ano, mes, dia] = dataPura.split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Calcula idade a partir da data de nascimento
 * @param dateOfBirth - Data de nascimento como string ou Date
 * @returns Idade em anos completos
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const dataPura: string = parseDateOnly(dateOfBirth);
  const [anoStr, mesStr, diaStr] = dataPura.split("-");
  const ano: number = Number(anoStr);
  const mes: number = Number(mesStr);
  const dia: number = Number(diaStr);

  let age = today.getFullYear() - ano;
  const monthDiff = (today.getMonth() + 1) - mes;
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dia)) {
    age--;
  }
  
  return age;
}
