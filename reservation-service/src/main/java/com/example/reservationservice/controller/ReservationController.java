package com.example.reservationservice.controller;

import com.example.reservationservice.model.Reservation;
import com.example.reservationservice.service.ReservationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        return service.createReservation(reservation);
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return service.getAllReservations();
    }

    @GetMapping("/{id}")
    public Optional<Reservation> getReservationById(@PathVariable String id) {
        return service.getReservationById(id);
    }

    @PutMapping("/{id}")
    public Reservation updateReservation(
            @PathVariable String id,
            @RequestBody Reservation reservation) {
        return service.updateReservation(id, reservation);
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable String id) {
        service.deleteReservation(id);
    }
}
