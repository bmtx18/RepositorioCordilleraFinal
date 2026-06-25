package com.groupcordillera.bff.controller;

import com.groupcordillera.bff.security.JwtService;
import com.groupcordillera.bff.service.UsuarioClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bff/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioClient usuarioClient;
    private final JwtService jwtService;

    public UsuarioController(UsuarioClient usuarioClient, JwtService jwtService) {
        this.usuarioClient = usuarioClient;
        this.jwtService = jwtService;
    }

    @GetMapping
    public Object listarUsuarios() {
        return usuarioClient.listarUsuarios();
    }

    @PostMapping("/registro")
    public Object registrar(@RequestBody Object usuario) {
        return usuarioClient.registrar(usuario);
    }

    @PostMapping("/login")
    public Object login(@RequestBody Object usuario) {

        Object respuesta = usuarioClient.login(usuario);

        Map<String, Object> usuarioMap = (Map<String, Object>) respuesta;

        String correo = usuarioMap.get("correo").toString();
        String rol = usuarioMap.get("rol").toString();

        String token = jwtService.generarToken(correo, rol);

        usuarioMap.put("token", token);

        return usuarioMap;
    }

    @GetMapping("/{id}")
    public Object buscarPorId(@PathVariable Long id) {
        return usuarioClient.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {
        usuarioClient.eliminar(id);
        return "Usuario eliminado correctamente";
    }
}