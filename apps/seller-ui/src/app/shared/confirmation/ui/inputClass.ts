export const inputClass = (hasError?: boolean) =>
    `w-full h-11 px-4 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all
    focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
    ${hasError ? 'border-red-400 bg-red-50/30' : 'border-black/10'}`

export const labelClass = 'block text-xs font-medium text-[#666] mb-1.5 tracking-wide'
