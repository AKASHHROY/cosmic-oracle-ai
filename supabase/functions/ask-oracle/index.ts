// Secure, deliberately fail-closed Edge Function. No quota is consumed while chart engine is unavailable.
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import {z} from 'https://esm.sh/zod@3.23.8';
const Schema=z.object({chartId:z.string().uuid(),question:z.string().min(3).max(1000),language:z.enum(['en','hi','hinglish']),idempotencyKey:z.string().min(12).max(128)});
const allowed=(Deno.env.get('ALLOWED_ORIGINS')??'').split(',').map(s=>s.trim()).filter(Boolean);
function cors(req:Request):HeadersInit{const origin=req.headers.get('Origin')??'';return{'Content-Type':'application/json',...(allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{}),'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};}
function reply(req:Request,status:number,data:unknown){return new Response(JSON.stringify(data),{status,headers:cors(req)});}
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors(req)});if(req.method!=='POST')return reply(req,405,{error:'METHOD_NOT_ALLOWED'});try{
const auth=req.headers.get('Authorization');if(!auth)return reply(req,401,{error:'UNAUTHORIZED'});
const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY');if(!url||!anon)return reply(req,503,{error:'SERVER_NOT_CONFIGURED'});
let body:unknown;try{body=await req.json()}catch{return reply(req,400,{error:'INVALID_JSON'})}
const parsed=Schema.safeParse(body);if(!parsed.success)return reply(req,400,{error:'INVALID_REQUEST'});
const client=createClient(url,anon,{global:{headers:{Authorization:auth}}});const {data:user,error:userError}=await client.auth.getUser();if(userError||!user.user)return reply(req,401,{error:'UNAUTHORIZED'});
const {data:chart,error}=await client.from('birth_charts').select('id,subject_name').eq('id',parsed.data.chartId).single();if(error||!chart)return reply(req,403,{error:'CHART_NOT_FOUND'});
return reply(req,503,{error:'CHART_ENGINE_NOT_CONFIGURED',message:'Validated ephemeris and atomic quota reservation/commit must be configured before Oracle answers are enabled.'});
}catch(e){console.error('ask-oracle error',e);return reply(req,500,{error:'INTERNAL_ERROR'});}});
