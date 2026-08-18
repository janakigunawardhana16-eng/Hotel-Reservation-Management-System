package com.example.reservationservice.repository;

import com.example.reservationservice.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservationRepository
        extends MongoRepository<Reservation, String> {
}
