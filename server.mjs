import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('site');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT)||3000;
createServer(async(req,res)=>{
  try{
    const raw=new URL(req.url||'/', 'http://localhost').pathname;
    const filename=resolve(root,'.'+decodeURIComponent(raw==='/'?'/index.html':raw));
    if(filename!==root&&!filename.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    const info=await stat(filename);
    if(!info.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'content-type':types[extname(filename)]||'application/octet-stream'});
    res.end(await readFile(filename));
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('Éclats d’Astria : http://localhost:'+port));
