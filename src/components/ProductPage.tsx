import { ItemDetail } from '@matst80/slask-finder-sdk'
import { useLoaderData } from 'react-router-dom'
import { ItemDetails } from './ItemDetails'
import { Loader } from './Loader'

// type Props = {
//   isEdit?: boolean;
// };

export const ProductPage = () => {
  const details = useLoaderData() as ItemDetail | null

  return (
    <div className="container mx-auto px-4 py-8">
      {details ? <ItemDetails {...details} /> : <Loader size="md" />}
    </div>
  )
}
