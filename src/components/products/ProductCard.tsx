interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

function ProductCard({
  name,
  description,
  price,
  stock,
  category,
}: ProductCardProps) {
  return (
    <div className="bg-white shadow rounded-xl p-5 mb-4">
      <h3 className="text-xl font-bold">{name}</h3>

      <p className="text-gray-600 mt-2">
        {description}
      </p>

      <p className="mt-2">
        <strong>Category:</strong> {category}
      </p>

      <p className="mt-1">
        <strong>Price:</strong> Le {price}
      </p>

      <p className="mt-1">
        <strong>Stock:</strong> {stock}
      </p>

      <div className="mt-4 flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Edit
        </button>

        <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
          Delete
        </button>
      </div>
    </div>
  );
}

export default ProductCard;