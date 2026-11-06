// Universal helper to smoothly scroll to any vehicle in the Fleet or Booking engine
export function scrollToVehicle(
  vehicleKey: string,
  targetSection: 'fleet' | 'booking' = 'fleet'
) {
  const vk = (vehicleKey || '').toLowerCase();
  let normalizedKey = 'maybach-design';
  let fleetId = 'fleet-maybach-executive';

  if (vk.includes('maybach')) {
    normalizedKey = 'maybach-design';
    fleetId = 'fleet-maybach-executive';
  } else if (vk.includes('premium') || vk.includes('vito')) {
    normalizedKey = 'premium-van';
    fleetId = 'fleet-premium-van';
  } else if (vk.includes('ultra')) {
    normalizedKey = 'ultra-vip-sprinter';
    fleetId = 'fleet-ultra-vip-sprinter';
  } else if (vk.includes('sprinter') || vk.includes('vip')) {
    normalizedKey = 'vip-sprinter';
    fleetId = 'fleet-vip-sprinter';
  }

  if (targetSection === 'fleet') {
    const filoSection = document.getElementById('filo');
    let el: HTMLElement | null = null;

    if (filoSection) {
      el =
        filoSection.querySelector(`[data-fleet-vehicle-key="${normalizedKey}"]`) ||
        filoSection.querySelector(`[data-vehicle-key="${normalizedKey}"]`) ||
        filoSection.querySelector(`[data-fleet-id*="${normalizedKey}"]`) ||
        document.getElementById(`fleet-card-${normalizedKey}`) ||
        document.getElementById(`fleet-card-${fleetId}`) ||
        filoSection.querySelector(`[id*="${fleetId}"]`) ||
        filoSection;
    } else {
      el = document.getElementById('filo');
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const targetTop = window.pageYOffset + rect.top - 80;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

      // Apply turquoise highlight animation to the fleet card
      const targetCard =
        el.id === 'filo'
          ? (filoSection?.querySelector(`[data-fleet-vehicle-key="${normalizedKey}"]`) as HTMLElement | null) || el
          : el;

      if (targetCard) {
        targetCard.classList.add('ring-4', 'ring-[#2dd4bf]', 'shadow-[0_0_40px_rgba(45,212,191,0.6)]', 'transition-all', 'duration-500');
        setTimeout(() => {
          targetCard.classList.remove('ring-4', 'ring-[#2dd4bf]', 'shadow-[0_0_40px_rgba(45,212,191,0.6)]');
        }, 2800);
      }
    }
  } else {
    // targetSection === 'booking'
    const el: HTMLElement | null =
      document.getElementById(`booking-vehicle-${normalizedKey}`) ||
      document.querySelector(`[data-vehicle-key="${normalizedKey}"]`) ||
      document.getElementById('vip-vehicles-selection');

    if (el) {
      const rect = el.getBoundingClientRect();
      const targetTop = window.pageYOffset + rect.top - 90;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

      // Apply highlight animation
      el.classList.add('ring-4', 'ring-[#2dd4bf]', 'shadow-[0_0_40px_rgba(45,212,191,0.6)]', 'transition-all', 'duration-500');
      setTimeout(() => {
        el?.classList.remove('ring-4', 'ring-[#2dd4bf]', 'shadow-[0_0_40px_rgba(45,212,191,0.6)]');
      }, 2800);
    }
  }
}
