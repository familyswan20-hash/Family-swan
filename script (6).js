let paginaActual = 0;

function abrirLibro() {

    document.getElementById("introLibro")
        .classList.add("abierto");

    actualizarPaginas();

}


function moverPagina(direccion) {

    const paginas =
        document.querySelectorAll(".pagina-libro");

    paginaActual = Math.max(
        0,
        Math.min(
            paginas.length - 1,
            paginaActual + direccion
        )
    );

    actualizarPaginas();

}


function actualizarPaginas() {

    const paginas =
        document.querySelectorAll(".pagina-libro");

    paginas.forEach((pagina, indice) => {

        pagina.classList.toggle(
            "activa",
            indice === paginaActual
        );

    });

    document.getElementById("contadorPaginas").textContent =
        "Página " + (paginaActual + 1) +
        " de " + paginas.length;

    document.getElementById("paginaAnterior").disabled =
        paginaActual === 0;

    document.getElementById("paginaSiguiente").disabled =
        paginaActual === paginas.length - 1;

}


function entrarFamilia() {

    document.getElementById("introLibro")
        .classList.add("oculto");

}


/* ===================================
   FIREBASE · SINCRONIZACIÓN SWAN
=================================== */
const firebaseConfig = {
  "apiKey": "AIzaSyDCZBXzxYTjSp9vVU2mWlBpl6TFROekrsw",
  "authDomain": "family-swan-6c481.firebaseapp.com",
  "projectId": "family-swan-6c481",
  "storageBucket": "family-swan-6c481.firebasestorage.app",
  "messagingSenderId": "1038673170914",
  "appId": "1:1038673170914:web:b130f2a3c41672a865e9bb"
};
const UID_CREADOR_SWAN = "eaMkQ8cBiIYOj9NH05rUT7wqUEa2";
let authSWAN = null;
let dbSWAN = null;
let functionsSWAN = null;
let storageSWAN = null;
let mapaSWAN = null;
let marcadoresMapaSWAN = [];
let usuarioFirebaseSWAN = null;
let sincronizacionActivaSWAN = false;
let temporizadoresGuardadoSWAN = {};
let suscripcionesSWAN = [];
let personalizacionSWAN = { temporada: "normal", principal: "#8b6547", fondo: "#f5f0e8", animaciones: true };
function aplicarPersonalizacionSWAN(config) {
  personalizacionSWAN = { ...personalizacionSWAN, ...(config || {}) };
  const temporada = personalizacionSWAN.temporada || "normal";
  document.body.dataset.temporada = temporada;
  const hoy = new Date(); const cumpleHoy = (integrantes || []).some(p => { const c=String(p.cumpleanos||"").trim(); if(!c)return false; const m=c.match(/^(\d{1,2})[\/.-](\d{1,2})/); return m && Number(m[1])===hoy.getDate() && Number(m[2])===hoy.getMonth()+1; });
  document.body.classList.toggle("cumple-familiar-swan", cumpleHoy);
  document.body.classList.toggle("sin-animaciones-swan", personalizacionSWAN.animaciones === false);
  document.documentElement.style.setProperty("--swan-acento-personal", personalizacionSWAN.principal || "#8b6547");
  document.documentElement.style.setProperty("--swan-fondo-personal", personalizacionSWAN.fondo || "#f5f0e8");
  let decor = document.getElementById("decoracionesTemporadaSWAN");
  if (!decor) { decor = document.createElement("div"); decor.id = "decoracionesTemporadaSWAN"; decor.setAttribute("aria-hidden", "true"); document.body.appendChild(decor); }
  decor.innerHTML = temporada === "halloween" ? '<span class="decor-swan decor-araña">🕷️</span><span class="decor-swan decor-calabaza">🎃</span><span class="decor-swan decor-telaraña">🕸️</span><div class="niebla-swan"></div>' : temporada === "navidad" ? '<span class="decor-swan decor-regalo">🎁</span><span class="decor-swan decor-arbol">🎄</span><div class="nieve-swan"></div>' : temporada === "primavera" ? '<span class="decor-swan decor-flor">🌸</span><span class="decor-swan decor-flor2">🌷</span>' : temporada === "anio-nuevo" ? '<span class="decor-swan decor-festivo">🎆 ✨ 🎇</span>' : temporada === "san-valentin" ? '<span class="decor-swan decor-amor">💗 💘 💞</span>' : "";
  const select = document.getElementById("temporadaSWAN"); if (select) select.value = temporada;
  const c1 = document.getElementById("colorPrincipalSWAN"); if (c1) c1.value = personalizacionSWAN.principal || "#8b6547";
  const c2 = document.getElementById("colorFondoSWAN"); if (c2) c2.value = personalizacionSWAN.fondo || "#f5f0e8";
  const anim = document.getElementById("animacionesSWAN"); if (anim) anim.checked = personalizacionSWAN.animaciones !== false;
}
async function guardarPersonalizacionSWAN() {
  if (rolActualSWAN !== "creador" || !dbSWAN) { alert("Solo el creador puede cambiar la apariencia."); return; }
  const config = { temporada: document.getElementById("temporadaSWAN").value, principal: document.getElementById("colorPrincipalSWAN").value, fondo: document.getElementById("colorFondoSWAN").value, animaciones: document.getElementById("animacionesSWAN").checked };
  try {
    await dbSWAN.collection("familySwan").doc("personalizacion").set({ datos: config, actualizado: firebase.firestore.FieldValue.serverTimestamp() });
    aplicarPersonalizacionSWAN(config); document.getElementById("estadoPersonalizacionSWAN").textContent = "✓ Personalización guardada y publicada para todos.";
  } catch (e) { console.error(e); document.getElementById("estadoPersonalizacionSWAN").textContent = "No se pudo guardar. Revisa las reglas de Firestore."; }
}
try {
  if (window.firebase && !firebase.apps.length) firebase.initializeApp(firebaseConfig);
  if (window.firebase) { authSWAN = firebase.auth(); dbSWAN = firebase.firestore(); functionsSWAN = firebase.app().functions("us-central1"); storageSWAN = firebase.storage(); }
} catch (error) { console.error("No se pudo iniciar Firebase:", error); }
function puedeEditarSWAN() {
  return !!(usuarioFirebaseSWAN && (usuarioFirebaseSWAN.uid === UID_CREADOR_SWAN || rolActualSWAN === "administrador" || rolActualSWAN === "fundador"));
}
function programarGuardadoNubeSWAN(tipo, datos) {
  if (!sincronizacionActivaSWAN || !dbSWAN || !puedeEditarSWAN()) return;
  clearTimeout(temporizadoresGuardadoSWAN[tipo]);
  temporizadoresGuardadoSWAN[tipo] = setTimeout(async () => {
    try {
      await dbSWAN.collection("familySwan").doc(tipo).set({ datos, actualizado: firebase.firestore.FieldValue.serverTimestamp() });
    } catch (error) {
      console.error("Error al sincronizar " + tipo, error);
      alert("No se pudo sincronizar " + tipo + ". Comprueba las reglas de Firestore.");
    }
  }, 500);
}
function aplicarDatosCompartidosSWAN(tipo, valor) {
  if (tipo === "integrantes" && Array.isArray(valor)) {
    integrantes = valor;
    localStorage.setItem("familySwanIntegrantes_v1", JSON.stringify(valor));
    cargarIntegrantes(); cargarArbol(); inicializarMapaFamiliaSWAN();
  }
  if (tipo === "eventos" && valor && typeof valor === "object") {
    eventos = valor;
    localStorage.setItem("familySwanEventos_v1", JSON.stringify(valor));
    mostrarCalendario(); cargarListaAdminEventos();
  }
  if (tipo === "galeria" && Array.isArray(valor)) {
    fotografias = valor;
    localStorage.setItem("familySwanGaleria_v1", JSON.stringify(valor));
    cargarGaleria();
  }
}
async function iniciarLecturaCompartidaSWAN() {
  if (!dbSWAN) return;
  try {
    sincronizacionActivaSWAN = false;
    suscripcionesSWAN.forEach(unsub => unsub()); suscripcionesSWAN = [];
    // Cualquier visitante puede leer el contenido publicado; solo las cuentas autorizadas pueden escribir.
    ["integrantes", "eventos", "galeria", "personalizacion"].forEach(tipo => {
      const unsub = dbSWAN.collection("familySwan").doc(tipo).onSnapshot(snapshot => {
        if (!snapshot.exists || !snapshot.data() || snapshot.data().datos === undefined) return;
        if (tipo === "personalizacion") aplicarPersonalizacionSWAN(snapshot.data().datos);
        else aplicarDatosCompartidosSWAN(tipo, snapshot.data().datos);
      }, error => console.error("No se pudo leer " + tipo + " desde Firestore:", error));
      suscripcionesSWAN.push(unsub);
    });
  } catch (error) { console.error("No se pudo iniciar la lectura compartida:", error); }
}
async function cargarDatosNubeSWAN() {
  if (!dbSWAN || !puedeEditarSWAN()) return;
  sincronizacionActivaSWAN = false;
  try {
    const tipos = ["integrantes", "eventos", "galeria"];
    const resultados = await Promise.all(tipos.map(tipo => dbSWAN.collection("familySwan").doc(tipo).get()));
    const locales = {
      integrantes: JSON.parse(localStorage.getItem("familySwanIntegrantes_v1") || "null"),
      eventos: JSON.parse(localStorage.getItem("familySwanEventos_v1") || "null"),
      galeria: JSON.parse(localStorage.getItem("familySwanGaleria_v1") || "null")
    };
    for (let i = 0; i < tipos.length; i++) {
      const tipo = tipos[i], doc = resultados[i];
      if (doc.exists && doc.data() && doc.data().datos !== undefined) {
        aplicarDatosCompartidosSWAN(tipo, doc.data().datos);
      } else {
        const inicial = locales[tipo] !== null ? locales[tipo] : (tipo === "integrantes" ? integrantes : tipo === "eventos" ? eventos : fotografias);
        await dbSWAN.collection("familySwan").doc(tipo).set({ datos: inicial, actualizado: firebase.firestore.FieldValue.serverTimestamp() });
        aplicarDatosCompartidosSWAN(tipo, inicial);
      }
    }
    integrantes.forEach(persona => { const r = relacionesInicialesSWAN[persona.nombre]; if (r) { if (!persona.padres) persona.padres = r.padres || ""; if (!persona.pareja) persona.pareja = r.pareja || ""; } });
    sincronizacionActivaSWAN = true;
    await iniciarLecturaCompartidaSWAN();
    sincronizacionActivaSWAN = true;
  } catch (error) {
    console.error("Error cargando datos de FAMILY SWAN:", error);
    alert("No se pudieron cargar los datos compartidos. Revisa las reglas de Firestore.");
  }
}
async function verificarRolSWAN(usuario) {
  if (usuario.uid === UID_CREADOR_SWAN) return { rol: "creador", nombre: "CREADOR" };
  const doc = await dbSWAN.collection("familySwanRoles").doc(usuario.uid).get();
  if (doc.exists && doc.data() && ["administrador", "fundador"].includes(doc.data().rol)) return { rol: doc.data().rol, nombre: doc.data().nombre || doc.data().usuario || "ADMINISTRADOR" };
  return null;
}

