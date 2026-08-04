interface StoreCardProps {
  name: string;
  description: string;
  category: string;
}

function StoreCard({
  name,
  description,
  category,
}: StoreCardProps) {
  return (
    <div className="bg-white shadow rounded-xl p-5 mb-4">
      <h3 className="text-xl font-bold">{name}</h3>

      <p className="text-gray-600 mt-2">{description}</p>

      <p className="text-emerald-600 mt-2 font-medium">
        Category: {category}
      </p>

      <button className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
        Manage Store
      </button>
    </div>
  );
}

export default StoreCard;