package com.chatapp.core.auth;

import com.chatapp.core.auth.dto.AuthLoginRequest;
import com.chatapp.core.auth.dto.AuthResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthLoginRequest userRequest) {
        return new ResponseEntity<AuthResponse>(this.authenticationService.login(userRequest), HttpStatus.OK);
    }

    @GetMapping("/helloWorld")
    public ResponseEntity<String> helloWorld(){
        return new ResponseEntity<String>("helloWorld",HttpStatus.OK);
    }

}