/* ===================================
   CALENDARIO
=================================== */

let fecha = new Date();
let mes = fecha.getMonth();
let anio = fecha.getFullYear();
const nombresMeses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const STORAGE_EVENTOS_SWAN = "familySwanEventos_v1";
let eventos = {};
try { eventos = JSON.parse(localStorage.getItem(STORAGE_EVENTOS_SWAN) || "{}"); } catch (error) { eventos = {}; }

function guardarEventos() {
    try { localStorage.setItem(STORAGE_EVENTOS_SWAN, JSON.stringify(eventos)); programarGuardadoNubeSWAN("eventos", eventos); }
    catch (error) { alert("No se pudieron guardar los eventos en este navegador."); }
}
function fechaClaveLocal(fechaObj) {
    return fechaObj.getFullYear()+"-"+String(fechaObj.getMonth()+1).padStart(2,"0")+"-"+String(fechaObj.getDate()).padStart(2,"0");
}
function obtenerCumpleanos(persona) {
    const texto = String(persona.cumpleanos || "").trim().toLocaleLowerCase("es");
    if (!texto) return null;
    const meses = {enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
    let m = texto.match(/(\d{1,2})\s*(?:de\s*)?([a-záéíóú]+)/i);
    if (m && meses[m[2].normalize("NFD").replace(/[\u0300-\u036f]/g,"")]) {
        return {dia:Number(m[1]), mes:meses[m[2].normalize("NFD").replace(/[\u0300-\u036f]/g,"")]-1};
    }
    m = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return {dia:Number(m[3]), mes:Number(m[2])-1};
    m = texto.match(/^(\d{1,2})[/-](\d{1,2})$/);
    if (m) return {dia:Number(m[1]), mes:Number(m[2])-1};
    return null;
}
function colorFavoritoHex(valor) {
    const texto=String(valor||"").toLocaleLowerCase("es");
    if(/^#[0-9a-f]{6}$/i.test(texto)) return texto;
    const colores=[
        [/púrpura|purpura|morado|violeta/,"#8e5bb7"], [/azul/,"#3978c8"], [/verde fosforescente|neón|neon/,"#72d63b"], [/verde/,"#4b9b63"],
        [/rosa|rosado/,"#e78ab5"], [/rojo|roja/,"#d94b4b"], [/amarillo/,"#e6c344"], [/naranja|anaranjado/,"#e58a3a"],
        [/negro/,"#444047"], [/blanco/,"#e9e5dc"], [/café|cafe|marrón|marron/,"#986642"], [/gris|plateado/,"#929292"]
    ];
    const encontrado=colores.find(([exp])=>exp.test(texto));
    return encontrado?encontrado[1]:"#b58a62";
}

function obtenerEventosFecha(clave) {
    const propios = Array.isArray(eventos[clave]) ? eventos[clave] : [];
    const [year, month, day] = clave.split("-").map(Number);
    const cumpleanos = (typeof integrantes !== "undefined" ? integrantes : []).filter(p => {
        const cumple = obtenerCumpleanos(p);
        return cumple && cumple.dia === day && cumple.mes === month-1;
    }).map(p => ({nombre:"Cumpleaños de " + p.nombre, descripcion:"¡Hoy celebramos el cumpleaños de " + p.nombre + "!", tipo:"cumple", automatico:true, color:colorFavoritoHex(p.colorFavorito)}));
    return [...cumpleanos, ...propios];
}
function mostrarCalendario() {
    const primerDia = new Date(anio,mes,1).getDay();
    const cantidadDias = new Date(anio,mes+1,0).getDate();
    document.getElementById("mesActual").textContent = nombresMeses[mes] + " " + anio;
    const calendario = document.getElementById("diasCalendario");
    calendario.innerHTML = "";
    for(let i=0;i<primerDia;i++) { const espacio=document.createElement("div"); espacio.className="dia vacio"; calendario.appendChild(espacio); }
    for(let dia=1;dia<=cantidadDias;dia++) {
        const casilla=document.createElement("button"); casilla.type="button"; casilla.className="dia";
        const numero=document.createElement("span"); numero.textContent=dia; casilla.appendChild(numero);
        const fechaClave=anio+"-"+String(mes+1).padStart(2,"0")+"-"+String(dia).padStart(2,"0");
        if(dia===fecha.getDate() && mes===fecha.getMonth() && anio===fecha.getFullYear()) casilla.classList.add("hoy");
        const acontecimientos=obtenerEventosFecha(fechaClave);
        if(acontecimientos.length) {
            casilla.classList.add("tiene-evento");
            const marcadores=document.createElement("div"); marcadores.className="marcadores";
            acontecimientos.forEach(ev=>{ const punto=document.createElement("i"); punto.className="punto "+(ev.tipo==="cumple"?"cumple":"reunion"); if(ev.color)punto.style.backgroundColor=ev.color; marcadores.appendChild(punto); });
            casilla.appendChild(marcadores);
        }
        casilla.onclick=()=>mostrarEventos(fechaClave,dia);
        calendario.appendChild(casilla);
    }
}
function cambiarMes(cantidad) {
    mes+=cantidad; if(mes>11){mes=0;anio++;} if(mes<0){mes=11;anio--;}
    mostrarCalendario();
    document.getElementById("listaEventos").textContent="Selecciona una fecha para ver sus acontecimientos.";
    document.getElementById("tituloEventos").textContent="Eventos del mes";
}
function mostrarEventos(fechaClave,dia) {
    const lista=document.getElementById("listaEventos");
    document.getElementById("tituloEventos").textContent="Eventos del "+dia+" de "+nombresMeses[mes];
    lista.innerHTML="";
    const acontecimientos=obtenerEventosFecha(fechaClave);
    if(!acontecimientos.length){lista.textContent="No hay acontecimientos para esta fecha.";return;}
    acontecimientos.forEach(ev=>{
        const elemento=document.createElement("div"); elemento.className="evento";
        const etiqueta=document.createElement("strong");
        etiqueta.textContent=ev.tipo==="cumple"?"🎂 Cumpleaños":(ev.tipo==="importante"?"✦ Fecha importante":"🤎 Reunión");
        const nombre=document.createElement("div"); nombre.textContent=ev.nombre;
        if(ev.color) elemento.style.setProperty("--color-evento", ev.color);
        elemento.append(etiqueta,nombre);
        if(ev.descripcion){const descripcion=document.createElement("p");descripcion.textContent=ev.descripcion;elemento.appendChild(descripcion);}
        lista.appendChild(elemento);
    });
}
function guardarEventoAdmin(event) {
    event.preventDefault();
    const clave=document.getElementById("eventoFecha").value;
    if(!clave)return;
    const nuevo={id:Date.now().toString(),nombre:document.getElementById("eventoNombre").value.trim(),tipo:document.getElementById("eventoTipo").value,descripcion:document.getElementById("eventoDescripcion").value.trim(),color:document.getElementById("eventoColor").value};
    if(!nuevo.nombre || !nuevo.descripcion)return;
    if(!Array.isArray(eventos[clave]))eventos[clave]=[];
    eventos[clave].push(nuevo); guardarEventos(); document.getElementById("formEventoAdmin").reset();
    cargarListaAdminEventos(); mostrarCalendario();
    const [y,m,d]=clave.split("-").map(Number);
    if(y===anio && m-1===mes)mostrarEventos(clave,d);
    alert("Fecha guardada en el calendario.");
}
function cargarListaAdminEventos() {
    const lista=document.getElementById("listaAdminEventos"); if(!lista)return; lista.innerHTML="";
    Object.keys(eventos).sort().forEach(clave=>(eventos[clave]||[]).forEach((ev,indice)=>{
        const fila=document.createElement("div");fila.className="evento-admin-fila";
        const texto=document.createElement("span");texto.textContent=clave+" · "+ev.nombre;
        const eliminar=document.createElement("button");eliminar.type="button";eliminar.textContent="Eliminar";
        eliminar.onclick=()=>{if(!confirm("¿Eliminar esta fecha del calendario?"))return;eventos[clave].splice(indice,1);if(!eventos[clave].length)delete eventos[clave];guardarEventos();cargarListaAdminEventos();mostrarCalendario();};
        fila.append(texto,eliminar);lista.appendChild(fila);
    }));
}
function actualizarEstadoCampanita() {
    const boton = document.getElementById("campanitaNotificaciones");
    const estado = document.getElementById("estadoCampanita");
    if (!boton || !estado) return;
    const activada = "Notification" in window && Notification.permission === "granted" && localStorage.getItem("familySwanNotificaciones") === "si";
    boton.classList.toggle("activada", activada);
    boton.title = activada ? "Notificaciones activadas" : "Activar notificaciones";
    boton.setAttribute("aria-label", boton.title);
}
function activarNotificaciones() {
    if (!("Notification" in window)) { alert("Este navegador no permite notificaciones."); return; }
    if (Notification.permission === "denied") { alert("Las notificaciones están bloqueadas en el navegador. Puedes permitirlas desde los ajustes del sitio."); return; }
    Notification.requestPermission().then(permiso => {
        if (permiso === "granted") {
            localStorage.setItem("familySwanNotificaciones", "si");
            actualizarEstadoCampanita();
            alert("¡Campanita activada! Recibirás avisos de cumpleaños y fechas importantes cuando FAMILY SWAN esté abierto.");
            revisarNotificacionesEventos();
        } else { alert("No se concedió el permiso para mostrar notificaciones."); actualizarEstadoCampanita(); }
    });
}
function revisarNotificacionesEventos() {
    actualizarEstadoCampanita();
    if (!("Notification" in window) || Notification.permission !== "granted" || localStorage.getItem("familySwanNotificaciones") !== "si") return;
    const hoy = fechaClaveLocal(new Date());
    const delDia = obtenerEventosFecha(hoy);
    if (!delDia.length) return;
    const llave = "familySwanAviso_" + hoy;
    if (localStorage.getItem(llave) === "si") return;
    new Notification("FAMILY SWAN · Hoy hay una fecha especial", { body: delDia.map(e => e.nombre).join(" · ") });
    localStorage.setItem(llave, "si");
}

/* ===================================
   INTEGRANTES DE LA FAMILIA
=================================== */

/*
  Para poner una fotografía escribe su archivo
  en la propiedad foto.

  Ejemplo: foto:"jover.jpg"
*/

let integrantes = [

    {
        nombre:"Jomer",
        relacion:"Abuelo · Primera generación",
        descripcion:"Es el abuelo y la raíz de esta familia.",
        edad:"19",
        nombreRoblox:"Jomer_SRF (ABALAM_DLM)",
        cumpleanos:"28 de marzo",
        colorFavorito:"Púrpura",
        animalFavorito:"Perros",
        foto:""
    },

    {
        nombre:"Eduardo",
        relacion:"Integrante de la familia",
        descripcion:"Forma parte de FAMILY SWAN.",
        edad:"26",
        padres:"No especificados",
        hijos:"No tiene",
        nombreRoblox:"lalorm00",
        cumpleanos:"23 de febrero",
        colorFavorito:"Verde fosforescente",
        animalFavorito:"Ave picozapato y perros",
        foto:""
    },

    {
        nombre:"Zack",
        relacion:"Novio de Jocelin",
        descripcion:"Es el novio de Jocelin.",
        edad:"18",
        nombreRoblox:"0xyzvt",
        cumpleanos:"17 de marzo",
        colorFavorito:"Azul y morado",
        animalFavorito:"Ninguno",
        foto:""
    },

    {
        nombre:"Lei",
        relacion:"Hijo de Jomer",
        descripcion:"Hijo de Jomer y padre de Zia.",
        foto:""
    },

    {
        nombre:"Jan",
        relacion:"Hija de Jomer",
        descripcion:"Hija de Jomer y madre de siete hijos.",
        foto:""
    },

    {
        nombre:"Zia",
        relacion:"Hija de Lei",
        descripcion:"Forma parte de la familia por la rama de Lei.",
        foto:""
    },

    {
        nombre:"Kiari (Valen)",
        relacion:"Hija de Jan",
        descripcion:"Esposa de Angel y madre de Alejandro y Kevin.",
        edad:"19",
        padres:"Jan",
        hijos:"Kevin y Alejandro",
        nombreRoblox:"Valentinaa_swan",
        cumpleanos:"5 de enero",
        colorFavorito:"Negro y rosa",
        animalFavorito:"Conejito",
        foto:""
    },

    {
        nombre:"Angel",
        relacion:"Esposo de Kiari",
        descripcion:"Esposo de Kiari y padre de Alejandro y Kevin.",
        foto:""
    },

    {
        nombre:"Alejandro",
        relacion:"Hijo de Kiari y Angel",
        descripcion:"Forma parte de la siguiente generación familiar.",
        foto:""
    },

    {
        nombre:"Kevin",
        relacion:"Hijo de Kiari y Angel",
        descripcion:"Forma parte de la siguiente generación familiar.",
        foto:""
    },

    {
        nombre:"Jocelin",
        relacion:"Hija de Jan",
        descripcion:"Madre de Cherry y novia de Zack.",
        edad:"19",
        padres:"Jan",
        hijos:"1",
        nombreRoblox:"yodelin1233",
        cumpleanos:"22 de agosto",
        colorFavorito:"Negro y morado",
        animalFavorito:"Todos",
        foto:"jocelin.jpg"
    },

    {
        nombre:"Cherry",
        relacion:"Hija de Jocelin",
        descripcion:"Esposa de Angel Suguro y madre de Dafne.",
        foto:""
    },

    {
        nombre:"Angel Suguro",
        relacion:"Esposo de Cherry",
        descripcion:"Esposo de Cherry y padre de Dafne.",
        foto:""
    },

    {
        nombre:"Yamileth (Dafne)",
        relacion:"Hija de Cherry y Angel Suguro",
        descripcion:"Forma parte de la siguiente generación familiar.",
        edad:"15",
        padres:"Cherry y Angel",
        nombreRoblox:"dafne",
        cumpleanos:"21 de diciembre",
        colorFavorito:"Morado",
        animalFavorito:"Gato",
        foto:""
    },

    {
        nombre:"Nat",
        relacion:"Hija de Jan",
        descripcion:"Hija de Jan.",
        foto:""
    },

    {
        nombre:"Ale",
        relacion:"Hijo de Jan",
        descripcion:"Padre de Yess y Nahomi.",
        foto:""
    },

    {
        nombre:"Yess",
        relacion:"Hija de Ale",
        descripcion:"Forma parte de la siguiente generación familiar.",
        foto:""
    },

    {
        nombre:"Nahomi",
        relacion:"Hija de Ale",
        descripcion:"Forma parte de la siguiente generación familiar.",
        foto:""
    },

    {
        nombre:"Nathan",
        relacion:"Hijo de Jan",
        descripcion:"Hijo de Jan.",
        foto:""
    },

    {
        nombre:"Lalo",
        relacion:"Hijo de Jan",
        descripcion:"Hijo de Jan.",
        foto:""
    },

    {
        nombre:"Juan",
        relacion:"Hijo de Jan",
        descripcion:"Padre de Amelia.",
        edad:"17",
        padres:"Jan (el otro progenitor no especificado)",
        hijos:"Amelia",
        nombreRoblox:"juancapa70",
        cumpleanos:"9 de abril",
        colorFavorito:"Azul y negro",
        animalFavorito:"Conejo y gato",
        foto:"juan.jpg"
    },

    {
        nombre:"Amelia",
        relacion:"Hija de Juan",
        descripcion:"Madre de Cele.",
        foto:""
    },

    {
        nombre:"Cele",
        relacion:"Hija de Amelia",
        descripcion:"Forma parte de la siguiente generación familiar.",
        foto:""
    }

];

// Relaciones iniciales del árbol. El editor puede cambiarlas después.
const relacionesInicialesSWAN = {
    "Lei": { padres: "Jomer" }, "Jan": { padres: "Jomer" },
    "Zia": { padres: "Lei" }, "Kiari (Valen)": { padres: "Jan", pareja: "Angel" },
    "Angel": { pareja: "Kiari (Valen)" }, "Alejandro": { padres: "Kiari (Valen), Angel" },
    "Kevin": { padres: "Kiari (Valen), Angel" }, "Jocelin": { padres: "Jan", pareja: "Zack" },
    "Zack": { pareja: "Jocelin" }, "Cherry": { padres: "Jocelin", pareja: "Angel Suguro" },
    "Angel Suguro": { pareja: "Cherry" }, "Yamileth (Dafne)": { padres: "Cherry, Angel Suguro" },
    "Nat": { padres: "Jan" }, "Ale": { padres: "Jan" }, "Yess": { padres: "Ale" },
    "Nahomi": { padres: "Ale" }, "Nathan": { padres: "Jan" }, "Lalo": { padres: "Jan" },
    "Juan": { padres: "Jan" }, "Amelia": { padres: "Juan" }, "Cele": { padres: "Amelia" }
};
integrantes.forEach(persona => {
    const relacion = relacionesInicialesSWAN[persona.nombre];
    if (relacion) {
        if (!persona.padres) persona.padres = relacion.padres || "";
        if (!persona.pareja) persona.pareja = relacion.pareja || "";
    }
});

// Los cambios del administrador se conservan en este navegador.
// Accesos locales: una contraseña para el creador y hasta cinco administradores.
const STORAGE_ROLES_SWAN = "familySwanRoles_v1";
let rolesSWAN = { creador: "SWAN2026", administradores: [] };
try {
    const rolesGuardados = JSON.parse(localStorage.getItem(STORAGE_ROLES_SWAN) || "null");
    if (rolesGuardados && typeof rolesGuardados.creador === "string" && Array.isArray(rolesGuardados.administradores)) rolesSWAN = rolesGuardados;
} catch (error) { console.warn("No se pudieron cargar los accesos SWAN.", error); }
function guardarRolesSWAN() {
    try { localStorage.setItem(STORAGE_ROLES_SWAN, JSON.stringify(rolesSWAN)); return true; }
    catch (error) { alert("No se pudieron guardar los accesos en este navegador."); return false; }
}
const STORAGE_INTEGRANTES_SWAN = "familySwanIntegrantes_v1";
try {
    const guardados = localStorage.getItem(STORAGE_INTEGRANTES_SWAN);
    if (guardados) {
        const datos = JSON.parse(guardados);
        if (Array.isArray(datos)) integrantes = datos;
    }
} catch (error) {
    console.warn("No se pudieron cargar los integrantes guardados.", error);
}
// Asegura que las relaciones iniciales también se apliquen a datos guardados de versiones anteriores.
integrantes.forEach(persona => {
    const relacion = relacionesInicialesSWAN[persona.nombre];
    if (relacion) {
        if (!persona.padres) persona.padres = relacion.padres || "";
        if (!persona.pareja) persona.pareja = relacion.pareja || "";
    }
});

function guardarIntegrantesEnNavegador() {
    try {
        localStorage.setItem(STORAGE_INTEGRANTES_SWAN, JSON.stringify(integrantes));
        programarGuardadoNubeSWAN("integrantes", integrantes);
    } catch (error) {
        alert("No se pudieron guardar los cambios en este navegador.");
    }
}

/* ===================================
   MOSTRAR INTEGRANTES
=================================== */

function resolverFotoSWAN(foto) {
    if (typeof foto === "string" && foto.startsWith("galeria:")) {
        const indice = Number(foto.slice(8));
        return fotografias[indice] || "";
    }
    return foto || "";
}
function cargarIntegrantes() {

    const contenedor =
        document.getElementById("integrantesGrid");

    contenedor.innerHTML = "";

    integrantes.forEach((persona,index)=>{

        const tarjeta = document.createElement("article");

        tarjeta.className = "integrante";

        const imagenContenedor =
            document.createElement("div");

        imagenContenedor.className = "integrante-imagen";

        const placeholder = document.createElement("div");

        placeholder.className = "placeholder";

        placeholder.textContent = "♡";

        imagenContenedor.appendChild(placeholder);

        if(persona.foto) {

            const imagen = document.createElement("img");

            imagen.src = resolverFotoSWAN(persona.foto);
            imagen.style.objectPosition = `${persona.fotoX ?? 50}% ${persona.fotoY ?? 50}%`;
            imagen.alt = persona.nombre;

            imagen.onerror = function() {
                this.style.display = "none";
                placeholder.style.display = "flex";
            };

            placeholder.style.display = "none";

            imagenContenedor.appendChild(imagen);

        }

        const informacion = document.createElement("div");

        informacion.className = "integrante-info";

        const nombre = document.createElement("h3");

        nombre.textContent = persona.nombre;

        const relacion = document.createElement("p");

        relacion.textContent = persona.relacion;

        informacion.appendChild(nombre);

        informacion.appendChild(relacion);

        tarjeta.appendChild(imagenContenedor);

        tarjeta.appendChild(informacion);

        tarjeta.onclick = ()=>abrirIntegrante(index);

        contenedor.appendChild(tarjeta);

    });

}

function abrirIntegrante(index) {

    const persona = integrantes[index];

    document.getElementById("modalNombre").textContent =
        persona.nombre;

    document.getElementById("modalRelacion").textContent =
        persona.relacion;
    const fotoModal=document.getElementById("modalFotoIntegrante"); const srcModal=persona.foto?resolverFotoSWAN(persona.foto):""; fotoModal.src=srcModal; fotoModal.hidden=!srcModal;
    document.getElementById("modalBanderaIntegrante").textContent=banderaPaisSWAN(persona.pais);

    const detalles = [
        persona.descripcion,
        persona.edad ? "Edad: " + persona.edad : "",
        persona.padres ? "Papás: " + persona.padres : "",
        persona.hijos ? "Hijos: " + persona.hijos : "",
        persona.nombreRoblox ? "Nombre de Roblox: " + persona.nombreRoblox : "",
        persona.cumpleanos ? "Cumpleaños: " + persona.cumpleanos : "",
        persona.colorFavorito ? "Color favorito: " + persona.colorFavorito : "",
        persona.animalFavorito ? "Animal favorito: " + persona.animalFavorito : "",
        persona.pais ? "País: " + persona.pais : "",
        persona.ubicacion ? "Ubicación pública: " + persona.ubicacion : ""
    ].filter(Boolean).join("\n\n");

    document.getElementById("modalDescripcion").textContent = detalles;
    document.getElementById("modalDescripcion").style.whiteSpace = "pre-line";

    document.getElementById("modalIntegrante").style.display =
        "flex";

}


/* ===================================
   DATOS DEL ARBOL GENEALOGICO
=================================== */

function normalizarNombreArbol(nombre) {
    return String(nombre || "").trim().toLocaleLowerCase("es");
}

function construirArbolFamilia() {
    const nodos=integrantes.map(persona=>({nombre:persona.nombre,relacion:persona.relacion||"Integrante de la familia",foto:persona.foto||"",pareja:persona.pareja||"",hijos:[]}));
    const porNombre=new Map(nodos.map(n=>[normalizarNombreArbol(n.nombre),n]));
    // Convierte "Pareja de X" escrito en el campo Padres o pareja en una relación de pareja real.
    integrantes.forEach(persona=>{
        const texto=String(persona.padres||"").trim();
        const match=texto.match(/^pareja\s+de\s+(.+)$/i);
        if(match){persona.pareja=match[1].trim();persona.padres="";}
    });
    nodos.forEach(nodo=>{
        const original=integrantes.find(p=>normalizarNombreArbol(p.nombre)===normalizarNombreArbol(nodo.nombre));
        nodo.pareja=original?.pareja||nodo.pareja;
        if(nodo.pareja){
            const pareja=porNombre.get(normalizarNombreArbol(nodo.pareja));
            if(pareja && !pareja.pareja)pareja.pareja=nodo.nombre;
        }
        const padres=String(original?.padres||"").split(",").map(x=>x.trim()).filter(Boolean);
        padres.forEach(nombrePadre=>{
            const padre=porNombre.get(normalizarNombreArbol(nombrePadre));
            if(padre && padre!==nodo && !padre.hijos.includes(nodo))padre.hijos.push(nodo);
        });
    });
    const conPadres=new Set();
    integrantes.forEach(persona=>{if(String(persona.padres||"").trim())conPadres.add(normalizarNombreArbol(persona.nombre));});
    return nodos.filter(nodo=>!conPadres.has(normalizarNombreArbol(nodo.nombre)) && !nodos.some(otro=>normalizarNombreArbol(otro.pareja)===normalizarNombreArbol(nodo.nombre)));
}

/* ===================================
   RAMAS ABIERTAS
=================================== */

/*
  Al principio no hay ninguna rama abierta.
  Solo aparece JOMER.
*/

const ramasAbiertas = new Set();


/* ===================================
   CREAR TARJETA CIRCULAR
=================================== */

function crearTarjetaArbol(persona,esRaiz=false) {

    const boton = document.createElement("button");

    boton.className = "arbol-persona";

    if(esRaiz) {
        boton.classList.add("arbol-raiz");
    }

    boton.type = "button";

    const circulo = document.createElement("div");

    circulo.className = "arbol-foto";

    /*
      Primero busca la foto en los datos del árbol.
      Si no existe, la busca en los integrantes.
    */

    const integrante = integrantes.find(p =>
        p.nombre.toUpperCase() === persona.nombre.toUpperCase() ||
        p.nombre.toUpperCase().startsWith(persona.nombre.toUpperCase()) ||
        persona.nombre.toUpperCase().startsWith(p.nombre.toUpperCase())
    );

    const foto = resolverFotoSWAN(persona.foto || (integrante ? integrante.foto : ""));

    if(foto) {

        const imagen = document.createElement("img");

        imagen.src = foto;

        imagen.alt = persona.nombre;

        imagen.onerror = function() {

            circulo.innerHTML = "";

            const inicial = document.createElement("span");

            inicial.className = "arbol-inicial";

            inicial.textContent = persona.nombre.charAt(0);

            circulo.appendChild(inicial);

        };

        circulo.appendChild(imagen);

    } else {

        const inicial = document.createElement("span");

        inicial.className = "arbol-inicial";

        inicial.textContent = persona.nombre.charAt(0);

        circulo.appendChild(inicial);

    }

    const nombre = document.createElement("span");

    nombre.className = "arbol-nombre";

    nombre.textContent = persona.nombre;

    const relacion = document.createElement("span");

    relacion.className = "arbol-relacion";

    relacion.textContent = persona.relacion || "";

    boton.appendChild(circulo);

    boton.appendChild(nombre);

    boton.appendChild(relacion);

    if(persona.hijos && persona.hijos.length>0) {

        const indicador = document.createElement("span");

        indicador.className = "arbol-indicador";

        indicador.textContent =
            ramasAbiertas.has(persona.nombre)
            ? "▲ Ocultar rama"
            : "▼ Ver descendencia";

        boton.appendChild(indicador);

    }

    /* AL PRESIONAR SE ABRE O SE CIERRA LA RAMA */

    boton.onclick = function() {

        if(!persona.hijos || persona.hijos.length===0) {
            return;
        }

        if(ramasAbiertas.has(persona.nombre)) {

            ramasAbiertas.delete(persona.nombre);

            /* También cierra sus descendientes */

            function cerrarDescendientes(personas) {

                personas.forEach(hijo=>{

                    ramasAbiertas.delete(hijo.nombre);

                    if(hijo.hijos) {
                        cerrarDescendientes(hijo.hijos);
                    }

                });

            }

            cerrarDescendientes(persona.hijos);

        } else {

            ramasAbiertas.add(persona.nombre);

        }

        cargarArbol();

    };

    return boton;

}


/* ===================================
   CONSTRUIR RAMAS
=================================== */

function crearRamaArbol(persona,esRaiz=false) {

    const rama = document.createElement("div");
    rama.className = "arbol-rama";

    /*
      La pareja solo se muestra cuando se abre la descendencia.
      Mientras la rama está cerrada, aparece únicamente la persona.
    */
    const ramaAbierta = ramasAbiertas.has(persona.nombre);

    if(persona.pareja && ramaAbierta) {
        const parejaContenedor = document.createElement("div");
        parejaContenedor.className = "arbol-pareja-contenedor";
        parejaContenedor.appendChild(crearTarjetaArbol(persona,esRaiz));

        const datosPareja = integrantes.find(p =>
            p.nombre.toUpperCase() === persona.pareja.toUpperCase() ||
            p.nombre.toUpperCase().startsWith(persona.pareja.toUpperCase())
        );
        const pareja = {
            nombre: persona.pareja,
            relacion: datosPareja ? datosPareja.relacion : "Pareja de " + persona.nombre,
            foto: datosPareja ? datosPareja.foto : ""
        };
        const tarjetaPareja = crearTarjetaArbol(pareja,false);
        tarjetaPareja.classList.add("arbol-tarjeta-pareja");
        parejaContenedor.appendChild(tarjetaPareja);
        rama.appendChild(parejaContenedor);
    } else {
        rama.appendChild(crearTarjetaArbol(persona,esRaiz));
    }

    if(
        persona.hijos &&
        persona.hijos.length>0 &&
        ramasAbiertas.has(persona.nombre)
    ) {
        const contenedorHijos = document.createElement("div");
        contenedorHijos.className = "arbol-ramas";

        persona.hijos.forEach(hijo=>{
            const columna = document.createElement("div");
            columna.className = "arbol-rama-hijo";
            columna.appendChild(crearRamaArbol(hijo));
            contenedorHijos.appendChild(columna);
        });

        rama.appendChild(contenedorHijos);
    }

    return rama;
}


/* ===================================
   DIBUJAR ARBOL COMPLETO
=================================== */

function cargarArbol() {

    const contenedor =
        document.getElementById("arbolGenealogico");

    contenedor.innerHTML = "";

    const raices = construirArbolFamilia();
    if (!raices.length) {
        contenedor.textContent = "Agrega integrantes y asigna sus padres para construir el árbol.";
        return;
    }
    raices.forEach((raiz, indice) => {
        contenedor.appendChild(crearRamaArbol(raiz, indice === 0));
    });

}


/* ===================================
   GALERIA DE RECUERDOS
=================================== */

/*
  Coloca aquí los nombres de tus fotografías.
  Deben estar en la misma carpeta de index.html.
*/

const STORAGE_GALERIA_SWAN = "familySwanGaleria_v1";
let fotografias = [
    "recuerdo1.jpg", "recuerdo2.jpg", "recuerdo3.jpg", "recuerdo4.jpg",
    "recuerdo5.jpg", "recuerdo6.jpg", "recuerdo7.jpg", "recuerdo8.jpg"
];
try {
    const guardadas = localStorage.getItem(STORAGE_GALERIA_SWAN);
    if (guardadas) fotografias = JSON.parse(guardadas);
} catch (error) { console.warn("No se pudo cargar la galería guardada.", error); }

function guardarGaleria() {
    try { localStorage.setItem(STORAGE_GALERIA_SWAN, JSON.stringify(fotografias)); programarGuardadoNubeSWAN("galeria", fotografias); }
    catch (error) { alert("El almacenamiento del navegador está lleno. Prueba con imágenes más pequeñas."); }
}

function editarFotoGaleriaSWAN(index){
 const foto=fotografias[index]; if(!foto)return; const modal=document.createElement("div");modal.className="editor-foto-overlay";modal.innerHTML=`<div class="editor-foto-caja"><button class="editor-foto-cerrar" aria-label="Cerrar">×</button><h3>Editar encuadre</h3><img class="editor-foto-preview" src="${foto}" alt="Vista previa"><label>Zoom <input type="range" min="100" max="250" value="100" class="editor-zoom"></label><label>Posición horizontal <input type="range" min="0" max="100" value="50" class="editor-x"></label><label>Posición vertical <input type="range" min="0" max="100" value="50" class="editor-y"></label><button class="admin-accion editor-foto-guardar">Guardar encuadre</button></div>`;document.body.appendChild(modal);const img=modal.querySelector("img");const update=()=>{img.style.objectFit="cover";img.style.objectPosition=`${modal.querySelector(".editor-x").value}% ${modal.querySelector(".editor-y").value}%`;img.style.transform=`scale(${modal.querySelector(".editor-zoom").value/100})`;};modal.querySelectorAll("input").forEach(i=>i.addEventListener("input",update));update();modal.querySelector(".editor-foto-cerrar").onclick=()=>modal.remove();modal.querySelector(".editor-foto-guardar").onclick=()=>{alert("Este ajuste es una vista de encuadre. Para conservarlo permanentemente, sube la imagen recortada o edita el encuadre en un editor de imágenes.");modal.remove();};
}
function cargarGaleria() {
    const contenedor = document.getElementById("galeriaGrid");
    contenedor.innerHTML = "";
    fotografias.forEach((archivo, index) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "foto-galeria";
        const imagen = document.createElement("img");
        imagen.src = archivo;
        imagen.alt = "Recuerdo familiar " + (index + 1);
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = "♡";
        imagen.onerror = function() { this.style.display = "none"; placeholder.style.display = "flex"; };
        tarjeta.append(imagen, placeholder);
        const ampliar=document.createElement("button");ampliar.type="button";ampliar.className="galeria-ampliar";ampliar.textContent="⌕";ampliar.title="Ampliar fotografía";ampliar.onclick=e=>{e.stopPropagation();document.getElementById("imagenAmpliada").src=archivo;document.getElementById("modalFoto").style.display="flex";};tarjeta.appendChild(ampliar);
        if (modoAdministrador) {
            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.className = "eliminar-foto-admin";
            eliminar.textContent = "×";
            eliminar.title = "Eliminar recuerdo";
            eliminar.onclick = event => {
                event.stopPropagation();
                if (!confirm("¿Eliminar esta imagen de la galería?")) return;
                fotografias.splice(index, 1);
                guardarGaleria();
                cargarGaleria();
            };
            tarjeta.appendChild(eliminar);
            const editar=document.createElement("button");editar.type="button";editar.className="editar-foto-admin";editar.textContent="✎";editar.title="Editar encuadre de foto";editar.onclick=e=>{e.stopPropagation();editarFotoGaleriaSWAN(index);};tarjeta.appendChild(editar);
        }
        tarjeta.onclick = function(event) {
            if (modoAdministrador && event.target.closest(".eliminar-foto-admin")) return;
            if (imagen.style.display === "none") return;
            document.getElementById("imagenAmpliada").src = archivo;
            document.getElementById("modalFoto").style.display = "flex";
        };
        contenedor.appendChild(tarjeta);
    });
}

async function agregarImagenesGaleria(event) {
    const archivos = Array.from(event.target.files || []);
    if (!archivos.length) return;
    if (!puedeEditarSWAN()) { alert("Inicia sesión como administrador para subir imágenes."); event.target.value=""; return; }
    try {
        const urls = await Promise.all(archivos.map(async archivo => {
            if (!archivo.type.startsWith("image/")) return null;
            // Preferimos Firebase Storage para evitar llenar Firestore/localStorage con imágenes base64.
            if (storageSWAN && usuarioFirebaseSWAN) return await subirFotoSWAN(archivo, "galeria");
            // Fallback compatible con la versión anterior si Storage no está disponible.
            return await new Promise((resolve, reject) => {
                const lector = new FileReader(); lector.onload = () => {
                    const img = new Image(); img.onload = () => {
                        const max=1400, escala=Math.min(1,max/Math.max(img.width,img.height));
                        const canvas=document.createElement("canvas"); canvas.width=Math.round(img.width*escala); canvas.height=Math.round(img.height*escala);
                        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL("image/jpeg",0.82));
                    }; img.onerror=reject; img.src=lector.result;
                }; lector.onerror=reject; lector.readAsDataURL(archivo);
            });
        }));
        fotografias.push(...urls.filter(Boolean)); guardarGaleria(); cargarGaleria();
    } catch (error) { console.error("No se pudieron subir imágenes a la galería:",error); alert("No se pudo subir una imagen. Revisa las reglas de Firebase Storage y tu conexión. " + (error.message||"")); }
    event.target.value = "";
}

