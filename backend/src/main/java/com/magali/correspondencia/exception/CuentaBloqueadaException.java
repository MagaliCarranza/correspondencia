package com.magali.correspondencia.exception;

public class CuentaBloqueadaException extends RuntimeException {
    public CuentaBloqueadaException(String mensaje) {
        super(mensaje);
    }
}
