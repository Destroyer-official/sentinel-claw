export interface SkillResponse {
  success: boolean;
  data?: any;
  message: string;
}

export abstract class OpenClawSkill {
  abstract name: string;
  abstract description: string;

  // Every skill must have a 'run' function
  abstract run(input: any): Promise<SkillResponse>;
}