/* ===================================
   CERRAR VENTANAS
=================================== */

function cerrarModales() {

    document.getElementById("modalIntegrante").style.display =
        "none";

    document.getElementById("modalFoto").style.display =
        "none";

}

function cerrarModalFondo(event) {

    if(event.target.id==="modalIntegrante") {
        cerrarModales();
    }

}


/* ===================================
   MODO ADMINISTRADOR DENTRO DE LA PÁGINA
=================================== */

let modoAdministrador = false;
let rolActualSWAN = "";

function abrirAccesoAdmin(event) {
    if (event) event.stopPropagation();
    document.getElementById("adminLogin").style.display = "flex";
    document.getElementById("codigoAdmin").value = "";
    document.getElementById("correoAdmin").value = "";
    document.getElementById("errorAdmin").textContent = "";
    setTimeout(() => document.getElementById("correoAdmin").focus(), 50);
}

async function comprobarCodigoAdmin(event) {
    event.preventDefault();
    const entrada = document.getElementById("correoAdmin").value.trim();
    const correo = entrada.includes("@") ? entrada.toLowerCase() : (entrada.toLowerCase() + "@login.familyswan.app");
    const clave = document.getElementById("codigoAdmin").value;
    const errorEl = document.getElementById("errorAdmin");
    if (!authSWAN || !dbSWAN) { errorEl.textContent = "Firebase no está disponible. Recarga la página."; return; }
    try {
        const credencial = await authSWAN.signInWithEmailAndPassword(correo, clave);
        usuarioFirebaseSWAN = credencial.user;
        const permiso = await verificarRolSWAN(usuarioFirebaseSWAN);
        if (!permiso) {
            await authSWAN.signOut(); usuarioFirebaseSWAN = null;
            errorEl.textContent = "Esta cuenta todavía no tiene permisos asignados en FAMILY SWAN.";
            return;
        }
        modoAdministrador = true;
        rolActualSWAN = permiso.rol;
        document.getElementById("adminLogin").style.display = "none";
        entrarFamilia();
        document.getElementById("controlesIntegrantes").hidden = false;
        document.getElementById("controlesGaleria").hidden = false;
        document.getElementById("controlesEventos").hidden = false;
        document.getElementById("panelCreador").hidden = permiso.rol !== "creador";
        const saludo = document.getElementById("saludoAcceso");
        saludo.textContent = permiso.rol === "creador" ? "BIENVENIDO, CREADOR" : "HOLA, " + permiso.nombre.toLocaleUpperCase("es");
        saludo.hidden = false; saludo.classList.toggle("saludo-creador", permiso.rol === "creador");
        await cargarDatosNubeSWAN();
        if (permiso.rol === "creador") cargarListaAdministradores();
        cargarListaAdminEventos(); cargarGaleria();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error(error);
        errorEl.textContent = error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" ? "Usuario/correo o contraseña incorrectos." : "No se pudo iniciar sesión. Revisa los datos y los permisos.";
    }
}

