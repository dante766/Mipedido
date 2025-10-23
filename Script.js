// Variable global para almacenar las URLs de las imágenes
const imageURLs = {
  main: null,
  back: null, // NUEVA URL PARA LA IMAGEN DEL DORSO
  overlay1: null,
  overlay2: null,
  dorsalRef: null, // URL para la referencia de tipografía/dorsal
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
  
  // Modificación para manejar main y back
  const isMainOrBackImage = (previewElementId === "main-preview-content" || previewElementId === "back-preview-content");
  
  // Determina el ID del contenedor padre para main/back
  const uploadAreaId = imageKey === 'main' ? 'main-upload-area' : 'back-upload-area';
  const uploadArea = document.getElementById(uploadAreaId);

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
      // Si se cancela la selección, limpiamos la URL
      imageURLs[imageKey] = null; 
      if (isMainOrBackImage) {
        // Genera el ID de la imagen: 'main-bg-image' o 'back-bg-image'
        const imgId = imageKey === 'main' ? 'main-bg-image' : 'back-bg-image'; 
        const imgElement = document.getElementById(imgId);
        if (imgElement) imgElement.remove();
        previewElement.style.display = 'flex';
      } else {
        previewElement.innerHTML = `<span>${defaultText}</span>`;
        if (imageKey === 'dorsalRef') {
           previewElement.style.display = 'flex';
        }
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      imageURLs[imageKey] = url; // Guarda la URL

      if (isMainOrBackImage) {
        // Genera el ID de la imagen: 'main-bg-image' o 'back-bg-image'
        const imgId = imageKey === 'main' ? 'main-bg-image' : 'back-bg-image'; 

        let imgElement = document.getElementById(imgId);
        if (!imgElement) {
          imgElement = document.createElement('img');
          imgElement.id = imgId;
          uploadArea.prepend(imgElement);
        }
        imgElement.src = url;
        previewElement.style.display = 'none';
      } else {
        previewElement.innerHTML = `<img src="${url}" alt="Imagen cargada">`;
        if (imageKey === 'dorsalRef') {
          previewElement.style.display = 'flex';
        }
      }
    };
    reader.readAsDataURL(file);
  });

  if (!isMainOrBackImage) {
    previewElement.addEventListener('click', () => {
      input.click();
    });
  }
}

// Inicialización de la subida de imágenes, ahora con claves para el objeto imageURLs
setupImageUpload("main-image-input", "main-preview-content", "Subí una imagen principal", "main");
setupImageUpload("back-image-input", "back-preview-content", "Upload Jersey", "back"); // INICIALIZACIÓN NUEVA IMAGEN DORSO
setupImageUpload("overlay-image-input-1", "overlay-frame-1", "No Patch", "overlay1");
setupImageUpload("overlay-image-input-2", "overlay-frame-2", "No Patch", "overlay2");
setupImageUpload("dorsal-image-input", "dorsal-frame", "Upload Dorsal Ref.", "dorsalRef");


// --- Lógica del Modal de Pedido (Pop-up) ---

const orderModal = document.getElementById('order-modal');
const closeButton = document.querySelector('.close-button');

// REFERENCIA AL CONTENIDO COMPLETO DEL MODAL PARA LA CAPTURA (¡CORREGIDO!)
const modalContent = document.getElementById('modal-content'); 

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

