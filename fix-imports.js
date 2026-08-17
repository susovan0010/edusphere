const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkDir(full);
    else if (file === 'route.ts') {
      let content = fs.readFileSync(full, 'utf8');
      const usesNextReq = content.includes('NextRequest') || content.includes('NextResponse');
      const hasImport = content.includes('next/server');
      if (usesNextReq && !hasImport) {
        content = content.replace(
          'export const dynamic = "force-dynamic";',
          'export const dynamic = "force-dynamic";\nimport { NextRequest, NextResponse } from "next/server";'
        );
        fs.writeFileSync(full, content, 'utf8');
        console.log('Fixed:', full);
      }
    }
  }
}
walkDir(path.join(process.cwd(), 'src', 'app', 'api'));
console.log('Done.');
