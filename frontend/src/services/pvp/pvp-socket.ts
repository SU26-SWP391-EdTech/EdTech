import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../stores/auth/auth.stores';

class PvpSocketService {
    private socket: Socket | null = null;

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        const token = useAuthStore.getState().token;
        if (!token) {
            console.error('Cannot connect to PvP Socket: No authentication token found.');
            throw new Error('No auth token');
        }

        const socketUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
            : 'http://localhost:5002';

        this.socket = io(socketUrl, {
            auth: {
                token,
            },
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to PvP Socket successfully, ID:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from PvP Socket:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('PvP Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    emit(event: string, data?: any) {
        if (!this.socket) {
            this.connect();
        }
        this.socket?.emit(event, data);
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) {
            this.connect();
        }
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }
}

export const pvpSocket = new PvpSocketService();
