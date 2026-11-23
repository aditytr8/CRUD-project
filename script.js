const API_URL = "https://dummyjson.com/products";

// VARIABEL GLOBAL

let products = [];
let editingProductId = null;

// 2. MENGAMBIL ELEMEN HTML

const productList = document.querySelector("#product-list");
const totalProducts = document.querySelector("#total-products");
const displayedProducts = document.querySelector("#displayed-products");
const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");

const productForm = document.querySelector("#product-form");
const productName = document.querySelector("#product-name");
const productPrice = document.querySelector("#product-price");
const productCategory = document.querySelector("#product-category");

const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit-button");

// 3. FUNGSI FETCH PRODUCTS (READ)

async function fetchProducts() {
  try {
    loadingMessage.textContent = "Memuat data produk...";
    errorMessage.textContent = "";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Gagal mengambil data produk.");
    }

    const data = await response.json();

    products = data.products;

    displayProducts(products);

    totalProducts.textContent = data.total;
    displayedProducts.textContent = products.length;

    loadingMessage.textContent = "";

    console.log("Data API berhasil diambil:", data);
  } catch (error) {
    loadingMessage.textContent = "";
    errorMessage.textContent = error.message;

    console.error("Error READ:", error);
  }
}

// 4. FUNGSI MENAMPILKAN PRODUK

function displayProducts(productData) {
  productList.innerHTML = "";

  if (productData.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "Tidak ada produk.";

    row.appendChild(cell);
    productList.appendChild(row);

    return;
  }

  productData.forEach((product) => {
    const row = document.createElement("tr");

    // ID
    const idCell = document.createElement("td");
    idCell.textContent = product.id;

    // Nama produk
    const nameCell = document.createElement("td");
    nameCell.textContent = product.title;

    // Harga
    const priceCell = document.createElement("td");

    priceCell.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(product.price);

    // Kategori
    const categoryCell = document.createElement("td");
    categoryCell.textContent = product.category;

    // Kolom aksi
    const actionCell = document.createElement("td");

    // Tombol Edit
    const editButton = document.createElement("button");

    editButton.textContent = "Edit";
    editButton.type = "button";
    editButton.classList.add("edit-button");
    editButton.dataset.id = product.id;

    // Tombol Hapus
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Hapus";
    deleteButton.type = "button";
    deleteButton.classList.add("delete-button");
    deleteButton.dataset.id = product.id;

    // Memasukkan tombol ke kolom aksi
    actionCell.append(editButton, deleteButton);

    // Memasukkan kolom ke baris
    row.append(idCell, nameCell, priceCell, categoryCell, actionCell);

    productList.appendChild(row);
  });
}

// 5. FUNGSI EDIT PRODUK

function editProduct(id) {
  const product = products.find((item) => item.id === id);

  if (!product) {
    errorMessage.textContent = "Produk tidak ditemukan.";
    return;
  }

  editingProductId = id;

  // Mengisi form
  productName.value = product.title;
  productPrice.value = product.price;
  productCategory.value = product.category;

  // Mengubah tampilan form
  document.querySelector(".form-section h2").textContent = "Edit Produk";

  submitButton.textContent = "Simpan Perubahan";
  cancelEditButton.hidden = false;

  errorMessage.textContent = "";

  document.querySelector(".form-section").scrollIntoView({
    behavior: "smooth",
  });
}

// 6. FUNGSI UPDATE PRODUK (PUT)

