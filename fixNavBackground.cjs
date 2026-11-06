const fs = require('fs');

let content = fs.readFileSync('src/components/Nav.tsx', 'utf8');

// We want to change the return structure:
// From:
//   return (
//     <header ...>
//       <nav>...</nav>
//       <AnimatePresence>...</AnimatePresence>
//     </header>
//   );
// To:
//   return (
//     <>
//       <header className={`... ${open ? 'bg-ink-900 border-none' : ...}`}>...</header>
//       <AnimatePresence>...</AnimatePresence>
//     </>
//   );

// Wait, if we move the menu outside the header, the header still has its own background. 
// If the menu is z-50 and outside the header, we can just make the menu z-40 so the header sits on top,
// BUT if the header has `backdrop-blur-md` and `bg-ink-800/90`, it will look fine as long as we don't have transparency in the menu. 
// Actually, it's simpler:
// Just remove backdrop-blur-md and background when menu is open!

content = content.replace(
  "className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${\n        scrolled\n          ? 'bg-ink-800/90 backdrop-blur-md border-b border-foam/10 py-3'\n          : 'bg-transparent py-5'\n      }`}",
  "className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${\n        open\n          ? 'bg-ink-900 py-3' // No backdrop-blur so the fixed mobile menu covers the screen\n          : scrolled\n          ? 'bg-ink-800/90 backdrop-blur-md border-b border-foam/10 py-3'\n          : 'bg-transparent py-5'\n      }`}"
);

fs.writeFileSync('src/components/Nav.tsx', content, 'utf8');
