const fs = require('fs');

const transformFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('motion/react')) {
    content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { motion } from 'motion/react';");
    content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { motion } from 'motion/react';");
    if (!content.includes('import { motion }')) {
      content = "import { motion } from 'motion/react';\n" + content;
    }
  }

  // Very simple: replace main wrapper if possible, or just the first big div
  // But wait, it's better to manually edit the components since they have different structures.
};
