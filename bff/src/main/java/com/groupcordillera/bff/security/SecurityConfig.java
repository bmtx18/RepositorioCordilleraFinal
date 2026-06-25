package com.groupcordillera.bff.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        JwtAuthFilter jwtAuthFilter = new JwtAuthFilter(jwtService);

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/bff/usuarios/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/bff/usuarios/registro").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/bff/productos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bff/productos/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/bff/productos").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/bff/productos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/bff/productos/**").authenticated()

                        .requestMatchers("/api/bff/dashboard/**").hasRole("Administrador")
                        .requestMatchers("/api/bff/kpi/**").hasRole("Administrador")

                        .requestMatchers(HttpMethod.GET, "/api/bff/usuarios").hasRole("Administrador")
                        .requestMatchers(HttpMethod.GET, "/api/bff/usuarios/**").hasRole("Administrador")
                        .requestMatchers(HttpMethod.DELETE, "/api/bff/usuarios/**").hasRole("Administrador")

                        .requestMatchers("/api/bff/ventas/**").authenticated()
                        .requestMatchers("/api/bff/reportes/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}