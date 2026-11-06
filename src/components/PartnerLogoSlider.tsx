import { motion } from "motion/react";

const BRANDS = [
  "BODRUM LUXE",
  "MARINA ELITE",
  "VIP TRAVEL",
  "PREMIUM SERVICE",
  "BODRUM TRANSFER",
  "EXECUTIVE CARS",
  "BLUE EGE",
  "YALIKAVAK VIP",
];

export default function PartnerLogoSlider() {
  return (
    <div className="w-full bg-ink py-5 overflow-hidden border-none shadow-none">
      <div className="flex w-full items-center">
        <motion.div
          className="flex gap-12 sm:gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...BRANDS, ...BRANDS].map((brand, index) => (
            <span
              key={index}
              className="text-xs sm:text-sm font-medium text-foam/40 uppercase tracking-[0.25em] select-none no-underline border-none"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