function cerrarAdmin() { document.getElementById("adminLogin").style.display = "none"; }
function cerrarAdminFondo(event) { if (event.target.classList.contains("admin-capa")) cerrarAdmin(); }

async function cargarListaAdministradores() {
    const lista = document.getElementById("listaAdministradores");
    if (!lista || rolActualSWAN !== "creador") return;
    lista.innerHTML = "Cargando administradores…";
    try {
        const snap = await dbSWAN.collection("familySwanRoles").get();
        lista.innerHTML = "";
        const admins = snap.docs.filter(d => ["administrador", "fundador"].includes(d.data().rol));
        if (!admins.length) { lista.textContent = "Todavía no hay administradores agregados."; return; }
        admins.forEach(doc => {
            const admin = doc.data();
            const fila = document.createElement("div"); fila.className = "admin-usuario-fila";
            const nombre = document.createElement("span"); nombre.textContent = (admin.rol === "fundador" ? "FUNDADOR · " : "ADMIN · ") + admin.nombre + " · @" + (admin.usuario || doc.id);
            const cambiar = document.createElement("button"); cambiar.type = "button"; cambiar.textContent = "Cambiar contraseña";
            cambiar.onclick = async () => {
                const nueva = prompt("Nueva contraseña para @" + (admin.usuario || "cuenta") + " (mínimo 10 caracteres):");
                if (nueva === null) return;
                if (nueva.length < 10 || nueva.length > 64) { alert("La contraseña debe tener entre 10 y 64 caracteres."); return; }
                try { await functionsSWAN.httpsCallable("restablecerClaveSWAN")({ uid: doc.id, password: nueva }); alert("Contraseña actualizada. Entrega la nueva clave de forma privada."); }
                catch (e) { console.error(e); alert("No se pudo cambiar la contraseña: " + (e.message || e.code)); }
            };
            const eliminar = document.createElement("button"); eliminar.type = "button"; eliminar.textContent = "Quitar rol";
            eliminar.onclick = async () => {
                if (!confirm("¿Quitar el rol a " + admin.nombre + "? Esto no elimina su cuenta de inicio de sesión.")) return;
                try { await dbSWAN.collection("familySwanRoles").doc(doc.id).delete(); cargarListaAdministradores(); }
                catch (e) { console.error(e); alert("No se pudieron quitar los permisos."); }
            };
            fila.append(nombre, cambiar, eliminar); lista.appendChild(fila);
        });
    } catch (e) { console.error(e); lista.textContent = "No se pudo cargar la lista. Revisa las reglas de Firestore."; }
}
async function guardarAdministrador(event) {
    event.preventDefault();
    if (rolActualSWAN !== "creador" || !usuarioFirebaseSWAN || !functionsSWAN) {
        alert("Solo el creador puede crear administradores. Comprueba también que Firebase Functions esté cargado.");
        return;
    }
    const nombre = document.getElementById("nuevoAdminNombre").value.trim();
    const usuario = document.getElementById("nuevoAdminUsuario").value.trim().toLowerCase();
    const password = document.getElementById("nuevoAdminClave").value;
    const rol = document.getElementById("nuevoAdminRol").value;
    const boton = document.getElementById("crearAdminBtn");
    if (!nombre || !usuario || !password || !/^[a-z0-9_]{3,24}$/.test(usuario) || password.length < 10) { alert("Usa nombre, usuario (3-24 letras/números/_) y contraseña de mínimo 10 caracteres."); return; }
    boton.disabled = true;
    boton.textContent = "Creando cuenta…";
    try {
        const crear = functionsSWAN.httpsCallable("crearAdministradorSWAN");
        await crear({ nombre, usuario, password, rol });
        document.getElementById("formAdminCreador").reset();
        await cargarListaAdministradores();
        alert("¡Cuenta creada! Rol: " + rol.toUpperCase() + ". Usuario: @" + usuario + ". Entrará con el usuario y la contraseña inicial.");
    } catch (error) {
        console.error("Error creando administrador:", error);
        const mensajes = {
            "functions/permission-denied": "La función rechazó la solicitud. Inicia sesión con la cuenta del creador.",
            "functions/already-exists": "Ese nombre de usuario ya está registrado. Elige otro.",
            "functions/failed-precondition": "La función todavía no está desplegada o no está disponible.",
            "functions/internal": "Firebase Functions devolvió un error interno. Revisa Firebase Console → Functions → Logs; puede ser configuración, permisos de Authentication o Firestore.",
            "functions/unavailable": "Firebase Functions no está disponible en este momento. Comprueba el despliegue y la conexión.",
            
        };
        alert((mensajes[error.code] || (error.code === "auth/too-many-requests" ? "Firebase limitó temporalmente las solicitudes. Inténtalo más tarde." : "No se pudo completar la creación. Código: " + (error.code || "desconocido"))) + (error.message ? "\nDetalle: " + error.message : ""));
        // Si el usuario fue creado pero falló el envío del correo, su rol queda asignado;
        // el CREADOR puede cambiar la contraseña desde el panel de FAMILY SWAN.
        await cargarListaAdministradores();
    } finally {
        boton.disabled = false;
        boton.textContent = "＋ Crear cuenta";
    }
}

