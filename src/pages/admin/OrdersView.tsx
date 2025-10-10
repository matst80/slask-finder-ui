import useSWR from 'swr'
import { toJson } from '../../lib/datalayer/api'
import { Order } from './order-types'
import { PriceValue } from '../../components/Price'

const OrderItem = ({ order }: { order: Order }) => {
  const { order_id, order_amount, status, billing_address } = order
  return (
    <tr>
      <td>{order_id}</td>
      <td>{billing_address.given_name}</td>
      <td>
        <PriceValue value={order_amount} />
      </td>
      <td>{status}</td>
    </tr>
  )
}

export const OrdersView = () => {
  const { data } = useSWR('/admin/orders', () =>
    fetch('/api/orders').then((res) => toJson<Order[]>(res)),
  )

  return (
    <div>
      <h1>Order Management</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Name</th>
            <th>Total Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((order) => (
            <OrderItem key={order.order_id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
