interface ProductCardProps {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  onDelete: (id: string) => void;
  onEdit: (product: {
    id: string;
    store_id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    
  }) => void;
}
function ProductCard({
  id,
  store_id,
  name,
  description,
  price,
  stock,
  category,
  onDelete,
  onEdit,
}: ProductCardProps){
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
       <button
  onClick={() =>
onEdit({
  id,
  store_id,
  name,
  description,
  price,
  stock,
  category,
})
  }
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  Edit
</button>

        <button
  onClick={() => onDelete(id)}
  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
>
  Delete
</button>
      </div>
    </div>
  );
}

export default ProductCard;