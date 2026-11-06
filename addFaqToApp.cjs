const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import Faq from')) {
  content = content.replace("import OnBoard from '@/components/OnBoard';", "import OnBoard from '@/components/OnBoard';\nimport Faq from '@/components/Faq';");
  content = content.replace("<OnBoard />", "<OnBoard />\n        <Faq />");
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
