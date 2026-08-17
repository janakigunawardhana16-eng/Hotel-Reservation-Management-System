package com.example.hotelroomservice.service;

import com.example.hotelroomservice.model.Hotel;
import com.example.hotelroomservice.repository.HotelRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    public Hotel createHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public Optional<Hotel> getHotelById(String id) {
        return hotelRepository.findById(id);
    }

    public Hotel updateHotel(String id, Hotel updatedHotel) {
        return hotelRepository.findById(id)
                .map(existingHotel -> {

                    existingHotel.setName(updatedHotel.getName());
                    existingHotel.setLocation(updatedHotel.getLocation());
                    existingHotel.setDescription(updatedHotel.getDescription());
                    existingHotel.setRating(updatedHotel.getRating());

                    return hotelRepository.save(existingHotel);
                })
                .orElse(null);
    }

    public void deleteHotel(String id) {
        hotelRepository.deleteById(id);
    }
}