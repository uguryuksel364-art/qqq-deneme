const fs = require('fs');

let content = fs.readFileSync('src/components/OnBoard.tsx', 'utf8');

if (!content.includes('import { motion }')) {
  content = "import { motion } from 'motion/react';\n" + content;
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
  /<\/div>(\s*<div className="grid gap-px overflow-hidden rounded-2xl border border-foam\/10 bg-foam\/5 sm:grid-cols-2">)/,
  '</motion.div>$1'
);

content = content.replace(
  /<div\s+key={it\.numeral}/,
  `<motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              key={it.numeral}`
);

// We have 3 </div> tags to close the mapped items. 
// Wait, regex might fail or mismatch if we just replace </div>.
// We can use a simpler replacement.
content = content.replace(
  /(\s*)<\/div>\s*<\/div>\s*<\/div>(\s*)(\}\)\})\s*<\/div>/,
  '$1</div>$1</div>$1</motion.div>$2$3</div>'
);
// Above regex is risky. Let's just use `multi_edit_file` but from node it's easier.
// A better way: replace `</div>\n            </div>\n          ))}` with `</div>\n            </motion.div>\n          ))}`

content = content.replace('</div>\n            </div>\n          ))}', '</div>\n            </motion.div>\n          ))}');

fs.writeFileSync('src/components/OnBoard.tsx', content, 'utf8');
