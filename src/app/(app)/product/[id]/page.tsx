export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="font-serif text-2xl italic text-ink">Product {params.id}</h1>
    </div>
  );
}