function cambiarClaveCreador(event) {
    event.preventDefault();
    alert("Las contraseñas ahora se administran en Firebase Authentication. Para cambiarla, usa la opción Restablecer contraseña de Firebase; no se guarda dentro de FAMILY SWAN.");
}

function mostrarEditorIntegrantes() {
    const editor = document.getElementById("editorIntegrantes");
    editor.hidden = !editor.hidden;
    if (!editor.hidden) {
        cargarListaAdmin();
        editor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function cerrarModoAdmin() {
    modoAdministrador = false;
    document.getElementById("controlesIntegrantes").hidden = true;
    document.getElementById("controlesGaleria").hidden = true;
    document.getElementById("controlesEventos").hidden = true;
    document.getElementById("panelCreador").hidden = true;
    document.getElementById("editorIntegrantes").hidden = true;
    rolActualSWAN = "";
    sincronizacionActivaSWAN = false;
    if (authSWAN && usuarioFirebaseSWAN) { authSWAN.signOut().catch(console.error); usuarioFirebaseSWAN = null; }
    iniciarLecturaCompartidaSWAN();
    cargarGaleria();
    cargarIntegrantes();
    cargarArbol();
}

function cargarListaAdmin() {
    const lista = document.getElementById("adminListaIntegrantes");
    lista.innerHTML = "";
    integrantes.forEach((persona, indice) => {
        const fila = document.createElement("div");
        fila.className = "admin-persona";
        const nombre = document.createElement("span");
        nombre.textContent = persona.nombre || "Sin nombre";
        const editar = document.createElement("button");
        editar.type = "button"; editar.textContent = "Editar";
        editar.onclick = () => editarIntegranteAdmin(indice);
        const eliminar = document.createElement("button");
        eliminar.type = "button"; eliminar.textContent = "Eliminar";
        eliminar.className = "admin-eliminar";
        eliminar.onclick = () => eliminarIntegranteAdmin(indice);
        fila.append(nombre, editar, eliminar);
        lista.appendChild(fila);
    });
}

function editarIntegranteAdmin(indice) {
    const persona = integrantes[indice];
    document.getElementById("adminIndice").value = indice;
    document.getElementById("adminFormularioTitulo").textContent = "Editar integrante";
    const campos = {
        adminNombre: "nombre", adminRelacion: "relacion", adminDescripcion: "descripcion",
        adminEdad: "edad", adminPadres: "padres", adminRoblox: "nombreRoblox",
        adminCumple: "cumpleanos", adminColor: "colorFavorito", adminAnimal: "animalFavorito", adminFoto: "foto", adminPais: "pais", adminUbicacion: "ubicacion"
    };
    Object.entries(campos).forEach(([id, propiedad]) => { document.getElementById(id).value = persona[propiedad] || ""; });
    document.getElementById("adminFotoGaleria").value = (persona.foto || "").startsWith("galeria:") ? persona.foto.slice(8) : "";
    document.getElementById("adminFotoX").value = persona.fotoX ?? 50;
    document.getElementById("adminFotoY").value = persona.fotoY ?? 50;
    actualizarVistaFotoAdminSWAN(); poblarSelectorGaleriaSWAN();
    if (persona.pareja) document.getElementById("adminPadres").value = "Pareja de " + persona.pareja;
    document.getElementById("formIntegranteAdmin").scrollIntoView({ behavior: "smooth", block: "start" });
}

function limpiarFormularioAdmin() {
    document.getElementById("formIntegranteAdmin").reset();
    document.getElementById("adminIndice").value = "";
    document.getElementById("adminFormularioTitulo").textContent = "Agregar integrante";
    document.getElementById("adminFotoX").value = 50; document.getElementById("adminFotoY").value = 50;
    poblarSelectorGaleriaSWAN(); actualizarVistaFotoAdminSWAN();
}
function poblarSelectorGaleriaSWAN() {
    const select=document.getElementById("adminFotoGaleria"); if(!select)return;
    const elegido=select.value; select.innerHTML='<option value="">— No usar foto de galería —</option>';
    fotografias.forEach((src,i)=>{const op=document.createElement("option");op.value=String(i);op.textContent=`Recuerdo ${i+1}`;select.appendChild(op);});
    if(elegido && fotografias[Number(elegido)])select.value=elegido;
}
function actualizarVistaFotoAdminSWAN() {
    const img=document.getElementById("adminFotoPreview"), vacio=document.getElementById("adminFotoPreviewVacio"); if(!img)return;
    const gal=document.getElementById("adminFotoGaleria")?.value;
    const src=gal!=="" && gal!=null ? fotografias[Number(gal)] : document.getElementById("adminFoto")?.value.trim();
    if(src){img.src=resolverFotoSWAN(src);img.style.objectPosition=`${document.getElementById("adminFotoX").value}% ${document.getElementById("adminFotoY").value}%`;img.hidden=false;vacio.hidden=true;}
    else {img.hidden=true;vacio.hidden=false;}
}

function guardarIntegranteAdmin(event) {
    event.preventDefault();
    const relacionTexto=document.getElementById("adminPadres").value.trim();
    const esPareja=/^pareja\s+de\s+/i.test(relacionTexto);
    const parejaNombre=esPareja?relacionTexto.replace(/^pareja\s+de\s+/i,"").trim():"";
    const padres=esPareja?"":relacionTexto;
    const persona={
        nombre:document.getElementById("adminNombre").value.trim(),
        relacion:document.getElementById("adminRelacion").value.trim(),
        descripcion:document.getElementById("adminDescripcion").value.trim(),
        edad:document.getElementById("adminEdad").value.trim(),
        padres:padres,
        pareja:parejaNombre,
        hijos:"",
        nombreRoblox:document.getElementById("adminRoblox").value.trim(),
        cumpleanos:document.getElementById("adminCumple").value.trim(),
        colorFavorito:document.getElementById("adminColor").value.trim(),
        animalFavorito:document.getElementById("adminAnimal").value.trim(),
        pais:document.getElementById("adminPais").value.trim(),
        ubicacion:document.getElementById("adminUbicacion").value.trim(),
        foto:(document.getElementById("adminFotoGaleria").value!=="" ? "galeria:"+document.getElementById("adminFotoGaleria").value : document.getElementById("adminFoto").value.trim()),
        fotoX:Number(document.getElementById("adminFotoX").value),
        fotoY:Number(document.getElementById("adminFotoY").value)
    };
    Object.keys(persona).forEach(key=>{if(!persona[key])delete persona[key];});
    const indice=document.getElementById("adminIndice").value;
    if(indice==="")integrantes.push(persona); else integrantes[Number(indice)]=persona;
    // Guarda también la relación en el otro integrante para que ambos aparezcan juntos.
    if(parejaNombre){
        const parejaExistente=integrantes.find(p=>normalizarNombreArbol(p.nombre)===normalizarNombreArbol(parejaNombre));
        if(parejaExistente)parejaExistente.pareja=persona.nombre;
    }
    guardarIntegrantesEnNavegador(); ramasAbiertas.clear(); cargarIntegrantes(); cargarListaAdmin(); cargarArbol(); limpiarFormularioAdmin();
    alert("Integrante guardado. El árbol genealógico se actualizó automáticamente.");
}

function eliminarIntegranteAdmin(indice) {
    const nombre = integrantes[indice].nombre || "este integrante";
    if (!confirm(`¿Seguro que quieres eliminar a ${nombre}? También dejará de aparecer en el árbol.`)) return;
    integrantes.splice(indice, 1);
    guardarIntegrantesEnNavegador();
    cargarIntegrantes();
    cargarListaAdmin();
    ramasAbiertas.clear();
    cargarArbol();
    limpiarFormularioAdmin();
}

/* ===================================
   CHAT FAMILIAR EN TIEMPO REAL
=================================== */
let chatSuscripcionSWAN=null, chatAnonimoListoSWAN=false;
async function iniciarChatSWAN(){
  const caja=document.getElementById("chatMensajesSWAN"); if(!caja||!dbSWAN||!authSWAN)return;
  try {
    if(!authSWAN.currentUser){await authSWAN.signInAnonymously();}
    chatAnonimoListoSWAN=true;
    if(chatSuscripcionSWAN)chatSuscripcionSWAN();
    chatSuscripcionSWAN=dbSWAN.collection("familySwanChat").orderBy("fecha","desc").limit(50).onSnapshot(snap=>{
      caja.innerHTML="";
      const docs=snap.docs.slice().reverse();
      if(!docs.length){caja.innerHTML='<p class="chat-vacio">¡Saluda a la familia! 👋</p>';return;}
      docs.forEach(doc=>{const d=doc.data(),linea=document.createElement("div");linea.className="chat-mensaje";const cab=document.createElement("div");cab.className="chat-cabecera";const nombre=document.createElement("strong");nombre.textContent=(d.nombre||"Familiar").slice(0,24);const hora=document.createElement("time");hora.textContent=d.fecha?.toDate?d.fecha.toDate().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"ahora";cab.append(nombre,hora);const texto=document.createElement("p");texto.textContent=d.texto||"";linea.append(cab,texto);caja.appendChild(linea);});caja.scrollTop=caja.scrollHeight;
    },err=>{console.error("Chat:",err);caja.innerHTML='<p class="chat-vacio">No se pudo conectar el chat. Revisa las reglas y la autenticación anónima.</p>';});
  }catch(e){console.error("No se pudo iniciar chat",e);caja.innerHTML='<p class="chat-vacio">Activa el inicio de sesión anónimo en Firebase Authentication para usar el chat.</p>';}
}
async function enviarMensajeChatSWAN(event){
  event.preventDefault();const nombre=document.getElementById("chatNombreSWAN").value.trim().slice(0,24),texto=document.getElementById("chatTextoSWAN").value.trim().slice(0,300),boton=event.submitter;
  if(!nombre||!texto||!dbSWAN)return;if(!authSWAN.currentUser){await iniciarChatSWAN();}
  if(!authSWAN.currentUser){alert("No se pudo conectar al chat.");return;}
  if(boton)boton.disabled=true;
  try{await dbSWAN.collection("familySwanChat").add({nombre,texto,fecha:firebase.firestore.FieldValue.serverTimestamp(),uid:authSWAN.currentUser.uid});document.getElementById("chatTextoSWAN").value="";}
  catch(e){console.error(e);alert("No se pudo enviar. Revisa las reglas de Firestore.");}finally{if(boton)boton.disabled=false;}
}


function banderaPaisSWAN(pais){
 const mapa={colombia:"🇨🇴",méxico:"🇲🇽",mexico:"🇲🇽",españa:"🇪🇸",argentina:"🇦🇷",chile:"🇨🇱",perú:"🇵🇪",peru:"🇵🇪",venezuela:"🇻🇪",ecuador:"🇪🇨",brasil:"🇧🇷",brazil:"🇧🇷","estados unidos":"🇺🇸",usa:"🇺🇸",canadá:"🇨🇦",canada:"🇨🇦",francia:"🇫🇷",italia:"🇮🇹",alemania:"🇩🇪","reino unido":"🇬🇧"}; return mapa[String(pais||"").trim().toLowerCase()]||"🌍";
}
async function subirFotoSWAN(file, carpeta="galeria"){
 if(!file||!storageSWAN) throw new Error("Firebase Storage no está disponible.");
 if(!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen.");
 if(file.size>8*1024*1024) throw new Error("La imagen debe pesar menos de 8 MB.");
 const nombre=`${carpeta}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
 const ref=storageSWAN.ref().child(nombre); await ref.put(file); return await ref.getDownloadURL();
}
async function subirFotoPerfilAdminSWAN(){
 const input=document.getElementById("adminSubirFoto"); const file=input?.files?.[0]; if(!file)return;
 if(!puedeEditarSWAN()){alert("Inicia sesión como administrador para subir fotos.");return;}
 try{const url=await subirFotoSWAN(file,"perfiles");document.getElementById("adminFoto").value=url;document.getElementById("adminFotoGaleria").value="";actualizarVistaFotoAdminSWAN();alert("Foto subida. Pulsa Guardar integrante para aplicar.");}
 catch(e){console.error("Error subiendo foto de perfil",e);alert("No se pudo subir la foto: "+(e.message||e));}
}
function inicializarMapaFamiliaSWAN(){
 const el=document.getElementById("mapaFamiliaSWAN"); if(!el||!window.L)return;
 if(!mapaSWAN){mapaSWAN=L.map(el).setView([4.6,-74.1],5);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(mapaSWAN);}
 marcadoresMapaSWAN.forEach(m=>mapaSWAN.removeLayer(m));marcadoresMapaSWAN=[];
 const personas=(integrantes||[]).filter(p=>p.ubicacion); if(!personas.length){document.getElementById("estadoMapaSWAN").textContent="Agrega ciudad o región en la ficha de cada integrante para mostrar marcadores.";return;}
 Promise.all(personas.map(async p=>{try{const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&q="+encodeURIComponent(p.ubicacion);const r=await fetch(url);const d=await r.json();if(d[0]){const marker=L.marker([Number(d[0].lat),Number(d[0].lon)]).addTo(mapaSWAN);const foto=p.foto?`<img src="${resolverFotoSWAN(p.foto)}" style="width:48px;height:48px;object-fit:cover;border-radius:50%">`:"";marker.bindPopup(`${foto}<strong>${String(p.nombre||"Familiar").replace(/[<>]/g,"")}</strong><br>${String(p.ubicacion).replace(/[<>]/g,"")} ${banderaPaisSWAN(p.pais)}`);marcadoresMapaSWAN.push(marker);}}catch(e){console.warn("No se pudo geolocalizar",p.ubicacion,e);}})).then(()=>{if(marcadoresMapaSWAN.length){const grupo=L.featureGroup(marcadoresMapaSWAN);mapaSWAN.fitBounds(grupo.getBounds().pad(.15));document.getElementById("estadoMapaSWAN").textContent=`Ubicaciones públicas: ${marcadoresMapaSWAN.length}.`;}});
}

/* ===================================
   INICIAR PAGINA
=================================== */

mostrarCalendario();
actualizarEstadoCampanita();
revisarNotificacionesEventos();
setInterval(revisarNotificacionesEventos, 60000);
cargarIntegrantes();

cargarArbol();
inicializarMapaFamiliaSWAN();

cargarGaleria();
poblarSelectorGaleriaSWAN();
["adminFoto","adminFotoGaleria","adminFotoX","adminFotoY"].forEach(id=>document.getElementById(id)?.addEventListener("input",actualizarVistaFotoAdminSWAN));
document.getElementById("adminSubirFoto")?.addEventListener("change",subirFotoPerfilAdminSWAN);
aplicarPersonalizacionSWAN(personalizacionSWAN);
iniciarLecturaCompartidaSWAN();
iniciarChatSWAN();
