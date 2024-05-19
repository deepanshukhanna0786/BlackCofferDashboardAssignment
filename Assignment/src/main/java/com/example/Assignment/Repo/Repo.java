package com.example.Assignment.Repo;

import com.example.Assignment.Models.Data;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Repo extends JpaRepository<Data,Long> {
    List<Data> findByIntensity(String intensity);
    List<Data> findByCountry(String country);
    List<Data> findByStartYearAndEndYear(String startYear, String endYear);
    List<Data> findByLikelihood(String likelihood);
    List<Data> findByCity(String city);
    List<Data> findByRegion(String region);
    List<Data> findBySector(String sector);
    List<Data> findByTopic(String topic);
    List<Data> findByRelevance(String relevance);

}
