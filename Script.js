// Variable global para almacenar las URLs de las imágenes
const imageURLs = {
  main: null,
  overlay1: null,
  overlay2: null,
};

function setupImageUpload(inputId, previewElementId, defaultText, imageKey) {
  const input = document.getElementById(inputId);
  const previewElement = document.getElementById(previewElementId);
  const mainUploadArea = document.getElementById('main-upload-area');
  const isMainImage = (previewElementId === "main-preview-content");

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
      // Si se cancela la selección, limpiamos la URL
      imageURLs[imageKey] = null; 
      if (isMainImage) {
        const imgElement = document.getElementById('main-bg-image');
        if (imgElement) imgElement.remove();
        previewElement.style.display = 'flex';
      } else {
        previewElement.innerHTML = `<span>${defaultText}</span>`;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      imageURLs[imageKey] = url; // Guarda la URL

      if (isMainImage) {
        let imgElement = document.getElementById('main-bg-image');
        if (!imgElement) {
          imgElement = document.createElement('img');
          imgElement.id = 'main-bg-image';
          mainUploadArea.prepend(imgElement);
        }
        imgElement.src = url;
        previewElement.style.display = 'none';
      } else {
        previewElement.innerHTML = `<img src="${url}" alt="Imagen cargada">`;
      }
    };
    reader.readAsDataURL(file);
  });

  if (!isMainImage) {
    previewElement.addEventListener('click', () => {
      input.click();
    });
  }
}

// Inicialización de la subida de imágenes, ahora con claves para el objeto imageURLs
setupImageUpload("main-image-input", "main-preview-content", "Subí una imagen principal", "main");
setupImageUpload("overlay-image-input-1", "overlay-frame-1", "No Patch", "overlay1");
setupImageUpload("overlay-image-input-2", "overlay-frame-2", "No Patch", "overlay2");


// --- Lógica del Modal (Pop-up) ---

const orderModal = document.getElementById('order-modal');
const closeButton = document.querySelector('.close-button');
const modalContent = document.getElementById('modal-content'); // Referencia al contenedor para la captura (debe tener ID en HTML)
const modalMainImagePlaceholder = document.getElementById('modal-main-image-placeholder');
const modalSize = document.getElementById('modal-size');
const modalVersion = document.getElementById('modal-version');
const modalName = document.getElementById('modal-name');
const modalNumber = document.getElementById('modal-number');

// ⭐ NUEVAS REFERENCIAS A LOS CONTENEDORES DE NOMBRE Y NÚMERO
const modalNameGroup = document.getElementById('modal-name-group');
const modalNumberGroup = document.getElementById('modal-number-group');
// ⭐ FIN NUEVAS REFERENCIAS

const downloadButton = document.querySelector('.modal-confirm-button'); // Referencia al botón Descargar

// Función para cerrar el modal
function closeModal() {
    orderModal.style.display = 'none';
}

// Event listeners para cerrar el modal (botón X y clic fuera del modal)
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === orderModal) {
        closeModal();
    }
});

// **FUNCIÓN PARA DESCARGAR LA IMAGEN DEL MODAL**
function downloadImage() {
    // 1. Ocultar temporalmente los elementos que no deben aparecer en la imagen
    closeButton.style.display = 'none'; 
    downloadButton.style.display = 'none'; 
    
    // 2. Usar html2canvas para capturar el elemento 'modalContent'
    html2canvas(modalContent, {
        allowTaint: true, 
        useCORS: true, 
        scale: 2 
    }).then(canvas => {
        // 3. Convertir el canvas a imagen JPG
        const imageURL = canvas.toDataURL('image/jpeg', 0.9);

        // 4. Crear un enlace temporal y forzar la descarga
        const link = document.createElement('a');
        link.href = imageURL;
        // La lógica de nombre debe considerar que puede estar oculto, pero el textContent es 'N/A' si estaba vacío
        const namePart = modalName.textContent && modalName.textContent !== "N/A" ? modalName.textContent : 'SinNombre';
        const numberPart = modalNumber.textContent && modalNumber.textContent !== "N/A" ? modalNumber.textContent : 'SinNumero';
        link.download = `Pedido-${namePart}-${numberPart}.jpg`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 5. Volver a mostrar los elementos ocultos
        closeButton.style.display = 'block'; 
        downloadButton.style.display = 'block';
    });
}

// **Event Listener para el botón "Descargar"**
downloadButton.addEventListener('click', downloadImage);


// Botón "Agregar Item" para mostrar el modal
document.getElementById('add-item-button').addEventListener('click', () => {
    const size = document.getElementById('size-select').value;
    const version = document.getElementById('version-select').value;
    const name = document.getElementById('name-input').value.trim();
    const number = document.getElementById('number-input').value.trim();

    // 1. Mostrar detalles del pedido
    modalSize.textContent = size;
    modalVersion.textContent = version;
    
    // ⭐ LÓGICA MODIFICADA PARA OCULTAR GRUPOS DE DETALLES VACÍOS ⭐

    // Manejo de Nombre
    if (name === "") {
        // Si el nombre está vacío, oculta el párrafo completo
        modalNameGroup.style.display = 'none';
        modalName.textContent = "N/A"; 
    } else {
        // Si el nombre tiene contenido, muéstralo
        modalNameGroup.style.display = 'block';
        modalName.textContent = name;
    }

    // Manejo de Número
    if (number === "") {
        // Si el número está vacío, oculta el párrafo completo
        modalNumberGroup.style.display = 'none';
        modalNumber.textContent = "N/A"; 
    } else {
        // Si el número tiene contenido, muéstralo
        modalNumberGroup.style.display = 'block';
        modalNumber.textContent = number;
    }
    // ⭐ FIN LÓGICA MODIFICADA ⭐


    // 2. Manejar la visualización de la imagen
    modalMainImagePlaceholder.innerHTML = ''; // Limpia el contenido

    if (!imageURLs.main) {
        // Criterio: Si la imagen principal NO está cargada
        modalMainImagePlaceholder.innerHTML = '<span>No Jersey Cargado</span>';
    } else {
        // Criterio: Si la imagen principal SÍ está cargada
        const mainImg = document.createElement('img');
        mainImg.src = imageURLs.main;
        mainImg.alt = 'Jersey';
        mainImg.id = 'modal-bg-image';
        modalMainImagePlaceholder.appendChild(mainImg);
        
        // Criterio: Si tiene cargado los cuadraditos (Patchs)
        if (imageURLs.overlay1) {
            const patch1 = document.createElement('img');
            patch1.src = imageURLs.overlay1;
            patch1.alt = 'Patch Right';
            patch1.className = 'patch-overlay';
            patch1.id = 'modal-patch-1';
            modalMainImagePlaceholder.appendChild(patch1);
        }
        
        if (imageURLs.overlay2) {
            const patch2 = document.createElement('img');
            patch2.src = imageURLs.overlay2;
            patch2.alt = 'Patch Left';
            patch2.className = 'patch-overlay';
            patch2.id = 'modal-patch-2';
            modalMainImagePlaceholder.appendChild(patch2);
        }
    }

    // 3. Mostrar el modal
    orderModal.style.display = 'block';

    console.log("--- Ver Pedido ---");
    console.log(`Talla: ${size}`);
    console.log(`Versión: ${version}`);
    console.log(`Nombre: ${name}`);
    console.log(`Número: ${number}`);
});
