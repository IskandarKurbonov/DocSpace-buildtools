package com.onlyoffice.authorization.controllers;

import com.onlyoffice.authorization.configuration.ApplicationConfiguration;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
@Slf4j
public class LoginController {
    private final String FORWARD = "FORWARD";
    private final ApplicationConfiguration configuration;

    @GetMapping("/login")
    public String login(HttpServletRequest request) {
        log.debug("A new login request");
        if (request.getDispatcherType().name() == null || !request.getDispatcherType().name().equals(FORWARD))
            return String.format("redirect:%s/error", configuration.getFrontendUrl());
        return String.format(
                "redirect:%s/login?%s",
                configuration.getFrontendUrl(),
                request.getQueryString());
    }
}