// server/src/websocket/events/inventoryHandlers.js

/**
 * @description Emits an inventory update to all clients subscribed to a product.
 * @param {object} io - The Socket.IO server instance.
 * @param {string} productId - The ID of the product that was updated.
 * @param {number} newStock - The new stock level.
 */
export const emitInventoryUpdate = (io, productId, newStock) => {
  if (!io || !productId || newStock === undefined) return;

  const room = `product:${productId}`;
  io.to(room).emit('inventory:update', {
    productId,
    newStock,
    timestamp: new Date(),
  });
  console.log(`Emitted inventory update for product ${productId}: new stock ${newStock}`);
};

const inventoryHandlers = (io, socket) => {
  /**
   * @description Client subscribes to inventory updates for specific products
   * @param {string[]} productIds - Array of product IDs to monitor
   */
  const subscribeToInventory = (productIds) => {
    if (!Array.isArray(productIds)) {
      // Optional: send an error back to the client
      socket.emit('inventory:error', { message: 'Invalid productIds format. Expected an array.' });
      return;
    }

    // Each product has its own "room". This is efficient for targeted updates.
    productIds.forEach(productId => {
      console.log(`Socket ${socket.id} joined inventory room for product ${productId}`);
      socket.join(`product:${productId}`);
    });
  };

  /**
   * @description Client unsubscribes from inventory updates
   * @param {string[]} productIds - Array of product IDs to stop monitoring
   */
  const unsubscribeFromInventory = (productIds) => {
    if (!Array.isArray(productIds)) {
      return; // Fail silently or emit an error
    }
    productIds.forEach(productId => {
      console.log(`Socket ${socket.id} left inventory room for product ${productId}`);
      socket.leave(`product:${productId}`);
    });
  };

  // Register event listeners for this socket
  socket.on('inventory:subscribe', subscribeToInventory);
  socket.on('inventory:unsubscribe', unsubscribeFromInventory);
};

export default inventoryHandlers;
