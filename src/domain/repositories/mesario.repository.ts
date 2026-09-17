import type { Mesario, UpdateMesarioInput } from "../entities/mesario.js";

export interface MesarioRepository {
	create(mesario: Mesario): Promise<Mesario>;
	update(id: string, changes: UpdateMesarioInput): Promise<Mesario | null>;
}
