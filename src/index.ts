import chalk from 'chalk';
import { OpenClawAgent } from './core/agent';
import { ScannerSkill } from './skills/scanner';
import { SecuritySkill } from './skills/security';

async function main() {
  const sentinel = new OpenClawAgent();

  // Register Skills
  const scanner = new ScannerSkill();
  const security = new SecuritySkill();

  sentinel.registerSkill(scanner);
  sentinel.registerSkill(security);

  // START THE AUTONOMOUS LOOP
  console.log(chalk.green(`\n🚀 SENTINELCLAW STARTED [Wallet: 0x...c2acd]`));

  // 1. Scan
  const scanResult = await scanner.run({});
  const candidates = scanResult.data;

  // 2. Analyze Each Candidate
  for (const candidate of candidates) {
    console.log(chalk.blue(`\n------------------------------------------------`));
    console.log(chalk.blue(`🔎 Analyzing Candidate: ${candidate.name}`));
    console.log(chalk.gray(`   Address: ${candidate.address}`));

    const securityResult = await security.run({ contractAddress: candidate.address });

    if (securityResult.data && securityResult.data.safe) {
        console.log(chalk.green(`   ✅ VERDICT: SAFE TO FUND`));
        // Day 3 Task: Call Fund Skill Here
    } else {
        console.log(chalk.red(`   🛑 VERDICT: BLOCKED`));
    }
  }
}

main().catch(console.error);
