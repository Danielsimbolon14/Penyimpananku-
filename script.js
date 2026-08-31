// ============================================================
// PHOTO STORAGE
// ============================================================

// Alamat API server
// Nanti kita ubah sesuai alamat server yang kita gunakan.

const API_URL = "/api";


// ============================================================
// ELEMENT
// ============================================================

const photoInput = document.getElementById("photoInput");
const uploadButton = document.getElementById("uploadButton");
const gallery = document.getElementById("gallery");
const statusBox = document.getElementById("status");


// ============================================================
// SAAT HALAMAN DIBUKA
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadPhotos();

});


// ============================================================
// UPLOAD FOTO
// ============================================================

uploadButton.addEventListener("click", async () => {

    const files = photoInput.files;

    if (files.length === 0) {

        showStatus(
            "Silakan pilih foto terlebih dahulu.",
            "error"
        );

        return;
    }


    const formData = new FormData();


    // Masukkan semua foto ke FormData

    for (let i = 0; i < files.length; i++) {

        formData.append(
            "photos",
            files[i]
        );

    }


    showStatus(
        "Sedang mengupload foto...",
        "loading"
    );


    try {

        const response = await fetch(
            `${API_URL}/upload`,
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            throw new Error(
                "Upload gagal."
            );

        }


        const result = await response.json();


        console.log(
            "Upload berhasil:",
            result
        );


        showStatus(
            "Foto berhasil diupload.",
            "success"
        );


        // Kosongkan input

        photoInput.value = "";


        // Reload gallery

        loadPhotos();


    } catch (error) {

        console.error(error);


        showStatus(
            "Gagal mengupload foto.",
            "error"
        );

    }

});


// ============================================================
// LOAD FOTO
// ============================================================

async function loadPhotos() {

    try {

        const response = await fetch(
            `${API_URL}/photos`
        );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data foto."
            );

        }


        const photos = await response.json();


        displayPhotos(photos);


    } catch (error) {

        console.error(error);


        gallery.innerHTML = `

            <div class="empty">

                Tidak dapat mengambil data foto
                dari server.

            </div>

        `;

    }

}


// ============================================================
// DISPLAY FOTO
// ============================================================

function displayPhotos(photos) {

    gallery.innerHTML = "";


    if (!photos || photos.length === 0) {

        gallery.innerHTML = `

            <div class="empty">

                Belum ada foto.

            </div>

        `;

        return;

    }


    photos.forEach(photo => {

        const card =
            document.createElement("div");


        card.className =
            "photo-card";


        card.innerHTML = `

            <img
                src="${photo.url}"
                alt="${escapeHTML(photo.name)}"
                loading="lazy"
            >

            <div class="photo-info">

                <div class="photo-name">
                    ${escapeHTML(photo.name)}
                </div>

                <div class="photo-date">
                    ${formatDate(photo.created_at)}
                </div>

                <div class="actions">

                    <button
                        class="download-btn"
                        onclick="downloadPhoto(
                            '${photo.url}',
                            '${escapeHTML(photo.name)}'
                        )"
                    >
                        Download
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deletePhoto(
                            '${photo.id}'
                        )"
                    >
                        Hapus
                    </button>

                </div>

            </div>

        `;


        gallery.appendChild(card);

    });

}


// ============================================================
// DOWNLOAD FOTO
// ============================================================

async function downloadPhoto(url, filename) {

    try {

        const response =
            await fetch(url);


        const blob =
            await response.blob();


        const blobURL =
            window.URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href =
            blobURL;


        link.download =
            filename;


        document.body.appendChild(link);


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            blobURL
        );


    } catch (error) {

        console.error(error);


        // Jika browser tidak mengizinkan
        // download melalui fetch,
        // buka file langsung.

        window.open(
            url,
            "_blank"
        );

    }

}


// ============================================================
// DELETE FOTO
// ============================================================

async function deletePhoto(id) {

    const confirmDelete =
        confirm(
            "Apakah foto ini ingin dihapus?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/photos/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Gagal menghapus foto."
            );

        }


        loadPhotos();


        showStatus(
            "Foto berhasil dihapus.",
            "success"
        );


    } catch (error) {

        console.error(error);


        showStatus(
            "Gagal menghapus foto.",
            "error"
        );

    }

}


// ============================================================
// STATUS
// ============================================================

function showStatus(
    message,
    type
) {

    statusBox.style.display =
        "block";


    statusBox.textContent =
        message;


    if (type === "success") {

        statusBox.style.background =
            "#dcfce7";

        statusBox.style.color =
            "#166534";

    }


    if (type === "error") {

        statusBox.style.background =
            "#fee2e2";

        statusBox.style.color =
            "#991b1b";

    }


    if (type === "loading") {

        statusBox.style.background =
            "#e0f2fe";

        statusBox.style.color =
            "#075985";

    }

}


// ============================================================
// FORMAT TANGGAL
// ============================================================

function formatDate(date) {

    if (!date) {

        return "";

    }


    return new Date(date)
        .toLocaleString(
            "id-ID",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

}


// ============================================================
// SECURITY
// ============================================================

function escapeHTML(text) {

    if (!text) {

        return "";

    }


    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
