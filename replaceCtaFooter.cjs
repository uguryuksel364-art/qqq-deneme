const fs = require('fs');

let content = fs.readFileSync('src/components/CtaFooter.tsx', 'utf8');

if (!content.includes('import { motion }')) {
  content = "import { motion } from 'motion/react';\n" + content;
}

content = content.replace(
  '<div className="py-24 text-center sm:py-32">',
  `<motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="py-24 text-center sm:py-32"
        >`
);
content = content.replace(
  /<\/div>\s*\{\/\* Footer info bar \*\/\}/,
  '</motion.div>\n        {/* Footer info bar */}'
);

fs.writeFileSync('src/components/CtaFooter.tsx', content, 'utf8');
