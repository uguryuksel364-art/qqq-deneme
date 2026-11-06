const fs = require('fs');

let content = fs.readFileSync('src/components/Nav.tsx', 'utf8');

// Undo the previous change
content = content.replace(
  "className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${\n        open\n          ? 'bg-ink-900 py-3' // No backdrop-blur so the fixed mobile menu covers the screen\n          : scrolled\n          ? 'bg-ink-800/90 backdrop-blur-md border-b border-foam/10 py-3'\n          : 'bg-transparent py-5'\n      }`}",
  "className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${\n        open ? 'bg-ink-900 py-3 border-b border-foam/5' : scrolled\n          ? 'bg-ink-800/90 backdrop-blur-md border-b border-foam/10 py-3'\n          : 'bg-transparent py-5'\n      }`}"
);

// We need to change:
// return (
//   <header ...>
//     <nav ...>
//        ...
//     </nav>
//     <AnimatePresence>
//       ...
//     </AnimatePresence>
//   </header>
// );
//
// To:
// return (
//   <>
//     <header ...>
//       <nav ...>
//          ...
//       </nav>
//     </header>
//     <AnimatePresence>
//       ...
//     </AnimatePresence>
//   </>
// );

content = content.replace(
  '  return (\n    <header',
  '  return (\n    <>\n      <header'
);

content = content.replace(
  '      </nav>\n\n      {/* Mobile Full Screen Menu */}\n      <AnimatePresence>',
  '      </nav>\n    </header>\n\n    {/* Mobile Full Screen Menu */}\n    <AnimatePresence>'
);

content = content.replace(
  '        )}\n      </AnimatePresence>\n    </header>\n  );',
  '        )}\n      </AnimatePresence>\n    </>\n  );'
);

fs.writeFileSync('src/components/Nav.tsx', content, 'utf8');
