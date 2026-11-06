import { spawn } from "child_process";
import path from "path";

interface SuiteResult {
  name: string;
  command: string;
  args: string[];
  durationMs: number;
  success: boolean;
  output: string;
}

const runCommand = (command: string, args: string[]): Promise<{ success: boolean; output: string; durationMs: number }> => {
  const start = Date.now();
  return new Promise((resolve) => {
    let output = "";
    const isWindows = process.platform === "win32";
    const executable = isWindows && command === "npx" ? "npx.cmd" : command;

    const child = spawn(executable, args, {
      shell: isWindows,
      env: { ...process.env, NODE_ENV: "test" },
    });

    child.stdout?.on("data", (d) => {
      const text = d.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr?.on("data", (d) => {
      const text = d.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on("close", (code) => {
      resolve({
        success: code === 0,
        output,
        durationMs: Date.now() - start,
      });
    });

    child.on("error", (err) => {
      output += `\nSpawn Error: ${err.message}`;
      resolve({
        success: false,
        output,
        durationMs: Date.now() - start,
      });
    });
  });
};

const runUnifiedRegressionSuite = async () => {
  console.log("\n===============================================================================");
  console.log("   SHOPEASE AI SUPPORT — MASTER REGRESSION & HARDENING VERIFICATION SUITE   ");
  console.log("===============================================================================\n");

  const suites = [
    {
      name: "1. AI Multilingual, Grounding & Safety Evaluation Suite",
      command: "npx",
      args: ["tsx", "src/evaluation/evalRunner.ts"],
    },
    {
      name: "2. Real-Time Socket.IO & Dual-Visibility Suite",
      command: "npx",
      args: ["tsx", "src/tests/socketTest.ts"],
    },
    {
      name: "3. Voice Telephony Webhook & TwiML Suite",
      command: "npx",
      args: ["tsx", "src/tests/voiceTest.ts"],
    },
  ];

  const results: SuiteResult[] = [];

  for (const suite of suites) {
    console.log(`\n-------------------------------------------------------------------------------`);
    console.log(`▶ RUNNING: ${suite.name}`);
    console.log(`-------------------------------------------------------------------------------`);

    const res = await runCommand(suite.command, suite.args);
    results.push({
      ...suite,
      durationMs: res.durationMs,
      success: res.success,
      output: res.output,
    });
  }

  console.log("\n===============================================================================");
  console.log("                      MASTER REGRESSION SUITE SCORECARD                        ");
  console.log("===============================================================================");

  let allPassed = true;
  for (const r of results) {
    const statusSymbol = r.success ? "✅ PASSED" : "❌ FAILED";
    if (!r.success) allPassed = false;
    console.log(`  ${statusSymbol.padEnd(10)} | ${(r.durationMs + "ms").padStart(8)} | ${r.name}`);
  }

  console.log("-------------------------------------------------------------------------------");
  if (allPassed) {
    console.log("🎉 ALL PLATFORM TEST SUITES PASSED (100% REGRESSION PASS RATE)!");
    console.log("🚀 System is hardened, secure, and ready for production deployment.\n");
    process.exit(0);
  } else {
    console.error("💥 One or more test suites failed!");
    process.exit(1);
  }
};

runUnifiedRegressionSuite().catch((err) => {
  console.error("Fatal error running master test runner:", err);
  process.exit(1);
});
