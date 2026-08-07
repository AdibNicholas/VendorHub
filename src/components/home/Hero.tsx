function Hero() {
  return (
    <section className="bg-emerald-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold">
          Welcome to VendorHub
        </h1>

        <p className="text-xl mt-6 max-w-3xl mx-auto">
          Discover trusted vendors, quality products, and amazing deals —
          all in one marketplace.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Shop Now
          </button>

          <button className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-700">
            Become a Vendor
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;