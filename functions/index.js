const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
initializeApp();
const UID_CREADOR_SWAN = "Nvaojypv4QOSvd9TK37dBq9UF6x2";
const emailInterno = (usuario) => `${usuario}@login.familyswan.app`;
exports.crearAdministradorSWAN = onCall({ region: "us-central1", maxInstances: 2 }, async (request) => {
  if (!request.auth || request.auth.uid !== UID_CREADOR_SWAN) throw new HttpsError("permission-denied", "Solo el creador puede crear administradores.");
  const nombre = typeof request.data?.nombre === "string" ? request.data.nombre.trim() : "";
  const usuario = typeof request.data?.usuario === "string" ? request.data.usuario.trim().toLowerCase() : "";
  const password = typeof request.data?.password === "string" ? request.data.password : "";
  if (!nombre || nombre.length > 40 || !/^[a-z0-9_]{3,24}$/.test(usuario) || password.length < 6 || password.length > 64)
    throw new HttpsError("invalid-argument", "Revisa nombre, usuario y contraseña (mínimo 6 caracteres).");
  const email = emailInterno(usuario); let nuevo;
  try {
    nuevo = await getAuth().createUser({ email, password, displayName: nombre, emailVerified: true, disabled: false });
    await getFirestore().collection("familySwanRoles").doc(nuevo.uid).create({ nombre, usuario, rol: "administrador", creado: FieldValue.serverTimestamp() });
    return { uid: nuevo.uid, usuario, nombre };
  } catch (e) {
    if (nuevo?.uid) { try { await getAuth().deleteUser(nuevo.uid); } catch (_) {} }
    if (e.code === "auth/email-already-exists" || e.code === 6) throw new HttpsError("already-exists", "Ese nombre de usuario ya está registrado.");
    if (e instanceof HttpsError) throw e;
    console.error(e); throw new HttpsError("internal", "No se pudo crear el administrador.");
  }
});
