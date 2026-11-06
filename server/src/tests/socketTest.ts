import http from "http";
import { io as ClientSocket, Socket as ClientSocketType } from "socket.io-client";
import app from "../app.js";
import connectDB from "../config/db.js";
import { initSocketServer } from "../socket/socketServer.js";
import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";

interface MessagePayload {
  body: string;
  visibility?: string;
  [key: string]: unknown;
}

interface TypingPayload {
  ticketId: string;
  userName: string;
  userRole: string;
  isTyping: boolean;
}

export const runSocketTests = async (): Promise<void> => {
  console.log("===============================================================================");
  console.log("⚡ TESTING REAL-TIME SOCKET.IO & DUAL-VISIBILITY WEBSOCKET SUITE");
  console.log("===============================================================================\n");

  await connectDB();

  // Create ephemeral HTTP + Socket server
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, resolve);
  });

  const address = httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5000;
  const socketUrl = `http://localhost:${port}`;
  const baseUrl = `http://localhost:${port}/api/v1`;

  try {
    // 1. Unauthenticated Socket Connection Rejection Test
    console.log("--- TEST 1: Unauthenticated Socket Connection Rejection ---");
    const unauthSocket: ClientSocketType = ClientSocket(socketUrl, {
      auth: { token: "" },
      transports: ["websocket"],
      reconnection: false,
    });

    const unauthRejected = await new Promise<boolean>((resolve) => {
      unauthSocket.on("connect_error", (err: Error) => {
        console.log("Unauthenticated socket rejected successfully:", err.message);
        unauthSocket.disconnect();
        resolve(true);
      });
      unauthSocket.on("connect", () => {
        unauthSocket.disconnect();
        resolve(false);
      });
    });

    if (!unauthRejected) {
      throw new Error("SECURITY FAILURE: Unauthenticated socket was allowed to connect!");
    }

    // 2. Authenticated Logins
    console.log("\n--- TEST 2: Customer & Agent Authenticated Sockets ---");
    const custLogin = await (
      await fetch(baseUrl + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "customer@shopease.local", password: "Password123!" }),
      })
    ).json();
    const custToken = custLogin.token;

    const agentLogin = await (
      await fetch(baseUrl + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "agent@shopease.local", password: "Password123!" }),
      })
    ).json();
    const agentToken = agentLogin.token;

    // Connect Customer Socket
    const custSocket: ClientSocketType = ClientSocket(socketUrl, {
      auth: { token: custToken },
      transports: ["websocket"],
    });

    // Connect Agent Socket
    const agentSocket: ClientSocketType = ClientSocket(socketUrl, {
      auth: { token: agentToken },
      transports: ["websocket"],
    });

    await Promise.all([
      new Promise<void>((res) => custSocket.on("connect", () => res())),
      new Promise<void>((res) => agentSocket.on("connect", () => res())),
    ]);

    console.log("Customer socket connected (ID:", custSocket.id, ")");
    console.log("Agent socket connected (ID:", agentSocket.id, ")");

    // 3. Create Ticket and Join Room
    console.log("\n--- TEST 3: Room Joining & Ownership Verification ---");
    const ticketRes = await (
      await fetch(baseUrl + "/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + custToken,
        },
        body: JSON.stringify({
          subject: "Socket.IO Real-time Testing Ticket",
          category: "general",
          priority: "medium",
        }),
      })
    ).json();
    const testTicketId = ticketRes.ticket._id;

    custSocket.emit("ticket:join", { ticketId: testTicketId });
    agentSocket.emit("ticket:join", { ticketId: testTicketId });

    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log("Both customer and agent joined room for ticket:", testTicketId);

    // 4. Real-time Public Message Broadcast
    console.log("\n--- TEST 4: Real-time Public Message Broadcast ---");
    const publicMsgPromiseCust = new Promise<MessagePayload>((res) => {
      custSocket.on("message:new", (msg: MessagePayload) => res(msg));
    });
    const publicMsgPromiseAgent = new Promise<MessagePayload>((res) => {
      agentSocket.on("message:new", (msg: MessagePayload) => res(msg));
    });

    // Send public message via REST API
    await fetch(baseUrl + `/tickets/${testTicketId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + custToken,
      },
      body: JSON.stringify({
        body: "Hello! This is a live customer test message over WebSockets.",
        visibility: "customer",
      }),
    });

    const [receivedByCust, receivedByAgent] = await Promise.all([
      publicMsgPromiseCust,
      publicMsgPromiseAgent,
    ]);

    console.log("Customer received public message:", receivedByCust.body.slice(0, 30) + "...");
    console.log("Agent received public message:", receivedByAgent.body.slice(0, 30) + "...");

    // 5. CRITICAL DUAL-VISIBILITY SECURITY TEST
    console.log("\n--- TEST 5: [CRITICAL] Internal Staff Note Broadcast Barrier ---");
    let customerSawInternalNote = false;

    custSocket.on("message:new", (msg: MessagePayload) => {
      if (msg.visibility === "internal_note") {
        customerSawInternalNote = true;
      }
    });

    const agentInternalNotePromise = new Promise<MessagePayload>((res) => {
      agentSocket.on("message:new", (msg: MessagePayload) => {
        if (msg.visibility === "internal_note") res(msg);
      });
    });

    // Agent posts internal note
    await fetch(baseUrl + `/tickets/${testTicketId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + agentToken,
      },
      body: JSON.stringify({
        body: "CONFIDENTIAL_STAFF_NOTE: Checking customer history privately.",
        visibility: "internal_note",
      }),
    });

    const agentNote = await agentInternalNotePromise;
    console.log("Agent received internal note in real-time:", agentNote.body);

    // Wait a brief moment to ensure customer socket did not receive it
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("Did customer socket receive confidential note?:", customerSawInternalNote);

    if (customerSawInternalNote) {
      throw new Error("SECURITY BREACH: Customer socket received confidential internal note!");
    }

    // 6. Typing Indicators Test
    console.log("\n--- TEST 6: Real-time Typing Indicators ---");
    const typingPromise = new Promise<TypingPayload>((res) => {
      agentSocket.on("typing:update", (data: TypingPayload) => {
        if (data.isTyping) res(data);
      });
    });

    custSocket.emit("typing:start", { ticketId: testTicketId });
    const typingData = await typingPromise;
    console.log("Agent received typing update:", typingData.userName, "isTyping =", typingData.isTyping);

    // Cleanup
    custSocket.disconnect();
    agentSocket.disconnect();
    await Ticket.deleteOne({ _id: testTicketId });
    await Message.deleteMany({ ticketId: testTicketId });

    console.log("\n===============================================================================");
    console.log("🎉 ALL REAL-TIME SOCKET.IO & DUAL-VISIBILITY TESTS PASSED 100%!");
    console.log("===============================================================================\n");

    httpServer.close(() => process.exit(0));
  } catch (err) {
    console.error("TEST FAILED:", err);
    httpServer.close(() => process.exit(1));
  }
};

if (process.argv[1]?.includes("socketTest")) {
  runSocketTests();
}
