const fs = require('fs');

let content = fs.readFileSync('src/components/Fleet.tsx', 'utf8');

if (!content.includes('import { motion }')) {
  content = content.replace(
    "import { useState, useEffect } from 'react';", 
    "import { useState, useEffect } from 'react';\nimport { motion } from 'motion/react';"
  );
}

content = content.replace(
  '<div className="mx-auto mb-16 max-w-2xl text-center">',
  `<motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >`
);
content = content.replace(
  /<\/div>(\s*<div className="grid gap-10 lg:grid-cols-3">)/,
  '</motion.div>$1'
);

content = content.replace(
  /<article\s+key={yacht\.id}/,
  `<motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                key={yacht.id}`
);
content = content.replace(/<\/article>/g, '</motion.article>');

fs.writeFileSync('src/components/Fleet.tsx', content, 'utf8');
