import { Star } from 'lucide-react'
import React from 'react'

interface RatingsProps {
    rating: number
}
const Ratings: React.FC<RatingsProps> = ({ rating }) => {
    return (
        <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
                {Array.from({ length: Math.floor(rating) }).map((_, index) => (
                    <Star key={index} className='w-5 h-5 text-yellow-500 fill-yellow-500' />
                ))}
                {Array.from({ length: 5 - Math.floor(rating) }).map((_, index) => (
                    <Star key={index} className='w-5 h-5 text-yellow-500' />
                ))}
            </div>
        </div>
    )
}

export default Ratings