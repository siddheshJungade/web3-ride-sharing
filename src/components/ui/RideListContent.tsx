import React, { useEffect, useState } from 'react'
import RideDetails from './RideDetails'
import { useGetPendingRides } from '@/hook/solana'

interface RideListContentProps {
  isLoading: boolean
  error: any
  rides: any[]
}

const RideListContent: React.FC<RideListContentProps> = ({ isLoading, error, rides }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 2
  const [currentRides, setCurrentRides] = useState<any>([])
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    if(rides) {
      const currentRides = rides.slice(startIndex, endIndex)
      setCurrentRides(currentRides)
    }
  },[currentPage, rides])

  if (isLoading) return <div className='text-center'>Loading...</div>
  if (error) return <div className='text-center'>Error: {error.message}</div>
  if (!rides || rides.length === 0) return <div className='text-center'>No rides available</div>



  const totalPages = Math.ceil(rides.length / itemsPerPage)


  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className='w-[50vw]'>
      {currentRides && currentRides.map((ride: any) => (
        <RideDetails key={ride?.publicKey} localRide={ride} />
      ))}
      <div className='flex justify-between my-4 '>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
        >
          Previous
        </button>
        <span className='px-4 py-2'>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default RideListContent