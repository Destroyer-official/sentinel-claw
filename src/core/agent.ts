import chalk from 'chalk';
import { CONFIG } from '../config';
import { OpenClawSkill } from '../skills/abstract';

export class OpenClawAgent {
  private skills: Map<string, OpenClawSkill> = new Map();

  constructor() {
    console.log(chalk.blue(`🤖 ${CONFIG.AGENT_NAME} Initializing...`));
  }

  // Register a new capability
  registerSkill(skill: OpenClawSkill) {
    this.skills.set(skill.name, skill);
    console.log(chalk.gray(`   + Skill Loaded: ${skill.name}`));
  }

  // The main loop
  async start() {
    console.log(chalk.green(`\n🚀 ${CONFIG.AGENT_NAME} IS LIVE ON BASE`));
    console.log(chalk.yellow(`   "I am the opinionated curator Jesse asked for."\n`));

    // Day 1: We just test the loop
    this.loop();
  }

  private async loop() {
    // In a real agent, this runs on a cron/interval
    const scanner = this.skills.get('scanner');
    if (scanner) {
      await scanner.run({});
    }
  }
}
