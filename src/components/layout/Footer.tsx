function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <h2 className="text-2xl font-bold text-emerald-500">
              VendorHub
            </h2>

            <p className="mt-4 text-gray-400">
              Connecting vendors and customers through one trusted marketplace.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-2 text-gray-400">
              <li>Home</li>
              <li>Stores</li>
              <li>Products</li>
              <li>Become a Vendor</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              Contact: +232 30180881
            </h3>

            <p className="mt-4 text-gray-400">
              Email: brodericknathaniel64@gmail.com
            </p>

            <p className="text-gray-400">
              Freetown, Sierra Leone
            </p>
          </div>

        </div>

        <hr className="my-8 border-gray-700" />

        <p className="text-center text-gray-500">
          © {new Date().getFullYear()} VendorHub. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;