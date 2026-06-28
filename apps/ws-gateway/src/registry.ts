export const roomIdToSocketIds = new Map<string, Set<string>>();
export const userIdToSocketIds = new Map<string, Set<string>>();

const socketIdToRoomIds = new Map<string, Set<string>>();

function addToSet(map: Map<string, Set<string>>, key: string, value: string): void {
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}

function removeFromSet(map: Map<string, Set<string>>, key: string, value: string): void {
  const set = map.get(key);
  if (!set) return;
  set.delete(value);
  if (set.size === 0) {
    map.delete(key);
  }
}

export function addUserSocket(userId: string, socketId: string): void {
  addToSet(userIdToSocketIds, userId, socketId);
}

export function removeUserSocket(userId: string, socketId: string): void {
  removeFromSet(userIdToSocketIds, userId, socketId);
}

export function addRoomSocket(roomId: string, socketId: string): void {
  addToSet(roomIdToSocketIds, roomId, socketId);
  addToSet(socketIdToRoomIds, socketId, roomId);
}

export function removeSocket(socketId: string, userId: string): void {
  removeUserSocket(userId, socketId);

  const roomIds = socketIdToRoomIds.get(socketId);
  if (roomIds) {
    for (const roomId of roomIds) {
      removeFromSet(roomIdToSocketIds, roomId, socketId);
    }
    socketIdToRoomIds.delete(socketId);
  }
}
