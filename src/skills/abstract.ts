export interface SkillResponse {
  success: boolean;
  data?: any;
  message: string;
}

export abstract class OpenClawSkill {
  abstract name: string;
  abstract description: string;

  // Update: Explicitly allow 'any' input
  abstract run(input?: any): Promise<SkillResponse>;
}
