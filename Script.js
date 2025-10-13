// Variable global para almacenar las URLs de las imágenes
const imageURLs = {
  main: null,
  overlay1: null,
  overlay2: null,
  overlay3: null, // <--- ¡NUEVO! URL para el parche rectangular (Name Patch)
};

// MAPA DE URLS PARA LAS TABLAS DE AYUDA (¡CORREGIDAS A RAW.GITHUBUSERCONTENT!)
const helpImageMap = {
    Kid: 'https://raw.githubusercontent.com/dante766/Mipedido/816dd5da12184e48d728525f914ef1615f60d12a/kid.jpeg',
    Retro: 'https://raw.githubusercontent.com/dante766/Mipedido/816dd5da12184e48d728525f914ef1615f60d12a/retro.jpeg',
    Fan: 'https://raw.githubusercontent.com/dante766/Mipedido/816dd5da12184e48d728525f914ef1615f60d12a/fan.jpeg',
    Player: 'https://raw.githubusercontent.com/dante766/Mipedido/816dd5da12184e48d728525f914ef1615f60d12a/player.jpeg'
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
        // Se asegura de usar el span para todos los overlays
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
        // Se asegura de usar la imagen para todos los overlays
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
setupImageUpload("overlay-image-input-3", "overlay-frame-3", "No Name Patch", "overlay3"); // <--- ¡NUEVO!


// --- Lógica del Modal de Pedido (Pop-up) ---

const orderModal = document.getElementById('order-modal');
const closeButton = document.querySelector('.close-button');
const modalContent = document.getElementById('modal-content'); // Referencia al contenedor para la captura
const modalMainImagePlaceholder = document.getElementById('modal-main-image-placeholder');
const modalSize = document.getElementById('modal-size');
const modalVersion = document.getElementById('modal-version');
const modalName = document.getElementById('modal-name');
const modalNumber = document.getElementById('modal-number');

// REFERENCIAS A LOS CONTENEDORES DE NOMBRE Y NÚMERO
const modalNameGroup = document.getElementById('modal-name-group');
const modalNumberGroup = document.getElementById('modal-number-group');

const downloadButton = document.querySelector('.modal-confirm-button'); 

// Función para cerrar el modal de Pedido
function closeModal() {
    orderModal.style.display = 'none';
}

// Event listeners para cerrar el modal de Pedido
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === orderModal) {
        closeModal();
    }
});

// **FUNCIÓN PARA DESCARGAR LA IMAGEN (CON CORRECCIONES PARA html2canvas)**
function downloadImage() {
    // 1. Ocultar temporalmente los elementos que no deben aparecer en la imagen
    closeButton.style.display = 'none'; 
    downloadButton.style.display = 'none'; 
    
    // 2. Usar html2canvas para capturar el elemento 'modalContent'
    html2canvas(modalContent, {
        allowTaint: true, 
        useCORS: true, 
        scale: 4, // Aumenta la resolución
        scrollX: 0, // Fuerza a empezar la captura en X=0
        scrollY: 0 // Fuerza a empezar la captura en Y=0 (Solución para la compresión vertical)
    }).then(canvas => {
        // 3. Convertir el canvas a imagen JPG
        const imageURL = canvas.toDataURL('image/jpeg', 0.9);

        // 4. Crear un enlace temporal y forzar la descarga
        const link = document.createElement('a');
        link.href = imageURL;
        
        // Modificación del nombre por defecto
        const namePart = modalName.textContent && modalName.textContent !== "N/A" ? modalName.textContent : 'JERSEY';
        const numberPart = modalNumber.textContent && modalNumber.textContent !== "N/A" ? modalNumber.textContent : 'CUSTOM';
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


// Botón "Agregar Item" para mostrar el modal de Pedido
document.getElementById('add-item-button').addEventListener('click', () => {
    const size = document.getElementById('size-select').value;
    const version = document.getElementById('version-select').value;
    const name = document.getElementById('name-input').value.trim();
    const number = document.getElementById('number-input').value.trim();

    // 1. Mostrar detalles del pedido
    modalSize.textContent = size;
    modalVersion.textContent = version;
    
    // LÓGICA PARA OCULTAR GRUPOS DE DETALLES VACÍOS

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
    // FIN LÓGICA MODIFICADA


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

        // --- ¡NUEVO! LÓGICA PARA EL PARCHE RECTANGULAR DE NOMBRE ---
        if (imageURLs.overlay3) {
            const patch3 = document.createElement('img');
            patch3.src = imageURLs.overlay3;
            patch3.alt = 'Name Patch';
            patch3.className = 'patch-overlay';
            patch3.id = 'modal-patch-3'; // Usando el ID definido en el CSS
            modalMainImagePlaceholder.appendChild(patch3);
        }
        // --- FIN: LÓGICA PARA EL PARCHE RECTANGULAR DE NOMBRE ---
    }

    // 3. Mostrar el modal
    orderModal.style.display = 'block';

    console.log("--- Ver Pedido ---");
    console.log(`Talla: ${size}`);
    console.log(`Versión: ${version}`);
    console.log(`Nombre: ${name}`);
    console.log(`Número: ${number}`);
});


// --- Lógica del Modal de Ayuda (Pop-up) ---

const helpModal = document.getElementById('help-modal');
const closeHelpModalButton = document.getElementById('close-help-modal');
const helpModalTitle = document.getElementById('help-modal-title');
const helpImage = document.getElementById('help-image');
const helpButtons = document.querySelectorAll('.help-button');

// Función para cerrar el modal de Ayuda
function closeHelpModal() {
    helpModal.style.display = 'none';
}

// Event listeners para cerrar el modal de Ayuda
closeHelpModalButton.addEventListener('click', closeHelpModal);
window.addEventListener('click', (event) => {
    // Si se hace clic fuera del modal de ayuda, cerrarlo
    if (event.target === helpModal) {
        closeHelpModal();
    }
});

// Event listeners para los botones de ayuda
helpButtons.forEach(button => {
    button.addEventListener('click', () => {
        const version = button.getAttribute('data-version');
        const imageUrl = helpImageMap[version];
        
        // 1. Configurar y mostrar el modal
        helpModalTitle.textContent = `Tabla de Tallas - ${version}`;
        
        // La URL debe ser una URL de imagen directa
        if (imageUrl) {
            helpImage.src = imageUrl;
            helpImage.alt = `Tabla de Tallas Versión ${version}`;
        } else {
            // Muestra un marcador de posición si la URL no se encuentra
            helpImage.src = '';
            helpImage.alt = 'Imagen de tabla no disponible.';
        }

        helpModal.style.display = 'block';
    });
});