// **FUNCIÓN PARA DESCARGAR LA IMAGEN (SOLUCIÓN DORSAL/RECORTE - VERSIÓN FINAL)**
function downloadImage() {
    // Referencia al contenedor completo del modal
    const elementToCapture = document.getElementById('modal-content'); // <-- Elemento a capturar

    // 1. Ocultar temporalmente los elementos que no deben aparecer
    closeButton.style.display = 'none'; 
    downloadButton.style.display = 'none'; 
    
    // Deshabilitar el scroll del body temporalmente
    document.body.style.overflow = 'hidden';

    // 2. Usar html2canvas para capturar **TODO el contenido del modal**
    html2canvas(elementToCapture, { // <-- CAMBIO CLAVE: Capturar modal-content
        allowTaint: true, 
        useCORS: true, 
        scale: 4, // Buena resolución
        scrollX: 0, 
        scrollY: 0,
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
        
        // 5. Volver a mostrar los elementos ocultos y restaurar el scroll
        closeButton.style.display = 'block'; 
        downloadButton.style.display = 'block';
        
        // Restauramos el scroll del cuerpo
        document.body.style.overflow = '';
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
        modalNameGroup.style.display = 'none';
        modalName.textContent = "N/A"; 
    } else {
        modalNameGroup.style.display = 'block';
        modalName.textContent = name;
    }

    // Manejo de Número
    if (number === "") {
        modalNumberGroup.style.display = 'none';
        modalNumber.textContent = "N/A"; 
    } else {
        modalNumberGroup.style.display = 'block';
        modalNumber.textContent = number;
    }


    // 2. Manejar la visualización de la imagen
    modalMainImagePlaceholder.innerHTML = ''; // Limpia el contenido actual

    // --- NUEVO CONTENEDOR PARA LAS DOS IMÁGENES DENTRO DEL PLACEHOLDER ---
    const dualImageContainer = document.createElement('div');
    dualImageContainer.id = 'modal-dual-image-container'; // ID para estilos CSS
    modalMainImagePlaceholder.appendChild(dualImageContainer);
    // -----------------------------------------------------------------

    if (!imageURLs.main && !imageURLs.back) {
        // Si NINGUNA de las dos imágenes está cargada
        // Reemplazamos el dualImageContainer con el mensaje de error general
        modalMainImagePlaceholder.innerHTML = '<span>No Jerseys Cargados</span>'; 
    } else {
        // Si al menos una imagen está cargada, procedemos a construir
        
        // --- BLOQUE IMAGEN PRINCIPAL (FRONT) ---
        if (imageURLs.main) {
            const mainImageWrapper = document.createElement('div');
            mainImageWrapper.className = 'modal-image-wrapper'; 

            const mainImg = document.createElement('img');
            mainImg.src = imageURLs.main;
            mainImg.alt = 'Jersey Principal';
            mainImg.id = 'modal-main-bg-image'; 
            mainImageWrapper.appendChild(mainImg);

            // Patches
            if (imageURLs.overlay1) {
                const patch1 = document.createElement('img');
                patch1.src = imageURLs.overlay1;
                patch1.alt = 'Patch Right';
                patch1.className = 'patch-overlay';
                patch1.id = 'modal-patch-1';
                mainImageWrapper.appendChild(patch1);
            }
            if (imageURLs.overlay2) {
                const patch2 = document.createElement('img');
                patch2.src = imageURLs.overlay2;
                patch2.alt = 'Patch Left';
                patch2.className = 'patch-overlay';
                patch2.id = 'modal-patch-2';
                mainImageWrapper.appendChild(patch2);
            }

            // Cargar la imagen de la tipografía (Dorsal) Y SU ETIQUETA
            if (imageURLs.dorsalRef) {
                // 1. Contenedor del dorsal
                const dorsalRefContainer = document.createElement('div');
                dorsalRefContainer.className = 'dorsal-ref-overlay'; 
                
                const dorsalRefImg = document.createElement('img');
                dorsalRefImg.src = imageURLs.dorsalRef;
                dorsalRefImg.alt = 'Dorsal Reference';
                dorsalRefContainer.appendChild(dorsalRefImg);
                
                // 2. Etiqueta de texto
                const dorsalLabel = document.createElement('label'); 
                dorsalLabel.textContent = 'FONT EXAMPLE';
                dorsalLabel.className = 'dorsal-ref-label-modal'; 
                
                mainImageWrapper.appendChild(dorsalRefContainer); // Se añade al wrapper de la imagen principal
                mainImageWrapper.appendChild(dorsalLabel); 
            }
            dualImageContainer.appendChild(mainImageWrapper);
        } else {
            // Placeholder si no hay imagen principal
            const noMainPlaceholder = document.createElement('div');
            noMainPlaceholder.className = 'modal-image-wrapper no-image-placeholder';
            noMainPlaceholder.innerHTML = '<span>No Front Jersey</span>';
            dualImageContainer.appendChild(noMainPlaceholder);
        }

        // --- BLOQUE IMAGEN DORSO (BACK) ---
        if (imageURLs.back) {
            const backImageWrapper = document.createElement('div');
            backImageWrapper.className = 'modal-image-wrapper';

            const backImg = document.createElement('img');
            backImg.src = imageURLs.back;
            backImg.alt = 'Jersey Dorso';
            backImg.id = 'modal-back-bg-image'; 
            backImageWrapper.appendChild(backImg);
            dualImageContainer.appendChild(backImageWrapper);
        } else {
            // Placeholder si no hay imagen del dorso
            const noBackPlaceholder = document.createElement('div');
            noBackPlaceholder.className = 'modal-image-wrapper no-image-placeholder';
            noBackPlaceholder.innerHTML = '<span>No Back Jersey</span>';
            dualImageContainer.appendChild(noBackPlaceholder);
        }
    }

    // 3. Mostrar el modal
    orderModal.style.display = 'block';
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
        
        if (imageUrl) {
            helpImage.src = imageUrl;
            helpImage.alt = `Tabla de Tallas Versión ${version}`;
        } else {
            helpImage.src = '';
            helpImage.alt = 'Imagen de tabla no disponible.';
        }

        helpModal.style.display = 'block';
    });
});

// --- Lógica para forzar mayúsculas en el campo de Nombre (Name) ---
const nameInput = document.getElementById('name-input');

if (nameInput) {
    nameInput.addEventListener('input', function() {
        // Convierte el valor actual del input a mayúsculas
        this.value = this.value.toUpperCase();
    });
}
