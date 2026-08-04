function Hero() {
  return (
    <section className="bg-emerald-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold">
          Buy, Sell & Earn with VendorHub
        </h1>

        <p className="mt-6 text-xl">
          Connect vendors, customers and affiliate marketers on one powerful platform.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold">
            Become a Vendor
          </button>

          <button className="border border-white px-6 py-3 rounded-lg">
            Become a Marketer
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;