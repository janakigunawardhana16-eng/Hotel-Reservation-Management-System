package com.example.hotelroomservice.repository;

import com.example.hotelroomservice.model.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HotelRepository extends MongoRepository<Hotel, String> {
}