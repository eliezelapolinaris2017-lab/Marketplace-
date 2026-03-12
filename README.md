# Catálogo móvil premium

Proyecto listo para GitHub Pages + Firebase.

## Incluye
- Catálogo público sin login
- Detalle de producto
- Carrito básico
- Registro de pedido
- Paylink por artículo
- Login admin con Firebase Auth
- Panel para ajustes y alta rápida de productos
- Reglas base de Firestore y Storage

## Pasos rápidos
1. Sube el contenido del ZIP a un repo nuevo.
2. Activa GitHub Pages en la rama principal.
3. En Firebase activa:
   - Authentication > Email/Password
   - Firestore Database
   - Storage
4. Publica `firestore.rules` y `storage.rules`.
5. Crea tu usuario admin en Firebase Auth.
6. En el panel admin configura nombre del negocio.
7. Crea categorías manualmente en Firestore o añade un módulo luego.

## Colecciones
- settings/main
- categories
- products
- orders

## Nota ejecutiva
Para carrito múltiple, el proyecto registra el pedido y deja listo el flujo para cobro manual o WhatsApp. Para checkout unificado real, la siguiente fase es integrar Stripe Checkout o pasarela equivalente.
