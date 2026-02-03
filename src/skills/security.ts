import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { OpenClawSkill, SkillResponse } from './abstract';

dotenv.config();

export class SecuritySkill extends OpenClawSkill {
  name = "security";
  description = "Analyzes deployment speed to detect machine-driven rugs.";

  async run(input: { contractAddress: string }): Promise<SkillResponse> {
    const address = input.contractAddress;
    console.log(chalk.yellow(`🛡️ [TimeLock AI] Analyzing temporal patterns for: ${address}`));

    try {
      const apiKey = process.env.BASESCAN_API_KEY;

      if (!apiKey) {
        console.log(chalk.red("   ❌ ERROR: Missing BASESCAN_API_KEY in .env"));
        return { success: false, message: "Missing API Key" };
      }

      // 1. Call BaseScan API
      const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' } // Helps bypass some API blocks
      });

      const data = response.data;

      // 2. Handle API Errors
      if (data.status === "0" && data.message !== "No transactions found") {
        // "No transactions" is actually safe (it means it's brand new or unused)
        if (data.message.includes("No transactions")) {
            return {
                success: true,
                message: "Fresh Address",
                data: { safe: true, reason: "Fresh Address (No History)" }
            };
        }
        console.log(chalk.red(`   ⚠️ BaseScan API Error: ${data.message}`));
        return { success: false, message: data.message || "Unknown API Error", data: { risk: "UNKNOWN" } };
      }

      const txs = data.result;

      if (!Array.isArray(txs) || txs.length === 0) {
        return {
            success: true,
            message: "No History",
            data: { safe: true, reason: "Fresh Address (No History)" }
        };
      }

      // 3. The TimeLock Logic
      const deployTx = txs[0];
      const deployTime = parseInt(deployTx.timeStamp);

      // Compare Deployment vs Now (or 2nd Transaction)
      const now = Math.floor(Date.now() / 1000);
      const actionTx = txs.length > 1 ? txs[1] : null;
      const actionTime = actionTx ? parseInt(actionTx.timeStamp) : now;

      const diffSeconds = actionTime - deployTime;

      console.log(chalk.gray(`   > Deploy Time: ${new Date(deployTime * 1000).toISOString()}`));
      console.log(chalk.gray(`   > Action Time: ${new Date(actionTime * 1000).toISOString()}`));
      console.log(chalk.cyan(`   > Speed Delta: ${diffSeconds} seconds`));

      // 4. Judgment
      if (diffSeconds < 180) { // Less than 3 Minutes
        const reason = `🚨 MACHINE SPEED DETECTED (${diffSeconds}s). Likely Rug.`;
        console.log(chalk.red(`   ❌ RISK DETECTED: ${reason}`));

        // FIX: Added 'message' property here
        return {
            success: true,
            message: "Risk Detected",
            data: { safe: false, reason }
        };
      } else {
        const reason = "Human Speed Verified";
        console.log(chalk.green(`   ✅ SECURITY PASS: ${reason}`));

        // FIX: Added 'message' property here
        return {
            success: true,
            message: "Security Verified",
            data: { safe: true, reason }
        };
      }

    } catch (error: any) {
      const msg = error.message || "Unknown API Error";
      console.error(chalk.red(`   ❌ ERROR:`), msg);
      return { success: false, message: msg };
    }
  }
}