async function updateProduct(event) {
  event.preventDefault();

  const updatedProduct = {
    title: productName.value.trim(),
    price: Number(productPrice.value),
    category: productCategory.value.trim(),
  };

  // Validasi
  if (
    !updatedProduct.title ||
    !updatedProduct.category ||
    productPrice.value.trim() === "" ||
    !Number.isFinite(updatedProduct.price) ||
    updatedProduct.price < 0
  ) {
    errorMessage.textContent = "Mohon isi semua data dengan benar.";
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Memperbarui...";

    errorMessage.textContent = "";

    const response = await fetch(`${API_URL}/${editingProductId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) {
      throw new Error("Gagal memperbarui produk.");
    }

    const data = await response.json();

    console.log("Produk berhasil diperbarui:", data);

    // Memperbarui array lokal
    products = products.map((product) => {
      if (product.id === editingProductId) {
        return {
          ...product,
          ...data,
        };
      }

      return product;
    });

    // Memperbarui tabel
    displayProducts(products);

    // Mengembalikan form
    resetProductForm();

    alert("Produk berhasil diperbarui!");
  } catch (error) {
    errorMessage.textContent = error.message;
    console.error("Error UPDATE:", error);
  } finally {
    submitButton.disabled = false;

    submitButton.textContent =
      editingProductId !== null ? "Simpan Perubahan" : "Tambah Produk";
  }
}

// 7. FUNGSI CREATE PRODUK (POST)

// 7. FUNGSI DELETE PRODUK
async function deleteProduct(id) {
  // Konfirmasi sebelum menghapus
  const confirmDelete = confirm(
    "Apakah kamu yakin ingin menghapus produk ini?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    errorMessage.textContent = "";

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus produk.");
    }

    const data = await response.json();

    console.log("Produk berhasil dihapus:", data);

    // Menghapus produk dari array lokal
    products = products.filter((product) => product.id !== id);

    // Memperbarui tabel
    displayProducts(products);

    // Memperbarui jumlah produk
    totalProducts.textContent = Number(totalProducts.textContent) - 1;

    displayedProducts.textContent = products.length;

    // Jika produk yang dihapus sedang diedit,
    // kembalikan form ke kondisi awal
    if (editingProductId === id) {
      resetProductForm();
    }

    alert("Produk berhasil dihapus!");
  } catch (error) {
    errorMessage.textContent = error.message;
    console.error("Error DELETE:", error);
  }
}

async function createProduct(event) {
  event.preventDefault();

  const newProduct = {
    title: productName.value.trim(),
    price: Number(productPrice.value),
    category: productCategory.value.trim(),
  };

  // Validasi
  if (
    !newProduct.title ||
    !newProduct.category ||
    productPrice.value.trim() === "" ||
    !Number.isFinite(newProduct.price) ||
    newProduct.price < 0
  ) {
    errorMessage.textContent = "Mohon isi semua data dengan benar.";
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Menyimpan...";

    errorMessage.textContent = "";

    const response = await fetch(`${API_URL}/add`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      throw new Error("Gagal menambahkan produk.");
    }

    const data = await response.json();

    console.log("Produk berhasil ditambahkan:", data);

    // Menambahkan produk ke array lokal
    products.unshift(data);

    // Memperbarui tabel
    displayProducts(products);

    // Memperbarui jumlah produk
    totalProducts.textContent = Number(totalProducts.textContent) + 1;

    displayedProducts.textContent = products.length;

    // Mengosongkan form
    productForm.reset();

    alert("Produk berhasil ditambahkan!");
  } catch (error) {
    errorMessage.textContent = error.message;
    console.error("Error CREATE:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Tambah Produk";
  }
}

// 8. MENENTUKAN CREATE ATAU UPDATE

function handleProductSubmit(event) {
  if (editingProductId !== null) {
    updateProduct(event);
  } else {
    createProduct(event);
  }
}

// 9. RESET FORM

function resetProductForm() {
  productForm.reset();

  editingProductId = null;

  cancelEditButton.hidden = true;

  document.querySelector(".form-section h2").textContent = "Tambah Produk";

  submitButton.textContent = "Tambah Produk";

  errorMessage.textContent = "";
}

// 10. EVENT LISTENER

// Submit form
productForm.addEventListener("submit", handleProductSubmit);

// Klik tombol Batal
cancelEditButton.addEventListener("click", resetProductForm);

// Klik tombol Edit dan Hapus
productList.addEventListener("click", function (event) {
  // Jika tombol Edit diklik
  const editButton = event.target.closest(".edit-button");

  if (editButton) {
    const id = Number(editButton.dataset.id);
    editProduct(id);
    return;
  }

  // Jika tombol Hapus diklik
  const deleteButton = event.target.closest(".delete-button");

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);
    deleteProduct(id);
  }
});

// 11. MENJALANKAN APLIKASI

fetchProducts();
