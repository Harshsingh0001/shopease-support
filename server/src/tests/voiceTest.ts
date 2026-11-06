import http from "http";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import CallLog from "../models/CallLog.js";
import app from "../app.js";

const makeRequest = (
  server: http.Server,
  options: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown> | string;
  }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string; json?: any }> => {
  return new Promise((resolve, reject) => {
    const address = server.address();
    if (!address || typeof address === "string") {
      return reject(new Error("Server address not available"));
    }

    const payload =
      typeof options.body === "object" ? JSON.stringify(options.body) : options.body || "";

    const reqHeaders: Record<string, string> = {
      ...(options.headers || {}),
    };

    if (typeof options.body === "object" && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(payload).toString();
    } else if (payload && !reqHeaders["Content-Length"]) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path: options.path,
        method: options.method,
        headers: reqHeaders,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let parsedJson: any = undefined;
          try {
            parsedJson = JSON.parse(data);
          } catch {
            // non-json body (like TwiML XML)
          }
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data,
            json: parsedJson,
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runVoiceTests = async () => {
  console.log("\n=======================================================");
  console.log("   VOICE & TELEPHONY INTEGRATION VERIFICATION SUITE   ");
  console.log("=======================================================\n");

  await connectDB();

  // Create temporary HTTP test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as any;
  console.log(`[TEST] Test server listening on port ${address.port}`);

  // Fetch or ensure demo users
  const [customer, agent] = await Promise.all([
    User.findOne({ email: "customer@shopease.local" }),
    User.findOne({ email: "agent@shopease.local" }),
  ]);

  if (!customer || !agent) {
    throw new Error("Seed users not found. Please ensure database is seeded.");
  }

  // Update customer's phone number for telephony lookup test
  customer.phone = "+919876543210";
  await customer.save();

  // Obtain agent and customer JWT tokens via login
  const loginAgentRes = await makeRequest(server, {
    method: "POST",
    path: "/api/v1/auth/login",
    body: { email: "agent@shopease.local", password: "Password123!" },
  });
  const agentToken = loginAgentRes.json?.token;

  const loginCustomerRes = await makeRequest(server, {
    method: "POST",
    path: "/api/v1/auth/login",
    body: { email: "customer@shopease.local", password: "Password123!" },
  });
  const customerToken = loginCustomerRes.json?.token;

  let passedTests = 0;
  const totalTests = 7;

  try {
    // ---------------------------------------------------------
    // TEST 1: Inbound Webhook (TwiML XML + Mandatory AI Disclosure)
    // ---------------------------------------------------------
    console.log("TEST 1: Inbound Webhook generates compliant TwiML & mandatory AI disclosure");
    const testCallSid = `CA-TEST-${Date.now()}`;

    const inboundRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/voice/inbound",
      body: {
        CallSid: testCallSid,
        From: "+919876543210",
      },
    });

    if (
      inboundRes.statusCode === 200 &&
      inboundRes.body.includes("<Response>") &&
      inboundRes.body.includes("ShopEase AI customer assistant") &&
      inboundRes.body.includes("recorded for quality and support purposes") &&
      inboundRes.body.includes("Hello Aman Gupta!") &&
      inboundRes.body.includes("<Gather")
    ) {
      console.log("  ✅ Passed: TwiML generated, regulatory AI disclosure present, caller recognized as Aman Gupta.");
      passedTests++;
    } else {
      console.error("  ❌ Failed Inbound Webhook response:", inboundRes.body);
    }

    // ---------------------------------------------------------
    // TEST 2: Inbound Webhook JSON mode
    // ---------------------------------------------------------
    console.log("\nTEST 2: Inbound Webhook supports JSON format for browser/mobile telephony clients");
    const jsonInboundRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/voice/inbound?format=json",
      headers: { Accept: "application/json" },
      body: {
        CallSid: `${testCallSid}-JSON`,
        From: "+919876543210",
      },
    });

    if (
      jsonInboundRes.statusCode === 200 &&
      jsonInboundRes.json?.success === true &&
      jsonInboundRes.json?.callerName === "Aman Gupta" &&
      jsonInboundRes.json?.disclosure.includes("ShopEase AI customer assistant")
    ) {
      console.log("  ✅ Passed: JSON response returned with caller identity and disclosure.");
      passedTests++;
    } else {
      console.error("  ❌ Failed JSON Inbound:", jsonInboundRes.body);
    }

    // ---------------------------------------------------------
    // TEST 3: Speech Processing - Grounded Order Inquiry
    // ---------------------------------------------------------
    console.log("\nTEST 3: Speech Processing executes grounded order lookup for caller");
    const speechRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/voice/process-speech?format=json",
      headers: { Accept: "application/json" },
      body: {
        CallSid: testCallSid,
        SpeechResult: "Where is my order ORD-1001?",
        From: "+919876543210",
      },
    });

    if (
      speechRes.statusCode === 200 &&
      speechRes.json?.success === true &&
      speechRes.json?.transferred === false &&
      speechRes.json?.reply.includes("Delhivery") &&
      speechRes.json?.reply.includes("ORD-1001")
    ) {
      console.log("  ✅ Passed: Caller received grounded tracking reply with carrier Delhivery.");
      passedTests++;
    } else {
      console.error("  ❌ Failed Speech Order Lookup:", speechRes.body);
    }

    // ---------------------------------------------------------
    // TEST 4: Multilingual Voice - Hindi/Hinglish Query
    // ---------------------------------------------------------
    console.log("\nTEST 4: Multilingual Voice handles Hindi/Hinglish speech queries accurately");
    const hindiSpeechRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/voice/process-speech?format=json",
      headers: { Accept: "application/json" },
      body: {
        CallSid: testCallSid,
        SpeechResult: "Mera order ORD-1001 kab deliver hoga",
        From: "+919876543210",
      },
    });

    if (
      hindiSpeechRes.statusCode === 200 &&
      hindiSpeechRes.json?.success === true &&
      (hindiSpeechRes.json?.reply.includes("Delhivery") || hindiSpeechRes.json?.reply.includes("ORD-1001"))
    ) {
      console.log("  ✅ Passed: Hinglish speech parsed and grounded response returned.");
      passedTests++;
    } else {
      console.error("  ❌ Failed Hinglish voice query:", hindiSpeechRes.body);
    }

    // ---------------------------------------------------------
    // TEST 5: DTMF '0' / Explicit Human Escalation Transfer
    // ---------------------------------------------------------
    console.log("\nTEST 5: DTMF '0' routes caller to human agent queue immediately");
    const dtmfRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/voice/process-speech?format=json",
      headers: { Accept: "application/json" },
      body: {
        CallSid: testCallSid,
        Digits: "0",
        From: "+919876543210",
      },
    });

    if (
      dtmfRes.statusCode === 200 &&
      dtmfRes.json?.transferred === true &&
      dtmfRes.json?.twiml.includes("<Dial")
    ) {
      console.log("  ✅ Passed: DTMF 0 triggered human agent transfer and issued <Dial> TwiML.");
      passedTests++;
    } else {
      console.error("  ❌ Failed DTMF 0 Transfer:", dtmfRes.body);
    }

    // ---------------------------------------------------------
    // TEST 6: Telephony Status Callback (Duration & Completion)
    // ---------------------------------------------------------
    console.log("\nTEST 6: Status Callback records call duration and marks session completed");
    const statusRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/voice/status-callback",
      body: {
        CallSid: testCallSid,
        CallDuration: "145",
        CallStatus: "completed",
      },
    });

    const callLogRecord = await CallLog.findOne({ callSid: testCallSid });

    if (
      statusRes.statusCode === 200 &&
      callLogRecord &&
      callLogRecord.duration === 145 &&
      callLogRecord.escalatedToAgent === true &&
      callLogRecord.transcript.length >= 3
    ) {
      console.log(
        `  ✅ Passed: CallLog persisted duration (145s), escalation state, and ${callLogRecord.transcript.length} transcript turns.`
      );
      passedTests++;
    } else {
      console.error("  ❌ Failed Status Callback or DB record:", statusRes.body, callLogRecord);
    }

    // ---------------------------------------------------------
    // TEST 7: Staff Management Endpoint RBAC & Transcript Audit
    // ---------------------------------------------------------
    console.log("\nTEST 7: Staff Call Logs Endpoint enforces RBAC and provides full transcript timeline");

    // 7a: Unauthenticated should fail (401)
    const noAuthRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/voice/logs",
    });

    // 7b: Customer should fail (403)
    const customerRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/voice/logs",
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    // 7c: Agent should succeed (200)
    const agentRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/voice/logs",
      headers: { Authorization: `Bearer ${agentToken}` },
    });

    const hasOurCall = agentRes.json?.data?.logs?.some((l: any) => l.callSid === testCallSid);

    if (
      noAuthRes.statusCode === 401 &&
      customerRes.statusCode === 403 &&
      agentRes.statusCode === 200 &&
      hasOurCall
    ) {
      console.log("  ✅ Passed: Unauth (401), Customer forbidden (403), Agent authorized (200) with complete call list.");
      passedTests++;
    } else {
      console.error(
        `  ❌ Failed RBAC: noAuth=${noAuthRes.statusCode}, cust=${customerRes.statusCode}, agent=${agentRes.statusCode}, foundCall=${hasOurCall}`
      );
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log("\n=======================================================");
  console.log(`   SCORECARD: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("=======================================================\n");

  if (passedTests === totalTests) {
    console.log("🎉 Phase 10 Voice Backend Integration is 100% verified!\n");
    process.exit(0);
  } else {
    console.error("💥 Some voice tests failed!");
    process.exit(1);
  }
};

runVoiceTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
