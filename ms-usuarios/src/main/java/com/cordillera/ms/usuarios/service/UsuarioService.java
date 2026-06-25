package com.cordillera.ms.usuarios.service;

import com.cordillera.ms.usuarios.dto.CalificacionRequest;
import com.cordillera.ms.usuarios.dto.LoginRequest;
import com.cordillera.ms.usuarios.dto.RegistroRequest;
import com.cordillera.ms.usuarios.entity.Antecedente;
import com.cordillera.ms.usuarios.entity.CalificacionDriver;
import com.cordillera.ms.usuarios.entity.Usuario;
import com.cordillera.ms.usuarios.repository.AntecedenteRepository;
import com.cordillera.ms.usuarios.repository.CalificacionRepository;
import com.cordillera.ms.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AntecedenteRepository antecedenteRepository;
    private final CalificacionRepository calificacionRepository;

    public Usuario registrar(RegistroRequest request) {

        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .correo(request.getCorreo())
                .password(request.getPassword())
                .rol(request.getRol())
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        Antecedente antecedente = Antecedente.builder()
                .comprasRealizadas(0)
                .reportesRealizados(0)
                .aniosActivo(1)
                .usuario(guardado)
                .build();

        antecedenteRepository.save(antecedente);

        return guardado;
    }

    public Usuario login(LoginRequest request) {

        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + request.getCorreo()));

        if (!usuario.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new RuntimeException("Usuario desactivado");
        }

        return usuario;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> listarDrivers() {
        return usuarioRepository.findByRol("DRIVER");
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public void eliminarUsuario(Long id) {
        Usuario usuario = buscarPorId(id);
        usuarioRepository.delete(usuario);
    }

    public Usuario cambiarEstado(Long id, Boolean activo) {
        Usuario usuario = buscarPorId(id);
        usuario.setActivo(activo);
        return usuarioRepository.save(usuario);
    }

    public CalificacionDriver calificarDriver(CalificacionRequest request) {

        Usuario driver = buscarPorId(request.getDriverId());

        if (!"DRIVER".equals(driver.getRol())) {
            throw new RuntimeException("El usuario no es un driver");
        }

        CalificacionDriver calificacion = CalificacionDriver.builder()
                .driverId(request.getDriverId())
                .clienteNombre(request.getClienteNombre())
                .clienteCorreo(request.getClienteCorreo())
                .puntuacion(request.getPuntuacion())
                .comentario(request.getComentario())
                .build();

        return calificacionRepository.save(calificacion);
    }

    public List<CalificacionDriver> obtenerCalificacionesDriver(Long driverId) {
        return calificacionRepository.findByDriverId(driverId);
    }
}