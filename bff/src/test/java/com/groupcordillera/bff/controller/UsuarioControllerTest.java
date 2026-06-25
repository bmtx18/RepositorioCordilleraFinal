package com.groupcordillera.bff.controller;

import com.groupcordillera.bff.security.JwtService;
import com.groupcordillera.bff.service.UsuarioClient;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioControllerTest {

    @Test
    void listarUsuarios_debeRetornarUsuarios() {

        UsuarioClient usuarioClient = mock(UsuarioClient.class);
        JwtService jwtService = mock(JwtService.class);

        UsuarioController controller = new UsuarioController(usuarioClient, jwtService);

        Object usuarios = List.of(Map.of("nombre", "Benjamin"));

        when(usuarioClient.listarUsuarios()).thenReturn(usuarios);

        Object resultado = controller.listarUsuarios();

        assertEquals(usuarios, resultado);
        verify(usuarioClient).listarUsuarios();
    }

    @Test
    void registrar_debeDelegarEnUsuarioClient() {

        UsuarioClient usuarioClient = mock(UsuarioClient.class);
        JwtService jwtService = mock(JwtService.class);

        UsuarioController controller = new UsuarioController(usuarioClient, jwtService);

        Object request = Map.of("correo", "test@test.cl");
        Object creado = Map.of("id", 1L, "correo", "test@test.cl");

        when(usuarioClient.registrar(request)).thenReturn(creado);

        Object resultado = controller.registrar(request);

        assertEquals(creado, resultado);
        verify(usuarioClient).registrar(request);
    }

    @Test
    void login_debeDelegarEnUsuarioClient() {

        UsuarioClient usuarioClient = mock(UsuarioClient.class);
        JwtService jwtService = mock(JwtService.class);

        UsuarioController controller = new UsuarioController(usuarioClient, jwtService);

        Object request = Map.of(
                "correo", "test@test.cl",
                "password", "1234"
        );

        Map<String, Object> respuestaLogin = new HashMap<>();
        respuestaLogin.put("correo", "test@test.cl");
        respuestaLogin.put("rol", "Administrador");

        when(usuarioClient.login(request)).thenReturn(respuestaLogin);
        when(jwtService.generarToken("test@test.cl", "Administrador"))
                .thenReturn("TOKEN_PRUEBA");

        Object resultado = controller.login(request);

        assertTrue(resultado instanceof Map);

        Map<?, ?> resultadoMap = (Map<?, ?>) resultado;

        assertEquals("test@test.cl", resultadoMap.get("correo"));
        assertEquals("Administrador", resultadoMap.get("rol"));
        assertEquals("TOKEN_PRUEBA", resultadoMap.get("token"));

        verify(usuarioClient).login(request);
        verify(jwtService).generarToken("test@test.cl", "Administrador");
    }

    @Test
    void eliminar_debeRetornarMensajeCorrecto() {

        UsuarioClient usuarioClient = mock(UsuarioClient.class);
        JwtService jwtService = mock(JwtService.class);

        UsuarioController controller = new UsuarioController(usuarioClient, jwtService);

        String resultado = controller.eliminar(1L);

        assertEquals("Usuario eliminado correctamente", resultado);

        verify(usuarioClient).eliminar(1L);
    }
}