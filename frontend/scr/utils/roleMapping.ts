export const scenarioRoles = ['technician', 'screenWriter', 'speaker'];
export const scenarioFullRoles = ['technician', 'screenWriter', 'speaker', 'lead'];

export const roleMapping: Record<string, string> = {
  lead: 'Режиссер',
  technician: 'Техник',
  screenWriter: 'Сценарист',
  speaker: 'Ведущий',
};

export const getRoleDisplayName = (role: string): string => {
  return roleMapping[role] || role;
};
