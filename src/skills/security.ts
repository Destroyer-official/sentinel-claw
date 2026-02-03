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

    const apiKey = process.env.BASESCAN_API_KEY;
    if (!apiKey) {
      console.log(chalk.red("   ❌ ERROR: Missing BASESCAN_API_KEY in .env"));
      return { success: false, message: "Missing API Key" };
    }

    try {
      // FIX 1: Use the Etherscan V2 URL (matches your Key type)
      const url = `https://api.etherscan.io/v2/api?chainid=8453&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data;

      // FIX 2: Handle "No Transactions" (Brand new contract)
      if (data.status === "0" && data.message === "No transactions found") {
         return {
             success: true,
             message: "Fresh Address", // <--- Added Message
             data: { safe: false, reason: "Fresh Address (No History)" }
         };
      }

      // Handle other API Errors
      if (data.status === "0") {
          console.log(chalk.red(`   ⚠️ API Error: ${data.result}`));
          return {
              success: false,
              message: typeof data.result === 'string' ? data.result : "API Error", // <--- Added Message
              data: { risk: "UNKNOWN" }
          };
      }

      const txs = data.result;

      // Double check array
      if (!txs || txs.length === 0) {
          return {
              success: true,
              message: "No History", // <--- Added Message
              data: { safe: false, reason: "No History found" }
          };
      }

      const deployTx = txs[0];
      const deployTime = parseInt(deployTx.timeStamp);

      // Check 2nd transaction
      const actionTx = txs.length > 1 ? txs[1] : null;
      let reason = "Human Speed Verified";
      let isSafe = true;

      if (actionTx) {
        const actionTime = parseInt(actionTx.timeStamp);
        const diffSeconds = actionTime - deployTime;

        // 3 Minute Rule
        if (diffSeconds < 180) {
          isSafe = false;
          reason = `🚨 MACHINE SPEED (${diffSeconds}s). Likely Rug.`;
        }
      }

      // FIX 3: Add 'message' to the final returns
      if (isSafe) {
        console.log(chalk.green(`   ✅ SECURITY PASS: ${reason}`));
        return {
            success: true,
            message: "Security Pass", // <--- Added Message
            data: { safe: true, reason }
        };
      } else {
        console.log(chalk.red(`   ❌ RISK DETECTED: ${reason}`));
        return {
            success: true,
            message: "Risk Detected", // <--- Added Message
            data: { safe: false, reason }
        };
      }

    } catch (error: any) {
      console.error(chalk.red("   API Connection Failed:"), error.message);
      return { success: false, message: "API Connection Error" };
    }
  }
}
