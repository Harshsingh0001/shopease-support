import connectDB from "../config/db.js";
import User from "../models/User.js";
import { processCustomerQuery } from "../modules/ai/aiService.js";
import { evaluationDataset, type TestCase } from "./evalDataset.js";

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  intentPassed: boolean;
  languagePassed: boolean;
  escalationPassed: boolean;
  phrasesPassed: boolean;
  latencyMs: number;
  actualReply: string;
  actualIntent: string;
  actualLanguage: string;
  actualEscalated: boolean;
  failureReasons: string[];
}

export const runAiEvaluationSuite = async (): Promise<void> => {
  console.log("===============================================================================");
  console.log("🤖 SHOPEASE AI SUPPORT — MULTILINGUAL QUALITY & SAFETY EVALUATION SUITE");
  console.log("===============================================================================\n");

  await connectDB();

  // Cache test users
  const customer = await User.findOne({ email: "customer@shopease.local" });
  if (!customer) {
    throw new Error("Seed customer not found. Please run 'npm run seed' first.");
  }

  const results: TestResult[] = [];

  for (const tc of evaluationDataset) {
    const startTime = Date.now();
    const failureReasons: string[] = [];

    try {
      const response = await processCustomerQuery({
        customerId: customer._id.toString(),
        message: tc.input,
      });

      const latencyMs = Date.now() - startTime;

      // 1. Intent Assertion
      const intentPassed = response.analysis.intent === tc.expectedIntent;
      if (!intentPassed) {
        failureReasons.push(
          `Expected intent '${tc.expectedIntent}', got '${response.analysis.intent}'`
        );
      }

      // 2. Language Assertion
      const languagePassed = response.analysis.language === tc.expectedLanguage;
      if (!languagePassed) {
        failureReasons.push(
          `Expected language '${tc.expectedLanguage}', got '${response.analysis.language}'`
        );
      }

      // 3. Escalation Assertion
      const escalationPassed = response.isEscalated === tc.expectedEscalation;
      if (!escalationPassed) {
        failureReasons.push(
          `Expected escalation '${tc.expectedEscalation}', got '${response.isEscalated}'`
        );
      }

      // 4. Grounding & Safety Phrase Assertions
      let phrasesPassed = true;
      for (const phrase of tc.expectedKeyPhrases) {
        if (!response.reply.toLowerCase().includes(phrase.toLowerCase())) {
          phrasesPassed = false;
          failureReasons.push(`Missing expected phrase: '${phrase}'`);
        }
      }

      if (tc.forbiddenPhrases) {
        for (const forbidden of tc.forbiddenPhrases) {
          if (response.reply.toLowerCase().includes(forbidden.toLowerCase())) {
            phrasesPassed = false;
            failureReasons.push(`Contained forbidden phrase: '${forbidden}'`);
          }
        }
      }

      const passed =
        intentPassed && languagePassed && escalationPassed && phrasesPassed;

      results.push({
        testCase: tc,
        passed,
        intentPassed,
        languagePassed,
        escalationPassed,
        phrasesPassed,
        latencyMs,
        actualReply: response.reply,
        actualIntent: response.analysis.intent,
        actualLanguage: response.analysis.language,
        actualEscalated: response.isEscalated,
        failureReasons,
      });

      const statusIcon = passed ? "✅ PASS" : "❌ FAIL";
      console.log(
        `${statusIcon} [${tc.id}] [${tc.category.toUpperCase()}] "${tc.input.slice(0, 45)}..." (${latencyMs}ms)`
      );

      if (!passed) {
        console.log(`   ⚠️  Failures: ${failureReasons.join(" | ")}`);
      }
    } catch (err) {
      console.error(`💥 [${tc.id}] Crashed:`, err);
      results.push({
        testCase: tc,
        passed: false,
        intentPassed: false,
        languagePassed: false,
        escalationPassed: false,
        phrasesPassed: false,
        latencyMs: Date.now() - startTime,
        actualReply: "CRASH",
        actualIntent: "CRASH",
        actualLanguage: "CRASH",
        actualEscalated: false,
        failureReasons: [err instanceof Error ? err.message : "Unknown error"],
      });
    }
  }

  // Generate Scorecard
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  const accuracy = ((passed / total) * 100).toFixed(1);
  const avgLatency = (
    results.reduce((acc, r) => acc + r.latencyMs, 0) / total
  ).toFixed(0);

  // Category Breakdown
  const categories = Array.from(new Set(results.map((r) => r.testCase.category)));

  console.log("\n===============================================================================");
  console.log("📊 EVALUATION SCORECARD & QUALITY REPORT");
  console.log("===============================================================================");
  console.log(`Total Test Scenarios : ${total}`);
  console.log(`Passed Scenarios     : ${passed}`);
  console.log(`Failed Scenarios     : ${failed}`);
  console.log(`Overall Success Rate : ${accuracy}%`);
  console.log(`Average Latency      : ${avgLatency}ms`);
  console.log("-------------------------------------------------------------------------------");
  console.log("Category Breakdown:");
  for (const cat of categories) {
    const catTests = results.filter((r) => r.testCase.category === cat);
    const catPassed = catTests.filter((r) => r.passed).length;
    const catRate = ((catPassed / catTests.length) * 100).toFixed(0);
    console.log(
      `  • ${cat.padEnd(20)}: ${catPassed}/${catTests.length} (${catRate}%)`
    );
  }
  console.log("===============================================================================\n");

  if (failed > 0) {
    console.error(`❌ Evaluation finished with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log("🎉 ALL MULTILINGUAL, QUALITY, & SAFETY EVALUATIONS PASSED 100%!");
    process.exit(0);
  }
};

if (process.argv[1]?.includes("evalRunner")) {
  runAiEvaluationSuite();
}
