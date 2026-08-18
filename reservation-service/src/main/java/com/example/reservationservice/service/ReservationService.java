package com.example.reservationservice.service;

import com.example.reservationservice.model.Reservation;
import com.example.reservationservice.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository repository;

    public ReservationService(ReservationRepository repository) {
        this.repository = repository;
    }

    // Create
    public Reservation createReservation(Reservation reservation) {
        return repository.save(reservation);
    }

    // Get All
    public List<Reservation> getAllReservations() {
        return repository.findAll();
    }

    // Get By ID
    public Optional<Reservation> getReservationById(String id) {
        return repository.findById(id);
    }

    // Update
    public Reservation updateReservation(String id, Reservation reservationDetails) {

        Reservation reservation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setCustomerName(reservationDetails.getCustomerName());
        reservation.setEmail(reservationDetails.getEmail());
        reservation.setReservationDate(reservationDetails.getReservationDate());
        reservation.setNumberOfGuests(reservationDetails.getNumberOfGuests());

        return repository.save(reservation);
    }

    // Delete
    public void deleteReservation(String id) {
        repository.deleteById(id);
    }
}
