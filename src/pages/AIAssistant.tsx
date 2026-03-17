import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { analyzeInventoryWithAI } from "../services/ai";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

/** Parse markdown text and render tables as styled HTML tables */
function RichContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    // Detect markdown table (lines starting with |)
    if (lines[i].trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[\s\-:|]+\|/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      elements.push(renderTable(tableLines, elements.length));
      continue;
    }

    // Render non-table content with basic markdown formatting
    const line = lines[i];
    if (line.trim() === "") {
      elements.push(<div key={elements.length} className="h-2" />);
    } else if (line.trim().startsWith("### ")) {
      elements.push(<h3 key={elements.length} className="text-base font-bold text-slate-800 mt-3 mb-1">{formatInlineMarkdown(line.replace(/^###\s+/, ""))}</h3>);
    } else if (line.trim().startsWith("## ")) {
      elements.push(<h2 key={elements.length} className="text-lg font-bold text-slate-900 mt-4 mb-2">{formatInlineMarkdown(line.replace(/^##\s+/, ""))}</h2>);
    } else if (line.trim().startsWith("# ")) {
      elements.push(<h1 key={elements.length} className="text-xl font-bold text-slate-900 mt-4 mb-2">{formatInlineMarkdown(line.replace(/^#\s+/, ""))}</h1>);
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      elements.push(
        <div key={elements.length} className="flex gap-2 ml-2">
          <span className="text-emerald-500 mt-1">•</span>
          <span>{formatInlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</span>
        </div>
      );
    } else if (line.trim().match(/^\d+\.\s/)) {
      const num = line.trim().match(/^(\d+)\.\s/)?.[1];
      elements.push(
        <div key={elements.length} className="flex gap-2 ml-2">
          <span className="text-emerald-600 font-semibold min-w-[1.2rem]">{num}.</span>
          <span>{formatInlineMarkdown(line.replace(/^\s*\d+\.\s+/, ""))}</span>
        </div>
      );
    } else {
      elements.push(<p key={elements.length} className="leading-relaxed">{formatInlineMarkdown(line)}</p>);
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

function formatInlineMarkdown(text: string): React.ReactNode {
  // Replace **bold** and *italic* and `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch: { index: number; length: number; content: React.ReactNode } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      const candidate = { index: boldMatch.index, length: boldMatch[0].length, content: <strong key={key++} className="font-semibold text-slate-900">{boldMatch[1]}</strong> };
      if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
    }
    if (codeMatch && codeMatch.index !== undefined) {
      const candidate = { index: codeMatch.index, length: codeMatch[0].length, content: <code key={key++} className="bg-slate-100 text-emerald-700 px-1 py-0.5 rounded text-xs font-mono">{codeMatch[1]}</code> };
      if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
    }

    if (firstMatch) {
      if (firstMatch.index > 0) {
        parts.push(remaining.slice(0, firstMatch.index));
      }
      parts.push(firstMatch.content);
      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}

function renderTable(tableLines: string[], keyBase: number): React.ReactNode {
  const parseRow = (line: string) =>
    line.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1).map(cell => cell.trim());

  const headers = parseRow(tableLines[0]);
  // Skip separator line (index 1)
  const rows = tableLines.slice(2).map(parseRow);

  return (
    <div key={keyBase} className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-50 to-blue-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left font-semibold text-slate-700 border-b border-slate-200 whitespace-nowrap">
                {formatInlineMarkdown(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={`${rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-emerald-50/30 transition-colors`}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-slate-600 border-b border-slate-100 whitespace-nowrap">
                  {formatInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AIAssistant() {
  const { medicines, batches, transactions, categories } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Xin chào! Tôi là trợ lý AI quản lý kho y tế. Tôi có thể giúp bạn phân tích dữ liệu tồn kho, cảnh báo thuốc sắp hết hạn, hoặc gợi ý nhập hàng. Bạn cần tôi giúp gì hôm nay?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const contextData = {
        medicines: medicines.map(m => ({ id: m.id, name: m.name, minStock: m.minStock })),
        batches: batches.map(b => ({ medicineId: b.medicineId, quantity: b.quantity, expiryDate: b.expiryDate })),
        recentTransactions: transactions.slice(0, 10),
      };

      const response = await analyzeInventoryWithAI(contextData, userMessage.content);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `**Lỗi:** ${error.message}\n\nVui lòng kiểm tra lại API Key trong phần Cài đặt.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Phân tích các thuốc sắp hết hạn trong 3 tháng tới.",
    "Thuốc nào đang dưới mức tồn kho tối thiểu?",
    "Tóm tắt tình hình nhập xuất kho tuần qua.",
    "Gợi ý danh sách cần nhập thêm hàng."
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Trợ lý AI
          </h1>
          <p className="text-sm text-slate-500">Phân tích dữ liệu thông minh với Gemini AI.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-emerald-100 shadow-emerald-100/20">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none max-w-none"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <RichContent content={msg.content} />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI đang phân tích dữ liệu...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Hỏi AI về dữ liệu kho của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 focus-visible:ring-emerald-500"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
