import test from 'node:test';import assert from 'node:assert/strict';import {createChatClient,ChatError} from '../sdk/chat-client.mjs';
const messages=[{role:'user',content:'hi'}];
const mock=(chunks,status=200)=>async()=>new Response(new ReadableStream({start(c){for(const x of chunks)c.enqueue(new TextEncoder().encode(x));c.close()}}),{status});
test('split SSE chunks',async()=>{const c=createChatClient({baseUrl:'https://example.test',fetchImpl:mock(['data: {"choices":[{"delta":{"content":"Hel','lo"}}]}\n','data: [DONE]\n'])});const a=[];for await(const x of c.stream(messages))a.push(x);assert.deepEqual(a,['Hello'])});
test('malformed lines ignored',async()=>{const c=createChatClient({baseUrl:'https://example.test',fetchImpl:mock([': ping\n','data: bad\n','data: {"choices":[{"delta":{"content":"ok"}}]}\n'])});const a=[];for await(const x of c.stream(messages))a.push(x);assert.deepEqual(a,['ok'])});
test('error status',async()=>{const c=createChatClient({baseUrl:'https://example.test',fetchImpl:mock([],401)});await assert.rejects(async()=>{for await(const x of c.stream(messages)){}},e=>e instanceof ChatError&&e.status===401)});
test('empty messages',async()=>{const c=createChatClient({baseUrl:'https://example.test',fetchImpl:mock([])});await assert.rejects(async()=>{for await(const x of c.stream([])){}},TypeError)});
test('invalid base url',()=>assert.throws(()=>createChatClient({baseUrl:'/relative'}),TypeError));
