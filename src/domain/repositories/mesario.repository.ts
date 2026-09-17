import type { Mesario } from "../entities/mesario.js";

export interface MesarioRepository {
	create(mesario: Mesario): Promise<Mesario>;
}