// Local test-only Vite wrapper. Production React components stay unchanged.
// Run: node tests/black-box/browser-fixture.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from '../../frontend/node_modules/vite/dist/node/index.js';
import react from '../../frontend/node_modules/@vitejs/plugin-react/dist/index.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const authStub = `
  export const AuthProvider = ({children}) => children;
  export const useAuth = () => ({user:{id:'qa-user',email:'qa@example.test'},profile:{id:'qa-user',role:'admin',is_paid:true},loading:false});
`;
const serviceStub = `
  export const supabase = { auth: {
    signUp: async () => ({error:{message:'QA registration stub reached; no account created'}}),
    signInWithPassword: async () => ({error:{message:'QA login stub reached; no account authenticated'}}),
    signOut: async () => ({error:null})
  }};
`;
const apiStub = `
  const course = {id:'qa-course',title:'QA fixture course',is_published:true};
  const api = {
    get: async url => {
      if(url.includes('/watch')) return {data:{id:'qa-video',title:'QA fixture lesson',description:'Synthetic data',youtube_url:new URLSearchParams(location.search).get('videoUrl')||'https://youtu.be/abcdefghijk'}};
      if(url.includes('/courses')) return {data:[course]};
      if(url.includes('/videos')) return {data:[]};
      throw new Error('Unexpected fixture read: '+url);
    },
    post: async () => {throw new Error('QA stub deliberately rejects all mutations');},
    put: async () => {throw new Error('QA stub deliberately rejects all mutations');},
    delete: async () => {throw new Error('QA stub deliberately rejects all mutations');}
  }; export default api;
`;
const server = await createServer({
  root: path.join(root, 'frontend'), configFile: false, envFile: false,
  plugins: [
    { name: 'black-box-isolated-dependencies', enforce: 'pre',
      load(id) {
        const normalized = id.replaceAll('\\', '/').split('?')[0];
        if (normalized.endsWith('/src/context/AuthContext.jsx')) return authStub;
        if (normalized.endsWith('/src/services/supabase.js')) return serviceStub;
        if (normalized.endsWith('/src/services/api.js')) return apiStub;
      },
      configureServer(vite) {
        vite.middlewares.use((req,res,next) => {
          // No remote resource requests, sockets, frames, or form submissions.
          res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:5178; img-src 'self' data:; frame-src 'none'; form-action 'none'; object-src 'none'");
          next();
        });
      }
    }, react()
  ],
  server: { host:'127.0.0.1', port:5178, strictPort:true, open:false },
});
await server.listen();
console.log('BLACK_BOX_FIXTURE_READY http://127.0.0.1:5178 (all service dependencies stubbed; iframe network blocked)');
process.on('SIGINT', async () => { await server.close(); process.exit(0); });
process.on('SIGTERM', async () => { await server.close(); process.exit(0); });
