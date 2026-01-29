// src/pages/api/chat.ts
import {convertToModelMessages, createGateway, smoothStream, streamText, type ToolSet, type UIMessage} from "ai";
import {z} from "zod";
import {openai} from "@ai-sdk/openai";

export const prerender = false;

const gateway = createGateway({
    apiKey: import.meta.env.AI_GATEWAY_API_KEY,
});

const uiMessagePartSchema = z.object({
    id: z.string().optional(),
    content: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    tools: z.array(z.unknown()).optional(),
});

export const chatSchema = z.object({
    id: z.string().optional(),
    trigger: z.string().optional(),
    messages: z.array(
        z.object({
            id: z.string(),
            role: z.enum(["system", "user", "assistant"]),
            parts: z.array(uiMessagePartSchema),
            metadata: z.record(z.string(), z.unknown()).optional(),
        })
    ),
});

export async function POST({request}: { request: Request }): Promise<Response> {
    const body = await request.json();
    const req = chatSchema.safeParse(body);
    if (!req.success) {
        console.error(req.error);
        return new Response(JSON.stringify({error: req.error.issues}), {
            status: 400,
            headers: {"Content-Type": "application/json"},
        });
    }

    const {messages, model, webSearch}: { messages: UIMessage[], model?: string, webSearch?: boolean } = body;

    let tools: ToolSet | undefined = undefined;
    if (webSearch) {
        tools = {
            web_search: openai.tools.webSearch({
                externalWebAccess: false, // using cached content for now
                searchContextSize: 'low',
            }),
        };
    }

    const result = streamText({
        model: gateway(model || 'gpt-4.1-mini'),
        messages: await convertToModelMessages(messages),
        tools,
        experimental_transform: smoothStream({
            delayInMs: 10, // optional: defaults to 10ms
            chunking: 'word', // optional: defaults to 'word'
        }),
    });

    return result.toUIMessageStreamResponse();
}


