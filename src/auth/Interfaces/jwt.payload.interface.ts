

export interface JwtPayload {

    id: string; //id usuario
    iat?: number; //fecha creacion
    exp?: number; //fecha expiracion
}