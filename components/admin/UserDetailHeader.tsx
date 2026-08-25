export default function UserDetailHeader({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-blue-600 rounded text-white">
        <h2 className="text-lg">Total Order</h2>
        <p className="text-2xl font-bold">8</p>
      </div>

      <div className="p-4 bg-purple-600 rounded text-white">
        <h2 className="text-lg">Total Trade</h2>
        <p className="text-2xl font-bold">0</p>
      </div>

      <div className="p-4 bg-green-600 rounded text-white">
        <h2 className="text-lg">Total Deposit</h2>
        <p className="text-2xl font-bold">1</p>
      </div>

      <div className="p-4 bg-cyan-600 rounded text-white">
        <h2 className="text-lg">Transactions</h2>
        <p className="text-2xl font-bold">90</p>
      </div>
    </div>
  );
}
